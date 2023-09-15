const express = require("express");
const mongoose = require("mongoose");

const Paste = require("./models/paste");

const app = express();

mongoose
    .connect("mongodb://127.0.0.1:27017/paste-service")
    .then((data) => {
        console.log("CONNECTION ESTABLISHED.");
    })
    .catch((err) => {
        console.log("Error while connecting !!!");
    });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

PORT = 3000;

app.get("/", async (req, res) => {
    res.render("home");
});

app.post("/", async (req, res) => {
    const { text } = req.body;
    const Text = new Paste({ text });

    await Text.save();

    res.redirect(`/view/${Text.address}`);
});

app.get("/view/:id", async (req, res) => {
    const { id } = req.params;

    const Text = await Paste.findOne({ address: id });
    console.log(Text);

    if (!Text) {
        console.log("Cannot find paste link");
        return res.send("Error");
    }

    const isAlive = await Text.alive();
    if (isAlive) {
        return res.render("view", { Text });
    }

    return res.send("Expired");
});

app.listen(3000, () =>
    console.log(`LISTENING ON PORT 3000\nhttp://localhost:${3000}`)
);
