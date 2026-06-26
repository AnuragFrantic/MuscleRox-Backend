const { Router } = require("express");

const {
    createFaq,
    updateFaq,
    getFaqs,
    getFaq,
    deleteFaq,
} = require("../src/controller/FaqController");

const router = Router();

router.post("/", createFaq);
router.put("/:id", updateFaq);
router.get("/", getFaqs);
router.get("/:id", getFaq);
router.delete("/:id", deleteFaq);

module.exports = router;