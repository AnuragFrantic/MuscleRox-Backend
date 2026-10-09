const { Router } = require("express");
const Store = require("../src/middleware/Store");
const { Auth } = require("../src/middleware/Auth");
const {
    create_colors_range,
    get_colors_ranges,
    get_colors_range,
    get_colors_ranges_by_setting_slug,
    update_colors_range,
    delete_colors_range
} = require("../src/controller/ColorsRangeController");

const router = Router();

router.get("/", get_colors_ranges);
router.get("/setting/:slug", get_colors_ranges_by_setting_slug);
router.get("/:id", get_colors_range);
router.post("/", Auth("Admin"), Store("image").array("images", 20), create_colors_range);
router.put("/:id", Auth("Admin"), Store("image").array("images", 20), update_colors_range);
router.delete("/:id", Auth("Admin"), delete_colors_range);

module.exports = router;
