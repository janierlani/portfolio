
var state=null, activeTab='write';
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function msg(t,k){var m=$('msg');m.innerHTML=t?'<div class="notice '+(k||'')+'">'+t+'</div>':'';if(t)window.scrollTo({top:0,behavior:'smooth'});}
function lines(a){return (a||[]).join('\n');}
function splitLines(v){return v.split('\n').map(function(s){return s.trim();}).filter(Boolean);}
function slug(s){return String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||('item-'+Date.now());}
function parsePairs(v,ka,kb){return splitLines(v).map(function(line){var pp=line.split('|');var o={};o[ka]=(pp[0]||'').trim();o[kb]=(pp[1]||'').trim();return o;});}
function md(text){var ls=String(text||'').split('\n'),out=[],i=0;function inl(s){s=esc(s);return s.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[^*])\*([^*]+)\*/g,'$1<em>$2</em>').replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a>$1</a>');}while(i<ls.length){var l=ls[i];if(/^\s*$/.test(l)){i++;continue;}if(/^###\s+/.test(l)){out.push('<h3>'+inl(l.replace(/^###\s+/,''))+'</h3>');i++;continue;}if(/^##\s+/.test(l)){out.push('<h2>'+inl(l.replace(/^##\s+/,''))+'</h2>');i++;continue;}if(/^#\s+/.test(l)){out.push('<h2>'+inl(l.replace(/^#\s+/,''))+'</h2>');i++;continue;}var im=l.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);if(im){out.push('<div class="imgph">🖼 picture: '+esc(im[2])+'</div>');i++;continue;}if(/^>\s?/.test(l)){var q=[];while(i<ls.length&&/^>\s?/.test(ls[i])){q.push(ls[i].replace(/^>\s?/,''));i++;}out.push('<blockquote>'+inl(q.join(' '))+'</blockquote>');continue;}if(/^\s*[-*]\s+/.test(l)){var u=[];while(i<ls.length&&/^\s*[-*]\s+/.test(ls[i])){u.push(ls[i].replace(/^\s*[-*]\s+/,''));i++;}out.push('<ul>'+u.map(function(x){return '<li>'+inl(x)+'</li>';}).join('')+'</ul>');continue;}var p=[];while(i<ls.length&&!/^\s*$/.test(ls[i])&&!/^(#{1,3}\s|>\s?|\s*[-*]\s)/.test(ls[i])){p.push(ls[i]);i++;}out.push('<p>'+inl(p.join(' '))+'</p>');}return out.join('');}

/* collect DOM -> state */
function val(id){var e=$(id);return e?e.value:'';}
function collect(){
  if(!state)return state;
  if($('p-name')){var st=state.profile||{};
    st.name=val('p-name');st.kicker=val('p-kicker');st.tagline=val('p-tagline');st.bio=val('p-bio');st.personalBio=val('p-personalbio');
    st.location=val('p-location');st.email=val('p-email');st.phone=val('p-phone');st.linkedin=val('p-linkedin');st.github=val('p-github');st.photo=val('p-photo');
    st.mapIntro=val('p-mapintro');
    st.stats=parsePairs(val('p-stats'),'value','label');
    st.thoughtsTitle=val('p-thoughtstitle');
    st.thoughts=splitLines(val('p-thoughts')).map(function(line){var pp=line.split('::');return {title:(pp[0]||'').trim(),body:(pp.slice(1).join('::')||'').trim()};});
    state.profile=st;}
  if($('venn-circles')){
    state.venn=state.venn||{};
    state.venn.circles=splitLines(val('venn-circles')).map(function(l){var p=l.split('|').map(function(s){return s.trim();});return {f:p[0]||'',label:p[1]||'',color:p[2]||'#4f46e5',cx:+p[3]||0,cy:+p[4]||0,r:+p[5]||0,lx:+p[6]||0,ly:+p[7]||0};});
    state.venn.nodes=splitLines(val('venn-nodes')).map(function(l){var p=l.split('|').map(function(s){return s.trim();});var flags=(p[6]||'').toLowerCase();var o={id:p[0]||'',x:+p[1]||0,y:+p[2]||0,fields:(p[3]||'').split(',').map(function(s){return s.trim();}).filter(Boolean),l1:p[4]||'',l2:p[5]||''};if(flags.indexOf('big')>-1)o.big=true;if(flags.indexOf('flip')>-1)o.flip=true;return o;});
  }
  if(document.querySelector('#exp-list')){state.experiences=[].map.call(document.querySelectorAll('#exp-list .item'),function(it){function f(c){var e=it.querySelector('.'+c);return e?e.value:'';}var o={id:f('e-id')||slug(f('e-title')),cat:f('e-cat'),title:f('e-title'),org:f('e-org'),date:f('e-date'),bullets:splitLines(f('e-bullets')),tags:f('e-tags').split(',').map(function(s){return s.trim();}).filter(Boolean),personal:f('e-personal'),incoming:it.querySelector('.e-incoming').checked};var stats=parsePairs(f('e-stats'),'v','l').filter(function(s){return s.v||s.l;});if(stats.length)o.stats=stats;if(f('e-linkurl'))o.link={label:f('e-linklabel')||'View',url:f('e-linkurl')};if(f('e-pdf'))o.pdf={label:f('e-pdflabel')||'View paper',file:f('e-pdf')};return o;});}
  if(document.querySelector('#post-list')){state.posts=[].map.call(document.querySelectorAll('#post-list .item'),function(it){function f(c){var e=it.querySelector('.'+c);return e?e.value:'';}return {id:f('b-id')||slug(f('b-title')),cat:f('b-cat'),title:f('b-title'),date:f('b-date'),readTime:f('b-read'),excerpt:f('b-excerpt'),body:f('b-body')};});}
  if(document.querySelector('#skill-list')){state.skills=[].map.call(document.querySelectorAll('#skill-list .item'),function(it){return {group:it.querySelector('.s-group').value,items:it.querySelector('.s-items').value.split(',').map(function(s){return s.trim();}).filter(Boolean)};});}
  if(document.querySelector('#award-list')){state.awards=[].map.call(document.querySelectorAll('#award-list .item'),function(it){return {title:it.querySelector('.a-title').value,detail:it.querySelector('.a-detail').value};});}
  if(document.querySelector('#mom-list')){state.moments=[].map.call(document.querySelectorAll('#mom-list .item'),function(it){return {file:it.querySelector('.m-file').value,title:it.querySelector('.m-title').value,caption:it.querySelector('.m-caption').value};});}
  if(document.querySelector('#gal-list')){state.gallery=[].map.call(document.querySelectorAll('#gal-list .item'),function(it){return {file:it.querySelector('.g-file').value,date:it.querySelector('.g-date').value,description:it.querySelector('.g-desc').value};});}
  if($('cfg-formspree')){state.config=state.config||{};state.config.formspree=val('cfg-formspree');
    state.ui=state.ui||{};state.ui.cta=state.ui.cta||{};
    state.ui.cta.title=val('ui-cta-title');state.ui.cta.subtitle=val('ui-cta-sub');state.ui.cta.thanks=val('ui-cta-thanks');
    state.ui.cta.options=splitLines(val('ui-cta-opts')).map(function(l){var p=l.split('|').map(function(s){return s.trim();});return {key:p[0]||'',label:p[1]||''};});}
  return state;
}
function collectIfRendered(){try{collect();}catch(e){}}

function setTab(t){activeTab=t;[].forEach.call(document.querySelectorAll('#tabs button'),function(b){b.classList.toggle('active',b.dataset.tab===t);});renderTab();}
function renderTab(){var c=$('tabContent');
  if(activeTab==='write')c.innerHTML=tplWrite();
  else if(activeTab==='profile')c.innerHTML=tplProfile(state.profile||{});
  else if(activeTab==='experiences')renderList('exp');
  else if(activeTab==='map')c.innerHTML=tplMap(state.venn||{circles:[],nodes:[]});
  else if(activeTab==='blog')renderList('post');
  else if(activeTab==='moments')renderList('mom');
  else if(activeTab==='gallery')renderList('gal');
  else if(activeTab==='skills')renderList('skill');
  else if(activeTab==='awards')renderList('award');
  else if(activeTab==='setup')c.innerHTML=tplSetup(state);
}
function tplProfile(p){
  return '<div class="panel"><h2>profile</h2><p class="muted">the hero and intro of your home page.</p>'
    +'<label>Name</label><input type="text" id="p-name" value="'+esc(p.name)+'">'
    +'<div class="row"><div><label>Kicker</label><input type="text" id="p-kicker" value="'+esc(p.kicker)+'"></div><div><label>Tagline</label><input type="text" id="p-tagline" value="'+esc(p.tagline)+'"></div></div>'
    +'<label>Map intro (the line above the Venn diagram)</label><textarea id="p-mapintro" style="min-height:54px;">'+esc(p.mapIntro)+'</textarea>'
    +'<label>Bio (blank line = new paragraph)</label><textarea id="p-bio" style="min-height:120px;">'+esc(p.bio)+'</textarea><div class="hint">supports *italics*, **bold**, and — em dashes.</div>'
    +'<label>Personal bio (optional, currently unused on page)</label><textarea id="p-personalbio" style="min-height:80px;">'+esc(p.personalBio)+'</textarea>'
    +'<div class="row"><div><label>Email</label><input type="text" id="p-email" value="'+esc(p.email)+'"></div><div><label>Phone</label><input type="text" id="p-phone" value="'+esc(p.phone)+'"></div></div>'
    +'<div class="row"><div><label>LinkedIn URL</label><input type="text" id="p-linkedin" value="'+esc(p.linkedin)+'"></div><div><label>GitHub URL</label><input type="text" id="p-github" value="'+esc(p.github)+'"></div></div>'
    +'<label>Location</label><input type="text" id="p-location" value="'+esc(p.location)+'">'
    +'<label>Stats — one per line, <code>value | label</code> (kept in the file but no longer shown on the page)</label><textarea id="p-stats" style="min-height:96px;">'+esc(lines((p.stats||[]).map(function(s){return s.value+' | '+s.label;})))+'</textarea>'
    +'<hr style="margin:18px 0;border:none;border-top:1px solid var(--rule);">'
    +'<label>Thoughts section title</label><input type="text" id="p-thoughtstitle" value="'+esc(p.thoughtsTitle)+'">'
    +'<label>Thoughts — one per line, <code>Title :: body</code> (leave body empty for a standalone statement)</label><textarea id="p-thoughts" style="min-height:120px;">'+esc(lines((p.thoughts||[]).map(function(t){return t.title+' :: '+t.body;})))+'</textarea>'
    +'<label>Photo path</label><input type="text" id="p-photo" value="'+esc(p.photo)+'"> <img class="thumb" src="'+esc(p.photo)+'" alt="">'
    +'<div class="hint">to change photos: add the image file to the <code>img/</code> folder in your repo, then put its path here (e.g. <code>img/me.jpg</code>).</div></div>';
}
function tplMap(v){
  var circles=lines((v.circles||[]).map(function(c){return [c.f,c.label,c.color,c.cx,c.cy,c.r,c.lx,c.ly].join(' | ');}));
  var nodes=lines((v.nodes||[]).map(function(n){var flags=[];if(n.big)flags.push('big');if(n.flip)flags.push('flip');return [n.id,n.x,n.y,(n.fields||[]).join(','),n.l1||'',n.l2||'',flags.join(',')].join(' | ');}));
  var ids=(state.experiences||[]).map(function(e){return e.id;}).join(', ');
  return '<div class="panel"><h2>venn map</h2><p class="muted">The diagram on your home page. Coordinates live on a 1100 × 900 canvas — x goes right, y goes down.</p>'
    +'<label>Circles — one per line: <code>field-key | Label | #color | centerX | centerY | radius | labelX | labelY</code></label>'
    +'<textarea id="venn-circles" style="min-height:130px;font-family:monospace;">'+esc(circles)+'</textarea>'
    +'<div class="hint">field-key is what nodes refer to (e.g. <code>materials</code>). labelX/labelY position the circle\'s name — move it if names overlap.</div>'
    +'<label>Dots — one per line: <code>experience-id | x | y | fields | label line 1 | label line 2 | flags</code></label>'
    +'<textarea id="venn-nodes" style="min-height:280px;font-family:monospace;">'+esc(nodes)+'</textarea>'
    +'<div class="hint">fields = comma-separated circle keys the dot belongs to (put it visually inside exactly those circles). flags: <code>big</code> = pulsing highlight dot, <code>flip</code> = label sits to the left of the dot. An experience with no dot here still shows as a small chip under the legend.<br>your experience ids: <code>'+esc(ids)+'</code></div>'
    +'<div class="notice">tip: nudge numbers by 10–30 at a time, download, and refresh the site preview to see the change. label line 1 + 2 should say what it was, with keywords — e.g. “Materials internship” / “at Piper Aircraft”.</div></div>';
}
function tplSetup(s){
  s=s||{};var cfg=s.config||{};var ui=s.ui||{};var c=ui.cta||{};
  return '<div class="panel"><h2>lead capture (formspree)</h2><p class="muted">where the "what now?" form sends submissions.</p>'
    +'<div class="notice"><strong>setup:</strong> create a free form at <a href="https://formspree.io/" target="_blank" rel="noopener">formspree.io</a>, copy its endpoint (looks like <code>https://formspree.io/f/abcdwxyz</code>), paste it below, then download &amp; commit. submissions then email you and show in your formspree dashboard. blank = falls back to opening the visitor\'s email app.</div>'
    +'<label>Formspree endpoint URL</label><input type="text" id="cfg-formspree" value="'+esc(cfg.formspree)+'" placeholder="https://formspree.io/f/xxxxxxxx"></div>'
    +'<div class="panel"><h2>end-of-page "what now?" text</h2>'
    +'<label>Title</label><input type="text" id="ui-cta-title" value="'+esc(c.title)+'">'
    +'<label>Subtitle</label><input type="text" id="ui-cta-sub" value="'+esc(c.subtitle)+'">'
    +'<label>Thank-you message</label><input type="text" id="ui-cta-thanks" value="'+esc(c.thanks)+'">'
    +'<label>Options — one per line, <code>key | label</code></label><textarea id="ui-cta-opts" style="min-height:70px;">'+esc(lines((c.options||[]).map(function(o){return o.key+' | '+o.label;})))+'</textarea></div>';
}
/* ---------- quick publish: new post + pictures ---------- */
var _qpFiles=[], _qgFiles=[];
function sanitizeFile(fn){
  var dot=fn.lastIndexOf('.'); var base=dot>0?fn.slice(0,dot):fn; var ext=dot>0?fn.slice(dot+1).toLowerCase():'jpg';
  base=base.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48)||('photo-'+Date.now());
  return base+'.'+ext;
}
function todayISO(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function tplWrite(){
  return '<div class="panel"><h2>✍ new blog post</h2><p class="muted">Write, attach pictures, one click — then two quick GitHub steps and it\'s live.</p>'
    +'<label>Title</label><input type="text" id="qp-title" placeholder="what\'s this one about?">'
    +'<div class="row"><div><label>Category</label><select id="qp-cat"><option value="chip">Chip Design</option><option value="mat">Materials</option><option value="space">Space</option></select></div>'
    +'<div><label>Date</label><input type="text" id="qp-date" value="'+todayISO()+'"></div></div>'
    +'<label>Excerpt (1–2 sentences, shows in the list)</label><textarea id="qp-excerpt" style="min-height:54px;"></textarea>'
    +'<label>Body (Markdown — ## heading, **bold**, *italic*, &gt; quote, - list)</label>'
    +'<div class="editor-split"><textarea id="qp-body" data-preview="qp-prev" style="min-height:280px;" placeholder="write here…"></textarea><div class="preview" id="qp-prev"></div></div>'
    +'<label>Pictures for this post (optional)</label><input type="file" id="qp-files" multiple accept="image/*">'
    +'<div class="hint">each picture is inserted into the post where it will appear; you\'ll upload the files to <code>img/</code> in the checklist after.</div>'
    +'<div id="qp-flist"></div>'
    +'<button class="primary" id="qpAdd" style="margin-top:16px;width:100%;padding:13px;">add post &amp; download content.json</button></div>'
    +'<div class="panel"><h2>📷 add pictures to the gallery</h2><p class="muted">Drop photos with a date and a line about each — they show on your gallery page.</p>'
    +'<input type="file" id="qg-files" multiple accept="image/*">'
    +'<div id="qg-rows"></div>'
    +'<button class="primary" id="qgAdd" style="margin-top:16px;width:100%;padding:13px;">add photos &amp; download content.json</button></div>'
    +'<div class="notice"><strong>how publishing works (2 steps, ~1 min):</strong><br>1. on github, open the <code>img/</code> folder → add file → upload files → drop the pictures listed in the checklist → commit.<br>2. in the repo root, open <code>content.json</code> → edit → replace all with the downloaded file → commit. done — live in about a minute.</div>';
}
function qpFilesChanged(inp){
  _qpFiles=[]; var body=$('qp-body'); var listHtml='';
  [].forEach.call(inp.files,function(f){
    var name=sanitizeFile(f.name); _qpFiles.push(name);
    if(body){ body.value=(body.value?body.value+'\n\n':'')+'![' + (f.name.replace(/\.[^.]*$/,'')) + '](img/'+name+')'; }
    listHtml+='<div class="flist-row">🖼 '+esc(f.name)+' → upload as <code>img/'+esc(name)+'</code></div>';
  });
  $('qp-flist').innerHTML=listHtml;
  var pv=$('qp-prev'); if(pv&&body) pv.innerHTML=md(body.value);
}
function qgFilesChanged(inp){
  _qgFiles=[]; var rows='';
  [].forEach.call(inp.files,function(f){
    var name=sanitizeFile(f.name); _qgFiles.push(name);
    rows+='<div class="item" style="margin-top:12px;"><div class="flist-row">🖼 '+esc(f.name)+' → upload as <code>img/'+esc(name)+'</code></div>'
      +'<div class="row"><div><label>Date</label><input type="text" class="qg-date" data-name="'+esc(name)+'" value="'+todayISO()+'"></div>'
      +'<div><label>One line about it</label><input type="text" class="qg-desc" data-name="'+esc(name)+'" placeholder="where / what / why it mattered"></input></div></div></div>';
  });
  $('qg-rows').innerHTML=rows;
}
function qpAdd(){
  var title=($('qp-title')||{}).value||'', body=($('qp-body')||{}).value||'';
  if(!title.trim()||!body.trim()){ msg('a post needs at least a title and a body.',''); return; }
  var words=body.trim().split(/\s+/).length;
  var post={ id:slug(title), cat:($('qp-cat')||{}).value||'chip', title:title.trim(), date:($('qp-date')||{}).value||todayISO(),
    readTime: Math.max(1, Math.round(words/200))+' min read', excerpt:($('qp-excerpt')||{}).value||'', body:body };
  state.posts=state.posts||[]; state.posts.unshift(post);
  var files=_qpFiles.slice();
  download();
  var stepImg = files.length ? '1. upload to img/ on github: '+files.join(', ')+' — 2. ' : '1. ';
  msg('post added ✔ — final steps: '+stepImg+'replace content.json in the repo root and commit. live in ~1 minute.','ok');
  ['qp-title','qp-excerpt','qp-body'].forEach(function(id){ if($(id)) $(id).value=''; });
  if($('qp-prev')) $('qp-prev').innerHTML=''; if($('qp-flist')) $('qp-flist').innerHTML=''; if($('qp-files')) $('qp-files').value=''; _qpFiles=[];
}
function qgAdd(){
  if(!_qgFiles.length){ msg('choose some pictures first.',''); return; }
  var dates={}, descs={};
  [].forEach.call(document.querySelectorAll('.qg-date'),function(i){ dates[i.dataset.name]=i.value; });
  [].forEach.call(document.querySelectorAll('.qg-desc'),function(i){ descs[i.dataset.name]=i.value; });
  state.gallery=state.gallery||[];
  _qgFiles.forEach(function(name){ state.gallery.unshift({ file:'img/'+name, date:dates[name]||todayISO(), description:descs[name]||'' }); });
  var files=_qgFiles.slice();
  download();
  msg('photos added ✔ — final steps: 1) upload to img/ on github: '+files.join(', ')+' · 2) replace content.json in the repo root and commit. live in ~1 minute.','ok');
  if($('qg-rows')) $('qg-rows').innerHTML=''; if($('qg-files')) $('qg-files').value=''; _qgFiles=[];
}

function renderList(kind){collectIfRendered();var c=$('tabContent');
  var cfg={exp:{title:'experiences',arr:'experiences',body:tplExp,listId:'exp-list',label:'experience'},post:{title:'blog',arr:'posts',body:tplPost,listId:'post-list',label:'essay'},skill:{title:'skills',arr:'skills',body:tplSkill,listId:'skill-list',label:'group'},award:{title:'awards',arr:'awards',body:tplAward,listId:'award-list',label:'award'},mom:{title:'moments',arr:'moments',body:tplMom,listId:'mom-list',label:'moment'},gal:{title:'gallery',arr:'gallery',body:tplGal,listId:'gal-list',label:'photo'}}[kind];
  var arr=state[cfg.arr]||(state[cfg.arr]=[]);
  var items=arr.map(function(o,idx){return itemShell(kind,o,idx,arr.length,cfg.body(o,idx));}).join('');
  c.innerHTML='<div class="panel"><h2>'+cfg.title+'</h2><p class="muted">'+arr.length+' '+cfg.label+(arr.length===1?'':'s')+'. click a title to collapse; reorder with ▲▼.</p><div id="'+cfg.listId+'">'+items+'</div><button class="add-btn" data-add="'+kind+'">+ add '+cfg.label+'</button></div>';
}
function itemShell(kind,o,idx,total,body){var name=o.title||o.group||o.description||o.file||'item';var pill=o.cat?'<span class="pill">'+esc(o.cat)+'</span>':'';
  return '<div class="item" data-kind="'+kind+'" data-idx="'+idx+'"><div class="item-head"><span class="t" data-toggle>'+esc(name)+'</span>'+pill+'<span class="item-actions"><button data-move="up" '+(idx===0?'disabled':'')+'>▲</button><button data-move="down" '+(idx===total-1?'disabled':'')+'>▼</button><button class="danger" data-del>delete</button></span></div><div class="item-body">'+body+'</div></div>';}
function catOpts(sel){return ['chip','mat','space'].map(function(c){return '<option value="'+c+'" '+(c===sel?'selected':'')+'>'+({chip:'Chip Design',mat:'Materials',space:'Space'}[c])+'</option>';}).join('');}
function tplExp(o){return '<input type="hidden" class="e-id" value="'+esc(o.id)+'">'
  +'<div class="row3"><div><label>Category</label><select class="e-cat">'+catOpts(o.cat)+'</select></div><div><label>Date</label><input type="text" class="e-date" value="'+esc(o.date)+'"></div><div><label style="text-transform:none;">Incoming?</label><input type="checkbox" class="e-incoming" '+(o.incoming?'checked':'')+' style="width:auto;margin-top:10px;"></div></div>'
  +'<label>Title</label><input type="text" class="e-title" value="'+esc(o.title)+'"><label>Org / subtitle</label><input type="text" class="e-org" value="'+esc(o.org)+'">'
  +'<label>Personal note (the "why")</label><textarea class="e-personal" style="min-height:64px;">'+esc(o.personal)+'</textarea>'
  +'<label>Bullets — one per line</label><textarea class="e-bullets" style="min-height:80px;">'+esc(lines(o.bullets))+'</textarea>'
  +'<div class="row"><div><label>Tags — comma separated</label><input type="text" class="e-tags" value="'+esc((o.tags||[]).join(', '))+'"></div><div><label>Stats — <code>value | label</code> per line</label><textarea class="e-stats" style="min-height:60px;">'+esc(lines((o.stats||[]).map(function(s){return s.v+' | '+s.l;})))+'</textarea></div></div>'
  +'<div class="row"><div><label>Link label</label><input type="text" class="e-linklabel" value="'+esc(o.link?o.link.label:'')+'"></div><div><label>Link URL</label><input type="text" class="e-linkurl" value="'+esc(o.link?o.link.url:'')+'"></div></div>'
  +'<div class="row"><div><label>PDF label</label><input type="text" class="e-pdflabel" value="'+esc(o.pdf?o.pdf.label:'')+'"></div><div><label>PDF file</label><input type="text" class="e-pdf" value="'+esc(o.pdf?o.pdf.file:'')+'"></div></div>';}
function tplPost(o,idx){return '<input type="hidden" class="b-id" value="'+esc(o.id)+'">'
  +'<div class="row3"><div><label>Category</label><select class="b-cat">'+catOpts(o.cat)+'</select></div><div><label>Date (YYYY-MM-DD)</label><input type="text" class="b-date" value="'+esc(o.date)+'"></div><div><label>Read time</label><input type="text" class="b-read" value="'+esc(o.readTime)+'"></div></div>'
  +'<label>Title</label><input type="text" class="b-title" value="'+esc(o.title)+'"><label>Excerpt</label><textarea class="b-excerpt" style="min-height:54px;">'+esc(o.excerpt)+'</textarea>'
  +'<label>Body (Markdown)</label><div class="editor-split"><textarea class="b-body" data-preview="prev-'+idx+'" style="min-height:300px;">'+esc(o.body)+'</textarea><div class="preview" id="prev-'+idx+'">'+md(o.body)+'</div></div>';}
function tplSkill(o){return '<label>Group name</label><input type="text" class="s-group" value="'+esc(o.group)+'"><label>Items — comma separated</label><textarea class="s-items" style="min-height:60px;">'+esc((o.items||[]).join(', '))+'</textarea>';}
function tplAward(o){return '<label>Title</label><input type="text" class="a-title" value="'+esc(o.title)+'"><label>Detail</label><input type="text" class="a-detail" value="'+esc(o.detail)+'">';}
function tplMom(o){return '<label>Title</label><input type="text" class="m-title" value="'+esc(o.title)+'"><label>Caption</label><input type="text" class="m-caption" value="'+esc(o.caption)+'"><label>Image path</label><input type="text" class="m-file" value="'+esc(o.file)+'"> <img class="thumb" src="'+esc(o.file)+'" alt="">';}
function tplGal(o){return '<label>Date (YYYY-MM-DD)</label><input type="text" class="g-date" value="'+esc(o.date)+'"><label>Description</label><textarea class="g-desc" style="min-height:60px;">'+esc(o.description)+'</textarea><label>Image path</label><input type="text" class="g-file" value="'+esc(o.file)+'"> <img class="thumb" src="'+esc(o.file)+'" alt="">';}

function arrFor(kind){return state[{exp:'experiences',post:'posts',skill:'skills',award:'awards',mom:'moments',gal:'gallery'}[kind]];}
document.addEventListener('click',function(e){var t=e.target;
  if(t.id==='downloadBtn')download();
  else if(t.id==='qpAdd')qpAdd();
  else if(t.id==='qgAdd')qgAdd();
  else if(t.dataset&&t.dataset.tab)setTab(t.dataset.tab);
  else if(t.dataset&&t.dataset.add){collect();var k=t.dataset.add;var an={exp:'experiences',post:'posts',skill:'skills',award:'awards',mom:'moments',gal:'gallery'}[k];var bl={exp:{id:'',cat:'chip',title:'New experience',org:'',date:'',bullets:[],tags:[],personal:''},post:{id:'',cat:'chip',title:'New essay',date:new Date().toISOString().slice(0,10),readTime:'3 min read',excerpt:'',body:'Write here.'},skill:{group:'New group',items:[]},award:{title:'New honor',detail:''},mom:{file:'',title:'New moment',caption:''},gal:{file:'',date:new Date().toISOString().slice(0,10),description:''}};(state[an]=state[an]||[]).push(JSON.parse(JSON.stringify(bl[k])));renderTab();}
  else if(t.dataset&&t.dataset.move){var item=t.closest('.item');var idx=+item.dataset.idx;var arr=arrFor(item.dataset.kind);collect();var ni=t.dataset.move==='up'?idx-1:idx+1;if(ni>=0&&ni<arr.length){var tmp=arr[idx];arr[idx]=arr[ni];arr[ni]=tmp;renderTab();}}
  else if(t.hasAttribute&&t.hasAttribute('data-del')){var it=t.closest('.item');var i=+it.dataset.idx;var a=arrFor(it.dataset.kind);collect();a.splice(i,1);renderTab();}
  else if(t.hasAttribute&&t.hasAttribute('data-toggle')){t.closest('.item').classList.toggle('collapsed');}
});
document.addEventListener('input',function(e){var t=e.target;if(t.dataset&&t.dataset.preview){var pv=$(t.dataset.preview);if(pv)pv.innerHTML=md(t.value);}});
document.addEventListener('change',function(e){var t=e.target;
  if(t.id==='qp-files')qpFilesChanged(t);
  else if(t.id==='qg-files')qgFilesChanged(t);
});

function download(){collect();var json=JSON.stringify(state,null,2)+'\n';var blob=new Blob([json],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='content.json';document.body.appendChild(a);a.click();a.remove();msg('downloaded content.json. now update your repo: github.com/janierlani/portfolio → click content.json → edit (pencil) → replace all → commit. (or send me the file.)','ok');}

/* boot — load local content, straight into the editor. no login, no token. */
fetch('content.json',{cache:'no-cache'}).then(function(r){return r.json();}).then(function(j){
  state=j; $('intro').querySelector('.notice').outerHTML='<div class="notice ok">loaded. edit anything, then click “download content.json”.</div>';
  $('editor').style.display='block'; setTab('write');
}).catch(function(e){ msg('could not load content.json: '+e.message,''); });
