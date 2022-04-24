export default class SferaPeer {
	wsConn: WebSocket
	nickname: string

	constructor(wsConn: WebSocket) {
		this.wsConn = wsConn
		this.nickname = String(`SferaPeer_${Date.now()}`)
		console.log(`A new peer has joined! Assigned nickname: ${this.nickname}`)
		wsConn.send(this.nickname)
		wsConn.onmessage = (ev: MessageEvent) => this.onMessage(ev)
	}

	onMessage (ev: MessageEvent) {
		console.log(`Peer ${this.nickname} received a message: "${ev.data}"`)
	}


}