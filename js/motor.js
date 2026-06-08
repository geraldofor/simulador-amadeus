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
    
    // Injeta o Briefing/Ordem de serviço na descrição lateral
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
        elAmadeusScreen.innerHTML = `AMADEUS GDS TERMINAL - AMBIENTE DE TREINAMENTO\nREADY FOR COMMANDS.\n\n[Digite o primeiro comando baseado na O.S. ao lado]`;
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

    // Se for o passo de assinatura (RF), valida se começa com RF
    if (passo.is_regex) {
        if (comando.startsWith("RF ") && comando.length > 3) {
            acertou = true;
        }
    } else {
        acertou = (comando === passo.comando_gabarito.toUpperCase());
    }
    
    if (acertou) {
        elFeedbackAjuda.innerHTML = "<span style='color: #00ff00;'>✔ Comando aceito.</span>";
        let telaAtual = elAmadeusScreen.innerHTML;
        if (passoAtualIndex === 0) telaAtual = `AMADEUS GDS TERMINAL (${missao.companhia})`;
        
        elAmadeusScreen.innerHTML = `${telaAtual}\n> ${comando}\nOK - PROCESSED.`;
        passoAtualIndex++;
        elInputComando.value = "";
        
        if (passoAtualIndex < missao.passos.length) {
            setTimeout(() => {
                elFeedbackAjuda.innerText = "";
                atualizarPasso();
            }, 800);
        } else {
            // FIM DA RESERVA - Gera Localizador e exibe aviso legal
            elAmadeusScreen.innerHTML += `\n\nRP/GRUUU2202/GRUUU2202            AA/AN  07JUN26\n1.SILVA/PEDRO MR\n\n** PNR CRIADO COM SUCESSO - LOCALIZADOR: R9X2WZ **\n\n--------------------------------------------------\n⚠️ AVISO DE COMPLIANCE:\nESTA RESERVA É FICTÍCIA, OPERADA EM AMBIENTE DE TESTE.\nNÃO POSSUI PODER DE COMERCIALIZAÇÃO OU EMISSÃO REAL.\n--------------------------------------------------`;
            elFeedbackAjuda.innerHTML = "<span style='color: #00ff00; font-weight: bold;'>🎉 Reserva Finalizada com sucesso!</span>";
            elInputComando.disabled = true;
            elBtnProxima.style.display = "block";
        }
    } else {
        elFeedbackAjuda.innerText = `❌ ${passo.erro_feedback}`;
        elAmadeusScreen.innerHTML += `\n> ${comando}\nREJECTED - CHECK FORMAT`;
        elInputComando.value = "";
    }
    elAmadeusScreen.scrollTop = elAmadeusScreen.scrollHeight;
}

function proximaMissao() {
    inicializarMissao(missaoAtualIndex + 1);
}

carregarSimulador();
