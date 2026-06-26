const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const Store = require("../src/middleware/Store");
const {
    create_team,
    get_all_team,
    get_team_by_id,
    update_team,
    delete_team
} = require("../src/controller/TeamController");

const router = Router();

// Get all team members
router.get('/', get_all_team);

// Get team member by ID
router.get('/:id', get_team_by_id);

// Create team member (Admin only)
router.post('/', Auth('Admin'), Store('any').single('file'), create_team);

// Update team member (Admin only)
router.put('/:id', Auth('Admin'), Store('any').single('file'), update_team);

// Delete team member (Admin only)
router.delete('/:id', Auth('Admin'), delete_team);

module.exports = router;
