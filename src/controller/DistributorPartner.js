const DistributionPartner = require("./DistributionPartner");

// POST /api/distribution-partner
exports.createDistributionPartner = async (req, res) => {
    try {
        const payload = req.body;

        if (!payload.confirm) {
            return res.status(400).json({
                success: 0,
                message: "Please confirm the declaration before submitting.",
            });
        }

        const requiredFields = [
            "organization_name",
            "year_of_incorporation",
            "address",
            "head_office",
            "city",
            "state",
            "pin_code",
            "country",
            "mobile_no",
            "phone_no",
            "email",
            "educational_qualification",
        ];

        const missing = requiredFields.filter((field) => !String(payload[field] || "").trim());
        if (missing.length > 0) {
            return res.status(400).json({
                success: 0,
                message: `Missing required fields: ${missing.join(", ")}`,
            });
        }

        if (!Array.isArray(payload.industries_served) || payload.industries_served.length === 0) {
            return res.status(400).json({
                success: 0,
                message: "Please select at least one industry being served.",
            });
        }

        const application = await DistributionPartner.create({
            organization_name: payload.organization_name,
            year_of_incorporation: payload.year_of_incorporation,
            address: payload.address,
            head_office: payload.head_office,
            city: payload.city,
            state: payload.state,
            pin_code: payload.pin_code,
            country: payload.country,

            department: payload.department,
            director_partner_proprietor: payload.director_partner_proprietor,
            applicant_details: payload.applicant_details,
            designation_name: payload.designation_name,
            mobile_no: payload.mobile_no,
            phone_no: payload.phone_no,
            email: payload.email,
            educational_qualification: payload.educational_qualification,
            industries_served: payload.industries_served,

            market_presence: payload.market_presence,
            supplier_relationships: payload.supplier_relationships,
            hr_infrastructure: payload.hr_infrastructure,
            warehouse_area: payload.warehouse_area,

            confirm: payload.confirm,
        });

        // Optional: notify sales/marketing team by email here
        // await sendMail({ to: "marketing@yourcompany.com", subject: "New Distribution Partner Application", ... });

        return res.status(201).json({
            success: 1,
            message: "Your application has been submitted successfully. Our team will get back to you shortly.",
            data: application,
        });
    } catch (err) {
        console.error("createDistributionPartner error:", err);
        return res.status(500).json({
            success: 0,
            message: err.message || "Something went wrong. Please try again later.",
        });
    }
};

// GET /api/distribution-partner
exports.getDistributionPartners = async (req, res) => {
    try {
        const applications = await DistributionPartner.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: 1, data: applications });
    } catch (err) {
        console.error("getDistributionPartners error:", err);
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// GET /api/distribution-partner/:id
exports.getDistributionPartnerById = async (req, res) => {
    try {
        const application = await DistributionPartner.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: 0, message: "Application not found." });
        }
        return res.status(200).json({ success: 1, data: application });
    } catch (err) {
        console.error("getDistributionPartnerById error:", err);
        return res.status(500).json({ success: 0, message: err.message });
    }
};

// PATCH /api/distribution-partner/:id/status
exports.updateDistributionPartnerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ["new", "reviewed", "contacted", "rejected", "approved"];

        if (!allowed.includes(status)) {
            return res.status(400).json({ success: 0, message: "Invalid status value." });
        }

        const application = await DistributionPartner.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({ success: 0, message: "Application not found." });
        }

        return res.status(200).json({ success: 1, data: application });
    } catch (err) {
        console.error("updateDistributionPartnerStatus error:", err);
        return res.status(500).json({ success: 0, message: err.message });
    }
};