export default class SferaPeer {
	wsConn: WebSocket
	nickname: string
	onMessage: (ev: MessageEvent) => void

	constructor(wsConn: WebSocket) {
		this.wsConn = wsConn
		this.nickname = String(`SferaPeer_${Date.now()}`)
		console.log(`A new peer has joined! Assigned nickname: ${this.nickname}`)
		wsConn.send(`Your nickname: ${this.nickname}`)
		this.onMessage = (ev: MessageEvent) => console.log(`Peer ${this.nickname} has sent a message: ${ev.data}`)
		wsConn.onmessage = (ev: MessageEvent) => this.onMessage(ev)
	}


}