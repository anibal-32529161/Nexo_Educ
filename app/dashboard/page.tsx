import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import Link from "next/link";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { redirect("/login"); }

  const user = await prisma.usuario.findUnique({ where: { id: decoded.id } });
  if (!user) redirect("/login");

  const isAdmin = user.rol === "admin";

  const evalCount = await prisma.actividad.count({
    where: { usuario_id: user.id, tipo: "evaluacion", estado: "completado" },
  });

  const lastResult = await prisma.actividad.findFirst({
    where: { usuario_id: user.id, tipo: "evaluacion", estado: "completado" },
    include: { resultados: true },
    orderBy: { fecha_inicio: "desc" },
  });

  const lastScore = lastResult?.resultados[0]?.contenido
    ? JSON.parse(lastResult.resultados[0].contenido).puntaje
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 flex-1 w-full">

      {/* ── Welcome Hero ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-10 anim-fade-up"
        style={{
          background: "linear-gradient(135deg, rgba(109,40,217,0.15) 0%, rgba(12,12,26,0.8) 50%, rgba(192,38,211,0.1) 100%)",
          border: "1px solid rgba(139,92,246,0.2)",
          boxShadow: "0 0 60px rgba(109,40,217,0.08), 0 30px 60px rgba(0,0,0,0.4)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Scan line decoration */}
        <div className="absolute inset-0 scan-container rounded-3xl overflow-hidden pointer-events-none" />

        {/* Background gradient mesh */}
        <div
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "orb-drift 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-16 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(217,70,239,0.1) 0%, transparent 70%)",
            filter: "blur(40px)",
            animation: "orb-drift 14s ease-in-out infinite 3s",
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            {/* Status badge */}
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-4"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#34d399",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "pulse-ring 2s ease-in-out infinite" }}
              />
              Portal Académico Activo
            </span>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Hola,{" "}
              <span className="anim-shimmer-text">{user.nombre.split(" ")[0]}</span>{" "}
              <span style={{ display: "inline-block", animation: "float 3s ease-in-out infinite" }}>👋</span>
            </h1>
            <p className="mt-3 text-sm sm:text-base max-w-xl" style={{ color: "#9ca3af" }}>
              Bienvenido de nuevo a Nexora Edu. Tus lecciones y métricas de desempeño te esperan.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4 shrink-0">
            <div
              className="rounded-2xl px-5 py-4 text-center min-w-[90px]"
              style={{
                background: "rgba(109,40,217,0.12)",
                border: "1px solid rgba(139,92,246,0.2)",
              }}
            >
              <p className="text-2xl font-black text-white">{evalCount}</p>
              <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#7c3aed" }}>Evaluaciones</p>
            </div>
            {lastScore !== null && (
              <div
                className="rounded-2xl px-5 py-4 text-center min-w-[90px]"
                style={{
                  background: lastScore >= 80 ? "rgba(16,185,129,0.1)" : lastScore >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                  border: `1px solid ${lastScore >= 80 ? "rgba(16,185,129,0.25)" : lastScore >= 60 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"}`,
                }}
              >
                <p className="text-2xl font-black" style={{ color: lastScore >= 80 ? "#34d399" : lastScore >= 60 ? "#fbbf24" : "#f87171" }}>
                  {lastScore}%
                </p>
                <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#6b7280" }}>Último quiz</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main cards ── */}
      <h2 className="text-xs font-bold uppercase tracking-widest mb-5 anim-fade-up delay-100" style={{ color: "#4b5563" }}>
        Accesos del Estudiante
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

        {/* Módulos */}
        <Link
          href="/modulos"
          className="group module-card relative rounded-2xl p-7 sm:p-8 block anim-fade-up delay-150"
          style={{
            background: "rgba(10,10,22,0.6)",
            border: "1px solid rgba(109,40,217,0.18)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="flex h-13 w-13 items-center justify-center rounded-xl mb-6 transition-all duration-300"
            style={{
              background: "rgba(109,40,217,0.12)",
              border: "1px solid rgba(139,92,246,0.2)",
              width: "3.25rem", height: "3.25rem",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#a78bfa" className="w-6 h-6 transition-all duration-300 group-hover:stroke-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient-vf transition-all duration-300">
            Contenido educativo
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b7280" }}>
            Explora lecciones, recursos interactivos y las asignaciones del curso en progreso.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 group-hover:translate-x-2" style={{ color: "#8b5cf6" }}>
            Ingresar al contenido
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
          {/* Gradient corner accent */}
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-br-none rounded-tl-none rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle at top right, rgba(139,92,246,0.15) 0%, transparent 70%)" }}
          />
        </Link>

        {/* Resultados */}
        <Link
          href="/resultados"
          className="group module-card relative rounded-2xl p-7 sm:p-8 block anim-fade-up delay-200"
          style={{
            background: "rgba(10,10,22,0.6)",
            border: "1px solid rgba(192,38,211,0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            className="flex items-center justify-center rounded-xl mb-6 transition-all duration-300"
            style={{
              background: "rgba(192,38,211,0.1)",
              border: "1px solid rgba(217,70,239,0.2)",
              width: "3.25rem", height: "3.25rem",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#e879f9" className="w-6 h-6 transition-all duration-300 group-hover:stroke-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient-fc transition-all duration-300">
            Mis resultados
          </h3>
          <p className="text-sm leading-relaxed mb-6" style={{ color: "#6b7280" }}>
            Monitorea calificaciones, retroalimentación y estadísticas de progreso semanal.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-300 group-hover:translate-x-2" style={{ color: "#d946ef" }}>
            Ver calificaciones
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </span>
          <div
            className="absolute top-0 right-0 w-32 h-32 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: "radial-gradient(circle at top right, rgba(217,70,239,0.12) 0%, transparent 70%)" }}
          />
        </Link>
      </div>

      {/* ── Admin Panel ── */}
      {isAdmin && (
        <div className="mt-10 anim-fade-up delay-300">
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#dc2626" }}>
            Administración del Sistema
          </h2>
          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{
              background: "rgba(127,29,29,0.06)",
              border: "1px solid rgba(220,38,38,0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
              <div className="flex gap-4 items-start">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#f87171" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Panel de administración</h3>
                  <p className="mt-1 text-sm max-w-xl" style={{ color: "#6b7280" }}>
                    Gestiona usuarios, configura el sistema, matricula alumnos y exporta reportes.
                  </p>
                </div>
              </div>
              <Link
                href="/admin/config"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171",
                }}
              >
                Gestionar Consola
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
