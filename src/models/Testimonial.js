const { Schema, Types, model } = require("mongoose");

const testimonialSchema = new Schema({
    type: {
        type: String,
        default: "testimonial"
    },
    rating: {
        type: String,
    },
    name: String,
    sub_label: String,
    sub_title: String,
    file: String,
    file_type: String,
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });
module.exports = new model('Testimonial', testimonialSchema);