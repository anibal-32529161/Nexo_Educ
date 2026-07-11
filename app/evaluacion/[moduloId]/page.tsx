"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { contenidoModulos } from "@/data/contenidoModulos";

interface PageProps { params: Promise<{ moduloId: string }>; }

interface DetalleRespuesta {
  preguntaId: number; pregunta: string;
  seleccionada: number; correcta: number;
  esCorrecta: boolean; explicacion: string;
}
interface ResultadoEval { puntaje: number; correctas: number; total: number; detalles: DetalleRespuesta[]; }

export default function EvaluacionPage({ params }: PageProps) {
  const { moduloId } = use(params);
  const router = useRouter();
  const idNum = parseInt(moduloId, 10);
  const modulo = isNaN(idNum) ? null : contenidoModulos.find((m) => m.id === idNum);

  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEval | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!modulo) router.push("/modulos");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modulo]);

  if (!modulo) return null;

  const respondidas = Object.keys(respuestas).length;
  const total = modulo.preguntas.length;
  const todasRespondidas = respondidas === total;
  const progreso = Math.round((respondidas / total) * 100);

  const handleSeleccion = (preguntaId: number, opcionIdx: number) => {
    if (resultado) return;
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIdx }));
  };

  const handleSubmit = async () => {
    if (!todasRespondidas) return;
    setEnviando(true); setError(null);
    try {
      const res = await fetch("/api/evaluacion/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduloId: idNum,
          respuestas: Object.entries(respuestas).map(([id, r]) => ({ preguntaId: Number(id), respuesta: r })),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) setResultado(data.resultado);
      else setError(data.error || "Error al enviar.");
    } catch { setError("Error de conexión."); }
    finally { setEnviando(false); }
  };

  const scoreColor = resultado
    ? resultado.puntaje >= 80 ? "#34d399" : resultado.puntaje >= 60 ? "#fbbf24" : "#f87171"
    : "#8b5cf6";
  const scoreBg = resultado
    ? resultado.puntaje >= 80 ? "rgba(16,185,129,0.08)" : resultado.puntaje >= 60 ? "rgba(245,158,11,0.08)" : "rgba(239,68,68,0.08)"
    : "rgba(139,92,246,0.08)";
  const scoreBorder = resultado
    ? resultado.puntaje >= 80 ? "rgba(16,185,129,0.25)" : resultado.puntaje >= 60 ? "rgba(245,158,11,0.25)" : "rgba(239,68,68,0.25)"
    : "rgba(139,92,246,0.25)";

  const scoreEmoji = resultado
    ? resultado.puntaje >= 80 ? "🏆" : resultado.puntaje >= 60 ? "✨" : "📚"
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 flex-1 w-full">

      {/* Breadcrumb */}
      <nav className={`flex items-center gap-2 text-xs mb-8 transition-all duration-700 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ color: "#4b5563" }}>
        <Link href="/dashboard" className="hover:text-zinc-300 transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/modulos" className="hover:text-zinc-300 transition-colors">Módulos</Link>
        <span>/</span>
        <Link href={`/modulos/${modulo.id}`} className="hover:text-zinc-300 transition-colors truncate max-w-[120px]">{modulo.titulo}</Link>
        <span>/</span>
        <span style={{ color: "#8b5cf6" }}>Evaluación</span>
      </nav>

      {/* Header card */}
      <div
        className="rounded-2xl p-6 sm:p-8 mb-8 anim-fade-up"
        style={{
          background: "rgba(10,10,22,0.7)",
          border: "1px solid rgba(139,92,246,0.2)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <span
            className="rounded-lg px-2.5 py-1 text-xs font-bold font-mono"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", color: "#a78bfa" }}
          >
            MÓDULO {modulo.id}
          </span>
          <span
            className="rounded-lg px-2.5 py-1 text-xs font-medium"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
          >
            {total} preguntas
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Evaluación: <span className="anim-shimmer-text">{modulo.titulo}</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>
          Selecciona la respuesta correcta para cada pregunta y envía al finalizar.
        </p>

        {/* Progress bar */}
        {!resultado && (
          <div className="mt-5">
            <div className="flex justify-between text-xs mb-2" style={{ color: "#6b7280" }}>
              <span>{respondidas} de {total} respondidas</span>
              <span style={{ color: "#8b5cf6" }}>{progreso}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progreso}%`,
                  background: "linear-gradient(90deg, #7c3aed, #c026d3)",
                  boxShadow: progreso > 0 ? "0 0 12px rgba(139,92,246,0.5)" : "none",
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Score reveal */}
      {resultado && (
        <div
          className="rounded-2xl p-8 mb-8 text-center anim-scale-in"
          style={{ background: scoreBg, border: `1px solid ${scoreBorder}`, boxShadow: `0 0 40px ${scoreBg}` }}
        >
          <div
            className="text-6xl mb-4 anim-bounce-in"
            style={{ display: "inline-block", animation: "bounce-in 0.7s cubic-bezier(0.36,0.07,0.19,0.97) both" }}
          >
            {scoreEmoji}
          </div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#6b7280" }}>Tu calificación</p>
          <p
            className="text-7xl font-black mb-2 anim-score-reveal"
            style={{ color: scoreColor, textShadow: `0 0 30px ${scoreColor}66` }}
          >
            {resultado.puntaje}%
          </p>
          <p className="text-sm mb-1" style={{ color: "#6b7280" }}>
            {resultado.correctas} de {resultado.total} respuestas correctas
          </p>
          <p className="text-base font-bold mt-3" style={{ color: scoreColor }}>
            {resultado.puntaje >= 80 ? "¡Excelente! Dominas este módulo." : resultado.puntaje >= 60 ? "Bien. Repasa los temas marcados." : "Necesitas repasar el módulo antes de continuar."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link
              href="/resultados"
              className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200"
              style={{ background: "rgba(217,70,239,0.1)", border: "1px solid rgba(217,70,239,0.3)", color: "#e879f9" }}
            >
              Ver todos mis resultados
            </Link>
            <Link
              href="/modulos"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
            >
              Otros módulos
            </Link>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-5">
        {modulo.preguntas.map((pregunta, pregIdx) => {
          const seleccionada = respuestas[pregunta.id];
          const detalle = resultado?.detalles.find((d) => d.preguntaId === pregunta.id);
          const delay = pregIdx * 60;

          let cardBg = "rgba(10,10,22,0.7)";
          let cardBorder = "rgba(255,255,255,0.07)";
          if (detalle) {
            cardBg = detalle.esCorrecta ? "rgba(16,185,129,0.05)" : "rgba(239,68,68,0.05)";
            cardBorder = detalle.esCorrecta ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)";
          }

          return (
            <div
              key={pregunta.id}
              className="rounded-2xl p-6 anim-fade-up"
              style={{
                background: cardBg,
                border: `1px solid ${cardBorder}`,
                backdropFilter: "blur(16px)",
                animationDelay: `${delay}ms`,
                boxShadow: detalle ? `0 0 20px ${cardBorder}` : "0 8px 24px rgba(0,0,0,0.3)",
                transition: "background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease",
              }}
            >
              {/* Question header */}
              <div className="flex items-start gap-3 mb-5">
                <span
                  className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-xs font-black"
                  style={{
                    background: detalle ? (detalle.esCorrecta ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)") : "rgba(139,92,246,0.15)",
                    border: `1px solid ${detalle ? (detalle.esCorrecta ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)") : "rgba(139,92,246,0.35)"}`,
                    color: detalle ? (detalle.esCorrecta ? "#34d399" : "#f87171") : "#a78bfa",
                  }}
                >
                  {detalle ? (detalle.esCorrecta ? "✓" : "✗") : pregIdx + 1}
                </span>
                <p className="text-white font-semibold text-base leading-snug">{pregunta.pregunta}</p>
              </div>

              {/* Options */}
              <div className="space-y-2.5 ml-10">
                {pregunta.opciones.map((opcion, opIdx) => {
                  const esSeleccionada = seleccionada === opIdx;
                  const esCorrecta = opIdx === pregunta.respuestaCorrecta;

                  let bg = "rgba(255,255,255,0.03)";
                  let border = "rgba(255,255,255,0.07)";
                  let textColor = "#9ca3af";
                  let indicatorBg = "transparent";
                  let indicatorBorder = "rgba(255,255,255,0.15)";
                  let indicatorColor = "#6b7280";

                  if (detalle) {
                    if (esCorrecta) {
                      bg = "rgba(16,185,129,0.06)"; border = "rgba(16,185,129,0.4)"; textColor = "#6ee7b7";
                      indicatorBg = "rgba(16,185,129,0.2)"; indicatorBorder = "rgba(16,185,129,0.5)"; indicatorColor = "#34d399";
                    } else if (esSeleccionada) {
                      bg = "rgba(239,68,68,0.06)"; border = "rgba(239,68,68,0.35)"; textColor = "#fca5a5";
                      indicatorBg = "rgba(239,68,68,0.2)"; indicatorBorder = "rgba(239,68,68,0.5)"; indicatorColor = "#f87171";
                    } else {
                      bg = "transparent"; border = "rgba(255,255,255,0.04)"; textColor = "#4b5563";
                    }
                  } else if (esSeleccionada) {
                    bg = "rgba(139,92,246,0.08)"; border = "rgba(139,92,246,0.5)"; textColor = "#c4b5fd";
                    indicatorBg = "rgba(139,92,246,0.2)"; indicatorBorder = "rgba(139,92,246,0.6)"; indicatorColor = "#a78bfa";
                  }

                  return (
                    <button
                      key={opIdx}
                      onClick={() => handleSeleccion(pregunta.id, opIdx)}
                      disabled={!!resultado}
                      className="answer-btn w-full text-left rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-3"
                      style={{ background: bg, border: `1px solid ${border}`, color: textColor, cursor: resultado ? "default" : "pointer" }}
                    >
                      <span
                        className="shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-200"
                        style={{ background: indicatorBg, border: `2px solid ${indicatorBorder}`, color: indicatorColor }}
                      >
                        {detalle && esCorrecta ? "✓" : detalle && esSeleccionada && !esCorrecta ? "✗" : String.fromCharCode(65 + opIdx)}
                      </span>
                      {opcion}
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {detalle && (
                <div
                  className="mt-4 ml-10 rounded-xl p-3.5 text-xs anim-fade-in"
                  style={{
                    background: detalle.esCorrecta ? "rgba(16,185,129,0.05)" : "rgba(245,158,11,0.05)",
                    border: `1px solid ${detalle.esCorrecta ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)"}`,
                    color: detalle.esCorrecta ? "#6ee7b7" : "#fde68a",
                  }}
                >
                  <span className="font-bold">💡 Explicación:</span> {detalle.explicacion}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit section */}
      {!resultado && (
        <div className="mt-8 flex flex-col items-center gap-3">
          {error && (
            <div
              className="w-full rounded-xl px-4 py-3 text-sm text-center anim-bounce-in"
              style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}
            >
              {error}
            </div>
          )}
          <button
            onClick={handleSubmit}
            disabled={!todasRespondidas || enviando}
            className="btn-glow inline-flex items-center justify-center gap-2 rounded-2xl px-10 py-4 text-sm font-black text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            style={{
              background: todasRespondidas
                ? "linear-gradient(135deg, #6d28d9, #9333ea, #c026d3)"
                : "rgba(255,255,255,0.05)",
              backgroundSize: "200% 200%",
              animation: todasRespondidas ? "gradient-x 3s ease infinite" : "none",
              boxShadow: todasRespondidas ? "0 0 30px rgba(109,40,217,0.4), 0 4px 20px rgba(0,0,0,0.5)" : "none",
              border: todasRespondidas ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {enviando ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Calculando resultado…
              </>
            ) : (
              <>
                Enviar evaluación
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
          {!todasRespondidas && (
            <p className="text-xs" style={{ color: "#4b5563" }}>
              Responde todas las preguntas para continuar ({respondidas}/{total})
            </p>
          )}
        </div>
      )}
    </div>
  );
}
