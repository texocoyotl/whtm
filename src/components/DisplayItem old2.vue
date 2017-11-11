<template>
    <div>
      
      <v-list>
          <v-list-tile v-for="i in items" v-bind:key="i._id" @click="deleteItem(i._id)">
            <v-list-tile-content>
              <v-list-tile-title v-text="i.name"></v-list-tile-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <v-icon color="accent">delete</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </v-list>
    
      
      
      
      <v-dialog v-model="dialog2">
      <v-card> 
        <form ref="form" v-model="valid" lazy-validation>
          <v-card-title>
              Create An Item
            </v-card-title>
           <v-card-text>
             <v-text-field label="Name" hint="Name of the item" v-model="item.name" v-validate="'required'" required :error-messages="errors.collect('name')"
                           data-vv-name="name"></v-text-field>
             <v-select
                v-model="item.price"      
                label="Price"
                required
                :items="['10', '20', '30', '40']"
                autocomplete
               v-validate="'required'"
                       data-vv-name="price"
                       :error-messages="errors.collect('price')"
              ></v-select>
             </v-card-text>
          <v-card-actions>
            <v-btn @click.native="dialog2 = false">Close</v-btn>
            <v-btn @click.native="addItem">Save</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

        <div class="row">
          <div class="col-md-10"></div>
          <div class="col-md-2">
            <v-btn color="primary" dark @click.stop="openAddDialog">Add</v-btn>
          </div>
        </div>

    </div>
</template>

<script>
  
var util = require('util');

module.exports = {
    data: function(){
        return{
          valid: false,
          item:{},
          dialog2: false,      
          items: []
        }
            
        },

        created: function()
        {
            this.fetchItems();
        },

        methods: {
            openAddDialog(){
              this.dialog2 = true;
              this.item = {};
              this.$validator.reset();
            },
            addItem(){
              
              this.$validator.validateAll().then((result) => {
                if (result) {
                  let uri = 'http://localhost:4000/add';
                  this.axios.post(uri, this.item).then((response) => {
                    this.$router.push({name: 'DisplayItem'});
                    this.dialog2 = false;
                    this.fetchItems();
                  })
                  return;
                }
              });
              
              
            },
            fetchItems()
            {
              let uri = 'http://localhost:4000/';
              this.axios.get(uri).then((response) => {
                  this.items = response.data;
              });
            },
            deleteItem(id)
            {
              alert(id);
              let uri = 'http://localhost:4000/delete/'+id;
              this.items = this.items.filter(function (item){
                return item._id !== id;
              })
              this.axios.get(uri);
            },
          changeSort (column) {
            if (this.pagination.sortBy === column) {
              this.pagination.descending = !this.pagination.descending
            } else {
              this.pagination.sortBy = column
              this.pagination.descending = false
            }
          },
          seeItem(item_id){
            alert(item_id);
          }
        }
    }
</script>