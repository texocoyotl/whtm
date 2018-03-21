<template>
	<v-container fluid grid-list-xl text-xs-center>
		<v-layout row>
			<v-flex xs12 sm6 offset-sm3>

				<div v-if="teamNames">
					<v-card>

                    <v-toolbar color="indigo" dark>
                  <v-toolbar-title>Registered Teams</v-toolbar-title>
                </v-toolbar>
                <v-list>
                  <v-list-tile avatar v-for="team in teamNames" :key="team._id" @click="openPasswordDialog(team._id)">

                    <v-list-tile-content>
                      <v-list-tile-title v-text="team.name"></v-list-tile-title>
                    </v-list-tile-content>
                    <v-list-tile-action>
                      <v-icon color="pink">keyboard_arrow_right</v-icon>
                    </v-list-tile-action>
                  </v-list-tile>
                </v-list>

					</v-card>
				</div>

                <v-dialog v-model="passwordDialog">
					<v-card>
                         
                        
						<v-form v-model="valid" ref="form" lazy-validation @submit.prevent="login">
							<v-card-text>
								<v-text-field ref="passwordField" label="Password" v-model="password" :type="'password'" required :rules="[v => !!v || 'Password is required']"></v-text-field>
							</v-card-text>
                
                               
							<v-card-actions>
                                
                                <v-btn flat @click.native="login" :disabled="!valid">
                                    <v-progress-circular v-if="logingIn" indeterminate color="primary"></v-progress-circular>
                                    <span v-if="!logingIn">Login</span>
                                </v-btn>
                                

                                
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
                valid: true,
				teamNames: [],
				passwordDialog: false,
                logingIn: false,
                
                selectedTeamId: null,
				password: null
            

                
			}
		},
         computed: {
            token: function(){
                return this.$store.getters.token;
            },
            teamId: function(){
                return this.$store.getters.teamId;
            }
        },

		created: function() {
            this.fetchTeamNames();
		},
        
        watch: {
          passwordDialog: function(){
              this.$nextTick(this.$refs.passwordField.focus);
          }  
        },

		methods: {
            fetchTeamNames() {
					this.axios.get('/team-names').then((response) => {
						this.teamNames = response.data;
					});
				},
            openPasswordDialog(teamId) {
                    this.password = null;
                    this.$refs.form.reset()
					this.passwordDialog = true;
                    this.selectedTeamId = teamId;
                
                    
				},
            login(){

                 if (this.$refs.form.validate()) {
                    this.logingIn = true;
                    
                    this.axios.post('/authenticate', {team_id: this.selectedTeamId, password: this.password})
                        .then((response) => {
                            //console.log(response.data);
                            this.logingIn = false;
                            if (!response.data.success){
                                alert(response.data.message);
                                
                            } else {
                                this.passwordDialog = false;
                                this.$store.commit("updateToken", response.data.token);
                                this.$store.commit("updateTeamId", this.selectedTeamId);
                                
                                this.$router.push('Dashboard')
                            }
                        })
                         .catch(function(error) {
                            //console.log('Error', error.message);
                            //console.log(error.config);
                            this.logingIn = false;
                        
                            alert("Can't stablish connection, try again later please.");
                        
                            
                        });
                    
                 }
            }

			
			  

		}
	}

</script>
