import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import './stylus/main.styl'
import https from 'https'
import Vuex from 'vuex'

Vue.use(Vuex)
Vue.use(Vuetify)

import VueRouter from 'vue-router';
Vue.use(VueRouter);

import VueAxios from 'vue-axios';
import axios from 'axios';
Vue.use(VueAxios, axios.create({
	baseURL: 'https://whtmapi.herokuapp.com'
    //baseURL: 'http://localhost:5000'
}));

import VeeValidate from 'vee-validate';
Vue.use(VeeValidate);

import Vuelidate from 'vuelidate'
Vue.use(Vuelidate)

import ECharts from 'vue-echarts/components/ECharts.vue'
Vue.use(ECharts);

import Dashboard from './components/Dashboard.vue';
import Players from './components/Players.vue';
import Armies from './components/Armies.vue';
import Ratings from './components/Ratings.vue';
import Teams from './components/Teams.vue';

const routes = [
	{
		name: 'Dashboard',
		path: '/dashboard',
		component: Dashboard
      },
	{
		name: 'Players',
		path: '/players',
		component: Players
    },
	{
		name: 'Armies',
		path: '/armies',
		component: Armies
    },
	{
		name: 'Ratings',
		path: '/ratings',
		component: Ratings
    },
    {
		name: 'Teams',
		path: '/teams',
		component: Teams
    },
	{
		name: '*',
		path: '*',
		component: Teams
    }
];

const router = new VueRouter({
	mode: 'history',
	routes: routes
});

const store = new Vuex.Store({
  state: {
    token: null,
    teamId: null
  },
  mutations: {
    updateToken(state, token) {
      state.token = token
    },
    updateTeamId(state, teamId){
      state.teamId = teamId;
    }
  },
    getters: {
        token: state => state.token,
        teamId: state => state.teamId
    }
})

var vue = new Vue(Vue.util.extend({
	router,
    store
}, App)).$mount('#app');
