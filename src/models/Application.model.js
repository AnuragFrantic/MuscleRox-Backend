const { Schema, model } = require("mongoose");

const schema = new Schema(
    {
        grand_parent_id: [
            {
                type: Schema.Types.ObjectId,
                ref: "Application",
                default: [],
            },
        ],
        parent_id: [
            {
                type: Schema.Types.ObjectId,
                ref: "Application",
                default: [],
            },
        ],
        grade: [
            {
                type: Schema.Types.ObjectId,
                ref: "Grade",
                default: [],
            },
        ],
        color: {
            type: Schema.Types.ObjectId,
            ref: "Setting",
            default: [],
        },




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
        file: {
            type: String,
        },
        icon: {
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

module.exports = new model("Application", schema);