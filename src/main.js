import 'onsenui'
import Vue from 'vue'
import Vuex from 'vuex'
import VueOnsen from 'vue-onsenui'

// Onsen UI Styling and Icons
require('onsenui/css-components-src/src/onsen-css-components.css')
require('onsenui/css/onsenui.css')

import store from './store.js'

import App from './App.vue'

Vue.use(VueOnsen)
Vue.use(Vuex)

try {
  if (cordova) document.addEventListener('deviceready', onDeviceReady, false)
} catch (error) {
  console.log(error)
  new Vue({
    el: '#app',
    store: new Vuex.Store(store),
    template: '<app></app>',
    components: { App }
  })
}

function onDeviceReady() {
  new Vue({
    el: '#app',
    store: new Vuex.Store(store),
    template: '<app></app>',
    components: { App }
  })
}
