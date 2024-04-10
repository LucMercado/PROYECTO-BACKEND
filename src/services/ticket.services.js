import ticketModel from '../dao/models/ticket.model.js';
import { v4 as uuid } from 'uuid'

class TicketDTO {
    constructor(total, email) {
        this.code = uuid();
        this.amount = total;
        this.purchaser = email;
    }
}

export default class TicketService {
    constructor() {
    }

    async createTicketService(total, email) {
        try {
            const ticket = new TicketDTO(total, email);
            const newTicket = await ticketModel.create(ticket);
            return newTicket;
        } catch (err) {
            return err.message;
        }
    }

    async getTicketsService(){
        try {
            return await ticketModel.find().lean();
        } catch (err) {
            return err.message;
        }
    }
}