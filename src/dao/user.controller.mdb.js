import userModel from './models/user.model.js'

export class UserController {
    constructor() {
    }

    async getUsers() {
        try {
            const users = await userModel.find().lean();
            return users;
        } catch (err) {
            return err.message;
        }
    }

    async addUser(user) {
        try {
            await userModel.create(user);
            return "Usuario creado";
        } catch (err) {
            return err.message;
        }
    }

    async getUsersPaginated(page, limit) {
        try {
            return await userModel.paginate(
                { },
                { offset: (page * 50) - 50, limit: limit, lean: true }
            );
        } catch (err) {
            return err.message;
        }
    }

    async getUserByEmail(email){
        try{
            return await userModel.findOne({ email: email }).lean();
        } catch (err) {
            return err.message;
        }
    }
}