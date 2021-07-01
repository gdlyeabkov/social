<template>
  <div class="home">
    
        <!-- header -->
        <Header :sender="sender" :auth="'true'" />
        <div class="customflex">
          <div class="customflexbar aside">
            <p>Ваши друзья:</p>
            <div v-if="allFriends.length">
              <div v-for="friend in allFriends">
                <div class="card friendCard">
                  <!-- <router-link :to="{ name: 'Home', query: { auth: 'true', guest: 'true', sender: friend.email.split('@')[0] } }">
                    <h6 class="card-header">{{ friend.email }}</h6>
                  </router-link> -->
                  <h6 @click="visitFriend(friend.email.split('@')[0], checkGuest())" class="card-header" style="cursor: pointer;">{{ friend.email }}</h6>
                </div>
              </div>
              <router-link :to="{name:'UsersList', query:{ 'touser': sender + '@mail.ru', 'guest': $route.query.guest }}">
                Подружиться с кем-нибудь ещё
              </router-link>
            </div>
            <div v-else>
              У вас нет ещё ни одного друга
              <router-link :to="{name:'UsersList', query:{ 'touser': sender + '@mail.ru', 'guest': $route.query.guest  }}">
                Найти себе друга
              </router-link>
            </div>
            <p>
            </p> 
          </div>
          <div class="customflexbar main">
            <div style="float: left;">
              <div v-if="imageurl.includes('empty')">  
                  <img width="200px" height="200px" style="border-radius: 25%;" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" />
              </div>
              <div v-else-if="!imageurl.includes('empty')">
                  <img width="200px" height="200px" :src="imageurl" style="border-radius: 25%;" />
              </div>
            </div>
            <div style="width: calc(100% - 200px); float: left; text-align: center;">
              <h1>{{ name }}</h1>
              <router-link v-if="$route.query.guest.includes('false')" :to="{name:'UsersEdit', query:{ 'touser': sender + '@mail.ru', 'imageurl': imageurl, 'name': name, 'email': sender + '@mail.ru', 'age': age, 'password': password } }">
                Редактировать профиль
              </router-link>
              <p>{{ age }} лет</p>
              <p>Лайки: {{ likes }}</p>
              <div style="text-decoration: underline; color: blue; cursor: pointer;" v-if="$route.query.guest.includes('true')">
                <a @click="addLike()">Нравится</a>
              </div>
            </div>
            <br style="clear: both;"/>
            <!-- <label  for="inputSender" class="sr-only">Sender</label> -->
            <input type="hidden" :value="sender" id="inputSender" disabled class="sender form-control" placeholder="Sender" required="" autofocus="">
            <label for="inputContent" class="sr-only">Текст: </label>
            <textarea style="height: 155px; margin-bottom: 5px;" v-model="content" id="inputContent" class="content form-control" placeholder="Введите текст сообщения..." required="" :disabled="$route.query.guest.includes('true')"></textarea>
            <button :disabled="$route.query.guest.includes('true')" @click="addPost()" class="btn btn-lg btn-primary btn-block sendBtn">Отправить</button>
          <!-- <p>Посты:</p> -->
          <div v-if="allPosts != null && allPosts.length >= 1">
              <div v-for="post in allPosts">
                  <div class="card postStyle">
                      <h5 class="card-header">
                        <div v-if="$route.query.auth.includes('true')">
                          <router-link :to="{ name: 'Post', params: { 'postid': post._id }, }">{{ post.sender }}</router-link>
                        </div>
                      </h5>
                      <div class="card-body">
                        <h5 class="card-title">{{ post.content }}</h5>
                      </div> 
                    </div>
                </div>
              </div>
            <div v-else>
              <p>Вы или ваши друзья не опубликовали ещё не 1 пост</p>
            </div>
          </div>
          <div class="customflexbar article">
            Группы:
        <div v-if="groupswithdata != null && groupswithdata.length >= 1">
          <div v-for="group in groupswithdata">
            <div class="card groupCard">
              <router-link :to="{ name: 'Group', query:{ 'touser': sender + '@mail.ru', 'groupname': group.name, 'groupdescription': group.description, 'groupaccess': group.access, 'imageurl': group.imageurl, 'guest': $route.query.guest } }">
                <h6 class="card-header">{{ group.name }}</h6>
              </router-link>
            </div>
              <!-- <router-link :to="{name:'GroupsList', query:{ 'touser': sender + '@mail.ru', 'groupname': group.name }}">
                Перейти к списку групп
              </router-link> -->
            </div>
          </div>
          <div v-else-if="groupswithdata != null && groupswithdata.length <= 0">
            <p>Вы не создали ещё ни одну группу</p>
          </div>
          <p v-if="$route.query.guest.includes('false')">
            <router-link tag="p" style="color: blue; cursor: pointer; text-decoration: underline;" :to="{name:'GroupRegister', query:{ 'userlogin' : 'true', 'touser': this.$route.query.sender + '@mail.ru' }}">
              Добавить новую группу
            </router-link>
            <router-link tag="p" style="color: blue; cursor: pointer; text-decoration: underline;" :to="{name:'GroupsList', query:{ 'touser': sender + '@mail.ru', 'groupname': '', 'guest': $route.query.guest }}">
              Перейти к списку групп
            </router-link>
            </p>
          </div>
        </div>

        <div v-for="request in requests">
          <div style="box-sizing: border-box; padding: 10px; overflow:scroll-y; background-color: white; position: absolute; top: 0px; left: 0px; width: 175px; height: 175px;">
            <span @click="deleteFromRequests(request.name)" style="cursor: pointer; color: red;" class="material-icons">
              close
            </span>
            <img width="45%" height="45%" :src="request.image" alt="">
            <p style="font-size: 14px; color: black;">
              {{ request.name }} хочет с вами подружиться
            </p>
            <button  @click="receiveRequest(request.name, request.age)" class="btn btn-sm btn-primary btn-block sendBtn">подружиться</button>
          </div>
        </div>

    <Footer/>
  </div>
  
</template>

<script>
import UsersList from '@/views/UsersList.vue'
import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'


export default {
  name: 'Home',
  data(){
    return {
      imageurl: '',
      name: '',
      age: 0,
      likes: 0,
      guest: 'false',
      auth: 'false',
      sender: '',
      email: '',
      password: '',
      allPosts: [],
      allFriends: [],
      groupswithdata: [],
      requests: [],
      touser: '',
      content: ''
    }
  },
  mounted(){
    // if(this.$route.query.auth === 'true'){
    //   this.auth = 'true'
    //   this.sender = this.$route.query.sender
    //   console.log("делаю auth в true")
    //   if(this.$route.query.guest === 'true'){
    //     this.guest = 'true'
    //   } else if(this.$route.query.guest === 'false'){
    //     this.guest = 'false'
    //   }
    // } else if(this.$route.query.auth === 'false'){
    //   this.auth = 'false'
    //   console.log("делаю auth в false")
    // }
    // fetch(`http://localhost:4000/home?auth=${this.auth}&guest=false&sender=${this.sender}`, {
    
    // console.log('this.$route.query.auth: ', this.$route.query.auth)
    if(this.$route.query.auth === undefined || this.$route.query.auth.includes('false')){
      this.$router.push({ name: 'UsersLogin' })
    } else if(this.$route.query.auth !== undefined && this.$route.query.auth.includes('true')){
      this.sender = this.$route.query.sender
      fetch(`https://vuesocialnetwork.herokuapp.com/home?auth=true&guest=false&sender=${this.sender}`, {
        mode: 'cors',
        method: 'GET'
      }).then(response => response.body).then(rb  => {
          const reader = rb.getReader()
          return new ReadableStream({
            start(controller) {
              function push() {
                reader.read().then( ({done, value}) => {
                  if (done) {
                    console.log('done', done);
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  console.log(done, value);
                  push();
                })
              }
              push();
            }
          });
      }).then(stream => {
          return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
        })
        .then(result => {
          console.log('isAuthJson', JSON.parse(result))
          const isAuth = JSON.parse(result).auth === 'true'
          console.log('!isAuth', !isAuth)
          if(!isAuth || this.$route.query.auth === 'false'){
            console.log("!isAuth: ", !isAuth)
            console.log("this.$route.query.auth: ", this.$route.query.auth)
            this.$router.push({ name: 'UsersLogin' })
            // window.location = '/users/login'
            // window.location.reload()
          } else if(isAuth && this.$route.query.auth === 'true'){
            console.log(JSON.parse(result))
            this.name = JSON.parse(result).name
            this.sender = JSON.parse(result).sender
            this.age = JSON.parse(result).age
            this.allFriends = JSON.parse(result).allFriends
            this.allGroups = JSON.parse(result).allGroups
            this.groupswithdata = JSON.parse(result).groupswithdata
            this.likes = JSON.parse(result).likes
            this.password = JSON.parse(result).password
            this.imageurl = JSON.parse(result).imageurl
            this.allPosts = JSON.parse(result).allPosts
            this.requests = JSON.parse(result).requests
            console.log(JSON.parse(result).allPosts)
            console.log('this', this)
          }
        });
      }
  },
  methods: {
    receiveRequest(requestFriendName, requestFriendAge){
      this.deleteFromRequests(requestFriendName)
      
      fetch(`https://vuesocialnetwork.herokuapp.com/users/requests/delete?touser=${this.sender + '@mail.ru'}&sender=${requestFriendName}&userage=${requestFriendAge}`, {
      mode: 'cors',
      method: 'GET'
    }).then(response => response.body).then(rb  => {
        const reader = rb.getReader()
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then( ({done, value}) => {
                if (done) {
                  console.log('done', done);
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                console.log(done, value);
                push();
              })
            }
            push();
          }
        });
    }).then(stream => {
        return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
      })
      .then(result => {
        console.log(JSON.parse(result))
        fetch(`https://vuesocialnetwork.herokuapp.com/users/friends/add?touser=${this.sender + '@mail.ru'}&sender=${requestFriendName}&userage=${requestFriendAge}`, {
          mode: 'cors',
          method: 'GET'
        }).then(response => response.body).then(rb  => {
            const reader = rb.getReader()
            return new ReadableStream({
              start(controller) {
                function push() {
                  reader.read().then( ({done, value}) => {
                    if (done) {
                      console.log('done', done);
                      controller.close();
                      return;
                    }
                    controller.enqueue(value);
                    console.log(done, value);
                    push();
                  })
                }
                push();
              }
            });
        }).then(stream => {
            return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
          })
          .then(result => {
            console.log(JSON.parse(result))
            window.location.reload() 
          });
        
      });

    },
    deleteFromRequests(requestFriendName){
      this.requests = this.requests.filter((request) => {
        if(request.name.includes(requestFriendName)){
          return false
        }
        return true
      })
    },
    checkGuest(){
      return window.localStorage.getItem('useremail').includes(this.sender) ? 'true' : 'false'
    },
    visitFriend(friendname, isGuest){
      
      // this.$router.push(friend)
      this.$router.push({ name: 'Home', query: { "auth": 'true', "sender": friendname, "guest": isGuest } })
      // window.location.relaod()
      // location = `/?auth=true&sender=${friendname}&guest=true`
      
    //   if(this.$route.query.auth === 'true'){
    //   this.auth = 'true'
    //   this.sender = this.$route.query.sender
    //   console.log("делаю auth в true")
    //   if(this.$route.query.guest === 'true'){
    //     this.guest = 'true'
    //   } else if(this.$route.query.guest === 'false'){
    //     this.guest = 'false'
    //   }
    // } else if(this.$route.query.auth === 'false'){
    //   this.auth = 'false'
    //   console.log("делаю auth в false")
    // }
    // fetch(`http://localhost:4000/home?auth=${this.auth}&guest=true&sender=${this.sender}`, {
    //   mode: 'cors',
    //   method: 'GET'
    // }).then(response => response.body).then(rb  => {
    //     const reader = rb.getReader()
    //     return new ReadableStream({
    //       start(controller) {
    //         function push() {
    //           reader.read().then( ({done, value}) => {
    //             if (done) {
    //               console.log('done', done);
    //               controller.close();
    //               return;
    //             }
    //             controller.enqueue(value);
    //             console.log(done, value);
    //             push();
    //           })
    //         }
    //         push();
    //       }
    //     });
    // }).then(stream => {
    //     return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
    //   })
    //   .then(result => {
    //     console.log('isAuthJson', JSON.parse(result))
    //     const isAuth = JSON.parse(result).auth === 'true'
    //     console.log('!isAuth', !isAuth)
    //     if(!isAuth || this.$route.query.auth === 'false'){
    //       console.log("!isAuth: ", !isAuth)
    //       console.log("this.$route.query.auth: ", this.$route.query.auth)
    //       this.$router.push({ name: 'UsersLogin' })
    //     } else if(isAuth && this.$route.query.auth === 'true'){
    //       this.name = JSON.parse(result).name
    //       this.sender = JSON.parse(result).sender
    //       this.age = JSON.parse(result).age
    //       this.allFriends = JSON.parse(result).allFriends
    //       this.allGroups = JSON.parse(result).allGroups
    //       this.groupswithdata = JSON.parse(result).groupswithdata
    //       this.likes = JSON.parse(result).likes
    //       this.password = JSON.parse(result).password
    //       this.imageurl = JSON.parse(result).imageurl
    //       this.allPosts = JSON.parse(result).allPosts
    //     }
    //   });
      window.location.reload()
    },
    addPost(){
      fetch(`https://vuesocialnetwork.herokuapp.com/postadd?sender=${this.sender}&content=${this.content}`, {
      mode: 'cors',
      method: 'GET'
    }).then(response => response.body).then(rb  => {
        const reader = rb.getReader()
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then( ({done, value}) => {
                if (done) {
                  console.log('done', done);
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                console.log(done, value);
                push();
              })
            }
            push();
          }
        });
    }).then(stream => {
        return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
      })
      .then(result => {
        console.log(JSON.parse(result))
        // this.$router.go(this.$router.currentRoute)
        // this.$router.replace({ 'name': 'Home', 'query': { 'auth': 'true', 'sender': this.sender, 'guest': 'false' } })
        window.location.reload()
      });
    },
    addLike(){
      fetch(`https://vuesocialnetwork.herokuapp.com/users/likes?useremail=${this.sender + '@mail.ru'}`, {
      mode: 'cors',
      method: 'GET'
    }).then(response => response.body).then(rb  => {
        const reader = rb.getReader()
        return new ReadableStream({
          start(controller) {
            function push() {
              reader.read().then( ({done, value}) => {
                if (done) {
                  console.log('done', done);
                  controller.close();
                  return;
                }
                controller.enqueue(value);
                console.log(done, value);
                push();
              })
            }
            push();
          }
        });
    }).then(stream => {
        return new Response(stream, { headers: { "Content-Type": "text/html" } }).text();
      })
      .then(result => {
        console.log(JSON.parse(result))
        if(JSON.parse(result).status.includes("OK")){
          window.location.reload()
        }
      });
    },
  },
  components: {
    Header,
    Footer
  }
}
</script>

<style scoped>
  .card {
    color: black;
  }
  .customflexbar {
    
  }
  .customflex {
    display: flex;
    justify-content: space-between;
    flex-direction: row;
  }
  .postStyle {
    margin: 5px;
  }
  .main {
    width: 65%;
  }
  .friendCard, .groupCard {
    margin: 5px;
  }
</style>