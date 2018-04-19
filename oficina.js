var stompit = require('./stompit-oficina-generic.js');

var oficina = process.argv[2]
if(!oficina){
    console.log('Necesitas pasar por parámetro el nombre de la oficina.')
    return 0
}

stompit.connect('/topic/'+oficina+'.lecturasIluminacion','/topic/'+oficina+'.lecturasIluminacion')