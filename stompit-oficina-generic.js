var st = require('stompit')

function Stompit() {
    this.host = 'localhost'
    this.port = 61613
}

Stompit.prototype.connect = function (topicWrite, topicRead) {
    var connectOptions = {
        'host': this.host,
        'port': this.port
    }
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
}

var stompit = new Stompit()
module.exports = stompit