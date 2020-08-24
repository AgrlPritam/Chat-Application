const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.messageInput.value
    socket.emit('sendMessage',message)
})

//For Reference 
// socket.on('countUpdated',(count) => {            //countUpdated name here should be same as that of name in socket.emit in index.js file
//     console.log('The count has been updated! ',count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')        //emits event from client and listen it on server
// })