const express = require('express');
const errorMiddleware = require("./src/middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.get("/test-error", (req, res,next) => {
    throw new Error("This is a test error");
});
app.use("/api/auth", authRoutes);
app.use(errorMiddleware);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});