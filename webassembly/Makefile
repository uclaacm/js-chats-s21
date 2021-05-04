EMCC ?= docker run --rm -v $$(pwd):/src -u $$(id -u):$$(id -g) emscripten/emsdk emcc

.PHONY: primes-main
primes-main: primes.c
	$(EMCC) $< -o primes.html

.PHONY: primes-ccall primes-cwrap
primes-ccall primes-cwrap: primes.c
	$(EMCC) $< -o primes.js                                           \
		-s MODULARIZE                                             \
    		-s EXPORTED_FUNCTIONS='["_FindAllPrimes","_PrintPrimes"]' \
    		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'

.PHONY: primes-direct
primes-direct: primes.c
	$(EMCC) $< -o primes.js                                                             \
		-s MODULARIZE                                                               \
    		-s EXPORTED_FUNCTIONS='["_FindAllPrimes","_PrintPrimes","_malloc","_free"]' \
    		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]'

.PHONY: clean
clean:
	rm -f primes.html primes.js primes.wasm
