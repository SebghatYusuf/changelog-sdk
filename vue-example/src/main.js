import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import 'changelog-sdk/styles'
import './styles.css'
import App from './App.vue'
import HomePage from './pages/Home.vue'
import ChangelogPage from './pages/ChangelogPage.vue'

function readCookie(name) {
  const cookies = document.cookie ? document.cookie.split(';') : []
  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split('=')
    if (rawName === name) {
      return decodeURIComponent(rawValue.join('=') || '')
    }
  }
  return undefined
}

const nativeFetch = window.fetch.bind(window)
window.fetch = async (input, init = {}) => {
  const headers = new Headers(init.headers || {})
  const token = readCookie('changelog-csrf')
  if (token && !headers.has('x-csrf-token')) {
    headers.set('x-csrf-token', token)
  }
  return nativeFetch(input, { ...init, headers })
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/changelog/:route(.*)*', component: ChangelogPage, props: { basePath: '/changelog' } },
  ],
})

createApp(App).use(router).mount('#app')
