const socket = io()

socket.on('message', (message) => {
    console.log(message)
})

document.querySelector('#message-form').addEventListener('submit', (e) => {
    e.preventDefault()

    const message = e.target.elements.messageInput.value

    socket.emit('sendMessage',message, (fromCallback) => {
        console.log(`The message was ${fromCallback}`)
    })
})

//For Reference 
// socket.on('countUpdated',(count) => {            //countUpdated name here should be same as that of name in socket.emit in index.js file
//     console.log('The count has been updated! ',count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')        //emits event from client and listen it on server
// })

//Sharing location
document.querySelector('#send-location').addEventListener('click',() => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position) => {
        
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    })
})