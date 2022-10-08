# Sfera Server
Signaling server for peer-to-peer file transfer between two Sfera clients within a local network.

## Get started
Install dependencies:  
```
npm install
```
Run using:
```
npm run start-server
```
## Run using Docker
```
docker build -t sfera-server .
docker run -p -d 4000:4000 --name sfera-server sfera-server
```