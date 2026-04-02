const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let stockGlobal = [];
let historicoGlobal = [];
let pcsGlobal = [];

// NAVEGAÇÃO
function mudarPagina(pageId, btn = null) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add("active-page");
  }

  document.querySelectorAll(".menu-btn").forEach(b => {
    b.classList.remove("active");
  });

  if (btn) {
    btn.classList.add("active");
  }

  if (pageId === "computadores") {
    carregarChecklist();
  }
}

// GERAR ID
async function gerarID() {
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async t => {
    const doc = await t.get(ref);
    const n = doc.exists ? doc.data().valor + 1 : 1;
    t.set(ref, { valor: n });
    return "TON-" + String(n).padStart(4, "0");
  });
}

// ADICIONAR TONER
async function disponivel() {
  const eq = document.getElementById("equipamento").value;
  const loc = document.getElementById("localizacao").value;
  const cor = document.getElementById("cor").value;
  const data = document.getElementById("data").value;

  if (!eq || !cor) {
    alert("Preenche o equipamento e a cor.");
    return;
  }

  try {
    const id = await gerarID();

    await db.collection("stock").add({
      idInterno: id,
      equipamento: eq,
      localizacao: loc || "Sem Localização",
      cor: cor,
      data: data || "Sem Data",
      created: new Date()
    });

    document.getElementById("equipamento").value = "";
    document.getElementById("localizacao").value = "";
    document.getElementById("cor").value = "";
    document.getElementById("data").value = "";

    alert("Toner adicionado com sucesso.");
    mudarPagina("stockPage", document.querySelectorAll(".menu-btn")[2]);
  } catch (error) {
    console.error(error);
    alert("Erro ao adicionar toner.");
  }
}

// STOCK
db.collection("stock").orderBy("created", "desc").onSnapshot(snap => {
  stockGlobal = [];
  document.getElementById("countStock").innerText = snap.size;

  const lista = document.getElementById("listaStock");
  const listaDashboard = document.getElementById("listaDashboardStock");

  lista.innerHTML = "";
  listaDashboard.innerHTML = "";

  snap.forEach(doc => {
    const t = doc.data();
    t.idDoc = doc.id;
    stockGlobal.push(t);
  });

  renderStockCards(stockGlobal, "listaStock");
  renderDashboardCards(stockGlobal);
});

// HISTÓRICO TONER
db.collection("historico").orderBy("created", "desc").onSnapshot(snap => {
  historicoGlobal = [];
  document.getElementById("countUsados").innerText = snap.size;

  const lista = document.getElementById("listaHistorico");
  lista.innerHTML = "";

  snap.forEach(doc => {
    const t = doc.data();
    t.idDoc = doc.id;
    historicoGlobal.push(t);
  });

  renderHistoricoCards(historicoGlobal);
});

// PCS
db.collection("pcs").orderBy("data", "desc").onSnapshot(snap => {
  pcsGlobal = [];
  document.getElementById("countPCs").innerText = snap.size;

  const lista = document.getElementById("listaPC");
  lista.innerHTML = "";

  snap.forEach(doc => {
    const d = doc.data();
    d.idDoc = doc.id;
    pcsGlobal.push(d);
  });

  renderPCCards(pcsGlobal);
});

// RENDER STOCK
function renderStockCards(items, targetId) {
  const lista = document.getElementById(targetId);
  if (!lista) return;

  if (!items.length) {
    lista.innerHTML = `<div class="dashboard-card">Sem toners em stock.</div>`;
    return;
  }

  lista.innerHTML = items.map(t => `
    <div class="stock-card">
      <div class="stock-card-top">
        <div>
          <div class="stock-id">${t.idInterno}</div>
          <div class="stock-meta">
            ${t.equipamento} - ${t.cor}<br>
            ${t.localizacao}<br>
            📅 ${t.data || "Sem Data"}
          </div>
        </div>
      </div>
      ${targetId === "listaStock" ? `
        <div class="card-actions">
          <button class="small-btn btn-use" onclick="usar('${t.idDoc}')">Marcar como usado</button>
        </div>
      ` : ""}
    </div>
  `).join("");
}

// RENDER DASHBOARD
function renderDashboardCards(items) {
  const lista = document.getElementById("listaDashboardStock");
  if (!lista) return;

  const recent = items.slice(0, 5);

  if (!recent.length) {
    lista.innerHTML = `<div class="dashboard-card">Sem toners recentes.</div>`;
    return;
  }

  lista.innerHTML = recent.map(t => `
    <div class="dashboard-card">
      <strong>${t.idInterno}</strong><br>
      ${t.equipamento} - ${t.cor}<br>
      <span class="stock-meta">${t.localizacao}</span>
    </div>
  `).join("");
}

// RENDER HISTÓRICO
function renderHistoricoCards(items) {
  const lista = document.getElementById("listaHistorico");
  if (!lista) return;

  if (!items.length) {
    lista.innerHTML = `<div class="dashboard-card">Sem histórico.</div>`;
    return;
  }

  lista.innerHTML = items.map(t => `
    <div class="history-card">
      <div class="history-card-top">
        <div>
          <div class="history-id">${t.idInterno}</div>
          <div class="history-meta">
            ${t.equipamento} - ${t.cor || ""}<br>
            ${t.localizacao || "Sem Localização"}<br>
            📅 ${t.data || "Sem Data"}
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button class="small-btn btn-delete" onclick="apagar('${t.idDoc}')">Apagar</button>
      </div>
    </div>
  `).join("");
}

// RENDER PCs
function renderPCCards(items) {
  const lista = document.getElementById("listaPC");
  if (!lista) return;

  if (!items.length) {
    lista.innerHTML = `<div class="dashboard-card">Sem registos de computadores.</div>`;
    return;
  }

  lista.innerHTML = items.map(d => {
    const htmlPassos = (d.passos || []).map(p => `
      <div>${p.feito ? "✔" : "❌"} ${p.passo}</div>
    `).join("");

    return `
      <div class="pc-card">
        <div class="pc-card-top">
          <div>
            <div class="pc-name">${d.nome}</div>
            <div class="pc-meta">📅 ${d.data || "Sem Data"}</div>
          </div>
        </div>
        <div class="pc-meta" style="margin-top:12px;">
          ${htmlPassos}
        </div>
        <div class="card-actions">
          <button class="small-btn btn-delete" onclick="apagarPC('${d.idDoc}')">Apagar</button>
        </div>
      </div>
    `;
  }).join("");
}

// USAR TONER
async function usar(id) {
  if (!confirm("Marcar como usado?")) return;

  try {
    const ref = db.collection("stock").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      alert("Toner não encontrado.");
      return;
    }

    const data = snap.data();

    await db.collection("historico").add({
      ...data,
      created: new Date()
    });

    await ref.delete();
  } catch (error) {
    console.error(error);
    alert("Erro ao mover para histórico.");
  }
}

// APAGAR HISTÓRICO
async function apagar(id) {
  if (!confirm("Apagar do histórico?")) return;

  try {
    await db.collection("historico").doc(id).delete();
  } catch (error) {
    console.error(error);
    alert("Erro ao apagar.");
  }
}

// FILTRO STOCK
function filtrar() {
  const txt = document.getElementById("search").value.toLowerCase();

  const filtrados = stockGlobal.filter(t =>
    (t.localizacao || "").toLowerCase().includes(txt) ||
    (t.equipamento || "").toLowerCase().includes(txt) ||
    (t.cor || "").toLowerCase().includes(txt) ||
    (t.idInterno || "").toLowerCase().includes(txt)
  );

  renderStockCards(filtrados, "listaStock");
}

// FILTRO DASHBOARD
function filtrarDashboard() {
  const txt = document.getElementById("searchDashboard").value.toLowerCase();

  const filtrados = stockGlobal.filter(t =>
    (t.localizacao || "").toLowerCase().includes(txt) ||
    (t.equipamento || "").toLowerCase().includes(txt) ||
    (t.cor || "").toLowerCase().includes(txt) ||
    (t.idInterno || "").toLowerCase().includes(txt)
  );

  renderDashboardCards(filtrados);
}

// CHECKLIST PCs
const passos = [
  "TEAMVIEWER HOST",
  "TEAMS",
  "DNS",
  "NOME DO SISTEMA",
  "Atribuir Dominio",
  "Desinstalar MCFee",
  "Instalar Sophos",
  "MICROSOFT 365",
  "Instalar Impressora",
  "Alterar Energia",
  "Apagar User",
  "Criar novo user"
];

function carregarChecklist() {
  const el = document.getElementById("checklist");
  if (!el) return;

  let html = "";
  passos.forEach((p, i) => {
    html += `
      <label class="checkItem">
        <input type="checkbox" id="p${i}">
        <span>${p}</span>
      </label>
    `;
  });
  el.innerHTML = html;
}

// GUARDAR PC
async function guardarPC() {
  const nome = document.getElementById("nomePC").value.trim();
  let data = document.getElementById("dataPC").value;

  if (!nome) {
    alert("Nome obrigatório.");
    return;
  }

  if (!data) data = "Sem Data";

  const dados = [];
  passos.forEach((p, i) => {
    dados.push({
      passo: p,
      feito: document.getElementById("p" + i)?.checked || false
    });
  });

  try {
    await db.collection("pcs").add({
      nome: nome,
      data: data,
      passos: dados,
      created: new Date()
    });

    document.getElementById("nomePC").value = "";
    document.getElementById("dataPC").value = "";
    carregarChecklist();
    alert("Computador guardado com sucesso.");
  } catch (error) {
    console.error(error);
    alert("Erro ao guardar computador.");
  }
}

// APAGAR PC
async function apagarPC(id) {
  if (!confirm("Apagar registo?")) return;

  try {
    await db.collection("pcs").doc(id).delete();
  } catch (error) {
    console.error(error);
    alert("Erro ao apagar registo.");
  }
}

// DARK MODE
window.onload = () => {
  const sw = document.getElementById("darkSwitch");

  carregarChecklist();

  if (localStorage.getItem("modo") === "dark") {
    document.body.classList.add("dark");
    if (sw) sw.checked = true;
  }

  if (sw) {
    sw.addEventListener("change", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem("modo", sw.checked ? "dark" : "light");
    });
  }
};
