require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");

const Paste = require("./models/paste");

const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URI =
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/paste-service";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB connected : ${conn.connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "static")));

class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.status = status;
        this.message = message;
        this.byuser = true;
    }
}

app.get("/", async (req, res) => {
    res.render("home");
});

app.post("/", async (req, res, next) => {
    try {
        console.log(req.body);
        const { text } = req.body;
        if (!text) {
            throw new ExpressError("Invalid text input", 400);
        }
        let expireDuration = parseInt(req.body.expireDuration);
        const Text = new Paste({ text, expireDuration });

        await Text.save();

        res.redirect(`/view/${Text.address}`);
    } catch (e) {
        next(e);
    }
});

app.get("/view/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const Text = await Paste.findOne({ address: id });

        if (!Text) {
            throw new ExpressError("Cannot find the paste link", 404);
        }

        const isAlive = await Text.alive();
        if (isAlive) {
            return res.render("view", { Text });
        }

        throw new ExpressError("Link Expired or don't exists", 404);
    } catch (e) {
        next(e);
    }
});

app.get("/edit/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const Text = await Paste.findOne({ address: id });

        if (!Text) {
            throw new ExpressError("Cannot find the paste link", 404);
        }

        const isAlive = await Text.alive();
        if (isAlive) {
            return res.render("edit", { Text });
        }
        return res.send("Expired");
    } catch (e) {
        next(e);
    }
});

app.patch("/edit/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        const Text = await Paste.findOne({ address: id });
        if (!Text) {
            throw new ExpressError("Cannot find the paste link", 404);
        }
        await Paste.updateOne({ address: id }, { text });

        res.redirect(`/view/${id}`);
    } catch (e) {
        next(e);
    }
});

app.get("*", (req, res) => {
    throw new ExpressError("Page not found", 404);
});

app.use((err, req, res, next) => {
    console.log(err.message);
    if (err.byuser) {
        return res.status(err.status).render("error", { err });
    }
    err.status = 500;
    err.message = "Something went wrong.";
    res.status(err.status).render("error", { err });
});

connectDB()
    .then(() => {
        app.listen(3000, () =>
            console.log(`LISTENING ON PORT 3000\nhttp://localhost:${PORT}`)
        );
    })
    .catch((err) => {
        console.log("This part got hit.\n");
        console.log(err);
    });
