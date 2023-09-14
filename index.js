const express = require("express");
const mongoose = require("mongoose");
const generateUniqueId = require("generate-unique-id");

const app = express();

const paste_schema = new mongoose.Schema({
  text: String,
  address: String,
  createdAt: {
    type: Date,
    default: () => {
      const now = new Date();
      now.setHours(now.getHours() + 5);
      now.setMinutes(now.getMinutes() + 30);
      return now;
    },
  },
});

paste_schema.pre("save", function (next) {
  if (!this.address) {
    const pasteAddres = generateUniqueId({
      length: 6,
      useLetters: true,
    });
    this.address = pasteAddres;
    console.log(this.address);
  }
  next();
});

const Paste = mongoose.model("Paste", paste_schema);

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

app.get('/view/:id', async (req, res) => {
  const { id } = req.params;

  const Text = await Paste.findOne({ address: id });
  console.log(Text);

  if(!Text) {
    console.log("Cannot find paste link");
    return res.send('Error');
  }
  res.render('view', { Text });
})

// http://localhost:3000/view/d132t6

app.listen(3000, () =>
  console.log(`LISTENING ON PORT 3000\nhttp://localhost:${3000}`)
);
