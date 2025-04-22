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

io.sockets.on('connection', (sock) => {

    sock.on('btnpress', () => {
        // console.log("Button pressed");
        io.emit('jumpVideo');
    });

    sock.on('btnpress2', () => {
        // console.log("Button 2 pressed");
        io.emit('toggleText');
    });

    sock.on('checkConnection', ()=>{
        io.emit('showText');
    });

});