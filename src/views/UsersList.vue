<template>
  <div class="home">
    <div id="app">
        <div v-if="guest.includes('false')">
          <Header :auth="'true'" :sender="touser.split('@')[0]"/>
        </div>
        <div v-else-if="guest.includes('true')">
          <Header :auth="'true'" :sender="loginedSender"/>
        </div>
        
        <p style="text-align: center;">Пользователи: </p>
        
        <div v-if="allUsers != null && allUsers.length >= 1">
          <div v-for="user in allUsers">
            <div class="card">
                    <h5  style="text-align:center; min-width: 185px;" class="card-header">  
                      <router-link :to="{ name: 'Home', query: { guest: 'true', touser: touser, auth: 'true', sender: user.email.split('@')[0] } }">{{ user.email.split('@')[0] }}</router-link>
                    </h5>
                    <div style="min-height: 110px;" class="card-body">
                      <p>Ещё не в друзьях</p>
                      <a @click="addFriend(user)" v-if="!isLoginedSender(user.name)" class="btn btn-primary">Добавить в друзья</a>
                    </div> 
            </div>
          </div>
        </div>
        <div v-else>
            <p>Недругов нет</p>    
        </div>

        <div v-if="friendsOfUser != null && friendsOfUser.length >= 1" >
            <div v-for="friend in friendsOfUser">
                <div class="card" style="text-align:center; min-width: 185px;">
                    <h5 class="card-header">
                      <router-link :to="{name: 'Home', query: { 'guest': 'true', 'auth': 'true', 'sender': friend.split('@')[0] } }">{{ friend.split('@')[0] }}</router-link>  
                    </h5>
                    <div style="min-height: 110px;" class="card-body">
                      <p>Уже в друзьях</p>
                      <div v-if="guest.includes('false')">
                        <a @click="removeFriend(friend)" class="btn btn-primary">Удалить из друзей</a>
                      </div>
                    </div> 
                  </div>
            </div>
        </div>
        <!-- <div v-else>
            <br style="clear: both;"/>    
            <p>Друзей нет</p>    
        </div> -->
        <br style="clear: both;"/>
        <!-- footer -->
        <Footer/>
    </div>
  </div>
</template>

<script>

import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

import * as jwt from 'jsonwebtoken'

export default {
  name: 'UsersList',
  data(){
    return {
      // loginedSender: window.localStorage.getItem('useremail'),
      loginedSender: '',
      touser: '',
      allUsers: [],
      friendsOfUser: [],
      auth: 'true',
      guest: 'false',
      token: window.localStorage.getItem("showbellowtoken")
    }
  },
  mounted(){
    jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
      if (err) {
        this.$router.push({ name: "UsersLogin" })
      } else {
      this.loginedSender = decoded.useremail.split('@')[0]
      this.touser = this.$route.query.touser
      this.guest = this.$route.query.guest
      fetch(`https://showbellow.herokuapp.com/users/list?touser=${this.touser}`, {
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
          this.allUsers = JSON.parse(result).allUsers
          this.friendsOfUser = JSON.parse(result).friendsOfUser
        });
      }
    })
  },
  methods: {
    removeFriend(oldFriend){
      jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
        if (err) {
          this.$router.push({ name: "UsersLogin" })
        } else {
          // href="/users/friends/delete?touser=<%= touser %>&useremail=<%= friend  %>"
          fetch(`https://showbellow.herokuapp.com/users/friends/delete?touser=${this.touser}&useremail=${oldFriend}`, {
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
            if(JSON.parse(result).message.includes('success')){
              this.$router.push({ "name": "Home", query: { "auth": 'true', "guest": 'false', sender: this.touser.split('@')[0] } })
            }
          });
        }
      })
    },
    addFriend(newFriend){
      jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
      if (err) {
        this.$router.push({ name: "UsersLogin" })
      } else {
        //   fetch(`http://localhost:4000/users/friends/add?touser=${this.touser}&useremail=${newFriend.email}&userage=${newFriend.age.toString()}`, {
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
        //     if(JSON.parse(result).message.includes('success')){
        //       this.$router.push({ "name": "Home", query: { "auth": 'true', "guest": 'true', sender: oldFriend } })
        //     }
        //   });
        
        // fetch(`http://localhost:4000/users/requests/add?touser=${newFriend.email}&name=${this.touser.split('@')[0]}&image=${newFriend.imageurl}&age=${newFriend.age}`, {
        
        // fetch(`http://localhost:4000/users/requests/add?touser=${newFriend.email}&name=${localStorage.getItem('useremail').split('@')[0]}&image=${newFriend.imageurl}&age=${newFriend.age}`, {

        fetch(`https://showbellow.herokuapp.com/users/requests/add?touser=${newFriend.email}&name=${this.loginedSender.split('@')[0]}&image=${newFriend.imageurl}&age=${newFriend.age}&mailclient=${this.touser.split('@')[1]}`, {

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
            if(JSON.parse(result).message.includes('success')){
              this.$router.push({ "name": "Home", query: { "auth": 'true', "guest": 'false', sender: this.touser.split('@')[0] } })
            }
          });
        }
      })
    },
    isLoginedSender(userName){
      return userName.toLowerCase().includes(this.loginedSender)
    }
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
    float: left;
    margin: 15px;
  }

</style>