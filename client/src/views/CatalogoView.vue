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
        
        <router-link to="/documentos" class="btn-admin btn-archivo-nav">subir Archivo 📄</router-link>
        <button v-if="!authStore.isGuest" class="btn-admin btn-apk-nav" @click="openPinModal('apk')">📦 Subir APK</button>
        <button v-if="!authStore.isGuest" class="btn-admin btn-video-nav" @click="openPinModal('video')">+ Subir Video 🎦</button>
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

  <!-- Modal: PIN -->
  <div v-if="showPinModal" class="modal-overlay" @click.self="closePinModal">
    <div class="modal-box">
      <h3 class="modal-title">Contraseña requerida</h3>
      <p class="modal-subtitle">
        {{ pinContext === 'video' ? 'Ingresá la contraseña numérica para subir videos.' : 'Ingresá la contraseña numérica para subir APKs.' }}
      </p>
      <input
        v-model="pinInput"
        ref="pinInputRef"
        type="password"
        inputmode="numeric"
        class="modal-input"
        placeholder="••••••"
        maxlength="20"
        @input="pinInput = pinInput.replace(/\D/g, '')"
        @keyup.enter="verifyPin"
      />
      <p v-if="pinError" class="modal-msg error">{{ pinError }}</p>
      <div class="modal-actions">
        <button class="btn-modal-cancel" @click="closePinModal">Cancelar</button>
        <button class="btn-modal-confirm" @click="verifyPin" :disabled="!pinInput || verifyingPin">
          {{ verifyingPin ? 'Verificando…' : 'Confirmar' }}
        </button>
      </div>
    </div>
  </div>

  <!-- Modal: formulario APK -->
  <div v-if="showApkForm" class="modal-overlay" @click.self="closeApkForm">
    <div class="modal-box modal-wide">
      <h3 class="modal-title">Subir APK</h3>

      <label
        class="apk-drop-zone"
        for="apk-file-input"
        :class="{ 'drag-over': isApkDragging }"
        @dragenter.prevent="isApkDragging = true"
        @dragover.prevent="isApkDragging = true"
        @dragleave.self="isApkDragging = false"
        @drop.prevent="handleApkDrop"
      >
        <input
          id="apk-file-input"
          ref="apkFileInput"
          type="file"
          accept=".apk"
          style="display:none"
          @change="handleApkFileChange"
        />
        <div v-if="!selectedApk" class="drop-placeholder">
          <span class="drop-icon">📦</span>
          <p>Arrastra un APK o haz clic para seleccionar</p>
          <small>Solo archivos .apk · Máx. 200 MB</small>
        </div>
        <div v-else class="apk-file-preview" @click.prevent>
          <span class="apk-file-icon">🤖</span>
          <div class="apk-file-meta">
            <p class="apk-file-name">{{ selectedApk.name }}</p>
            <p class="apk-file-size">{{ formatApkSize(selectedApk.size) }}</p>
          </div>
          <button type="button" class="btn-clear-apk" @click.prevent.stop="clearApk">✕</button>
        </div>
      </label>

      <input
        v-model="apkNombre"
        class="modal-input"
        type="text"
        placeholder="Nombre del APK (opcional)"
        maxlength="255"
        @input="apkNombre = sanitize(apkNombre)"
      />

      <textarea
        v-model="apkDescripcion"
        class="modal-input modal-textarea"
        placeholder="Descripción (opcional)"
        rows="3"
        maxlength="500"
        @input="apkDescripcion = sanitize(apkDescripcion)"
      ></textarea>

      <p v-if="apkError"   class="modal-msg error">{{ apkError }}</p>
      <p v-if="apkSuccess" class="modal-msg success">{{ apkSuccess }}</p>

      <div class="modal-actions">
        <button class="btn-modal-cancel" @click="closeApkForm">Cancelar</button>
        <button
          class="btn-modal-confirm"
          @click="handleApkSubmit"
          :disabled="uploadingApk || !selectedApk"
        >
          {{ uploadingApk ? 'Subiendo…' : 'Subir APK' }}
        </button>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
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

// ── PIN modal (APK y Video) ───────────────────────────
const showPinModal = ref(false)
const pinInput     = ref('')
const pinError     = ref('')
const verifyingPin = ref(false)
const pinInputRef  = ref(null)
const pinContext   = ref('')   // 'apk' | 'video'

const openPinModal = async (context) => {
  pinContext.value   = context
  pinInput.value     = ''
  pinError.value     = ''
  showPinModal.value = true
  await nextTick()
  pinInputRef.value?.focus()
}

const closePinModal = () => {
  showPinModal.value = false
  pinInput.value     = ''
  pinError.value     = ''
}

const verifyPin = async () => {
  if (!pinInput.value) return
  verifyingPin.value = true
  pinError.value     = ''
  try {
    await api.post('/apks/verify-pin', { pin: pinInput.value })
    const pin = pinInput.value
    closePinModal()
    if (pinContext.value === 'video') {
      router.push('/admin')
    } else {
      openApkForm(pin)
    }
  } catch (e) {
    pinError.value = e.response?.data?.message || 'Contraseña incorrecta.'
  } finally {
    verifyingPin.value = false
  }
}

const sanitize = (val) => val.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 @_]/g, '')

// ── APK: formulario upload ────────────────────────────
const showApkForm    = ref(false)
const selectedApk    = ref(null)
const apkNombre      = ref('')
const apkDescripcion = ref('')
const apkError       = ref('')
const apkSuccess     = ref('')
const uploadingApk   = ref(false)
const isApkDragging  = ref(false)
const apkFileInput   = ref(null)
const confirmedPin   = ref('')

const openApkForm = (pin) => {
  confirmedPin.value = pin
  apkError.value     = ''
  apkSuccess.value   = ''
  showApkForm.value  = true
}

const closeApkForm = () => {
  showApkForm.value    = false
  selectedApk.value    = null
  apkNombre.value      = ''
  apkDescripcion.value = ''
  apkError.value       = ''
  apkSuccess.value     = ''
  if (apkFileInput.value) apkFileInput.value.value = ''
}

const setApk = (file) => {
  if (!file) return
  if (!file.name.toLowerCase().endsWith('.apk')) {
    apkError.value = 'Solo se permiten archivos .apk.'
    return
  }
  selectedApk.value = file
  apkNombre.value   = apkNombre.value || file.name
  apkError.value    = ''
  apkSuccess.value  = ''
}

const handleApkFileChange = (e) => setApk(e.target.files[0])
const handleApkDrop = (e) => { isApkDragging.value = false; setApk(e.dataTransfer.files[0]) }

const clearApk = () => {
  selectedApk.value = null
  apkNombre.value   = ''
  if (apkFileInput.value) apkFileInput.value.value = ''
}

const formatApkSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const handleApkSubmit = async () => {
  apkError.value   = ''
  apkSuccess.value = ''
  if (!selectedApk.value) return

  const form = new FormData()
  form.append('file',        selectedApk.value)
  form.append('nombre',      apkNombre.value || selectedApk.value.name)
  form.append('descripcion', apkDescripcion.value)
  form.append('pin',         confirmedPin.value)

  uploadingApk.value = true
  try {
    await api.post('/apks', form)
    apkSuccess.value = 'APK subido correctamente.'
    clearApk()
    apkDescripcion.value = ''
  } catch (e) {
    apkError.value = e.response?.data?.message || 'Error al subir el APK.'
  } finally {
    uploadingApk.value = false
  }
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

/* ── Botón Archivo navbar ──────────────────────────── */
.btn-archivo-nav {
  background: #7c3aed !important;
}
.btn-archivo-nav:hover { background: #6d28d9 !important; }

/* ── Botón Video navbar ────────────────────────────── */
.btn-video-nav {
  background: #e63946 !important;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.btn-video-nav:hover { background: #c1121f !important; }

/* ── Botón APK navbar ──────────────────────────────── */
.btn-apk-nav {
  background: #16a34a !important;
  border: none;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
}
.btn-apk-nav:hover { background: #15803d !important; }

/* ── Modal overlay ─────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}

.modal-box {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 14px;
  padding: 32px;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-wide { max-width: 600px; }

.modal-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 2px;
  margin: 0;
  color: #f0f0f5;
}

.modal-subtitle {
  color: #6b6b80;
  font-size: 0.9rem;
  margin: 0;
}

.modal-input {
  background: #0a0a0f;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  padding: 12px 16px;
  color: #f0f0f5;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.modal-input:focus { border-color: #16a34a; }
.modal-textarea { resize: vertical; }

.modal-msg {
  margin: 0;
  font-size: 0.9rem;
  padding: 10px 14px;
  border-radius: 8px;
}
.modal-msg.error   { background: #2a0810; color: #e63946; border: 1px solid #e63946; }
.modal-msg.success { background: #0a2a10; color: #4ade80; border: 1px solid #4ade80; }

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-modal-cancel {
  background: transparent;
  border: 1px solid #2a2a3a;
  color: #6b6b80;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-modal-cancel:hover { border-color: #e63946; color: #e63946; }

.btn-modal-confirm {
  background: #16a34a;
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-modal-confirm:hover:not(:disabled) { background: #15803d; }
.btn-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── APK drop zone (dentro del modal) ─────────────── */
.apk-drop-zone {
  border: 2px dashed #2a2a3a;
  border-radius: 12px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #0a0a0f;
  display: block;
}
.apk-drop-zone:hover, .apk-drop-zone.drag-over {
  border-color: #16a34a;
  background: #0a1a0f;
}

.drop-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.drop-icon { font-size: 2.5rem; }
.drop-placeholder p { color: #b0b0c0; margin: 0; }
.drop-placeholder small { color: #4a4a5a; font-size: 0.8rem; }

.apk-file-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}
.apk-file-icon { font-size: 3rem; flex-shrink: 0; }
.apk-file-meta { flex: 1; }
.apk-file-name { font-weight: 500; margin: 0 0 4px; word-break: break-all; color: #f0f0f5; }
.apk-file-size { color: #6b6b80; margin: 0; font-size: 0.85rem; }
.btn-clear-apk {
  background: none; border: none; color: #6b6b80; font-size: 1.1rem;
  cursor: pointer; padding: 4px 8px; border-radius: 4px;
}
.btn-clear-apk:hover { color: #e63946; }
</style>