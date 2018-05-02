<template>
	<v-container fluid grid-list-xl text-xs-center mb-5>
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
				<v-form v-model="validPlayerForm" ref="playerForm" lazy-validation v-else>
					<v-text-field label="Name" hint="Name of the player" v-model="playerName" required :rules="[v => !!v || 'Name is required']"></v-text-field>
					<v-btn @click.native="addPlayer">Save</v-btn>
					<v-btn @click.native="newPlayer = null">Cancel</v-btn>
				</v-form>

				<v-dialog v-model="armyDialog" persistent>
					<v-card>
						<v-form v-model="validArmyForm" ref="armyForm" lazy-validation v-if="army">
							<v-card-title>Create An Army List</v-card-title>
							<v-card-text>
								<v-text-field label="Name" hint="Short description of the army list" v-model="army.name" required :rules="[v => !!v || 'Name is required']"></v-text-field>
								<v-select v-model="army.faction" label="Faction" autocomplete :items="factions" item-text='name' item-value="_id" required :rules="[v => !!v || 'Name is required']"></v-select>
								<v-text-field label="URL" hint="External link to army list" v-model="army.build_url"></v-text-field>
							</v-card-text>
							<v-card-actions>
								<v-btn @click.native="armyDialog = false">Close</v-btn>
								<v-btn @click.native="saveArmy">Save</v-btn>
							</v-card-actions>
						</v-form>
					</v-card>
				</v-dialog>

			</v-flex>
		</v-layout>
		
	</v-container>
</template>

<script>
    var util = require('util');
    
    export default {
        data: function() {
            return {
                validPlayerForm: true,
                validArmyForm: true,
                factions: [],
                newPlayer: null,
                armyDialog: false,
                team: {},
                army: null,
                playerName: ''
            }
        },

        computed: {
            token: function() {
                return this.$store.getters.token;
            },
            teamId: function() {
                return this.$store.getters.teamId;
            }
        },

        created: function() {
            if (!this.teamId) {
                this.$router.push('Teams')
            } else {
                this.fetchTeam();
                this.fetchFactions();
            }
        },

        methods: {
            
            fetchTeam() {

                this.axios.get('/team/' + this.teamId, {
                    headers: {
                        'x-access-token': this.token
                    }
                }).then((response) => {
                    this.team = response.data;
                }).catch(function(error) {
                    console.log('Error', error.message);
                    console.log(error.config);
                });

            },

            fetchFactions() {
                this.axios.get('/factions', {
                    headers: {
                        'x-access-token': this.token
                    }
                }).then((response) => {
                    this.factions = response.data;
                });
            },

            showPlayerForm() {
                this.newPlayer = {};
                this.playerName = '';
            },

            addPlayer() {
                if (this.$refs.playerForm.validate()) {
                    this.newPlayer = {
                        name: this.playerName
                    };
                    this.team.players.push(this.newPlayer);
                    this.saveTeam(() => {
                        this.newPlayer = null;
                    });
                }
            },


            saveTeam(callback) {
                this.axios.put('/team/' + this.teamId, this.team, {
                    headers: {
                        'x-access-token': this.token
                    }
                }).then((response) => {
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
                this.saveTeam(function() {});
            },
            openArmyDialog(player) {
                this.armyDialog = true;
                this.validArmyForm = true;
                if (this.$refs.armyForm) this.$refs.armyForm.reset();
                this.army = {
                    team: this.team._id,
                    player: player._id
                };

            },
            openArmyDialogForEdit(player, army) {
                this.armyDialog = true;
                this.validArmyForm = true;
                if (this.$refs.armyForm) this.$refs.armyForm.reset();
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
                 if (this.$refs.armyForm.validate()) {
                        if (this.army._id) {
                            this.axios.post('/army/' + this.army._id, this.army, {
                                headers: {
                                    'x-access-token': this.token
                                }
                            }).then((response) => {
                                this.armyDialog = false;
                                this.fetchTeam();
                            })
                        } else {
                            this.axios.post('/armies', this.army, {
                                headers: {
                                    'x-access-token': this.token
                                }
                            }).then((response) => {
                                this.armyDialog = false;
                                this.fetchTeam();
                            })
                        }
                }
            },
            deleteArmy(player, army) {
                this.axios.delete('/army/' + army._id, {
                    headers: {
                        'x-access-token': this.token
                    }
                }).then((response) => {
                    this.fetchTeam();
                }).catch(function(error) {
                    console.log('Error', error.message);
                    console.log(error.config);
                });
            }

        }
    }
</script>