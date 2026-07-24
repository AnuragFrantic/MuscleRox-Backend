const express = require("express");
const { createDistributionPartner, getAllDistributionPartners, getDistributionPartnerById, updateDistributionPartner, updateDistributionPartnerStatus, deleteDistributionPartner } = require("../src/controller/DistributionPartner");


const router = express.Router();


router.post("/", createDistributionPartner);
router.get("/", getAllDistributionPartners);
router.get("/:id", getDistributionPartnerById);
router.put("/update/:id", updateDistributionPartner);
router.patch("/:id/status", updateDistributionPartnerStatus);
router.delete("/:id", deleteDistributionPartner);




module.exports = router;

// In your main app/router file:
// const distributionPartnerRoutes = require("./routes/distributionPartner.routes");
// app.use("/api/distribution-partner", distributionPartnerRoutes);