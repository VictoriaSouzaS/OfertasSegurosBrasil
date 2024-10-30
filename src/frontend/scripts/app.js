async function carregarDados() {
    try {
        console.log('Carregando JSON de:', '/../data/base_premio_uf.json');
        const response = await fetch('/../data/base_premio_uf.json');

        // Verifica se a resposta do fetch foi bem-sucedida
        if (!response.ok) {
            throw new Error('Erro ao carregar o JSON: ' + response.statusText);
        }

        // Faz o parse do JSON e exibe no console
        const dadosJson = await response.json();
        console.log('Dados JSON carregados:', dadosJson);

        // Chama a função para criar o gráfico com os dados carregados
        criarGrafico(dadosJson);
    } catch (error) {
        // Exibe um erro no console, se ocorrer
        console.error('Erro ao carregar os dados JSON:', error);
    }
}

let meuGrafico; // Variável para armazenar a instância do gráfico

function criarGrafico(dados) {
    // Extrai os nomes das entidades e os prêmios do JSON
    const entidades = dados.map(item => item.nome_entidade);
    const premios = dados.map(item => item.premio_dir);

    // Filtra os prêmios para incluir apenas aqueles maiores que zero
    const premiosValidos = premios.filter(premio => premio > 0);

    // Calcula o total dos prêmios válidos
    const totalPremio = premiosValidos
        .filter(val => typeof val === 'number' && !isNaN(val))
        .reduce((acc, val) => acc + Math.round(val * 100) / 100, 0);
    console.log('Total de prêmios válidos:', totalPremio);

    // Verifica se o total é maior que zero para evitar divisões por zero
    if (totalPremio === 0) {
        console.error('Total de prêmios é zero. Verifique os dados.');
        return;
    }

    // Calcula a porcentagem de cada prêmio em relação ao total
    const porcentagens = premiosValidos.map(premio => (premio / totalPremio) * 100);
    console.log('Porcentagens calculadas:', porcentagens);

    // Cria um array de objetos com entidades e suas porcentagens
    const entidadesComPorcentagens = entidades.map((entidade, index) => ({
        entidade,
        porcentagem: porcentagens[index],
    }));

    // Classifica as entidades por porcentagem em ordem decrescente e pega as 20 maiores
    const topEntidades = entidadesComPorcentagens
        .sort((a, b) => b.porcentagem - a.porcentagem)
        .slice(0, 20);

    // Extrai os nomes das entidades e as porcentagens para os dados do gráfico
    const topEntidadesLabels = topEntidades.map(item => item.entidade);
    const topEntidadesPorcentagens = topEntidades.map(item => item.porcentagem);

    // Adicione este log para verificar os dados
    console.log('Top 20 entidades:', topEntidadesLabels);
    console.log('Porcentagens do Top 20:', topEntidadesPorcentagens);

    // Obtém o contexto do canvas onde o gráfico será desenhado
    const ctx = document.getElementById('meuGrafico').getContext('2d');

    // Se o gráfico já existir, atualize os dados
    if (meuGrafico) {
        meuGrafico.data.labels = topEntidadesLabels; // Atualiza os rótulos
        meuGrafico.data.datasets[0].data = topEntidadesPorcentagens; // Atualiza os dados
        meuGrafico.update(); // Atualiza o gráfico
    } else {
        // Configuração inicial do gráfico
        meuGrafico = new Chart(ctx, {
            type: 'bar', // Tipo de gráfico: 'bar' para gráfico de barras verticais
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
                indexAxis: 'y', // Isso fará com que o gráfico seja horizontal
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
                    datalabels: {
                        anchor: 'end', // Onde as labels devem ser ancoradas
                        align: 'end', // Alinhamento da label
                        formatter: (value) => {
                            return value.toFixed(2) + '%'; // Formata a label para mostrar a porcentagem
                        },
                        color: 'black', // Cor do texto das labels
                    }
                }
            },
            plugins: [ChartDataLabels] // Inclui o plugin
        });
    }
}

// Chama a função para carregar os dados assim que o script for executado
carregarDados();
