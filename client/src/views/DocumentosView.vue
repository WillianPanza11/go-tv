<!-- client/src/views/DocumentosView.vue -->
<template>
  <div class="docs-page">

    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-brand">
        <span class="brand-icon">▶</span>
        <span class="brand-name">SOPORTE<span class="accent">TV</span></span>
      </div>
      <div class="navbar-actions">
        <router-link to="/catalogo" class="btn-back">← Volver al Catálogo</router-link>
        <button class="btn-logout" @click="handleLogout">Salir</button>
      </div>
    </nav>

    <div class="content">
      <h1 class="page-title">Subir Documento o Imagen</h1>

      <!-- Formulario documentos -->
      <form class="upload-form" @submit.prevent="handleSubmit">
        <label
          class="drop-zone"
          for="doc-file-input"
          :class="{ 'drag-over': isDragging }"
          @dragenter.prevent="isDragging = true"
          @dragover.prevent="isDragging = true"
          @dragleave.self="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input
            id="doc-file-input"
            ref="fileInput"
            type="file"
            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            style="display:none"
            @change="handleFileChange"
          />
          <div v-if="!selectedFile" class="drop-placeholder">
            <span class="drop-icon">📄</span>
            <p>Arrastra un archivo o haz clic para seleccionar</p>
            <small>Imágenes (JPG, PNG, GIF) · PDF · Word · Excel · PowerPoint · Máx. 50 MB</small>
          </div>
          <div v-else class="file-preview" @click.prevent>
            <img v-if="previewUrl" :src="previewUrl" class="img-preview" alt="preview" />
            <span v-else class="file-icon">{{ fileIcon }}</span>
            <div class="file-meta">
              <p class="file-name">{{ selectedFile.name }}</p>
              <p class="file-size">{{ formatSize(selectedFile.size) }}</p>
            </div>
            <button type="button" class="btn-clear" @click.prevent.stop="clearFile">✕</button>
          </div>
        </label>

        <input
          v-model="nombre"
          class="input-field"
          type="text"
          placeholder="Nombre del archivo (opcional)"
          maxlength="255"
          @input="nombre = sanitize(nombre)"
        />

        <textarea
          v-model="descripcion"
          class="input-field textarea"
          placeholder="Descripción (opcional)"
          rows="3"
          maxlength="500"
          @input="descripcion = sanitize(descripcion)"
        ></textarea>

        <p v-if="error"   class="msg error">{{ error }}</p>
        <p v-if="success" class="msg success">{{ success }}</p>

        <button type="submit" class="btn-submit" :disabled="uploading || !selectedFile">
          {{ uploading ? 'Subiendo…' : 'Subir archivo' }}
        </button>
      </form>

      <!-- Listado documentos -->
      <h2 class="section-title">Archivos subidos</h2>

      <div v-if="loadingDocs" class="loading"><div class="spinner"></div></div>

      <div v-else-if="docs.length === 0" class="empty">
        <p>Todavía no hay archivos subidos.</p>
      </div>

      <div v-else class="docs-grid">
        <div v-for="doc in docs" :key="doc.id" class="doc-card">
          <span class="doc-icon">{{ mimetypeIcon(doc.mimetype) }}</span>
          <div class="doc-info">
            <p class="doc-name">{{ doc.nombre }}</p>
            <p class="doc-desc" v-if="doc.descripcion">{{ doc.descripcion }}</p>
            <p class="doc-meta">{{ formatSize(doc.size) }} · {{ formatDate(doc.created_at) }}</p>
          </div>
          <div class="doc-actions">
            <a :href="downloadUrl(doc.id)" target="_blank" class="btn-action btn-view">Ver</a>
            <button class="btn-action btn-delete" @click="handleDelete(doc.id)">Eliminar</button>
          </div>
        </div>
      </div>

      <!-- Listado APKs -->
      <h2 class="section-title apk-title">APKs disponibles</h2>

      <div v-if="loadingApks" class="loading"><div class="spinner"></div></div>

      <div v-else-if="apks.length === 0" class="empty">
        <p>Todavía no hay APKs subidos.</p>
      </div>

      <div v-else class="docs-grid">
        <div v-for="apk in apks" :key="apk.id" class="doc-card apk-card">
          <span class="doc-icon">🤖</span>
          <div class="doc-info">
            <p class="doc-name">{{ apk.nombre }}</p>
            <p class="doc-desc" v-if="apk.descripcion">{{ apk.descripcion }}</p>
            <p class="doc-meta">{{ formatSize(apk.size) }} · {{ formatDate(apk.created_at) }}</p>
          </div>
          <div class="doc-actions">
            <a :href="apkDownloadUrl(apk.id)" class="btn-action btn-download">Descargar</a>
            <button class="btn-action btn-delete" @click="handleDeleteApk(apk.id)">Eliminar</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import api from '../config/axios.js'

const router    = useRouter()
const authStore = useAuthStore()

const sanitize = (val) => val.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ0-9 @_]/g, '')

// ── Documentos ────────────────────────────────────────────────────────────────
const docs        = ref([])
const loadingDocs = ref(true)
const uploading   = ref(false)
const isDragging  = ref(false)

const selectedFile = ref(null)
const previewUrl   = ref(null)
const nombre       = ref('')
const descripcion  = ref('')
const error        = ref('')
const success      = ref('')
const fileInput    = ref(null)

const ICON_MAP = {
  'application/pdf': '📕',
  'application/msword': '📘',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
  'application/vnd.ms-excel': '📗',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗',
  'application/vnd.ms-powerpoint': '📙',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📙',
}

const mimetypeIcon = (mime) => {
  if (!mime) return '📄'
  if (mime.startsWith('image/')) return '🖼️'
  return ICON_MAP[mime] || '📄'
}

const fileIcon = computed(() =>
  selectedFile.value ? mimetypeIcon(selectedFile.value.type) : '📄'
)

const setFile = (file) => {
  if (!file) return
  selectedFile.value = file
  nombre.value = nombre.value || file.name
  previewUrl.value = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
  error.value = ''
  success.value = ''
}

const handleFileChange = (e) => setFile(e.target.files[0])
const handleDrop = (e) => { isDragging.value = false; setFile(e.dataTransfer.files[0]) }

const clearFile = () => {
  selectedFile.value = null
  previewUrl.value   = null
  nombre.value       = ''
  if (fileInput.value) fileInput.value.value = ''
}

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (d) =>
  new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })

const downloadUrl = (id) => {
  const token = localStorage.getItem('token')
  return `${import.meta.env.VITE_API_URL || '/api'}/documents/${id}/file?token=${token}`
}

const fetchDocs = async () => {
  loadingDocs.value = true
  try {
    const { data } = await api.get('/documents')
    docs.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loadingDocs.value = false
  }
}

const handleSubmit = async () => {
  error.value   = ''
  success.value = ''
  if (!selectedFile.value) return

  const form = new FormData()
  form.append('file', selectedFile.value)
  form.append('nombre', nombre.value || selectedFile.value.name)
  form.append('descripcion', descripcion.value)

  uploading.value = true
  try {
    await api.post('/documents', form)
    success.value = 'Archivo subido correctamente.'
    clearFile()
    descripcion.value = ''
    await fetchDocs()
  } catch (e) {
    error.value = e.response?.data?.message || 'Error al subir el archivo.'
  } finally {
    uploading.value = false
  }
}

const handleDelete = async (id) => {
  if (!confirm('¿Eliminar este archivo?')) return
  try {
    await api.delete(`/documents/${id}`)
    docs.value = docs.value.filter(d => d.id !== id)
  } catch (e) {
    alert(e.response?.data?.message || 'Error al eliminar.')
  }
}

// ── APKs (solo listado) ───────────────────────────────────────────────────────
const apks       = ref([])
const loadingApks = ref(true)

const apkDownloadUrl = (id) => {
  const token = localStorage.getItem('token')
  return `${import.meta.env.VITE_API_URL || '/api'}/apks/${id}/file?token=${token}`
}

const fetchApks = async () => {
  loadingApks.value = true
  try {
    const { data } = await api.get('/apks')
    apks.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loadingApks.value = false
  }
}

const handleDeleteApk = async (id) => {
  if (!confirm('¿Eliminar este APK?')) return
  try {
    await api.delete(`/apks/${id}`)
    apks.value = apks.value.filter(a => a.id !== id)
  } catch (e) {
    alert(e.response?.data?.message || 'Error al eliminar.')
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  fetchDocs()
  fetchApks()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');

.docs-page {
  min-height: 100vh;
  background: #0a0a0f;
  font-family: 'DM Sans', sans-serif;
  color: #f0f0f5;
}

/* Navbar */
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
.brand-icon, .accent { color: #e63946; }
.navbar-actions { display: flex; gap: 12px; align-items: center; }

.btn-back {
  background: transparent;
  border: 1px solid #2a2a3a;
  color: #6b6b80;
  text-decoration: none;
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 0.88rem;
  transition: all 0.2s;
}
.btn-back:hover { border-color: #e63946; color: #e63946; }

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
.btn-logout:hover { border-color: #e63946; color: #e63946; }

/* Content */
.content {
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.page-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.2rem;
  letter-spacing: 3px;
  margin-bottom: 32px;
}

/* Form */
.upload-form { display: flex; flex-direction: column; gap: 16px; margin-bottom: 48px; }

.drop-zone {
  border: 2px dashed #2a2a3a;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #13131a;
}
.drop-zone:hover, .drop-zone.drag-over {
  border-color: #e63946;
  background: #1a1014;
}

.drop-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.drop-icon { font-size: 2.5rem; }
.drop-placeholder p { color: #b0b0c0; margin: 0; }
.drop-placeholder small { color: #4a4a5a; font-size: 0.8rem; }

.file-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
}
.img-preview {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #2a2a3a;
  flex-shrink: 0;
}
.file-icon { font-size: 3rem; flex-shrink: 0; }
.file-meta { flex: 1; }
.file-name { font-weight: 500; margin: 0 0 4px; word-break: break-all; }
.file-size { color: #6b6b80; margin: 0; font-size: 0.85rem; }
.btn-clear {
  background: none; border: none; color: #6b6b80; font-size: 1.1rem;
  cursor: pointer; padding: 4px 8px; border-radius: 4px;
}
.btn-clear:hover { color: #e63946; }

.input-field {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  padding: 12px 16px;
  color: #f0f0f5;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}
.input-field:focus { border-color: #e63946; }
.textarea { resize: vertical; }

.msg { margin: 0; font-size: 0.9rem; padding: 10px 14px; border-radius: 8px; }
.error   { background: #2a0810; color: #e63946; border: 1px solid #e63946; }
.success { background: #0a2a10; color: #4ade80; border: 1px solid #4ade80; }

.btn-submit {
  background: #e63946;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
  align-self: flex-start;
}
.btn-submit:hover:not(:disabled) { background: #c1121f; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

/* List */
.section-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 2px;
  margin-bottom: 20px;
}
.apk-title { margin-top: 48px; }

.loading { display: flex; justify-content: center; padding: 40px; }
.spinner {
  width: 36px; height: 36px;
  border: 3px solid #2a2a3a;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.empty { text-align: center; padding: 40px; color: #6b6b80; }

.docs-grid { display: flex; flex-direction: column; gap: 12px; }

.doc-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 10px;
  padding: 16px 20px;
  transition: border-color 0.2s;
}
.doc-card:hover { border-color: #3a3a4a; }
.apk-card:hover { border-color: #16a34a44; }

.doc-icon { font-size: 2rem; flex-shrink: 0; }

.doc-info { flex: 1; min-width: 0; }
.doc-name {
  font-weight: 500;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.doc-desc { color: #6b6b80; font-size: 0.85rem; margin: 0 0 4px; }
.doc-meta { color: #4a4a5a; font-size: 0.78rem; margin: 0; }

.doc-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-action {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 0.82rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  text-decoration: none;
  border: none;
}
.btn-view {
  background: #1e2a3a;
  color: #60a5fa;
  border: 1px solid #2a3a4a;
}
.btn-view:hover { background: #253547; }
.btn-download {
  background: #0f2a1a;
  color: #4ade80;
  border: 1px solid #1a3a28;
}
.btn-download:hover { background: #163520; }
.btn-delete {
  background: #2a0810;
  color: #e63946;
  border: 1px solid #3a1018;
}
.btn-delete:hover { background: #3a0f18; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
