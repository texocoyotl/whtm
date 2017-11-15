<template>

	<v-container fluid class="mb-5">
		<h2>{{ team.name }}</h2>
		<v-layout row wrap>
			<v-flex xs6 wrap>
				
				<chart style="width: auto" :options="coverageChartOptions" auto-resize></chart>
				
			</v-flex>
			<v-flex xs6>
				

				<v-expansion-panel popout>
					<v-expansion-panel-content v-for="player in playerRatingTotals" :key="player._id" @input="selectPlayer(player._id)">
						<div slot="header">
							<v-layout row wrap>
								{{player.name}}
								<v-spacer></v-spacer>

								<v-chip :color="colors[(player.ratingsAvg / 25).toFixed(0)]" text-color="black">Coverage: {{player.ratingsAvg.toFixed(2)}}%</v-chip>
								
							</v-layout>

						</div>
						<v-card>
							<v-card-text class="grey lighten-3">
							<v-layout row wrap>
								<div v-for="rating, i in player.ratingTotals" key="i">
									<v-chip :color="colors[i]" text-color="black">
										<v-icon left color="colors[i]">
											{{ratingIcons[i]}}
										</v-icon>
										<span class="title">{{rating}}</span>
									</v-chip>
								</div>
								</v-layout>
							</v-card-text>
						</v-card>
					</v-expansion-panel-content>
				</v-expansion-panel>

			</v-flex>

		</v-layout>

		<v-layout class="mt-5" row wrap>
			<v-flex xs12>
				<h4>Rating Analysis</h4>
				<v-subheader>Filter by:</v-subheader>
				<v-select :items="factions" v-model="selectedFaction" single-line solo item-text='name' item-value="_id">
				</v-select>
			</v-flex>
		</v-layout>

		<v-layout class="mt-5" row wrap>
			<v-flex xs12>
				<v-expansion-panel expand popout>
					<v-expansion-panel-content v-for="army in ratedArmies" :key="army._id">
						<div slot="header">
							<v-layout row wrap>
								
								{{army.name}}
								
								<v-spacer></v-spacer>
								
								<div v-for="rating, i in armyRatingTotals[army._id].ratingTotals" key="i">
									<span class="ma-1" v-for="j in rating">
										<v-icon large :color="colors[i]">
											{{ratingIcons[i]}}
										</v-icon>
									</span>
								</div>
								
								<v-chip :color="colors[(armyRatingTotals[army._id].coverage / 25).toFixed(0)]" text-color="black">Coverage: {{armyRatingTotals[army._id].coverage.toFixed(2)}}%</v-chip>
							</v-layout>
						</div>
						<v-card>
							<v-card-text class="grey lighten-3">
							
							<v-chip v-for="rating in army.ratings" :color="colors[rating.rating]" text-color="black"> {{rating.armyName}}</v-chip>
							
							</v-card-text>
						</v-card>
					</v-expansion-panel-content>
				</v-expansion-panel>
			</v-flex>
		</v-layout>
		<pre>{{selectedPlayer}}</pre>
	</v-container>
</template>

<script>
	var util = require('util');
	var teamUri = '/team/59f9fd9c08e0bd3934d8f874';
	import ECharts from 'vue-echarts/components/ECharts.vue'
	import 'echarts/lib/chart/radar'
	import 'echarts/lib/chart/bar'
	import 'echarts/lib/component/tooltip'
	import 'echarts/lib/component/legend'
	import 'echarts/lib/component/title'

	export default {
		components: {
			chart: ECharts
		},

		data: function() {
			return {
				colors: ['red', 'orange', 'yellow', 'light-green', 'green'],
				chartColors: ['#f80f0f', '#2700ff', '#ffff00', '#4eff00', '#9300ff'],
				ratingIcons: ['thumb_down', 'thumb_down', 'thumbs_up_down', 'thumb_up', 'thumb_up'],
				team: {},
				factions: [],
				armies: [],
				ratings: [],
				selectedFaction: '0',
				selectedPlayer: null, //'5a0606ee4de4344bf0f5db51'


			}

		},

		created: function() {
			this.fetchFactions();
			this.fetchTeam();
			this.fetchRatings();
			this.fetchArmies();
		},

		computed: {

			factionsLookUp: function() {
				var lookup = {};
				this.factions.forEach(function(a) {
					lookup[a._id] = a;
				});
				return lookup;
			},
			
			armiesLookUp: function() {
				var lookup = {};
				this.armies.forEach(function(a) {
					lookup[a._id] = a;
				});
				return lookup;
			},
			
			teamArmiesLookUp: function(){
				var self = this;
				var lookup = {};
				if (self.team.players){
				self.team.players.forEach(function(p){
					p.armies.forEach(function(a){
						lookup[a._id] = p;
					})
				})
				}
				return lookup;
			},
			
			playerRatingTotals: function(){
				var self = this;
				var playersHash = {};
				
				self.ratings.forEach(function(ratingGroup){
					var playerEntry;
					
						var owner = self.teamArmiesLookUp[ratingGroup.team_army._id];
						if (owner){
							ratingGroup.rated_armies.forEach(function(ratedArmy){

								if (self.selectedFaction == '0' || self.selectedFaction == ratedArmy.army.faction){

									if (!playersHash[owner._id]){
										var ratingTotals = [0, 0, 0, 0, 0];
											ratingTotals[ratedArmy.rating] = 1;
											playerEntry = {
												_id: owner._id,
												name: owner.name,
												ratingTotals: ratingTotals,
												ratingsSum: ratedArmy.rating,
												ratingsCount: 1,
												ratingsAvg: ratedArmy.rating * 25
											}
											playersHash[owner._id] = playerEntry;
									} else {
										playerEntry = playersHash[owner._id];
										playerEntry.ratingTotals[ratedArmy.rating]++;
										playerEntry.ratingsSum += ratedArmy.rating;
										playerEntry.ratingsCount++;
										playerEntry.ratingsAvg = playerEntry.ratingsSum * 25/ playerEntry.ratingsCount;
									}


								}
							});

						}
					});
					var list = [];
					Object.keys(playersHash).forEach(function(key){
						list.push(playersHash[key]);
					});
				
      
        return list;
			},
			
			coverageChartRatingTotals: function(){
				var self = this;
				var playersHash = {};
				
				self.ratings.forEach(function(ratingGroup){
					var playerEntry;
					var detailsEntry;
					
					var owner = self.teamArmiesLookUp[ratingGroup.team_army._id];
					if (owner && (self.selectedPlayer == null || self.selectedPlayer == owner._id)){ 
						if (!playersHash[owner._id]){
							playerEntry = {
								player: owner.name,
								detailsHash: {}
							};
							playersHash[owner._id] = playerEntry;
						} else {
							playerEntry = playersHash[owner._id];
						}
						
						ratingGroup.rated_armies.forEach(function(ratedArmy){
							
							if (self.selectedFaction == '0' || self.selectedFaction == ratedArmy.army.faction){
								
								var key;
								if (self.selectedFaction == '0'){
									key = ratedArmy.army.faction;
									name = self.factionsLookUp[ratedArmy.army.faction].name;
								} else { 
									key = ratedArmy.army._id;
									name = ratedArmy.army.name;
								}
									if (!playerEntry.detailsHash[key]){
										var ratingTotals = [0, 0, 0, 0, 0];
										ratingTotals[ratedArmy.rating] = 1;
										detailsEntry = {
											name: name,
											ratingTotals: ratingTotals,
											ratingsSum: ratedArmy.rating,
											ratingsCount: 1,
											ratingsAvg: ratedArmy.rating
										}
										playerEntry.detailsHash[key] = detailsEntry;
									} else {
										detailsEntry = playerEntry.detailsHash[key];
										detailsEntry.ratingTotals[ratedArmy.rating]++;
										detailsEntry.ratingsSum += ratedArmy.rating;
										detailsEntry.ratingsCount++;
										detailsEntry.ratingsAvg = detailsEntry.ratingsSum / detailsEntry.ratingsCount++;
									}

							}
						});
						playerEntry.details = [];
						Object.keys(playerEntry.detailsHash).forEach(function(key){
							playerEntry.details.push(playerEntry.detailsHash[key]);
						});
					  playerEntry.detailsHash = null;
					}
				});
				var list = [];
        Object.keys(playersHash).forEach(function(key){
          list.push(playersHash[key]);
        });
      
        return list;
			},
			
			coverageChartSets: function(){
				var self = this;
				var list = [];
				self.coverageChartRatingTotals.forEach(function(p){
					list.push(p.player);
				});
				return list;
			},
			
			coverageChartSeries: function(){
				var self = this;
				var list = [];
				
				self.coverageChartRatingTotals.forEach(function(p, k){
					var valuesList = [];
					p.details.forEach(function(d){
						valuesList.push(d.ratingsAvg * 25);	
					});
					if (valuesList.length == 0) valuesList.push(0);
					
					var serie = {
                type: 'radar',
                areaStyle: {normal: {opacity: 0.5}},
              itemStyle: {
                normal: {
                    color: self.chartColors[k]
                }
            },
                data : [{
									name: p.player,
									value: valuesList
								}]
            }
					
					list.push(serie);
				});
				return list;
			},
			
			coverageChartIndicators: function(){
        var self = this;
        var hash = {};
        var data = [];
        
        self.coverageChartRatingTotals.forEach(function(p){
          p.details.forEach(function(d){
						var name = d.name;
            if (!hash[name])
              hash[name] = true;
          });
        });
        
        Object.keys(hash).forEach(function(key){
            data.push({
              name: key,
              max: 100
            
          });
        });
				
				if (data.length == 0) data.push('No data');

        return data;
      },
			
			coverageChartOptions: function(){
        var self = this;
        return {
            title: {
                text: 'Coverage',
							  textStyle: {
									align: 'center'
								}
            },
            tooltip: {},
            legend: {
							top: 1,
              padding: 5,
                data: self.coverageChartSets
            },
            radar: {
                shape: 'circle',
                radius: '60%',
                name: {
                    textStyle: {
                        color: '#fff',
                        backgroundColor: '#999',
                        borderRadius: 3,
                        padding: [3, 5]
                   }
                },
                indicator: self.coverageChartIndicators,
                axisLabel: {show: true}
            },
            series: self.coverageChartSeries
        }
      },
							
			
			ratedArmies: function(){
        var self = this;
        var ratingsHash = {};
				
        self.ratings.forEach(function(ratingGroup){
					
					if (self.selectedPlayer == null || ratingGroup.team_army.player == self.selectedPlayer){
					
					ratingGroup.rated_armies.forEach(function(ratedArmy){
						var entry;
						
						if (self.selectedFaction == '0' || self.selectedFaction == ratedArmy.army.faction){
						
							if (ratingsHash[ratedArmy.army._id]){
								entry = ratingsHash[ratedArmy.army._id];
								entry.ratings.push({
									player: ratingGroup.team_army.player,
									armyName: ratingGroup.team_army.name,
									rating: ratedArmy.rating
								});
							} else {
								entry = {
									_id: ratedArmy.army._id,
									name: ratedArmy.army.name,
									faction: ratedArmy.army.faction,
									url: ratedArmy.army.build_url,
									ratings: [{
										player: ratingGroup.team_army.player,
										armyName: ratingGroup.team_army.name,
										rating: ratedArmy.rating
									}]
								};
								ratingsHash[ratedArmy.army._id] = entry;
							}
						}
					});
					
					}
				});
				

        var list = [];
        Object.keys(ratingsHash).forEach(function(key){
          list.push(ratingsHash[key]);
        });
      
        return list;
      
		},
			
		armyRatingTotals: function(){
			var self = this;
			var hash = {};
			
			self.ratedArmies.forEach(function(army){
				army.ratings.forEach(function(rating){
					var entry;
					if (hash[army._id]){
						entry = hash[army._id];
						entry.ratingTotals[rating.rating]++;
						if (rating.rating > entry.ratingsMax) 
							entry.ratingsMax = rating.rating;
						entry.ratingsSum += rating.rating;
						entry.ratingsCount++;
					} else {
						entry = {
							ratingTotals: [0, 0, 0, 0, 0]
						};
						entry.ratingTotals[rating.rating]++;
						entry.ratingsMax = rating.rating;
						entry.ratingsSum = rating.rating;
						entry.ratingsCount = 1;
						hash[army._id] = entry;
					}
					entry.coverage = entry.ratingsSum * 25 / entry.ratingsCount;
					entry.ratingsWeight = Number(entry.ratingTotals[4] + '.' + entry.ratingTotals[3] + entry.ratingTotals[2] + entry.ratingTotals[1] + entry.ratingTotals[0]);
				});
			});
			
			return hash;
		},
			
			
		
			
		

		

		},

		methods: {

			fetchTeam() {
					this.axios.get(teamUri).then((response) => {
						this.team = response.data;
					});
				},
				fetchFactions() {
					this.axios.get('/factions').then((response) => {
						this.factions = [{
							_id: '0',
							name: 'All Factions'
						}];
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
						this.armies = response.data;
					});
				},
				selectPlayer(id){
					if (this.selectedPlayer == id) this.selectedPlayer = null;
					else this.selectedPlayer = id;
				}


		}
	}
</script>