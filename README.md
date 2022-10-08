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
6. Because you may get a funny nickname (such as "Communist Piranha").
7. It's open-source.

All of the criteria above apply to [Snapdrop](https://github.com/RobinLinus/snapdrop), too, however, deploying one's own local Snapdrop instance that is *not* open to the outside is (or was) troublesome for many users (myself included), hence Sfera came to be.

## Running the app
### Run in development mode
Run the client:
```
cd sfera-client
quasar dev
```

Run the server:
```
cd sfera-server
npm run start-server
```

You should now be able to access the app in your browser on `localhost:8800`. On the starting screen, you may enter `localhost` in the "Server Address" field and `4000` in the "Server Port" field. You can now do the same on some other device and transfer files between those two.


### Run using Docker:
This is the recommended way to deploy the app within your local network. A `Dockerfile` is provided for both client and server.  

Build the client image and run it within a new container:
```
cd sfera-client
docker build -t sfera-client .
docker run -p -d 8800:8800 --name sfera-client sfera-client
```

Build the server image and run it within a new container:
```
cd sfera-server
docker build -t sfera-server .
docker run -p -d 4000:4000 --name sfera-server sfera-server
```

## Tech Stack
- Client: [Vue 3](https://vuejs.org/) with with [Typescript](https://www.typescriptlang.org/) and [Quasar Material Framework](https://quasar.dev/)
- Protocol: [WebRTC](https://developer.mozilla.org/en-US/docs/Glossary/WebRTC)
- Server: [Node.js](https://nodejs.org/en/) with [Typescript](https://www.typescriptlang.org/)

## About
**License** [MIT](https://choosealicense.com/licenses/mit/)  
**Author**: Marko Žunić, BSc  

## Support the project
Sfera is a free open-source project I work on in my spare time. Buy me a beer and let's give a toast to open-source developers! :beers:


[<img src="https://pics.paypal.com/00/s/MTdhMWZmNTUtOWQ1Yi00YmRjLWJjMjgtY2Y0NTNhODM0OTJl/file.PNG" height="80">](https://www.paypal.com/donate?hosted_button_id=M63C8DAMV5YDJ)

## Screenshots
![image](https://user-images.githubusercontent.com/28678851/194714736-c98297e1-eaed-4177-995d-25524521b774.png)
