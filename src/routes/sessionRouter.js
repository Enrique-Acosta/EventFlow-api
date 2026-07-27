import { Router } from "express";
import { login, register, current, logout } from "../controllers/sessionController.js";
import { searchUser} from "../middlewares/authMiddleware.js";
import passport from "passport";

const router = Router()

router.post('/register',(req, res, next) => {
     passport.authenticate(
        "register",
        { session: false },
            (err, user, info) => {

                if (err) {return res.status(500).json({status:'Error', message: err.message});}

                if (!user) { return res.status(400).json({status:'Error',message: info.message});}
                req.user = user;
                next();
            }
    )(req, res, next)

}, register);

router.post('/login', searchUser,(req, res, next)=>{
    passport.authenticate("login", { session: false },
        (err, user, info) =>{
            if (err) {return res.status(500).json({status:'Error',message: err.message});}

            if (!user) { return res.status(401).json({status:'Error',message: info.message});}

            req.user = user;
            next();
        }
    )(req,res,next)
}, login)

router.get('/current', passport.authenticate("current",{session : false}), current)

router.post('/logout', logout)

export default router