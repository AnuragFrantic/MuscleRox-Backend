const mongoose = require("mongoose");
const { Schema } = mongoose;

const contactSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        company_name: {
            type: String,
            default: "",
        },

        file: {
            type: String
        },

        phone: {
            type: String,
            default: "",
        },

        product: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            required: false,
        },

        type: {
            type: String,
            default: "",
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        message: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Contact", contactSchema);