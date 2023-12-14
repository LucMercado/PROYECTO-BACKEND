import messageModel from './models/message.model.js';

export default class MessageController {
    constructor() {
    }

    async addMessage(message) {

        try {
            await messageModel.create(message);
            return "Mensaje agregado";

        } catch (err) {
            return err.message;
        }
    }

}