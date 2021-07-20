const fs = require('fs')
const multer  = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
        // cb(null, req.query.picturename)
    }
})
const upload = multer({ storage: storage })

const storageForGroups = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/groups')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
        // cb(null, req.query.picturename)
    }
})
const uploadForGroups = multer({ storage: storageForGroups })

const storageForUsers = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/users')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
        // cb(null, req.query.picturename)
    }
})
const uploadForUsers = multer({ storage: storageForUsers })

const storageForPosts = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/posts')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
        // cb(null, req.query.picturename)
    }
})
const uploadForPosts = multer({ storage: storageForPosts })


const bcrypt = require('bcrypt');
const saltRounds = 10;

const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const { isError } = require('util')
const serveStatic = require('serve-static')

const app = express()

app.use('/', serveStatic(path.join(__dirname, '/dist')))

const url = `mongodb+srv://glebClusterUser:glebClusterUserPassword@cluster0.fvfru.mongodb.net/posts?retryWrites=true&w=majority`;

var options = {
    root: path.join(__dirname, 'views'),
}   

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
        type: Date,
        default: Date.now
    //     default: new Date().toLocaleString(),
    //     type: String
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
    liked: [mongoose.Schema.Types.Map],
    friends: [mongoose.Schema.Types.Map],
    requests: [mongoose.Schema.Types.Map],
    groups: [mongoose.Schema.Types.Map]
}, { collection : 'myusersofposts' });

const UsersModel = mongoose.model('UsersModel', UsersSchema, 'myusersofposts');

app.get('/home', async (req, res)=>{

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    console.log("req.query.sender + req.query.mailclient: ", req.query.sender + req.query.mailclient)

    // let queryOfFriendsBefore =  UsersModel.findOne({'email': req.query.sender + "@mail.ru"}, function(err, beforeUser){
    let queryOfFriendsBefore =  UsersModel.findOne({'email': req.query.sender + req.query.mailclient }, function(err, beforeUser){
    // let queryOfFriendsBefore =  UsersModel.findOne({ 'email': req.query.decodedcustomtokenvalue }, function(err, beforeUser){

        if(err){
            return res.json({ "status": 'error'})
        } else {
            const friendsPosts = []
            beforeUser.friends.map((friendKey, friendValue) => {
                friendsPosts.push(new Map(friendKey).get('email').split('@')[0])
            })
            
            // let query = PostModel.find({ $or:[ {  sender: { $eq: req.query.sender } }, { sender: { $in: friendsPosts }  } ] }, null, { sort: { created: -1 } }).select(['content', 'sender', 'created']);
            let query = PostModel.find({ $or:[ {  sender: { $eq: req.query.sender } }, { sender: { $in: friendsPosts }  } ] }, ['content', 'sender', 'created'], { sort: { created: -1 } });
            query.exec((err, allPosts) => {
                if (err){
                    return res.json({ "status": 'error'})
                }
                if(Array(req.query.auth)[0] === undefined){
                    return res.json({ "status": 'error'})
                }
                let nickOfUser = req.query.sender
                
                // let queryOfFriends =  UsersModel.findOne({ 'email': req.query.decodedcustomtokenvalue }, function(err, user){
                // let queryOfFriends =  UsersModel.findOne({'email': req.query.sender + "@mail.ru"}, function(err, user){
                let queryOfFriends =  UsersModel.findOne({'email': req.query.sender + req.query.mailclient}, function(err, user){
                    
                    if (err){
                        return res.json({ "status": 'error'})
                    } else {
                        
                        let userGroupsArray = []
                        user.groups.map((groupKey, groupValue) => {
                            userGroupsArray.push(new Map(groupKey).get('id'))
                        })
                        let groupsWithData = []
                        
                        let queryOfGroupsWithData = GroupsModel.find({ _id: { $in: userGroupsArray } }).select(['name', 'description', 'access', 'imageurl', 'partisipants' ])
                        
                        queryOfGroupsWithData.exec((error, groups) => {
                            if(error){
                                return res.json({ "status": 'error'})
                            }
                            groups.forEach((g) => {
                                groupsWithData.push(g)
                            })
                            if(req.query.guest.includes('true')){
                                return res.json({ "allPosts": allPosts, "auth": 'true', "guest": 'true', "touser":req.query.touser, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "imageurl": user.imageurl, "name": user.name, "age": user.age, "password": user.password, "groupswithdata": groupsWithData, "liked": user.liked, "mailclient": req.query.mailclient })
                            } else if(req.query.guest.includes('false')){
                                return res.json({ "allPosts": allPosts, "auth": 'true', "guest": 'false', "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "imageurl": user.imageurl, "name": user.name, "age": user.age, "password": user.password, "groupswithdata": groupsWithData, "requests": user.requests, "liked": user.liked, "mailclient": req.query.mailclient })
                            }  
                        })                            
                    }
                })
            })
        }
    })
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
        res.json({ post })
    });  
})

app.get('/users/edit',(req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    res.json({ 'auth':'true', 'touser': req.query.touser, 'imageurl': req.query.imageurl, 'name': req.query.name, 'age': req.query.age, 'email': req.query.email  })

})

app.post('/users/editsuccess', upload.single('myFile'), async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

    console.log("req.body: ", req.body)
    let file = req.file

    if(!file){
        console.log("Error to upload file ")
        return res.json({ "message": "error" })
    }
    fs.rename(req.file.path, path.join(__dirname, '/uploads') + "/" + req.query.email.split('@')[0] + ".png", function (err) {
        if (err) {
            return res.json({ "message": "Error" })
        }
    })


    await UsersModel.updateOne({ email: req.query.touser },
        {
            imageurl: req.query.imageurl,
            name: req.query.name,
            age: req.query.age,
            email: req.query.email
        }, (err) => {
            if(err){
                return res.json({ "message": "Error" })
            } else {
                let queryOfFriends =  UsersModel.findOne({'email': req.query.email}, function(err, user){
                    if (err){
                        return res.json({ "message": "Error" })
                    } else {
                        const userGroupsArray = []
                        user.groups.map((groupKey, groupValue) => {
                            userGroupsArray.push(new Map(groupKey).get('name'))
                        })
                        const groupsWithData = []
                        const queryOfGroupsWithData = GroupsModel.find({ name: { $in: userGroupsArray } }).select(['name', 'description', 'access', 'imageurl', 'partisipants' ])
                        queryOfGroupsWithData.exec( async (error, groups) => {
                            if(error){
                                return res.json({ "message": "Error" })
                            }
                            groups.forEach((g) => {
                                groupsWithData.push(g)
                            })
                            let nickOfUser = req.query.email.split('@')[0]
                            const allPosts = []

                            await PostModel.updateMany({ sender: req.query.touser.split('@')[0] },
                                {
                                    sender: nickOfUser
                                }, (err) => {
                                    if(err){
                                        return res.json({ "message": "Error" })
                                     }
                                }
                            )

                            let query = PostModel.find({ sender: { $eq: req.query.email.split('@')[0] } })
                            query.exec((err, allPosts) => {
                                // res.json({ "allPosts": allPosts, "sender": nickOfUser, "allFriends": user.friends, "likes": user.likes, "allGroups": user.groups, "groupswithdata": groupsWithData })
                                // return res.redirect("https://showbellow.herokuapp.com/")
                                return res.redirect("https://showbellow.herokuapp.com/users/login")

                            })
                        })
                
                    }
                }
            )
        }
    })

})

app.post('/users/groups/editsuccess', upload.single('myFile'), async (req, res)=>{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    console.log("req.body: ", req.body)
    let file = req.file

    if(!file){
        console.log("Error to upload file ")
        return res.json({ "message": "error" })
    }
    fs.rename(req.file.path, path.join(__dirname, '/uploads') + "/" + req.query.groupname + ".png", function (err) {
        if (err) {
            return res.json({ "message": "Error" })
        }
    })


    await GroupsModel.updateOne({ name: req.query.previousgroupname },
        {
            imageurl: req.query.imageurl,
            name: req.query.groupname,
            description: req.query.groupdescription,
            access: req.query.groupaccess
        }, (err) => {
            if(err){
                return res.json({ message: 'failed' })
            } else {
                // return res.json({ message: 'success' })
                // return res.redirect("https://showbellow.herokuapp.com/")
                return res.redirect("https://showbellow.herokuapp.com/users/login")

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
            return
        } else {
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

app.post('/users/groups/groupcreatesuccess', upload.single('myFile'), (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
   
    console.log("req.body: ", req.body)
    let file = req.file

    if(!file){
        console.log("Error to upload file ")
        return res.json({ "message": "error" })
    }
    fs.rename(req.file.path, path.join(__dirname, '/uploads') + "/" + req.query.touser.split('@')[0] + ".png", function (err) {
        if (err) {
            return res.json({ "message": "error" })
        }
    })

    let query = GroupsModel.find({}).select(['name', 'partisipants']);
    query.exec((err, allGroups) => {
        if (err){
            return res.json({ "message": "error" })
        }
        var groupExists = false;
        if(groupExists){
            return res.json({ "message": "error" })
        } else {
            // const group = new GroupsModel({ name: req.query.groupname, description:req.query.groupdescription, access: req.query.groupaccess, imageurl: req.query.imageurl });
            const group = new GroupsModel({ name: req.body.groupname, description: req.body.groupdescription, access: req.body.groupaccess });

            group.save(function (err, group) {
                if(err){
                    return res.json({ "message": "error" })
                } else {
                    UsersModel.updateOne({ email: req.query.touser },
                        { $push: 
                            {
                                groups: [
                                    {
                                        id: group._id.toString(),
                                        name: req.query.groupname
                                    }
                                ]
                                
                            }
                    }, (err, user) => {
                        if(err){
                            return res.json({ "message": "error" })
                        } else {
                            GroupsModel.updateOne({ name: req.query.groupname },
                                { $push: 
                                    { 
                                        partisipants: [
                                            {
                                                id: user._id,
                                                email: req.query.touser
                                            }
                                        ]
                                        
                                    }
                            }, (err, group) => {
                                if(err) {
                                    return res.json({ "message": "error" })
                                }
                                // return res.json({ "message": "success" })
                                // return res.redirect("https://showbellow.herokuapp.com/")
                                return res.redirect("https://showbellow.herokuapp.com/users/login")

                            })
                        } 
                    })
                }
            })
            
        }
    })
})

app.get('/users/friends/delete', async (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
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
                
                    "$inc": { "likes": 1 },
                    "$push": { 
                        liked: [
                            {
                                name: req.query.touser.split('@')[0],
                            }
                        ]
                            
                    }

                }, (err, user) => {
                    if(err){
                        return res.json({ "status": "Error" })        
                    }
                    return res.json({ "status": "OK" })
                })
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
            friendsOfUser.push(new Map(friendKey).get('email'))
        })
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
            const groupsOfUser = []
            allGroupsOfUser.map((groupKey, groupValue) => {
                    groupKey.groups.map((groupKeyInner, groupValueInner) => {
                        groupsOfUser.push(new Map(groupKeyInner).get('name'))
                    })
                })
                
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
                        
                        const allGroupsWithPartisipants = []
                        allGroups.map((groupKey, groupValue) => {
                            groupKey.partisipants.map((groupPartisipantKey, groupPartisipantValue) => {
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
    
    let queryBefore = UsersModel.find({ email: { $in: req.query.useremail }  })
    queryBefore.exec((err, allUsers) => {
        if(err){
            return res.json({ "auth": "false" })
        }
        if(allUsers.length >= 1){
            let query =  UsersModel.findOne({'email': req.query.useremail}, function(err, user){
                if (err){
                    return res.json({ "auth": "false" })
                } else {
                    const passwordCheck = bcrypt.compareSync(req.query.userpassword, user.password) && req.query.userpassword !== ''
                    if(user != null && user != undefined && passwordCheck){
                        return res.json({ "auth": "true", "sender": user.email.split('@')[0] })
                    } else {
                        return res.json({ "auth": "false" })
                    }
                }
            })    
        } else if(allUsers.length <= 0){
            return res.json({ "auth": "false" })
        }
    })
})

app.post('/users/usercreatesuccess', upload.single('myFile'), async (req, res)=>{
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    console.log("req.body: ", req.body)
    console.log("req.body: ", req.body)
    
    let file = req.file

    if(!file){
        console.log("Error to upload file ")
        return res.json({ "message": "error" })
    }
    fs.rename(req.file.path, path.join(__dirname, '/uploads') + "/" + req.query.useremail.split('@')[0] + ".png", function (err) {
        if (err) {
            return res.json({ "status": "Error" })
        }
    })


    let query = UsersModel.find({}).select(['email']);
    query.exec((err, allUsers) => {
        if (err){
            return res.json({ "status": "Error" })
        }
        
        var userExists = false;

        allUsers.forEach(user => {
            if(user.email.includes(req.query.useremail)){
            // if(user.email.includes(req.body.useremail)){
                userExists = true
            }
        });
        if(userExists){
            return res.json({ "status": "Error" })
        } else {
            let encodedPassword = "#"
            const salt = bcrypt.genSalt(saltRounds)
            encodedPassword = bcrypt.hashSync(req.query.userpassword, saltRounds)
            // encodedPassword = bcrypt.hashSync(req.body.userpassword, saltRounds)

            const user = new UsersModel({ email: req.query.useremail, password: encodedPassword, name: req.query.username, age: Number(req.query.userage) });
            // const user = new UsersModel({ email: req.body.useremail, password: encodedPassword, name: req.body.username, age: Number(req.body.userage) });

            user.save(function (err) {
                if(err){
                    return res.json({ "status": "Error" })
                } else {
                    return res.redirect("https://showbellow.herokuapp.com/users/login")
                    // res.json({ "status": "OK", "username": user.email.split('@')[0] })
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
        return res.json({ "message": "failed" })
    } else {
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
        return res.json({ "message": 'error' })
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
        return res.json({ "message": 'error' })
    } else {
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
    
    GroupsModel.updateOne({ name: req.query.groupname },
        { 
            $push: {
                posts: {
                    name: req.query.name,
                    content: req.query.content,
                    // created: Date.now
                    created: new Date().toLocaleString(),
                }
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

    // UsersModel.findOne({ email: req.query.name + '@mail.ru' }, (err, user) => {
    UsersModel.findOne({ email: req.query.name + req.query.mailclient }, (err, user) => {

    
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
    
    let emailOfOtherUser = req.query.sender.concat(req.query.mailclient)
    mongoose.connection.collection("myusersofposts").updateOne(
        { email: req.query.touser },
        { $pull: { 'requests': { name: req.query.sender } } }, (err, user) => {
            if(req.query.acceptrequest.includes("true")){
                UsersModel.updateOne({ email: req.query.touser },
                { $push: 
                    { 
                        friends: [
                            {
                                // email: req.query.sender + '@mail.ru',
                                email: req.query.sender + req.query.mailclient,
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
        } else if(req.query.acceptrequest.includes("false")){
            return res.json({ "message": "Success" })
        }
        
    })
})

app.get('/pictures/getpicture', (req, res)=>{
        
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    res.sendFile(__dirname + `/uploads/${req.query.picturename}.png`)

})


app.get('**', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, X-Access-Token, X-Socket-ID, Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    
    // return res.redirect(`/?redirectroute=${req.path}`)
    return res.redirect(`https://showbellow.herokuapp.com/?redirectroute=${req.path}`)
})

// const port = process.env.PORT || 8080
const port = 4000
app.listen(port)