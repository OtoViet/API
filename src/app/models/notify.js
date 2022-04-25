const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const slug = require('mongoose-slug-generator');
const notifySchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    type: {type: String, required: true},
    expoPushToken: {type: String},
    from: {type: String, required: true},
    isRead: {type: Boolean, default: false},
    detail: {type: Object},
}, {
    collection: 'notify',
    timestamps: true,
});
notifySchema.virtual('infoUser',{
    ref: 'account',
    localField: 'from',
    foreignField: 'email',
});
mongoose.plugin(slug);
module.exports = mongoose.model('notify', notifySchema);