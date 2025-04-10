<template>
    <div class="container mt-5">
      <h1 class="mb-4">Scan or Enter Article Number</h1>
  
      <!-- Scan/Input felt -->
      <div class="input-group mb-3">
        <input
          v-model="articleNumber"
          ref="scannerInput"
          type="text"
          class="form-control"
          placeholder="Scan or type article number"
          @keyup.enter="handleScan"
        />
        <button class="btn btn-primary" @click="handleScan">Search</button>
      </div>
  
      <!-- Produkt funnet -->
      <div v-if="foundProduct" class="card p-4 mt-4">
        <h4>Product Found: {{ foundProduct.product_name }}</h4>
  
        <div class="mb-3">
          <label>How many to request?</label>
          <input
            v-model.number="quantity"
            type="number"
            class="form-control"
            min="1"
            @keyup.enter="confirmQuantity"
          />
        </div>
  
        <button class="btn btn-success" @click="confirmQuantity">Confirm Request</button>
      </div>
  
      <!-- Produkt ikke funnet: Skjema -->
      <div v-if="showNewProductForm" class="card p-4 mt-4">
        <h4>Request New Product</h4>
  
        <form @submit.prevent="createNewProductRequest">
          <div class="mb-3">
            <label>Product Name</label>
            <input v-model="newProduct.product_name" type="text" class="form-control" required />
          </div>
  
          <div class="mb-3">
            <label>Store Name (Supplier)</label>
            <input v-model="newProduct.store_name" type="text" class="form-control" required />
          </div>
  
          <div class="mb-3">
            <label>Article Number</label>
            <input v-model="newProduct.article_number" type="text" class="form-control" readonly />
          </div>
  
          <div class="mb-3">
            <label>Stock Quantity</label>
            <input v-model.number="newProduct.stock_quantity" type="number" class="form-control" required />
          </div>
  
          <div class="mb-3">
            <label>Minimum Threshold</label>
            <input v-model.number="newProduct.min_threshold" type="number" class="form-control" required />
          </div>
  
          <div class="mb-3">
            <label>Maximum Stock</label>
            <input v-model.number="newProduct.max_stock" type="number" class="form-control" required />
          </div>
  
          <div class="mb-3">
            <label>Price (NOK)</label>
            <input v-model.number="newProduct.price" type="number" class="form-control" required />
          </div>
  
          <button type="submit" class="btn btn-warning mt-3">Submit Product Request</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.inventoryadministrator.com/api';
  
  export default {
    data() {
      return {
        articleNumber: '',
        foundProduct: null,
        quantity: 1,
        showNewProductForm: false,
        newProduct: {
          product_name: '',
          store_name: '',
          article_number: '',
          stock_quantity: 1,
          min_threshold: 1,
          max_stock: 10,
          price: 0
        }
      };
    },
    mounted() {
      this.focusScannerInput();
    },
    methods: {
      focusScannerInput() {
        this.$nextTick(() => {
          this.$refs.scannerInput?.focus();
        });
      },
      async handleScan() {
        if (!this.articleNumber) return;
        try {
          const token = localStorage.getItem('user.token');
          const response = await axios.get(`${API_BASE_URL}/inventory`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.foundProduct = response.data.find(p => p.article_number === this.articleNumber);
  
          if (this.foundProduct) {
            this.showNewProductForm = false;
            this.quantity = 1;
          } else {
            this.showNewProductForm = true;
            this.newProduct.article_number = this.articleNumber;
          }
        } catch (error) {
          console.error('Error searching inventory:', error);
        }
      },
      async confirmQuantity() {
        try {
          const token = localStorage.getItem('user.token');
          await axios.post(`${API_BASE_URL}/requests`, {
            product_name: this.foundProduct.product_name,
            store_name: this.foundProduct.store_name,
            article_number: this.foundProduct.article_number,
            stock_quantity: this.quantity,
            min_threshold: this.foundProduct.min_threshold,
            max_stock: this.foundProduct.max_stock,
            price: this.foundProduct.price
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert('Product request sent!');
          this.reset();
        } catch (error) {
          console.error('Error sending request:', error);
        }
      },
      async createNewProductRequest() {
        try {
          const token = localStorage.getItem('user.token');
          await axios.post(`${API_BASE_URL}/requests`, this.newProduct, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert('New product request submitted!');
          this.reset();
        } catch (error) {
          console.error('Error submitting new request:', error);
        }
      },
      reset() {
        this.articleNumber = '';
        this.foundProduct = null;
        this.quantity = 1;
        this.showNewProductForm = false;
        this.newProduct = {
          product_name: '',
          store_name: '',
          article_number: '',
          stock_quantity: 1,
          min_threshold: 1,
          max_stock: 10,
          price: 0
        };
        this.focusScannerInput();
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
  }
  .card {
    background: #f8f9fa;
    border: 1px solid #ddd;
  }
  </style>
  