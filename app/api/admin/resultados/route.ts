import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.rol !== "admin") return NextResponse.json({ error: "Acceso denegado." }, { status: 403 });
  } catch {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const actividades = await prisma.actividad.findMany({
    where: { tipo: "evaluacion", estado: "completado" },
    include: {
      usuario: { select: { id: true, nombre: true, email: true } },
      resultados: true,
    },
    orderBy: { fecha_inicio: "desc" },
  });

  const resultados = actividades.map((a) => {
    const meta = a.metadatos ? JSON.parse(a.metadatos) : {};
    const contenido = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
    return {
      id: a.id,
      usuarioId: a.usuario.id,
      usuarioNombre: a.usuario.nombre,
      usuarioEmail: a.usuario.email,
      moduloId: meta.moduloId ?? null,
      moduloTitulo: meta.moduloTitulo ?? "Desconocido",
      puntaje: contenido?.puntaje ?? 0,
      correctas: contenido?.correctas ?? 0,
      total: contenido?.total ?? 0,
      fecha: a.fecha_fin ?? a.fecha_inicio,
    };
  });

  return NextResponse.json({ success: true, resultados });
}
