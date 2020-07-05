const users = []

const addUser = ({id,username,room}) =>{
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if(!username || !room){
        return{
            error:'provide username and room'
        }
    }

    //validate users
    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room
    })
    if(existingUser){
        return {
            error:'given user already exist'
        }
    }
    const user = {id,username,room}
    users.push(user)
    return {user}
}
const removeUser = (id)=>{
    const index = users.findIndex((user)=> user.id === id)
    if(index !== -1){
        return users.splice(index,1)[0]
    }
}

const getUser = (id)=>{
return users.find((user)=> user.id === id)
}

const getUserInRoom = (room_in)=>{
    room_in = room_in.trim().toLowerCase()
    return  users.filter((user)=> user.room === room_in)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}

