const express = require("express");

const router = express.Router();



const Store = require("../src/middleware/Store");


const {
    createProductPortfolio,
    getProductPortfolios,
    getProductPortfolioById,
    updateProductPortfolio,
    deleteProductPortfolio,
} = require("../src/controller/ProductPortfolio");
// Create
router.post(
    "/",
    Store("any").fields([
        { name: "file", maxCount: 1 },
    ]),
    createProductPortfolio
);


// Get All
router.get("/", getProductPortfolios);


// Get By ID
router.get("/:id", getProductPortfolioById);


// Update
router.put(
    "/:id",
    Store("any").fields([
        { name: "file", maxCount: 1 },
    ]),
    updateProductPortfolio
);


// Delete
router.delete("/:id", deleteProductPortfolio);


module.exports = router;