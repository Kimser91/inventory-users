<template>
<div class="inventory">
    <h1> My Inventory </h1>
    <table>
        <thead>
            <tr>
                <th v-for="head in tableHeaders" :key="head">{{ head }}</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in filteredInventory" :key="item.id" :class="getRowClass(item)"> 
                <td>{{ getStatusText(item) }}</td>
            </tr>
        </tbody>
    </table>
    <button class="generate-orders" @click="generateRequest">Generate Request</button>
</div>
</template>

<script>
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.inventoryadministrator.com/api';

export default {
    data() {
        return {
            inventory: [],
            filteredInventory: [],
            userPermissions: [],
            canSeeAll: false,
            role: '',
            itemFields: ['product_name', 'store_name', 'article_number', 'stock_quantity', 'min_threshold', 'max_stock', 'price', 'owner'],
            tableHeaders: ['ID', 'Product', 'Store', 'Article #', 'Stock', 'Min Threshold', 'Max Stock', 'Price', 'Owner', 'Status']
        };
    },
    async mounted(){
        await this.fetchUser();
        await this.fetchInventory();
    },
    methods: {
        async fetchUser()
        {
            try{
                const token = localStorage.getItem('user.token');
                const response = await axios.get (`${API_BASE_URL}/auth/user`, { headers: { Authorization: `Bearer ${token}` }});
                this.userPermissions = response.data.permissions ? JSON.parse(response.data.permissions) : [];
                this.role = response.data.role;
            }catch (error) {console.error('Error fetching user:', error);}
        },
        async fetchInventory() {
            try {
                const token = localStorage.getItem('user.token');
                const response = await axios.get(`${API_BASE_URL}/inventory`, {
                headers: { Authorization: `Bearer ${token}` }});
                this.inventory = response.data;
                this.filterInventory();
            } catch (error) { console.error('Error fetching inventory:', error);}
        },
        filterInventory() {
            this.filteredInventory = this.canSeeAll
          ? this.inventory
          : this.inventory.filter(item => this.userPermissions.includes(item.owner));
        },
        async generateRequest() {
            try {
                const token = localStorage.getItem('user.token');
                await axios.post(`${API_BASE_URL}/requests`, {}, {
                headers: { Authorization: `Bearer ${token}` }
                });
                alert('Items requested successfully!');
            } catch (error) {
                console.error('Error requesting items:', error);
                alert('Failed to request items.');
            }
        },
        getStatusText(item) {
            if (item.stock_quantity >= item.min_threshold) return 'OK';
            if (item.is_ordered) return 'Ordered';
            return 'Below';
        },
        getRowClass(item) {
            if (item.stock_quantity >= item.min_threshold) return 'ok';
            if (item.is_ordered) return 'ordered';
            return 'below';
        },
    },
}
</script>

<style scoped>
.inventory {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

thead {
  background: #007bff;
  color: white;
}

td, th {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

.ok { background: #c8f7c5; }
.ordered { background: #fff3cd; }
.below { background: #f8d7da; }

button {
  padding: 5px 10px;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  margin-right: 5px;
}

.generate-orders {
  margin-top: 20px;
  background: #28a745;
  color: white;
}

.generate-orders:hover {
  background: #218838;
}
</style>