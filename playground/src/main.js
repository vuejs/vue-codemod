import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import Editor from './components/Editor.vue'
import Navbar from './components/Navbar.vue'
import TransformationSelect from './components/TransformationSelect.vue'
import CodeMirror from './components/CodeMirror.vue'
import { initStore } from './store'

const app = createApp(App)

app.component('Editor', Editor)
app.component('Navbar', Navbar)
app.component('TransformationSelect', TransformationSelect)
app.component('CodeMirror', CodeMirror)

app.mount('#app')

initStore()
