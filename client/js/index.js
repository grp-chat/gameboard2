const sock = io();

let newX = 0, newY = 0, startX = 0, startY = 0;

const card = document.getElementById('card')

card.addEventListener('mousedown', mouseDown)

function mouseDown(e){
    startX = e.clientX
    startY = e.clientY

    document.addEventListener('mousemove', mouseMove)
    document.addEventListener('mouseup', mouseUp)

    sock.emit('clientMouseDown',{startX, startY});


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
    const cardLastPositionY = card.offsetTop;
    const cardLastPositionX = card.offsetLeft;
    sock.emit('clientMouseUp', {cardLastPositionX, cardLastPositionY});
}


sock.on('updateAllClients', (data)=> {

    // alert(card.offsetTop);
    // alert(card.offsetLeft);
    // alert(card.style.top);

    card.style.top = (card.offsetTop - data.newY) + 'px'
    card.style.left = (card.offsetLeft - data.newX) + 'px'

});

sock.on('updateAllClientsWhenRefreshed', (data) => {
    // alert(data.cardLastPositionX)
    card.style.top = (data.cardLastPositionY) + 'px'
    card.style.left = (data.cardLastPositionX) + 'px'
});