/* Farmakologiya RTR — asboblar: dorilar maʼlumotnomasi, retsept simulyatori, kalkulyatorlar,
   vaziyatli simulyator, dorilar öyini, imtihon rejimi, çop etiladigan blanklar */
window.PSX_INIT = function (A) {
  'use strict';
  var P = A.P, M = A.M, view = A.view, $ = A.$, $$ = A.$$, esc = A.esc, rich = A.rich, plain = A.plain, ic = A.ic;
  var get = A.get, put = A.put, shuffle = A.shuffle, num = A.num, fmt = A.fmt, pad = A.pad, TOPICS = A.TOPICS;
  var R = {}; window.PSX_ROUTES = R;
  var GROUPS = P.drug_groups, V = '?v=8';

  /* ---------- Skriptlarni yuklaş (file:// da ham işlaydi) ---------- */
  var scripts = {};
  function loadScript(src) {
    if (scripts[src]) return scripts[src];
    scripts[src] = new Promise(function (res) {
      var s = document.createElement('script');
      s.src = src; s.onload = function () { res(true); }; s.onerror = function () { delete scripts[src]; res(false); };
      document.head.appendChild(s);
    });
    return scripts[src];
  }
  var drugsP = null;
  function loadDrugs() {
    if (!drugsP) drugsP = Promise.all([loadScript('assets/drugs/d1.js' + V), loadScript('assets/drugs/d2.js' + V)]).then(function () {
      var D = window.PSX_D || {}, out = [];
      Object.keys(D).sort().forEach(function (k) { out = out.concat(D[k]); });
      out.forEach(function (x, i) { x.idx = i; });
      return out;
    });
    return drugsP;
  }
  function head(h1, p, long) { return '<div class="expanded' + (long ? ' long' : '') + '"><h1>' + h1 + '</h1>' + (p ? '<p>' + p + '</p>' : '') + '</div>'; }
  function dstamp(t) { var d = new Date(t); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear() + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  /* ======================================================
     ASBOBLAR (boş sahifa)
     ====================================================== */
  R.tools = function () {
    A.setTab('tools'); A.setBar({ title: 'Asboblar' });
    var items = [
      ['#/drugs', 'box', 'Dorilar maʼlumotnomasi', 'Guruhlar böyiça va qidiruv bilan', 'blue'],
      ['#/rx', 'doc', 'Retsept simulyatori', 'Retseptni yozing va tekşiring', 'purple'],
      ['#/calc', 'calc', 'Kalkulyatorlar', 'Doza, suyultiriş, insulin, infuziya', 'teal'],
      ['#/sim', 'alert', 'Vaziyatli simulyator', 'Tarmoqlanuvçi klinik stsenariylar', 'red'],
      ['#/game', 'shuffle', 'Dorilar öyini', 'Guruhlar va lotinça nomlar böyiça', 'orange'],
      ['#/exam', 'clock', 'Imtihon rejimi', '30 savol, 40 daqiqa, baho', 'green'],
      ['#/blank', 'print', 'Çop etiladigan blanklar', 'Retsept, narkotik jurnali, FEFO jurnali', 'blue'],
      ['#/glossary', 'abc', 'Luğat', 'Atamalar va kartoçkalar', 'purple']
    ];
    view.innerHTML = head('Asboblar', 'Amaliy maşğulotlar uçun vositalar') +
      '<div class="list">' + items.map(function (x) {
        return '<a class="row c-' + x[4] + '" href="' + x[0] + '"><div class="ico">' + ic(x[1]) + '</div><div class="grow"><div class="t">' + x[2] + '</div><div class="s">' + x[3] + '</div></div>' + ic('chev', 'chev') + '</a>';
      }).join('') + '</div>' +
      ('caches' in window && /^https?:$/.test(location.protocol) ? '<div class="list"><button class="row c-green" id="offl"><div class="ico">' + ic('download') + '</div><div class="grow"><div class="t">Internetsiz işlaş uçun yuklab oliş</div><div class="s">Barça mavzu, plakat va dorilar qurilmaga saqlanadi</div></div><span class="val"></span></button></div>' : '') +
      '<div class="footer">' + esc(M.title) + '<br>' + esc(M.author) + '</div>';
    A.onScroll();
    var ob = $('#offl'); if (ob) ob.onclick = function () { offlineAll(ob); };
  };

  function offlineAll(btn) {
    var urls = ['./', 'index.html', 'manifest.webmanifest', 'assets/icon.svg', 'assets/app.css' + V, 'assets/data.js' + V, 'assets/tools.js' + V, 'assets/app.js' + V,
      'assets/scenarios.js' + V, 'assets/drugs/d1.js' + V, 'assets/drugs/d2.js' + V];
    for (var i = 1; i <= 30; i++) { urls.push('assets/topics/f' + pad(i) + '.js' + V); urls.push('assets/posters/p' + pad(i) + '.js' + V); }
    var done = 0, lbl = $('.val', btn); btn.disabled = true;
    caches.open('frm-v1').then(function (c) {
      return urls.reduce(function (p, u) {
        return p.then(function () { return c.add(u).catch(function () {}).then(function () { done++; lbl.textContent = Math.round(done / urls.length * 100) + '%'; }); });
      }, Promise.resolve());
    }).then(function () { lbl.textContent = '✓'; btn.disabled = false; $('.s', btn).textContent = 'Tayyor: endi internetsiz ham işlaydi'; });
  }

  /* ======================================================
     DORILAR MAʼLUMOTNOMASI
     ====================================================== */
  R.drugs = function () {
    A.setTab('drugs'); A.setBar({ title: 'Dorilar' });
    view.innerHTML = head('Dorilar', '<span id="dcount">Yuklanmoqda…</span>') + '<div id="dbody"><div class="spinner"></div></div>';
    A.onScroll();
    loadDrugs().then(function (all) {
      var el = $('#dbody'); if (!el) return;
      if (!all.length) { el.innerHTML = '<div class="empty">Dorilar maʼlumotlari topilmadi.</div>'; return; }
      var st = { g: -1, q: '' }, cnt = {};
      all.forEach(function (d) { cnt[d.gi] = (cnt[d.gi] || 0) + 1; });
      var sorted = all.slice().sort(function (a, b) { return A.uzCmp({ t: a.n }, { t: b.n }); });
      el.innerHTML = '<label class="search">' + ic('search') + '<input id="dq" type="search" placeholder="Dori nomi, lotinça nomi yoki körsatma" autocomplete="off"></label>' +
        '<div class="chips-wrap"><div class="chips" id="dg"></div></div><div id="dlist"></div>';
      $('#dg', el).innerHTML = '<button class="chip" data-g="-1" aria-pressed="true">Hammasi</button>' + GROUPS.map(function (g, i) {
        return cnt[i] ? '<button class="chip" data-g="' + i + '" aria-pressed="false">' + esc(g.s) + ' · ' + cnt[i] + '</button>' : '';
      }).join('');
      function draw() {
        var q = A.uzNorm(st.q.trim());
        var f = sorted.filter(function (d) {
          if (st.g >= 0 && d.gi !== st.g) return false;
          if (!q) return true;
          return (plain(d.n) + ' ' + d.l + ' ' + d.i.join(' ') + ' ' + GROUPS[d.gi].s).toLowerCase().indexOf(q) >= 0;
        });
        $('#dcount').textContent = f.length + ' ta dori';
        $('#dlist', el).innerHTML = f.length ? '<div class="list">' + f.map(function (d) {
          var g = GROUPS[d.gi];
          return '<button class="row c-' + g.c + '" data-i="' + d.idx + '"><div class="ico">' + esc(plain(d.n).charAt(0)) + '</div><div class="grow"><div class="t">' + esc(d.n) + ' <span class="lat" style="font-weight:400;font-size:14px">' + esc(d.l) + '</span></div><div class="s">' + esc(g.s) + (d.sg ? ' · ' + esc(d.sg) : '') + '</div></div>' + ic('chev', 'chev') + '</button>';
        }).join('') + '</div>' : '<div class="empty">Heç narsa topilmadi.</div>';
        $$('[data-i]', el).forEach(function (b) { b.onclick = function () { drugDlg(all[+b.getAttribute('data-i')]); }; });
      }
      $$('.chip', el).forEach(function (b) { b.onclick = function () { st.g = +b.getAttribute('data-g'); $$('.chip', el).forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); draw(); }; });
      $('#dq', el).oninput = function () { st.q = this.value; draw(); };
      draw();
    });
  };
  function lst(title, arr) {
    return arr && arr.length ? '<div class="sub-lbl">' + title + '</div><ul class="dl">' + arr.map(function (x) { return '<li>' + rich(x) + '</li>'; }).join('') + '</ul>' : '';
  }
  function drugDlg(d) {
    var g = GROUPS[d.gi];
    var h = '<h2>' + esc(d.n) + '</h2><div class="muted" style="margin:-6px 0 8px"><span class="lat">' + esc(d.l) + '</span> · ' + esc(g.n) + (d.sg ? ' · ' + esc(d.sg) : '') + '</div>';
    if (d.w) h += '<div class="warn"><b>Muhim:</b> ' + rich(d.w) + '</div>';
    h += lst('Çiqariliş şakllari', d.f);
    if (d.rx) h += '<div class="sub-lbl">Retsept namunasi</div><div class="rxbox">' + esc(d.rx) + '</div>';
    h += lst('Qöllanilişi', d.i) + lst('Nojöya taʼsirlari', d.s) + lst('Qarşi körsatmalar', d.c) + lst('Hamşira nima qiladi', d.r);
    if (d.t && d.t.length) h += '<div class="sub-lbl">Mavzular</div><div class="chips" style="flex-wrap:wrap">' + d.t.map(function (id) { var n = parseInt(id.slice(1), 10); return '<a class="chip" data-close href="#/t/' + n + '">' + n + '-mavzu</a>'; }).join('') + '</div>';
    h += '<p class="muted" style="font-size:12.5px;margin:14px 0 0">Öquv maʼlumotnomasi. Dozani va qöllaşni faqat şifokor belgilaydi.</p><div class="btn-row"><button class="btn tonal" data-close>Yopiş</button></div>';
    A.openDlg(h);
  }

  /* ======================================================
     RETSEPT SIMULYATORI
     ====================================================== */
  var FORMS = [
    { k: 'tab', n: 'Tabletka', lat: 'Tab.', mode: 'dtd', hint: 'masalan: 0,5' },
    { k: 'cap', n: 'Kapsula', lat: 'Caps.', mode: 'dtd', hint: 'masalan: 0,25' },
    { k: 'amp', n: 'Ampula (inʼyeksiya)', lat: 'Sol.', mode: 'amp', hint: 'masalan: 1% — 2 ml' },
    { k: 'sol', n: 'Eritma (içiş, tomçi)', lat: 'Sol.', mode: 'ds', hint: 'masalan: 1% — 10 ml' },
    { k: 'ung', n: 'Surtma', lat: 'Ung.', mode: 'ds', hint: 'masalan: 1% — 30,0' },
    { k: 'sup', n: 'Şam', lat: 'Supp.', mode: 'dtd', hint: 'masalan: 0,1' }
  ];
  function genitive(l) {
    l = (l || '').trim();
    if (!l || /\s/.test(l)) return l;
    if (/um$/i.test(l)) return l.replace(/um$/i, 'i');
    if (/us$/i.test(l)) return l.replace(/us$/i, 'i');
    if (/a$/i.test(l)) return l.replace(/a$/i, 'ae');
    return l;
  }
  R.rx = function () {
    A.setTab('tools'); A.setBar({ back: '#/tools', title: 'Retsept' });
    view.innerHTML = head('Retsept simulyatori', 'Retseptni töldiring, sayt uni tekşiradi') + '<div id="rxb"><div class="spinner"></div></div>';
    A.onScroll();
    loadDrugs().then(function (all) {
      var el = $('#rxb'); if (!el) return;
      var sorted = all.slice().sort(function (a, b) { return A.uzCmp({ t: a.n }, { t: b.n }); });
      el.innerHTML = '<div class="card c-purple">' + A.cardH('doc', 'Retsept maʼlumotlari') +
        '<div class="field"><label>Bemorning F.I.Sh.</label><input id="rp" placeholder="Masalan: Karimov Aziz"></div>' +
        '<div class="grid2"><div class="field"><label>Yoşi</label><input id="ra" inputmode="numeric" placeholder="35"></div><div class="field"><label>Şifokorning F.I.Sh.</label><input id="rd" placeholder="Masalan: Rahimova N."></div></div>' +
        '<div class="field"><label>Dori</label><select id="rg">' + sorted.map(function (d) { return '<option value="' + d.idx + '">' + esc(d.n) + ' (' + esc(d.l) + ')</option>'; }).join('') + '<option value="-1">Boşqa (özim yozaman)…</option></select></div>' +
        '<div class="field" id="rlw" hidden><label>Lotinça nomi (nominativ, masalan: Analginum)</label><input id="rl"></div>' +
        '<div class="field"><label>Dori şakli</label><select id="rf">' + FORMS.map(function (f, i) { return '<option value="' + i + '">' + esc(f.n) + '</option>'; }).join('') + '</select></div>' +
        '<div class="grid2"><div class="field"><label id="rsl">Doza</label><input id="rs" value="0,5"></div><div class="field" id="rnw"><label>Soni (N)</label><input id="rn" inputmode="numeric" value="10"></div></div>' +
        '<div class="field"><label>Signatura (bemorga qöllaş usuli)</label><textarea id="rx" placeholder="Masalan: 1 tabletkadan kuniga 3 mahal, ovqatdan keyin"></textarea></div>' +
        '<div class="btn-row"><button class="btn" id="rçk">Tekşiriş</button></div><div class="btn-row"><button class="btn tonal" id="rprint">' + ic('print') + 'Çop etiş</button><button class="btn gray" id="rclr">Tozalaş</button></div></div><div id="rres"></div>';
      var last = null;
      function sync() {
        var f = FORMS[+$('#rf', el).value];
        $('#rsl', el).textContent = f.mode === 'dtd' ? 'Bitta dona dozasi (' + f.hint + ')' : 'Konsentratsiya va hajm (' + f.hint + ')';
        $('#rnw', el).hidden = f.mode === 'ds';
        $('#rlw', el).hidden = $('#rg', el).value !== '-1';
      }
      $('#rf', el).onchange = sync; $('#rg', el).onchange = sync; sync();
      function check() {
        var f = FORMS[+$('#rf', el).value], gi = +$('#rg', el).value, d = gi >= 0 ? all[gi] : null;
        var name = $('#rp', el).value.trim(), age = num($('#ra', el).value), doc = $('#rd', el).value.trim(), dose = $('#rs', el).value.trim(), n = num($('#rn', el).value), sig = $('#rx', el).value.trim();
        var lat = d ? d.l : $('#rl', el).value.trim(), gen = genitive(lat), cs = [];
        function c(t, ok, w) { cs.push([ok ? 'ok' : (w ? 'wn' : 'no'), t]); }
        c('Bemor F.I.Sh. töliq yozilgan', name.split(/\s+/).filter(Boolean).length >= 2);
        c('Bemor yoşi körsatilgan (0–120)', isFinite(age) && age >= 0 && age <= 120);
        c('Şifokor F.I.Sh. körsatilgan (imzo va şaxsiy muhr uçun)', !!doc, true);
        c('Dori nomi lotin tilida, genitivda: ' + (lat ? '<span class="lat">' + esc(gen) + '</span>' : '—'), !!lat);
        c('Doza / konsentratsiya raqam bilan körsatilgan', /\d/.test(dose));
        if (f.mode !== 'ds') c('Soni (N) — butun musbat son', isFinite(n) && n >= 1 && Math.floor(n) === n);
        c('Signatura aniq: qança, neça marta, qaçon', sig.length >= 8 && /\d|bir|ikki|uç|kuniga|mahal|marta/i.test(sig), true);
        if (d && d.gi === 0) cs.push(['wn', 'Narkotik vosita: maxsus blankada, belgilangan tartibda va qisqa kursga yoziladi']);
        var line1 = 'Rp.: ' + f.lat + ' ' + gen + ' ' + dose;
        var line2 = f.mode === 'dtd' ? 'D.t.d. N. ' + (isFinite(n) ? n : '__') : f.mode === 'amp' ? 'D.t.d. N. ' + (isFinite(n) ? n : '__') + ' in amp.' : 'D.S.';
        var line3 = (f.mode === 'ds' ? 'D.S. ' : 'S. ') + sig;
        if (f.mode === 'ds') { line2 = 'D.S. ' + sig; line3 = ''; }
        last = { name: name, age: isFinite(age) ? age : '', doc: doc, text: [line1, line2, line3].filter(Boolean).join('\n') };
        var ok = cs.filter(function (x) { return x[0] === 'ok'; }).length;
        $('#rres', el).innerHTML = '<div class="card">' + A.cardH('check', 'Retsept va tekşiruv natijasi') + '<div class="rxbox">' + esc(last.text) + '</div>' +
          '<div class="sub-lbl">Tekşiruv: ' + ok + ' / ' + cs.length + '</div>' + cs.map(function (x) { return '<div class="chk ' + x[0] + '"><i>' + (x[0] === 'ok' ? '✓' : x[0] === 'no' ? '✕' : '!') + '</i><span>' + x[1] + '</span></div>'; }).join('') +
          (d && d.rx ? '<div class="sub-lbl">Maʼlumotnomadagi namuna</div><div class="rxbox">' + esc(d.rx) + '</div>' : '') +
          '<p class="muted" style="font-size:12.5px;margin:10px 0 0">Lotinça genitiv qoidasi taxminiy (-um → -i, -a → -ae, -us → -i). Köp sözli nomlarni qölda tekşiring.</p></div>';
        $('#rres', el).scrollIntoView && $('#rres', el).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      $('#rçk', el).onclick = check;
      $('#rprint', el).onclick = function () {
        if (!last) check();
        A.printHtml('<div class="blank"><h4>' + esc(M.org) + '</h4><h3>RETSEPT</h3>' +
          '<div class="ln-f"><b>Bemor:</b><span style="flex:1">' + esc(last.name) + '</span><b>Yoşi:</b><span>' + esc(last.age) + '</span></div>' +
          '<div class="ln-f"><b>Şifokor:</b><span style="flex:1">' + esc(last.doc) + '</span><b>Sana:</b><span>' + dstamp(Date.now()).slice(0, 10) + '</span></div>' +
          '<div style="white-space:pre-line;font-size:20px;margin:22px 0 60px;line-height:1.9">' + esc(last.text) + '</div>' +
          '<div class="ln-f" style="justify-content:flex-end"><b>Şifokor imzosi va şaxsiy muhri</b><span style="width:160px"></span></div></div>', false);
      };
      $('#rclr', el).onclick = function () { $$('input[id^="r"],textarea', el).forEach(function (x) { if (x.id !== 'rs' && x.id !== 'rn') x.value = ''; }); $('#rres', el).innerHTML = ''; last = null; };
    });
  };

  /* ======================================================
     KALKULYATORLAR
     ====================================================== */
  function calcCard(parent, s) {
    var el = document.createElement('div'); el.className = 'card c-' + s.color;
    el.innerHTML = A.cardH('calc', esc(s.title)) + '<div class="grid2">' + s.fields.map(function (f) {
      return '<div class="field"><label>' + esc(f.label) + '</label>' + (f.opts ? '<select data-f="' + f.id + '">' + f.opts.map(function (o) { return '<option value="' + o[0] + '">' + esc(o[1]) + '</option>'; }).join('') + '</select>' : '<input data-f="' + f.id + '" inputmode="decimal" value="' + f.v + '">') + '</div>';
    }).join('') + '</div><div class="result-box"></div>' + (s.note ? '<p class="muted" style="font-size:13px;margin:10px 0 0">' + s.note + '</p>' : '');
    parent.appendChild(el);
    function run() {
      var v = {};
      $$('[data-f]', el).forEach(function (x) { v[x.getAttribute('data-f')] = x.tagName === 'SELECT' ? +x.value : num(x.value); });
      $('.result-box', el).innerHTML = s.compute(v) || '<small>Qiymatlarni kiriting</small>';
    }
    $$('[data-f]', el).forEach(function (x) { x.oninput = run; x.onchange = run; });
    run();
  }
  function ok(x) { return isFinite(x) && x > 0; }
  R.calc = function () {
    A.setTab('tools'); A.setBar({ back: '#/tools', title: 'Kalkulyatorlar' });
    view.innerHTML = head('Kalkulyatorlar', 'Dori hisob-kitoblari: öquv namunasi') + '<div id="cb"></div>';
    A.onScroll();
    var box = $('#cb');
    A.WIDGETS.dose(box);
    var h2 = document.createElement('div'); h2.className = 'h2'; h2.textContent = 'Qöşimça kalkulyatorlar'; box.appendChild(h2);
    calcCard(box, {
      color: 'orange', title: 'Bolalar dozasi (kattalar dozasidan)',
      fields: [{ id: 'ad', label: 'Kattalar dozasi, mg', v: '500' }, { id: 'ag', label: 'Bola yoşi, yil', v: '6' }, { id: 'wt', label: 'Bola vazni, kg', v: '20' }],
      compute: function (v) {
        if (!ok(v.ad) || !ok(v.ag) || !ok(v.wt)) return '';
        var y = v.ag / (v.ag + 12) * v.ad, c = v.wt / 70 * v.ad;
        return '<b>' + fmt(y, 0) + ' mg (yoş böyiça)</b><small>Yang formulasi: yoş ÷ (yoş + 12) × kattalar dozasi = ' + fmt(v.ag, 0) + ' ÷ ' + fmt(v.ag + 12, 0) + ' × ' + fmt(v.ad, 0) + ' = ' + fmt(y, 1) + ' mg</small>' +
          '<small>Klark formulasi: vazn ÷ 70 × kattalar dozasi = ' + fmt(c, 1) + ' mg</small>';
      },
      note: 'Zamonaviy amaliyotda bolalar dozasi mg/kg yoki yoşga mos jadval böyiça şifokor tomonidan belgilanadi; bu hisob faqat öquv uçun.'
    });
    calcCard(box, {
      color: 'purple', title: 'Insulin: birlikdan millilitrga',
      fields: [{ id: 'u', label: 'Tayinlangan doza, birlik (TB)', v: '12' }, { id: 'c', label: 'Insulin konsentratsiyasi', opts: [[40, '40 TB/ml (U-40)'], [100, '100 TB/ml (U-100)']] }],
      compute: function (v) {
        if (!ok(v.u) || !ok(v.c)) return '';
        return '<b>' + fmt(v.u / v.c, 2) + ' ml</b><small>' + fmt(v.u, 0) + ' TB ÷ ' + v.c + ' TB/ml = ' + fmt(v.u / v.c, 3) + ' ml</small>';
      },
      note: 'Insulin faqat konsentratsiyasiga mos insulin şprisi (yoki şpris-ruçka) bilan ölçanadi. Dozani ikkinçi xodim bilan tekşiring.'
    });
    calcCard(box, {
      color: 'teal', title: 'Quruq dorini suyultiriş',
      fields: [{ id: 'q', label: 'Flakondagi miqdor (TB yoki mg)', v: '1000000' }, { id: 'sv', label: 'Erituvçi hajmi, ml', v: '10' }, { id: 'nd', label: 'Kerakli doza (şu birlikda)', v: '500000' }],
      compute: function (v) {
        if (!ok(v.q) || !ok(v.sv) || !ok(v.nd)) return '';
        var conc = v.q / v.sv, ml = v.nd / conc;
        return '<b>' + fmt(ml, 2) + ' ml</b><small>Konsentratsiya: ' + fmt(v.q, 0) + ' ÷ ' + fmt(v.sv, 0) + ' ml = ' + fmt(conc, 0) + ' birlik/ml; ' + fmt(v.nd, 0) + ' ÷ ' + fmt(conc, 0) + ' = ' + fmt(ml, 2) + ' ml</small>';
      },
      note: 'Erituvçining turi va hajmi preparat yöriqnomasida körsatiladi. Suyultirilgan eritmaga sana, vaqt va konsentratsiya yoziladi.'
    });
    calcCard(box, {
      color: 'blue', title: 'Foizli eritmani suyultiriş',
      fields: [{ id: 'c1', label: 'Boşlanğiç konsentratsiya, %', v: '10' }, { id: 'c2', label: 'Kerakli konsentratsiya, %', v: '5' }, { id: 'v2', label: 'Tayyorlanadigan hajm, ml', v: '200' }],
      compute: function (v) {
        if (!ok(v.c1) || !ok(v.c2) || !ok(v.v2)) return '';
        if (v.c2 >= v.c1) return '<small>Kerakli konsentratsiya boşlanğiçdan kiçik bölişi kerak</small>';
        var v1 = v.c2 * v.v2 / v.c1;
        return '<b>' + fmt(v1, 1) + ' ml asosiy eritma + ' + fmt(v.v2 - v1, 1) + ' ml erituvçi</b><small>V₁ = C₂ × V₂ ÷ C₁ = ' + fmt(v.c2, 1) + ' × ' + fmt(v.v2, 0) + ' ÷ ' + fmt(v.c1, 1) + ' = ' + fmt(v1, 1) + ' ml; erituvçi = ' + fmt(v.v2, 0) + ' − ' + fmt(v1, 1) + ' = ' + fmt(v.v2 - v1, 1) + ' ml</small>';
      }
    });
    calcCard(box, {
      color: 'green', title: 'Infuziya qança vaqt davom etadi',
      fields: [{ id: 'iv', label: 'Eritma hajmi, ml', v: '400' }, { id: 'dr', label: 'Tezlik, tomçi/daq', v: '40' }, { id: 'st', label: 'Infuziya tizimi', opts: [[20, 'Makro: 20 tomçi = 1 ml'], [60, 'Mikro: 60 tomçi = 1 ml']] }],
      compute: function (v) {
        if (!ok(v.iv) || !ok(v.dr)) return '';
        var min = v.iv * v.st / v.dr;
        return '<b>' + Math.floor(min / 60) + ' soat ' + Math.round(min % 60) + ' daqiqa</b><small>t = V × ' + v.st + ' ÷ tomçi/daq = ' + fmt(v.iv, 0) + ' × ' + v.st + ' ÷ ' + fmt(v.dr, 0) + ' = ' + fmt(min, 0) + ' daqiqa</small>';
      }
    });
  };

  /* ======================================================
     VAZIYATLI SIMULYATOR
     ====================================================== */
  var RANK = { bad: 0, ok: 1, good: 2 }, RES = { good: ['Töğri harakatlar', 'green'], ok: ['Qisman töğri', 'orange'], bad: ['Xavfli oqibat', 'red'] };
  R.sim = function (args) {
    A.setTab('tools');
    view.innerHTML = head('Simulyator', 'Yuklanmoqda…') + '<div id="sm"><div class="spinner"></div></div>';
    loadScript('assets/scenarios.js' + V).then(function () {
      var list = (window.PSX_S || {}).all || [], sc = list.filter(function (s) { return s.id === args[0]; })[0];
      if (sc) return simPlay(sc);
      A.setBar({ back: '#/tools', title: 'Simulyator' });
      var best = get('sim', {});
      view.innerHTML = head('Simulyator', 'Qaror qabul qiling, oqibatni köring') + '<div class="list">' + list.map(function (s) {
        var b = best[s.id];
        return '<a class="row c-' + (b ? RES[b][1] : 'blue') + '" href="#/sim/' + s.id + '"><div class="ico">' + ic('alert') + '</div><div class="grow"><div class="t">' + esc(s.title) + '</div><div class="s"><span class="badge">' + esc(s.level) + '</span>' + (b ? 'Eng yaxşi: ' + RES[b][0] : 'Hali öynalmagan') + '</div></div>' + ic('chev', 'chev') + '</a>';
      }).join('') + '</div><p class="muted" style="font-size:13px;margin:0 8px">Stsenariylar öquv maqsadida; amalda har doim şifokor körsatmasi va muassasa protokoli asosida iş tutiladi.</p>';
      A.onScroll();
    });
  };
  function simPlay(sc) {
    A.setBar({ back: '#/sim', title: sc.title });
    view.innerHTML = head(esc(sc.title), esc(sc.level), true) + '<div class="card"><p>' + rich(sc.intro) + '</p></div><div id="sbox"></div>';
    A.onScroll();
    var box = $('#sbox'), st = { ok: 0, n: 0 };
    function show(id) {
      var n = sc.nodes[id];
      if (n.end) return fin(n);
      box.innerHTML = '<div class="q-meta"><span>Qaror ' + (st.n + 1) + '</span><span>Töğri qarorlar: ' + st.ok + '</span></div><div class="card"><p style="margin:0">' + rich(n.text) + '</p></div>' +
        n.opts.map(function (o, k) { return '<button class="case-opt" data-k="' + k + '">' + rich(o.t) + '</button>'; }).join('') + '<div id="sfb"></div>';
      $$('.case-opt', box).forEach(function (b) {
        b.onclick = function () {
          var k = +b.getAttribute('data-k'), o = n.opts[k];
          st.n++; if (o.ok) st.ok++;
          $$('.case-opt', box).forEach(function (x) { var kk = +x.getAttribute('data-k'); x.disabled = true; if (n.opts[kk].ok) x.classList.add('ok'); else if (kk === k) x.classList.add('bad'); });
          $('#sfb', box).innerHTML = '<div class="explain"><b>' + (o.ok ? '✓ Töğri qaror. ' : 'Bu eng yaxşi qaror emas. ') + '</b>' + rich(o.fb) + '</div><div class="btn-row"><button class="btn">Davom etiş</button></div>';
          $('#sfb .btn', box).onclick = function () { show(o.next); };
          $('#sfb', box).scrollIntoView && $('#sfb', box).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        };
      });
    }
    function fin(n) {
      var best = get('sim', {}); if (best[sc.id] == null || RANK[n.result] > RANK[best[sc.id]]) { best[sc.id] = n.result; put('sim', best); }
      var r = RES[n.result], tn = sc.topic ? parseInt(sc.topic.slice(1), 10) : 0;
      box.innerHTML = '<div class="card result c-' + r[1] + '"><div class="gauge" style="--p:' + Math.round(st.ok / Math.max(1, st.n) * 100) + '"><div><b>' + st.ok + '/' + st.n + '</b><span>töğri qaror</span></div></div><h2>' + r[0] + '</h2><p class="muted" style="text-align:left">' + rich(n.text) + '</p>' +
        '<div class="btn-row"><button class="btn" id="sRe">Qayta öynaş</button></div><div class="btn-row"><a class="btn tonal" href="#/sim">Boşqa stsenariylar</a>' + (tn ? '<a class="btn tonal" href="#/t/' + tn + '">' + tn + '-mavzu</a>' : '') + '</div></div>';
      $('#sRe', box).onclick = function () { st.ok = 0; st.n = 0; show(sc.start); };
    }
    show(sc.start);
  }

  /* ======================================================
     DORILAR O'YINI
     ====================================================== */
  R.game = function () {
    A.setTab('tools'); A.setBar({ back: '#/tools', title: 'Dorilar öyini' });
    view.innerHTML = head('Dorilar öyini', '10 ta savol, tanlang') + '<div id="gm"><div class="spinner"></div></div>';
    A.onScroll();
    loadDrugs().then(function (all) {
      var el = $('#gm'); if (!el) return;
      if (all.length < 20) { el.innerHTML = '<div class="empty">Dorilar maʼlumotlari yetarli emas.</div>'; return; }
      function menu() {
        A.setBar({ back: '#/tools', title: 'Dorilar öyini' });
        el.innerHTML = '<div class="list">' + [['grp', 'Dori → guruh', 'Dori qaysi guruhga kiradi?', 'blue'], ['lat', 'Lotinça nom ↔ dori', 'Retsept uçun lotinça nomlarni örganing', 'purple'], ['odd', 'Ortiqçasini toping', 'Qaysi dori boşqa guruhga mansub?', 'orange']].map(function (x) {
          return '<button class="row c-' + x[3] + '" data-m="' + x[0] + '"><div class="ico">' + ic('play') + '</div><div class="grow"><div class="t">' + x[1] + '</div><div class="s">' + x[2] + '</div></div>' + ic('chev', 'chev') + '</button>';
        }).join('') + '</div>';
        $$('[data-m]', el).forEach(function (b) { b.onclick = function () { play(b.getAttribute('data-m')); }; });
      }
      function mk(mode) {
        var qs = [];
        if (mode === 'grp') {
          shuffle(all).slice(0, 10).forEach(function (d) {
            var o = shuffle([d.gi].concat(shuffle(GROUPS.map(function (_, i) { return i; }).filter(function (i) { return i !== d.gi; })).slice(0, 3)));
            qs.push({ q: '<span class="lat">' + esc(d.l) + '</span> (' + esc(d.n) + ') qaysi guruhga kiradi?', o: o.map(function (i) { return GROUPS[i].n; }), a: o.indexOf(d.gi) });
          });
        } else if (mode === 'lat') {
          shuffle(all).slice(0, 10).forEach(function (d, i) {
            var oth = shuffle(all.filter(function (x) { return x !== d; })).slice(0, 3);
            if (i % 2 === 0) { var o = shuffle([d].concat(oth)); qs.push({ q: 'Retseptda <span class="lat">' + esc(d.l) + '</span> qaysi dori?', o: o.map(function (x) { return x.n; }), a: o.indexOf(d) }); }
            else { var o2 = shuffle([d].concat(oth)); qs.push({ q: '“' + esc(d.n) + '” dorisining lotinça nomi qaysi?', o: o2.map(function (x) { return '<span class="lat">' + esc(x.l) + '</span>'; }), a: o2.indexOf(d) }); }
          });
        } else {
          var gs = shuffle(GROUPS.map(function (_, i) { return i; }).filter(function (i) { return all.filter(function (d) { return d.gi === i; }).length >= 3; }));
          for (var k = 0; k < 10; k++) {
            var gi = gs[k % gs.length], same = shuffle(all.filter(function (d) { return d.gi === gi; })).slice(0, 3);
            var odd = shuffle(all.filter(function (d) { return d.gi !== gi; }))[0], o3 = shuffle(same.concat([odd]));
            qs.push({ q: 'Quyidagi dorilardan uçtasi bitta guruhga (“' + esc(GROUPS[gi].n) + '”) kiradi. Qaysi biri boşqa guruhga mansub?', o: o3.map(function (x) { return x.n; }), a: o3.indexOf(odd) });
          }
        }
        return qs;
      }
      function play(mode) {
        A.setBar({ back: '#/game', title: 'Dorilar öyini' });
        A.runQuiz(el, function () { return mk(mode); }, function () {});
      }
      menu();
    });
  };

  /* ======================================================
     IMTIHON REJIMI
     ====================================================== */
  R.exam = function () {
    A.setTab('tests'); A.setBar({ back: '#/tests', title: 'Imtihon' });
    var hist = get('exams', []), wr = get('wrongs', []);
    view.innerHTML = head('Imtihon', '30 savol · 40 daqiqa') +
      '<div class="card c-green">' + A.cardH('clock', 'Imtihon qoidalari') + '<ul><li>Har mavzudan 1 tadan, jami 30 ta savol.</li><li>Vaqt 40 daqiqa. Vaqt tugasa, imtihon özi topşiriladi.</li><li>Javobni özgartiriş va savollar orasida yuriş mumkin.</li><li>Natija: baho (5/4/3/2) va bölimlar böyiça.</li></ul><div class="btn-row"><button class="btn green" id="exGo">Imtihonni boşlaş</button></div></div>' +
      (wr.length ? '<div class="card c-red">' + A.cardH('alert', 'Xatolar ustida işlaş') + '<p class="muted">Oldingi imtihonlarda xato qilingan ' + wr.length + ' ta savol saqlangan. Töğri javob bergan savollaringiz röyxatdan öçadi.</p><div class="btn-row"><button class="btn tonal" id="exWr">Xatolarni takrorlaş</button></div></div>' : '') +
      (hist.length ? '<div class="sub-h">Oxirgi natijalar</div><div class="list">' + hist.map(function (h) {
        var g = A.grade(h.p);
        return '<div class="row noicon c-' + g[1] + '" style="cursor:default"><div class="gauge sm" style="--p:' + h.p + '"><div><b>' + h.p + '</b></div></div><div class="grow"><div class="t">Baho: ' + g[2] + ' (' + g[0] + ')</div><div class="s">' + dstamp(h.d) + ' · ' + h.r + ' / ' + h.n + '</div></div></div>';
      }).join('') + '</div>' : '');
    A.onScroll();
    $('#exGo').onclick = function () {
      A.loadAll().then(function () {
        var qs = [];
        TOPICS.forEach(function (t, i) {
          var d = window.PSX_T && window.PSX_T[t.id]; if (!d || !d.tests || !d.tests.length) return;
          var q = d.tests[Math.floor(Math.random() * d.tests.length)], ord = shuffle(q.o.map(function (_, k) { return k; }));
          qs.push({ q: q.q, o: ord.map(function (k) { return q.o[k]; }), a: ord.indexOf(q.a), t: i, sel: -1 });
        });
        if (qs.length) runExam(qs);
      });
    };
    var wb = $('#exWr');
    if (wb) wb.onclick = function () {
      view.innerHTML = head('Xatolar', 'Takrorlaş') + '<div id="wq"></div>';
      A.onScroll();
      A.runQuiz($('#wq'), function () { return A.prepQs(get('wrongs', [])); }, function (p, wrong, qs) {
        var asked = qs.map(function (x) { return x.q; }), bad = {};
        wrong.forEach(function (x) { bad[x.q] = 1; });
        put('wrongs', get('wrongs', []).filter(function (w) { return asked.indexOf(w.q) < 0 || bad[w.q]; }));
      });
    };
  };
  function runExam(qs) {
    A.setBar({ back: '#/exam', title: 'Imtihon' });
    var cur = 0, left = 40 * 60, timer = null;
    view.innerHTML = head('Imtihon', 'Javoblarni belgilab, oxirida topşiring') + '<div id="exb"></div>';
    A.onScroll();
    var box = $('#exb');
    function stop() { clearInterval(timer); timer = null; }
    function tm() { return pad(Math.floor(left / 60)) + ':' + pad(left % 60); }
    function draw() {
      var q = qs[cur], done = qs.filter(function (x) { return x.sel >= 0; }).length;
      box.innerHTML = '<div class="exam-top"><span class="muted">Javob berildi: ' + done + ' / ' + qs.length + '</span><span class="timer' + (left < 300 ? ' low' : '') + '" id="tmr">' + tm() + '</span></div>' +
        '<div class="qgrid">' + qs.map(function (x, i) { return '<button class="qn' + (i === cur ? ' cur' : x.sel >= 0 ? ' done' : '') + '" data-i="' + i + '">' + (i + 1) + '</button>'; }).join('') + '</div>' +
        '<div class="q-text">' + (cur + 1) + '. ' + rich(q.q) + '</div>' + q.o.map(function (o, k) { return '<button class="opt' + (q.sel === k ? ' sel' : '') + '" data-k="' + k + '"><span class="let">' + 'ABCD'[k] + '</span><span>' + rich(o) + '</span></button>'; }).join('') +
        '<div class="btn-row"><button class="btn gray" id="exPv"' + (cur ? '' : ' disabled') + '>Oldingi</button><button class="btn tonal" id="exNx"' + (cur < qs.length - 1 ? '' : ' disabled') + '>Keyingi</button></div><div class="btn-row"><button class="btn green" id="exEnd">Topşiriş</button></div>';
      $$('.qn', box).forEach(function (b) { b.onclick = function () { cur = +b.getAttribute('data-i'); draw(); }; });
      $$('.opt', box).forEach(function (b) { b.onclick = function () { q.sel = +b.getAttribute('data-k'); draw(); }; });
      $('#exPv', box).onclick = function () { cur--; draw(); };
      $('#exNx', box).onclick = function () { cur++; draw(); };
      $('#exEnd', box).onclick = function () {
        var un = qs.length - done;
        if (!un) return fin();
        A.openDlg('<h2>Topşiriş</h2><p class="muted">' + un + ' ta savolga javob berilmagan. Baribir topşirasizmi?</p><div class="btn-row"><button class="btn tonal" data-close>Davom etiş</button><button class="btn" id="exYes">Topşiriş</button></div>');
        $('#exYes').onclick = function () { A.closeDlg(); fin(); };
      };
    }
    timer = setInterval(function () {
      var t = $('#tmr');
      if (!t || !document.body.contains(box)) return stop();
      left--; t.textContent = tm(); if (left < 300) t.classList.add('low');
      if (left <= 0) fin();
    }, 1000);
    function fin() {
      stop();
      var right = qs.filter(function (x) { return x.sel === x.a; }).length, p = Math.round(right / qs.length * 100), g = A.grade(p);
      var hist = get('exams', []); hist.unshift({ d: Date.now(), p: p, r: right, n: qs.length }); put('exams', hist.slice(0, 10));
      var wr = get('wrongs', []);
      qs.forEach(function (x) {
        if (x.sel === x.a) wr = wr.filter(function (w) { return w.q !== x.q; });
        else if (!wr.some(function (w) { return w.q === x.q; })) wr.push({ q: x.q, o: x.o, a: x.a });
      });
      put('wrongs', wr.slice(-100));
      A.setBar({ back: '#/exam', title: 'Natija' });
      var wrongs = qs.filter(function (x) { return x.sel !== x.a; });
      box.innerHTML = '<div class="card result c-' + g[1] + '"><div class="gauge" style="--p:' + p + '"><div><b>' + p + '%</b><span>' + right + ' / ' + qs.length + '</span></div></div><h2>Baho: ' + g[2] + '</h2><p class="muted">' + g[0] + '</p></div>' +
        '<div class="card">' + A.cardH('chart', 'Bölimlar böyiça') + P.sections.map(function (s) {
          var it = qs.filter(function (x) { return TOPICS[x.t].sec === s; }), r = it.filter(function (x) { return x.sel === x.a; }).length, pc = it.length ? Math.round(r / it.length * 100) : 0;
          return '<div class="sec-res c-' + s.color + '"><span class="ico" style="width:30px;height:30px;border-radius:50%;font-size:13px">' + s.n + '</span><div class="bar"><i style="width:' + pc + '%"></i></div><span style="min-width:62px;text-align:right;font-weight:700">' + r + ' / ' + it.length + '</span></div>';
        }).join('') + '</div>' +
        (wrongs.length ? '<div class="sub-h">Xatolar</div><div class="list">' + wrongs.map(function (x) {
          return '<div class="row noicon" style="cursor:default"><div class="grow"><div class="t">' + rich(x.q) + '</div><div class="s" style="color:var(--red)">Sizniki: ' + (x.sel >= 0 ? rich(x.o[x.sel]) : 'javob berilmagan') + '</div><div class="s" style="color:var(--green)">✓ ' + rich(x.o[x.a]) + '</div></div></div>';
        }).join('') + '</div>' : '') +
        '<div class="btn-row"><a class="btn" href="#/exam">Imtihon sahifasi</a></div>';
      window.scrollTo(0, 0);
    }
    draw();
  }

  /* ======================================================
     ÇOP ETILADIGAN BLANKLAR
     ====================================================== */
  function tbl(cols, rows) {
    return '<table><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>' + new Array(rows + 1).join('<tr>' + cols.map(function () { return '<td></td>'; }).join('') + '</tr>') + '</table>';
  }
  function lines(arr) { return arr.map(function (x) { return '<div class="ln-f"><b>' + x + '</b><span style="flex:1"></span></div>'; }).join(''); }
  var BLANKS = {
    rx: { t: 'Retsept blankasi', d: 'Şifokor retsepti uçun böş blanka', land: false, html: function () {
      return '<div class="blank"><h4>' + esc(M.org) + '</h4><h3>RETSEPT</h3>' + lines(['Sana:', 'Bemorning F.I.Sh. va yoşi:', 'Şifokorning F.I.Sh.:']) +
        '<div style="margin:18px 0 6px"><b>Rp.:</b></div>' + lines(['', '', '', '']) + '<div style="margin:18px 0 6px"><b>S.:</b></div>' + lines(['', '']) +
        '<div class="ln-f" style="margin-top:30px;justify-content:flex-end"><b>Şifokor imzosi va şaxsiy muhri</b><span style="width:160px"></span></div></div>';
    } },
    narc: { t: 'Narkotik vositalar hisobi jurnali', d: 'Narkotik va psixotrop vositalarni hisobga oliş', land: true, html: function () {
      return '<div class="blank"><h4>' + esc(M.org) + '</h4><h3>NARKOTIK VA PSIXOTROP VOSITALARNI HISOBGA OLIŞ JURNALI</h3>' +
        tbl(['№', 'Sana', 'Bemor F.I.Sh. (KT №)', 'Dori nomi va dozasi', 'Olindi (amp.)', 'Sarflandi (amp.)', 'Qoldiq (amp.)', 'Böş ampula topşirildi', 'Hamşira imzosi', 'Şifokor imzosi'], 14) +
        '<p style="font-size:12px;margin:8px 0 0">Jurnal sahifalari raqamlangan, ip bilan tikilgan va muhrlangan bölişi kerak. Yozuvlar tuzatilmaydi, xato bölsa belgilangan tartibda töğrilanadi.</p></div>';
    } },
    fefo: { t: 'Dorilar muddati va harorat jurnali', d: 'FEFO, min-max zaxira va muzlatkiç harorati', land: true, html: function () {
      return '<div class="blank"><h4>' + esc(M.org) + '</h4><h3>DORI VOSITALARINI SAQLAŞ JURNALI (FEFO)</h3>' +
        tbl(['№', 'Dori nomi', 'Seriya', 'Yaroqlilik muddati', 'Soni', 'Saqlaş joyi', 'Min zaxira', 'Max zaxira', 'Tekşirgan imzo'], 9) +
        '<h3 style="margin-top:18px">MUZLATKIÇ HARORATI (+2…+8 °C)</h3>' + tbl(['Sana', 'Ertalab, °C', 'Keçqurun, °C', 'Imzo', 'Sana', 'Ertalab, °C', 'Keçqurun, °C', 'Imzo'], 5) + '</div>';
    } },
    order: { t: 'Dori tayinlaş varaği', d: 'Bemor uçun tayinlangan dorilar jadvali', land: true, html: function () {
      return '<div class="blank"><h4>' + esc(M.org) + '</h4><h3>DORI TAYINLAŞ VARAĞI</h3><div class="cols">' + lines(['Bemor F.I.Sh.:', 'Palata / kasallik tarixi №:', 'Taşxis:', 'Dori allergiyasi:']) + '</div>' +
        tbl(['№', 'Dori nomi', 'Doza', 'Yuboriş yöli', 'Kuniga neça marta', 'Vaqti', 'Bajardi (imzo)', 'Izoh'], 12) + '</div>';
    } }
  };
  R.blank = function (args) {
    A.setTab('tools');
    var b = BLANKS[args[0]];
    if (!b) {
      A.setBar({ back: '#/tools', title: 'Blanklar' });
      view.innerHTML = head('Blanklar', 'Çop etib işlatiladigan şakllar') + '<div class="list">' + Object.keys(BLANKS).map(function (k) {
        return '<a class="row c-blue" href="#/blank/' + k + '"><div class="ico">' + ic('print') + '</div><div class="grow"><div class="t">' + BLANKS[k].t + '</div><div class="s">' + BLANKS[k].d + '</div></div>' + ic('chev', 'chev') + '</a>';
      }).join('') + '</div><p class="muted" style="font-size:13px;margin:0 8px">“Çop etiş” tugmasidan söng printer örniga “PDF sifatida saqlaş” ni tanlab, PDF fayl oliş mumkin.</p>';
      A.onScroll(); return;
    }
    A.setBar({ back: '#/blank', title: b.t });
    view.innerHTML = head(b.t, b.d, true) + '<div class="btn-row noprint" style="margin:0 0 14px"><button class="btn" id="bpr">' + ic('print') + 'Çop etiş / PDF</button></div>' + b.html();
    A.onScroll();
    $('#bpr').onclick = function () { A.printHtml(b.html(), b.land); };
  };

  /* ---------- Oflayn rejim (PWA) ---------- */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  }
};
