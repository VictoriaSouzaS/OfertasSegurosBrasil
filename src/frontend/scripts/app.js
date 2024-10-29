// Dados de exemplo para o gráfico
const dados = {
    labels: ['Seguradora A', 'Seguradora B', 'Seguradora C'],
    datasets: [{
        label: 'Número de Apólices',
        data: [12, 19, 8],
        backgroundColor: [
            'rgba(75, 192, 192, 0.2)',
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
    }]
};

// Configurações do gráfico
const config = {
    type: 'bar', // Tipo de gráfico: 'bar', 'line', etc.
    data: dados,
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
};

// Renderizando o gráfico
const meuGrafico = new Chart(
    document.getElementById('meuGrafico'),
    config
);
