<template>
    <div class="d-flex min-vh-100">
        <nav class="d-flex flex-column flex-shrink-0 p-3 bg-secondary text-white" style="width: 250px">
            <h4 class="mb-4 text-center">User Panel</h4>
            
            <div class="text-center my-3">
                <strong>{{ currentUser.username }}</strong>
            </div>

            <ul class="nav nav-pills flex-column mb-auto">
                <li class="nav-item">
                    <router-link to="usersinventory" class="nav-link text-white" active-class="active">
                       My Inventory
                    </router-link>
                </li>
                <li class="nav-item">
                    <router-link to="usersrequested" class="nav-link text-white" active-class="active">
                        Requested Items
                    </router-link>
                </li>
                <li>
                    <button class="btn btn-outline-light mt-4" @click="logout">Logg ut</button>
                </li>
            </ul>
        </nav>

        <main class="flex-grow-1 p-4 bg-light"> <router-view /></main>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "usersmainlayout",
    data() {
        return {
            currentUser: {
                username: ''
            }
        };
    },
    async mounted() {
        await this.fetchCurrentUser();
    },
    methods: {
        async fetchCurrentUser() {
            try {
                const token = localStorage.getItem('user.token');
                const response = await axios.get('https://api.inventoryadministrator.com/api/auth/user', 
                                                    { headers: { Authorization: `Bearer ${token}` }});
                this.currentUser.username = response.data.username;
            } catch (error) {console.error('Feil ved henting av bruker i UsersMainLayout:', error);}
        },
        logout(){
            localStorage.removeItem('user.token')
            window.location.href = 'https://inventoryadministrator.com/login'
        }
    }
};
</script>

<style scoped>
.active {
  background-color: #0d6efd !important;
}
</style>
