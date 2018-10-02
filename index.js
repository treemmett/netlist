import router from './src/router';
import Vue from 'vue';

import './src/styles.scss';

new Vue({
  router,
  el: '#app',
  template: '<router-view></router-view>'
});