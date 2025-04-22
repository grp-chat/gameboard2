const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { join } = require('path');
const { json } = require('express');
const fs = require('fs');
const PORT = process.env.PORT || 3000;

const app = express();

const clientPath = `${__dirname}/client`;
console.log(`Serving static files from path ${clientPath}`);

app.use(express.static(clientPath));
const server = http.createServer(app);
const io = socketio(server);

server.listen(PORT);
console.log("Server listening at " + PORT);

//====================================================================================================

let newX = 0, newY = 0, startX = 0, startY = 0, cardLastPositionX = 0, cardLastPositionY = 0;


io.sockets.on('connection', (sock) => {

    // io.emit('updateAllClients', {newX, newY, startX, startY});
    io.emit('updateAllClientsWhenRefreshed', {cardLastPositionX, cardLastPositionY});
        


    sock.on('clientMouseDown', (data) =>{
        startX = data.startX;
        startY = data.startY;
    });

    sock.on('clientMouseMove', (data) =>{
        startX = data.startX;
        startY = data.startY;
        newX = data.newX;
        newY = data.newY;

        io.emit('updateAllClients', {newX, newY, startX, startY});
    });

    sock.on('clientMouseUp', (data) => {
        cardLastPositionX = data.cardLastPositionX;
        cardLastPositionY = data.cardLastPositionY;
    });


});