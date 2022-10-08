# Sfera (sfera-client)

Web-based application client for peer-to-peer file transfer.
## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```

### Build the app for production
```bash
quasar build
```

## Run using Docker
```
docker build -t sfera-client .
docker run -p -d 8800:8800 --name sfera-client sfera-client
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).
