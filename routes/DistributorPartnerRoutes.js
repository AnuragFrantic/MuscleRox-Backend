const express = require("express");
const { createDistributionPartner, getDistributionPartners, getDistributionPartnerById, updateDistributionPartnerStatus } = require("../src/controller/DistributorPartner");
const router = express.Router();


// Public — form submission
router.post("/", createDistributionPartner);

// Admin — listing & management (wrap with your existing auth middleware as needed)
router.get("/", getDistributionPartners);
router.get("/:id", getDistributionPartnerById);
router.patch("/:id/status", updateDistributionPartnerStatus);

module.exports = router;

// In your main app/router file:
// const distributionPartnerRoutes = require("./routes/distributionPartner.routes");
// app.use("/api/distribution-partner", distributionPartnerRoutes);