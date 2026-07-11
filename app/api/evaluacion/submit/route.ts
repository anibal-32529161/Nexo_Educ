import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { contenidoModulos } from "@/data/contenidoModulos";

const JWT_SECRET = process.env.JWT_SECRET || "nexora_edu_super_secret_jwt_key_2026";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado." }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    const { moduloId, respuestas } = await req.json();

    if (!moduloId || !Array.isArray(respuestas)) {
      return NextResponse.json({ error: "Datos de evaluación incompletos." }, { status: 400 });
    }

    const modulo = contenidoModulos.find((m) => m.id === Number(moduloId));
    if (!modulo) {
      return NextResponse.json({ error: "Módulo no encontrado." }, { status: 404 });
    }

    // Calcular puntaje
    let correctas = 0;
    const detalles = modulo.preguntas.map((pregunta) => {
      const respuestaUsuario = respuestas.find((r: any) => r.preguntaId === pregunta.id);
      const seleccionada = respuestaUsuario?.respuesta ?? -1;
      const esCorrecta = seleccionada === pregunta.respuestaCorrecta;
      if (esCorrecta) correctas++;
      return {
        preguntaId: pregunta.id,
        pregunta: pregunta.pregunta,
        opciones: (pregunta as any).opciones ?? [],
        respuestaUsuario: seleccionada,
        respuestaCorrecta: pregunta.respuestaCorrecta,
        correcta: esCorrecta,
        explicacion: pregunta.explicacion,
      };
    });

    const total = modulo.preguntas.length;
    const puntaje = Math.round((correctas / total) * 100);

    // Guardar en la base de datos
    const actividad = await prisma.actividad.create({
      data: {
        usuario_id: decoded.id,
        tipo: "evaluacion",
        estado: "completado",
        fecha_fin: new Date(),
        metadatos: JSON.stringify({ moduloId: modulo.id, moduloTitulo: modulo.titulo }),
      },
    });

    const resultado = await prisma.resultado.create({
      data: {
        actividad_id: actividad.id,
        contenido: JSON.stringify({ puntaje, correctas, total, detalles }),
        tipo_resultado: "evaluacion_modulo",
      },
    });

    return NextResponse.json({
      success: true,
      resultado: {
        id: resultado.id,
        puntaje,
        correctas,
        total,
        detalles,
      },
    });
  } catch (error) {
    console.error("Error en submit evaluacion:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
