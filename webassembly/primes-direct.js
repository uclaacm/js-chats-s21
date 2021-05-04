'use strict';

const initializeWasm = require('./primes.js');

async function findAllPrimes(max) {
  const Module = await initializeWasm();

  // Allocate an array of `max` booleans.
  const ptr = Module._malloc(max);

  // Call FindAllPrimes.
  Module._FindAllPrimes(ptr, max);

  // For each i, check if the boolean is false (0) or true (anything else).
  // If it's not 0, then add i to the primes array.
  const primes = [];
  for (let i = 0; i < max; i++) {
    if (Module.HEAP8[ptr + i] !== 0) {
      primes.push(i);
    }
  }

  // We need to free the memory we allocated earlier before returning.
  Module._free(ptr);

  return primes;
}

(async () => {
  console.log(await findAllPrimes(300));
})();
