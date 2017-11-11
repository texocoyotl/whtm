<template>
    <div>
      
    <v-dialog v-model="dialog2">
      <v-card> 
        <form>
          <v-card-title>
              Create An Item
            </v-card-title>
           <v-card-text>
             <v-text-field label="Name" hint="Name of the item" v-model="item.name" required></v-text-field>
             <v-select
                v-model="item.price"      
                label="Price"
                required
                :items="['10', '20', '30', '40']"
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
            <v-btn color="primary" dark @click.stop="dialog2 = true">Add</v-btn>
          </div>
        </div><br />
      
      <v-data-table
        v-bind:headers="headers"
        v-bind:items="items"
        v-bind:pagination.sync="pagination"
        item-key="_id"
        class="elevation-1"
      >
        <template slot="headers" slot-scope="props">
      <tr>
        <th v-for="header in props.headers" :key="header.text"
          :class="['column sortable', pagination.descending ? 'desc' : 'asc', header.value === pagination.sortBy ? 'active' : '']"
          @click="changeSort(header.value)"
        >
          <v-icon>arrow_upward</v-icon>
          {{ header.text }}
        </th>
      </tr>
    </template>
        
      <template slot="items" slot-scope="props">
        <tr>
        <td class="text-xs-right">{{ props.item.name }}</td>
        <td class="text-xs-right">{{ props.item.faction }}</td>
        <td class="text-xs-right"></td>
        <td class="text-xs-right"></td>
          </tr>
      </template>
    </v-data-table>

        
    </div>
</template>

<script>

module.exports = {
    data: function(){
        return{
          item:{},
          dialog2: false,      
          pagination: {
              sortBy: 'name'
            },
          headers: [
          { text: 'Name', value: 'name' },
          { text: 'Price', value: 'price' },
          { text: 'Options', value: '' }
                ],
          items: []
            }
        },

        created: function()
        {
            this.fetchItems();
        },

        methods: {
            addItem(){
                let uri = 'http://localhost:4000/add';
                this.axios.post(uri, this.item).then((response) => {
                  this.$router.push({name: 'DisplayItem'});
                  this.dialog2 = false;
                  this.fetchItems();
                })
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
              let uri = 'http://localhost:4000/delete/'+id;
              this.items.splice(id, 1);
              this.axios.get(uri);
              this.fetchItems();
            },
          changeSort (column) {
            if (this.pagination.sortBy === column) {
              this.pagination.descending = !this.pagination.descending
            } else {
              this.pagination.sortBy = column
              this.pagination.descending = false
            }
          }
        }
    }
</script>