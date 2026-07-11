"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import bgDark  from "./bg.jpg";
import bgLight from "./1.png";

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedInput, setFocusedInput] = useState<"email"|"password"|null>(null);
  const router = useRouter();

  const dark = theme === "dark";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) { setError("Por favor, completa todos los campos."); return; }
    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.success) { setError(result.error || "Ocurrió un error inesperado."); setIsSubmitting(false); }
    } catch {
      setError("Error de conexión con el servidor.");
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-12 w-12 rounded-full border-4 border-t-transparent"
            style={{
              borderColor: dark ? "rgba(139,92,246,0.3)" : "rgba(13,92,168,0.25)",
              borderTopColor: dark ? "#8b5cf6" : "#0d5ca8",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <p className="text-sm font-medium" style={{ color: dark ? "#7c3aed" : "#0d5ca8" }}>Verificando sesión…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Derived palette ── */
  const c = {
    cardBg:      dark ? "rgba(4,7,20,0.82)" : "rgba(255,255,255,0.88)",
    cardBorder:  dark ? "rgba(0,200,232,0.18)" : "rgba(255,255,255,0.35)",
    cardShadow:  dark
      ? "0 0 0 1px rgba(0,200,232,0.06) inset, 0 30px 60px rgba(0,0,0,0.65), 0 0 60px rgba(0,180,220,0.1)"
      : "0 0 0 1px rgba(255,255,255,0.6) inset, 0 20px 50px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)",
    labelColor:  dark ? "#7c3aed" : "#0d5ca8",
    inputBg:     dark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)",
    inputBorder: dark ? "rgba(255,255,255,0.08)" : "rgba(13,44,82,0.15)",
    inputText:   dark ? "white" : "#0d2752",
    inputPlaceholder: dark ? "#52525b" : "#9ca3af",
    btnGrad:     dark
      ? "linear-gradient(135deg, #6d28d9 0%, #9333ea 50%, #c026d3 100%)"
      : "linear-gradient(135deg, #0d4a9e 0%, #0d5ca8 50%, #0a9fd4 100%)",
    btnShadow:   dark
      ? "0 0 30px rgba(109,40,217,0.4), 0 4px 15px rgba(0,0,0,0.4)"
      : "0 0 20px rgba(13,92,168,0.3), 0 4px 15px rgba(0,0,0,0.15)",
    footerText:  dark ? "#374151" : "#9ca3af",
    toggleBg:    dark ? "rgba(255,255,255,0.06)" : "rgba(13,44,82,0.05)",
    toggleBorder: dark ? "rgba(255,255,255,0.1)" : "rgba(13,44,82,0.12)",
    toggleColor: dark ? "#a78bfa" : "#0d5ca8",
  };

  return (
    <div
      className="relative flex flex-1 items-center justify-start min-h-screen pl-12 pr-4 overflow-hidden"
      style={{
        backgroundImage: `url(${dark ? bgDark.src : bgLight.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* dark overlay sobre la imagen */}
      <div
        className="absolute inset-0 -z-20 pointer-events-none"
        style={{ background: dark ? "rgba(2,5,18,0.55)" : "rgba(240,245,255,0.15)" }}
      />

      {/* ── Login-page orbs ── */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none -z-10"
        style={{
          top: "-200px", left: "-200px",
          background: dark
            ? "radial-gradient(circle, rgba(109,40,217,0.2) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(13,92,168,0.12) 0%, transparent 65%)",
          filter: "blur(60px)",
          animation: "orb-drift 14s ease-in-out infinite",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -z-10"
        style={{
          bottom: "-150px", right: "-100px",
          background: dark
            ? "radial-gradient(circle, rgba(192,38,211,0.15) 0%, transparent 65%)"
            : "radial-gradient(circle, rgba(0,180,216,0.1) 0%, transparent 65%)",
          filter: "blur(60px)",
          animation: "orb-drift 18s ease-in-out infinite 5s",
        }}
      />

      {/* ── Partículas flotantes ── */}
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute rounded-full pointer-events-none" style={{
          width:  `${2 + (i % 3)}px`,
          height: `${2 + (i % 3)}px`,
          left:   `${5 + i * 8}%`,
          bottom: `-10px`,
          background: dark
            ? `rgba(0,${180 + i * 5},232,${0.4 + (i % 3) * 0.15})`
            : `rgba(13,${60 + i * 8},168,${0.25 + (i % 3) * 0.1})`,
          animation: `particleRise ${5 + i * 0.6}s ease-in-out infinite`,
          animationDelay: `${i * 0.55}s`,
        }}/>
      ))}

      {/* ── Theme toggle (top-right) ── */}
      <button
        onClick={toggleTheme}
        title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        className="absolute top-5 right-5 flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-300 active:scale-90 cursor-pointer z-10"
        style={{ background: c.toggleBg, border: `1px solid ${c.toggleBorder}`, color: c.toggleColor }}
      >
        {dark ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="4"/>
            <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>

      <div
        className={`w-full max-w-md transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
      >



        {/* ── Card ── */}
        <div className="relative" style={{ animation: "slideInLeft 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}>
          {/* Anillo de glow pulsante (solo dark) */}
          {dark && (
            <div className="absolute -inset-[1px] rounded-[25px] pointer-events-none" style={{
              background: "linear-gradient(135deg, rgba(0,200,232,0.45), rgba(109,40,217,0.35), rgba(0,200,232,0.45))",
              animation: "glowRing 3.5s ease-in-out infinite",
              filter: "blur(1px)",
            }}/>
          )}

          <div
            className="relative rounded-3xl p-8"
            style={{
              background: c.cardBg,
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: `1px solid ${c.cardBorder}`,
              boxShadow: c.cardShadow,
              transition: "background 0.35s ease, border-color 0.35s ease",
            }}
          >
            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* Error */}
              {error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm"
                  style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
                    color: "#fca5a5", animation: "bounceIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
                  }}
                >
                  <span className="font-semibold">⚠ </span>{error}
                </div>
              )}

              {/* Email */}
              <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.25s both" }}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: c.labelColor }}>
                  Correo Electrónico
                </label>
                <input
                  type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@nexora.com"
                  className="block w-full rounded-xl px-4 py-3 text-sm placeholder-zinc-500"
                  onFocus={() => setFocusedInput("email")}
                  onBlur={()  => setFocusedInput(null)}
                  style={{
                    background:  c.inputBg,
                    border: focusedInput === "email"
                      ? `1px solid ${dark ? "rgba(0,200,232,0.55)" : "rgba(13,92,168,0.45)"}`
                      : `1px solid ${c.inputBorder}`,
                    boxShadow: focusedInput === "email"
                      ? dark
                        ? "0 0 0 3px rgba(0,200,232,0.12), 0 0 20px rgba(0,200,232,0.1)"
                        : "0 0 0 3px rgba(13,92,168,0.1), 0 0 15px rgba(13,92,168,0.08)"
                      : "none",
                    color: c.inputText,
                    outline: "none",
                    transition: "border-color 0.25s ease, box-shadow 0.25s ease, background 0.35s ease",
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both" }}>
                <label className="block text-xs font-bold uppercase tracking-widest mb-2" style={{ color: c.labelColor }}>
                  Contraseña
                </label>
                <input
                  type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-xl px-4 py-3 text-sm placeholder-zinc-500"
                  onFocus={() => setFocusedInput("password")}
                  onBlur={()  => setFocusedInput(null)}
                  style={{
                    background: c.inputBg,
                    border: focusedInput === "password"
                      ? `1px solid ${dark ? "rgba(0,200,232,0.55)" : "rgba(13,92,168,0.45)"}`
                      : `1px solid ${c.inputBorder}`,
                    boxShadow: focusedInput === "password"
                      ? dark
                        ? "0 0 0 3px rgba(0,200,232,0.12), 0 0 20px rgba(0,200,232,0.1)"
                        : "0 0 0 3px rgba(13,92,168,0.1), 0 0 15px rgba(13,92,168,0.08)"
                      : "none",
                    color: c.inputText,
                    outline: "none",
                    transition: "border-color 0.25s ease, box-shadow 0.25s ease, background 0.35s ease",
                  }}
                />
              </div>

              {/* Submit */}
              <div style={{ animation: "fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.55s both" }}>
                <button
                  type="submit" disabled={isSubmitting}
                  className="relative w-full rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
                  style={{
                    background: c.btnGrad,
                    backgroundSize: "200% 200%",
                    animation: "gradient-x 4s ease infinite",
                    boxShadow: c.btnShadow,
                    transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.025)";
                      (e.currentTarget as HTMLElement).style.boxShadow = dark
                        ? "0 0 45px rgba(109,40,217,0.6), 0 8px 25px rgba(0,0,0,0.5)"
                        : "0 0 35px rgba(13,92,168,0.45), 0 8px 25px rgba(0,0,0,0.2)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLElement).style.boxShadow = c.btnShadow;
                  }}
                >
                  {/* Shine sweep en hover */}
                  <span className="absolute inset-0 pointer-events-none" style={{
                    background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
                    animation: "btnShine 3s ease-in-out infinite",
                  }}/>
                  {isSubmitting ? (
                    <span className="relative flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 rounded-full border-2 border-t-transparent"
                        style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white", animation: "spin 0.8s linear infinite" }} />
                      Ingresando…
                    </span>
                  ) : (
                    <span className="relative flex items-center justify-center gap-2">
                      Iniciar Sesión
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs anim-fade-in delay-500" style={{ color: c.footerText }}>
          Plataforma educativa · Nexora Edu © 2026
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes nxEntrance {
          from { opacity: 0; transform: translateY(28px) scale(0.88); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes nxFloat {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-9px); }
        }
        @keyframes nxGlow {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(0,200,232,0.55))
                             drop-shadow(0 0 40px rgba(0,200,232,0.18)); }
          50%       { filter: drop-shadow(0 0 34px rgba(0,232,255,0.9))
                             drop-shadow(0 0 70px rgba(0,200,232,0.38)); }
        }
        @keyframes nxHalo {
          0%, 100% { opacity: 0.6; transform: translate(-50%,-50%) scale(1);    }
          50%       { opacity: 1;   transform: translate(-50%,-50%) scale(1.15); }
        }
        @keyframes nxTextGlow {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(0,200,232,0.65))
                             drop-shadow(0 0 45px rgba(0,200,232,0.22)); }
          50%       { filter: drop-shadow(0 0 32px rgba(0,230,255,0.95))
                             drop-shadow(0 0 80px rgba(0,200,232,0.48)); }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0,0) scale(1); }
          33%       { transform: translate(40px,-30px) scale(1.06); }
          66%       { transform: translate(-20px,25px) scale(0.96); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-48px) scale(0.97); }
          to   { opacity: 1; transform: translateX(0)     scale(1);    }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes glowRing {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.9;  }
        }
        @keyframes particleRise {
          0%   { opacity: 0;   transform: translateY(0)     scale(0.5); }
          15%  { opacity: 0.7; transform: translateY(-30px) scale(1);   }
          85%  { opacity: 0.3; transform: translateY(-110px) scale(0.8);}
          100% { opacity: 0;   transform: translateY(-140px) scale(0.4);}
        }
        @keyframes btnShine {
          0%   { transform: translateX(-120%); }
          60%  { transform: translateX(-120%); }
          80%  { transform: translateX(220%);  }
          100% { transform: translateX(220%);  }
        }
        @keyframes bounceIn {
          0%   { opacity: 0; transform: scale(0.85) translateY(-8px); }
          60%  { transform: scale(1.03); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%;   }
          50%       { background-position: 100% 50%; }
        }
      `}</style>
    </div>
  );
}
