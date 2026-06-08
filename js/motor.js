let missoes = [];
let missaoAtualIndex = 0;
let passoAtualIndex = 0;

const elTituloMissao = document.getElementById('titulo-missao');
const elDescMissao = document.getElementById('desc-missao');
const elInstrucaoPasso = document.getElementById('instrucao-passo');
const elFeedbackAjuda = document.getElementById('feedback-ajuda');
const elAmadeusScreen = document.getElementById('amadeus-screen');
const elInputComando = document.getElementById('input-comando');
const elMissaoCia = document.getElementById('missao-cia');
const elMissaoStatus = document.getElementById('missao-status');
const elBtnProxima = document.getElementById('btn-proxima-missao');

async function carregarSimulador() {
    try {
        const resposta = await fetch('js/cenarios.json');
        if (!resposta.ok) throw new Error('Erro ao carregar cenários.');
        missoes = await resposta.json();
        inicializarMissao(0);
    } catch (erro) {
        console.error(erro);
        elAmadeusScreen.innerHTML = "ERRO AO CARREGAR O BANCO DE DADOS DE CENÁRIOS.";
    }
}

function inicializarMissao(index) {
    if (index >= missoes.length) {
        elTituloMissao.innerText = "🎉 Módulo 1 Concluído!";
        elDescMissao.innerText = "Você dominou a criação e blindagem de PNRs corporativos.";
        elAmadeusScreen.innerHTML = "SISTEMA AMADEUS - PRONTO PARA O PRÓXIMO MÓDULO.";
        elInputComando.disabled = true;
        return;
    }

    missaoAtualIndex = index;
    passoAtualIndex = 0;
    const missao = missoes[missaoAtualIndex];
    
    elMissaoCia.innerText = `Cia: ${missao.companhia}`;
    elMissaoStatus.innerText = "Módulo 1: Reservas";
    elTituloMissao.innerText = missao.nome_missao;
    
    elDescMissao.innerHTML = missao.briefing || missao.descricao;
    
    elBtnProxima.style.display = "none";
    elInputComando.disabled = false;
    elInputComando.value = "";
    elFeedbackAjuda.innerText = "";
    
    atualizarPasso();
}

function atualizarPasso() {
    const missao = missoes[missaoAtualIndex];
    const passo = missao.passos[passoAtualIndex];
    elInstrucaoPasso.innerText = passo.instrucao;
    
    if (passoAtualIndex === 0) {
        elAmadeusScreen.innerHTML = `AMADEUS GDS TERMINAL - AMBIENTE DE TREINAMENTO\nREADY FOR COMMANDS.\n\n[Consulte a disponibilidade de voos baseando-se na O.S. ao lado]`;
    }
}

elInputComando.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        const comandoDigitado = elInputComando.value.trim().toUpperCase();
        if (!comandoDigitado) return;
        processarComando(comandoDigitado);
    }
});

function processarComando(comando) {
    const missao = missoes[missaoAtualIndex];
    const passo = missao.passos[passoAtualIndex];
    let acertou = false;

    if (passo.is_regex) {
        if (comando.startsWith("RF ") && comando.length > 3) {
            acertou = true;
        }
    } else {
        acertou = (comando === passo.comando_gabarito.toUpperCase());
    }
    
    if (acertou) {
        elFeedbackAjuda.innerHTML = "<span style='color: #00ff00;'>✔ Comando executado com sucesso.</span>";
        
        let telaAtual = elAmadeusScreen.innerHTML;
        // Limpa a tela preta no primeiro comando ou no comando final (ER) para dar realismo técnico
        if (passoAtualIndex === 0 || passo.comando_gabarito === "ER") {
            elAmadeusScreen.innerHTML = passo.resposta_terminal;
        } else if (passo.is_regex) {
            // Caso seja a assinatura, exibe dinamicamente o comando que o aluno usou
            elAmadeusScreen.innerHTML = `${telaAtual}\n\n> ${comando}\nOK`;
        } else {
            // Junta a resposta clássica no histórico do terminal
            elAmadeusScreen.innerHTML = `${telaAtual}\n\n${passo.resposta_terminal}`;
        }
        
        passoAtualIndex++;
        elInputComando.value = "";
        
        if (passoAtualIndex < missao.passos.length) {
            setTimeout(() => {
                elFeedbackAjuda.innerText = "";
                atualizarPasso();
            }, 800);
        } else {
            elInputComando.disabled = true;
            elBtnProxima.style.display = "block";
        }
    } else {
        elFeedbackAjuda.innerText = `❌ ${passo.erro_feedback}`;
        elAmadeusScreen.innerHTML += `\n\n> ${comando}\nREJECTED - CHECK FORMAT`;
        elInputComando.value = "";
    }
    elAmadeusScreen.scrollTop = elAmadeusScreen.scrollHeight;
}

function proximaMissao() {
    inicializarMissao(missaoAtualIndex + 1);
}

carregarSimulador();
