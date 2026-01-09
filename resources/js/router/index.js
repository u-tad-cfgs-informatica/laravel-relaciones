//createRouter crea el sistema de rutas
//createWebHistory usa URLs normales (/login, /users, etc.)
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
//Importamos los componentes que actuarán como páginas
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
//definición de rutas
const routes = [
    { path: '/login', component: Login, meta: { guestOnly: true } },
    { path: '/', component: Dashboard, meta: { requiresAuth: true } },
]
//Aquí se construye el router con el tipo de navegación y la lista de rutas
const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()
    if (auth.token && !auth.user) {
        await auth.me()
    }
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        return '/login'
    }
    if (to.meta.guestOnly && auth.isAuthenticated) {
        return '/'
    }
})

//Permite que el router se use en otros archivos
export default router
