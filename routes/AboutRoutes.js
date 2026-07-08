const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const Store = require("../src/middleware/Store");
const {
    create_about,
    get_all_about,
    get_about_by_id,
    update_about,
    delete_about
} = require("../src/controller/AboutController");

const router = Router();

router.get('/', get_all_about);
router.get('/:id', get_about_by_id);
router.post('/', Auth('Admin'), Store('any').single('image'), create_about);
router.put('/:id', Auth('Admin'), Store('any').single('image'), update_about);
router.delete('/:id', Auth('Admin'), delete_about);

module.exports = router;
