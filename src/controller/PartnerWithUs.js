
const Contact = require("../models/PartnerWithUs");

// CREATE PARTNER
exports.createPartner = async (req, res) => {
    try {
        const {
            name,
            company_name,
            company_website,
            country,
            city,
            phone,
            current_location,
            category,
            subcategory,
            email,
            message,
        } = req.body;

        // Required fields
        if (!name || !email) {
            return res.status(400).json({
                success: 0,
                message: "Name and Email are required",
            });
        }

        const contact = await Contact.create({
            name,
            company_name,
            company_website,
            country,
            city,
            phone,
            current_location,
            category,
            subcategory,
            email,
            message,
        });

        return res.status(201).json({
            success: 1,
            message: "Partner created successfully",
            data: contact,
        });
    } catch (error) {
        console.log("Create Partner Error:", error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};


// GET ALL PARTNERS
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .populate("category")
            .populate("subcategory")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: 1,
            count: contacts.length,
            data: contacts,
        });
    } catch (error) {
        console.log("Get Partners Error:", error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};


// GET SINGLE PARTNER
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id)
            .populate("category")
            .populate("subcategory");

        if (!contact) {
            return res.status(404).json({
                success: 0,
                message: "Partner not found",
            });
        }

        return res.status(200).json({
            success: 1,
            data: contact,
        });
    } catch (error) {
        console.log("Get Partner By ID Error:", error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};


// UPDATE PARTNER
exports.updateContact = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            company_name,
            company_website,
            country,
            city,
            phone,
            current_location,
            category,
            subcategory,
            email,
            message,
        } = req.body;

        // Find existing partner
        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({
                success: 0,
                message: "Partner not found",
            });
        }

        // Update fields
        contact.name = name ?? contact.name;
        contact.company_name = company_name ?? contact.company_name;
        contact.company_website =
            company_website ?? contact.company_website;
        contact.country = country ?? contact.country;
        contact.city = city ?? contact.city;
        contact.phone = phone ?? contact.phone;
        contact.current_location =
            current_location ?? contact.current_location;
        contact.category = category ?? contact.category;
        contact.subcategory = subcategory ?? contact.subcategory;
        contact.email = email ?? contact.email;
        contact.message = message ?? contact.message;

        await contact.save();

        return res.status(200).json({
            success: 1,
            message: "Partner updated successfully",
            data: contact,
        });
    } catch (error) {
        console.log("Update Partner Error:", error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};


// DELETE PARTNER
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: 0,
                message: "Partner not found",
            });
        }

        return res.status(200).json({
            success: 1,
            message: "Partner deleted successfully",
        });
    } catch (error) {
        console.log("Delete Partner Error:", error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

