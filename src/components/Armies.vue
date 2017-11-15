<template>
    <div>
        <h2>Armies</h2>
        <div class="row">
            <v-btn color="primary" dark @click.stop="openArmyDialog">Add</v-btn>
        </div>
        <br />
		
        <v-data-table v-bind:headers="headers" v-bind:items="armies" v-bind:pagination.sync="pagination" item-key="_id" class="elevation-1">
            <template slot="headers" slot-scope="props">
                <tr>
                    <th v-for="header in props.headers" :key="header.text" :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']" @click="changeSort(header.value)">
                        <v-icon>arrow_upward</v-icon> {{ header.text }} </th>
                </tr>
            </template>
            <template slot="items" slot-scope="props">
                <tr>
                    <td class="text-xs-center">{{ props.item.name }}</td>
                    <td class="text-xs-center" v-if="props.item.faction">{{ props.item.faction.name }}</td>
                    <td class="text-xs-left">{{ props.item.notes }}</td>
					<td class="text-xs-center">
						<a v-if="props.item.build_url" target="_blank" :href="props.item.build_url">{{ props.item.build_url }}</a>
					</td>
                    <td class="text-xs-center">
                        <v-btn color="accent" dark @click.stop="openArmyDialogForEdit(props.item)">Edit</v-btn>
                        <v-btn color="error" dark @click.stop="deleteArmy(props.item._id)">Delete</v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table>
        <v-dialog v-model="armyDialog" persistent>
            <v-card>
                <form>
                    <v-card-title> Create An Item </v-card-title>
                    <v-card-text>
                        <v-text-field label="Name" hint="Short description of the army list" v-model="selectedArmy.name" required v-validate="'required'" required :error-messages="errors.collect('name')"
                           data-vv-name="name"></v-text-field>
                        <v-select v-model="selectedArmy.faction" label="Faction" autocomplete required :items="factions" item-text='name' item-value="_id" v-validate="'required'"
                       data-vv-name="faction"
                       :error-messages="errors.collect('faction')"></v-select>
						<v-text-field label="URL" hint="External link to army list" v-model="selectedArmy.build_url" v-validate="'url'"  :error-messages="errors.collect('build_url')"
                           data-vv-name="build_url"></v-text-field>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click.native="armyDialog = false">Close</v-btn>
                        <v-btn @click.native="saveArmy">Save</v-btn>
                    </v-card-actions>
                </form>
            </v-card>
        </v-dialog>

    </div>

</template>
<script>
	const util = require('util');
    var armiesUri = '/armies'
    module.exports = {
        data: function() {
            return {
                armyDialog: false,
                factions: [],
                armies: [],
                selectedArmy: {},
                pagination: {
                    sortBy: 'faction'
                },
                headers: [{
                    text: 'Name',
                    value: 'name'
                }, {
                    text: 'Faction',
                    value: 'faction'
                }, {
                    text: 'Notes',
                    value: 'notes'
                }, {
                    text: 'Build',
                    value: 'build'
                }, {
                    text: 'Options',
                    value: 'options'
                }]
            }
        },
        created: function() {
            this.fetchArmies();
            this.fetchFactions();
        },
        methods: {
            fetchArmies() {
                this.axios.get(armiesUri).then((response) => {
                    this.armies = response.data;
                });
            }, fetchFactions() {
                this.axios.get('/factions').then((response) => {
                    this.factions = response.data;
                });
            }, deleteArmy(id) {
                this.axios.delete('/army/' + id).then((response) => {
                    this.fetchArmies();
                }).catch(function(error) {
                    console.log('Error', error.message);
                    console.log(error.config);
                });
            }, changeSort(column) {
                if (this.pagination.sortBy === column) {
                    this.pagination.descending = !this.pagination.descending
                } else {
                    this.pagination.sortBy = column
                    this.pagination.descending = false
                }
            }, openArmyDialog() {
                this.armyDialog = true;
                this.selectedArmy = {};
                this.$validator.reset();
            }, openArmyDialogForEdit(item) {
                this.armyDialog = true;
                this.selectedArmy = {
					_id: item._id,
					name: item.name,
					faction: item.faction._id,
					build_url: item.build_url
				}
                this.$validator.reset();
            }, saveArmy() {
                this.$validator.validateAll().then((result) => {
                    if (result) {
						if (this.selectedArmy._id){
							this.axios.post('/army/' + this.selectedArmy._id, this.selectedArmy).then((response) => {
								this.armyDialog = false;
								this.fetchArmies();
							})
						} else {
							this.axios.post(armiesUri, this.selectedArmy).then((response) => {
								this.armyDialog = false;
								this.fetchArmies();
							})
						}
                        return;
                    }
                });
            }
        }
    }
</script>