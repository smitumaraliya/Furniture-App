require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const server = express();
const dbURL = process.env.MONGO_URL;
const port = process.env.PORT;
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

server.use(morgan("dev"));
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.get("/", (req, res) => {
    res.send("Welcome to my App");
});

server.use("/api/user", userRoutes);
server.use("/api/product", productRoutes);
server.use("/api/cart", cartRoutes);
server.use("/api/order", orderRoutes);

server.listen(port, () => {

    // Database Connection
    mongoose
        .connect(dbURL)
        .then(() => console.log("Database Connection Success...."))
        .catch((err) => console.log(err));

    console.log(`Server start at http://localhost:${port}`);
});