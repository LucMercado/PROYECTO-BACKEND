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

    async updateUser(user) {
        return await userService.updateUserService(user);
    }

    async updateRole(userId, role) {
        return await userService.updateRoleService(userId, role);
    }

    async getUsersPaginated(page, limit) {
        return await userService.getUsersPaginatedService(page, limit);
    }

    async getUserByEmail(email){
        return await userService.getUserByEmailService(email);
    }

    async deleteUser(email){
        return await userService.deleteUserService(email);
    }

    async deleteInactivityUsers(){
        return await userService.deleteInactivityUsersService();
    }

    async generateMockUsers(qty){
        return await userService.generateMockUsersService(qty);
    }
}