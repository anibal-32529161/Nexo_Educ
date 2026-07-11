import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

async function verificarAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.rol !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await verificarAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      creado_en: true,
      ultimo_acceso: true,
      _count: { select: { actividades: true } },
    },
    orderBy: { creado_en: "asc" },
  });

  return NextResponse.json({ success: true, usuarios });
}

export async function PATCH(req: NextRequest) {
  const admin = await verificarAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  }

  const { id, rol } = await req.json();

  if (!id || !rol || !["admin", "normal"].includes(rol)) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  if (id === admin.id) {
    return NextResponse.json({ error: "No puedes modificar tu propio rol." }, { status: 400 });
  }

  const usuario = await prisma.usuario.update({
    where: { id: Number(id) },
    data: { rol },
    select: { id: true, nombre: true, email: true, rol: true },
  });

  return NextResponse.json({ success: true, usuario });
}

export async function POST(req: NextRequest) {
  const admin = await verificarAdmin();
  if (!admin) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });

  const { nombre, email, password, rol } = await req.json();

  if (!nombre?.trim() || !email?.trim() || !password || !["admin", "normal"].includes(rol)) {
    return NextResponse.json({ error: "Todos los campos son requeridos." }, { status: 400 });
  }

  const existe = await prisma.usuario.findUnique({ where: { email } });
  if (existe) return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });

  if (password.length < 6) return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres." }, { status: 400 });

  const hash = await bcrypt.hash(password, 10);
  const usuario = await prisma.usuario.create({
    data: { nombre: nombre.trim(), email: email.trim().toLowerCase(), contrasena_hash: hash, rol },
    select: { id: true, nombre: true, email: true, rol: true, creado_en: true },
  });

  return NextResponse.json({ success: true, usuario }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const admin = await verificarAdmin();
  if (!admin) return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id requerido." }, { status: 400 });
  if (Number(id) === admin.id) return NextResponse.json({ error: "No puedes eliminar tu propia cuenta." }, { status: 400 });

  await prisma.usuario.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
