import { Router } from 'express';
import passport from 'passport';

import userModel from '../dao/models/user.model.js';
import { createHash, isValidPassword, generateToken, passportCall } from '../utils.js';
import initPassport from '../auth/passport.config.js';

// Inicializamos instancia de estrategia/s
initPassport()

const router = Router()

const auth = (req, res, next) => {
    try {
        if (req.session.user) {
            if (req.session.user.role === 'admin') {
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

const handlePolicies = policies => {
    return async (req, res, next) => {
        if (!req.user) return res.status(401).send({ status: 'ERR', data: 'Usuario no autorizado' })

        // Normalizamos todo a mayúsculas para comparar efectivamente
        const userRole = req.user.role.toUpperCase();
        policies.forEach((policy, index) => policies[index] = policies[index].toUpperCase());

        if (policies.includes('PUBLIC')) return next();
        if (policies.includes(userRole)) return next();
        res.status(403).send({ status: 'ERR', data: 'Sin permisos suficientes' });
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
        req.user = {};
        res.clearCookie('tokenHYM');

        // req.session.destroy nos permite destruir la sesión
        // De esta forma, en la próxima solicitud desde ese mismo navegador, se iniciará
        // desde cero, creando una nueva sesión y volviendo a almacenar los datos deseados.
        req.session.destroy((err) => {
            if (err) {
                res.status(500).send({ status: 'ERR', data: err.message })
            } else {
                // El endpoint puede retornar el mensaje de error, o directamente
                // redireccionar a login o una página general.
                // res.status(200).send({ status: 'OK', data: 'Sesión finalizada' })
                res.redirect('/login')
            }
        })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
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
    req.session.user = { username: req.user.email, role: 'user' }
    // req.session.user = req.user
    res.redirect('/profile')
})

router.get('/current', passportCall('jwtAuth', { session: false }), handlePolicies(['user', 'premium', 'admin']), async (req, res) => {
    res.status(200).send({ status: 'OK', data: req.user })
})

router.post('/login_session', async (req, res) => {
    try {
        const { email, pass } = req.body

        const userInDb = await userModel.findOne({ email: email })
        if (userInDb !== null && isValidPassword(userInDb, pass)) {
            const { _id, password, ...userInDbSafe } = userInDb._doc;
            
            req.session.user = userInDbSafe
            res.redirect('/profile')
        } else {
            res.status(401).send({ status: 'ERR', data: 'Datos no válidos' })
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
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
            res.status(401).send({ status: 'ERR', data: 'Datos no válidos' })
        }
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/login_passport_jwt', passport.authenticate('loginAuth', { failureRedirect: '/login?msg=Usuario o clave no válidos', session: false }), async (req, res) => {
    const access_token = generateToken(req.user, '1h')
    res.cookie('tokenHYM', access_token, { maxAge: 60 * 60 * 1000, httpOnly: true })
    setTimeout(() => res.redirect('/profilejwt'), 200);
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