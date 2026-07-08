const { Schema, model } = require("mongoose");

const AboutHomeSchema = new Schema(
    {
        section_title: {
            type: String,
            default: "ABOUT MUSCLEROX",
            trim: true,
        },


        heading: {
            type: String,
            required: true,
            trim: true,
        },
        bar_description: {
            type: String,
        },

        description: {
            type: String,
        },

        experience: {
            type: Number,
            default: 25,
        },

        experience_suffix: {
            type: String,
            default: "+",
        },

        experience_text: {
            type: String,
            default: "Year Of Experience",
        },

        image: {
            type: String,
        },



        features: [
            {
                title: {
                    type: String,
                    required: true,
                },
            },
        ],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = model("AboutHome", AboutHomeSchema);