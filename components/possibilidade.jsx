import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';  // Importar ícone de X
import { faSpinner } from "@fortawesome/free-solid-svg-icons"; 
function Possibilidade({ chance,multiplicador,nome ,indice, excluirItem}) {
  const handleClick = () => {
    // Chama a função onAdd quando o botão é clicado
    onAdd();
  };

  return (
<>
<div className="bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-700 hover:shadow-2xl transition-all duration-300">
    
    <div className="flex justify-between items-center mb-4">
      <p className="text-lg font-semibold text-white">{nome}</p>
      
      <button
        onClick={() => excluirItem(indice, chance, multiplicador)}
        className="text-gray-500 hover:text-red-500 transition-colors"
        title="Excluir possibilidade"
      >
        <FontAwesomeIcon
          icon={faTrash}
          className="text-lg cursor-pointer"
        />
      </button>
    </div>

    <div className="grid grid-cols-2 divide-x divide-gray-700 rounded-lg overflow-hidden">
      <div className="p-1 text-center bg-gray-700 hover:bg-gray-600 transition-colors">
        <p className="text-sm font-semibold text-gray-400">Chance</p>
        <p className="text-gray-200 font-medium">{chance}%</p>
      </div>

      <div className="p-1 text-center bg-gray-700 hover:bg-gray-600 transition-colors">
        <p className="text-sm font-semibold text-gray-400">Multiplicador</p>
        <p className="text-gray-200 font-medium">{multiplicador}x</p>
      </div>
    </div>

  </div>
</>

  );
}

export default Possibilidade;
