import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

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

    // 1. Eliminar de Auth
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (authDeleteError) {
      return NextResponse.json({ error: "Error eliminando usuario en auth" }, { status: 500 })
    }

    // 2. Eliminar de user_roles
    const { error: rolesDeleteError } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", id)

    if (rolesDeleteError) {
      return NextResponse.json({ error: "Error eliminando roles de usuario" }, { status: 500 })
    }

    // 3. Eliminar de users
    const { error: userDeleteError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("id", id)

    if (userDeleteError) {
      return NextResponse.json({ error: "Error eliminando usuario" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}