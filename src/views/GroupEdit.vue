<template>
    <div>
      <Header :auth="'true'" :sender="touser.split('@')[0]" />
      <div class="customCardGroup">
        
        <form style="max-width: 650px; min-width: 400px; margin: auto;" class="registerForm" enctype="multipart/form-data"  method="POST" :action="`https://opalescent-nostalgic-feet.glitch.me/users/groups/editsuccess?previousgroupname=${previousgroupname}&groupname=${groupname}&groupdescription=${groupdescription}&groupaccess=${groupaccess}&imageurl=a&touser=${touser}`">
        <!-- <form style="max-width: 650px; min-width: 400px; margin: auto;" class="registerForm" enctype="multipart/form-data"  method="POST" :action="`http://localhost:4000/users/groups/editsuccess?previousgroupname=${previousgroupname}&groupname=${groupname}&groupdescription=${groupdescription}&groupaccess=${groupaccess}&imageurl=a&touser=${touser}`"> -->
        
          <input type="hidden" class="previousgroupname form-control" disabled required="" autofocus="" :value="groupname">
          
          <!-- <div v-if="imageurl && imageurl.includes('empty')">
            <img width="85px" height="85px" src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" />  
          </div>  
          <div v-else-if="imageurl && !imageurl.includes('empty')">
            <img width="85px" height="85px" :src="imageurl" />
          </div>   -->
          
          <img width="85px" height="85px" :src="`https://opalescent-nostalgic-feet.glitch.me/pictures/getpicture?picturename=${groupname}`"  @error="$event.target.src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'"/>
          <!-- <img width="85px" height="85px" :src="`http://localhost:4000/pictures/getpicture?picturename=${groupname}`"  @error="$event.target.src='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'"/> -->

          <!-- <label for="inputPhoto" class="sr-only">Фото</label>
          <input v-model="imageurl" type="text" id="inputPhoto" class="imageurl form-control" placeholder="Photo" required="" autofocus=""> -->
          <label for="inputPhoto" class="sr-only">Фото</label>
          <input name="myFile" type="file" class="userimage form-control" autofocus="">

          <label for="inputName" class="sr-only">Имя</label>
          <input v-model="groupname" type="text" id="inputName" class="groupname form-control" placeholder="Name" required="" autofocus="">
          <label for="inputDescription" class="sr-only">Описание</label>
          <input v-model="groupdescription" type="text" id="inputDescription" class="groupdescription form-control" placeholder="Description" required="" autofocus="">
          
          <label for="inputAccess" class="sr-only">Доступ</label>
          <select style="max-width: 400px; margin: auto;" v-model="groupaccess" class="form-select" aria-label="Default select example">
            <option selected value="public">public</option>
            <option value="private">private</option>
          </select>
          
          <!-- <input v-model="groupaccess" type="text" id="inputAccess" class="groupaccess form-control" placeholder="Access" required="" autofocus=""> -->
          
          <br/>
          
          <!-- <button style="min-width: 125px;" @click="save()" class="btn btn-lg btn-primary btn-block editBtn">Сохранить</button> -->
          <input style="min-width: 125px;" type="submit" class="btn btn-lg btn-primary btn-block editBtn" value="Сохранить" />
        
          <input type="hidden" class="sender form-control" disabled required="" autofocus="" v-model="touser">
        </form>    
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
          touser: '',
          imageurl: '',
          groupname: '',
          groupdescription: '',
          groupaccess: '',
          previousgroupname: '',
          token: window.localStorage.getItem("showbellowtoken"),
        }
    },
    mounted(){
    
      this.groupname = this.$route.query.groupname
      this.groupdescription = this.$route.query.groupdescription
      this.groupaccess = this.$route.query.groupaccess
      this.touser = this.$route.query.touser
      this.imageurl = this.$route.query.imageurl
      this.previousgroupname = this.$route.query.groupname
    },
    methods: {
      save(){
        jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
          if (err) {
            this.$router.push({ name: "UsersLogin" })
          } else {
            // fetch(`http://localhost:4000/users/groups/editsuccess?previousgroupname=${this.previousgroupname}&groupname=${this.groupname}&groupdescription=${this.groupdescription}&groupaccess=${this.groupaccess}&imageurl=${this.imageurl}&touser=${this.touser}`, {
            fetch(`https://showbellow.herokuapp.com/users/groups/editsuccess?previousgroupname=${this.previousgroupname}&groupname=${this.groupname}&groupdescription=${this.groupdescription}&groupaccess=${this.groupaccess}&imageurl=${this.imageurl}&touser=${this.touser}`, {
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
            console.log()
            this.$router.push({ name: 'Group', query: { 'imageurl': this.imageurl, 'groupname': this.groupname, 'groupdescription': this.groupdescription, 'groupaccess': this.groupaccess, 'touser': this.touser, 'guest': 'false' } } )
            });
          }
        })
      }
    },
    components: {
      Footer,
      Header
    }
}
</script>
<style scoped>
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
    .customErros {
        color: red;
        font-weight: bolder;
    }
</style>