import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas personalizadas
export let errorRate = new Rate('errors');

// Configuración de la prueba
export let options = {
  stages: [
    { duration: '1m', target: 5 }, // Ramp up
    { duration: '3m', target: 10 }, // Stay at 10 users
    { duration: '1m', target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% de las peticiones deben ser < 2s
    http_req_failed: ['rate<0.1'], // Error rate debe ser < 10%
    errors: ['rate<0.1'],
  },
};

// Configuración base
const BASE_URL = 'https://reservesapi'; // Cambia por tu URL
const DELAY_TIME = 3; // Según el delay que tienes en el código

// Datos de prueba
const testUsers = [
  { id: 1001, nom: 'testuser1', rol: 'estudiant', password: 'test123' },
  { id: 1002, nom: 'testuser2', rol: 'professor', password: 'test456' },
  { id: 1003, nom: 'testuser3', rol: 'estudiant', password: 'test789' },
];

const testMaterials = [
  { id: 2001, descripcio: 'Projector test', imatge: 'projector.jpg' },
  { id: 2002, descripcio: 'Ordinador portàtil test', imatge: 'laptop.jpg' },
  { id: 2003, descripcio: 'Microscopi test', imatge: 'microscope.jpg' },
];

// Función para generar datos de reserva
function generateReserva(idusuari, idmaterial) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  return {
    idusuari: idusuari,
    idmaterial: idmaterial,
    datareserva: today.toISOString().split('T')[0],
    datafinal: tomorrow.toISOString().split('T')[0],
  };
}

// Setup: ejecuta una vez al inicio
export function setup() {
  console.log('🚀 Iniciando setup de datos de prueba...');
  
  // Limpiar datos de prueba anteriores si existen
  cleanup();
  
  // Crear usuarios de prueba
  testUsers.forEach(user => {
    const response = http.post(`${BASE_URL}/usuaris/`, JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status !== 200) {
      console.warn(`⚠️ No se pudo crear usuario ${user.id}: ${response.status}`);
    }
  });
  
  // Crear materiales de prueba
  testMaterials.forEach(material => {
    const response = http.post(`${BASE_URL}/materials/`, JSON.stringify(material), {
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (response.status !== 200) {
      console.warn(`⚠️ No se pudo crear material ${material.id}: ${response.status}`);
    }
  });
  
  sleep(1);
  console.log('✅ Setup completado');
  
  return { users: testUsers, materials: testMaterials };
}

// Función principal de prueba
export default function(data) {
  const user = data.users[Math.floor(Math.random() * data.users.length)];
  const material = data.materials[Math.floor(Math.random() * data.materials.length)];
  
  // 1. Probar endpoint raíz
  testHomePage();
  
  // 2. Probar autenticación/login
  testLogin(user);
  
  // 3. Probar operaciones de usuarios
  testUserOperations(user);
  
  // 4. Probar operaciones de materiales
  testMaterialOperations(material);
  
  // 5. Probar operaciones de reservas
  testReservaOperations(user, material);
  
  sleep(1);
}

function testHomePage() {
  const response = http.get(`${BASE_URL}/`);
  
  check(response, {
    '✅ Home page status 200': (r) => r.status === 200,
    '✅ Home page contains message': (r) => r.json().message !== undefined,
  }) || errorRate.add(1);
}

function testLogin(user) {
  const response = http.get(`${BASE_URL}/login/${user.nom}`);
  
  check(response, {
    '✅ Login successful': (r) => r.status === 200,
    '✅ Login returns user data': (r) => r.json().id !== undefined,
    '✅ Login returns correct nom': (r) => r.json().nom === user.nom,
  }) || errorRate.add(1);
}

function testUserOperations(user) {
  // Obtener usuario por ID
  const getUserResponse = http.get(`${BASE_URL}/usuaris/${user.id}`);
  
  check(getUserResponse, {
    '✅ Get user by ID successful': (r) => r.status === 200,
    '✅ Get user returns correct data': (r) => r.json().id === user.id,
  }) || errorRate.add(1);
}

function testMaterialOperations(material) {
  // Obtener todos los materiales
  const getAllMaterialsResponse = http.get(`${BASE_URL}/materials/`);
  
  check(getAllMaterialsResponse, {
    '✅ Get all materials successful': (r) => r.status === 200,
    '✅ Get all materials returns array': (r) => Array.isArray(r.json()),
  }) || errorRate.add(1);
  
  // Obtener material específico
  const getMaterialResponse = http.get(`${BASE_URL}/materials/${material.id}`);
  
  check(getMaterialResponse, {
    '✅ Get material by ID successful': (r) => r.status === 200,
    '✅ Get material returns correct data': (r) => r.json().id === material.id,
  }) || errorRate.add(1);
  
  // Probar actualización de material
  const updatedMaterial = {
    ...material,
    descripcio: material.descripcio + ' - Updated'
  };
  
  const updateResponse = http.put(
    `${BASE_URL}/materials/${material.id}`,
    JSON.stringify(updatedMaterial),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(updateResponse, {
    '✅ Update material successful': (r) => r.status === 200,
  }) || errorRate.add(1);
}

function testReservaOperations(user, material) {
  const reserva = generateReserva(user.id, material.id);
  
  // Crear reserva
  const createResponse = http.post(
    `${BASE_URL}/reserves/`,
    JSON.stringify(reserva),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(createResponse, {
    '✅ Create reserva successful': (r) => r.status === 200,
  }) || errorRate.add(1);
  
  if (createResponse.status === 200) {
    // Obtener reservas del usuario (endpoint con delay)
    const startTime = Date.now();
    const getReservasResponse = http.get(`${BASE_URL}/reserves/usuari/${user.id}`);
    const duration = Date.now() - startTime;
    
    check(getReservasResponse, {
      '✅ Get user reservas successful': (r) => r.status === 200,
      '✅ Get user reservas returns array': (r) => Array.isArray(r.json()),
      [`✅ Response time accounts for delay (~${DELAY_TIME}s)`]: () => duration >= (DELAY_TIME * 1000 - 500),
    }) || errorRate.add(1);
    
    // Obtener reserva específica
    const getReservaResponse = http.get(
      `${BASE_URL}/reserves/${reserva.idusuari}/${reserva.idmaterial}/${reserva.datareserva}`
    );
    
    check(getReservaResponse, {
      '✅ Get specific reserva successful': (r) => r.status === 200,
      '✅ Get specific reserva returns correct data': (r) => 
        r.json().idusuari === reserva.idusuari && 
        r.json().idmaterial === reserva.idmaterial,
    }) || errorRate.add(1);
    
    // Actualizar reserva
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const updatedReserva = {
      ...reserva,
      datafinal: tomorrow.toISOString().split('T')[0]
    };
    
    const updateReservaResponse = http.put(
      `${BASE_URL}/reserves/${reserva.idusuari}/${reserva.idmaterial}/${reserva.datareserva}`,
      JSON.stringify(updatedReserva),
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    check(updateReservaResponse, {
      '✅ Update reserva successful': (r) => r.status === 200,
    }) || errorRate.add(1);
    
    // Eliminar reserva
    const deleteReservaResponse = http.del(
      `${BASE_URL}/reserves/${reserva.idusuari}/${reserva.idmaterial}/${reserva.datareserva}`
    );
    
    check(deleteReservaResponse, {
      '✅ Delete reserva successful': (r) => r.status === 200,
    }) || errorRate.add(1);
  }
}

// Teardown: ejecuta una vez al final
export function teardown(data) {
  console.log('🧹 Iniciando limpieza de datos de prueba...');
  cleanup();
  console.log('✅ Limpieza completada');
}

function cleanup() {
  // Eliminar datos de prueba (reservas primero por FK constraints)
  testUsers.forEach(user => {
    testMaterials.forEach(material => {
      const today = new Date().toISOString().split('T')[0];
      http.del(`${BASE_URL}/reserves/${user.id}/${material.id}/${today}`);
    });
  });
  
  // Eliminar materiales de prueba
  testMaterials.forEach(material => {
    http.del(`${BASE_URL}/materials/${material.id}`);
  });
  
  // Nota: No eliminamos usuarios ya que no hay endpoint DELETE para usuarios
  // en tu API actual
}

// Función para pruebas de stress específicas
export function stressTest() {
  const options = {
    stages: [
      { duration: '30s', target: 20 },
      { duration: '1m', target: 50 },
      { duration: '30s', target: 0 },
    ],
  };
  
  return options;
}

// Función para pruebas de spike
export function spikeTest() {
  const options = {
    stages: [
      { duration: '10s', target: 5 },
      { duration: '30s', target: 100 }, // Spike súbito
      { duration: '1m', target: 5 },
      { duration: '10s', target: 0 },
    ],
  };
  
  return options;
}