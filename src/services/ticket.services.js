import ticketModel from '../dao/models/ticket.model.js';

export default class TicketService {
    constructor() {
    }

    async createTicketService(data) {
        try {
            return await ticketModel.create(data);
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