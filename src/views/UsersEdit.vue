<template>
    <div>
      <Header :auth="'true'" :sender="touser.split('@')[0]" />
      <div class="customCardGroup">
        
        <form style="max-width: 650px; min-width: 400px; margin: auto;" class="registerForm" enctype="multipart/form-data"  method="POST" :action="`https://opalescent-nostalgic-feet.glitch.me/users/editsuccess?touser=${$route.query.touser}&imageurl=a&name=${this.name}&age=${this.age}&email=${$route.query.email}`">
        <!-- <form style="max-width: 650px; min-width: 400px; margin: auto;" class="registerForm" enctype="multipart/form-data"  method="POST" :action="`http://localhost:4000/users/editsuccess?touser=${$route.query.touser}&imageurl=a&name=${this.name}&age=${this.age}&email=${$route.query.email}`"> -->

          <input type="hidden" class="touser form-control" disabled required="" autofocus="" v-model="touser">
          
          <!-- <div v-if="imageurl && imageurl.includes('empty')">
              <img width="85px" height="85px" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" />
          </div>
          <div v-else-if="imageurl && !imageurl.includes('empty')">
              <img width="85px" height="85px" :src="imageurl" />
          </div> -->
          <img width="85px" height="85px" :src="`https://opalescent-nostalgic-feet.glitch.me/pictures/getpicture?picturename=${touser.split('@')[0]}`"  @error="$event.target.src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'"/>

          <label for="inputPhoto" class="sr-only">Фото</label>
          <input name="myFile" type="file" class="userimage form-control" autofocus="">
          <!-- <input v-model="imageurl" type="text" id="inputPhoto" class="userphoto form-control" placeholder="Photo" required="" autofocus=""> -->
          <label for="inputName" class="sr-only">Имя</label>
          <input v-model="name" type="text" id="inputName" class="username form-control" placeholder="Name" required="" autofocus="">
          <label for="inputAge" class="sr-only">Возраст</label>
          <input v-model="age" type="text" id="inputAge" class="userage form-control" placeholder="Age" required="" autofocus="">
          <label for="inputEmail" class="sr-only">Email</label>
          <input disabled v-model="email" type="email" id="inputEmail" class="useremail form-control" placeholder="Email" required="" autofocus="">
          <!-- <label for="inputPassword" class="sr-only">Password</label>
          <input disabled v-model="password" type="password" id="inputPassword" class="userpassword form-control" placeholder="Password" required="" autofocus=""> -->
          
          <!-- не работает -->
          <!-- <button style="min-width: 125px;" @click="save()" class="btn btn-lg btn-primary btn-block editBtn">Сохранить</button> -->
          <input type="submit" style="min-width: 125px; margin-top: 15px;" class="btn btn-lg btn-primary btn-block editBtn" value="Сохранить">

        </form>
      </div>
        <!-- footer -->
        <Footer/>
    </div>
</template>

<script>

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'

import * as jwt from 'jsonwebtoken'

export default {
    data(){
        return {
          email: '',
          name: '',
          age: 0,
          imageurl: '',
          // password: '',
          touser: '',
          auth: 'true',
          token: window.localStorage.getItem("showbellowtoken"),
        }
    },
    mounted(){
      this.email = this.$route.query.email
      this.name = this.$route.query.name
      this.age = this.$route.query.age
      // this.password = this.$route.query.password
      this.imageurl = this.$route.query.imageurl
      this.touser = this.$route.query.touser
    },
    methods: {
        save(){
          jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
            if (err) {
              this.$router.push({ name: "UsersLogin" })
            } else {
              localStorage.setItem("userlogin", "true")
              // fetch(`https://vuesocialnetwork.herokuapp.com/users/editsuccess?touser=${this.$route.query.touser}&imageurl=${this.imageurl}&name=${this.name}&age=${this.age}&email=${this.$route.query.email}&password=${this.password}`, {
              
              // fetch(`http://localhost:4000/users/editsuccess?touser=${this.$route.query.touser}&imageurl=${this.imageurl}&name=${this.name}&age=${this.age}&email=${this.$route.query.email}`, {
              fetch(`https://showbellow.herokuapp.com/users/editsuccess?touser=${this.$route.query.touser}&imageurl=${this.imageurl}&name=${this.name}&age=${this.age}&email=${this.$route.query.email}`, {
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
                this.$router.push({name: 'Home', query: { 'auth': 'true', 'guest': 'false', 'groupswithdata': JSON.parse(result).groupswithdata, 'sender': JSON.parse(result).sender, 'allPosts': JSON.parse(result).allPosts, 'allFriends': JSON.parse(result).allFriends, 'likes': JSON.parse(result).likes, 'allGroups': JSON.parse(result).allGroups }})
            });
          }
        })
      }
    },
    components: {
      Header,
      Footer
    }
}
</script>

<style>
  .customCardGroup {
    margin:auto;
    display:flex;
    justify-content: center;
    width:75%;
    flex-direction: column; 
    text-align: center;
  }
  .customCardGroup img {
    display: block;
    margin:auto;
  }
  .editBtn {
    width: 25%;
    margin: auto;
  }
  .customCardGroup > input {
    width: 40%;
    margin: 10px auto;
  }
</style>