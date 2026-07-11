import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { contenidoModulos } from "@/data/contenidoModulos";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado." }, { status: 401 });

  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch {
    return NextResponse.json({ error: "Token inválido." }, { status: 401 });
  }

  const actividades = await prisma.actividad.findMany({
    where: { usuario_id: decoded.id, estado: "completado" },
    include: { resultados: true },
    orderBy: { fecha_inicio: "desc" },
  });

  const progreso = contenidoModulos.map((modulo) => {
    const lecturas = actividades.filter(
      (a) => a.tipo === "lectura" && a.metadatos?.includes(`"moduloId":${modulo.id}`)
    );
    const evaluaciones = actividades.filter(
      (a) => a.tipo === "evaluacion" && a.metadatos?.includes(`"moduloId":${modulo.id}`)
    );

    const mejorEval = evaluaciones.reduce<{ puntaje: number; fecha: Date } | null>((best, a) => {
      const contenido = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
      if (!contenido) return best;
      if (!best || contenido.puntaje > best.puntaje) return { puntaje: contenido.puntaje, fecha: a.fecha_inicio };
      return best;
    }, null);

    return {
      moduloId: modulo.id,
      moduloTitulo: modulo.titulo,
      leido: lecturas.length > 0,
      ultimaLectura: lecturas[0]?.fecha_inicio ?? null,
      evaluado: evaluaciones.length > 0,
      intentos: evaluaciones.length,
      mejorPuntaje: mejorEval?.puntaje ?? null,
      ultimaEvaluacion: evaluaciones[0]?.fecha_inicio ?? null,
    };
  });

  const modulosLeidos = progreso.filter((p) => p.leido).length;
  const modulosEvaluados = progreso.filter((p) => p.evaluado).length;
  const promedioScore =
    progreso.filter((p) => p.mejorPuntaje !== null).length > 0
      ? Math.round(
          progreso.filter((p) => p.mejorPuntaje !== null).reduce((s, p) => s + p.mejorPuntaje!, 0) /
          progreso.filter((p) => p.mejorPuntaje !== null).length
        )
      : null;

  return NextResponse.json({
    success: true,
    progreso,
    resumen: {
      totalModulos: contenidoModulos.length,
      modulosLeidos,
      modulosEvaluados,
      promedioScore,
      completado: modulosLeidos === contenidoModulos.length && modulosEvaluados === contenidoModulos.length,
    },
  });
}
