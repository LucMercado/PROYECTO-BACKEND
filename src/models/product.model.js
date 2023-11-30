import moongose from 'mongoose'

//Sentencia para evitar errores de agregación de , .
moongose.pluralize(null)

const collection = 'products'

const schema = new moongose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    code: { type: String, required: true },
    status: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, required: false }
})



export default moongose.model(collection, schema)

