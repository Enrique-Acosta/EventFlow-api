import { eventModel } from "../models/eventModel.js"

export async function getAll(req, res, next) {
    res.status(200).json(
        {
            "status": "ok",
            "payload": []
        }
    )
    
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
        console.log(req.user);
        
        const { name, date, place, price, capacity } = req.body
       
        if(!name || !date || !place ||!price || !capacity ){
            return res.status(400).json({status:'Error', message:'Todos los campos son obligatorios'})
        }
        const newEvent = await eventModel.create({
            name,
            date,
            place,
            price,
            capacity,
            owner: req.user._id
        })
        return res.status(201).json(
            {
                status:'Success', 
                message:'Evento creado correctamente', 
                payload: newEvent
            })

   } catch (error) {
        return res.status(500).json({status:'Error', message:'Error interno del servidor'})
   }
    
}
export async function updateEvent(req, res, next) {
    try{

        const event = await eventModel.findById( req.params.eid );

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