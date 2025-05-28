-- CreateTable
CREATE TABLE "medicos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "especialidade" TEXT NOT NULL,
    "crm" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medicos_crm_key" ON "medicos"("crm");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_email_key" ON "medicos"("email");
