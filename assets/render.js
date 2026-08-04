/* ============================================================
   render.js v5 — content.json -> pages ("ledger" split layout)
   Sticky identity sidebar + left-aligned content column.
   Schema unchanged. Subpages (blog/gallery) keep the pill nav.
   ============================================================ */
(function () {
  'use strict';

  var CAT = {
    chip:  { label: 'chip design & hardware', mark: 'I', name: 'chip' },
    mat:   { label: 'materials science & devices', mark: 'II', name: 'materials' },
    space: { label: 'space & entrepreneurship', mark: 'III', name: 'space' }
  };
  var REDUCE = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE = window.matchMedia && matchMedia('(pointer: fine)').matches;

  /* ---------- helpers ---------- */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function clean(s){ return String(s==null?'':s).replace(/^\s*\[[^\]]*\]\s*/, ''); }
  function fmtDate(iso){ if(!iso) return ''; var d=new Date(iso+(iso.length===10?'T00:00:00':'')); return isNaN(d)?iso:d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }
  function inlineMd(s){
    s=esc(s);
    s=s.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g,'$1<em>$2</em>');
    s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,function(_,t,u){var safe=/^(https?:|mailto:|pdf\/|\/|#)/.test(u)?u:'#';return '<a href="'+esc(safe)+'"'+(/^https?:/.test(safe)?' target="_blank" rel="noopener"':'')+'>'+t+'</a>';});
    return s;
  }
  function markdown(text){
    var ls=String(text||'').replace(/\r\n/g,'\n').split('\n'),out=[],i=0;
    function fl(t,items){ out.push('<'+t+'>'+items.map(function(x){return '<li>'+inlineMd(x)+'</li>';}).join('')+'</'+t+'>'); }
    while(i<ls.length){ var l=ls[i];
      if(/^\s*$/.test(l)){i++;continue;}
      if(/^###\s+/.test(l)){out.push('<h3>'+inlineMd(l.replace(/^###\s+/,''))+'</h3>');i++;continue;}
      if(/^##\s+/.test(l)){out.push('<h2>'+inlineMd(l.replace(/^##\s+/,''))+'</h2>');i++;continue;}
      if(/^#\s+/.test(l)){out.push('<h2>'+inlineMd(l.replace(/^#\s+/,''))+'</h2>');i++;continue;}
      if(/^---+\s*$/.test(l)){out.push('<hr>');i++;continue;}
      var imgM=l.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
      if(imgM){ var isrc=/^(https?:|img\/|pdf\/|\/)/.test(imgM[2])?imgM[2]:''; if(isrc) out.push('<img class="prose-img" loading="lazy" decoding="async" src="'+esc(isrc)+'" alt="'+esc(imgM[1])+'">'); i++; continue; }
      if(/^>\s?/.test(l)){var q=[];while(i<ls.length&&/^>\s?/.test(ls[i])){q.push(ls[i].replace(/^>\s?/,''));i++;}out.push('<blockquote>'+inlineMd(q.join(' '))+'</blockquote>');continue;}
      if(/^\s*[-*]\s+/.test(l)){var u=[];while(i<ls.length&&/^\s*[-*]\s+/.test(ls[i])){u.push(ls[i].replace(/^\s*[-*]\s+/,''));i++;}fl('ul',u);continue;}
      if(/^\s*\d+\.\s+/.test(l)){var o=[];while(i<ls.length&&/^\s*\d+\.\s+/.test(ls[i])){o.push(ls[i].replace(/^\s*\d+\.\s+/,''));i++;}fl('ol',o);continue;}
      var p=[];while(i<ls.length&&!/^\s*$/.test(ls[i])&&!/^(#{1,3}\s|>\s?|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(ls[i])){p.push(ls[i]);i++;}
      out.push('<p>'+inlineMd(p.join(' '))+'</p>');
    }
    return out.join('\n');
  }
  function proseLines(text){
    text = clean(text);
    if(!text) return '';
    return String(text).split(/\n\n+/).map(function(para){
      para = para.replace(/\n+/g,' ').trim();
      if(!para) return '';
      var sents = para.split(/(?<=[.!?])\s+/);
      return '<p>'+sents.map(function(s){ return '<span class="sent">'+inlineMd(s)+'</span>'; }).join('')+'</p>';
    }).join('');
  }
  var ICON = {
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    linkedin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    github:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a11 11 0 0 0-3.5 21.4c.5.1.7-.2.7-.5v-2c-3 .6-3.7-1.3-3.7-1.3-.5-1.2-1.2-1.6-1.2-1.6-1-.7 0-.7 0-.7 1 .1 1.6 1.1 1.6 1.1 1 1.6 2.5 1.2 3.1.9 0-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 1.1a10 10 0 0 1 5.4 0c2-1.4 3-1.1 3-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.9 0 4.2-2.6 5.1-5 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A11 11 0 0 0 12 1z"/></svg>',
    phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>'
  };

  /* ---------- HERO (compact identity) ---------- */
  function renderHero(p){
    var host=document.getElementById('hero'); if(!host) return;
    var role=(p.location||'').indexOf('Georgia')>-1 ? 'electrical engineering · georgia tech' : (p.tagline||'');
    var links='';
    if(p.email) links+='<a href="mailto:'+esc(p.email)+'">'+ICON.mail+'email</a>';
    if(p.linkedin) links+='<a href="'+esc(p.linkedin)+'" target="_blank" rel="noopener">'+ICON.linkedin+'linkedin</a>';
    if(p.github) links+='<a href="'+esc(p.github)+'" target="_blank" rel="noopener">'+ICON.github+'github</a>';
    if(p.phone) links+='<a href="tel:'+esc(p.phone.replace(/[^0-9+]/g,''))+'">'+ICON.phone+esc(p.phone)+'</a>';
    host.innerHTML='<div class="hero-c">'+
      '<div class="side-hi">hi. i\'m</div>'+
      (p.photo?'<div class="hero-portrait"><img src="'+esc(p.photo)+'" alt="'+esc(p.name)+'" fetchpriority="high"></div>':'')+
      '<h1>'+esc(p.name)+'</h1>'+
      '<p class="hero-role">'+esc(role)+'</p>'+
      (p.tagline?'<p class="hero-tag">'+esc(p.tagline)+'</p>':'')+
      '<div class="side-links hero-links-row">'+links+'</div>'+
    '</div>';
  }

  /* ---------- ABOUT ---------- */
  function renderAbout(p){
    var host=document.getElementById('about'); if(!host) return;
    var stats=(p.stats||[]).map(function(s,i){return '<div class="hero-stat reveal" style="--d:'+(i*0.08)+'s"><span class="n" data-count>'+esc(s.value)+'</span><span class="l">'+esc(s.label)+'</span></div>';}).join('');
    host.innerHTML='<h2 class="sec-label">about</h2>'+
      '<div class="about-bio reveal">'+proseLines(p.bio||'')+'</div>'+
      '<div class="about-stats">'+stats+'</div>';
  }

  /* ---------- MOMENTS ---------- */
  function renderMoments(moments){
    var host=document.getElementById('moments'); if(!host||!moments||!moments.length){ if(host) host.style.display='none'; return; }
    var cards=moments.map(function(m,i){
      return '<figure class="m-card ph-reveal" style="--d:'+(Math.min(i,4)*0.08)+'s">'+
        '<img loading="'+(i<2?'eager':'lazy')+'" decoding="async" src="'+esc(m.file)+'" alt="'+esc(m.title||'')+'">'+
        '<figcaption class="moment-cap"><strong>'+esc(m.title||'')+'</strong><span>'+esc(m.caption||'')+'</span></figcaption></figure>';
    }).join('');
    host.innerHTML='<h2 class="sec-label">moments</h2>'+
      '<div class="strip-shell"><div class="strip" id="strip" tabindex="0" aria-label="photo strip — scroll horizontally">'+cards+'</div></div>'+
      '<div class="strip-ui">'+
        '<button class="strip-btn" id="stripPrev" aria-label="previous photos"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>'+
        '<div class="strip-progress" aria-hidden="true"><i id="stripBar"></i></div>'+
        '<button class="strip-btn" id="stripNext" aria-label="next photos"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>'+
      '</div>';
    wireStrip();
  }
  function wireStrip(){
    var strip=document.getElementById('strip'), bar=document.getElementById('stripBar');
    if(!strip) return;
    function prog(){ var max=strip.scrollWidth-strip.clientWidth; var f=max>0?strip.scrollLeft/max:0; if(bar) bar.style.width=(8+f*92)+'%'; }
    strip.addEventListener('scroll', prog, {passive:true});
    window.addEventListener('resize', prog); prog();
    var warmed=false;
    function warm(){ if(warmed) return; warmed=true; [].forEach.call(strip.querySelectorAll('img[loading="lazy"]'), function(im){ im.loading='eager'; }); }
    ['pointerenter','touchstart','focusin','scroll'].forEach(function(ev){ strip.addEventListener(ev, warm, {passive:true}); });
    if('IntersectionObserver' in window){ var wio=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ warm(); wio.disconnect(); } }); }, {rootMargin:'400px'}); wio.observe(strip); } else { warm(); }
    var prev=document.getElementById('stripPrev'), next=document.getElementById('stripNext');
    function go(dir){
      var from=strip.scrollLeft, target=from + dir*strip.clientWidth*0.72;
      strip.scrollTo({left: target, behavior: REDUCE?'auto':'smooth'});
      setTimeout(function(){ if(Math.abs(strip.scrollLeft-from)<8) strip.scrollLeft=target; }, 280);
    }
    if(prev) prev.addEventListener('click', function(){ go(-1); });
    if(next) next.addEventListener('click', function(){ go(1); });
    var down=false, moved=0, sx=0, sl=0;
    strip.addEventListener('pointerdown', function(e){ if(e.pointerType!=='mouse') return; down=true; moved=0; sx=e.clientX; sl=strip.scrollLeft; strip.classList.add('dragging'); strip.setPointerCapture(e.pointerId); });
    strip.addEventListener('pointermove', function(e){ if(!down) return; var dx=e.clientX-sx; if(Math.abs(dx)>4) moved=1; strip.scrollLeft=sl-dx; });
    function up(){ if(!down) return; down=false; strip.classList.remove('dragging'); }
    strip.addEventListener('pointerup', up); strip.addEventListener('pointercancel', up);
    strip.addEventListener('click', function(e){ if(moved){ e.preventDefault(); e.stopPropagation(); moved=0; } }, true);
  }

  /* ---------- THOUGHTS ---------- */
  function renderThoughts(p){
    var host=document.getElementById('thoughts'); if(!host) return;
    if(!p.thoughts||!p.thoughts.length){ host.style.display='none'; return; }
    host.innerHTML='<h2 class="sec-label">'+esc(p.thoughtsTitle||'thoughts')+'</h2>'+
      '<div class="thoughts">'+p.thoughts.map(function(t,i){
        if(t.body && t.body.trim()) return '<div class="thought reveal" style="--d:'+(i*0.08)+'s"><h3>'+esc(t.title)+'</h3>'+proseLines(t.body)+'</div>';
        return '<div class="thought reveal thought-standalone" style="--d:'+(i*0.08)+'s"><p>'+inlineMd(clean(t.title))+'</p></div>';
      }).join('')+'</div>';
  }

  /* ---------- WORK — venn field map + flat ledger ---------- */
  var FIELDS = {
    materials:    { label: 'materials',     color: '#4f46e5' },
    electrical:   { label: 'electrical',    color: '#0d9488' },
    aerospace:    { label: 'aerospace',     color: '#0284c7' },
    neuroscience: { label: 'neuroscience',  color: '#e11d48' },
    venture:      { label: 'venture',       color: '#d97706' }
  };
  var VENN_CIRCLES = [
    { f:'materials',    cx:330, cy:330, r:240, lx:185, ly:180 },
    { f:'electrical',   cx:620, cy:300, r:220, lx:770, ly:150 },
    { f:'aerospace',    cx:430, cy:590, r:215, lx:300, ly:700 },
    { f:'neuroscience', cx:760, cy:620, r:175, lx:835, ly:700 },
    { f:'venture',      cx:560, cy:135, r:125, lx:600, ly:45 }
  ];
  var VENN_NODES = {
    'ferroelectric':       { x:490, y:240, short:'fefet founder', fields:['materials','electrical'], big:true },
    'facchetti':           { x:485, y:345, short:'oects',          fields:['materials','electrical'] },
    'heterostructure':     { x:240, y:290, short:'mbe γ-inse',     fields:['materials'], flip:true },
    'mil-lab':             { x:230, y:420, short:'mil lab',        fields:['materials'], flip:true },
    'silicon-jackets':     { x:700, y:255, short:'silicon jackets',fields:['electrical'] },
    'hytech':              { x:760, y:350, short:'hytech fsae',    fields:['electrical'] },
    'kacher':              { x:450, y:150, short:'green steel',    fields:['materials','venture'], flip:true },
    'upenn-mt':            { x:600, y:70,  short:'upenn m&t',      fields:['venture'] },
    'unisat':              { x:595, y:485, short:'unisat',         fields:['electrical','aerospace'] },
    'piper':               { x:345, y:495, short:'piper aircraft', fields:['materials','aerospace'], flip:true },
    'geopolymer':          { x:432, y:520, short:'lunar concrete', fields:['materials','aerospace'] },
    'united-space-school': { x:380, y:558, short:'nasa uss',       fields:['materials','aerospace'], flip:true },
    'lunar-dome':          { x:455, y:690, short:'dome stress',    fields:['aerospace'], flip:true },
    'ai-chatbots':         { x:640, y:585, short:'lorelai',        fields:['aerospace','neuroscience'] },
    'neuroeconomics':      { x:605, y:655, short:'neuroeconomics', fields:['aerospace','neuroscience'], flip:true },
    'yale':                { x:815, y:585, short:'yale yygs',      fields:['neuroscience'] },
    'neuropathic':         { x:800, y:690, short:'neuropathic pain', fields:['neuroscience'] }
  };
  function fieldsFor(e){
    if(VENN_NODES[e.id] && VENN_NODES[e.id].fields) return VENN_NODES[e.id].fields;
    return e.cat==='chip'?['electrical']:e.cat==='mat'?['materials']:['aerospace'];
  }
  function buildVennSvg(exps){
    var svg='<svg class="venn" viewBox="0 0 1000 830" role="img" aria-label="a map of my fields — every project sits where its fields overlap">';
    VENN_CIRCLES.forEach(function(c){
      var col=FIELDS[c.f].color;
      svg+='<circle class="vc" data-field="'+c.f+'" cx="'+c.cx+'" cy="'+c.cy+'" r="'+c.r+'" fill="'+col+'" fill-opacity="0.055" stroke="'+col+'" stroke-opacity="0.35" stroke-width="1.6"></circle>';
    });
    VENN_CIRCLES.forEach(function(c){
      var col=FIELDS[c.f].color;
      svg+='<text class="vlabel" x="'+c.lx+'" y="'+c.ly+'" fill="'+col+'">'+esc(FIELDS[c.f].label)+'</text>';
    });
    exps.forEach(function(e){
      var n=VENN_NODES[e.id]; if(!n) return;
      var r=n.big?9:6;
      var anchor=n.flip?'end':'start';
      var tdx=n.flip?-14:14;
      svg+='<g class="vnode'+(n.big?' vbig':'')+'" data-target="xp-'+esc(e.id)+'" tabindex="0" role="button" aria-label="'+esc(e.title)+'">'+
        '<title>'+esc(e.title)+'</title>'+
        '<circle class="vhit" cx="'+n.x+'" cy="'+n.y+'" r="22" fill="transparent"></circle>'+
        (n.big?'<circle class="vpulse" cx="'+n.x+'" cy="'+n.y+'" r="'+r+'" fill="none" stroke="#4f46e5" stroke-width="1.4"></circle>':'')+
        '<circle class="vdot" cx="'+n.x+'" cy="'+n.y+'" r="'+r+'" fill="#121217"></circle>'+
        '<text class="vtext" x="'+(n.x+tdx)+'" y="'+(n.y+5)+'" text-anchor="'+anchor+'">'+esc(n.short)+'</text>'+
      '</g>';
    });
    svg+='</svg>';
    return svg;
  }
  var EXPS_BY_ID = {};
  function renderWork(exps){
    var host=document.getElementById('work'); if(!host) return;
    EXPS_BY_ID={}; exps.forEach(function(e){ EXPS_BY_ID[e.id]=e; });
    var unplaced=exps.filter(function(e){ return !VENN_NODES[e.id]; });
    var moreRow=unplaced.length?('<div class="venn-more reveal">'+unplaced.map(function(e){
        return '<button class="vmore" data-xp="'+esc(e.id)+'">'+esc(e.title)+'</button>';
      }).join('')+'</div>'):'';
    host.innerHTML='<h2 class="sec-label">work — a map of my fields</h2>'+
      '<p class="sec-sub">everything i\'ve worked on, placed where its fields overlap. click any dot for the full story.</p>'+
      '<div class="venn-wrap centered reveal">'+buildVennSvg(exps)+'</div>'+
      '<div class="venn-legend reveal">'+Object.keys(FIELDS).map(function(f){ return '<span class="vleg" style="--fc:'+FIELDS[f].color+'">'+esc(FIELDS[f].label)+'</span>'; }).join('')+'</div>'+moreRow;
    var svg=host.querySelector('.venn');
    if(svg){
      function open(g){ var id=(g.getAttribute('data-target')||'').replace(/^xp-/,''); if(EXPS_BY_ID[id]) openXpModal(EXPS_BY_ID[id]); }
      svg.addEventListener('click', function(e){ var g=e.target.closest('.vnode'); if(g) open(g); });
      svg.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ var g=e.target.closest('.vnode'); if(g){ e.preventDefault(); open(g); } } });
    }
    host.addEventListener('click', function(e){ var b=e.target.closest('.vmore'); if(b && EXPS_BY_ID[b.getAttribute('data-xp')]) openXpModal(EXPS_BY_ID[b.getAttribute('data-xp')]); });
  }
  /* ---------- experience detail modal ---------- */
  function xpDetail(e){
    var bullets=(e.bullets&&e.bullets.length)?'<ul class="xp-list">'+e.bullets.map(function(b){return '<li>'+inlineMd(b)+'</li>';}).join('')+'</ul>':'';
    var stats=(e.stats&&e.stats.length)?'<div class="xp-stats">'+e.stats.map(function(s){return '<div class="xp-stat"><span class="v">'+esc(s.v)+'</span> <span class="l">'+esc(s.l)+'</span></div>';}).join('')+'</div>':'';
    var tags=(e.tags&&e.tags.length)?'<div class="xp-tags">'+e.tags.map(function(t){return '<span class="xp-tag">'+esc(t)+'</span>';}).join('')+'</div>':'';
    var link='';
    if(e.link&&e.link.url) link='<a class="xp-link" href="'+esc(e.link.url)+'" target="_blank" rel="noopener">'+esc(e.link.label||'view')+' &rarr;</a>';
    else if(e.pdf&&e.pdf.file) link='<a class="xp-link" href="#" onclick="openPDF(\''+esc(e.pdf.file)+'\',\''+esc(e.title).replace(/'/g,"\\'")+'\');return false;">'+esc(e.pdf.label||'view paper')+' &rarr;</a>';
    var incoming=e.incoming?'<span class="xp-incoming">incoming</span>':'';
    var fchips=fieldsFor(e).map(function(f){ var fd=FIELDS[f]||{label:f,color:'#9b9ba4'}; return '<span class="fchip" style="--fc:'+fd.color+'">'+esc(fd.label)+'</span>'; }).join('');
    var pers=clean(e.personal);
    var personalBlock=pers?'<div class="xp-personal"><span class="xp-pl">in my words</span>'+proseLines(pers)+'</div>':'';
    return '<div class="xp-fields">'+fchips+'</div>'+
      '<h3 class="xpm-title">'+esc(e.title)+incoming+'</h3>'+
      '<div class="xpm-meta">'+esc(e.date||'')+(e.org?' &nbsp;·&nbsp; '+esc(e.org):'')+'</div>'+
      personalBlock+stats+tags+bullets+link;
  }
  function openXpModal(e){
    var m=document.getElementById('xp-modal'); if(!m) return;
    document.getElementById('xpmBody').innerHTML=xpDetail(e);
    m.style.display='flex'; document.body.style.overflow='hidden';
    var c=document.getElementById('xpmClose'); if(c) c.focus();
  }
  function closeXpModal(){
    var m=document.getElementById('xp-modal'); if(!m) return;
    m.style.display='none'; document.body.style.overflow='';
  }
  function renderXp(e, idx){
    var bullets=(e.bullets&&e.bullets.length)?'<ul class="xp-list">'+e.bullets.map(function(b){return '<li>'+inlineMd(b)+'</li>';}).join('')+'</ul>':'';
    var stats=(e.stats&&e.stats.length)?'<div class="xp-stats">'+e.stats.map(function(s){return '<div class="xp-stat"><span class="v">'+esc(s.v)+'</span> <span class="l">'+esc(s.l)+'</span></div>';}).join('')+'</div>':'';
    var tags=(e.tags&&e.tags.length)?'<div class="xp-tags">'+e.tags.map(function(t){return '<span class="xp-tag">'+esc(t)+'</span>';}).join('')+'</div>':'';
    var link='';
    if(e.link&&e.link.url) link='<a class="xp-link" href="'+esc(e.link.url)+'" target="_blank" rel="noopener">'+esc(e.link.label||'view')+' &rarr;</a>';
    else if(e.pdf&&e.pdf.file) link='<a class="xp-link" href="#" onclick="openPDF(\''+esc(e.pdf.file)+'\',\''+esc(e.title).replace(/'/g,"\\'")+'\');return false;">'+esc(e.pdf.label||'view paper')+' &rarr;</a>';
    var incoming=e.incoming?'<span class="xp-incoming">incoming</span>':'';
    var fchips=fieldsFor(e).map(function(f){ var fd=FIELDS[f]||{label:f,color:'#9b9ba4'}; return '<span class="fchip" style="--fc:'+fd.color+'">'+esc(fd.label)+'</span>'; }).join('');
    var pers=clean(e.personal);
    var personalBlock=pers?'<div class="xp-personal"><span class="xp-pl">in my words</span>'+proseLines(pers)+'</div>':'';
    return '<div class="xp reveal" id="xp-'+esc(e.id)+'" style="--d:'+(Math.min(idx||0,5)*0.05)+'s"><div class="xp-date">'+esc(e.date||'')+'</div><div class="xp-main"><div class="xp-head"><h4>'+esc(e.title)+incoming+'</h4><span class="xp-fields">'+fchips+'</span></div>'+(e.org?'<div class="xp-org">'+esc(e.org)+'</div>':'')+personalBlock+stats+tags+bullets+link+'</div></div>';
  }

  /* ---------- SKILLS + AWARDS ---------- */
  function renderSkillsAwards(skills,awards){
    var host=document.getElementById('skills'); if(!host) return;
    var sk=(skills||[]).map(function(g){
      return '<div class="skill-group"><div class="sg-label">'+esc(g.group)+'</div><div class="skill-items">'+
        (g.items||[]).map(function(it,i){return '<span style="--i:'+i+'">'+esc(it)+'</span>';}).join('')+'</div></div>';
    }).join('');
    var aw=(awards||[]).map(function(a){return '<div class="award"><div class="a-mark">&#9670;</div><div><div class="a-title">'+esc(a.title)+'</div><div class="a-detail">'+esc(a.detail||'')+'</div></div></div>';}).join('');
    host.innerHTML='<h2 class="sec-label">skills &amp; honors</h2>'+
      '<div class="sa-wrap reveal"><div class="sa-col"><h3>skills</h3>'+sk+'</div><div class="sa-col"><h3>honors &amp; awards</h3>'+aw+'</div></div>';
  }

  /* ---------- GALLERY (i'm not a robot) ---------- */
  function renderNotRobot(gallery){
    var host=document.getElementById('gallery'); if(!host) return;
    if(!gallery||!gallery.length){ host.style.display='none'; return; }
    var photos=gallery.slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    host.innerHTML='<h2 class="sec-label">and i\'m not a robot!</h2>'+
      '<p class="sec-sub">proof of life — a running photo log. <a href="gallery.html">see the full gallery &rarr;</a></p>'+
      '<div class="gallery-grid reveal">'+photos.map(function(ph){
        return '<figure class="gphoto"><img loading="lazy" decoding="async" src="'+esc(ph.file)+'" alt="'+esc(clean(ph.description)||'')+'">'+
          '<figcaption class="g-meta"><div class="g-date">'+esc(fmtDate(ph.date))+'</div><div class="g-desc">'+esc(clean(ph.description)||'')+'</div></figcaption></figure>';
      }).join('')+'</div>';
  }

  /* ---------- WRITING ---------- */
  function renderNotebook(posts){
    var host=document.getElementById('blog'); if(!host) return;
    if(!posts||!posts.length){ host.style.display='none'; return; }
    var sorted=posts.slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    var items=sorted.slice(0,3).map(function(post){
      return '<article class="nb-item"><div class="nb-meta"><span class="cat">'+esc((CAT[post.cat]||{}).name||'')+'</span>'+esc(fmtDate(post.date))+'<br>'+esc(post.readTime||'')+'</div>'+
        '<div class="nb-body"><h3><a href="blog.html?p='+encodeURIComponent(post.id)+'">'+esc(post.title)+'</a></h3><p>'+esc(post.excerpt||'')+'</p>'+
        '<a class="more" href="blog.html?p='+encodeURIComponent(post.id)+'">read essay &rarr;</a></div></article>';
    }).join('');
    host.innerHTML='<h2 class="sec-label">writing</h2>'+
      '<div class="reveal">'+items+'<div class="nb-foot"><a class="more" href="blog.html">view all '+posts.length+' posts &rarr;</a></div></div>';
  }

  /* ---------- CONNECT ---------- */
  function renderCTA(ui,profile,config){
    var host=document.getElementById('cta'); if(!host||!ui||!ui.cta) return;
    var c=ui.cta;
    host.innerHTML='<h2 class="sec-label">connect</h2>'+
      '<div class="cta reveal"><h2>'+esc(c.title)+'</h2>'+
      '<p class="lead">'+esc(c.subtitle)+'</p>'+
      '<div class="cta-opts" id="ctaOpts">'+c.options.map(function(o){return '<button class="cta-opt" data-intent="'+esc(o.key)+'">'+esc(o.label)+'</button>';}).join('')+'</div>'+
      '<form class="cta-form" id="ctaForm">'+
        '<label for="cf-name">your name</label><input id="cf-name" type="text" name="name" autocomplete="name">'+
        '<label for="cf-email">email</label><input id="cf-email" type="email" name="email" autocomplete="email">'+
        '<label for="cf-phone">phone (optional)</label><input id="cf-phone" type="text" name="phone" autocomplete="tel">'+
        '<label for="cf-msg">what\'s on your mind?</label><textarea id="cf-msg" name="message" placeholder="tell me what you think, or what you have in mind…"></textarea>'+
        '<button type="submit" class="cta-submit" id="ctaSubmit">send</button>'+
        '<div class="cta-note">'+(config&&config.formspree?'goes straight to my inbox.':'opens your email to send.')+'</div>'+
      '</form><div id="ctaThanks" aria-live="polite"></div></div>';
    wireCTA(c,profile,config);
  }
  function wireCTA(c,profile,config){
    var opts=document.getElementById('ctaOpts'), form=document.getElementById('ctaForm'), intent='';
    opts.addEventListener('click',function(e){ var b=e.target.closest('.cta-opt'); if(!b) return; [].forEach.call(opts.children,function(x){x.classList.remove('active');}); b.classList.add('active'); intent=b.dataset.intent; form.classList.add('open'); });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var fd={ intent:intent||'(none selected)', name:form.name.value.trim(), email:form.email.value.trim(), phone:form.phone.value.trim(), message:form.message.value.trim() };
      if(!fd.name||!fd.email){ toast('please add your name and email.'); return; }
      var btn=document.getElementById('ctaSubmit'); btn.disabled=true; btn.textContent='sending…';
      var endpoint=config&&config.formspree;
      if(endpoint){
        fetch(endpoint,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({_subject:'portfolio: '+fd.intent+' — '+fd.name, intent:fd.intent, name:fd.name, email:fd.email, phone:fd.phone, message:fd.message})})
          .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
          .then(function(){ ctaDone(c); }).catch(function(){ ctaMailto(profile,fd); });
      } else { ctaMailto(profile,fd); }
    });
  }
  function ctaDone(c){ document.getElementById('ctaForm').style.display='none'; document.getElementById('ctaOpts').style.display='none'; document.getElementById('ctaThanks').innerHTML='<div class="cta-thanks">'+esc(c.thanks||'thank you — i\'ll be in touch.')+'</div>'; }
  function ctaMailto(profile,fd){ var to=(profile&&profile.email)||''; var body='intent: '+fd.intent+'\nname: '+fd.name+'\nemail: '+fd.email+'\nphone: '+fd.phone+'\n\n'+fd.message; window.location.href='mailto:'+to+'?subject='+encodeURIComponent('portfolio message — '+fd.name)+'&body='+encodeURIComponent(body); var btn=document.getElementById('ctaSubmit'); if(btn){btn.disabled=false;btn.textContent='send';} }

  /* ---------- clock ---------- */
  function renderClock(){
    var clock=document.getElementById('clock'); if(!clock) return;
    function tick(){
      try{ clock.textContent=new Intl.DateTimeFormat('en-US',{hour:'numeric',minute:'2-digit',timeZone:'America/New_York'}).format(new Date()).toLowerCase()+' local'; }
      catch(e){ clock.textContent=''; }
    }
    tick(); setInterval(tick, 30000);
  }

  /* ---------- GALLERY PAGE ---------- */
  function renderGalleryPage(data){
    var host=document.getElementById('galleryPage'); if(!host) return;
    var photos=(data.gallery||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    var grid=photos.length?('<div class="gallery-grid">'+photos.map(function(ph){
      return '<figure class="gphoto reveal"><img loading="lazy" decoding="async" src="'+esc(ph.file)+'" alt="'+esc(clean(ph.description)||'')+'"><figcaption class="g-meta"><div class="g-date">'+esc(fmtDate(ph.date))+'</div><div class="g-desc">'+esc(clean(ph.description)||'')+'</div></figcaption></figure>';
    }).join('')+'</div>'):'<p class="loading">no photos yet — check back soon.</p>';
    host.innerHTML='<div class="article-hero"><span class="a-cat">gallery</span><h1>gallery</h1><p class="a-meta">a running photo log — moments big and small.</p></div>'+grid+
      '<div class="post-list"><a class="back-link" href="index.html">&larr; back to portfolio</a></div>';
  }

  /* ---------- BLOG PAGE ---------- */
  function renderBlog(data){
    var listHost=document.getElementById('blogList'); if(!listHost) return;
    var posts=(data.posts||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    var pid=new URLSearchParams(location.search).get('p');
    if(pid){ var post=posts.filter(function(x){return x.id===pid;})[0]; if(post){ renderSinglePost(post); return; } }
    var hero=document.getElementById('blogHero');
    if(hero) hero.innerHTML='<div class="article-hero"><span class="a-cat">the notebook</span><h1>essays &amp; field notes</h1><p class="a-meta">writing on semiconductors, materials, and the philosophy of building.</p></div>';
    listHost.innerHTML=(posts.length?('<div class="notebook">'+posts.map(function(post){
      return '<article class="nb-item reveal"><div class="nb-meta"><span class="cat">'+esc((CAT[post.cat]||{}).name||'')+'</span>'+esc(fmtDate(post.date))+'<br>'+esc(post.readTime||'')+'</div>'+
        '<div class="nb-body"><h3><a href="blog.html?p='+encodeURIComponent(post.id)+'">'+esc(post.title)+'</a></h3><p>'+esc(post.excerpt||'')+'</p>'+
        '<a class="more" href="blog.html?p='+encodeURIComponent(post.id)+'">read essay &rarr;</a></div></article>';
    }).join('')+'</div>'):'<p class="loading" style="text-align:center;">no essays yet — check back soon.</p>')+
    '<div class="post-list"><a class="back-link" href="index.html">&larr; back to portfolio</a></div>';
  }
  function renderSinglePost(post){
    document.title=post.title+' · zhaniya turganova';
    var hero=document.getElementById('blogHero'), list=document.getElementById('blogList');
    if(hero) hero.innerHTML='<div class="article-hero"><span class="a-cat">'+esc((CAT[post.cat]||{}).name||'essay')+'</span><h1>'+esc(post.title)+'</h1><p class="a-meta">'+esc(fmtDate(post.date))+' &nbsp;·&nbsp; '+esc(post.readTime||'')+'</p></div>';
    list.innerHTML='<article class="prose">'+markdown(post.body)+'</article><div class="post-list"><a class="back-link" href="blog.html">&larr; all essays</a></div>';
  }

  /* ---------- toast ---------- */
  var toastEl=null, toastTimer=null;
  function toast(msg){
    if(!toastEl){ toastEl=document.createElement('div'); toastEl.className='toast'; toastEl.setAttribute('role','status'); document.body.appendChild(toastEl); }
    toastEl.textContent=msg; toastEl.classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(function(){ toastEl.classList.remove('show'); }, 4200);
  }

  /* ---------- wiring ---------- */
  function wire(){
    /* subpage pill nav (blog/gallery) */
    var nav=document.getElementById('topnav'), toggle=document.getElementById('navToggle'), links=document.getElementById('navLinks');
    if(toggle&&links){ toggle.addEventListener('click',function(){links.classList.toggle('open');}); links.addEventListener('click',function(e){if(e.target.tagName==='A')links.classList.remove('open');}); }
    var prog=document.getElementById('scrollProgress'), top=document.getElementById('toTop');
    /* nav scrollspy (anchor links only) */
    var spyLinks=links?[].slice.call(links.querySelectorAll('a[href^="#"]')):[];
    var spyTargets=spyLinks.map(function(a){var t=document.querySelector(a.getAttribute('href'));return t?{a:a,t:t}:null;}).filter(Boolean);
    function onScroll(){
      var h=document.documentElement, y=window.scrollY;
      if(nav) nav.classList.toggle('scrolled', y>30);
      if(prog) prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
      if(top) top.classList.toggle('show', y>700);
      var pos=y+Math.round(window.innerHeight*0.35), cur=null;
      var visible=spyTargets.filter(function(o){ return o.t.style.display!=='none'; });
      visible.forEach(function(o){ if(o.t.offsetTop<=pos) cur=o; });
      if(y+window.innerHeight >= h.scrollHeight-6 && visible.length) cur=visible[visible.length-1]; /* bottom: last section wins */
      spyLinks.forEach(function(a){ a.classList.remove('current'); });
      if(cur) cur.a.classList.add('current');
    }
    window.addEventListener('scroll', onScroll, {passive:true});
    if(top) top.addEventListener('click', function(){ window.scrollTo({top:0, behavior: REDUCE?'auto':'smooth'}); });
    onScroll(); observeReveals();
    /* counters */
    var counters=[].slice.call(document.querySelectorAll('[data-count]'));
    function count(el){ var raw=el.textContent.trim(),m=raw.match(/^(\d+(?:\.\d+)?)/); if(!m)return; var target=parseFloat(m[1]),dec=(m[1].split('.')[1]||'').length,suf=raw.slice(m[1].length),start=null; function step(ts){if(!start)start=ts;var p=Math.min((ts-start)/1100,1),e2=1-Math.pow(1-p,3);el.textContent=(target*e2).toFixed(dec)+suf;if(p<1)requestAnimationFrame(step);else el.textContent=target.toFixed(dec)+suf;} requestAnimationFrame(step); }
    if('IntersectionObserver' in window && !REDUCE){ var io2=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){count(en.target);io2.unobserve(en.target);}});},{threshold:.6}); counters.forEach(function(cEl){io2.observe(cEl);}); }
    /* easter egg — her own line */
    var buf='';
    document.addEventListener('keydown', function(e){
      if(/input|textarea|select/i.test((e.target&&e.target.tagName)||'')) return;
      if(e.key && e.key.length===1){ buf=(buf+e.key.toLowerCase()).slice(-8); if(buf.slice(-4)==='zero'){ toast('the answer is (as it always is) actually just zero.'); buf=''; } }
    });
  }
  var revealObserver=null;
  function observeReveals(){
    var els=[].slice.call(document.querySelectorAll('.reveal:not(.in), .ph-reveal:not(.in)'));
    if(!('IntersectionObserver' in window) || REDUCE){ els.forEach(function(e){e.classList.add('in');}); return; }
    if(!revealObserver){ revealObserver=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');revealObserver.unobserve(en.target);}});},{threshold:.08, rootMargin:'0px 0px -4% 0px'}); }
    els.forEach(function(e){revealObserver.observe(e);});
  }

  /* ---------- fx: cursor ring, tilt, magnetic ---------- */
  function fx(){
    if(REDUCE || !FINE) return;
    var ring=document.createElement('div'); ring.className='cursor-ring'; ring.setAttribute('aria-hidden','true'); document.body.appendChild(ring);
    var tx=innerWidth/2, ty=innerHeight/2, rx=tx, ry=ty, raf=null;
    function loop(){
      rx+=(tx-rx)*.28; ry+=(ty-ry)*.28;
      ring.style.transform='translate3d('+rx.toFixed(1)+'px,'+ry.toFixed(1)+'px,0)';
      if(Math.abs(tx-rx)>.4||Math.abs(ty-ry)>.4) raf=requestAnimationFrame(loop); else raf=null;
    }
    window.addEventListener('pointermove', function(e){ tx=e.clientX; ty=e.clientY; document.body.classList.add('cursor-on'); if(!raf) raf=requestAnimationFrame(loop); }, {passive:true});
    document.addEventListener('pointerover', function(e){ ring.classList.toggle('hot', !!(e.target.closest && e.target.closest('a, button, .m-card, .hero-stat, .gphoto'))); });
    [].forEach.call(document.querySelectorAll('.m-card, .gphoto'), function(el){
      el.classList.add('tilt-3d');
      el.addEventListener('pointermove', function(e){
        if(el.closest('.strip') && el.closest('.strip').classList.contains('dragging')) return;
        var r=el.getBoundingClientRect(); var px=(e.clientX-r.left)/r.width-.5, py=(e.clientY-r.top)/r.height-.5;
        el.style.transition='transform .18s ease';
        el.style.transform='perspective(1000px) rotateX('+(-py*5).toFixed(2)+'deg) rotateY('+(px*7).toFixed(2)+'deg)';
      });
      el.addEventListener('pointerleave', function(){ el.style.transform=''; el.style.transition=''; });
    });
    [].forEach.call(document.querySelectorAll('.nav-cta, .cta-submit, .cta-opt, .to-top, .strip-btn'), function(el){
      el.addEventListener('pointermove', function(e){ var r=el.getBoundingClientRect(); var x=((e.clientX-r.left)/r.width-.5)*r.width*.28, y=((e.clientY-r.top)/r.height-.5)*r.height*.4; el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) scale(1.05)'; });
      el.addEventListener('pointerleave', function(){ el.style.transform=''; });
    });
  }

  /* ---------- PDF modal ---------- */
  window.openPDF=function(url,title){ var m=document.getElementById('pdf-modal'); if(!m){window.open(url,'_blank');return;} m.querySelector('strong').textContent=title||'document'; m.querySelector('.pm-dl').href=url; m.querySelector('iframe').src=url+'#view=FitH'; m.style.display='flex'; document.body.style.overflow='hidden'; };
  window.closePDF=function(){ var m=document.getElementById('pdf-modal'); if(!m)return; m.style.display='none'; m.querySelector('iframe').src=''; document.body.style.overflow=''; };

  /* ---------- boot ---------- */
  function boot(data){
    if(document.getElementById('work') && document.getElementById('hero')){
      var p=data.profile||{};
      renderHero(p);
      renderWork(data.experiences||[]);
      renderAbout(p);
      renderMoments(data.moments||[]);
      renderThoughts(p);
      renderSkillsAwards(data.skills||[],data.awards||[]);
      renderNotRobot(data.gallery||[]);
      renderNotebook(data.posts||[]);
      renderCTA(data.ui||{},data.profile||{},data.config||{});
      renderClock();
      /* experience modal close wiring */
      var xm=document.getElementById('xp-modal');
      if(xm){
        xm.addEventListener('click', function(e){ if(e.target===xm) closeXpModal(); });
        var xc=document.getElementById('xpmClose'); if(xc) xc.addEventListener('click', closeXpModal);
      }
    }
    renderGalleryPage(data);
    renderBlog(data);
    wire();
    fx();
    var loader=document.getElementById('loader');
    setTimeout(function(){ if(loader) loader.classList.add('done'); }, loader && !REDUCE ? 450 : 0);
    var pm=document.getElementById('pdf-modal');
    if(pm){ pm.addEventListener('click',function(e){if(e.target===pm)window.closePDF();}); }
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ window.closePDF(); closeXpModal(); } });
  }

  fetch('content.json',{cache:'no-cache'})
    .then(function(r){ if(!r.ok) throw new Error('content.json '+r.status); return r.json(); })
    .then(boot)
    .catch(function(err){
      var l=document.getElementById('loader'); if(l) l.classList.add('done');
      var m=document.querySelector('.loading'); if(m) m.textContent='could not load content.json — '+err.message;
      console.error(err);
    });
})();
