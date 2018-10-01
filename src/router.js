import Vue from 'vue';
import Router from 'vue-router';

// Components
import Login from './views/Login';

Vue.use(Router);

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
];

export default new Router({
  routes,
  mode: 'history'
});