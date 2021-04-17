const socket = io();

// Elements
const $messageForm = document.querySelector('form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true});

const autoscroll = () => {

    //New message element
    const $newMessage = $messages.lastElementChild;

    //Height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight;

    //Height of messages container
    const containerHeight = $messages.scrollHeight;

    //How far I have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();
})

socket.on('locationMessage', (message) => {

    console.log(message);

    const html = Mustache.render(locationTemplate, {
        username : message.username,
        location : message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);

    autoscroll();   
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room, users
    });
    document.querySelector('#sidebar').innerHTML = html;
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $messageFormButton.setAttribute('disabled', 'disabled');

    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {

        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();

        if(error){
            return console.log(error);
        }

        console.log('Message was delivered!');
    });
})

$sendLocationButton.addEventListener('click', () => {
    
    if(!navigator.geolocation){
        return alert('Geolocation servie is not supported in this browser!');
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');
    
    navigator.geolocation.getCurrentPosition((position) => {

        const location = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }

        socket.emit('sendLocation', location, () => {

            $sendLocationButton.removeAttribute('disabled');

            console.log('Location shared!');
        });
    })
})

socket.emit('join', {username, room}, (error) => {

});
