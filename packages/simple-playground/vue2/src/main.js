import Vue from 'vue'
import App from './App.vue'
// 引入@simple/ui的样式
import '@simple/ui/vue2/style'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
