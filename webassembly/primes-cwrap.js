'use strict';

const initializeWasm = require('./primes.js');

(async () => {
  const Module = await initializeWasm();

  const printPrimes = Module.cwrap('PrintPrimes', 'void', ['number']);

  printPrimes(200);
})();
