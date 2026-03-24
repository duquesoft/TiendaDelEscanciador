import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Eliminar de Auth
    await supabaseAdmin.auth.admin.deleteUser(id)

    // 2. Eliminar de user_roles
    await supabaseAdmin.from("user_roles").delete().eq("user_id", id)

    // 3. Eliminar de users
    await supabaseAdmin.from("users").delete().eq("id", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}