import { createApp } from 'vue'
import AboutApp from './AboutApp.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(AboutApp).use(ElementPlus).mount('#app')