import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { isTokenExpired } from './checkTokenExpiry.js';

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App);
  app.use(router);
  app.mount('#app');
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  if (tokenFromUrl) {
    localStorage.setItem('user.token', tokenFromUrl);
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
  }

  const token = localStorage.getItem('user.token');
if (token && isTokenExpired(token)) {
  localStorage.removeItem('user.token');
  window.location.href = 'https://inventoryadministrator.com/login';
}
