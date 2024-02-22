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

paste_schema.pre("save", async function (next) {
    if (!this.address) {
        let pasteAddres;
        let uniqueId = false;
        do {
            pasteAddres = generateUniqueId({
                length: 6,
                useLetters: false,
            });

            const existing = await this.constructor.findOne({
                address: pasteAddres,
            });
            if (!existing) {
                uniqueId = true;
            }
        } while (!uniqueId);

        this.address = pasteAddres;
    }
    next();
});

// instance method to check if document has expired
paste_schema.methods.alive = async function () {
    if (this.expireDuration === 0) {
        return true;
    }
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
    if (this.expireDuration === 0) {
        return "Never"
    }
    let expiresAt = new Date(this.createdAt);
    expiresAt.setSeconds(expiresAt.getSeconds() + this.expireDuration * 60);
    return `${expiresAt.getUTCHours()}:${expiresAt.getUTCMinutes()}`;
});

const Paste = mongoose.model("Paste", paste_schema);

module.exports = Paste;
