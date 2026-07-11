import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { contenidoModulos } from "@/data/contenidoModulos";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

interface PageProps {
  params: Promise<{ id: string }>;
}

const scoreColor = (p: number) =>
  p >= 80 ? "#34d399" : p >= 60 ? "#fbbf24" : "#f87171";
const scoreBg = (p: number) =>
  p >= 80 ? "rgba(16,185,129,0.1)" : p >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
const scoreBdr = (p: number) =>
  p >= 80 ? "rgba(16,185,129,0.3)" : p >= 60 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";

export default async function ResultadoDetailPage({ params }: PageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  let decoded: any;
  try { decoded = jwt.verify(token, JWT_SECRET); } catch { redirect("/login"); }

  const { id } = await params;
  const idNum = parseInt(id, 10);
  if (isNaN(idNum)) redirect("/resultados");

  const actividad = await prisma.actividad.findFirst({
    where: {
      id: idNum,
      usuario_id: decoded.id,
      tipo: "evaluacion",
      estado: "completado",
    },
    include: { resultados: true },
  });

  if (!actividad) redirect("/resultados");

  const meta     = actividad.metadatos ? JSON.parse(actividad.metadatos) : {};
  const contenido = actividad.resultados[0]?.contenido ? JSON.parse(actividad.resultados[0].contenido) : null;

  if (!contenido) redirect("/resultados");

  const { puntaje, correctas, total, detalles: rawDetalles } = contenido as {
    puntaje: number;
    correctas: number;
    total: number;
    detalles: any[];
  };

  const moduloId    = meta.moduloId as number | undefined;
  const moduloData  = moduloId ? contenidoModulos.find((m) => m.id === moduloId) : null;

  type DetalleItem = {
    preguntaId: number; pregunta: string; opciones: string[];
    respuestaUsuario: number; respuestaCorrecta: number;
    correcta: boolean; explicacion: string;
  };

  const detalles: DetalleItem[] = (rawDetalles ?? []).map((d: any): DetalleItem => {
    const preguntaData = moduloData?.preguntas?.find((p: any) => p.id === d.preguntaId);
    return {
      preguntaId:        d.preguntaId,
      pregunta:          d.pregunta,
      opciones:          d.opciones ?? (preguntaData as any)?.opciones ?? [],
      respuestaUsuario:  d.respuestaUsuario ?? d.seleccionada ?? -1,
      respuestaCorrecta: d.respuestaCorrecta ?? (typeof d.correcta === "number" ? d.correcta : (preguntaData as any)?.respuestaCorrecta ?? -1),
      correcta:          typeof d.correcta === "boolean" ? d.correcta : (d.esCorrecta ?? false),
      explicacion:       d.explicacion ?? "",
    };
  });

  const moduloTitulo = meta.moduloTitulo ?? "Módulo desconocido";

  const emoji = puntaje === 100 ? "🏆" : puntaje >= 80 ? "🌟" : puntaje >= 60 ? "✅" : "📚";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 flex-1 w-full">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-8 anim-fade-up" style={{ color: "#4b5563" }}>
        <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Dashboard</Link>
        <span>/</span>
        <Link href="/resultados" className="hover:text-zinc-300 transition-colors">Resultados</Link>
        <span>/</span>
        <span style={{ color: "#a78bfa" }}>Detalle</span>
      </nav>

      {/* Score hero */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 mb-8 text-center anim-score-reveal"
        style={{
          background: `linear-gradient(135deg, ${scoreBg(puntaje)}, rgba(10,10,22,0.9))`,
          border: `1px solid ${scoreBdr(puntaje)}`,
          backdropFilter: "blur(20px)",
          boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 60px ${scoreBg(puntaje)}`,
        }}>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(circle, ${scoreBg(puntaje)} 0%, transparent 70%)`, filter: "blur(40px)" }} />

        <div className="relative z-10">
          <p className="text-5xl mb-3">{emoji}</p>
          <div className="text-7xl font-black mb-2" style={{ color: scoreColor(puntaje) }}>{puntaje}%</div>
          <p className="text-lg font-bold text-white mb-1">
            {puntaje === 100 ? "¡Perfecto!" : puntaje >= 80 ? "¡Excelente!" : puntaje >= 60 ? "¡Aprobado!" : "¡Sigue practicando!"}
          </p>
          <p className="text-sm mb-5" style={{ color: "#6b7280" }}>
            {correctas} de {total} respuestas correctas · {moduloTitulo}
          </p>

          {/* Progress bar */}
          <div className="h-3 w-full max-w-xs mx-auto rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full progress-bar-fill"
              style={{
                width: `${puntaje}%`,
                background: `linear-gradient(90deg, ${scoreColor(puntaje)}, ${scoreColor(puntaje)}bb)`,
                "--target-width": `${puntaje}%`,
              } as React.CSSProperties} />
          </div>

          <p className="text-xs mt-3" style={{ color: "#4b5563" }}>
            {new Date(actividad.fecha_inicio).toLocaleDateString("es-ES", {
              day: "numeric", month: "long", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h2 className="text-sm font-bold uppercase tracking-widest mb-5 anim-fade-up" style={{ color: "#4b5563" }}>
        Revisión pregunta a pregunta
      </h2>

      <div className="space-y-4">
        {detalles.map((d, idx) => (
          <div key={d.preguntaId} className="rounded-2xl overflow-hidden anim-fade-up"
            style={{
              background: d.correcta ? "rgba(16,185,129,0.04)" : "rgba(239,68,68,0.04)",
              border: `1px solid ${d.correcta ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)"}`,
              animationDelay: `${idx * 60}ms`,
            }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5"
              style={{ borderBottom: `1px solid ${d.correcta ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"}` }}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black"
                  style={{
                    background: d.correcta ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    color: d.correcta ? "#34d399" : "#f87171",
                    border: `1px solid ${d.correcta ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  }}>
                  {idx + 1}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: d.correcta ? "#34d399" : "#f87171" }}>
                  {d.correcta ? "✓ Correcto" : "✗ Incorrecto"}
                </span>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm font-semibold text-white mb-4 leading-snug">{d.pregunta}</p>

              {/* Answer options */}
              <div className="space-y-2 mb-4">
                {d.opciones.map((opcion, oIdx) => {
                  const isUserAnswer    = oIdx === d.respuestaUsuario;
                  const isCorrectAnswer = oIdx === d.respuestaCorrecta;
                  let bg    = "rgba(255,255,255,0.03)";
                  let bdr   = "rgba(255,255,255,0.06)";
                  let color = "#6b7280";
                  let icon  = "";

                  if (isCorrectAnswer) { bg = "rgba(16,185,129,0.08)"; bdr = "rgba(16,185,129,0.25)"; color = "#34d399"; icon = "✓"; }
                  if (isUserAnswer && !d.correcta) { bg = "rgba(239,68,68,0.08)"; bdr = "rgba(239,68,68,0.25)"; color = "#f87171"; icon = "✗"; }
                  if (isUserAnswer && d.correcta)  { bg = "rgba(16,185,129,0.08)"; bdr = "rgba(16,185,129,0.25)"; color = "#34d399"; icon = "✓"; }

                  return (
                    <div key={oIdx} className="flex items-start gap-3 rounded-xl px-3.5 py-2.5"
                      style={{ background: bg, border: `1px solid ${bdr}` }}>
                      <span className="shrink-0 h-5 w-5 flex items-center justify-center rounded-full text-[10px] font-black mt-0.5"
                        style={{
                          background: isCorrectAnswer || (isUserAnswer && d.correcta) ? "rgba(16,185,129,0.2)" : isUserAnswer ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)",
                          color: isCorrectAnswer || (isUserAnswer && d.correcta) ? "#34d399" : isUserAnswer ? "#f87171" : "#4b5563",
                        }}>
                        {["A","B","C","D"][oIdx]}
                      </span>
                      <p className="flex-1 text-sm leading-snug" style={{ color }}>{opcion}</p>
                      {icon && <span className="text-sm shrink-0" style={{ color }}>{icon}</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation */}
              <div className="rounded-xl px-4 py-3"
                style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#7c3aed" }}>Explicación</p>
                <p className="text-xs leading-relaxed" style={{ color: "#9ca3af" }}>{d.explicacion}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 anim-fade-up">
        {moduloData && (
          <Link href={`/evaluacion/${moduloId}`}
            className="flex-1 text-center rounded-xl py-3.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02]"
            style={{
              background: "linear-gradient(135deg, #6d28d9, #c026d3)",
              color: "white",
              boxShadow: "0 0 20px rgba(109,40,217,0.3)",
            }}>
            Intentar de nuevo
          </Link>
        )}
        <Link href="/resultados"
          className="flex-1 text-center rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}>
          Ver todos mis resultados
        </Link>
        <Link href="/perfil"
          className="flex-1 text-center rounded-xl py-3.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}>
          Mi perfil
        </Link>
      </div>
    </div>
  );
}
