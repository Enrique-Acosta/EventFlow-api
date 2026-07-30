import { validateCapacity, validateDate, validatePrice } from "../utils/validators.js"
import { eventModel } from "../models/eventModel.js"
export async function getAllEventsService(data) {

    const {
    category,
    status,
    location,
    fromDate,
    toDate,
    page = 1,
    limit = 10,
    sort = 'date' 
    } = data

    const filter = {}

    if (category){
        filter.category = category
    }

    if (status){
        filter.status = status
    }

    if (location){
        filter.location = location
    }

    if (fromDate || toDate) {

        filter.date = {}

        if (fromDate) {
            filter.date.$gte = new Date(fromDate)
        }

        if (toDate) {
            filter.date.$lte = new Date(toDate)
        }
    }
    
     const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const events = await eventModel
        .find(filter)
        .populate("organizer", "first_name last_name email")
        .sort(sort)
        .skip(skip)
        .limit(limitNumber);

    const totalEvents = await eventModel.countDocuments(filter);

    return {
        events,
        pagination: {
            total: totalEvents,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalEvents / limitNumber)
        }
    };
}
export async function createEventService (data) {

    const { title, description, category, date, location, price, capacity, organizer} = data
               
        if(!title || !description || !category || !date || !location ||!price || capacity === undefined  ){
            throw new Error ('Todos los campos son obligatorios')
        }
        
       validateDate(date)
       validateCapacity(capacity)
       validatePrice(price)

    const event = await eventModel.create({
                    title,
                    description,
                    category,
                    date,
                    location,
                    price,
                    capacity,
                    organizer
                })
    return event
}


export async function updateEventService(data) {

    if (data.status === 'cancelled')throw new Error("Este evento ya fue cancelado")
    validateDate(data.date)
    validateCapacity(data.capacity)
    validatePrice(data.price)
    const event = await eventModel.findByIdAndUpdate(data.id, data, {new:true})
    if(!event) throw new Error("Evento no encontrado");
   

    return event
}