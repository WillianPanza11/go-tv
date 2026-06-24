<!-- client/src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <!-- Fondo animado -->
    <div class="bg-grid"></div>
    <div class="bg-glow"></div>

    <div class="login-container">

      <!-- Logo / Título -->
      <div class="brand">
        <div class="brand-icon">▶</div>
        <h1 class="brand-title">GO<span>TV</span></h1>
        <p class="brand-subtitle">Portal de tutoriales internos</p>
      </div>

      <!-- Formulario -->
      <form class="login-form" @submit.prevent="handleLogin">

        <div class="field">
          <label>Usuario</label>
          <input
            v-model="username"
            type="text"
            placeholder="Ingresa tu usuario"
            autocomplete="username"
            :disabled="loading"
            @input="username = sanitize(username)"
          />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            autocomplete="current-password"
            :disabled="loading"
          />
        </div>

        <!-- Error -->
        <div class="error-msg" v-if="error">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="!loading">Ingresar</span>
          <span v-else class="spinner"></span>
        </button>

        <button type="button" class="btn-guest" :disabled="loading" @click="handleGuestLogin">
          Acceder como invitado
        </button>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router   = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

const ALLOWED = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 @_]*$/
const sanitize = (val) => val.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 @_]/g, '')

const handleLogin = async () => {
  error.value   = ''

  if (!ALLOWED.test(password.value)) {
    error.value = 'Solo se permiten letras, números, @ y _.'
    return
  }

  loading.value = true
  try {
    await authStore.login(username.value, password.value)
    router.push('/catalogo')
  } catch (err) {
    error.value = err.response?.data?.message || 'Credenciales incorrectas.'
  } finally {
    loading.value = false
  }
}

const handleGuestLogin = async () => {
  error.value   = ''
  loading.value = true
  try {
    await authStore.loginAsGuest()
    router.push('/catalogo')
  } catch {
    error.value = 'Error al acceder como invitado.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

/* ── Variables ─────────────────────────────────────── */
:root {
  --bg:      #0a0a0f;
  --surface: #13131a;
  --border:  #2a2a3a;
  --accent:  #e63946;
  --text:    #f0f0f5;
  --muted:   #6b6b80;
}

/* ── Página completa ───────────────────────────────── */
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a0f;
  font-family: 'DM Sans', sans-serif;
  position: relative;
  overflow: hidden;
}

/* ── Fondo: grid de puntos ─────────────────────────── */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, #2a2a3a 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.5;
}

/* ── Fondo: resplandor rojo ────────────────────────── */
.bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* ── Contenedor del login ──────────────────────────── */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 0 24px;
  animation: fadeUp 0.6s ease both;
}

/* ── Brand ─────────────────────────────────────────── */
.brand {
  text-align: center;
  margin-bottom: 40px;
}

.brand-icon {
  font-size: 2.5rem;
  color: #e63946;
  margin-bottom: 8px;
  display: block;
  animation: pulse 2s ease infinite;
}

.brand-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.5rem;
  color: #f0f0f5;
  letter-spacing: 4px;
  margin: 0;
  line-height: 1;
}

.brand-title span {
  color: #e63946;
}

.brand-subtitle {
  color: #6b6b80;
  font-size: 0.85rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 8px;
}

/* ── Formulario ────────────────────────────────────── */
.login-form {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: #6b6b80;
}

.field input {
  background: #0a0a0f;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  padding: 12px 16px;
  color: #f0f0f5;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  transition: border-color 0.2s;
  outline: none;
}

.field input:focus {
  border-color: #e63946;
}

.field input::placeholder {
  color: #3a3a4a;
}

.field input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Error ─────────────────────────────────────────── */
.error-msg {
  background: rgba(230, 57, 70, 0.1);
  border: 1px solid rgba(230, 57, 70, 0.3);
  border-radius: 8px;
  padding: 10px 14px;
  color: #e63946;
  font-size: 0.88rem;
  text-align: center;
}

/* ── Botón ─────────────────────────────────────────── */
.btn-login {
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.1rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.btn-login:hover:not(:disabled) {
  background: #c1121f;
}

.btn-login:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ── Botón Invitado ────────────────────────────────── */
.btn-guest {
  background: transparent;
  color: #6b6b80;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  padding: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
  min-height: 44px;
}

.btn-guest:hover:not(:disabled) {
  border-color: #6b6b80;
  color: #f0f0f5;
}

.btn-guest:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Spinner ───────────────────────────────────────── */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── Animaciones ───────────────────────────────────── */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>