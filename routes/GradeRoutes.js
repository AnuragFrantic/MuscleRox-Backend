
const { Router } = require("express");

const { Auth } = require("../src/middleware/Auth");
const { get_grade, create_grade, update_grade, delete_grade, update_activation } = require("../src/controller/GradeController");
const { GuestAuth } = require("../src/middleware/GuestAuth");
const Store = require("../src/middleware/Store");

const router = Router();


// Get Grades
router.get("/", get_grade);


// Create Grade
router.post(
    "/",
    Auth("Admin"),
    Store("any").single("file"),
    create_grade
);


// Update Grade
router.put(
    "/update/:id",
    Auth("Admin"),
    Store("any").single("file"),
    update_grade
);


// Delete Grade
router.delete(
    "/delete/:id",
    Auth("Admin"),
    delete_grade
);


// Update Grade Activation
router.put(
    "/activation/:id",
    Auth("Admin"),
    update_activation
);


module.exports = router;

