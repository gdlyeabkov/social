import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import UsersLogin from '../views/UsersLogin.vue'
import UsersRegister from '../views/UsersRegister.vue'
import UsersEdit from '../views/UsersEdit.vue'
import UsersList from '../views/UsersList.vue'
import GroupsList from '../views/GroupsList.vue'
import GroupRegister from '../views/GroupRegister.vue'
import Group from '../views/Group.vue'
import GroupEdit from '../views/GroupEdit.vue'
import Post from '../views/Post.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/users/login',
    name: 'UsersLogin',
    component: UsersLogin
  },
  {
    path: '/users/register',
    name: 'UsersRegister',
    component: UsersRegister
  },
  {
    path: '/users/listing',
    name: 'UsersList',
    component: UsersList
  },
  {
    path: '/users/editing',
    name: 'UsersEdit',
    component: UsersEdit
  },
  {
    path: '/groups/list',
    name: 'GroupsList',
    component: GroupsList
  },
  {
    path: '/group/register',
    name: 'GroupRegister',
    component: GroupRegister
  },
  {
    path: '/group',
    name: 'Group',
    component: Group
  },
  {
    path: '/group/edit',
    name: 'GroupEdit',
    component: GroupEdit
  },
  {
    path: '/post/:postid',
    name: 'Post',
    component: Post
  },
  
  
  
]

const router = new VueRouter({
  routes,
  mode: 'history'
})

export default router
