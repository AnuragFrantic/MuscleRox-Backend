const FAQ = require("../models/Faq");

// CREATE FAQ
exports.createFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;

        const faq = await FAQ.create({
            question,
            answer,
        });

        return res.status(201).json({
            success: 1,
            message: "FAQ created successfully",
            data: faq,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// UPDATE FAQ
exports.updateFaq = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: 0,
                message: "FAQ not found",
            });
        }

        const updatedFaq = await FAQ.findByIdAndUpdate(
            id,
            {
                question: req.body.question,
                answer: req.body.answer,
            },
            {
                new: true,
            }
        );

        return res.json({
            success: 1,
            message: "FAQ updated successfully",
            data: updatedFaq,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// GET ALL FAQS
exports.getFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });

        return res.json({
            success: 1,
            count: faqs.length,
            data: faqs,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// GET SINGLE FAQ
exports.getFaq = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findById(id);

        if (!faq) {
            return res.status(404).json({
                success: 0,
                message: "FAQ not found",
            });
        }

        return res.json({
            success: 1,
            data: faq,
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};

// DELETE FAQ
exports.deleteFaq = async (req, res) => {
    try {
        const { id } = req.params;

        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
            return res.status(404).json({
                success: 0,
                message: "FAQ not found",
            });
        }

        return res.json({
            success: 1,
            message: "FAQ deleted successfully",
        });
    } catch (error) {
        console.log(error);

        return res.status(500).json({
            success: 0,
            message: error.message,
        });
    }
};