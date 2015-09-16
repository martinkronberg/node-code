var webSocketUrl = "wss://api.samsungsami.io/v1.1/websocket?ack=true";
var device_id = "<Your Device ID>";
var device_token = "<Your Device Token>";
var fs = require('fs');

var isWebSocketReady = false;
var ws = null;


var WebSocket = require('ws');

/**
 * Gets the current time in millis
 */
function getTimeMillis(){
    return parseInt(Date.now().toString());
}

/**
 * Create a /websocket bi-directional connection 
 */
function start() {
    //Create the websocket connection
    isWebSocketReady = false;
    ws = new WebSocket(webSocketUrl);
    ws.on('open', function() {
        console.log("Websocket connection is open ....");
        register();
    });
    ws.on('message', function(data, flags) {
        console.log("Received message: " + data + '\n');
    });
    ws.on('close', function() {
        console.log("Websocket connection is closed ....");
    });
}

/**
 * Sends a register message to the websocket and starts the message flooder
 */
function register(){
    console.log("Registering device on the websocket connection");
    try{
        var registerMessage = '{"type":"register", "sdid":"'+device_id+'", "Authorization":"bearer '+device_token+'", "cid":"'+getTimeMillis()+'"}';
        console.log('Sending register message ' + registerMessage + '\n');
        ws.send(registerMessage, {mask: true});
        isWebSocketReady = true;
    }
    catch (e) {
        console.error('Failed to register messages. Error in registering message: ' + e.toString());
    }   
}

/**
 * Send one message to SAMI
 */
 var button = 1;
 var light = 1;
function sendData(){
    try{
        ts = ', "ts": '+getTimeMillis();
    

        payload_data = {"button": button, "light": light};

        var payload = '{"sdid":"'+device_id+'"'+ts+', "data": '+JSON.stringify(payload_data)+', "cid":"'+getTimeMillis()+'"}';
        console.log('Sending payload ' + payload);
        ws.send(payload, {mask: true});
    } 

        catch (e) {
        console.error('Error in sending a message: ' + e.toString());
    }   
}

/**
 * All start here
 */
start(); // create websocket connection

function read_pin(cb){

fs.readFile("/sys/devices/12d10000.adc/iio:device0/in_voltage7_raw",'utf8',function(err,data){
light = data;
});

fs.readFile("/sys/devices/12d10000.adc/iio:device0/in_voltage6_raw",'utf8',function(err,data){
button = data;
});

cb();
};

setInterval(function(){

    read_pin(sendData);
},2000);

