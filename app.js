const express = require('express')
const fs = require('fs/promises')
const https = require('https')
var mysql = require('mysql2');
const url = require('url')
const { v4: uuidv4 } = require('uuid')
const post = require('./post.js')

// Iniciar servidors HTTP
const app = express()

// Configurar el port del servidor HTTP
const port = process.env.PORT || 3000

// Publicar els arxius HTTP de la carpeta 'public'
app.use(express.static('public'))

// Activar el servidor HTTP
const httpServer = app.listen(port, appListen)
function appListen () {
  console.log(`Example app listening for HTTP queries on: ${port}`)
}

// Definir URLs del servidor HTTP
app.get('/direccioURL', getIndex)
async function getIndex (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
  res.end("Aquestes són les dades que el servidor retorna per un missatge 'GET' a la direcció '/direccioURL'")
}

// Definir URL per les dades tipus POST
app.post('/dades', getDades)
async function getDades (req, res) {
  let receivedPOST = await post.getPostData(req)
  let result = {};

  if (receivedPOST) {
    if (receivedPOST.type == "herois") {
      result = { result: "Has demanat dades tipus 'herois'" }
    }
    if (receivedPOST.type == "bounce") {
      result = { result: `Has demanat que et reboti el missatge: ${receivedPOST.text}` }
    }
    if (receivedPOST.type == "broadcast") {
      result = { result: `Has demanat fer un broadcast del missatge: ${receivedPOST.text}` }
      broadcast({ type: "broadcastResponse", text: receivedPOST.text })
    }
    if (receivedPOST.type == "listTables") {
      result = { result: await queryDatabase(`SHOW TABLES`) }
    }
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(result))
}

const WebSocket = require('ws')
const wss = new WebSocket.Server({ server: httpServer })
const socketsClients = new Map()
console.log(`Example app listening for WebSocket queries on: http://localhost:${port}`)


wss.on('connection', (ws) => {
  console.log("Client connected")

  // Add client to the clients list
  const id = uuidv4()
  const color = Math.floor(Math.random() * 360)
  const metadata = { id, color }
  socketsClients.set(ws, metadata)

  // What to do when a client is disconnected
  ws.on("close", () => {
    socketsClients.delete(ws)
  })

  // What to do when a client message is received
  ws.on('message', (bufferedMessage) => {
    var messageAsString = bufferedMessage.toString()
    var messageAsObject = {}
    
    try { messageAsObject = JSON.parse(messageAsString) } 
    catch (e) { console.log("Could not parse bufferedMessage from WS message") }

    if (messageAsObject.type == "bounce") {
      var rst = { type: "response", text: `Rebotar Websocket: '${messageAsObject.text}'` }
      ws.send(JSON.stringify(rst))
    } else if (messageAsObject.type == "broadcast") {
      var rst = { type: "response", text: `Broadcast Websocket: '${messageAsObject.text}'` }
      broadcast(rst)
    }
  })
})

// Send a message to all clients
async function broadcast (obj) {

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      var messageAsString = JSON.stringify(obj)
      client.send(messageAsString)
    }
  })
}

// Get the list of database tables from mysql
function queryDatabase (query) {

  return new Promise((resolve, reject) => {
    var connection = mysql.createConnection({
      host: process.env.MYSQLHOST || "localhost",
      port: process.env.MYSQLPORT || 3306,
      user: process.env.MYSQLUSER || "root",
      password: process.env.MYSQLPASSWORD || "",
      database: process.env.MYSQLDATABASE || "test"
    });

    connection.query(query, (error, results) => { 
      if (error) reject(error);
      resolve(results)
    });
     
    connection.end();
  })
}