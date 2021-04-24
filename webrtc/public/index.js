class RelayServer {
    constructor() {
        //this.socket = io('http://localhost:3000');
        this.socket = io();
    }

    onSocketConnection(f) {
        this.socket.on('connect', f);
    }

    onUpdateUserList(f) {
        this.socket.on('update-user-list', f);
    }

    sendPeerMediaOffer(peerId, offer) {
        this.socket.emit('mediaOffer', {
            offer,
            to: peerId,
            from: this.socket.id
        });
    }

    sendPeerMediaAnswer(peerId, answer) {
        this.socket.emit('mediaAnswer', {
            answer,
            from: this.socket.id,
            to: peerId
        });
    }

    sendIceCandidateToPeer(peerId, candidate) {
        console.log('sending candidate', candidate);
        this.socket.emit('iceCandidate', {
            to: peerId,
            candidate: event.candidate
        });
    }

    onPeerSendMediaOffer(f) {
        this.socket.on('mediaOffer', f);
    }

    onPeerSendMediaAnswer(f) {
        this.socket.on('mediaAnswer', f);
    }

    onPeerSendIceCandidate(f) {
        this.socket.on('remoteIceCandidate', f);
    }
}

/* a global that stores the selected user ID */
let selectedUser;

/* create a relay server object. We talk to our peer through this server. */
const relayServer = new RelayServer();

relayServer.onSocketConnection(async () => {
    document.querySelector('#userId').innerHTML = `My user id is ${relayServer.socket.id}`;

    const resp = await fetch('/connected-users');
    onUpdateUserList(await resp.json());
});


const onUpdateUserList = ({ userIds }) => {
    const userList = document.querySelector('#usersList');
    const usersToDisplay = userIds.filter(id => id !== relayServer.socket.id);
    usersList.innerHTML = '';

    usersToDisplay.forEach(user => {
        const userItem = document.createElement('div');
        userItem.innerHTML = user;
        userItem.className = 'user-item';

        userItem.addEventListener('click', () => {
            selectedUser = user;
        });
        userList.appendChild(userItem);
    });
};

relayServer.onUpdateUserList(onUpdateUserList);

/* create an object to represent our RTC connection */
const rtcConnection = new RTCPeerConnection({
    iceServers: [
        {
            urls: 'stun:stun.stunprotocol.org'
        }
    ]
});

/* a function to set up video on the web page */
const setUpMyVideo = async () => {

    // obtain video/audio permission
    const constraints = {
        audio: true,
        video: true
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // set the camera video to show in a <video> tag!
    document.querySelector('#localVideo').srcObject = stream;

    // tell our RTC Connection about our video source
    stream.getTracks().forEach(track => rtcConnection.addTrack(track, stream));
};

setUpMyVideo();

/* the call button */
const callButton = document.querySelector('#call');

/* 
 * function to execute when the call button is pressed
 * This function is caller side.
 **/
callButton.addEventListener('click', async () => {
    callButton.disabled = true; 

    // create a connection offer, which contains our video/audio info
    const localOffer = await rtcConnection.createOffer();

    // tell our connection object about our video/audio info
    await rtcConnection.setLocalDescription(new RTCSessionDescription(localOffer));

    // tell our callee about our video/audio info
    relayServer.sendPeerMediaOffer(selectedUser, localOffer);
});

/* 
 * function to execute when another user call us.
 *
 * `data` contains two keys: "offer" and "from". "offer" contains the offer
 * object and "from" is the ID of the caller.
 *
 * This function is callee side.
 **/
relayServer.onPeerSendMediaOffer(async data => {
    console.log('receive MediaOffer', data);
    // caller's video/audio info
    const peerOffer = data.offer;

    // tell our connection object about the caller's video/audio info
    await rtcConnection.setRemoteDescription(new RTCSessionDescription(peerOffer));

    // create a connection answer, which contains our video/audio info
    const answer = await rtcConnection.createAnswer();

    // tell our connection object about our video/audio info
    await rtcConnection.setLocalDescription(new RTCSessionDescription(answer));

    // tell our caller about our video/audio info
    relayServer.sendPeerMediaAnswer(data.from, answer);
});


/*
 * function to execute when callee agreed to call and send us their video/audio info
 *
 * `data` contains the key "answer" that holds the answer object from callee.
 *
 * This function is caller side.
 **/
relayServer.onPeerSendMediaAnswer(async data => {
    console.log('receive MediaAnswer', data);
    // tell our connection about the callee's video/audio info
    await rtcConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
});


/*
 * function to execute when we get some connection information from our RTC
 * connection object.  
 * This function is both caller and callee side.
 **/
rtcConnection.onicecandidate = event => {
    // send our peer about our connection preference.
    if (event.candidate)
        relayServer.sendIceCandidateToPeer(selectedUser, event.candidate);
};

/*
 * function to execute when we get some connection information from our peer.
 * This function is both caller and callee side.
 **/
relayServer.onPeerSendIceCandidate(async data => {
    console.log('receive ICE from peer', data);
    // create an ICE candidate object
    const candidate = new RTCIceCandidate(data.candidate);
    // tell our RTC connection object about our peer's ICE candidate
    await rtcConnection.addIceCandidate(candidate);
});

/*
 * function to execute when an connection has been established and we got our
 * peer's audio/video streams!  
 * This function is both caller and callee side.
 **/
rtcConnection.addEventListener('track', event => {
    console.log('got track', event.streams);
    const [stream] = event.streams;
    // put our peer's stream onto our video
    document.querySelector('#remoteVideo').srcObject = stream;
});



