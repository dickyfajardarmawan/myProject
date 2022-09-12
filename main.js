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
var usersRef = database.ref("users");
let user;

if (localStorage.getItem('Token') == null) {
    displayPage('home', 'none');
    displayPage('login', '');
} else {
    displayPage('home', '');
    displayPage('login', 'none');
    user = JSON.parse(localStorage.getItem('User'));
    setTimeout(() => {
        displayText('profileName', user.displayName)
    }, 500);
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
        displayPage('home', '');
        displayPage('login', 'none');
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
        displayPage('home', 'none');
        displayPage('login', '');
        localStorage.clear();
        // writeUserData(user.uid, user.displayName, 'offline')
    }, function(error) {
        console.log('Signout Failed')  
    });
}

function displayPage(pageName, pageDisplay) {
    document.getElementById(pageName).style.display = pageDisplay;
}

function displayText(id, text) {
    document.getElementById(id).innerHTML = text;
}