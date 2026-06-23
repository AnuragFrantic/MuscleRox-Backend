const { Router } = require("express");

const Store = require("../src/middleware/Store");

const { GuestAuth } = require("../src/middleware/GuestAuth");
const { Auth } = require("../src/middleware/Auth");
const { createProduct, updateProduct, getProducts, getProduct, deleteProduct } = require("../src/controller/ProductController");
const router = Router();
router.post(
    "/",
    Store("any").fields([
        { name: "image", maxCount: 1 },
        { name: "data_sheet", maxCount: 20 },
    ]),
    createProduct
);

router.put(
    "/:id",
    Store("any").fields([
        { name: "image", maxCount: 1 },
        { name: "data_sheet", maxCount: 20 },
    ]),
    updateProduct
);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.delete("/:id", deleteProduct);

module.exports = router;