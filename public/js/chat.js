const socket = io()  //any name other than socket you can choose
const $messageForm = document.querySelector('form')
const $messageFormButton = $messageForm.querySelector('Button')
const $messageFormInput = $messageForm.querySelector('input')
const $sendLocationButton = document.querySelector('#send-location')
const $message = document.querySelector('#message')


//template
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const autoscroll = ()=>{
    //Getting the new message 
    const $newMessage = $message.lastElementChild
    //Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    console.log(newMessageMargin)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height

    const visibleHeight = $message.offsetHeight

    //height of the container
    const containerHeight = $message.scrollHeight

    //how far we can scrolled?

    const scrolloffsetHeight = $message.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrolloffsetHeight){
        $message.scrollTop = $message.scrollHeight
    }



}

socket.on('updatedCount',(count)=>{ //any other name than count can be taken
    console.log('updated count successfully' , count)
})

// query
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true})
console.log(username,room)

// document.querySelector("#increment").addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')
// })

socket.on('roomData',({users,room})=>{
    // console.log(users)
    // console.log(room)
    const html = Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html


})

socket.on('locationMessage',(url)=>{
    const html = Mustache.render($locationTemplate,{
        username:url.username,
        location:url.text,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    console.log(url)
    autoscroll()
})

socket.on('message',(welcome)=>{
    const html = Mustache.render($messageTemplate,{
        username:welcome.username,
        message:welcome.text,
        createdAt: moment(welcome.createdAt).format('h:mm a')
    })
    $message.insertAdjacentHTML('beforeend',html)
    console.log(welcome)
    autoscroll()
})


$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled') //this will disabled the attributes 
    //cannot define message outside this block
    //const message = document.querySelector('input').value
    const message = e.target.elements.message.value// another alternative
    // socket.emit('sendMessage',message,(message)=>{
    //     console.log('message was delivered',message)
    // })

    socket.emit('sendMessage',message,(error)=>{
        $messageFormInput.value = ''
        $messageFormInput.focus()
        $messageFormButton.removeAttribute('disabled')
       // $messageFormInput.focus()
        if(error){
            console.log(error)
        }
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation is not supported by this browser,try another one')
    }
    $sendLocationButton.setAttribute('disabled','disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location has been shared')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href = '/'
    }
})