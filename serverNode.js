var app = require('express');
var socketio = require('socket.io');
var soap = require('soap');
const request = require('request');
const e = require('express');

const PORT = process.env.PORT || 3000;

const server = app().use(app.static('www')).listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

const urlSoap = 'https://soapservice-info802.herokuapp.com/?wsdl';
const urlApi = 'https://flaskapirest-info802.herokuapp.com/';
var args = {};

var io = socketio(server);
io.on('connection', function(socket){

    socket.on('requestCarNameArray',function(){
        soap.createClient(urlSoap, function(err, client) {
            client.get_car(args, function(err, result) {
                let evalData = JSON.parse(result.get_carResult);
                evalData.forEach(car => res.push(car['model']));
                io.emit('sendCarNameArray', res)
            });
        });
    });

    socket.on('requestCarArray',function(){
        soap.createClient(urlSoap, function(err, client) {
            client.get_car(args, function(err, result) {
                let evalData = JSON.parse(result.get_carResult);
                io.emit('sendCarArray', evalData)
            });
        });
    });
    
    socket.on('calculateRideTime',function(data, rideLength, averageSpeed){
        console.log(data)
        if (rideLength!=0 && averageSpeed!=0){
            var restApi = `${urlApi}Car?rideLength=${rideLength}&fastChargeTime=${data['fastChargeTime']}&chargeTime=${data['chargeTime']}&batterySize=${data['range']}&averageSpeed=${averageSpeed}`;
            console.log(restApi)
            request(restApi, (error, response, body)=>{
        
                // Printing the error if occurred
                if(error) console.log(error)
                
                // Printing status code
                console.log(response.statusCode);
                
                // Printing body
                console.log(secondsToHms(body));
                io.emit('getRideTime', secondsToHms(body))

            }); 
    }
    });

    socket.on('CalculateBorneWaypoint',function(tabBorne){

        tabBorne.forEach(element => {

            var restApi = `https://opendata.reseaux-energies.fr/api/records/1.0/search/?dataset=bornes-irve&q=&facet=region&geofilter.distance=${element[0]}%2C${element[1]}%2C10000`;
            request(restApi, (error, response, body)=>{
        
                // Printing the error if occurred
                if(error) console.log(error)
                
                // Printing status code
                console.log(response.statusCode);

                
                // Printing body

                var json = JSON.parse(body);
                if (json.nhits>0){
                    console.log(json)

                    io.emit('BorneWaypoint',[json.records[0].geometry.coordinates[1],json.records[0].geometry.coordinates[0]])
                }else{
                    io.emit('BorneWaypoint',0)
                }
                
            }); 
        });
    })

    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
    
        var hDisplay = h > 0 ? h + (h == 1 ? " heure, " : " heures, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " seconde" : " secondes") : "";
        return hDisplay + mDisplay + sDisplay; 
    }

});