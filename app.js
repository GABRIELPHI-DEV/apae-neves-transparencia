/* Portal da Transparência APAE Neves. Código comum às páginas públicas. */
(function(){
'use strict';
var PAGE=document.body.getAttribute('data-page')||'home';
var D=null;
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var brl=function(n){return Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})};
var brl0=function(n){return Number(n).toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0})};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var reduceMotion=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- dados ---------- */
function loadData(){
  var q=location.search.indexOf('previa=1')>-1;
  if(q){var r=store.get('apae-rascunho');if(r){try{return Promise.resolve(JSON.parse(r))}catch(e){}}}
  return fetch('dados.json?v='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('http');return r.json()}).catch(function(){
    var el=document.getElementById('dados-embed');return el?JSON.parse(el.textContent):{};
  });
}

/* ---------- preferências de acessibilidade ---------- */
var root=document.documentElement;
var prefs={fonte:Number(store.get('apae-fonte')||100),hc:store.get('apae-hc')==='1',fe:store.get('apae-fe')==='1',pausa:store.get('apae-pausa')==='1',tema:store.get('apae-tema')||''};
function applyPrefs(){
  root.style.fontSize=prefs.fonte+'%';
  root.classList.toggle('hc',prefs.hc);
  root.classList.toggle('fe',prefs.fe);
  root.classList.toggle('pausa',prefs.pausa);
  if(prefs.tema)root.setAttribute('data-theme',prefs.tema);
  var m={'#hc-btn':prefs.hc,'#fe-btn':prefs.fe,'#pausa-btn':prefs.pausa};
  Object.keys(m).forEach(function(s){var b=$(s);if(b)b.setAttribute('aria-pressed',String(m[s]))});
  applyFE();
}
function applyFE(){
  $$('[data-fe]').forEach(function(el){
    if(!el.hasAttribute('data-orig'))el.setAttribute('data-orig',el.innerHTML);
    el.innerHTML=prefs.fe?esc(el.getAttribute('data-fe')):el.getAttribute('data-orig');
  });
}
function initA11y(){
  var panel=$('#a11y-panel'),btn=$('#a11y-btn');
  if(btn&&panel){
    btn.addEventListener('click',function(){var o=panel.classList.toggle('open');btn.setAttribute('aria-expanded',String(o));if(o){var f=panel.querySelector('button');if(f)f.focus()}});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel.classList.contains('open')){panel.classList.remove('open');btn.setAttribute('aria-expanded','false');btn.focus()}});
    document.addEventListener('click',function(e){if(panel.classList.contains('open')&&!e.target.closest('.a11y')){panel.classList.remove('open');btn.setAttribute('aria-expanded','false')}});
  }
  var on=function(sel,fn){var b=$(sel);if(b)b.addEventListener('click',fn)};
  on('#fonte-mais',function(){prefs.fonte=Math.min(150,prefs.fonte+10);store.set('apae-fonte',prefs.fonte);applyPrefs()});
  on('#fonte-menos',function(){prefs.fonte=Math.max(90,prefs.fonte-10);store.set('apae-fonte',prefs.fonte);applyPrefs()});
  on('#fonte-reset',function(){prefs.fonte=100;store.set('apae-fonte',100);applyPrefs()});
  on('#hc-btn',function(){prefs.hc=!prefs.hc;store.set('apae-hc',prefs.hc?'1':'0');applyPrefs()});
  on('#fe-btn',function(){prefs.fe=!prefs.fe;store.set('apae-fe',prefs.fe?'1':'0');applyPrefs()});
  on('#pausa-btn',function(){prefs.pausa=!prefs.pausa;store.set('apae-pausa',prefs.pausa?'1':'0');applyPrefs()});
  on('#theme-btn',function(){
    var dark=root.getAttribute('data-theme')==='dark'||(!root.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);
    prefs.tema=dark?'light':'dark';store.set('apae-tema',prefs.tema);applyPrefs();
  });
  var burger=$('#burger'),menu=$('#menu');
  if(burger&&menu){
    burger.addEventListener('click',function(){var o=menu.classList.toggle('open');burger.setAttribute('aria-expanded',String(o))});
    menu.addEventListener('click',function(e){if(e.target.tagName==='A'){menu.classList.remove('open');burger.setAttribute('aria-expanded','false')}});
  }
  applyPrefs();
}

/* ---------- VLibras e aviso de privacidade ---------- */
function initVLibras(){
  var w=document.createElement('div');w.setAttribute('vw','');w.className='enabled';w.setAttribute('role','complementary');w.setAttribute('aria-label','Tradutor de Libras (VLibras)');
  w.innerHTML='<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(w);
  var s=document.createElement('script');s.src='https://vlibras.gov.br/app/vlibras-plugin.js';s.async=true;
  s.onload=function(){try{new window.VLibras.Widget('https://vlibras.gov.br/app')}catch(e){}};
  s.onerror=function(){w.remove()};
  document.body.appendChild(s);
}
function initCookie(){
  var c=$('#cookie');if(!c)return;
  if(store.get('apae-aviso')!=='1')c.classList.add('show');
  var b=$('#cookie-ok');if(b)b.addEventListener('click',function(){store.set('apae-aviso','1');c.classList.remove('show')});
}

/* ---------- efeitos ---------- */
function initReveal(){
  document.body.classList.remove('no-js');
  var els=$$('.reveal');
  if(!('IntersectionObserver' in window)){els.forEach(function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var i=els.indexOf(e.target)%4;e.target.style.transitionDelay=(i*70)+'ms';e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1});
  els.forEach(function(e){io.observe(e)});
  setTimeout(function(){els.forEach(function(e){e.classList.add('in')})},2500);
}
function countUp(el,to,fmt){
  if(reduceMotion||prefs.pausa||!('IntersectionObserver' in window)){el.textContent=fmt(to);return}
  var started=false;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&!started){started=true;var t0=performance.now(),d=1300;(function f(t){var p=Math.min(1,(t-t0)/d),v=to*(1-Math.pow(1-p,3));el.textContent=fmt(v);if(p<1)requestAnimationFrame(f);else el.textContent=fmt(to)})(t0);io.disconnect()}})},{threshold:.5});
  io.observe(el);
}
function copyText(btn,text){
  var ok=function(){var o=btn.getAttribute('data-label')||btn.textContent;btn.setAttribute('data-label',o);btn.textContent='Copiado';btn.classList.add('ok');setTimeout(function(){btn.textContent=o;btn.classList.remove('ok')},1600)};
  var fb=function(){var t=document.createElement('textarea');t.value=text;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');ok()}catch(e){btn.textContent='Selecione e copie'}t.remove()};
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(ok,fb)}else fb();
}
function initCopy(){
  document.addEventListener('click',function(e){var b=e.target.closest('[data-copy]');if(!b)return;var el=document.getElementById(b.getAttribute('data-copy'));copyText(b,(el?el.textContent:b.getAttribute('data-copy')).trim())});
}

/* ---------- partes comuns que usam os dados ---------- */
function fillCommon(){
  var I=D.instituicao||{};
  $$('[data-bind]').forEach(function(el){var k=el.getAttribute('data-bind');if(I[k]!=null)el.textContent=I[k]});
  var wa=I.whatsapp?'https://wa.me/'+I.whatsapp:'';
  $$('[data-wa]').forEach(function(a){if(wa){a.href=wa+(a.getAttribute('data-wa')?'?text='+encodeURIComponent(a.getAttribute('data-wa')):'');a.hidden=false}else a.hidden=true});
  $$('[data-instagram]').forEach(function(a){if(I.instagram)a.href=I.instagram});
  var cur=location.pathname.split('/').pop()||'index.html';
  $$('nav.menu a').forEach(function(a){if(a.getAttribute('href')===cur)a.setAttribute('aria-current','page')});
  var u=$('#atualizado');if(u&&D.atualizadoEm){var p=D.atualizadoEm.split('-');u.textContent=p[2]+'/'+p[1]+'/'+p[0]}
}

/* ---------- home ---------- */
function renderStats(){
  var T=(D.termos||[]).filter(function(t){return t.situacao!=='plano'}),tot=T.reduce(function(a,t){return a+Number(t.valor||0)},0),I=D.impacto||{};
  var anos={};T.forEach(function(t){anos[t.ano]=1});
  var el=$('#stats');if(!el)return;
  var items=[
    {v:T.length,f:function(n){return Math.round(n)},l:'termos de fomento formalizados desde '+Math.min.apply(null,T.map(function(t){return t.ano})),fe:T.length+' acordos com a Prefeitura'},
    {v:tot,f:function(n){return 'R$ '+Math.round(n/1000).toLocaleString('pt-BR')+' mil'},l:'em recursos previstos nos termos',fe:'dinheiro previsto nos acordos'},
    {v:I.atendidos,f:function(n){return Math.round(n)},l:'pessoas com deficiência atendidas no Centro Dia (capacidade máxima)',fe:'pessoas atendidas no Centro Dia (máximo)'},
    {v:I.ambiencias,f:function(n){return Math.round(n)},l:'tipos de atividade planejados toda semana',fe:'tipos de atividade toda semana'}
  ];
  el.innerHTML=items.map(function(it,i){return '<div class="stat reveal"><strong data-n="'+i+'">'+esc(it.f(it.v))+'</strong><span data-fe="'+esc(it.fe)+'">'+esc(it.l)+'</span></div>'}).join('');
  items.forEach(function(it,i){countUp($('[data-n="'+i+'"]',el),it.v,it.f)});
}
function renderImpacto(){
  var I=D.impacto||{},el=$('#numbers');if(!el)return;
  var n=[
    {v:I.atendidos,l:'pessoas atendidas no Centro Dia, a capacidade máxima de atendimento',fe:'pessoas atendidas no Centro Dia (máximo)'},
    {v:I.familiasEncontros,l:'familiares por encontro mensal do Cuidando de Quem Cuida',fe:'familiares em cada encontro do mês'},
    {v:I.acoes,l:'tipos de ação e evento registrados em '+I.ano,fe:'tipos de atividade e festa em '+I.ano},
    {v:I.apresentacoes,l:'apresentações do grupo de maracatu em '+I.ano,fe:'vezes que o maracatu se apresentou'},
    {v:I.ambiencias,l:'ambiências de atendimento por semana',fe:'tipos de atividade toda semana'},
    {v:I.vezesPorSemana,l:'dias por semana de atividades para cada usuário',fe:'dias por semana para cada pessoa',pre:'2×'}
  ];
  el.innerHTML=n.map(function(x,i){return '<div class="num reveal"><strong data-i="'+i+'">'+(x.pre||x.v)+'</strong><span data-fe="'+esc(x.fe)+'">'+esc(x.l)+'</span></div>'}).join('');
  n.forEach(function(x,i){if(!x.pre)countUp($('[data-i="'+i+'"]',el),x.v,function(v){return String(Math.round(v))})});
  var a=$('#acts');if(a)a.innerHTML=(D.atividades||[]).map(function(x,i){return '<article class="act reveal"><div class="ic" aria-hidden="true">'+(i+1)+'</div><h3>'+esc(x.titulo)+'</h3><p data-fe="'+esc(x.facil||x.texto)+'">'+esc(x.texto)+'</p></article>'}).join('');
  var f=$('#impacto-fonte');if(f)f.textContent='Fonte: '+(I.fonte||'')+'. Horário de funcionamento: '+((D.instituicao||{}).horario||'')+'. Regiões atendidas: '+((D.instituicao||{}).regioes||'')+'.';
}
function renderInst(){
  var I=D.instituicao||{},el=$('#inst-data');if(!el)return;
  var rows=[['Razão social',I.nome],['CNPJ',I.cnpj,'cnpj'],['Natureza jurídica',I.natureza],I.fundacao?['Fundação',I.fundacao]:null,I.utilidadePublica?['Utilidade pública',I.utilidadePublica]:null,['Presidente',I.presidente+' (mandato de '+I.mandato+')'],I.orgaoDiretor?['Órgão diretor',I.orgaoDiretor]:null,['Endereço',I.endereco+(I.cep?', CEP '+I.cep:'')],['Horário',I.horario],['Telefone',I.telefone,'fone'],I.telefone2?['Telefone 2 (WhatsApp)',I.telefone2]:null,['E-mail',I.email,'mail'],['Conselhos',I.conselhos],['Secretaria parceira',I.secretaria],['Conta bancária',I.banco]].filter(Boolean);
  el.innerHTML=rows.map(function(r){return '<div><dt>'+esc(r[0])+'</dt><dd><span id="d-'+(r[2]||'x')+(r[2]?'':Math.random().toString(36).slice(2,6))+'">'+esc(r[1])+'</span>'+(r[2]?'<button class="copy" type="button" data-copy="d-'+r[2]+'">Copiar</button>':'')+'</dd></div>'}).join('');
}
var state={year:'all',origin:'all',q:''};
function renderCards(){
  var c=$('#cards');if(!c)return;
  var q=state.q.trim().toLowerCase();
  var list=(D.termos||[]).filter(function(t){return (state.year==='all'||String(t.ano)===state.year)&&(state.origin==='all'||t.origem===state.origin)&&(!q||(t.num+'/'+t.ano+' '+t.nome).toLowerCase().indexOf(q)>-1)}).sort(function(a,b){return b.ano-a.ano||b.num.localeCompare(a.num)});
  if(!list.length){c.innerHTML='<div class="empty">Nenhum termo encontrado com esses filtros. Limpe a busca ou escolha "Todos".</div>';return}
  c.innerHTML=list.map(function(t,i){return '<button class="t" style="animation-delay:'+(i*60)+'ms" type="button" data-open="'+esc(t.num+'-'+t.ano)+'" aria-haspopup="dialog">'+
    '<div class="num2">'+esc(t.num)+'<small>/'+t.ano+'</small></div><h3>'+esc(t.nome)+'</h3><p data-fe="'+esc(t.facil||t.objeto)+'">'+esc(t.objeto)+'</p>'+
    '<div class="tags"><span class="tag y">'+(t.origem==='Federal'?'Emenda federal':'Emenda municipal')+'</span><span class="tag">'+(t.situacao==='plano'?'Plano de trabalho 2026':'Termo de Fomento')+'</span>'+(t.etapa?'<span class="tag y">'+esc(t.etapa)+'</span>':'')+'</div>'+
    '<div class="foot"><span class="val">'+brl0(t.valor)+'</span><span class="more">Ver ficha <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div></button>'}).join('');
  applyFE();
}
var lastFocus=null;
function openSheet(id){
  var t=(D.termos||[]).filter(function(x){return x.num+'-'+x.ano===id})[0];if(!t)return;
  lastFocus=document.activeElement;
  var rows=[[t.situacao==='plano'?'Emenda e plano de trabalho':'Termo de Fomento',t.num+'/'+t.ano],t.situacao==='plano'?['Situação','Plano de trabalho de 2026. Termo ainda não publicado no portal da Prefeitura.']:null,t.etapa?['Etapa de liberação',t.etapa]:null,t.previsao?['Previsão de liberação',t.previsao]:null,['Valor total',brl(t.valor)],['Origem do recurso',t.origem==='Federal'?'Emenda parlamentar federal':'Emendas parlamentares municipais'],['Emenda',t.emenda],t.processo?['Processo administrativo',t.processo]:null,t.vigencia?['Vigência ou execução',t.vigencia]:null,['Secretaria responsável',(D.instituicao||{}).secretaria]].filter(Boolean);
  var box=$('#box');
  box.innerHTML='<button class="iconbtn x" type="button" data-close aria-label="Fechar a ficha">✕</button><span class="tag y">'+(t.origem==='Federal'?'Emenda federal':'Emenda municipal')+'</span><h3 id="sh-title">'+esc(t.nome)+'</h3><p class="obj">'+esc(t.objeto)+'</p><dl class="data">'+rows.map(function(r){return '<div><dt>'+esc(r[0])+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join('')+'</dl><div class="actions">'+(t.link?'<a class="btn pri" href="'+esc(t.link)+'" target="_blank" rel="noopener">Abrir o termo assinado</a>':'<span class="tag">Termo ainda não publicado no portal da Prefeitura</span>')+'<button class="btn sec" type="button" data-close>Fechar</button></div>';
  var s=$('#sheet');s.classList.add('open');document.body.style.overflow='hidden';$('.x',box).focus();
}
function closeSheet(){var s=$('#sheet');if(!s)return;s.classList.remove('open');document.body.style.overflow='';if(lastFocus)lastFocus.focus()}
function trapFocus(e){
  var s=$('#sheet');if(!s||!s.classList.contains('open')||e.key!=='Tab')return;
  var f=$$('button,a[href]',$('#box'));if(!f.length)return;var a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
}
function initTermos(){
  var yrs={};(D.termos||[]).forEach(function(t){yrs[t.ano]=1});
  var ch=$('#chips-year');
  if(ch){ch.innerHTML='<button class="chip" type="button" data-year="all" aria-pressed="true">Todos</button>'+Object.keys(yrs).sort().reverse().map(function(y){return '<button class="chip" type="button" data-year="'+y+'" aria-pressed="false">'+y+'</button>'}).join('')}
  $$('[data-year]').forEach(function(b){b.addEventListener('click',function(){state.year=b.getAttribute('data-year');$$('[data-year]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});renderCards()})});
  $$('[data-origin]').forEach(function(b){b.addEventListener('click',function(){state.origin=b.getAttribute('data-origin');$$('[data-origin]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});renderCards()})});
  var q=$('#q');if(q)q.addEventListener('input',function(e){state.q=e.target.value;renderCards()});
  document.addEventListener('click',function(e){var o=e.target.closest('[data-open]');if(o)return openSheet(o.getAttribute('data-open'));if(e.target.closest('[data-close]'))closeSheet()});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSheet();trapFocus(e)});
  renderCards();
}
function renderChart(){
  var T=(D.termos||[]).filter(function(t){return t.situacao!=='plano'}),box=$('#chart');if(!box)return;
  var years=Object.keys(T.reduce(function(a,t){a[t.ano]=1;return a},{})).map(Number).sort();
  var sums=years.map(function(y){return T.filter(function(t){return t.ano===y}).reduce(function(a,t){return a+Number(t.valor)},0)});
  var mx=Math.max.apply(null,sums),step=100000,top=Math.ceil(mx/step)*step;
  var W=640,H=340,L=64,R=16,Tp=20,B=44,iw=W-L-R,ih=H-Tp-B,bw=110,gap=(iw-bw*years.length)/years.length;
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc('Recursos formalizados por ano: '+years.map(function(y,i){return y+', '+brl0(sums[i])}).join('; '))+'">';
  for(var v=0;v<=top;v+=step){var y=Tp+ih-ih*v/top;s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y+'" y2="'+y+'" stroke="var(--line)"/><text x="'+(L-10)+'" y="'+(y+4)+'" text-anchor="end" font-size="12" fill="var(--muted)" font-family="Public Sans,sans-serif">'+(v===0?'0':(v/1000)+' mil')+'</text>'}
  years.forEach(function(yr,i){
    var x=L+gap/2+i*(bw+gap),acc=0,ts=T.filter(function(t){return t.ano===yr}).sort(function(a,b){return b.valor-a.valor});
    ts.forEach(function(t,j){var h=ih*t.valor/top,yy=Tp+ih-ih*acc/top-h;acc+=t.valor;
      s+='<rect x="'+x+'" y="'+yy+'" width="'+bw+'" height="'+h+'" rx="'+(j===ts.length-1?10:2)+'" fill="'+esc(t.cor||'#4FA64F')+'" stroke="var(--card)" stroke-width="2"><title>Termo '+esc(t.num+'/'+t.ano+', '+t.nome+': '+brl0(t.valor))+'</title></rect>'});
    s+='<text x="'+(x+bw/2)+'" y="'+(Tp+ih-ih*acc/top-10)+'" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)" font-family="Public Sans,sans-serif">'+brl0(sums[i])+'</text><text x="'+(x+bw/2)+'" y="'+(H-14)+'" text-anchor="middle" font-size="14" font-weight="600" fill="var(--muted)" font-family="Public Sans,sans-serif">'+yr+'</text>';
  });
  s+='</svg>';box.innerHTML=s;
  var lg=$('#legend');if(lg)lg.innerHTML=T.slice().sort(function(a,b){return a.ano-b.ano||a.num.localeCompare(b.num)}).map(function(t){return '<span><i style="background:'+esc(t.cor||'#4FA64F')+'"></i>'+esc(t.num+'/'+t.ano)+'</span>'}).join('');
  var by=$('#byyear');if(by)by.innerHTML=years.slice().reverse().map(function(y){var ts=T.filter(function(t){return t.ano===y});return '<div class="yr"><div><b>'+y+'</b><span>'+ts.length+(ts.length>1?' termos':' termo')+'</span></div><em>'+brl0(ts.reduce(function(a,t){return a+Number(t.valor)},0))+'</em></div>'}).join('')+'<div class="yr tot"><div><b>Total</b><span>'+T.length+' termos desde '+years[0]+'</span></div><em>'+brl0(T.reduce(function(a,t){return a+Number(t.valor)},0))+'</em></div>';
}
function renderWins(){
  var w=$('#wins');if(!w)return;
  w.innerHTML=(D.conquistas||[]).map(function(c){return '<article class="win reveal"><span class="chk" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg></span><div><h3>'+esc(c.titulo)+'</h3><p data-fe="'+esc(c.facil||c.texto)+'">'+esc(c.texto)+'</p></div></article>'}).join('');
}
function renderGallery(){
  var g=$('#gallery');if(!g)return;
  var F=D.fotos||[];
  g.innerHTML=F.map(function(f,i){return '<button class="shot" type="button" data-shot="'+i+'" aria-label="Ampliar foto: '+esc(f.legenda)+'"><span class="imgwrap"><img src="'+esc(f.arquivo)+'" alt="'+esc(f.alt||f.legenda)+'" loading="lazy" decoding="async"></span><span class="cap" style="display:block">'+esc(f.legenda)+'</span></button>'}).join('');
  var lb=$('#lightbox');
  g.addEventListener('click',function(e){var b=e.target.closest('[data-shot]');if(!b)return;var f=F[Number(b.getAttribute('data-shot'))];lastFocus=b;lb.querySelector('img').src=f.arquivo;lb.querySelector('img').alt=f.alt||f.legenda;lb.querySelector('figcaption').textContent=f.legenda;lb.classList.add('open');lb.querySelector('.x').focus()});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.closest('.x')){lb.classList.remove('open');if(lastFocus)lastFocus.focus()}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&lb.classList.contains('open')){lb.classList.remove('open');if(lastFocus)lastFocus.focus()}});
}
function renderQuotes(){
  var Q=D.depoimentos||[],sec=$('#depoimentos');if(!sec)return;
  if(!Q.length){sec.hidden=true;return}
  sec.hidden=false;
  $('#quotes').innerHTML=Q.map(function(q){return '<figure class="quote reveal" style="margin:0"><blockquote style="margin:0"><p>“'+esc(q.texto)+'”</p></blockquote><cite>'+esc(q.autor)+(q.relacao?', '+esc(q.relacao):'')+'</cite></figure>'}).join('');
}

/* ---------- Pix ---------- */
function crc16(str){var c=0xFFFF;for(var i=0;i<str.length;i++){c^=str.charCodeAt(i)<<8;for(var j=0;j<8;j++){c=(c&0x8000)?((c<<1)^0x1021):(c<<1);c&=0xFFFF}}return c.toString(16).toUpperCase().padStart(4,'0')}
function tlv(id,v){return id+String(v.length).padStart(2,'0')+v}
function pixPayload(chave,nome,cidade,valor){
  var mai=tlv('00','br.gov.bcb.pix')+tlv('01',chave);
  var p=tlv('00','01')+tlv('01','11')+tlv('26',mai)+tlv('52','0000')+tlv('53','986')+(valor>0?tlv('54',Number(valor).toFixed(2)):'')+tlv('58','BR')+tlv('59',nome.slice(0,25))+tlv('60',cidade.slice(0,15))+tlv('62',tlv('05','***'))+'6304';
  return p+crc16(p);
}
window.__apaePix={payload:pixPayload,crc16:crc16};
function initPix(){
  var Dn=D.doacao||{};var box=$('#qr');if(!box||!window.qrcode)return;
  var valor=0;
  function draw(){
    var pay=pixPayload(Dn.pixChave,Dn.pixNome,Dn.pixCidade.slice(0,15),valor);
    var qr=window.qrcode(0,'M');qr.addData(pay);qr.make();
    box.innerHTML=qr.createSvgTag({cellSize:4,margin:0,scalable:true});
    var sv=box.querySelector('svg');sv.setAttribute('role','img');sv.setAttribute('aria-label','QR Code Pix da APAE'+(valor>0?' no valor de '+brl(valor):''));
    $('#pix-copia').textContent=pay;
    $('#pix-valor-txt').textContent=valor>0?brl(valor):'Você escolhe o valor no aplicativo do banco';
  }
  var chave=$('#pix-chave');if(chave)chave.textContent=(Dn.pixTipo==='CNPJ'?D.instituicao.cnpj:Dn.pixChave);
  var am=$('#amounts');
  am.innerHTML=(Dn.valoresSugeridos||[]).map(function(v){return '<button type="button" data-v="'+v+'" aria-pressed="false">'+brl0(v)+'</button>'}).join('')+'<button type="button" data-v="0" aria-pressed="true">Qualquer valor</button><label class="free"><span class="sr-only">Outro valor em reais</span>Outro: R$<input id="outro" type="number" min="1" max="100000" step="1" inputmode="numeric" placeholder="0"></label>';
  am.addEventListener('click',function(e){var b=e.target.closest('button[data-v]');if(!b)return;valor=Number(b.getAttribute('data-v'));$$('button[data-v]',am).forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});$('#outro').value='';draw()});
  $('#outro').addEventListener('input',function(e){var n=Number(e.target.value);valor=n>0?Math.min(n,100000):0;$$('button[data-v]',am).forEach(function(x){x.setAttribute('aria-pressed','false')});draw()});
  var dl=$('#qr-baixar');
  if(dl)dl.addEventListener('click',function(){
    var svg=box.querySelector('svg');var xml=new XMLSerializer().serializeToString(svg);var img=new Image();
    img.onload=function(){var c=document.createElement('canvas');c.width=640;c.height=640;var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,640,640);x.drawImage(img,32,32,576,576);var a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='pix-apae-ribeirao-das-neves.png';document.body.appendChild(a);a.click();a.remove()};
    img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
  });
  draw();
}
function renderIR(){
  var Dn=D.doacao||{},st=$('#ir-status');if(!st)return;
  var ativo=Dn.irStatus==='ativo';
  st.className='callout'+(ativo?'':' warn');
  st.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg><p><b>'+(ativo?'Projeto aberto para receber destinação':'Como a APAE recebe')+':</b> '+esc(ativo?(Dn.irProjeto||Dn.irTexto):Dn.irTexto)+'</p>';
}

/* ---------- contato, ouvidoria e denúncia ---------- */
var CANAIS={
  contato:{titulo:'Fale conosco',assunto:['Dúvida','Quero ser voluntário','Quero doar','Imprensa','Outro'],tag:'[Contato]'},
  ouvidoria:{titulo:'Ouvidoria',assunto:['Elogio','Sugestão','Reclamação','Pedido de informação'],tag:'[Ouvidoria]'},
  denuncia:{titulo:'Denúncia',assunto:['Maus-tratos ou violência','Irregularidade administrativa ou financeira','Conduta de profissional ou voluntário','Outro'],tag:'[Denúncia]'}
};
var canal='contato';
function renderCanal(){
  var C=CANAIS[canal],I=D.instituicao||{};
  $$('.tab').forEach(function(t){t.setAttribute('aria-selected',String(t.getAttribute('data-canal')===canal))});
  var ext=canal==='denuncia'?I.formDenunciaAnonima:(canal==='ouvidoria'?I.formOuvidoria:'');
  var info=canal==='denuncia'?'<div class="callout warn" style="margin-bottom:16px"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></svg><p><span data-fe="Pode denunciar sem dizer seu nome. Em caso de perigo, ligue 190. Violência contra pessoa com deficiência: ligue 100.">Seu nome é opcional. Se houver risco imediato, ligue 190. Para denunciar violência contra pessoa com deficiência, o Disque 100 funciona 24 horas e é gratuito.</span>'+(ext?'':' Por e-mail não é possível garantir anonimato total; para isso a APAE pode ativar um formulário anônimo.')+'</p></div>'+(ext?'<p style="margin-bottom:16px"><a class="btn sun" href="'+esc(ext)+'" target="_blank" rel="noopener">Denunciar de forma anônima</a></p>':''):'';
  $('#canal-box').innerHTML=info+'<form class="f" id="form-canal" novalidate>'+
    '<div class="field"><label for="c-assunto">Assunto</label><select id="c-assunto">'+C.assunto.map(function(a){return '<option>'+esc(a)+'</option>'}).join('')+'</select></div>'+
    '<div class="field"><label for="c-nome">Seu nome <span class="hint">(opcional'+(canal==='denuncia'?', pode deixar em branco':'')+')</span></label><input id="c-nome" type="text" autocomplete="name"></div>'+
    '<div class="field"><label for="c-contato">E-mail ou telefone para resposta <span class="hint">(opcional)</span></label><input id="c-contato" type="text" autocomplete="off"></div>'+
    '<div class="field"><label for="c-msg">Sua mensagem</label><textarea id="c-msg" aria-describedby="c-msg-h" required></textarea><span class="hint" id="c-msg-h">Escreva com o máximo de detalhes: o que aconteceu, quando e onde.</span></div>'+
    '<label class="check"><input id="c-ok" type="checkbox"><span>Concordo que a APAE use estes dados somente para responder a esta mensagem, conforme a <a href="privacidade.html">Política de Privacidade</a>.</span></label>'+
    '<div class="cta" style="margin:0"><button class="btn pri" type="submit">Preparar e-mail</button><a class="btn sec" id="c-wa" href="#" target="_blank" rel="noopener" hidden>Enviar pelo WhatsApp</a></div>'+
    '<div class="formres" id="c-res" role="status" aria-live="polite"></div></form>';
  var wa=$('#c-wa');if(I.whatsapp&&canal!=='denuncia')wa.hidden=false;
  var form=$('#form-canal');
  function texto(){var n=$('#c-nome').value.trim(),c=$('#c-contato').value.trim();return C.tag+' '+$('#c-assunto').value+'\n\n'+$('#c-msg').value.trim()+'\n\n'+(n?'Nome: '+n+'\n':'')+(c?'Contato para resposta: '+c+'\n':'')}
  wa.addEventListener('click',function(){wa.href='https://wa.me/'+I.whatsapp+'?text='+encodeURIComponent(texto())});
  form.addEventListener('submit',function(e){
    e.preventDefault();var res=$('#c-res');res.className='formres show';
    if($('#c-msg').value.trim().length<10){res.className='formres show err';res.textContent='Escreva uma mensagem com pelo menos 10 letras.';$('#c-msg').focus();return}
    if(!$('#c-ok').checked){res.className='formres show err';res.textContent='Marque a caixa de concordância para continuar.';$('#c-ok').focus();return}
    var t=texto(),href='mailto:'+I.email+'?subject='+encodeURIComponent(C.tag+' '+$('#c-assunto').value)+'&body='+encodeURIComponent(t);
    res.innerHTML='<b>Mensagem pronta.</b> Tentamos abrir o seu aplicativo de e-mail. Se ele não abrir, copie o texto abaixo e envie para <b>'+esc(I.email)+'</b>.<br><textarea id="c-final" readonly style="width:100%;margin:10px 0;min-height:110px;padding:10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit">'+esc(t)+'</textarea><button class="copy" type="button" data-copy="c-final">Copiar mensagem</button>';
    window.__ultimoMailto=href;
    try{window.location.href=href}catch(err){}
  });
}
function initContato(){
  var el=$('#canal-box');if(!el)return;
  $$('.tab').forEach(function(t){t.addEventListener('click',function(){canal=t.getAttribute('data-canal');renderCanal()})});
  $$('.tab').forEach(function(t,i,arr){t.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var n=arr[(i+(e.key==='ArrowRight'?1:arr.length-1))%arr.length];n.focus();n.click()}})});
  renderCanal();
}

/* ---------- equipe ---------- */
function ini(n){var p=n.split(/\s+/).filter(function(x){return x.length>2});return ((p[0]||n)[0]+((p[p.length-1]||'')[0]||'')).toUpperCase()}
function person(cargo,nome){if(!nome)return '<div class="person"><span class="av" aria-hidden="true">'+esc(ini(cargo))+'</span><div><small>Equipe técnica de referência</small><b>'+esc(cargo)+'</b></div></div>';return '<div class="person"><span class="av" aria-hidden="true">'+esc(ini(nome))+'</span><div><small>'+esc(cargo)+'</small><b>'+esc(nome)+'</b></div></div>'}
function renderEquipe(){
  var dir=D.diretoria||[],cf=D.conselhoFiscal||{},ca=D.conselhoAdministracao||[],eq=D.equipe||[];
  var pres=dir[0]||{},vice=dir[1]||{};
  var org=$('#org');
  if(org)org.innerHTML=
    '<div class="lv"><div class="node assembly"><small>Instância máxima</small><b>Assembleia Geral</b></div></div>'+
    '<div class="lv"><div class="node"><small>Fiscaliza as contas</small><b>Conselho Fiscal</b></div><div class="node top"><small>Presidente</small><b>'+esc(pres.nome||'')+'</b></div><div class="node"><small>Orienta a gestão</small><b>Conselho de Administração</b></div></div>'+
    '<div class="lv">'+dir.slice(1).map(function(d){return '<div class="node"><small>'+esc(d.cargo)+'</small><b>'+esc(d.nome)+'</b></div>'}).join('')+'</div>'+
    '<div class="lv"><div class="node assembly"><small>Serviço da APAE</small><b>Centro Dia: equipe técnica</b></div></div>'+
    '<div class="lv">'+eq.map(function(d){return d.nome?'<div class="node"><small>'+esc(d.cargo)+'</small><b>'+esc(d.nome)+'</b></div>':'<div class="node"><small>Equipe técnica</small><b>'+esc(d.cargo)+'</b></div>'}).join('')+'</div>';
  var set=function(id,html){var e=$(id);if(e)e.innerHTML=html};
  set('#p-dir',dir.map(function(d){return person(d.cargo,d.nome)}).join(''));
  set('#p-cf',(cf.efetivos||[]).map(function(n){return person('Conselho Fiscal, efetivo',n)}).join('')+(cf.suplentes||[]).map(function(n){return person('Conselho Fiscal, suplente',n)}).join(''));
  set('#p-ca',ca.map(function(n){return person('Conselho de Administração',n)}).join(''));
  set('#p-eq',eq.map(function(d){return person(d.cargo,d.nome)}).join(''));
  var t=$('#ata-posse');if(t)t.textContent=(D.ataPosse||'')+' Mandato: '+((D.instituicao||{}).mandato||'')+'.';
  var n=$('#equipe-nota');if(n)n.textContent=D.equipeNota||'';
}

/* ---------- início ---------- */
function main(){
  initA11y();initCopy();initCookie();
  loadData().then(function(d){
    D=d||{};fillCommon();
    if(PAGE==='home'){renderStats();renderImpacto();renderInst();initTermos();renderChart();renderWins();renderGallery();renderQuotes();initPix();renderIR();initContato()}
    if(PAGE==='equipe')renderEquipe();
    initReveal();applyFE();
    if(location.hash){var t=document.getElementById(location.hash.slice(1));if(t)setTimeout(function(){t.scrollIntoView()},50)}
  });
  initVLibras();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',main);else main();
})();
