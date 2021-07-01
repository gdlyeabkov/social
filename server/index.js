const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const { isError } = require('util')
const serveStatic = require('serve-static')

const app = express()

app.use('/', serveStatic(path.join(__dirname, '/dist')))



var auth = false
const url = `mongodb+srv://glebClusterUser:glebClusterUserPassword@cluster0.fvfru.mongodb.net/posts?retryWrites=true&w=majority`;



var options = {
    root: path.join(__dirname, 'views'),
}   

express.static(path.join(__dirname, 'views'))

const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}

mongoose.connect(url, connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })

const PostSchema = new mongoose.Schema({
    content: String,
    sender: String,
    created: {
        default: new Date().toLocaleString(),
        type: String
    },
}, { collection : 'myposts' });

const PostModel = mongoose.model('PostModel', PostSchema);

const GroupSchema = new mongoose.Schema({
    name: String,
    description: String,
    access: String,
    imageurl: {
        type: String,
        default: 'empty'
    },
    partisipants: [mongoose.Schema.Types.Map],
}, { collection : 'mygroups' });

const GroupsModel = mongoose.model('GroupsModel', GroupSchema);

const UsersSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    age: Number,
    imageurl: {
        type: String,
        default: 'empty'
    },
    likes: {
        type: Number,
        default: 0
    },
    friends: [mongoose.Schema.Types.Map],
    groups: [mongoose.Schema.Types.Map]
}, { collection : 'myusersofposts' });

// const OrderSchema = new mongoose.Schema({
//     ownername: String,
//     price: Number
// });

// const OrderModel = mongoose.model('OrderModel', OrderSchema);
const UsersModel = mongoose.model('UsersModel', UsersSchema, 'myusersofposts');

app.set('view engine', 'ejs')

app.get('/', async (req, res)=>{

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    console.log('req.query: ', req.query)
    console.log('req.query.auth === true: ', req.query.auth === "true")
    if(req.query.auth === "true"){
        let queryOfFriendsBefore =  UsersModel.findOne({'email': req.query.sender + "@mail.ru"}, function(err, beforeUser){
            if(err){
                console.log('ошибка получение всех записей текущего пользователя и его друзей')
                return
            } else {
                console.log('получение всех записей текущего пользователя и его друзей')
                const friendsPosts = []
                beforeUser.friends.map((friendKey, friendValue) => {
                    console.log("friendKey", friendKey)
                    console.log("friendValue", friendValue)
                    console.log(new Map(friendKey).get('email'))
                    
                    friendsPosts.push(new Map(friendKey).get('email').split('@')[0])
                })
                console.log(new Array(beforeUser.friends))
                console.log(friendsPosts)
                
                let query = PostModel.find({ $or:[ {  sender: { $eq: req.query.sender } }, { sender: { $in: friendsPosts }  } ] }, null, { sort: { created: -1 } }).select(['content', 'sender']);
                query.exec((err, allPosts) => {
                    if (err){
                        console.log('ошибка получение всех записей текущего пользователя и его друзей')
                        return
                    }

                    
                    if(Array(req.query.auth)[0] === undefined){
                        return res.render('index', { allPosts: null, guest: false, auth:false, allFriends: null})
                    }

                    let nickOfUser = req.query.sender
                    let queryOfFriends =  UsersModel.findOne({'email': req.query.sender + "@mail.ru"}, function(err, user){
                        if (err){
                            return
                        } else {
                            
                            console.log('friends', user.friends)
                            console.log('likes', user.likes)
                            console.log('groups', user.groups)
                            
                            const userGroupsArray = []
                            user.groups.map((groupKey, groupValue) => {
                                userGroupsArray.push(new Map(groupKey).get('name'))
                            })
                            console.log('userGroupsArray', userGroupsArray)
                            const groupsWithData = []
                            const queryOfGroupsWithData = GroupsModel.find({ name: { $in: userGroupsArray } }).select(['name', 'description', 'access', 'imageurl', 'partisipants' ])
                            queryOfGroupsWithData.exec((error, groups) => {
                                if(error){
                                    console.log('error Group')
                                    return
                                }
                                console.log('group success')
                                groups.forEach((g) => {
                                    groupsWithData.push(g)
                                })
                                console.log('groups', groups)
                                console.log('groupsWithData', groupsWithData)
                                if(req.query.guest.includes('true')){
                                    // res.render('index', { allPosts: allPosts, auth:true, guest: true, touser:req.query.touser, sender: nickOfUser, allFriends: user.friends, likes: user.likes, allGroups: user.groups, imageurl: user.imageurl, name: user.name, age: user.age, password: user.password, groupswithdata: groupsWithData })
                                    return res.json({ "allPosts": allPosts, "auth": 'true', "guest": true, "touser":req.query.touser, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "imageurl": user.imageurl, "name": user.name, "age": user.age, "password": user.password, "groupswithdata": groupsWithData })
                                } else if(req.query.guest.includes('false')){
                                    //res.render('index', { allPosts: allPosts, auth:true, guest: false, sender: nickOfUser, allFriends: user.friends, likes: user.likes, allGroups: user.groups, imageurl: user.imageurl, name: user.name, age: user.age, password: user.password, groupswithdata: groupsWithData })
                                    return res.json({ "allPosts": allPosts, "auth": 'true', "guest": false, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "imageurl": user.imageurl, "name": user.name, "age": user.age, "password": user.password, "groupswithdata": groupsWithData})
                                }  
                                console.log("пользовтель",user)
                            })                            
                        }
                    })
                })
            }
        })
    } else if (req.query.auth === 'false'){
        return res.json({ "auth": "false" })
        // res.redirect('/users/login')
    }
})

// app.get('/admin/orders', (req, res)=>{
//     //получение всех заказов
//     let query = OrderModel.find({}).select(['ownername', 'price']);
//     query.exec((err, allOrders) => {
//         if (err){
//             return
//         }
//         let mailOfUser = req.query.useremail
//         res.render('orderslist', { allOrders })
//     });
    
// })
// app.get('/admin/products/add', async (req, res)=>{
//     if(Array(req.query.productname)[0] === undefined){
//         res.send(`product not found`)
//         return
//     } else if(Array(req.query.productname)[0] !== undefined) {
//         await new ProductModel({ name: req.query.productname, price: Number(req.query.productprice) }).save(function (err) {
//             if(err){
//                 res.send(`product not found`)
//                 return
//             } else {
//                 res.redirect('/')
//             }
//         })
//     }
// })

// app.get('/admin/products/delete', async (req, res)=>{
//     if(Array(req.query.productname)[0] === undefined){
//         res.send(`product not found`)
//         return
//     } else if(Array(req.query.productname)[0] !== undefined) {
//         // mongoose.connection.collection("myusersofposts").updateOne(       
//         //     {  },
//         //     { $pull: { 'productsInBucket': { name: req.query.productname } } }
//         // );
        
//         // await ProductModel.deleteMany({ name: req.query.productname, price:Number(req.query.productprice) })
//         await ProductModel.deleteMany({ name: req.query.productname  })
//         res.redirect('/')
        
//     }
// })

app.get('/post/:postID',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    let query = PostModel.findById(req.params.postID);
        query.exec((err, post) => {
        if (err){
            return
        }
        console.log(post)
        res.json({ post })
        // res.render('post', { post: post })
    });  
})

app.get('/users/edit',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    //res.render('useredit', { auth:true, touser: req.query.touser, imageurl: req.query.imageurl, name: req.query.name, age: req.query.age, email: req.query.email, password: req.query.password  })
    res.json({ 'auth':true, 'touser': req.query.touser, 'imageurl': req.query.imageurl, 'name': req.query.name, 'age': req.query.age, 'email': req.query.email, 'password': req.query.password  })
})

app.get('/users/editsuccess', async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    await UsersModel.updateOne({ email: req.query.touser },
        {
            imageurl: req.query.imageurl,
            name: req.query.name,
            age: req.query.age,
            email: req.query.email,
            password: req.query.password,
        }, (err) => {
            if(err){
                return
            } else {
                let queryOfFriends =  UsersModel.findOne({'email': req.query.email}, function(err, user){
                    if (err){
                        return
                    } else {
                        const userGroupsArray = []
                        user.groups.map((groupKey, groupValue) => {
                            userGroupsArray.push(new Map(groupKey).get('name'))
                        })
                        console.log('userGroupsArray', userGroupsArray)
                        const groupsWithData = []
                        const queryOfGroupsWithData = GroupsModel.find({ name: { $in: userGroupsArray } }).select(['name', 'description', 'access', 'imageurl', 'partisipants' ])
                        queryOfGroupsWithData.exec( async (error, groups) => {
                            if(error){
                                return
                            }
                            groups.forEach((g) => {
                                groupsWithData.push(g)
                            })
                            nickOfUser = req.query.email.split('@')[0]
                            const allPosts = []
                            
                            // PostModel.updateMany({ sender: req.query.touser.split('@')[0] }, {
                            //     sender: nickOfUser
                            // })

                            await PostModel.updateMany({ sender: req.query.touser.split('@')[0] },
                                {
                                    sender: nickOfUser
                                }, (err) => {
                                    if(err){
                                        console.log("error PostModel")
                                        return
                                    } else {
                                        console.log("success PostModel")
                                    }
                                }
                            )

                            // await mongoose.connection.collection("myposts").updateMany({ sender: { $eq: req.query.touser.split('@')[0] } }, {
                            //     sender: req.query.email.split('@')[0]
                            // })

                            let query = PostModel.find({ sender: { $eq: req.query.email.split('@')[0] } })
                            query.exec((err, allPosts) => {
                                console.log('req.query', req.query)
                                console.log('обновил')
                                res.json({ "allPosts": allPosts, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "groupswithdata": groupsWithData })
                                // res.render('index', { auth:true, guest: false, allPosts, auth:true, sender: nickOfUser, allFriends: user.friends, likes: user.likes, allGroups: user.groups, imageurl: user.imageurl, name: req.query.name, age: req.query.age, password: req.query.password, groupswithdata: groupsWithData })
                                    
                            })
                            //res.render('index', { allPosts: allPosts, auth:true, sender: nickOfUser, allFriends: user.friends, likes: user.likes, allGroups: user.groups, imageurl: user.imageurl, name: user.name, age: user.age, password: user.password, groupswithdata: groupsWithData })
                        })
                
                    }
                }
            )
        }
    })
})

app.get('/users/groups/edit',(req, res)=>{
    //res.render('groupedit', { auth:true, imageurl: req.query.imageurl, groupname: req.query.groupname, groupdescription: req.query.groupdescription, groupaccess: req.query.groupaccess, touser: req.query.touser })
    // res.json({ imageurl: req.query.imageurl, groupname: req.query.groupname, groupdescription: req.query.groupdescription, groupaccess: req.query.groupaccess, touser: req.query.touser })
})

app.get('/users/groups/editsuccess', async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    await GroupsModel.updateOne({ name: req.query.previousgroupname },
        {
            imageurl: req.query.imageurl,
            name: req.query.groupname,
            description: req.query.groupdescription,
            access: req.query.groupaccess
        }, (err) => {
            if(err){
                console.log("error group")
                return res.json({ message: 'failed' })
            } else {
                console.log("success group")
                return res.json({ message: 'success' })
                // res.redirect(`/users/groups?imageurl=${req.query.imageurl}&groupname=${req.query.groupname}&groupdescription=${req.query.groupdescription}&groupaccess=${req.query.groupaccess}&touser=${req.query.touser}`)
            }
        }
    )
})

app.get('/postadd', async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    await new PostModel({ sender: req.query.sender, content: req.query.content }).save(function (err) {
        if(err){
            console.log('ошибка добавления поста')
            return
        } else {
            console.log('добавление поста')
            res.json({ 'message': 'success' })
            // res.redirect(`/?auth=true&guest=false&sender=${req.query.sender}`)
        }
    })
})

app.get('/users/groups', async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let query = GroupsModel.findOne({ name: req.query.groupname }).select(['partisipants']);
    query.exec((err, group) => {
        if (err){
            return
        }
        res.json({ "auth": true, "name": req.query.groupname, "access": req.query.groupaccess, "description": req.query.groupdescription, "partisipants": group.partisipants, "imageurl": req.query.imageurl, "touser": req.query.touser })
        // res.render('group', {auth: true, name: req.query.groupname, access: req.query.groupaccess, description: req.query.groupdescription, partisipants: group.partisipants, imageurl: req.query.imageurl, touser: req.query.touser })
    })
})

app.get('/users/groups/register',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    //console.log(Array(req.query.useremail)[0] === undefined)
    //if(Array(req.query.useremail)[0] === undefined){
    //   res.render('groupsregistry', { userlogin : false })
    //} else {
        
        // res.render('groupsregistry', { userlogin : true, touser: req.query.touser })
        res.json({ "userlogin": true, "touser": req.query.touser  })
    //}
})

app.get('/users/groups/groupcreatesuccess',async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    //let query = await UsersModel.create({ email: 'rodion@mail.ru', password:req.params.userpassword.toString(), name:req.params.username, age:req.params.userage });
    let query = GroupsModel.find({}).select(['name', 'partisipants']);
    query.exec(async (err, allGroups) => {
        if (err){
            return
        }
        var groupExists = false;
        // allGroups.forEach(group => {
        //     if(group.name.includes(req.query.groupname)){
        //         groupExists = true
        //     }
        // });
        if(groupExists){
            console.log('in', req.query.groupname in allGroups)
            console.log('rollback')
            return res.send('rollback')
        } else {
            console.log('создание', req.query.groupname in allGroups)
            auth = true
            const group = await new GroupsModel({ name: req.query.groupname, description:req.query.groupdescription, access: req.query.groupaccess, imageurl: req.query.imageurl });
            group.save(async function (err) {
                if(err){
                    console.log('создание ошибка')
                    console.log(err)
                    return
                } else {
                    await UsersModel.updateOne({ email: req.query.touser },
                        { $push: 
                            {
                                groups: [
                                    {
                                        name: req.query.groupname
                                    }
                                ]
                                
                            }
                    }, async  (err) => {
                        if(err){
                            return
                        } else {
                            await GroupsModel.updateOne({ name: req.query.groupname },
                                { $push: 
                                    { 
                                        partisipants: [
                                            {
                                                email: req.query.touser
                                            }
                                        ]
                                        
                                    }
                            })
                            // res.redirect(`/users/groups/partisipants/add?groupname=${req.query.groupname}&groupaccess=${req.query.groupaccess}&groupdescription=${req.query.groupdescription}&imageurl=${req.query.imageurl}&touser=${req.query.touser}&useremail=${req.query.touser}`)
                            return res.json({ "message": "success" })
                        } 
                    })
                }
            })
            
        }
    })
})

app.get('/userprofile', (req, res)=>{
    let query = UsersModel.findOne({'email': req.query.sender }, function(err, user){
        query.exec((err, user) => {
            if (err){
                return
            }
            console.log(user)
            res.render('userprofile', { user: user })
        });  
    })
})


app.get('/users/register',(req, res)=>{
    console.log(Array(req.query.useremail)[0] === undefined)
    if(Array(req.query.useremail)[0] === undefined){
        res.render('usersregistry', { userlogin : false })
    } else {
        res.render('usersregistry', { userlogin : true })
    }
})

app.get('/users/logout',(req, res)=>{
    auth = false
    res.redirect('/')
})

app.get('/users/friends/delete', async (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    console.log(mongoose.connection.collection("myusersofposts"))
    mongoose.connection.collection("myusersofposts").updateOne(
        { email: req.query.touser },
        { $pull: { 'friends': { email: req.query.useremail } } }
    )
    // res.redirect(`/?auth=true&guest=true&sender=${req.query.touser.split('@')[0]}`)
    res.json({ "message": "success" })
})

// app.get('/users/bucket/buy',async (req, res)=>{
//     //const moneys = req.query.moneys
//     //const productsInBucket = req.query.productsInBucket
//     let query = await UsersModel.findOne({'email': req.query.useremail }, async function(err, user){
//     // res.render('ordersuccess', { success: false, auth: true, user: user.email })
    
        
//         if (err){
//             res.render('ordersuccess', { success: false, auth: true, user: user.name })
//         } else {
//             if(user != null && user != undefined){
//                 let commonPrice = 0
//                 user.productsInBucket.forEach(function (product){
//                     if(new Map(product).get('price') == null){
//                         commonPrice += 0
//                     } else {
//                         commonPrice += new Map(product).get('price')
//                     }
//                 })
//                 if(user.moneys >= commonPrice){
//                     const order = await new OrderModel({ ownername: req.query.useremail, price: commonPrice });
//                     order.save(function (err) {
//                         if(err){
//                             return
//                         } else {
//                             res.render('ordersuccess', { success: true, auth: true, user: user.name })        
//                         }
//                     });
                    
//                     await UsersModel.updateOne({ email: req.query.useremail }, 
//                     { 
//                         "$inc": { "moneys": -commonPrice }
//                     })
//                     // await UsersModel.updateOne({}, {}).

//                     // res.render('ordersuccess', { success: true, auth: true, user: user.name })
//                 } else if(user.moneys < commonPrice){
//                     res.render('ordersuccess', { success: false, auth: true, user: user.name })
//                 }
//             } else {
//                 res.render('ordersuccess', { success: false, auth: true, user: user.name })
//             }
//         }
//     })
    

// })

app.get('/users/likes',async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let query = await UsersModel.findOne({'email': req.query.useremail }, async function(err, user){
        if (err || Array(req.query.useremail)[0] === undefined){
            return
        } else {
            if(user != null && user != undefined){
                await UsersModel.updateOne({ email: req.query.useremail }, 
                { 
                    "$inc": { "likes": 1 }
                })
                res.redirect(`/?auth=true&guest=false&sender=${req.query.useremail.split('@')[0]}`)
            } else {
                return
            }
        }
    })
    

})

app.get('/users/login',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    res.render('userslogin')
})

app.get('/users/list',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let queryOfFriendsBefore =  UsersModel.findOne({'email': req.query.touser}, function(err, beforeUser){
        const friendsOfUser = []
        beforeUser.friends.map((friendKey, friendValue) => {
            console.log("friendKey", friendKey)
            console.log("friendValue", friendValue)
            console.log(new Map(friendKey).get('email'))
            
            friendsOfUser.push(new Map(friendKey).get('email'))
        })
        console.log('friendsOfUser', friendsOfUser)
        console.log('beforeUser', beforeUser)
        let query = UsersModel.find({ email: { $nin: friendsOfUser } });
        // let query = UsersModel.find({  }).select(['email', 'age', 'name']);
        query.exec((err, allUsers) => {
            if (err){
                return
            }
            allUsers = allUsers.filter((user) => {
                if(user.email === req.query.touser){
                    return false
                }
                return true
            })
            res.json({ "friendsOfUser": friendsOfUser, "allUsers": allUsers, "auth": true, "touser": req.query.touser })
            // res.render('userslist', { friendsOfUser, allUsers, auth: true, touser: req.query.touser })
        })
    })
})

app.get('/users/groups/list',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let queryOfGroups = GroupsModel.find({  }).select(['name', 'description', 'access', 'imageurl', 'partisipants']);
    let queryOfUser = UsersModel.find({ email: req.query.sender }).select(['groups']);
    queryOfGroups.exec((err, allGroups) => {
        queryOfUser.exec((err, allGroupsOfUser) => {
            if (err){
                return
            }
            allGroups = allGroups.filter((group) => {
                if(group.name in allGroupsOfUser){
                    return false
                }
                return true
            })
            console.log(allGroups)
            const groupsOfUser = []
            allGroupsOfUser.map((groupKey, groupValue) => {
                    console.log("groupKey", groupKey.groups)
                    console.log("groupValue", groupValue)
                    groupKey.groups.map((groupKeyInner, groupValueInner) => {
                        console.log(new Map(groupKeyInner).get('name'))
                        
                        groupsOfUser.push(new Map(groupKeyInner).get('name'))
                    })
                })
                console.log('groupsOfUser', groupsOfUser)

                let queryOfNotHasGroups = GroupsModel.find({ name: { $nin: groupsOfUser } });
                queryOfNotHasGroups.exec((err, notHasGroups) => {
                    if (err){
                        return
                    }
                    // notHasGroups = notHasGroups.filter((group) => {
                    //     if(group.name === req.query.touser){
                    //         return false
                    //     }
                    //     return true
                    // })
                    let queryOfNotHasGroups = GroupsModel.find({ name: { $in: groupsOfUser } });
                    queryOfNotHasGroups.exec((err, hasGroups) => {
                        if (err){
                            return
                        }
                        
                        console.log('allGroups', allGroups)

                            const allGroupsWithPartisipants = []
                            allGroups.map((groupKey, groupValue) => {
                                groupKey.partisipants.map((groupPartisipantKey, groupPartisipantValue) => {
                                    console.log('new Map(groupPartisipantKey).get(email)', new Map(groupPartisipantKey).get('email'))
                                    console.log('req.query.sender', req.query.sender)
                                    if(new Map(groupPartisipantKey).get('email').includes(req.query.sender)){
                                        allGroupsWithPartisipants.push(groupKey.name)
                                    }
                                    
                                })
                            })
                            
                            let queryOfAllGroupsWithoutPartisipants = GroupsModel.find({ name: { $nin: allGroupsWithPartisipants } });
                            queryOfAllGroupsWithoutPartisipants.exec((err, allGroupsWithoutPartisipants) => {
                                if (err){
                                    return
                                }
                                console.log('allGroupsWithPartisipants', allGroupsWithPartisipants)
                                console.log('allGroupsWithoutPartisipants', allGroupsWithoutPartisipants)
                                GroupsModel.find({ name: {$in: allGroupsWithPartisipants} }, (err, allGroupsWithPartisipants) => {
                                    if(err){
                                        return
                                    }
                                    
                                    // res.render('groupslist', { allGroups, allGroupsWithPartisipants, allGroupsWithoutPartisipants, hasGroups: hasGroups, notHasGroups: notHasGroups, auth: true, touser: req.query.touser })
                                    res.json({ "touser": req.query.sender, "allGroups": allGroups, "allGroupsWithPartisipants": allGroupsWithPartisipants, "allGroupsWithoutPartisipants": allGroupsWithoutPartisipants, "hasGroups": hasGroups, "notHasGroups": notHasGroups, "auth": true })
                                })
                                
                            })
                    })
                })
        // })

            // res.render('groupslist', { allGroups, hasGroups: [], notHasGroups: [], auth: true, touser: req.query.touser })
        })
    })
})

app.get('/users/check', (req,res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let query =  UsersModel.findOne({'email': req.query.useremail}, function(err, user){
        if (err){
            return
        } else {
            if(user != null && user != undefined && req.query.userpassword == user.password){
                auth = true
                return res.json({ "auth": "true", "sender": user.email.split('@')[0] })
                // res.redirect(`/?auth=true&guest=false&sender=${user.email.split('@')[0]}`)
            } else {
                // res.send(`user not found`)    
                return res.json({ "auth": "false" })
            }
            console.log(user)
        }
    })
})

app.get('/users/usercreatesuccess',async (req, res)=>{
    //let query = await UsersModel.create({ email: 'rodion@mail.ru', password:req.params.userpassword.toString(), name:req.params.username, age:req.params.userage });
    let query = UsersModel.find({}).select(['email']);
    query.exec(async (err, allUsers) => {
        if (err){
            return
        }
        
        var userExists = false;

        allUsers.forEach(user => {
            if(user.email.includes(req.query.useremail)){
                userExists = true
            }
        });
        if(userExists){
            console.log('in',req.query.useremail in allUsers)
            console.log('rollback')
            return res.send('rollback')
        } else {
            console.log('создание',req.query.useremail in allUsers)
            auth = true
            const user = await new UsersModel({ email: req.query.useremail, password:req.query.userpassword, name:req.query.username, age: Number(req.query.userage) });
            user.save(function (err) {
                if(err){
                    console.log('создание ошибка')
                    console.log(err)
                    return
                } else {
                    res.redirect(`/?auth=true&guest=true&sender=${req.query.useremail.split('@')[0]}`)
                }
            })
        }
        // if(req.query.useremail in allUsers){
        //     console.log(req.query.useremail in allUsers)
        //     res.redirect('/users/register',{ userlogin:true}) 
        // } else {
        //     const user = await new UsersModel({ email: req.query.useremail, password:req.query.userpassword, name:req.query.username, age:req.query.userage.anchor, friends: new Map() });
        //     user.save(function (err) {
        //         if(err){
        //             return
        //         } else {
        //             //localStorage.setItem('logined', 'true')
        //             // res.redirect('/users/register')
        //             //res.redirect(`/users/usercreatesuccess?useremail=${useremail}&userpassword=${userpassword}&username=${username}&userage=${userage}`)
        //             auth = true
        //             // res.render('usercreatesuccess', {userlogin: true, useremail: req.query.useremail})
        //             //res.render('index', {userlogin: true, sender: req.query.useremail})
        //             res.redirect(`/?sender=${req.query.useremail}`)
        //         }
        //     });
    });
    
    // query.exec((err, product) => {
    //     if (err){
    //         return
    //     }
    // });

})

app.get('/users/friends/add', async (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    if(Array(req.query.useremail)[0] === undefined){
        console.log("ошибка добавления друга")
        // return res.render('index', { allPosts: allPosts, auth:false })
        return res.json({ "message": "failed" })
    } else {
        console.log("добавляем друга")
        await UsersModel.updateOne({ email: req.query.touser },
                { $push: 
                    { 
                        friends: [
                            {
                                email: req.query.useremail,
                                age: Number(req.query.userage)
                            }
                        ]
                        
                    }
            })
        // res.redirect(`/?auth=true&guest=false&sender=${req.query.touser.split('@')[0]}`)
        res.json({ "message": "success" })
    }
})


app.get('/users/groups/partisipants/add', async (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    if(Array(req.query.touser)[0] === undefined){
        console.log("ошибка добавления группы")
        return res.render('index', { allPosts: allPosts, auth:false })
    } else {
        console.log("добавляем группу")
        await GroupsModel.updateOne({ name: req.query.groupname },
            { $push: 
                { 
                    partisipants: [
                        {
                            email: req.query.touser
                        }
                    ]
                    
                }
            })
        res.json({ "message": 'success' })
        // res.redirect(`/users/groups?groupname=${req.query.groupname}&groupaccess=${req.query.groupaccess}&groupdescription=${req.query.groupdescription}&imageurl=${req.query.imageurl}&touser=${req.query.touser}`)
    }
})

app.get('/users/groups/partisipants/delete', async (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    if(Array(req.query.groupname)[0] === undefined){
        console.log("ошибка удалния группы от пользоватлея")
        return res.render('index', { allPosts: allPosts, auth:false })
    } else {
        console.log("удаляем группу")

        // mongoose.connection.collection("myusersofposts").updateOne(       
        //     {  },
        //     { $pull: { 'groups': { name: req.query.groupname } } }
        // );

        mongoose.connection.collection("mygroups").updateOne(
            { name: req.query.groupname },
            { $pull: { 'partisipants': { email: req.query.touser } } }
        );

        res.json({ "message": 'success' })
        // res.redirect(`/users/groups?groupname=${req.query.groupname}&groupaccess=${req.query.groupaccess}&groupdescription=${req.query.groupdescription}&imageurl=${req.query.imageurl}&touser=${req.query.touser}`)
    }
})

// app.get(`/users/bucket`, (req, res)=>{
//     // var myProductsInBucket = []
//     // let queryOfProductsInBucket = UsersModel.findOne({'email': req.query.useremail});
//     // let queryOfProducts = ProductModel.find({}).select(['name' ,'price']);
//     // queryOfProducts.exec( (err, allProducts) => {
//     //     if (err){
//     //         return
//     //     }
//     //     queryOfProductsInBucket.exec( (err, allProductsInBucketOfThisUser) => {
//     //         if(err){
//     //             return
//     //         }
//     //         allProducts.forEach(function(product){
//     //             if(allProductsInBucketOfThisUser.productsInBucket){
//     //                 allProductsInBucketOfThisUser.productsInBucket.forEach(function(productInBucket){
//     //                     // allProducts.forEach(function(productOne){
//     //                         if(productInBucket.name == product.name){
//     //                             myProductsInBucket.push(productInBucket)
//     //                             //allProductsInBucketOfThisUser.username
//     //                             // res.send('success');
//     //                         } 
//     //                         // else {
//     //                         //     res.send('error 1');
//     //                         // }
//     //                     // })
//     //                     console.log('allProductsInBucketOfThisUser', allProductsInBucketOfThisUser)
//     //                     console.log('productInBucket', productInBucket)
//     //                     console.log('productsInBucket', productInBucket)
                        
//     //                     res.render('bucket', {auth, allProductsInBucketOfThisUser:allProductsInBucketOfThisUser.productsInBucket, user:allProductsInBucketOfThisUser})
//     //                 })
                    
//     //             } else {
//     //                 res.send('error')
//     //             }
//     //         })
//     //     })
        
//     // });

//     var myProductsInBucket = []
//     let queryOfProductsInBucket = UsersModel.findOne({'email': req.query.useremail});
//     let queryOfProducts = ProductModel.find({}).select(['name' ,'price']);
//     queryOfProducts.exec( (err, allProducts) => {
//         if (err){
//             return
//         }
//         queryOfProductsInBucket.exec( (err, allProductsInBucketOfThisUser) => {
//             if(err){
//                 return
//             }
//             allProductsInBucketOfThisUser.productsInBucket.forEach(function(productInBucket){                        
//                 myProductsInBucket.push(productInBucket)
//                 console.log(productInBucket)
//             })
//             console.log(myProductsInBucket)
//                 res.render('bucket', {auth, allProductsInBucketOfThisUser:allProductsInBucketOfThisUser.productsInBucket, user:allProductsInBucketOfThisUser, myProductsInBucket})
            
              
//         })
        
//     });
// })

const port = process.env.PORT || 8080
app.listen(port)