import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { contenidoModulos } from "@/data/contenidoModulos";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

const scoreColor = (p: number) =>
  p >= 80 ? "#34d399" : p >= 60 ? "#fbbf24" : "#f87171";
const scoreBg = (p: number) =>
  p >= 80 ? "rgba(16,185,129,0.1)" : p >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
const scoreBdr = (p: number) =>
  p >= 80 ? "rgba(16,185,129,0.3)" : p >= 60 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";

export default async function PerfilPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { redirect("/login"); }

  const usuario = await prisma.usuario.findUnique({
    where: { id: decoded.id },
    select: { id: true, nombre: true, email: true, rol: true, creado_en: true, ultimo_acceso: true },
  });
  if (!usuario) redirect("/login");

  const actividades = await prisma.actividad.findMany({
    where: { usuario_id: decoded.id, estado: "completado" },
    include: { resultados: true },
    orderBy: { fecha_inicio: "desc" },
  });

  /* ─── Progreso por módulo ─── */
  const progreso = contenidoModulos.map((modulo) => {
    const lecturas = actividades.filter(
      (a) => a.tipo === "lectura" && a.metadatos?.includes(`"moduloId":${modulo.id}`)
    );
    const evals = actividades.filter(
      (a) => a.tipo === "evaluacion" && a.metadatos?.includes(`"moduloId":${modulo.id}`)
    );

    const scores = evals
      .map((a) => {
        const c = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
        return c?.puntaje ?? null;
      })
      .filter((s): s is number => s !== null);

    const mejorPuntaje = scores.length > 0 ? Math.max(...scores) : null;

    return {
      id:           modulo.id,
      titulo:       modulo.titulo,
      imagen:       modulo.imagen,
      leido:        lecturas.length > 0,
      ultimaLectura: lecturas[0]?.fecha_inicio ?? null,
      evaluado:     evals.length > 0,
      intentos:     evals.length,
      mejorPuntaje,
      ultimaEval:   evals[0]?.fecha_inicio ?? null,
    };
  });

  /* ─── Stats globales ─── */
  const totalEvals    = actividades.filter((a) => a.tipo === "evaluacion").length;
  const totalLecturas = actividades.filter((a) => a.tipo === "lectura").length;
  const allScores     = progreso.map((p) => p.mejorPuntaje).filter((s): s is number => s !== null);
  const promedio      = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;
  const completado    = progreso.every((p) => p.leido && p.evaluado);
  const modulosLeidos = progreso.filter((p) => p.leido).length;
  const modulosEvals  = progreso.filter((p) => p.evaluado).length;

  /* ─── Iniciales ─── */
  const iniciales = usuario.nombre.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();

  const MODULE_ACCENT = ["#8b5cf6", "#e879f9", "#38bdf8"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-8 anim-fade-up" style={{ color: "#4b5563" }}>
        <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <span style={{ color: "#a78bfa" }}>Mi Perfil</span>
      </nav>

      {/* Hero card */}
      <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10 mb-8 anim-fade-up"
        style={{
          background: "linear-gradient(135deg, rgba(109,40,217,0.12) 0%, rgba(10,10,22,0.9) 70%)",
          border: "1px solid rgba(139,92,246,0.2)",
          backdropFilter: "blur(20px)",
        }}>
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(217,70,239,0.12) 0%, transparent 70%)", filter: "blur(40px)" }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-24 w-24 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-2xl"
              style={{ background: "linear-gradient(135deg, #6d28d9, #c026d3)", boxShadow: "0 0 40px rgba(109,40,217,0.4)" }}>
              {iniciales}
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2"
              style={{ background: "#34d399", borderColor: "#05050f" }} />
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{usuario.nombre}</h1>
              <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{
                  background: usuario.rol === "admin" ? "rgba(239,68,68,0.1)" : "rgba(139,92,246,0.1)",
                  border: `1px solid ${usuario.rol === "admin" ? "rgba(239,68,68,0.25)" : "rgba(139,92,246,0.25)"}`,
                  color: usuario.rol === "admin" ? "#f87171" : "#a78bfa",
                }}>
                {usuario.rol === "admin" ? "Administrador" : "Estudiante"}
              </span>
              {completado && (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", color: "#6ee7b7" }}>
                  ✓ Curso completado
                </span>
              )}
            </div>
            <p className="text-sm mb-4" style={{ color: "#6b7280" }}>{usuario.email}</p>

            <p className="text-xs" style={{ color: "#4b5563" }}>
              Miembro desde {new Date(usuario.creado_en).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Promedio badge */}
          {promedio !== null && (
            <div className="shrink-0 rounded-2xl px-6 py-4 text-center"
              style={{ background: scoreBg(promedio), border: `1px solid ${scoreBdr(promedio)}` }}>
              <p className="text-3xl font-black" style={{ color: scoreColor(promedio) }}>{promedio}%</p>
              <p className="text-xs uppercase tracking-wider mt-1" style={{ color: "#4b5563" }}>Promedio</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 anim-fade-up delay-150">
        {[
          { label: "Módulos leídos",     value: `${modulosLeidos}/${contenidoModulos.length}`,  color: "#38bdf8" },
          { label: "Evaluaciones",       value: `${modulosEvals}/${contenidoModulos.length}`,   color: "#a78bfa" },
          { label: "Intentos totales",   value: totalEvals,                                     color: "#fbbf24" },
          { label: "Lecturas realizadas",value: totalLecturas,                                  color: "#34d399" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl px-5 py-4 text-center"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-2xl font-black" style={{ color }}>{value}</p>
            <p className="text-xs uppercase tracking-wider mt-1" style={{ color: "#4b5563" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Progreso general */}
      <div className="rounded-2xl p-6 mb-8 anim-fade-up delay-200"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6b7280" }}>Progreso del curso</span>
          <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>
            {Math.round(((modulosLeidos + modulosEvals) / (contenidoModulos.length * 2)) * 100)}%
          </span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full progress-bar-fill"
            style={{
              width: `${Math.round(((modulosLeidos + modulosEvals) / (contenidoModulos.length * 2)) * 100)}%`,
              background: "linear-gradient(90deg, #6d28d9, #c026d3, #ec4899)",
              "--target-width": `${Math.round(((modulosLeidos + modulosEvals) / (contenidoModulos.length * 2)) * 100)}%`,
            } as React.CSSProperties} />
        </div>
      </div>

      {/* Módulos */}
      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 anim-fade-up delay-250" style={{ color: "#4b5563" }}>
        Estado por módulo
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {progreso.map((p, idx) => {
          const accent = MODULE_ACCENT[idx % 3];
          return (
            <div key={p.id} className="rounded-2xl overflow-hidden anim-scale-in"
              style={{
                background: "rgba(10,10,22,0.7)",
                border: `1px solid ${p.leido || p.evaluado ? `${accent}33` : "rgba(255,255,255,0.07)"}`,
                animationDelay: `${idx * 80}ms`,
              }}>
              {/* Image */}
              <div className="relative h-28 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imagen} alt={p.titulo} className="h-full w-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(5,5,15,0.95), transparent)" }} />
                <div className="absolute top-3 right-3 flex gap-2">
                  {p.leido && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm"
                      style={{ background: "rgba(56,189,248,0.15)", border: "1px solid rgba(56,189,248,0.3)", color: "#38bdf8" }}>
                      📖 Leído
                    </span>
                  )}
                  {p.evaluado && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-sm"
                      style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#6ee7b7" }}>
                      ✓ Evaluado
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <span className="text-[10px] font-bold uppercase tracking-widest mb-1 block" style={{ color: accent }}>
                  Módulo {p.id}
                </span>
                <h3 className="text-sm font-bold text-white mb-4 leading-snug">{p.titulo}</h3>

                {p.mejorPuntaje !== null ? (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5" style={{ color: "#6b7280" }}>
                      <span>Mejor puntaje</span>
                      <span style={{ color: scoreColor(p.mejorPuntaje), fontWeight: 700 }}>{p.mejorPuntaje}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full"
                        style={{ width: `${p.mejorPuntaje}%`, background: scoreColor(p.mejorPuntaje), transition: "width 0.7s ease" }} />
                    </div>
                    {p.intentos > 1 && (
                      <p className="text-[10px] mt-1" style={{ color: "#4b5563" }}>{p.intentos} intentos</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs mb-4" style={{ color: "#374151" }}>Aún no evaluado</p>
                )}

                <div className="flex gap-2">
                  <Link href={`/modulos/${p.id}`}
                    className="flex-1 text-center rounded-xl py-2 text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}>
                    {p.leido ? "Releer" : "Leer"}
                  </Link>
                  <Link href={`/evaluacion/${p.id}`}
                    className="flex-1 text-center rounded-xl py-2 text-xs font-semibold transition-all duration-200 hover:scale-[1.02]"
                    style={{
                      background: `${accent}18`,
                      border: `1px solid ${accent}44`,
                      color: accent,
                    }}>
                    {p.evaluado ? "Re-evaluar" : "Evaluar"}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actividad reciente */}
      {actividades.length > 0 && (
        <div className="anim-fade-up">
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#4b5563" }}>Actividad reciente</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            {actividades.slice(0, 8).map((a, idx) => {
              const meta = a.metadatos ? JSON.parse(a.metadatos) : {};
              const contenido = a.resultados[0]?.contenido ? JSON.parse(a.resultados[0].contenido) : null;
              return (
                <div key={a.id} className="flex items-center justify-between px-5 py-3.5 gap-4 anim-fade-left"
                  style={{
                    borderBottom: idx < Math.min(actividades.length, 8) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    animationDelay: `${idx * 40}ms`,
                  }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{a.tipo === "evaluacion" ? "📝" : "📖"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {a.tipo === "evaluacion" ? "Evaluación completada" : "Módulo leído"}
                      </p>
                      <p className="text-xs truncate" style={{ color: "#6b7280" }}>
                        {meta.moduloTitulo ?? `Módulo ${meta.moduloId}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {contenido?.puntaje !== undefined && (
                      <span className="text-xs font-bold rounded-full px-2.5 py-0.5"
                        style={{ background: scoreBg(contenido.puntaje), color: scoreColor(contenido.puntaje), border: `1px solid ${scoreBdr(contenido.puntaje)}` }}>
                        {contenido.puntaje}%
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "#374151" }}>
                      {new Date(a.fecha_inicio).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
