import { eventModel } from "../models/eventModel.js"
import { createEventService, getAllEventsService, updateEventService } from "../services/eventServices.js"

export async function getAll(req, res, next) {
   try {
    const result = await getAllEventsService(req.query)
    return res.status(200).json({result})
   } catch (error) {
     return res.status(500).json({status:'Error', message: 'Error interno'})
   }
    
}
export async function getOne(req, res, next) {
    res.status(200).json(
        {
            "status": "ok",
            "payload": []
        }
    )
    
}
export async function createEvent(req, res) {
   try {
        console.log(req.user._id);
        
       const event = await createEventService({
                                ...req.body,
                                organizer: req.user._id
                            })

        return res.status(201).json(
            {
                status:'Success', 
                message:'Evento creado correctamente', 
                payload: event
            })

   } catch (error) {
        return res.status(400).json({status:'Error', message: error.message})
   }
    
}
export async function updateEvent(req, res, next) {
    try{

       const event = await updateEventService({
            ...req.body,
            id:req.event._id
        })

        return res.status(200).json({data:event});

    }catch(error){
       return res.status(500).json({error:error.toString()} )
    }
    
}
export async function deleteEvent(req, res, next) {
    res.status(200).json(
        {
            "status": "ok",
            "payload": []
        }
    )
    
}