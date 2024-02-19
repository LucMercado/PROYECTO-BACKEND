import mongoose from 'mongoose'

mongoose.pluralize(null)

const collection = 'tickets'

const schema = new mongoose.Schema({
    code: { type: String, required: true },
    purchase_datetime: { type: Date, required: true},
    amount: { type: Number, required: true },
    purchaser:  { type: String, required: true }
})

export default mongoose.model(collection, schema)