<template>
    <v-container fluid grid-list-xl text-xs-center mb-5>
        <v-layout column wrap>
            <v-flex xs10 offset-xs1>
                <div>
                    <div class="row">
                        <v-btn color="primary" dark @click.stop="openArmyDialog">Add</v-btn>
                    </div>
                    <br />

                    <v-data-table :headers="headers" :items="armies" :pagination.sync="pagination" item-key="name" class="elevation-1" hide-actions :total-items="rows">
                        <template slot="headers" slot-scope="props">
                            <tr>
                                <th v-for="header in props.headers" :key="header.text" :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']" @click="changeSort(header.value)">
                                    <v-icon>arrow_upward</v-icon>{{ header.text }}</th>
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
                                <v-card-title>Create An Army List</v-card-title>
                                <v-card-text>
                                    <v-text-field label="Name" hint="Short description of the army list" v-model="selectedArmy.name" required v-validate="'required'" required :error-messages="errors.collect('name')" data-vv-name="name"></v-text-field>
                                    <v-select v-model="selectedArmy.faction" label="Faction" autocomplete required :items="factions" item-text='name' item-value="_id" v-validate="'required'" data-vv-name="faction" :error-messages="errors.collect('faction')"></v-select>
                                    <v-text-field label="URL" hint="External link to army list" v-model="selectedArmy.build_url" v-validate="'url'" :error-messages="errors.collect('build_url')" data-vv-name="build_url"></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-btn @click.native="armyDialog = false">Close</v-btn>
                                    <v-btn @click.native="saveArmy">Save</v-btn>
                                </v-card-actions>
                            </form>
                        </v-card>
                    </v-dialog>

                </div>

            </v-flex>
        </v-layout>

    </v-container>
</template>
<script>
    const util = require('util');
    module.exports = {
        data: function() {
            return {
                armyDialog: false,
                factions: [],
                armies: [],
                selectedArmy: {},
                rows: 0,
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
            if (!this.teamId) {
                this.$router.push('Teams');
            } else {
                this.fetchArmies();
                this.fetchFactions();
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
        methods: {
            changeSort(column) {
                if (this.pagination.sortBy === column) {
                    this.pagination.descending = !this.pagination.descending
                } else {
                    this.pagination.sortBy = column
                    this.pagination.descending = false
                }
            },
            fetchArmies() {
                this.axios.get('/armies/' + this.teamId, {
                    headers: {
                        'x-access-token': this.token
                    }
                }).then((response) => {
                    this.armies = response.data.filter(army => army.player == null);
                    this.rows = this.armies.length;
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
            deleteArmy(id) {
                this.axios.delete('/army/' + id, {
                    headers: {
                        'x-access-token': this.token
                    }
                }).then((response) => {
                    this.fetchArmies();
                }).catch(function(error) {
                    console.log('Error', error.message);
                    console.log(error.config);
                });
            },
            openArmyDialog() {
                this.armyDialog = true;
                this.selectedArmy = {
                    team: this.teamId
                };
                this.$validator.reset();
            },
            openArmyDialogForEdit(item) {
                this.armyDialog = true;
                this.selectedArmy = {
                    _id: item._id,
                    name: item.name,
                    faction: item.faction._id,
                    build_url: item.build_url
                }
                this.$validator.reset();
            },
            saveArmy() {
                this.$validator.validateAll().then((result) => {
                    if (result) {
                        if (this.selectedArmy._id) {
                            this.axios.post('/army/' + this.selectedArmy._id, this.selectedArmy, {
                                headers: {
                                    'x-access-token': this.token
                                }
                            }).then((response) => {
                                this.armyDialog = false;
                                this.fetchArmies();
                            })
                        } else {
                            this.axios.post('/armies', this.selectedArmy, {
                                headers: {
                                    'x-access-token': this.token
                                }
                            }).then((response) => {
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