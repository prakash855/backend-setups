import express from "express";
import "dotenv/config";
import logger from "./logger.js";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  }),
);

let teaData = [],
  nextId = 1;

app.post("/teas", (req, res) => {
  const { name, origin, flavor } = req.body;
  if (!name || !origin || !flavor) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const newTea = { id: nextId++, name, origin, flavor };
  teaData.push(newTea);
  res.status(201).json(newTea);
});

app.get("/teas", (req, res) => {
  res.status(200).send(teaData);
});

app.get("/teas/:id", (req, res) => {
  const teaId = parseInt(req.params.id);
  const tea = teaData.find((t) => t.id === teaId);
  if (!tea) {
    return res.status(404).json({ error: "Tea not found" });
  }
  res.status(200).json(tea);
});

app.put("/teas/:id", (req, res) => {
  const teaId = parseInt(req.params.id);
  const teaIndex = teaData.findIndex((t) => t.id === teaId);
  if (teaIndex === -1) {
    return res.status(404).json({ error: "Tea not found" });
  }
  const { name, origin, flavor } = req.body;
  if (!name || !origin || !flavor) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  teaData[teaIndex] = { id: teaId, name, origin, flavor };
  res.status(200).json(teaData[teaIndex]);
});

app.delete("/teas/:id", (req, res) => {
  const teaId = parseInt(req.params.id);
  const teaIndex = teaData.findIndex((t) => t.id === teaId);
  if (teaIndex === -1) {
    return res.status(404).json({ error: "Tea not found" });
  }
  teaData.splice(teaIndex, 1);
  res.status(204).send();
});

app.listen(port, () => {
  console.log("Server is running on port 3000");
});
