-- CreateTable
CREATE TABLE "Developer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "fullTime" BOOLEAN NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Developer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" SERIAL NOT NULL,
    "developerId" INTEGER NOT NULL,
    "project" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Developer_email_key" ON "Developer"("email");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
