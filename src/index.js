const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectoryPath = path.join(__dirname, '../public')
const port = process.env.PORT || 3000

app.use(express.static(publicDirectoryPath))


// server (emits) --> client (receives) - countUpdated
//client (emits) --> server (receives) - increment
io.on('connection',(socket) => {
    console.log('New WebSocket connection')

    socket.emit('message','Welcome!!')
    socket.broadcast.emit('message','A new User has Joined')

    socket.on('sendMessage',(msg, callback) => {        //callback here is for acknowledgement of sent message
        const filter = new Filter()
        if(filter.isProfane(msg)){
            return callback('Profanity isn\'t allowed')
        }
        io.emit('message',msg)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('message',`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })
    socket.on('disconnect',() => {
        io.emit('message', 'A user has left')
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