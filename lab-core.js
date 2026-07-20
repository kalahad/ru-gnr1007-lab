/*
 * lab-core.js — ไลบรารีกลางของ GNR 1007 Interactive Lab
 * =====================================================
 * โหลดร่วมกันโดย index.html และ sim_*.html ทุกไฟล์ (ต้องโหลด "หลัง" labs-config.js)
 * รวมความสามารถกลาง 4 กลุ่ม:
 *   1) Seeded RNG  — สุ่มแบบทำซ้ำได้ (reproducible) ด้วย seed
 *   2) Gate        — ปลดล็อกห้องแบบขั้นบันได (level) + ล็อกด้วยรหัส (monetization)
 *   3) Quiz engine — สุ่มเลือกโจทย์จากคลัง + สลับตัวเลือก โดยคงคำตอบที่ถูกไว้เสมอ
 *   4) Challenge   — โหมดท้าทายจับเวลา 1.8 นาที/ข้อ + คะแนน + สถิติ/leaderboard เฉพาะเครื่อง
 *
 * ทุกฟังก์ชันไม่พึ่งไลบรารีภายนอก ทำงานออฟไลน์ได้
 */
(function(global){
  'use strict';

  /* ============================================================
   * 0) INJECT STYLES — สไตล์กลางของ Quiz-controls / Challenge Mode
   *    ใช้ CSS variable ที่แต่ละหน้ามีอยู่แล้ว (--navy, --gold, ฯลฯ)
   * ============================================================ */
  function injectStyles(){
    if(typeof document === 'undefined') return;
    if(document.getElementById('labCoreStyle')) return;
    const css = `
    .quizControls{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px;}
    .quizControls .qcBtn{background:var(--navy);color:#fff;border:none;font-family:inherit;font-weight:700;font-size:.82rem;padding:8px 16px;border-radius:10px;cursor:pointer;}
    .quizControls .qcBtn:hover{background:var(--navy-light);}
    .quizControls .qcSeed{font-family:'Courier New',monospace;font-size:.82rem;padding:7px 10px;border-radius:8px;border:1.5px solid #d7deee;width:120px;}
    .quizControls .qcHint{font-size:.74rem;color:var(--muted);font-weight:600;}
    .chIntro{text-align:center;padding:6px 0;}
    .chIntroText{font-size:.9rem;line-height:1.85;color:var(--text);margin:0 0 8px;}
    .chBest{font-size:.85rem;color:var(--navy-dark);font-weight:700;margin:0 0 14px;}
    .chStartBtn,.chAgainBtn,.chAgainBtn{background:linear-gradient(90deg,var(--gold-dark,#8f7015),var(--gold));color:var(--navy-dark);border:none;font-family:inherit;font-weight:800;font-size:.95rem;padding:13px 30px;border-radius:12px;cursor:pointer;box-shadow:0 4px 14px rgba(201,162,39,.4);}
    .chStartBtn:hover,.chAgainBtn:hover{filter:brightness(1.06);}
    .chWrap{border:1px solid #e4e8f3;border-radius:14px;padding:18px;background:#fbfcfe;}
    .chHead{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;font-size:.82rem;font-weight:700;color:var(--navy-dark);margin-bottom:12px;}
    .chScore b{color:var(--navy);font-size:1.05rem;}
    .chStreak{color:var(--danger);min-width:70px;text-align:right;}
    .chTimerOuter{height:9px;background:#e4e8f3;border-radius:9px;overflow:hidden;}
    .chTimerInner{height:100%;width:100%;background:var(--success);border-radius:9px;transition:width 1s linear, background .3s;}
    .chTimerText{font-size:.72rem;color:var(--muted);font-weight:600;margin:6px 0 14px;text-align:right;}
    .chQ{font-weight:700;color:var(--navy-dark);font-size:1rem;line-height:1.7;margin:0 0 14px;}
    .chOpts{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
    .chOptBtn{text-align:left;background:#fff;border:1.5px solid #dfe4f0;border-radius:10px;padding:12px 14px;font-family:inherit;font-size:.88rem;cursor:pointer;color:var(--text);transition:.12s;}
    .chOptBtn:hover:not(:disabled){border-color:var(--navy-light);background:#f5f7fc;}
    .chOptBtn.correct{background:var(--success-bg);border-color:var(--success);color:var(--success);font-weight:700;}
    .chOptBtn.wrong{background:var(--danger-bg);border-color:var(--danger);color:var(--danger);font-weight:700;}
    .chFb{margin-top:12px;font-size:.86rem;font-weight:600;display:none;line-height:1.7;}
    .chNextBtn{margin-top:14px;width:100%;background:var(--navy);color:#fff;border:none;font-family:inherit;font-weight:800;font-size:.9rem;padding:12px;border-radius:10px;cursor:pointer;}
    .chNextBtn:hover{background:var(--navy-light);}
    .chResult{text-align:center;padding:10px 0;}
    .chBadge{font-size:3.4rem;line-height:1;margin-bottom:6px;}
    .chResult h3{margin:0 0 10px;color:var(--navy-dark);font-size:1.2rem;}
    .chResultScore{font-size:1.05rem;margin:0 0 4px;color:var(--text);}
    .chResultScore b{color:var(--navy);font-size:1.5rem;}
    .chResultSub{font-size:.82rem;color:var(--muted);margin:0 0 18px;line-height:1.7;}
    .chLbWrap{text-align:left;background:#f5f7fc;border-radius:12px;padding:14px 16px;margin-bottom:18px;}
    .chLbWrap h4{margin:0 0 8px;font-size:.86rem;color:var(--navy-dark);}
    .chLb{width:100%;border-collapse:collapse;font-size:.82rem;}
    .chLb th,.chLb td{border:1px solid #e4e8f3;padding:6px 9px;text-align:center;}
    .chLb th{background:var(--navy);color:#fff;font-weight:700;}
    .chLb tr.me td{background:var(--gold-light,#eaD077);font-weight:800;color:var(--navy-dark);}
    .chUnlock{background:linear-gradient(135deg,#eafaf1,#f5fbf0);border:1.5px solid var(--success);border-radius:14px;padding:14px 16px;margin-bottom:16px;color:var(--success);font-weight:700;font-size:.9rem;line-height:1.7;}
    .chUnlock.chUnlockDone{background:#f5f7fc;border-color:#dfe4f0;color:var(--navy-dark);}
    .chNextRoom{display:inline-block;margin-top:10px;background:var(--success);color:#fff;text-decoration:none;font-weight:800;padding:9px 20px;border-radius:10px;font-size:.85rem;}
    .chUnlock.chUnlockDone .chNextRoom{background:var(--navy);}
    .chNextRoom:hover{filter:brightness(1.08);}
    .chUnlockFail{background:#fff7e0;border:1.5px dashed #e0c164;border-radius:14px;padding:12px 16px;margin-bottom:16px;color:#7a5b06;font-weight:700;font-size:.86rem;line-height:1.6;}
    @media(max-width:640px){ .chOpts{grid-template-columns:1fr;} }
    `;
    const style = document.createElement('style');
    style.id = 'labCoreStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }
  if(typeof document !== 'undefined'){
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectStyles);
    else injectStyles();
  }

  /* ============================================================
   * 1) SEEDED RNG (xmur3 hash + mulberry32)
   * ============================================================ */
  function xmur3(str){
    let h = 1779033703 ^ str.length;
    for(let i=0;i<str.length;i++){
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function(){
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }
  function mulberry32(a){
    return function(){
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // สร้าง RNG จาก seed (สตริงหรือตัวเลข) — seed เดียวกัน ให้ลำดับสุ่มเดียวกันเสมอ
  function makeRng(seed){
    if(seed === undefined || seed === null || seed === '') seed = String(Date.now()) + Math.random();
    const seedFn = xmur3(String(seed));
    return mulberry32(seedFn());
  }
  // Fisher–Yates (ใช้ rng ที่กำหนด เพื่อความ reproducible)
  function shuffle(arr, rng){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(rng() * (i+1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // สุ่มหยิบ n รายการแบบไม่ซ้ำ
  function pick(arr, n, rng){
    return shuffle(arr, rng).slice(0, Math.min(n, arr.length));
  }
  function randInt(rng, min, max){ return Math.floor(rng() * (max - min + 1)) + min; }
  function choice(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }

  /* ============================================================
   * 2) GATE — ปลดล็อกแบบขั้นบันได (level) + ล็อกด้วยรหัส
   * ============================================================
   * เกณฑ์การเข้าถึงห้อง = (ลำดับห้อง <= ระดับที่ปลดล็อก) และ (ไม่ล็อกรหัส หรือ ปลดรหัสแล้ว)
   * ระดับที่ใช้จริง = max(unlockLevel ที่ตั้งกลาง, ระดับที่นักเรียนปลดเองด้วยรหัสแพ็กเกจในเครื่อง)
   */
  const UNLOCK_KEY = 'gnr1007_unlocked_v1';       // รายชื่อห้องที่ปลดด้วยรหัสรายห้อง
  const LEVEL_BOOST_KEY = 'gnr1007_level_boost_v1'; // ระดับที่นักเรียนปลดเองด้วยรหัสแพ็กเกจ

  function getConfig(){
    return (global.LAB_CONFIG && global.LAB_CONFIG.labs) ? global.LAB_CONFIG : { unlockLevel: 99, order: [], labs: {} };
  }
  function getOrder(){
    const cfg = getConfig();
    return Array.isArray(cfg.order) && cfg.order.length ? cfg.order : Object.keys(cfg.labs);
  }
  function labIndex(file){ return getOrder().indexOf(file) + 1; } // ลำดับเริ่มที่ 1 (0 = ไม่พบ)
  function getUnlocked(){ try{ return JSON.parse(localStorage.getItem(UNLOCK_KEY) || '[]'); }catch(e){ return []; } }
  function addUnlocked(file){ const u = getUnlocked(); if(u.indexOf(file)===-1){ u.push(file); localStorage.setItem(UNLOCK_KEY, JSON.stringify(u)); } }
  function getLevelBoost(){ const n = parseInt(localStorage.getItem(LEVEL_BOOST_KEY) || '0', 10); return isNaN(n) ? 0 : n; }
  function setLevelBoost(n){ localStorage.setItem(LEVEL_BOOST_KEY, String(n)); }
  function effectiveLevel(){
    const cfg = getConfig();
    const base = (typeof cfg.unlockLevel === 'number') ? cfg.unlockLevel : 99;
    return Math.max(base, getLevelBoost());
  }
  // สถานะห้อง: {reachable, locked, unlocked, price, order, level}
  function labStatus(file){
    const cfg = getConfig();
    const lab = (cfg.labs && cfg.labs[file]) || {};
    const idx = labIndex(file);
    const reachable = idx > 0 && idx <= effectiveLevel();
    const locked = !!lab.locked;
    const unlocked = getUnlocked().indexOf(file) !== -1;
    return { reachable, locked, unlocked, price: lab.price || 'ฟรี', code: lab.code || '', order: idx, level: effectiveLevel() };
  }

  // แสดง overlay ปิดกั้นถ้าเข้าไม่ได้ (เรียกในหน้า sim_*.html)
  function initGate(file){
    const st = labStatus(file);
    const gate = document.getElementById('labGate');
    if(!gate) return st;
    const setTexts = (icon, title, msg) => {
      const iEl = document.getElementById('labGateIcon');
      const tEl = document.getElementById('labGateTitle');
      const mEl = document.getElementById('labGateMsg');
      if(iEl) iEl.textContent = icon;
      if(tEl) tEl.textContent = title;
      if(mEl) mEl.textContent = msg;
    };
    // กรณี 1: ยังไม่ถึงระดับที่ปลดล็อก
    if(!st.reachable){
      gate.style.display = 'flex';
      setTexts('🚧', 'ห้องนี้ยังไม่เปิดให้บริการ',
        'ผู้สอนยังไม่ได้ปลดล็อกห้องทดลองนี้ (เปิดถึงห้องที่ ' + st.level + ' เท่านั้น) กรุณากลับไปเลือกห้องที่เปิดอยู่ หรือรอผู้สอนปลดล็อกเพิ่ม');
      return st;
    }
    // กรณี 2: ถึงระดับแล้ว แต่ล็อกด้วยรหัสและยังไม่ปลด
    if(st.locked && !st.unlocked){
      gate.style.display = 'flex';
      setTexts('🔒', 'ห้องทดลองนี้ต้องใช้รหัสเข้าใช้งาน',
        st.price ? ('ระดับการเข้าถึง: ' + st.price + ' — กรอกรหัสที่ได้รับจากผู้สอน') : 'กรอกรหัสที่ได้รับจากผู้สอนเพื่อเข้าใช้งาน');
      const box = document.getElementById('labGateCodeBox');
      if(box){
        box.style.display = 'block';
        const btn = document.getElementById('labGateUnlockBtn');
        const input = document.getElementById('labGateCodeInput');
        const err = document.getElementById('labGateCodeErr');
        const tryUnlock = () => {
          const v = (input.value || '').trim();
          if(v && st.code && v.toLowerCase() === String(st.code).toLowerCase()){
            addUnlocked(file);
            gate.style.display = 'none';
          } else if(err){ err.style.display = 'block'; }
        };
        if(btn) btn.addEventListener('click', tryUnlock);
        if(input) input.addEventListener('keydown', function(e){ if(e.key==='Enter') tryUnlock(); });
      }
      return st;
    }
    // เข้าถึงได้ปกติ
    gate.style.display = 'none';
    return st;
  }

  /* ============================================================
   * 3) QUIZ ENGINE — สุ่มโจทย์ + สลับตัวเลือก (คงคำตอบถูกไว้เสมอ)
   * ============================================================
   * รูปแบบข้อในคลัง: { q:'คำถาม', opts:['ก','ข','ค','ง'], ans:<index ที่ถูกใน opts เดิม>, exp:'คำอธิบาย' }
   */
  function renderQuiz(opts){
    const container = typeof opts.container === 'string' ? document.querySelector(opts.container) : opts.container;
    if(!container) return;
    const bank = opts.bank || [];
    const count = Math.min(opts.count || 4, bank.length);
    const rng = makeRng(opts.seed);
    const chosen = pick(bank, count, rng);

    container.innerHTML = '';
    chosen.forEach(function(item, qi){
      // สลับตัวเลือก โดยจำว่าคำตอบถูกย้ายไปตำแหน่งใด
      const idxs = shuffle(item.opts.map(function(_,i){ return i; }), rng);
      const shuffledOpts = idxs.map(function(i){ return item.opts[i]; });
      const newAns = idxs.indexOf(item.ans);

      const box = document.createElement('div');
      box.className = 'quiz-item';
      box.innerHTML = '<p class="q">' + (qi+1) + ') ' + item.q + '</p><div class="opts"></div><div class="fb"></div>';
      const optsEl = box.querySelector('.opts');
      shuffledOpts.forEach(function(optText, oi){
        const b = document.createElement('button');
        b.textContent = optText;
        b.addEventListener('click', function(){
          const fb = box.querySelector('.fb');
          const allBtns = optsEl.querySelectorAll('button');
          allBtns.forEach(function(bb){ bb.disabled = true; });
          if(oi === newAns){
            b.classList.add('correct');
            fb.style.color = 'var(--success)';
            fb.textContent = '✔ ถูกต้อง! ' + item.exp;
          } else {
            b.classList.add('wrong');
            allBtns[newAns].classList.add('correct');
            fb.style.color = 'var(--danger)';
            fb.textContent = '✘ ยังไม่ถูก — ' + item.exp;
          }
          fb.style.display = 'block';
        });
        optsEl.appendChild(b);
      });
      container.appendChild(box);
    });
  }

  /* ============================================================
   * 4) CHALLENGE MODE — จับเวลา 1.8 นาที/ข้อ + คะแนน + streak + leaderboard เฉพาะเครื่อง
   * ============================================================ */
  const PLAYER_KEY = 'gnr1007_player_name_v1';
  function getPlayerName(){ return localStorage.getItem(PLAYER_KEY) || ''; }
  function setPlayerName(n){ localStorage.setItem(PLAYER_KEY, n); }
  function lbKey(file){ return 'gnr1007_lb_' + file; }
  function getLeaderboard(file){ try{ return JSON.parse(localStorage.getItem(lbKey(file)) || '[]'); }catch(e){ return []; } }
  function saveScore(file, entry){
    const lb = getLeaderboard(file);
    lb.push(entry);
    lb.sort(function(a,b){ return b.score - a.score; });
    const trimmed = lb.slice(0, 20);
    localStorage.setItem(lbKey(file), JSON.stringify(trimmed));
    return trimmed;
  }
  function personalBest(file){
    const lb = getLeaderboard(file);
    return lb.length ? lb[0].score : 0;
  }

  const PER_Q_SECONDS = 108;   // 1.8 นาที = 108 วินาที (ตรงเกณฑ์สอบ กว.)
  const BASE_POINTS = 200;     // แต้มฐานเมื่อตอบถูก
  const SPEED_BONUS = 800;     // โบนัสความเร็วสูงสุด (แปรผันตามเวลาที่เหลือ)
  const PASS_TO_UNLOCK = 80;   // ทำคะแนนโหมดท้าทายถึง % นี้ จะปลดล็อกห้องถัดไป (เฉพาะเครื่องผู้เรียน)

  // ข้อมูลห้องถัดไปจากห้องที่กำหนด (null ถ้าเป็นห้องสุดท้าย)
  function nextLabInfo(file){
    const order = labIndex(file);
    const arr = getOrder();
    if(order < 1 || order >= arr.length) return null;
    return { order: order + 1, file: arr[order] };
  }
  // ถ้าผ่านเกณฑ์และห้องนี้คือ "ห้องหน้าสุด" ที่เปิดอยู่ → ปลดล็อกห้องถัดไป
  function maybeUnlockNext(file, pct){
    const order = labIndex(file);
    const total = getOrder().length;
    if(pct >= PASS_TO_UNLOCK && order >= effectiveLevel() && order > 0 && order < total){
      setLevelBoost(order + 1);
      return nextLabInfo(file);
    }
    return null;
  }

  function badgeFor(pct){
    if(pct >= 90) return { name: 'ยอดนักพิชิต กว.', icon: '🏆', color: '#C9A227' };
    if(pct >= 75) return { name: 'ผู้เชี่ยวชาญ', icon: '🥇', color: '#24408a' };
    if(pct >= 60) return { name: 'ผ่านเกณฑ์ (60%)', icon: '🥈', color: '#1e8449' };
    return { name: 'ต้องฝึกเพิ่ม', icon: '📚', color: '#657085' };
  }

  /*
   * เริ่มโหมดท้าทาย
   * config: { file, mount(selector/el), bank, count, seed, onFinish }
   */
  function runChallenge(config){
    const mount = typeof config.mount === 'string' ? document.querySelector(config.mount) : config.mount;
    if(!mount) return;
    const file = config.file;
    const rng = makeRng(config.seed);
    const count = Math.min(config.count || 8, config.bank.length);
    const questions = pick(config.bank, count, rng).map(function(item){
      const idxs = shuffle(item.opts.map(function(_,i){ return i; }), rng);
      return { q: item.q, opts: idxs.map(function(i){ return item.opts[i]; }), ans: idxs.indexOf(item.ans), exp: item.exp };
    });

    // ให้กรอกชื่อครั้งแรก
    let name = getPlayerName();
    if(!name){
      name = (prompt('กรอกชื่อผู้เล่นสำหรับกระดานคะแนน (เก็บในเครื่องนี้เท่านั้น):', '') || '').trim() || 'ผู้เรียน';
      setPlayerName(name);
    }

    let idx = 0, score = 0, correct = 0, streak = 0, maxStreak = 0;
    let timeLeft = PER_Q_SECONDS, timer = null;

    function clearTimer(){ if(timer){ clearInterval(timer); timer = null; } }

    function renderQuestion(){
      clearTimer();
      timeLeft = PER_Q_SECONDS;
      const item = questions[idx];
      mount.innerHTML =
        '<div class="chWrap">' +
          '<div class="chHead">' +
            '<span class="chProg">ข้อ ' + (idx+1) + ' / ' + questions.length + '</span>' +
            '<span class="chScore">คะแนน: <b id="chScoreVal">' + score + '</b></span>' +
            '<span class="chStreak" id="chStreak">' + (streak>0 ? ('🔥 streak ' + streak) : '') + '</span>' +
          '</div>' +
          '<div class="chTimerOuter"><div class="chTimerInner" id="chTimerBar"></div></div>' +
          '<div class="chTimerText" id="chTimerText"></div>' +
          '<p class="chQ">' + item.q + '</p>' +
          '<div class="chOpts" id="chOpts"></div>' +
          '<div class="chFb" id="chFb"></div>' +
        '</div>';
      const optsEl = mount.querySelector('#chOpts');
      item.opts.forEach(function(optText, oi){
        const b = document.createElement('button');
        b.className = 'chOptBtn';
        b.textContent = optText;
        b.addEventListener('click', function(){ answer(oi, b, optsEl); });
        optsEl.appendChild(b);
      });
      updateTimerUI();
      timer = setInterval(function(){
        timeLeft--;
        updateTimerUI();
        if(timeLeft <= 0){ answer(-1, null, optsEl); }
      }, 1000);
    }
    function updateTimerUI(){
      const bar = mount.querySelector('#chTimerBar');
      const txt = mount.querySelector('#chTimerText');
      const pct = Math.max(0, timeLeft / PER_Q_SECONDS * 100);
      if(bar){
        bar.style.width = pct + '%';
        bar.style.background = timeLeft <= 15 ? 'var(--danger)' : (timeLeft <= 40 ? 'var(--gold)' : 'var(--success)');
      }
      if(txt){ txt.textContent = 'เหลือเวลา ' + timeLeft + ' วินาที (เกณฑ์ กว. 1.8 นาที/ข้อ)'; }
    }
    function answer(oi, btnEl, optsEl){
      clearTimer();
      const item = questions[idx];
      const allBtns = optsEl.querySelectorAll('button');
      allBtns.forEach(function(bb){ bb.disabled = true; });
      const fb = mount.querySelector('#chFb');
      const isCorrect = (oi === item.ans);
      if(isCorrect){
        const gained = BASE_POINTS + Math.round(SPEED_BONUS * (timeLeft / PER_Q_SECONDS));
        score += gained; correct++; streak++; maxStreak = Math.max(maxStreak, streak);
        if(btnEl) btnEl.classList.add('correct');
        fb.style.color = 'var(--success)';
        fb.textContent = '✔ ถูกต้อง! +' + gained + ' แต้ม (โบนัสความเร็ว) — ' + item.exp;
      } else {
        streak = 0;
        if(btnEl) btnEl.classList.add('wrong');
        if(allBtns[item.ans]) allBtns[item.ans].classList.add('correct');
        fb.style.color = 'var(--danger)';
        fb.textContent = (oi === -1 ? '⏰ หมดเวลา! ' : '✘ ยังไม่ถูก — ') + item.exp;
      }
      const scoreEl = mount.querySelector('#chScoreVal'); if(scoreEl) scoreEl.textContent = score;
      fb.style.display = 'block';
      const nextBtn = document.createElement('button');
      nextBtn.className = 'chNextBtn';
      nextBtn.textContent = (idx < questions.length-1) ? 'ข้อถัดไป →' : 'ดูผลคะแนน 🏁';
      nextBtn.addEventListener('click', function(){
        idx++;
        if(idx < questions.length) renderQuestion();
        else finish();
      });
      mount.querySelector('.chWrap').appendChild(nextBtn);
    }
    function finish(){
      clearTimer();
      const pct = Math.round(correct / questions.length * 100);
      const badge = badgeFor(pct);
      const entry = { name: name, score: score, correct: correct, total: questions.length, date: new Date().toLocaleDateString('th-TH') };
      const lb = saveScore(file, entry);
      const rank = lb.findIndex(function(e){ return e === entry; }) + 1;
      // ตรวจปลดล็อกห้องถัดไปด้วยคะแนน
      const unlockInfo = maybeUnlockNext(file, pct);
      const nxt = nextLabInfo(file);
      let unlockHtml = '';
      if(unlockInfo){
        unlockHtml = '<div class="chUnlock">🔓 ยินดีด้วย! ทำคะแนนถึง ' + pct + '% (เกณฑ์ ' + PASS_TO_UNLOCK + '%) ปลดล็อก <b>ห้องที่ ' + unlockInfo.order + '</b> แล้ว' +
          '<a class="chNextRoom" href="' + unlockInfo.file + '">เข้าห้องที่ ' + unlockInfo.order + ' →</a></div>';
      } else if(nxt){
        const nextReachable = (labIndex(file) + 1) <= effectiveLevel();
        if(nextReachable){
          unlockHtml = '<div class="chUnlock chUnlockDone">ห้องที่ ' + nxt.order + ' ปลดล็อกไว้แล้ว <a class="chNextRoom" href="' + nxt.file + '">ไปต่อ →</a></div>';
        } else {
          unlockHtml = '<div class="chUnlockFail">ทำคะแนนให้ถึง ' + PASS_TO_UNLOCK + '% เพื่อปลดล็อกห้องที่ ' + nxt.order + ' (รอบนี้ได้ ' + pct + '%) — ลองอีกครั้งได้!</div>';
        }
      }
      let lbHtml = lb.slice(0,5).map(function(e, i){
        return '<tr' + (e===entry ? ' class="me"' : '') + '><td>' + (i+1) + '</td><td>' + escapeHtml(e.name) + '</td><td>' + e.score + '</td><td>' + e.correct + '/' + e.total + '</td></tr>';
      }).join('');
      mount.innerHTML =
        '<div class="chResult">' +
          '<div class="chBadge" style="color:' + badge.color + '">' + badge.icon + '</div>' +
          '<h3>' + badge.name + '</h3>' +
          '<p class="chResultScore">คะแนนรวม <b>' + score + '</b> แต้ม</p>' +
          '<p class="chResultSub">ตอบถูก ' + correct + '/' + questions.length + ' ข้อ (' + pct + '%) · streak สูงสุด ' + maxStreak + ' · อันดับในเครื่องนี้: ' + (rank>0?('ที่ ' + rank):'-') + '</p>' +
          unlockHtml +
          '<div class="chLbWrap"><h4>🏅 กระดานคะแนนสูงสุด (เครื่องนี้)</h4>' +
            '<table class="chLb"><tr><th>อันดับ</th><th>ชื่อ</th><th>คะแนน</th><th>ถูก</th></tr>' + lbHtml + '</table></div>' +
          '<button class="chAgainBtn" id="chAgainBtn">เล่นอีกครั้ง (สุ่มชุดใหม่) 🔄</button>' +
        '</div>';
      const again = mount.querySelector('#chAgainBtn');
      if(again) again.addEventListener('click', function(){
        runChallenge({ file: file, mount: mount, bank: config.bank, count: config.count, seed: undefined, onFinish: config.onFinish });
      });
      if(typeof config.onFinish === 'function') config.onFinish({ score: score, correct: correct, total: questions.length, pct: pct });
    }
    renderQuestion();
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, function(c){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c];
    });
  }

  // สร้างการ์ด Challenge + ปุ่มเริ่ม ลงใน mount ที่กำหนด (ช่วยให้แต่ละห้องเรียกง่าย)
  function mountChallengeUI(config){
    const host = typeof config.host === 'string' ? document.querySelector(config.host) : config.host;
    if(!host) return;
    const best = personalBest(config.file);
    const nxt = nextLabInfo(config.file);
    const ruleHtml = nxt
      ? '<p class="chBest" style="color:var(--gold-dark,#8f7015)">ทำคะแนนโหมดนี้ให้ถึง <b>' + PASS_TO_UNLOCK + '%</b> เพื่อ<b>ปลดล็อกห้องที่ ' + nxt.order + '</b></p>'
      : '<p class="chBest">ห้องสุดท้ายแล้ว — พิชิตให้ได้คะแนนสูงสุด!</p>';
    host.innerHTML =
      '<div class="chIntro" id="chIntro">' +
        '<p class="chIntroText">ทดสอบตัวเองแบบจับเวลาจริง <b>1.8 นาที/ข้อ</b> ตามเกณฑ์สอบ กว. ยิ่งตอบถูกและเร็ว ยิ่งได้แต้มมาก พร้อมโบนัส streak เมื่อถูกติดต่อกัน</p>' +
        ruleHtml +
        '<p class="chBest">สถิติสูงสุดของคุณ: <b>' + best + '</b> แต้ม</p>' +
        '<button class="chStartBtn" id="chStartBtn">🚀 เริ่มโหมดท้าทาย (' + (config.count||8) + ' ข้อ)</button>' +
      '</div>' +
      '<div id="' + config.arenaId + '"></div>';
    const startBtn = host.querySelector('#chStartBtn');
    startBtn.addEventListener('click', function(){
      host.querySelector('#chIntro').style.display = 'none';
      runChallenge({ file: config.file, mount: '#' + config.arenaId, bank: config.bank, count: config.count, seed: undefined });
    });
  }

  /* ============================================================
   * Export
   * ============================================================ */
  global.LabCore = {
    // rng
    makeRng: makeRng, shuffle: shuffle, pick: pick, randInt: randInt, choice: choice,
    // gate
    getConfig: getConfig, getOrder: getOrder, labIndex: labIndex, labStatus: labStatus,
    effectiveLevel: effectiveLevel, getLevelBoost: getLevelBoost, setLevelBoost: setLevelBoost,
    getUnlocked: getUnlocked, addUnlocked: addUnlocked, initGate: initGate,
    // quiz
    renderQuiz: renderQuiz,
    // challenge
    runChallenge: runChallenge, mountChallengeUI: mountChallengeUI,
    getLeaderboard: getLeaderboard, personalBest: personalBest,
    getPlayerName: getPlayerName, setPlayerName: setPlayerName,
    nextLabInfo: nextLabInfo, maybeUnlockNext: maybeUnlockNext,
    PER_Q_SECONDS: PER_Q_SECONDS, PASS_TO_UNLOCK: PASS_TO_UNLOCK
  };

})(typeof window !== 'undefined' ? window : this);
