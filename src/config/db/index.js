const mongoose = require('mongoose');
async function connect(){
    try{
        const MONGO_STRING_CONNECT_CLUSTER = process.env.MONGO_STRING_CONNECT_CLUSTER;
        await mongoose.connect(MONGO_STRING_CONNECT_CLUSTER , {
        });
        console.log("Ket noi database thanh cong !!!")
    }
    catch(error){
        console.log('Thong tin loi:\n',error);
        console.log("Ket noi database khong thanh cong !!!")
    }
}
module.exports ={ connect };