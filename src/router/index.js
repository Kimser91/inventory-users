import { createRouter, createWebHistory } from 'vue-router'
import UsersMainLayout from '../layouts/usersMainLayout.vue';
import UsersInventory from "../views/UsersInventory.vue";
import UsersRequested from "../views/UsersRequested.vue";


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
            {path: 'usersrequested', component: UsersRequested}
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router;