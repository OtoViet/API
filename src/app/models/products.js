const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
const productsSchema = new Schema({
    productName: { type: String, required: true },
    price: { type: Number, required: true},
    priceSale: { type: Number},
    combo: [{ comboName: String}],
    images: [{ url: String}],
    description: { type: String, default: "Không có thông tin chi tiết"},
    rating: [{ comment: String, rating:Number, user: { type: String},
    createdAt: { type: Date, default: Date.now } }],
}, {
    collection: 'products',
    timestamps: true,
});
productsSchema.virtual('infoUserComment',{
    ref: 'account',
    localField: 'rating.user',
    foreignField: 'email',
});

productsSchema.set('toObject', { virtuals: true });
productsSchema.set('toJSON', { virtuals: true });
mongoose.plugin(slug);
module.exports = mongoose.model('products', productsSchema);