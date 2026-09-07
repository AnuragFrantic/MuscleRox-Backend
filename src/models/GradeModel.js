const { Schema, model } = require("mongoose");

const schema = new Schema(
    {
        parent: [
            {
                type: Schema.Types.ObjectId,
                ref: "Setting",
                default: [],
            },
        ],

        position: {
            type: Number,
        },

        slug: {
            type: String,
        },

        title: {
            type: String,
        },

        sub_title: {
            type: String,
        },

        type: {
            type: String,
        },

        media_value: {
            type: String,
        },

        return_url: {
            type: String,
        },

        file: {
            type: String,
        },

        short_description: String,

        description: String,

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = new model("Grade", schema);