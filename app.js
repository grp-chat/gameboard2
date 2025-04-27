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

const A = Array(9).fill("A");
const B = Array(2).fill("B");
const C = Array(2).fill("C");
const D = Array(4).fill("D");
const E = Array(12).fill("E");
const F = Array(2).fill("F");
const G = Array(3).fill("G");
const H = Array(2).fill("H");
const I = Array(9).fill("I");
const J = Array(1).fill("J");
const K = Array(1).fill("K");
const L = Array(4).fill("L");
const M = Array(2).fill("M");
const N = Array(6).fill("N");
const O = Array(8).fill("O");
const P = Array(2).fill("P");
const Q = Array(1).fill("Q");
const R = Array(6).fill("R");
const S = Array(4).fill("S");
const T = Array(6).fill("T");
const U = Array(4).fill("U");
const V = Array(2).fill("V");
const W = Array(2).fill("W");
const X = Array(6).fill("X");
const Y = Array(6).fill("Y");
const Z = Array(1).fill("Z");

const CHARACTER_SET = [
    ...A, 
    ...B,
    ...C,
    ...D,
...E,
...F,
...G,
...H,
...I,
...J,
...K,
...L,
...M,
...N,
...O,
...P,
...Q,
...R,
...S,
...T,
...U,
...V,
...W,
...X,
...Y,
...Z
];

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

  const packSize = 8;

  let charecter_setIndex = 0;



let newX = 0, newY = 0, startX = 0, startY = 0, divId = 0;

let ELEMENT_LIST =[];
fs.readFile('savegame.txt', function(err, data){
    if(err) throw err;
    ELEMENT_LIST = JSON.parse(data);
    
});

// const ALPHABETS = ["D","E","F","G","H"];
// const PACK = ["I", "J", "K", "L", "M", "N"];
// let positionIncrease = 100;
let position = 60;
let runningNumber = 1;

class Card {
    constructor(letter) {
        // if (position > 5) {position = 0;};
        // this.positions = [
        //     [60, 60],
        //     [60, 120],
        //     [60, 180],
        //     [120, 60],
        //     [120, 120],
        //     [120, 180]
        // ]
        this.letter = letter;
        this.element = "div";
        this.classList = "card";
        // this.cardLastPositionX = this.positions[position][1];
        this.cardLastPositionX = position;
        // this.cardLastPositionY = this.positions[position][0];
        this.cardLastPositionY = 60;
        this.id = runningNumber;
        position += 60;
        runningNumber++;
        // positionIncrease += 30;
        ELEMENT_LIST.push(this);
    }
  };

  function freshPack() {
    
    position = 60;
    const PACK = [];
    if (charecter_setIndex > CHARACTER_SET.length) {charecter_setIndex = 0};
    for (let i = 0; i < packSize; i++) {
        if (CHARACTER_SET[charecter_setIndex] == undefined) {charecter_setIndex = 0};
        PACK.push(CHARACTER_SET[charecter_setIndex]);
        charecter_setIndex++;
    }

    return PACK.map(alphabets => {
        const card = new Card(alphabets);
        return card;
      });
    
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
  class Pack {
    constructor(cards = freshPack()) {
      this.cards = cards;
    };
  }

// const deck = new Deck();


io.sockets.on('connection', (sock) => {

    io.emit('updateAllClientsWhenRefreshed', ELEMENT_LIST);

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

        const saveGame = JSON.stringify(ELEMENT_LIST);
        fs.writeFile('savegame.txt', saveGame, err => {
            if(err) {
                console.err;
                return;
            }
        });
    });

    sock.on('createNewCards', ()=> {

        const pack = new Pack();
        io.emit('updateAllClientsWhenRefreshed', ELEMENT_LIST);
    });

    sock.on("test", data => {console.log(data)});


});