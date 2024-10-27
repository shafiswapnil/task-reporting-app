/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('Completed', 'Unfinished', 'Pending', 'Dependent', 'PartiallyCompleted');

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'Pending';

-- CreateIndex
CREATE INDEX "Task_developerId_idx" ON "Task"("developerId");
