'use strict';

const initializeWasm = require('./primes.js');

// In C, a boolean is stored as a single byte (8-bit integer).
const BYTES_PER_BOOLEAN = 1;

let Module;

async function findAllPrimes(max) {
  if (typeof max !== 'number' || !Number.isSafeInteger(max) || max < 0) {
    throw new TypeError('Invalid max');
  }

  if (Module === undefined) {
    Module = await initializeWasm();
  }

  // Avoid calling malloc(0) since it could return either NULL or a valid
  // pointer.
  if (max === 0) {
    return [];
  }

  // Allocate an array of `max` booleans.
  const ptr = Module._malloc(max * BYTES_PER_BOOLEAN);
  if (!ptr) {
    throw new TypeError('Not enough memory');
  }

  try {
    // Call FindAllPrimes.
    Module._FindAllPrimes(ptr, max);

    // For each i, check if the boolean is false (0) or true (anything else).
    // If it's not 0, then add i to the primes array.
    const primes = [];
    for (let i = 0; i < max; i++) {
      if (Module.HEAP8[ptr + i * BYTES_PER_BOOLEAN] !== 0) {
        primes.push(i);
      }
    }
    return primes;

  } finally {
    // We need to free the memory we allocated earlier.
    // We put this in a `finally` block so that the memory
    // is freed even if an exception is thrown.
    Module._free(ptr);
  }
}

(async () => {
  console.log(await findAllPrimes(300));
})();
