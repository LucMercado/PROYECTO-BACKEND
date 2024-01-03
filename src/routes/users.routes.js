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
        const { first_name, last_name, email, gender, password } = req.body;
        if (!first_name || !last_name || !email || !gender || !password) {
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
        }
        const newContent = {
            first_name, 
            last_name, 
            email, 
            gender, 
            password
        };

        res.status(200).send({ status: 'OK', data: await productManager.addProduct(newContent) });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})
export default router