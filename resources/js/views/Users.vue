<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchUsers, deleteUser } from '../api/users'

const router = useRouter()

const state = reactive({
    items: [],
    loading: false,
    error: null,

    // paginación laravel
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    total: 0,

    // filtros
    search: '',
})

const load = async (page = 1) => {
    state.loading = true
    state.error = null

    try {
        // paginación
        const params = {
            page,
            per_page: state.perPage,
        }

        // search
        if (state.search?.trim()) {
            params.search = state.search.trim()
        }

        const { data } = await fetchUsers(params)

        const items = data.data ?? data
        state.items = items

        const meta = data.meta ?? data
        state.currentPage = meta.current_page ?? 1
        state.lastPage = meta.last_page ?? 1
        state.perPage = meta.per_page ?? state.perPage
        state.total = meta.total ?? state.items.length
    } catch (e) {
        state.error = e?.response?.data?.message || 'Error cargando usuarios'
    } finally {
        state.loading = false
    }
}

const onSearch = async () => {
    await load(1)
}

const goDetail = (id) => router.push(`/users/${id}`)
const goEdit = (id) => router.push(`/users/${id}/edit`)

const onDelete = async (id) => {
    const ok = window.confirm('¿Seguro que quieres eliminar este usuario?')
    if (!ok) return

    try {
        await deleteUser(id)

        // Si borramos el último elemento de la página debe volver atrás
        const isLastItemOnPage = state.items.length === 1 && state.currentPage > 1
        await load(isLastItemOnPage ? state.currentPage - 1 : state.currentPage)
    } catch (e) {
        state.error = e?.response?.data?.message || 'Error eliminando usuario'
    }
}

onMounted(() => load(1))
</script>

<template>
    <div>
        <div class="header">
            <div>
                <h2 class="title">Users</h2>
                <p class="subtitle">Listado de usuarios (API: /api/v1/users)</p>
            </div>

            <div class="controls">
                <input v-model="state.search" class="input" type="text" placeholder="Buscar por nombre/email…"
                    @keyup.enter="onSearch" />
                <button class="btn" @click="onSearch" :disabled="state.loading">
                    Buscar
                </button>
            </div>
        </div>

        <p v-if="state.error" class="error">{{ state.error }}</p>

        <div class="card">
            <div v-if="state.loading" class="loading">Cargando…</div>

            <table v-else class="table">
                <thead>
                    <tr>
                        <th style="width: 80px;">ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th style="width: 260px;">Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="state.items.length === 0">
                        <td colspan="4" class="empty">No hay usuarios</td>
                    </tr>

                    <tr v-for="u in state.items" :key="u.id">
                        <td class="mono">{{ u.id }}</td>
                        <td>{{ u.name }}</td>
                        <td class="mono">{{ u.email }}</td>
                        <td>
                            <div class="actions">
                                <button class="btn btn-secondary" @click="goDetail(u.id)">Detalle</button>
                                <button class="btn btn-secondary" @click="goEdit(u.id)">Editar</button>
                                <button class="btn btn-danger" @click="onDelete(u.id)">Eliminar</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="pager" v-if="state.lastPage > 1">
                <button class="btn btn-secondary" :disabled="state.currentPage <= 1 || state.loading"
                    @click="load(state.currentPage - 1)">
                    Anterior
                </button>

                <span class="pager-info">
                    Página <strong>{{ state.currentPage }}</strong> de <strong>{{ state.lastPage }}</strong>
                    <span v-if="state.total"> · Total: {{ state.total }}</span>
                </span>

                <button class="btn btn-secondary" :disabled="state.currentPage >= state.lastPage || state.loading"
                    @click="load(state.currentPage + 1)">
                    Siguiente
                </button>
            </div>
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

.controls {
    display: flex;
    gap: 8px;
    align-items: center;
}

.input {
    width: 260px;
    padding: 10px 10px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #fff;
}

.card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
}

.table {
    width: 100%;
    border-collapse: collapse;
}

thead th {
    text-align: left;
    font-size: 12px;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    color: #6b7280;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    padding: 12px 12px;
}

tbody td {
    border-bottom: 1px solid #f3f4f6;
    padding: 12px 12px;
    vertical-align: middle;
}

tbody tr:hover {
    background: #fafafa;
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

.btn-danger {
    background: #dc2626;
}

.error {
    margin: 0 0 12px 0;
    color: #b91c1c;
}

.loading {
    padding: 16px;
}

.empty {
    text-align: center;
    color: #6b7280;
    padding: 18px;
}

.pager {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px;
}

.pager-info {
    font-size: 13px;
    color: #374151;
}
</style>
