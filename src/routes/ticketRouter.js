import { Router } from "express";
import passport from "passport";
import { cancelTicket, getMyTickets } from "../controllers/ticketController.js";
import { authorizeTicketOwnerOrAdmin } from "../middlewares/authMiddleware.js";
const router = Router()

router.get('/my-tickets', 
    passport.authenticate('current',{session:false}), 
    getMyTickets)

router.patch('/:tid/cancel', 
    passport.authenticate('current',{ session: false}),
    authorizeTicketOwnerOrAdmin,
    cancelTicket

)


export default router