<template>
    <div id="app">
    <Header :auth="'true'" :sender="sender"/>
    
    <select v-model="groupfilter" class="form-select" aria-label="Default select example">
      <option selected value="1">Группы</option>
      <option value="2">Группы которые вы создали</option>
      <option value="3">Группы которые вы не создали</option>
      <option value="4">Группы в которые вы вступили</option>
      <option value="5">Группы в которые вы не вступили</option>
    </select>

        <div v-if="allGroups != null && allGroups.length >= 1 && groupfilter === '1'">
            <p style="text-align: center;">Все группы: </p>
            <div v-for="group in allGroups">
                <div class="card">
                    <h5 class="card-header">
                        <div v-if="auth.includes('true')">
                            <router-link :to="{ name: 'Group', query: { 'groupname': group.name, 'groupdescription': group.description, 'groupaccess': group.access, 'imageurl': group.imageurl, 'touser': $route.query.touser, 'guest': $route.query.guest  } }">{{ group.name }}</router-link>
                        </div>
                        <div v-else>

                        </div>
                    </h5>
                  </div>
            </div>
        </div>
        <div v-else-if="allGroups != null && allGroups.length <= 0 && groupfilter === '1'" style="text-align: center;">
          <p style="text-align: center;">Таких групп нет</p>    
        </div>
        <br style="clear: both;"/>
        <div v-if="hasGroups != null && hasGroups.length >= 1 && groupfilter === '2'">
            <p style="text-align: center;">Группы которые вы создали</p>
            <div v-for="group in hasGroups">
            
                <div class="card">
                    <h5 class="card-header">
                        <div v-if="auth.includes('true')">
                            <router-link :to="{ name:'Group', query: { groupname: group.name, groupdescription: group.description, groupaccess: group.access, imageurl: group.imageurl, touser: touser } }">{{ group.name }}</router-link>
                        </div>
                    </h5>
                    <div class="card-body">
                      <p>Вы уже в группе</p>
                      <a style="cusor: pointer;" @click="leaveGroup(group.name, group.description, group.access, group.imageurl, touser)">Выйти из группы</a>
                    </div> 
                  </div>
            </div>
        </div>
        <div v-else-if="hasGroups != null && hasGroups.length <= 0 && groupfilter === '2'" style="text-align: center;">
          <p style="text-align: center;">Таких групп нет</p>    
        </div>
        
        <div v-if="notHasGroups != null && notHasGroups.length >= 1 && groupfilter === '3'">
            <p style="text-align: center;">Группы которые вы не создали</p>  
            <div v-for="group in notHasGroups">
            
                <div class="card">
                    <h5 class="card-header">
                        <div v-if="auth.includes('true')">
                            <router-link :to="{ name:'Group', query: { groupname: group.name, groupdescription: group.description, groupaccess: group.access, imageurl: group.imageurl, touser: touser } }">{{ group.name }}</router-link>
                        </div>
                        <div v-else>
                          
                        </div>
                        
                    </h5>
                    <div class="card-body">
                      
                      <a style="cusor: pointer;" @click="joinGroup(group.name, group.description, group.access, group.imageurl, touser)">Вступить в группу</a>
                      <p>Вы ещё не в группе</p>
                    </div> 
                  </div>
            </div>
        </div>
        <div v-else-if="notHasGroups != null && notHasGroups.length <= 0 && groupfilter === '3'" style="text-align: center;">
          <p  style="text-align: center;">Таких групп нет</p>    
        </div>

        <div v-if="allGroupsWithPartisipants != null && allGroupsWithPartisipants.length >= 1 && groupfilter === '4'">
          <p style="text-align: center;">Группы в которые вы вступили</p> 
          <div v-for="group in allGroupsWithPartisipants">
              <div class="card">
                  <h5 class="card-header">
                      <div v-if="auth.includes('true')">
                          <!-- <router-link :to="{ name:'Group', query: { groupname: group.name, groupdescription: group.description, groupaccess: group.access, imageurl: group.imageurl, touser: touser } }">{{ group.name }}</router-link> -->
                      </div>
                      <div v-else>
                        
                      </div>
                      
                  </h5>
                  <div class="card-body">
                    <p>Вы участник этой группы</p>
                    <a style="cusor: pointer;" @click="leaveGroup(group.name, group.description, group.access, group.imageurl, touser)">Выйти из группы</a>
                  </div> 
                </div>
              </div>
            </div>
            <div v-else-if="allGroupsWithPartisipants != null && allGroupsWithPartisipants.length <= 0 && groupfilter === '4'" style="text-align: center;">
              <p  style="text-align: center;">Таких групп нет</p>    
            </div>

        <div v-if="allGroupsWithoutPartisipants != null && allGroupsWithoutPartisipants.length >= 1 && groupfilter === '5'">
            <p style="text-align: center;">Группы в которые вы не вступили</p>  
            <div v-for="group in allGroupsWithoutPartisipants">
                <div class="card">
                    <h5 class="card-header">
                        <div v-if="auth.includes('true')">
                            <router-link :to="{ name:'Group', query: { groupname: group.name, groupdescription: group.description, groupaccess: group.access, imageurl: group.imageurl, touser: touser } }">{{ group.name }}</router-link>
                        </div>
                        <div v-else>
                          
                        </div>
                        
                    </h5>
                    <div class="card-body">
                      <p>Вы ещё не участник этой группы</p>
                      <a style="cusor: pointer;" @click="joinGroup(group.name, group.description, group.access, group.imageurl, touser)">Вступить в группу</a>
                    </div> 
                  </div>
            </div>
        </div>
        <div v-else-if="allGroupsWithoutPartisipants != null && allGroupsWithoutPartisipants.length <= 0 && groupfilter === '5'" style="text-align: center;">
          <p style="text-align: center;">Таких групп нет</p>    
        </div>

        <br style="clear: both;"/>
        <Footer/>
    </div>    
</template>
<script>

import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'

import * as jwt from 'jsonwebtoken'

// эта страница единственная которая плохо работает

export default {
    data(){
        return {
            groupfilter: "1",
            allGroupsWithPartisipants: [],
            allGroupsWithoutPartisipants: [],
            hasGroups: [],
            notHasGroups: [],
            allGroups: [],
            auth:'true',
            touser: '',
            sender: '',
            token: window.localStorage.getItem("showbellowtoken"),
        }
    },
    methods: {
      leaveGroup(groupName, groupDescription, groupAccess, groupImageUrl, user){
        jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
        if (err) {
          this.$router.push({ name: "UsersLogin" })
        } else {
          fetch(`https://showbellow.herokuapp.com/users/groups/partisipants/delete?groupnamegroupdescription=${groupDescription}&groupaccess=${groupAccess}&imageurl=${groupImageUrl}&touser=${user}`, {
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
            this.$router.push({ name: "Home", query: { auth: 'true', guest: 'false', sender: decoded.useremail.split('@')[0] } })
          });
        }
      })
      },
      joingroup(groupName, groupDescription, groupAccess, groupImageUrl, user){
        jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
        if (err) {
          this.$router.push({ name: "UsersLogin" })
        } else {
          fetch(`https://showbellow.herokuapp.com/users/groups/partisipants/add?groupnamegroupdescription=${groupDescription}&groupaccess=${groupAccess}&imageurl=${groupImageUrl}&touser=${user}`, {
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
            this.$router.push({ name: "Home", query: { auth: 'true', guest: 'false', sender: decoded.useremail.split('@')[0] } })
          });
        }
      })
      }
    },
    mounted(){
      jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
        if (err) {
          this.$router.push({ name: "UsersLogin" })
        } else {
          fetch(`https://showbellow.herokuapp.com/users/groups/list?sender=${this.$route.query.touser}&groupname=${this.$route.query.groupname}`, {
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
            this.allGroupsWithPartisipants = JSON.parse(result).allGroupsWithPartisipants
            this.allGroupsWithoutPartisipants = JSON.parse(result).allGroupsWithoutPartisipants
            this.hasGroups = JSON.parse(result).hasGroups
            this.notHasGroups = JSON.parse(result).notHasGroups
            this.allGroups = JSON.parse(result).allGroups
            this.touser = JSON.parse(result).touser
            this.sender = this.touser.split('@')[0]
          });
      }
    })
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
  .card {
    width: 250px;
    display: block;
    float: left;
    margin: 10px 5px;
  }
</style>