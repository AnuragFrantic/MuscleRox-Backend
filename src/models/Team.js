const { Schema, Types, model } = require("mongoose");

const Team = new Schema({
    name: String,
    position: String,
    link: String,
    file: String,
    file_type: String,
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });
module.exports = new model('Team', Team);