import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import Editor from './components/Editor.vue'
import Navbar from './components/Navbar.vue'
import TransformationSelect from './components/TransformationSelect.vue'
import CodeMirror from './components/CodeMirror.vue'
import Panels from './components/Panels.vue'
import TransformView from './components/TransformView.vue'
import { initStore } from './store'

const app = createApp(App)

app.component('Editor', Editor)
app.component('Navbar', Navbar)
app.component('TransformationSelect', TransformationSelect)
app.component('CodeMirror', CodeMirror)
app.component('Panels', Panels)
app.component('TransformView', TransformView)

app.mount('#app')

initStore()
