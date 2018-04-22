var oficina = process.argv[2]
var servicio = process.argv[3]
var min = parseInt(process.argv[4])
var max = parseInt(process.argv[5])
if(!oficina || !servicio || !min || !max || min=='NaN' || max=='NaN'){
    console.log('Necesitas pasar por parámetro el nombre de la oficina y el servicio, el min y el max')
    return 0
}
servicio = servicio.charAt(0).toUpperCase()+servicio.slice(1)

var stompit = require('./src/stompit-oficina-generic.js');

stompit.setValues(min, max)
stompit.connect('/topic/'+oficina+'.lecturas'+servicio,'/topic/'+oficina+'.actuador'+servicio)