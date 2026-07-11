import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

interface ResultadoItem {
  id: number; moduloId: number | null; moduloTitulo: string;
  fechaCompletado: Date; puntaje: number; correctas: number; total: number;
}

function ScoreBadge({ puntaje }: { puntaje: number }) {
  const color = puntaje >= 80 ? "#34d399" : puntaje >= 60 ? "#fbbf24" : "#f87171";
  const bg    = puntaje >= 80 ? "rgba(16,185,129,0.1)"  : puntaje >= 60 ? "rgba(245,158,11,0.1)"  : "rgba(239,68,68,0.1)";
  const bdr   = puntaje >= 80 ? "rgba(16,185,129,0.3)"  : puntaje >= 60 ? "rgba(245,158,11,0.3)"  : "rgba(239,68,68,0.3)";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-black"
      style={{ background: bg, border: `1px solid ${bdr}`, color, boxShadow: `0 0 12px ${bg}` }}
    >
      {puntaje}%
    </span>
  );
}

function ScoreBar({ puntaje }: { puntaje: number }) {
  const color = puntaje >= 80 ? "#34d399" : puntaje >= 60 ? "#fbbf24" : "#f87171";
  return (
    <div className="h-1.5 rounded-full overflow-hidden w-20" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div
        className="h-full rounded-full progress-bar-fill"
        style={{ width: `${puntaje}%`, background: color, boxShadow: `0 0 6px ${color}88`, "--target-width": `${puntaje}%` } as React.CSSProperties}
      />
    </div>
  );
}

export default async function ResultadosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { redirect("/login"); }

  const actividades = await prisma.actividad.findMany({
    where: { usuario_id: decoded.id, tipo: "evaluacion", estado: "completado" },
    include: { resultados: true },
    orderBy: { fecha_inicio: "desc" },
  });

  const resultados: ResultadoItem[] = actividades.map((a) => {
    const meta = a.metadatos ? JSON.parse(a.metadatos) : {};
    const contenido = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
    return {
      id: a.id, moduloId: meta.moduloId ?? null, moduloTitulo: meta.moduloTitulo ?? "Módulo desconocido",
      fechaCompletado: a.fecha_fin ?? a.fecha_inicio,
      puntaje: contenido?.puntaje ?? 0, correctas: contenido?.correctas ?? 0, total: contenido?.total ?? 0,
    };
  });

  const promedio = resultados.length > 0
    ? Math.round(resultados.reduce((s, r) => s + r.puntaje, 0) / resultados.length)
    : null;
  const perfectos = resultados.filter((r) => r.puntaje === 100).length;
  const aprobados = resultados.filter((r) => r.puntaje >= 60).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-10 anim-fade-up"
        style={{
          background: "linear-gradient(135deg, rgba(192,38,211,0.12) 0%, rgba(10,10,22,0.85) 60%)",
          border: "1px solid rgba(217,70,239,0.2)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 60px rgba(192,38,211,0.06)",
        }}
      >
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <nav className="relative flex items-center gap-2 text-xs mb-5" style={{ color: "#4b5563" }}>
          <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Inicio</Link>
          <span>/</span>
          <span style={{ color: "#e879f9" }}>Mis Resultados</span>
        </nav>
        <h1 className="relative text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
          Mis{" "}
          <span className="anim-shimmer-text">Resultados</span>
        </h1>
        <p className="relative text-sm max-w-xl" style={{ color: "#6b7280" }}>
          Historial completo de tus evaluaciones en la plataforma.
        </p>

        {/* Stats row */}
        {resultados.length > 0 && (
          <div className="relative flex flex-wrap gap-4 mt-6">
            {[
              { label: "Evaluaciones",  value: resultados.length, color: "#a78bfa" },
              { label: "Promedio",      value: `${promedio}%`,    color: promedio! >= 80 ? "#34d399" : promedio! >= 60 ? "#fbbf24" : "#f87171" },
              { label: "Aprobadas",     value: aprobados,          color: "#34d399" },
              { label: "Perfectas",     value: perfectos,          color: "#fbbf24" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-2xl px-5 py-3.5 text-center min-w-[80px] anim-scale-in"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-2xl font-black" style={{ color }}>{value}</p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#4b5563" }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Results list ── */}
      {resultados.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center anim-fade-up delay-150"
          style={{ background: "rgba(10,10,22,0.6)", border: "1px dashed rgba(139,92,246,0.2)", backdropFilter: "blur(12px)" }}
        >
          <div
            className="inline-flex items-center justify-center h-16 w-16 rounded-2xl mb-5"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="#8b5cf6" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Aún no tienes evaluaciones</h3>
          <p className="text-sm mb-6" style={{ color: "#6b7280" }}>Completa tu primera evaluación para ver tus resultados aquí.</p>
          <Link
            href="/modulos"
            className="btn-glow inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #6d28d9, #c026d3)", boxShadow: "0 0 20px rgba(109,40,217,0.3)" }}
          >
            Ir a los módulos
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {resultados.map((r, idx) => (
            <div
              key={r.id}
              className="group card-lift rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-fade-up"
              style={{
                background: "rgba(10,10,22,0.65)",
                border: "1px solid rgba(255,255,255,0.07)",
                backdropFilter: "blur(12px)",
                animationDelay: `${idx * 60}ms`,
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                  style={{ background: "rgba(217,70,239,0.08)", border: "1px solid rgba(217,70,239,0.2)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#e879f9" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white text-base">{r.moduloTitulo}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-xs" style={{ color: "#6b7280" }}>
                      {r.correctas}/{r.total} correctas
                    </p>
                    <ScoreBar puntaje={r.puntaje} />
                    <p className="text-xs" style={{ color: "#4b5563" }}>
                      {new Date(r.fechaCompletado).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <ScoreBadge puntaje={r.puntaje} />
                <Link
                  href={`/resultados/${r.id}`}
                  className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-[1.03]"
                  style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}
                >
                  Ver detalle
                </Link>
                {r.moduloId && (
                  <Link
                    href={`/evaluacion/${r.moduloId}`}
                    className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-[1.03]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}
                  >
                    Repetir
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {resultados.length > 0 && (
        <div className="mt-8 text-center anim-fade-in delay-500">
          <Link
            href="/modulos"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}
          >
            Explorar más módulos
          </Link>
        </div>
      )}
    </div>
  );
}
