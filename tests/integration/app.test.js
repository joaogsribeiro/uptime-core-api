import request from 'supertest';
import app from '../../src/app.js'; // Ajuste o caminho se a sua pasta de testes for em outro nível

describe('Testes de Integração do Servidor (app.js)', () => {
  it('deve retornar o objeto de apresentação da API na rota /api', async () => {
    const response = await request(app).get('/api');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('name', 'UptimeCore API');
    expect(response.body).toHaveProperty('version');
  });

  it('deve retornar status ok e um timestamp na rota /api/health', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
    // Verifica se a string do timestamp foi gerada
    expect(typeof response.body.timestamp).toBe('string');
  });

  it('deve retornar erro 404 ao tentar acessar uma rota inexistente', async () => {
    const randomRoute = '/rota-inexistente-123';
    const response = await request(app).get(randomRoute);

    expect(response.status).toBe(404);

    // Correção: Valida o padrão JSend de falhas do cliente (4xx)
    expect(response.body).toHaveProperty('status', 'fail');

    expect(response.body.message).toMatch(new RegExp(randomRoute));
  });
});
