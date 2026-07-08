const About = require("../models/About");

const create_about = async (req, res) => {
    try {
        const { heading } = req.body;

        if (!heading) {
            return res.json({
                errors: [{ path: 'heading', msg: 'Heading is required' }],
                success: 0,
                message: 'Heading is required',
                data: []
            });
        }

        const data = { ...req.body };

        // Parse features if sent as JSON string (multipart/form-data sends arrays as strings)
        if (data.features && typeof data.features === 'string') {
            try {
                const parsed = JSON.parse(data.features);
                if (!Array.isArray(parsed)) throw new Error('features must be an array');
                data.features = parsed.map(item => (typeof item === 'string' ? { title: item } : item));
            } catch (e) {
                return res.json({ errors: [{ path: 'features', msg: 'features must be a valid JSON array' }], success: 0, message: 'Invalid features', data: [] });
            }
        }

        if (req.file) {
            data['image'] = req.file.path;
        }

        // Coerce numeric fields
        if (data.experience !== undefined) {
            const n = Number(data.experience);
            if (!Number.isNaN(n)) data.experience = n;
        }

        const about = await About.create(data);
        return res.json({ errors: [], success: 1, message: 'About created successfully', data: about });
    } catch (err) {
        return res.json({ errors: [{ message: err.message }], success: 0, message: err.message, data: [] });
    }
};

const get_all_about = async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = {};
        if (isActive !== undefined) filter['isActive'] = isActive === 'true';

        const abouts = await About.find(filter).sort({ createdAt: -1 });
        return res.json({ errors: [], success: 1, message: 'About fetched successfully', data: abouts });
    } catch (err) {
        return res.json({ errors: [{ message: err.message }], success: 0, message: err.message, data: [] });
    }
};

const get_about_by_id = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.json({ errors: [{ path: 'id', msg: 'ID is required' }], success: 0, message: 'ID is required', data: [] });

        const about = await About.findById(id);
        if (!about) return res.json({ errors: [{ path: 'id', msg: 'About not found' }], success: 0, message: 'About not found', data: [] });

        return res.json({ errors: [], success: 1, message: 'About fetched successfully', data: about });
    } catch (err) {
        return res.json({ errors: [{ message: err.message }], success: 0, message: err.message, data: [] });
    }
};

const update_about = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.json({ errors: [{ path: 'id', msg: 'ID is required' }], success: 0, message: 'ID is required', data: [] });

        const data = { ...req.body };

        // Parse features if sent as JSON string
        if (data.features && typeof data.features === 'string') {
            try {
                const parsed = JSON.parse(data.features);
                if (!Array.isArray(parsed)) throw new Error('features must be an array');
                data.features = parsed.map(item => (typeof item === 'string' ? { title: item } : item));
            } catch (e) {
                return res.json({ errors: [{ path: 'features', msg: 'features must be a valid JSON array' }], success: 0, message: 'Invalid features', data: [] });
            }
        }

        if (req.file) data['image'] = req.file.path;

        if (data.experience !== undefined) {
            const n = Number(data.experience);
            if (!Number.isNaN(n)) data.experience = n;
        }

        const about = await About.findByIdAndUpdate(id, data, { new: true, runValidators: true });
        if (!about) return res.json({ errors: [{ path: 'id', msg: 'About not found' }], success: 0, message: 'About not found', data: [] });

        return res.json({ errors: [], success: 1, message: 'About updated successfully', data: about });
    } catch (err) {
        return res.json({ errors: [{ message: err.message }], success: 0, message: err.message, data: [] });
    }
};

const delete_about = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.json({ errors: [{ path: 'id', msg: 'ID is required' }], success: 0, message: 'ID is required', data: [] });

        const about = await About.findByIdAndDelete(id);
        if (!about) return res.json({ errors: [{ path: 'id', msg: 'About not found' }], success: 0, message: 'About not found', data: [] });

        return res.json({ errors: [], success: 1, message: 'About deleted successfully', data: [] });
    } catch (err) {
        return res.json({ errors: [{ message: err.message }], success: 0, message: err.message, data: [] });
    }
};

module.exports = {
    create_about,
    get_all_about,
    get_about_by_id,
    update_about,
    delete_about
};
