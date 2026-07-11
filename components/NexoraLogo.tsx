"use client";

import { useId } from "react";

interface Props {
  dark?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function NexoraLogo({ dark = false, className, style }: Props) {
  const uid = useId().replace(/:/g, "");
  const gId = `ng-${uid}`;

  /* ── palette (light / dark) ── */
  const g0   = dark ? "#1a5cbf" : "#0d2752";
  const g50  = dark ? "#0a9fd4" : "#0a5dbf";
  const g1   = dark ? "#00e5ff" : "#00c8e8";
  const txt  = dark ? "#d0eeff" : "#18273a";
  const n1o  = dark ? "#0e2462" : "#0c1e48";
  const n1i  = dark ? "#1260b8" : "#0d4a94";
  const n2o  = dark ? "#0c1c52" : "#0b1840";
  const n2i  = dark ? "#0d3d88" : "#0d3572";
  const n3o  = dark ? "#0e3678" : "#0d2e60";
  const n3i  = dark ? "#0a8fd8" : "#0a6fc4";
  const dot  = dark ? "#00d4f0" : "#0878b8";

  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id={gId} x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%"   stopColor={g0}  />
          <stop offset="42%"  stopColor={g50} />
          <stop offset="100%" stopColor={g1}  />
        </linearGradient>
      </defs>

      {/*
        ── Icon: 3 parallel bezier curves from nexora-logo.svg (320×300)
           scaled to fit 400×400 with transform translate(-5 5) scale(1.245)
           Result: icon occupies x≈40-360, y≈40-295  ──
      */}
      <g transform="translate(-5 5) scale(1.245)">
        {/* inner line */}
        <path
          d="M 67,41 C 76,132 134,206 160,207 C 188,207 244,76 260,33"
          fill="none" stroke={`url(#${gId})`}
          strokeWidth="8.5" strokeLinecap="round"
        />
        {/* middle line */}
        <path
          d="M 58,50 C 66,140 128,214 160,214 C 192,214 248,82 268,40"
          fill="none" stroke={`url(#${gId})`}
          strokeWidth="8.5" strokeLinecap="round"
        />
        {/* outer line + arrow shaft */}
        <path
          d="M 49,59 C 56,148 122,222 160,221 C 196,221 252,88 276,47 L 293,28"
          fill="none" stroke={`url(#${gId})`}
          strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round"
        />
        {/* arrow head */}
        <polyline
          points="279,18 293,28 283,42"
          fill="none" stroke={`url(#${gId})`}
          strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round"
        />

        {/* top-left node */}
        <circle cx="58"  cy="50"  r="22" fill={n1o} />
        <circle cx="58"  cy="50"  r="13" fill={n1i} />
        {/* bottom-center node */}
        <circle cx="160" cy="214" r="19" fill={n2o} />
        <circle cx="160" cy="214" r="11" fill={n2i} />
        {/* top-right node */}
        <circle cx="268" cy="40"  r="22" fill={n3o} />
        <circle cx="268" cy="40"  r="13" fill={n3i} />
        {/* center crossing dot */}
        <circle cx="160" cy="118" r="7"  fill={dot}  />
      </g>

      {/* ── Text: NEX + custom O node + RA ── */}
      <g transform="translate(0 360)">
        <text
          x="25" y="0"
          fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
          fontWeight="800" fontSize="64"
          fill={txt} letterSpacing="2"
        >NEX</text>

        {/* O styled as a circuit node */}
        <g transform="translate(205 -22)">
          <circle cx="0" cy="0" r="22" fill="none" stroke={txt} strokeWidth="9" />
          <line x1="14" y1="-14" x2="28" y2="-28" stroke={txt} strokeWidth="7" strokeLinecap="round" />
          <circle cx="28" cy="-28" r="8" fill={txt} />
        </g>

        <text
          x="245" y="0"
          fontFamily="system-ui, -apple-system, 'Arial Black', sans-serif"
          fontWeight="800" fontSize="64"
          fill={txt} letterSpacing="2"
        >RA</text>
      </g>
    </svg>
  );
}
