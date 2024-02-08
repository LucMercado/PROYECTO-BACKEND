import messageModel from '../dao/models/message.model.js';

export default class MessageService {
    constructor() {
    }

    async addMessageService(message) {

        try {
            await messageModel.create(message);
            return "Mensaje agregado";

        } catch (err) {
            return err.message;
        }
    }
}