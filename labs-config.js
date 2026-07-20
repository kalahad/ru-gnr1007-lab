/*
 * GNR 1007 Interactive Lab — ไฟล์ตั้งค่ากลาง (Single Source of Truth)
 * ------------------------------------------------------------------
 * ไฟล์นี้ถูกโหลดโดยทั้ง index.html และ sim_*.html ทุกไฟล์ เพื่อกำหนดว่า
 * ห้องทดลองใด "เปิด/ปิด" และ "ล็อกด้วยรหัส" หรือไม่
 *
 * วิธีทำให้การเปลี่ยนแปลงมีผลกับผู้เข้าชม "ทุกคน" บน GitHub Pages:
 *   1) แก้ไขค่าด้านล่างโดยตรง (หรือใช้แผงควบคุมผู้ดูแลในหน้า index.html
 *      แล้วกด "คัดลอกโค้ด" มาวางแทนที่ทั้งไฟล์นี้)
 *   2) commit + push ไฟล์นี้ขึ้น GitHub
 *   3) รอ GitHub Pages deploy ใหม่ (ปกติไม่กี่นาที) แล้วจะมีผลกับทุกคนทันที
 *
 * หมายเหตุด้านความปลอดภัย: เว็บนี้เป็น Static Site (ไม่มีเซิร์ฟเวอร์) รหัสผ่าน
 * และรหัสปลดล็อกทั้งหมดจึงเป็นการ "กันคนทั่วไปแบบไม่เป็นทางการ" เท่านั้น
 * ผู้ที่มีความรู้ด้านเทคนิคสามารถดู source code แล้วเห็นรหัสได้ - ไม่เหมาะกับ
 * ข้อมูลที่ต้องการความปลอดภัยสูงหรือระบบรับชำระเงินจริง
 */
window.LAB_CONFIG = {
  version: 1,
  updatedNote: 'เริ่มต้น: เปิดเฉพาะห้องทดลองที่ 1 ห้องอื่นปิดไว้รอผู้ดูแลเปิดทีหลัง',
  labs: {
    'sim_memory_speed.html': { open: true,  locked: false, code: '', price: 'ฟรี' },
    'sim_overflow.html':     { open: false, locked: false, code: '', price: 'ฟรี' },
    'sim_precedence.html':   { open: false, locked: false, code: '', price: 'ฟรี' },
    'sim_trace.html':        { open: false, locked: false, code: '', price: 'ฟรี' },
    'sim_array_train.html':  { open: false, locked: false, code: '', price: 'ฟรี' },
    'sim_flowchart.html':    { open: false, locked: false, code: '', price: 'ฟรี' },
    'sim_sort.html':         { open: false, locked: false, code: '', price: 'ฟรี' }
  }
};
