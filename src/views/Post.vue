<template>
    <div>
      <Header :auth="'true'" :sender="post.sender" />
        <div class="card" style="color: black; margin: 25px auto; width: 18rem;">
            <div class="card-header">
              <h5 class="card-title">{{ post.sender }}</h5>
            </div>
            <div class="card-body">
                <p class="card-text">{{ post.content }}</p>
            </div>
        </div>
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
          post: {},
          token: window.localStorage.getItem("showbellowtoken"),
        }
    },
    mounted(){
      jwt.verify(this.token, 'showbellowsecret', (err, decoded) => {
      if (err) {
        this.$router.push({ name: "UsersLogin" })
      } else {
        console.log(this.$route.params.postid)
        
        // fetch(`http://localhost:4000/post/${this.$route.params.postid}`, {
        fetch(`https://showbellow.herokuapp.com/post/${this.$route.params.postid}`, {
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
              this.post = JSON.parse(result).post
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

<style>

</style>
