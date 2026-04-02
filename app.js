const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let stockGlobal=[];


// NAV
function mudarPagina(p){
  ["impressoras","computadores","config"].forEach(id=>{
    document.getElementById(id).style.display="none";
  });
  document.getElementById(p).style.display="block";

  if(p==="computadores") carregarChecklist();
}


// ID
async function gerarID(){
  const ref=db.collection("config").doc("contador");

  return db.runTransaction(async t=>{
    let doc=await t.get(ref);
    let n=doc.exists?doc.data().valor+1:1;
    t.set(ref,{valor:n});
    return "TON-"+String(n).padStart(4,"0");
  });
}


// ADD TONER
async function disponivel(){

  let eq=equipamento.value;
  let loc=localizacao.value;
  let cor=document.getElementById("cor").value;
  let data=document.getElementById("data").value;

  if(!eq||!cor){
    alert("Preenche tudo");
    return;
  }

  let id=await gerarID();

  await db.collection("stock").add({
    idInterno:id,
    equipamento:eq,
    localizacao:loc||"Sem Localização",
    cor:cor,
    data:data||"Sem Data",
    created:new Date()
  });
}


// STOCK
db.collection("stock").orderBy("created","desc").onSnapshot(snap=>{
  stockGlobal=[];
  countStock.innerText=snap.size;

  let lista=listaStock;
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();
    t.idDoc=doc.id;
    stockGlobal.push(t);

    lista.innerHTML+=`
      <div class="card">
        <input type="checkbox" onchange="usar('${doc.id}')">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}
      </div>
    `;
  });
});


// HISTÓRICO TONER
db.collection("historico").onSnapshot(snap=>{
  countUsados.innerText=snap.size;

  let lista=listaHistorico;
  lista.innerHTML="";

  snap.forEach(doc=>{
    let t=doc.data();

    lista.innerHTML+=`
      <div class="card">
        <b>${t.idInterno}</b><br>
        ${t.equipamento}
        <button class="delete" onclick="apagar('${doc.id}')">❌</button>
      </div>
    `;
  });
});


// USAR TONER
async function usar(id){
  if(!confirm("Marcar como usado?")) return;

  let ref=db.collection("stock").doc(id);
  let snap=await ref.get();

  await db.collection("historico").add(snap.data());
  await ref.delete();
}


// APAGAR TONER
async function apagar(id){
  await db.collection("historico").doc(id).delete();
}


// FILTRO
function filtrar(){
  let txt=search.value.toLowerCase();

  let lista=listaStock;
  lista.innerHTML="";

  stockGlobal.filter(t=>
    (t.localizacao||"").toLowerCase().includes(txt)
  ).forEach(t=>{
    lista.innerHTML+=`
      <div class="card">
        <b>${t.idInterno}</b><br>
        ${t.equipamento} - ${t.cor}<br>
        ${t.localizacao}
      </div>
    `;
  });
}


// CHECKLIST
const passos=[
"TEAMVIEWER HOST","TEAMS","DNS",
"NOME DO SISTEMA","Atribuir Dominio",
"Desinstalar MCFee","Instalar Sophos",
"MICROSOFT 365","Instalar Impressora",
"Alterar Energia","Apagar User","Criar novo user"
];

function carregarChecklist(){
  let el=document.getElementById("checklist");
  let html="";
  passos.forEach((p,i)=>{
    html+=`
      <label class="checkItem">
        <input type="checkbox" id="p${i}">
        <span>${p}</span>
      </label>
    `;
  });
  el.innerHTML=html;
}


// GUARDAR PC
async function guardarPC(){

  let nome=nomePC.value;
  let data=document.getElementById("dataPC").value;

  if(!nome){ alert("Nome obrigatório"); return; }
  if(!data) data="Sem Data";

  let dados=[];
  passos.forEach((p,i)=>{
    dados.push({
      passo:p,
      feito:document.getElementById("p"+i).checked
    });
  });

  await db.collection("pcs").add({
    nome:nome,
    data:data,
    passos:dados
  });

  nomePC.value="";
  dataPC.value="";
  carregarChecklist();
}


// HISTÓRICO PCs
db.collection("pcs").onSnapshot(snap=>{
  let lista=listaPC;
  lista.innerHTML="";

  snap.forEach(doc=>{
    let d=doc.data();

    let html="";
    d.passos.forEach(p=>{
      html+=`<div>${p.feito?"✔":"❌"} ${p.passo}</div>`;
    });

    lista.innerHTML+=`
      <div class="card">
        <b>${d.nome}</b><br>
        📅 ${d.data}<br>
        ${html}
        <button class="delete" onclick="apagarPC('${doc.id}')">❌</button>
      </div>
    `;
  });
});


// APAGAR PC
async function apagarPC(id){
  if(!confirm("Apagar registo?")) return;
  await db.collection("pcs").doc(id).delete();
}


// DARK MODE
window.onload=()=>{
  let sw=document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    sw.checked=true;
  }

  sw.addEventListener("change",()=>{
    document.body.classList.toggle("dark");
    localStorage.setItem("modo",sw.checked?"dark":"light");
  });
};