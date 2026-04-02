// --------------------
// FIREBASE
// --------------------
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --------------------
// VARIÁVEIS
// --------------------
let stockGlobal = [];
let historicoGlobal = [];
let pcsGlobal = [];
let editDocId = null;

// --------------------
// AUX
// --------------------
function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  if (el(id)) el(id).innerText = value;
}

// --------------------
// TOAST (sem alert)
// --------------------
function msg(texto, tipo = "sucesso") {
  let toast = el("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast-app";
    document.body.appendChild(toast);
  }

  toast.className = `toast-app ${tipo}`;
  toast.innerText = texto;
  toast.style.display = "block";

  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}

// --------------------
// GERAR ID
// --------------------
async function gerarID() {
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async t => {
    const doc = await t.get(ref);
    const n = doc.exists ? doc.data().valor + 1 : 1;
    t.set(ref, { valor: n });
    return "TON-" + String(n).padStart(4, "0");
  });
}

// --------------------
// ADICIONAR TONER
// --------------------
async function disponivel() {
  const eq = el("equipamento")?.value;
  const loc = el("localizacao")?.value;
  const cor = el("cor")?.value;
  const data = el("data")?.value;

  if (!eq || !cor) {
    msg("Preenche os campos obrigatórios", "erro");
    return;
  }

  try {
    const id = await gerarID();

    await db.collection("stock").add({
      idInterno: id,
      equipamento: eq,
      localizacao: loc || "Sem Localização",
      cor,
      data: data || "Sem Data",
      created: new Date()
    });

    msg("Toner adicionado");
  } catch (e) {
    msg("Erro ao adicionar", "erro");
  }
}

// --------------------
// LISTENERS FIREBASE
// --------------------
db.collection("stock").orderBy("created", "desc").onSnapshot(snap => {
  stockGlobal = [];
  setText("countStock", snap.size);

  snap.forEach(doc => {
    let t = doc.data();
    t.idDoc = doc.id;
    stockGlobal.push(t);
  });

  renderStock();
  renderDashboard();
  renderStockTable();
});

db.collection("historico").orderBy("created", "desc").onSnapshot(snap => {
  historicoGlobal = [];
  setText("countUsados", snap.size);

  snap.forEach(doc => {
    let t = doc.data();
    t.idDoc = doc.id;
    historicoGlobal.push(t);
  });

  renderHistorico();
  renderHistoricoTable();
});

db.collection("pcs").orderBy("created", "desc").onSnapshot(snap => {
  pcsGlobal = [];
  setText("countPCs", snap.size);

  snap.forEach(doc => {
    let d = doc.data();
    d.idDoc = doc.id;
    pcsGlobal.push(d);
  });

  renderPC();
});

// --------------------
// DASHBOARD
// --------------------
function renderDashboard() {
  const elDash = el("listaDashboardStock");
  if (!elDash) return;

  elDash.innerHTML = stockGlobal.slice(0, 5).map(t => `
    <div class="dashboard-card">
      <strong>${t.idInterno}</strong><br>
      ${t.equipamento} - ${t.cor}
    </div>
  `).join("");
}

// --------------------
// STOCK
// --------------------
function renderStock() {
  const elStock = el("listaStock");
  if (!elStock) return;

  elStock.innerHTML = stockGlobal.map(t => `
    <div class="stock-card">
      <div class="stock-id">${t.idInterno}</div>
      ${t.equipamento} - ${t.cor}<br>
      ${t.localizacao}<br>

      <div class="card-actions">
        <button class="small-btn btn-use" onclick="usar('${t.idDoc}')">Usado</button>
        <button class="small-btn" onclick="editar('${t.idDoc}')">Editar</button>
      </div>
    </div>
  `).join("");
}

// --------------------
// STOCK TABELA
// --------------------
function renderStockTable() {
  const tabela = el("stockTable");
  if (!tabela) return;

  tabela.innerHTML = stockGlobal.map(t => `
    <tr>
      <td>${t.idInterno}</td>
      <td>${t.equipamento}</td>
      <td>${t.localizacao}</td>
      <td>1</td>
      <td>${t.data}</td>
    </tr>
  `).join("");
}

// --------------------
// HISTÓRICO
// --------------------
function renderHistorico() {
  const elHist = el("listaHistorico");
  if (!elHist) return;

  elHist.innerHTML = historicoGlobal.map(t => `
    <div class="history-card">
      <div class="history-id">${t.idInterno}</div>
      ${t.equipamento} - ${t.cor}<br>
      ${t.localizacao}<br>

      <button class="small-btn btn-delete" onclick="apagar('${t.idDoc}')">Apagar</button>
    </div>
  `).join("");
}

// --------------------
// HISTÓRICO TABELA
// --------------------
function renderHistoricoTable() {
  const tabela = el("historicoTable");
  if (!tabela) return;

  tabela.innerHTML = historicoGlobal.map(t => `
    <tr>
      <td>${t.idInterno}</td>
      <td>${t.equipamento}</td>
      <td>${t.localizacao}</td>
      <td>Usado</td>
      <td>${t.data}</td>
    </tr>
  `).join("");
}

// --------------------
// USAR TONER
// --------------------
async function usar(id) {
  const ref = db.collection("stock").doc(id);
  const snap = await ref.get();

  await db.collection("historico").add({
    ...snap.data(),
    created: new Date()
  });

  await ref.delete();
  msg("Movido para histórico");
}

// --------------------
// APAGAR HISTÓRICO
// --------------------
async function apagar(id) {
  await db.collection("historico").doc(id).delete();
  msg("Apagado");
}

// --------------------
// EDITAR TONER
// --------------------
function editar(id) {
  const t = stockGlobal.find(x => x.idDoc === id);
  if (!t) return;

  editDocId = id;

  el("equipamento").value = t.equipamento;
  el("localizacao").value = t.localizacao;
  el("cor").value = t.cor;
  el("data").value = t.data;
}

// --------------------
// EXPORTAR CSV
// --------------------
function exportar() {
  let csv = "ID;Equipamento;Local;Cor\n";

  stockGlobal.forEach(t => {
    csv += `${t.idInterno};${t.equipamento};${t.localizacao};${t.cor}\n`;
  });

  const blob = new Blob([csv]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "stock.csv";
  a.click();
}

// --------------------
// PCS
// --------------------
function renderPC() {
  const elPC = el("listaPC");
  if (!elPC) return;

  elPC.innerHTML = pcsGlobal.map(p => `
    <div class="pc-card">
      <strong>${p.nome}</strong>
      <button class="small-btn btn-delete" onclick="apagarPC('${p.idDoc}')">Apagar</button>
    </div>
  `).join("");
}

async function guardarPC() {
  const nome = el("nomePC").value;

  if (!nome) {
    msg("Nome obrigatório", "erro");
    return;
  }

  await db.collection("pcs").add({
    nome,
    created: new Date()
  });

  msg("PC guardado");
}

async function apagarPC(id) {
  await db.collection("pcs").doc(id).delete();
  msg("PC apagado");
}

// --------------------
// DARK MODE
// --------------------
window.onload = () => {
  const sw = el("darkSwitch");

  if (localStorage.getItem("modo") === "dark") {
    document.body.classList.add("dark");
    document.documentElement.classList.add("dark");
    if (sw) sw.checked = true;
  }

  if (sw) {
    sw.addEventListener("change", () => {
      document.body.classList.toggle("dark");
      document.documentElement.classList.toggle("dark");
      localStorage.setItem("modo", sw.checked ? "dark" : "light");
    });
  }
};
