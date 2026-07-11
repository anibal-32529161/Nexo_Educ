"use client";

import { useState } from "react";
import Link from "next/link";

/* ─── Types ─── */
interface UsuarioAdmin {
  id: number; nombre: string; email: string; rol: string;
  creado_en: Date; ultimo_acceso: Date | null;
  _count: { actividades: number };
}
interface ResultadoAdmin {
  id: number; usuarioId: number; usuarioNombre: string; usuarioEmail: string;
  moduloId: number | null; moduloTitulo: string;
  puntaje: number; correctas: number; total: number; fecha: Date;
}
interface ModuloStat {
  moduloId: number; moduloTitulo: string; evaluaciones: number;
  promedioScore: number; maxScore: number; minScore: number;
}
interface ActividadReciente {
  id: number; tipo: string; estado: string; usuario: string;
  fecha: Date; metadatos: Record<string, any>; puntaje: number | null;
}
interface Stats {
  totalUsuarios: number; totalEvaluaciones: number; totalLecturas: number;
  promedioGlobal: number; aprobados: number; excelentes: number;
  modulosStats: ModuloStat[];
  actividadReciente: ActividadReciente[];
}
interface Props {
  usuarios: UsuarioAdmin[]; resultados: ResultadoAdmin[];
  stats: Stats; adminId: number;
}

/* ─── Helpers ─── */
const scoreColor = (p: number) => p >= 80 ? "#34d399" : p >= 60 ? "#fbbf24" : "#f87171";
const scoreBg    = (p: number) => p >= 80 ? "rgba(16,185,129,0.1)" : p >= 60 ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)";
const scoreBdr   = (p: number) => p >= 80 ? "rgba(16,185,129,0.3)" : p >= 60 ? "rgba(245,158,11,0.3)" : "rgba(239,68,68,0.3)";

function StatCard({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className="rounded-2xl px-5 py-4 flex flex-col gap-1 anim-scale-in"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="text-2xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#4b5563" }}>{label}</p>
      {sub && <p className="text-[10px]" style={{ color: "#374151" }}>{sub}</p>}
    </div>
  );
}

/* ─── TABS ─── */
const TABS = [
  { id: "resumen",   label: "Resumen",      icon: "📊" },
  { id: "usuarios",  label: "Usuarios",     icon: "👥" },
  { id: "resultados",label: "Resultados",   icon: "📋" },
  { id: "modulos",   label: "Módulos",      icon: "📚" },
  { id: "nuevo",     label: "Nuevo Usuario",icon: "➕" },
];

export default function AdminPanel({ usuarios: usuariosInit, resultados: resultadosInit, stats, adminId }: Props) {
  const [tab, setTab] = useState("resumen");
  const [usuarios, setUsuarios] = useState(usuariosInit);
  const [resultados] = useState(resultadosInit);
  const [cargandoRol, setCargandoRol] = useState<number | null>(null);
  const [msgRol, setMsgRol] = useState<{ tipo: "ok"|"err"; texto: string } | null>(null);
  const [cargandoElim, setCargandoElim] = useState<number | null>(null);
  const [filtroResultados, setFiltroResultados] = useState("");

  /* Nuevo usuario form */
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoEmail, setNuevoEmail]   = useState("");
  const [nuevoPass,  setNuevoPass]    = useState("");
  const [nuevoRol,   setNuevoRol]     = useState<"normal"|"admin">("normal");
  const [creando, setCreando]         = useState(false);
  const [msgNuevo, setMsgNuevo]       = useState<{ tipo: "ok"|"err"; texto: string } | null>(null);

  /* ─── Actions ─── */
  const cambiarRol = async (id: number, rolActual: string) => {
    const nuevoRol = rolActual === "admin" ? "normal" : "admin";
    setCargandoRol(id); setMsgRol(null);
    const res = await fetch("/api/admin/usuarios", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, rol: nuevoRol }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsuarios((p) => p.map((u) => u.id === id ? { ...u, rol: data.usuario.rol } : u));
      setMsgRol({ tipo: "ok", texto: `Rol de ${data.usuario.nombre} → ${data.usuario.rol}` });
    } else {
      setMsgRol({ tipo: "err", texto: data.error });
    }
    setCargandoRol(null);
  };

  const eliminarUsuario = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar al usuario "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setCargandoElim(id); setMsgRol(null);
    const res = await fetch("/api/admin/usuarios", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsuarios((p) => p.filter((u) => u.id !== id));
      setMsgRol({ tipo: "ok", texto: `Usuario "${nombre}" eliminado correctamente.` });
    } else {
      setMsgRol({ tipo: "err", texto: data.error });
    }
    setCargandoElim(null);
  };

  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault(); setCreando(true); setMsgNuevo(null);
    const res = await fetch("/api/admin/usuarios", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre: nuevoNombre, email: nuevoEmail, password: nuevoPass, rol: nuevoRol }),
    });
    const data = await res.json();
    if (res.ok) {
      setMsgNuevo({ tipo: "ok", texto: `Usuario "${data.usuario.nombre}" creado exitosamente.` });
      setNuevoNombre(""); setNuevoEmail(""); setNuevoPass(""); setNuevoRol("normal");
      setUsuarios((p) => [...p, { ...data.usuario, ultimo_acceso: null, _count: { actividades: 0 } }]);
    } else {
      setMsgNuevo({ tipo: "err", texto: data.error });
    }
    setCreando(false);
  };

  const resultadosFiltrados = filtroResultados.trim()
    ? resultados.filter((r) =>
        r.usuarioNombre.toLowerCase().includes(filtroResultados.toLowerCase()) ||
        r.usuarioEmail.toLowerCase().includes(filtroResultados.toLowerCase()) ||
        r.moduloTitulo.toLowerCase().includes(filtroResultados.toLowerCase())
      )
    : resultados;

  /* ─── Render ─── */
  return (
    <div>
      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 px-1 pb-2 mb-8 scrollbar-hide"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer"
            style={{
              background: tab === t.id ? "rgba(139,92,246,0.15)" : "transparent",
              color: tab === t.id ? "#c4b5fd" : "#6b7280",
              border: tab === t.id ? "1px solid rgba(139,92,246,0.3)" : "1px solid transparent",
            }}
          >
            <span>{t.icon}</span>{t.label}
            {t.id === "usuarios"   && <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>{usuarios.length}</span>}
            {t.id === "resultados" && <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold" style={{ background: "rgba(217,70,239,0.15)", color: "#e879f9" }}>{resultados.length}</span>}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════ RESUMEN ══════════════════════════════ */}
      {tab === "resumen" && (
        <div className="space-y-8 anim-fade-up">
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard label="Usuarios" value={stats.totalUsuarios} color="#a78bfa" />
            <StatCard label="Evaluaciones" value={stats.totalEvaluaciones} color="#34d399" />
            <StatCard label="Lecturas" value={stats.totalLecturas} color="#38bdf8" />
            <StatCard label="Promedio Global" value={`${stats.promedioGlobal}%`} color={scoreColor(stats.promedioGlobal)} />
            <StatCard label="Aprobados" value={stats.aprobados} color="#fbbf24" sub="puntaje ≥ 60%" />
            <StatCard label="Perfectos" value={stats.excelentes} color="#f9a8d4" sub="puntaje = 100%" />
          </div>

          {/* Stats por módulo */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#4b5563" }}>Rendimiento por módulo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.modulosStats.length === 0 ? (
                <p className="text-sm col-span-3 text-center py-8" style={{ color: "#4b5563" }}>Aún no hay evaluaciones.</p>
              ) : stats.modulosStats.map((m) => (
                <div key={m.moduloId} className="rounded-2xl p-5 anim-fade-up"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#6b7280" }}>
                      Módulo {m.moduloId}
                    </span>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-black"
                      style={{ background: scoreBg(m.promedioScore), border: `1px solid ${scoreBdr(m.promedioScore)}`, color: scoreColor(m.promedioScore) }}>
                      {m.promedioScore}% prom.
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white mb-3">{m.moduloTitulo}</p>
                  <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700 progress-bar-fill"
                      style={{ width: `${m.promedioScore}%`, background: `linear-gradient(90deg, ${scoreColor(m.promedioScore)}, ${scoreColor(m.promedioScore)}aa)`, "--target-width": `${m.promedioScore}%` } as React.CSSProperties} />
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: "#4b5563" }}>
                    <span>{m.evaluaciones} evaluaciones</span>
                    <span>Min {m.minScore}% · Max {m.maxScore}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#4b5563" }}>Actividad reciente</h3>
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              {stats.actividadReciente.length === 0 ? (
                <p className="text-sm text-center py-8" style={{ color: "#4b5563" }}>Sin actividad aún.</p>
              ) : stats.actividadReciente.map((a, i) => (
                <div key={a.id} className="flex items-center justify-between px-5 py-3.5 gap-4 anim-fade-left"
                  style={{
                    borderBottom: i < stats.actividadReciente.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    animationDelay: `${i * 40}ms`,
                  }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg shrink-0">{a.tipo === "evaluacion" ? "📝" : "📖"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{a.usuario}</p>
                      <p className="text-xs truncate" style={{ color: "#6b7280" }}>
                        {a.tipo === "evaluacion" ? `Evaluó: ${a.metadatos?.moduloTitulo ?? "módulo"}` : `Leyó: ${a.metadatos?.moduloTitulo ?? "módulo"}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {a.puntaje !== null && (
                      <span className="text-xs font-bold rounded-full px-2.5 py-0.5"
                        style={{ background: scoreBg(a.puntaje), color: scoreColor(a.puntaje), border: `1px solid ${scoreBdr(a.puntaje)}` }}>
                        {a.puntaje}%
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "#374151" }}>
                      {new Date(a.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════ USUARIOS ══════════════════════════════ */}
      {tab === "usuarios" && (
        <div className="space-y-4 anim-fade-up">
          {msgRol && (
            <div className="rounded-xl px-4 py-2.5 text-sm anim-bounce-in"
              style={{
                background: msgRol.tipo === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${msgRol.tipo === "ok" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                color: msgRol.tipo === "ok" ? "#6ee7b7" : "#fca5a5",
              }}>
              {msgRol.tipo === "ok" ? "✓ " : "⚠ "}{msgRol.texto}
            </div>
          )}

          {/* Desktop table */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    {["Usuario", "Correo", "Rol", "Actividades", "Registrado", "Acciones"].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest ${i === 5 ? "text-right" : "text-left"}`}
                        style={{ color: "#374151" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u, idx) => (
                    <tr key={u.id} className="anim-fade-left group"
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", animationDelay: `${idx * 40}ms` }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-xs font-black text-white"
                            style={{ background: "linear-gradient(135deg, #6d28d9, #c026d3)", boxShadow: "0 0 10px rgba(109,40,217,0.35)" }}>
                            {u.nombre.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-white">{u.nombre}</span>
                          {u.id === adminId && (
                            <span className="text-[9px] font-black uppercase rounded px-1.5 py-0.5"
                              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}>Tú</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4" style={{ color: "#6b7280" }}>{u.email}</td>
                      <td className="px-5 py-4">
                        {u.rol === "admin"
                          ? <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}>Admin</span>
                          : <span className="rounded-full px-2.5 py-0.5 text-xs" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}>Estudiante</span>}
                      </td>
                      <td className="px-5 py-4 text-sm" style={{ color: "#6b7280" }}>{u._count.actividades}</td>
                      <td className="px-5 py-4 text-xs" style={{ color: "#4b5563" }}>
                        {new Date(u.creado_en).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        {u.id !== adminId ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => cambiarRol(u.id, u.rol)} disabled={cargandoRol === u.id}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-[1.03] disabled:opacity-50 cursor-pointer"
                              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                              {cargandoRol === u.id ? "…" : u.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                            </button>
                            <button onClick={() => eliminarUsuario(u.id, u.nombre)} disabled={cargandoElim === u.id}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-[1.03] disabled:opacity-50 cursor-pointer"
                              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                              {cargandoElim === u.id ? "…" : "Eliminar"}
                            </button>
                          </div>
                        ) : <span className="text-xs text-right block" style={{ color: "#374151" }}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
              {usuarios.map((u, idx) => (
                <div key={u.id} className="px-4 py-4 anim-fade-up" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: "linear-gradient(135deg,#6d28d9,#c026d3)" }}>
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{u.nombre}</p>
                        {u.id === adminId && <span className="text-[9px] font-black rounded px-1" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>Tú</span>}
                      </div>
                      <p className="text-xs truncate" style={{ color: "#6b7280" }}>{u.email}</p>
                    </div>
                  </div>
                  {u.id !== adminId && (
                    <div className="flex gap-2">
                      <button onClick={() => cambiarRol(u.id, u.rol)} disabled={cargandoRol === u.id}
                        className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                        {cargandoRol === u.id ? "…" : u.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                      </button>
                      <button onClick={() => eliminarUsuario(u.id, u.nombre)} disabled={cargandoElim === u.id}
                        className="flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer"
                        style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                        {cargandoElim === u.id ? "…" : "Eliminar"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════ RESULTADOS ══════════════════════════════ */}
      {tab === "resultados" && (
        <div className="space-y-4 anim-fade-up">
          {/* Filtro */}
          <input value={filtroResultados} onChange={(e) => setFiltroResultados(e.target.value)}
            placeholder="Buscar por estudiante o módulo…"
            className="input-glow w-full max-w-sm rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", outline: "none" }} />

          {resultadosFiltrados.length === 0 ? (
            <p className="text-center py-12 text-sm" style={{ color: "#4b5563" }}>
              {filtroResultados ? "Sin resultados para esa búsqueda." : "Aún no hay evaluaciones registradas."}
            </p>
          ) : (
            <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {["Estudiante", "Módulo", "Puntaje", "Correctas", "Fecha"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: "#374151" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {resultadosFiltrados.map((r, idx) => (
                      <tr key={r.id} className="anim-fade-left"
                        style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", animationDelay: `${idx * 30}ms` }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-white">{r.usuarioNombre}</p>
                          <p className="text-xs" style={{ color: "#6b7280" }}>{r.usuarioEmail}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="text-white">{r.moduloTitulo}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-black"
                            style={{ background: scoreBg(r.puntaje), border: `1px solid ${scoreBdr(r.puntaje)}`, color: scoreColor(r.puntaje) }}>
                            {r.puntaje}%
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{r.correctas}/{r.total}</span>
                            <div className="h-1.5 w-16 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full" style={{ width: `${r.puntaje}%`, background: scoreColor(r.puntaje) }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs" style={{ color: "#4b5563" }}>
                          {new Date(r.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════ MÓDULOS ══════════════════════════════ */}
      {tab === "modulos" && (
        <div className="anim-fade-up">
          {stats.modulosStats.length === 0 ? (
            <div className="rounded-2xl p-12 text-center" style={{ border: "1px dashed rgba(139,92,246,0.2)" }}>
              <p className="text-4xl mb-3">📚</p>
              <p className="font-bold text-white mb-1">Sin evaluaciones aún</p>
              <p className="text-sm" style={{ color: "#6b7280" }}>Las estadísticas aparecerán cuando los estudiantes completen evaluaciones.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {stats.modulosStats.map((m, idx) => {
                const color = [["#8b5cf6","rgba(139,92,246,0.15)","rgba(139,92,246,0.25)"],["#e879f9","rgba(217,70,239,0.12)","rgba(217,70,239,0.25)"],["#38bdf8","rgba(56,189,248,0.12)","rgba(56,189,248,0.25)"]][idx % 3];
                return (
                  <div key={m.moduloId} className="rounded-2xl p-6 anim-scale-in"
                    style={{ background: color[1], border: `1px solid ${color[2]}`, animationDelay: `${idx * 80}ms` }}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: color[0] }}>
                        Módulo {m.moduloId}
                      </span>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>
                        {m.evaluaciones} eval.
                      </span>
                    </div>
                    <p className="text-base font-bold text-white mb-5 leading-snug">{m.moduloTitulo}</p>

                    {/* Promedio */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5" style={{ color: "#6b7280" }}>
                        <span>Promedio</span>
                        <span style={{ color: scoreColor(m.promedioScore), fontWeight: 700 }}>{m.promedioScore}%</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full progress-bar-fill"
                          style={{ width: `${m.promedioScore}%`, background: `linear-gradient(90deg, ${color[0]}, ${scoreColor(m.promedioScore)})`, "--target-width": `${m.promedioScore}%` } as React.CSSProperties} />
                      </div>
                    </div>

                    {/* Min / Max */}
                    <div className="grid grid-cols-2 gap-3">
                      {[{label:"Mejor",val:m.maxScore},{label:"Peor",val:m.minScore}].map(({label,val})=>(
                        <div key={label} className="rounded-xl p-3 text-center" style={{ background:"rgba(255,255,255,0.04)" }}>
                          <p className="text-lg font-black" style={{ color: scoreColor(val) }}>{val}%</p>
                          <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: "#4b5563" }}>{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════ NUEVO USUARIO ══════════════════════════════ */}
      {tab === "nuevo" && (
        <div className="max-w-lg anim-fade-up">
          <div className="rounded-3xl p-7 sm:p-8"
            style={{ background: "rgba(10,10,22,0.8)", border: "1px solid rgba(139,92,246,0.2)", backdropFilter: "blur(20px)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            <h3 className="text-xl font-bold text-white mb-1">Crear nuevo usuario</h3>
            <p className="text-sm mb-6" style={{ color: "#6b7280" }}>El usuario podrá iniciar sesión de inmediato con las credenciales asignadas.</p>

            {msgNuevo && (
              <div className="rounded-xl px-4 py-3 text-sm mb-5 anim-bounce-in"
                style={{
                  background: msgNuevo.tipo === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
                  border: `1px solid ${msgNuevo.tipo === "ok" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                  color: msgNuevo.tipo === "ok" ? "#6ee7b7" : "#fca5a5",
                }}>
                {msgNuevo.tipo === "ok" ? "✓ " : "⚠ "}{msgNuevo.texto}
              </div>
            )}

            <form onSubmit={crearUsuario} className="space-y-4">
              {[
                { label: "Nombre completo", val: nuevoNombre, set: setNuevoNombre, type: "text",     ph: "Ej. María García" },
                { label: "Correo electrónico", val: nuevoEmail, set: setNuevoEmail, type: "email",    ph: "correo@ejemplo.com" },
                { label: "Contraseña",         val: nuevoPass,  set: setNuevoPass,  type: "password", ph: "Mínimo 6 caracteres" },
              ].map(({ label, val, set, type, ph }) => (
                <div key={label}>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#7c3aed" }}>{label}</label>
                  <input type={type} value={val} onChange={(e) => set(e.target.value)} placeholder={ph} required
                    className="input-glow w-full rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", outline: "none" }} />
                </div>
              ))}

              {/* Rol */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#7c3aed" }}>Rol</label>
                <div className="flex gap-3">
                  {(["normal","admin"] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setNuevoRol(r)}
                      className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer"
                      style={{
                        background: nuevoRol === r ? (r === "admin" ? "rgba(239,68,68,0.12)" : "rgba(139,92,246,0.12)") : "rgba(255,255,255,0.03)",
                        border: `1px solid ${nuevoRol === r ? (r === "admin" ? "rgba(239,68,68,0.35)" : "rgba(139,92,246,0.35)") : "rgba(255,255,255,0.07)"}`,
                        color: nuevoRol === r ? (r === "admin" ? "#f87171" : "#a78bfa") : "#6b7280",
                      }}>
                      {r === "normal" ? "Estudiante" : "Administrador"}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={creando}
                className="btn-glow w-full rounded-xl py-3.5 text-sm font-bold text-white mt-2 cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#6d28d9,#9333ea,#c026d3)", backgroundSize: "200% 200%", animation: "gradient-x 4s ease infinite", boxShadow: "0 0 24px rgba(109,40,217,0.35)" }}>
                {creando ? "Creando usuario…" : "Crear usuario"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
