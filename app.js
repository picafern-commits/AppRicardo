// Dados de exemplo (substituir pela tua lógica)
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
  const stockTableBody = document.querySelector("#stockInfo tbody");
  const historicoTableBody = document.querySelector("#historicoInfo tbody");
  const darkModeToggle = document.getElementById("darkModeToggle");

  // Preencher dashboard
  dashboardInfo.innerHTML = `<p>Total Stock: ${stockData.reduce((sum, s) => sum + s.quantidade, 0)}</p>`;

  // Preencher stock
  stockTableBody.innerHTML = stockData.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.modelo}</td>
      <td>${item.local}</td>
      <td>${item.quantidade}</td>
      <td>${item.data}</td>
    </tr>
  `).join("");

  // Preencher histórico
  historicoTableBody.innerHTML = historicoData.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.modelo}</td>
      <td>${item.local}</td>
      <td>${item.status}</td>
      <td>${item.data}</td>
    </tr>
  `).join("");

  // Toggle modo escuro
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  });
});
