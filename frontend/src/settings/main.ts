import { createApp } from 'vue'
import SettingsApp from './SettingsApp.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(SettingsApp).use(ElementPlus).mount('#app')