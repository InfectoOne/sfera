import { WebSocketServer } from "ws"
import * as http from "http"
import * as express from "express"
import SferaPeer  from "./SferaPeer"

const port = 4000
const app = express()
const server = http.createServer(app)
const wsServer = new WebSocketServer({server})

const peerList: SferaPeer[] = []

wsServer.on("connection", (conn: WebSocket) => {
	const newPeer = new SferaPeer(conn)
	peerList.push(newPeer)
})

server.listen(port, () => {
	console.log(`Sfera Server is now running on port ${port}.`)
})