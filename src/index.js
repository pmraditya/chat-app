const express = require('express')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const socketio = require('socket.io')
const {generateMessage,generateLocationMessage} = require('./utils/getTime')
const {addUser,removeUser,getUser,getUserInRoom} = require('./utils/user')
const app = express()
const server = http.createServer(app)
const io = socketio(server)
const port = process.env.PORT || 3000
const publicDirectoryPath =path.join(__dirname , '../public') 
app.use(express.static(publicDirectoryPath))
let count = 0 
io.on('connection',(socket)=>{
    console.log('socket has connected')
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','welcome!'));
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserInRoom(user.room)
        })
        callback()
    })
    //socket.broadcast.emit('message','A new user has joined')
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('propanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
        // callback('delivered')
        
       //console.log(message)
    })

    socket.on('sendLocation',({latitude,longitude},callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserInRoom(user.room)
            })
        }
    })
    // socket.emit('updatedCount',count)
    // socket.on('increment',()=>{
    //     count++
    //     // socket.emit('updatedCount',count)  // done only to send to one client
    //     io.emit('updatedCount',count) // done to send to all connected client
    })







server.listen(3000,()=>{
    console.log(`server is listening on port ${port}`)
})