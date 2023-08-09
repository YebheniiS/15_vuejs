import { createApp } from 'vue'
import App from './App.vue'
import './index.css'
import router from './router';
import VueQrcode from '@chenfengyuan/vue-qrcode';

createApp(App).use(router).component(VueQrcode.name, VueQrcode).mount('#app')
