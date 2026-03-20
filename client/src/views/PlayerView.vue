<!-- client/src/views/PlayerView.vue -->
<template>
  <div class="player-page">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/catalogo" class="back-btn">← Volver</router-link>
        <span class="brand-name">GO<span class="accent">TV</span></span>
      </div>
      <button class="btn-logout" @click="handleLogout">Salir</button>
    </nav>

    <!-- Loading -->
    <div class="loading" v-if="loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error -->
    <div class="error-state" v-else-if="!video">
      <p>😕 Video no encontrado</p>
      <router-link to="/catalogo">Volver al catálogo</router-link>
    </div>

    <div class="player-layout" v-else>

      <!-- Columna izquierda: video + info -->
      <div class="player-main">

        <!-- Video -->
        <div class="video-wrapper">
          <video
            ref="videoEl"
            :src="`${apiUrl}/uploads/${video.filename}`"
            controls
            @ended="markWatched"
            @timeupdate="handleTimeUpdate"
          ></video>
        </div>

        <!-- Info del video -->
        <div class="video-info">
          <div class="video-meta">
            <span
              class="video-tag"
              :style="{ color: video.categoria_color || '#e63946' }"
            >
              {{ video.categoria_nombre || 'Sin categoría' }}
            </span>
            <span class="video-date">{{ formatDate(video.created_at) }}</span>
          </div>
          <h1 class="video-title">{{ video.titulo }}</h1>
          <p class="video-desc" v-if="video.descripcion">{{ video.descripcion }}</p>

          <!-- Badge visto -->
          <div class="watched-badge" v-if="isWatched">
            ✓ Ya viste este tutorial
          </div>
        </div>

      </div>

      <!-- Columna derecha: comentarios -->
      <div class="comments-panel">
        <h3 class="comments-title">Comentarios <span>{{ comments.length }}</span></h3>

        <!-- Formulario nuevo comentario -->
        <form class="comment-form" @submit.prevent="submitComment">
          <input
            v-model="newAutor"
            type="text"
            placeholder="Tu nombre"
            maxlength="100"
          />
          <textarea
            v-model="newTexto"
            placeholder="Escribe un comentario..."
            rows="3"
            maxlength="500"
          ></textarea>
          <button type="submit" :disabled="submitting">
            {{ submitting ? 'Enviando...' : 'Comentar' }}
          </button>
        </form>

        <!-- Lista de comentarios -->
        <div class="comments-list">
          <div class="empty-comments" v-if="comments.length === 0">
            Sé el primero en comentar
          </div>
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="comment-item"
          >
            <div class="comment-avatar">
              {{ comment.autor.charAt(0).toUpperCase() }}
            </div>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-autor">{{ comment.autor }}</span>
                <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
              </div>
              <p class="comment-texto">{{ comment.texto }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import api from '../config/axios.js'

const route     = useRoute()
const router    = useRouter()
const authStore = useAuthStore()

const video      = ref(null)
const comments   = ref([])
const loading    = ref(true)
const isWatched  = ref(false)
const submitting = ref(false)
const newAutor   = ref('')
const newTexto   = ref('')
const videoEl    = ref(null)
const apiUrl = import.meta.env.VITE_API_URL || ''

// ── Cargar video ──────────────────────────────────────
const fetchVideo = async () => {
  try {
    const { data } = await api.get(`/videos/${route.params.id}`)
    video.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ── Cargar comentarios ────────────────────────────────
const fetchComments = async () => {
  try {
    const { data } = await api.get(`/comments/${route.params.id}`)
    comments.value = data
  } catch (err) {
    console.error(err)
  }
}

// ── Verificar si ya fue visto ─────────────────────────
const checkWatched = async () => {
  try {
    const { data } = await api.get('/comments/watched', {
      params: { sessionId: authStore.sessionId }
    })
    isWatched.value = data.includes(Number(route.params.id))
  } catch (err) {
    console.error(err)
  }
}

// ── Marcar como visto al terminar el video ────────────
const markWatched = async () => {
  if (isWatched.value) return
  try {
    await api.post(`/comments/watched/${route.params.id}`, {
      sessionId: authStore.sessionId
    })
    isWatched.value = true
  } catch (err) {
    console.error(err)
  }
}

// ── Marcar como visto al ver el 80% del video ─────────
const handleTimeUpdate = () => {
  if (!videoEl.value || isWatched.value) return
  const { currentTime, duration } = videoEl.value
  if (duration && currentTime / duration >= 0.8) {
    markWatched()
  }
}

// ── Enviar comentario ─────────────────────────────────
const submitComment = async () => {
  if (!newAutor.value.trim() || !newTexto.value.trim()) return
  submitting.value = true
  try {
    const { data } = await api.post(`/comments/${route.params.id}`, {
      autor: newAutor.value.trim(),
      texto: newTexto.value.trim()
    })
    comments.value.push(data)
    newTexto.value = ''
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
  }
}

// ── Logout ────────────────────────────────────────────
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// ── Formato fecha ─────────────────────────────────────
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  fetchVideo()
  fetchComments()
  checkWatched()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

.player-page {
  min-height: 100vh;
  background: #0a0a0f;
  font-family: 'DM Sans', sans-serif;
  color: #f0f0f5;
}

/* ── Navbar ────────────────────────────────────────── */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 40px;
  background: #13131a;
  border-bottom: 1px solid #2a2a3a;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 20px;
}

.back-btn {
  color: #6b6b80;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-btn:hover { color: #e63946; }

.brand-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  letter-spacing: 3px;
}

.accent { color: #e63946; }

.btn-logout {
  background: transparent;
  border: 1px solid #2a2a3a;
  color: #6b6b80;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.btn-logout:hover {
  border-color: #e63946;
  color: #e63946;
}

/* ── Loading / Error ───────────────────────────────── */
.loading {
  display: flex;
  justify-content: center;
  padding: 100px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2a3a;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.error-state {
  text-align: center;
  padding: 100px;
  color: #6b6b80;
}

.error-state a {
  color: #e63946;
  margin-top: 12px;
  display: inline-block;
}

/* ── Layout principal ──────────────────────────────── */
.player-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  padding: 32px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Video ─────────────────────────────────────────── */
.video-wrapper {
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #2a2a3a;
}

.video-wrapper video {
  width: 100%;
  display: block;
  max-height: 520px;
  background: #000;
}

/* ── Info ──────────────────────────────────────────── */
.video-info {
  padding: 24px 0 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.video-meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.video-tag {
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.video-date {
  font-size: 0.82rem;
  color: #3a3a4a;
}

.video-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
  color: #f0f0f5;
  line-height: 1.1;
}

.video-desc {
  color: #6b6b80;
  font-size: 0.95rem;
  line-height: 1.6;
}

.watched-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.82rem;
  width: fit-content;
}

/* ── Panel comentarios ─────────────────────────────── */
.comments-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 4px;
}

.comments-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.3rem;
  letter-spacing: 2px;
  color: #f0f0f5;
  display: flex;
  align-items: center;
  gap: 10px;
}

.comments-title span {
  background: #2a2a3a;
  color: #6b6b80;
  font-size: 0.8rem;
  padding: 2px 10px;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
}

/* ── Formulario comentario ─────────────────────────── */
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-form input,
.comment-form textarea {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  padding: 10px 14px;
  color: #f0f0f5;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  outline: none;
  resize: none;
  transition: border-color 0.2s;
}

.comment-form input:focus,
.comment-form textarea:focus {
  border-color: #e63946;
}

.comment-form input::placeholder,
.comment-form textarea::placeholder {
  color: #3a3a4a;
}

.comment-form button {
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s;
}

.comment-form button:hover:not(:disabled) { background: #c1121f; }
.comment-form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Lista comentarios ─────────────────────────────── */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  max-height: 500px;
  padding-right: 4px;
}

.empty-comments {
  color: #3a3a4a;
  font-size: 0.9rem;
  text-align: center;
  padding: 32px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: #e63946;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 0.9rem;
  color: #fff;
}

.comment-body {
  flex: 1;
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 10px;
  padding: 12px 14px;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.comment-autor {
  font-size: 0.88rem;
  font-weight: 500;
  color: #f0f0f5;
}

.comment-date {
  font-size: 0.75rem;
  color: #3a3a4a;
}

.comment-texto {
  font-size: 0.88rem;
  color: #6b6b80;
  line-height: 1.5;
}

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 900px) {
  .player-layout {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .navbar { padding: 16px 20px; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>