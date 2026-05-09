import axios from 'axios';

class PingService {
  /**
   * Executa um ping HTTP em uma URL fornecida.
   * Retorna um objeto contendo o status, o tempo de resposta e se houve falha.
   */
  async execute(url) {
    const startTime = Date.now();

    try {
      // Configuramos um timeout de 10 segundos. Se o site demorar mais que isso, consideramos fora do ar.
      const response = await axios.get(url, {
        timeout: 10000, 
        // Não queremos baixar o HTML inteiro da página para economizar memória do servidor,
        // mas alguns sites bloqueiam requisições HEAD, então usamos GET com um limite de bytes se possível,
        // ou apenas aceitamos o fluxo padrão.
      });

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        statusCode: response.status,
        responseTimeMs: responseTime,
        errorLog: null,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      let errorLog = 'Unknown Error';
      let statusCode = null;

      if (error.response) {
        // O servidor respondeu com um status de erro (ex: 500, 404, 503)
        statusCode = error.response.status;
        errorLog = `HTTP Error ${statusCode}`;
      } else if (error.code === 'ECONNABORTED') {
        // O timeout de 10 segundos foi atingido
        errorLog = 'Timeout (10000ms)';
      } else if (error.request) {
        // A requisição foi feita, mas não houve resposta (ex: DNS não encontrado, servidor desligado)
        errorLog = 'No response from server';
      } else {
        errorLog = error.message;
      }

      return {
        success: false,
        statusCode, // Pode ser null se foi timeout ou erro de rede
        responseTimeMs: responseTime,
        errorLog,
      };
    }
  }
}

export default new PingService();