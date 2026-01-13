<script setup>
//Acceso a la store de autenticación
import { useAuthStore } from '../stores/auth'
//Permite redirigir al usuario después del logout
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const doLogout = async () => {
    await auth.logout()
    router.replace('/login')
}

</script>

<template>
    <div style="padding: 24px; font-family: system-ui;">
        <h1>Dashboard</h1>
        <p v-if="auth.user">
            Hola, <strong>{{ auth.user.name }}</strong> ({{auth.user.email }})
        </p>
        <button @click="doLogout" style="margin-top: 16px; padding: 8px 12px;">
            Logout
        </button>
    </div>
</template>
