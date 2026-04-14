<template>
  <div class="dashboard-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <!-- ===== SIDEBAR ===== -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="avatar-ring">
          <div class="avatar">{{ avatarInitials }}</div>
        </div>
        <h2>Coach Panel</h2>
        <p>{{ authStore.user?.full_name }}</p>
        <button
          class="theme-toggle-btn"
          type="button"
          :title="isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme'"
          @click="toggleTheme"
        >
          <span class="theme-toggle-icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
          <span class="theme-toggle-text">{{ isDarkTheme ? 'Light' : 'Dark' }}</span>
        </button>
      </div>
      <nav class="sidebar-nav">
        <a href="#" @click.prevent="setView('overview')" :class="['nav-item', { active: currentView === 'overview' }]">
          <span class="nav-icon">📊</span> Dashboard
        </a>
        <a href="#" @click.prevent="setView('batches')" :class="['nav-item', { active: currentView === 'batches' || currentView === 'students' }]">
          <span class="nav-icon">👥</span> My Batches
        </a>
        <a href="#" @click.prevent="setView('resources')" :class="['nav-item', { active: currentView === 'resources' }]">
          <span class="nav-icon">📌</span> Batch Portal
        </a>
        <a href="#" @click.prevent="setView('attendance')" :class="['nav-item', { active: currentView === 'attendance' }]">
          <span class="nav-icon">📋</span> Attendance
        </a>
        <a href="#" @click.prevent="setView('quizzes')" :class="['nav-item', { active: currentView === 'quizzes' }]">
          <span class="nav-icon">🧠</span> Quizzes
        </a>
      </nav>
      <div class="sidebar-section" v-if="batches.length">
        <div class="sidebar-section-title">My Batches</div>
        <button
          v-for="batch in batches"
          :key="`sidebar-batch-${batch.id}`"
          class="sidebar-batch"
          :class="{ active: selectedBatch?.id === batch.id && (currentView === 'resources' || currentView === 'quizzes') }"
          @click="currentView === 'quizzes' ? loadQuizzes(batch.id) : openBatchResources(batch)"
        >
          <span>{{ batch.batch_name }}</span>
          <small>Year {{ batch.year }}</small>
        </button>
      </div>
      <button @click="handleLogout" class="btn-logout">🚪 Logout</button>
    </aside>

    <!-- ===== MAIN CONTENT ===== -->
    <main class="main-content">
      <button class="mobile-menu-btn" @click="toggleSidebar">☰ Menu</button>
      <header class="content-header">
        <div>
          <h1>{{ viewTitle }}</h1>
          <p class="breadcrumb">
            <span @click="setView('overview')" class="crumb-link">Home</span>
            <span v-if="currentView !== 'overview'"> / <span @click="setView('batches')" class="crumb-link">Batches</span></span>
            <span v-if="currentView === 'students' && selectedBatch"> / {{ selectedBatch.batch_name }}</span>
            <span v-if="currentView === 'attendance' && selectedBatch"> / Attendance</span>
          </p>
        </div>
        <div class="header-date">📅 {{ todayFormatted }}</div>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div><p>Loading...</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p>⚠️ {{ error }}</p>
        <button @click="loadDashboard" class="btn-retry">Retry</button>
      </div>

      <div v-else>
        <!-- ============ OVERVIEW ============ -->
        <div v-if="currentView === 'overview'">
          <div class="stats-grid">
            <div class="stat-card" style="--accent:#667eea">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <h3>My Batches</h3>
                <p class="stat-value">{{ summary.stats?.batches_count || 0 }}</p>
              </div>
            </div>
            <div class="stat-card" style="--accent:#f093fb">
              <div class="stat-icon">📚</div>
              <div class="stat-info">
                <h3>Total Students</h3>
                <p class="stat-value">{{ summary.stats?.total_students || 0 }}</p>
              </div>
            </div>
            <div class="stat-card" style="--accent:#4facfe">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <h3>Quizzes</h3>
                <p class="stat-value">{{ summary.stats?.recent_quizzes || 0 }}</p>
              </div>
            </div>
            <div class="stat-card" style="--accent:#43e97b">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h3>Today's Attendance</h3>
                <p class="stat-value">{{ summary.stats?.today_attendance_rate || 0 }}%</p>
              </div>
            </div>
          </div>

          <div class="section-card">
            <div class="section-header">
              <h2>My Batches</h2>
              <button @click="setView('batches')" class="btn-link">View all →</button>
            </div>
            <div v-if="batches.length === 0" class="empty-state">
              <p>🎓 No batches assigned yet</p>
            </div>
            <div v-else class="batches-grid">
              <div v-for="batch in batches" :key="batch.id" class="batch-card" @click="openBatch(batch)">
                <div class="batch-card-top">
                  <span class="batch-year-badge">{{ batch.year }}</span>
                  <span class="batch-student-count">👤 {{ batch.student_count }}</span>
                </div>
                <h3>{{ batch.batch_name }}</h3>
                <div class="batch-card-bottom">
                  <button @click.stop="quickAttendance(batch)" class="btn-mini-primary">🎯 Attendance</button>
                </div>
              </div>
            </div>
          </div>

          <div class="section-card">
            <div class="section-header">
              <h2>AI Batch Copilot</h2>
              <div class="coach-ai-controls">
                <select v-model="coachAiBatchId" class="coach-ai-select">
                  <option :value="null">Select batch</option>
                  <option v-for="batch in batches" :key="`ai-batch-${batch.id}`" :value="batch.id">
                    {{ batch.batch_name }}
                  </option>
                </select>
                <button class="btn-secondary" @click="loadCoachAiInsights" :disabled="coachAiLoading || !coachAiBatchId">
                  {{ coachAiInsights ? 'Refresh AI' : 'Generate AI' }}
                </button>
              </div>
            </div>

            <div v-if="coachAiLoading" class="empty-state"><p>Generating coach insights...</p></div>
            <div v-else-if="coachAiError" class="error-state"><p>⚠️ {{ coachAiError }}</p></div>
            <div v-else-if="coachAiInsights" class="coach-ai-grid">
              <div class="coach-ai-col">
                <h4>Summary</h4>
                <ul>
                  <li v-for="(item, idx) in (coachAiInsights.summary || []).slice(0, 4)" :key="`ai-summary-${idx}`">{{ item }}</li>
                </ul>
              </div>
              <div class="coach-ai-col">
                <h4>Groups</h4>
                <ul>
                  <li v-for="(group, idx) in (coachAiInsights.groups || []).slice(0, 4)" :key="`ai-group-${idx}`">
                    {{ group.name }}: {{ group.count }}
                  </li>
                </ul>
              </div>
              <div class="coach-ai-col">
                <h4>Actions</h4>
                <ul>
                  <li v-for="(action, idx) in (coachAiInsights.actions || []).slice(0, 4)" :key="`ai-action-${idx}`">
                    {{ action.action || action }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-else class="empty-state"><p>Generate AI insights for any batch.</p></div>
          </div>

          <div v-if="summary.upcoming_quizzes?.length" class="section-card">
            <h2>Upcoming Quizzes</h2>
            <div class="upcoming-tests">
              <div v-for="quiz in summary.upcoming_quizzes" :key="quiz.id" class="upcoming-test-item">
                <div class="test-badge">🧠</div>
                <div>
                  <strong>{{ quiz.title }}</strong>
                  <p>{{ quiz.batch_name }} · {{ formatDate(quiz.open_at || quiz.created_at) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============ BATCHES ============ -->
        <div v-if="currentView === 'batches'">
          <div class="section-card">
            <h2>My Batches</h2>
            <div v-if="batches.length === 0" class="empty-state"><p>No batches assigned yet.</p></div>
            <div v-else class="batches-list">
              <div v-for="batch in batches" :key="batch.id" class="batch-row">
                <div class="batch-row-info">
                  <div class="batch-row-icon">📚</div>
                  <div>
                    <h3>{{ batch.batch_name }}</h3>
                    <p>Year {{ batch.year }} · {{ batch.student_count }} students</p>
                    <p v-if="batch.other_teachers?.length" class="co-teachers">
                      Co-teachers: {{ formatCoTeachers(batch.other_teachers) }}
                    </p>
                  </div>
                </div>
                <div class="batch-row-actions">
                  <button @click="openBatch(batch)" class="btn-secondary">👁 View Students</button>
                  <button @click="quickAttendance(batch)" class="btn-primary">🎯 Attendance</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============ STUDENTS ============ -->
        <div v-if="currentView === 'students' && selectedBatch">
          <div class="section-card">
            <div class="section-header">
              <div>
                <h2>{{ selectedBatch.batch_name }} — Students</h2>
                <p class="sub-text">{{ batchStudents.length }} students enrolled</p>
              </div>
              <button @click="setView('batches')" class="btn-secondary">← Back</button>
            </div>

            <div class="search-bar">
              <span class="search-icon">🔍</span>
              <input
                v-model="studentSearch"
                type="text"
                placeholder="Search by name, email, phone, ID…"
                class="search-input"
              />
              <button v-if="studentSearch" @click="studentSearch = ''" class="clear-search">✕</button>
            </div>

            <div v-if="loadingStudents" class="loading-state"><div class="spinner"></div></div>
            <div v-else-if="filteredStudents.length === 0" class="empty-state">
              <p>No students found{{ studentSearch ? ' for "' + studentSearch + '"' : '' }}.</p>
            </div>
            <div v-else class="students-table-wrap">
              <table class="students-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Attendance</th>
                    <th>Avg Score</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(student, idx) in filteredStudents"
                    :key="student.id"
                    class="student-row"
                    @click="openStudentProfile(student)"
                  >
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <div class="student-name-cell">
                        <div class="mini-avatar">{{ initials(student.full_name) }}</div>
                        <span>{{ student.full_name }}</span>
                      </div>
                    </td>
                    <td>{{ student.email || '—' }}</td>
                    <td>{{ student.phone_number || '—' }}</td>
                    <td>
                      <div class="attendance-pill" :class="attendancePillClass(student.attendance_rate)">
                        {{ student.attendance_rate }}%
                      </div>
                    </td>
                    <td>—</td>
                    <td>
                      <button @click.stop="openStudentProfile(student)" class="btn-mini">View</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="section-card">
            <div class="section-header">
              <div>
                <h2>📌 Batch Portal Resources</h2>
                <p class="sub-text">Share videos, articles, and links with this batch.</p>
              </div>
              <button @click="loadBatchResources" class="btn-secondary" :disabled="loadingResources">Refresh</button>
            </div>

            <div class="resource-form">
              <input v-model="resourceForm.title" class="input" type="text" placeholder="Title" />
              <input v-model="resourceForm.url" class="input" type="text" placeholder="Paste URL" />
              <select v-model="resourceForm.resource_type" class="input">
                <option value="link">Link</option>
                <option value="youtube">YouTube</option>
                <option value="article">Article</option>
                <option value="tool">Tool</option>
              </select>
              <input v-model="resourceForm.description" class="input" type="text" placeholder="Short description (optional)" />
              <label class="toggle">
                <input v-model="resourceForm.visible_to_students" type="checkbox" />
                Visible to students
              </label>
              <button class="btn-primary" @click="addBatchResource">Add Resource</button>
            </div>

            <div v-if="loadingResources" class="loading-state"><div class="spinner"></div></div>
            <div v-else-if="resourceError" class="empty-state"><p>⚠️ {{ resourceError }}</p></div>
            <div v-else-if="batchResources.length === 0" class="empty-state"><p>No resources yet.</p></div>
            <div v-else class="resource-grid">
              <div v-for="res in batchResources" :key="res.id" class="resource-card">
                <div class="resource-head">
                  <span class="resource-tag">{{ res.resource_type }}</span>
                  <span class="resource-date">{{ formatDate(res.created_at) }}</span>
                </div>
                <h4 class="resource-title">{{ res.title }}</h4>
                <p v-if="res.description" class="resource-desc">{{ res.description }}</p>
                <div v-if="getYoutubeEmbedUrl(res.url)" class="resource-embed">
                  <iframe
                    :src="getYoutubeEmbedUrl(res.url)"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
                <a v-else :href="res.url" target="_blank" rel="noopener" class="resource-link">Open resource ↗</a>
                <div class="resource-meta">
                  Added by {{ res.creator?.full_name || 'Coach' }}
                </div>
                <button class="btn-danger" @click="removeBatchResource(res.id)">Delete</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============ ATTENDANCE (gamified) ============ -->
        <div v-if="currentView === 'attendance'">
          <div v-if="!selectedBatch" class="section-card">
            <h2>🎯 Mark Attendance</h2>
            <p class="sub-text">Choose a batch to mark attendance</p>
            <div class="batches-grid" style="margin-top:1rem">
              <div
                v-for="batch in batches"
                :key="batch.id"
                class="batch-card clickable"
                @click="startAttendance(batch)"
              >
                <div class="batch-card-top">
                  <span class="batch-year-badge">{{ batch.year }}</span>
                  <span class="batch-student-count">👤 {{ batch.student_count }}</span>
                </div>
                <h3>{{ batch.batch_name }}</h3>
                <p class="batch-sub">Click to start attendance</p>
              </div>
            </div>
          </div>

          <div v-else>
            <div class="section-card attendance-header-card">
              <div class="attendance-top">
                <div>
                  <h2>📋 {{ selectedBatch.batch_name }}</h2>
                  <p class="sub-text">{{ attendanceStudents.length }} students</p>
                </div>
                <div class="attendance-controls">
                  <input type="date" v-model="attendanceDate" class="date-picker" />
                  <button @click="loadAttendanceForBatch" class="btn-secondary" :disabled="attendanceLoading">🔄 Load</button>
                  <button @click="selectedBatch = null" class="btn-outline">← Change Batch</button>
                </div>
              </div>

              <div class="progress-section">
                <div class="progress-stats">
                  <span class="progress-stat present">✅ Present: {{ presentCount }}</span>
                  <span class="progress-stat absent">❌ Absent: {{ absentCount }}</span>
                  <span class="progress-stat late">⏰ Late: {{ lateCount }}</span>
                  <span class="progress-stat unmarked">⬜ Unmarked: {{ unmarkedCount }}</span>
                </div>
                <div class="progress-bar-track">
                  <div class="progress-bar-fill" :style="{ width: markedPercent + '%', background: progressColor }"></div>
                </div>
                <p class="progress-label">
                  {{ markedCount }} / {{ attendanceStudents.length }} marked
                  <span v-if="markedCount === attendanceStudents.length && attendanceStudents.length > 0" class="congrats">🎉 All done!</span>
                </p>
              </div>

              <div class="bulk-actions">
                <span class="bulk-label">Mark all as:</span>
                <button @click="markAll('present')" class="btn-bulk present">✅ Present</button>
                <button @click="markAll('absent')" class="btn-bulk absent">❌ Absent</button>
                <button @click="resetAll" class="btn-bulk reset">🔄 Reset</button>
              </div>
            </div>

            <div v-if="attendanceLoading" class="loading-state"><div class="spinner"></div></div>
            <div v-else class="attendance-cards-grid">
              <div
                v-for="student in attendanceStudents"
                :key="student.student_id"
                class="attendance-card"
                :class="'card-' + (student.status || 'unmarked')"
              >
                <div class="att-card-avatar">
                  <div class="att-avatar" :class="'avatar-' + (student.status || 'unmarked')">
                    {{ initials(student.full_name) }}
                  </div>
                  <div class="att-status-badge" v-if="student.status">{{ statusEmoji(student.status) }}</div>
                </div>
                <div class="att-card-name">{{ student.full_name }}</div>
                <div class="att-card-buttons">
                  <button @click="setStatus(student, 'present')" :class="['att-btn', 'btn-present', { active: student.status === 'present' }]" title="Present">✅</button>
                  <button @click="setStatus(student, 'absent')" :class="['att-btn', 'btn-absent', { active: student.status === 'absent' }]" title="Absent">❌</button>
                  <button @click="setStatus(student, 'late')" :class="['att-btn', 'btn-late', { active: student.status === 'late' }]" title="Late">⏰</button>
                  <button @click="setStatus(student, 'excused')" :class="['att-btn', 'btn-excused', { active: student.status === 'excused' }]" title="Excused">🏥</button>
                </div>
                <input v-model="student.remarks" type="text" placeholder="Remarks…" class="att-remarks-input" />
              </div>
            </div>

            <div class="save-bar" v-if="attendanceStudents.length > 0">
              <div class="save-bar-inner">
                <span class="save-info">{{ markedCount }} / {{ attendanceStudents.length }} marked</span>
                <button @click="saveAttendance" class="btn-save-attendance" :disabled="savingAttendance || markedCount === 0">
                  <span v-if="savingAttendance">⏳ Saving…</span>
                  <span v-else>💾 Save Attendance</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ============ BATCH PORTAL ============ -->
        <div v-if="currentView === 'resources'">
          <div v-if="!selectedBatch" class="section-card">
            <h2>📌 Batch Portal</h2>
            <p class="sub-text">Select a batch from the sidebar to view resources.</p>
          </div>

          <div v-else>
            <div class="section-card">
              <div class="section-header">
                <div>
                  <h2>📌 {{ selectedBatch.batch_name }} — Portal</h2>
                  <p class="sub-text">Share videos, articles, and links with this batch.</p>
                </div>
                <button @click="loadBatchResources" class="btn-secondary" :disabled="loadingResources">Refresh</button>
              </div>

              <div class="resource-form">
                <input v-model="resourceForm.title" class="input" type="text" placeholder="Title" />
                <input v-model="resourceForm.url" class="input" type="text" placeholder="Paste URL" />
                <select v-model="resourceForm.resource_type" class="input">
                  <option value="link">Link</option>
                  <option value="youtube">YouTube</option>
                  <option value="article">Article</option>
                  <option value="tool">Tool</option>
                </select>
                <input v-model="resourceForm.description" class="input" type="text" placeholder="Short description (optional)" />
                <label class="toggle">
                  <input v-model="resourceForm.visible_to_students" type="checkbox" />
                  Visible to students
                </label>
                <button class="btn-primary" @click="addBatchResource">Add Resource</button>
              </div>

              <div v-if="loadingResources" class="loading-state"><div class="spinner"></div></div>
              <div v-else-if="resourceError" class="empty-state"><p>⚠️ {{ resourceError }}</p></div>
              <div v-else class="portal-layout">
                <div class="portal-list">
                  <div v-if="batchResources.length === 0" class="empty-state"><p>No resources yet.</p></div>
                  <button
                    v-for="res in batchResources"
                    :key="res.id"
                    class="portal-row"
                    :class="{ active: selectedResource?.id === res.id }"
                    @click="selectedResource = res"
                  >
                    <div>
                      <strong>{{ res.title }}</strong>
                      <p>{{ res.resource_type }} • {{ formatDate(res.created_at) }}</p>
                    </div>
                    <span>{{ res.visible_to_students ? 'Visible' : 'Hidden' }}</span>
                  </button>
                </div>
                <div class="portal-detail">
                  <div v-if="!selectedResource" class="empty-state"><p>Select a resource to preview.</p></div>
                  <div v-else class="resource-preview">
                    <div class="resource-head">
                      <span class="resource-tag">{{ selectedResource.resource_type }}</span>
                      <span class="resource-date">{{ formatDate(selectedResource.created_at) }}</span>
                    </div>
                    <div v-if="editingResource && editingResource.id === selectedResource.id" class="edit-form">
                      <input v-model="editForm.title" class="input" type="text" placeholder="Title" />
                      <input v-model="editForm.url" class="input" type="text" placeholder="Paste URL" />
                      <select v-model="editForm.resource_type" class="input">
                        <option value="link">Link</option>
                        <option value="youtube">YouTube</option>
                        <option value="article">Article</option>
                        <option value="tool">Tool</option>
                      </select>
                      <input v-model="editForm.description" class="input" type="text" placeholder="Short description" />
                      <label class="toggle">
                        <input v-model="editForm.visible_to_students" type="checkbox" />
                        Visible to students
                      </label>
                      <div class="edit-actions">
                        <button class="btn-primary" @click="saveEditResource">Save</button>
                        <button class="btn-outline" @click="cancelEditResource">Cancel</button>
                      </div>
                    </div>
                    <div v-else>
                      <h3 class="resource-title">{{ selectedResource.title }}</h3>
                      <p v-if="selectedResource.description" class="resource-desc">{{ selectedResource.description }}</p>
                      <div v-if="getYoutubeEmbedUrl(selectedResource.url)" class="resource-embed">
                        <iframe
                          :src="getYoutubeEmbedUrl(selectedResource.url)"
                          frameborder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                        ></iframe>
                      </div>
                      <a v-else :href="selectedResource.url" target="_blank" rel="noopener" class="resource-link">
                        Open resource ↗
                      </a>
                      <div class="resource-meta">Added by {{ selectedResource.creator?.full_name || 'Coach' }}</div>
                      <div class="resource-actions" v-if="canManageResource(selectedResource)">
                        <button class="btn-secondary" @click="startEditResource(selectedResource)">Edit</button>
                        <button class="btn-danger" @click="removeBatchResource(selectedResource.id)">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ============ QUIZZES ============ -->
        <div v-if="currentView === 'quizzes'">
          <div class="section-card">
            <div class="section-header">
              <div>
                <h2>🧠 AI Quizzes</h2>
                <p class="sub-text">Generate, edit, and publish quizzes for a batch.</p>
              </div>
              <select v-model.number="quizViewBatchId" class="input" @change="quizViewBatchId && loadQuizzes(quizViewBatchId)">
                <option :value="null">Select batch</option>
                <option v-for="batch in batches" :key="`quiz-batch-${batch.id}`" :value="batch.id">
                  {{ batch.batch_name }} ({{ batch.year }})
                </option>
              </select>
            </div>

            <div class="resource-form">
              <input v-model="quizForm.topic" class="input" type="text" placeholder="Quiz topic" />
              <input v-model="quizForm.instructions" class="input" type="text" placeholder="Instructions (optional)" />
              <select v-model="quizForm.difficulty" class="input">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input v-model.number="quizForm.question_count" class="input" type="number" min="1" max="50" />
              <select v-model="quizForm.mode" class="input">
                <option value="practice">Practice</option>
                <option value="graded">Graded</option>
              </select>
              <button class="btn-primary" @click="generateQuiz" :disabled="generatingQuiz">
                {{ generatingQuiz ? 'Generating…' : 'Generate' }}
              </button>
              <button class="btn-secondary" @click="startManualQuiz">
                Manual Quiz
              </button>
            </div>

            <div v-if="showQuizEditor" class="quiz-modal">
              <div class="quiz-modal-content">
                <div class="quiz-modal-header">
                  <h3>{{ quizDraft?.title || 'Edit Quiz' }}</h3>
                  <button class="btn-outline" @click="closeQuizEditor">Close</button>
                </div>
                <div class="quiz-editor">
                  <input v-model="quizDraft!.title" class="input" placeholder="Quiz title" />
                  <input v-model="quizDescription" class="input" placeholder="Description" />
                  <div class="quiz-actions" style="justify-content: flex-start; margin-top: 0;">
                    <button class="btn-secondary" @click="addQuizQuestion">+ Add Question</button>
                  </div>
                  <div v-for="(q, idx) in quizEditor" :key="`q-${idx}`" class="quiz-question">
                    <div class="quiz-question-header">Question {{ idx + 1 }}</div>
                    <textarea v-model="q.question" rows="2" class="input" placeholder="Question"></textarea>
                    <div class="quiz-options">
                      <input v-for="(opt, i) in q.options" :key="`q-${idx}-opt-${i}`" v-model="q.options[i]" class="input" />
                    </div>
                    <select v-model.number="q.correct_index" class="input">
                      <option :value="0">Correct A</option>
                      <option :value="1">Correct B</option>
                      <option :value="2">Correct C</option>
                      <option :value="3">Correct D</option>
                    </select>
                    <input v-model="q.explanation" class="input" placeholder="Explanation" />
                    <button class="btn-danger" @click="removeQuizQuestion(idx)" v-if="quizEditor.length > 1">
                      Remove Question
                    </button>
                  </div>
                  <div class="quiz-actions">
                    <button class="btn-secondary" @click="updateQuizQuestions" v-if="selectedQuiz">Save Updates</button>
                    <button class="btn-primary" @click="saveQuizDraft">Save Draft</button>
                  </div>
                </div>
              </div>
            </div>

            <div class="section-divider"></div>
            <div v-if="quizViewBatchId" class="section-card" style="margin-bottom: 14px;">
              <div class="section-header">
                <h2>📊 Quiz Reports & Rankings</h2>
                <button class="btn-secondary" @click="quizViewBatchId && loadQuizPerformance(quizViewBatchId)">Refresh</button>
              </div>
              <p v-if="quizPerformanceError" class="muted-note" style="margin-bottom: 10px; color: var(--color-warning);">
                {{ quizPerformanceError }}
              </p>
              <div class="stats-grid" style="margin-top: 8px;">
                <div class="stat-card" style="--accent:#667eea">
                  <div class="stat-info">
                    <h3>Total Quizzes</h3>
                    <p class="stat-value">{{ quizPerformance.summary?.total_quizzes || 0 }}</p>
                  </div>
                </div>
                <div class="stat-card" style="--accent:#43e97b">
                  <div class="stat-info">
                    <h3>Total Submissions</h3>
                    <p class="stat-value">{{ quizPerformance.summary?.total_submissions || 0 }}</p>
                  </div>
                </div>
                <div class="stat-card" style="--accent:#4facfe">
                  <div class="stat-info">
                    <h3>Avg Submission Rate</h3>
                    <p class="stat-value">{{ quizPerformance.summary?.average_submission_rate || 0 }}%</p>
                  </div>
                </div>
              </div>

              <div class="table-wrap" style="margin-top: 10px;">
                <table class="students-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Attempts</th>
                      <th>Avg Score</th>
                      <th>Best Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="(quizPerformance.rankings || []).length === 0">
                      <td colspan="5">No ranking data yet.</td>
                    </tr>
                    <tr v-for="row in (quizPerformance.rankings || []).slice(0, 10)" :key="`rank-${row.student_id}`">
                      <td>#{{ row.rank }}</td>
                      <td>{{ row.student_name }}</td>
                      <td>{{ row.attempted_quizzes }}</td>
                      <td>{{ row.average_score }}</td>
                      <td>{{ row.best_score }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="loadingQuizzes" class="loading-state"><div class="spinner"></div></div>
            <div v-else-if="quizError" class="empty-state"><p>⚠️ {{ quizError }}</p></div>
            <div v-else class="quiz-list">
              <div v-for="quiz in quizzes" :key="quiz.id" class="portal-row" @click="openQuiz(quiz)">
                <div>
                  <strong>{{ quiz.title }}</strong>
                  <p>
                    {{ quiz.status }} • {{ quiz.mode }} • {{ quiz.question_count }} Qs
                    <span v-if="quiz.status === 'draft'">• {{ getDraftLabel(quiz) }}</span>
                  </p>
                </div>
                <div class="quiz-row-actions">
                  <button class="btn-mini" @click.stop="openQuiz(quiz)">Edit</button>
                  <button
                    v-if="canManageQuiz(quiz)"
                    :class="quiz.status === 'published' ? 'btn-danger' : 'btn-primary'"
                    @click.stop="toggleQuizStatus(quiz)"
                  >
                    {{ quiz.status === 'published' ? 'Close' : 'Open' }}
                  </button>
                  <button v-if="canManageQuiz(quiz)" class="btn-danger" @click.stop="deleteQuiz(quiz)">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- ===== STUDENT PROFILE MODAL ===== -->
    <Transition name="modal">
      <div v-if="showStudentModal" class="modal-overlay" @click.self="closeStudentModal">
        <div class="modal-container">
          <button class="modal-close" @click="closeStudentModal">✕</button>
          <div v-if="loadingProfile" class="modal-loading"><div class="spinner"></div><p>Loading profile…</p></div>
          <div v-else-if="studentProfile">
            <div class="profile-header">
              <div class="profile-avatar">{{ initials(studentProfile.student.full_name) }}</div>
              <div>
                <h2>{{ studentProfile.student.full_name }}</h2>
                <p>{{ studentProfile.student.email }}</p>
                <p v-if="studentProfile.student.phone_number">📞 {{ studentProfile.student.phone_number }}</p>
                <span class="batch-tag">{{ studentProfile.batch.batch_name }} · {{ studentProfile.batch.year }}</span>
              </div>
            </div>

            <div class="profile-stats-row">
              <div class="profile-stat-box" :class="attendancePillClass(studentProfile.attendance.rate)">
                <div class="pstat-val">{{ studentProfile.attendance.rate }}%</div>
                <div class="pstat-label">Attendance</div>
                <div class="pstat-bar-track"><div class="pstat-bar-fill" :style="{ width: studentProfile.attendance.rate + '%' }"></div></div>
              </div>
              <div class="profile-stat-box neutral-box">
                <div class="pstat-val">{{ studentProfile.attendance.present }}</div>
                <div class="pstat-label">Days Present</div>
              </div>
            </div>

            <div class="profile-tabs">
              <button v-for="tab in ['attendance', 'info']" :key="tab" :class="['profile-tab', { active: profileTab === tab }]" @click="profileTab = tab">
                {{ { attendance: '📅 Attendance', info: 'ℹ️ Info' }[tab] }}
              </button>
            </div>

            <div class="profile-tab-content">
              <div v-if="profileTab === 'attendance'">
                <div class="attendance-history-grid">
                  <div v-for="rec in studentProfile.attendance.recent" :key="rec.date" class="att-history-chip" :class="'chip-' + rec.status" :title="rec.date + (rec.remarks ? ' — ' + rec.remarks : '')">
                    <span class="chip-emoji">{{ statusEmoji(rec.status) }}</span>
                    <span class="chip-date">{{ shortDate(rec.date) }}</span>
                  </div>
                </div>
                <div class="att-legend">
                  <span class="chip-present">✅ Present</span>
                  <span class="chip-absent">❌ Absent</span>
                  <span class="chip-late">⏰ Late</span>
                  <span class="chip-excused">🏥 Excused</span>
                </div>
              </div>

              <div v-if="profileTab === 'info'" class="info-grid">
                <div class="info-row"><span class="info-label">Student ID</span><span>{{ studentProfile.student.id }}</span></div>
                <div class="info-row"><span class="info-label">Email</span><span>{{ studentProfile.student.email || '—' }}</span></div>
                <div class="info-row"><span class="info-label">Phone</span><span>{{ studentProfile.student.phone_number || '—' }}</span></div>
                <div class="info-row"><span class="info-label">Address</span><span>{{ studentProfile.student.address || '—' }}</span></div>
                <div class="info-row"><span class="info-label">Date of Birth</span><span>{{ formatDate(studentProfile.student.date_of_birth) }}</span></div>
                <div class="info-row"><span class="info-label">Enrolled</span><span>{{ formatDate(studentProfile.student.enrollment_date) }}</span></div>
                <div class="info-row"><span class="info-label">Batch</span><span>{{ studentProfile.batch.batch_name }} ({{ studentProfile.batch.year }})</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast', 'toast-' + toast.type]">{{ toast.message }}</div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'
import { aiService } from '@/services/ai'
import { quizzesService, type Quiz, type QuizQuestion } from '@/services/quizzes'
import { batchResourcesService, type BatchResource } from '@/services/batchResources'

const router = useRouter()
const authStore = useAuthStore()

const THEME_KEY = 'tardigrade-theme'
const isDarkTheme = ref(false)

const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

const loading = ref(true)
const error = ref('')
const currentView = ref('overview')
const summary = ref<any>({})
const batches = ref<any[]>([])
const selectedBatch = ref<any>(null)
const batchStudents = ref<any[]>([])
const studentSearch = ref('')
const loadingStudents = ref(false)
const attendanceDate = ref(new Date().toISOString().split('T')[0])
const attendanceStudents = ref<any[]>([])
const attendanceLoading = ref(false)
const savingAttendance = ref(false)
const batchResources = ref<BatchResource[]>([])
const loadingResources = ref(false)
const resourceError = ref('')
const selectedResource = ref<BatchResource | null>(null)
const resourceForm = ref({
  title: '',
  description: '',
  url: '',
  resource_type: 'link',
  visible_to_students: true,
})
const editingResource = ref<BatchResource | null>(null)
const editForm = ref({
  title: '',
  description: '',
  url: '',
  resource_type: 'link',
  visible_to_students: true,
})
const showStudentModal = ref(false)
const loadingProfile = ref(false)
const studentProfile = ref<any>(null)
const profileTab = ref<string>('attendance')
const toast = ref({ show: false, message: '', type: 'success' })
const coachAiBatchId = ref<number | null>(null)
const coachAiLoading = ref(false)
const coachAiError = ref('')
const coachAiInsights = ref<any | null>(null)
const quizViewBatchId = ref<number | null>(null)
const quizzes = ref<Quiz[]>([])
const loadingQuizzes = ref(false)
const quizError = ref('')
function emptyQuizPerformance() {
  return {
    summary: {
      total_quizzes: 0,
      total_submissions: 0,
      average_submission_rate: 0,
    },
    rankings: [],
    quiz_results: [],
  }
}

const quizPerformance = ref<any>(emptyQuizPerformance())
const quizPerformanceError = ref('')
const quizDraft = ref<{ title: string; difficulty: string; questions: QuizQuestion[] } | null>(null)
const quizForm = ref({ topic: '', instructions: '', difficulty: 'medium', question_count: 10, mode: 'practice' })
const quizDescription = ref('')
const selectedQuiz = ref<Quiz | null>(null)
const quizEditor = ref<QuizQuestion[]>([])
const generatingQuiz = ref(false)
const showQuizEditor = ref(false)
const emptyQuizQuestion = (): QuizQuestion => ({
  question: '',
  options: ['', '', '', ''],
  correct_index: 0,
  explanation: '',
})

const todayFormatted = computed(() =>
  new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)
const avatarInitials = computed(() => {
  const name = authStore.user?.full_name || ''
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
})
const viewTitle = computed(() => {
  const map: Record<string, string> = {
    overview: 'Coach Dashboard', batches: 'My Batches',
    students: selectedBatch.value ? `${selectedBatch.value.batch_name} — Students` : 'Students',
  attendance: 'Attendance', resources: 'Batch Portal', quizzes: 'Quizzes',
  }
  return map[currentView.value] || 'Dashboard'
})
const filteredStudents = computed(() => {
  const q = studentSearch.value.toLowerCase().trim()
  if (!q) return batchStudents.value
  return batchStudents.value.filter(s =>
    (s.full_name || '').toLowerCase().includes(q) ||
    (s.email || '').toLowerCase().includes(q) ||
    (s.phone_number || '').toLowerCase().includes(q) ||
    String(s.id).includes(q) ||
    String(s.user_id).includes(q)
  )
})
const presentCount = computed(() => attendanceStudents.value.filter(s => s.status === 'present').length)
const absentCount = computed(() => attendanceStudents.value.filter(s => s.status === 'absent').length)
const lateCount = computed(() => attendanceStudents.value.filter(s => s.status === 'late').length)
const unmarkedCount = computed(() => attendanceStudents.value.filter(s => !s.status).length)
const markedCount = computed(() => attendanceStudents.value.filter(s => s.status).length)
const markedPercent = computed(() => {
  if (!attendanceStudents.value.length) return 0
  return Math.round((markedCount.value / attendanceStudents.value.length) * 100)
})
const progressColor = computed(() => {
  if (markedPercent.value === 100) return 'var(--color-success)'
  if (markedPercent.value > 60) return 'var(--color-info)'
  return 'var(--color-warning)'
})

onMounted(() => {
  initializeTheme()
  loadDashboard()
})

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }
  isDarkTheme.value = dark
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

function initializeTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'dark') {
    applyTheme(true)
    return
  }
  if (stored === 'light') {
    applyTheme(false)
    return
  }
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  applyTheme(prefersDark)
}

function toggleTheme() {
  applyTheme(!isDarkTheme.value)
}

async function loadDashboard() {
  loading.value = true; error.value = ''
  try {
    const [summaryRes, batchesRes] = await Promise.all([
      apiClient.get('/teacher/dashboard'),
      apiClient.get('/teacher/batches'),
    ])
    if (summaryRes.data.success) summary.value = summaryRes.data.data
    if (batchesRes.data.success) {
      batches.value = batchesRes.data.data.batches || []
      if (!coachAiBatchId.value && batches.value.length) {
        coachAiBatchId.value = batches.value[0].id
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load dashboard'
  } finally {
    loading.value = false
  }
}

async function loadCoachAiInsights() {
  if (!coachAiBatchId.value) {
    coachAiError.value = 'Select a batch first'
    return
  }

  coachAiLoading.value = true
  coachAiError.value = ''
  try {
    const response = await aiService.getCoachBatchInsights(coachAiBatchId.value, {
      focus: 'weekly remediation and batch uplift plan'
    })
    coachAiInsights.value = response?.data?.insights || null
  } catch (err: any) {
    coachAiError.value = err?.response?.data?.message || 'Failed to generate AI insights'
    coachAiInsights.value = null
  } finally {
    coachAiLoading.value = false
  }
}

function setView(view: string) {
  currentView.value = view
  if (view !== 'students') studentSearch.value = ''
  if (view === 'batches' || view === 'overview') selectedBatch.value = null
}

async function loadQuizzes(batchId: number) {
  quizViewBatchId.value = batchId
  loadingQuizzes.value = true
  quizError.value = ''
  try {
    const res: any = await quizzesService.list(batchId)
    quizzes.value = res?.data?.data?.quizzes ?? res?.data?.quizzes ?? []
    await loadQuizPerformance(batchId)
  } catch (err: any) {
    quizError.value = err?.response?.data?.message || 'Failed to load quizzes'
  } finally {
    loadingQuizzes.value = false
  }
}

async function loadQuizPerformance(batchId: number) {
  quizPerformanceError.value = ''
  try {
    const res: any = await apiClient.get(`/teacher/batches/${batchId}/quiz-performance`)
    quizPerformance.value = res?.data?.data ?? emptyQuizPerformance()
  } catch (err: any) {
    quizPerformance.value = emptyQuizPerformance()
    quizPerformanceError.value = err?.response?.data?.message || 'Could not load graded quiz reports right now.'
  }
}

async function generateQuiz() {
  if (!quizViewBatchId.value) {
    showToast('Select a batch first', 'error')
    return
  }
  if (!quizForm.value.topic.trim()) {
    showToast('Topic is required', 'error')
    return
  }
  generatingQuiz.value = true
  try {
    const res: any = await quizzesService.generate({
      topic: quizForm.value.topic.trim(),
      instructions: quizForm.value.instructions.trim() || undefined,
      difficulty: quizForm.value.difficulty,
      question_count: Number(quizForm.value.question_count),
      mode: quizForm.value.mode as 'practice' | 'graded',
    })
  quizDraft.value = res?.data?.data ?? res?.data ?? null
    quizEditor.value = (quizDraft.value?.questions || []).map((q) => ({ ...q }))
    quizDescription.value = quizForm.value.instructions.trim()
  showQuizEditor.value = true
    showToast('AI quiz generated', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to generate quiz', 'error')
  } finally {
    generatingQuiz.value = false
  }
}

function startManualQuiz() {
  if (!quizViewBatchId.value) {
    showToast('Select a batch first', 'error')
    return
  }
  selectedQuiz.value = null
  quizDraft.value = {
    title: quizForm.value.topic.trim() || 'New Quiz',
    difficulty: quizForm.value.difficulty,
    questions: [],
  }
  quizEditor.value = [emptyQuizQuestion()]
  quizDescription.value = quizForm.value.instructions.trim()
  showQuizEditor.value = true
}

function addQuizQuestion() {
  quizEditor.value.push(emptyQuizQuestion())
}

function removeQuizQuestion(index: number) {
  if (quizEditor.value.length <= 1) return
  quizEditor.value.splice(index, 1)
}

async function saveQuizDraft() {
  if (!quizViewBatchId.value || !quizDraft.value) return
  try {
    const payload = {
      batch_id: quizViewBatchId.value,
      title: quizDraft.value.title,
      description: quizDescription.value || undefined,
      difficulty: quizDraft.value.difficulty,
      question_count: quizEditor.value.length,
      mode: quizForm.value.mode as 'practice' | 'graded',
      questions: quizEditor.value.map((q) => ({
        question: q.question,
        options: q.options,
        correct_index: q.correct_index,
        explanation: q.explanation,
      })),
    }
    const res: any = await quizzesService.create(payload)
    selectedQuiz.value = res?.data?.data?.quiz ?? res?.data?.quiz ?? null
    await loadQuizzes(quizViewBatchId.value)
  showQuizEditor.value = false
  quizDraft.value = null
  quizEditor.value = []
    showToast('Quiz saved as draft', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to save quiz', 'error')
  }
}

async function openQuiz(quiz: Quiz) {
  selectedQuiz.value = quiz
  try {
    const res: any = await quizzesService.get(quiz.id)
    const full = res?.data?.data?.quiz ?? res?.data?.quiz
    selectedQuiz.value = full
    quizEditor.value = (full?.questions || []).map((q: any) => ({
      question: q.question_text || q.question,
      options: q.options,
      correct_index: q.correct_option ? ['A', 'B', 'C', 'D'].indexOf(q.correct_option) : q.correct_index,
      explanation: q.explanation,
    }))
    quizDraft.value = { title: full.title, difficulty: full.difficulty, questions: quizEditor.value }
    quizDescription.value = full.description || ''
    showQuizEditor.value = true
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to load quiz', 'error')
  }
}

function closeQuizEditor() {
  showQuizEditor.value = false
  quizDraft.value = null
  quizEditor.value = []
  selectedQuiz.value = null
}

function canManageQuiz(quiz: Quiz | null) {
  if (!quiz) return false
  return quiz.created_by === authStore.user?.id
}

function getDraftLabel(quiz: Quiz) {
  if (quiz.status !== 'draft') return ''
  const drafts = quizzes.value.filter((q) => q.status === 'draft' && q.title === quiz.title)
  const sorted = [...drafts].sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
  const idx = sorted.findIndex((q) => q.id === quiz.id)
  return `Draft ${idx + 1}`
}

async function deleteQuiz(quiz: Quiz) {
  if (!canManageQuiz(quiz)) return
  const label = quiz.status === 'draft' ? 'draft' : quiz.status
  const ok = window.confirm(`Delete this ${label} quiz? This will remove all student submissions and scores.`)
  if (!ok) return
  try {
    await quizzesService.remove(quiz.id)
    await loadQuizzes(quizViewBatchId.value || quiz.batch_id)
    if (selectedQuiz.value?.id === quiz.id) selectedQuiz.value = null
    showToast('Quiz deleted', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to delete quiz', 'error')
  }
}

async function updateQuizQuestions() {
  if (!selectedQuiz.value) return
  try {
    await quizzesService.updateQuestions(selectedQuiz.value.id, quizEditor.value)
    showToast('Quiz updated', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to update quiz', 'error')
  }
}

async function toggleQuizStatus(quiz: Quiz) {
  if (!canManageQuiz(quiz)) return
  try {
    if (quiz.status === 'published') {
      await quizzesService.close(quiz.id)
      showToast('Quiz closed', 'success')
    } else {
      await quizzesService.publish(quiz.id)
      showToast('Quiz opened', 'success')
    }
    await loadQuizzes(quizViewBatchId.value || quiz.batch_id)
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to update quiz status', 'error')
  }
}

async function publishSelectedQuiz() {
  if (!selectedQuiz.value) return
  try {
    await quizzesService.publish(selectedQuiz.value.id)
    await loadQuizzes(quizViewBatchId.value || selectedQuiz.value.batch_id)
    showToast('Quiz published', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to publish quiz', 'error')
  }
}

async function closeSelectedQuiz() {
  if (!selectedQuiz.value) return
  try {
    await quizzesService.close(selectedQuiz.value.id)
    await loadQuizzes(quizViewBatchId.value || selectedQuiz.value.batch_id)
    showToast('Quiz closed', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to close quiz', 'error')
  }
}

async function openBatch(batch: any) {
  selectedBatch.value = batch
  currentView.value = 'students'
  studentSearch.value = ''
  loadingStudents.value = true
  try {
    const res = await apiClient.get(`/teacher/batches/${batch.id}/students`)
    if (res.data.success) batchStudents.value = res.data.data.students || []
    await loadBatchResources()
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to load students', 'error')
  } finally {
    loadingStudents.value = false
  }
}

function openBatchResources(batch: any) {
  selectedBatch.value = batch
  currentView.value = 'resources'
  loadBatchResources()
}

async function loadBatchResources() {
  if (!selectedBatch.value) return
  loadingResources.value = true
  resourceError.value = ''
  try {
    const res: any = await batchResourcesService.list(selectedBatch.value.id, true)
    const list = res?.data?.data?.resources ?? res?.data?.resources ?? []
    batchResources.value = [...list].sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''))
    selectedResource.value = batchResources.value[0] || null
  } catch (err: any) {
    resourceError.value = err?.response?.data?.message || 'Failed to load resources'
  } finally {
    loadingResources.value = false
  }
}

async function addBatchResource() {
  if (!selectedBatch.value) return
  if (!resourceForm.value.title.trim() || !resourceForm.value.url.trim()) {
    showToast('Title and URL are required', 'error')
    return
  }
  try {
    await batchResourcesService.create(selectedBatch.value.id, {
      title: resourceForm.value.title.trim(),
      description: resourceForm.value.description.trim() || undefined,
      url: resourceForm.value.url.trim(),
      resource_type: resourceForm.value.resource_type,
      visible_to_students: resourceForm.value.visible_to_students,
    })
    resourceForm.value = { title: '', description: '', url: '', resource_type: 'link', visible_to_students: true }
    await loadBatchResources()
    showToast('Resource added', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to add resource', 'error')
  }
}

function startEditResource(resource: BatchResource) {
  editingResource.value = resource
  editForm.value = {
    title: resource.title,
    description: resource.description || '',
    url: resource.url,
    resource_type: resource.resource_type || 'link',
    visible_to_students: resource.visible_to_students,
  }
}

function cancelEditResource() {
  editingResource.value = null
}

async function saveEditResource() {
  if (!editingResource.value) return
  try {
    await batchResourcesService.update(editingResource.value.id, {
      title: editForm.value.title.trim(),
      description: editForm.value.description.trim() || undefined,
      url: editForm.value.url.trim(),
      resource_type: editForm.value.resource_type,
      visible_to_students: editForm.value.visible_to_students,
    })
    await loadBatchResources()
    editingResource.value = null
    showToast('Resource updated', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to update resource', 'error')
  }
}

async function removeBatchResource(resourceId: number) {
  if (!selectedBatch.value) return
  try {
    await batchResourcesService.remove(resourceId)
    await loadBatchResources()
    showToast('Resource removed', 'success')
  } catch (err: any) {
    showToast(err?.response?.data?.message || 'Failed to remove resource', 'error')
  }
}

function canManageResource(resource: BatchResource | null) {
  if (!resource) return false
  return resource.created_by === authStore.user?.id
}

function quickAttendance(batch: any) {
  selectedBatch.value = batch
  currentView.value = 'attendance'
  loadAttendanceForBatch()
}

function startAttendance(batch: any) {
  selectedBatch.value = batch
  loadAttendanceForBatch()
}

async function loadAttendanceForBatch() {
  if (!selectedBatch.value) return
  attendanceLoading.value = true
  try {
    const res = await apiClient.get(`/teacher/batches/${selectedBatch.value.id}/attendance?date=${attendanceDate.value}`)
    if (res.data.success) {
      attendanceStudents.value = (res.data.data.students || []).map((s: any) => ({
        ...s, status: s.status || null, remarks: s.remarks || '',
      }))
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to load attendance', 'error')
  } finally {
    attendanceLoading.value = false
  }
}

function setStatus(student: any, status: string) {
  student.status = student.status === status ? null : status
}
function markAll(status: string) { attendanceStudents.value.forEach(s => (s.status = status)) }
function resetAll() { attendanceStudents.value.forEach(s => { s.status = null; s.remarks = '' }) }

async function saveAttendance() {
  const toSave = attendanceStudents.value.filter(s => s.status)
  if (!toSave.length) return
  savingAttendance.value = true
  try {
    const res = await apiClient.post(`/teacher/batches/${selectedBatch.value.id}/attendance`, {
      date: attendanceDate.value,
      attendance: toSave.map(s => ({ student_id: s.student_id, status: s.status, remarks: s.remarks || '' })),
    })
    if (res.data.success) {
      showToast(`✅ Attendance saved! ${res.data.data.created} new, ${res.data.data.updated} updated.`, 'success')
    }
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to save attendance', 'error')
  } finally {
    savingAttendance.value = false
  }
}

async function openStudentProfile(student: any) {
  showStudentModal.value = true
  loadingProfile.value = true
  studentProfile.value = null
  profileTab.value = 'attendance'
  try {
    const res = await apiClient.get(`/teacher/students/${student.id}/profile`)
    if (res.data.success) studentProfile.value = res.data.data
  } catch (err: any) {
    showToast(err.response?.data?.message || 'Failed to load profile', 'error')
    showStudentModal.value = false
  } finally {
    loadingProfile.value = false
  }
}

function closeStudentModal() { showStudentModal.value = false; studentProfile.value = null }
function handleLogout() { authStore.logout(); router.push('/login') }

function initials(name: string) {
  return (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
function formatCoTeachers(teachers: Array<{ name: string }> | null | undefined) {
  return (teachers || []).map(t => t.name).join(', ')
}
function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
function getYoutubeEmbedUrl(url: string) {
  if (!url) return ''
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/)
  const videoId = match?.[1]
  return videoId ? `https://www.youtube.com/embed/${videoId}` : ''
}
function shortDate(dateStr: string) {
  const d = new Date(dateStr); return `${d.getDate()}/${d.getMonth() + 1}`
}
function statusEmoji(status: string) {
  const map: Record<string, string> = { present: '✅', absent: '❌', late: '⏰', excused: '🏥' }
  return map[status] || '⬜'
}
function attendancePillClass(rate: number) {
  if (rate >= 80) return 'pill-green'; if (rate >= 60) return 'pill-yellow'; return 'pill-red'
}
function scorePillClass(score: number) {
  if (score >= 75) return 'pill-green'; if (score >= 50) return 'pill-yellow'; return 'pill-red'
}
function showToast(message: string, type: string = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 3500)
}
</script>

<style scoped>
/* Coach accent (inherits shared sidebar from main.css) */
.nav-item.active {
  border-left-color: var(--accent-coach);
}

.avatar-ring {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid rgba(255,255,255,0.4);
  margin: 0 auto 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 700;
}
.nav-icon { font-size: 1.1rem; }

.theme-toggle-btn {
  margin-top: var(--space-sm);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid var(--sidebar-border);
  color: var(--sidebar-text);
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.theme-toggle-btn:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text-active);
}

.theme-toggle-icon {
  font-size: 16px;
}

/* ── Main layout overrides ── */
.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.crumb-link { cursor: pointer; color: var(--brand-primary); }
.crumb-link:hover { text-decoration: underline; }
.header-date { color: var(--text-muted); font-size: var(--font-size-sm); white-space: nowrap; }

/* ── Coach-specific overrides ── */
.sub-text { color: var(--text-muted); margin: 0.25rem 0 0; font-size: var(--font-size-sm); }

/* ── Stats (uses shared) ──  */

/* ── Batch cards ── */
.batches-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.batch-card {
  background: linear-gradient(135deg, var(--bg-muted), var(--bg-page));
  border: 1px solid var(--border-light); border-radius: var(--radius-lg);
  padding: 1.25rem; cursor: pointer; transition: all 0.25s;
}
.batch-card:hover, .batch-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(79,70,229,0.15);
  border-color: var(--brand-primary);
}
.batch-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.batch-card h3 { margin: 0 0 0.75rem; color: var(--text-primary); font-size: 1.05rem; }
.batch-year-badge { background: var(--brand-primary); color: white; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; }
.batch-student-count { color: var(--text-muted); font-size: 0.85rem; }
.batch-card-bottom { display: flex; gap: 0.5rem; }
.batch-sub { color: var(--text-muted); font-size: 0.85rem; margin: 0; }

/* ── Batches list ── */
.batches-list { display: flex; flex-direction: column; gap: 1rem; }
.batch-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.25rem; background: var(--bg-card);
  border: 1px solid var(--border-light); border-radius: 12px; transition: all 0.2s;
}
.batch-row:hover { border-color: var(--brand-primary-light); background: var(--bg-muted); }
.batch-row-info { display: flex; align-items: center; gap: 1rem; }
.batch-row-icon {
  width: 46px; height: 46px; background: var(--brand-primary);
  border-radius: 10px; display: flex; align-items: center;
  justify-content: center; font-size: 1.2rem; flex-shrink: 0; color: var(--text-inverse);
}
.batch-row-info h3 { margin: 0 0 0.2rem; color: var(--text-primary); }
.batch-row-info p { margin: 0; color: var(--text-muted); font-size: 0.85rem; }
.co-teachers { color: var(--text-muted) !important; font-size: 0.8rem !important; }
.batch-row-actions { display: flex; gap: 0.75rem; }

/* ── Buttons (inherits shared, plus coach-specific) ── */
.btn-outline { padding: 0.6rem 1.2rem; background: transparent; color: var(--brand-primary); border: 1px solid var(--brand-primary); border-radius: var(--radius-sm); cursor: pointer; font-size: 0.875rem; transition: all 0.2s; }
.btn-outline:hover { background: rgba(79,70,229,0.06); }
.btn-mini { padding: 0.35rem 0.75rem; background: var(--brand-primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.btn-mini:hover { background: var(--brand-primary-dark); }
.btn-mini-primary { padding: 0.35rem 0.75rem; background: var(--brand-primary); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-size: 0.8rem; }

/* ── Search ── */
.search-bar {
  display: flex; align-items: center;
  background: var(--bg-input); border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md); padding: 0.5rem 1rem;
  margin-bottom: 1.25rem; transition: border-color var(--transition-base);
}
.search-bar:focus-within { border-color: var(--border-focus); }
.search-icon { font-size: 1rem; margin-right: 0.5rem; color: var(--text-muted); }
.search-input { flex: 1; border: none; background: transparent; font-size: 0.95rem; outline: none; color: var(--text-primary); font-family: var(--font-family); }
.clear-search { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.9rem; padding: 0; }

/* ── Students table ── */
.students-table-wrap { overflow-x: auto; }
.students-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
.students-table th {
  background: var(--bg-muted); color: var(--text-muted); font-weight: 600;
  text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.5px;
  padding: 0.75rem 1rem; text-align: left; border-bottom: 2px solid var(--border-light);
}
.students-table td { padding: 0.85rem 1rem; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); }
.student-row { cursor: pointer; transition: background 0.15s; }
.student-row:hover { background: var(--bg-muted); }
.student-name-cell { display: flex; align-items: center; gap: 0.6rem; }
.mini-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--brand-gradient);
  color: white; display: flex; align-items: center;
  justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
}
.attendance-pill, .score-pill { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
.pill-green { background: var(--color-success-light); color: var(--color-success); }
.pill-yellow { background: var(--color-warning-light); color: var(--color-warning); }
.pill-red { background: var(--color-danger-light); color: var(--color-danger); }

.empty-state { text-align: center; padding: 3rem; color: var(--text-muted); }

/* ── Batch portal resources ── */
.resource-form {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem; align-items: center; margin-bottom: 1rem;
}
.resource-form .input {
  padding: 0.6rem 0.8rem; border: 1px solid var(--border-light); border-radius: 8px; font-size: 0.9rem; background: var(--bg-input); color: var(--text-primary);
}
.toggle { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); }
.resource-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
.resource-card {
  border: 1px solid var(--border-light); border-radius: 12px; padding: 1rem; background: var(--bg-card);
  box-shadow: var(--shadow-sm);
}
.resource-head { display: flex; justify-content: space-between; font-size: 0.7rem; text-transform: uppercase; color: var(--text-muted); }
.resource-title { margin: 0.6rem 0 0.4rem; font-size: 1rem; }
.resource-desc { color: var(--text-secondary); font-size: 0.85rem; }
.resource-embed { width: 100%; aspect-ratio: 16 / 9; margin: 0.6rem 0; border-radius: 10px; overflow: hidden; }
.resource-embed iframe { width: 100%; height: 100%; }
.resource-link { color: var(--brand-primary); font-weight: 600; display: inline-flex; margin-top: 0.5rem; }
.resource-meta { margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-muted); }
.btn-danger { margin-top: 0.75rem; padding: 0.35rem 0.75rem; border: none; border-radius: 8px; background: var(--color-danger-light); color: var(--color-danger); cursor: pointer; font-size: 0.8rem; }
.btn-danger:hover { background: rgba(239, 68, 68, 0.2); }

.sidebar-section { margin: 1rem 1rem 0; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.15); }
.sidebar-section-title { font-size: 0.7rem; text-transform: uppercase; color: rgba(255,255,255,0.7); margin-bottom: 0.5rem; letter-spacing: 0.08em; }
.sidebar-batch {
  width: 100%; text-align: left; padding: 0.5rem 0.75rem; border: none; border-radius: 10px;
  background: rgba(255,255,255,0.08); color: white; margin-bottom: 0.4rem; cursor: pointer;
  display: flex; flex-direction: column; gap: 2px; font-size: 0.85rem;
}
.sidebar-batch small { color: rgba(255,255,255,0.7); font-size: 0.7rem; }
.sidebar-batch.active, .sidebar-batch:hover { background: rgba(255,255,255,0.18); }

.portal-layout { display: grid; grid-template-columns: minmax(220px, 1fr) 2fr; gap: 1rem; }
.portal-list { display: flex; flex-direction: column; gap: 0.6rem; }
.portal-row {
  border: 1px solid var(--border-light); border-radius: 10px; padding: 0.75rem;
  background: var(--bg-muted); display: flex; justify-content: space-between; gap: 0.75rem;
  align-items: center; cursor: pointer; text-align: left;
}
.portal-row p { margin: 0.2rem 0 0; font-size: 0.8rem; color: var(--text-muted); }
.portal-row.active { border-color: var(--brand-primary); background: var(--bg-card); }
.portal-detail { border: 1px solid var(--border-light); border-radius: 12px; padding: 1rem; background: var(--bg-card); }
.resource-preview .resource-embed { margin-top: 0.75rem; }
.resource-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
.edit-form { display: grid; gap: 0.6rem; }
.edit-form .input { padding: 0.6rem 0.8rem; border: 1px solid var(--border-light); border-radius: 8px; font-size: 0.9rem; background: var(--bg-input); color: var(--text-primary); }
.edit-actions { display: flex; gap: 0.5rem; }

/* ── Quiz editor ── */
.quiz-editor { display: grid; gap: 1rem; margin-top: 1rem; }
.quiz-question {
  border: 1px solid var(--border-light);
  border-radius: 14px;
  padding: 0.9rem;
  background: var(--bg-card);
  display: grid;
  gap: 0.6rem;
  box-shadow: var(--shadow-sm);
}
.quiz-question-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.quiz-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; }
.quiz-actions { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
.quiz-row-actions { display: flex; gap: 0.5rem; }
.quiz-list { display: flex; flex-direction: column; gap: 0.6rem; }

.quiz-modal {
  position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); z-index: 50;
  display: flex; align-items: center; justify-content: center; padding: 1rem;
  backdrop-filter: blur(4px);
}
.quiz-modal-content {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 1.5rem;
  width: min(960px, 95vw);
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.25);
  border: 1px solid var(--border-light);
}
.quiz-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-light);
}
.quiz-modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

/* ── Upcoming tests ── */
.upcoming-tests { display: flex; flex-direction: column; gap: 0.75rem; }
.upcoming-test-item {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.75rem; background: var(--bg-muted);
  border-radius: 8px; border-left: 3px solid var(--color-info);
}
.test-badge { font-size: 1.2rem; }
.upcoming-test-item strong { display: block; color: var(--text-primary); }
.upcoming-test-item p { margin: 0; color: var(--text-muted); font-size: 0.85rem; }

@media (max-width: 900px) {
  .dashboard-container { flex-direction: column; }
  .sidebar { width: 260px; height: 100vh; position: fixed; left: 0; top: 0; transform: translateX(-100%); transition: transform 0.3s ease; z-index: 30; }
  .sidebar-open .sidebar { transform: translateX(0); }
  .sidebar-nav { display: flex; flex-wrap: wrap; gap: 8px; }
  .nav-item { flex: 1 1 160px; }
  .main-content { margin-left: 0; padding: 16px; }
  .content-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .portal-layout { grid-template-columns: 1fr; }
  .batch-row { flex-direction: column; align-items: flex-start; gap: 12px; }
  .batch-row-actions { flex-wrap: wrap; }
  .mobile-menu-btn { display: inline-flex; }
}

@media (max-width: 600px) {
  .stats-grid { grid-template-columns: 1fr; }
  .batches-grid { grid-template-columns: 1fr; }
  .resource-form { grid-template-columns: 1fr; }
  .quiz-options { grid-template-columns: 1fr; }
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-secondary);
}
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 20;
}

/* ── Coach AI Card ── */
.coach-ai-controls { display: flex; gap: 0.6rem; align-items: center; flex-wrap: wrap; }
.coach-ai-select {
  min-width: 180px;
  padding: 0.45rem 0.65rem;
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-input);
  color: var(--text-primary);
}
.coach-ai-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.9rem;
}
.coach-ai-col {
  background: var(--bg-muted);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 0.8rem;
}
.coach-ai-col h4 {
  margin: 0 0 0.5rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.coach-ai-col ul {
  margin: 0;
  padding-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  font-size: 0.86rem;
  color: var(--text-secondary);
}

/* ── Attendance ── */
.attendance-header-card { margin-bottom: 1.25rem; }
.attendance-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;
}
.attendance-controls { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
.date-picker { padding: 0.5rem 0.75rem; border: 1.5px solid var(--border-light); border-radius: 8px; font-size: 0.9rem; color: var(--text-primary); outline: none; background: var(--bg-input); }
.date-picker:focus { border-color: var(--border-focus); }
.progress-section { margin-bottom: 1.25rem; }
.progress-stats { display: flex; gap: 1.25rem; margin-bottom: 0.75rem; font-size: 0.9rem; flex-wrap: wrap; }
.progress-stat { font-weight: 600; }
.progress-stat.present { color: var(--color-success); }
.progress-stat.absent { color: var(--color-danger); }
.progress-stat.late { color: var(--color-warning); }
.progress-stat.unmarked { color: var(--text-muted); }
.progress-bar-track { height: 10px; background: var(--bg-muted); border-radius: 5px; overflow: hidden; margin-bottom: 0.5rem; }
.progress-bar-fill { height: 100%; border-radius: 5px; transition: width 0.4s ease, background 0.4s; }
.progress-label { color: var(--text-muted); font-size: 0.85rem; margin: 0; }
.congrats { color: var(--color-success); font-weight: 600; margin-left: 0.5rem; animation: pop 0.4s ease; }
@keyframes pop { 0%{transform:scale(0.8)} 60%{transform:scale(1.15)} 100%{transform:scale(1)} }
.bulk-actions { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.bulk-label { color: var(--text-muted); font-size: 0.85rem; font-weight: 500; }
.btn-bulk { padding: 0.45rem 1rem; border: none; border-radius: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 500; transition: all 0.2s; }
.btn-bulk.present { background: var(--color-success-light); color: var(--color-success); }
.btn-bulk.present:hover { background: rgba(34, 197, 94, 0.2); }
.btn-bulk.absent { background: var(--color-danger-light); color: var(--color-danger); }
.btn-bulk.absent:hover { background: rgba(239, 68, 68, 0.2); }
.btn-bulk.reset { background: var(--bg-muted); color: var(--text-secondary); }
.btn-bulk.reset:hover { background: var(--bg-card-hover); }

/* Attendance cards */
.attendance-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 5rem; }
.attendance-card {
  background: var(--bg-card); border-radius: 14px; padding: 1rem;
  box-shadow: var(--shadow-sm);
  text-align: center; transition: all 0.25s;
  border: 2px solid transparent; position: relative;
}
.card-present { border-color: var(--color-success); background: var(--color-success-light); }
.card-absent  { border-color: var(--color-danger); background: var(--color-danger-light); }
.card-late    { border-color: var(--color-warning); background: var(--color-warning-light); }
.card-excused { border-color: var(--color-info); background: var(--color-info-light); }
.attendance-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); }
.att-card-avatar { position: relative; display: inline-block; margin-bottom: 0.5rem; }
.att-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: var(--brand-gradient);
  color: white; display: flex; align-items: center;
  justify-content: center; font-size: 1rem; font-weight: 700;
  margin: 0 auto; transition: background 0.3s;
}
.avatar-present { background: linear-gradient(135deg, #68d391, #38a169) !important; }
.avatar-absent  { background: linear-gradient(135deg, #fc8181, #c53030) !important; }
.avatar-late    { background: linear-gradient(135deg, #f6ad55, #dd6b20) !important; }
.avatar-excused { background: linear-gradient(135deg, #76e4f7, #0987a0) !important; }
.att-status-badge {
  position: absolute; bottom: -4px; right: -4px;
  font-size: 1rem; background: var(--bg-card); border-radius: 50%;
  width: 22px; height: 22px; display: flex; align-items: center;
  justify-content: center; box-shadow: var(--shadow-sm); line-height: 1;
}
.att-card-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.att-card-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 0.35rem; margin-bottom: 0.6rem; }
.att-btn { padding: 0.3rem; border: 1.5px solid transparent; border-radius: 6px; cursor: pointer; font-size: 1rem; background: var(--bg-muted); transition: all 0.2s; opacity: 0.5; }
.att-btn:hover { opacity: 0.85; transform: scale(1.1); }
.att-btn.active { opacity: 1; border-color: currentColor; background: var(--bg-card); transform: scale(1.08); }
.btn-present.active { border-color: var(--color-success); background: var(--color-success-light); }
.btn-absent.active  { border-color: var(--color-danger); background: var(--color-danger-light); }
.btn-late.active    { border-color: var(--color-warning); background: var(--color-warning-light); }
.btn-excused.active { border-color: var(--color-info); background: var(--color-info-light); }
.att-remarks-input { width: 100%; padding: 0.35rem 0.5rem; border: 1px solid var(--border-light); border-radius: 6px; font-size: 0.75rem; outline: none; color: var(--text-secondary); background: var(--bg-input); }
.att-remarks-input:focus { border-color: var(--border-focus); }

/* Save bar */
.save-bar {
  position: fixed; bottom: 0; left: var(--sidebar-width); right: 0;
  background: var(--bg-card); border-top: 1px solid var(--border-light);
  box-shadow: 0 -4px 16px rgba(0,0,0,0.08); z-index: 100; padding: 1rem 2rem;
}
.save-bar-inner { max-width: 900px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
.save-info { color: var(--text-muted); font-size: 0.9rem; }
.btn-save-attendance {
  padding: 0.75rem 2rem; background: var(--brand-gradient);
  color: white; border: none; border-radius: var(--radius-md); cursor: pointer;
  font-size: 1rem; font-weight: 600; transition: all var(--transition-base);
  box-shadow: 0 4px 12px rgba(79,70,229,0.25);
}
.btn-save-attendance:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(79,70,229,0.35); }
.btn-save-attendance:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Modal (inherits shared, coach overrides) ── */
.modal-loading { text-align: center; padding: 2rem; }

.profile-header {
  display: flex; align-items: flex-start; gap: 1.25rem;
  margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--border-light);
}
.profile-avatar {
  width: 70px; height: 70px; border-radius: 50%;
  background: var(--brand-gradient);
  color: white; display: flex; align-items: center;
  justify-content: center; font-size: 1.4rem; font-weight: 700; flex-shrink: 0;
}
.profile-header h2 { margin: 0 0 0.25rem; color: var(--text-primary); }
.profile-header p { margin: 0.15rem 0; color: var(--text-muted); font-size: 0.9rem; }
.batch-tag { display: inline-block; background: var(--color-info-light); color: var(--color-info); padding: 0.2rem 0.7rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-top: 0.25rem; }

.profile-stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
.profile-stat-box { background: var(--bg-muted); border-radius: 12px; padding: 1rem; text-align: center; }
.profile-stat-box.pill-green { background: var(--color-success-light); }
.profile-stat-box.pill-yellow { background: var(--color-warning-light); }
.profile-stat-box.pill-red { background: var(--color-danger-light); }
.profile-stat-box.score-box { background: var(--color-info-light); }
.profile-stat-box.neutral-box { background: var(--bg-muted); }
.pstat-val { font-size: 1.6rem; font-weight: 700; color: var(--text-primary); }
.pstat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
.pstat-bar-track { height: 6px; background: var(--border-light); border-radius: 3px; overflow: hidden; margin-top: 0.5rem; }
.pstat-bar-fill { height: 100%; background: var(--color-success); border-radius: 3px; transition: width 0.5s; }
.score-fill { background: var(--color-info); }

.profile-tabs { display: flex; gap: 0.5rem; border-bottom: 2px solid var(--border-light); margin-bottom: 1.25rem; }
.profile-tab { padding: 0.6rem 1.2rem; background: none; border: none; cursor: pointer; font-size: 0.9rem; color: var(--text-muted); border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; }
.profile-tab:hover { color: var(--text-secondary); }
.profile-tab.active { color: var(--brand-primary); border-bottom-color: var(--brand-primary); font-weight: 600; }
.profile-tab-content { min-height: 200px; }

.attendance-history-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem; }
.att-history-chip { display: flex; flex-direction: column; align-items: center; gap: 0.15rem; padding: 0.4rem 0.5rem; border-radius: 8px; font-size: 0.7rem; font-weight: 600; cursor: default; min-width: 44px; }
.chip-present { background: var(--color-success-light); color: var(--color-success); }
.chip-absent  { background: var(--color-danger-light); color: var(--color-danger); }
.chip-late    { background: var(--color-warning-light); color: var(--color-warning); }
.chip-excused { background: var(--color-info-light); color: var(--color-info); }
.chip-emoji { font-size: 1rem; }
.chip-date { font-size: 0.65rem; }
.att-legend { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.8rem; font-weight: 600; padding: 0.5rem 0; }

.info-grid { display: flex; flex-direction: column; gap: 0; }
.info-row { display: flex; padding: 0.75rem 0; border-bottom: 1px solid var(--bg-muted); font-size: 0.9rem; }
.info-label { width: 160px; color: var(--text-muted); font-weight: 500; flex-shrink: 0; }

/* ── Toast (coach-specific position, uses shared colors) ── */
.toast {
  bottom: 5rem;
  max-width: 400px;
}
.toast-success { background: var(--color-success-light); color: var(--color-success); border: 1px solid rgba(34, 197, 94, 0.4); }
.toast-error   { background: var(--color-danger-light); color: var(--color-danger); border: 1px solid rgba(239, 68, 68, 0.4); }
.toast-info    { background: var(--color-info-light); color: var(--color-info); border: 1px solid rgba(96, 165, 250, 0.4); }
</style>
