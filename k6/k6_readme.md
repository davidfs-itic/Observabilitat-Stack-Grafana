# 🧪 K6 Test Suite - API Reserves

Suite completa de pruebas de rendimiento para tu API de FastAPI con reservas de materiales.

## 📋 Índice

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Estructura de archivos](#estructura-de-archivos)
- [Uso básico](#uso-básico)
- [Tipos de pruebas](#tipos-de-pruebas)
- [Configuración](#configuración)
- [Métricas y reportes](#métricas-y-reportes)
- [Solución de problemas](#solución-de-problemas)

## 🔧 Requisitos

- **K6** instalado ([Guía de instalación](https://k6.io/docs/getting-started/installation/))
- **API FastAPI** corriendo (por defecto en `http://localhost:8000`)
- **Base de datos** configurada y accesible
- **Curl** (para verificar conectividad)

## 📦 Instalación

### 1. Instalar K6

#### Ubuntu/Debian:
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

#### macOS:
```bash
brew install k6
```

#### Windows:
Descarga desde [k6.io](https://k6.io/docs/getting-started/installation/#windows)

### 2. Preparar archivos de prueba

Guarda los archivos proporcionados:
- `test-api-reserves.js` - Script principal de pruebas
- `scenarios.js` - Configuraciones avanzadas
- `run-tests.sh` - Script de ejecución automatizada

```bash
# Hacer ejecutable el script de bash
chmod +x run-tests.sh
```

## 📁 Estructura de archivos

```
k6-tests/
├── test-api-reserves.js    # Script principal de pruebas
├── scenarios.js            # Configuraciones de escenarios
├── run-tests.sh           # Script automatizado de ejecución
├── README.md              # Esta documentación
└── results/               # Directorio para resultados (crear)
    ├── reports/
    └── metrics/
```

## 🚀 Uso básico

### Opción 1: Ejecutar con script automatizado (Recomendado)

```bash
# Prueba básica de funcionalidad
./run-tests.sh smoke

# Prueba de carga normal
./run-tests.sh load

# Prueba de estrés
./run-tests.sh stress --output results/stress-test.json --html

# Usar URL personalizada
./run-tests.sh load --url http://mi-servidor:8000
```

### Opción 2: Ejecutar K6 directamente

```bash
# Prueba básica (1 usuario, 30 segundos)
k6 run --vus 1 --duration 30s test-api-reserves.js

# Prueba de carga (configuración por defecto del script)
k6 run test-api-reserves.js

# Prueba con métricas en archivo
k6 run --out json=results.json test-api-reserves.js

# Prueba con variables personalizadas
BASE_URL=http://localhost:8080 k6 run test-api-reserves.js
```

## 🎯 Tipos de pruebas

### 1. **Smoke Test** 🔥
- **Propósito**: Verificación rápida de funcionalidad básica
- **Configuración**: 1 usuario, 30 segundos
- **Uso**: `./run-tests.sh smoke`

### 2. **Load Test** ⚖️
- **Propósito**: Comportamiento bajo carga normal esperada
- **Configuración**: Rampa hasta 10 usuarios, 5 minutos
- **Uso**: `./run-tests.sh load`

### 3. **Stress Test** 💪
- **Propósito**: Encontrar límites del sistema
- **Configuración**: Rampa hasta 50 usuarios
- **Uso**: `./run-tests.sh stress`

### 4. **Spike Test** ⚡
- **Propósito**: Comportamiento ante picos súbitos
- **Configuración**: Pico a 100 usuarios
- **Uso**: `./run-tests.sh spike`

### 5. **Endurance Test** 🏃
- **Propósito**: Estabilidad a largo plazo
- **Configuración**: 10 usuarios, 10 minutos
- **Uso**: `./run-tests.sh endurance`

## ⚙️ Configuración

### Variables de entorno

```bash
# URL base de la API
export BASE_URL="http://localhost:8000"

# Archivo de salida para métricas
export OUTPUT_FILE="results/test-$(date +%Y%m%d_%H%M%S).json"

# Nivel de debugging
export K6_LOG_LEVEL="debug"
```

### Personalizar datos de prueba

En `test-api-reserves.js`, modifica las variables:

```javascript
// Datos de usuarios de prueba
const testUsers = [
  { id: 1001, nom: 'testuser1', rol: 'estudiant', password: 'test123' },
  // Agrega más usuarios según necesites
];

// Datos de materiales de prueba
const testMaterials = [
  { id: 2001, descripcio: 'Mi material', imatge: 'imagen.jpg' },
  // Agrega más materiales según necesites
];
```

### Ajustar umbrales de rendimiento

```javascript
export let options = {
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% < 2s
    http_req_failed: ['rate<0.1'],     // Errores < 10%
    errors: ['rate<0.1'],              // Errores personalizados < 10%
  },
};
```

## 📊 Métricas y reportes

### Métricas clave monitoreadas

- **http_req_duration**: Tiempo de respuesta de las peticiones HTTP
- **http_req_failed**: Tasa de errores HTTP
- **http_reqs**: Número total de peticiones
- **vus**: Usuarios virtuales activos
- **checks**: Verificaciones de funcionalidad

### Generar reportes

```bash
# Reporte JSON
./run-tests.sh load --output results/load-test.json

# Reporte HTML
./run-tests.sh load --html

# Ambos
./run-tests.sh stress --output results/stress.json --html
```

### Interpretar resultados

#### ✅ Resultados buenos:
- p95 de tiempo de respuesta < 2000ms
- Tasa de errores < 5%
- Todos los checks pasan > 95%

#### ⚠️ Resultados preocupantes:
- p95 > 2000ms (revisar rendimiento)
- Tasa de errores > 5% (revisar logs)
- Checks < 95% (revisar funcionalidad)

#### ❌ Resultados críticos:
- p95 > 5000ms
- Tasa de errores > 10%
- Checks < 90%

## 🔍 Características específicas

### Endpoint con delay
El endpoint `/reserves/usuari/{id}` tiene un delay de 3 segundos simulado. Las pruebas lo tienen en cuenta:

```javascript
// En test-api-reserves.js
const DELAY_TIME = 3; // Tiempo de delay en segundos

// Los umbrales se ajustan acordemente
check(response, {
  [`✅ Response time accounts for delay (~${DELAY_TIME}s)`]: 
    () => duration >= (DELAY_TIME * 1000 - 500),
});
```

### Instrumentación OpenTelemetry
Tu API tiene OpenTelemetry configurado. Los tests generarán trazas que puedes ver en tu sistema de observabilidad.

### Setup y Teardown automáticos
Las pruebas:
1. **Setup**: Crean datos de prueba (usuarios y materiales)
2. **Ejecutan**: Realizan las pruebas
3. **Teardown**: Limpian los datos de prueba

## 🐛 Solución de problemas

### Error: "No se puede conectar con la API"

```bash
# Verificar que la API esté corriendo
curl http://localhost:8000/

# Verificar que el puerto sea correcto
./run-tests.sh smoke --url http://localhost:TU_PUERTO
```

### Error: "K6 no está instalado"

```bash
# Verificar instalación
k6 version

# Reinstalar si es necesario (Ubuntu)
sudo apt-get install k6
```

### Errores de base de datos

1. Verificar que la base de datos esté accesible
2. Comprobar que las tablas existan (`usuaris`, `materials`, `reserves`)
3. Verificar permisos de la base de datos

### Tests fallan por datos existentes

```bash
# Los tests incluyen limpieza automática, pero si fallan:
# Conectar a la base de datos y limpiar manualmente
DELETE FROM reserves WHERE idusuari BETWEEN 1001 AND 1003;
DELETE FROM materials WHERE id BETWEEN 2001 AND 2003;
# No elimines usuarios porque no hay endpoint DELETE
```

### Rendimiento inesperado

1. **Revisar logs de la aplicación** durante las pruebas
2. **Monitorear recursos** del servidor (CPU, memoria, I/O)
3. **Ajustar número de usuarios** virtuales si el servidor no puede manejar la carga
4. **Verificar configuración de la BD** (índices, queries lentas)

## 📈 Ejemplos de comandos avanzados

### Prueba específica de endpoint

```bash
# Solo probar autenticación
k6 run --env ENDPOINT=auth test-api-reserves.js

# Solo probar materiales
k6 run --env ENDPOINT=materials test-api-reserves.js
```

### Prueba con configuración personalizada

```bash
# Usar configuración de scenarios.js
k6 run --config scenarios.js test-api-reserves.js
```

### Integración con CI/CD

```bash
#!/bin/bash
# ci-test.sh
set -e

echo "Running API performance tests..."

# Prueba smoke como gate de calidad
./run-tests.sh smoke --output ci-smoke.json

# Si smoke pasa, ejecutar prueba de carga
if [ $? -eq 0 ]; then
    ./run-tests.sh load --output ci-load.json
    
    # Procesar resultados para CI
    if [ $? -eq 0 ]; then
        echo "✅ All tests passed"
        exit 0
    else
        echo "❌ Load test failed"
        exit 1
    fi
else
    echo "❌ Smoke test failed"
    exit 1
fi
```

## 📝 Personalización avanzada

### Añadir nuevos endpoints

1. Modifica `test-api-reserves.js`
2. Añade función de prueba:

```javascript
function testNewEndpoint() {
  const response = http.get(`${BASE_URL}/mi-nuevo-endpoint`);
  
  check(response, {
    '✅ New endpoint works': (r) => r.status === 200,
  }) || errorRate.add(1);
}
```

3. Llama la función en `export default function()`

### Modificar datos de prueba

Edita las constantes al inicio de `test-api-reserves.js`:

```javascript
const testUsers = [
  // Tus usuarios personalizados
];

const testMaterials = [
  // Tus materiales personalizados
];
```

---

## 🤝 Contribuir

Si encuentras bugs o quieres mejorar las pruebas:

1. Documenta el problema o mejora
2. Modifica los archivos correspondientes
3. Prueba los cambios
4. Comparte las mejoras

---

**¡Felices pruebas de rendimiento!** 🚀