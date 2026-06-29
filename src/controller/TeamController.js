const Team = require("../models/Team");

const create_team = async (req, res) => {
    try {
        const { name, position, link, description, isActive } = req.body;

        if (!name) {
            return res.json({
                errors: [{ path: 'name', msg: 'Name  are required' }],
                success: 0,
                message: "Name  are required",
                data: []
            });
        }

        const data = {
            name,
            position,
            link,
            description,
            isActive: isActive !== undefined ? isActive : true
        };

        if (req.file) {
            data['file'] = req.file.path;
            data['file_type'] = req.file.mimetype;
        }

        const team = await Team.create(data);
        return res.json({
            errors: [],
            success: 1,
            message: "Team member created successfully",
            data: team
        });
    } catch (err) {
        return res.json({
            errors: [{ message: err.message }],
            success: 0,
            message: err.message,
            data: []
        });
    }
};

const get_all_team = async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = {};

        if (isActive !== undefined) {
            filter['isActive'] = isActive === 'true';
        }

        const team = await Team.find(filter).sort({ createdAt: -1 });
        return res.json({
            errors: [],
            success: 1,
            message: "Team members fetched successfully",
            data: team
        });
    } catch (err) {
        return res.json({
            errors: [{ message: err.message }],
            success: 0,
            message: err.message,
            data: []
        });
    }
};

const get_team_by_id = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.json({
                errors: [{ path: 'id', msg: 'ID is required' }],
                success: 0,
                message: "ID is required",
                data: []
            });
        }

        const team = await Team.findById(id);

        if (!team) {
            return res.json({
                errors: [{ path: 'id', msg: 'Team member not found' }],
                success: 0,
                message: "Team member not found",
                data: []
            });
        }

        return res.json({
            errors: [],
            success: 1,
            message: "Team member fetched successfully",
            data: team
        });
    } catch (err) {
        return res.json({
            errors: [{ message: err.message }],
            success: 0,
            message: err.message,
            data: []
        });
    }
};

const update_team = async (req, res) => {
    try {
        const { id } = req.params;
        const data = { ...req.body };

        if (!id) {
            return res.json({
                errors: [{ path: 'id', msg: 'ID is required' }],
                success: 0,
                message: "ID is required",
                data: []
            });
        }

        if (req.file) {
            data['file'] = req.file.path;
            data['file_type'] = req.file.mimetype;
        }

        const team = await Team.findByIdAndUpdate(id, data, { new: true });

        if (!team) {
            return res.json({
                errors: [{ path: 'id', msg: 'Team member not found' }],
                success: 0,
                message: "Team member not found",
                data: []
            });
        }

        return res.json({
            errors: [],
            success: 1,
            message: "Team member updated successfully",
            data: team
        });
    } catch (err) {
        return res.json({
            errors: [{ message: err.message }],
            success: 0,
            message: err.message,
            data: []
        });
    }
};

const delete_team = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.json({
                errors: [{ path: 'id', msg: 'ID is required' }],
                success: 0,
                message: "ID is required",
                data: []
            });
        }

        const team = await Team.findByIdAndDelete(id);

        if (!team) {
            return res.json({
                errors: [{ path: 'id', msg: 'Team member not found' }],
                success: 0,
                message: "Team member not found",
                data: []
            });
        }

        return res.json({
            errors: [],
            success: 1,
            message: "Team member deleted successfully",
            data: []
        });
    } catch (err) {
        return res.json({
            errors: [{ message: err.message }],
            success: 0,
            message: err.message,
            data: []
        });
    }
};

module.exports = {
    create_team,
    get_all_team,
    get_team_by_id,
    update_team,
    delete_team
};
