import userModel from "../dao/models/user.model.js";
import { faker } from "@faker-js/faker";
import { createHash } from "../utils.js";
import { get } from "mongoose";

export class UserService {
    constructor() { }

    async getUsersService() {
        try {
            const users = await userModel
                .find({}, "-_id first_name email role")
                .lean();
            return users;
        } catch (err) {
            return err.message;
        }
    }

    async getUserByEmailService(email) {
        try {
            return await userModel.findOne({ email: email });
        } catch (err) {
            return err.message;
        }
    }

    async updateUserService(user) {
        try {
            await userModel.updateOne({ email: user.email }, user);
            return "Usuario actualizado";
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
                {},
                {
                    offset: page * limit - limit,
                    limit: limit,
                    lean: true,
                    select: "first_name last_name email role",
                }
            );
        } catch (err) {
            return err.message;
        }
    }

    async deleteUserService(uid) {
        try {
            await userModel.deleteOne({ _id: uid });
            return "Usuario eliminado";
        } catch (err) {
            return err.message;
        }
    }

    async deleteInactivityUsersService() {
        try {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // Retrocede 2 días
            // Buscar usuarios inactivos
            const inactivityUsers = await userModel.find({ lastConnection: { $lt: twoDaysAgo } });

            // Filtrar usuarios inactivos que no son administradores
            const usersToDelete = inactivityUsers.filter(usuario => usuario.role !== 'admin');

            // Eliminar usuarios inactivos que no son administradores
            const result = await userModel.deleteMany({ _id: { $in: usersToDelete.map(u => u._id) } });
            return "Usuarios eliminados";
        } catch (err) {
            return err.message;
        }
    }

    async generateMockUsersService(qty) {
        const mockCarts = [];
        const mockUsers = [];
        const possibleRoles = ["user", "premium"];

        for (let i = 0; i < qty; i++) {
            const cart = {
                _id: faker.database.mongodbObjectId(),
                products: [],
                total: 0,
            };

            mockCarts.push(cart);
        }

        for (let i = 0; i < qty; i++) {
            const mock = {
                _id: faker.database.mongodbObjectId(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                age: faker.number.int(70) + 1,
                password: createHash(faker.internet.password({ length: 8 })),
                cart: mockCarts[i]._id,
                role: faker.helpers.arrayElement(Object.values(possibleRoles)),
            };
            mockUsers.push(mock);
        }

        return [mockUsers, mockCarts];
    }
}
