<template>
	<v-container fluid grid-list-xl text-xs-center>
		<v-layout column wrap>
			<v-flex xs10 offset-xs1>
				<div v-if="team.players">
					<v-card v-for="player in team.players" :key="player._id" wrap>

						<v-card-title primary-title>
							<h3 class="headline mb-0">{{ player.name }}</h3>
							<v-spacer></v-spacer>
							<v-btn icon @click="deletePlayer(player)">
								<v-icon>delete</v-icon>
							</v-btn>
						</v-card-title>


							<v-chip v-if="player.armies" v-for="i in player.armies" key="i._id" label close color="primary" text-color="white" @click="openArmyDialogForEdit(player, i)" @input="deleteArmy(player, i)">
								<v-avatar>
									<v-icon>playlist_add_check</v-icon>
								</v-avatar>
								{{ i.name }}
							</v-chip>

							<v-btn v-if="!player.armies || player.armies.length < 2" color="primary" @click="openArmyDialog(player)">Add List</v-btn>

					</v-card>
				</div>


				<v-btn color="primary" dark @click.stop="showPlayerForm" v-if="!newPlayer">Add Player</v-btn>
				<form v-else>
					<v-text-field label="Name" hint="Name of the player" v-model="playerName" required @input="$v.playerName.$touch()" :error-messages="nameErrors"></v-text-field>
					<v-btn @click.native="addPlayer">Save</v-btn>
					<v-btn @click.native="newPlayer = null">Cancel</v-btn>
				</form>

				<v-dialog v-model="armyDialog" persistent>
					<v-card>
						<form v-if="army">
							<v-card-title>Create An Army List</v-card-title>
							<v-card-text>
								<v-text-field label="Name" hint="Short description of the army list" v-model="army.name" required v-validate="'required'" required :error-messages="errors.collect('name')" data-vv-name="name" data-vv-scope="armyForm"></v-text-field>
								<v-select v-model="army.faction" label="Faction" required autocomplete :items="factions" item-text='name' item-value="_id" v-validate="'required'" data-vv-name="faction" :error-messages="errors.collect('faction')" data-vv-scope="armyForm"></v-select>
								<v-text-field label="URL" hint="External link to army list" v-model="army.build_url" v-validate="'url'" :error-messages="errors.collect('url')" data-vv-name="url" data-vv-scope="armyForm"></v-text-field>
							</v-card-text>
							<v-card-actions>
								<v-btn @click.native="armyDialog = false">Close</v-btn>
								<v-btn @click.native="saveArmy">Save</v-btn>
							</v-card-actions>
						</form>
					</v-card>
				</v-dialog>


			</v-flex>
		</v-layout>
		
	</v-container>
</template>

<script>
import { required, minLength } from 'vuelidate/lib/validators'

	var util = require('util');
	var teamUri = '/team/5aaf3bff659b2734587e8cc4';
	

	export default {
		validations: {
				playerName: {
					required
				}
		},
		
		data: function() {
			return {
				factions: [],
				newPlayer: null,
				armyDialog: false,
				team: {},
				army: null,
				playerName: ''
			}
		},
			
		computed: {
			nameErrors () {
        const errors = []
        if (!this.$v.playerName.$dirty) return errors
        !this.$v.playerName.required && errors.push('Name is required.')
        return errors
      }
		},

		created: function() {
			this.fetchFactions();
			this.fetchTeam();
		},

		methods: {
			fetchFactions() {
					this.axios.get('/factions').then((response) => {
						this.factions = response.data;
					});
				},
			
			  showPlayerForm(){
					this.newPlayer = {};
					this.playerName = '';
					this.$v.$reset();
				},

				addPlayer() {
					this.$v.$touch();
					if (!this.$v.playerName.$invalid){
						this.newPlayer = {name: this.playerName};
						this.team.players.push(this.newPlayer);
							this.saveTeam(() => {
								this.newPlayer = null;
							});
					}
				},
			  
				fetchTeam() {
					this.axios.get(teamUri, {
                        headers: {
                            'x-access-token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYWYzYmZmNjU5YjI3MzQ1ODdlOGNjNCIsImlhdCI6MTUyMTUwMDk1MSwiZXhwIjoxNTIxNTg3MzUxfQ.lgWo1_OOvQQYwn0FfK_z5DO4k9YEFHkWT73G6I2u0co'
                        }}).then((response) => {
						this.team = response.data;
					}).catch(function(error) {
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
				deletePlayer(player) {
					this.team.players = this.team.players.filter(function(p) {
						return player._id !== p._id;
					})
					this.saveTeam(function(){});
				},
				openArmyDialog(player) {
					this.$validator.reset();
					this.armyDialog = true;
					this.$validator.reset();
					this.army = {
						team: this.team._id,
						player: player._id
					};
					
				},
				openArmyDialogForEdit(player, army) {
					this.$validator.reset();
					this.armyDialog = true;
					this.army = {
						_id: army._id,
						name: army.name,
						faction: army.faction,
						build_url: army.build_url,
						team: this.team._id,
						player: player._id
					}
				},
				saveArmy() {
					this.$validator.validateAll('armyForm').then((result) => {
						if (result) {
							if (this.army._id) {
								this.axios.post('/army/' + this.army._id, this.army).then((response) => {
									this.armyDialog = false;
									this.fetchTeam();
								})
							} else {
								this.axios.post('/armies', this.army).then((response) => {
									this.armyDialog = false;
									this.fetchTeam();
								})
							}
							return;
						}
					});
				}, deleteArmy(player, army) {
					this.axios.delete('/army/' + army._id, {player: player._id}).then((response) => {
						this.fetchTeam();
					}).catch(function(error) {
						console.log('Error', error.message);
						console.log(error.config);
					});
				}

		}
	}

</script>
