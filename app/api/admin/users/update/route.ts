import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { emptyShippingDetails, serializeShippingDetails, type ShippingDetails } from "@/lib/shipping"

export async function POST(req: Request) {
  try {
    const { id, name, lastname, phone, address, role, shipping } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user: currentUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", currentUser.id)
      .single()

    if (roleError || userRole?.role !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const shippingInput = typeof shipping === 'object' && shipping !== null
      ? (shipping as Partial<ShippingDetails>)
      : null

    const normalizedShipping: ShippingDetails = {
      ...emptyShippingDetails(),
      name:
        typeof shippingInput?.name === 'string'
          ? shippingInput.name.trim()
          : typeof name === 'string'
            ? name.trim()
            : '',
      lastname:
        typeof shippingInput?.lastname === 'string'
          ? shippingInput.lastname.trim()
          : typeof lastname === 'string'
            ? lastname.trim()
            : '',
      addressLine1:
        typeof shippingInput?.addressLine1 === 'string'
          ? shippingInput.addressLine1.trim()
          : typeof address === 'string'
            ? address.trim()
            : '',
      addressLine2: typeof shippingInput?.addressLine2 === 'string' ? shippingInput.addressLine2.trim() : '',
      postalCode: typeof shippingInput?.postalCode === 'string' ? shippingInput.postalCode.trim() : '',
      city: typeof shippingInput?.city === 'string' ? shippingInput.city.trim() : '',
      province: typeof shippingInput?.province === 'string' ? shippingInput.province.trim() : '',
      country: typeof shippingInput?.country === 'string' ? shippingInput.country.trim() : '',
      phone:
        typeof shippingInput?.phone === 'string'
          ? shippingInput.phone.trim()
          : typeof phone === 'string'
            ? phone.trim()
            : '',
    }

    if (!normalizedShipping.name || !normalizedShipping.lastname) {
      return NextResponse.json(
        { error: "Nombre y apellidos del envío son obligatorios" },
        { status: 400 }
      )
    }

    const serializedAddress = serializeShippingDetails(normalizedShipping)

    // Actualizar tabla users
    const { error: userUpdateError } = await supabaseAdmin
      .from("users")
      .update({
        name,
        lastname,
        phone: normalizedShipping.phone || null,
        address: serializedAddress,
        updatedat: new Date()
      })
      .eq("id", id)

    if (userUpdateError) {
      return NextResponse.json({ error: "Error actualizando usuario" }, { status: 500 })
    }

    // Actualizar rol
    const { error: roleUpdateError } = await supabaseAdmin
      .from("user_roles")
      .update({ role })
      .eq("user_id", id)

    if (roleUpdateError) {
      return NextResponse.json({ error: "Error actualizando rol" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}