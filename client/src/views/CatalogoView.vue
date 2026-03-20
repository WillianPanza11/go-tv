<!-- client/src/views/CatalogoView.vue -->
<template>
  <div class="catalogo-page">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">▶</span>
        <span class="brand-name">SOPORTE<span class="accent">TV</span></span>
      </div>
      <div class="navbar-actions">
        <router-link to="/admin" class="btn-admin">+ Subir Video</router-link>
        <button class="btn-logout" @click="handleLogout">Salir</button>
      </div>
    </nav>

    <!-- Hero / Buscador -->
    <div class="hero">
      <h2 class="hero-title">¿Qué problema resolvemos hoy?</h2>
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          type="text"
          placeholder="Buscar tutorial..."
          @input="fetchVideos"
        />
        <button v-if="search" class="clear-btn" @click="clearSearch">✕</button>
      </div>
    </div>

    <!-- Filtros por categoría -->
    <div class="filters">
      <button
        class="filter-chip"
        :class="{ active: !selectedCategory }"
        @click="selectCategory(null)"
      >
        Todos
      </button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="filter-chip"
        :class="{ active: selectedCategory === cat.id }"
        :style="{ '--chip-color': cat.color }"
        @click="selectCategory(cat.id)"
      >
        {{ cat.nombre }}
      </button>
    </div>

    <!-- Loading -->
    <div class="loading" v-if="loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- Sin resultados -->
    <div class="empty" v-else-if="videos.length === 0">
      <p>😕 No se encontraron tutoriales</p>
    </div>

    <!-- Grid de videos -->
    <div class="videos-grid" v-else>
      <router-link
        v-for="video in videos"
        :key="video.id"
        :to="`/video/${video.id}`"
        class="video-card"
        :class="{ watched: watchedIds.includes(video.id) }"
      >
        <!-- Thumbnail -->
        <div class="card-thumb">
          <span class="play-icon">▶</span>
          <div
            class="card-category-bar"
            :style="{ background: video.categoria_color || '#e63946' }"
          ></div>
          <div class="watched-badge" v-if="watchedIds.includes(video.id)">
            ✓ Visto
          </div>
        </div>

        <!-- Info -->
        <div class="card-info">
          <span
            class="card-tag"
            :style="{ color: video.categoria_color || '#e63946' }"
          >
            {{ video.categoria_nombre || 'Sin categoría' }}
          </span>
          <h3 class="card-title">{{ video.titulo }}</h3>
          <p class="card-desc">{{ video.descripcion || 'Sin descripción' }}</p>
          <span class="card-date">{{ formatDate(video.created_at) }}</span>
        </div>
      </router-link>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import api from '../config/axios.js'

const router    = useRouter()
const authStore = useAuthStore()

const videos           = ref([])
const categories       = ref([])
const watchedIds       = ref([])
const search           = ref('')
const selectedCategory = ref(null)
const loading          = ref(true)

// ── Fetch videos con filtros ──────────────────────────
const fetchVideos = async () => {
  loading.value = true
  try {
    const params = {}
    if (search.value)           params.search      = search.value
    if (selectedCategory.value) params.categoriaId = selectedCategory.value

    const { data } = await api.get('/videos', { params })
    videos.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

// ── Fetch categorías ──────────────────────────────────
const fetchCategories = async () => {
  try {
    const { data } = await api.get('/categories')
    categories.value = data
  } catch (err) {
    console.error(err)
  }
}

// ── Fetch videos vistos ───────────────────────────────
const fetchWatched = async () => {
  try {
    const { data } = await api.get('/comments/watched', {
      params: { sessionId: authStore.sessionId }
    })
    watchedIds.value = data
  } catch (err) {
    console.error(err)
  }
}

// ── Filtrar por categoría ─────────────────────────────
const selectCategory = (id) => {
  selectedCategory.value = id
  fetchVideos()
}

// ── Limpiar búsqueda ──────────────────────────────────
const clearSearch = () => {
  search.value = ''
  fetchVideos()
}

// ── Logout ────────────────────────────────────────────
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// ── Formato de fecha ──────────────────────────────────
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

onMounted(() => {
  fetchCategories()
  fetchVideos()
  fetchWatched()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

.catalogo-page {
  min-height: 100vh;
  background: #0a0a0f;
  font-family: 'DM Sans', sans-serif;
  color: #f0f0f5;
  padding-bottom: 60px;
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
  gap: 8px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 3px;
}

.brand-icon { color: #e63946; }
.accent     { color: #e63946; }

.navbar-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-admin {
  background: #e63946;
  color: #fff;
  text-decoration: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-admin:hover { background: #c1121f; }

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

/* ── Hero ──────────────────────────────────────────── */
.hero {
  padding: 48px 40px 32px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.8rem;
  letter-spacing: 3px;
  color: #f0f0f5;
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  padding: 12px 20px;
  gap: 12px;
  transition: border-color 0.2s;
}

.search-bar:focus-within {
  border-color: #e63946;
}

.search-icon { font-size: 1rem; }

.search-bar input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #f0f0f5;
  font-family: 'DM Sans', sans-serif;
  font-size: 1rem;
}

.search-bar input::placeholder { color: #3a3a4a; }

.clear-btn {
  background: none;
  border: none;
  color: #6b6b80;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.2s;
}

.clear-btn:hover { color: #e63946; }

/* ── Filtros ───────────────────────────────────────── */
.filters {
  display: flex;
  gap: 10px;
  padding: 0 40px 32px;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-chip {
  background: #13131a;
  border: 1px solid #2a2a3a;
  color: #6b6b80;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}

.filter-chip:hover {
  border-color: var(--chip-color, #e63946);
  color: var(--chip-color, #e63946);
}

.filter-chip.active {
  background: var(--chip-color, #e63946);
  border-color: var(--chip-color, #e63946);
  color: #fff;
}

/* ── Loading ───────────────────────────────────────── */
.loading {
  display: flex;
  justify-content: center;
  padding: 80px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #2a2a3a;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* ── Empty ─────────────────────────────────────────── */
.empty {
  text-align: center;
  padding: 80px;
  color: #6b6b80;
  font-size: 1.1rem;
}

/* ── Grid ──────────────────────────────────────────── */
.videos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 40px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Card ──────────────────────────────────────────── */
.video-card {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s, border-color 0.2s;
  display: block;
}

.video-card:hover {
  transform: translateY(-4px);
  border-color: #e63946;
}

.video-card.watched {
  opacity: 0.7;
}

/* ── Thumbnail ─────────────────────────────────────── */
.card-thumb {
  height: 160px;
  background: #0a0a0f;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.play-icon {
  font-size: 2.5rem;
  color: #2a2a3a;
  transition: color 0.2s;
}

.video-card:hover .play-icon { color: #e63946; }

.card-category-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.watched-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.7);
  color: #4ade80;
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid #4ade80;
}

/* ── Info ──────────────────────────────────────────── */
.card-info {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-tag {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.card-title {
  font-size: 1rem;
  font-weight: 500;
  color: #f0f0f5;
  line-height: 1.4;
}

.card-desc {
  font-size: 0.85rem;
  color: #6b6b80;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-date {
  font-size: 0.78rem;
  color: #3a3a4a;
  margin-top: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>