# Accelerometer Data Ingest

This project is an example Node.js server that accepts data from a [Notehub proxy route](https://dev.blues.io/api-reference/notecard-api/web-requests/) and sends it to the [Edge Impulse ingestion API](https://docs.edgeimpulse.com/reference/ingestion-api).

## Starting

To run this project you must have [Node and npm](https://nodejs.org/en/download) installed. Once you do, clone or download the repository, navigate to the `accelerometer-data-ingest` folder, and use `npm install` to install all necessary dependencies.

```bash
npm install
```

Next, create a `.env` file in the root of the repository, and paste in the following code, making sure to insert your own Edge Impulse API key.

```js
EDGE_IMPULSE_API_KEY="<your Edge Impulse API key goes here>"
```

Finally, use `node` to start up the development server that accepts data from the proxy route.

```bash
node server.js
```

## Using

This project starts a server that expects data to be POSTed to `http://localhost:3000`. For use with Notehub, you need to either deploy this server to a host that’s accessible on the public internet, or use a tunnel to make your local environment accessible.

For tunneling [ngrok](https://ngrok.com/) works really well as it has a generous free tier, and can make your local environment available with a single command.

```bash
ngrok http 3000
```

This command gives you a single URL you can copy and paste into a Notehub proxy route.

## Data Format

This project expects to receive a `binary/octet-stream` of accelerometer readings, where each reading is a set of x, y, and z values represented as 32-bit floats.

See this [sample Zephyr app](https://github.com/tjvantoll/mlops-zephyr/) for an example of an implementation.