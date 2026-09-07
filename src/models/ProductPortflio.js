const { Schema, model } = require("mongoose");

const schema = new Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref: "Setting",
        default: null
    },
    subcategory: {
        type: Schema.Types.ObjectId,
        ref: "Setting",
        default: null
    },
    position: {
        type: Number,
    },
    slug: {
        type: String
    },
    title: {
        type: String
    },
    sub_title: {
        type: String,
    },
    type: {
        type: String
    },

    return_url: {
        type: String,
    },
    file: {
        type: String
    },
    short_description: String,
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = new model('ProductPortfolio', schema);