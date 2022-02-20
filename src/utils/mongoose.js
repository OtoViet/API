module.exports ={
    //mongo tu phien ban 4 tro di khong cho hien thi doi tuong ra file handlebars
    //nen phai convert truoc khi day du lieu vao file handlebars
    mulMgToObject: function(mongoosearrays){
        return mongoosearrays.map(mongoosearray=>mongoosearray.toObject());
    },
    mongooseToObject: function(mongoose){
        return mongoose ? mongoose.toObject() : mongoose;
    }
}