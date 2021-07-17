<template>
    <div id="app">
        <!-- header -->
        <Header :auth="'false'" :sender="''" />
        <div class="customCardGroup">
            <img class="mb-4" src="https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/vue-dot-js-256.png" alt="" width="72" height="72">
            <h1 class="h3 mb-3 font-weight-normal">Войдите</h1>
            <label for="inputEmail" class="sr-only">Email</label>
            
            <div class="input-group mb-3" style="width: 405px; margin: auto;">
                <input style="" type="email" id="inputEmail" v-model="useremail" class="useremail form-control" placeholder="Email address" required="" autofocus="">
                <select style="max-width: 115px;" class="useremail form-control" v-model="custommail">
                    <option value="@gmail.com" selected>@gmail.com</option>
                    <option value="@mail.ru">@mail.ru</option>
                </select>
            </div>
            
            <label for="inputPassword" class="sr-only">Пароль</label>
            <input type="password" id="inputPassword" v-model="userpassword" class="userpassword form-control" placeholder="Password" required="">
            <div class="checkbox mb-3">
            </div>
            <button style="min-width: 85px;" class="btn btn-lg btn-primary btn-block loginBtn" @click="login()">Войти</button>
            <p class="customErros">
                {{ errors }}
            </p>
        </div>
        <!-- footer -->
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
            useremail: '',
            userpassword: '',
            errors: '',
            auth: 'false',
            token: '',
            custommail: "@gmail.com"
        }
    },
    methods: {
        login(){
            if(!this.useremail.includes("@")){
                // this.$router.push({ name: '/users/check?useremail=${useremail}&userpassword=${userpassword}' })
                fetch(`https://showbellow.herokuapp.com/users/check?useremail=${this.useremail + this.custommail}&userpassword=${this.userpassword}`, {
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
                    const isAuth = JSON.parse(result).auth.includes('true')
                    console.log(!isAuth)
                    if(isAuth){
                        
                        this.token = jwt.sign({
                            useremail: this.useremail
                            }, 'showbellowsecret', { expiresIn: '5m' })
                        localStorage.setItem('showbellowtoken', this.token)

                        localStorage.setItem('useremail', this.useremail.split('@')[0])
                        this.$router.push({ name: 'Home', query: { "auth": 'true', "sender": JSON.parse(result).sender, "guest": 'false'  } })
                    } else if(!isAuth){
                        //window.location.reload()
                        this.errors = "Неверный логин или пароль"
                    }
                });
            } else if(this.useremail.includes("@")){
                this.errors = "Неверный логин или пароль"
            }
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
    .loginBtn {
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