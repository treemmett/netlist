import Vue from 'vue';
import Router from 'vue-router';

// Components
import Dashboard from './views/Dashboard';
import Login from './views/Login';

Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    children: [
      {
        path: 'applications',
        name: 'applications'
      },
      {
        path: 'users',
        name: 'users',
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  }
];

export default new Router({
  routes,
  mode: 'history'
});