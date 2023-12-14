import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'carts'


const schema = new mongoose.Schema({
    products: { type: [ mongoose.Schema.Types.ObjectId ]},
    total: { type: Number, required: true }
});

export default mongoose.model(collection, schema)