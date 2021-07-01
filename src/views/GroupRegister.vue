<template>
    <div>
        <!-- header -->
      <Header :auth="'true'" :sender="$route.query.touser.split('@')[0]" />
      
      <div class="customCardGroup">
        <img class="mb-4" src="https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/vue-dot-js-256.png" alt="" width="72" height="72">
        <h1 class="h3 mb-3 font-weight-normal">Создание новой группы</h1>
        <label for="inputName" class="sr-only">Name</label>
        <input v-model="name" type="text" id="inputDescription" class="groupname form-control" placeholder="Name" required="" autofocus="">
        <label for="inputDescription" class="sr-only">Description</label>
        <input v-model="description" type="text" id="inputDescription" class="groupdescription form-control" placeholder="Description" required="">
        
        <label for="inputAccess" class="sr-only">Access</label>
        <select style="max-width: 400px; margin: auto;"  v-model="access" class="form-select" aria-label="Default select example">
          <option selected value="public">public</option>
          <option value="private">private</option>
        </select>
        
        <!-- <input v-model="access" type="text" id="inputAccess" class="groupaccess form-control" placeholder="Access" required=""> -->
        
        <label for="input" class="sr-only">Image Url</label>
        <input v-model="imageurl" type="text" id="inputImageUrl" class="groupimageurl form-control" placeholder="imageurl" required="">
        <div class="checkbox mb-3">
        </div>
        <button @click="createGroup()" class="btn btn-lg btn-primary btn-block createBtn">Создать группу</button>
      </div>
      <p class="customErros">
          {{ errors }}
      </p>
      <Footer/>
  </div>
</template>
<script>

import Footer from '@/components/Footer.vue'
import Header from '@/components/Header.vue'

export default {
    data(){
        return {
            name: '',
            description: '',
            access: 'public',
            imageurl: '',
            errors: ''
        }
    },
    methods: {
        createGroup(){
            localStorage.setItem("userlogin", "true")
            // location.href = `/users/groups/groupcreatesuccess?touser=${touser}&groupaccess=${groupaccess}&groupdescription=${groupdescription}&groupname=${groupname}&imageurl=${groupimageurl}`
            fetch(`https://vuesocialnetwork.herokuapp.com/users/groups/groupcreatesuccess?touser=${this.$route.query.touser}&groupaccess=${this.access}&groupdescription=${this.description}&groupname=${this.name}&imageurl=${this.imageurl}`, {
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
                this.$router.push({ name: 'Home', query: { auth: 'true', sender: this.$route.query.touser.split('@')[0], guest: 'false' } })
                // window.location.reload()
            });
        }
    },
    components: {
      Header,
      Footer
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
    .createBtn {
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