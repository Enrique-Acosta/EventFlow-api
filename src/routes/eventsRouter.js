import { Router } from "express";
import { createEvent, getAll, getOne, updateEvent } from "../controllers/eventsController.js";
import { authorizaEventOwnerOrAdmin, authorizeRole } from "../middlewares/authMiddleware.js";
import passport from "passport";


const router = Router()

router.get('/', getAll)
router.get('/:eid', getOne)
router.post('/', 
    passport.authenticate('current',{session : false}),
    authorizeRole('admin','organizer'),
    createEvent
)
router.put('/:eid',passport.authenticate('current',{session : false}),authorizaEventOwnerOrAdmin, updateEvent)


export default router