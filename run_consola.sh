#!/bin/bash
node oficina.js oficina1 iluminacion 200 1000 &
node oficina.js oficina2 iluminacion 200 1000 &
node oficina.js oficina1 temperatura 1 50 &
node oficina.js oficina2 temperatura 1 50 &
node consola.js