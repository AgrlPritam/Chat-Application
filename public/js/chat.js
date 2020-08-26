const socket = io()

//Elements
const $messageform = document.querySelector('#message-form')
const $messageFormInput = $messageform.querySelector('input')
const $messageFormButton = $messageform.querySelector('button')
const $locationButton = document.querySelector('#send-location')

socket.on('message', (message) => {
    console.log(message)
})

$messageform.addEventListener('submit', (e) => {
    e.preventDefault()
    
    //Disable form
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.messageInput.value

    socket.emit('sendMessage',message, (error) => {         //error here is for sending the acknowledgement from client
        //Re-enable form
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error)
        }
        console.log('Message Delivered!')
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
$locationButton.addEventListener('click',() => {
    
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    $locationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('Location Shared')
        })
    })
})