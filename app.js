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
// const Card = require('./card');
const CHARACTER_SET = require('./character_set');

let isTeacher = false;

function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

shuffle(CHARACTER_SET);



const packSize = 10;

let charecter_setIndex = 0;

let charactersRemaining = CHARACTER_SET.length - charecter_setIndex;

let newX = 0, newY = 0, startX = 0, startY = 0, divId = 0;

let ELEMENT_LIST = [];
fs.readFile('savegame.txt', function (err, data) {
    if (err) throw err;
    ELEMENT_LIST = JSON.parse(data);
});

let position = 60;
let runningNumber = 1;


class Card {
    constructor(letter) {
        this.letter = letter;
        this.element = "div";
        this.classList = "card";
        this.cardLastPositionX = position;
        this.cardLastPositionY = 60;
        this.id = runningNumber;
        position += 60;
        runningNumber++;
        ELEMENT_LIST.push(this);
    }
};

function freshPack() {

    position = 60;
    const PACK = [];
    if (charecter_setIndex > CHARACTER_SET.length) { charecter_setIndex = 0 };
    for (let i = 0; i < packSize; i++) {
        if (CHARACTER_SET[charecter_setIndex] == undefined) { charecter_setIndex = 0 };
        PACK.push(CHARACTER_SET[charecter_setIndex]);
        charecter_setIndex++;
    }

    return PACK.map(alphabets => {
        const card = new Card(alphabets);
        return card;
    });

}

class Pack {
    constructor(cards = freshPack()) {
        this.cards = cards;
    };
}
//   function freshDeck() {
//     return ALPHABETS.map(alphabets => {
//       const card = new Card(alphabets);
//       return card;
//     });
//   }

//   class Deck {
//     constructor(cards = freshDeck()) {
//       this.cards = cards;
//     };
//   }

// const deck = new Deck();


io.sockets.on('connection', (sock) => {

    
    charactersRemaining = CHARACTER_SET.length - charecter_setIndex;
    io.emit('updateAllClientsWhenRefreshed', ELEMENT_LIST);
    io.emit('updateButton', charactersRemaining);

    sock.on('checkUser', (data) => {
        if (data == 8) {
            const user = "teacher";
            sock.emit('response', user);
        };
    });

    sock.on('clientMouseDown', (data) => {
        startX = data.startX;
        startY = data.startY;
        divId = data.divId;
    });

    sock.on('clientMouseMove', (data) => {
        startX = data.startX;
        startY = data.startY;
        newX = data.newX;
        newY = data.newY;


        io.emit('updateAllClients', { newX, newY, startX, startY, divId }); //dont remove divId, its from mousedown
    });

    sock.on('clientMouseUp', (data) => {


        ELEMENT_LIST.forEach(element => {

            if (element.id === parseInt(data.divId)) {
                element.cardLastPositionX = data.cardLastPositionX;
                element.cardLastPositionY = data.cardLastPositionY;
            }
        });

        const saveGame = JSON.stringify(ELEMENT_LIST);
        fs.writeFile('savegame.txt', saveGame, err => {
            if (err) {
                console.err;
                return;
            }
        });
    });

    sock.on('createNewCards', () => {

        const pack = new Pack();
        io.emit('updateAllClientsWhenRefreshed', ELEMENT_LIST);


        charactersRemaining = CHARACTER_SET.length - charecter_setIndex;
        io.emit('updateButton', charactersRemaining);
    });

    sock.on('removeDom', data => {
        ELEMENT_LIST.forEach((item, index, object) => {
            if (item.id == data) {
                object.splice(index, 1);
            };
        });
        const divId = data;
        io.emit('removeDomOnOtherClient', divId);
    });

    sock.on('sendRefresh', ()=>{
        const loginName = "teacher"
        io.emit('ifNeedRefresh', loginName);
    });

    sock.on("test", data => { console.log(data) });


});