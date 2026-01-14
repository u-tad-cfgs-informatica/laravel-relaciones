<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchUser, updateUser } from '../api/users'

const route = useRoute()
const router = useRouter()

const state = reactive({
  loading: false,
  saving: false,
  error: null,
  validationErrors: {},

  user: null,

  form: {
    name: '',
    email: '',
    password: '', // opcional
  },
})

const load = async () => {
  state.loading = true
  state.error = null
  state.validationErrors = {}

  try {
    const { data } = await fetchUser(route.params.id)
    const user = data.data ?? data

    state.user = user
    state.form.name = user.name ?? ''
    state.form.email = user.email ?? ''
    state.form.password = ''
  } catch (e) {
    state.error = e?.response?.data?.message || 'Error cargando el usuario'
  } finally {
    state.loading = false
  }
}

const save = async () => {
  state.saving = true
  state.error = null
  state.validationErrors = {}

  try {
    // payload: solo enviamos password si el usuario la ha escrito
    const payload = {
      name: state.form.name,
      email: state.form.email,
    }

    if (state.form.password && state.form.password.trim().length > 0) {
      payload.password = state.form.password
    }

    await updateUser(route.params.id, payload)

    // volvevmos a detalle tras guardar
    router.push(`/users/${route.params.id}`)
  } catch (e) {
    // Laravel ValidationException normalmente: { message, errors: { field: [...] } }
    const resp = e?.response?.data
    if (resp?.errors) {
      state.validationErrors = resp.errors
      state.error = resp.message || 'Hay errores de validación'
    } else {
      state.error = resp?.message || 'Error actualizando el usuario'
    }
  } finally {
    state.saving = false
  }
}

const cancel = () => router.push(`/users/${route.params.id}`)
const goBack = () => router.push('/users')

onMounted(load)
</script>

<template>
  <div>
    <div class="header">
      <div>
        <h2 class="title">Editar usuario</h2>
        <p class="subtitle">
          ID: <span class="mono">{{ route.params.id }}</span>
        </p>
      </div>

      <div class="actions">
        <button class="btn btn-secondary" @click="goBack">Volver al listado</button>
        <button class="btn btn-secondary" @click="cancel" :disabled="state.loading || state.saving">Cancelar</button>
        <button class="btn" @click="save" :disabled="state.loading || state.saving">
          {{ state.saving ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </div>

    <p v-if="state.error" class="error">{{ state.error }}</p>

    <div class="card">
      <div v-if="state.loading" class="loading">Cargando…</div>

      <form v-else class="form" @submit.prevent="save">
        <div class="field">
          <label class="label">Nombre</label>
          <input v-model="state.form.name" class="input" type="text" />
          <p v-if="state.validationErrors.name" class="field-error">
            {{ state.validationErrors.name[0] }}
          </p>
        </div>

        <div class="field">
          <label class="label">Email</label>
          <input v-model="state.form.email" class="input" type="email" />
          <p v-if="state.validationErrors.email" class="field-error">
            {{ state.validationErrors.email[0] }}
          </p>
        </div>

        <div class="field">
          <label class="label">Password (opcional)</label>
          <input v-model="state.form.password" class="input" type="password" placeholder="Deja vacío para no cambiarla" />
          <p v-if="state.validationErrors.password" class="field-error">
            {{ state.validationErrors.password[0] }}
          </p>
        </div>

        <div class="footer">
          <button class="btn btn-secondary" type="button" @click="cancel">Cancelar</button>
          <button class="btn" type="submit" :disabled="state.saving">
            {{ state.saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </form>
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

.form {
  display: grid;
  gap: 14px;
  max-width: 520px;
}

.field {
  display: grid;
  gap: 6px;
}

.label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.input {
  padding: 10px 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.field-error {
  margin: 0;
  color: #b91c1c;
  font-size: 13px;
}

.footer {
  display: flex;
  gap: 8px;
  margin-top: 6px;
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

.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 13px;
}
</style>
