import { UserService } from "../services/user.services.js";

const userService = new UserService;

export class UserController {
    constructor() {
    }

    async getUsers() {
        return await userService.getUsersService();
    }

    async addUser(user) {
        return await userService.addUserService(user);
    }

    async getUsersPaginated(page, limit) {
        return await userService.getUsersPaginatedService(page, limit);
    }

    async getUserByEmail(email){
        return await userService.getUserByEmailService(email);
    }

    async generateMockUsers(qty){
        return await userService.generateMockUsersService(qty);
    }
}