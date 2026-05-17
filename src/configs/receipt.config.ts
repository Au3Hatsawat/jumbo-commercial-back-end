export const receiptConfig = {
    storeName: process.env.STORE_NAME || "จัมโบ้พาณิชย์",
    storeAddress: process.env.STORE_ADDRESS || "",
    taxId: process.env.TAX_ID || "",
    branch: process.env.STORE_BRANCH || "",
    storePhone: process.env.STORE_PHONE || "",
    
    vatRate: process.env.VAT_RATE || 7,
    
    headerText: "ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน",
    vatIncludedText: "(ราคารวมภาษีมูลค่าเพิ่มแล้ว)",
    footerText: "ขอบคุณที่ใช้บริการ",
    
    divider: "-------------------------------------------------",

    paper: {
        width: 226.77,
        margin: 15
    }
};