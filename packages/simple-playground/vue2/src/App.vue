<template>
  <div id="app">
    <SImage
      src="https://www.finclip.com/news/zb_users/theme/zblog5_news/image/logo.png"
    />
  </div>
</template>

<script>
import simple from '@simple/ui/vue2'

const { SImage } = simple

export default {
  name: 'App',
  components: {
    SImage
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
