import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { contenidoModulos } from "@/data/contenidoModulos";

function ModuleIcon({ id }: { id: number }) {
  if (id === 1) return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
  if (id === 2) return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3V3.75a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v7.5a3 3 0 0 1-3 3m-13.5 0v3a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-3M6.75 6.75h.75m-.75 3h.75m8.25-3h.008v.008H15V6.75Zm.008 3h.008v.008H15V9.75ZM6.75 17.25h.75m8.25 0h.008v.008H15v-.008Z" />
    </svg>
  );
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
    </svg>
  );
}

const MODULE_COLORS = [
  { accent: "#8b5cf6", glow: "rgba(139,92,246,0.2)", border: "rgba(139,92,246,0.25)", bg: "rgba(109,40,217,0.08)" },
  { accent: "#e879f9", glow: "rgba(217,70,239,0.2)", border: "rgba(217,70,239,0.25)", bg: "rgba(192,38,211,0.08)" },
  { accent: "#38bdf8", glow: "rgba(56,189,248,0.2)", border: "rgba(6,182,212,0.25)",  bg: "rgba(6,182,212,0.08)"  },
];

export default async function ModulosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">

      {/* ── Header ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-10 anim-fade-up"
        style={{
          background: "rgba(10,10,22,0.7)",
          border: "1px solid rgba(139,92,246,0.18)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 60px rgba(109,40,217,0.06)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", filter: "blur(40px)" }}
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              Contenido Académico
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Módulos de{" "}
              <span className="anim-shimmer-text">Aprendizaje</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base max-w-xl" style={{ color: "#6b7280" }}>
              Desarrolla habilidades técnicas con unidades temáticas que incluyen teoría, conceptos clave y evaluaciones.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-95 shrink-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#9ca3af",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Dashboard
          </Link>
        </div>
      </div>

      {/* ── Module Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {contenidoModulos.map((modulo, idx) => {
          const color = MODULE_COLORS[idx % MODULE_COLORS.length];
          const delay = [150, 250, 350][idx] ?? 150;
          return (
            <div
              key={modulo.id}
              className="module-card glass-card group flex flex-col rounded-2xl overflow-hidden anim-fade-up"
              style={{ animationDelay: `${delay}ms`, border: `1px solid ${color.border}` }}
            >
              {/* Top gradient bar */}
              <div
                className="h-1 w-full"
                style={{ background: `linear-gradient(90deg, ${color.accent}, ${MODULE_COLORS[(idx + 1) % 3].accent})` }}
              />

              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={modulo.imagen}
                  alt={modulo.titulo}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(5,5,15,0.95) 0%, rgba(5,5,15,0.3) 50%, transparent 100%)" }}
                />

                {/* Duration badge */}
                <span
                  className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                  style={{ background: "rgba(5,5,15,0.75)", border: "1px solid rgba(255,255,255,0.08)", color: "#d1d5db" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={color.accent} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  {modulo.duracion}
                </span>

                {/* Module number */}
                <span
                  className="absolute top-3 left-3 rounded-lg px-2 py-0.5 text-xs font-bold font-mono tracking-widest"
                  style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.accent }}
                >
                  MOD {modulo.id.toString().padStart(2, "0")}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300"
                    style={{ background: color.bg, border: `1px solid ${color.border}`, color: color.accent }}
                  >
                    <ModuleIcon id={modulo.id} />
                  </div>
                  <h3 className="text-lg font-bold text-white leading-tight transition-colors duration-300">
                    {modulo.titulo}
                  </h3>
                </div>

                <p className="text-sm leading-relaxed flex-1 line-clamp-3" style={{ color: "#6b7280" }}>
                  {modulo.descripcionCorto}
                </p>

                {/* Concepts preview */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {modulo.conceptosClave.slice(0, 2).map((c, i) => (
                    <span
                      key={i}
                      className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: color.bg, color: color.accent, border: `1px solid ${color.border}` }}
                    >
                      {c.titulo}
                    </span>
                  ))}
                </div>

                <div className="mt-5 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <Link
                    href={`/modulos/${modulo.id}`}
                    className="btn-glow flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${color.accent}22, ${color.accent}11)`,
                      border: `1px solid ${color.border}`,
                    }}
                  >
                    Ver contenido
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke={color.accent} className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
