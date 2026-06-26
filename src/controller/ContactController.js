const Contact = require("../models/Contact");

// CREATE CONTACT
exports.createContact = async (req, res) => {
    try {
        const {
            name,
            company_name,
            phone,
            product,
            type,
            email,
            message,
        } = req.body;

        const file = req.files?.file?.[0]
            ? req.files.file[0].path.replace(/\\/g, "/")
            : null;

        if (!name || !email) {
            return res.status(400).json({
                success: 0,
                message: "Name, Email, Product and Message are required",
            });
        }

        const contact = await Contact.create({
            name,
            company_name,
            phone,
            product,
            type,
            email,
            message,
            file,
        });

        return res.status(201).json({
            success: 1,
            message: "Contact created successfully",
            data: contact,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// GET ALL CONTACTS
exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find()
            .populate("product", "title")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: 1,
            count: contacts.length,
            data: contacts,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// GET SINGLE CONTACT
exports.getContactById = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findById(id).populate(
            "product",
            "title"
        );

        if (!contact) {
            return res.status(404).json({
                success: 0,
                message: "Contact not found",
            });
        }

        return res.status(200).json({
            success: 1,
            data: contact,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// DELETE CONTACT
exports.deleteContact = async (req, res) => {
    try {
        const { id } = req.params;

        const contact = await Contact.findByIdAndDelete(id);

        if (!contact) {
            return res.status(404).json({
                success: 0,
                message: "Contact not found",
            });
        }

        return res.status(200).json({
            success: 1,
            message: "Contact deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};