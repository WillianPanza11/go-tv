<!-- client/src/views/AdminLoginView.vue -->
<template>
  <div class="login-page">
    <div class="bg-grid"></div>
    <div class="bg-glow"></div>

    <div class="login-container">
      <div class="brand">
        <div class="brand-icon">▶</div>
        <h1 class="brand-title">SOPORTE<span>TV</span></h1>
        <p class="brand-subtitle">Acceso Administrador</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="field">
          <label>Usuario</label>
          <input
            v-model="username"
            type="text"
            placeholder="Usuario admin"
            :disabled="loading"
          />
        </div>

        <div class="field">
          <label>Contraseña</label>
          <input
            v-model="password"
            type="password"
            placeholder="Contraseña"
            :disabled="loading"
          />
        </div>

        <div class="error-msg" v-if="error">{{ error }}</div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="!loading">Ingresar</span>
          <span v-else class="spinner"></span>
        </button>

        <router-link to="/" class="btn-back">← Volver al catálogo</router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const router    = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

const handleLogin = async () => {
  error.value   = ''
  loading.value = true
  try {
    await authStore.login(username.value, password.value)
    router.push('/admin')
  } catch (err) {
    error.value = err.response?.data?.message || 'Credenciales incorrectas.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

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

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, #2a2a3a 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.5;
}

.bg-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(230,57,70,0.15) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  padding: 0 24px;
  animation: fadeUp 0.6s ease both;
}

.brand {
  text-align: center;
  margin-bottom: 40px;
}

.brand-icon {
  font-size: 2.5rem;
  color: #e63946;
  margin-bottom: 8px;
  display: block;
}

.brand-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3.5rem;
  color: #f0f0f5;
  letter-spacing: 4px;
  margin: 0;
  line-height: 1;
}

.brand-title span { color: #e63946; }

.brand-subtitle {
  color: #6b6b80;
  font-size: 0.85rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 8px;
}

.login-form {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  padding: 36px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field { display: flex; flex-direction: column; gap: 8px; }

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

.field input:focus { border-color: #e63946; }
.field input::placeholder { color: #3a3a4a; }
.field input:disabled { opacity: 0.5; }

.error-msg {
  background: rgba(230,57,70,0.1);
  border: 1px solid rgba(230,57,70,0.3);
  border-radius: 8px;
  padding: 10px 14px;
  color: #e63946;
  font-size: 0.88rem;
  text-align: center;
}

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
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
}

.btn-login:hover:not(:disabled) { background: #c1121f; }
.btn-login:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-back {
  text-align: center;
  color: #6b6b80;
  font-size: 0.85rem;
  text-decoration: none;
  transition: color 0.2s;
}

.btn-back:hover { color: #e63946; }

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>