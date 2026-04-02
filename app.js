// Dados de exemplo (substituir pela tua lógica real)
let stockData = [
  {id: 1, modelo: "HP 12A", local: "Sala 1", quantidade: 5, data: "01/04/2026"},
  {id: 2, modelo: "Canon 303", local: "Sala 2", quantidade: 3, data: "02/04/2026"}
];

let historicoData = [
  {id: 1, modelo: "HP 12A", local: "Sala 1", status: "Disponível", data: "01/04/2026"},
  {id: 2, modelo: "Canon 303", local: "Sala 2", status: "Usado", data: "02/04/2026"}
];

document.addEventListener("DOMContentLoaded", () => {
  const dashboardInfo = document.getElementById("dashboardInfo");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Dashboard cards
  function atualizarDashboard() {
    const total = stockData.reduce((sum, s) => sum + s.quantidade, 0);
    const disponiveis = stockData.filter(s => s.quantidade > 0).reduce((sum, s) => sum + s.quantidade, 0);
    const usados = total - disponiveis;

    dashboardInfo.innerHTML = `
      <div class="dashboard-card"><h3>Total Stock</h3><p>${total} Toners</p></div>
      <div class="dashboard-card"><h3>Disponíveis</h3><p>${disponiveis} Toners</p></div>
      <div class="dashboard-card"><h3>Usados</h3><p>${usados} Toners</p></div>
    `;
  }

  atualizarDashboard();

  // Função para preencher tabelas
  function preencherTabela(idTabela, dados, tipo) {
    const tbody = document.querySelector(`#${idTabela} tbody`);
    tbody.innerHTML = dados.map(item => `
      <tr>
        <td>${item.id}</td>
        <td>${item.modelo}</td>
        <td>${item.local}</td>
        <td>${tipo === 'stock' ? item.quantidade : item.status}</td>
        <td>${item.data}</td>
      </tr>
    `).join('');
  }

  preencherTabela("stockInfo", stockData, "stock");
  preencherTabela("historicoInfo", historicoData, "historico");

  // Sidebar: destaque do menu ativo
  const menuLinks = document.querySelectorAll(".sidebar nav ul li a");
  menuLinks.forEach(link => {
    link.addEventListener("click", () => {
      menuLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Toggle modo escuro
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  });
});
