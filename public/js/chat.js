const socket = io()

//Elements
const $messageform = document.querySelector('#message-form')
const $messageFormInput = $messageform.querySelector('input')
const $messageFormButton = $messageform.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix:true})             //For client-side scripting endpoints like username and room name which we enter in index.html page. ignoreQueryPrefix will remove '?' from beginning

const autoscroll = () => {
    //New Message Element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages Container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,       //from server side index.js in generateMessage utils
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate,{
        username: message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
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

socket.emit('join', {username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})