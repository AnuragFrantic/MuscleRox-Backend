const express = require("express");
const router = express.Router();

const {
    create_application,
    get_application,
    update_application,
    delete_application,
    update_activation,
} = require("../src/controller/Application.Controller");
const Store = require("../src/middleware/Store");


// =========================
// APPLICATION ROUTES
// =========================

// Create
router.post(
    "/",
    Store("any").fields([
        { name: "file", maxCount: 1 },
        { name: "icon", maxCount: 1 },
    ]),
    create_application
);



// Get all / filter
router.get(
    "/",
    get_application
);

// Update
router.put(
    "/:id",
    Store("any").fields([
        { name: "file", maxCount: 1 },
        { name: "icon", maxCount: 1 },
    ]),
    update_application
);

// Delete
router.delete(
    "/:id",
    delete_application
);

// Toggle active/inactive
router.patch(
    "/activation/:id",
    update_activation
);


module.exports = router;