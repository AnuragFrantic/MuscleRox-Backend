const mongoose = require("mongoose");

const yearRow = {
    y2018: { type: String, default: "" },
    y2019: { type: String, default: "" },
};

const marketRowSchema = new mongoose.Schema(
    {
        ...yearRow,
        top_customers: { type: String, default: "" },
    },
    { _id: false }
);

const hrRowSchema = new mongoose.Schema(yearRow, { _id: false });

const supplierRowSchema = new mongoose.Schema(
    {
        co_name: { type: String, default: "" },
        since_year: { type: String, default: "" },
        products: { type: String, default: "" },
        geography: { type: String, default: "" },
    },
    { _id: false }
);

const distributionPartnerSchema = new mongoose.Schema(
    {
        organization_name: { type: String, required: true, trim: true },
        year_of_incorporation: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        head_office: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pin_code: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },

        department: { type: String, default: "" },
        director_partner_proprietor: { type: String, default: "" },
        applicant_details: { type: String, default: "" },
        designation_name: { type: String, default: "" },
        mobile_no: { type: String, required: true, trim: true },
        phone_no: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        educational_qualification: { type: String, required: true, trim: true },
        industries_served: {
            type: [String],
            enum: ["Coatings/ Inks", "Construction", "Plastics", "Others"],
            validate: {
                validator: (arr) => Array.isArray(arr) && arr.length > 0,
                message: "At least one industry must be selected.",
            },
        },

        market_presence: {
            paints: { type: marketRowSchema, default: () => ({}) },
            plastics: { type: marketRowSchema, default: () => ({}) },
            construction: { type: marketRowSchema, default: () => ({}) },
            others: { type: marketRowSchema, default: () => ({}) },
            total: { type: marketRowSchema, default: () => ({}) },
        },

        supplier_relationships: {
            type: [supplierRowSchema],
            default: () => [],
        },

        hr_infrastructure: {
            sales_dept: { type: hrRowSchema, default: () => ({}) },
            sales_executive: { type: hrRowSchema, default: () => ({}) },
            back_office: { type: hrRowSchema, default: () => ({}) },
            total_employees: { type: hrRowSchema, default: () => ({}) },
        },

        warehouse_area: { type: hrRowSchema, default: () => ({}) },

        confirm: { type: Boolean, required: true },

        status: {
            type: String,
            enum: ["new", "reviewed", "contacted", "rejected", "approved"],
            default: "new",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("DistributionPartner", distributionPartnerSchema);