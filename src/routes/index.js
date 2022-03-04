const authRouter = require('./auth');
const adminRouter = require('./admin');
function route(app) {
    app.use('/api/auth', authRouter);
    app.use('/api/admin', adminRouter);
    app.use('*',function(req, res){
        res.status(404).json('url not found');
    });
}

module.exports = route;
