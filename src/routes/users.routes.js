import { Router } from 'express';
import { UserController } from '../dao/user.controller.mdb.js';

const router = Router();
const controller = new UserController();

router.get('/', async (req, res) => {
    try {
        const users = await controller.getUsers()
        res.status(200).send({ status: 'OK', data: users });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.post('/', async (req, res) => {
    try {
        //Desestructuración del body para validar contenido
        const { first_name, last_name, email, age, password } = req.body;
        if (!first_name || !last_name || !email || !age || !password) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
        }
        const newContent = {
            first_name, 
            last_name, 
            email, 
            age, 
            password
        };

        res.status(200).send({ status: 'OK', data: await controller.addUser(newContent) });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})
export default router