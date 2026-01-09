import { defineStore } from 'pinia'
import api, { setAuthToken } from '../api/axios'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null,
    }),
    getters: {
        isAuthenticated: (state) => !!state.token,
    },
    actions: {
        async login({ email, password, device_name = 'dashboard' }) {
            this.loading = true
            this.error = null
            try {
                const { data } = await api.post('/auth/login', {
                    email,
                    password,
                    device_name,
                })
                this.token = data.token
                setAuthToken(this.token)
                // user viene ya en la respuesta de login
                this.user = data.user
                return true
            } catch (e) {
                this.error = e?.response?.data?.message || 'Error al iniciar sesión'
                return false
            } finally {
                this.loading = false
            }
        },
        async me() {
            if (!this.token) return null
            try {
                const { data } = await api.get('/me')
                this.user = data.user ? data.user : data // por si /me devuelve solo user
                return this.user
            } catch {
                // token inválido
                this.logout()
                return null
            }
        },
        async logout() {
            try {
                await api.post('/auth/logout')
            } catch {
                // aunque falle, limpiamos local
            }
            this.user = null
            this.token = null
            setAuthToken(null)
        },
    },
})
