import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const actividades = await prisma.actividad.findMany({
      where: {
        usuario_id: decoded.id,
        tipo: "evaluacion",
        estado: "completado",
      },
      include: {
        resultados: true,
      },
      orderBy: { fecha_inicio: "desc" },
    });

    const resultadosFormateados = actividades.map((actividad) => {
      const metadatos = actividad.metadatos ? JSON.parse(actividad.metadatos) : {};
      const resultado = actividad.resultados[0];
      const contenido = resultado?.contenido ? JSON.parse(resultado.contenido) : null;

      return {
        id: actividad.id,
        moduloId: metadatos.moduloId ?? null,
        moduloTitulo: metadatos.moduloTitulo ?? "Módulo desconocido",
        fechaCompletado: actividad.fecha_fin ?? actividad.fecha_inicio,
        puntaje: contenido?.puntaje ?? 0,
        correctas: contenido?.correctas ?? 0,
        total: contenido?.total ?? 0,
      };
    });

    return NextResponse.json({ success: true, resultados: resultadosFormateados });
  } catch (error) {
    console.error("Error en GET /api/resultados:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
