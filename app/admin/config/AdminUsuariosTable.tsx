"use client";

import { useState } from "react";

interface UsuarioAdmin {
  id: number; nombre: string; email: string; rol: string;
  creado_en: Date; ultimo_acceso: Date | null;
  _count: { actividades: number };
}

interface Props { usuarios: UsuarioAdmin[]; adminId: number; }

export default function AdminUsuariosTable({ usuarios: init, adminId }: Props) {
  const [usuarios, setUsuarios] = useState(init);
  const [cargando, setCargando] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);
  const cambiarRol = async (id: number, rolActual: string) => {
    const nuevoRol = rolActual === "admin" ? "normal" : "admin";
    setCargando(id); setMensaje(null);
    try {
      const res = await fetch("/api/admin/usuarios", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rol: nuevoRol }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, rol: data.usuario.rol } : u));
        setMensaje({ tipo: "ok", texto: `Rol de ${data.usuario.nombre} actualizado a ${data.usuario.rol}.` });
      } else {
        setMensaje({ tipo: "err", texto: data.error || "Error al actualizar rol." });
      }
    } catch {
      setMensaje({ tipo: "err", texto: "Error de conexión." });
    } finally { setCargando(null); }
  };

  return (
    <div>
      {mensaje && (
        <div
          className="mx-5 mt-4 rounded-xl px-4 py-2.5 text-sm anim-bounce-in"
          style={{
            background: mensaje.tipo === "ok" ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${mensaje.tipo === "ok" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
            color: mensaje.tipo === "ok" ? "#6ee7b7" : "#fca5a5",
          }}
        >
          {mensaje.tipo === "ok" ? "✓ " : "⚠ "}{mensaje.texto}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {["Usuario", "Correo", "Rol", "Actividades", "Registrado", ""].map((h) => (
                <th
                  key={h}
                  className={`px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest ${h === "" ? "text-right" : ""}`}
                  style={{ color: "#4b5563" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, idx) => (
              <tr
                key={u.id}
                className="group transition-colors duration-150 anim-fade-left"
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  animationDelay: `${idx * 50}ms`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {/* Name */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-xs font-black text-white"
                      style={{ background: "linear-gradient(135deg, #6d28d9, #c026d3)", boxShadow: "0 0 10px rgba(109,40,217,0.4)" }}
                    >
                      {u.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-white">{u.nombre}</span>
                    {u.id === adminId && (
                      <span
                        className="text-[9px] font-black uppercase tracking-wider rounded px-1.5 py-0.5"
                        style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", color: "#a78bfa" }}
                      >
                        Tú
                      </span>
                    )}
                  </div>
                </td>
                {/* Email */}
                <td className="px-6 py-4 text-sm" style={{ color: "#6b7280" }}>{u.email}</td>
                {/* Rol */}
                <td className="px-6 py-4">
                  {u.rol === "admin" ? (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171" }}
                    >
                      Admin
                    </span>
                  ) : (
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#6b7280" }}
                    >
                      Estudiante
                    </span>
                  )}
                </td>
                {/* Count */}
                <td className="px-6 py-4 text-sm" style={{ color: "#6b7280" }}>{u._count.actividades}</td>
                {/* Date */}
                <td className="px-6 py-4 text-xs" style={{ color: "#4b5563" }}>
                  {new Date(u.creado_en).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                </td>
                {/* Action */}
                <td className="px-6 py-4 text-right">
                  {u.id !== adminId ? (
                    <button
                      onClick={() => cambiarRol(u.id, u.rol)}
                      disabled={cargando === u.id}
                      className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#9ca3af",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color = u.rol === "admin" ? "#f87171" : "#34d399";
                        (e.currentTarget as HTMLElement).style.borderColor = u.rol === "admin" ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = "#9ca3af";
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                      }}
                    >
                      {cargando === u.id ? (
                        <span className="inline-block h-3 w-3 rounded-full border-2 border-t-transparent" style={{ borderColor: "rgba(255,255,255,0.2)", borderTopColor: "white", animation: "spin 0.7s linear infinite" }} />
                      ) : u.rol === "admin" ? "Quitar admin" : "Hacer admin"}
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: "#374151" }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {usuarios.map((u, idx) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-3 px-4 py-4 anim-fade-up"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="h-9 w-9 shrink-0 flex items-center justify-center rounded-full text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg, #6d28d9, #c026d3)" }}
              >
                {u.nombre.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-white truncate">{u.nombre}</p>
                  {u.id === adminId && (
                    <span className="text-[9px] font-black uppercase rounded px-1 shrink-0" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>Tú</span>
                  )}
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: "#6b7280" }}>{u.email}</p>
                <div className="mt-1">
                  {u.rol === "admin" ? (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#f87171" }}>Admin</span>
                  ) : (
                    <span className="rounded-full px-2 py-0.5 text-[10px]" style={{ background: "rgba(255,255,255,0.05)", color: "#6b7280" }}>Estudiante</span>
                  )}
                </div>
              </div>
            </div>
            {u.id !== adminId && (
              <button
                onClick={() => cambiarRol(u.id, u.rol)}
                disabled={cargando === u.id}
                className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}
              >
                {cargando === u.id ? "…" : u.rol === "admin" ? "Quitar admin" : "Hacer admin"}
              </button>
            )}
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
