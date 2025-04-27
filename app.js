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

const arrayA = Array(10).fill("A");
const arrayB = Array(5).fill("B");
const arrayC = Array(6).fill("C");
// console.log([
//     ...arrayA, 
//     ...arrayB,
//     ...arrayC
// ]);


let newX = 0, newY = 0, startX = 0, startY = 0, divId = 0;

let ELEMENT_LIST =[];
const ALPHABETS = ["D","E","F","G","H"];
const PACK = ["I", "J", "K", "L", "M", "N"];
let positionIncrease = 100;
let runningNumber = 1;

class Card {
    constructor(letter) {
        this.letter = letter;
        this.element = "div";
        this.classList = "card";
        this.cardLastPositionX = 0;
        this.cardLastPositionY = positionIncrease;
        this.id = runningNumber;
        runningNumber++;
        positionIncrease += 80;
        ELEMENT_LIST.push(this);
    }
  };

  function freshPack() {
    return PACK.map(alphabets => {
      const card = new Card(alphabets);
      return card;
    });
  }
  function freshDeck() {
    return ALPHABETS.map(alphabets => {
      const card = new Card(alphabets);
      return card;
    });
  }

  class Deck {
    constructor(cards = freshDeck()) {
      this.cards = cards;
    };
  }
  class Pack {
    constructor(cards = freshPack()) {
      this.cards = cards;
    };
  }

// const deck = new Deck();


io.sockets.on('connection', (sock) => {

    // console.log(ELEMENT_LIST);
    io.emit('updateAllClientsWhenRefreshed', ELEMENT_LIST);
    // ELEMENT_LIST.forEach(element => {
    //     io.emit('updateAllClientsWhenRefreshed', element);
    // });

    sock.on('clientMouseDown', (data) =>{
        startX = data.startX;
        startY = data.startY;
        divId = data.divId;
    });

    sock.on('clientMouseMove', (data) =>{
        startX = data.startX;
        startY = data.startY;
        newX = data.newX;
        newY = data.newY;
        

        io.emit('updateAllClients', {newX, newY, startX, startY, divId}); //dont remove divId, its from mousedown
    });

    sock.on('clientMouseUp', (data) => {
        

        ELEMENT_LIST.forEach(element => {
            
            if (element.id === parseInt(data.divId)) {
                element.cardLastPositionX = data.cardLastPositionX;
                element.cardLastPositionY = data.cardLastPositionY;
            }
        });
    });

    sock.on('createNewCards', ()=> {

        const pack = new Pack();
        // console.log(pack.cards);
        const card = new Card("Z");
        io.emit('updateAllClientsWhenRefreshed', ELEMENT_LIST);
        

    });


});