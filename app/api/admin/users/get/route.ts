import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { NextRequest } from "next/server"
import { formatShippingAddress, parseShippingDetails } from "@/lib/shipping"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
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

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single()

    if (userError) {
      return NextResponse.json({ error: "Error obteniendo usuario" }, { status: 400 })
    }

    // Obtener rol
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", id)
      .single()

    return NextResponse.json({
      ...user,
      address: formatShippingAddress(user),
      shipping: parseShippingDetails(user),
      role: roleData?.role || "user"
    })
  } catch (error) {
    console.error("GET USER ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}