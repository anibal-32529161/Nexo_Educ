import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "El correo y la contraseña son requeridos." },
        { status: 400 }
      );
    }

    // Buscar el usuario en la base de datos
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      return NextResponse.json(
        { error: "Correo electrónico o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // Comparar contraseña
    const esValida = await bcrypt.compare(password, usuario.contrasena_hash);
    if (!esValida) {
      return NextResponse.json(
        { error: "Correo electrónico o contraseña incorrectos." },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Establecer la cookie HTTP-Only
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return NextResponse.json({
      success: true,
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error: any) {
    console.error("Error en login route handler:", error);
    return NextResponse.json(
      { error: "Ha ocurrido un error en el servidor." },
      { status: 500 }
    );
  }
}
