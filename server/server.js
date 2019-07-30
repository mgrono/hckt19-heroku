const express = require('express');
const bodyParser = require('body-parser');
const nforce = require('nforce')
const faye = require('faye')
const app = express()
const cors = require('cors');

const server = require('http').Server(app)
const io = require('socket.io')(server)
const config = require('./config.json')

let EVENT_LIST = []; 

app.use(bodyParser.json());
// use it before all route definitions
app.use(cors())



if (process.env.NODE_ENV === 'production') {
    // Exprees will serve up production assets
    app.use(express.static('client/build'));
  
    // Express serve up index.html file if it doesn't recognize route
    const path = require('path');
    app.get('/', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

let bayeux = new faye.NodeAdapter({ mount: '/faye', timeout: 45 });
bayeux.attach(server);
bayeux.on('disconnect', function (clientId) {
    console.log('Bayeux server disconnect');
});

let PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Express server listening on ${PORT}`));

let org = nforce.createConnection({
    clientId: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
    redirectUri: config.CALLBACK_URL,
    environment: config.ENVIRONMENT
});




org.authenticate({ username: config.USERNAME, password: config.PASSWORD }, (err, oauth) => {
    if (err) {
        console.error("Salesforce authentication error");
        return console.log(err);
    } else {
        org.oauth = oauth;
        console.log(`Salesforce authentication successful | ${org.oauth.instance_url}`);
    }
});


let subscribeToPlatformEvents = (event, callback) => {
    console.log('subEvent', EVENT_LIST.length);
    var client = new faye.Client(org.oauth.instance_url + '/cometd/42.0/');
    client.setHeader('Authorization', 'OAuth ' + org.oauth.access_token);
    if(EVENT_LIST.length === 0){
        
        if(config.DEBUG) console.log(`listening to ${event}`);
    
        //unsub event first to be sure that is not subscribed 
        client.subscribe(`/event/${event}__e`, function (message) {
            // Send message to all connected Socket.io clients
            io.of('/').emit(event, message)
            
        });
        
        if(callback) callback(true);
        client.on('transport:down', function () {
            console.error('# Faye client dowwn');
        });
        EVENT_LIST.push(event);
    }else{
        
        client.unsubscribe(`/event/${event}__e`, function(success){
            if(success) io.off(event, success);
        })
        if(callback) callback(false);
        EVENT_LIST = [];
    }
    
};


// routes 
app.get('/event/:eventName', (req, res) => {
    let eventName = req.params.eventName;
    subscribeToPlatformEvents(eventName, resInner => {
            res.status(200).send('success'); 
     });
});

app.post('/event/', (req, res) => {
    let eventName = req.body.eventName,
        data = req.body.data;

    let object = nforce.createSObject(`${eventName}__e`);
    object.set('Message__c', data)

    org.insert({sobject: object, oauth: org.oauth}, err => {
        if(err){
            res.status(400).send(err)
        }else{
            console.log('success')
            res.status(200).send('success')
        }
    })
});


