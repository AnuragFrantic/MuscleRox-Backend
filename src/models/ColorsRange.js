const { Schema, model } = require("mongoose");

const schema = new Schema({
    settingId: {
        type: Schema.Types.ObjectId,
        ref: "Setting",
        required: true,
        index: true
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: images => images.length > 0,
            message: "At least one image is required"
        }
    }
}, { timestamps: true });

module.exports = model("ColorsRange", schema);
