
// Aquesta funció genera una espera de "time" milisegons en funcions "async"
function wait (time) {
    return new Promise((resolve, request) => {
        setTimeout(resolve, time);
    })
}

// Enviar un missatge de tipus "herois" al servidor
function sendHerois () {
    loadData({
        type: "herois"
    })
}

// Enviar un missatge de tipus "bounce" o "broadcast" al servidor
function sendMessage (messageType) {
    let txtMissatge = document.getElementById("missatge").value
    loadData({
        type: messageType,
        text: txtMissatge
    })
}

// Aquesta funció carrega dades del servidor amb "POST"
async function loadData (dataObj) {

    // Mostra 'Carregant dades...' mentre espera
    refData = document.getElementById("data")
    refData.innerHTML = "Carregant dades..."

    // Prepara la crida POST
    let post = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataObj)
    }

    // Fa la crida POST, espera la resposta, i la deixa a 'obj'
    let receivedData = await fetch("/dades", post)
    let obj = await receivedData.json()
    
    // Forcem una espera
    await wait(500) 
    
    // Mostrar les dades rebudes
    refData.innerHTML = JSON.stringify(obj)
}

// Iniciar el client WebSocket
let locationWebSockets = window.location.origin.replace("http", "ws") // "ws://localhost:3000"
let webSocket;
function initWebSocket () {
    webSocket = new WebSocket(locationWebSockets)
    console.log("WS Connected")
    webSocket.addEventListener('close', () => { 
        console.log("WS Disconnected")
        webSocket.close()
        setTimeout(initWebSocket(), 1000) 
    })
    webSocket.addEventListener('error', (event) => { console.error(event) })
    webSocket.addEventListener('message', (event) => {
        let refDataWS = document.getElementById('dataWebSockets')
        refDataWS.innerHTML = event.data
    })
}
initWebSocket()

async function sendWebSocket () {
    let txtMissatge = document.getElementById("missatge").value
    webSocket.send(JSON.stringify({
        type: "bounce",
        text: txtMissatge
    }))
}
