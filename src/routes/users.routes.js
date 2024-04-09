import { Router } from 'express';
import { UserController } from '../dao/user.controller.js';

import { authToken, handlePolicies } from '../utils.js'

const router = Router();
const controller = new UserController();

router.get('/', authToken, async (req, res) => {
    try {
        const users = await controller.getUsers();
        req.logger.info({status:'OK', code:'200', message: "Usuarios obtenidos"});
        res.status(200).send({ status: 'OK', data: users });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.post('/', authToken, handlePolicies(['admin']), async (req, res) => {
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

router.delete('/:uid', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const uid = req.params.uid;
        const result = await controller.deleteUser(uid);
        req.logger.info({status:'OK', code:'200', message: "Usuario eliminado"});
        res.status(200).send({ status: 'OK', data: result });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.delete('/', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const result = await controller.deleteInactivityUsers();

        req.logger.info({status:'OK', code:'200', message: result});
        res.status(200).send({ status: 'OK', message: result });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.patch('/:uid', authToken, handlePolicies(['admin']), async (req, res) => {
    try {
        const userId = req.params.uid;
        const { role } = req.body;
        //armar
        req.logger.info({status:'OK', code:'200', message: "Rol actualizado"});
        res.status(200).send({ status: 'OK', data: await controller.updateUser(userId, newContent) });
    } catch (err) {
        req.logger.error({status:'ERR', code:'500', message: err.message});
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})
export default router