'use strict';

const initializeWasm = require('./primes.js');

(async () => {
  const Module = await initializeWasm();

  Module.ccall('PrintPrimes', 'void', ['number'], [200]);
})();
