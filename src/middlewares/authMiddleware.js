import { eventModel } from "../models/eventModel.js";
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
export function authorizeRole(...allowedRoles){
    return async (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                status:'Error',
                message:'Usuario no autenticado'
            })
        }

        if(!allowedRoles.includes(req.user.role)){
            return res.status(403).json({
                status:'Error',
                message:'No cuentas con los permisos necesario para realizar esta accion'
            })
        }
        next()
    }
}

export async function authorizaEventOwnerOrAdmin (req, res, next){
    try {
        const { eid } =req.params
        const event = await eventModel.findById(eid)
        if(!event){
            return res.status(404).json({
                status:'Error',
                message:'Evento no encontrado'
            })
        }

        const isAdmin = req.user.role === 'admin'
        const isOwner = event.owner.toString() === req.user._id.toString()
        if(!isAdmin && !isOwner){
            return res.status(403).json({
                status:'Error',
                message:'No cuentas con los permisos necesario para realizar esta accion'
            })
        }

        req.event = event        
        next()
    } catch (error) {
        next(error)
    }
}