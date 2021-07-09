<template>
   <div>
      <Header :auth="'true'" :sender="touser.split('@')[0]"/>
        <div class="customflex">
          <div class="aside">
          </div>
          <div class="main">
            <div v-if="imageurl.includes('empty')">
              <img style="border-radius: 25%; float: left;" width="200px" height="200px" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" />
            </div>
              <!-- <div style="float: left;">
                <router-link v-if="isPartisipant" style="display: block;" :to="{ name:'GroupEdit', query: {'groupname': name, 'groupdescription': description, 'groupaccess': access, 'imageurl': imageurl, 'touser': touser } }">Редактировать группу</router-link>
                <div v-if="access.includes('public')">
                  <a v-if="!isPartisipant" style="color: blue; cursor: pointer; text-decoration: underline;;" @click="enterToGroup()">Вступить в группу</a>
                </div>
                <div v-else-if="access.includes('private')">
                  <p>Эта группа приватная</p>
                </div>
                <a v-if="isPartisipant" style="color: blue; cursor: pointer; text-decoration: underline;" @click="leaveFromGroup()">Выйти из группы</a>
              </div>
              <br style="clear: both;"/> -->
            
            <div if="!imageurl.includes('empty')">
              <img style="margin: 5px 0px; border-radius: 10%; float: left;" width="200px" height="200px" :src="imageurl" />
            </div>
              <div style="float: left; width: calc(100% - 200px); text-align: center;">
                <router-link v-if="isPartisipant" style="display: block;" :to="{ name:'GroupEdit', query: {'groupname': name, 'groupdescription': description, 'groupaccess': access, 'imageurl': imageurl, 'touser': touser } }">Редактировать группу</router-link>
                <div v-if="access.includes('public')">
                  <a v-if="!isPartisipant" style="color: blue; cursor: pointer; text-decoration: underline;;" @click="enterToGroup()">Вступить в группу</a>
                </div>
                <div v-else-if="access.includes('private')">
                  <p>Эта группа приватная</p>
                </div>
                <a v-if="isPartisipant" style="color: blue; cursor: pointer; text-decoration: underline;" @click="leaveFromGroup()">Выйти из группы</a>
                <h1>{{ name }}</h1>
                <p>Описание группы: {{ description }}</p>
                <p>Количество участников: {{ partisipants.length }}</p>
              </div>
              <br style="clear: both;"/>

            <!-- <div v-if="isPartisipant">
              <textarea style="height: 155px; margin-bottom: 5px;" v-model="groupPostContent" id="inputContent" class="content form-control" placeholder="Введите текст сообщения..." required=""></textarea>
              <button @click="submitPost()" class="btn btn-lg btn-primary btn-block sendBtn">Отправить</button>
            </div> -->
            
            <textarea :disabled="!isPartisipant" style="height: 155px; margin-bottom: 5px;" v-model="groupPostContent" id="inputContent" class="content form-control" placeholder="Введите текст сообщения..." required=""></textarea>
            <button :disabled="!isPartisipant" @click="submitPost()" class="btn btn-lg btn-primary btn-block sendBtn">Отправить</button>
          

          <div v-if="posts != null && posts.length >= 1 && ((access.includes('public') && !isPartisipant) || (access.includes('public') || access.includes('private') && isPartisipant))">
            <div v-for="post in posts">
              <div class="card postStyle">
                <h5 class="card-header">
                  <span style="color: black;">{{ post.name }}</span>
                  <span style="font-size: 14px; color:black; float: right;">Опубликовано: {{ new Date(post.created).getDay() + "." + new Date(post.created).getMonth() + "." + new Date(post.created).getFullYear() + " в " + new Date(post.created).getHours() + ":" + new Date(post.created).getMinutes() }}</span>
                </h5>
                <div class="card-body">
                  <h5 style="color: black;" class="card-title">{{ post.content }}</h5>
                </div> 
              </div>
            </div>
          </div>
          <div v-else>
            <p>В группе ещё не опубликовали не 1 пост</p>
          </div>
        </div>
        <div class="article">
        </div>
      </div>
    <Footer/>
  </div>
</template>
<script>

import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

import * as jwt from 'jsonwebtoken'

export default {
    data(){
        return {
            partisipants: [],
            imageurl: '',
            name: '',
            description: '',
            access: '',
            touser: '',
            auth: 'true',
            isPartisipant: false,
            posts: [],
            groupPostContent: '',
            token: window.localStorage.getItem("vuesocialnetworktoken")
        }
    },
    mounted(){
      jwt.verify(this.token, 'vuesocialnetworksecret', (err, decoded) => {
      if (err) {
        this.$router.push({ name: "UsersLogin" })
      } else {
          fetch(`http://localhost:4000/users/groups?groupname=${this.$route.query.groupname}&groupdescription=${this.$route.query.groupdescription}&groupaccess=${this.$route.query.groupaccess}&imageurl=${this.$route.query.imageurl}&touser=${this.$route.query.touser}`, {
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
            this.name = JSON.parse(result).name
            this.description = JSON.parse(result).description
            this.access = JSON.parse(result).access
            this.partisipants = JSON.parse(result).partisipants
            this.touser = JSON.parse(result).touser
            this.imageurl = JSON.parse(result).imageurl
            this.posts = JSON.parse(result).posts
            
            console.log('Object.values(this.partisipants): ', Object.values(this.partisipants))
            let possiblePartisipants = []
            Object.values(this.partisipants).forEach((partisipant) => {
              possiblePartisipants.push(partisipant.email)
            })
            this.isPartisipant = possiblePartisipants.includes(this.$route.query.touser)
            console.log('this.isPartisipant: ', this.isPartisipant)

            console.log('json: ', JSON.parse(result))

          });
        }
      })
    },
    methods: {
      submitPost(){
        jwt.verify(this.token, 'vuesocialnetworksecret', (err, decoded) => {
          if (err) {
            this.$router.push({ name: "UsersLogin" })
          } else {
            console.log("отпраляю пост")
            fetch(`http://localhost:4000/users/groups/posts/add?groupname=${this.name}&name=${this.$route.query.touser.split('@')[0]}&content=${this.groupPostContent}`, {
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
              // window.location.reload()
              this.$router.push({ name: "Home", query: { auth: 'true', guest: 'false', sender: this.$route.query.touser.split('@')[0] } })
            });
          }
        })
      },
      enterToGroup(){
        jwt.verify(this.token, 'vuesocialnetworksecret', (err, decoded) => {
          if (err) {
            this.$router.push({ name: "UsersLogin" })
          } else {
            fetch(`https://vuesocialnetwork.herokuapp.com/users/groups/partisipants/add?groupname=${this.$route.query.groupname}&groupdescription=${this.$route.query.groupdescription}&groupaccess=${this.$route.query.groupaccess}&touser=${this.$route.query.touser}`, {
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
              // JSON.parse(result).message   
              // window.location.reload()
              // this.$router.push({ name: 'Home', query: { auth: 'true', guest: 'false', sender: window.localStorage.getItem('useremail') } })
              this.$router.push({ name: 'Home', query: { auth: 'true', guest: 'false', sender: decoded.useremail.split('@')[0] } })

            });
          }
        })
      },
      leaveFromGroup(){
        jwt.verify(this.token, 'vuesocialnetworksecret', (err, decoded) => {
          if (err) {
            this.$router.push({ name: "UsersLogin" })
          } else {
            fetch(`https://vuesocialnetwork.herokuapp.com/users/groups/partisipants/delete?groupname=${this.$route.query.groupname}&groupdescription=${this.$route.query.groupdescription}&groupaccess=${this.$route.query.groupaccess}&touser=${this.$route.query.touser}`, {
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
              // JSON.parse(result).message
              // window.location.reload()
              // this.$router.push({ name: 'Home', query: { auth: 'true', guest: 'false', sender: window.localStorage.getItem('useremail') } })
              this.$router.push({ name: 'Home', query: { auth: 'true', guest: 'false', sender: decoded.useremail.split('@')[0] } })
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
<style scoped>
  .customflex {
    display: flex;
    justify-content: center;
    flex-direction: row;
  }
  .customCardGroup {
    margin:auto;
    display:flex;
    justify-content: center;
    width:75%;
    flex-direction: column; 
    text-align: center;
   
  }
  .main {
    width: 65%;
  }
  
  .postStyle {
    margin: 5px;
  }
  
</style>