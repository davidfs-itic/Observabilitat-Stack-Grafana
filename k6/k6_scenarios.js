// scenarios.js - Configuraciones avanzadas para diferentes escenarios de prueba

import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

// Configuración para pruebas con múltiples escenarios
export const scenarioOptions = {
  // Escenario completo con múltiples tipos de usuarios
  multiScenario: {
    scenarios: {
      // Usuarios normales navegando
      normal_users: {
        executor: 'ramping-vus',
        startVUs: 0,
        stages: [
          { duration: '1m', target: 5 },
          { duration: '5m', target: 10 },
          { duration: '1m', target: 0 },
        ],
        gracefulRampDown: '30s',
        tags: { test_type: 'normal_usage' },
      },
      
      // Administradores haciendo operaciones CRUD intensivas
      admin_users: {
        executor: 'constant-vus',
        vus: 2,
        duration: '6m',
        tags: { test_type: 'admin_operations' },
        env: { USER_TYPE: 'admin' },
      },
      
      // Picos de carga simulando horarios punta
      peak_load: {
        executor: 'ramping-arrival-rate',
        startRate: 0,
        timeUnit: '1s',
        preAllocatedVUs: 20,
        stages: [
          { duration: '2m', target: 5 },  // Subida gradual
          { duration: '1m', target: 20 }, // Pico
          { duration: '2m', target: 5 },  // Bajada
        ],
        tags: { test_type: 'peak_hours' },
      },
    },
    
    thresholds: {
      'http_req_duration{test_type:normal_usage}': ['p(95)<1500'],
      'http_req_duration{test_type:admin_operations}': ['p(95)<2000'],
      'http_req_duration{test_type:peak_hours}': ['p(95)<3000'],
      'http_req_failed': ['rate<0.05'],
      'checks': ['rate>0.95'],
    },
  },

  // Configuración para pruebas de smoke (verificación rápida)
  smoke: {
    vus: 1,
    duration: '1m',
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<2000'],
    },
  },

  // Configuración para pruebas de carga
  load: {
    stages: [
      { duration: '2m', target: 5 },
      { duration: '5m', target: 10 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.1'],
    },
  },

  // Configuración para pruebas de estrés
  stress: {
    stages: [
      { duration: '1m', target: 10 },
      { duration: '2m', target: 20 },
      { duration: '2m', target: 30 },
      { duration: '2m', target: 40 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<3000'],
      http_req_failed: ['rate<0.2'],
    },
  },

  // Configuración para pruebas de picos
  spike: {
    stages: [
      { duration: '30s', target: 5 },
      { duration: '1m', target: 100 }, // Pico súbito
      { duration: '3m', target: 5 },
      { duration: '30s', target: 0 },
    ],
    thresholds: {
      http_req_duration: ['p(95)<5000'],
      http_req_failed: ['rate<0.3'],
    },
  },

  // Configuración para pruebas de volumen/resistencia
  volume: {
    vus: 20,
    duration: '30m',
    thresholds: {
      http_req_duration: ['p(95)<2000'],
      http_req_failed: ['rate<0.1'],
    },
  },

  // Configuración para pruebas de capacidad
  capacity: {
    executor: 'ramping-arrival-rate',
    startRate: 1,
    timeUnit: '1s',
    preAllocatedVUs: 100,
    stages: [
      { duration: '5m', target: 10 },
      { duration: '10m', target: 20 },
      { duration: '10m', target: 30 },
      { duration: '5m', target: 0 },
    ],
  },
};

// Configuración de métricas personalizadas para diferentes escenarios
export const customMetrics = {
  // Métricas específicas para reservas (considerando el delay de 3s)
  reserva_operations: {
    thresholds: {
      'http_req_duration{endpoint:reserves}': ['p(95)<5000'], // Considerando el delay
      'http_req_duration{endpoint:reserves_user}': ['p(95)<5000'],
    },
  },
  
  // Métricas para operaciones de materiales
  material_operations: {
    thresholds: {
      'http_req_duration{endpoint:materials}': ['p(95)<1000'],
      'http_req_duration{endpoint:materials_crud}': ['p(95)<1500'],
    },
  },
  
  // Métricas para autenticación
  auth_operations: {
    thresholds: {
      'http_req_duration{endpoint:login}': ['p(95)<500'],
      'http_req_failed{endpoint:login}': ['rate<0.01'],
    },
  },
};

// Función para generar resumen personalizado
export function handleSummary(data) {
  const summary = {
    'summary.json': JSON.stringify(data, null, 2),
    'summary.html': generateHTMLReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
  
  // Si hay un archivo de salida especificado en variables de entorno
  if (__ENV.OUTPUT_FILE) {
    summary[__ENV.OUTPUT_FILE] = JSON.stringify(data, null, 2);
  }
  
  return summary;
}

// Función para generar reporte HTML personalizado
function generateHTMLReport(data) {
  const metrics = data.metrics;
  const checks = data.checks;
  
  return `
<!DOCTYPE html>
<html>
<head>
    <title>K6 Test Report - API Reserves</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
        .metric-title { font-weight: bold; color: #333; margin-bottom: 10px; }
        .metric-value { font-size: 1.2em; color: #007bff; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 K6 Test Report - API Reserves</h1>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Duración:</strong> ${Math.round(data.state.testRunDurationMs / 1000)}s</p>
    </div>
    
    <div class="metrics">
        <div class="metric-card">
            <div class="metric-title">HTTP Requests</div>
            <div class="metric-value">${metrics.http_reqs.count}</div>
            <small>Rate: ${metrics.http_reqs.rate.toFixed(2)}/s</small>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Response Time (avg)</div>
            <div class="metric-value">${metrics.http_req_duration.avg.toFixed(2)}ms</div>
            <small>p95: ${metrics.http_req_duration['p(95)'].toFixed(2)}ms</small>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Error Rate</div>
            <div class="metric-value ${metrics.http_req_failed.rate > 0.1 ? 'error' : 'success'}">
                ${(metrics.http_req_failed.rate * 100).toFixed(2)}%
            </div>
            <small>${metrics.http_req_failed.fails}/${metrics.http_reqs.count} failed</small>
        </div>
        
        <div class="metric-card">
            <div class="metric-title">Virtual Users</div>
            <div class="metric-value">${metrics.vus.max}</div>
            <small>Max concurrent</small>
        </div>
    </div>
    
    <h2>🔍 Checks Results</h2>
    <table>
        <thead>
            <tr>
                <th>Check Name</th>
                <th>Passes</th>
                <th>Fails</th>
                <th>Success Rate</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(checks).map(([name, check]) => `
                <tr>
                    <td>${name}</td>
                    <td class="success">${check.passes}</td>
                    <td class="${check.fails > 0 ? 'error' : 'success'}">${check.fails}</td>
                    <td class="${check.rate < 0.95 ? 'warning' : 'success'}">
                        ${(check.rate * 100).toFixed(2)}%
                    </td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>📈 Detailed Metrics</h2>
    <table>
        <thead>
            <tr>
                <th>Metric</th>
                <th>Avg</th>
                <th>Min</th>
                <th>Max</th>
                <th>p90</th>
                <th>p95</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>HTTP Request Duration</td>
                <td>${metrics.http_req_duration.avg.toFixed(2)}ms</td>
                <td>${metrics.http_req_duration.min.toFixed(2)}ms</td>
                <td>${metrics.http_req_duration.max.toFixed(2)}ms</td>
                <td>${metrics.http_req_duration['p(90)'].toFixed(2)}ms</td>
                <td>${metrics.http_req_duration['p(95)'].toFixed(2)}ms</td>
            </tr>
            <tr>
                <td>HTTP Request Waiting</td>
                <td>${metrics.http_req_waiting.avg.toFixed(2)}ms</td>
                <td>${metrics.http_req_waiting.min.toFixed(2)}ms</td>
                <td>${metrics.http_req_waiting.max.toFixed(2)}ms</td>
                <td>${metrics.http_req_waiting['p(90)'].toFixed(2)}ms</td>
                <td>${metrics.http_req_waiting['p(95)'].toFixed(2)}ms</td>
            </tr>
        </tbody>
    </table>
    
    <div style="margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 5px;">
        <h3>💡 Recommendations</h3>
        <ul>
            ${getRecommendations(data).map(rec => `<li>${rec}</li>`).join('')}
        </ul>
    </div>
</body>
</html>
  `;
}

// Función para generar recomendaciones basadas en los resultados
function getRecommendations(data) {
  const recommendations = [];
  const metrics = data.metrics;
  
  // Analizar tiempo de respuesta
  if (metrics.http_req_duration['p(95)'] > 2000) {
    recommendations.push('⚠️ El tiempo de respuesta p95 es superior a 2 segundos. Considera optimizar la base de datos o añadir caching.');
  }
  
  // Analizar tasa de errores
  if (metrics.http_req_failed.rate > 0.05) {
    recommendations.push('❌ La tasa de errores es superior al 5%. Revisa los logs de la aplicación para identificar problemas.');
  }
  
  // Analizar el endpoint de reservas con delay
  if (metrics.http_req_duration.max > 10000) {
    recommendations.push('🐌 Algunos requests tardan más de 10 segundos. El endpoint /reserves/usuari/{id} tiene un delay de 3s, considera si es necesario.');
  }
  
  // Recomendaciones generales
  if (metrics.http_req_duration.avg < 500 && metrics.http_req_failed.rate < 0.01) {
    recommendations.push('✅ Excelente rendimiento! La API responde rápidamente y con pocos errores.');
  }
  
  if (recommendations.length === 0) {
    recommendations.push('👍 Los resultados están dentro de los parámetros aceptables.');
  }
  
  return recommendations;
}

// Configuraciones específicas para diferentes endpoints
export const endpointConfigs = {
  // Configuración específica para probar solo autenticación
  authOnly: {
    vus: 10,
    duration: '2m',
    thresholds: {
      'http_req_duration{endpoint:login}': ['p(95)<500'],
      'http_req_failed{endpoint:login}': ['rate<0.01'],
    },
  },
  
  // Configuración para probar solo operaciones CRUD de materiales
  materialsOnly: {
    vus: 5,
    duration: '3m',
    thresholds: {
      'http_req_duration{endpoint:materials}': ['p(95)<1000'],
      'http_req_failed{endpoint:materials}': ['rate<0.05'],
    },
  },
  
  // Configuración para probar solo reservas (con el delay)
  reservasOnly: {
    vus: 3, // Menos usuarios debido al delay
    duration: '5m',
    thresholds: {
      'http_req_duration{endpoint:reserves}': ['p(95)<5000'],
      'http_req_failed{endpoint:reserves}': ['rate<0.05'],
    },
  },
};

// Función para ejecutar pruebas específicas de endpoint
export function runEndpointTest(endpoint) {
  const config = endpointConfigs[endpoint];
  if (!config) {
    throw new Error(`Endpoint configuration not found: ${endpoint}`);
  }
  return config;
} 