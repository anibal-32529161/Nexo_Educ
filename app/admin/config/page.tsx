import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { contenidoModulos } from "@/data/contenidoModulos";
import AdminPanel from "./AdminPanel";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

export default async function AdminConfigPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { redirect("/login"); }
  if (decoded.rol !== "admin") redirect("/dashboard");

  /* ─── Fetch data ─── */
  const [usuarios, actividadesEval, actividadesAll] = await Promise.all([
    prisma.usuario.findMany({
      select: {
        id: true, nombre: true, email: true, rol: true,
        creado_en: true, ultimo_acceso: true,
        _count: { select: { actividades: true } },
      },
      orderBy: { creado_en: "asc" },
    }),
    prisma.actividad.findMany({
      where: { tipo: "evaluacion", estado: "completado" },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        resultados: true,
      },
      orderBy: { fecha_inicio: "desc" },
    }),
    prisma.actividad.findMany({
      where: { estado: "completado" },
      include: {
        usuario: { select: { nombre: true } },
        resultados: true,
      },
      orderBy: { fecha_inicio: "desc" },
      take: 10,
    }),
  ]);

  /* ─── Resultados para la tabla ─── */
  const resultados = actividadesEval.map((a) => {
    const meta     = a.metadatos ? JSON.parse(a.metadatos) : {};
    const contenido = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
    return {
      id:            a.id,
      usuarioId:     a.usuario.id,
      usuarioNombre: a.usuario.nombre,
      usuarioEmail:  a.usuario.email,
      moduloId:      meta.moduloId ?? null,
      moduloTitulo:  meta.moduloTitulo ?? "Desconocido",
      puntaje:       contenido?.puntaje ?? 0,
      correctas:     contenido?.correctas ?? 0,
      total:         contenido?.total ?? 0,
      fecha:         a.fecha_fin ?? a.fecha_inicio,
    };
  });

  /* ─── Stats por módulo ─── */
  const modulosStats = contenidoModulos.map((modulo) => {
    const evalsModulo = resultados.filter((r) => r.moduloId === modulo.id);
    const promedio = evalsModulo.length > 0
      ? Math.round(evalsModulo.reduce((s, r) => s + r.puntaje, 0) / evalsModulo.length)
      : 0;
    return {
      moduloId:      modulo.id,
      moduloTitulo:  modulo.titulo,
      evaluaciones:  evalsModulo.length,
      promedioScore: promedio,
      maxScore:      evalsModulo.length > 0 ? Math.max(...evalsModulo.map((r) => r.puntaje)) : 0,
      minScore:      evalsModulo.length > 0 ? Math.min(...evalsModulo.map((r) => r.puntaje)) : 0,
    };
  }).filter((m) => m.evaluaciones > 0);

  /* ─── Stats globales ─── */
  const totalLecturas  = await prisma.actividad.count({ where: { tipo: "lectura" } });
  const promedioGlobal = resultados.length > 0
    ? Math.round(resultados.reduce((s, r) => s + r.puntaje, 0) / resultados.length)
    : 0;

  /* ─── Actividad reciente ─── */
  const actividadReciente = actividadesAll.map((a) => {
    const meta     = a.metadatos ? JSON.parse(a.metadatos) : {};
    const contenido = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
    return {
      id:         a.id,
      tipo:       a.tipo,
      estado:     a.estado,
      usuario:    a.usuario.nombre,
      fecha:      a.fecha_inicio,
      metadatos:  meta,
      puntaje:    contenido?.puntaje ?? null,
    };
  });

  const stats = {
    totalUsuarios:   usuarios.length,
    totalEvaluaciones: actividadesEval.length,
    totalLecturas,
    promedioGlobal,
    aprobados:   resultados.filter((r) => r.puntaje >= 60).length,
    excelentes:  resultados.filter((r) => r.puntaje === 100).length,
    modulosStats,
    actividadReciente,
  };

  const admins = usuarios.filter((u) => u.rol === "admin").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8 anim-fade-up"
        style={{
          background: "linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(10,10,22,0.9) 60%)",
          border: "1px solid rgba(139,92,246,0.2)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 60px rgba(109,40,217,0.04)",
        }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="relative z-10">
          <nav className="flex items-center gap-2 text-xs mb-5" style={{ color: "#4b5563" }}>
            <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
            <span>/</span>
            <span style={{ color: "#a78bfa" }}>Administración</span>
          </nav>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#a78bfa" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#a78bfa" }}>Panel de Administración</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            Centro de{" "}
            <span style={{
              background: "linear-gradient(135deg, #a78bfa, #e879f9)",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Control</span>
          </h1>
          <p className="mt-2 text-sm max-w-xl" style={{ color: "#6b7280" }}>
            Gestiona usuarios, monitorea el rendimiento académico y administra el sistema educativo.
          </p>

          {/* Mini stats */}
          <div className="flex flex-wrap gap-3 mt-6">
            {[
              { label: "Usuarios",     value: usuarios.length,          color: "#a78bfa" },
              { label: "Admins",       value: admins,                   color: "#f87171" },
              { label: "Evaluaciones", value: actividadesEval.length,   color: "#34d399" },
              { label: "Promedio",     value: `${promedioGlobal}%`,     color: "#fbbf24" },
              { label: "Lecturas",     value: totalLecturas,            color: "#38bdf8" },
            ].map(({ label, value, color }, i) => (
              <div key={label} className="rounded-2xl px-4 py-3 text-center min-w-[72px] anim-scale-in"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", animationDelay: `${i * 60}ms` }}>
                <p className="text-xl font-black" style={{ color }}>{value}</p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#4b5563" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel with tabs */}
      <div className="rounded-3xl anim-fade-up delay-200"
        style={{ background: "rgba(10,10,22,0.7)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(20px)", padding: "1.75rem" }}>
        <AdminPanel
          usuarios={usuarios as any}
          resultados={resultados as any}
          stats={stats as any}
          adminId={decoded.id}
        />
      </div>
    </div>
  );
}
