import userModel from './models/user.model.js'

export class UserService {
    constructor() {
    }

    async getUsersService() {
        try {
            const users = await userModel.find().lean();
            return users;
        } catch (err) {
            return err.message;
        }
    }

    async addUserService(user) {
        try {
            await userModel.create(user);
            return "Usuario creado";
        } catch (err) {
            return err.message;
        }
    }

    async getUsersPaginatedService(page, limit) {
        try {
            return await userModel.paginate(
                { },
                { offset: (page * 50) - 50, limit: limit, lean: true }
            );
        } catch (err) {
            return err.message;
        }
    }

    async getUserByEmailService(email){
        try{
            return await userModel.findOne({ email: email }).lean();
        } catch (err) {
            return err.message;
        }
    }
}