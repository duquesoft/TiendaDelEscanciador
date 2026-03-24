import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 })
    }

    const supabase = await createClient()

    // Obtener usuario
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError }, { status: 400 })
    }

    // Obtener rol
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", id)
      .single()

    return NextResponse.json({
      ...user,
      role: roleData?.role || "user"
    })
  } catch (error) {
    console.error("GET USER ERROR:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}