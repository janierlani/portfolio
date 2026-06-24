/* ============================================================
   render.js — fetches content.json and builds the public pages
   Used by index.html and blog.html. No build step, no framework.
   ============================================================ */
(function () {
  'use strict';

  var CAT = {
    chip:  { label: 'Chip Design & Hardware', mark: 'I', name: 'Chip Design' },
    mat:   { label: 'Materials Science & Devices', mark: 'II', name: 'Materials' },
    space: { label: 'Space & Entrepreneurship', mark: 'III', name: 'Space' }
  };

  /* ---------- helpers ---------- */
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  /* ---------- tiny markdown ---------- */
  function inlineMd(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, t, u) {
      var safe = /^(https?:|mailto:|pdf\/|\/|#)/.test(u) ? u : '#';
      return '<a href="' + esc(safe) + '"' + (/^https?:/.test(safe) ? ' target="_blank" rel="noopener"' : '') + '>' + t + '</a>';
    });
    return s;
  }
  function markdown(text) {
    var lines = String(text || '').replace(/\r\n/g, '\n').split('\n');
    var out = [], i = 0;
    function flushList(type, items) {
      out.push('<' + type + '>' + items.map(function (it) { return '<li>' + inlineMd(it) + '</li>'; }).join('') + '</' + type + '>');
    }
    while (i < lines.length) {
      var line = lines[i];
      if (/^\s*$/.test(line)) { i++; continue; }
      if (/^###\s+/.test(line)) { out.push('<h3>' + inlineMd(line.replace(/^###\s+/, '')) + '</h3>'); i++; continue; }
      if (/^##\s+/.test(line))  { out.push('<h2>' + inlineMd(line.replace(/^##\s+/, '')) + '</h2>'); i++; continue; }
      if (/^#\s+/.test(line))   { out.push('<h2>' + inlineMd(line.replace(/^#\s+/, '')) + '</h2>'); i++; continue; }
      if (/^---+\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      if (/^>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) { quote.push(lines[i].replace(/^>\s?/, '')); i++; }
        out.push('<blockquote>' + inlineMd(quote.join(' ')) + '</blockquote>'); continue;
      }
      if (/^\s*[-*]\s+/.test(line)) {
        var ul = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { ul.push(lines[i].replace(/^\s*[-*]\s+/, '')); i++; }
        flushList('ul', ul); continue;
      }
      if (/^\s*\d+\.\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { ol.push(lines[i].replace(/^\s*\d+\.\s+/, '')); i++; }
        flushList('ol', ol); continue;
      }
      var para = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^(#{1,3}\s|>\s?|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(lines[i])) {
        para.push(lines[i]); i++;
      }
      out.push('<p>' + inlineMd(para.join(' ')) + '</p>');
    }
    return out.join('\n');
  }

  /* ---------- icons ---------- */
  var ICON = {
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a11 11 0 0 0-3.5 21.4c.5.1.7-.2.7-.5v-2c-3 .6-3.7-1.3-3.7-1.3-.5-1.2-1.2-1.6-1.2-1.6-1-.7 0-.7 0-.7 1 .1 1.6 1.1 1.6 1.1 1 1.6 2.5 1.2 3.1.9 0-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 1.1a10 10 0 0 1 5.4 0c2-1.4 3-1.1 3-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.9 0 4.2-2.6 5.1-5 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A11 11 0 0 0 12 1z"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>'
  };

  /* ---------- HERO ---------- */
  function renderHero(p) {
    var host = document.getElementById('hero');
    if (!host) return;
    var nameParts = p.name.split(' ');
    var last = nameParts.pop();
    var first = nameParts.join(' ');
    var stats = (p.stats || []).map(function (s) {
      return '<div class="hero-stat"><span class="n" data-count>' + esc(s.value) + '</span><span class="l">' + esc(s.label) + '</span></div>';
    }).join('');
    var links = '';
    if (p.email) links += '<a href="mailto:' + esc(p.email) + '">' + ICON.mail + esc(p.email) + '</a>';
    if (p.linkedin) links += '<a href="' + esc(p.linkedin) + '" target="_blank" rel="noopener">' + ICON.linkedin + 'LinkedIn</a>';
    if (p.github) links += '<a href="' + esc(p.github) + '" target="_blank" rel="noopener">' + ICON.github + 'GitHub</a>';
    if (p.phone) links += '<a href="tel:' + esc(p.phone.replace(/[^0-9+]/g, '')) + '">' + ICON.phone + esc(p.phone) + '</a>';

    host.innerHTML =
      '<div class="hero-inner">' +
        (p.photo ? '<div class="hero-portrait"><img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '"></div>' : '') +
        (p.kicker ? '<div class="hero-kicker">' + esc(p.kicker) + '</div>' : '') +
        '<h1>' + esc(first) + ' <span class="accent">' + esc(last) + '</span></h1>' +
        (p.tagline ? '<div class="hero-tagline">' + esc(p.tagline) + '</div>' : '') +
        (p.bio ? '<p class="hero-bio">' + inlineMd(p.bio) + '</p>' : '') +
        (stats ? '<div class="hero-stats">' + stats + '</div>' : '') +
        '<div class="hero-links">' + links + '</div>' +
        '<div class="divider-mark"><span class="d"></span></div>' +
      '</div>';
  }

  /* ---------- NOTEBOOK (blog teaser) ---------- */
  function renderNotebook(posts) {
    var host = document.getElementById('blog');
    if (!host) return;
    var sorted = posts.slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var latest = sorted.slice(0, 2);
    var items = latest.map(function (post) {
      return '<article class="nb-item">' +
        '<div class="nb-meta"><span class="cat">' + esc((CAT[post.cat] || {}).name || '') + '</span>' + esc(fmtDate(post.date)) + '<br>' + esc(post.readTime || '') + '</div>' +
        '<div class="nb-body"><h3><a href="blog.html?p=' + encodeURIComponent(post.id) + '">' + esc(post.title) + '</a></h3>' +
        '<p>' + esc(post.excerpt || '') + '</p>' +
        '<a class="more" href="blog.html?p=' + encodeURIComponent(post.id) + '">Read essay &rarr;</a></div></article>';
    }).join('');
    host.innerHTML =
      '<div class="section-head reveal"><span class="eyebrow">The Notebook</span><h2>Writing &amp; Essays</h2>' +
      '<p class="lead">Working notes on semiconductors, materials, and the philosophy of building things.</p></div>' +
      '<div class="notebook reveal">' + items +
      '<div class="nb-foot"><a class="more" href="blog.html">View all ' + posts.length + ' posts &rarr;</a></div></div>';
  }

  /* ---------- WORK (editorial ledger) ---------- */
  function renderWork(exps) {
    var host = document.getElementById('work');
    if (!host) return;
    var order = ['chip', 'mat', 'space'];
    var nav = order.map(function (c) { return '<a href="#cat-' + c + '">' + esc(CAT[c].name) + '</a>'; }).join('');
    var blocks = order.map(function (c) {
      var group = exps.filter(function (e) { return e.cat === c; });
      if (!group.length) return '';
      var rows = group.map(function (e) { return renderXp(e); }).join('');
      return '<div class="cat-block reveal" id="cat-' + c + '">' +
        '<div class="cat-title"><span class="ct-mark">' + CAT[c].mark + '</span><h3>' + esc(CAT[c].label) + '</h3>' +
        '<span class="ct-count">' + group.length + ' ' + (group.length === 1 ? 'entry' : 'entries') + '</span></div>' +
        '<div class="cat-rule"></div>' + rows + '</div>';
    }).join('');
    host.innerHTML =
      '<div class="section-head reveal"><span class="eyebrow">Portfolio</span><h2>Selected Work</h2>' +
      '<p class="lead">Research, hardware, and mission projects across three threads.</p></div>' +
      '<div class="work-nav reveal">' + nav + '</div>' + blocks;
  }
  function renderXp(e) {
    var bullets = (e.bullets && e.bullets.length)
      ? '<ul class="xp-list">' + e.bullets.map(function (b) { return '<li>' + inlineMd(b) + '</li>'; }).join('') + '</ul>' : '';
    var stats = (e.stats && e.stats.length)
      ? '<div class="xp-stats">' + e.stats.map(function (s) { return '<div class="xp-stat"><span class="v">' + esc(s.v) + '</span> <span class="l">' + esc(s.l) + '</span></div>'; }).join('') + '</div>' : '';
    var tags = (e.tags && e.tags.length)
      ? '<div class="xp-tags">' + e.tags.map(function (t) { return '<span class="xp-tag">' + esc(t) + '</span>'; }).join('') + '</div>' : '';
    var link = '';
    if (e.link && e.link.url) link = '<a class="xp-link" href="' + esc(e.link.url) + '" target="_blank" rel="noopener">' + esc(e.link.label || 'View') + ' &rarr;</a>';
    else if (e.pdf && e.pdf.file) link = '<a class="xp-link" href="#" onclick="openPDF(\'' + esc(e.pdf.file) + '\',\'' + esc(e.title).replace(/'/g, "\\'") + '\');return false;">' + esc(e.pdf.label || 'View paper') + ' &rarr;</a>';
    var incoming = e.incoming ? '<span class="xp-incoming">Incoming</span>' : '';
    return '<div class="xp">' +
      '<div class="xp-date">' + esc(e.date || '') + '</div>' +
      '<div class="xp-main"><h4>' + esc(e.title) + incoming + '</h4>' +
      (e.org ? '<div class="xp-org">' + esc(e.org) + '</div>' : '') +
      stats + tags + bullets + link + '</div></div>';
  }

  /* ---------- GALLERY ---------- */
  function renderGallery(photos) {
    var host = document.getElementById('gallery');
    if (!host || !photos || !photos.length) { if (host) host.style.display = 'none'; return; }
    var plates = photos.map(function (ph) {
      return '<figure class="plate"><img loading="lazy" decoding="async" src="' + esc(ph.file) + '" alt="' + esc(ph.title || '') + '">' +
        '<figcaption class="cap"><strong>' + esc(ph.title || '') + '</strong><span>' + esc(ph.caption || '') + '</span></figcaption></figure>';
    }).join('');
    host.innerHTML =
      '<div class="section-head reveal"><span class="eyebrow">Field Notes</span><h2>Moments</h2></div>' +
      '<div class="gallery reveal">' + plates + '</div>';
  }

  /* ---------- SKILLS + AWARDS ---------- */
  function renderSkillsAwards(skills, awards) {
    var host = document.getElementById('skills');
    if (!host) return;
    var sk = (skills || []).map(function (g) {
      return '<div class="skill-group"><div class="sg-label">' + esc(g.group) + '</div><div class="skill-items">' +
        (g.items || []).map(function (i) { return '<span>' + esc(i) + '</span>'; }).join('') + '</div></div>';
    }).join('');
    var aw = (awards || []).map(function (a) {
      return '<div class="award"><div class="a-mark">&#9670;</div><div><div class="a-title">' + esc(a.title) + '</div>' +
        '<div class="a-detail">' + esc(a.detail || '') + '</div></div></div>';
    }).join('');
    host.innerHTML =
      '<div class="section-head reveal"><span class="eyebrow">Toolkit</span><h2>Skills &amp; Honors</h2></div>' +
      '<div class="sa-wrap reveal"><div class="sa-col"><h3>Skills</h3>' + sk + '</div>' +
      '<div class="sa-col"><h3>Honors &amp; Awards</h3>' + aw + '</div></div>';
  }

  /* ---------- BLOG PAGE ---------- */
  function renderBlog(data) {
    var listHost = document.getElementById('blogList');
    if (!listHost) return;
    var posts = (data.posts || []).slice().sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var params = new URLSearchParams(location.search);
    var pid = params.get('p');
    if (pid) {
      var post = posts.filter(function (x) { return x.id === pid; })[0];
      if (post) { renderSinglePost(post); return; }
    }
    document.title = 'The Notebook · ' + (data.profile ? data.profile.name : 'Blog');
    var heroHost = document.getElementById('blogHero');
    if (heroHost) heroHost.innerHTML =
      '<div class="article-hero"><span class="a-cat">The Notebook</span><h1>Essays &amp; Field Notes</h1>' +
      '<p class="a-meta">Writing on semiconductors, materials, and the philosophy of building.</p></div>';
    listHost.innerHTML = '<div class="notebook">' + posts.map(function (post) {
      return '<article class="nb-item">' +
        '<div class="nb-meta"><span class="cat">' + esc((CAT[post.cat] || {}).name || '') + '</span>' + esc(fmtDate(post.date)) + '<br>' + esc(post.readTime || '') + '</div>' +
        '<div class="nb-body"><h3><a href="blog.html?p=' + encodeURIComponent(post.id) + '">' + esc(post.title) + '</a></h3>' +
        '<p>' + esc(post.excerpt || '') + '</p>' +
        '<a class="more" href="blog.html?p=' + encodeURIComponent(post.id) + '">Read essay &rarr;</a></div></article>';
    }).join('') + '</div>' +
    '<a class="back-link" href="index.html">&larr; Back to portfolio</a>';
  }
  function renderSinglePost(post) {
    document.title = post.title + ' · Zhaniya Turganova';
    var heroHost = document.getElementById('blogHero');
    var listHost = document.getElementById('blogList');
    if (heroHost) heroHost.innerHTML =
      '<div class="article-hero"><span class="a-cat">' + esc((CAT[post.cat] || {}).name || 'Essay') + '</span>' +
      '<h1>' + esc(post.title) + '</h1>' +
      '<p class="a-meta">' + esc(fmtDate(post.date)) + ' &nbsp;·&nbsp; ' + esc(post.readTime || '') + '</p></div>';
    listHost.innerHTML = '<article class="prose">' + markdown(post.body) + '</article>' +
      '<div class="post-list"><a class="back-link" href="blog.html">&larr; All essays</a></div>';
  }

  /* ---------- interactions ---------- */
  function wire() {
    var nav = document.getElementById('topnav');
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () { links.classList.toggle('open'); });
      links.addEventListener('click', function (e) { if (e.target.tagName === 'A') links.classList.remove('open'); });
    }
    var prog = document.getElementById('scrollProgress');
    var top = document.getElementById('toTop');
    function onScroll() {
      var h = document.documentElement;
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 30);
      if (prog) prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
      if (top) top.classList.toggle('show', window.scrollY > 600);
      spy();
    }
    var spyLinks = links ? [].slice.call(links.querySelectorAll('a[href^="#"]')) : [];
    var spyTargets = spyLinks.map(function (a) { var t = document.querySelector(a.getAttribute('href')); return t ? { a: a, t: t } : null; }).filter(Boolean);
    function spy() {
      var pos = window.scrollY + 130, cur = null;
      spyTargets.forEach(function (o) { if (o.t.offsetTop <= pos) cur = o; });
      spyLinks.forEach(function (a) { a.classList.remove('current'); });
      if (cur) cur.a.classList.add('current');
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    onScroll();

    // reveal
    var revs = [].slice.call(document.querySelectorAll('.reveal'));
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: .1 });
      revs.forEach(function (r) { io.observe(r); });
    } else { revs.forEach(function (r) { r.classList.add('in'); }); }

    // counters
    var counters = [].slice.call(document.querySelectorAll('[data-count]'));
    function count(eln) {
      var raw = eln.textContent.trim(), m = raw.match(/^(\d+(?:\.\d+)?)/);
      if (!m) return;
      var target = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, suf = raw.slice(m[1].length), start = null;
      function step(ts) { if (!start) start = ts; var p = Math.min((ts - start) / 1000, 1); var e = 1 - Math.pow(1 - p, 3); eln.textContent = (target * e).toFixed(dec) + suf; if (p < 1) requestAnimationFrame(step); else eln.textContent = target.toFixed(dec) + suf; }
      requestAnimationFrame(step);
    }
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { count(en.target); io2.unobserve(en.target); } }); }, { threshold: .6 });
      counters.forEach(function (c) { io2.observe(c); });
    } else { counters.forEach(count); }
  }

  /* ---------- PDF modal ---------- */
  window.openPDF = function (url, title) {
    var modal = document.getElementById('pdf-modal');
    if (!modal) { window.open(url, '_blank'); return; }
    modal.querySelector('strong').textContent = title || 'Document';
    modal.querySelector('.pm-dl').href = url;
    modal.querySelector('iframe').src = url + '#view=FitH';
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };
  window.closePDF = function () {
    var modal = document.getElementById('pdf-modal');
    if (!modal) return;
    modal.style.display = 'none';
    modal.querySelector('iframe').src = '';
    document.body.style.overflow = '';
  };

  /* ---------- boot ---------- */
  function boot(data) {
    if (document.getElementById('hero')) {
      renderHero(data.profile || {});
      renderNotebook(data.posts || []);
      renderWork(data.experiences || []);
      renderGallery(data.gallery || []);
      renderSkillsAwards(data.skills || [], data.awards || []);
    }
    renderBlog(data);
    wire();
    var pm = document.getElementById('pdf-modal');
    if (pm) {
      pm.addEventListener('click', function (e) { if (e.target === pm) window.closePDF(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') window.closePDF(); });
    }
  }

  fetch('content.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('content.json ' + r.status); return r.json(); })
    .then(boot)
    .catch(function (err) {
      var m = document.querySelector('.loading');
      if (m) m.textContent = 'Could not load content.json — ' + err.message;
      console.error(err);
    });
})();
