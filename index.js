const bcrypt = require('bcrypt');
const saltRounds = 10;

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
    posts: [mongoose.Schema.Types.Map],
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
    requests: [mongoose.Schema.Types.Map],
    groups: [mongoose.Schema.Types.Map]
}, { collection : 'myusersofposts' });

const UsersModel = mongoose.model('UsersModel', UsersSchema, 'myusersofposts');

app.set('view engine', 'ejs')

app.get('/home', async (req, res)=>{

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
                return res.json({ "status": 'error'})
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
                        // return res.render('index', { allPosts: null, guest: 'false', auth: 'false', allFriends: null})
                        return res.json({ "status": 'error'})
                    }

                    let nickOfUser = req.query.sender
                    let queryOfFriends =  UsersModel.findOne({'email': req.query.sender + "@mail.ru"}, function(err, user){
                        if (err){
                            return res.json({ "status": 'error'})
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
                                    // console.log('error Group')
                                    return res.json({ "status": 'error'})
                                }
                                console.log('group success')
                                groups.forEach((g) => {
                                    groupsWithData.push(g)
                                })
                                console.log('groups', groups)
                                console.log('groupsWithData', groupsWithData)
                                if(req.query.guest.includes('true')){
                                    // res.render('index', { allPosts: allPosts, auth:true, guest: true, touser:req.query.touser, sender: nickOfUser, allFriends: user.friends, likes: user.likes, allGroups: user.groups, imageurl: user.imageurl, name: user.name, age: user.age, password: user.password, groupswithdata: groupsWithData })
                                    return res.json({ "allPosts": allPosts, "auth": 'true', "guest": 'true', "touser":req.query.touser, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "imageurl": user.imageurl, "name": user.name, "age": user.age, "password": user.password, "groupswithdata": groupsWithData })
                                } else if(req.query.guest.includes('false')){
                                    //res.render('index', { allPosts: allPosts, auth:true, guest: false, sender: nickOfUser, allFriends: user.friends, likes: user.likes, allGroups: user.groups, imageurl: user.imageurl, name: user.name, age: user.age, password: user.password, groupswithdata: groupsWithData })
                                    return res.json({ "allPosts": allPosts, "auth": 'true', "guest": 'false', "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "imageurl": user.imageurl, "name": user.name, "age": user.age, "password": user.password, "groupswithdata": groupsWithData, "requests": user.requests })
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
        // return res.json({ "status": 'error'})
    }
})

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
    });  
})

app.get('/users/edit',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    // res.json({ 'auth':'true', 'touser': req.query.touser, 'imageurl': req.query.imageurl, 'name': req.query.name, 'age': req.query.age, 'email': req.query.email, 'password': req.query.password  })
    res.json({ 'auth':'true', 'touser': req.query.touser, 'imageurl': req.query.imageurl, 'name': req.query.name, 'age': req.query.age, 'email': req.query.email  })

})

app.get('/users/editsuccess', async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    // let encodedPassword = "#"
    // encodedPassword = bcrypt.hashSync(req.query.password, saltRounds)

    // await UsersModel.updateOne({ email: req.query.touser },
    //     {
    //         imageurl: req.query.imageurl,
    //         name: req.query.name,
    //         age: req.query.age,
    //         email: req.query.email,
    //         password: encodedPassword,
    //     }, (err) => {
    //         if(err){
    //             return
    //         } else {
    //             let queryOfFriends =  UsersModel.findOne({'email': req.query.email}, function(err, user){
    //                 if (err){
    //                     return
    //                 } else {
    //                     const userGroupsArray = []
    //                     user.groups.map((groupKey, groupValue) => {
    //                         userGroupsArray.push(new Map(groupKey).get('name'))
    //                     })
    //                     console.log('userGroupsArray', userGroupsArray)
    //                     const groupsWithData = []
    //                     const queryOfGroupsWithData = GroupsModel.find({ name: { $in: userGroupsArray } }).select(['name', 'description', 'access', 'imageurl', 'partisipants' ])
    //                     queryOfGroupsWithData.exec( async (error, groups) => {
    //                         if(error){
    //                             return
    //                         }
    //                         groups.forEach((g) => {
    //                             groupsWithData.push(g)
    //                         })
    //                         nickOfUser = req.query.email.split('@')[0]
    //                         const allPosts = []

    //                         await PostModel.updateMany({ sender: req.query.touser.split('@')[0] },
    //                             {
    //                                 sender: nickOfUser
    //                             }, (err) => {
    //                                 if(err){
    //                                     console.log("error PostModel")
    //                                     return
    //                                 } else {
    //                                     console.log("success PostModel")
    //                                 }
    //                             }
    //                         )

    //                         let query = PostModel.find({ sender: { $eq: req.query.email.split('@')[0] } })
    //                         query.exec((err, allPosts) => {
    //                             console.log('req.query', req.query)
    //                             console.log('обновил')
    //                             res.json({ "allPosts": allPosts, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "groupswithdata": groupsWithData })
    //                         })
    //                     })
                
    //                 }
    //             }
    //         )
    //     }
    // })

    await UsersModel.updateOne({ email: req.query.touser },
        {
            imageurl: req.query.imageurl,
            name: req.query.name,
            age: req.query.age,
            email: req.query.email
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

                            let query = PostModel.find({ sender: { $eq: req.query.email.split('@')[0] } })
                            query.exec((err, allPosts) => {
                                console.log('req.query', req.query)
                                console.log('обновил')
                                res.json({ "allPosts": allPosts, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "groupswithdata": groupsWithData })
                            })
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
        }
    })
})

app.get('/users/groups', async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let query = GroupsModel.findOne({ name: req.query.groupname });
    query.exec((err, group) => {
        if (err){
            return res.json({ "auth": 'false' })
        }
        return res.json({ "auth": 'true', "name": req.query.groupname, "access": req.query.groupaccess, "description": req.query.groupdescription, "partisipants": group.partisipants, "imageurl": req.query.imageurl, "touser": req.query.touser, "posts": group.posts })
    })
})

app.get('/users/groups/register',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    res.json({ "userlogin": true, "touser": req.query.touser  })

})

app.get('/users/groups/groupcreatesuccess', (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    let query = GroupsModel.find({}).select(['name', 'partisipants']);
    query.exec((err, allGroups) => {
        if (err){
            return res.json({ "message": "error" })
        }
        var groupExists = false;
        if(groupExists){
            // console.log('in', req.query.groupname in allGroups)
            // console.log('rollback')
            // return res.send('rollback')
            return res.json({ "message": "error" })
        } else {
            console.log('создание', req.query.groupname in allGroups)
            auth = true
            const group = new GroupsModel({ name: req.query.groupname, description:req.query.groupdescription, access: req.query.groupaccess, imageurl: req.query.imageurl });
            group.save(function (err) {
                if(err){
                    console.log('создание ошибка')
                    console.log(err)
                    return res.json({ "message": "error" })
                } else {
                    UsersModel.updateOne({ email: req.query.touser },
                        { $push: 
                            {
                                groups: [
                                    {
                                        name: req.query.groupname
                                    }
                                ]
                                
                            }
                    }, (err) => {
                        if(err){
                            return res.json({ "message": "error" })
                        } else {
                            GroupsModel.updateOne({ name: req.query.groupname },
                                { $push: 
                                    { 
                                        partisipants: [
                                            {
                                                email: req.query.touser
                                            }
                                        ]
                                        
                                    }
                            })
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
})

app.get('/users/friends/delete', async (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    console.log(mongoose.connection.collection("myusersofposts"))
    
    mongoose.connection.collection("myusersofposts").updateOne(
        { email: req.query.touser },
        { $pull: { 'friends': { email: req.query.useremail } } },
        (err, user) => {
            mongoose.connection.collection("myusersofposts").updateOne(
                { email: req.query.useremail },
                { $pull: { 'friends': { email: req.query.touser } } },
                (err, user) => {
                    return res.json({ "message": "success" })
                }
            )
        }
    )
    
})

app.get('/users/likes', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let query = UsersModel.findOne({'email': req.query.useremail }, function(err, user){
        if (err || Array(req.query.useremail)[0] === undefined){
            return
        } else {
            if(user != null && user != undefined){
                UsersModel.updateOne({ email: req.query.useremail }, 
                { 
                    "$inc": { "likes": 1 }
                }, (err, user) => {
                    if(err){
                        return res.json({ "status": "Error" })        
                    }
                    return res.json({ "status": "OK" })
                })
                // res.redirect(`/?auth=true&guest=false&sender=${req.query.useremail.split('@')[0]}`)
            } else {
                return res.json({ "status": "Error" })
            }
        }
    })
    

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
            res.json({ "friendsOfUser": friendsOfUser, "allUsers": allUsers, "auth": 'true', "touser": req.query.touser })
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
                                    
                                    res.json({ "touser": req.query.sender, "allGroups": allGroups, "allGroupsWithPartisipants": allGroupsWithPartisipants, "allGroupsWithoutPartisipants": allGroupsWithoutPartisipants, "hasGroups": hasGroups, "notHasGroups": notHasGroups, "auth": 'true' })
                                })
                                
                            })
                    })
                })
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
            const passwordCheck = bcrypt.compareSync(req.query.userpassword, user.password) && req.query.userpassword !== ''
            if(user != null && user != undefined && passwordCheck){
                auth = true
                return res.json({ "auth": "true", "sender": user.email.split('@')[0] })
            } else {
                return res.json({ "auth": "false" })
            }
            console.log(user)
        }
    })
})

app.get('/users/usercreatesuccess',async (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let query = UsersModel.find({}).select(['email']);
    query.exec((err, allUsers) => {
        if (err){
            return res.json({ "status": "Error" })
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
            // return res.send('rollback')
            return res.json({ "status": "Error" })
        } else {
            console.log('создание',req.query.useremail in allUsers)
            
            let encodedPassword = "#"
            const salt = bcrypt.genSalt(saltRounds)
            encodedPassword = bcrypt.hashSync(req.query.userpassword, saltRounds)

            const user = new UsersModel({ email: req.query.useremail, password: encodedPassword, name: req.query.username, age: Number(req.query.userage) });
            user.save(function (err) {
                if(err){
                    console.log('создание ошибка')
                    console.log(err)
                    return res.json({ "status": "Error" })
                } else {
                    res.json({ "status": "OK", "username": user.email.split('@')[0] })
                    // res.redirect(`/?auth=true&guest=true&sender=${req.query.useremail.split('@')[0]}`)
                }
            })
        }
    });
})

app.get('/users/friends/add', async (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    if(Array(req.query.useremail)[0] === undefined){
        console.log("ошибка добавления друга")
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
        res.json({ "message": "success" })
    }
})


app.get('/users/groups/partisipants/add', (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    if(Array(req.query.touser)[0] === undefined){
        console.log("ошибка добавления группы")
        return res.json({ "message": 'error' })
        // return res.render('index', { allPosts: allPosts, auth:false })
    } else {
        console.log("добавляем группу")
        GroupsModel.updateOne({ name: req.query.groupname },
            { $push: 
                { 
                    partisipants: [
                        {
                            email: req.query.touser
                        }
                    ]
                    
                }
            }, (err, group) => {
                if(err){
                    return res.json({ "message": 'error' })
                }
                UsersModel.updateOne({ email: req.query.touser },
                    { $push: 
                        { 
                            groups: [
                                {
                                    name: req.query.groupname
                                }
                            ]
                            
                        }
                    }, (err, user) => {
                        if(err){
                            return res.json({ "message": 'error' })
                        }
                        return res.json({ "message": 'success' })
                    })
            })
    }
})

app.get('/users/groups/partisipants/delete', async (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    if(Array(req.query.groupname)[0] === undefined){
        console.log("ошибка удалния группы от пользоватлея")
        return res.json({ "message": 'error' })
        // return res.render('index', { allPosts: allPosts, auth:false })
    } else {
        console.log("удаляем группу")


        mongoose.connection.collection("mygroups").updateOne(
            { name: req.query.groupname },
            { $pull: { 'partisipants': { email: req.query.touser } } },
            (err, group) => {
                if(err){
                    return res.json({ "message": 'error' })
                }
                mongoose.connection.collection("myusersofposts").updateOne(
                    { email: req.query.touser },
                    { $pull: { 'groups': { name: req.query.groupname } } },
                )
            }
        );

        res.json({ "message": 'success' })
    }
})

app.get('/users/groups/posts/add', (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    console.log('отправляю пост')
    console.log('req.query: ', req.query)

    GroupsModel.updateOne({ name: req.query.groupname },
        { $push: 
            {
                posts: [
                    {
                        name: req.query.name,
                        content: req.query.content,
                    }
                ]
                
            }
        }, (err, group) => {
            if(err){
                return res.json({ "status": "error" })
            }
            return res.json({ "status": "success" })
        }
    )
})

app.get('/users/requests/add', (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    UsersModel.findOne({ email: req.query.name + '@mail.ru' }, (err, user) => {
    
        UsersModel.updateOne({ email: req.query.touser },
            { $push: 
                {
                    requests: [
                        {
                            name: req.query.name,
                            image: user.imageurl,
                            age: user.age,
                        }
                    ]
                    
                }
            }, (err, request) => {
                if(err) {
                    return res.json({ "message": "error" })
                }
                return res.json({ "message": "success" })
            }
        )
    })
})

app.get('/users/requests/delete', (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    let emailOfOtherUser = req.query.sender.concat('@mail.ru')
    console.log('req.query: ', req.query)
    console.log('emailOfOtherUser: ', emailOfOtherUser)

    mongoose.connection.collection("myusersofposts").updateOne(
        { email: req.query.touser },
        { $pull: { 'requests': { name: req.query.sender } } }, (err, user) => {
            UsersModel.updateOne({ email: req.query.touser },
            { $push: 
                { 
                    friends: [
                        {
                            email: req.query.sender + '@mail.ru',
                            age: Number(req.query.userage)
                        }
                    ]
                    
                }
        }, (err, user) => {
            if(err){
                return res.json({ "message": "Error" })
            }
            
        })

        UsersModel.findOne({ email: req.query.touser }, (err, user) => {
            UsersModel.updateOne({ email: emailOfOtherUser },
                { $push: 
                    { 
                        friends: [
                            {
                                email: req.query.touser,
                                age: Number(user.age)
                            }
                        ]
                    }
                }, (err, user => {
                    if(err){
                        return res.json({ "message": "Error" })
                    }
                    return res.json({ "message": "Success" })
                })
            )
        })

    })
})


const port = process.env.PORT || 8080
// const port = 4000
app.listen(port)