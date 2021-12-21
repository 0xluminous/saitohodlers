-- CreateTable
CREATE TABLE "Hodlers" (
    "id" SERIAL NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "hodlers" INTEGER NOT NULL,

    CONSTRAINT "Hodlers_pkey" PRIMARY KEY ("id")
);
