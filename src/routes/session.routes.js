import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken'

import userModel from '../dao/models/user.model.js';
import { createHash, isValidPassword, generateToken, passportCall, handlePolicies, enviarCorreoRestablecimiento, authToken } from '../utils.js';
import initPassport from '../auth/passport.config.js';
import errorsDictionary from '../services/errors.dictionary.js';
import config from '../config.js'

class UserProfileDTO {
    constructor(user) {
        this.email = user.email;
        this.first_name = user.first_name;
        this.last_name = user.last_name;
        this.age = user.age;
        this.role = user.role;
    }
}

// Inicializamos instancia de estrategia/s
initPassport()

const router = Router()

router.get('/logout', async (req, res) => {
    try {
        req.user = {};
        res.clearCookie('tokenHYM');
        req.logger.info({ status: 'OK', code: '200', message: 'User logged out' });

        // req.session.destroy nos permite destruir la sesión
        // De esta forma, en la próxima solicitud desde ese mismo navegador, se iniciará
        // desde cero, creando una nueva sesión y volviendo a almacenar los datos deseados.
        req.session.destroy((err) => {
            if (err) {
                req.logger.error({ status: 'ERR', code: '500', message: err.message });
                res.status(500).send({ status: 'ERR', data: err.message })
            } else {
                // El endpoint puede retornar el mensaje de error, o directamente
                // redireccionar a login o una página general.
                // res.status(200).send({ status: 'OK', data: 'Sesión finalizada' })
                res.redirect('/login')
            }
        })
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

// Endpoint de uso interno, solo para generar claves hasheadas de prueba cuando haga falta
router.get('/hash/:pass', async (req, res) => {
    res.status(200).send({ status: 'OK', data: createHash(req.params.pass) });
})

router.get('/failregister', async (req, res) => {
    req.logger.error({ status: 'ERR', code: '400', message: 'El email ya existe o faltan datos obligatorios' });
    res.status(400).send({ status: 'ERR', data: 'El email ya existe o faltan datos obligatorios' });
})

//Autenticación a través de GITHUB
router.get('/github', passport.authenticate('githubAuth', { scope: ['user:email'] }), async (req, res) => {
})

router.get('/githubcallback', passport.authenticate('githubAuth', { failureRedirect: '/login' }), async (req, res) => {
    const token = generateToken(req.user, '1h');
    res.redirect('/profilejwt?token=' + token);
})

router.get('/current', passportCall('jwtAuth', { session: false }), handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
    const userDTO = new UserProfileDTO(req.user);
    res.status(200).send({ status: 'OK', data: userDTO })
})

router.post('/login_manual_jwt', async (req, res) => {
    try {
        const { email, pass } = req.body

        const userInDb = await userModel.findOne({ email: email })
        if (userInDb !== null && isValidPassword(userInDb, pass)) {
            const { _id, password, ...userInDbSafe } = userInDb._doc;

            const access_token = generateToken(userInDbSafe, '1h')
            res.cookie('tokenHYM', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })
            // res.status(200).send({ status: 'OK', data: { access: 'authorized', token: access_token } })
            setTimeout(() => res.redirect('/profilejwt'), 200);
        } else {
            req.logger.error({ status: 'ERR', code: '401', message: 'Datos no válidos' });
            res.status(401).send({ status: 'ERR', data: 'Datos no válidos' })
        }
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/login_passport_jwt', passport.authenticate('loginAuth', { failureRedirect: '/login?msg=Usuario o clave no válidos', session: false }), async (req, res) => {
    try {
        const access_token = generateToken(req.user, '1h')
        res.cookie('tokenHYM', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })
        setTimeout(() => res.redirect('/profilejwt'), 200);
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/register', passport.authenticate('registerAuth', { failureRedirect: '/api/sessions/failregister' }), async (req, res) => {
    try {
        res.status(200).redirect('/login');
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.post('/send-restore-email', async (req, res) => {
    try {
        const { email } = req.body;
        const userInDb = await userModel.findOne({ email: email });
        if (userInDb !== null) {
            const token = generateToken({ email: userInDb.email }, '1h');

            const data = enviarCorreoRestablecimiento(email, token);
            req.logger.info(data);
            res.redirect('/restore-email-sent');

        } else {
            req.logger.error(errorsDictionary.USER_NOT_FOUND);
            res.redirect('/send-restore-email?msg=El email no pertenece a ningún usuario registrado.');
        }
    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: 'ERR', data: err.message });
    }
})

router.post('/restore', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        //Decodificamos el token
        const email = jwt.verify(token, config.SECRET_KEY, (error, decoded) => {
            if (error) {
                req.logger.error('Token inválido o expirado');
                return res.redirect('/send-restore-email?msg=Token inválido o expirado.');
            }

            return decoded.email
        });
        const userInDb = await userModel.findOne({ email: email });
        if (userInDb !== null) {
            //Comparo si la nueva contraseña es la contraseña actual
            const samePassword = isValidPassword(userInDb, newPassword);
            if (samePassword) {
                req.logger.warning('La nueva contraseña no puede ser igual a la contraseña actual elija otra.');
                res.redirect(`/restore?token=${encodeURIComponent(token)}&msg=La nueva contraseña no puede ser igual a la actual, elija otra.`);
            } else {
                userInDb.password = createHash(newPassword);
                userInDb.save();
                req.logger.info('Contraseña restablecida exitosamente');
                res.status(200).redirect('/login');
            }
        }

    } catch (err) {
        req.logger.error({ status: 'ERR', code: '500', message: err.message });
        res.status(500).send({ status: 'ERR', data: err.message });
    }


});

export default router