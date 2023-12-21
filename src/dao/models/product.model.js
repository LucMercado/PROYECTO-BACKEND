import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

//Sentencia para evitar errores de agregación de , .
mongoose.pluralize(null)

const collection = 'products'

const schema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    price: { type: Number, required: true },
    code: { type: String, required: true },
    status: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, required: false }
})

schema.plugin(mongoosePaginate)


export default mongoose.model(collection, schema)

