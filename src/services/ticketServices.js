import { randomBytes} from 'crypto'
import { eventModel } from "../models/eventModel.js";
import { ticketModel } from "../models/ticketModel.js";
import { sendTicketConfirmationEmail } from './mailServices.js';
import { Types } from 'mongoose';

const getOccupiedSeats = async (eventId) => {
    const result = await ticketModel.aggregate([
        {
            $match: {
                event: new Types.ObjectId(eventId),
                status: "active"
            }
        },
        {
            $group: {
                _id: null,
                totalReserved: {
                    $sum: "$quantity"
                }
            }
        }
    ]);

    return result[0]?.totalReserved ?? 0;
};

const generateTicketCode = () => {
    return `TICKET-${randomBytes(4).toString("hex").toUpperCase()}`
};




export async function purchaseTicketService(data){
    const { user, eventId } = data
    const event = await eventModel.findById(eventId)
    if (!event) {
        const error = new Error("Evento no encontrado")
        error.statusCode = 404
        throw error
    }
    if ( event.status != 'published') throw new Error ('El evento no esta disponible en este momento')

    const quantity = data.quantity ?? 1

    const occupiedSeats = await getOccupiedSeats(eventId)
    const availableSeats = event.capacity - occupiedSeats

    if(quantity < 0) throw new Error("La cantidad no puede menor a 0");  
    if(quantity > availableSeats) {
        const error = new Error("Asientos no disponible")
        error.statusCode = 409
        throw error
    }
    
    const ticket = await ticketModel.create({
        user: user._id,
        event:eventId,
        quantity,
        code: generateTicketCode()
    })

    await sendTicketConfirmationEmail({
        eventTitle: event.title,
        ticketCode: ticket.code
    })
     
    return ticket
};

export async function cancelTicketService(data) {
    const { ticketId } = data
    
    const ticket = await ticketModel.findById(ticketId)

    if(!ticket) throw new Error("Ticket no escontrado");
    if (ticket.status === "cancelled") throw new Error("El ticket ya fue cancelado");

    ticket.status = "cancelled"
    ticket.cancelledAt= new Date()
    await ticket.save()

    return ticket
    
    
};

export async function getMyTicketsService(data) {
    const {userId} = data
    const tickets = await ticketModel
    .find({user:userId})
    .populate("event", "title date location")
   
    return tickets

};

export async function getEventTicketsService (data) {
    const { eventId } = data
    const tickets = await ticketModel
    .find({event: eventId})
    .populate("user", "first_name last_name email")

    return tickets
};