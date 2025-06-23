import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuració del test
export const options = {
  insecureSkipTLSVerify: true,
  stages: [
    { duration: '30s', target: 10 }, // Rampa fins a 10 usuaris en 30s
    { duration: '1m', target: 10 },  // Mantenir 10 usuaris per 1 minut
    { duration: '30s', target: 0 },  // Baixar a 0 usuaris en 30s
  ],
};

export default function () {
  // Canvia aquesta URL per la de la teva API
  const response = http.get('https://reservesapi');
  
  // Verificacions
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  
  // Pausa entre requests
  sleep(1);
}
