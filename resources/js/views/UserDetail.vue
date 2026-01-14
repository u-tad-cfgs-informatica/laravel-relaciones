<script setup>
import { onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchUser } from '../api/users'

const route = useRoute()
const router = useRouter()

const state = reactive({
    loading: false,
    error: null,
    user: null,
})

const load = async () => {
    state.loading = true
    state.error = null

    try {
        const id = route.params.id
        const { data } = await fetchUser(id)
        state.user = data.data ?? data
    } catch (e) {
        state.error = e?.response?.data?.message || 'Error cargando el usuario'
    } finally {
        state.loading = false
    }
}

const goBack = () => router.push('/users')
const goEdit = () => router.push(`/users/${route.params.id}/edit`)

onMounted(load)
</script>

<template>
    <div>
        <div class="header">
            <div>
                <h2 class="title">Detalle de usuario</h2>
                <p class="subtitle">ID: <span class="mono">{{ route.params.id }}</span></p>
            </div>

            <div class="actions">
                <button class="btn btn-secondary" @click="goBack">Volver</button>
                <button class="btn" @click="goEdit" :disabled="!state.user">Editar</button>
            </div>
        </div>

        <p v-if="state.error" class="error">{{ state.error }}</p>

        <div class="card">
            <div v-if="state.loading" class="loading">Cargando…</div>

            <div v-else-if="state.user" class="grid">
                <div class="field">
                    <div class="label">ID</div>
                    <div class="value mono">{{ state.user.id }}</div>
                </div>

                <div class="field">
                    <div class="label">Nombre</div>
                    <div class="value">{{ state.user.name }}</div>
                </div>

                <div class="field">
                    <div class="label">Email</div>
                    <div class="value mono">{{ state.user.email }}</div>
                </div>
            </div>

            <div v-else class="empty">No se encontró el usuario.</div>
        </div>
    </div>
</template>

<style scoped>
.header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 14px;
}

.title {
    margin: 0;
    font-size: 20px;
}

.subtitle {
    margin: 6px 0 0 0;
    font-size: 13px;
    color: #6b7280;
}

.card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px;
}

.grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
}

.field {
    padding: 12px;
    border: 1px solid #f3f4f6;
    border-radius: 10px;
    background: #fafafa;
}

.label {
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.3px;
    margin-bottom: 6px;
}

.value {
    font-size: 15px;
    color: #111827;
}

.mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 13px;
}

.actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.btn {
    padding: 9px 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    cursor: pointer;
    background: #111827;
    color: #fff;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f3f4f6;
    color: #111827;
    border-color: #e5e7eb;
}

.error {
    margin: 0 0 12px 0;
    color: #b91c1c;
}

.loading {
    padding: 6px 0;
}

.empty {
    color: #6b7280;
}
</style>
