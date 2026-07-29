import { userModel } from "../models/userModel.js";
import { createHash, validatePassword } from "../utils/bcrypt.js";
import { generateToken } from "../utils/jwt.js";

export async function register (req, res) {
    try {
        const {user}= req
        return res.status(201).json({
            status:'Success',
            message:'Usuario creado correctamente.',
            payload:{
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email
            }
        })  
   }catch (error) {
        return res.status(500).json({status:'Error', message:'Error interno del servidor.'})
   } 
}

export async function login (req, res) {
        const { user } = req
        const token = generateToken(user)
        return res.cookie('jwt',token,{ signed:true , httpOnly:true , maxAge: 60 * 60 * 1000}).status(200).json({status:'success', message:'Login exitoso'})         
}

export function current (req, res){
   try {
        
        res.status(200).json({
            status:'Success', 
            payload:{
                id:req.user.id,
                email: req.user.email,
                rol: req.user.role
            }
    })
   } catch (error) {
        res.status(500).json({status:'Error', message:'Error interno del servidor'})
   }
}

export function logout (req, res) {
    res.clearCookie('jwt')
    res.status(200).json({
    status: 'Success',
    message: 'Logout correcto'
  })
}