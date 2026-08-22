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
      <h1 class="page-title">Documentos y APKs</h1>

      <!-- Sección 1: Subir archivo -->
      <div class="section-card">
        <div class="section-header section-trigger" @click="showUploadDialog = true">
          <div class="section-left">
            <span class="section-emoji">📄</span>
            <span class="section-label">Subir archivo</span>
            <span class="section-hint">Imágenes, PDF, Word, Excel, comprimidos…</span>
          </div>
          <span class="section-action">Nuevo +</span>
        </div>
      </div>

      <!-- Sección 2: Lista de archivos -->
      <div class="section-card">
        <button class="section-header section-toggle" @click="docsOpen = !docsOpen">
          <div class="section-left">
            <span class="section-emoji">📁</span>
            <span class="section-label">Archivos subidos</span>
            <span v-if="!loadingDocs" class="section-badge">{{ docs.length }}</span>
          </div>
          <span class="chevron" :class="{ open: docsOpen }">›</span>
        </button>

        <div v-if="docsOpen" class="section-body">
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
                <button v-if="!authStore.isGuest" class="btn-action btn-delete" @click="handleDelete(doc.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sección 3: Lista de APKs -->
      <div class="section-card">
        <button class="section-header section-toggle" @click="apksOpen = !apksOpen">
          <div class="section-left">
            <span class="section-emoji">🤖</span>
            <span class="section-label">APKs disponibles</span>
            <span v-if="!loadingApks" class="section-badge apk-badge">{{ apks.length }}</span>
          </div>
          <span class="chevron" :class="{ open: apksOpen }">›</span>
        </button>

        <div v-if="apksOpen" class="section-body">
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
                <button v-if="!authStore.isGuest" class="btn-action btn-delete" @click="handleDeleteApk(apk.id)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

  <!-- Dialog: Subir archivo -->
  <div v-if="showUploadDialog" class="modal-overlay" @click.self="closeUploadDialog">
    <div class="modal-box">
      <div class="modal-head">
        <h3 class="modal-title">Subir archivo</h3>
        <button class="btn-modal-close" @click="closeUploadDialog">✕</button>
      </div>

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
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.7z,.gz,.tar"
          style="display:none"
          @change="handleFileChange"
        />
        <div v-if="!selectedFile" class="drop-placeholder">
          <span class="drop-icon">📄</span>
          <p>Arrastra un archivo o haz clic para seleccionar</p>
          <small>Imágenes · PDF · Word · Excel · PowerPoint · Comprimidos · Máx. 50 MB</small>
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
        class="modal-input"
        type="text"
        placeholder="Nombre del archivo (opcional)"
        maxlength="255"
        @input="nombre = sanitize(nombre)"
      />

      <textarea
        v-model="descripcion"
        class="modal-input modal-textarea"
        placeholder="Descripción (opcional)"
        rows="3"
        maxlength="500"
        @input="descripcion = sanitize(descripcion)"
      ></textarea>

      <p v-if="uploadError"   class="msg error">{{ uploadError }}</p>
      <p v-if="uploadSuccess" class="msg success">{{ uploadSuccess }}</p>

      <div class="modal-actions">
        <button class="btn-modal-cancel" @click="closeUploadDialog">Cancelar</button>
        <button
          class="btn-modal-confirm"
          :disabled="uploading || !selectedFile"
          @click="handleSubmit"
        >
          {{ uploading ? 'Subiendo…' : 'Subir archivo' }}
        </button>
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

// ── Accordion state ───────────────────────────────────────────────────────────
const docsOpen = ref(false)
const apksOpen = ref(false)

// ── Dialog upload ─────────────────────────────────────────────────────────────
const showUploadDialog = ref(false)

const closeUploadDialog = () => {
  showUploadDialog.value = false
  clearFile()
  descripcion.value  = ''
  uploadError.value  = ''
  uploadSuccess.value = ''
}

// ── Documentos ────────────────────────────────────────────────────────────────
const docs        = ref([])
const loadingDocs = ref(true)
const uploading   = ref(false)
const isDragging  = ref(false)

const selectedFile  = ref(null)
const previewUrl    = ref(null)
const nombre        = ref('')
const descripcion   = ref('')
const uploadError   = ref('')
const uploadSuccess = ref('')
const fileInput     = ref(null)

const ICON_MAP = {
  'application/pdf': '📕',
  'application/msword': '📘',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📘',
  'application/vnd.ms-excel': '📗',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📗',
  'application/vnd.ms-powerpoint': '📙',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📙',
}

const COMPRESSED_MIMETYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/vnd.rar',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-gzip',
  'application/x-tar',
]

const mimetypeIcon = (mime) => {
  if (!mime) return '📄'
  if (mime.startsWith('image/')) return '🖼️'
  if (COMPRESSED_MIMETYPES.includes(mime)) return '🗜️'
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
  uploadError.value   = ''
  uploadSuccess.value = ''
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

const apiBase = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const downloadUrl = (id) => {
  const token = localStorage.getItem('token')
  return `${apiBase}/documents/${id}/file?token=${token}`
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
  uploadError.value   = ''
  uploadSuccess.value = ''
  if (!selectedFile.value) return

  const form = new FormData()
  form.append('file',        selectedFile.value)
  form.append('nombre',      nombre.value || selectedFile.value.name)
  form.append('descripcion', descripcion.value)

  uploading.value = true
  try {
    await api.post('/documents', form)
    uploadSuccess.value = 'Archivo subido correctamente.'
    clearFile()
    descripcion.value = ''
    await fetchDocs()
    docsOpen.value = true
  } catch (e) {
    uploadError.value = e.response?.data?.message || 'Error al subir el archivo.'
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

// ── APKs ──────────────────────────────────────────────────────────────────────
const apks        = ref([])
const loadingApks = ref(true)

const apkDownloadUrl = (id) => {
  const token = localStorage.getItem('token')
  return `${apiBase}/apks/${id}/file?token=${token}`
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

/* ── Navbar ─────────────────────────────────────────── */
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

/* ── Content ────────────────────────────────────────── */
.content {
  max-width: 760px;
  margin: 0 auto;
  padding: 48px 24px 80px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.2rem;
  letter-spacing: 3px;
  margin: 0 0 8px;
}

/* ── Section cards ──────────────────────────────────── */
.section-card {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: inherit;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.15s;
}
.section-header:hover { background: #1a1a24; }

.section-trigger { cursor: pointer; }

.section-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-emoji { font-size: 1.3rem; }

.section-label {
  font-weight: 500;
  font-size: 1rem;
  color: #f0f0f5;
}

.section-hint {
  font-size: 0.8rem;
  color: #4a4a5a;
  margin-left: 4px;
}

.section-badge {
  background: #2a2a3a;
  color: #9090a8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  min-width: 22px;
  text-align: center;
}

.apk-badge {
  background: #0f2a1a;
  color: #4ade80;
}

.section-action {
  font-size: 0.85rem;
  font-weight: 600;
  color: #7c3aed;
  background: rgba(124,58,237,0.1);
  padding: 6px 14px;
  border-radius: 6px;
  transition: background 0.2s;
}
.section-trigger:hover .section-action {
  background: rgba(124,58,237,0.2);
}

.chevron {
  font-size: 1.4rem;
  color: #4a4a5a;
  transition: transform 0.25s;
  line-height: 1;
  display: inline-block;
}
.chevron.open { transform: rotate(90deg); }

/* ── Section body (accordion content) ──────────────── */
.section-body {
  border-top: 1px solid #2a2a3a;
  padding: 20px 24px 24px;
}

/* ── Loading / Empty ────────────────────────────────── */
.loading { display: flex; justify-content: center; padding: 32px; }
.spinner {
  width: 32px; height: 32px;
  border: 3px solid #2a2a3a;
  border-top-color: #e63946;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.empty { text-align: center; padding: 32px; color: #6b6b80; font-size: 0.9rem; }

/* ── Docs grid ──────────────────────────────────────── */
.docs-grid { display: flex; flex-direction: column; gap: 10px; }

.doc-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #0a0a0f;
  border: 1px solid #2a2a3a;
  border-radius: 10px;
  padding: 14px 18px;
  transition: border-color 0.2s;
}
.doc-card:hover { border-color: #3a3a4a; }
.apk-card:hover { border-color: rgba(22,163,74,0.3); }

.doc-icon { font-size: 1.8rem; flex-shrink: 0; }

.doc-info { flex: 1; min-width: 0; }
.doc-name {
  font-weight: 500; font-size: 0.95rem;
  margin: 0 0 3px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.doc-desc { color: #6b6b80; font-size: 0.82rem; margin: 0 0 3px; }
.doc-meta { color: #4a4a5a; font-size: 0.75rem; margin: 0; }

.doc-actions { display: flex; gap: 8px; flex-shrink: 0; }
.btn-action {
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  text-decoration: none;
  border: none;
}
.btn-view     { background: #1e2a3a; color: #60a5fa; border: 1px solid #2a3a4a; }
.btn-view:hover { background: #253547; }
.btn-download { background: #0f2a1a; color: #4ade80; border: 1px solid #1a3a28; }
.btn-download:hover { background: #163520; }
.btn-delete   { background: #2a0810; color: #e63946; border: 1px solid #3a1018; }
.btn-delete:hover { background: #3a0f18; }

/* ── Modal overlay ──────────────────────────────────── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}

.modal-box {
  background: #13131a;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  padding: 28px 32px 32px;
  width: 100%;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.6rem;
  letter-spacing: 2px;
  margin: 0;
  color: #f0f0f5;
}

.btn-modal-close {
  background: none;
  border: none;
  color: #4a4a5a;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: color 0.2s;
  line-height: 1;
}
.btn-modal-close:hover { color: #e63946; }

/* ── Drop zone (dentro del dialog) ─────────────────── */
.drop-zone {
  border: 2px dashed #2a2a3a;
  border-radius: 12px;
  padding: 36px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #0a0a0f;
  display: block;
}
.drop-zone:hover, .drop-zone.drag-over {
  border-color: #7c3aed;
  background: #120a1f;
}

.drop-placeholder { display: flex; flex-direction: column; align-items: center; gap: 8px; }
.drop-icon { font-size: 2.2rem; }
.drop-placeholder p { color: #b0b0c0; margin: 0; font-size: 0.95rem; }
.drop-placeholder small { color: #4a4a5a; font-size: 0.78rem; }

.file-preview {
  display: flex;
  align-items: center;
  gap: 14px;
  text-align: left;
}
.img-preview {
  width: 72px; height: 72px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #2a2a3a;
  flex-shrink: 0;
}
.file-icon { font-size: 2.5rem; flex-shrink: 0; }
.file-meta { flex: 1; }
.file-name { font-weight: 500; margin: 0 0 4px; word-break: break-all; font-size: 0.9rem; }
.file-size { color: #6b6b80; margin: 0; font-size: 0.82rem; }
.btn-clear {
  background: none; border: none; color: #6b6b80;
  font-size: 1rem; cursor: pointer; padding: 4px 8px; border-radius: 4px;
}
.btn-clear:hover { color: #e63946; }

/* ── Modal inputs ───────────────────────────────────── */
.modal-input {
  background: #0a0a0f;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
  padding: 11px 14px;
  color: #f0f0f5;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.93rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.modal-input:focus { border-color: #7c3aed; }
.modal-textarea { resize: vertical; }

.msg { margin: 0; font-size: 0.88rem; padding: 10px 14px; border-radius: 8px; }
.error   { background: #2a0810; color: #e63946; border: 1px solid #e63946; }
.success { background: #0a2a10; color: #4ade80; border: 1px solid #4ade80; }

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 4px;
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
  background: #7c3aed;
  color: #fff;
  border: none;
  padding: 10px 22px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-modal-confirm:hover:not(:disabled) { background: #6d28d9; }
.btn-modal-confirm:disabled { opacity: 0.5; cursor: not-allowed; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
