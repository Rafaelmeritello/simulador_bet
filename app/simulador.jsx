"use client";
import { useState, useEffect ,useRef} from "react";
import Jogador from '@/components/jogador';
import Possibilidade from "@/components/possibilidade";
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';  // Importar ícone de X
import { faSpinner } from "@fortawesome/free-solid-svg-icons"; 
import introJs from 'intro.js';
import 'intro.js/introjs.css'; 


const iniciarTutorial = () => {
  introJs().setOptions({
    nextLabel: 'Próximo',
    prevLabel: 'Anterior',
    
    doneLabel: 'Concluir',
    steps: [
      { intro: "Bem-vindo aqui você pode simular jogos de cassinos\n Lembre-se, em cassinos reais, a casa sempre ganha!" },
     
  
     
      { element: "#div_add_jogador", intro: "O primeiro passo é adicionar um jogador, usamos a barra esquerda." },

      { element: "#banca_inicial_input", intro: "Começe adicionando o saldo inicial do jogador (com quanto dinheiro ele começa)" },
      
      { element: "#valor_jogada_input", intro: "Depois, escolha qual o valor ele vai apostar em cada jogada." },
    

      { element: "#gale-checkbox", intro: "Aqui você escolhe se seu jogador vai fazer martingale (dobrar a aposta sempre que perder)." },

      { element: "#div_lista_jogadores", intro: "Após adicionar jogadores, eles aparecerão aqui" },

      { element: "#texto_add_possibilidades", intro: "Aqui você pode adicionar as possibilidades de ganho ou perda para o jogador." },
  
  { element: "#chance_input", intro: "Insira a chance (em %) dessa possibilidade ocorrer." },

  { element: "#multiplicador_input", intro: "Defina o multiplicador para essa possibilidade. Ex.: Multiplicador 2 significa dobrar o valor apostado." },

 
  { element: "#linha_chances", intro: "Esta linha mostra as chances de cada possibilidade adicionada." },


  { element: "#txt_chance_perder_tudo", intro: "Aqui você vê a chance do jogador perder todo o saldo. Fique atento!" },
  { element: "#txt_rtp", intro: "Aqui você vê o rtp, considerando as possibilidades que você adicionou\n (RTP é o ganho esperado para cada 1$ jogado)." },



  { element: "#lista_possibilidades", intro: "As possibilidades adicionadas aparecerão aqui,abaixo ." },


  { element: "#qtd_apostas_input", intro: "Informe a quantidade de apostas que serão simuladas." },
  
  { element: "#chart", intro: "Este é o gráfico do saldo dos jogadores ao longo das jogadas. Você pode dar zoom e arrastar para explorar melhor os dados." },

  { element: "#txt_balanco_cassino", intro: "Aqui aparece o valor de lucro ou prejuízo do cassino ao final de todas as jogadas. Será que a casa ganhou?" },

         { intro: "Agora vamos começar ! (é praticamente impossivel ter lucro ao longo prazo em cassinos reais)" },
     
  
    
    
    ],
    tooltipClass: 'introjs-dark', 
    highlightClass: 'introjs-dark'
  }).start();
};





import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController, 
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
// Registrar os componentes necessários do Chart.js (Parte feita com IA)
ChartJS.register(
  CategoryScale,
  LinearScale,  
  LineController,
  PointElement,  
  LineElement,  
  Title,        
  Tooltip,       
  Legend         
);


import zoomPlugin from 'chartjs-plugin-zoom';
import { isUndefined } from "util";
ChartJS.register(zoomPlugin);

function Inicial() {
  const chartRef = useRef(null);

    const [jogadores, setJogadores] = useState([]);
    const [jogadores_inicial, setJogadores_inicial] = useState([]);
    const [possibilidades, setPossibilidades] = useState([]);
    const [qtd_jogadas_grafico, setqtd_jogadas_grafico] = useState([])
    const [loading, setLoading] = useState(false);
    const [dataset, setdataset] = useState([0]);
    const [lucro_cassino, set_lucro_cassino] = useState(0);
 
    const [rtp, setrtp] = useState(0);

  const [isClient, setIsClient] = useState(false); 

  
  useEffect(() => {
    setIsClient(true);

  }, []);

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            let item = context.raw;
            return [
              `Jogador: ${item.jogador};`,
              `Saldo: ${item.y.toFixed(2)};`,
              `Aposta anterior: ${item.aposta.toFixed(2)};`,
              `Multiplicador anterior ${item.mult_anterior?.toFixed(2) || 0}.`
            ];
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Saldo ao longo das jogadas',
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true, 
          },
          pinch: {
            enabled: true,
          },
          mode: 'xy',
          speed: 0.01,
         
          sensitivity: 3,
        },
        pan: {
          enabled: true, 
          mode: 'xy',
          speed: 0.01,
          sensitivity: 3,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          stepSize: 1, 
        },
        min: 0,
   
        type: 'linear', 
        
        title: {
          display: true,
          text: 'Jogadas',
        },
      },
      y: {
        min:0,

        type: 'linear', 
        title: {
          display: true,
          text: 'Saldo',
        },
      },
    },
  };

  const labels = qtd_jogadas_grafico;
  const data = {
    labels,
    datasets: dataset
  };
  const resetar_zoom = () => {
    if (chartRef.current) {
      chartRef.current.resetZoom();
    }
  };


  const calcular_lucro_cassino = () => {
    let totalLucro = 0; 
 
    jogadores.forEach((jogador) => {
      const balanco = jogador.evolucao_saldo[0].y - jogador.evolucao_saldo[jogador.evolucao_saldo.length - 1].y;
      console.log(jogador)

      totalLucro += balanco;
    });

    set_lucro_cassino(totalLucro); 

  };
  
  const adicionarJogador = (saldo_inicial, valor_por_aposta,gale) => {
    if(saldo_inicial <= 0 || valor_por_aposta <=0){
       alert("insira um valor válido!");
    return;
  }
  if(valor_por_aposta > saldo_inicial){
    alert("Aposta maior que saldo inicial!");
    return;
  }
   if(valor_por_aposta > 500){
    alert("500 é a aposta maxima!");
    return;
   }
    if (jogadores.length < 10) {
      if (
        saldo_inicial === undefined ||
        saldo_inicial === null ||
        saldo_inicial === '' ||
        isNaN(parseFloat(saldo_inicial)) ||
        valor_por_aposta === undefined ||
        valor_por_aposta === null ||
        valor_por_aposta === '' ||
        isNaN(parseFloat(valor_por_aposta))
      ) {
        alert("Escolha um saldo inicial e valor por aposta válidos!");
        return;
      }
      try {
        saldo_inicial = parseFloat(saldo_inicial).toFixed(2);
        valor_por_aposta = parseFloat(valor_por_aposta).toFixed(2);
      } catch {
        alert("Opa, verifique o formato dos numeros, devem ser por ex: 10.00, 20.34, 12.23, etc...");
      }

      let nome_jogador = "Jogador " + (jogadores.length + 1);


      // adiciona de verdade o jogador
      setJogadores([...jogadores, { 


        Nome: nome_jogador, 
        Saldo: saldo_inicial,
        ValorAposta: valor_por_aposta, 
        faz_gale: gale,
        aposta_gale: 0,
    
        evolucao_saldo: [{x:0,y:parseFloat(saldo_inicial), aposta: 0 , jogador: nome_jogador}]
        }]);


        setJogadores_inicial([...jogadores_inicial, { 


          Nome: nome_jogador, 
          Saldo: saldo_inicial,
          ValorAposta: valor_por_aposta, 
          faz_gale: gale,
          aposta_gale: 0,
      
          evolucao_saldo:[{x:0,y:parseFloat(saldo_inicial), aposta: 0 , jogador: nome_jogador}]
          }]);
        
    }
  };










// realiza uma jogada
const jogar = (jogador) => {

  let random = Math.random().toFixed(2) * 100;  
  
  let poss_atual = 0; 
  let valor_aposta_real = jogador.ValorAposta;


  if (jogador.faz_gale && jogador.aposta_gale > 0 ) {
    if(jogador.Saldo < jogador.aposta_gale){
      jogador.aposta_gale = 0
    }else{
      valor_aposta_real = jogador.aposta_gale;
    }

  }

  // Deduzir o valor da aposta do saldo do jogador
  jogador.Saldo = jogador.Saldo - valor_aposta_real;

  let premio = 0;
  valor_aposta_real = Math.min(valor_aposta_real,500)
  // Verifica qual possibilidade de multiplicação se aplica com base no valor aleatorio gerado
  possibilidades.forEach((possibilidade) => {
    poss_atual += parseFloat(possibilidade.chance);
    // console.log(valor_aposta_real+ " aposta")
    // console.log(possibilidade.multiplicador+ " multiplicador ")
    // console.log(random+ " random ")
    // console.log(poss_atual+ " pos_atual ")
    if (random < poss_atual && premio == 0) {
      premio = valor_aposta_real * possibilidade.multiplicador;

      jogador.Saldo += premio;

    }
    // console.log(premio + " Premio")
    // console.log('_________________')
  });


  // se o jogador tiver lucro ( prêmio é maior que a aposta)
  if (premio > valor_aposta_real) {
 
    jogador.aposta_gale = 0;  // resetando o valor da aposta Gale,  jogador ganhou
  } else {  // Se ele tiver preju

    if (jogador.faz_gale) {
      // Se o jogador estiver utilizando o sistema de gale, dobra a aposta
      if (jogador.aposta_gale > 0) {
        if(jogador.aposta_gale == 500){
          jogador.aposta_gale = 0
          return
        }
        jogador.aposta_gale = Math.min(jogador.aposta_gale * 2, 500); 

      } else {
        jogador.aposta_gale = Math.min(jogador.ValorAposta * 2, 500); 
      }
    }
  }


  jogador.evolucao_saldo = [...jogador.evolucao_saldo, {y: jogador.Saldo,aposta: valor_aposta_real, x: jogador.evolucao_saldo.length, jogador: jogador.Nome, mult_anterior: premio/valor_aposta_real}];
}



//fim da função de jogada











const calcular_rtp = (chance, multiplicador, subtracao=false)=>{

  if(subtracao){
    setrtp(rtp  - (parseFloat(chance)/100) * parseFloat(multiplicador))
    return
  }
  setrtp(rtp  + (parseFloat(chance)/100) * parseFloat(multiplicador))
}
const gerar_grafico = () => {
  setLoading(true);

  setTimeout(() => {
    set_lucro_cassino(0)
    const qtdApostas = document.getElementById("qtd_apostas_input").value;
    if (jogadores.length <= 0) {
      alert("adicione jogadores antes de gerar o grafico");
      setLoading(false);
      return;
    }
    if (possibilidades.length <= 0) {
      alert("adicione possibilidades antes de gerar o grafico");
      setLoading(false);
      return;
    }
    if (
      qtdApostas === undefined ||
      qtdApostas === null ||
      qtdApostas === '' ||
      isNaN(parseFloat(qtdApostas))
    ) {
      alert("Escolha uma quantidade de jogadas!");
      setLoading(false);
      return;
    }
    setqtd_jogadas_grafico(Array.from({ length: qtdApostas }, (_, index) => index ));

    for (let i = 0; i < jogadores.length; i++) {
      jogadores[i].evolucao_saldo = [jogadores[i].evolucao_saldo[0]]
      for (let aposta = 0; aposta < parseInt(qtdApostas); aposta++) {
        if (parseFloat(jogadores[i].Saldo) >= parseFloat(jogadores[i].ValorAposta) && parseFloat(jogadores[i].Saldo) > 0) {
          jogar(jogadores[i]);
        }
      }
    }

    setdataset(jogadores.map((jogador,index) => {
      return {
        label: "Saldo do Jogador "+(parseInt(index) + 1),  
        data: jogador.evolucao_saldo,  
        fill: false,  
        borderColor: getColor(0, true),
        tension: 0.1,  
      };
    }));

    calcular_lucro_cassino();


    setLoading(false);
    setJogadores(structuredClone(jogadores_inicial));


  }, 0);
};






  var [chance_perder_tudo , set_chance_perder_tudo] = useState(100.0)


  const calcula_chance_perda_total = (chance, somar=false)=> {
    
   if(somar){
    set_chance_perder_tudo(chance_perder_tudo + parseFloat(chance))
    return
   }
      set_chance_perder_tudo(chance_perder_tudo - chance)
    
  }






  const adicionarPossibilidade = (chance, multiplicador) => {
    if (
       chance === undefined ||
      chance === null ||
      chance === '' ||
      isNaN(parseFloat(chance)) ||
      multiplicador === undefined ||
      multiplicador === null ||
      multiplicador === '' ||
      isNaN(parseFloat(multiplicador)) ||
      chance <=0||
      multiplicador <=0
    ) {
      alert("Escolha a chande e o multiplicador validos!");
      return;
    }

    if (possibilidades.length < 15) {
      try{
        parseFloat(chance)
        parseFloat(multiplicador)
      }catch{
        alert("Informações invalidas")
      }
      calcular_rtp(chance,multiplicador)
      calcula_chance_perda_total(chance)
     
      setPossibilidades([...possibilidades, {chance: chance, multiplicador: multiplicador,nome:"Possibilidade "+(possibilidades.length + 1)}  ]);

    }else{
      alert("Número maximo de possibilidades adicionadas")
    }
  };

  // Função  limpa jogadores
  const limparJogadores = () => {
    setJogadores([]);
    setJogadores_inicial([])
  };
  const limparPossibilidades = () => {
    setPossibilidades([]);
    set_chance_perder_tudo(100)
    setrtp(0)
  };
  const excluir_possibilidade = (indice, chance,multiplicador) => {
    setPossibilidades((prevPossibilidades) => 
      prevPossibilidades.filter((_, i) => i !== indice)
    );
    calcula_chance_perda_total(chance, true)
    calcular_rtp(chance,multiplicador,true)
  console.log(chance_perder_tudo)
  };
  






  
  const getColor = (index=0,random=false) => {

    const colors = [
      "#ff4757", "#1e90ff", "#2ed573", "#ffa502", "#eccc68",
      "#ff6b81", "#3742fa", "#7bed9f", "#fbc531", "#8c7ae6",
      "#d63031", "#00a8ff", "#44bd32", "#e84118", "#9c88ff",
      "#ff6347", "#32cd32", "#ff1493", "#20b2aa", "#ff4500",
      "#7fff00", "#ff00ff", "#00ff7f", "#4682b4", "#ffd700",
      "#800080", "#f0e68c", "#d2691e", "#deb887", "#adff2f"
    ];
    
    if(random){
      return colors[Math.floor(Math.random() * colors.length)]; 
    }
    return colors[index % colors.length];
  };
  

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col sm:flex-row p-4 space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Barra Esquerda - Jogadores */}

      <div className="w-full sm:w-1/4 bg-gray-800 p-3 rounded-lg shadow-lg">
   
        <h2 className="text-center font-semibold mb-4" id='div_add_jogador'>Adicionar Jogadores</h2>
        
        <div className="space-y-4 items-center justify-content-center">

          {jogadores.length < 10 && (
            <div className="flex flex-col space-y-2">
              <div className="flex flex-col space-y-4">
                {/*dinheiro inicial do jogador */}
                <div className="flex items-center space-x-2">
                  <input
                    type="number" format="currency" precision="2"
                    className="bg-gray-700 text-white p-2 rounded-md flex-grow"
                    placeholder="Banca inicial do jogador"
                    id="banca_inicial_input"
                  />
                  {isClient && (
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="text-blue-500 cursor-help"
                      title="Este é o caixa inicial (dinheiro) total que este jogador vai ter. Se ele ficar sem saldo para jogar, ele irá parar mesmo antes de todas as rodadas acabarem!"
                    />
                  )}
                </div>

                {/*  Valor de cada jogada */}
                <div className="flex items-center space-x-2">
                  <input
                    type="number" format="currency" precision="2"
                    className="bg-gray-700 text-white p-2 rounded-md flex-grow"
                    placeholder="Valor de cada jogada"
                    id="valor_jogada_input"
                  />
                  {isClient && (
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="text-blue-500 cursor-help"
                      title="Este é o valor que este jogador vai apostar por cada rodada!"
                    />
                  )}
                </div>


                
              {/* checkbox do martingale*/}
              <center>


                <div className="flex items-center justify-center space-x-2">
               <input id="gale-checkbox" type="checkbox" value="" className="w-4 h-4 text-gray-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                <label htmlFor="gale-checkbox" className="select-none ms-2 text-sm font-medium text-black-900  dark:text-white-300">Martingale?</label>
                  {isClient && (
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="text-blue-500 cursor-help"
                      title="Este jogador vai fazer martingale? (técnica comum de dobrar a aposta sempre que perder, o limite aqui é de 7 vezes dobrando , cassinos costumam impor limites para isso)!"
                    />
                  )}
                </div>
                
                </center> 
              </div>
             

              {/* Botao para adicionar player */}
              <button
                className="bg-transparent mt-2 border border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-2 px-4 rounded transition-colors duration-200"
                onClick={() => adicionarJogador(document.getElementById("banca_inicial_input").value, document.getElementById("valor_jogada_input").value,document.getElementById("gale-checkbox").checked)}
              >
                Adicionar
              </button>
              <button
                className="bg-transparent  text-red-500 hover:text-white font-semibold  rounded-full transition-colors duration-200   mt-2 mr-4"
                onClick={limparJogadores}
              >
                Limpar <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>

       
            </div>
          )}

<div id="div_lista_jogadores" className="scrollable-container">
  {jogadores_inicial.map((jogador, index) => (
    <Jogador key={index} gale={jogador.faz_gale} nome={jogador.Nome} bancainicial={jogador.Saldo} valorrodada={jogador.ValorAposta} />
  ))}
</div>

        </div>
      </div>






      {/* Grafico Central */}
<div className="w-full sm:w-4/6 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center relative">
  
  {/* Titulo */}
  <h2 className="text-lg font-semibold text-white mb-3">Simulação de Apostas Feito por <a className="text-blue-400" href="https://www.linkedin.com/in/rafael-delmas/">Rafael Delmas</a> </h2><a href="#" className="text-blue-400" onClick={iniciarTutorial}>Como usar?</a>

  {/* Container de Configuracao */}
  <div className="w-full flex flex-col items-center space-y-3 mb-4">
    
    <div className="flex items-center space-x-2">
      <label htmlFor="qtd_apostas_input" className="text-white">Quantidade de apostas:</label>
      <input
        type="number"
        id="qtd_apostas_input"
        className="bg-gray-700 w-24 text-center text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Qtd"
        step="1"
        min="1"
        max="1000"
      />
      {isClient && (
        <FontAwesomeIcon
          icon={faQuestionCircle}
          className="text-blue-400 cursor-help"
          title="Quantidade de apostas que cada jogador vai fazer!"
        />
      )}
    </div>

    {/* Botão de Geração */}
    <button
      onClick={gerar_grafico}
      className="bg-green-600 py-2 px-4 rounded-md text-white font-medium transition duration-200 hover:bg-green-700 active:scale-95 flex items-center justify-center gap-2"
      disabled={loading}
    >
      {loading ? (
        <>
          <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
          Gerando...
        </>
      ) : (
        "Gerar Gráfico"
      )}
    </button>

      {/* Saiba mais */}
      <div className="flex flex-row gap-15">

      <a href="#" className="mr-8 bottom-3 left-4 text-blue-400 hover:underline text-sm">
          Importar modelo de jogo (em breve)
        </a>
      
        <a href="#" className=" ml-6 bottom-3 left-4 text-blue-400 hover:underline text-sm">
          Exportar modelo de jogo (em breve)
        </a>
      </div>


  </div>

  {/* Gráficos */}
  <div className="w-full h-96 bg-gray-700 rounded-lg  flex justify-center items-center">
    {isClient ? <Chart ref={chartRef} id="chart" type="line" className="w-full"  options={options} data={data} /> : <p className="text-gray-400">Carregando gráfico...</p>}
  </div>
<div className="flex flex-row">


<p id="txt_balanco_cassino">

  {lucro_cassino >= 0 
    ? `Lucro do cassino: ${lucro_cassino.toFixed(2)}` 
    : `Prejuízo do cassino: ${Math.abs(lucro_cassino.toFixed(2))}`}
</p>

<a href="#" className="text-blue-400 ml-2 text-sm" onClick={resetar_zoom}>
  Resetar zoom
</a>

</div>

</div>









      {/* Barra Direita - ossibilidades */}
      <div className="w-full sm:w-1/5 bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 id="texto_add_possibilidades" className="text-center font-semibold mb-4">Adicionar Possibilidades</h2>
        <div className="space-y-4">
   
          {possibilidades.length < 50 && (
            <div className="flex flex-col space-y-2">





           <div className="flex items-center space-x-2">
                  <input
                    type="number"  precision="2"
                    className="bg-gray-700 text-white p-2 rounded-md flex-grow"
                    placeholder="Chance de acontecer"
                    id="chance_input"
                       step='0.1'
                       min='0'
                  />
                  {isClient && (
                    <FontAwesomeIcon
                      icon={faQuestionCircle}

                      className="text-blue-500 cursor-help"
                      title="Cance do multiplicador abaixo acontecer em uma rodada!"
                    />
                  )}
                </div>





       <div className="flex items-center space-x-2">
                  <input
                    type="number" 
                    
                    precision="2"
                    className="bg-gray-700 text-white p-2 rounded-md flex-grow"
                    placeholder="Multiplicador"
                       step='0.1'
                       min='0'
                       max='500'
                    id="multiplicador_input"
                  />
                  {isClient && (
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                   
                      className="text-blue-500 cursor-help"
                      title="Valor no qual a aposta vai ser multiplicada ex: 2 (dobra), 3(triplica) 0.5(cai pela metade)..."
                    />
                  )}
                </div>






              <button
                className="bg-transparent border border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-2 px-4 rounded transition-colors duration-200"
                onClick={() => adicionarPossibilidade(document.getElementById("chance_input").value,document.getElementById("multiplicador_input").value)}
              >
                Adicionar
              </button>
              <button
                className="bg-transparent  text-red-500 hover:text-white font-semibold  rounded-full transition-colors duration-200   mt-2 mr-4"
                onClick={limparPossibilidades}
              >
                Limpar <FontAwesomeIcon icon={faTrash} size="sm" />
              </button>
              <div className="items-center scrollable-container justify-center w-full">
  {possibilidades.length >= 0 && (
    <div className="flex flex-col items-center w-full space-y-2">
            {/* Barra de chance para usuário ter nocao */}
            <div  id="linha_chances" className="w-full h-2 rounded-full overflow-hidden bg-gray-700 flex mt-2">
        {possibilidades.map((possibilidade, index) => (
          <div
            key={index}
           
            className="h-[80%]"
            style={{
              width: `${possibilidade.chance}%`, 
              backgroundColor: getColor(index),
            }}
          />
        ))}
      </div>

      {/* Texto mostrando chance de perder tudo */}
      <small id="txt_chance_perder_tudo" className="text-red-400 font-semibold text-sm mt-1">
        Chance de perder tudo: {chance_perder_tudo.toFixed(2)}%
      </small>


      <div className="flex flex-center">
      <small id="txt_rtp" className="text-red-400 font-semibold text-sm mt-1">
        RTP: {rtp.toFixed(2)}
      </small>
      <FontAwesomeIcon
                      icon={faQuestionCircle}
                   
                      className="text-blue-500 ml-2 cursor-help"
                      title="RTP é o ganho esperado para cada 1$ jogado"
                    />
      </div>

      <div id="lista_possibilidades">
      {/* Lista de possibilidades */}
      {possibilidades.map((possibilidade, index) => (
        <Possibilidade
          key={index}
          indice={index}
          nome={possibilidade.nome}
          chance={possibilidade.chance}
          excluirItem={excluir_possibilidade}
          multiplicador={possibilidade.multiplicador}
        />
        
      ))}
      </div>


      
    </div>
  )}
</div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inicial;
