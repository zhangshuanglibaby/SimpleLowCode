import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 引入@simple/ui的样式
import '@simple/ui/style'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
