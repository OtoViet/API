const authRouter = require('./auth');
function route(app) {
    app.use('/api/auth', authRouter);
    app.use('*',function(req, res){
        res.status(404).json('url not found');
    });
}

module.exports = route;
