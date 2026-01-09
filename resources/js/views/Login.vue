<script setup>
//Permite crear un objeto reactivo para el formulario
import { reactive } from 'vue'
//Permite redirigir a otra página desde código
import { useRouter } from 'vue-router'
//Acceso a la store de autenticación (Pinia)
import { useAuthStore } from '../stores/auth'
const router = useRouter()
const auth = useAuthStore()
const form = reactive({
    email: '',
    password: '',
})
const onSubmit = async () => {
    const ok = await auth.login({
        email: form.email,
        password: form.password,
        device_name: 'laravel-dashboard',
    })
    if (ok) router.push('/')
}
</script>

<template>
    <div style="max-width: 360px; margin: 48px auto; font-family:system-ui;">
        <h1>Login</h1>
        <form @submit.prevent="onSubmit">
            <div style="margin: 12px 0;">
                <label>Email</label>
                <input v-model="form.email" type="email" required style="width: 100%; padding: 8px;" />
            </div>
            <div style="margin: 12px 0;">
                <label>Password</label>
                <input v-model="form.password" type="password" required style="width: 100%; padding: 8px;" />
            </div>
            <button type="submit" :disabled="auth.loading" style="padding: 8px 12px;">
                {{ auth.loading ? 'Entrando...' : 'Entrar' }}
            </button>
            <p v-if="auth.error" style="color: red; margin-top: 12px;">
                {{ auth.error }}
            </p>
        </form>
    </div>
</template>
