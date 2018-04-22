var st = require('stompit')

function Stompit() {
    this.host = 'localhost',
        this.port = 61613,
        this.min = 0,
        this.max = 1,
        this.increments = 1,
        this.forceTemp = false,
        this.forcedTemp = 0,
        this.actualTemp = 0
}
Stompit.prototype.setValues = function (min, max) {
    this.max = max
    this.min = min
    this.increments = parseFloat((max - min) / 10).toFixed(2)
    this.actualTemp = parseInt(min) + parseInt(this.increments)
}
Stompit.prototype.connect = function (topicWrite, topicRead) {
    var connectOptions = {
        'host': this.host,
        'port': this.port
    }
    var that = this
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
                client.ack(message)
                that.forceTemp = true
                that.forcedTemp = parseInt(body)
                if (that.forcedTemp > that.actualTemp)
                    that.increments = Math.abs(that.increments)
                else
                    that.increments = Math.abs(that.increments) * (-1)
            })
        })
        var lapsetime = setInterval(function () {
            if (that.forceTemp) {
                that.actualTemp = that.actualTemp + that.increments
                console.log("Forzando incremento [" + that.forcedTemp + "]: " + that.actualTemp + " " + that.increments)
                if (that.actualTemp - Math.abs(that.increments) <= that.forcedTemp) {
                    console.log("Incremento objetivo alcanzado")
                    that.forceTemp = false
                }
            } else {
                var nextTemp = Math.floor(Math.random() * (that.max - (that.min)) + (that.min))
                that.actualTemp += parseInt(nextTemp / 20)
            }
            var frame = client.send(sendHeaders)
            frame.write(that.actualTemp.toString())
            frame.end()
        }, 2000)
    })
}

var stompit = new Stompit()
module.exports = stompit