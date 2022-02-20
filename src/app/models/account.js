const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');
const accountSchema = new Schema({
    firstName: { type: String, required: true, unique: true },
    lastName: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    isVerified: {
        type: Boolean,
        default: false,
    },
    typeAccount: { type: String, default: "default"},
    roles: { type: String, default: "customer"}
}, {
    collection: 'account',
    timestamps: true,
});
mongoose.plugin(slug);
module.exports = mongoose.model('account', accountSchema);