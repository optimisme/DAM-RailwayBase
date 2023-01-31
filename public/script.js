
// Aquesta funció genera una espera de "time" milisegons en funcions "async"
function wait (time) {
    return new Promise((resolve, request) => {
        setTimeout(resolve, time);
    })
}

// Enviar un missatge de tipus "consola" al servidor
async function mostraConsola (nom) {
    var obj = await loadData({
        type: "consola",
        name: nom
    })

    // Mostrar les dades rebudes
    var refData = document.getElementById("data")
    refData.innerHTML = `
    <h2>${obj.result.name}</h2>
    <p>Any: ${obj.result.date}</p>
    <p>Marca: ${obj.result.brand}</p>
    <img src="${obj.result.image}"/>`
}

// Enviar un missatge de tipus "marques" al servidor
async function mostraMarques () {
    var obj = await loadData({
        type: "marques"
    })

    var refData = document.getElementById("data")
    refData.innerHTML = JSON.stringify(obj.result)
}

// Aquesta funció carrega dades del servidor amb "POST"
async function loadData (dataObj) {

    // Mostra 'Carregant dades...' mentre espera
    var refData = document.getElementById("data")
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
    
    return obj
}

// Enviar un missatge de tipus "bounce" o "broadcast" al servidor
function sendMessage (messageType, txtMessage) {
    sendWebSocket({
        type: messageType,
        message: txtMessage
    })
}

// Iniciar el client WebSocket
let locationWebSockets = window.location.origin.replace("http", "ws") // "ws://localhost:8888"
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
        let refMessage = document.getElementById('message')
        refMessage.innerHTML = event.data
    })
}
initWebSocket()

async function sendWebSocket (obj) {
    webSocket.send(JSON.stringify(obj))
}

