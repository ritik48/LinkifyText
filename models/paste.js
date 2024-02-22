const mongoose = require("mongoose");
const generateUniqueId = require("generate-unique-id");

const paste_schema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    address: String,
    expireDuration: Number,
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
        });
        this.address = pasteAddres;
        console.log(this.address);
    }
    next();
});

// instance method to check if document has expired
paste_schema.methods.alive = async function () {
    const createdAt = new Date(this.createdAt);
    expiresAt = createdAt.setSeconds(
        createdAt.getSeconds() + this.expireDuration * 60
    );

    // converting current time to indian time we have to
    // offset it by 5:30 => 19800000 ms
    const current_time = new Date(Date.now() + 19800000);

    if (expiresAt <= current_time) {
        await this.deleteOne();
        return false;
    }
    return true;
};

// virtual property 'expireAt'
paste_schema.virtual("expiresAt").get(function () {
    let expiresAt = new Date(this.createdAt);
    expiresAt.setSeconds(
        expiresAt.getSeconds() + this.expireDuration * 60
    );
    return `${expiresAt.getUTCHours()}:${expiresAt.getUTCMinutes()}`;
});

const Paste = mongoose.model("Paste", paste_schema);

module.exports = Paste;
