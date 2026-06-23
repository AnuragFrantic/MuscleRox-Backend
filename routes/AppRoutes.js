const express = require("express");
const router = express.Router();
const { admin_login } = require("../src/controller/userController");

const { Auth } = require("../src/middleware/Auth");

router.post('/login', admin_login);



module.exports = router;