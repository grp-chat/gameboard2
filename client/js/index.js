const sock = io();

const container = document.getElementById("container");


function createCardDivElement(obj) {
  const ele =  document.createElement("div");
  ele.innerHTML = obj.letter;
  ele.classList = obj.classList;
  ele.id = obj.id;
  container.appendChild(ele);
  ele.style.top = obj.cardLastPositionY + 'px';
  ele.addEventListener('mousedown', mouseDown);
}


function mouseDown(e){
  // alert(e.target.id);
    startX = e.clientX
    startY = e.clientY
    const divId = e.target.id;

    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseUp)

    sock.emit('clientMouseDown',{startX, startY, divId});


}

function mouseMove(e){
    newX = startX - e.clientX 
    newY = startY - e.clientY 
  
    startX = e.clientX
    startY = e.clientY

    // card.style.top = (card.offsetTop - newY) + 'px'
    // card.style.left = (card.offsetLeft - newX) + 'px'


    sock.emit('clientMouseMove',{startX, startY, newX, newY});

}

function mouseUp(e){
    document.removeEventListener('mousemove', mouseMove)

    const divId = e.target.id;

    const card = document.getElementById(divId);
    const cardLastPositionY = card.offsetTop;
    const cardLastPositionX = card.offsetLeft;
    sock.emit('clientMouseUp', {cardLastPositionX, cardLastPositionY, divId});

    console.log(divId);
    console.log(cardLastPositionX);
}


sock.on('updateAllClients', (data)=> {

  const card = document.getElementById(data.divId);

    card.style.top = (card.offsetTop - data.newY) + 'px'
    card.style.left = (card.offsetLeft - data.newX) + 'px'

});

sock.on('updateAllClientsWhenRefreshed', (data) => {

  if (document.getElementById(data.id) != null) {return};
    
  createCardDivElement(data);

    const card = document.getElementById(data.id);
    card.style.top = (data.cardLastPositionY) + 'px';
    card.style.left = (data.cardLastPositionX) + 'px';

});