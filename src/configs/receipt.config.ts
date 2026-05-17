export const receiptConfig = {
    // ข้อมูลจดทะเบียนบริษัท/ร้านค้า
    storeName: process.env.STORE_NAME || "จัมโบ้พาณิชย์",
    storeAddress: process.env.STORE_ADDRESS || "123 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กทม. 10110",
    taxId: process.env.TAX_ID || "0105555555555", // เลขประจำตัวผู้เสียภาษี 13 หลัก
    branch: process.env.STORE_BRANCH || "สำนักงานใหญ่", // หรือ สาขาที่ 00001
    storePhone: process.env.STORE_PHONE || "080-000-0000",
    
    // ตั้งค่าภาษี
    vatRate: 7,
    
    // ข้อความในใบเสร็จ
    headerText: "ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน",
    vatIncludedText: "(ราคารวมภาษีมูลค่าเพิ่มแล้ว)",
    footerText: "ขอบคุณที่ใช้บริการ",
    
    divider: "-------------------------------------------------",

    // ตั้งค่าหน้ากระดาษ
    paper: {
        width: 226.77,
        margin: 15
    }
};