const bodyParser = require("body-parser");
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
const port = 3000;
app.use(bodyParser.raw({ type: "application/octet-stream" }));

const extractData = (payload) => {
  const data = [];

  try {
    const buffer = Buffer.from(payload, "binary");
    const dataView = new DataView(buffer.buffer);

    for (let i = 0; i <= buffer.length - 1; i += 12) {
      let x = dataView.getFloat32(i, true);
      let y = dataView.getFloat32(i + 4, true);
      let z = dataView.getFloat32(i + 8, true);
      if (
        x > -1000 &&
        x < 1000 &&
        y > -1000 &&
        y < 1000 &&
        z > -1000 &&
        z < 1000
      ) {
        data.push([x, y, z]);
      }
    }

    console.log(JSON.stringify(data));

    return data;
  } catch (e) {
    console.log("Error parsing payload buffer", e);
  }
};

const readBodyAsBuffer = async (req) => {
  return new Promise((resolve, reject) => {
    let body = [];
    req.on("data", (chunk) => {
      body.push(chunk);
    });
    req.on("end", () => {
      resolve(Buffer.concat(body));
    });
    req.on("error", (err) => {
      reject(err);
    });
  });
};

const publishData = async (data) => {
  const emptySignature = Array(64).fill("0").join("");
  const body = {
    protected: {
      ver: "v1",
      alg: "none",
      iat: Math.floor(Date.now() / 1000),
    },
    signature: emptySignature,
    payload: {
      device_name: "device-1",
      device_type: "LIS2HH12",
      interval_ms: 1,
      sensors: [
        { name: "accX", units: "m/s2" },
        { name: "accY", units: "m/s2" },
        { name: "accZ", units: "m/s2" },
      ],
      values: data,
    },
  };

  try {
    await fetch("https://ingestion.edgeimpulse.com/api/training/data", {
      method: "POST",
      headers: {
        "x-api-key": process.env.EDGE_IMPULSE_API_KEY,
        "x-file-name": "test",
        "x-label": "idle",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    console.log("Error publishing data", e);
  }
};

app.post("/", async (req, res) => {
  const buffer = await readBodyAsBuffer(req);
  const data = extractData(buffer);
  await publishData(data);
  res.send("POST request received");
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
