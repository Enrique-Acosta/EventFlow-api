import { userModel } from "../models/userModel.js";
import { verifyToken } from "../utils/jwt.js";
export async function searchUser (req, res, next){
     try {
        const { email } = req.body;
        if(!email){
            return res.status(400).json({
                status:'error',
                message:'El email es obligatorio'
            })
        }
        const normalizeEmail = email.toLowerCase().trim()
        const user = await userModel.findOne({ email: normalizeEmail });

        if (!user) {
            return res.status(401).json({ 
                status: 'error', message:'Credenciales invalidas' 
            });
        }
        req.user = user;  

        next();

    } catch (error) {
        next(error);
    }    
}
