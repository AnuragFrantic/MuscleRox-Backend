const { Router } = require("express");
const { Auth } = require("../src/middleware/Auth");
const { get_setting, create_setting, update_setting, delete_setting, menubar_web, create_or_update_settings } = require("../src/controller/SettingController");
const Store = require("../src/middleware/Store");
const { GuestAuth } = require("../src/middleware/GuestAuth");

const router = Router();
router.get('/', GuestAuth(), get_setting);
router.put('/', Auth('Admin'), Store('any').fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'footer_logo', maxCount: 1 },
    { name: 'footer_under_logo', maxCount: 1 },
]), create_or_update_settings);
router.get('/menu', menubar_web);
router.post('/', Auth('Admin'), Store('any').single('file'), create_setting);
router.put('/update/:id', Auth('Admin'), Store('any').single('file'), update_setting);
router.delete('/delete/:id', Auth('Admin'), delete_setting);
module.exports = router;