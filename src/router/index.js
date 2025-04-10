import { createRouter, createWebHistory } from 'vue-router'
import UsersMainLayout from '../layouts/UsersMainLayout.vue';
import UsersInventory from "../views/UsersInventory.vue";
import UsersRequested from "../views/UsersRequested.vue";
import ScanProduct from '@/views/ScanProduct.vue';


const routes = [
    {
        path: '/',
        component: UsersMainLayout,
        beforeEnter: (to, from, next) => {
            const token = localStorage.getItem('user.token');
            if(!token){
                window.location.href = 'https://inventoryadministrator.com/login';
            }
            else { next()};
        },
        children: [
            {path: '', redirect: 'usersinventory'},
            {path: 'usersinventory', component: UsersInventory},
            {path: 'usersrequested', component: UsersRequested},
            {path: 'usersScanProduct', component: ScanProduct}
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;