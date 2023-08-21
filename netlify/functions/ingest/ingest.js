const fetch = require("node-fetch");

const extractData = (payload) => {
  const data = [];

  try {
    const buffer = Buffer.from(payload, "binary");
    const dataView = new DataView(buffer.buffer);

    for (let i = 0; i < buffer.length; i += 6) {
      data.push([
        dataView.getInt16(i, true),
        dataView.getInt16(i + 2, true),
        dataView.getInt16(i + 4, true),
      ]);
    }

    return data;
  } catch (e) {
    console.log("Error parsing payload buffer", e);
  }
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

  await fetch("https://ingestion.edgeimpulse.com/api/training/data", {
    method: "POST",
    headers: {
      "x-api-key": "ei_5221cd19544321a0a78e85566dfcaae52b9f94dcf1b3e7ad",
      "x-file-name": "test",
      "x-label": "idle",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

exports.handler = async function (event, context) {
  const data = extractData(event.body);
  await publishData(data);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Success" }),
  };
};
