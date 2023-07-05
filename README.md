# Gordian SDK Examples
This project contains example back and frontends for integrating the Gordian SDK. More information is available here: https://docs.gordiansoftware.com/docs/seat-widget-configuration.

The example frontends in this project are designed to interact with the included example backend. You must have Node and NPM to run these examples.

## Setup
### Backend
The example backend is in the `backend` folder. This must be setup first so the example frontends can interact with it. See `.env.example` for how to setup your local `.env` file. You must have a Gordian sandbox API key to use this backend. 

To start the backend, add your Gordian API key to your local `.env`. Navigate to the `backend` project, install dependencies and start the server, which will run on port 8080.

```
cd backend
npm install
node app.js
```

### Next.js Frontend
This example Next.js frontend loads the Gordian SDK and interacts with the example backend. You must setup the `backend` project (instructions above) to use this example frontend.

To start the frontend, navigate to the `nextjs` project, install dependencies and start the frontend, which will run on port 3000.

```
cd nextjs
npm install
npm run dev
```