const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
const ordersSchema = new Schema({
    orderUser: { type: Schema.Types.ObjectId, ref: 'Account' },
    typeService: { type: String, required: true},
    dateAppointment : { type: Date, required: true },
    timeAppointment : { type: String, required: true },
    price: { type: Number, required: true },
    percentSale: { type: Number},
    isPaid: {type: Boolean, default: false},
    isCanceled: {type: Boolean, default: false},
    isCompleted: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    isConfirmed: {type: Boolean, default: false}
}, {
    collection: 'orders',
    timestamps: true,
});
mongoose.plugin(slug);
module.exports = mongoose.model('orders', ordersSchema);