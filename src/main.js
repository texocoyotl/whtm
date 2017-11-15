import Vue from 'vue'
import App from './App.vue'
import Vuetify from 'vuetify'
import './stylus/main.styl'
import https from 'https'

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
		name: '*',
		path: '*',
		component: Dashboard
    }
];

const router = new VueRouter({
	mode: 'history',
	routes: routes
});
var vue = new Vue(Vue.util.extend({
	router
}, App)).$mount('#app');
