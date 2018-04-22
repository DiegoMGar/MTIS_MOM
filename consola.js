var st = require("stompit")
var express = require("express")
var bp = require("body-parser")
var cors = require("cors")

app = express()
app.use(bp.json())
app.use(cors())

var apiversion = "1.0.0"
var msgQueues = {}
var control = new Array()
var listsLength = 20

var connectOptions = {
    "host": "localhost",
    "port": 61613
}

var suscripciones = {
    "oficina1Iluminacion": "/topic/oficina1.lecturasIluminacion",
    "oficina2Iluminacion": "/topic/oficina2.lecturasIluminacion",
    "oficina1Temperatura": "/topic/oficina1.lecturasTemperatura",
    "oficina2Temperatura": "/topic/oficina2.lecturasTemperatura"
}
for (var i in suscripciones) {
    msgQueues[i] = new Array()
}

var publicaciones = {
    "oficina1Iluminacion": "/topic/oficina1.actuadorIluminacion",
    "oficina2Iluminacion": "/topic/oficina2.actuadorIluminacion",
    "oficina1Temperatura": "/topic/oficina1.actuadorTemperatura",
    "oficina2Temperatura": "/topic/oficina2.actuadorTemperatura"
}

function sendMsg(client, destination, message) {
    var headers = {
        "destination": destination,
        "content-type": "text/plain"
    }
    var frame = client.send(headers)
    frame.write(message)
    frame.end()
}

function controladorValores(client, nombre, valor) {
    var reglas = new Array(
        { "regex": "iluminacion", "reglas": { "min": 200, "max": 1000 } },
        { "regex": "temperatura", "reglas": { "min": 0, "max": 50 } }
    )
    for (var i of reglas) {
        var regex = new RegExp(i.regex, "i")
        if (regex.test(nombre)) {
            if (valor > i.reglas.max || valor < i.reglas.min) {
                sendMsg(client, publicaciones[nombre], parseInt(i.reglas.max / 2).toString())
            }
            break;
        }
    }
}

function suscribe(client, nombre, topic) {
    client.subscribe(topic, function (err, new_message) {
        if (err) { console.log("subscribe error " + err.message); return; }
        new_message.readString("utf-8", function (err, body) {
            body = parseInt(body)
            if (err) { console.log("subscribe error " + err.message); return; }
            console.log("Msg recibido [" + topic + "]: " + body)
            msgQueues[nombre].push(body)
            if (msgQueues[nombre].length > listsLength)
                msgQueues[nombre] = msgQueues[nombre].slice(1)
            controladorValores(client, nombre, body)
        })
    })
    setInterval(function () {
        if (control.length > 0) {
            var order = control.pop()
            sendMsg(client, order.topic, order.value)
        }
    }, 2000)
}

//TODO: esta consola lee las temperaturas de cada oficina, si se salen de rango, publica un mensaje con la temperatura que deben alcanzar
st.connect(connectOptions, function (error, client) {
    if (error) {
        console.log("connect error " + error.message)
        return;
    }
    for (var i in suscripciones) {
        suscribe(client, i, suscripciones[i])
    }
})

//FUNCIONAMIENTO DE LA API
app.get("/", function (req, resp) {
    resp.send("Versión más reciente de la API: " + apiversion)
})

app.get("/topics", function (req, resp) {
    resp.send(Object.keys(suscripciones))
})

app.get("/messages/:msg", function (req, resp) {
    var msg = req.params.msg
    console.log("Requested message from: " + msg)
    if (Array.isArray(msgQueues[msg])) {
        resp.send(JSON.stringify({"topic":msg, "list":msgQueues[msg]}))
    } else {
        resp.status(404)
        resp.end()
    }
})

app.post("/forcevalue", function (req, resp) {
    var body = req.body
    if (!body.value || !body.topic) {
        resp.status(500)
        resp.end()
    } else {
        console.log("Force value [" + body.topic + "]: " + body.value)
        control.push({ "topic": body.topic, "value": body.value })
        resp.status(201)
        resp.end()
    }
})

app.listen(3000, function () {
    console.log("El servidor express está en el puerto 3000")
})