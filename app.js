const express = require('express');
const morgan = require("morgan");
const helmet = require("helmet");
const errorMiddleware = require("./middleware/errorMiddleware");
const app = express();
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/test-error", (req, res) => {
    throw new Error("This is a test error");
});
app.use(errorMiddleware);
app.listen(3000);