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

    // Calcula o total dos prêmios
    const totalPremio = premios.reduce((acc, val) => acc + val, 0);

    // Verifica se o total é maior que zero para evitar divisões por zero
    if (totalPremio === 0) {
        console.error('Total de prêmios é zero. Verifique os dados.');
        return;
    }

    // Calcula a porcentagem de cada prêmio em relação ao total
    const porcentagens = premios.map(premio => (premio / totalPremio) * 100);

    // Adicione este log para verificar os dados
    console.log('Porcentagens calculadas:', porcentagens);


    // Obtém o contexto do canvas onde o gráfico será desenhado
    const ctx = document.getElementById('meuGrafico').getContext('2d');

    // Se o gráfico já existir, atualize os dados
    if (meuGrafico) {
        meuGrafico.data.labels = entidades; // Atualiza os rótulos
        meuGrafico.data.datasets[0].data = porcentagens; // Atualiza os dados
        meuGrafico.update(); // Atualiza o gráfico
    } else {
        // Configuração inicial do gráfico
        meuGrafico = new Chart(ctx, {
            type: 'bar', // Tipo de gráfico: 'bar' para gráfico de barras verticais
            data: {
                labels: entidades,
                datasets: [{
                    label: 'Representatividade % do Prêmio',
                    data: porcentagens,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
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
                }
            }
        });
    }
}

// Chama a função para carregar os dados assim que o script for executado
carregarDados();
