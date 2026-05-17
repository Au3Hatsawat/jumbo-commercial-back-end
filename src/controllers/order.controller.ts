import { NextFunction, Request, Response } from "express";
import { ICreateOrderDto } from "../types/order.type";
import { orderService } from "../services/order.service";
import path from "path";
import PDFDocument from "pdfkit";
import { receiptConfig } from "../configs/receipt.config";

export const createOrderController = async (
    req: Request<{}, {}, ICreateOrderDto>,
    res: Response,
    next: NextFunction
) => {
    const orderData: ICreateOrderDto = req.body;
    const newOrder = await orderService.createOrder(orderData);
    res.status(201).json(newOrder);
};

export const getAllOrderController = async (req: Request, res: Response, next: NextFunction) => {
    const orders = await orderService.getAllOrder();
    res.status(200).json(orders);
}

export const exportOrdersExcelController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { startDate, endDate } = req.query;

    const buffer = await orderService.exportOrdersToExcel(
        startDate as string,
        endDate as string
    );

    const fileName = `orders_export_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);

    res.send(buffer);
};

export const generateReceiptController = async (
    req: Request,
    res: Response
) => {
    const orderId = parseInt(req.params.id);

    const order = await orderService.getOrderById(orderId);

    const baseHeight = 440;
    const itemHeight = 40;
    const dynamicHeight = baseHeight + (order.items.length * itemHeight);

    const doc = new PDFDocument({
        margins: { top: 15, bottom: 5, left: 15, right: 15 },
        size: [226.77, dynamicHeight],
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=receipt-${order.orderNo}.pdf`);

    doc.pipe(res);

    const fontPath = path.join(__dirname, '../assets/fonts/THSarabunNew.ttf');
    const boldFontPath = path.join(__dirname, '../assets/fonts/THSarabunNew-Bold.ttf');

    doc.registerFont('ThaiFont', fontPath);
    doc.registerFont('ThaiFontBold', boldFontPath);
    doc.font('ThaiFont');

    doc.font('ThaiFontBold').fontSize(16).text(receiptConfig.headerText, { align: "center" });
    doc.font('ThaiFontBold').fontSize(14).text(receiptConfig.storeName, { align: "center" });

    doc.font('ThaiFont').fontSize(12);
    doc.text(receiptConfig.storeAddress, { align: "center" });
    doc.text(`เลขประจำตัวผู้เสียภาษี: ${receiptConfig.taxId}`, { align: "center" });
    doc.text(`(${receiptConfig.branch}) โทร. ${receiptConfig.storePhone}`, { align: "center" });

    doc.moveDown(0.5);
    doc.text(receiptConfig.vatIncludedText, { align: "center" });
    doc.moveDown(0.5);

    
    doc.fontSize(12);
    doc.text(`เลขที่บิล: ${order.orderNo}`);
    doc.text(`วันที่: ${order.createdAt.toLocaleString('th-TH')}`);

    const customerDisplay = order.customer ? (order.customer.name || order.customer.phoneNumber) : 'ทั่วไป';
    doc.text(`ลูกค้า: ${customerDisplay}`);

    doc.moveDown(0.5);
    doc.text(receiptConfig.divider, { align: "center" });
    doc.moveDown(0.5);

    order.items.forEach(item => {
        const itemTotal = (Number(item.priceAtSale) * item.quantity).toFixed(2);

        doc.text(item.productName, { align: 'left', continued: false });
        doc.text(`${item.quantity} x ฿${Number(item.priceAtSale).toFixed(2)}`, { align: 'left', continued: true });
        doc.text(`฿${itemTotal}`, { align: 'right' });
    });

    doc.moveDown(0.5);
    doc.text(receiptConfig.divider, { align: "center" });
    doc.moveDown(0.5);

    const totalAmount = Number(order.totalAmount);
    const vatRate = receiptConfig.vatRate;

    const vatAmount = (totalAmount * vatRate) / (100 + vatRate);
    const beforeVatAmount = totalAmount - vatAmount;

    doc.font('ThaiFont').fontSize(12);
    doc.text("มูลค่าสินค้ายกเว้นภาษี / ก่อนภาษี", { align: "left", continued: true });
    doc.text(`฿${beforeVatAmount.toFixed(2)}`, { align: "right" });

    doc.text(`ภาษีมูลค่าเพิ่ม (VAT ${vatRate}%)`, { align: "left", continued: true });
    doc.text(`฿${vatAmount.toFixed(2)}`, { align: "right" });

    doc.moveDown(0.2);

    doc.font('ThaiFontBold').fontSize(14);
    doc.text("ยอดรวมสุทธิ", { align: "left", continued: true });
    doc.text(`฿${totalAmount.toFixed(2)}`, { align: "right" });

    doc.font('ThaiFont').fontSize(12);
    doc.moveDown(0.5);
    doc.text(`รับเงินโดย: ${order.paymentMethod || 'เงินสด'}`, { align: "right" });

    doc.moveDown(2);
    doc.font('ThaiFontBold').text(receiptConfig.footerText, { align: "center" });

    doc.end();
};