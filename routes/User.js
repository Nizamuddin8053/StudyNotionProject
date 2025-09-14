import { login, signUp, changePassword, sendOTP } from "../controllers/Auth";
const router = require("Router")
const {resetPasswordToken, resetPassword} = require("../controllers/ResetPassword");

const {auth} = require("../middlewares/auth");

// routes for login , signup and authentication

// *******************************************************************
//                       Authentication routes
// *******************************************************************

// routes for user login

router.post("/login",login);
router.post("/signup",signUp);
router.post("/sendotp",sendOTP);
router.post("/changepassword",auth , changePassword);
