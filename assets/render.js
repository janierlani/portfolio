/* ============================================================
   render.js v2 — content.json -> pages
   Audience modes, cinematic moments, capture form, gallery.
   ============================================================ */
(function () {
  'use strict';

  var CAT = {
    chip:  { label: 'Chip Design & Hardware', mark: 'I', name: 'Chip Design' },
    mat:   { label: 'Materials Science & Devices', mark: 'II', name: 'Materials' },
    space: { label: 'Space & Entrepreneurship', mark: 'III', name: 'Space' }
  };
  var DATA = null;

  /* ---------- helpers ---------- */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
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
      if(/^>\s?/.test(l)){var q=[];while(i<ls.length&&/^>\s?/.test(ls[i])){q.push(ls[i].replace(/^>\s?/,''));i++;}out.push('<blockquote>'+inlineMd(q.join(' '))+'</blockquote>');continue;}
      if(/^\s*[-*]\s+/.test(l)){var u=[];while(i<ls.length&&/^\s*[-*]\s+/.test(ls[i])){u.push(ls[i].replace(/^\s*[-*]\s+/,''));i++;}fl('ul',u);continue;}
      if(/^\s*\d+\.\s+/.test(l)){var o=[];while(i<ls.length&&/^\s*\d+\.\s+/.test(ls[i])){o.push(ls[i].replace(/^\s*\d+\.\s+/,''));i++;}fl('ol',o);continue;}
      var p=[];while(i<ls.length&&!/^\s*$/.test(ls[i])&&!/^(#{1,3}\s|>\s?|\s*[-*]\s|\s*\d+\.\s|---+\s*$)/.test(ls[i])){p.push(ls[i]);i++;}
      out.push('<p>'+inlineMd(p.join(' '))+'</p>');
    }
    return out.join('\n');
  }
  var ICON = {
    mail:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
    linkedin:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    github:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a11 11 0 0 0-3.5 21.4c.5.1.7-.2.7-.5v-2c-3 .6-3.7-1.3-3.7-1.3-.5-1.2-1.2-1.6-1.2-1.6-1-.7 0-.7 0-.7 1 .1 1.6 1.1 1.6 1.1 1 1.6 2.5 1.2 3.1.9 0-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.1 1.1-2.9-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 1.1a10 10 0 0 1 5.4 0c2-1.4 3-1.1 3-1.1.6 1.4.2 2.5.1 2.8.7.8 1.1 1.7 1.1 2.9 0 4.2-2.6 5.1-5 5.4.4.3.8 1 .8 2v3c0 .3.2.6.7.5A11 11 0 0 0 12 1z"/></svg>',
    phone:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></svg>'
  };

  /* ---------- audience mode ---------- */
  function setMode(mode){
    document.body.classList.remove('mode-pro','mode-personal');
    document.body.classList.add(mode==='personal'?'mode-personal':'mode-pro');
    try{ localStorage.setItem('aud_mode', mode); }catch(e){}
    var lbl=document.getElementById('modeLabel');
    if(lbl) lbl.textContent = mode==='personal'?'Personal':'Recruiter';
  }
  function showAudience(){
    var ov=document.getElementById('audOverlay'); if(!ov) return;
    ov.classList.add('show');
  }
  function hideAudience(){ var ov=document.getElementById('audOverlay'); if(ov) ov.classList.remove('show'); }
  function buildAudience(ui){
    var ov=document.getElementById('audOverlay'); if(!ov||!ui||!ui.audience) return;
    var a=ui.audience;
    ov.innerHTML='<div class="audience-card"><span class="eyebrow">Quick start</span>'+
      '<h2>'+esc(a.title)+'</h2><p class="sub">'+esc(a.subtitle)+'</p>'+
      a.options.map(function(o){return '<button class="aud-opt" data-mode="'+esc(o.mode)+'" data-key="'+esc(o.key)+'"><span class="ao-label">'+esc(o.label)+'</span><span class="ao-desc">'+esc(o.desc)+'</span></button>';}).join('')+
      '<button class="aud-skip" data-skip>Skip — just show me everything</button></div>';
  }

  /* ---------- HERO ---------- */
  function renderHero(p){
    var host=document.getElementById('hero'); if(!host) return;
    var parts=p.name.split(' '), last=parts.pop(), first=parts.join(' ');
    host.innerHTML='<div class="hero-inner">'+
      (p.photo?'<div class="hero-portrait"><img src="'+esc(p.photo)+'" alt="'+esc(p.name)+'"></div>':'')+
      (p.kicker?'<div class="hero-kicker">'+esc(p.kicker)+'</div>':'')+
      '<h1>'+esc(first)+' <span class="accent">'+esc(last)+'</span></h1>'+
      (p.tagline?'<div class="hero-tagline">'+esc(p.tagline)+'</div>':'')+
      '<div class="scroll-hint">Scroll<span class="arrow"></span></div>'+
    '</div>';
  }

  /* ---------- MOMENTS (cinematic) ---------- */
  function renderMoments(moments){
    var host=document.getElementById('moments'); if(!host||!moments||!moments.length){ if(host) host.style.display='none'; return; }
    host.innerHTML='<div class="moments-intro reveal"><span class="eyebrow">Moments</span><h2>Where the work has taken me</h2>'+
      '<p>Astronauts, labs, launch pads, and a few rooms I never expected to be in.</p></div><div id="moments-stream"></div>';
    var stream=document.getElementById('moments-stream');
    Promise.all(moments.map(loadDim)).then(function(items){
      stream.innerHTML=buildMoments(items);
      observePhotos();
    });
  }
  function loadDim(m){
    return new Promise(function(res){
      var img=new Image();
      img.onload=function(){ res({ m:m, portrait:img.naturalHeight > img.naturalWidth*1.05 }); };
      img.onerror=function(){ res({ m:m, portrait:false }); };
      img.src=m.file;
    });
  }
  function momCap(m){ return '<div class="moment-cap"><strong>'+esc(m.title||'')+'</strong><span>'+esc(m.caption||'')+'</span></div>'; }
  function buildMoments(items){
    var html='', i=0;
    while(i<items.length){
      var it=items[i];
      if(it.portrait && items[i+1] && items[i+1].portrait){
        html+='<div class="moment-pair"><div class="moment-cell ph-reveal"><img loading="lazy" decoding="async" src="'+esc(it.m.file)+'" alt="'+esc(it.m.title)+'">'+momCap(it.m)+'</div>'+
          '<div class="moment-cell ph-reveal"><img loading="lazy" decoding="async" src="'+esc(items[i+1].m.file)+'" alt="'+esc(items[i+1].m.title)+'">'+momCap(items[i+1].m)+'</div></div>';
        i+=2;
      } else if(it.portrait){
        html+='<div class="moment-pair" style="grid-template-columns:1fr;max-width:540px;"><div class="moment-cell ph-reveal"><img loading="lazy" decoding="async" src="'+esc(it.m.file)+'" alt="'+esc(it.m.title)+'">'+momCap(it.m)+'</div></div>';
        i++;
      } else {
        html+='<div class="moment-full ph-reveal"><img loading="lazy" decoding="async" src="'+esc(it.m.file)+'" alt="'+esc(it.m.title)+'">'+momCap(it.m)+'</div>';
        i++;
      }
    }
    return html;
  }
  var photoObserver=null;
  function observePhotos(){
    var els=[].slice.call(document.querySelectorAll('.ph-reveal:not(.in)'));
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in');}); return; }
    if(!photoObserver){ photoObserver=new IntersectionObserver(function(en){ en.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); photoObserver.unobserve(x.target);} }); },{threshold:.18}); }
    els.forEach(function(e){ photoObserver.observe(e); });
  }

  /* ---------- INTRO / BIO (mode aware) ---------- */
  function renderIntro(p){
    var host=document.getElementById('intro'); if(!host) return;
    var stats=(p.stats||[]).map(function(s){return '<div class="hero-stat"><span class="n" data-count>'+esc(s.value)+'</span><span class="l">'+esc(s.label)+'</span></div>';}).join('');
    var links='';
    if(p.email) links+='<a href="mailto:'+esc(p.email)+'">'+ICON.mail+esc(p.email)+'</a>';
    if(p.linkedin) links+='<a href="'+esc(p.linkedin)+'" target="_blank" rel="noopener">'+ICON.linkedin+'LinkedIn</a>';
    if(p.github) links+='<a href="'+esc(p.github)+'" target="_blank" rel="noopener">'+ICON.github+'GitHub</a>';
    if(p.phone) links+='<a href="tel:'+esc(p.phone.replace(/[^0-9+]/g,''))+'">'+ICON.phone+esc(p.phone)+'</a>';
    host.innerHTML='<div class="intro-band reveal">'+
      '<div class="only-pro"><p>'+inlineMd(p.bio||'')+'</p></div>'+
      '<div class="only-personal"><p>'+inlineMd(p.personalBio||p.bio||'')+'</p></div>'+
      '<div class="hero-stats">'+stats+'</div>'+
      '<div class="hero-links">'+links+'</div></div>';
  }

  /* ---------- WORK ---------- */
  function renderWork(exps){
    var host=document.getElementById('work'); if(!host) return;
    var order=['chip','mat','space'];
    var nav=order.map(function(c){return '<a href="#cat-'+c+'">'+esc(CAT[c].name)+'</a>';}).join('');
    var blocks=order.map(function(c){
      var g=exps.filter(function(e){return e.cat===c;});
      if(!g.length) return '';
      return '<div class="cat-block reveal" id="cat-'+c+'"><div class="cat-title"><span class="ct-mark">'+CAT[c].mark+'</span><h3>'+esc(CAT[c].label)+'</h3><span class="ct-count">'+g.length+(g.length===1?' entry':' entries')+'</span></div><div class="cat-rule"></div>'+g.map(renderXp).join('')+'</div>';
    }).join('');
    host.innerHTML='<div class="section-head reveal"><span class="eyebrow">Portfolio</span><h2>Selected Work</h2>'+
      '<p class="lead only-pro">Roles, results, and the technical detail.</p>'+
      '<p class="lead only-personal">The why behind each of these — in my own words.</p></div>'+
      '<div class="work-nav reveal">'+nav+'</div>'+blocks;
  }
  function renderXp(e){
    var bullets=(e.bullets&&e.bullets.length)?'<ul class="xp-list">'+e.bullets.map(function(b){return '<li>'+inlineMd(b)+'</li>';}).join('')+'</ul>':'';
    var stats=(e.stats&&e.stats.length)?'<div class="xp-stats">'+e.stats.map(function(s){return '<div class="xp-stat"><span class="v">'+esc(s.v)+'</span> <span class="l">'+esc(s.l)+'</span></div>';}).join('')+'</div>':'';
    var tags=(e.tags&&e.tags.length)?'<div class="xp-tags">'+e.tags.map(function(t){return '<span class="xp-tag">'+esc(t)+'</span>';}).join('')+'</div>':'';
    var link='';
    if(e.link&&e.link.url) link='<a class="xp-link" href="'+esc(e.link.url)+'" target="_blank" rel="noopener">'+esc(e.link.label||'View')+' &rarr;</a>';
    else if(e.pdf&&e.pdf.file) link='<a class="xp-link" href="#" onclick="openPDF(\''+esc(e.pdf.file)+'\',\''+esc(e.title).replace(/'/g,"\\'")+'\');return false;">'+esc(e.pdf.label||'View paper')+' &rarr;</a>';
    var incoming=e.incoming?'<span class="xp-incoming">Incoming</span>':'';
    var pro='<div class="only-pro">'+stats+tags+bullets+link+'</div>';
    var personal='<div class="only-personal">'+(e.personal?'<p class="xp-personal">'+inlineMd(e.personal)+'</p>':bullets)+link+'</div>';
    return '<div class="xp"><div class="xp-date">'+esc(e.date||'')+'</div><div class="xp-main"><h4>'+esc(e.title)+incoming+'</h4>'+(e.org?'<div class="xp-org">'+esc(e.org)+'</div>':'')+pro+personal+'</div></div>';
  }

  /* ---------- THOUGHTS (personal) ---------- */
  function renderThoughts(p){
    var host=document.getElementById('thoughts'); if(!host) return;
    if(!p.thoughts||!p.thoughts.length){ host.style.display='none'; return; }
    host.className='section only-personal';
    host.innerHTML='<div class="section-head reveal"><span class="eyebrow">Mind</span><h2>'+esc(p.thoughtsTitle||'Thoughts')+'</h2></div>'+
      '<div class="thoughts">'+p.thoughts.map(function(t){return '<div class="thought reveal"><h3>'+esc(t.title)+'</h3><p>'+inlineMd(t.body)+'</p></div>';}).join('')+'</div>';
  }

  /* ---------- NOTEBOOK ---------- */
  function renderNotebook(posts){
    var host=document.getElementById('blog'); if(!host) return;
    var sorted=posts.slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    var items=sorted.slice(0,2).map(function(post){
      return '<article class="nb-item reveal"><div class="nb-meta"><span class="cat">'+esc((CAT[post.cat]||{}).name||'')+'</span>'+esc(fmtDate(post.date))+'<br>'+esc(post.readTime||'')+'</div>'+
        '<div class="nb-body"><h3><a href="blog.html?p='+encodeURIComponent(post.id)+'">'+esc(post.title)+'</a></h3><p>'+esc(post.excerpt||'')+'</p>'+
        '<a class="more" href="blog.html?p='+encodeURIComponent(post.id)+'">Read essay &rarr;</a></div></article>';
    }).join('');
    host.innerHTML='<div class="section-head reveal"><span class="eyebrow">The Notebook</span><h2>Writing &amp; Essays</h2>'+
      '<p class="lead">Working notes on semiconductors, materials, and the philosophy of building.</p></div>'+
      '<div class="notebook">'+items+'<div class="nb-foot"><a class="more" href="blog.html">View all '+posts.length+' posts &rarr;</a></div></div>';
  }

  /* ---------- SKILLS + AWARDS ---------- */
  function renderSkillsAwards(skills,awards){
    var host=document.getElementById('skills'); if(!host) return;
    var sk=(skills||[]).map(function(g){return '<div class="skill-group"><div class="sg-label">'+esc(g.group)+'</div><div class="skill-items">'+(g.items||[]).map(function(i){return '<span>'+esc(i)+'</span>';}).join('')+'</div></div>';}).join('');
    var aw=(awards||[]).map(function(a){return '<div class="award"><div class="a-mark">&#9670;</div><div><div class="a-title">'+esc(a.title)+'</div><div class="a-detail">'+esc(a.detail||'')+'</div></div></div>';}).join('');
    host.innerHTML='<div class="section-head reveal"><span class="eyebrow">Toolkit</span><h2>Skills &amp; Honors</h2></div>'+
      '<div class="sa-wrap reveal"><div class="sa-col"><h3>Skills</h3>'+sk+'</div><div class="sa-col"><h3>Honors &amp; Awards</h3>'+aw+'</div></div>';
  }

  /* ---------- CTA / CAPTURE ---------- */
  function renderCTA(ui,profile,config){
    var host=document.getElementById('cta'); if(!host||!ui||!ui.cta) return;
    var c=ui.cta;
    host.innerHTML='<div class="cta reveal"><span class="eyebrow" style="justify-content:center;">Let\'s talk</span><h2>'+esc(c.title)+'</h2>'+
      '<p class="lead">'+esc(c.subtitle)+'</p>'+
      '<div class="cta-opts" id="ctaOpts">'+c.options.map(function(o){return '<button class="cta-opt" data-intent="'+esc(o.key)+'">'+esc(o.label)+'</button>';}).join('')+'</div>'+
      '<form class="cta-form" id="ctaForm">'+
        '<label>Your name</label><input type="text" name="name" autocomplete="name">'+
        '<label>Email</label><input type="email" name="email" autocomplete="email">'+
        '<label>Phone (optional)</label><input type="text" name="phone" autocomplete="tel">'+
        '<label>What\'s on your mind?</label><textarea name="message" placeholder="Tell me what you think, or what you have in mind…"></textarea>'+
        '<button type="submit" class="cta-submit" id="ctaSubmit">Send</button>'+
        '<div class="cta-note">'+(config&&config.formspree?'Goes straight to my inbox.':'Opens your email to send — set up Formspree in the Studio to capture these automatically.')+'</div>'+
      '</form><div id="ctaThanks"></div></div>';
    wireCTA(c,profile,config);
  }
  function wireCTA(c,profile,config){
    var opts=document.getElementById('ctaOpts');
    var form=document.getElementById('ctaForm');
    var intent='';
    opts.addEventListener('click',function(e){
      var b=e.target.closest('.cta-opt'); if(!b) return;
      [].forEach.call(opts.children,function(x){x.classList.remove('active');});
      b.classList.add('active'); intent=b.dataset.intent;
      form.classList.add('open');
    });
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var fd={ intent:intent||'(none selected)', viewing:document.body.classList.contains('mode-personal')?'personal':'recruiter',
        name:form.name.value.trim(), email:form.email.value.trim(), phone:form.phone.value.trim(), message:form.message.value.trim() };
      if(!fd.name||!fd.email){ alert('Please add your name and email.'); return; }
      var btn=document.getElementById('ctaSubmit'); btn.disabled=true; btn.textContent='Sending…';
      var endpoint=config&&config.formspree;
      if(endpoint){
        fetch(endpoint,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},
          body:JSON.stringify({_subject:'Portfolio: '+fd.intent+' — '+fd.name, intent:fd.intent, viewing:fd.viewing, name:fd.name, email:fd.email, phone:fd.phone, message:fd.message})})
          .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
          .then(function(){ ctaDone(c); })
          .catch(function(){ ctaMailto(profile,fd); });
      } else {
        ctaMailto(profile,fd);
      }
    });
  }
  function ctaDone(c){
    var form=document.getElementById('ctaForm'); form.style.display='none';
    document.getElementById('ctaOpts').style.display='none';
    document.getElementById('ctaThanks').innerHTML='<div class="cta-thanks">'+esc(c.thanks||'Thank you — I\'ll be in touch.')+'</div>';
  }
  function ctaMailto(profile,fd){
    var to=(profile&&profile.email)||'';
    var body='Intent: '+fd.intent+'\nViewing as: '+fd.viewing+'\nName: '+fd.name+'\nEmail: '+fd.email+'\nPhone: '+fd.phone+'\n\n'+fd.message;
    window.location.href='mailto:'+to+'?subject='+encodeURIComponent('Portfolio message — '+fd.name)+'&body='+encodeURIComponent(body);
    var btn=document.getElementById('ctaSubmit'); if(btn){btn.disabled=false;btn.textContent='Send';}
  }

  /* ---------- GALLERY PAGE ---------- */
  function renderGalleryPage(data){
    var host=document.getElementById('galleryPage'); if(!host) return;
    var photos=(data.gallery||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    var grid=photos.length?('<div class="gallery-grid">'+photos.map(function(ph){
      return '<figure class="gphoto reveal"><img loading="lazy" decoding="async" src="'+esc(ph.file)+'" alt="'+esc(ph.description||'')+'">'+
        '<figcaption class="g-meta"><div class="g-date">'+esc(fmtDate(ph.date))+'</div><div class="g-desc">'+esc(ph.description||'')+'</div></figcaption></figure>';
    }).join('')+'</div>'):'<p class="loading">No photos yet — add some from the Studio.</p>';
    host.innerHTML='<div class="article-hero"><span class="a-cat">Gallery</span><h1>Gallery</h1><p class="a-meta">A running photo log — moments big and small.</p></div>'+grid+
      '<div class="post-list"><a class="back-link" href="index.html">&larr; Back to portfolio</a></div>';
  }

  /* ---------- BLOG PAGE ---------- */
  function renderBlog(data){
    var listHost=document.getElementById('blogList'); if(!listHost) return;
    var posts=(data.posts||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'');});
    var pid=new URLSearchParams(location.search).get('p');
    if(pid){ var post=posts.filter(function(x){return x.id===pid;})[0]; if(post){ renderSinglePost(post); return; } }
    document.title='The Notebook · '+(data.profile?data.profile.name:'Blog');
    var hero=document.getElementById('blogHero');
    if(hero) hero.innerHTML='<div class="article-hero"><span class="a-cat">The Notebook</span><h1>Essays &amp; Field Notes</h1><p class="a-meta">Writing on semiconductors, materials, and the philosophy of building.</p></div>';
    listHost.innerHTML='<div class="notebook">'+posts.map(function(post){
      return '<article class="nb-item reveal"><div class="nb-meta"><span class="cat">'+esc((CAT[post.cat]||{}).name||'')+'</span>'+esc(fmtDate(post.date))+'<br>'+esc(post.readTime||'')+'</div>'+
        '<div class="nb-body"><h3><a href="blog.html?p='+encodeURIComponent(post.id)+'">'+esc(post.title)+'</a></h3><p>'+esc(post.excerpt||'')+'</p>'+
        '<a class="more" href="blog.html?p='+encodeURIComponent(post.id)+'">Read essay &rarr;</a></div></article>';
    }).join('')+'</div><div class="post-list"><a class="back-link" href="index.html">&larr; Back to portfolio</a></div>';
  }
  function renderSinglePost(post){
    document.title=post.title+' · Zhaniya Turganova';
    var hero=document.getElementById('blogHero'), list=document.getElementById('blogList');
    if(hero) hero.innerHTML='<div class="article-hero"><span class="a-cat">'+esc((CAT[post.cat]||{}).name||'Essay')+'</span><h1>'+esc(post.title)+'</h1><p class="a-meta">'+esc(fmtDate(post.date))+' &nbsp;·&nbsp; '+esc(post.readTime||'')+'</p></div>';
    list.innerHTML='<article class="prose">'+markdown(post.body)+'</article><div class="post-list"><a class="back-link" href="blog.html">&larr; All essays</a></div>';
  }

  /* ---------- interactions ---------- */
  function wire(){
    var nav=document.getElementById('topnav');
    var toggle=document.getElementById('navToggle');
    var links=document.getElementById('navLinks');
    if(toggle&&links){ toggle.addEventListener('click',function(){links.classList.toggle('open');}); links.addEventListener('click',function(e){if(e.target.tagName==='A')links.classList.remove('open');}); }
    var prog=document.getElementById('scrollProgress'), top=document.getElementById('toTop');
    var spyLinks=links?[].slice.call(links.querySelectorAll('a[href^="#"]')):[];
    var spyTargets=spyLinks.map(function(a){var t=document.querySelector(a.getAttribute('href'));return t?{a:a,t:t}:null;}).filter(Boolean);
    function onScroll(){
      var h=document.documentElement;
      if(nav) nav.classList.toggle('scrolled',window.scrollY>30);
      if(prog) prog.style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
      if(top) top.classList.toggle('show',window.scrollY>700);
      var pos=window.scrollY+140,cur=null;
      spyTargets.forEach(function(o){if(o.t.offsetTop<=pos)cur=o;});
      spyLinks.forEach(function(a){a.classList.remove('current');});
      if(cur) cur.a.classList.add('current');
    }
    window.addEventListener('scroll',onScroll,{passive:true});
    if(top) top.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
    onScroll();
    observeReveals();
    var counters=[].slice.call(document.querySelectorAll('[data-count]'));
    function count(el){ var raw=el.textContent.trim(),m=raw.match(/^(\d+(?:\.\d+)?)/); if(!m)return; var target=parseFloat(m[1]),dec=(m[1].split('.')[1]||'').length,suf=raw.slice(m[1].length),start=null; function step(ts){if(!start)start=ts;var p=Math.min((ts-start)/1000,1),e=1-Math.pow(1-p,3);el.textContent=(target*e).toFixed(dec)+suf;if(p<1)requestAnimationFrame(step);else el.textContent=target.toFixed(dec)+suf;} requestAnimationFrame(step); }
    if('IntersectionObserver' in window){ var io2=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){count(en.target);io2.unobserve(en.target);}});},{threshold:.6}); counters.forEach(function(c){io2.observe(c);}); }
    else counters.forEach(count);
  }
  var revealObserver=null;
  function observeReveals(){
    var els=[].slice.call(document.querySelectorAll('.reveal:not(.in), .reveal-left:not(.in)'));
    if(!('IntersectionObserver' in window)){ els.forEach(function(e){e.classList.add('in');}); return; }
    if(!revealObserver){ revealObserver=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');revealObserver.unobserve(en.target);}});},{threshold:.1}); }
    els.forEach(function(e){revealObserver.observe(e);});
  }

  /* ---------- PDF modal ---------- */
  window.openPDF=function(url,title){ var m=document.getElementById('pdf-modal'); if(!m){window.open(url,'_blank');return;} m.querySelector('strong').textContent=title||'Document'; m.querySelector('.pm-dl').href=url; m.querySelector('iframe').src=url+'#view=FitH'; m.style.display='flex'; document.body.style.overflow='hidden'; };
  window.closePDF=function(){ var m=document.getElementById('pdf-modal'); if(!m)return; m.style.display='none'; m.querySelector('iframe').src=''; document.body.style.overflow=''; };

  /* ---------- boot ---------- */
  function boot(data){
    DATA=data;
    // set initial mode (stored or default pro) so content shows even before choice
    var stored=null; try{ stored=localStorage.getItem('aud_mode'); }catch(e){}
    setMode(stored==='personal'?'personal':'pro');

    if(document.getElementById('hero')){
      buildAudience(data.ui||{});
      renderHero(data.profile||{});
      renderMoments(data.moments||[]);
      renderIntro(data.profile||{});
      renderWork(data.experiences||[]);
      renderThoughts(data.profile||{});
      renderNotebook(data.posts||[]);
      renderSkillsAwards(data.skills||[],data.awards||[]);
      renderCTA(data.ui||{},data.profile||{},data.config||{});
      // audience popup: show if first visit
      var seen=null; try{ seen=localStorage.getItem('aud_seen'); }catch(e){}
      if(!seen){ setTimeout(showAudience,650); }
      wireAudienceEvents();
    }
    renderGalleryPage(data);
    renderBlog(data);
    wire();
    var pm=document.getElementById('pdf-modal');
    if(pm){ pm.addEventListener('click',function(e){if(e.target===pm)window.closePDF();}); document.addEventListener('keydown',function(e){if(e.key==='Escape')window.closePDF();}); }
  }
  function wireAudienceEvents(){
    var ov=document.getElementById('audOverlay');
    if(ov){ ov.addEventListener('click',function(e){
      var opt=e.target.closest('.aud-opt');
      if(opt){ setMode(opt.dataset.mode); try{localStorage.setItem('aud_seen','1');}catch(x){} hideAudience(); observeReveals(); return; }
      if(e.target.hasAttribute('data-skip')||e.target===ov){ try{localStorage.setItem('aud_seen','1');}catch(x){} hideAudience(); }
    }); }
    var mt=document.getElementById('modeToggle');
    if(mt){ mt.addEventListener('click',function(){ buildAudience((DATA||{}).ui||{}); showAudience(); }); }
  }

  fetch('content.json',{cache:'no-cache'})
    .then(function(r){ if(!r.ok) throw new Error('content.json '+r.status); return r.json(); })
    .then(boot)
    .catch(function(err){ var m=document.querySelector('.loading'); if(m) m.textContent='Could not load content.json — '+err.message; console.error(err); });
})();
