<!-- client/src/views/AdminView.vue -->
<template>
  <div class="admin-page">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/catalogo" class="back-btn">← Volver</router-link>
        <span class="brand-name">GO<span class="accent">TV</span></span>
        <span class="admin-badge">ADMIN</span>
      </div>
      <button class="btn-logout" @click="handleLogout">Salir</button>
    </nav>

    <div class="admin-layout">

      <!-- ── Columna izquierda: formularios ── -->
      <div class="admin-forms">

        <!-- Subir video -->
        <div class="panel">
          <h2 class="panel-title">▶ Subir Video</h2>

          <form @submit.prevent="submitVideo">

            <div class="field">
              <label>Título *</label>
              <input v-model="videoForm.titulo" type="text" placeholder="Ej: Cómo reiniciar el servicio de impresión" @input="videoForm.titulo = sanitize(videoForm.titulo)" />
            </div>

            <div class="field">
              <label>Descripción</label>
              <textarea v-model="videoForm.descripcion" rows="3"
                placeholder="Describe brevemente el tutorial..."
                @input="videoForm.descripcion = sanitize(videoForm.descripcion)"></textarea>
            </div>

            <div class="field">
              <label>Categoría</label>
              <select v-model="videoForm.categoriaId">
                <option value="">Sin categoría</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.nombre }}
                </option>
              </select>
            </div>

            <div class="field">
              <label>Archivo de video *</label>
              <div class="dropzone" :class="{ 'has-file': videoForm.file, 'dragover': isDragging }"
                @dragover.prevent="isDragging = true" @dragleave="isDragging = false" @drop.prevent="handleDrop"
                @click="$refs.fileInput.click()">
                <input ref="fileInput" type="file" accept="video/*" style="display:none" @change="handleFileChange" />
                <div v-if="!videoForm.file" class="dropzone-empty">
                  <span class="drop-icon">📁</span>
                  <p>Arrastra tu video aquí o <strong>haz clic</strong></p>
                  <small>Cualquier formato de video — máx. 500MB</small>
                </div>
                <div v-else class="dropzone-filled">
                  <span class="file-icon">🎬</span>
                  <div>
                    <p class="file-name">{{ videoForm.file.name }}</p>
                    <small>{{ formatFileSize(videoForm.file.size) }}</small>
                  </div>
                  <button type="button" class="remove-file" @click.stop="removeFile">✕</button>
                </div>
              </div>
            </div>

            <!-- Barra de progreso -->
            <div class="progress-bar" v-if="uploading">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              <span>{{ uploadProgress }}%</span>
            </div>

            <!-- Error / Éxito -->
            <div class="msg error" v-if="videoMsg.error">{{ videoMsg.error }}</div>
            <div class="msg success" v-if="videoMsg.success">{{ videoMsg.success }}</div>

            <button type="submit" class="btn-submit" :disabled="uploading">
              <span v-if="!uploading">Subir Video</span>
              <span v-else class="spinner"></span>
            </button>

          </form>
        </div>

        <!-- Crear categoría -->
        <div class="panel">
          <h2 class="panel-title">🏷 Gestionar Categorías</h2>

          <form @submit.prevent="submitCategory" class="category-form">
            <div class="field">
              <label>Nombre *</label>
              <input v-model="catForm.nombre" type="text" placeholder="Ej: Windows, Red, Impresoras..." @input="catForm.nombre = sanitize(catForm.nombre)" />
            </div>
            <div class="field">
              <label>Color</label>
              <div class="color-row">
                <input v-model="catForm.color" type="color" class="color-picker" />
                <span class="color-preview" :style="{ background: catForm.color }">
                  {{ catForm.nombre || 'Vista previa' }}
                </span>
              </div>
            </div>

            <div class="msg error" v-if="catMsg.error">{{ catMsg.error }}</div>
            <div class="msg success" v-if="catMsg.success">{{ catMsg.success }}</div>

            <button type="submit" class="btn-submit secondary">Crear Categoría</button>
          </form>

          <!-- Lista categorías -->
          <div class="cat-list" v-if="categories.length">
            <div v-for="cat in categories" :key="cat.id" class="cat-item">
              <div class="cat-dot" :style="{ background: cat.color }"></div>
              <span>{{ cat.nombre }}</span>
              <button class="btn-delete" @click="deleteCategory(cat.id)">✕</button>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Columna derecha: lista de videos ── -->
      <div class="panel videos-panel">
        <h2 class="panel-title">🎬 Videos subidos <span class="count">{{ videos.length }}</span></h2>

        <div class="loading" v-if="loadingVideos">
          <div class="loading-spinner"></div>
        </div>

        <div class="empty" v-else-if="videos.length === 0">
          Aún no has subido ningún video
        </div>

        <div class="video-list" v-else>
          <div v-for="video in videos" :key="video.id" class="video-item">
            <div class="video-item-thumb">▶</div>
            <div class="video-item-info">
              <p class="video-item-title">{{ video.titulo }}</p>
              <span class="video-item-cat" :style="{ color: video.categoria_color || '#6b6b80' }">
                {{ video.categoria_nombre || 'Sin categoría' }}
              </span>
              <small class="video-item-date">{{ formatDate(video.created_at) }}</small>
            </div>
            <button class="btn-delete" @click="deleteVideo(video.id)">🗑</button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import api from '../config/axios.js'

const router = useRouter()
const authStore = useAuthStore()

const sanitize = (val) => val.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 @_]/g, '')

// ── Estado ────────────────────────────────────────────
const videos = ref([])
const categories = ref([])
const loadingVideos = ref(true)
const uploading = ref(false)
const uploadProgress = ref(0)
const isDragging = ref(false)
const fileInput = ref(null)

const videoForm = ref({ titulo: '', descripcion: '', categoriaId: '', file: null })
const catForm = ref({ nombre: '', color: '#e63946' })
const videoMsg = ref({ error: '', success: '' })
const catMsg = ref({ error: '', success: '' })

// ── Fetch ─────────────────────────────────────────────
const fetchVideos = async () => {
  loadingVideos.value = true
  try {
    const { data } = await api.get('/videos')
    videos.value = data
  } catch (err) {
    console.error(err)
  } finally {
    loadingVideos.value = false
  }
}

const fetchCategories = async () => {
  try {
    const { data } = await api.get('/categories')
    categories.value = data
  } catch (err) {
    console.error(err)
  }
}

// ── Manejo de archivo ─────────────────────────────────
const handleFileChange = (e) => {
  videoForm.value.file = e.target.files[0] || null
}

const handleDrop = (e) => {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    videoForm.value.file = file
  }
}

const removeFile = () => {
  videoForm.value.file = null
  if (fileInput.value) fileInput.value.value = ''
}

// ── Subir video ───────────────────────────────────────
const submitVideo = async () => {
  videoMsg.value = { error: '', success: '' }

  if (!videoForm.value.titulo.trim()) {
    videoMsg.value.error = 'El título es requerido.'
    return
  }
  if (!videoForm.value.file) {
    videoMsg.value.error = 'Selecciona un archivo de video.'
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('titulo', videoForm.value.titulo.trim())
    formData.append('descripcion', videoForm.value.descripcion.trim())
    formData.append('categoriaId', videoForm.value.categoriaId || '')
    formData.append('video', videoForm.value.file)

    const { data } = await api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded * 100) / e.total)
      }
    })

    videos.value.unshift(data)
    videoMsg.value.success = '✓ Video subido correctamente.'
    videoForm.value = { titulo: '', descripcion: '', categoriaId: '', file: null }
    if (fileInput.value) fileInput.value.value = ''

  } catch (err) {
    videoMsg.value.error = err.response?.data?.message || 'Error al subir el video.'
  } finally {
    uploading.value = false
  }
}

// ── Crear categoría ───────────────────────────────────
const submitCategory = async () => {
  catMsg.value = { error: '', success: '' }

  if (!catForm.value.nombre.trim()) {
    catMsg.value.error = 'El nombre es requerido.'
    return
  }

  try {
    const { data } = await api.post('/categories', {
      nombre: catForm.value.nombre.trim(),
      color: catForm.value.color
    })
    categories.value.push(data)
    catMsg.value.success = '✓ Categoría creada.'
    catForm.value = { nombre: '', color: '#e63946' }
  } catch (err) {
    catMsg.value.error = err.response?.data?.message || 'Error al crear categoría.'
  }
}

// ── Eliminar categoría ────────────────────────────────
const deleteCategory = async (id) => {
  if (!confirm('¿Eliminar esta categoría?')) return
  try {
    await api.delete(`/categories/${id}`)
    categories.value = categories.value.filter(c => c.id !== id)
  } catch (err) {
    console.error(err)
  }
}

// ── Eliminar video ────────────────────────────────────
const deleteVideo = async (id) => {
  if (!confirm('¿Eliminar este video? Esta acción no se puede deshacer.')) return
  try {
    await api.delete(`/videos/${id}`)
    videos.value = videos.value.filter(v => v.id !== id)
  } catch (err) {
    console.error(err)
  }
}

// ── Helpers ───────────────────────────────────────────
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  fetchVideos()
  fetchCategories()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

.admin-page {
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
  gap: 16px;
}

.back-btn {
  color: #6b6b80;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #e63946;
}

.brand-name {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.4rem;
  letter-spacing: 3px;
}

.accent {
  color: #e63946;
}

.admin-badge {
  background: #e63946;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 2px;
  padding: 2px 10px;
  border-radius: 999px;
}

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

/* ── Layout ────────────────────────────────────────── */
.admin-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  padding: 32px 40px;
  max-width: 1300px;
  margin: 0 auto;
}

/* ── Panel ─────────────────────────────────────────── */
.panel {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.videos-panel {
  grid-row: span 2;
}

.panel-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.3rem;
  letter-spacing: 2px;
  color: #f0f0f5;
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  background: #2a2a3a;
  color: #6b6b80;
  font-size: 0.8rem;
  padding: 2px 10px;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
}

/* ── Fields ────────────────────────────────────────── */
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

.field input,
.field textarea,
.field select {
  background: #0a0a0f;
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

.field input:focus,
.field textarea:focus,
.field select:focus {
  border-color: #e63946;
}

.field input::placeholder,
.field textarea::placeholder {
  color: #3a3a4a;
}

.field select option {
  background: #13131a;
}

/* ── Dropzone ──────────────────────────────────────── */
.dropzone {
  border: 2px dashed #2a2a3a;
  border-radius: 12px;
  padding: 28px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.dropzone:hover,
.dropzone.dragover {
  border-color: #e63946;
  background: rgba(230, 57, 70, 0.04);
}

.dropzone.has-file {
  border-style: solid;
  border-color: #4ade80;
}

.dropzone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-icon {
  font-size: 2rem;
}

.dropzone-empty p {
  color: #6b6b80;
  font-size: 0.9rem;
}

.dropzone-empty p strong {
  color: #e63946;
}

.dropzone-empty small {
  color: #3a3a4a;
  font-size: 0.78rem;
}

.dropzone-filled {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}

.file-icon {
  font-size: 1.8rem;
}

.file-name {
  font-size: 0.9rem;
  color: #f0f0f5;
  font-weight: 500;
  word-break: break-all;
}

.dropzone-filled small {
  color: #6b6b80;
  font-size: 0.78rem;
}

.remove-file {
  margin-left: auto;
  background: none;
  border: none;
  color: #6b6b80;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
}

.remove-file:hover {
  color: #e63946;
}

/* ── Progreso ──────────────────────────────────────── */
.progress-bar {
  background: #0a0a0f;
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
  position: relative;
  border: 1px solid #2a2a3a;
}

.progress-fill {
  height: 100%;
  background: #e63946;
  border-radius: 999px;
  transition: width 0.3s ease;
}

.progress-bar span {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.7rem;
  color: #f0f0f5;
}

/* ── Mensajes ──────────────────────────────────────── */
.msg {
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.88rem;
}

.msg.error {
  background: rgba(230, 57, 70, 0.1);
  border: 1px solid rgba(230, 57, 70, 0.3);
  color: #e63946;
}

.msg.success {
  background: rgba(74, 222, 128, 0.1);
  border: 1px solid rgba(74, 222, 128, 0.3);
  color: #4ade80;
}

/* ── Botones ───────────────────────────────────────── */
.btn-submit {
  background: #e63946;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1rem;
  letter-spacing: 2px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.btn-submit:hover:not(:disabled) {
  background: #c1121f;
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit.secondary {
  background: #2a2a3a;
}

.btn-submit.secondary:hover:not(:disabled) {
  background: #3a3a4a;
}

/* ── Categorías ────────────────────────────────────── */
.color-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-picker {
  width: 48px;
  height: 40px;
  padding: 2px;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.color-preview {
  padding: 6px 16px;
  border-radius: 999px;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 500;
}

.cat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.cat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #0a0a0f;
  border-radius: 8px;
  border: 1px solid #2a2a3a;
}

.cat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.cat-item span {
  flex: 1;
  font-size: 0.9rem;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b6b80;
  font-size: 0.85rem;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-delete:hover {
  color: #e63946;
}

/* ── Lista de videos ───────────────────────────────── */
.video-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 600px;
}

.empty {
  text-align: center;
  color: #3a3a4a;
  padding: 40px;
  font-size: 0.9rem;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #2a2a3a;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.video-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #0a0a0f;
  border-radius: 10px;
  border: 1px solid #2a2a3a;
  transition: border-color 0.2s;
}

.video-item:hover {
  border-color: #3a3a4a;
}

.video-item-thumb {
  width: 44px;
  height: 44px;
  background: #13131a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #e63946;
  flex-shrink: 0;
}

.video-item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.video-item-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #f0f0f5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-item-cat {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.video-item-date {
  font-size: 0.75rem;
  color: #3a3a4a;
}

/* ── Spinner ───────────────────────────────────────── */
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── Responsive ────────────────────────────────────── */
@media (max-width: 900px) {
  .admin-layout {
    grid-template-columns: 1fr;
    padding: 20px;
  }

  .videos-panel {
    grid-row: span 1;
  }

  .navbar {
    padding: 16px 20px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>