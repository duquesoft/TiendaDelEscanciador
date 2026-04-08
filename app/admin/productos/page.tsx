/* eslint-disable @next/next/no-img-element */
'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import ProductDescription from '@/app/components/ProductDescription'

interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  gallery: string[]
  isActive: boolean
  sortOrder: number
}

interface ProductForm {
  name: string
  description: string
  price: string
  imageUrl: string
  galleryText: string
  isActive: boolean
  sortOrder: string
}

const initialForm: ProductForm = {
  name: '',
  description: '',
  price: '0',
  imageUrl: '',
  galleryText: '',
  isActive: true,
  sortOrder: '0',
}

const recommendedProductDescription = `Disfruta de la sidra natural como se merece con este escanciador automático a batería, diseñado con un estilo **minimalista, moderno y elegante**.
Su funcionamiento es muy sencillo: basta con pulsar el botón superior para servir la cantidad de bebida deseada.

El pulsador incorpora un **indicador luminoso** que se activa cuando el cable de carga está conectado.

🔋 Carga de la batería:
- Puerto **USB-C** situado en la parte inferior del mástil
- Compatible con cualquier cargador de móvil (no incluido)
- Tiempo de carga recomendado: **aprox. 3 horas**

🍏 Ideal para:
- Reuniones familiares
- Encuentros con amigos
- Celebraciones
- Locales de hostelería`

function toGalleryArray(galleryText: string): string[] {
  return galleryText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function toForm(product: Product): ProductForm {
  return {
    name: product.name,
    description: product.description,
    price: String(product.price),
    imageUrl: product.imageUrl,
    galleryText: product.gallery.join('\n'),
    isActive: product.isActive,
    sortOrder: String(product.sortOrder),
  }
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingMainImage, setUploadingMainImage] = useState(false)
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false)
  const [removingImageUrl, setRemovingImageUrl] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false)
  const [form, setForm] = useState<ProductForm>(initialForm)

  const editingProduct = useMemo(
    () => products.find((product) => product.id === editingProductId) ?? null,
    [products, editingProductId]
  )

  const previewPrice = useMemo(() => {
    const parsed = Number(form.price)
    return Number.isFinite(parsed) ? parsed : 0
  }, [form.price])

  const previewGallery = useMemo(() => {
    const gallery = toGalleryArray(form.galleryText)
    return gallery.length > 0 ? gallery : form.imageUrl ? [form.imageUrl] : []
  }, [form.galleryText, form.imageUrl])

  const isFormVisible = Boolean(editingProduct) || isCreateFormOpen

  const loadProducts = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/products')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudieron cargar productos')
      }

      setProducts(Array.isArray(data?.products) ? data.products : [])
    } catch (error) {
      console.error(error)
      setMessage('No se pudieron cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const resetForm = () => {
    setEditingProductId(null)
    setIsCreateFormOpen(false)
    setForm(initialForm)
  }

  const startEditing = (product: Product) => {
    setMessage(null)
    setIsCreateFormOpen(false)
    setEditingProductId(product.id)
    setForm(toForm(product))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openCreateForm = () => {
    setMessage(null)
    setEditingProductId(null)
    setForm(initialForm)
    setIsCreateFormOpen(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const uploadImages = async (files: FileList | null): Promise<string[]> => {
    if (!files || files.length === 0) {
      return []
    }

    const formData = new FormData()
    Array.from(files).forEach((file) => {
      formData.append('files', file)
    })

    const response = await fetch('/api/admin/products/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error || 'No se pudieron subir las imágenes')
    }

    const urls = Array.isArray(data?.urls) ? data.urls.filter((url: unknown) => typeof url === 'string') : []
    return urls
  }

  const handleMainImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (!files || files.length === 0) {
      return
    }

    setUploadingMainImage(true)
    setMessage(null)

    try {
      const urls = await uploadImages(files)
      if (urls.length > 0) {
        setForm((prev) => ({ ...prev, imageUrl: urls[0] }))
      }
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'No se pudo subir la imagen principal')
    } finally {
      setUploadingMainImage(false)
      event.target.value = ''
    }
  }

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (!files || files.length === 0) {
      return
    }

    setUploadingGalleryImages(true)
    setMessage(null)

    try {
      const urls = await uploadImages(files)
      if (urls.length > 0) {
        setForm((prev) => ({
          ...prev,
          galleryText: Array.from(new Set([...toGalleryArray(prev.galleryText), ...urls])).join('\n'),
        }))
      }
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'No se pudieron subir imágenes de galería')
    } finally {
      setUploadingGalleryImages(false)
      event.target.value = ''
    }
  }

  const shouldDeleteFromStorage = (url: string): boolean => {
    return url.includes('/storage/v1/object/public/')
  }

  const deleteImageFromStorage = async (url: string) => {
    if (!shouldDeleteFromStorage(url)) {
      return
    }

    const response = await fetch('/api/admin/products/upload', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error || 'No se pudo borrar la imagen del almacenamiento')
    }
  }

  const removeMainImage = async () => {
    const imageUrl = form.imageUrl.trim()
    if (!imageUrl) {
      return
    }

    const confirmed = window.confirm('¿Eliminar la imagen principal del formulario?')
    if (!confirmed) {
      return
    }

    setMessage(null)
    setRemovingImageUrl(imageUrl)

    try {
      await deleteImageFromStorage(imageUrl)
      setForm((prev) => ({ ...prev, imageUrl: '' }))
    } catch (error) {
      console.error(error)
      setForm((prev) => ({ ...prev, imageUrl: '' }))
      setMessage('Se quitó del formulario, pero no se pudo borrar del almacenamiento.')
    } finally {
      setRemovingImageUrl(null)
    }
  }

  const removeGalleryImage = async (url: string) => {
    const confirmed = window.confirm('¿Eliminar esta imagen de la galería?')
    if (!confirmed) {
      return
    }

    setMessage(null)
    setRemovingImageUrl(url)

    try {
      await deleteImageFromStorage(url)
      setForm((prev) => ({
        ...prev,
        galleryText: toGalleryArray(prev.galleryText)
          .filter((currentUrl) => currentUrl !== url)
          .join('\n'),
      }))
    } catch (error) {
      console.error(error)
      setForm((prev) => ({
        ...prev,
        galleryText: toGalleryArray(prev.galleryText)
          .filter((currentUrl) => currentUrl !== url)
          .join('\n'),
      }))
      setMessage('Se quitó de la galería, pero no se pudo borrar del almacenamiento.')
    } finally {
      setRemovingImageUrl(null)
    }
  }

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        imageUrl: form.imageUrl,
        gallery: toGalleryArray(form.galleryText),
        isActive: form.isActive,
        sortOrder: Number(form.sortOrder),
      }

      const url = editingProductId ? `/api/admin/products/${editingProductId}` : '/api/admin/products'
      const method = editingProductId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo guardar el producto')
      }

      setMessage(editingProductId ? 'Producto actualizado correctamente' : 'Producto creado correctamente')
      resetForm()
      await loadProducts()
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'No se pudo guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  const deleteProduct = async (product: Product) => {
    const shouldDelete = window.confirm(`¿Eliminar el producto "${product.name}"?`)

    if (!shouldDelete) {
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error || 'No se pudo eliminar el producto')
      }

      if (editingProductId === product.id) {
        resetForm()
      }

      setMessage('Producto eliminado correctamente')
      await loadProducts()
    } catch (error) {
      console.error(error)
      setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el producto')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de productos</h1>
          <Link href="/admin/dashboard" className="text-blue-600 hover:text-blue-700 text-sm md:text-base">
            Volver al dashboard
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              {editingProduct ? `Editando: ${editingProduct.name}` : 'Nuevo producto'}
            </h2>

            {!editingProduct && !isCreateFormOpen && (
              <button
                type="button"
                onClick={openCreateForm}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Añadir nuevo producto
              </button>
            )}
          </div>

          {isFormVisible ? (
            <>
          <form onSubmit={submitProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                  maxLength={120}
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio (EUR)
                </label>
                <input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                id="description"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[110px]"
                maxLength={2000}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      description: recommendedProductDescription,
                    }))
                  }
                  className="px-3 py-2 text-sm bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200"
                >
                  Aplicar descripción recomendada
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Imagen principal (URL)
                </label>
                <input
                  id="imageUrl"
                  type="text"
                  value={form.imageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
                <div className="mt-2">
                  <label className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleMainImageUpload}
                      className="hidden"
                    />
                    {uploadingMainImage ? 'Subiendo imagen...' : 'Buscar imagen en mi PC'}
                  </label>
                </div>
                {form.imageUrl.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={removeMainImage}
                    disabled={removingImageUrl === form.imageUrl}
                    className="mt-2 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    {removingImageUrl === form.imageUrl ? 'Eliminando imagen...' : 'Eliminar imagen principal'}
                  </button>
                )}
              </div>

              <div>
                <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700 mb-1">
                  Orden
                </label>
                <input
                  id="sortOrder"
                  type="number"
                  min="0"
                  step="1"
                  value={form.sortOrder}
                  onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: event.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="gallery" className="block text-sm font-medium text-gray-700 mb-1">
                Galería (una URL por línea)
              </label>
              <textarea
                id="gallery"
                value={form.galleryText}
                onChange={(event) => setForm((prev) => ({ ...prev, galleryText: event.target.value }))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[120px]"
                placeholder="/img/ejemplo1.webp\n/img/ejemplo2.webp"
              />
              <div className="mt-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                  {uploadingGalleryImages ? 'Subiendo galería...' : 'Buscar imágenes de galería en mi PC'}
                </label>
              </div>
              {toGalleryArray(form.galleryText).length > 0 && (
                <div className="mt-3 space-y-2">
                  {toGalleryArray(form.galleryText).map((url) => (
                    <div key={url} className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs text-gray-700 truncate">{url}</p>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(url)}
                        disabled={removingImageUrl === url}
                        className="shrink-0 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        {removingImageUrl === url ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
                />
                Visible en la web
              </label>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
              >
                {saving ? 'Guardando...' : editingProduct ? 'Guardar cambios' : 'Crear producto'}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cancelar edición
                </button>
              )}

              {!editingProduct && isCreateFormOpen && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Cerrar
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Vista previa</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.name || 'Vista previa del producto'}
                    className="w-full max-h-72 object-contain rounded-lg border border-gray-200 bg-white"
                  />
                ) : (
                  <div className="w-full h-52 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-sm text-gray-500">
                    Añade una imagen principal para ver la vista previa
                  </div>
                )}

                {previewGallery.length > 1 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                    {previewGallery.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`Galería ${index + 1}`}
                        className="w-16 h-16 rounded-md object-cover border border-gray-200 bg-white"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {form.name || 'Nombre del producto'}
                </p>
                <p className="text-3xl font-semibold text-green-700 mb-4">
                  {previewPrice.toFixed(2)} €
                </p>
                <ProductDescription
                  text={form.description}
                  compact
                  fallbackText="La descripción completa se mostrará aquí tal cual la escribas."
                />
              </div>
            </div>
          </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Pulsa &quot;Añadir nuevo producto&quot; para abrir el formulario.</p>
          )}

          {message && (
            <p className={`text-sm mt-3 ${message.includes('correctamente') ? 'text-green-700' : 'text-red-600'}`}>
              {message}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Productos ({products.length})</h2>
          </div>

          {loading ? (
            <p className="px-6 py-8 text-sm text-gray-500">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="px-6 py-8 text-sm text-gray-500">No hay productos todavía.</p>
          ) : (
            <div className="divide-y divide-gray-200">
              {products.map((product) => (
                <div key={product.id} className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold text-gray-900">
                      {product.name}
                      {!product.isActive && <span className="ml-2 text-xs text-amber-700">(oculto)</span>}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description || 'Sin descripción'}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      €{product.price.toFixed(2)} · Orden: {product.sortOrder}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product)}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      disabled={saving}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}