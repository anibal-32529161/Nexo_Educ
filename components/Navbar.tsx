"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const dark = theme === "dark";

  if (!user || pathname === "/login") return null;

  const navLinks = [
    { href: "/dashboard",  label: "Dashboard"  },
    { href: "/modulos",    label: "Módulos"    },
    { href: "/resultados", label: "Resultados" },
    { href: "/perfil",     label: "Mi Perfil"  },
    ...(user.rol === "admin" ? [{ href: "/admin/config", label: "Admin" }] : []),
  ];

  /* ── derived palette ── */
  const nav = {
    bg:     dark ? "rgba(5,5,15,0.78)"           : "rgba(255,255,255,0.88)",
    border: dark ? "rgba(139,92,246,0.12)"        : "rgba(13,44,82,0.1)",
    shadow: dark
      ? "0 1px 0 rgba(139,92,246,0.08), 0 4px 20px rgba(0,0,0,0.4)"
      : "0 1px 0 rgba(13,44,82,0.06), 0 4px 20px rgba(13,44,82,0.06)",
    linkDefault: dark ? "#9ca3af" : "#4b5563",
    linkActive:  dark ? "#c4b5fd" : "#0d5ca8",
    linkActiveBg: dark ? "rgba(139,92,246,0.1)" : "rgba(13,92,168,0.08)",
    linkUnderline: dark
      ? "linear-gradient(90deg,#8b5cf6,#d946ef)"
      : "linear-gradient(90deg,#0d5ca8,#00c8e8)",
    brand: dark ? "#c4b5fd" : "#0d5ca8",
    iconGradFrom: dark ? "#1a5cbf" : "#0d2752",
    iconGradTo:   "#00c8e8",
    pillBg:    dark ? "rgba(139,92,246,0.15)" : "rgba(13,92,168,0.1)",
    pillBorder: dark ? "rgba(139,92,246,0.3)" : "rgba(13,92,168,0.25)",
    pillText:  dark ? "#a78bfa"               : "#0d5ca8",
    avatarBg:  dark ? "linear-gradient(135deg,#7c3aed,#c026d3)" : "linear-gradient(135deg,#0d5ca8,#00c8e8)",
    nameColor: dark ? "#e2e8f0" : "#0d2752",
    roleColor: dark ? "#71717a" : "#6b7280",
    logoutBg:    dark ? "rgba(255,255,255,0.04)"  : "rgba(13,44,82,0.04)",
    logoutBorder: dark ? "rgba(255,255,255,0.08)" : "rgba(13,44,82,0.1)",
    logoutColor: dark ? "#9ca3af" : "#4b5563",
    toggleBg:    dark ? "rgba(255,255,255,0.06)"  : "rgba(13,44,82,0.06)",
    toggleBorder: dark ? "rgba(255,255,255,0.1)"  : "rgba(13,44,82,0.12)",
    toggleColor: dark ? "#a78bfa" : "#0d5ca8",
    mobileBorder: dark ? "rgba(139,92,246,0.1)" : "rgba(13,44,82,0.08)",
    mobileLinkDefault: dark ? "#6b7280" : "#4b5563",
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: nav.bg,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
        borderBottom: `1px solid ${nav.border}`,
        boxShadow: nav.shadow,
        transition: "background 0.35s ease, border-color 0.35s ease",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Brand ── */}
          <Link href="/dashboard" className="flex items-center gap-1.5 group">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider"
              style={{ background: nav.pillBg, border: `1px solid ${nav.pillBorder}`, color: nav.pillText }}
            >
              EDU
            </span>
          </Link>

          {/* ── Desktop links ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                  style={{
                    color: isActive ? nav.linkActive : nav.linkDefault,
                    background: isActive ? nav.linkActiveBg : "transparent",
                  }}
                  onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = dark ? "#e4e4f0" : "#0d2752"; }}
                  onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.color = nav.linkDefault; }}
                >
                  {label}
                  {isActive && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 rounded-full"
                      style={{ width: "60%", background: nav.linkUnderline, boxShadow: dark ? "0 0 8px rgba(139,92,246,0.6)" : "0 0 6px rgba(13,92,168,0.35)" }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* ── Right: toggle + user + logout ── */}
          <div className="flex items-center gap-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-300 active:scale-90 cursor-pointer"
              style={{
                background: nav.toggleBg,
                border: `1px solid ${nav.toggleBorder}`,
                color: nav.toggleColor,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = dark ? "rgba(139,92,246,0.12)" : "rgba(13,92,168,0.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = nav.toggleBg; }}
            >
              {dark ? (
                /* Sun icon */
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                /* Moon icon */
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>

            {/* User info */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-semibold leading-none" style={{ color: nav.nameColor }}>{user.nombre}</p>
                <p className="text-[10px] mt-0.5 font-mono tracking-wider uppercase" style={{ color: user.rol === "admin" ? "#f87171" : nav.roleColor }}>
                  {user.rol === "admin" ? "Admin" : "Estudiante"}
                </p>
              </div>
              <div
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white select-none"
                style={{ background: nav.avatarBg, boxShadow: dark ? "0 0 0 2px rgba(139,92,246,0.3), 0 0 16px rgba(139,92,246,0.3)" : "0 0 0 2px rgba(13,92,168,0.25), 0 0 12px rgba(13,92,168,0.15)" }}
              >
                {user.nombre.charAt(0).toUpperCase()}
                <span
                  className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2"
                  style={{ background: "#10b981", borderColor: dark ? "var(--bg-base)" : "#ffffff", boxShadow: "0 0 6px rgba(16,185,129,0.6)" }}
                />
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 active:scale-95 cursor-pointer"
              style={{ background: nav.logoutBg, border: `1px solid ${nav.logoutBorder}`, color: nav.logoutColor }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "#f87171";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = nav.logoutColor;
                (e.currentTarget as HTMLElement).style.borderColor = nav.logoutBorder;
                (e.currentTarget as HTMLElement).style.background = nav.logoutBg;
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              Salir
            </button>
          </div>
        </div>

        {/* ── Mobile nav ── */}
        <div className="flex md:hidden border-t py-2 gap-1 justify-around" style={{ borderColor: nav.mobileBorder }}>
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="relative flex-1 text-center px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  color: isActive ? nav.linkActive : nav.mobileLinkDefault,
                  background: isActive ? nav.linkActiveBg : "transparent",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
