import MessageService from "../services/message.services";

const messageService = new MessageService;

export default class MessageController {
    constructor() {
    }

    async addMessage(message) {
        return await messageService.addMessageService(message);
    }
}