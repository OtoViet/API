const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
const ordersSchema = new Schema({
    contactInfo: { type: Object, required: true },
    dateAppointment : { type: Date, required: true },
    timeAppointment : { type: String, required: true },
    totalPrice: { type: Number, required: true },
    storeAddress: { type: Number, required: true, ref: 'storeList' },
    carSize: { type: String, required: true },
    listService: [{ 
        id: {type: Number, required: true},
        idProduct: {type: String, ref: 'products', required: true},
        productName:{type: String, required: true},
        price: {type: Number, required: true}, 
    }],
    percentSale: { type: Number},
    isPaid: {type: Boolean, default: false},
    isCommented: {type: Boolean, default: false},
    isCanceled: {type: Boolean, default: false},
    isCompleted: {type: Boolean, default: false},
    isSendEmail: {type: Boolean, default: false},
    isDeleted: {type: Boolean, default: false},
    isConfirmed: {type: Boolean, default: false}
}, {
    collection: 'orders',
    timestamps: true,
});
mongoose.plugin(slug);
module.exports = mongoose.model('orders', ordersSchema);