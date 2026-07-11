"use client";

import { useEffect } from "react";

interface Props {
  moduloId: number;
  moduloTitulo: string;
}

export default function LecturaTracker({ moduloId, moduloTitulo }: Props) {
  useEffect(() => {
    fetch("/api/actividad/lectura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduloId, moduloTitulo }),
    }).catch(() => {});
  }, [moduloId, moduloTitulo]);

  return null;
}
