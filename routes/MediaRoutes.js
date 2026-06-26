const { Router } = require("express");

const Store = require("../src/middleware/Store");
const { GuestAuth } = require("../src/middleware/GuestAuth");
const { Auth } = require("../src/middleware/Auth");
const { createMedia, updateMedia, getMedia, getSingleMedia, deleteMedia } = require("../src/controller/MediaController");



const router = Router();

router.post(
    "/",
    Store("any").fields([
        { name: "image", maxCount: 1 },
    ]),
    createMedia
);

router.put(
    "/:id",
    Store("any").fields([
        { name: "image", maxCount: 1 },
    ]),
    updateMedia
);

router.get("/", getMedia);
router.get("/:id", getSingleMedia);
router.delete("/:id", deleteMedia);

module.exports = router;