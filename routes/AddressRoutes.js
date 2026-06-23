const express = require("express");
const router = express.Router();


const { Auth } = require("../src/middleware/Auth");
const { createAddress, getAddresses, getAddressById, updateAddress, deleteAddress, setDefaultAddress } = require("../src/controller/AddressController");



router.post("/", Auth(), createAddress);
router.get("/", Auth(), getAddresses);
router.get("/:id", Auth(), getAddressById);
router.put("/:id", Auth(), updateAddress);
router.delete("/:id", Auth(), deleteAddress);
router.patch("/default/:id", Auth(), setDefaultAddress);

module.exports = router;