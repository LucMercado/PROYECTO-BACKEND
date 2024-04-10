import mongoose from 'mongoose'


mongoose.pluralize(null)

const collection = 'carts'


// El atributo ref nos permite indicar que el campo se "enlazará" con otra colección
const schema = new mongoose.Schema({
    products: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products', // ref a la colección
        },
        quantity: {
            type: Number,
            default: 1, // Cantidad por defecto si se agrega por primera vez
        }
    }],
    total: { type: Number, required: true }
})

export default mongoose.model(collection, schema)