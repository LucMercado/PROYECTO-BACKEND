import { Router } from 'express'

const router = Router()

router.get('/getcookies', async (req, res) => {
    try {
        res.status(200).send({ status: 'OK', data: req.signedCookies })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.get('/setcookie', async (req, res) => {
    try {
        // Indico al navegador que almacene una cookie
        res.cookie('cookieHYM', 'Este es el contenido de la cookie firmado', { maxAge: 60000, signed: true })
        res.status(200).send({ status: 'OK', data: 'Cookie generada' })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.get('/deletecookie', async (req, res) => {
    try {
        res.clearCookie('cookieHYM')
        res.status(200).send({ status: 'OK', data: 'Cookie eliminada' })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

router.post('/', async (req, res) => {
    try {
        res.cookie('cookieHYM', { user: req.body.user, email: req.body.email }, { maxAge: 30000, signed: true })
        res.status(200).send({ status: 'OK', data: 'Cookie generada' })
    } catch (err) {
        res.status(500).send({ status: 'ERR', data: err.message })
    }
})

export default router