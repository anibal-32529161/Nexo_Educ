import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // Expira la cookie inmediatamente
    });

    return NextResponse.json({
      success: true,
      message: "Sesión cerrada correctamente.",
    });
  } catch (error: any) {
    console.error("Error en logout route handler:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error en el servidor." },
      { status: 500 }
    );
  }
}
