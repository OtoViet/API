const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
const storeListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    numOfStore: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },

}, {
    collection: 'storeList',
    timestamps: true,
});
mongoose.plugin(slug);
module.exports = mongoose.model('storeList', storeListSchema);