var st = require('stompit')

var connectOptions = {
    'host': 'localhost',
    'port': 61613
}

//TODO: esta consola lee las temperaturas de cada oficina, si se salen de rango, publica un mensaje con la temperatura que deben alcanzar
st.connect(connectOptions, function (error, client) {
    if (error) {
        console.log('connect error ' + error.message)
        return;
    }
    var sendHeaders = {
        'destination': topicWrite,
        'content-type': 'text/plain'
    }
    var subscribeHeaders = {
        'destination': topicRead,
        'ack': 'client-individual'
    }
    var actualTemp = 20
    client.subscribe(subscribeHeaders, function (error, message) {
        if (error) {
            console.log('subscribe error ' + error.message)
            return;
        }
        message.readString('utf-8', function (error, body) {
            if (error) {
                console.log('read message error ' + error.message)
                return;
            }
            console.log('received message: ' + body)
            client.ack(message)
        })
    })
    var lapsetime = setInterval(function () {
        var nextTemp = Math.floor(Math.random() * (5 - (-2)) + (-2))
        actualTemp += nextTemp
        var frame = client.send(sendHeaders)
        frame.write(JSON.stringify({ 'actualTemp': actualTemp }))
        frame.end()
    }, 2000)
})