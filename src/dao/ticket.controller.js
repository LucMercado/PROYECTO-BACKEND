import TicketService from "../services/ticket.services.js";

const ticketService = new TicketService;

export default class TicketController {

    constructor() {
    }

    async createTicket(data) {
        return await ticketService.createTicketService();
    }


    async getTickets() {
        return await ticketService.getTicketsService();
    }

}