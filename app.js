// DADOS DE EXEMPLO
let stockData = [
  {id: 1, modelo: "HP 12A", local: "Sala 1", quantidade: 5, data: "01/04/2026"},
  {id: 2, modelo: "Canon 303", local: "Sala 2", quantidade: 3, data: "02/04/2026"}
];

let historicoData = [
  {id: 1, modelo: "HP 12A", local: "Sala 1", status: "Disponível", data: "01/04/2026"},
  {id: 2, modelo: "Canon 303", local: "Sala 2", status: "Usado", data: "02/04/2026"}
];

let computadoresData = [
  {id: 1, nome: "PC Sala 1"},
  {id: 2, nome: "PC Sala 2"},
  {id: 3, nome: "PC Sala 3"}
];

document.addEventListener("DOMContentLoaded", () => {
  // Sidebar ativo
  const menuLinks = document.querySelectorAll(".sidebar nav ul li a");
  menuLinks.forEach(link => {
    if (link.href === window.location.href) link.classList.add("active");
    link.addEventListener("click", () => {
      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Dashboard
  const dashboardInfo = document.getElementById("dashboardInfo");
  if (dashboardInfo) {
    const total = stockData.reduce((sum, s) => sum + s.quantidade, 0);
    const disponiveis = stockData.filter(s => s.quantidade > 0).reduce((sum, s) => sum + s.quantidade, 0);
    const usados = total - disponiveis;
    dashboardInfo.innerHTML = `
      <div class="dashboard-card"><h3>Total Stock</h3><p>${total} Toners</p></div>
      <div class="dashboard-card"><h3>Disponíveis</h3><p>${disponiveis} Toners</p></div>
      <div class="dashboard-card"><h3>Usados</h3><p>${usados} Toners</p></div>
    `;
  }

  // Preencher tabelas
  function preencherTabela(idTabela, dados, tipo) {
    const tbody = document.querySelector(`#${idTabela} tbody`);
    if (!tbody) return;
    tbody.innerHTML = dados.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.modelo || item.nome}</td>
        <td>${item.local || ""}</td>
        <td>${tipo === 'stock' ? item.quantidade : item.status || ""}</td>
        <td>${item.data || ""}</td>
      </tr>
    `).join('');
  }
  preencherTabela("stockInfo", stockData, "stock");
  preencherTabela("historicoInfo", historicoData, "historico");

  // Lista de computadores
  const computadoresContainer = document.getElementById("computadoresContainer");
  if (computadoresContainer) {
    computadoresContainer.innerHTML = computadoresData.map(pc => `
      <label><input type="checkbox" value="${pc.nome}"> ${pc.nome}</label>
    `).join('');
  }

  // Adicionar toner
  const addTonerForm = document.getElementById("addTonerForm");
  if (addTonerForm) {
    addTonerForm.addEventListener("submit", e => {
      e.preventDefault();
      const modelo = addTonerForm.querySelector("#modelo").value;
      const local = addTonerForm.querySelector("#local").value;
      const quantidade = parseInt(addTonerForm.querySelector("#quantidade").value);
      const data = new Date().toLocaleDateString("pt-PT");

      const novoId = stockData.length ? stockData[stockData.length-1].id +1 : 1;
      stockData.push({id: novoId, modelo, local, quantidade, data});
      historicoData.push({id: novoId, modelo, local, status:"Disponível", data});

      alert("Toner adicionado com sucesso!");
      addTonerForm.reset();
    });
  }

  // Modo escuro
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode", darkModeToggle.checked);
    });
  }
});