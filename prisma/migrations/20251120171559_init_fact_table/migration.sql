-- CreateTable
CREATE TABLE "fact_sales" (
    "id" BIGSERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "customerId" INTEGER,
    "dateKey" DATE NOT NULL,
    "timeKey" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "totalCost" DECIMAL(12,2) NOT NULL,
    "profit" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fact_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_daily_summaries" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalProfit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fact_daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fact_sales_dateKey_idx" ON "fact_sales"("dateKey");

-- CreateIndex
CREATE INDEX "fact_sales_productId_idx" ON "fact_sales"("productId");

-- CreateIndex
CREATE INDEX "fact_sales_categoryId_idx" ON "fact_sales"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "fact_daily_summaries_date_key" ON "fact_daily_summaries"("date");

-- CreateIndex
CREATE INDEX "fact_daily_summaries_date_idx" ON "fact_daily_summaries"("date");

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
