const socket = io('/')
const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true //muta o nosso próprio vídeo pra não dar retorno
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream =>{
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream) //respondendo ao 'dono' da sala quem entrou

        const video = document.createElement('video')

        //mostrando a quem entrou o restante dos usuários presente na sala
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        }) 
    })

    //permitir outro usuário entrar na sala
    socket.on('user-connected', userId => {
        connectToNewUser(userId, stream)
    })
})

socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})

myPeer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id)
})

//evento pra room
socket.emit('join-room', ROOM_ID, 10)
 

//quando o usuário for chamado, vai ser enviado o video dele a nossa sala
function connectToNewUser(userID, stream){
    const call = myPeer.call(userID, stream) 
    const video = document.createElement('video') //cria o video do usuario
    call.on('stream', userVideoStream => { 
        addVideoStream(video, userVideoStream)
    }) 

    //quando alguém sair da sala, fechar aquele video/camera
    call.on('close', () =>{
        video.remove()
    })

    peers[userId] = call
}

//func para reproduzir o vídeo (cam)
function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}