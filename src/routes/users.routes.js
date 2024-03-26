import { Router } from 'express';
import { UserController } from '../dao/user.controller.js';

const router = Router();
const controller = new UserController();

router.get('/', async (req, res) => {
    try {
        const users = await controller.getUsers()
        res.status(200).send({ status: 'OK', data: users });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.post('/', async (req, res) => {
    try {
        //Desestructuración del body para validar contenido
        const { first_name, last_name, email, age, password } = req.body;
        if (!first_name || !last_name || !email || !age || !password) {
            req.logger.error({status:'ERR', code:'400', message: 'Faltan campos obligatorios' });
            return res.status(400).send({ status: 'ERR', data: 'Faltan campos obligatorios' });
        }
        const newContent = {
            first_name, 
            last_name, 
            email, 
            age, 
            password
        };
        req.logger.info({status:'OK', code:'200', message: "Usuario creado"});
        res.status(200).send({ status: 'OK', data: await controller.addUser(newContent) });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})
export default router