/*
  Warnings:

  - Added the required column `name` to the `monitors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "monitors" ADD COLUMN     "name" TEXT NOT NULL;
