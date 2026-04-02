const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let stockGlobal = [];
let historicoGlobal = [];
let pcsGlobal = [];
let editDocId = null;

// --------------------
// TOAST
// --------------------
function msg(texto, tipo="ok"){
  let el = document.getElementById("toast");
  if(!el){
    el = document.createElement("div");
    el.id="toast";
    el.className="toast";
    document.body.appendChild(el);
  }

  el.innerText = texto;
  el.style.background = tipo==="erro" ? "#dc2626" : "#16a34a";
  el.style.display="block";

  setTimeout(()=> el.style.display="none",2000);
}

// --------------------
// GERAR ID
// --------------------
async function gerarID(){
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async t=>{
    const doc = await t.get(ref);
    const n = doc.exists ? doc.data().valor+1 : 1;
    t.set(ref,{valor:n});
    return "TON-"+String(n).padStart(4,"0");
  });
}

// --------------------
// ADICIONAR TONER
// --------------------
async function disponivel(){
  const eq = document.getElementById("equipamento")?.value;
  const loc = document.getElementById("localizacao")?.value;
  const cor = document.getElementById("cor")?.value;
  const data = document.getElementById("data")?.value;

  if(!eq || !cor){
    msg("Preenche os campos obrigatórios","erro");
    return;
  }

  const id = await gerarID();

  await db.collection("stock").add({
    idInterno:id,
    equipamento:eq,
    localizacao:loc||"Sem Localização",
    cor,
    data:data||"Sem Data",
    created:new Date()
  });

  msg("Toner adicionado");
}

// --------------------
// LISTENERS
// --------------------
db.collection("stock").orderBy("created","desc").onSnapshot(snap=>{
  stockGlobal=[];
  snap.forEach(d=>{
    let x=d.data();
    x.idDoc=d.id;
    stockGlobal.push(x);
  });

  renderStock();
  renderDashboard();
});

db.collection("historico").orderBy("created","desc").onSnapshot(snap=>{
  historicoGlobal=[];
  snap.forEach(d=>{
    let x=d.data();
    x.idDoc=d.id;
    historicoGlobal.push(x);
  });

  renderHistorico();
});

db.collection("pcs").orderBy("created","desc").onSnapshot(snap=>{
  pcsGlobal=[];
  snap.forEach(d=>{
    let x=d.data();
    x.idDoc=d.id;
    pcsGlobal.push(x);
  });

  renderPC();
});

// --------------------
// RENDER STOCK
// --------------------
function renderStock(){
  const el = document.getElementById("listaStock");
  if(!el) return;

  el.innerHTML = stockGlobal.map(t=>`
    <div class="stock-card">
      <b>${t.idInterno}</b><br>
      ${t.equipamento} - ${t.cor}<br>
      ${t.localizacao}<br>

      <div class="card-actions">
        <button onclick="usar('${t.idDoc}')">Usado</button>
        <button onclick="editar('${t.idDoc}')">Editar</button>
      </div>
    </div>
  `).join("");
}

// --------------------
// RENDER HISTORICO
// --------------------
function renderHistorico(){
  const el = document.getElementById("listaHistorico");
  if(!el) return;

  el.innerHTML = historicoGlobal.map(t=>`
    <div class="history-card">
      <b>${t.idInterno}</b><br>
      ${t.equipamento} - ${t.cor}<br>
      ${t.localizacao}<br>

      <button onclick="apagar('${t.idDoc}')">Apagar</button>
    </div>
  `).join("");
}

// --------------------
// RENDER DASHBOARD
// --------------------
function renderDashboard(){
  const el = document.getElementById("listaDashboardStock");
  if(!el) return;

  el.innerHTML = stockGlobal.slice(0,5).map(t=>`
    <div class="dashboard-card">
      ${t.idInterno}<br>
      ${t.equipamento}
    </div>
  `).join("");
}

// --------------------
// USAR
// --------------------
async function usar(id){
  const ref = db.collection("stock").doc(id);
  const snap = await ref.get();

  await db.collection("historico").add({
    ...snap.data(),
    created:new Date()
  });

  await ref.delete();
  msg("Movido para histórico");
}

// --------------------
// APAGAR
// --------------------
async function apagar(id){
  await db.collection("historico").doc(id).delete();
  msg("Apagado");
}

// --------------------
// EDITAR
// --------------------
function editar(id){
  const t = stockGlobal.find(x=>x.idDoc===id);
  if(!t) return;

  editDocId=id;

  document.getElementById("equipamento").value=t.equipamento;
  document.getElementById("localizacao").value=t.localizacao;
  document.getElementById("cor").value=t.cor;
  document.getElementById("data").value=t.data;
}

// --------------------
// EXPORTAR CSV
// --------------------
function exportar(){
  let csv="ID;Equipamento;Local;Cor\n";

  stockGlobal.forEach(t=>{
    csv+=`${t.idInterno};${t.equipamento};${t.localizacao};${t.cor}\n`;
  });

  const blob=new Blob([csv]);
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="stock.csv";
  a.click();
}

// --------------------
// PCS
// --------------------
const passos=[
 "TEAMVIEWER","TEAMS","DNS","DOMINIO"
];

function renderPC(){
  const el=document.getElementById("listaPC");
  if(!el) return;

  el.innerHTML=pcsGlobal.map(p=>`
    <div class="pc-card">
      ${p.nome}
      <button onclick="apagarPC('${p.idDoc}')">Apagar</button>
    </div>
  `).join("");
}

async function guardarPC(){
  const nome=document.getElementById("nomePC").value;

  await db.collection("pcs").add({
    nome,
    created:new Date()
  });

  msg("PC guardado");
}

async function apagarPC(id){
  await db.collection("pcs").doc(id).delete();
  msg("PC apagado");
}

// --------------------
// DARK MODE
// --------------------
window.onload=()=>{
  const sw=document.getElementById("darkSwitch");

  if(localStorage.getItem("modo")==="dark"){
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
    if(sw) sw.checked=true;
  }

  if(sw){
    sw.addEventListener("change",()=>{
      document.body.classList.toggle("dark");
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("modo",sw.checked?"dark":"light");
    });
  }
};
