# Sfera

<img
    src="https://user-images.githubusercontent.com/28678851/194713571-cc69abcd-661a-4079-ad95-a465d7503ac9.png" 
    style="margin: 10px;" height="150"
    alt="Sfera logo"
/>  
A web-based application for peer-to-peer file transfer within a local network. Inspired by applications such as [Airdrop](https://support.apple.com/en-us/HT204144) and [Snapdrop](https://github.com/RobinLinus/snapdrop).

**Note: This project is still experimental. Some features may not work as expected. Contributions are warmly welcomed!**

## Why use Sfera?
1. Using a USB-cable or USB-stick is bothersome.
2. Privacy and safety (encrypted peer-to-peer transfer using [WebRTC](https://developer.mozilla.org/en-US/docs/Glossary/WebRTC). The server is merely used for signalling, that is, initiating a connection).
3. Because it seems odd to use an external service (e.g. Signal or WhatsApp) to transfer a file to a device that is directly next to yours.
4. No need for an internet connection if you deploy it within your local network.
5. Because bluetooth is slow.
6. Because you get a funny nickname (such as "Communist Piranha").
7. It's open-source.

## Running the app
### Run in development mode
Run the client:
```sh
cd sfera-client
npm install   # if running for the first time, install dependencies
ng serve
```

Run the server:
```sh 
cd sfera-server
npm install  # if running for the first time, install dependencies
npm run start-server
```

You should now be able to access the app in your browser on `localhost:4200`. On the starting screen, you may enter `localhost` in the "Server Address" field and `4000` in the "Server Port" field. You can now do the same on some other device and transfer files between those two.


### Run using Docker:
This is the recommended way to deploy the app within your local network. A `Dockerfile` is provided for both client and server.  

Build the client image and run it within a new container:
```
cd sfera-client
docker build -t sfera-client .
docker run -d -p 8080:80 --name sfera-client sfera-client
```
The client is now running on port 8080. 


Build the server image and run it within a new container:
```
cd sfera-server
docker build -t sfera-server .
docker run -p -d 4000:4000 --name sfera-server sfera-server
```

## Tech Stack
- Client: [Angular](https://angular.io/) and [Angular Material](https://material.angular.io/)
- Server: [Node.js](https://nodejs.org/en/) with [Typescript](https://www.typescriptlang.org/)

## About
**License** [MIT](https://choosealicense.com/licenses/mit/)  
**Author**: Marko Žunić, BSc  

## Screenshots
![image](https://user-images.githubusercontent.com/28678851/212304694-4ece1ae8-22dc-4a02-a316-c0bb6e2bc13b.png)
