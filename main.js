w3.includeHTML();

const firebaseConfig = {
    apiKey: "AIzaSyAjAlvJz6HvGxBWMewBphK3vM0e6QcMnnw",
    authDomain: "myproject-7bc9d.firebaseapp.com",
    databaseURL: "https://myproject-7bc9d-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "myproject-7bc9d",
    storageBucket: "myproject-7bc9d.appspot.com",
    messagingSenderId: "979442305434",
    appId: "1:979442305434:web:6b0aa5c2890832a8225223",
    measurementId: "G-SYKVEDYX3K"
};

firebase.initializeApp(firebaseConfig);
var database = firebase.database();
var ref = database.ref();
var provider = new firebase.auth.GoogleAuthProvider();
let user;

checkStatus();

function checkStatus() {
    if (localStorage.getItem('Token') == null) {
        displayPage('home', 'none');
        displayPage('public-chat', 'none');
        displayPage('chat-icon', 'none');
        displayPage('login', '');
    } else {
        displayPage('home', '');
        displayPage('chat-icon', 'none');
        displayPage('public-chat', '');
        displayPage('login', 'none');
        user = JSON.parse(localStorage.getItem('User'));
        setTimeout(() => {
            displayText('userNavbar', `
            <img
                src="`+ user.photoURL +`"
                class="rounded-circle"
                height="22"
                alt="Avatar"
                loading="lazy"
              /> <span style="margin-left: 10px;font-size: 15px;">`+ user.displayName +`</span>
            `)
            document.getElementById("photoChat").src = user.photoURL;
            read();
            enterChat();
        }, 500);
    }
}

function googleSignin() {
    firebase.auth()
    
    .signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;
        
        console.log(token)
        localStorage.setItem('Token', token);
        console.log(user)
        localStorage.setItem('User', JSON.stringify(user));
        checkStatus();
    }).catch(function(error) {
       var errorCode = error.code;
       var errorMessage = error.message;
       
       console.log(error.code)
       console.log(error.message)
    });
}

function googleSignout() {
    firebase.auth().signOut()
    
    .then(function() {
        console.log('Signout Succesfull')
        setTimeout(() => {
            checkStatus();
        }, 500);
        localStorage.clear();
    }, function(error) {
        console.log('Signout Failed')  
    });
}

function singlePost(table, primaryKey, jsonBody) {
    firebase.database().ref(table + '/' + primaryKey).set(jsonBody);
}

function multiPost(table, jsonBody) {
    ref.child(table).push (jsonBody)
}

function displayPage(pageName, pageDisplay) {
    document.getElementById(pageName).style.display = pageDisplay;
}

function displayText(id, text) {
    document.getElementById(id).innerHTML = text;
}

function btnChat(chatStatus) {
    if (chatStatus) {
        displayPage('public-chat', '');
        displayPage('chat-icon', 'none');
    } else {
        displayPage('public-chat', 'none');
        displayPage('chat-icon', '');
    }
}

function getValue(id) {
    return document.getElementById(id).value;
}

function setValue(id, valueId) {
    return document.getElementById(id).value = valueId;
}

function sendChat() {
    console.log(user.uid);
    console.log(user.displayName);
    console.log(getValue('message'));

    let body = {
        sender: user.displayName,
        photoSender: user.photoURL,
        message: getValue('message')
    }
    if (getValue('message') !== '') {
        multiPost('public-chat', body);
    }
    setValue('message', '');
}

function read() {
    var ref = firebase.database().ref('public-chat').limitToLast(3);;
    
    ref.on("child_added", function(snapshot) {
        console.log(snapshot.val());
        if (snapshot.val().sender == user.displayName) {
            document.getElementById('chatList').innerHTML += `
            <div class="d-flex flex-row justify-content-start mb-4">
                <img src="`+ snapshot.val().photoSender +`"
                alt="avatar 1" style="width: 45px; height: 100%;border-radius: 50%;">
                <div class="p-3 ms-3" style="border-radius: 15px; background-color: rgba(57, 192, 237,.2);">
                <p class="small mb-0 fw-bold">`+ snapshot.val().sender +`</p>
                    <p class="small mb-0">`+ snapshot.val().message +`</p>
                </div>
            </div>
            `;
        } else {
            document.getElementById('chatList').innerHTML += `
            <div class="d-flex flex-row justify-content-end mb-4">
                <div class="p-3 me-3 border" style="border-radius: 15px; background-color: #fbfbfb;">
                <p class="small mb-0 fw-bold">`+ snapshot.val().sender +`</p>
                <p class="small mb-0">`+ snapshot.val().message +`</p>
                </div>
                <img src="`+ snapshot.val().photoSender +`"
                alt="avatar 1" style="width: 45px; height: 100%;border-radius: 50%;">
            </div>
            `;
        }
        
    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function enterChat() {
    document.getElementById('message').addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
          sendChat();
        }
    });
}