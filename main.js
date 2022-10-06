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

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var today  = new Date();
var todayDate = today.toLocaleDateString("en-US", options);
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
var currentTime = " " + today.getHours() + ":" + today.getMinutes() + " " + timezone


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
        displayPage('chat-icon', '');
        displayPage('public-chat', 'none');
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
            let userStatusBody = {
                username: user.displayName,
                status: "online",
                date: todayDate + currentTime
            }
            singlePost('user-status', user.uid, userStatusBody);
            readChat();
            readStatusUser();
            enterChat();
            totalUserOnline();
            changeStatusUser();
            displayPage('data-crud', 'none');
            var pageON = localStorage.getItem('onPage');
            if (pageON == 'dashboard') {
                containDashboard();
            } else if (pageON == 'data') {
                containData();
                readDataCrud();
                setTimeout(() => {
                    $(document).ready( function () {
                        $('#dataTableCrud').DataTable();
                    } );
                }, 500);
            } else if (pageON == 'data-table') {
                containDataTable();
                $(document).ready( function () {
                    $('#table_id').DataTable();
                } );
            } else {
                containDashboard();
            }
        }, 500);
    }
}

function googleSignin() {
    firebase.auth()
    
    .signInWithPopup(provider).then(function(result) {
        var token = result.credential.accessToken;
        var user = result.user;
        
        // console.log(token)
        localStorage.setItem('Token', token);
        // console.log(user)
        localStorage.setItem('User', JSON.stringify(user));
        // checkStatus();
        location.reload();
        let userStatusBody = {
            username: user.displayName,
            status: "online",
            date: todayDate + currentTime
        }
        singlePost('user-status', user.uid, userStatusBody);
    }).catch(function(error) {
       var errorCode = error.code;
       var errorMessage = error.message;
       
       console.log(error.code)
       console.log(error.message)
    });
}

function googleSignout() {
    const currentDate = new Date();
    let userStatusBody = {
        username: user.displayName,
        status: "offline",
        date: todayDate + currentTime
    }
    singlePost('user-status', user.uid, userStatusBody);
    firebase.auth().signOut()
    
    .then(function() {
        console.log('Signout Succesfull')
        setTimeout(() => {
            // checkStatus();
            location.reload();
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
        scrollDown();
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
    let body = {
        sender: user.displayName,
        photoSender: user.photoURL,
        message: getValue('message')
    }
    if (getValue('message') !== '') {
        multiPost('public-chat', body);
        scrollDown();
    }
    setValue('message', '');
}

function readChat() {
    var ref = firebase.database().ref('public-chat').limitToLast(20);
    
    ref.on("child_added", function(snapshot) {
        // console.log(snapshot.val());
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
                <div class="p-3 me-3 border" style="border-radius: 15px; background-color: #d6d6d6;">
                <p class="small mb-0 fw-bold">`+ snapshot.val().sender +`</p>
                <p class="small mb-0">`+ snapshot.val().message +`</p>
                </div>
                <img src="`+ snapshot.val().photoSender +`"
                alt="avatar 1" style="width: 45px; height: 100%;border-radius: 50%;">
            </div>
            `;
        }
        scrollDown();
    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function readStatusUser() {
    var ref = firebase.database().ref('user-status').limitToLast(5);
    
    ref.on("child_added", function(snapshot) {
        var res = snapshot.val();
        if (res.status == 'online') {
            document.getElementById('userStatus').innerHTML += `
            <tr id="`+ snapshot.key +`">
                <td>`+ res.username +`</td>
                <td class="status-green">`+ res.status +`</td>
                <td>`+ res.date +`</td>
            </tr>
            `;
        } else {
            document.getElementById('userStatus').innerHTML += `
            <tr id="`+ snapshot.key +`">
                <td>`+ res.username +`</td>
                <td class="status-red">`+ res.status +`</td>
                <td>`+ res.date +`</td>
            </tr>
            `;
        }
    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function readDataCrud() {
    var ref = firebase.database().ref('data-crud').orderByKey().limitToLast(5);
    var i = 0;
    
    ref.on("child_added", function(snapshot) {
        i++;
        var res = snapshot.val();
        document.getElementById('listData').innerHTML += `
            <tr id="`+ snapshot.key +`">
                <td>`+ i +`</td>
                <td>`+ res.namaData +`</td>
                <td>`+ res.descData +`</td>
                <td>`+ res.statData +`</td>
                <td>
                    <button type="button" class="btn btn-primary btnEdit" data-mdb-toggle="modal" data-mdb-target="#editDataModal" onclick="viewEditData('`+ snapshot.key +`')">Edit</button>
                    <button type="button" class="btn btn-danger btnDelete" onclick="deleteData('`+ snapshot.key +`')">Delete</button>
                </td>
            </tr>
        `;
    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function viewEditData(idData) {
    var ref = firebase.database().ref('data-crud/' + idData);

    ref.on("value", function(snapshot) {
        document.getElementById('editDataName').value = snapshot.val().namaData;
        document.getElementById('editDataDesc').value = snapshot.val().descData;
        document.getElementById('editDataStatus').value = snapshot.val().statData;
        document.getElementById('footerEdit').innerHTML = `
            <button type="button" class="btn btn-secondary" data-mdb-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="editData('` + idData +`')">Edit Data</button>
        `;
    }, function (error) {
        console.log("Error: " + error.code);
    });
    // console.log(idData);
}

function editData(idData) {
    var jsonBody = {
        namaData: getValue('editDataName'),
        descData: getValue('editDataDesc'),
        statData: getValue('editDataStatus')
    }
    if (jsonBody.namaData == "" || jsonBody.descData == "") {

    } else {
        singlePost('data-crud', idData, jsonBody)
        location.reload();
    }
}

function deleteData(idData) {
    const userRef = firebase.database().ref().child('data-crud/' + idData);
    userRef.remove()
    location.reload();
}

function enterChat() {
    document.getElementById('message').addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
          sendChat();
        }
    });
}

function scrollDown() {
    var objDiv = document.getElementById("chatList");
    objDiv.scrollTop = objDiv.scrollHeight;
}

function totalUserOnline() {
    ref.child("user-status").on("value", function(snapshot) {
        displayText('totalUser', snapshot.numChildren());
    })
}

function changeStatusUser() {
    var ref = firebase.database().ref('user-status');
    var i = 0
    ref.on("child_changed", function(snapshot) {
        i++;
        var res = snapshot.val();
        if (res.status == 'online') {
            document.getElementById(snapshot.key).innerHTML = `
                <td>`+ i +`</td>
                <td>`+ res.username +`</td>
                <td class="status-green">`+ res.status +`</td>
                <td>`+ res.date +`</td>
            `;
        } else {
            document.getElementById(snapshot.key).innerHTML = `
                <td>`+ i +`</td>
                <td>`+ res.username +`</td>
                <td class="status-red">`+ res.status +`</td>
                <td>`+ res.date +`</td>
            `;
        }
    }, function (error) {
        console.log("Error: " + error.code);
    });
}

function mainDashboardPage() {
    containDashboard();
    localStorage.setItem('onPage', 'dashboard');
    location.reload();
}

function dataCrudPage() {
    containData();
    localStorage.setItem('onPage', 'data');
    location.reload();
}

function dataTablePage() {
    containDataTable();
    localStorage.setItem('onPage', 'data-table');
    location.reload();
}

function containDashboard() {
    displayPage('dashboard', '');
    displayPage('data-crud', 'none');
    displayPage('data-table', 'none');
    document.getElementById('dataCrudLink').classList.remove('active');
    // document.getElementById('dataTableLink').classList.remove('active');
    document.getElementById('mainDashboardLink').classList.add('active');
}

function containData() {
    displayPage('dashboard', 'none');
    displayPage('data-crud', '');
    displayPage('data-table', 'none');
    document.getElementById('mainDashboardLink').classList.remove('active');
    // document.getElementById('dataTableLink').classList.remove('active');
    document.getElementById('dataCrudLink').classList.add('active');
}

function containDataTable() {
    displayPage('dashboard', 'none');
    displayPage('data-crud', 'none');
    displayPage('data-table', '');
    document.getElementById('mainDashboardLink').classList.remove('active');
    document.getElementById('dataCrudLink').classList.remove('active');
    document.getElementById('dataTableLink').classList.add('active');
}

function addData() {
    var jsonBody = {
        namaData: getValue('dataName'),
        descData: getValue('dataDesc'),
        statData: getValue('dataStatus')
    }
    if (jsonBody.namaData == "" || jsonBody.descData == "") {

    } else {
        multiPost('data-crud', jsonBody)
        location.reload();
    }
}

function closeApp() {
    let userStatusBody = {
        username: user.displayName,
        status: "offline",
        date: todayDate + currentTime
    }
    singlePost('user-status', user.uid, userStatusBody);
}