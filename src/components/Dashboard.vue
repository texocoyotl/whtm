<template>
    <div>
      <h2>{{ team.name }}</h2>
      <v-list two-line>
          <v-list-tile v-for="player in playersList()" v-bind:key="player._id" @click="selectedPlayer=player">
            <v-list-tile-content>
                <v-list-tile-title>{{ player.name }}</v-list-tile-title>
				<v-list-tile-sub-title>{{ player.armiesSummary }}</v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action v-if="player.armies.length<2">
              <v-icon color="accent" @click="openArmiesDialog(player)">playlist_add</v-icon>
            </v-list-tile-action>
			  <v-list-tile-action @click="deletePlayer(player)">
              <v-icon color="accent">delete</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
    
      <div class="row">
          <v-btn color="primary" dark @click.stop="showPlayerForm" v-if="!newPlayer">Add</v-btn>
          <form ref="form" v-else v-model="form" lazy-validation>
            <v-text-field hint="Player's name" v-model="newPlayer.name" v-validate="'required'" required :error-messages="errors.collect('name')"
            data-vv-name="name"></v-text-field>
            <v-btn @click.native="addPlayer">Save</v-btn>
			<v-btn @click.native="newPlayer=null">Cancel</v-btn>
        </form>
      </div>
		
	<v-dialog v-model="armiesDialog">
 <v-card color="grey lighten-4" flat>
    <v-card-text>
     
		<v-select
              v-bind:items="armies"
              v-model="selectedArmy"
		      return-object
			  label="Select an army list"
              autocomplete
			  item-text="name"
		      item-value="_id"
		      @select="addArmy"
            ></v-select>
 
    </v-card-text>
  </v-card>
</v-dialog>




</div>
</template>

<script>
	var util = require('util');
	var teamUri = 'team/59f3ba805c6a0900123f880c';
	var armiesUri = 'armies';

	module.exports = {
		data: function() {
			return {
				form: false,
				team: {},
				armies: [],
				newPlayer: null,
				selectedPlayer: null,
				selectedArmy: null,
				armiesDialog: false
			}

		},

		created: function() {
			this.fetchTeam();
			this.fetchArmies();
		},

		computed: {



		},

		methods: {

			fetchTeam() {

				this.axios.get(teamUri).then((response) => {
						this.team = response.data;
					})
					.catch(function(error) {
						console.log('Error', error.message);
						console.log(error.config);
					});

			},

			fetchArmies() {
				this.axios.get(armiesUri).then((response) => {
						this.armies = response.data;
					})
					.catch(function(error) {
						console.log('Error', error.message);
						console.log(error.config);
					});
			},

			saveTeam(callback) {
				this.axios.put(teamUri, this.team).then((response) => {
					this.fetchTeam();
					callback();
				}).catch(function(error) {
					console.log('Error', error.message);
					console.log(error.config);
				});
			},

			playersList: function() {
				if (this.team.players) {
					return this.team.players.map((b) => {
						if (b.armies.length > 0) {
							b.armiesSummary = b.armies.map((a) => {
								return a.name;
							}).join(', ');
						} else {
							b.armiesSummary = 'No army lists'
						}
						return b;
					});
				} else return {}
			},

			showPlayerForm() {
				this.newPlayer = {};
			},

			addPlayer() {
				this.$validator.validateAll().then((result) => {
					if (result) {
						this.team.players.push(this.newPlayer);
						this.saveTeam(() => {
							this.newPlayer = null;
						});

					}
				});
			},

			deletePlayer(player) {
				this.team.players = this.team.players.filter(function(p) {
					return player._id !== p._id;
				})
				this.saveTeam(() => {
					this.newPlayer = null;
				});
			},

			openArmiesDialog(player) {
				this.armiesDialog = true;
			},

			addArmy() {

				if (this.selectedArmy) {
					if (!this.selectedPlayer.armies) {
						this.selectedPlayer.armies = [];
					}
					this.selectedPlayer.armies.push(this.selectedArmy);

					this.saveTeam(() => {
						this.selectedArmy = null;
					});

					this.armiesDialog = false;
				}

			}


		}
	}

</script>
