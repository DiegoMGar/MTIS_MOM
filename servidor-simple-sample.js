var stompit = require('stompit');

var connectOptions = {
    'host': 'localhost',
    'port': 61613,
};

stompit.connect(connectOptions, function (error, client) {
    if (error) {
        console.log('connect error ' + error.message);
        return;
    }

    var sendHeaders = {
        'destination': '/topic/lecturasIluminacion',
        'content-type': 'text/plain'
    };

    var subscribeHeaders = {
        'destination': '/topic/lecturasIluminacion',
        'ack': 'client-individual'
    };

    client.subscribe(subscribeHeaders, function (error, message) {

        if (error) {
            console.log('subscribe error ' + error.message);
            return;
        }

        message.readString('utf-8', function (error, body) {

            if (error) {
                console.log('read message error ' + error.message);
                return;
            }

            console.log('received message: ' + body);

            client.ack(message);

            //client.disconnect();
        });
    });
    var frame = client.send(sendHeaders);
    frame.write('hello');
    frame.end();
});