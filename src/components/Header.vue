<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="#">Show Bellow</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <div v-if="auth.includes('true')">
                        <li class="nav-item">
                            <!-- <router-link :to="{name:'Home', query:{ 'auth': 'true', 'guest': 'false', 'sender': sender }}">
                                Домой
                            </router-link> -->
                            <!-- <router-link :to="{name:'Home', query:{ 'auth': 'true', 'guest': 'false', 'sender': loginedSender }}">
                                Домой
                            </router-link> -->
                            <a style="color: blue; cursor: pointer;" @click="tohome()">Домой</a>
                            <!-- <a @click="tohome()">Домой</a> -->
                        </li>
                    </div>
                    <div v-else-if="auth.includes('false')">
                        <li class="nav-item">
                            <router-link :to="{name:'UsersLogin'}">
                                Вход
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link :to="{name:'UsersRegister'}">
                                Регистрация
                            </router-link>
                        </li>
                    </div>
                    <div v-if="auth.includes('true')">
                        <li>
                            <!-- <span class="badge bg-primary">{{ sender }}</span> -->
                            <span class="badge bg-primary">{{ loginedSender }}</span>
                            <!-- <router-link :to="{name: 'UsersLogin'}">
                                Выйти
                            </router-link> -->
                            <!-- <button class="primary" @click="logout()">Выйти</button> -->
                            <!-- <button @click="logout()" type="button" class="btn btn-primary">Выйти</button> -->
                            <span class="badge bg-primary" style="cursor: pointer;" @click="logout()">Выйти</span>
                        </li>
                        <li>
                            <!-- <router-link :to="{name: 'UsersLogin'}">
                                Выйти
                            </router-link> -->
                        </li>
                    </div>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import * as jwt from 'jsonwebtoken'

export default {
    mounted(){

    },
    methods: {
        tohome(){
            
            jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
                if (err) {
                    
                } else {
                    
                    // this.loginedSender = decoded.useremail.split('@')[0]
                    
                    // window.location = `/?auth=true&guest=false&sender=${sender}`
                    
                    // window.location = `/?auth=true&guest=false&sender=${this.loginedSender.split('@')[0]}`
                    window.location = `/?auth=true&guest=false&sender=${decoded.useremail.split('@')[0]}&mailclient=@${decoded.useremail.split('@')[1]}`

                    // this.$router.push({ name: "Home", query: { auth: 'true', guest: 'false', sender: this.loginedSender } })
                }
            })
        },
        logout(){
            
            this.token = jwt.sign({
              useremail: 'admin'
            }, 'showbellowsecret', { expiresIn: 1 })
            window.localStorage.setItem("showbellowtoken", this.token)

            this.$router.push({ 'name': "UsersLogin" })
        }
    },
    data(){
        return {
            // loginedSender: localStorage.getItem('useremail')
            // loginedSender: localStorage.getItem('useremail').split('@')[0]
            loginedSender: localStorage.getItem('showbellowuseremail'),
            
            token: window.localStorage.getItem("showbellowtoken"),
        }
    },
    props: {
        sender: {
            type: String,
            default: ''
        },
        auth: {
            type: String,
            default: 'false'
        }
    }
}
</script>

<style>

</style>