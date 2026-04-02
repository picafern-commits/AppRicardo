// =======================
// STORAGE
// =======================
let stock = JSON.parse(localStorage.getItem("stock")) || [];
let historico = JSON.parse(localStorage.getItem("historico")) || [];
let pcs = JSON.parse(localStorage.getItem("pcs")) || [
  {nome:"PC Sala 1", ativo:false},
  {nome:"PC Sala 2", ativo:false},
  {nome:"PC Sala 3", ativo:false}
];
let darkMode = localStorage.getItem("darkMode") === "true";

// =======================
// SAVE GLOBAL
// =======================
function saveAll(){
  localStorage.setItem("stock", JSON.stringify(stock));
  localStorage.setItem("historico", JSON.stringify(historico));
  localStorage.setItem("pcs", JSON.stringify(pcs));
  localStorage.setItem("darkMode", darkMode);
}

// =======================
// DARK MODE GLOBAL
// =======================
if(darkMode){
  document.body.classList.add("dark-mode");
}

let darkToggle = document.getElementById("dark");
if(darkToggle){
  darkToggle.checked = darkMode;
  darkToggle.addEventListener("change",()=>{
    darkMode = darkToggle.checked;
    document.body.classList.toggle("dark-mode", darkMode);
    saveAll();
  });
}

// =======================
// DASHBOARD
// =======================
if(document.getElementById("total")){
  let total = stock.reduce((a,b)=>a+b.qtd,0);
  let usados = historico.filter(h=>h.status==="Usado").length;
  let disponiveis = total - usados;

  document.getElementById("total").innerText = "Total: "+total;
  document.getElementById("disp").innerText = "Disponíveis: "+disponiveis;
  document.getElementById("usados").innerText = "Usados: "+usados;
}

// =======================
// STOCK TABLE
// =======================
let stockTable = document.getElementById("stockTable");

if(stockTable){
  renderStock();
}

function renderStock(){
  stockTable.innerHTML = stock.map((s,index)=>`
    <tr>
      <td>${s.id}</td>
      <td>${s.modelo}</td>
      <td>${s.local}</td>
      <td>
        <button onclick="menos(${index})">-</button>
        ${s.qtd}
        <button onclick="mais(${index})">+</button>
      </td>
      <td>${s.data}</td>
      <td>
        <button onclick="remover(${index})">❌</button>
      </td>
    </tr>
  `).join("");
}

// =======================
// STOCK ACTIONS
// =======================
function mais(i){
  stock[i].qtd++;
  historico.push({...stock[i], status:"Entrada"});
  saveAll();
  renderStock();
}

function menos(i){
  if(stock[i].qtd > 0){
    stock[i].qtd--;
    historico.push({...stock[i], status:"Usado"});
    saveAll();
    renderStock();
  }
}

function remover(i){
  if(confirm("Remover toner?")){
    stock.splice(i,1);
    saveAll();
    renderStock();
  }
}

// =======================
// HISTÓRICO
// =======================
let histTable = document.getElementById("historicoTable");

if(histTable){
  histTable.innerHTML = historico.map(h=>`
    <tr>
      <td>${h.id}</td>
      <td>${h.modelo}</td>
      <td>${h.local}</td>
      <td>${h.status}</td>
      <td>${h.data}</td>
    </tr>
  `).join("");
}

// =======================
// COMPUTADORES
// =======================
let pcsDiv = document.getElementById("pcs");

if(pcsDiv){
  renderPCs();
}

function renderPCs(){
  pcsDiv.innerHTML = pcs.map((pc,i)=>`
    <label>
      <input type="checkbox" ${pc.ativo?"checked":""}
      onchange="togglePC(${i})">
      ${pc.nome}
    </label><br>
  `).join("");
}

function togglePC(i){
  pcs[i].ativo = !pcs[i].ativo;
  saveAll();
}

// =======================
// ADICIONAR TONER
// =======================
let form = document.getElementById("form");

if(form){
  form.addEventListener("submit", e=>{
    e.preventDefault();

    let modelo = document.getElementById("modelo").value;
    let local = document.getElementById("local").value;
    let qtd = parseInt(document.getElementById("qtd").value);

    let novo = {
      id: stock.length + 1,
      modelo,
      local,
      qtd,
      data: new Date().toLocaleDateString()
    };

    stock.push(novo);
    historico.push({...novo, status:"Adicionado"});

    saveAll();

    alert("Toner adicionado com sucesso!");
    form.reset();
  });
}