/*
  Warnings:

  - You are about to drop the column `targetGroup` on the `Form` table. All the data in the column will be lost.
  - You are about to alter the column `defaultPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - A unique constraint covering the columns `[orderToken]` on the table `Member` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "iban" TEXT;

-- AlterTable
ALTER TABLE "FittingDay" ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetGroups" TEXT[];

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "targetGroup",
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "targetGroups" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "FormItem" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "includedInBasicCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fittingDayId" TEXT,
ADD COLUMN     "orderToken" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "defaultPrice" SET DATA TYPE DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "Member_orderToken_key" ON "Member"("orderToken");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_fittingDayId_fkey" FOREIGN KEY ("fittingDayId") REFERENCES "FittingDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
