/* Farmakologiya RTR — Samsung One UI uslubidagi bir sahifali ilova (internetsiz işlaydi) */
(function () {
  'use strict';
  var P = window.PSX, M = P.module;
  var view = document.getElementById('view');
  var bar = document.getElementById('toolbar');
  var tbBack = document.getElementById('tbBack');
  var tbTitle = document.getElementById('tbTitle');
  var tbRight = document.getElementById('tbRight');

  /* ---------- Yordamçilar ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  /* Faqat <span class="lat"> ruxsat etiladi, qolgani escape qilinadi */
  function rich(s) { return esc(s).replace(/&lt;span class=&quot;lat&quot;&gt;/g, '<span class="lat">').replace(/&lt;\/span&gt;/g, '</span>'); }
  function plain(s) { return String(s || '').replace(/<[^>]+>/g, ''); }
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function ic(id, cls) { return '<svg' + (cls ? ' class="' + cls + '"' : '') + '><use href="#i-' + id + '"/></svg>'; }
  var LS = 'frm1:';
  function get(k, d) { try { var v = localStorage.getItem(LS + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(LS + k, JSON.stringify(v)); } catch (e) {} }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function num(v) { var x = parseFloat(String(v).replace(',', '.')); return isFinite(x) ? x : NaN; }
  function fmt(x, d) { if (!isFinite(x)) return '—'; var s = (Math.round(x * Math.pow(10, d)) / Math.pow(10, d)).toString(); return s.replace('.', ','); }

  /* ---------- Ma'lumotlar ---------- */
  var TOPICS = P.topics.map(function (t, i) {
    var sec = P.sections[t[2] - 1];
    return { n: i + 1, id: 'f' + pad(i + 1), title: t[0], type: t[1], typeName: t[1] === 'A' ? 'Amaliy' : 'Nazariy', sec: sec, color: sec.color, inter: t[3] || [] };
  });
  function isRead(t) { return !!get('read', {})[t.id]; }
  function setRead(t, v) { var r = get('read', {}); if (v) r[t.id] = 1; else delete r[t.id]; put('read', r); }
  function getScore(t) { return get('score', {})[t.id]; }
  function setScore(t, p) { var s = get('score', {}); if (s[t.id] == null || p > s[t.id]) s[t.id] = p; put('score', s); }

  var loading = {};
  function loadBlock(id) {
    window.PSX_T = window.PSX_T || {};
    if (window.PSX_T[id]) return Promise.resolve(window.PSX_T[id]);
    if (loading[id]) return loading[id];
    loading[id] = new Promise(function (res) {
      var s = document.createElement('script');
      s.src = 'assets/topics/' + id + '.js?v=8';
      s.onload = function () { res(window.PSX_T[id] || null); };
      s.onerror = function () { delete loading[id]; res(null); };
      document.head.appendChild(s);
    });
    return loading[id];
  }
  function loadAll() { return Promise.all(TOPICS.map(function (t) { return loadBlock(t.id); })); }

  function applyTheme() { document.documentElement.setAttribute('data-theme', get('theme', 'auto')); }
  applyTheme();

  /* ---------- Toolbar (kengaytirilgan sarlavha yig'iladi) ---------- */
  function setBar(o) {
    o = o || {};
    tbBack.hidden = !o.back;
    if (o.back) tbBack.href = o.back;
    tbTitle.textContent = o.title || '';
    tbRight.innerHTML = o.right || '';
    onScroll();
  }
  function onScroll() {
    var ex = $('.expanded', view);
    var lim = ex ? Math.max(20, ex.offsetHeight - 70) : 10;
    bar.classList.toggle('raised', window.scrollY > lim);
    if (ex) ex.style.opacity = Math.max(0, 1 - window.scrollY / (lim + 40));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  function setTab(name) { $$('.bnav a').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-tab') === name); }); }

  function route() {
    var h = (location.hash || '#/').slice(2).split('/');
    view.classList.remove('anim'); void view.offsetWidth; view.classList.add('anim');
    window.scrollTo(0, 0);
    closeViewer();
    if (h[0] === 't') return renderTopic(+h[1], h[2] || 'lec');
    if (h[0] === 'tests') return renderTests();
    if (h[0] === 'final') return renderFinal();
    if (h[0] === 'glossary') return renderGlossary();
    if (h[0] === 'profile') return renderProfile();
    if (window.PSX_ROUTES && window.PSX_ROUTES[h[0]]) return window.PSX_ROUTES[h[0]](h.slice(1));
    renderHome();
  }
  window.addEventListener('hashchange', route);

  /* ======================================================
     BOŞ SAHIFA
     ====================================================== */
  function stat(v, l, c) { return '<div class="stat ' + (c || '') + '"><b>' + v + '</b><span>' + l + '</span></div>'; }
  function renderHome() {
    setTab('home'); setBar({ title: M.short });
    var readN = TOPICS.filter(isRead).length, pct = Math.round(readN / TOPICS.length * 100);
    var next = TOPICS.filter(function (t) { return !isRead(t); })[0];
    var html = '<div class="expanded center"><h1>' + esc(M.short) + '</h1><p>va retseptura asoslari · ' + TOPICS.length + ' mavzu</p></div>';
    html += '<div class="card profile" id="about" role="button" tabindex="0"><div class="avatar">XS</div><div class="grow"><b>' + esc(M.author) + '</b><div class="muted" style="font-size:14px">' + esc(M.org) + '</div></div>' + ic('info', 'chev') + '</div>';
    html += '<div class="stats">' + stat(M.hours.jami, 'Jami soat') + stat(M.hours.nazariy, 'Nazariy', 'c-blue') + stat(M.hours.amaliy, 'Amaliy', 'c-orange') + stat(M.hours.mustaqil, 'Mustaqil', 'c-green') + '</div>';
    html += '<div class="list"><a class="row" href="#/t/' + (next ? next.n : 1) + '"><div class="gauge sm c-green" style="--p:' + pct + '"><div><b>' + pct + '%</b></div></div><div class="grow"><div class="t">' + readN + ' / ' + TOPICS.length + ' mavzu örganildi</div><div class="s">' + (next ? 'Davom ettiriş: ' + next.n + '-mavzu' : 'Barça mavzular örganildi') + '</div></div>' + ic('chev', 'chev') + '</a></div>';
    P.sections.forEach(function (s) {
      var ts = TOPICS.filter(function (t) { return t.sec === s; });
      html += '<div class="list c-' + s.color + '"><div class="list-h"><span class="num">' + s.n + '</span><b>' + esc(s.title) + '</b></div>' + ts.map(topicRow).join('') + '</div>';
    });
    html += '<div class="footer">' + esc(M.spec_code) + ' – ' + esc(M.spec_name) + ' · ' + esc(M.qualification) + '<br>' + esc(M.org) + ', ' + esc(M.region) + '<br>' + esc(M.year) + '</div>';
    view.innerHTML = html;
    var ab = $('#about'); ab.onclick = aboutDlg; ab.onkeydown = function (e) { if (e.key === 'Enter') aboutDlg(); };
    onScroll();
  }
  function topicRow(t) {
    return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '"><div class="ico">' + t.n + '</div><div class="grow"><div class="t">' + esc(t.title) + '</div><div class="s"><span class="badge ' + t.type + '">' + t.typeName + '</span>2 soat' + (t.inter.length ? ' · interaktiv maşq' : '') + '</div></div>' +
      (isRead(t) ? '<span class="ok-dot">' + ic('check') + '</span>' : ic('chev', 'chev')) + '</a>';
  }
  function aboutDlg() {
    openDlg('<h2>Resurs haqida</h2><div class="list" style="background:var(--card2)">' +
      kv('Modul', M.title) + kv('Mutaxassislik', M.spec_code + ' – ' + M.spec_name + ' (' + M.qualification + ')') + kv('Hajmi', M.hours.jami + ' soat (' + M.credits + ' kredit): nazariy ' + M.hours.nazariy + ', amaliy ' + M.hours.amaliy + ', mustaqil ' + M.hours.mustaqil) +
      kv('Muallif', M.author) + kv('Muassasa', M.org + ', ' + M.region) + kv('Öquv yili', M.year) + '</div>' +
      '<p class="muted" style="font-size:14px">Resurs internetsiz işlaydi. Natijalar şu qurilmada saqlanadi. Dori dozalari va hisob-kitoblar öquv maqsadida berilgan: amalda dori faqat şifokor tayinlovi asosida qöllaniladi.</p>' +
      '<div class="btn-row"><button class="btn tonal" data-close>Yopiş</button></div>');
  }
  function kv(k, v) { return '<div class="row noicon" style="cursor:default;min-height:0"><div class="grow"><div class="s" style="margin:0 0 2px">' + esc(k) + '</div><div class="t">' + esc(v) + '</div></div></div>'; }

  /* ======================================================
     MAVZU SAHIFASI
     ====================================================== */
  var TABS = [['lec', 'Maʼruza'], ['pos', 'Plakat'], ['sch', 'Sxema'], ['test', 'Test'], ['glo', 'Luğat'], ['rev', 'Savollar'], ['prac', 'Maşq'], ['crit', 'Baholaş']];
  function renderTopic(n, tab) {
    var t = TOPICS[n - 1];
    if (!t) { location.hash = '#/'; return; }
    setTab('home'); setBar({ back: '#/', title: n + '-mavzu' });
    view.innerHTML = '<div class="c-' + t.color + '"><div class="expanded long"><div class="kicker">' + n + '-mavzu <span class="badge ' + t.type + '">' + t.typeName + '</span> 2 soat</div><h1>' + esc(t.title) + '</h1></div>' +
      '<div class="chips-wrap"><div class="chips" id="tchips"></div></div><div id="tabc"><div class="spinner"></div></div>' +
      '<div class="sub-h">Boşqa mavzular</div><div class="list">' + (n > 1 ? pagerRow(TOPICS[n - 2], 'Oldingi') : '') + (n < TOPICS.length ? pagerRow(TOPICS[n], 'Keyingi') : '') + '</div></div>';
    onScroll();
    Promise.all([loadBlock(t.id), loadPoster(t.n)]).then(function (r) {
      var d = r[0], poster = r[1];
      var el = $('#tabc'); if (!el) return;
      if (!d) { el.innerHTML = '<div class="empty">Mavzu materiallari hali yuklanmagan.</div>'; $('#tchips').innerHTML = ''; return; }
      var tabs = TABS.filter(function (x) {
        if (x[0] === 'pos') return !!poster;
        if (x[0] === 'sch') return d.schemes && d.schemes.length;
        if (x[0] === 'prac') return t.inter.length || (d.cases && d.cases.length);
        if (x[0] === 'crit') return d.criteria && d.criteria.length;
        return true;
      });
      if (!tabs.some(function (x) { return x[0] === tab; })) tab = 'lec';
      var chips = $('#tchips');
      chips.innerHTML = tabs.map(function (x) { return '<button class="chip" data-tab="' + x[0] + '" aria-pressed="' + (x[0] === tab) + '">' + x[1] + '</button>'; }).join('');
      function show(name) {
        $$('.chip', chips).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-tab') === name); });
        var on = $('.chip[aria-pressed="true"]', chips); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
        history.replaceState(null, '', '#/t/' + n + '/' + name);
        ({ lec: tabLecture, pos: function (e, tt) { tabPoster(e, tt, poster); }, sch: tabSchemes, test: tabTest, glo: tabGlossary, rev: tabReview, prac: tabPractice, crit: tabCriteria })[name](el, t, d);
        var top = $('.chips-wrap').offsetTop - 56;
        if (window.scrollY > top) window.scrollTo(0, top);
      }
      $$('.chip', chips).forEach(function (b) { b.onclick = function () { show(b.getAttribute('data-tab')); }; });
      show(tab);
    });
  }
  function pagerRow(t, label) { return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '"><div class="ico">' + t.n + '</div><div class="grow"><div class="s" style="margin:0">' + label + '</div><div class="t">' + esc(t.title) + '</div></div>' + ic('chev', 'chev') + '</a>'; }
  function cardH(icon, title) { return '<h3><span class="dot">' + ic(icon) + '</span>' + title + '</h3>'; }

  /* ---- Plakatlar (assets/posters/pNN.js) ---- */
  function loadPoster(n) {
    window.PSX_P = window.PSX_P || {};
    var id = 'f' + pad(n);
    if (window.PSX_P[id]) return Promise.resolve(window.PSX_P[id]);
    return new Promise(function (res) {
      var s = document.createElement('script');
      s.src = 'assets/posters/p' + pad(n) + '.js?v=8';
      s.onload = function () { res(window.PSX_P[id] || null); };
      s.onerror = function () { res(null); };
      document.head.appendChild(s);
    });
  }
  function tabPoster(el, t, p) {
    el.innerHTML = '<div class="scheme poster"><h3>' + rich(p.t) + '</h3><div class="svgbox" id="pbox" role="button" tabindex="0" aria-label="Kattalaştiriş">' + p.svg + '</div></div>' +
      '<div class="btn-row"><button class="btn tonal" id="pPng">' + ic('download') + 'PNG yuklab oliş</button><button class="btn tonal" id="pPrint">' + ic('print') + 'Çop etiş</button></div>' +
      '<p class="muted" style="font-size:13px;margin:10px 8px 0">Plakatni kattalaştiriş uçun ustiga bosing. Plakatni çop etib, sinfda devorga osiş mumkin.</p>';
    $('#pbox', el).onclick = function () { openViewer(p.svg, plain(p.t), true); };
    $('#pPng', el).onclick = function () { svgPng($('#pbox svg', el), plain(p.t)); };
    $('#pPrint', el).onclick = function () { printHtml(p.svg, false); };
  }

  function tabLecture(el, t, d) {
    var h = '<div class="card">' + cardH('star', 'Maşğulot maqsadi') + '<p>' + rich(d.goal) + '</p></div>';
    if (d.plan) h += '<div class="card">' + cardH('doc', 'Maʼruza rejasi') + '<ol>' + d.plan.map(function (p) { return '<li>' + rich(p) + '</li>'; }).join('') + '</ol></div>';
    if (d.know) h += '<div class="card">' + cardH('check', 'Öquvçi bilişi kerak') + '<ul>' + d.know.map(function (p) { return '<li>' + rich(p) + '</li>'; }).join('') + '</ul></div>';
    if (d.keywords) h += '<div class="card">' + cardH('abc', 'Kalit sözlar') + '<div class="tags">' + d.keywords.map(function (k) { return '<span class="tag">' + rich(k) + '</span>'; }).join('') + '</div></div>';
    (d.lecture || []).forEach(function (s) { h += '<article class="lec"><h2>' + rich(s.h) + '</h2>' + s.html + '</article>'; });
    if (d.selfwork) h += '<div class="card c-green">' + cardH('person', 'Mustaqil iş') + '<p>' + rich(d.selfwork) + '</p></div>';
    var done = isRead(t);
    h += '<div class="btn-row"><button class="btn ' + (done ? 'gray' : 'green') + '" id="readBtn">' + (done ? '✓ Örganilgan (bekor qiliş)' : 'Öqib çiqdim') + '</button></div>';
    h += '<div class="btn-row"><button class="btn tonal" id="toTest">Bilimni sinaş: test</button></div>';
    h += '<div class="card c-blue" style="margin-top:14px">' + cardH('download', 'Yuklab oliş') + '<p class="muted" style="font-size:14px">Maʼruza va taqdimotni qurilmaga saqlang, darsda ishlating.</p><div class="btn-row"><a class="btn tonal" href="assets/docs/' + t.id + '.docx" download>Word: maʼruza</a><a class="btn tonal" href="assets/docs/' + t.id + '.pptx" download>PowerPoint</a></div></div>';
    el.innerHTML = h;
    $('#readBtn').onclick = function () { setRead(t, !isRead(t)); tabLecture(el, t, d); };
    $('#toTest').onclick = function () { $('.chip[data-tab="test"]').click(); };
  }

  function tabSchemes(el, t, d) {
    el.innerHTML = d.schemes.map(function (s, i) {
      return '<div class="scheme"><h3>' + rich(s.t) + '</h3><div class="svgbox" data-i="' + i + '" role="button" tabindex="0" aria-label="Kattalaştiriş">' + s.svg + '</div></div>';
    }).join('') + '<p class="muted" style="font-size:13px;margin:0 8px">Sxemani kattalaştiriş uçun ustiga bosing.</p>';
    $$('.svgbox', el).forEach(function (b) { b.onclick = function () { var s = d.schemes[+b.getAttribute('data-i')]; openViewer(s.svg, plain(s.t)); }; });
  }

  /* ---- Test ---- */
  function prepQs(list, limit) {
    return shuffle(list).slice(0, limit || list.length).map(function (q) {
      var order = shuffle(q.o.map(function (_, i) { return i; }));
      return { q: q.q, o: order.map(function (i) { return q.o[i]; }), a: order.indexOf(q.a) };
    });
  }
  function tabTest(el, t, d) {
    var all = d.tests || [], best = getScore(t);
    el.innerHTML = '<div class="card result"><div class="gauge" style="--p:' + (best || 0) + '"><div><b>' + (best != null ? best + '%' : '—') + '</b><span>eng yaxşi natija</span></div></div>' +
      '<p class="muted">' + all.length + ' ta savol · javob variantlari har safar aralaştiriladi</p><div class="btn-row"><button class="btn" id="startQ">Testni boşlaş</button></div></div>';
    $('#startQ').onclick = function () { runQuiz(el, function () { return prepQs(all); }, function (p) { setScore(t, p); }); };
  }
  function grade(p) { return p >= 86 ? ['Aʼlo!', 'green', 5] : p >= 71 ? ['Yaxşi', 'blue', 4] : p >= 56 ? ['Qoniqarli', 'orange', 3] : ['Mavzuni yana takrorlang', 'red', 2]; }
  function runQuiz(el, make, onDone) {
    var qs = make(), i = 0, right = 0, wrong = [];
    function show() {
      if (i >= qs.length) return finish();
      var q = qs[i];
      el.innerHTML = '<div class="q-meta"><span>Savol ' + (i + 1) + ' / ' + qs.length + '</span><span>Töğri: ' + right + '</span></div><div class="q-bar"><i style="width:' + (i / qs.length * 100) + '%"></i></div>' +
        '<div class="q-text">' + rich(q.q) + '</div>' + q.o.map(function (o, k) { return '<button class="opt" data-k="' + k + '"><span class="let">' + 'ABCD'[k] + '</span><span>' + rich(o) + '</span></button>'; }).join('') + '<div id="qnext"></div>';
      $$('.opt', el).forEach(function (b) {
        b.onclick = function () {
          var k = +b.getAttribute('data-k');
          if (k === q.a) right++; else wrong.push(q);
          $$('.opt', el).forEach(function (x) { x.disabled = true; var kk = +x.getAttribute('data-k'); if (kk === q.a) x.classList.add('ok'); else if (kk === k) x.classList.add('bad'); });
          $('#qnext', el).innerHTML = '<div class="btn-row"><button class="btn">' + (i + 1 < qs.length ? 'Keyingi savol' : 'Natijani köriş') + '</button></div>';
          $('#qnext .btn', el).onclick = function () { i++; show(); };
        };
      });
    }
    function finish() {
      var p = Math.round(right / qs.length * 100), g = grade(p);
      if (onDone) onDone(p, wrong, qs);
      el.innerHTML = '<div class="card result c-' + g[1] + '"><div class="gauge" style="--p:' + p + '"><div><b>' + p + '%</b><span>' + right + ' / ' + qs.length + '</span></div></div><h2>' + g[0] + '</h2><p class="muted">Taxminiy baho: ' + g[2] + '</p>' +
        '<div class="btn-row"><button class="btn" id="again">Qayta topşiriş</button></div></div>' +
        (wrong.length ? '<div class="sub-h">Xatolar ustida işlaş</div><div class="list">' + wrong.map(function (q) {
          return '<div class="row noicon" style="cursor:default"><div class="grow"><div class="t">' + rich(q.q) + '</div><div class="s" style="color:var(--green)">✓ ' + rich(q.o[q.a]) + '</div></div></div>';
        }).join('') + '</div>' : '');
      $('#again', el).onclick = function () { runQuiz(el, make, onDone); };
    }
    show();
  }

  /* ---- Lug'at ---- */
  var UZ = 'abcdefghijklmnopqrstuvwxyzöğşç';
  function uzBare(s) { return plain(s).replace(/^[^A-Za-zÖĞŞÇöğşç0-9]+/, ''); }
  function uzKey(s) { var k = '', t = uzBare(s).toLowerCase(); for (var i = 0; i < t.length; i++) { var p = UZ.indexOf(t[i]); k += p >= 0 ? String.fromCharCode(66 + p) : (/[\s-]/.test(t[i]) ? 'A' : ''); } return k; }
  function uzCmp(a, b) { var x = uzKey(a.t), y = uzKey(b.t); return x < y ? -1 : x > y ? 1 : 0; }
  function uzNorm(q) { return q.toLowerCase().replace(/o['‘ʻ’ʼ`]/g, 'ö').replace(/g['‘ʻ’ʼ`]/g, 'ğ').replace(/sh/g, 'ş').replace(/ch/g, 'ç'); }
  function termRow(g) {
    return '<div class="row noicon term" style="cursor:default"><div class="grow"><b>' + rich(g.t) + (g.l ? ' <span class="lat" style="font-weight:400">(' + esc(plain(g.l)) + ')</span>' : '') + '</b><span>' + rich(g.d) + '</span>' + (g.src ? '<span style="display:block;font-size:12px;color:var(--text3);margin-top:2px">' + esc(g.src) + '</span>' : '') + '</div></div>';
  }
  function tabGlossary(el, t, d) {
    var gl = (d.glossary || []).slice().sort(uzCmp);
    el.innerHTML = '<div class="btn-row" style="margin:0 0 14px"><button class="btn tonal sm" id="fc">' + ic('flip') + 'Kartoçkalar</button></div><div class="list">' + gl.map(termRow).join('') + '</div>';
    $('#fc').onclick = function () { flashcards(el, gl, function () { tabGlossary(el, t, d); }); };
  }
  function flashcards(el, list, back) {
    var arr = shuffle(list), i = 0;
    function show() {
      var g = arr[i];
      el.innerHTML = '<div class="q-meta"><span>Kartoçka ' + (i + 1) + ' / ' + arr.length + '</span><span>Ağdariş uçun bosing</span></div>' +
        '<div class="flash" id="fl"><div class="flash-in"><div class="flash-face front">' + rich(g.t) + '<small>Taʼrifini eslang…</small></div><div class="flash-face back">' + rich(g.d) + '</div></div></div>' +
        '<div class="btn-row"><button class="btn gray" id="pv"' + (i ? '' : ' disabled') + '>Oldingi</button><button class="btn" id="nx">' + (i + 1 < arr.length ? 'Keyingi' : 'Tugatiş') + '</button></div>' +
        '<div class="btn-row"><button class="btn tonal" id="ex">Röyxatga qaytiş</button></div>';
      $('#fl', el).onclick = function () { this.classList.toggle('flipped'); };
      $('#pv', el).onclick = function () { i--; show(); };
      $('#nx', el).onclick = function () { if (i + 1 < arr.length) { i++; show(); } else back(); };
      $('#ex', el).onclick = back;
    }
    show();
  }

  function tabReview(el, t, d) {
    var h = '<div class="list">' + (d.review || []).map(function (q, k) {
      return '<div class="row" style="cursor:default"><div class="ico">' + (k + 1) + '</div><div class="grow"><div class="t">' + rich(q) + '</div></div></div>';
    }).join('') + '</div>';
    if (d.selfwork) h += '<div class="card c-green">' + cardH('person', 'Mustaqil iş topşiriği') + '<p>' + rich(d.selfwork) + '</p></div>';
    el.innerHTML = h;
  }

  function tabCriteria(el, t, d) {
    var col = { 5: 'green', 4: 'blue', 3: 'orange', 2: 'red' };
    el.innerHTML = '<div class="card">' + cardH('star', 'Baholaş mezonlari (KMR)') + d.criteria.map(function (c) {
      var g = parseInt(c[0], 10) || '';
      return '<div class="crit c-' + (col[g] || 'blue') + '"><div class="g">' + g + '</div><div><b>' + esc(c[0]) + '</b><p>' + rich(c[1]) + '</p></div></div>';
    }).join('') + '</div>';
  }

  function tabPractice(el, t, d) {
    el.innerHTML = '';
    t.inter.forEach(function (w) { var box = document.createElement('div'); el.appendChild(box); WIDGETS[w](box); });
    if (d.cases && d.cases.length) { var box = document.createElement('div'); el.appendChild(box); casesWidget(box, d.cases); }
  }
  function casesWidget(el, cases) {
    el.innerHTML = '<div class="h2">Vaziyatli masalalar</div>' + cases.map(function (c, ci) {
      return '<div class="card" data-c="' + ci + '">' + cardH('person', rich(c.title)) + '<p>' + rich(c.situation) + '</p><p><b>' + rich(c.question) + '</b></p>' +
        c.options.map(function (o, k) { return '<button class="case-opt" data-k="' + k + '">' + rich(o) + '</button>'; }).join('') + '<div class="ex"></div></div>';
    }).join('');
    $$('[data-c]', el).forEach(function (card) {
      var c = cases[+card.getAttribute('data-c')];
      $$('.case-opt', card).forEach(function (b) {
        b.onclick = function () {
          if (card.classList.contains('answered')) return;
          card.classList.add('answered');
          var k = +b.getAttribute('data-k');
          $$('.case-opt', card).forEach(function (x) { var kk = +x.getAttribute('data-k'); if (kk === c.best) x.classList.add('ok'); else if (kk === k) x.classList.add('bad'); });
          $('.ex', card).innerHTML = '<div class="explain"><b>' + (k === c.best ? '✓ Töğri. ' : 'Eng töğri javob belgilandi. ') + '</b>' + rich(c.explain) + '</div>';
        };
      });
    });
  }

  /* ======================================================
     INTERAKTIV MAŞQLAR
     ====================================================== */
  var EDU = '<div class="warn"><b>Öquv namunasi.</b> Hisob-kitob maşq uçun berilgan. Amalda dori faqat şifokor tayinlovi asosida qöllaniladi, hisob natijasi ikkinçi xodim bilan qayta tekşiriladi.</div>';

  /* -- Ketma-ketlikni teriş maşqi (umumiy) -- */
  function orderTask(el, o) {
    var items = o.items.map(function (x, i) { return { i: i, x: x }; }), next = 0, mistakes = 0;
    el.innerHTML = '<div class="card">' + cardH(o.icon || 'shuffle', esc(o.title)) + '<p class="muted" style="font-size:14px">' + o.intro + '</p><div class="ord"></div><div class="ores"></div>' +
      '<div class="btn-row"><button class="btn tonal sm orst">Qaytadan</button></div></div>';
    var box = $('.ord', el);
    function draw() {
      next = 0; mistakes = 0; $('.ores', el).innerHTML = '';
      box.innerHTML = shuffle(items).map(function (it) { return '<button class="pick" data-i="' + it.i + '">' + o.render(it.x) + '</button>'; }).join('');
      $$('.pick', box).forEach(function (b) {
        b.onclick = function () {
          if (b.classList.contains('ok')) return;
          var i = +b.getAttribute('data-i');
          if (i === next) {
            b.classList.add('ok'); b.innerHTML = '<span class="n">' + (next + 1) + '</span>' + b.innerHTML; next++;
            if (next === items.length) $('.ores', el).innerHTML = '<div class="explain"><b>' + (mistakes ? 'Bajarildi, xatolar: ' + mistakes + '.' : '✓ Xatosiz bajarildi!') + '</b> ' + (o.done || '') + '</div>';
          } else {
            mistakes++; b.classList.add('bad'); setTimeout(function () { b.classList.remove('bad'); }, 600);
          }
        };
      });
    }
    $('.orst', el).onclick = draw;
    draw();
  }

  /* -- Doza kalkulyatorlari -- */
  function doseWidget(el) {
    el.innerHTML = '<div class="h2">Doza kalkulyatorlari</div>' + EDU +
      '<div class="card c-blue">' + cardH('calc', '1. Tana vazniga köra doza') +
      '<div class="grid2"><div class="field"><label>Tana vazni, kg</label><input id="dw" inputmode="decimal" value="20"></div><div class="field"><label>Doza, mg/kg</label><input id="dk" inputmode="decimal" value="15"></div></div>' +
      '<div class="field"><label>Bir martalik maksimal doza, mg (ixtiyoriy)</label><input id="dm" inputmode="decimal" value="1000"></div><div class="result-box" id="dr"></div></div>' +
      '<div class="card c-purple">' + cardH('calc', '2. Eritma: % → mg/ml → neça ml') +
      '<div class="grid2"><div class="field"><label>Eritma konsentratsiyasi, %</label><input id="sc" inputmode="decimal" value="2"></div><div class="field"><label>Kerakli doza, mg</label><input id="sd" inputmode="decimal" value="40"></div></div>' +
      '<div class="result-box" id="sr"></div><p class="muted" style="font-size:13px;margin:10px 0 0">Qoida: 1% eritmaning 1 ml ida 10 mg modda bor. 1:1000 = 0,1% = 1 mg/ml.</p></div>' +
      '<div class="card c-teal">' + cardH('calc', '3. Infuziya tezligi') +
      '<div class="grid2"><div class="field"><label>Eritma hajmi, ml</label><input id="iv" inputmode="decimal" value="1000"></div><div class="field"><label>Vaqt, soat</label><input id="ih" inputmode="decimal" value="8"></div></div>' +
      '<div class="field"><label>Infuziya tizimi</label><select id="if"><option value="20">Makrotomçi: 20 tomçi = 1 ml</option><option value="60">Mikrotomçi: 60 tomçi = 1 ml</option></select></div><div class="result-box" id="ir"></div></div>';
    function calc() {
      var w = num($('#dw', el).value), k = num($('#dk', el).value), m = num($('#dm', el).value);
      var dose = w * k, capped = isFinite(m) && m > 0 && dose > m;
      $('#dr', el).innerHTML = isFinite(dose) ? '<b>' + fmt(capped ? m : dose, 1) + ' mg</b><small>' + fmt(w, 1) + ' kg × ' + fmt(k, 2) + ' mg/kg = ' + fmt(dose, 1) + ' mg' + (capped ? ' → maksimal dozadan oşmasligi kerak: ' + fmt(m, 1) + ' mg' : '') + '</small>' : '<small>Qiymatlarni kiriting</small>';
      var c = num($('#sc', el).value), d = num($('#sd', el).value), mgml = c * 10, ml = d / mgml;
      $('#sr', el).innerHTML = isFinite(ml) && mgml > 0 ? '<b>' + fmt(ml, 2) + ' ml</b><small>' + fmt(c, 2) + '% = ' + fmt(mgml, 2) + ' mg/ml; ' + fmt(d, 1) + ' mg ÷ ' + fmt(mgml, 2) + ' mg/ml = ' + fmt(ml, 2) + ' ml</small>' : '<small>Qiymatlarni kiriting</small>';
      var v = num($('#iv', el).value), h = num($('#ih', el).value), f = num($('#if', el).value), min = h * 60, drops = v * f / min, mlh = v / h;
      $('#ir', el).innerHTML = isFinite(drops) && min > 0 ? '<b>' + Math.round(drops) + ' tomçi/daq</b><small>' + fmt(v, 0) + ' ml × ' + f + ' ÷ ' + fmt(min, 0) + ' daq = ' + fmt(drops, 1) + ' tomçi/daq · tezlik ' + fmt(mlh, 1) + ' ml/soat</small>' : '<small>Qiymatlarni kiriting</small>';
    }
    $$('input,select', el).forEach(function (x) { x.oninput = calc; x.onchange = calc; });
    calc();
  }

  /* -- Retsept trenajyori -- */
  var ABBR = [
    ['Rp.', 'Recipe', 'Ol (retsept boşlanişi)'], ['D.S.', 'Da. Signa.', 'Ber. Belgila.'], ['M.D.S.', 'Misce. Da. Signa.', 'Aralaştir. Ber. Belgila.'],
    ['D.t.d. N.', 'Da tales doses numero', 'Şunday dozadan … dona ber'], ['M.f. pulv.', 'Misce, fiat pulvis', 'Aralaştir, kukun hosil bölsin'],
    ['q.s.', 'quantum satis', 'Yetarli miqdorda'], ['ana (aa)', 'ana partes aequales', 'Teng miqdorda'], ['S.', 'Signa', 'Belgila (qöllaş usuli)'],
    ['Sol.', 'Solutio', 'Eritma'], ['Tab.', 'Tabuletta', 'Tabletka'], ['Caps.', 'Capsula', 'Kapsula'], ['Ung.', 'Unguentum', 'Surtma (malham)'],
    ['Supp.', 'Suppositorium', 'Şam'], ['Amp.', 'Ampulla', 'Ampula'], ['Tinct.', 'Tinctura', 'Damlama (nastoyka)'], ['in amp.', 'in ampullis', 'Ampulalarda']
  ];
  var RECIPE = [
    ['Inscriptio', 'Muassasa ştampi va kodi'], ['Datum', 'Retsept yozilgan sana'], ['Nomen aegroti', 'Bemorning F.I.Sh. va yoşi'], ['Nomen medici', 'Şifokorning F.I.Sh.'],
    ['Designatio materiarum', 'Rp.: dori nomi va dozasi (lotinça)'], ['Subscriptio', 'Dori şakli va miqdori körsatmasi (D.t.d. N. …)'], ['Signatura', 'S.: bemorga qöllaş usuli (ona tilida)'], ['Subscriptio medici', 'Şifokor imzosi va şaxsiy muhri']
  ];
  function recipeWidget(el) {
    el.innerHTML = '<div class="h2">Retsept trenajyori</div><div class="abbr"></div><div class="rord"></div>';
    var qbox = $('.abbr', el);
    qbox.innerHTML = '<div class="card c-purple">' + cardH('doc', 'Lotinça qisqartmalar') + '<p class="muted" style="font-size:14px">' + ABBR.length + ' ta qisqartmadan 8 ta tasodifiy savol.</p><div class="btn-row"><button class="btn" id="abGo">Boşlaş</button><button class="btn tonal" id="abList">Röyxat</button></div></div>';
    $('#abGo', qbox).onclick = function () {
      runQuiz(qbox, function () {
        return shuffle(ABBR).slice(0, 8).map(function (a) {
          var wrong = shuffle(ABBR.filter(function (b) { return b !== a; })).slice(0, 3).map(function (b) { return b[2]; });
          var o = shuffle([a[2]].concat(wrong));
          return { q: '<span class="lat">' + a[0] + '</span> qisqartmasi nimani anglatadi?', o: o, a: o.indexOf(a[2]) };
        });
      });
    };
    $('#abList', qbox).onclick = function () {
      openDlg('<h2>Lotinça qisqartmalar</h2><div class="list" style="background:var(--card2)">' + ABBR.map(function (a) {
        return '<div class="row noicon" style="cursor:default"><div class="grow"><div class="t"><span class="lat">' + esc(a[0]) + '</span> — <span class="lat">' + esc(a[1]) + '</span></div><div class="s">' + esc(a[2]) + '</div></div></div>';
      }).join('') + '</div><div class="btn-row"><button class="btn tonal" data-close>Yopiş</button></div>');
    };
    orderTask($('.rord', el), {
      title: 'Retsept qismlarini tartibga tering', icon: 'shuffle',
      intro: 'Retsept qismlarini yoziliş tartibida birma-bir bosing.',
      items: RECIPE, render: function (x) { return '<b><span class="lat">' + esc(x[0]) + '</span></b> — ' + esc(x[1]); },
      done: 'Designatio materiarum qismida dori nomi lotin tilida, boş harf bilan, kelişikda yoziladi; Signatura bemorga tuşunarli tilda yoziladi.'
    });
  }

  /* -- Saqlaş şaroitlari -- */
  var STORE_OPTS = ['Muzlatkiç (+2…+8 °C)', 'Xona harorati, quruq joy', 'Salqin, qoronği joy', 'Seyf (qatʼiy hisob)'];
  var STORE = [
    ['Insulin (oçilmagan flakon)', 0, 'Oçilmagan insulin muzlatkiçda +2…+8 °C da saqlanadi, muzlatib bölmaydi.'],
    ['Vaksinalar', 0, '“Sovuq zanjir”: +2…+8 °C, harorat jurnalda qayd etiladi.'],
    ['Morfin gidroxlorid 1% ampulasi', 3, 'Narkotik vosita: mahkamlangan seyfda, alohida jurnalda qatʼiy hisob bilan.'],
    ['Diazepam 0,5% ampulasi', 3, 'Psixotrop vosita: seyfda, belgilangan tartibda hisobga olinadi.'],
    ['Paratsetamol 500 mg tabletkasi', 1, 'Oddiy tabletka: xona haroratida (+15…+25 °C), quruq joyda, öz qadoğida.'],
    ['Vodorod peroksid 3% eritmasi', 2, 'Yoruğlik va issiqda parçalanadi: salqin, qoronği joyda, ziç yopiq idişda.']
  ];
  function storageWidget(el) {
    el.innerHTML = '<div class="h2">Saqlaş şaroitlari</div><p class="muted" style="margin:-4px 8px 12px;font-size:14px">Har bir dori uçun töğri saqlaş joyini tanlang.</p>' + STORE.map(function (s, i) {
      return '<div class="card" data-s="' + i + '">' + cardH('box', esc(s[0])) + STORE_OPTS.map(function (o, k) { return '<button class="pick" data-k="' + k + '">' + esc(o) + '</button>'; }).join('') + '<div class="ex"></div></div>';
    }).join('');
    $$('[data-s]', el).forEach(function (card) {
      var s = STORE[+card.getAttribute('data-s')];
      $$('.pick', card).forEach(function (b) {
        b.onclick = function () {
          if (card.classList.contains('answered')) return;
          card.classList.add('answered');
          var k = +b.getAttribute('data-k');
          $$('.pick', card).forEach(function (x) { var kk = +x.getAttribute('data-k'); if (kk === s[1]) x.classList.add('ok'); else if (kk === k) x.classList.add('bad'); });
          $('.ex', card).innerHTML = '<div class="explain">' + esc(s[2]) + '</div>';
        };
      });
    });
  }

  /* -- FEFO -- */
  var FEFO_DRUGS = ['Natriy xlorid 0,9% – 500 ml', 'Glyukoza 5% – 400 ml', 'Analgin 50% – 2 ml amp.', 'Drotaverin 2% – 2 ml amp.', 'Furosemid 1% – 2 ml amp.', 'Amoksitsillin 500 mg kaps.'];
  function fefoWidget(el) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    function dt(days) { var d = new Date(today.getTime() + days * 864e5); return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear(); }
    function build() {
      var names = shuffle(FEFO_DRUGS), offs = [-15].concat(shuffle([30, 75, 140, 260, 420]).sort(function (a, b) { return a - b; }));
      var expired = { name: names[0], date: dt(offs[0]) };
      var rest = names.slice(1).map(function (n, i) { return { name: n, days: offs[i + 1], date: dt(offs[i + 1]) }; });
      var all = shuffle([expired].concat(rest));
      el.innerHTML = '<div class="h2">FEFO: “birinçi muddati tugaydigani — birinçi”</div><div class="card c-teal">' + cardH('alert', '1-qadam. Muddati ötgan dorini toping') +
        '<p class="muted" style="font-size:14px">Bugun: ' + dt(0) + '. Muddati ötgan dori bemorga berilmaydi, alohida joyga ajratiladi va hisobdan çiqariladi.</p>' +
        all.map(function (x, i) { return '<button class="pick" data-i="' + i + '"><b>' + esc(x.name) + '</b><br><span class="muted" style="font-size:13px">Yaroqlilik muddati: ' + x.date + '</span></button>'; }).join('') + '<div class="ex"></div></div><div class="step2"></div>';
      var card = $('.card', el);
      $$('.pick', card).forEach(function (b) {
        b.onclick = function () {
          var x = all[+b.getAttribute('data-i')];
          if (x === expired) {
            b.classList.add('ok'); $$('.pick', card).forEach(function (y) { y.disabled = true; });
            $('.ex', card).innerHTML = '<div class="explain">✓ Töğri: ' + esc(x.name) + ' muddati ötgan (' + x.date + ').</div>';
            orderTask($('.step2', el), {
              title: '2-qadam. Qolganlarini beriş navbatiga tering', icon: 'box',
              intro: 'FEFO tamoyili: avval yaroqlilik muddati eng tez tugaydigan dori işlatiladi.',
              items: rest, render: function (y) { return '<b>' + esc(y.name) + '</b><br><span class="muted" style="font-size:13px">' + y.date + '</span>'; },
              done: 'Javonlarda muddati yaqin dorilar oldinga qöyiladi. Min-max tamoyili: zaxira minimal darajaga tuşganda buyurtma beriladi, maksimal darajadan oşirilmaydi.'
            });
            var rb = document.createElement('div'); rb.className = 'btn-row'; rb.innerHTML = '<button class="btn tonal">Yangi töplam</button>'; el.appendChild(rb); rb.firstChild.onclick = build;
          } else { b.classList.add('bad'); setTimeout(function () { b.classList.remove('bad'); }, 600); }
        };
      });
    }
    build();
  }

  /* -- Zahar va antidot -- */
  var ANTIDOTES = [
    ['Paratsetamol', 'N-atsetilsistein'], ['Opioidlar (morfin, tramadol)', 'Nalokson'], ['Benzodiazepinlar (diazepam)', 'Flumazenil'],
    ['Fosfororganik birikmalar', 'Atropin + xolinesteraza reaktivatori'], ['Geparin', 'Protamin sulfat'], ['Varfarin', 'Vitamin K (fitomenadion)'],
    ['Temir preparatlari', 'Deferoksamin'], ['Metanol', 'Etanol yoki fomepizol']
  ];
  function antidoteWidget(el) {
    function build() {
      var L = shuffle(ANTIDOTES.map(function (p, i) { return i; })), R = shuffle(L.slice()), sel = null, ok = 0, miss = 0;
      el.innerHTML = '<div class="h2">Zahar va antidot</div><div class="card c-red">' + cardH('link', 'Juftlarini toping') + '<p class="muted" style="font-size:14px">Çapdan zaharli moddani, söng öngdan uning antidotini tanlang.</p>' +
        '<div class="match"><div>' + L.map(function (i) { return '<button class="pick" data-l="' + i + '">' + esc(ANTIDOTES[i][0]) + '</button>'; }).join('') + '</div><div>' +
        R.map(function (i) { return '<button class="pick" data-r="' + i + '">' + esc(ANTIDOTES[i][1]) + '</button>'; }).join('') + '</div></div><div class="ex"></div>' +
        '<div class="btn-row"><button class="btn tonal sm" id="anR">Qaytadan</button></div></div>' +
        '<div class="warn">Antidot faqat şifokor tayinlovi bilan qöllaniladi. Zaharlanişda avvalo ABCDE böyiça holat baholanadi, yordam çaqiriladi.</div>';
      $$('[data-l]', el).forEach(function (b) { b.onclick = function () { $$('[data-l]', el).forEach(function (x) { x.classList.remove('sel'); }); b.classList.add('sel'); sel = +b.getAttribute('data-l'); }; });
      $$('[data-r]', el).forEach(function (b) {
        b.onclick = function () {
          if (sel == null) return;
          var r = +b.getAttribute('data-r'), lb = $('[data-l="' + sel + '"]', el);
          if (r === sel) { lb.classList.remove('sel'); lb.classList.add('ok', 'done'); b.classList.add('ok', 'done'); ok++; sel = null; }
          else { miss++; b.classList.add('bad'); setTimeout(function () { b.classList.remove('bad'); }, 600); }
          if (ok === ANTIDOTES.length) $('.ex', el).innerHTML = '<div class="explain"><b>' + (miss ? 'Bajarildi, xatolar: ' + miss : '✓ Xatosiz bajarildi!') + '</b></div>';
        };
      });
      $('#anR', el).onclick = build;
    }
    build();
  }

  /* -- ABCDE -- */
  var ABCDE = [
    ['A', 'Airway — nafas yöllari', 'Ötkazuvçanlik, stridor, xirillaş, til va tomoq şişi (Kvinke şişi).', 'Boşni orqaga egiş, pastki jağni çiqariş, oğiz böşliğini tozalaş, yordam çaqiriş.', 'blue'],
    ['B', 'Breathing — nafas', 'Nafas soni, SpO₂, kökrak qafasi harakati, auskultatsiya.', 'Kislorod beriş, yarim ötirgan holat, ingalyatsiya — şifokor tayinlovi böyiça.', 'teal'],
    ['C', 'Circulation — qon aylanişi', 'Puls, arterial qon bosimi, kapillyar töliş vaqti (< 2 s), teri rangi, EKG.', 'Vena içiga kiriş, infuziya, qon tahlili, EKG yoziş.', 'red'],
    ['D', 'Disability — nevrologik holat', 'Ong darajasi (AVPU), qoraçiqlar, qondagi glyukoza.', 'Gipoglikemiyada glyukoza — tayinlov böyiça; ongni kuzatiş.', 'purple'],
    ['E', 'Exposure — umumiy körik', 'Butun tanani köriş: toşma, qon ketiş, şiş, tana harorati.', 'Bemorni isitiş, topilmalarni hujjatlaştiriş, qayta baholaş.', 'green']
  ];
  function abcdeWidget(el) {
    el.innerHTML = '<div class="h2">ABCDE algoritmi</div><div class="card">' + ABCDE.map(function (s, i) {
      return '<div class="step c-' + s[4] + '" data-i="' + i + '"><div class="L">' + s[0] + '</div><div class="grow"><b>' + esc(s[1]) + '</b><div class="d">' + esc(s[2]) + '</div><div class="more"><b style="display:inline">Hamşira:</b> ' + esc(s[3]) + '</div></div></div>';
    }).join('') + '<p class="muted" style="font-size:13px;margin:10px 0 0">Bosqiçni bosib, hamşira harakatlarini köring. Har bir bosqiçdagi muammo hal qilinmagunça keyingisiga ötilmaydi.</p></div><div class="abo"></div>';
    $$('.step', el).forEach(function (s) { s.onclick = function () { s.classList.toggle('open'); }; });
    orderTask($('.abo', el), {
      title: 'Bosqiçlarni tartibga tering', items: ABCDE, render: function (x) { return '<b>' + x[0] + '</b> — ' + esc(x[1]); },
      intro: 'Bemorni baholaş bosqiçlarini töğri ketma-ketlikda bosing.', done: 'Hayot uçun eng xavfli muammo (nafas yöli) birinçi baholanadi.'
    });
  }

  /* -- Anafilaktik şok -- */
  var ANAPH = [
    'Allergen bilan aloqani töxtatiş (dori yuborişni darhol töxtatiş)',
    'Yordam çaqiriş: şifokor, reanimatsiya brigadasi (103)',
    'Adrenalin 0,1% — 0,01 mg/kg m/o son oldingi-taşqi yuzasiga (kattalarga köpi bilan 0,5 mg), protokol/şifokor tayinlovi böyiça',
    'Bemorni yotqiziş, oyoqlarini kötariş (nafas qisilsa — yarim ötirgan holat)',
    'Kislorod beriş, vena içiga kiriş, 0,9% natriy xlorid infuziyasi',
    'Samara bölmasa, 5 daqiqadan söng adrenalinni takrorlaş',
    'Antigistamin va glyukokortikoidlar — ikkinçi navbatdagi vositalar, tayinlov böyiça',
    'Hayotiy körsatkiçlarni kuzatiş va hujjatlaştiriş'
  ];
  function anaphWidget(el) {
    orderTask(el, {
      title: 'Anafilaktik şokda harakatlar ketma-ketligi', icon: 'alert', items: ANAPH, render: function (x) { return esc(x); },
      intro: 'Harakatlarni bajariliş tartibida bosing.',
      done: 'Anafilaksiyada birinçi tanlov dorisi — adrenalin (m/o). Antigistamin va gormonlar adrenalin örnini bosmaydi.'
    });
  }

  var WIDGETS = { dose: doseWidget, recipe: recipeWidget, storage: storageWidget, fefo: fefoWidget, antidote: antidoteWidget, abcde: abcdeWidget, anaphylaxis: anaphWidget };

  /* ======================================================
     TESTLAR
     ====================================================== */
  function renderTests() {
    setTab('tests'); setBar({ title: 'Testlar' });
    var fb = get('final', null);
    view.innerHTML = '<div class="expanded"><h1>Testlar</h1><p>Mavzular böyiça va yakuniy test</p></div>' +
      '<div class="card c-blue">' + cardH('shuffle', 'Yakuniy test') + '<p class="muted">Barça 30 mavzudan tasodifiy 30 ta savol.' + (fb != null ? ' Eng yaxşi natija: <b style="color:var(--text)">' + fb + '%</b>' : '') + '</p><div class="btn-row"><a class="btn" href="#/final">Boşlaş</a></div></div>' +
      '<div class="card c-green">' + cardH('clock', 'Imtihon rejimi') + '<p class="muted">30 ta savol (har mavzudan 1 ta), 40 daqiqa. Natija baho va bölimlar böyiça körsatiladi, xatolar saqlanadi.</p><div class="btn-row"><a class="btn green" href="#/exam">Imtihonga ötiş</a></div></div>' +
      P.sections.map(function (s) {
        return '<div class="list c-' + s.color + '"><div class="list-h"><span class="num">' + s.n + '</span><b>' + esc(s.title) + '</b></div>' + TOPICS.filter(function (t) { return t.sec === s; }).map(function (t) {
          var sc = getScore(t);
          return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '/test"><div class="ico">' + t.n + '</div><div class="grow"><div class="t">' + esc(t.title) + '</div></div>' +
            (sc != null ? '<div class="gauge sm c-' + grade(sc)[1] + '" style="--p:' + sc + '"><div><b>' + sc + '</b></div></div>' : '<span class="val">—</span>') + '</a>';
        }).join('') + '</div>';
      }).join('');
    onScroll();
  }
  function renderFinal() {
    setTab('tests'); setBar({ back: '#/tests', title: 'Yakuniy test' });
    view.innerHTML = '<div class="expanded"><h1>Yakuniy test</h1><p>30 ta tasodifiy savol</p></div><div id="fq"><div class="spinner"></div></div>';
    onScroll();
    loadAll().then(function (ds) {
      var all = []; ds.filter(Boolean).forEach(function (d) { all = all.concat(d.tests || []); });
      var el = $('#fq'); if (!el) return;
      if (!all.length) { el.innerHTML = '<div class="empty">Savollar topilmadi.</div>'; return; }
      runQuiz(el, function () { return prepQs(all, 30); }, function (p) { var f = get('final', null); if (f == null || p > f) put('final', p); });
    });
  }

  /* ======================================================
     LUG'AT
     ====================================================== */
  function renderGlossary() {
    setTab('tools'); setBar({ title: 'Luğat' });
    view.innerHTML = '<div class="expanded"><h1>Luğat</h1><p id="gcount">Yuklanmoqda…</p></div><div id="gl"><div class="spinner"></div></div>';
    onScroll();
    loadAll().then(function () {
      var el = $('#gl'); if (!el) return;
      var seen = {}, list = [];
      TOPICS.forEach(function (t) {
        var d = window.PSX_T[t.id]; if (!d) return;
        (d.glossary || []).forEach(function (g) { var k = plain(g.t).toLowerCase(); if (!seen[k]) { seen[k] = 1; list.push({ t: g.t, d: g.d, l: g.l, src: t.n + '-mavzu' }); } });
      });
      list.sort(uzCmp);
      function draw(q) {
        q = uzNorm((q || '').trim());
        var f = list.filter(function (g) { return !q || plain(g.t).toLowerCase().indexOf(q) >= 0 || plain(g.d).toLowerCase().indexOf(q) >= 0 || (g.l && plain(g.l).toLowerCase().indexOf(q) >= 0); });
        var out = '', L = '', buf = [];
        function flush() { if (buf.length) { out += '<div class="letter">' + esc(L) + '</div><div class="list">' + buf.join('') + '</div>'; buf = []; } }
        f.forEach(function (g) { var l = uzBare(g.t).charAt(0).toUpperCase(); if (l !== L) { flush(); L = l; } buf.push(termRow(g)); });
        flush();
        $('#glist', el).innerHTML = out || '<div class="empty">Heç narsa topilmadi.</div>';
        $('#gcount').textContent = f.length + ' ta atama';
      }
      el.innerHTML = '<label class="search">' + ic('search') + '<input id="gq" type="search" placeholder="Atama yoki lotinça nomini qidiriş" autocomplete="off"></label>' +
        '<div class="btn-row" style="margin:0 0 6px"><button class="btn tonal sm" id="gfc">' + ic('flip') + 'Kartoçkalar</button></div><div id="glist"></div>';
      $('#gq', el).oninput = function () { draw(this.value); };
      $('#gfc', el).onclick = function () { flashcards(el, list, renderGlossary); };
      draw('');
    });
  }

  /* ======================================================
     NATIJALAR
     ====================================================== */
  function renderProfile() {
    setTab('profile'); setBar({ title: 'Natijalar' });
    var readN = TOPICS.filter(isRead).length, pct = Math.round(readN / TOPICS.length * 100);
    var sc = TOPICS.map(getScore).filter(function (x) { return x != null; });
    var avg = sc.length ? Math.round(sc.reduce(function (a, b) { return a + b; }, 0) / sc.length) : null;
    var fb = get('final', null), th = get('theme', 'auto');
    view.innerHTML = '<div class="expanded center"><div class="gauge c-green" style="--p:' + pct + '"><div><b>' + pct + '</b><span>% örganildi</span></div></div><p>' + readN + ' / ' + TOPICS.length + ' mavzu</p></div>' +
      '<div class="stats" style="grid-template-columns:repeat(3,1fr)">' + stat(sc.length + '/' + TOPICS.length, 'Test topşirildi', 'c-blue') + stat(avg != null ? avg + '%' : '—', 'Örtaça natija', 'c-orange') + stat(fb != null ? fb + '%' : '—', 'Yakuniy test', 'c-purple') + '</div>' +
      '<div class="sub-h">Köriniş</div><div class="list">' + [['auto', 'Tizim böyiça'], ['light', 'Yoruğ rejim'], ['dark', 'Qoronği rejim']].map(function (x) {
        return '<button class="row noicon" data-th="' + x[0] + '"><div class="grow"><div class="t">' + x[1] + '</div></div><span style="width:22px;height:22px;border-radius:50%;border:2px solid ' + (x[0] === th ? 'var(--accent)' : 'var(--text3)') + ';display:grid;place-items:center">' + (x[0] === th ? '<span style="width:12px;height:12px;border-radius:50%;background:var(--accent)"></span>' : '') + '</span></button>';
      }).join('') + '</div>' +
      '<div class="sub-h">Mavzular</div><div class="list">' + TOPICS.map(function (t) {
        var s = getScore(t);
        return '<a class="row c-' + t.color + '" href="#/t/' + t.n + '"><div class="ico">' + t.n + '</div><div class="grow"><div class="t">' + esc(t.title) + '</div><div class="s">' + (isRead(t) ? '<span style="color:var(--green)">✓ Örganilgan</span>' : 'Örganilmagan') + ' · Test: ' + (s != null ? s + '%' : '—') + '</div></div>' + ic('chev', 'chev') + '</a>';
      }).join('') + '</div>' +
      '<div class="list"><button class="row noicon" id="ab"><div class="grow"><div class="t">Resurs haqida</div></div>' + ic('chev', 'chev') + '</button><button class="row noicon" id="rs"><div class="grow"><div class="t" style="color:var(--red)">Natijalarni tozalaş</div></div></button></div>' +
      '<p class="muted" style="font-size:13px;margin:0 8px">Natijalar faqat şu qurilmaning brauzerida saqlanadi.</p>';
    onScroll();
    $$('[data-th]', view).forEach(function (b) { b.onclick = function () { put('theme', b.getAttribute('data-th')); applyTheme(); renderProfile(); }; });
    $('#ab').onclick = aboutDlg;
    $('#rs').onclick = function () {
      openDlg('<h2>Natijalarni tozalaş</h2><p class="muted">Barça örganilgan mavzular va test natijalari öçiriladi. Bu amalni qaytarib bölmaydi.</p><div class="btn-row"><button class="btn tonal" data-close>Bekor qiliş</button><button class="btn" id="rsOk" style="background:var(--red)">Tozalaş</button></div>');
      $('#rsOk').onclick = function () { put('read', {}); put('score', {}); put('final', null); closeDlg(); renderProfile(); };
    };
  }

  /* ======================================================
     KO'RIŞ OYNASI va DIALOG
     ====================================================== */
  var viewer = $('#viewer'), vScroll = $('#viewerScroll'), vName = '';
  function openViewer(svg, title, exp) {
    vScroll.innerHTML = svg; $('#viewerTitle').textContent = title; vName = title;
    $('#vPng').hidden = !exp; $('#vPrint').hidden = !exp;
    viewer.hidden = false; document.body.style.overflow = 'hidden';
  }
  $('#vPng').onclick = function () { var s = $('svg', vScroll); if (s) svgPng(s, vName); };
  $('#vPrint').onclick = function () { printHtml(vScroll.innerHTML, false); };

  /* Çop etiş: tanlangan HTML/SVG ni alohida soha orqali çop etadi */
  function printHtml(html, land) {
    var a = $('#printArea'), st = $('#pageStyle');
    a.innerHTML = html;
    st.textContent = '@page{size:A4 ' + (land ? 'landscape' : 'portrait') + ';margin:10mm}';
    document.body.classList.add('printing');
    window.print();
    setTimeout(function () { document.body.classList.remove('printing'); a.innerHTML = ''; }, 400);
  }
  /* SVG ni PNG rasm qilib yuklab oliş (CSS ranglari inline qilinadi) */
  function svgPng(svg, name) {
    var clone = svg.cloneNode(true), src = svg.querySelectorAll('*'), dst = clone.querySelectorAll('*');
    var props = ['fill', 'stroke', 'stroke-width', 'font-size', 'font-weight', 'font-family', 'font-style', 'text-ançor', 'opacity', 'letter-spacing'];
    for (var i = 0; i < src.length; i++) {
      var cs = getComputedStyle(src[i]);
      for (var k = 0; k < props.length; k++) dst[i].style.setProperty(props[k], cs.getPropertyValue(props[k]));
    }
    var vb = svg.viewBox.baseVal, sc = 2, w = vb.width * sc, h = vb.height * sc;
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); clone.setAttribute('width', w); clone.setAttribute('height', h);
    var img = new Image();
    img.onload = function () {
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob(function (b) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b); a.download = (name || 'plakat').replace(/[^\wÀ-ɏ-]+/g, '_') + '.png';
        document.body.appendChild(a); a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
      }, 'image/png');
    };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  }
  function closeViewer() { if (!viewer.hidden) { viewer.hidden = true; document.body.style.overflow = ''; vScroll.innerHTML = ''; } }
  $('#viewerClose').onclick = closeViewer;
  var dlg = $('#sheet');
  function openDlg(html) { $('#sheetBody').innerHTML = html; dlg.hidden = false; }
  function closeDlg() { dlg.hidden = true; }
  dlg.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeDlg(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeViewer(); closeDlg(); } });

  /* Qo'şimça asboblar (assets/tools.js) uçun umumiy interfeys */
  window.PSXAPP = {
    P: P, M: M, view: view, TOPICS: TOPICS, WIDGETS: WIDGETS,
    esc: esc, rich: rich, plain: plain, $: $, $$: $$, ic: ic, get: get, put: put, shuffle: shuffle, num: num, fmt: fmt, pad: pad,
    runQuiz: runQuiz, prepQs: prepQs, grade: grade, flashcards: flashcards, orderTask: orderTask, casesWidget: casesWidget,
    openDlg: openDlg, closeDlg: closeDlg, openViewer: openViewer, printHtml: printHtml, svgPng: svgPng,
    setBar: setBar, setTab: setTab, onScroll: onScroll, cardH: cardH, stat: stat, termRow: termRow,
    loadBlock: loadBlock, loadAll: loadAll, uzCmp: uzCmp, uzNorm: uzNorm, uzBare: uzBare
  };
  if (window.PSX_INIT) window.PSX_INIT(window.PSXAPP);

  route();
})();
