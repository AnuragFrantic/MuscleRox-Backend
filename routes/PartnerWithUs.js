
const express = require("express");

const router = express.Router();

const {
    createPartner,
    getContacts,
    getContactById,
    updateContact,
    deleteContact,
} = require("../src/controller/PartnerWithUs");

// Create Partner
router.post("/", createPartner);

// Get all Partners
router.get("/", getContacts);

// Get single Partner
router.get("/:id", getContactById);

// Update Partner
router.put("/:id", updateContact);

// Delete Partner
router.delete("/:id", deleteContact);

module.exports = router;

