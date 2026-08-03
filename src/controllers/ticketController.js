import { cancelTicketService, getEventTicketsService, getMyTicketsService, purchaseTicketService } from "../services/ticketServices.js";

export async function createTicket(req, res) {
 try {
   const ticket = await purchaseTicketService({
                             ...req.body,
                             eventId: req.params.eid,
                             user: req.user
                     })
 
     res.status(201).json({
      status:'Succes', 
      payload:ticket
    })

 } catch (error) { 
    res.status(error.statusCode || 500).json({
        status: "Error",
        message: error.message
    });

 }
};

export async function getMyTickets(req,res){
    try {
      const tickets = await getMyTicketsService({
        userId:req.user._id
      })
      res.status(200).json({
        status:'Success',
        payload: tickets
      })

    } catch (error) {
      res.status(500).json({
        status:'Error',
        message:'Error interno del servidor'
      })
    }
};

export async function getEventTickets(req, res) {
    try {
      const tickets = await getEventTicketsService({ eventId: req.params.eid})
      res.status(200).json({
        status:'Success', 
        payload:tickets
      })
    } catch (error) {
      res.status(500).json({
        status:'Error', 
        message:'Error interno del servidor'
      })
    }
};

export async function cancelTicket(req, res) {
 
   try {

     const ticket = await cancelTicketService( {
       ticketId: req.params.tid
     })
 
     res.status(200).json({
      message:'EL ticket fue cancelado',
      payload: ticket
    })
   } catch (error) {
     res.json({
      status:'Error',
      message: error.message
    })
   }
};