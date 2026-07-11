-- CreateTable
CREATE TABLE "usuarios" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contrasena_hash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimo_acceso" DATETIME
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "fecha_inicio" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_fin" DATETIME,
    "metadatos" TEXT,
    CONSTRAINT "actividades_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "historial_actividades" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actividad_id" INTEGER NOT NULL,
    "estado_anterior" TEXT NOT NULL,
    "estado_nuevo" TEXT NOT NULL,
    "mensaje" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "historial_actividades_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sesiones" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuario_id" INTEGER NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "user_agent" TEXT,
    "ip_address" TEXT,
    "creado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expira_en" DATETIME NOT NULL,
    "revocada" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "sesiones_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "resultados" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "actividad_id" INTEGER NOT NULL,
    "contenido" TEXT NOT NULL,
    "tipo_resultado" TEXT NOT NULL,
    "generado_en" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resultados_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sesiones_refresh_token_key" ON "sesiones"("refresh_token");
