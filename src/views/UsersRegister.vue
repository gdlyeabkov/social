<template>
    <div id="app">
        <!-- header -->
        <Header :auth="'false'" :sender="''" />
        <div class="customCardGroup">
            <img class="mb-4" src="https://cdn4.iconfinder.com/data/icons/logos-brands-5/24/vue-dot-js-256.png" alt="" width="72" height="72">
            <h1 class="h3 mb-3 font-weight-normal headerform">Зарегестрируйтесь</h1>
            <form style="max-width: 650px; min-width: 400px; margin: auto;" class="registerForm" enctype="multipart/form-data"  method="POST" :action="`https://mercurial-diagnostic-glazer.glitch.me/users/usercreatesuccess?useremail=${useremail + custommail}&userpassword=${userpassword}&userage=${userage}&username=${username}`">
                
                <label class="sr-only">Email</label>
                <div class="input-group mb-3" style="width: 405px; margin: auto;">
                    <input name="useremail" v-model="useremail" type="text" id="" class="useremail form-control" placeholder="Email address" autofocus="">    
                    <select style="max-width: 115px;" class="useremail form-control" v-model="custommail" @change="mydebug()">
                        <option value="@gmail.com" selected>@gmail.com</option>
                        <option value="@mail.ru">@mail.ru</option>
                    </select>
                </div>
                
                <label class="sr-only">Пароль</label>
                <input name="userpassword" v-model="userpassword" type="password" id="" class="userpassword form-control" placeholder="Password" required="">
                <label class="sr-only">Возраст</label>
                <input name="userage" v-model="userage" type="number" id="" class="userage  form-control" placeholder="Age" required="" autofocus="">
                <label class="sr-only">Имя</label>
                <input name="username" v-model="username" type="text" id="" class="username form-control" placeholder="Name" required="" autofocus="">
                <label class="sr-only">Фото</label>
                <input name="myFile" type="file" class="userimage form-control" required="" autofocus="">
                <div class="checkbox mb-3">
                </div>
                <input type="submit" style="min-width: 215px;" class="btn btn-lg btn-primary btn-block registerBtn" value="Зарегестрироваться">
                <!-- <button style="min-width: 215px;" @click="registerNewUser" class="btn btn-lg btn-primary btn-block registerBtn">Зарегестрироваться</button> -->
            </form>
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
            errors: '',
            custommail: "@gmail.com"
        }
    },
    mounted(){
        this.mydebug()
    },
    methods: {
        mydebug(){
            console.log(this.custommail)
        },
        registerNewUser(){
            if(!this.useremail.includes("@")){
                let fulladdress = this.custommail.options[this.custommail.selectedIndex].text
                // this.$router.push({ name: '/users/check?useremail=${useremail}&userpassword=${userpassword}' })
                fetch(`https://showbellow.herokuapp.com/users/usercreatesuccess?useremail=${this.useremail.concat(this.custommail)}&userpassword=${this.userpassword}&userage=${this.userage}&username=${this.username}`, {
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
                    console.log("this.useremail + this.custommail: ", this.useremail + this.custommail)
                    if(JSON.parse(result).status.includes('OK')){    
                        this.$router.push({ name: 'Home', query: { "auth": 'true', "sender": JSON.parse(result).username, "guest": "false"  } })
                    } else if(!JSON.parse(result).status.includes('OK')){
                        this.errors = "Такой пользователь уже существует"
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