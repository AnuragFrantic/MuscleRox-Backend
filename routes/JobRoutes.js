const express = require("express");
const router = express.Router();

const {
    createJob,
    getJobs,
    getJobBySlugOrId,
    updateJob,
    deleteJob,
} = require("../src/controller/JobController");

const Store = require("../src/middleware/Store");

router.post(
    "/",
    Store("any").fields([
        { name: "image", maxCount: 1 },
    ]),
    createJob
);

router.get("/", getJobs);

router.get("/:id", getJobBySlugOrId);

router.put(
    "/:id",
    Store("any").fields([
        { name: "image", maxCount: 1 },
    ]),
    updateJob
);

router.delete("/:id", deleteJob);

module.exports = router;