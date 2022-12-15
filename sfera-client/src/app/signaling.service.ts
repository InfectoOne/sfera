import { Injectable } from '@angular/core';
import SferaPeer from './models/SferaPeer';
import SferaMessage from './models/SferaMessage';

@Injectable({
  providedIn: 'root'
})
export class SignalingService {

  serverIp: string | null = null
  serverPort: number | null = null
  LOCALSTORAGE_SERVERIP_KEY = "server_address"
  LOCALSTORAGE_SERVERPORT_KEY = "server_port"
  nickname = ""
  peersOnline: SferaPeer[] = []
  chatMessageList: string[] =[]
  isConnected = false
  wsConnection: WebSocket | null = null

  constructor() { }

  async connect(ip: string, port: number, remember = false){
    if (this.isConnected) {
      this.wsConnection?.close()
    }
    this.serverIp = ip
    this.serverPort = port
    return new Promise((resolve, reject) => {
      this.wsConnection = new WebSocket(`ws://${this.serverIp}:${this.serverPort}`)
      this.wsConnection.onopen = () => {
        console.log("Connected!")
        this.isConnected = true
        if(remember) {
          localStorage.setItem(this.LOCALSTORAGE_SERVERIP_KEY, ip)
          localStorage.setItem(this.LOCALSTORAGE_SERVERPORT_KEY, String(port))
        }
        resolve(true)

      }
      this.wsConnection.onclose = () => {
        this.isConnected = false
        reject()
      }

      this.wsConnection.onmessage = async (ev: MessageEvent) => {
        const sferaMsg = JSON.parse(ev.data) as SferaMessage
        switch (sferaMsg.type) {
        case "chat-message":
          if (sferaMsg.data) {
            this.chatMessageList.push(sferaMsg.data as string)
          }
          break
        case "peer-list":
          if (sferaMsg.peerList) {
            this.peersOnline = sferaMsg.peerList
          }
          break
        case "peer-joined":
          if (sferaMsg.peerList) {
            this.peersOnline.push(...sferaMsg.peerList)
          }
          break
        case "peer-left":
          const peerNickname = sferaMsg.sender as string
          const index = this.peersOnline.findIndex(p => p.nickname == peerNickname)
          if (index != -1) {
            this.peersOnline.splice(index, 1)
          }
          break
        case "nickname":
          if (sferaMsg.data) {
            this.nickname = sferaMsg.data as string
          }
          break
        }
      }
    })
  }
}
