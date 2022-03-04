const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const slug = require('mongoose-slug-generator');
const accountSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, /*required: true*/ },
    email: { type: String, required: true,unique: true},
    phoneNumber: { type: String, /*required: true*/ },
    dateOfBirth: { type: String, /*required: true*/default:"01/01/2000" },
    address: {type: String},
    isVerified: {
        type: Boolean,
        default: false,
    },
    typeAccount: { type: String, default: "default"},
    roles: { type: String, default: "customer"},
    refreshToken: { type: String, default: "" },
}, {
    collection: 'account',
    timestamps: true,
});
mongoose.plugin(slug);
module.exports = mongoose.model('account', accountSchema);