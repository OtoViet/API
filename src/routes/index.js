const authRouter = require('./auth');
const adminRouter = require('./admin');
const customerRouter = require('./customer');
function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/customer', customerRouter);
    app.use('*',function(req, res){
        res.status(404).json('url not found');
    });
}

module.exports = route;
