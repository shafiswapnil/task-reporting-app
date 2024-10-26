/*
  Warnings:

  - You are about to drop the column `target` on the `Task` table. All the data in the column will be lost.
  - Added the required column `role` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetsAchieved` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `targetsGiven` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "target",
ADD COLUMN     "role" TEXT NOT NULL,
ADD COLUMN     "targetsAchieved" TEXT NOT NULL,
ADD COLUMN     "targetsGiven" TEXT NOT NULL,
ADD COLUMN     "team" TEXT NOT NULL;
