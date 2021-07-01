<template>
    <div>
        <div class="card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">{{ post.sender }}</h5>
                <p class="card-text">{{ post.content }}</p>
                
            </div>
          </div>
        <!-- footer -->
        <p class="mt-5 mb-3 text-muted">© {{ new Date().toLocaleDateString() }}</p> 
    </div>
</template>

<script>
export default {
    data(){
        return {
            post: {}
        }
    },
    mounted(){
    console.log(this.$route.params.postid)
    fetch(`https://vuesocialnetwork.herokuapp.com/post/${this.$route.params.postid}`, {
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
}
</script>

<style>

</style>
