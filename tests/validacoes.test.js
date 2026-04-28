const {
  capitalize,
  telPattern,
  emailPattern,
  normalizarServicos,
  calcularValores,
  validarDependenciasServicos
} = require('../utils/helpers');

test('capitalize deve deixar o nome com letra maiúscula no início', () => {
  expect(capitalize('joao silva')).toBe('Joao Silva');
});

test('capitalize tem que converter tudo que tiver em maiúsculo também', () => {
  expect(capitalize('MARIA COSTA')).toBe('Maria Costa');
});

test('telefone com DDD e 9 dígitos deve ser válido', () => {
  expect(telPattern.test('(11) 91234-5678')).toBe(true);
});

test('telefone com letras não pode ser válido', () => {
  expect(telPattern.test('(11) 9abcd-5678')).toBe(false);
});

test('email com .com.br deve passar na validação', () => {
  expect(emailPattern.test('usuario@empresa.com.br')).toBe(true);
});

test('email com domínio errado deve falhar', () => {
  expect(emailPattern.test('usuario@gmail.xyz')).toBe(false);
});

test('normalizarServicos retorna array vazio se não passar nada', () => {
  expect(normalizarServicos(null)).toEqual([]);
});

test('normalizarServicos coloca a string dentro de um array', () => {
  expect(normalizarServicos('1')).toEqual(['1']);
});

test('calcularValores calcula o total certo para pet pequeno', () => {
  const servicos = [
    { preco_pequeno: '30.00', preco_medio: '50.00', preco_grande: '70.00' },
    { preco_pequeno: '20.00', preco_medio: '40.00', preco_grande: '60.00' }
  ];
  const resultado = calcularValores(servicos, { porte: 'Pequeno' });
  expect(resultado.valorFinal).toBe(50);
});

test('não deve permitir agendar tosa sem banho', () => {
  expect(validarDependenciasServicos(['tosa'])).toBe(false);
});
