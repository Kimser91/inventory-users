<template>
    <div class="container mt-4">
      <h1 class="mb-4">Request a New Product</h1>
  
      <form @submit.prevent="submitRequest" class="card p-4 mb-5 shadow-sm">
        <div class="row g-3">
          <div class="col-md-6" v-for="(label, field) in productFields" :key="field">
            <label class="form-label">{{ label }}</label>
            <input v-model="newProduct[field]" :type="fieldTypes.includes(field) ? 'number' : 'text'" class="form-control" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary mt-4">Submit Request</button>
      </form>
  
      <h2 class="mb-4">My Requested Items</h2>
  
      <table class="table table-striped table-bordered">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Store</th>
            <th>Article #</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Requested At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="request in requests" :key="request.id">
            <td>{{ request.id }}</td>
            <td>{{ request.product_name }}</td>
            <td>{{ request.store_name }}</td>
            <td>{{ request.article_number }}</td>
            <td>{{ request.stock_quantity }}</td>
            <td>
              <span :class="getStatusClass(request.status)">
                {{ request.status }}
              </span>
            </td>
            <td>{{ formatDate(request.created_at) }}</td>
            <td>
              <button class="btn btn-danger btn-sm" @click="deleteRequest(request.id)">Delete</button>
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
        requests: [],
        newProduct: {
          product_name: '',
          store_name: '',
          article_number: '',
          stock_quantity: 0,
          min_threshold: 1,
          max_stock: 10,
          price: 0
        },
        productFields: {
          product_name: 'Product Name',
          store_name: 'Store Name',
          article_number: 'Article Number',
          stock_quantity: 'Stock Quantity',
          min_threshold: 'Minimum Threshold',
          max_stock: 'Maximum Stock',
          price: 'Price (NOK)'
        },
        fieldTypes: ['stock_quantity', 'min_threshold', 'max_stock', 'price']
      };
    },
    async mounted() {
      await this.fetchRequests();
    },
    methods: {
      async fetchRequests() {
        try {
          const token = localStorage.getItem('user.token');
          const response = await axios.get(`${API_BASE_URL}/requests`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.requests = response.data;
        } catch (error) {
          console.error('Error fetching requests:', error);
        }
      },
      async submitRequest() {
        try {
          const token = localStorage.getItem('user.token');
          const userInfoResponse = await axios.get(`${API_BASE_URL}/auth/user`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          const userPermissions = userInfoResponse.data.permissions ? JSON.parse(userInfoResponse.data.permissions) : [];

          if (!userPermissions.length) {
            alert('You have no permissions (owners) assigned.');
            return;
          }

          const mainOwner = userPermissions[0];

          const requestPayload = {
            ...this.newProduct,
            owner: mainOwner 
          };

          console.log("🚀 Sender ny request:", requestPayload);

          await axios.post(`${API_BASE_URL}/requests`, requestPayload, {
            headers: { Authorization: `Bearer ${token}` }
          });

          alert('Request submitted successfully!');
          this.resetForm();
          await this.fetchRequests();
        } catch (error) {
          console.error('Error submitting request:', error);
          alert('Failed to submit request.');
        }
      },

      async deleteRequest(id) {
        if (confirm('Are you sure you want to delete this request?')) {
          try {
            const token = localStorage.getItem('user.token');
            await axios.delete(`${API_BASE_URL}/requests/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            await this.fetchRequests();
          } catch (error) {
            console.error('Error deleting request:', error);
          }
        }
      },
      getStatusClass(status) {
        if (status === 'completed') return 'badge bg-success';
        if (status === 'pending') return 'badge bg-warning text-dark';
        if (status === 'requested') return 'badge bg-orange text-white';
        return 'badge bg-secondary';
      },
      formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
      },
      resetForm() {
        this.newProduct = {
          product_name: '',
          store_name: '',
          article_number: '',
          stock_quantity: 0,
          min_threshold: 1,
          max_stock: 10,
          price: 0
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
  }
  .badge.bg-orange {
    background-color: #fd7e14;
    color: white;
  }
  </style>
  