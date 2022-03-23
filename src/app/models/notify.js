const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const slug = require('mongoose-slug-generator');
const notifySchema = new Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    idUser: {type: ObjectId, required: true, ref: 'account'},
}, {
    collection: 'notify',
    timestamps: true,
});
mongoose.plugin(slug);
module.exports = mongoose.model('notify', notifySchema);