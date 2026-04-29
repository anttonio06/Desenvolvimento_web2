const {
  capitalize,
  telPattern,
  emailPattern,
  normalizarServicos,
  calcularValores,
  validarDependenciasServicos
} = require('../utils/helpers');

test('primeira letra de cada palavra deve ser maiúscula', () => {
  expect(capitalize('joao silva')).toBe('Joao Silva');
});

test('texto todo em maiúsculo deve ser formatado corretamente', () => {
  expect(capitalize('MARIA COSTA')).toBe('Maria Costa');
});

test('telefone celular com DDD é aceito', () => {
  expect(telPattern.test('(11) 91234-5678')).toBe(true);
});

test('telefone com letras é rejeitado', () => {
  expect(telPattern.test('(11) 9abcd-5678')).toBe(false);
});

test('email com .com.br é válido', () => {
  expect(emailPattern.test('usuario@empresa.com.br')).toBe(true);
});

test('email com extensão inválida não é aceito', () => {
  expect(emailPattern.test('usuario@gmail.xyz')).toBe(false);
});

test('retorna array vazio quando recebe null', () => {
  expect(normalizarServicos(null)).toEqual([]);
});

test('converte string em array de um elemento', () => {
  expect(normalizarServicos('1')).toEqual(['1']);
});

test('soma os preços corretamente para porte Pequeno', () => {
  const servicos = [
    { preco_pequeno: '30.00', preco_medio: '50.00', preco_grande: '70.00' },
    { preco_pequeno: '20.00', preco_medio: '40.00', preco_grande: '60.00' }
  ];
  const resultado = calcularValores(servicos, { porte: 'Pequeno' });
  expect(resultado.valorFinal).toBe(50);
});

test('tosa sem banho deve retornar false', () => {
  expect(validarDependenciasServicos(['tosa'])).toBe(false);
});
