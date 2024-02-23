import userModel from '../dao/models/user.model.js'
import { faker } from '@faker-js/faker';
import { createHash } from '../utils.js';

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

    async generateMockUsersService(qty){
        const mockCarts = [];
        const mockUsers = [];
        const possibleRoles = ['user', 'premium'];

        for (let i = 0; i < qty; i++) {
            const cart = {
                _id: faker.database.mongodbObjectId(),
                products: [],
                total: 0
            }

            mockCarts.push(cart);
        }
        
        for (let i = 0; i < qty; i++) {
            const mock = {
                _id: faker.database.mongodbObjectId(),
                first_name: faker.person.firstName(),
                last_name: faker.person.lastName(),
                email: faker.internet.email(),
                age: faker.number.int(70) + 1,
                gender: faker.person.sex(),
                password: createHash(faker.internet.password({ length: 8 })),
                cart: mockCarts[i]._id,
                role: faker.helpers.arrayElement(Object.values(possibleRoles))
            }
            mock.gender = mock.gender.charAt(0).toUpperCase() + mock.gender.slice(1);
            mockUsers.push(mock);
        }

        return [mockUsers, mockCarts];
    }
}