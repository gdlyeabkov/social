const mongoose = require('mongoose')

const url = `mongodb+srv://glebClusterUser:glebClusterUserPassword@cluster0.fvfru.mongodb.net/products?retryWrites=true&w=majority`;

const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}

mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number
});

const ProductModel = mongoose.model('ProductModel', ProductSchema);

const product = new ProductModel();

const laptop = new ProductModel({ name: 'qweasdzxc', price: 200 });
laptop.save(function (err) {
    
    // saved!
  });
// const l = ProductModel.find({ price: 200 }).where('price').gt(100).exec(()=>{
    
// });

// console.log(l);
// product.save(function (err) {
//    console.log(err)
// })

//получение всех записей
var query = ProductModel.find({}).select(['name', 'price']);
query.exec((err, s) => {
    if (err){
        return
    }
    console.log(s)

});
// console.log(ProductModel.findById(1));

