<template>
    <div></div>
</template>

<script>
    export default {
        name: "logout",
        methods:{
          logout(){
            //this.$cookies.remove('locationMiddlegroundToken')
            localStorage.removeItem('locationMiddlegroundToken')
            this.$router.push('/login')
          }
        },
      created() {
          this.logout();
      }
    }
</script>

<style scoped>

</style>
