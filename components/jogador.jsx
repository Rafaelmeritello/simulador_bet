import React from 'react';

function Jogador({ nome,bancainicial,valorrodada, gale }) {
  const adicionar = () => {
    // Chama a função onAdd quando o botão é clicado
    onAdd();
  };

  return (
    <>
<div className="bg-gray-800 p-4 rounded-lg shadow-lg">

  <div className="mb-4 border-b border-gray-700 pb-2">
    <p className="text-sm font-semibold text-white text-center">{nome}</p>
  </div>

  <div className="grid grid-cols-2 divide-x divide-gray-700">
    <div className="p-4 text-center">
      <p className="text-sm font-semibold text-white">Banca inicial</p>
      <p className="text-gray-300">R$ {bancainicial}</p>
    </div>
    <div className="p-4 text-center">
      <p className="text-sm font-semibold text-white">Valor por aposta</p>
      <p className="text-gray-300">R$ {valorrodada}</p> {gale && ( <small title='Este jogador dobra de aposta quando perde e volta para inicial quando ganha' className='select-none text-blue-600 text-[10.2px]'>(Faz martingale)</small>)}
    </div>
  </div>
</div>
</>
  );
}

export default Jogador;
