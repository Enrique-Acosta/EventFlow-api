import { Router } from "express";
import { createEvent, getAll, getOne, updateEvent } from "../controllers/eventsController.js";
import { authorizaEventOwnerOrAdmin, authorizeRole } from "../middlewares/authMiddleware.js";
import passport from "passport";
import { createTicket, getEventTickets } from "../controllers/ticketController.js";


const router = Router()

router.get('/', getAll)

router.get('/:eid', getOne)

router.get('/:eid/tickets',
    passport.authenticate('current',{session : false}),
    authorizaEventOwnerOrAdmin, 
    getEventTickets)

router.post('/', 
    passport.authenticate('current',{session : false}),
    authorizeRole('admin','organizer'),
    createEvent)

router.post('/:eid/tickets',
    passport.authenticate('current',{session : false}), 
    createTicket)

router.put('/:eid',
    passport.authenticate('current',{session : false}),
    authorizaEventOwnerOrAdmin, 
    updateEvent
)


export default router