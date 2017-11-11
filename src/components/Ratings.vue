<template>

      <v-container fluid>
    <v-layout row wrap>
       <v-flex xs3>{{selectedTeamArmy}} {{isRated}} {{ selectedFaction }}
      </v-flex>
      <v-flex xs9>
      <v-subheader>Filters:</v-subheader>
      <v-layout row>
          <v-btn v-for="(o, k) in options" :key="k" :value="o.value"
                 :color="isRated == o.value ? 'primary' : 'transparent'" @click="isRated=o.value">
            {{o.text}}
          </v-btn>
       
        <v-select :items="factions" v-model="selectedFaction" single-line solo item-text='name' item-value="_id">
        
        </v-select>
         </v-layout>
      </v-flex>
        </v-layout>
        
        <v-layout row wrap>
       <v-flex xs3>
         <v-card flat>

            <v-layout column>
          <v-btn v-for="(ll, k) in teamArmies" :key="k" :value="ll._id" @click="updateList(ll._id)"
                 :color="selectedTeamArmy==ll._id ? 'primary' : 'transparent'"
                 >
            {{ll.name}}
          </v-btn>
              </v-layout>

         </v-card>
      </v-flex>
          
          <v-flex xs9 style="max-height: 400px" class="scroll-y" >
      <v-layout column >
              <v-slider v-for="(r, k) in filteredRatings" :key="k" :label="r.name" v-model="r.rating" min="1" max="5" step="1" snap :color="colors[r.rating-1]" :track-color="colors[r.rating-1]"></v-slider>
      </v-layout>
          </v-flex>
								<p>{{}}</p>

      </v-layout>
      </v-container>
</template>

<script>
  
var util = require('util');
var teamUri = '/team/59f9fd9c08e0bd3934d8f874';
	
module.exports = {
    data: function(){
        return{
          colors: ['red', 'orange', 'yellow', 'light-green', 'green'],
          factions: [],
					selectedFaction: '0',
          selectedTeamArmy: null,					
					options: [
            {
              text: 'Unrated',
              value: false
            }, 
            {	
              text: 'Rated',
              value: true
            }
          ],
          isRated: false,
					team: {},
					armies: [],
          ratings: []
          
            
        }
        
			},
	
			watch: {
				teamArmies: function(val){
					if (!this.selectedTeamArmy){
						this.selectedTeamArmy = this.teamArmies[0]._id;
						this.updateNonTeamArmiesRatings();
					}
				},
				
				selectedTeamArmy: function(val){
					this.updateNonTeamArmiesRatings();
				},
				
				nonTeamArmiesRatings: function(val){
					this.updateNonTeamArmiesRatings();
				},
				
				ratings: function(val){
					this.updateNonTeamArmiesRatings();
				},
				
			},

			computed:{
				
				factionsList: function(){
					var list = [];
					if (this.factions.length > 0){
						this.factions.forEach(function(faction){
							list[faction._id] = faction.name;
						});
						return list;
					}
				},

				teamArmies: function(){
					var self = this;
					var list = [];
					if (this.team.players){
						this.team.players.forEach(function(player){
							if (player.armies){
								player.armies.forEach(function(army){
									list.push({_id: army._id, name: army.name});
								});
							}
						});
					}
					return list;
				},
				
				nonTeamArmiesRatings: function(){
					var self = this;
					var list = [];
					if (self.armies.length > 0){
						list = self.armies.filter(function(army){
							return !army.player;
						});
					}

					return list;
				},
			
				
				
				filteredRatings: function(){
					var self = this;
					var list = [];
					
					if (self.nonTeamArmiesRatings){
							list = self.nonTeamArmiesRatings;

							list = list.filter(function(r){
								return r.isRated == self.isRated &&
									(self.selectedFaction == '0' || r.faction._id == self.selectedFaction);
							});

							
					
					}
					return list;
				}

			},

			created: function(){
					this.fetchFactions();
					this.fetchTeam();
				  this.fetchRatings();
				  this.fetchArmies();
			},

			methods: {
				fetchTeam() {
					this.axios.get(teamUri).then((response) => {
						this.team = response.data;
					});
				},
				fetchFactions() {
					this.axios.get('/factions').then((response) => {
							this.factions = [{_id: '0', name: 'All Factions'}];
							this.factions = this.factions.concat(response.data);

					});
				},
				fetchRatings() {
					this.axios.get('/ratings').then((response) => {
							this.ratings = response.data;

					});
				},
				fetchArmies() {
						this.axios.get('/armies').then((response) => {
							  response.data.forEach(function(a){
									a.isRated = false;
									a.rating = 0;
								})
								this.armies = response.data;
						});
				},

				updateList: function(id){
					this.selectedTeamArmy = id;
				},
				
				updateNonTeamArmiesRatings: function(){
					var self = this;
					var list = [];
					if (this.ratings.length > 0){
						var teamArmyRating = this.ratings.find(function (r){
							return r.team_army._id == self.selectedTeamArmy;
						});
						
						if (teamArmyRating){
							list = teamArmyRating.rated_armies;
						}
					}
					
					if (this.nonTeamArmiesRatings.length > 0){
						this.nonTeamArmiesRatings.forEach(function(army){
							var ratedArmy = list.length > 0 ? list.find(function(a){
								return a.army._id == army._id;
							}) : null;
							
							army.isRated = ratedArmy != null;
							army.rating = ratedArmy ? ratedArmy.rating : 0;

						});
					}
				},
				
			}
    }
</script>