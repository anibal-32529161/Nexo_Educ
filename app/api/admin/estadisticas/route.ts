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

  const [totalUsuarios, totalEvaluaciones, totalLecturas, actividadReciente, evaluacionesPorModulo] =
    await Promise.all([
      prisma.usuario.count(),
      prisma.actividad.count({ where: { tipo: "evaluacion", estado: "completado" } }),
      prisma.actividad.count({ where: { tipo: "lectura" } }),
      prisma.actividad.findMany({
        where: { estado: "completado" },
        include: { usuario: { select: { nombre: true, email: true } }, resultados: true },
        orderBy: { fecha_inicio: "desc" },
        take: 10,
      }),
      prisma.actividad.findMany({
        where: { tipo: "evaluacion", estado: "completado" },
        include: { resultados: true },
      }),
    ]);

  // Agrupar evaluaciones por módulo
  const statsPorModulo: Record<number, { moduloTitulo: string; count: number; puntajes: number[] }> = {};
  for (const act of evaluacionesPorModulo) {
    const meta = act.metadatos ? JSON.parse(act.metadatos) : {};
    const id = meta.moduloId ?? 0;
    if (!statsPorModulo[id]) statsPorModulo[id] = { moduloTitulo: meta.moduloTitulo ?? "Desconocido", count: 0, puntajes: [] };
    statsPorModulo[id].count++;
    const contenido = act.resultados[0]?.contenido ? JSON.parse(act.resultados[0].contenido) : null;
    if (contenido?.puntaje != null) statsPorModulo[id].puntajes.push(contenido.puntaje);
  }

  const modulosStats = Object.entries(statsPorModulo).map(([idStr, s]) => ({
    moduloId: Number(idStr),
    moduloTitulo: s.moduloTitulo,
    evaluaciones: s.count,
    promedioScore: s.puntajes.length > 0 ? Math.round(s.puntajes.reduce((a, b) => a + b, 0) / s.puntajes.length) : 0,
    maxScore: s.puntajes.length > 0 ? Math.max(...s.puntajes) : 0,
    minScore: s.puntajes.length > 0 ? Math.min(...s.puntajes) : 0,
  }));

  // Score promedio global
  const allScores = evaluacionesPorModulo.flatMap((a) => {
    const c = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
    return c?.puntaje != null ? [c.puntaje] : [];
  });
  const promedioGlobal = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;
  const aprobados = allScores.filter((s) => s >= 60).length;
  const excelentes = allScores.filter((s) => s === 100).length;

  const actividadFormateada = actividadReciente.map((a) => ({
    id: a.id,
    tipo: a.tipo,
    estado: a.estado,
    usuario: a.usuario.nombre,
    fecha: a.fecha_inicio,
    metadatos: a.metadatos ? JSON.parse(a.metadatos) : {},
    puntaje: (() => {
      const c = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
      return c?.puntaje ?? null;
    })(),
  }));

  return NextResponse.json({
    success: true,
    stats: {
      totalUsuarios, totalEvaluaciones, totalLecturas,
      promedioGlobal, aprobados, excelentes,
      modulosStats, actividadReciente: actividadFormateada,
    },
  });
}
