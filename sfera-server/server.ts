import { WebSocketServer } from "ws"
import * as http from "http"
import * as express from "express"
import SferaPeer from "./SferaPeer"
import {Request} from 'express';


const port = 4000
const app = express()
const server = http.createServer(app)
const wsServer = new WebSocketServer({server})

const peerList: SferaPeer[] = []

const getFellowsOfPeer = (peer: SferaPeer) => peerList.filter(p => p.nickname != peer.nickname)

wsServer.on("connection", (conn: WebSocket, request: Request) => {
	const peer = new SferaPeer(conn, request)
	peerList.push(peer)
	const fellowPeers = getFellowsOfPeer(peer)
	fellowPeers.forEach(p => p.send({
		type: "peer-joined",
		peerList : [
			{
				nickname: peer.nickname,
				ipAddress: peer.ipAddress
			}
		]
	}))
	peer.send({
		type: "peer-list",
		peerList: fellowPeers.map(p => {
			return {
				nickname: p.nickname,
				ipAddress: p.ipAddress
			}
		})
	})

	peer.onMessage = (ev: MessageEvent) => {
		const message = ev.data
		const fellowPeers = getFellowsOfPeer(peer)
		fellowPeers.forEach(p => p.wsConn.send(message))
	}
})

server.listen(port, () => {
	console.log(`Sfera Server now running on port ${port}.`)
})