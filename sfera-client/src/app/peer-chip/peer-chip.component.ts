import { Component, ElementRef, Input, NgZone, OnInit, ViewChild } from "@angular/core"
import SferaPeer from "../models/SferaPeer"
import SferaMessage from "../models/SferaMessage"
import { SignalingService } from "../signaling/signaling.service"
import { MatSnackBar } from "@angular/material/snack-bar"

@Component({
	selector: "app-peer-chip",
	templateUrl: "./peer-chip.component.html",
	styleUrls: ["./peer-chip.component.scss"]
})
export class PeerChipComponent implements OnInit{
	static CHUNK_SIZE_KB = 8 * 1024
	static RTC_CONFIG = {
		iceServers: []  // no need for a STUN/TURN server for transfers within a local network
	}

	@Input() peer!: SferaPeer
	@ViewChild("fileInput") fileInput!: ElementRef<HTMLInputElement>

	peerConnection: RTCPeerConnection | null = null
	isActive = false 
	bytesTransferred = 0
	currentFileSize = 0

	constructor(
		private signalingService: SignalingService, 
		private ngZone: NgZone, 
		private _snackBar: MatSnackBar
	) {}

	ngOnInit(): void {
		const wsConnection = this.signalingService.getWebSocketConnection()
		if (!wsConnection) {
			return
		}
		wsConnection.addEventListener("message", (ev) => {
			const sferaMsg = JSON.parse(ev.data) as SferaMessage
			if (sferaMsg.sender != this.peer.nickname) {
				return
			}
			switch (sferaMsg.type) {
			case "rtc-offer":
				const offer = sferaMsg.data as RTCSessionDescription
				const fileMetadata = sferaMsg.metadata
				if (!fileMetadata) {
					throw Error("Sfera RTC file transfer failed: No file metadata was sent!")
				}
				this.receiveFile(offer, fileMetadata)
				break
			case "rtc-answer":
				const answer = sferaMsg.data as RTCSessionDescription
				this.peerConnection?.setRemoteDescription(answer)
				break
			case "ice-candidate":
				const candidate = sferaMsg.data as RTCIceCandidate
				this.peerConnection?.addIceCandidate(candidate)
				break
			case "peer-left":
				const peerNickname = sferaMsg.sender
				if (peerNickname == this.peer.nickname && this.isActive) {
					this.isActive = false
					this.bytesTransferred = 0
					this.currentFileSize = 0
					this.peerConnection?.close()
					this._snackBar.open(`Sending file failed! Peer "${peerNickname}" left!`, "OK", {duration: 5000})
				}
			}
		})
	}

	pickFile() {
		if (this.fileInput) {
			this.fileInput.nativeElement.click()
		}
	}

	async afterPickFile() {
		if (this.fileInput) {
			const fileList = this.fileInput.nativeElement.files
			if (fileList) {
				for(const file of Array.from(fileList)) {
					await this.sendFile(file)
				}
			}
		}
	}

	async sendFile (file: File) {
		return new Promise((resolve) => {
			this.isActive = true
			this.peerConnection = new RTCPeerConnection(PeerChipComponent.RTC_CONFIG)
			this.currentFileSize = file.size

			const wsConnection = this.signalingService.getWebSocketConnection()
			if (!wsConnection) {
				this._snackBar.open("File cannot be sent! No connection with the server!", "OK", {duration: 5000})
				return
			}

			this.peerConnection.onnegotiationneeded = async () => {
				try {
					await this.peerConnection?.setLocalDescription(await this.peerConnection?.createOffer())
					const sferaMsg: SferaMessage = {
						type: "rtc-offer",
						receiver: this.peer.nickname as string,
						data: this.peerConnection?.localDescription,
						metadata: {
							name: file.name,
							type: file.type,
							size: file.size
						}
					}
					wsConnection.send(JSON.stringify(sferaMsg))
				} catch (error) {
					this._snackBar.open(`Failed to connect with "${this.peer.nickname}"!`, "OK", {duration: 5000})
					console.error(error)
				}
			}

			this.peerConnection.onicecandidate = ({candidate}) => {
				if (candidate) {
					const sferaMsg: SferaMessage = {
						type: "ice-candidate",
						receiver: this.peer.nickname,
						data: candidate
					}
					wsConnection.send(JSON.stringify(sferaMsg))
				}
			}

			const dataChannel = this.peerConnection.createDataChannel("dataChannel", {ordered: true})
			dataChannel.binaryType = "arraybuffer"

			dataChannel.onopen = async () => {

				// once RTC offers, answers and ICE candidates have been exchanged:
				// the data channel will open and file transfer can commence
				let buffer = await file.arrayBuffer()
				const sendNextChunk = () => {
					const chunk = buffer.slice(0, PeerChipComponent.CHUNK_SIZE_KB)
					buffer = buffer.slice(PeerChipComponent.CHUNK_SIZE_KB, buffer.byteLength)
					dataChannel.send(chunk)
					this.bytesTransferred += chunk.byteLength
					if (this.bytesTransferred < file.size) {
						setTimeout(sendNextChunk, 0)
					} else {
						this.isActive = false
						this.bytesTransferred = 0
						this.currentFileSize = 0
						dataChannel.close()
						this._snackBar.open(`File transfer to "${this.peer.nickname}" complete!`, "OK", {duration: 5000})
						resolve(true)
					}
				}
				this.ngZone.run(() => {
					sendNextChunk()
				})
			}
		})
	}

	async receiveFile(
		offer: RTCSessionDescription,
		metadata: {
		name: string,
		type: string,
		size: number
		}
	) {
		const wsConnection = this.signalingService.getWebSocketConnection()
		if (!wsConnection) {
			this._snackBar.open(`"${this.peer.nickname}" tried sending file, but failed! Connection with server broke!`, "OK", {duration: 5000})
			return
		}
		this.isActive = true
		this.currentFileSize = metadata.size
		this.peerConnection = new RTCPeerConnection(PeerChipComponent.RTC_CONFIG)
		this.peerConnection.setRemoteDescription(offer)
		await this.peerConnection.setLocalDescription(await this.peerConnection.createAnswer())
		const sferaMsg = {
			type: "rtc-answer",
			receiver: this.peer.nickname,
			data: this.peerConnection.localDescription
		}

		wsConnection.send(JSON.stringify(sferaMsg))

		this.peerConnection.onicecandidate = ({candidate}) => {
			if (candidate) {
				const sferaMsg = {
					type: "ice-candidate",
					receiver: this.peer.nickname,
					data: candidate
				}
				wsConnection.send(JSON.stringify(sferaMsg))
			}
		}

		const dataChannel = this.peerConnection.createDataChannel("dataChannel", {ordered: true})
		dataChannel.binaryType = "arraybuffer"
		this.peerConnection.addEventListener("datachannel", (e) => {
			// once RTC offers, answers and ICE candidates have been exchanged:
			// the data channel will open and the file transfer can commence
			const { channel }  = e
			const buffer: ArrayBuffer[] = []
			channel.onmessage = async (e) => {
				this.ngZone.run(async () => {
					const { data } = e
					const chunk = data as Blob | ArrayBuffer
					if (chunk instanceof Blob) {
						buffer.push(await chunk.arrayBuffer())
						this.bytesTransferred += chunk.size
					} else {
						buffer.push(chunk)
						this.bytesTransferred += chunk.byteLength
					}
					if (this.bytesTransferred >= metadata.size) {
						const file = new Blob(buffer)
						const url = window.URL.createObjectURL(file)
						this.downloadFromUrl(url, metadata.name)
						channel.close()
						this.isActive = false
						this.bytesTransferred = 0
						this.currentFileSize = 0
						this._snackBar.open(`Received a file from "${this.peer.nickname}"!`, "OK", {duration: 5000})
					}
				})
			}
		})
	}

	downloadFromUrl(url: string, filename: string) {
		const link = window.document.createElement("a")
		link.href = url
		link.download = filename
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}
}
