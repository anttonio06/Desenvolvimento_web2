const capitalize = str =>
  str.trim().split(' ').map(w => w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : '').join(' ');

const telPattern = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.(com|com\.br|net|org)$/;

/**
 * Normaliza o campo 'servicos' do formulário para sempre retornar um array.
 * Necessário pois formulários HTML enviam um único checkbox como string
 * e múltiplos checkboxes como array.
 * @param {string|string[]|undefined} raw - Valor bruto do req.body.servicos.
 * @returns {string[]}
 */
function normalizarServicos(raw) {
  if (!raw) return [];
  return Array.isArray(raw) ? raw : [raw];
}

/**
 * Calcula os valores financeiros de um agendamento com base nos serviços e no porte do pet.
 * O campo de preço usado varia conforme o porte: preco_pequeno, preco_medio ou preco_grande.
 * Desconto está fixo em zero por enquanto — sem promoções implementadas.
 * @param {Object[]} servicosSelecionados - Lista de objetos de serviço com campos preco_*.
 * @param {Object} pet - Objeto do pet com a propriedade 'porte' (Pequeno, Médio ou Grande).
 * @returns {{ subtotal: number, desconto: number, valorFinal: number, campoPreco: string }}
 */
function calcularValores(servicosSelecionados, pet) {
  const porteMap = { 'Pequeno': 'preco_pequeno', 'Médio': 'preco_medio', 'Grande': 'preco_grande' };
  const campoPreco = porteMap[pet.porte] || 'preco_medio';

  let subtotal = 0;
  servicosSelecionados.forEach(s => {
    subtotal += parseFloat(s[campoPreco]) || 0;
  });

  return {
    subtotal,
    desconto: 0,
    valorFinal: Math.round(subtotal * 100) / 100,
    campoPreco
  };
}

function validarDependenciasServicos(nomes) {
  const temBanho = nomes.includes('banho');
  if ((nomes.includes('tosa') || nomes.includes('hidratação')) && !temBanho) {
    return false;
  }
  return true;
}

module.exports = { capitalize, telPattern, emailPattern, normalizarServicos, calcularValores, validarDependenciasServicos };
