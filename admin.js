/* Painel da equipe: edita dados.json e publica no GitHub. */
(function(){
'use strict';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var store={get:function(k){try{return localStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
var ss={get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
var D={};var pendingPhotos={};var current='instituicao';

var SECTIONS=[
 {id:'instituicao',titulo:'Instituição e contatos',tipo:'obj',path:['instituicao'],campos:[
  ['nome','Razão social'],['sigla','Nome curto'],['cnpj','CNPJ'],['natureza','Natureza jurídica'],['fundacao','Data de fundação'],['utilidadePublica','Utilidade pública (números)'],['orgaoDiretor','Órgão diretor'],['presidente','Presidente'],['mandato','Mandato da diretoria'],
  ['endereco','Endereço'],['cep','CEP'],['telefone','Telefone'],['telefone2','Segundo telefone (WhatsApp)'],['whatsapp','WhatsApp (só números, com 55 na frente)','text','Exemplo: 5531982791938'],['email','E-mail'],['instagram','Link do Instagram','url'],
  ['horario','Horário de funcionamento'],['secretaria','Secretaria parceira'],['banco','Banco e contas'],['conselhos','Conselhos em que está inscrita'],['regioes','Regiões atendidas'],
  ['formDenunciaAnonima','Link de formulário anônimo de denúncia (opcional)','url','Crie um formulário (por exemplo, no Google Formulários) sem coletar e-mail e cole o link aqui.'],['formOuvidoria','Link de formulário da ouvidoria (opcional)','url']]},
 {id:'impacto',titulo:'Números do atendimento',tipo:'obj',path:['impacto'],campos:[
  ['ano','Ano de referência','number'],['fonte','Fonte dos números'],['usuarios','Pessoas atendidas','number'],['capacidade','Vagas (capacidade)','number'],['familiasEncontros','Familiares por encontro mensal','number'],
  ['apresentacoes','Apresentações do maracatu','number'],['ambiencias','Ambiências por semana','number'],['acoes','Tipos de ação e evento','number'],['vezesPorSemana','Dias por semana por usuário','number']]},
 {id:'atividades',titulo:'Atividades',tipo:'lista',path:['atividades'],titulo1:'titulo',novo:{titulo:'',texto:'',facil:''},campos:[['titulo','Título'],['texto','Descrição','area'],['facil','Texto em leitura fácil (frases curtas)','area']]},
 {id:'conquistas',titulo:'Conquistas',tipo:'lista',path:['conquistas'],titulo1:'titulo',novo:{titulo:'',texto:'',facil:''},campos:[['titulo','Título'],['texto','Descrição','area'],['facil','Texto em leitura fácil','area']]},
 {id:'termos',titulo:'Termos de fomento',tipo:'lista',path:['termos'],titulo1:function(t){return (t.num||'?')+'/'+(t.ano||'?')+' · '+(t.nome||'novo termo')},novo:{num:'',ano:new Date().getFullYear(),nome:'',valor:0,situacao:'formalizado',etapa:'',previsao:'',origem:'Federal',cor:'#4FA64F',objeto:'',facil:'',emenda:'',processo:'',vigencia:'',link:''},campos:[
  ['num','Número do termo (ex.: 007)'],['ano','Ano','number'],['nome','Nome do projeto'],['valor','Valor total em reais','number'],['origem','Origem do recurso','select',['Federal','Municipal']],['situacao','Situação','select',['formalizado','plano']],['etapa','Etapa atual da liberação (ex.: Aguardando o termo, Termo assinado, Aguardando empenho, Recurso recebido)'],['previsao','Previsão de liberação (ex.: dezembro de 2026)'],['cor','Cor no gráfico','color'],
  ['objeto','Objeto (o que o termo financia)','area'],['facil','Objeto em leitura fácil','area'],['emenda','Emenda parlamentar'],['processo','Processo administrativo'],['vigencia','Vigência ou execução'],['link','Link do termo assinado (PDF)','url']]},
 {id:'diretoria',titulo:'Diretoria e conselhos',tipo:'multi',blocos:[
  {tipo:'lista',path:['diretoria'],rotulo:'Diretoria Executiva',titulo1:function(t){return (t.cargo||'cargo')+': '+(t.nome||'')},novo:{cargo:'',nome:''},campos:[['cargo','Cargo'],['nome','Nome']]},
  {tipo:'linhas',path:['conselhoFiscal','efetivos'],rotulo:'Conselho Fiscal, efetivos (um nome por linha)'},
  {tipo:'linhas',path:['conselhoFiscal','suplentes'],rotulo:'Conselho Fiscal, suplentes (um nome por linha)'},
  {tipo:'linhas',path:['conselhoAdministracao'],rotulo:'Conselho de Administração (um nome por linha)'},
  {tipo:'texto',path:['ataPosse'],rotulo:'Texto sobre a posse e a ata'}]},
 {id:'equipe',titulo:'Equipe do Centro Dia',tipo:'multi',blocos:[
  {tipo:'lista',path:['equipe'],rotulo:'Profissionais',titulo1:function(t){return (t.cargo||'cargo')+': '+(t.nome||'')},novo:{cargo:'',nome:''},campos:[['cargo','Cargo'],['nome','Nome']]},
  {tipo:'texto',path:['equipeNota'],rotulo:'Nota sobre a equipe (ano de referência)'}]},
 {id:'depoimentos',titulo:'Depoimentos',tipo:'lista',path:['depoimentos'],titulo1:function(t){return t.autor||'novo depoimento'},novo:{texto:'',autor:'',relacao:''},aviso:'Publique apenas com autorização por escrito da pessoa. A seção só aparece no site quando houver ao menos um depoimento.',campos:[['texto','Depoimento','area'],['autor','Nome (ou iniciais)'],['relacao','Relação com a APAE (ex.: mãe de usuário)']]},
 {id:'fotos',titulo:'Fotos',tipo:'fotos',path:['fotos']},
 {id:'doacao',titulo:'Doações e Imposto de Renda',tipo:'obj',path:['doacao'],campos:[
  ['pixChave','Chave Pix (só números para CNPJ)'],['pixTipo','Tipo da chave','select',['CNPJ','E-mail','Telefone','Aleatória']],['pixNome','Nome do recebedor no QR Code (até 25 letras, sem acento)'],['pixCidade','Cidade do recebedor (sem acento)'],
  ['valoresSugeridos','Valores sugeridos (separe por vírgula)','numlist'],['irStatus','Situação da destinação do IR','select',['consultar','ativo']],['irProjeto','Projeto aberto para receber destinação (quando “ativo”)','area'],['irTexto','Texto explicativo sobre como a APAE recebe','area']]}
];

function get(path,create){var o=D;for(var i=0;i<path.length;i++){if(o[path[i]]==null){if(!create)return undefined;o[path[i]]=(i===path.length-1)?undefined:{}}o=o[path[i]]}return o}
function setv(path,val){var o=D;for(var i=0;i<path.length-1;i++){if(o[path[i]]==null)o[path[i]]={};o=o[path[i]]}o[path[path.length-1]]=val}
function status(msg,err){var s=$('#status');s.textContent=msg;s.className='status show'+(err?' err':'');s.scrollIntoView({block:'nearest'})}

function fieldHtml(id,label,tipo,val,extra,hint){
  var h='<div class="field"><label for="'+id+'">'+esc(label)+'</label>';
  if(tipo==='area')h+='<textarea id="'+id+'">'+esc(val)+'</textarea>';
  else if(tipo==='select')h+='<select id="'+id+'">'+extra.map(function(o){return '<option'+(o===val?' selected':'')+'>'+esc(o)+'</option>'}).join('')+'</select>';
  else if(tipo==='numlist')h+='<input id="'+id+'" type="text" value="'+esc((val||[]).join(', '))+'">';
  else h+='<input id="'+id+'" type="'+(tipo==='number'?'number':tipo==='url'?'url':tipo==='color'?'color':'text')+'" value="'+esc(val)+'"'+(tipo==='number'?' step="any"':'')+'>';
  if(hint)h+='<span class="hint">'+esc(hint)+'</span>';
  return h+'</div>';
}
function readField(el,tipo){
  if(tipo==='number'){return el.value===''?0:Number(el.value)}
  if(tipo==='numlist'){return el.value.split(',').map(function(x){return Number(x.trim())}).filter(function(n){return n>0})}
  return el.value;
}
var uid=0;
function renderObj(sec,bloco){
  var path=bloco.path,o=get(path,true)||{};var h='';
  bloco.campos.forEach(function(c){var id='f'+(++uid);h+=fieldHtml(id,c[1],c[2]||'text',o[c[0]],c[3],c[2]==='select'?null:c[3]).replace('data-k','')
    .replace('<div class="field">','<div class="field" data-k="'+c[0]+'" data-t="'+(c[2]||'text')+'">')});
  return '<div data-obj="'+path.join('.')+'">'+h+'</div>';
}
function renderLista(bloco){
  var arr=get(bloco.path,true);if(!Array.isArray(arr)){arr=[];setv(bloco.path,arr)}
  var h=(bloco.aviso?'<div class="callout warn" style="margin-bottom:14px"><p>'+esc(bloco.aviso)+'</p></div>':'')+'<div data-lista="'+bloco.path.join('.')+'">';
  arr.forEach(function(it,i){
    var t=typeof bloco.titulo1==='function'?bloco.titulo1(it):(it[bloco.titulo1]||'(sem título)');
    h+='<details class="item"'+(arr.length<=3?' open':'')+' data-i="'+i+'"><summary><span>'+esc(t)+'</span><span class="acts2"><button type="button" class="mini" data-a="up" aria-label="Subir">↑</button><button type="button" class="mini" data-a="down" aria-label="Descer">↓</button><button type="button" class="mini del" data-a="del">Remover</button></span></summary><div class="body">';
    bloco.campos.forEach(function(c){var id='f'+(++uid);h+=fieldHtml(id,c[1],c[2]||'text',it[c[0]],c[3],null).replace('<div class="field">','<div class="field" data-k="'+c[0]+'" data-t="'+(c[2]||'text')+'">')});
    h+='</div></details>';
  });
  return h+'</div><button type="button" class="btn sec" data-add="'+bloco.path.join('.')+'">+ Adicionar</button>';
}
function renderBloco(b){
  if(b.tipo==='obj')return renderObj(null,b);
  if(b.tipo==='lista')return (b.rotulo?'<h2 style="font-size:1.2rem;margin:6px 0 12px">'+esc(b.rotulo)+'</h2>':'')+renderLista(b);
  if(b.tipo==='linhas'){var id='f'+(++uid);var a=get(b.path,true);if(!Array.isArray(a)){a=[];setv(b.path,a)}return '<div class="field" data-linhas="'+b.path.join('.')+'"><label for="'+id+'">'+esc(b.rotulo)+'</label><textarea id="'+id+'">'+esc(a.join('\n'))+'</textarea></div>'}
  if(b.tipo==='texto'){var id2='f'+(++uid);return '<div class="field" data-texto="'+b.path.join('.')+'"><label for="'+id2+'">'+esc(b.rotulo)+'</label><textarea id="'+id2+'">'+esc(get(b.path)||'')+'</textarea></div>'}
  return '';
}
function renderFotos(){
  var arr=get(['fotos'],true);var h='<div class="callout warn" style="margin-bottom:14px"><p>Use fotos com <b>autorização de uso de imagem</b> das pessoas retratadas ou de seus responsáveis. Escreva um texto alternativo que descreva a cena para quem usa leitor de tela. Fotos novas são enviadas ao GitHub quando você publica.</p></div><div data-lista="fotos">';
  arr.forEach(function(it,i){
    h+='<details class="item" data-i="'+i+'"><summary><span>'+esc(it.legenda||it.arquivo||'foto')+'</span><span class="acts2"><button type="button" class="mini" data-a="up" aria-label="Subir">↑</button><button type="button" class="mini" data-a="down" aria-label="Descer">↓</button><button type="button" class="mini del" data-a="del">Remover</button></span></summary><div class="body">'+
     '<img src="'+esc(pendingPhotos[it.arquivo]?pendingPhotos[it.arquivo].dataUrl:it.arquivo)+'" alt="" style="max-height:160px;width:auto;border-radius:12px">'+
     ['arquivo','Arquivo (caminho)','legenda','Legenda','alt','Texto alternativo (descreva a cena)'].reduce(function(a,_,k,arr2){if(k%2)return a;var id='f'+(++uid);return a+fieldHtml(id,arr2[k+1],arr2[k]==='alt'?'area':'text',it[arr2[k]]).replace('<div class="field">','<div class="field" data-k="'+arr2[k]+'" data-t="'+(arr2[k]==='alt'?'area':'text')+'">')},'')+'</div></details>';
  });
  return h+'</div><label class="btn sec" style="cursor:pointer">+ Adicionar foto<input id="foto-up" type="file" accept="image/jpeg,image/png,image/webp" class="sr-only"></label>';
}
function collect(){
  // lê o formulário atual e grava em D
  $$('[data-obj]').forEach(function(box){var path=box.getAttribute('data-obj').split('.');$$('.field[data-k]',box).forEach(function(f){var k=f.getAttribute('data-k'),t=f.getAttribute('data-t');var el=f.querySelector('input,textarea,select');setv(path.concat([k]),readField(el,t))})});
  $$('[data-lista]').forEach(function(box){var path=box.getAttribute('data-lista').split('.');var arr=get(path,true);$$(':scope > .item',box).forEach(function(d){var i=Number(d.getAttribute('data-i'));if(!arr[i])return;$$('.field[data-k]',d).forEach(function(f){var k=f.getAttribute('data-k'),t=f.getAttribute('data-t');var el=f.querySelector('input,textarea,select');arr[i][k]=readField(el,t)})})});
  $$('[data-linhas]').forEach(function(f){setv(f.getAttribute('data-linhas').split('.'),f.querySelector('textarea').value.split(/\r?\n/).map(function(x){return x.trim()}).filter(Boolean))});
  $$('[data-texto]').forEach(function(f){setv(f.getAttribute('data-texto').split('.'),f.querySelector('textarea').value)});
}
function render(){
  var sec=SECTIONS.filter(function(s){return s.id===current})[0];
  var side=$('#side');side.innerHTML=SECTIONS.map(function(s){return '<button type="button" data-sec="'+s.id+'"'+(s.id===current?' aria-current="true"':'')+'>'+esc(s.titulo)+'</button>'}).join('');
  var h='<h2 style="font-size:1.4rem;margin-bottom:14px">'+esc(sec.titulo)+'</h2>';
  if(sec.tipo==='obj')h+=renderObj(sec,sec);
  else if(sec.tipo==='lista')h+=renderLista(sec);
  else if(sec.tipo==='multi')h+=sec.blocos.map(renderBloco).join('<hr style="border:0;border-top:1px dashed var(--line);margin:18px 0">');
  else if(sec.tipo==='fotos')h+=renderFotos();
  $('#form').innerHTML=h;
}
document.addEventListener('click',function(e){
  var s=e.target.closest('[data-sec]');if(s){collect();current=s.getAttribute('data-sec');render();return}
  var a=e.target.closest('[data-a]');
  if(a){e.preventDefault();collect();var d=a.closest('.item'),box=a.closest('[data-lista]'),path=box.getAttribute('data-lista').split('.'),arr=get(path),i=Number(d.getAttribute('data-i'));
    if(a.getAttribute('data-a')==='del'){arr.splice(i,1)}else if(a.getAttribute('data-a')==='up'&&i>0){var t=arr[i];arr[i]=arr[i-1];arr[i-1]=t}else if(a.getAttribute('data-a')==='down'&&i<arr.length-1){var t2=arr[i];arr[i]=arr[i+1];arr[i+1]=t2}
    render();return}
  var ad=e.target.closest('[data-add]');
  if(ad){collect();var path2=ad.getAttribute('data-add').split('.');var sec=null;SECTIONS.forEach(function(s2){if(s2.path&&s2.path.join('.')===path2.join('.'))sec=s2;if(s2.blocos)s2.blocos.forEach(function(b){if(b.path&&b.path.join('.')===path2.join('.'))sec=b})});
    var arr2=get(path2,true);arr2.push(JSON.parse(JSON.stringify(sec.novo)));render();var items=$$('.item');var last=items[items.length-1];if(last){last.open=true;last.scrollIntoView({block:'center'})}return}
});
/* foto nova */
document.addEventListener('change',function(e){
  if(e.target.id==='foto-up'&&e.target.files[0]){
    collect();var f=e.target.files[0],img=new Image(),r=new FileReader();
    r.onload=function(){img.onload=function(){var m=Math.min(1,1400/Math.max(img.width,img.height)),w=Math.round(img.width*m),h=Math.round(img.height*m),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,0,0,w,h);var data=c.toDataURL('image/jpeg',.8);var nome=''+f.name.replace(/\.[^.]+$/,'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Date.now().toString(36)+'.jpg';pendingPhotos[nome]={dataUrl:data};get(['fotos'],true).push({arquivo:nome,legenda:'',alt:''});render();status('Foto adicionada. Preencha a legenda e o texto alternativo e publique.')};img.src=r.result};
    r.readAsDataURL(f);
  }
  if(e.target.id==='b-load'&&e.target.files[0]){var rr=new FileReader();rr.onload=function(){try{D=JSON.parse(rr.result);render();status('Arquivo carregado.')}catch(err){status('Esse arquivo não é um dados.json válido.',true)}};rr.readAsText(e.target.files[0])}
});

function validar(){
  collect();var erros=[],I=D.instituicao||{};
  if(!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(I.cnpj||''))erros.push('O CNPJ precisa estar no formato 00.000.000/0000-00.');
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(I.email||''))erros.push('O e-mail da instituição parece inválido.');
  (D.termos||[]).forEach(function(t,i){if(!t.num||!t.nome)erros.push('Termo '+(i+1)+': preencha número e nome.');if(!(Number(t.valor)>=0))erros.push('Termo '+(t.num||i+1)+': valor inválido.');if(t.link&&!/^https?:\/\//.test(t.link))erros.push('Termo '+(t.num||i+1)+': o link precisa começar com https://')});
  (D.fotos||[]).forEach(function(f,i){if(!f.alt)erros.push('Foto '+(i+1)+': escreva o texto alternativo.')});
  var d=D.doacao||{};if(!d.pixChave)erros.push('Informe a chave Pix.');if((d.pixNome||'').length>25)erros.push('O nome do recebedor do Pix deve ter no máximo 25 letras.');
  return erros;
}
function hoje(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function json(){D.atualizadoEm=hoje();return JSON.stringify(D,null,2)+'\n'}

$('#b-draft').addEventListener('click',function(){var er=validar();store.set('apae-rascunho',json());status('Rascunho salvo neste navegador.'+(er.length?' Atenção: '+er.join(' '):''),false)});
$('#b-prev').addEventListener('click',function(){validar();store.set('apae-rascunho',json());window.open('index.html?previa=1','_blank')});
$('#b-down').addEventListener('click',function(){var er=validar();if(er.length){status('Corrija antes de baixar: '+er.join(' '),true);return}var b=new Blob([json()],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='dados.json';document.body.appendChild(a);a.click();a.remove();status('dados.json baixado. No GitHub, envie esse arquivo para substituir o antigo.')});

function b64(str){return btoa(unescape(encodeURIComponent(str)))}
function gh(path,opt){
  var o=$('#g-owner').value.trim(),r=$('#g-repo').value.trim(),t=$('#g-token').value.trim();
  return fetch('https://api.github.com/repos/'+encodeURIComponent(o)+'/'+encodeURIComponent(r)+'/contents/'+path.split('/').map(encodeURIComponent).join('/')+(opt&&opt.query||''),{method:(opt&&opt.method)||'GET',headers:{'Accept':'application/vnd.github+json','Authorization':'Bearer '+t,'X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'},body:opt&&opt.body?JSON.stringify(opt.body):undefined});
}
$('#b-pub').addEventListener('click',function(){
  var er=validar();if(er.length){status('Corrija antes de publicar: '+er.join(' '),true);return}
  var o=$('#g-owner').value.trim(),r=$('#g-repo').value.trim(),br=$('#g-branch').value.trim()||'main',t=$('#g-token').value.trim();
  if(!o||!r||!t){status('Preencha a conta, o repositório e o token do GitHub.',true);return}
  store.set('apae-gh-owner',o);store.set('apae-gh-repo',r);store.set('apae-gh-branch',br);ss.set('apae-gh-token',t);
  var btn=$('#b-pub');btn.disabled=true;status('Publicando...');
  var arquivos=[];
  Object.keys(pendingPhotos).forEach(function(n){if((D.fotos||[]).some(function(f){return f.arquivo===n}))arquivos.push({path:n,content:pendingPhotos[n].dataUrl.split(',')[1]})});
  arquivos.push({path:'dados.json',content:b64(json())});
  var feitos=0;
  (function next(i){
    if(i>=arquivos.length){btn.disabled=false;pendingPhotos={};status('Publicado! O site atualiza em cerca de um minuto. '+feitos+' arquivo(s) enviado(s).');return}
    var a=arquivos[i];
    gh(a.path,{query:'?ref='+encodeURIComponent(br)}).then(function(res){return res.status===404?null:(res.ok?res.json():Promise.reject(new Error('Erro '+res.status+' ao consultar '+a.path+'. Confira a conta, o repositório e o token.')))}).then(function(info){
      var body={message:'Atualiza '+a.path+' pelo painel da equipe',content:a.content,branch:br};if(info&&info.sha)body.sha=info.sha;
      return gh(a.path,{method:'PUT',body:body});
    }).then(function(res){if(!res.ok)return res.json().then(function(j){throw new Error('GitHub recusou o envio de '+a.path+': '+(j.message||res.status))});feitos++;next(i+1)}).catch(function(err){btn.disabled=false;status(err.message||'Falha ao publicar.',true)});
  })(0);
});

function init(){
  $('#g-owner').value=store.get('apae-gh-owner')||'';$('#g-repo').value=store.get('apae-gh-repo')||'';$('#g-branch').value=store.get('apae-gh-branch')||'main';$('#g-token').value=ss.get('apae-gh-token')||'';
  var th=store.get('apae-tema');if(th)document.documentElement.setAttribute('data-theme',th);
  var tb=$('#theme-btn');if(tb)tb.addEventListener('click',function(){var r=document.documentElement,dark=r.getAttribute('data-theme')==='dark'||(!r.getAttribute('data-theme')&&matchMedia('(prefers-color-scheme: dark)').matches);var n=dark?'light':'dark';r.setAttribute('data-theme',n);store.set('apae-tema',n)});
  var rasc=store.get('apae-rascunho');
  fetch('dados.json?v='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw 0;return r.json()}).catch(function(){return JSON.parse($('#dados-embed').textContent)}).then(function(d){
    D=d;if(rasc){status('Existe um rascunho salvo neste navegador. Use o botão abaixo para continuar de onde parou.');var b=document.createElement('button');b.className='btn sec';b.type='button';b.textContent='Carregar o rascunho';b.style.marginLeft='10px';b.onclick=function(){try{D=JSON.parse(rasc);render();status('Rascunho carregado.')}catch(e){status('Rascunho inválido.',true)}};$('#status').appendChild(b)}
    render();
  });
}
init();
window.__admin={get:function(){return D},validar:validar,json:json};
})();
