import { WebSocketServer } from "ws"
import * as http from "http"
import * as express from "express"
import SferaPeer from "./SferaPeer"
import {Request} from 'express';
import SferaMessage from "./SferaMessage";


const port = 4000
const app = express()
const server = http.createServer(app)
const wsServer = new WebSocketServer({server})

const peerList: SferaPeer[] = []

// const getFellowsOfPeer = (peer: SferaPeer) => peerList.filter(p => p.nickname != peer.nickname && p.ipAddress != peer.ipAddress)
const getFellowsOfPeer = (peer: SferaPeer) => peerList

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
		type: "nickname",
		data: peer.nickname
	})
	peer.send({
		type: "peer-list",
		peerList: fellowPeers.map(p => {
			return {
				nickname: p.nickname,
				ipAddress: p.ipAddress
			}
		}),
	})
	
	peer.onMessage = (ev: MessageEvent) => {
		const sferaMsg = JSON.parse(ev.data) as SferaMessage
		const fellowPeers = getFellowsOfPeer(peer)
		if (sferaMsg.receiver == "*") {
			fellowPeers.forEach(p => p.send(sferaMsg))
		} else {
			const receiver = fellowPeers.find(p => p.nickname == sferaMsg.receiver)
			if (receiver) {
				sferaMsg.sender = peer.nickname
				receiver.send(sferaMsg)
			}
		}
	}
	
	peer.onClose = (ev: CloseEvent) => {
		const index = peerList.findIndex(p => p == peer)
		if (index != -1) {
			peerList.splice(index, 1)
			console.log(`Peer ${peer.nickname} disconnected!`)
			peerList.forEach(p => p.send({
				type: "peer-left",
				sender: peer.nickname
			}))

		}
	}
})

server.listen(port, () => {
	console.log(`Sfera Server now running on port ${port}.`)
})