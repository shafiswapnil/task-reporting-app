/*
  Warnings:

  - Added the required column `team` to the `Developer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Developer" ADD COLUMN     "projects" TEXT[],
ADD COLUMN     "team" TEXT NOT NULL,
ADD COLUMN     "workingDays" TEXT[];
