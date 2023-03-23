import { createApp } from 'vue'
import App from './App.vue'
import JsonViewer from 'vue3-json-viewer'
import './assets/main.css'
import 'vue3-json-viewer/dist/index.css'

createApp(App)
    .use(JsonViewer)
    .mount('#app')
    
