import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import PixelUI from '@mmt817/pixel-ui'
import '@mmt817/pixel-ui/dist/index.css'
import App from './App.vue'

// Design system styles
import './styles/variables.css'
import './styles/base.css'
import './styles/utilities.css'
import './style.css'

// Custom UI components
import { PxSlider, PxSwitch, PxCheckbox, PxSelect, PxColorPicker, PxNumberInput, PxSegmented } from './components/ui'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(PixelUI)

// Register custom UI components globally
app.component('PxSlider', PxSlider)
app.component('PxSwitch', PxSwitch)
app.component('PxCheckbox', PxCheckbox)
app.component('PxSelect', PxSelect)
app.component('PxColorPicker', PxColorPicker)
app.component('PxNumberInput', PxNumberInput)
app.component('PxSegmented', PxSegmented)

app.mount('#app')
