<template>
  <div class="admin-shell" :class="{ 'sidebar-open': isSidebarOpen, 'theme-light': isLightTheme }">
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <aside class="sidebar">
      <div class="sidebar-header">
        <div>
          <h2>Admin Database</h2>
          <p>{{ authStore.user?.full_name }}</p>
          <span class="muted">{{ authStore.user?.email }}</span>
        </div>
      </div>
      <nav class="sidebar-nav">
        <button
          v-for="table in tables"
          :key="table.name"
          :class="['nav-item', { active: table.name === selectedTableName }]"
          @click="selectTable(table.name)"
        >
          <span>🗂️</span>
          {{ table.label }}
        </button>
      </nav>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </aside>

    <main class="content">
      <button class="mobile-menu-btn" @click="toggleSidebar">☰ Menu</button>
      <header class="content-header">
        <div>
          <h1>{{ selectedTable?.label || 'Database' }}</h1>
          <p class="breadcrumb">Admin / Tables / {{ selectedTable?.name || '...' }}</p>
        </div>
        <div class="header-actions">
          <button
            class="theme-toggle-btn"
            :title="isLightTheme ? 'Switch to dark theme' : 'Switch to light theme'"
            @click="toggleTheme"
          >
            {{ isLightTheme ? '🌙' : '☀️' }}
          </button>
          <button class="btn-secondary" @click="refreshRows" :disabled="loading">
            Refresh
          </button>
          <button class="btn-primary" @click="openCreate" :disabled="!selectedTable">
            Add Row
          </button>
        </div>
      </header>

      <div v-if="error" class="error-alert">⚠️ {{ error }}</div>

      <div v-if="loading" class="loading-state">Loading rows…</div>

      <div v-else class="table-wrapper">
        <table v-if="rows.length" class="data-table">
          <thead>
            <tr>
              <th v-for="column in selectedTable?.columns" :key="column.name">
                {{ column.name }}
              </th>
              <th class="actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="rowKey(row)">
              <td v-for="column in selectedTable?.columns" :key="column.name">
                {{ formatCell(row[column.name], column.name) }}
              </td>
              <td class="actions-col">
                <button class="btn-link" @click="openEdit(row)">Edit</button>
                <button class="btn-link danger" @click="deleteRow(row)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="empty-state">
          No rows found in this table.
        </div>
      </div>

      <div v-if="selectedTable" class="pagination">
        <button class="btn-secondary" @click="prevPage" :disabled="page <= 1 || loading">
          Previous
        </button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button class="btn-secondary" @click="nextPage" :disabled="page >= totalPages || loading">
          Next
        </button>
      </div>
    </main>
  </div>

  <div v-if="editorOpen" class="modal-backdrop">
    <div class="modal-card">
      <header>
        <h3>{{ editorMode === 'create' ? 'Add Row' : 'Edit Row' }}</h3>
        <button class="btn-link" @click="closeEditor">Close</button>
      </header>
      <form class="modal-form" @submit.prevent="saveRow">
        <div v-for="column in formColumns" :key="column.name" class="field">
          <label>
            {{ column.name }}
            <span v-if="column.primary_key" class="pill">PK</span>
          </label>
          <input
            v-if="inputType(column) !== 'checkbox'"
            :type="inputType(column)"
            v-model="editorData[column.name]"
            :disabled="column.autoincrement && editorMode === 'create'"
          />
          <input
            v-else
            type="checkbox"
            v-model="editorData[column.name]"
          />
        </div>
        <div class="modal-actions">
          <button class="btn-secondary" type="button" @click="closeEditor">Cancel</button>
          <button class="btn-primary" type="submit" :disabled="saving">
            {{ saving ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminService } from '@/services/admin'
import type { TableColumnSchema, TableSchema } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

const THEME_KEY = 'admin_dashboard_theme'
const isLightTheme = ref(true)
function toggleTheme() {
  isLightTheme.value = !isLightTheme.value
  localStorage.setItem(THEME_KEY, isLightTheme.value ? 'light' : 'dark')
}

const tables = ref<TableSchema[]>([])
const selectedTableName = ref('')
const rows = ref<Record<string, any>[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const page = ref(1)
const perPage = ref(25)
const total = ref(0)

const editorOpen = ref(false)
const editorMode = ref<'create' | 'edit'>('create')
const editorData = ref<Record<string, any>>({})
const editorKey = ref<Record<string, any>>({})

const selectedTable = computed(() => tables.value.find((t) => t.name === selectedTableName.value))
const isUsersTable = computed(() => selectedTableName.value === 'users')
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)))
const formColumns = computed(() => {
  const cols = selectedTable.value?.columns ?? []
  const editable = cols.filter(
    (column) => !['created_at', 'updated_at'].includes(column.name)
  )
  if (!isUsersTable.value) return editable
  const withoutPasswordHash = editable.filter((column) => column.name !== 'password_hash')
  return [
    ...withoutPasswordHash,
    {
      name: 'password',
      type: 'PASSWORD',
      nullable: false,
      primary_key: false,
      autoincrement: false,
      has_default: false
    }
  ]
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const loadTables = async () => {
  error.value = null
  try {
    const response = await adminService.getTables()
    if (response.success) {
      tables.value = response.data.tables
      if (!selectedTableName.value && tables.value.length) {
        selectedTableName.value = tables.value[0]?.name || ''
      }
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to load tables'
  }
}

const loadRows = async () => {
  if (!selectedTableName.value) return
  loading.value = true
  error.value = null
  try {
    const response = await adminService.getTableRows(
      selectedTableName.value,
      page.value,
      perPage.value
    )
    if (response.success) {
      rows.value = response.data.rows
      total.value = response.data.total
    }
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to load rows'
  } finally {
    loading.value = false
  }
}

const selectTable = (tableName: string) => {
  selectedTableName.value = tableName
  page.value = 1
}

const refreshRows = () => {
  loadRows()
}

const openCreate = () => {
  if (!selectedTable.value) return
  editorMode.value = 'create'
  editorData.value = {}
  editorKey.value = {}
  formColumns.value.forEach((column) => {
    editorData.value[column.name] = column.type.includes('BOOLEAN') ? false : ''
  })
  editorOpen.value = true
}

const openEdit = (row: Record<string, any>) => {
  if (!selectedTable.value) return
  editorMode.value = 'edit'
  const normalized = normalizeRow(row)
  const filtered: Record<string, any> = {}
  formColumns.value.forEach((column) => {
    filtered[column.name] = normalized[column.name] ?? ''
  })
  editorData.value = filtered
  editorKey.value = buildKey(row)
  editorOpen.value = true
}

const closeEditor = () => {
  editorOpen.value = false
}

const saveRow = async () => {
  if (!selectedTable.value) return
  saving.value = true
  error.value = null
  try {
    const payload = { ...editorData.value }
    if (isUsersTable.value) {
      if (editorMode.value === 'create' && !payload.password) {
        error.value = 'Password is required for new users.'
        return
      }
      if (editorMode.value === 'edit' && !payload.password) {
        delete payload.password
      }
    }

    if (editorMode.value === 'create') {
      await adminService.createRow(selectedTable.value.name, payload)
    } else {
      await adminService.updateRow(selectedTable.value.name, editorKey.value, payload)
    }
    editorOpen.value = false
    await loadRows()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to save row'
  } finally {
    saving.value = false
  }
}

const deleteRow = async (row: Record<string, any>) => {
  if (!selectedTable.value) return
  const key = buildKey(row)
  if (!Object.keys(key).length) return
  if (!confirm('Delete this row?')) return
  try {
    await adminService.deleteRow(selectedTable.value.name, key)
    await loadRows()
  } catch (err: any) {
    error.value = err?.response?.data?.message || 'Failed to delete row'
  }
}

const buildKey = (row: Record<string, any>) => {
  const key: Record<string, any> = {}
  selectedTable.value?.primary_key.forEach((pk) => {
    key[pk] = row[pk]
  })
  return key
}

const rowKey = (row: Record<string, any>) => {
  if (!selectedTable.value?.primary_key.length) return JSON.stringify(row)
  return selectedTable.value.primary_key.map((pk) => row[pk]).join('-')
}

const inputType = (column: TableColumnSchema) => {
  if (column.name === 'password' || column.type.includes('PASSWORD')) return 'password'
  if (column.type.includes('BOOLEAN')) return 'checkbox'
  if (column.type.includes('DATE') && !column.type.includes('TIME')) return 'date'
  if (column.type.includes('TIME') || column.type.includes('DATETIME')) return 'datetime-local'
  if (column.type.includes('INT') || column.type.includes('NUM') || column.type.includes('DEC')) {
    return 'number'
  }
  return 'text'
}

const normalizeRow = (row: Record<string, any>) => {
  const normalized: Record<string, any> = { ...row }
  selectedTable.value?.columns.forEach((column) => {
    const value = normalized[column.name]
    if (!value) return
    if (column.type.includes('BOOLEAN')) {
      normalized[column.name] = Boolean(value)
      return
    }
    if (column.type.includes('DATE') && !column.type.includes('TIME')) {
      normalized[column.name] = String(value).slice(0, 10)
    } else if (column.type.includes('TIME') || column.type.includes('DATETIME')) {
      const text = String(value).replace('Z', '')
      normalized[column.name] = text.slice(0, 16)
    }
  })
  return normalized
}

const formatCell = (value: any, columnName: string) => {
  if (columnName === 'password_hash') return '••••••'
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return value
}

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value += 1
  }
}

watch(selectedTableName, () => {
  loadRows()
})

watch(page, () => {
  loadRows()
})

onMounted(async () => {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved === 'dark') isLightTheme.value = false
  else isLightTheme.value = true

  await loadTables()
  await loadRows()
})
</script>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 280px 1fr;
  min-height: 100vh;
  background: var(--bg-page);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-xl);
  background: var(--bg-card);
  border-right: 1px solid var(--border-light);
}

.sidebar-header h2 {
  margin-bottom: 4px;
}

.sidebar-header p {
  font-weight: 600;
  margin: 0;
}

.sidebar-header .muted {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
  font-weight: 600;
}

.nav-item span {
  font-size: 16px;
  opacity: 0.9;
}

.nav-item:not(.active) {
  color: #1f2937;
}

.nav-item.active {
  border-color: var(--brand-primary);
  background: rgba(79, 70, 229, 0.08);
  font-weight: 600;
  color: #1e1b4b;
}

.btn-logout {
  margin-top: auto;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  background: #ef4444;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.content {
  padding: var(--space-xl);
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-lg);
}

.breadcrumb {
  color: var(--text-secondary);
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: none;
  cursor: pointer;
  font-weight: 600;
}

.btn-primary {
  background: var(--brand-primary);
  color: white;
}

.btn-secondary {
  background: var(--bg-muted);
  color: var(--text-primary);
}

.btn-link {
  background: none;
  border: none;
  color: var(--brand-primary);
  cursor: pointer;
  font-weight: 600;
}

.btn-link.danger {
  color: #ef4444;
}

.error-alert {
  padding: 12px 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-md);
}

.loading-state,
.empty-state {
  padding: 24px;
  text-align: center;
  color: var(--text-secondary);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-light);
}

.table-wrapper {
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
}

.data-table th,
.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-light);
  text-align: left;
  font-size: var(--font-size-sm);
}

.actions-col {
  white-space: nowrap;
}

.pagination {
  margin-top: var(--space-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal-card {
  width: min(640px, 94vw);
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
}

.modal-card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.modal-form {
  display: grid;
  gap: 14px;
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 6px;
}

.field {
  display: grid;
  gap: 6px;
}

.field input {
  padding: 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.pill {
  display: inline-block;
  margin-left: 6px;
  padding: 2px 6px;
  font-size: 11px;
  background: var(--bg-muted);
  border-radius: 999px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: var(--space-sm);
}

@media (max-width: 900px) {
  .admin-shell { flex-direction: column; }
  .sidebar { width: 260px; height: 100vh; position: fixed; left: 0; top: 0; transform: translateX(-100%); transition: transform 0.3s ease; z-index: 30; }
  .sidebar-open .sidebar { transform: translateX(0); }
  .sidebar-nav { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; }
  .nav-item { width: 100%; }
  .sidebar-backdrop { display: block; }
  .content { margin-left: 0; padding: var(--space-md); }
  .content-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .header-actions { display: flex; flex-wrap: wrap; gap: 8px; width: 100%; }
  .mobile-menu-btn { display: inline-flex; }
}

@media (max-width: 600px) {
  .data-table { min-width: 560px; }
  .pagination { flex-direction: column; gap: 8px; }
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 20;
}

.theme-toggle-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--border-light);
  background: var(--bg-muted);
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background: var(--border-light);
}

/* ── Premium Dark SaaS Theme ── */
.admin-shell:not(.theme-light) {
  background:
    radial-gradient(900px 520px at -10% -15%, rgba(59, 130, 246, 0.18), transparent 55%),
    radial-gradient(820px 460px at 110% 0%, rgba(20, 184, 166, 0.16), transparent 52%),
    linear-gradient(180deg, #0b1220 0%, #0a1020 100%);
  color: #d7e2f2;
}

.admin-shell:not(.theme-light) .sidebar {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.78) 100%),
    radial-gradient(220px 140px at 10% 0%, rgba(56, 189, 248, 0.2), transparent 75%);
  border-right-color: rgba(148, 163, 184, 0.2);
  backdrop-filter: blur(18px);
}

.admin-shell:not(.theme-light) .sidebar-header h2 {
  color: #f1f5ff;
}

.admin-shell:not(.theme-light) .sidebar-header p {
  color: #e2e8f0;
}

.admin-shell:not(.theme-light) .sidebar-header .muted {
  color: #94a3b8;
}

.admin-shell:not(.theme-light) .nav-item {
  color: #b8c5d9;
  border-color: transparent;
}

.admin-shell:not(.theme-light) .nav-item:not(.active) {
  color: #b8c5d9;
}

.admin-shell:not(.theme-light) .nav-item:hover {
  background: rgba(59, 130, 246, 0.12);
  color: #eef5ff;
}

.admin-shell:not(.theme-light) .nav-item.active {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.28), rgba(59, 130, 246, 0.05));
  border-color: #60a5fa;
  color: #f7fbff;
  box-shadow: inset 0 0 0 1px rgba(96, 165, 250, 0.28);
}

.admin-shell:not(.theme-light) .btn-logout {
  background: rgba(239, 68, 68, 0.7);
}

.admin-shell:not(.theme-light) .content-header h1 {
  color: #f1f5ff;
}

.admin-shell:not(.theme-light) .breadcrumb {
  color: #97a8c1;
}

.admin-shell:not(.theme-light) .theme-toggle-btn {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(148, 163, 184, 0.24);
  color: #d7e2f2;
}

.admin-shell:not(.theme-light) .theme-toggle-btn:hover {
  background: rgba(59, 130, 246, 0.15);
}

.admin-shell:not(.theme-light) .btn-primary {
  background: linear-gradient(135deg, #2563eb, #06b6d4);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}

.admin-shell:not(.theme-light) .btn-secondary {
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.24);
  color: #d7e2f2;
}

.admin-shell:not(.theme-light) .btn-secondary:hover {
  background: rgba(148, 163, 184, 0.15);
}

.admin-shell:not(.theme-light) .btn-link {
  color: #60a5fa;
}

.admin-shell:not(.theme-light) .btn-link.danger {
  color: #fda4af;
}

.admin-shell:not(.theme-light) .error-alert {
  background: rgba(239, 68, 68, 0.16);
  border-color: rgba(248, 113, 113, 0.36);
  color: #fda4af;
}

.admin-shell:not(.theme-light) .loading-state,
.admin-shell:not(.theme-light) .empty-state {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(148, 163, 184, 0.2);
  color: #97a8c1;
}

.admin-shell:not(.theme-light) .table-wrapper {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(148, 163, 184, 0.2);
}

.admin-shell:not(.theme-light) .data-table th {
  background: rgba(30, 41, 59, 0.9);
  color: #9eb2cb;
  border-bottom-color: rgba(148, 163, 184, 0.24);
}

.admin-shell:not(.theme-light) .data-table td {
  color: #d5e2f4;
  border-bottom-color: rgba(148, 163, 184, 0.14);
}

.admin-shell:not(.theme-light) .data-table tbody tr:nth-child(even) {
  background: rgba(15, 23, 42, 0.24);
}

.admin-shell:not(.theme-light) .data-table tbody tr:hover td {
  background: rgba(59, 130, 246, 0.12);
}

.admin-shell:not(.theme-light) .pagination {
  color: #97a8c1;
}

.admin-shell:not(.theme-light) .modal-backdrop {
  background: rgba(2, 6, 23, 0.72);
  backdrop-filter: blur(7px);
}

.admin-shell:not(.theme-light) .modal-card {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.88));
  border-color: rgba(148, 163, 184, 0.22);
  box-shadow: 0 20px 50px rgba(2, 6, 23, 0.5);
}

.admin-shell:not(.theme-light) .modal-card header h3 {
  color: #f1f5ff;
}

.admin-shell:not(.theme-light) .field label {
  color: #97a8c1;
}

.admin-shell:not(.theme-light) .field input {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(148, 163, 184, 0.24);
  color: #e2e8f0;
}

.admin-shell:not(.theme-light) .field input:focus {
  border-color: rgba(56, 189, 248, 0.82);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.16);
  outline: none;
}

.admin-shell:not(.theme-light) .pill {
  background: rgba(59, 130, 246, 0.18);
  color: #93c5fd;
}

.admin-shell:not(.theme-light) .mobile-menu-btn {
  background: rgba(30, 41, 59, 0.65);
  border-color: rgba(148, 163, 184, 0.24);
  color: #d7e2f2;
}
</style>