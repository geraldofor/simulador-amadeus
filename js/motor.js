// Variáveis de controle de estado do simulador
let missoes = [];
let missaoAtualIndex = 0;
let passoAtualIndex = 0;

// Mapeamento de IDs para nomes de Módulos (Visual)
const mapearModulo = (id) => {
    if (id <= 4) return "Módulo 1: Reservas";
    if (id <= 8) return "Módulo 2: Tarifas Avançadas";
    return "Módulo 3: Emissão Completa";
};

// Elementos do DOM
const elTituloMissao = document.getElementById('titulo-missao');
const elDescMissao = document.getElementById('desc-missao');
const elInstrucaoPasso = document.getElementById('instrucao-passo');
const elFeedbackAjuda = document.getElementById('feedback-ajuda');
const elAmadeusScreen = document.getElementById('amadeus-screen');
const elInputComando = document.getElementById('input-comando');
const elMissaoCia = document.getElementById('missao-cia');
const elMissaoStatus = document.getElementById('missao-status');
const elBtnProxima = document.getElementById('btn-proxima-missao');

// Inicialização: Carrega o arquivo JSON do repositório
async function carregarSimulador() {
    try {
        const resposta = await fetch('js/cenarios.json');
        if (!resposta.ok) throw new Error('Erro ao carregar cenários.');
        missoes = await resposta.json();
        
        // Inicia na primeira missão salva
        inicializarMissao(0);
    } catch (erro) {
        console.error(erro);
        elAmadeusScreen.innerHTML = "ERRO CRÍTICO AO CARREGAR BANCO DE DADOS DE CENÁRIOS.\nVERIFIQUE O ARQUIVO CENARIOS.JSON.";
    }
}

// Configura a tela com a missão selecionada
function inicializarMissao(index) {
    if (index >= missoes.length) {
        elTituloMissao.innerText = "🎉 Curso Concluído com Sucesso!";
        elDescMissao.innerText = "Você passou por todas as etapas de blindagem anti-ADM.";
        elInstrucaoPasso.innerText = "Parabéns! Você dominou Reservas, Tarifas e Emissão.";
        elAmadeusScreen.innerHTML = "SISTEMA AMADEUS GDS\n\nTREINAMENTO FINALIZADO COM 100% DE APROVEITAMENTO.\nPRONTO PARA EMISSÕES REAIS.";
        elInputComando.disabled = true;
        elBtnProxima.style.display = "none";
        return;
    }

    missaoAtualIndex = index;
    passoAtualIndex = 0;
    
    const missao = missoes[missaoAtualIndex];
    
    // Atualiza metadados visuais
    elMissaoCia.innerText = `Cia: ${missao.companhia}`;
    elMissaoStatus.innerText = mapearModulo(missao.id);
    elTituloMissao.innerText = missao.nome_missao;
    elDescMissao.innerText = missao.descricao;
    elBtnProxima.style.display = "none";
    elInputComando.disabled = false;
    elInputComando.value = "";
    elFeedbackAjuda.innerText = "";
    
    // Mostra o primeiro passo
    atualizarPasso();
}

// Atualiza as instruções na tela
function atualizarPasso() {
    const missao = missoes[missaoAtualIndex];
    const passo = missao.passos[passoAtualIndex];
    
    elInstrucaoPasso.innerText = passo.instrucao;
    
    // Renderiza o cabeçalho clássico do GDS Amadeus na tela preta
    if (passoAtualIndex === 0) {
        elAmadeusScreen.innerHTML = `AMADEUS GDS TERMINAL - MOCK ENVIRONMENT (${missao.companhia})\nRESET COMPLETED. READY FOR COMMANDS.\n\n[Aguardando comando técnico...]`;
    }
}

// Escuta a tecla Enter no terminal
elInputComando.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const comandoDigitado = elInputComando.value.trim().toUpperCase();
        if (!comandoDigitado) return;
        
        processarComando(comandoDigitado);
    }
});

// Valida a digitação do aluno contra o gabarito
function processarComando(comando) {
    const missao = missoes[missaoAtualIndex];
    const passo = missao.passos[passoAtualIndex];
    
    if (comando === passo.comando_gabarito.toUpperCase()) {
        // Acertou o comando!
        elFeedbackAjuda.innerHTML = "<span style='color: #00ff00;'>✔ Comando correto!</span>";
        
        // Atualiza o histórico na tela preta simulando a resposta do Amadeus
        let telaAtual = elAmadeusScreen.innerHTML;
        // Limpa mensagens de inicialização no primeiro comando
        if (passoAtualIndex === 0) telaAtual = `AMADEUS GDS TERMINAL (${missao.companhia})`;
        
        elAmadeusScreen.innerHTML = `${telaAtual}\n> ${comando}\nOK - PROCESSED SUCCESSFULLY.`;
        
        passoAtualIndex++;
        elInputComando.value = "";
        
        // Verifica se a missão acabou
        if (passoAtualIndex < missao.passos.length) {
            setTimeout(() => {
                elFeedbackAjuda.innerText = "";
                atualizarPasso();
            }, 1000);
        } else {
            // Missão concluída
            elAmadeusScreen.innerHTML += `\n\n*** MISSÃO CONCLUÍDA COM SUCESSO! MÓDULO ADIANTADO ***`;
            elFeedbackAjuda.innerHTML = "<span style='color: #00ff00; font-weight: bold;'>🎉 Missão cumprida! Clique no botão abaixo para avançar.</span>";
            elInputComando.disabled = true;
            elBtnProxima.style.display = "block";
        }
    } else {
        // Errou o comando
        elFeedbackAjuda.innerText = `❌ ${passo.erro_feedback}`;
        // Adiciona o erro na tela preta de forma sutil, como um comando rejeitado
        elAmadeusScreen.innerHTML += `\n> ${comando}\nREJECTED - CHECK FORMAT`;
        elInputComando.value = "";
    }
    
    // Auto-scroll da tela preta para o final
    elAmadeusScreen.scrollTop = elAmadeusScreen.scrollHeight;
}

// Avança para a próxima missão do array
function proximaMissao() {
    inicializarMissao(missaoAtualIndex + 1);
}

// Executa a carga inicial ao abrir a página
carregarSimulador();
