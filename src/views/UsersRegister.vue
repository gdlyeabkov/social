<template>
    <div id="app">
        <!-- header -->
        <Header :auth="'false'" :sender="''" />
        <div class="customCardGroup">
            <img class="mb-4" src="https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/vue-dot-js-256.png" alt="" width="72" height="72">
            <h1 class="h3 mb-3 font-weight-normal headerform">Зарегестрируйтесь</h1>
            
            <label class="sr-only">Email</label>
            <input v-model="useremail" type="email" id="" class="useremail form-control" placeholder="Email address" required="" autofocus="">
            <label class="sr-only">Password</label>
            <input v-model="userpassword" type="password" id="" class="userpassword form-control" placeholder="Password" required="">
            <label class="sr-only">Age</label>
            <input v-model="userage" type="number" id="" class="userage  form-control" placeholder="Age" required="" autofocus="">
            <label class="sr-only">Name</label>
            <input v-model="username" type="text" id="" class="username form-control" placeholder="Name" required="" autofocus="">
            <div class="checkbox mb-3">
            </div>
            <button @click="registerNewUser" class="btn btn-lg btn-danger btn-block registerBtn">Зарегестрироваться</button>
            <div class="customErros">{{ errors }}</div>
        </div>
        <Footer/>
    </div>
</template>
<script>
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
export default {
    data(){
        return {
            useremail: '',
            userpassword: '',
            username: '',
            userage: 0,
            errors: ''
        }
    },
    methods: {
        registerNewUser(){
            // this.$router.push({ name: '/users/check?useremail=${useremail}&userpassword=${userpassword}' })
            fetch(`https://vuesocialnetwork.herokuapp.com/users/usercreatesuccess?useremail=${this.useremail}&userpassword=${this.userpassword}&userage=${this.userage}&username=${this.username}`, {
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
            if(JSON.parse(result).status.includes('OK')){    
                this.$router.push({ name: 'Home', query: { "auth": 'true', "sender": JSON.parse(result).username, "guest": "false"  } })
            } else if(!JSON.parse(result).status.includes('OK')){
                this.errors = "Такой пользователь уже существует"
            }
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
    .registerBtn {
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