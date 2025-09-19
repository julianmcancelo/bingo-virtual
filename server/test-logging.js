const axios = require('axios');

// Configuration
const API_BASE_URL = 'https://bingo-virtual.onrender.com/api/v';
const TEST_GAME_ID = `test_${Date.now()}`;
const TEST_PARTIDA_ID = `partida_${Date.now()}`;

// Test data
const testEvent = {
  partidaId: TEST_PARTIDA_ID,
  eventos: [
    {
      tipo: 'test',
      mensaje: 'Mensaje de prueba',
      datos: { test: true, value: 123 },
      timestamp: new Date().toISOString()
    },
    {
      tipo: 'game_event',
      mensaje: 'Jugador completó una línea',
      datos: { playerId: 'test_player_1', lines: 1 },
      timestamp: new Date().toISOString()
    }
  ]
};

async function testLogging() {
  try {
    console.log('Testing logging endpoint...');
    console.log(`Using game ID: ${TEST_GAME_ID}`);
    console.log(`Using partida ID: ${TEST_PARTIDA_ID}`);
    
    // Test CORS preflight
    console.log('\nTesting CORS preflight...');
    try {
      const preflightResponse = await axios.options(
        `${API_BASE_URL}/games/${TEST_GAME_ID}/logs`,
        {
          headers: {
            'Origin': 'https://bingo-aled3.vercel.app',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type'
          }
        }
      );
      console.log('CORS Preflight Response:', {
        status: preflightResponse.status,
        headers: preflightResponse.headers
      });
    } catch (error) {
      console.error('CORS Preflight Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }

    // Test actual log saving
    console.log('\nSending test log data...');
    const response = await axios.post(
      `${API_BASE_URL}/games/${TEST_GAME_ID}/logs`,
      testEvent,
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://bingo-aled3.vercel.app'
        },
        withCredentials: true
      }
    );

    console.log('Log Save Response:', {
      status: response.status,
      data: response.data
    });
    
    console.log('\n✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      response: {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      },
      stack: error.stack
    });
  }
}

// Run the test
testLogging();
