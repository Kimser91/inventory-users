<template>
    <div class="container mt-4">
      <h1 class="mb-4">My Inventory</h1>
  
      <table class="table table-striped table-bordered">
        <thead class="table-primary">
          <tr>
            <th v-for="head in tableHeaders" :key="head">{{ head }}</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredInventory" :key="item.id" :class="getRowClass(item)">
            <td>{{ item.id }}</td>
            <td v-for="field in itemFields" :key="field">{{ item[field] }}</td>
            <td>
              <span :class="getStatusClass(getStatusText(item))">
                {{ getStatusText(item) }}
              </span>
            </td>
            <td>
              <button
                class="btn btn-success btn-sm"
                @click="generateRequest(item)"
                :disabled="isItemRequested(item.article_number)"
              >
                {{ isItemRequested(item.article_number) ? 'Requested' : 'Request' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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
        requestedItemIds: [],
        itemFields: ['product_name', 'store_name', 'article_number', 'stock_quantity', 'min_threshold', 'max_stock', 'price', 'owner'],
        tableHeaders: ['ID', 'Product', 'Store', 'Article #', 'Stock', 'Min Threshold', 'Max Stock', 'Price', 'Owner']
      };
    },
    async mounted() {
      await this.fetchUser();
      await this.fetchInventory();
      await this.fetchRequests();
    },
    methods: {
      async fetchUser() {
        try {
          const token = localStorage.getItem('user.token');
          const response = await axios.get(`${API_BASE_URL}/auth/user`, { headers: { Authorization: `Bearer ${token}` } });
          this.userPermissions = response.data.permissions ? JSON.parse(response.data.permissions) : [];
          this.role = response.data.role;
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      },
      async fetchInventory() {
        try {
          const token = localStorage.getItem('user.token');
          const response = await axios.get(`${API_BASE_URL}/inventory`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.inventory = response.data;
          this.filterInventory();
        } catch (error) {
          console.error('Error fetching inventory:', error);
        }
      },
      async fetchRequests() {
        try {
          const token = localStorage.getItem('user.token');
          const response = await axios.get(`${API_BASE_URL}/requests`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.requestedItemIds = response.data
            .filter(r => r.status === 'requested' || r.status === 'pending')
            .map(r => r.article_number);
        } catch (error) {
          console.error('Error fetching requests:', error);
        }
      },
      async generateRequest(item) {
        try {
          const token = localStorage.getItem('user.token');
          await axios.post(`${API_BASE_URL}/requests`, {
            product_name: item.product_name,
            store_name: item.store_name,
            article_number: item.article_number,
            stock_quantity: item.stock_quantity,
            min_threshold: item.min_threshold,
            max_stock: item.max_stock,
            price: item.price
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert('Request submitted successfully!');
          this.requestedItemIds.push(item.article_number); 
        } catch (error) {
          console.error('Error requesting item:', error);
          alert('Failed to submit request.');
        }
      },
      filterInventory() {
        this.filteredInventory = this.canSeeAll
          ? this.inventory
          : this.inventory.filter(item => this.userPermissions.includes(item.owner));
      },
      getStatusText(item) {
        if (this.isItemRequested(item.article_number)) return 'Requested';
        if (item.stock_quantity >= item.min_threshold) return 'OK';
        if (item.is_ordered) return 'Ordered';
        return 'Below';
      },
      getRowClass(item) {
        const status = this.getStatusText(item);
        if (status === 'Requested') return 'table-warning text-white'; 
        if (status === 'OK') return 'table-success';
        if (status === 'Ordered') return 'table-warning';
        return 'table-danger';
      },
      getStatusClass(status) {
        if (status === 'completed') return 'badge bg-success';
        if (status === 'pending') return 'badge bg-warning text-dark';
        if (status === 'requested' || status === 'Requested') return 'badge bg-orange text-white';
        return 'badge bg-secondary';
      },
      isItemRequested(articleNumber) {
        return this.requestedItemIds.includes(articleNumber);
      }
    }
  };
  </script>
  
  <style scoped>
  .badge.bg-orange {
    background-color: #fd7e14;
    color: white;
  }
  </style>
  