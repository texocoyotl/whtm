<template>
  <v-app light>
    <v-toolbar fixed app>
     
      <v-toolbar-title>{{ title }}</v-toolbar-title>

	  </v-toolbar>
	  
	<main>
      <v-content>
        <v-container fluid>
          <v-slide-y-transition mode="out-in">
            <v-layout column align-center>
              
              <router-view></router-view>
              
            </v-layout>
          </v-slide-y-transition>
        </v-container>
      </v-content>
    </main>
    
	<v-bottom-nav :value="true" class="white">
	  <v-btn flat to="/dashboard">
        <span>Dashboard</span>
        <v-icon>equalizer</v-icon>
      </v-btn>
      <v-btn flat to="/players">
        <span>Players</span>
        <v-icon>people</v-icon>
      </v-btn>
		<v-btn flat :to="{name: 'Armies'}">
        <span>Armies</span>
        <v-icon>view_list</v-icon>
      </v-btn>
      <v-btn flat :to="{name: 'Ratings'}">
        <span>Ratings</span>
        <v-icon>linear_scale</v-icon>
      </v-btn>
    </v-bottom-nav>
    

  </v-app>
</template>

<style lang="stylus">
	@import './stylus/main'

</style>

<script>
	export default {
		data() {
			return {
				title: 'Warmachine / Hordes Team Matcher'
			}
		}
	}

</script>
