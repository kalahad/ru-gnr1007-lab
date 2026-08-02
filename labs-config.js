/*
 * labs-config.js — ไฟล์ตั้งค่ากลาง (Single Source of Truth)
 * ------------------------------------------------------------------
 * โหลดโดยทั้ง index.html และ sim_*.html ทุกไฟล์ (ต้องโหลด "ก่อน" lab-core.js)
 *
 * ระบบปลดล็อกแบบขั้นบันได (Progressive Unlock):
 *   - unlockLevel = ระดับที่เปิดถึง เช่น 3 → เปิดห้องลำดับที่ 1,2,3 ให้อัตโนมัติ
 *   - order       = ลำดับห้องทดลอง (ห้ามสลับ เพราะใช้เทียบกับ unlockLevel)
 *   - labs        = ตั้ง "ล็อกด้วยรหัส" (locked/code) และ "ป้ายราคา" (price) รายห้อง
 *                   สำหรับสร้างรายได้ (ห้องต้องถึงระดับก่อน จึงจะเห็นช่องกรอกรหัส)
 *
 * วิธีทำให้การเปลี่ยนแปลงมีผลกับผู้เข้าชม "ทุกคน" บน GitHub Pages:
 *   1) แก้ค่าด้านล่างโดยตรง (หรือใช้แผงควบคุมผู้ดูแลใน index.html แล้วกด "คัดลอกโค้ด")
 *   2) commit + push ไฟล์นี้ขึ้น GitHub
 *   3) รอ GitHub Pages deploy ใหม่ (ไม่กี่นาที) จะมีผลกับทุกคน
 *
 * หมายเหตุความปลอดภัย: เว็บนี้เป็น Static Site รหัสทั้งหมดดูได้ผ่าน view-source
 * เหมาะกันคนทั่วไป ไม่เหมาะกับระบบชำระเงิน/ความปลอดภัยระดับสูง
 */
window.LAB_CONFIG = {
  version: 2,
  updatedNote: 'เริ่มต้น: เปิดถึงห้องที่ 1 (unlockLevel=1) ห้องอื่นรอผู้ดูแลเลื่อนระดับ',

  // ระดับที่ปลดล็อก: 1 = เปิดเฉพาะห้องแรก, 9 = เปิดครบทุกห้อง
  unlockLevel: 1,

  // ลำดับห้องทดลอง (ใช้เทียบกับ unlockLevel) — ห้ามสลับลำดับ
  order: [
    'sim_memory_speed.html',      // 1
    'sim_network_map.html',       // 2  (เพิ่ม 1 ส.ค. 69: เครือข่าย LAN/MAN/WAN + Input/Process/Output — บทที่ 1)
    'sim_compile_interpret.html', // 3  (เพิ่ม 1 ส.ค. 69: Compiler vs Interpreter — บทที่ 2)
    'sim_overflow.html',          // 4
    'sim_precedence.html',        // 5
    'sim_trace.html',             // 6
    'sim_flowchart.html',         // 7 (ปรับ 1 ส.ค. 69: ย้ายมาก่อน array_train เพราะตารางสอนใหม่สอน Flowchart ในวันที่ 3 ช่วงเช้า ก่อนอาร์เรย์ในช่วงบ่ายวันเดียวกัน)
    'sim_array_train.html',       // 8
    'sim_sort.html'               // 9
  ],

  // ล็อกรหัส + ป้ายราคา รายห้อง (ค่าเริ่มต้น: ไม่ล็อก ทุกห้องฟรี)
  labs: {
    'sim_memory_speed.html':      { locked: false, code: '', price: 'ฟรี' },
    'sim_network_map.html':       { locked: false, code: '', price: 'ฟรี' },
    'sim_compile_interpret.html': { locked: false, code: '', price: 'ฟรี' },
    'sim_overflow.html':          { locked: false, code: '', price: 'ฟรี' },
    'sim_precedence.html':        { locked: false, code: '', price: 'ฟรี' },
    'sim_trace.html':             { locked: false, code: '', price: 'ฟรี' },
    'sim_array_train.html':       { locked: false, code: '', price: 'ฟรี' },
    'sim_flowchart.html':         { locked: false, code: '', price: 'ฟรี' },
    'sim_sort.html':              { locked: false, code: '', price: 'ฟรี' }
  }
};
