const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
const discountSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    percentSale: {
        type: Number,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    code: {type: String, required: true},
    description: {type: String, required: true},
}, {
    collection: 'discount',
    timestamps: true,
});
mongoose.plugin(slug);
module.exports = mongoose.model('discount', discountSchema);