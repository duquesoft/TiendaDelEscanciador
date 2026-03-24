import { NextResponse } from "next/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {
    const { id, name, lastname, phone, address, role } = await req.json()

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Actualizar tabla users
    await supabaseAdmin
      .from("users")
      .update({
        name,
        lastname,
        phone,
        address,
        updatedat: new Date()
      })
      .eq("id", id)

    // Actualizar rol
    await supabaseAdmin
      .from("user_roles")
      .update({ role })
      .eq("user_id", id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}