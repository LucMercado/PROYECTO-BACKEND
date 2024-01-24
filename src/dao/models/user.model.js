import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'

mongoose.pluralize(null)

const collection = 'users'

const schema = new mongoose.Schema({
    first_name: { type: String, required: true, index: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true },
    age: { type: Number, required: true },
    password: { type: String, required: true },
    cart: { type: mongoose.Schema.Types.ObjectId },
    role: { type: String, default: 'user' }
});

schema.plugin(mongoosePaginate)

export default mongoose.model(collection, schema)