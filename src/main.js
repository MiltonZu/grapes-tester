import { createApp } from 'vue'
import App from './App.vue'
import JsonViewer from 'vue-json-viewer/ssr'

import './assets/main.css'

createApp(App)
    .use(JsonViewer)
    .mount('#app')
    
