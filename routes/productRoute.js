const { Router } = require("express");

const Store = require("../src/middleware/Store");

const { GuestAuth } = require("../src/middleware/GuestAuth");
const { Auth } = require("../src/middleware/Auth");
const {
    createProduct,
    updateProduct,
    getProducts,
    getProduct,
    deleteProduct,
    getRelatedProducts,
    deleteProductImage,
} = require("../src/controller/ProductController");
const router = Router();

// added "image" (schema's single main image) alongside the existing gallery/file fields
router.post(
    "/",
    Store("any").fields([
        { name: "image", maxCount: 1 },
        { name: "color_range", maxCount: 10 },
        { name: "data_sheet", maxCount: 20 },
        { name: "safety_data_sheet", maxCount: 20 },
    ]),
    createProduct
);

router.put(
    "/:id",
    Store("any").fields([
        { name: "image", maxCount: 1 },
        { name: "color_range", maxCount: 10 },
        { name: "data_sheet", maxCount: 20 },
        { name: "safety_data_sheet", maxCount: 20 },
    ]),
    updateProduct
);

// "/related" must stay above "/:id" or Express will treat "related" as an :id value
router.get("/related", getRelatedProducts);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.delete("/:id", deleteProduct);
router.delete("/:id/image/:imageId", deleteProductImage);

module.exports = router;