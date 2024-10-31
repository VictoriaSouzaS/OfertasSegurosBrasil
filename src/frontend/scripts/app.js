async function carregarDados() {
    try {
        console.log('Carregando JSON de:', '/../data/base_premio_uf.json');
        const response = await fetch('/../data/base_premio_uf.json');

        if (!response.ok) {
            throw new Error('Erro ao carregar o JSON: ' + response.statusText);
        }

        const dadosJson = await response.json();
        console.log('Dados JSON carregados:', dadosJson);

        criarGrafico(dadosJson);
    } catch (error) {
        console.error('Erro ao carregar os dados JSON:', error);
    }
}

const jsonPath = '/../data/base_premio_uf.json';

async function filtrarGraficoPorUF() {
    const ufSelecionada = document.getElementById('uf-select').value;
    const response = await fetch(jsonPath);
    const dadosJson = await response.json();
    const dadosFiltrados = dadosJson.filter(item => item.uf === ufSelecionada || ufSelecionada === 'Todos');
    criarGrafico(dadosFiltrados);
}

async function carregarPeriodos() {
    try {
        const response = await fetch(jsonPath);
        const data = await response.json();

        const periodosUnicos = [...new Set(data.map(item => {
            const dataItem = new Date(item.periodo);
            const mes = dataItem.toLocaleString('default', { month: 'short' }).slice(0, 3);
            const ano = dataItem.getFullYear();
            return `${mes}/${ano}`;
        }))];

        const periodoSelect = document.getElementById('periodo-select');
        periodoSelect.innerHTML = '';
        const optionTodos = document.createElement('option');
        optionTodos.value = 'Todos';
        optionTodos.textContent = 'Todos';
        periodoSelect.appendChild(optionTodos);
        periodosUnicos.forEach(periodo => {
            const option = document.createElement('option');
            option.value = periodo;
            option.textContent = periodo;
            periodoSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar os dados do JSON:", error);
    }
}

async function filtraGraficoPorMes() {
    const periodoSelecionado = document.getElementById('periodo-select').value;
    const response = await fetch(jsonPath);
    const dadosJson = await response.json();

    const dadosFiltrados = dadosJson.filter(item => {
        const dataItem = new Date(item.periodo);
        const mes = dataItem.toLocaleString('default', { month: 'short' }).slice(0, 3);
        const ano = dataItem.getFullYear();
        const mesAnoFormatado = `${mes}/${ano}`;
        return mesAnoFormatado === periodoSelecionado || periodoSelecionado === 'Todos';
    });

    criarGrafico(dadosFiltrados);
}

async function carregarCategorias() {
    try {
        const response = await fetch(jsonPath);
        const data = await response.json();

        const categoriasUnicas = [...new Set(data.map(item => item.nome_ramo))].sort();
        const categoriasSelect = document.getElementById('categoria-select');
        categoriasSelect.innerHTML = '';
        const optionTodos = document.createElement('option');
        optionTodos.value = 'Todos';
        optionTodos.textContent = 'Todos';
        categoriasSelect.appendChild(optionTodos);
        categoriasUnicas.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            categoriasSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar os dados do JSON:", error);
    }
}

async function filtraGraficoPorCategoria() {
    const categoriaSelecionada = document.getElementById('categoria-select').value;

    try {
        const response = await fetch(jsonPath);
        const dadosJson = await response.json();
        const dadosFiltrados = dadosJson.filter(item => item.nome_ramo === categoriaSelecionada || categoriaSelecionada === 'Todos');
        criarGrafico(dadosFiltrados);
    } catch (error) {
        console.error("Erro ao filtrar os dados:", error);
    }
}

async function carregarUfs() {
    try {
        const response = await fetch(jsonPath);
        const data = await response.json();

        const ufsUnicos = [...new Set(data.map(item => item.uf))].sort();
        const ufSelect = document.getElementById('uf-select');
        const optionTodos = document.createElement('option');
        optionTodos.value = 'Todos';
        optionTodos.textContent = 'Todos';
        ufSelect.appendChild(optionTodos);
        ufsUnicos.forEach(uf => {
            const option = document.createElement('option');
            option.value = uf;
            option.textContent = uf;
            ufSelect.appendChild(option);
        });
    } catch (error) {
        console.error("Erro ao carregar os dados do JSON:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();
    carregarUfs();
    carregarPeriodos();
});

let meuGrafico;

function criarGrafico(dados) {
    const premiosPorEntidade = {};
    dados.forEach(item => {
        const nomeEntidade = item.nome_entidade;
        const premio = item.premio_dir;

        if (premiosPorEntidade[nomeEntidade]) {
            premiosPorEntidade[nomeEntidade] += premio;
        } else {
            premiosPorEntidade[nomeEntidade] = premio;
        }
    });

    const entidadesComPremios = Object.entries(premiosPorEntidade)
        .map(([entidade, premio]) => ({ entidade, premio }));

    const totalPremio = entidadesComPremios.reduce((acc, item) => acc + item.premio, 0);
    console.log('Total de prêmios válidos:', totalPremio);

    let topEntidades; // Definindo topEntidades aqui

    // Se total de prêmios for zero, garantir que todas as entidades sejam mostradas como 0%
    if (totalPremio === 0) {
        const todasEntidades = [...new Set(dados.map(item => item.nome_entidade))];
        topEntidades = todasEntidades.map(entidade => ({
            entidade,
            porcentagem: 0 // Definindo como 0%
        }));
    } else {
        topEntidades = entidadesComPremios.map(item => ({
            entidade: item.entidade,
            porcentagem: (item.premio / totalPremio) * 100,
        }));
    }

    const topEntidadesOrdenadas = topEntidades.sort((a, b) => b.porcentagem - a.porcentagem).slice(0, 20);

    const topEntidadesLabels = topEntidadesOrdenadas.map(item => item.entidade);
    const topEntidadesPorcentagens = topEntidadesOrdenadas.map(item => item.porcentagem);

    console.log('Top 20 entidades:', topEntidadesLabels);
    console.log('Porcentagens do Top 20:', topEntidadesPorcentagens);

    const ctx = document.getElementById('meuGrafico').getContext('2d');

    if (meuGrafico) {
        meuGrafico.data.labels = topEntidadesLabels;
        meuGrafico.data.datasets[0].data = topEntidadesPorcentagens;
        meuGrafico.update();
    } else {
        meuGrafico = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topEntidadesLabels,
                datasets: [{
                    label: 'Representatividade % do Prêmio',
                    data: topEntidadesPorcentagens,
                    backgroundColor: '#001F3F',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 30,
                        top: 30,
                        bottom: 30
                    }
                },
                indexAxis: 'y',
                scales: {
                    x: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Representatividade %'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Entidades'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // Remove a legenda do gráfico
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        formatter: (value) => value.toFixed(2) + '%',
                        color: 'black',
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
}

carregarDados();
