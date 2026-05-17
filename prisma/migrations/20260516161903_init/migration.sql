-- CreateEnum
CREATE TYPE "SellType" AS ENUM ('RETAIL', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "StockType" AS ENUM ('RESTOCK', 'SALE', 'ADJUSTMENT', 'DAMAGED', 'RETURN');

-- CreateTable
CREATE TABLE "customers" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "phoneNumber" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" SERIAL NOT NULL,
    "nameTh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "categoryId" INTEGER NOT NULL,
    "baseUnitId" INTEGER NOT NULL,
    "averageCost" DECIMAL(10,7) NOT NULL DEFAULT 0,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 7.00,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_selling_units" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT,
    "productId" INTEGER NOT NULL,
    "barcode" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "multiplier" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL(10,7) NOT NULL,
    "sellType" "SellType" NOT NULL DEFAULT 'RETAIL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_selling_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_logs" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "type" "StockType" NOT NULL,
    "costPrice" DECIMAL(10,7),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "orderNo" TEXT NOT NULL,
    "customerId" INTEGER,
    "totalAmount" DECIMAL(10,7) NOT NULL,
    "paymentMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "sellingUnitId" INTEGER,
    "productName" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "unitNameEn" TEXT,
    "imageUrl" TEXT,
    "sellType" "SellType" NOT NULL DEFAULT 'RETAIL',
    "quantity" INTEGER NOT NULL,
    "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 7.00,
    "priceAtSale" DECIMAL(10,7) NOT NULL,
    "costAtSale" DECIMAL(10,7) NOT NULL,
    "multiplierAtSale" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_sales" (
    "id" BIGSERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "customerId" INTEGER,
    "dateKey" DATE NOT NULL,
    "timeKey" TIMESTAMP(3) NOT NULL,
    "sellType" "SellType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "baseUnitQuantity" INTEGER NOT NULL,
    "totalPrice" DECIMAL(12,7) NOT NULL,
    "totalCost" DECIMAL(12,7) NOT NULL,
    "profit" DECIMAL(12,7) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fact_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fact_daily_summaries" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "totalOrders" INTEGER NOT NULL DEFAULT 0,
    "totalSales" DECIMAL(12,7) NOT NULL DEFAULT 0,
    "totalCost" DECIMAL(12,7) NOT NULL DEFAULT 0,
    "totalProfit" DECIMAL(12,7) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fact_daily_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "customers_phoneNumber_key" ON "customers"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nameTh_key" ON "categories"("nameTh");

-- CreateIndex
CREATE UNIQUE INDEX "categories_nameEn_key" ON "categories"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "units_nameTh_key" ON "units"("nameTh");

-- CreateIndex
CREATE UNIQUE INDEX "units_nameEn_key" ON "units"("nameEn");

-- CreateIndex
CREATE UNIQUE INDEX "product_selling_units_barcode_key" ON "product_selling_units"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNo_key" ON "orders"("orderNo");

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
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_baseUnitId_fkey" FOREIGN KEY ("baseUnitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_selling_units" ADD CONSTRAINT "product_selling_units_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_selling_units" ADD CONSTRAINT "product_selling_units_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_logs" ADD CONSTRAINT "stock_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sellingUnitId_fkey" FOREIGN KEY ("sellingUnitId") REFERENCES "product_selling_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sales" ADD CONSTRAINT "fact_sales_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
