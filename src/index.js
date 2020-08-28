const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))

//socket.emit --> sends emit to specific client
//io.emit --> sends emit to every connected client
//socket.broadcast.emit --> sends emit to every client except the current one
//io.to.emit --> sends emit to all in a specific room
//socket.broadcast.to.emit --> sends emit to everyone except the specific client in a specific room

// server (emits) --> client (receives) - countUpdated
//client (emits) --> server (receives) - increment
io.on('connection',(socket) => {
    console.log('New WebSocket connection')

    socket.on('join',(options, callback) => {       //options is same as {username, room}. Used here for spread operator below
        const {error,user} = addUser({ id: socket.id, ...options })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)           //socket.join can only be used from server side
        
        socket.emit('message',generateMessage('Welcome!!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined!`))
        callback()
    })

    socket.on('sendMessage',(msg, callback) => {        //callback here is for acknowledgement of sent message
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity isn\'t allowed')
        }
        io.emit('message',generateMessage(msg))
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })
    socket.on('disconnect',() => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
        }        
    })
})

//For reference. Linked to chat.js in public folder
//     socket.emit('countUpdated', count)
//     //Server catching emits from client to server see chat.js
//     socket.on('increment', () => {
//         count++
//         //socket.emit('countUpdated',count)     //Only emits to current tab when opened in a browser. The new count is not shown in other client tabs. To update the count in every client connection we use io.emit as below
//         io.emit('countUpdated', count)
//     })
// })



server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})