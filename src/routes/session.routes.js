import { Router } from 'express';
import passport from 'passport';

import userModel from '../dao/models/user.model.js';
import { createHash, isValidPassword, generateToken } from '../utils.js';
import initPassport from '../config/passport.config.js';

// Inicializamos instancia de estrategia/s
initPassport()

const router = Router()

const auth = (req, res, next) => {
    try {
        if (req.session.user) {
            if (req.session.user.admin === true) {
                next()
            } else {
                res.status(403).send({ status: 'ERR', data: 'Usuario no admin' });
            }
        } else {
            res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
}

router.get('/', async (req, res) => {
    try {
        if (req.session.visits) {
            req.session.visits++;
            res.status(200).send({ status: 'OK', data: `Cantidad de visitas: ${req.session.visits}` });
        } else {
            req.session.visits = 1
            res.status(200).send({ status: 'OK', data: 'Bienvenido al site!' });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.get('/logout', async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message });
            } else {
                res.redirect('/login');
            }
        })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.get('/admin', auth, async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Estos son los datos privados' });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

// Endpoint de uso interno, solo para generar claves hasheadas de prueba cuando haga falta
router.get('/hash/:pass', async (req, res) => {
    res.status(200).send({ status: 'OK', data: createHash(req.params.pass) });
})

router.get('/failregister', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El email ya existe o faltan datos obligatorios' });
})

router.get('/failrestore', async (req, res) => {
    res.status(400).send({ status: 'ERR', data: 'El email no existe o faltan datos obligatorios' });
})

//Autenticación a través de GITHUB
router.get('/github', passport.authenticate('githubAuth', { scope: ['user:email'] }), async (req, res) => {
})

router.get('/githubcallback', passport.authenticate('githubAuth', { failureRedirect: '/login' }), async (req, res) => {
    req.session.user = { username: req.user.email, admin: true }
    // req.session.user = req.user
    res.redirect('/profile')
})

// Nuestro primer endpoint de login!, básico por el momento, con algunas
// validacione "hardcodeadas", pero nos permite comenzar a entender los conceptos.
router.post('/login', async (req, res) => {
    try {
        const { email, pass } = req.body;

        // Fundamental!!!: los datos de req.session se almacenan en SERVIDOR, NO en navegador.
        // Pronto cambiaremos este control hardcoded por el real desde base de datos.

        const userInDb = await userModel.findOne({ email: email });
        if (userInDb !== null && isValidPassword(userInDb, pass)) {
            //Utilizando sessions
            // req.session.user = { username: email, admin: true };
            
            const access_token = generateToken({ username: email, admin: true }, '1h')
            //res.status(200).send({ status: 'OK', data: access_token })
            res.redirect(`/profilejwt?access_token=${access_token}`);
            
        } else {
            res.status(401).send({ status: 'ERR', data: 'Datos no válidos' });
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.post('/register', passport.authenticate('registerAuth', { failureRedirect: '/api/sessions/failregister' }), async (req, res) => {
    try {
        res.status(200).redirect('/login');
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.post('/restore', passport.authenticate('restoreAuth', { failureRedirect: '/api/sessions/failrestore' }), async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: 'Clave actualizada' });
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

export default router