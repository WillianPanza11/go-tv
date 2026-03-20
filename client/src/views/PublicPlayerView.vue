<!-- client/src/views/PublicPlayerView.vue -->
<template>
  <div class="public-player">

    <!-- Loading -->
    <div class="loading" v-if="loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Error -->
    <div class="error-state" v-else-if="!video">
      <div class="brand">SOPORTE<span>TV</span></div>
      <p>😕 Video no encontrado o el enlace es inválido</p>
    </div>

    <!-- Player -->
    <div class="player-container" v-else>

      <!-- Header mínimo -->
      <div class="player-header">
        <div class="brand">SOPORTE<span>TV</span></div>
        <span class="public-badge">Vista pública</span>
      </div>

      <!-- Video -->
      <div class="video-wrapper">
        <video
          :src="`${apiUrl}/uploads/${video.filename}`"
          controls
          autoplay
        ></video>
      </div>

      <!-- Info -->
      <div class="video-info">
        <span
          class="video-tag"
          v-if="video.categoria_nombre"
          :style="{ color: video.categoria_color || '#e63946' }"
        >
          {{ video.categoria_nombre }}
        </span>
        <h1 class="video-title">{{ video.titulo }}</h1>
        <p class="video-desc" v-if="video.descripcion">{{ video.descripcion }}</p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const route  = useRoute()
const video  = ref(null)
const loading = ref(true)
const apiUrl = import.meta.env.VITE_API_URL || ''

const fetchVideo = async () => {
  try {
    // Usa la ruta pública — sin token
    const { data } = await axios.get(
      `${apiUrl}/api/videos/public/${route.params.id}`
    )
    video.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchVideo)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

.public-player {
  min-height: 100vh;
  background: #0a0a0f;
  font-family: 'DM Sans', sans-serif;
  color: #f0f0f5;
  display: flex;
  flex-direction: column;
}

/* ── Loading ───────────────────────────────────────── */
.loading {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2a3a;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Error ─────────────────────────────────────────── */
.error-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #6b6b80;
}

/* ── Container ─────────────────────────────────────── */
.player-container {
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  padding: 24px 24px 60px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Header ────────────────────────────────────────── */
.player-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 3px;
  color: #f0f0f5;
}

.brand span { color: #e63946; }

.public-badge {
  background: #2a2a3a;
  color: #6b6b80;
  font-size: 0.75rem;
  padding: 3px 12px;
  border-radius: 999px;
  letter-spacing: 1px;
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
  max-height: 540px;
  background: #000;
}

/* ── Info ──────────────────────────────────────────── */
.video-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
}

.video-tag {
  font-size: 0.78rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>