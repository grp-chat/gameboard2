const sock = io();

let binTriggered = false;

var ua = navigator.userAgent.toLowerCase();
var isAndroid = ua.indexOf("android") > -1;

const container = document.getElementById("container");

const button = document.getElementById("add");

button.addEventListener('click', (e) => {
  // e.preventDefault();
  if (isAndroid) {
    sock.emit('createNewCards');
  }
  
    
});

// button.addEventListener('touchstart', e => {
//   // document.body.style.touchAction = "unset";
//   sock.emit('createNewCards');
// });


function createCardDivElement(obj) {
  
  const ele =  document.createElement("div");
  ele.innerHTML = obj.letter;
  ele.classList = obj.classList;
  ele.id = obj.id;
  container.appendChild(ele);
  ele.style.top = obj.cardLastPositionY + 'px';
  if (!isAndroid) return;
  ele.addEventListener('mousedown', mouseDown);
  ele.addEventListener('touchstart', touchStart);
}


function mouseDown(e){
  
    startX = e.clientX
    startY = e.clientY
    const divId = e.target.id;

    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseUp)

    sock.emit('clientMouseDown',{startX, startY, divId});
}
function touchStart(e){
    // e.preventdefault();
    // document.body.style.touchAction = "none";
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;
    const divId = e.target.id;

    document.addEventListener('touchmove', touchMove);
    document.addEventListener('touchend', touchEnd);

    sock.emit('clientMouseDown',{startX, startY, divId});
}


function mouseMove(e){
    newX = startX - e.clientX 
    newY = startY - e.clientY 
  
    startX = e.clientX
    startY = e.clientY

    // console.log('id:' + e.target.id + ', x:' + e.clientX + ', y:' + e.clientY );

    const wasteBin = document.getElementById("bin");
    if (e.clientX > 1200 && e.clientY > 40) {
      wasteBin.classList.add("highlight");
      binTriggered = true;
    }else {
      wasteBin.classList.remove("highlight");
      binTriggered = false;
    }

    sock.emit('clientMouseMove',{startX, startY, newX, newY});

}
function touchMove(e){
  
    newX = startX - e.targetTouches[0].pageX;
    newY = startY - e.targetTouches[0].pageY;
    
  
    startX = e.targetTouches[0].pageX;
    startY = e.targetTouches[0].pageY;

    const wasteBin = document.getElementById("bin");
    if (e.targetTouches[0].pageX > 1200 && e.targetTouches[0].pageY > 40) {
      wasteBin.classList.add("highlight");
      binTriggered = true;
    }else {
      wasteBin.classList.remove("highlight");
      binTriggered = false;
    }
 
    sock.emit('clientMouseMove',{startX, startY, newX, newY});

}

function mouseUp(e){
    document.removeEventListener('mousemove', mouseMove)

    const divId = e.target.id;

    const card = document.getElementById(divId);
    const cardLastPositionY = card.offsetTop;
    const cardLastPositionX = card.offsetLeft;

    if (binTriggered) {
      const wasteBin = document.getElementById("bin");
      card.remove();
      wasteBin.classList.remove("highlight");
      binTriggered = false;
      sock.emit('removeDom', divId);
      return;
    }

    sock.emit('clientMouseUp', {cardLastPositionX, cardLastPositionY, divId});

}
function touchEnd(e){
  // document.body.style.touchAction = "unset";
    document.removeEventListener('touchmove', touchMove)

    const divId = e.target.id;

    const card = document.getElementById(divId);
    const cardLastPositionY = card.offsetTop;
    const cardLastPositionX = card.offsetLeft;

    if (binTriggered) {
      const wasteBin = document.getElementById("bin");
      card.remove();
      wasteBin.classList.remove("highlight");
      binTriggered = false;
      sock.emit('removeDom', divId);
      return;
    }

    sock.emit('clientMouseUp', {cardLastPositionX, cardLastPositionY, divId});
}


sock.on('updateAllClients', (data)=> {

  const card = document.getElementById(data.divId);

    card.style.top = (card.offsetTop - data.newY) + 'px'
    card.style.left = (card.offsetLeft - data.newX) + 'px'

});

sock.on('updateAllClientsWhenRefreshed', (data) => {

  
  data.forEach(card => {
    if (document.getElementById(card.id) != null) {return};
    createCardDivElement(card);
    const domCard = document.getElementById(card.id);
    domCard.style.top = (card.cardLastPositionY) + 'px';
    domCard.style.left = (card.cardLastPositionX) + 'px';


  });

  // sock.on("updateAllClientsWhenRefreshed", data => {
  //   if (document.getElementById(card.id) != null) {return};

  // });

  
    
  

    

});

sock.on('updateButton', data => {
  button.innerHTML = data;
});

sock.on('removeDomOnOtherClient', data => {
  const card =  document.getElementById(data);
  if (card == null) return;
  card.remove();
});

if (!isAndroid) {
  window.setTimeout( function() {
    window.location.reload();
  }, 30000);
}
