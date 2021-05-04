#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// FindAllPrimes sets a[p] to true for every prime p < max,
// and set all other a[i] to false.
// a is expected to have length max.
void FindAllPrimes(bool* a, int max) {
  // 0 and 1 are not primes.
  a[0] = false;
  a[1] = false;

  // Sieve of Eratosthenes: first consider all numbers prime, but reverse
  // that decision once we find a way of getting that number through
  // multiplication.

  for (int i = 2; i < max; i++) {
    a[i] = true;
  }

  for (int i = 2; i < max; i++) {
    if (i * i > max) {
      break;
    }
    if (a[i]) {
      for (int j = i * i; j < max; j += i) {
        a[j] = false;
      }
    }
  }
}

// PrintPrimes prints all primes up to (but not including) max.
void PrintPrimes(int max) {
  bool* a = malloc(max * sizeof(bool));
  FindAllPrimes(a, max);
  for (int i = 0; i < max; i++) {
    if (a[i]) {
      printf("Found prime: %d\n", i);
    }
  }
}

int main(void) {
  PrintPrimes(100);
}
