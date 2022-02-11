var app = require('express');
var io = require('socket.io');
var soap = require('soap');
const request = require('request');

const PORT = process.env.PORT || 3000;

const server = app().use(app.static(path.join(__dirname, 'www').listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})));

const urlSoap = 'https://soapservice-info802.herokuapp.com/?wsdl';
const urlApi = 'http://localhost:5000/';
var args = {};

app.get('/', function(req, res){
    res.send('www/clientHtml.html');
   });
http.listen(8080, function(){
    console.log('listening on *:8080');
   });
   
io.on('connection', function(socket){

    socket.on('requestCarNameArray',function(){
        soap.createClient(url, function(err, client) {
            client.get_car(args, function(err, result) {
                let evalData = JSON.parse(result.get_carResult);
                evalData.forEach(car => res.push(car['model']));
                io.emit('sendCarNameArray', res)
            });
        });
    })

    socket.on('requestCarArray',function(){
        soap.createClient(url, function(err, client) {
            client.get_car(args, function(err, result) {
                let evalData = JSON.parse(result.get_carResult);
                io.emit('sendCarArray', evalData)
            });
        });
    })
    
    socket.on('calculateRideTime',function(data, rideLength, averageSpeed){
        console.log(data)
        if (rideLength!=0 && averageSpeed!=0){
            var urlApi = `${urlApi}Car?rideLength=${rideLength}&fastChargeTime=${data['fastChargeTime']}&chargeTime=${data['chargeTime']}&batterySize=${data['range']}&averageSpeed=${averageSpeed}`;
            console.log(urlApi)
            request(urlApi, (error, response, body)=>{
        
                // Printing the error if occurred
                if(error) console.log(error)
                
                // Printing status code
                console.log(response.statusCode);
                
                // Printing body
                console.log(secondsToHms(body));
                io.emit('getRideTime', secondsToHms(body))

            }); 
    }
    })

    function secondsToHms(d) {
        d = Number(d);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var s = Math.floor(d % 3600 % 60);
    
        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return hDisplay + mDisplay + sDisplay; 
    }

});