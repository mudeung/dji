const mqtt = require("mqtt");
const axios = require("axios");


const API_URL =
"https://script.google.com/macros/s/본인API/exec";


// DJI MQTT 접속

const client = mqtt.connect(
"mqtt://DJI_CLOUD_SERVER"
);



client.on("connect",()=>{

console.log(
"DJI CLOUD CONNECT"
);


// telemetry 구독

client.subscribe(
"thing/product/+/state"
);


});



client.on(
"message",
(topic,message)=>{


const data =
JSON.parse(message);



const drone = {

name:"DRONE-01",

device:"DRONE",

lat:data.latitude,

lng:data.longitude,

alt:data.height,

battery:data.battery,

status:"FLY"

};



axios.post(
API_URL,
drone
);


});
