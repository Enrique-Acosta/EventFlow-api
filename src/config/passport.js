import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy} from 'passport-jwt'
import { createHash, validatePassword} from "../utils/bcrypt.js";
import { userModel } from "../models/userModel.js";
import { env } from "./env.js";

const cookieExtractor = req =>{
    let token = null
    if (req && req.signedCookies){
        token = req.signedCookies.jwt
    }
    return token
}

const registerConfig={
    usernameField: 'email',
    passReqToCallback: true,
    session: false
}

const loginConfig={
    usernameField:'email',
    passReqToCallback: true,
    session: false
}

const currentConfig = {
     jwtFromRequest: cookieExtractor,
     secretOrKey: env.JWT_SECRET
}



async function registerCallBack(req,username,password,done){
     try {
            const {first_name, last_name} = req.body
            
                if(!first_name || !last_name || !username || !password){
                  return done(null, false, {message:'Todos los campos son obligarotios'})
                } 
                if(password.length < 8){
                    return done (null, false, {message: "La contraseña debe tener al menos 8 caracteres."})
                }
    
                const hashedPassword = await createHash(password)
                const newUser = await userModel.create({
                        first_name, 
                        last_name, 
                        email:username,
                        password: hashedPassword
                    })
               
              return done (null,newUser)
    
        } catch (error) {
            if (error.code === 11000){
                return done(null, false, {message:'Este email ya fue usado'})
            }
    
            if (error.name === 'ValidationError'){
                return done(null, false, {message: error.errors.email.message})
            }
            
            return done(error) 
        }
}


async function loginCallBack(req,_,password, done) {
    try {
         const { user } = req
         const checkPassword = await validatePassword(password, user.password)
    
        if (!checkPassword){
            return done(null,false, {message:'Credenciales invalidas'})
        }else{
            const sessionData = {
                id: user.id,
                email: user.email,
                role: user.role
            }
           return done(null,sessionData)
        }
      } catch (error) {
       return done(error)
        
      }
}
async function currentCallBack (jwtPayload,done) {
    try {
        const user = await userModel.findById(jwtPayload.id)
        if (!user) {
          return done(null, false, {
            message: 'Usuario no encontrado'
          })
        }
        return done (null, user)
    } catch (error) {
        return done(error)
    }
}

export function initializePassport(){
    passport.use('register',new LocalStrategy(registerConfig, registerCallBack))
    passport.use('login', new LocalStrategy(loginConfig, loginCallBack))
    passport.use('current', new JwtStrategy(currentConfig, currentCallBack))
}