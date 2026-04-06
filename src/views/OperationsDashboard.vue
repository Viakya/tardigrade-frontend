<template>
  <div class="dashboard-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Operations</h2>
        <p>{{ authStore.user?.full_name }}</p>
        <span class="role-badge">{{ authStore.user?.role }}</span>
      </div>
      <nav class="sidebar-nav">
        <a :class="['nav-item', { active: activeSection === 'dashboard' }]" @click="activeSection = 'dashboard'">
          <span>📊</span> Dashboard
        </a>
        <a :class="['nav-item', { active: activeSection === 'batches' }]" @click="activeSection = 'batches'">
          <span>📚</span> Batches
        </a>
        <a :class="['nav-item', { active: activeSection === 'students' }]" @click="activeSection = 'students'">
          <span>👥</span> Students
        </a>
        <a :class="['nav-item', { active: activeSection === 'teachers' }]" @click="activeSection = 'teachers'">
          <span>👨‍🏫</span> Teachers
        </a>
        <a :class="['nav-item', { active: activeSection === 'users' }]" @click="activeSection = 'users'">
          <span>👤</span> Users
        </a>
        <a :class="['nav-item', { active: activeSection === 'fees' }]" @click="activeSection = 'fees'">
          <span>💰</span> Fee Management
        </a>
        <a :class="['nav-item', { active: activeSection === 'salary' }]" @click="activeSection = 'salary'">
          <span>💵</span> Salary Management
        </a>
        <a :class="['nav-item', { active: activeSection === 'reports' }]" @click="activeSection = 'reports'">
          <span>📈</span> Reports
        </a>
      </nav>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <button class="mobile-menu-btn" @click="toggleSidebar">☰ Menu</button>

      <!-- ── DASHBOARD VIEW ── -->
      <template v-if="activeSection === 'dashboard'">
        <header class="content-header">
          <h1>Operations Dashboard</h1>
          <p class="breadcrumb">Home / Operations</p>
        </header>

        <!-- Dashboard Statistics Cards -->
        <div class="dashboard-stats">
          <div class="dash-stat-card blue">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3>Total Students</h3>
              <p class="stat-number">{{ dashboardStats.totalStudents }}</p>
              <span class="stat-detail">{{ dashboardStats.activeStudents }} active</span>
            </div>
          </div>

          <div class="dash-stat-card purple">
            <div class="stat-icon">📚</div>
            <div class="stat-content">
              <h3>Active Batches</h3>
              <p class="stat-number">{{ dashboardStats.activeBatches }}</p>
              <span class="stat-detail">{{ dashboardStats.totalTeachers }} teachers</span>
            </div>
          </div>

          <div class="dash-stat-card green">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3>Total Revenue</h3>
              <p class="stat-number">₹{{ dashboardStats.totalRevenue.toLocaleString() }}</p>
              <span class="stat-detail">₹{{ dashboardStats.thisMonthRevenue.toLocaleString() }} this month</span>
            </div>
          </div>

          <div class="dash-stat-card orange">
            <div class="stat-icon">⚠️</div>
            <div class="stat-content">
              <h3>Outstanding</h3>
              <p class="stat-number">₹{{ dashboardStats.totalOutstanding.toLocaleString() }}</p>
              <span class="stat-detail">{{ dashboardStats.studentsWithOutstanding }} students</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="dashboard-grid">
          <!-- Recent Fee Payments -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>💵 Recent Fee Payments</h3>
              <button @click="activeSection = 'fees'" class="view-all-btn">View All →</button>
            </div>
            <div class="activity-list">
              <div v-if="recentFeePayments.length === 0" class="empty-state">
                No recent payments
              </div>
              <div v-for="payment in recentFeePayments" :key="payment.id" class="activity-item">
                <div class="activity-info">
                  <strong>{{ payment.student_name }}</strong>
                  <span class="activity-detail">{{ payment.student_enrollment_no }}</span>
                </div>
                <div class="activity-amount">
                  <span class="amount-value">₹{{ payment.amount.toLocaleString() }}</span>
                  <span class="activity-time">{{ formatRelativeDate(payment.payment_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Salary Payments -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>💼 Recent Salary Payments</h3>
              <button @click="activeSection = 'salary'" class="view-all-btn">View All →</button>
            </div>
            <div class="activity-list">
              <div v-if="recentSalaryPayments.length === 0" class="empty-state">
                No recent payments
              </div>
              <div v-for="payment in recentSalaryPayments" :key="payment.id" class="activity-item">
                <div class="activity-info">
                  <strong>{{ payment.teacher_name }}</strong>
                  <span class="activity-detail">{{ payment.month }}</span>
                </div>
                <div class="activity-amount">
                  <span class="amount-value">₹{{ payment.amount.toLocaleString() }}</span>
                  <span class="activity-time">{{ formatRelativeDate(payment.payment_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Recently Enrolled Students -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>🎓 Recently Enrolled</h3>
              <button @click="activeSection = 'students'" class="view-all-btn">View All →</button>
            </div>
            <div class="activity-list">
              <div v-if="recentStudents.length === 0" class="empty-state">
                No recent enrollments
              </div>
              <div v-for="student in recentStudents" :key="student.id" class="activity-item">
                <div class="activity-info">
                  <strong>{{ student.name }}</strong>
                  <span class="activity-detail">{{ student.enrollment_no }}</span>
                </div>
                <div class="activity-meta">
                  <span class="activity-time">{{ formatRelativeDate(student.enrollment_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Batches Overview -->
          <div class="dashboard-card">
            <div class="card-header">
              <h3>📖 Batches Overview</h3>
              <button @click="activeSection = 'batches'" class="view-all-btn">View All →</button>
            </div>
            <div class="activity-list">
              <div v-if="batchesOverview.length === 0" class="empty-state">
                No batches available
              </div>
              <div v-for="batch in batchesOverview" :key="batch.id" class="activity-item">
                <div class="activity-info">
                  <strong>{{ batch.name }}</strong>
                  <span class="activity-detail">{{ batch.student_count }} students • {{ batch.teacher_count }} teachers</span>
                </div>
                <div class="activity-meta">
                  <span :class="['batch-status', batch.is_active ? 'active' : 'inactive']">
                    {{ batch.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Financial Summary -->
          <div class="dashboard-card full-width">
            <div class="card-header">
              <h3>📊 Financial Summary</h3>
            </div>
            <div class="financial-overview">
              <div class="financial-metric">
                <span class="metric-label">Expected Revenue</span>
                <span class="metric-value green">₹{{ dashboardStats.expectedRevenue.toLocaleString() }}</span>
              </div>
              <div class="financial-metric">
                <span class="metric-label">Total Received</span>
                <span class="metric-value blue">₹{{ dashboardStats.totalReceived.toLocaleString() }}</span>
              </div>
              <div class="financial-metric">
                <span class="metric-label">Total Outstanding</span>
                <span class="metric-value orange">₹{{ dashboardStats.totalOutstanding.toLocaleString() }}</span>
              </div>
              <div class="financial-metric">
                <span class="metric-label">Salaries Paid (This Month)</span>
                <span class="metric-value purple">₹{{ dashboardStats.thisMonthSalaries.toLocaleString() }}</span>
              </div>
              <div class="financial-metric">
                <span class="metric-label">Net Revenue (This Month)</span>
                <span class="metric-value" :class="dashboardStats.thisMonthRevenue - dashboardStats.thisMonthSalaries >= 0 ? 'green' : 'red'">
                  ₹{{ (dashboardStats.thisMonthRevenue - dashboardStats.thisMonthSalaries).toLocaleString() }}
                </span>
              </div>
            </div>
          </div>

          <!-- AI Insights -->
          <div class="dashboard-card full-width">
            <div class="card-header">
              <h3>🤖 AI Insights</h3>
              <button @click="loadOpsAiInsights(new Date().getFullYear())" class="view-all-btn" :disabled="opsAiLoading">
                {{ opsAiInsights ? 'Refresh AI →' : 'Generate Insights →' }}
              </button>
            </div>

            <div v-if="opsAiLoading" class="empty-state">Generating insights...</div>
            <div v-else-if="opsAiError" class="state-msg error">{{ opsAiError }}</div>
            <div v-else-if="opsAiInsights" class="ai-insights-wrap">
              <h4 class="ai-headline">{{ opsAiInsights.headline || 'Operations Pulse' }}</h4>

              <div class="ai-columns">
                <div class="ai-column">
                  <h5>Summary</h5>
                  <ul class="ai-list">
                    <li v-for="(line, idx) in (opsAiInsights.summary || []).slice(0, 4)" :key="`summary-${idx}`">
                      {{ line }}
                    </li>
                  </ul>
                </div>

                <div class="ai-column">
                  <h5>Risks</h5>
                  <ul class="ai-list risks">
                    <li v-for="(risk, idx) in (opsAiInsights.risks || []).slice(0, 4)" :key="`risk-${idx}`">
                      {{ formatRiskItem(risk) }}
                    </li>
                  </ul>
                </div>

                <div class="ai-column">
                  <h5>Actions</h5>
                  <ul class="ai-list actions">
                    <li v-for="(action, idx) in (opsAiInsights.actions || []).slice(0, 4)" :key="`action-${idx}`">
                      {{ formatActionItem(action) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">No AI insights available.</div>
          </div>

          <div class="dashboard-card full-width">
            <div class="card-header">
              <h3>💳 Fee Risk Prediction</h3>
              <button @click="loadFeeRiskPrediction(new Date().getFullYear())" class="view-all-btn" :disabled="feeRiskLoading">
                {{ feeRiskInsights ? 'Refresh Prediction →' : 'Generate Prediction →' }}
              </button>
            </div>

            <div v-if="feeRiskLoading" class="empty-state">Generating fee risk prediction...</div>
            <div v-else-if="feeRiskError" class="state-msg error">{{ feeRiskError }}</div>
            <div v-else-if="feeRiskInsights" class="ai-insights-wrap">
              <h4 class="ai-headline">{{ feeRiskInsights.headline || 'Fee Risk Radar' }}</h4>
              <div class="ai-columns">
                <div class="ai-column">
                  <h5>Summary</h5>
                  <ul class="ai-list">
                    <li v-for="(line, idx) in (feeRiskInsights.summary || []).slice(0, 4)" :key="`fee-summary-${idx}`">
                      {{ line }}
                    </li>
                  </ul>
                </div>
                <div class="ai-column">
                  <h5>Top Risky Students</h5>
                  <ul class="ai-list risks">
                    <li v-for="(row, idx) in (feeRiskInsights.risky_students || []).slice(0, 5)" :key="`fee-student-${idx}`">
                      {{ row.student_name }} - Rs {{ Number(row.outstanding_amount || 0).toLocaleString() }} pending
                    </li>
                  </ul>
                </div>
                <div class="ai-column">
                  <h5>Actions</h5>
                  <ul class="ai-list actions">
                    <li v-for="(action, idx) in (feeRiskInsights.actions || []).slice(0, 4)" :key="`fee-action-${idx}`">
                      {{ formatActionItem(action) }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">No fee risk prediction generated yet.</div>
          </div>

          <!-- Quick Actions -->
          <div class="dashboard-card full-width">
            <div class="card-header">
              <h3>⚡ Quick Actions</h3>
            </div>
            <div class="quick-actions">
              <button @click="activeSection = 'students'" class="action-btn primary">
                <span class="action-icon">➕</span>
                View Students
              </button>
              <button @click="activeSection = 'batches'" class="action-btn success">
                <span class="action-icon">📚</span>
                View Batches
              </button>
              <button @click="activeSection = 'fees'" class="action-btn info">
                <span class="action-icon">💰</span>
                Fee Payments
              </button>
              <button @click="activeSection = 'salary'" class="action-btn warning">
                <span class="action-icon">💼</span>
                Salary Payments
              </button>
              <button @click="activeSection = 'teachers'" class="action-btn secondary">
                <span class="action-icon">👨‍🏫</span>
                View Teachers
              </button>
              <button @click="loadDashboardData" class="action-btn refresh">
                <span class="action-icon">🔄</span>
                Refresh Dashboard
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- ── BATCHES VIEW ── -->
      <template v-if="activeSection === 'batches'">
        <header class="content-header row-between">
          <div>
            <h1>Batch Management</h1>
            <p class="breadcrumb">Home / Batches</p>
          </div>
          <button class="btn-primary" @click="openCreateModal">+ New Batch</button>
        </header>

        <!-- Loading / Error -->
        <div v-if="batchLoading" class="state-msg">Loading batches…</div>
        <div v-else-if="batchError" class="state-msg error">{{ batchError }}</div>

        <!-- Table -->
        <div v-else class="content-section no-pad">
          <div class="table-toolbar">
            <div class="search-box">
              <input 
                v-model="batchSearchQuery" 
                type="text" 
                placeholder="Search by ID or batch name..." 
                class="search-input"
              />
            </div>
            <span class="table-count">{{ filteredBatches.length }} batch{{ filteredBatches.length !== 1 ? 'es' : '' }}</span>
            <button class="btn-refresh" @click="() => loadBatches()">↺ Refresh</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Batch Name</th>
                  <th>Year</th>
                  <th>Batch Cost</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Teachers</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredBatches.length === 0">
                  <td colspan="9" class="empty-row">{{ batchSearchQuery ? 'No batches match your search' : 'No batches found. Create one!' }}</td>
                </tr>
                <tr v-for="batch in filteredBatches" :key="batch.id">
                  <td>{{ batch.id }}</td>
                  <td class="bold clickable-name" @click="openBatchProfile(batch)" title="View Profile">{{ batch.batch_name }}</td>
                  <td>{{ batch.year }}</td>
                  <td>₹{{ batch.batch_cost?.toLocaleString() ?? '0' }}</td>
                  <td>{{ batch.start_date ?? '—' }}</td>
                  <td>{{ batch.end_date ?? '—' }}</td>
                  <td>
                    <span :class="['badge', batch.is_active ? 'badge-green' : 'badge-grey']">
                      {{ batch.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ batch.teachers?.length ?? 0 }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon edit" @click="openEditModal(batch)" title="Edit">✏️</button>
                    <button class="btn-icon delete" @click="confirmDelete(batch)" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="pagination" v-if="totalPages > 1">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹ Prev</button>
            <span>Page {{ currentPage }} of {{ totalPages }}</span>
            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">Next ›</button>
          </div>
        </div>
      </template>

      <!-- ── STUDENTS VIEW ── -->
      <template v-if="activeSection === 'students'">
        <header class="content-header row-between">
          <div>
            <h1>Student Management</h1>
            <p class="breadcrumb">Home / Students</p>
          </div>
          <button class="btn-primary" @click="openCreateStudentModal">+ Register Student</button>
        </header>

        <!-- Loading / Error -->
        <div v-if="studentLoading" class="state-msg">Loading students…</div>
        <div v-else-if="studentError" class="state-msg error">{{ studentError }}</div>

        <!-- Table -->
        <div v-else class="content-section no-pad">
          <div class="table-toolbar">
            <div class="search-box">
              <input 
                v-model="studentSearchQuery" 
                type="text" 
                placeholder="Search by ID, name, email, or phone..." 
                class="search-input"
                @input="handleStudentSearch"
              />
            </div>
            <span class="table-count">{{ filteredStudents.length }} student{{ filteredStudents.length !== 1 ? 's' : '' }}</span>
            <button class="btn-refresh" @click="() => loadStudents()">↺ Refresh</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Batch</th>
                  <th>Enrollment Date</th>
                  <th>Discount %</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredStudents.length === 0">
                  <td colspan="9" class="empty-row">{{ studentSearchQuery ? 'No students match your search' : 'No students found. Register one!' }}</td>
                </tr>
                <tr v-for="student in filteredStudents" :key="student.id">
                  <td>{{ student.id }}</td>
                  <td class="bold clickable-name" @click="openStudentProfile(student)" title="View Profile">
                    {{ student.user?.full_name || '—' }}
                  </td>
                  <td>{{ student.user?.email || '—' }}</td>
                  <td>{{ student.phone_number || '—' }}</td>
                  <td>{{ student.batch?.batch_name || '—' }}</td>
                  <td>{{ student.enrollment_date || '—' }}</td>
                  <td>{{ student.discount_percent }}%</td>
                  <td>
                    <span :class="['badge', student.is_active ? 'badge-green' : 'badge-grey']">
                      {{ student.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button class="btn-icon edit" @click="openEditStudentModal(student)" title="Edit">✏️</button>
                    <button class="btn-icon delete" @click="confirmDeleteStudent(student)" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="pagination" v-if="studentTotalPages > 1">
            <button :disabled="studentCurrentPage === 1" @click="changeStudentPage(studentCurrentPage - 1)">‹ Prev</button>
            <span>Page {{ studentCurrentPage }} of {{ studentTotalPages }}</span>
            <button :disabled="studentCurrentPage === studentTotalPages" @click="changeStudentPage(studentCurrentPage + 1)">Next ›</button>
          </div>
        </div>
      </template>

      <!-- ── TEACHERS VIEW ── -->
      <template v-if="activeSection === 'teachers'">
        <header class="content-header row-between">
          <div>
            <h1>Teacher Management</h1>
            <p class="breadcrumb">Home / Teachers</p>
          </div>
          <button class="btn-primary" @click="openCreateTeacherModal">+ Register Teacher</button>
        </header>

        <!-- Search Bar -->
        <div class="content-section">
          <div class="search-bar">
            <input 
              v-model="teacherSearchQuery" 
              type="text" 
              placeholder="Search by ID, name, email, phone, or specialization..."
              @keyup.enter="searchTeachers"
              class="search-input"
            />
            <button class="btn-primary" @click="searchTeachers">🔍 Search</button>
            <button class="btn-secondary" @click="clearTeacherSearch" v-if="teacherSearchQuery">✕ Clear</button>
          </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="teacherLoading" class="state-msg">Loading teachers…</div>
        <div v-else-if="teacherError" class="state-msg error">{{ teacherError }}</div>

        <!-- Table -->
        <div v-else class="content-section no-pad">
          <div class="table-toolbar">
            <span class="table-count">{{ filteredTeachers.length }} teacher{{ filteredTeachers.length !== 1 ? 's' : '' }}</span>
            <button class="btn-refresh" @click="() => loadTeachers()">↺ Refresh</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone Number</th>
                  <th>Specialization</th>
                  <th>Hire Date</th>
                  <th>Status</th>
                  <th>Batches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredTeachers.length === 0">
                  <td colspan="9" class="empty-row">No teachers found. Register one!</td>
                </tr>
                <tr v-for="teacher in filteredTeachers" :key="teacher.id">
                  <td>{{ teacher.id }}</td>
                  <td class="bold clickable-name" @click="openTeacherProfile(teacher)">{{ teacher.user?.full_name || '—' }}</td>
                  <td>{{ teacher.user?.email || '—' }}</td>
                  <td>{{ teacher.phone_number || '—' }}</td>
                  <td>{{ teacher.specialization || '—' }}</td>
                  <td>{{ teacher.hire_date || '—' }}</td>
                  <td>
                    <span :class="['badge', teacher.is_active ? 'badge-green' : 'badge-grey']">
                      {{ teacher.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ teacher.batches?.length ?? 0 }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon edit" @click="openEditTeacherModal(teacher)" title="Edit">✏️</button>
                    <button class="btn-icon delete" @click="confirmDeleteTeacher(teacher)" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="pagination" v-if="teacherTotalPages > 1">
            <button :disabled="teacherCurrentPage === 1" @click="changeTeacherPage(teacherCurrentPage - 1)">‹ Prev</button>
            <span>Page {{ teacherCurrentPage }} of {{ teacherTotalPages }}</span>
            <button :disabled="teacherCurrentPage === teacherTotalPages" @click="changeTeacherPage(teacherCurrentPage + 1)">Next ›</button>
          </div>
        </div>
      </template>

      <!-- ── USERS VIEW ── -->
      <template v-if="activeSection === 'users'">
        <header class="content-header row-between">
          <div>
            <h1>User Management</h1>
            <p class="breadcrumb">Home / Users</p>
          </div>
          <button class="btn-primary" @click="openCreateUserModal">+ Register User</button>
        </header>

        <!-- Loading / Error -->
        <div v-if="userLoading" class="state-msg">Loading users…</div>
        <div v-else-if="userError" class="state-msg error">{{ userError }}</div>

        <!-- Table -->
        <div v-else class="content-section no-pad">
          <div class="table-toolbar">
            <span class="table-count">{{ filteredUsers.length }} user{{ filteredUsers.length !== 1 ? 's' : '' }}</span>
            <button class="btn-refresh" @click="() => loadUsers()">↺ Refresh</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="filteredUsers.length === 0">
                  <td colspan="7" class="empty-row">No users found.</td>
                </tr>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td class="bold">{{ user.full_name }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span :class="['badge', getRoleBadgeClass(user.role)]">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', user.is_active ? 'badge-green' : 'badge-grey']">
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td class="actions-cell">
                    <button class="btn-icon edit" @click="openEditUserModal(user)" title="Edit">✏️</button>
                    <button class="btn-icon delete" @click="confirmDeleteUser(user)" title="Delete">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

      <template v-if="activeSection === 'fees'">
        <header class="content-header row-between">
          <div>
            <h1>Fee Management</h1>
            <p class="breadcrumb">Home / Fees</p>
          </div>
        </header>

        <!-- Filters -->
        <div class="content-section filter-section">
          <div class="filter-row">
            <div class="filter-group">
              <label>Quick Filter:</label>
              <select v-model="feeQuickFilter" @change="applyFeeQuickFilter" class="form-select">
                <option value="">All Payments</option>
                <option value="10">Last 10 Payments</option>
                <option value="20">Last 20 Payments</option>
                <option value="50">Last 50 Payments</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Last N Months:</label>
              <select v-model="feeMonthFilter" @change="applyFeeFilters" class="form-select">
                <option value="">All Time</option>
                <option v-for="n in 24" :key="n" :value="n">Last {{ n }} Month{{ n > 1 ? 's' : '' }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>From Date:</label>
              <input v-model="feeStartDate" type="date" class="form-input" @change="applyFeeFilters" />
            </div>
            <div class="filter-group">
              <label>To Date:</label>
              <input v-model="feeEndDate" type="date" class="form-input" @change="applyFeeFilters" />
            </div>
            <button class="btn-secondary" @click="clearFeeFilters">Clear Filters</button>
          </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="feeListLoading" class="state-msg">Loading fee payments…</div>
        <div v-else-if="feeListError" class="state-msg error">{{ feeListError }}</div>

        <!-- Summary Cards -->
        <div v-else class="content-section">
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-label">Total Payments</div>
              <div class="summary-value">{{ feePaymentsList.length }}</div>
            </div>
            <div class="summary-card received">
              <div class="summary-label">Total Amount</div>
              <div class="summary-value">₹{{ feeTotalAmount.toLocaleString() }}</div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-toolbar">
            <span class="table-count">{{ feePaymentsList.length }} payment{{ feePaymentsList.length !== 1 ? 's' : '' }}</span>
            <button class="btn-refresh" @click="() => loadFeePaymentsList()">↺ Refresh</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px;"></th>
                  <th>#</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Received By</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="feePaymentsList.length === 0">
                  <td colspan="7" class="empty-row">No fee payments found.</td>
                </tr>
                <template v-for="payment in feePaymentsList" :key="payment.id">
                  <tr>
                    <td>
                      <button class="btn-expand" @click="toggleFeeListDetails(payment.id)" :title="expandedFeeListId === payment.id ? 'Hide Details' : 'Show Details'">
                        {{ expandedFeeListId === payment.id ? '▼' : '▶' }}
                      </button>
                    </td>
                    <td>{{ payment.id }}</td>
                    <td class="bold">{{ payment.student?.user?.full_name || '—' }}</td>
                    <td class="bold">₹{{ payment.amount?.toLocaleString() }}</td>
                    <td>{{ payment.payment_date }}</td>
                    <td><span class="badge badge-blue">{{ payment.payment_method }}</span></td>
                    <td>{{ payment.receiver_name || '—' }}</td>
                  </tr>
                  <!-- Expandable Details Row -->
                  <tr v-if="expandedFeeListId === payment.id" class="details-row">
                    <td colspan="7">
                      <div class="details-content">
                        <div class="details-grid">
                          <div class="detail-item">
                            <label>Payment ID:</label>
                            <span>{{ payment.id }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Student ID:</label>
                            <span>{{ payment.student_id }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Student Email:</label>
                            <span>{{ payment.student?.user?.email || '—' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Reference No:</label>
                            <span>{{ payment.reference_no || '—' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Remarks:</label>
                            <span>{{ payment.remarks || '—' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Created At:</label>
                            <span>{{ formatDateTime(payment.created_at) }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Last Updated:</label>
                            <span>{{ formatDateTime(payment.updated_at) }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="pagination" v-if="feePagination.pages > 1 && !feeQuickFilter">
            <button :disabled="feePagination.page === 1" @click="changeFeeListPage(feePagination.page - 1)">‹ Prev</button>
            <span>Page {{ feePagination.page }} of {{ feePagination.pages }}</span>
            <button :disabled="!feePagination.has_next" @click="changeFeeListPage(feePagination.page + 1)">Next ›</button>
          </div>
        </div>
      </template>

      <template v-if="activeSection === 'salary'">
        <header class="content-header row-between">
          <div>
            <h1>Salary Management</h1>
            <p class="breadcrumb">Home / Salary</p>
          </div>
        </header>

        <!-- Filters -->
        <div class="content-section filter-section">
          <div class="filter-row">
            <div class="filter-group">
              <label>Quick Filter:</label>
              <select v-model="salaryQuickFilter" @change="applySalaryQuickFilter" class="form-select">
                <option value="">All Payments</option>
                <option value="10">Last 10 Payments</option>
                <option value="20">Last 20 Payments</option>
                <option value="50">Last 50 Payments</option>
              </select>
            </div>
            <div class="filter-group">
              <label>Last N Months:</label>
              <select v-model="salaryMonthFilter" @change="applySalaryFilters" class="form-select">
                <option value="">All Time</option>
                <option v-for="n in 24" :key="n" :value="n">Last {{ n }} Month{{ n > 1 ? 's' : '' }}</option>
              </select>
            </div>
            <div class="filter-group">
              <label>From Date:</label>
              <input v-model="salaryStartDate" type="date" class="form-input" @change="applySalaryFilters" />
            </div>
            <div class="filter-group">
              <label>To Date:</label>
              <input v-model="salaryEndDate" type="date" class="form-input" @change="applySalaryFilters" />
            </div>
            <button class="btn-secondary" @click="clearSalaryFilters">Clear Filters</button>
          </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="salaryListLoading" class="state-msg">Loading salary payments…</div>
        <div v-else-if="salaryListError" class="state-msg error">{{ salaryListError }}</div>

        <!-- Summary Cards -->
        <div v-else class="content-section">
          <div class="summary-cards">
            <div class="summary-card">
              <div class="summary-label">Total Payments</div>
              <div class="summary-value">{{ salaryPaymentsList.length }}</div>
            </div>
            <div class="summary-card paid">
              <div class="summary-label">Total Amount</div>
              <div class="summary-value">₹{{ salaryTotalAmount.toLocaleString() }}</div>
            </div>
          </div>

          <!-- Table -->
          <div class="table-toolbar">
            <span class="table-count">{{ salaryPaymentsList.length }} payment{{ salaryPaymentsList.length !== 1 ? 's' : '' }}</span>
            <button class="btn-refresh" @click="() => loadSalaryPaymentsList()">↺ Refresh</button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width: 30px;"></th>
                  <th>#</th>
                  <th>Teacher</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Method</th>
                  <th>Paid By</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="salaryPaymentsList.length === 0">
                  <td colspan="7" class="empty-row">No salary payments found.</td>
                </tr>
                <template v-for="salary in salaryPaymentsList" :key="salary.id">
                  <tr>
                    <td>
                      <button class="btn-expand" @click="toggleSalaryListDetails(salary.id)" :title="expandedSalaryListId === salary.id ? 'Hide Details' : 'Show Details'">
                        {{ expandedSalaryListId === salary.id ? '▼' : '▶' }}
                      </button>
                    </td>
                    <td>{{ salary.id }}</td>
                    <td class="bold">{{ salary.teacher?.user?.full_name || '—' }}</td>
                    <td class="bold">₹{{ salary.amount?.toLocaleString() }}</td>
                    <td>{{ salary.payment_date }}</td>
                    <td><span class="badge badge-blue">{{ salary.payment_method }}</span></td>
                    <td>{{ salary.payer_name || '—' }}</td>
                  </tr>
                  <!-- Expandable Details Row -->
                  <tr v-if="expandedSalaryListId === salary.id" class="details-row">
                    <td colspan="7">
                      <div class="details-content">
                        <div class="details-grid">
                          <div class="detail-item">
                            <label>Salary ID:</label>
                            <span>{{ salary.id }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Teacher ID:</label>
                            <span>{{ salary.teacher_id }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Teacher Email:</label>
                            <span>{{ salary.teacher?.user?.email || '—' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Specialization:</label>
                            <span>{{ salary.teacher?.specialization || '—' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Reference No:</label>
                            <span>{{ salary.reference_no || '—' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Remarks:</label>
                            <span>{{ salary.remarks || '—' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Created At:</label>
                            <span>{{ formatDateTime(salary.created_at) }}</span>
                          </div>
                          <div class="detail-item">
                            <label>Last Updated:</label>
                            <span>{{ formatDateTime(salary.updated_at) }}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
          <!-- Pagination -->
          <div class="pagination" v-if="salaryPagination.pages > 1 && !salaryQuickFilter">
            <button :disabled="salaryPagination.page === 1" @click="changeSalaryListPage(salaryPagination.page - 1)">‹ Prev</button>
            <span>Page {{ salaryPagination.page }} of {{ salaryPagination.pages }}</span>
            <button :disabled="!salaryPagination.has_next" @click="changeSalaryListPage(salaryPagination.page + 1)">Next ›</button>
          </div>
        </div>
      </template>
      <template v-if="activeSection === 'reports'">
        <header class="content-header"><h1>Reports</h1><p class="breadcrumb">Home / Reports</p></header>
        <div class="content-section"><p style="color:#888">Reports coming soon.</p></div>
      </template>
    </main>

    <!-- ══ CREATE / EDIT MODAL ══ -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Batch' : 'Create New Batch' }}</h2>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="modalError" class="form-error">⚠️ {{ modalError }}</div>

          <div class="form-grid">
            <div class="form-field">
              <label>Batch Name <span class="req">*</span></label>
              <input v-model="form.batch_name" type="text" placeholder="e.g. Foundation Batch A" maxlength="120" />
            </div>
            <div class="form-field">
              <label>Year <span class="req">*</span></label>
              <input v-model.number="form.year" type="number" placeholder="e.g. 2026" min="2000" max="2100" />
            </div>
            <div class="form-field">
              <label>Batch Cost (₹) <span class="req">*</span></label>
              <input v-model.number="form.batch_cost" type="number" placeholder="e.g. 10000" min="0" step="100" />
            </div>
            <div class="form-field">
              <label>Start Date</label>
              <input v-model="form.start_date" type="date" />
            </div>
            <div class="form-field">
              <label>End Date</label>
              <input v-model="form.end_date" type="date" />
            </div>
          </div>

          <div class="form-field toggle-field">
            <label class="toggle-label">
              <span>Active</span>
              <div class="toggle-wrap">
                <input type="checkbox" v-model="form.is_active" id="is_active" class="toggle-input" />
                <label for="is_active" class="toggle-slider"></label>
              </div>
            </label>
            <span class="toggle-hint">{{ form.is_active ? 'Batch is active and visible' : 'Batch is inactive / hidden' }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeModal" :disabled="saving">Cancel</button>
          <button class="btn-save" @click="saveBatch" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Saving…' : (isEditing ? 'Update Batch' : 'Create Batch') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ DELETE CONFIRM MODAL ══ -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Delete Batch</h2>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ deletingBatch?.batch_name }}</strong>?</p>
          <p class="delete-warn">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteModal = false">Cancel</button>
          <button class="btn-delete" @click="deleteBatch" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ TEACHER CREATE / EDIT MODAL ══ -->
    <div v-if="showTeacherModal" class="modal-overlay" @click.self="closeTeacherModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditingTeacher ? 'Edit Teacher' : 'Register New Teacher' }}</h2>
          <button class="modal-close" @click="closeTeacherModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="teacherModalError" class="form-error">⚠️ {{ teacherModalError }}</div>

          <!-- User Selection (only for create) -->
          <div v-if="!isEditingTeacher" class="form-field">
            <label>Select User Account <span class="req">*</span></label>
            <select v-model.number="teacherForm.user_id" class="form-select">
              <option value="">-- Select a user --</option>
              <option v-for="user in coachUsers" :key="user.id" :value="user.id">
                {{ user.full_name }} ({{ user.email }})
              </option>
            </select>
            <span class="field-hint">Select a user with 'coach' role to create their teacher profile</span>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Specialization</label>
              <input v-model="teacherForm.specialization" type="text" placeholder="e.g. Mathematics" maxlength="120" />
            </div>
            <div class="form-field">
              <label>Phone Number</label>
              <input v-model="teacherForm.phone_number" type="text" placeholder="e.g. 8888888888" maxlength="20" />
            </div>
            <div class="form-field">
              <label>Hire Date</label>
              <input v-model="teacherForm.hire_date" type="date" />
            </div>
          </div>

          <div class="form-field toggle-field">
            <label class="toggle-label">
              <span>Active</span>
              <div class="toggle-wrap">
                <input type="checkbox" v-model="teacherForm.is_active" id="teacher_is_active" class="toggle-input" />
                <label for="teacher_is_active" class="toggle-slider"></label>
              </div>
            </label>
            <span class="toggle-hint">{{ teacherForm.is_active ? 'Teacher is active' : 'Teacher is inactive' }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeTeacherModal" :disabled="saving">Cancel</button>
          <button class="btn-save" @click="saveTeacher" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Saving…' : (isEditingTeacher ? 'Update Teacher' : 'Register Teacher') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ TEACHER DELETE CONFIRM MODAL ══ -->
    <div v-if="showDeleteTeacherModal" class="modal-overlay" @click.self="showDeleteTeacherModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Delete Teacher</h2>
          <button class="modal-close" @click="showDeleteTeacherModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ deletingTeacher?.user?.full_name }}</strong>?</p>
          <p class="delete-warn">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteTeacherModal = false">Cancel</button>
          <button class="btn-delete" @click="deleteTeacher" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ USER CREATE / EDIT MODAL ══ -->
    <div v-if="showUserModal" class="modal-overlay" @click.self="closeUserModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditingUser ? 'Edit User' : 'Register New User' }}</h2>
          <button class="modal-close" @click="closeUserModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="userModalError" class="form-error">⚠️ {{ userModalError }}</div>

          <div class="form-grid">
            <div class="form-field">
              <label>Full Name <span class="req">*</span></label>
              <input v-model="userForm.full_name" type="text" placeholder="Enter full name" maxlength="120" />
            </div>
            <div class="form-field">
              <label>Email <span class="req">*</span></label>
              <input v-model="userForm.email" type="email" placeholder="user@example.com" :disabled="isEditingUser" />
              <span v-if="isEditingUser" class="field-hint">Email cannot be changed</span>
            </div>
            <div class="form-field">
              <label>Role <span class="req">*</span></label>
              <select v-model="userForm.role" class="form-select">
                <option value="">-- Select role --</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
                <option value="coach">Coach</option>
              </select>
            </div>
            <div class="form-field">
              <label>Password {{ isEditingUser ? '' : ' *' }}</label>
              <input v-model="userForm.password" type="password" :placeholder="isEditingUser ? 'Leave blank to keep current' : 'Enter password'" />
              <span v-if="isEditingUser" class="field-hint">Leave blank to keep current password</span>
            </div>
          </div>

          <div class="form-field toggle-field">
            <label class="toggle-label">
              <span>Active</span>
              <div class="toggle-wrap">
                <input type="checkbox" v-model="userForm.is_active" id="user_is_active" class="toggle-input" />
                <label for="user_is_active" class="toggle-slider"></label>
              </div>
            </label>
            <span class="toggle-hint">{{ userForm.is_active ? 'User account is active' : 'User account is inactive' }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeUserModal" :disabled="saving">Cancel</button>
          <button class="btn-save" @click="saveUser" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Saving…' : (isEditingUser ? 'Update User' : 'Register User') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ USER DELETE CONFIRM MODAL ══ -->
    <div v-if="showDeleteUserModal" class="modal-overlay" @click.self="showDeleteUserModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Delete User</h2>
          <button class="modal-close" @click="showDeleteUserModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ deletingUser?.full_name }}</strong>?</p>
          <p class="delete-warn">This will deactivate the user account.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteUserModal = false">Cancel</button>
          <button class="btn-delete" @click="deleteUser" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ STUDENT CREATE / EDIT MODAL ══ -->
    <div v-if="showStudentModal" class="modal-overlay" @click.self="closeStudentModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditingStudent ? 'Edit Student' : 'Register New Student' }}</h2>
          <button class="modal-close" @click="closeStudentModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="studentModalError" class="form-error">⚠️ {{ studentModalError }}</div>

          <!-- User Selection (only for create) -->
          <div v-if="!isEditingStudent" class="form-field">
            <label>Select User Account <span class="req">*</span></label>
            <select v-model.number="studentForm.user_id" class="form-select">
              <option value="">-- Select a user --</option>
              <option v-for="user in studentUsers" :key="user.id" :value="user.id">
                {{ user.full_name }} ({{ user.email }})
              </option>
            </select>
            <span class="field-hint">Select a user with 'student' role to create their student profile</span>
          </div>

          <div class="form-grid">
            <div class="form-field">
              <label>Phone Number</label>
              <input v-model="studentForm.phone_number" type="text" placeholder="e.g. 9999999999" maxlength="20" />
            </div>
            <div class="form-field">
              <label>Batch</label>
              <select v-model.number="studentForm.batch_id" class="form-select">
                <option :value="null">-- No batch assigned --</option>
                <option v-for="batch in batches" :key="batch.id" :value="batch.id">
                  {{ batch.batch_name }} ({{ batch.year }})
                </option>
              </select>
            </div>
            <div class="form-field">
              <label>Date of Birth</label>
              <input v-model="studentForm.date_of_birth" type="date" />
            </div>
            <div class="form-field">
              <label>Enrollment Date</label>
              <input v-model="studentForm.enrollment_date" type="date" />
            </div>
            <div class="form-field">
              <label>Discount Percent (%)</label>
              <input v-model.number="studentForm.discount_percent" type="number" min="0" max="100" step="0.01" placeholder="e.g. 10.5" />
            </div>
          </div>

          <div class="form-field">
            <label>Address</label>
            <textarea v-model="studentForm.address" placeholder="Enter student address" rows="2" class="form-textarea"></textarea>
          </div>

          <div class="form-field toggle-field">
            <label class="toggle-label">
              <span>Active</span>
              <div class="toggle-wrap">
                <input type="checkbox" v-model="studentForm.is_active" id="student_is_active" class="toggle-input" />
                <label for="student_is_active" class="toggle-slider"></label>
              </div>
            </label>
            <span class="toggle-hint">{{ studentForm.is_active ? 'Student is active' : 'Student is inactive' }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeStudentModal" :disabled="saving">Cancel</button>
          <button class="btn-save" @click="saveStudent" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Saving…' : (isEditingStudent ? 'Update Student' : 'Register Student') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ STUDENT DELETE CONFIRM MODAL ══ -->
    <div v-if="showDeleteStudentModal" class="modal-overlay" @click.self="showDeleteStudentModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Delete Student</h2>
          <button class="modal-close" @click="showDeleteStudentModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete <strong>{{ deletingStudent?.user?.full_name }}</strong>?</p>
          <p class="delete-warn">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteStudentModal = false">Cancel</button>
          <button class="btn-delete" @click="deleteStudent" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ STUDENT PROFILE MODAL ══ -->
    <div v-if="showStudentProfile" class="modal-overlay" @click.self="closeStudentProfile">
      <div class="modal modal-lg profile-modal">
        <div class="modal-header">
          <h2>📋 Student Profile</h2>
          <button class="modal-close" @click="closeStudentProfile">✕</button>
        </div>
        <div class="modal-body" style="max-height: 80vh; overflow-y: auto;">
          <div v-if="profileLoading" class="state-msg">Loading profile...</div>
          <div v-else-if="profileError" class="state-msg error">{{ profileError }}</div>
          <div v-else-if="selectedStudentProfile" class="profile-content">
            
            <!-- Student Basic Info -->
            <section class="profile-section">
              <h3>👤 Personal Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Student ID:</label>
                  <span>{{ selectedStudentProfile.id }}</span>
                </div>
                <div class="info-item">
                  <label>Full Name:</label>
                  <span class="bold">{{ selectedStudentProfile.user?.full_name }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ selectedStudentProfile.user?.email }}</span>
                </div>
                <div class="info-item">
                  <label>Phone Number:</label>
                  <span>{{ selectedStudentProfile.phone_number || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Date of Birth:</label>
                  <span>{{ selectedStudentProfile.date_of_birth || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Enrollment Date:</label>
                  <span>{{ selectedStudentProfile.enrollment_date || '—' }}</span>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <label>Address:</label>
                  <span>{{ selectedStudentProfile.address || '—' }}</span>
                </div>
              </div>
            </section>

            <!-- Batch & Fee Information -->
            <section class="profile-section" v-if="selectedStudentProfile.batch_id && batchDetails">
              <h3>🎓 Batch & Fee Details</h3>
              <div class="fee-summary">
                <div class="fee-card">
                  <label>Batch Name:</label>
                  <div class="fee-value bold">{{ batchDetails.batch_name }} ({{ batchDetails.year }})</div>
                </div>
                <div class="fee-card">
                  <label>Batch Cost:</label>
                  <div class="fee-value">₹{{ batchDetails.batch_cost?.toLocaleString() }}</div>
                </div>
                <div class="fee-card">
                  <label>Discount:</label>
                  <div class="fee-value discount">{{ selectedStudentProfile.discount_percent }}%</div>
                </div>
                <div class="fee-card highlight">
                  <label>Student's Fee (After Discount):</label>
                  <div class="fee-value big">₹{{ actualFeeAmount.toLocaleString() }}</div>
                </div>
              </div>
              
              <!-- Fee Status -->
              <div class="fee-status-grid">
                <div class="status-card paid">
                  <div class="status-label">Total Paid</div>
                  <div class="status-value">₹{{ totalPaid.toLocaleString() }}</div>
                </div>
                <div class="status-card pending">
                  <div class="status-label">Remaining</div>
                  <div class="status-value">₹{{ remainingAmount.toLocaleString() }}</div>
                </div>
                <div class="status-card">
                  <div class="status-label">Payment Progress</div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: paymentProgress + '%' }"></div>
                  </div>
                  <div class="status-value small">{{ paymentProgress }}% Complete</div>
                </div>
              </div>
            </section>

            <!-- No Batch Assigned -->
            <section class="profile-section" v-else>
              <div class="alert-info">ℹ️ No batch assigned to this student yet.</div>
            </section>

            <!-- Payment History -->
            <section class="profile-section">
              <div class="section-header">
                <h3>💰 Payment History</h3>
                <button class="btn-primary btn-sm" @click="openAddPaymentModal" v-if="selectedStudentProfile.batch_id">
                  + Add Payment
                </button>
              </div>
              
              <div v-if="loadingPayments" class="state-msg">Loading payments...</div>
              <div v-else-if="payments.length === 0" class="empty-state">
                <p>No payments recorded yet.</p>
                <button class="btn-primary" @click="openAddPaymentModal" v-if="selectedStudentProfile.batch_id">
                  Record First Payment
                </button>
              </div>
              <div v-else class="payments-table">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 30px;"></th>
                      <th>#</th>
                      <th>Amount</th>
                      <th>Payment Date</th>
                      <th>Method</th>
                      <th>Received By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="payment in payments" :key="payment.id">
                      <tr>
                        <td>
                          <button class="btn-expand" @click="togglePaymentDetails(payment.id)" :title="expandedPaymentId === payment.id ? 'Hide Details' : 'Show Details'">
                            {{ expandedPaymentId === payment.id ? '▼' : '▶' }}
                          </button>
                        </td>
                        <td>{{ payment.id }}</td>
                        <td class="bold">₹{{ payment.amount?.toLocaleString() }}</td>
                        <td>{{ payment.payment_date }}</td>
                        <td><span class="badge badge-blue">{{ payment.payment_method }}</span></td>
                        <td>{{ payment.receiver_name || '—' }}</td>
                        <td class="actions-cell">
                          <button class="btn-icon edit" @click="openEditPaymentModal(payment)" title="Edit">✏️</button>
                          <button class="btn-icon delete" @click="confirmDeletePayment(payment)" title="Delete">🗑️</button>
                        </td>
                      </tr>
                      <!-- Expandable Details Row -->
                      <tr v-if="expandedPaymentId === payment.id" class="details-row">
                        <td colspan="7">
                          <div class="details-content">
                            <div class="details-grid">
                              <div class="detail-item">
                                <label>Reference No:</label>
                                <span>{{ payment.reference_no || '—' }}</span>
                              </div>
                              <div class="detail-item">
                                <label>Remarks:</label>
                                <span>{{ payment.remarks || '—' }}</span>
                              </div>
                              <div class="detail-item">
                                <label>Created At:</label>
                                <span>{{ formatDateTime(payment.created_at) }}</span>
                              </div>
                              <div class="detail-item">
                                <label>Last Updated:</label>
                                <span>{{ formatDateTime(payment.updated_at) }}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Connected Parents -->
            <section class="profile-section">
              <div class="section-header">
                <h3>👨‍👩‍👧 Connected Parents</h3>
                <button class="btn-primary btn-sm" @click="openConnectParentDropdown">
                  + Connect Parent
                </button>
              </div>

              <!-- Connect Parent Dropdown -->
              <div v-if="showConnectParentDropdown" class="connect-parent-form">
                <div class="form-row">
                  <select v-model="selectedParentUserId" class="form-input">
                    <option :value="null" disabled>Select a parent user…</option>
                    <option
                      v-for="parent in availableParents"
                      :key="parent.id"
                      :value="parent.id"
                    >
                      {{ parent.full_name }} ({{ parent.email }})
                    </option>
                  </select>
                  <button
                    class="btn-primary btn-sm"
                    :disabled="!selectedParentUserId || connectingParent"
                    @click="handleConnectParent"
                  >
                    <span v-if="connectingParent" class="mini-spinner"></span>
                    {{ connectingParent ? 'Connecting…' : 'Connect' }}
                  </button>
                  <button class="btn-cancel btn-sm" @click="showConnectParentDropdown = false">Cancel</button>
                </div>
                <div v-if="connectParentError" class="form-error" style="margin-top: 8px;">⚠️ {{ connectParentError }}</div>
                <div v-if="availableParents.length === 0" class="empty-state" style="margin-top: 8px;">
                  No available parent users to connect. Create a user with the 'parent' role first.
                </div>
              </div>

              <!-- Parent List -->
              <div v-if="selectedStudentProfile?.parents && selectedStudentProfile.parents.length > 0" class="parent-list">
                <div v-for="parent in selectedStudentProfile.parents" :key="parent.id" class="parent-card">
                  <div class="parent-info">
                    <span class="parent-icon">👤</span>
                    <div>
                      <div class="parent-name">{{ parent.full_name }}</div>
                      <div class="parent-email">{{ parent.email }}</div>
                    </div>
                  </div>
                  <button
                    class="btn-icon delete"
                    title="Disconnect Parent"
                    :disabled="disconnectingParentId === parent.id"
                    @click="handleDisconnectParent(parent)"
                  >
                    {{ disconnectingParentId === parent.id ? '⏳' : '❌' }}
                  </button>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>No parents connected yet.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ ADD/EDIT PAYMENT MODAL ══ -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="closePaymentModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditingPayment ? 'Edit Payment' : 'Add Payment' }}</h2>
          <button class="modal-close" @click="closePaymentModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="paymentModalError" class="form-error">⚠️ {{ paymentModalError }}</div>
          
          <div class="form-grid">
            <div class="form-field">
              <label>Amount <span class="req">*</span></label>
              <input v-model.number="paymentForm.amount" type="number" step="0.01" min="0" placeholder="Enter amount" />
            </div>
            <div class="form-field">
              <label>Payment Date <span class="req">*</span></label>
              <input v-model="paymentForm.payment_date" type="date" />
            </div>
            <div class="form-field">
              <label>Payment Method <span class="req">*</span></label>
              <select v-model="paymentForm.payment_method" class="form-select">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div class="form-field">
              <label>Reference No</label>
              <input v-model="paymentForm.reference_no" type="text" placeholder="Transaction/Receipt number" />
            </div>
          </div>
          
          <div class="form-field">
            <label>Remarks</label>
            <textarea v-model="paymentForm.remarks" placeholder="Additional notes..." rows="2" class="form-textarea"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closePaymentModal" :disabled="saving">Cancel</button>
          <button class="btn-save" @click="savePayment" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Saving…' : (isEditingPayment ? 'Update Payment' : 'Add Payment') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ DELETE PAYMENT CONFIRM MODAL ══ -->
    <div v-if="showDeletePaymentModal" class="modal-overlay" @click.self="showDeletePaymentModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Delete Payment</h2>
          <button class="modal-close" @click="showDeletePaymentModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this payment of <strong>₹{{ deletingPayment?.amount?.toLocaleString() }}</strong>?</p>
          <p class="delete-warn">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeletePaymentModal = false">Cancel</button>
          <button class="btn-delete" @click="deletePayment" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ TEACHER PROFILE MODAL ══ -->
    <div v-if="showTeacherProfile" class="modal-overlay" @click.self="closeTeacherProfile">
      <div class="modal modal-lg profile-modal">
        <div class="modal-header">
          <h2>👨‍🏫 Teacher Profile</h2>
          <button class="modal-close" @click="closeTeacherProfile">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="teacherProfileLoading" class="state-msg">Loading profile...</div>
          <div v-else-if="teacherProfileError" class="state-msg error">{{ teacherProfileError }}</div>
          <div v-else-if="selectedTeacherProfile" class="profile-content">
            
            <!-- Personal Info Section -->
            <section class="profile-section">
              <h3>📋 Personal Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Teacher ID:</label>
                  <span class="bold">{{ selectedTeacherProfile.id }}</span>
                </div>
                <div class="info-item">
                  <label>Full Name:</label>
                  <span class="bold">{{ selectedTeacherProfile.user?.full_name || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Email:</label>
                  <span>{{ selectedTeacherProfile.user?.email || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Phone Number:</label>
                  <span>{{ selectedTeacherProfile.phone_number || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Specialization:</label>
                  <span>{{ selectedTeacherProfile.specialization || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Hire Date:</label>
                  <span>{{ selectedTeacherProfile.hire_date || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Status:</label>
                  <span :class="['badge', selectedTeacherProfile.is_active ? 'badge-green' : 'badge-grey']">
                    {{ selectedTeacherProfile.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
                <div class="info-item" v-if="selectedTeacherProfile.batches?.length">
                  <label>Assigned Batches:</label>
                  <span>
                    <span v-for="(batch, idx) in selectedTeacherProfile.batches" :key="batch.id" class="badge badge-blue" style="margin-right: 4px;">
                      {{ batch.batch_name }} ({{ batch.year }})
                    </span>
                  </span>
                </div>
              </div>
            </section>

            <!-- Salary Summary -->
            <section class="profile-section">
              <h3>💰 Salary Summary</h3>
              <div class="fee-status-grid">
                <div class="status-card paid">
                  <div class="status-label">Total Salary Paid</div>
                  <div class="status-value">₹{{ totalSalaryPaid.toLocaleString() }}</div>
                </div>
                <div class="status-card">
                  <div class="status-label">Total Payments</div>
                  <div class="status-value">{{ teacherSalaries.length }}</div>
                </div>
              </div>
            </section>

            <!-- Salary Payment History -->
            <section class="profile-section">
              <div class="section-header">
                <h3>📜 Salary Payment History</h3>
                <button class="btn-primary btn-sm" @click="openAddSalaryModal">
                  + Add Salary Payment
                </button>
              </div>
              
              <div v-if="loadingSalaries" class="state-msg">Loading salary history...</div>
              <div v-else-if="teacherSalaries.length === 0" class="empty-state">
                <p>No salary payments recorded yet.</p>
                <button class="btn-primary" @click="openAddSalaryModal">
                  Record First Payment
                </button>
              </div>
              <div v-else class="payments-table">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th style="width: 30px;"></th>
                      <th>#</th>
                      <th>Amount</th>
                      <th>Payment Date</th>
                      <th>Method</th>
                      <th>Paid By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="salary in teacherSalaries" :key="salary.id">
                      <tr>
                        <td>
                          <button class="btn-expand" @click="toggleSalaryDetails(salary.id)" :title="expandedSalaryId === salary.id ? 'Hide Details' : 'Show Details'">
                            {{ expandedSalaryId === salary.id ? '▼' : '▶' }}
                          </button>
                        </td>
                        <td>{{ salary.id }}</td>
                        <td class="bold">₹{{ salary.amount?.toLocaleString() }}</td>
                        <td>{{ salary.payment_date }}</td>
                        <td><span class="badge badge-blue">{{ salary.payment_method }}</span></td>
                        <td>{{ salary.payer_name || '—' }}</td>
                        <td class="actions-cell">
                          <button class="btn-icon edit" @click="openEditSalaryModal(salary)" title="Edit">✏️</button>
                          <button class="btn-icon delete" @click="confirmDeleteSalary(salary)" title="Delete">🗑️</button>
                        </td>
                      </tr>
                      <!-- Expandable Details Row -->
                      <tr v-if="expandedSalaryId === salary.id" class="details-row">
                        <td colspan="7">
                          <div class="details-content">
                            <div class="details-grid">
                              <div class="detail-item">
                                <label>Reference No:</label>
                                <span>{{ salary.reference_no || '—' }}</span>
                              </div>
                              <div class="detail-item">
                                <label>Remarks:</label>
                                <span>{{ salary.remarks || '—' }}</span>
                              </div>
                              <div class="detail-item">
                                <label>Created At:</label>
                                <span>{{ formatDateTime(salary.created_at) }}</span>
                              </div>
                              <div class="detail-item">
                                <label>Last Updated:</label>
                                <span>{{ formatDateTime(salary.updated_at) }}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ ADD/EDIT SALARY MODAL ══ -->
    <div v-if="showSalaryModal" class="modal-overlay" @click.self="closeSalaryModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ isEditingSalary ? 'Edit Salary Payment' : 'Add Salary Payment' }}</h2>
          <button class="modal-close" @click="closeSalaryModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="salaryModalError" class="form-error">⚠️ {{ salaryModalError }}</div>
          
          <div class="form-grid">
            <div class="form-field">
              <label>Amount <span class="req">*</span></label>
              <input v-model.number="salaryForm.amount" type="number" step="0.01" min="0" placeholder="Enter amount" />
            </div>
            <div class="form-field">
              <label>Payment Date <span class="req">*</span></label>
              <input v-model="salaryForm.payment_date" type="date" />
            </div>
            <div class="form-field">
              <label>Payment Method <span class="req">*</span></label>
              <select v-model="salaryForm.payment_method" class="form-select">
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div class="form-field">
              <label>Reference No</label>
              <input v-model="salaryForm.reference_no" type="text" placeholder="Transaction/Receipt number" />
            </div>
          </div>
          
          <div class="form-field">
            <label>Remarks</label>
            <textarea v-model="salaryForm.remarks" placeholder="Additional notes..." rows="2" class="form-textarea"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeSalaryModal" :disabled="saving">Cancel</button>
          <button class="btn-save" @click="saveSalary" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Saving…' : (isEditingSalary ? 'Update Payment' : 'Add Payment') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ DELETE SALARY CONFIRM MODAL ══ -->
    <div v-if="showDeleteSalaryModal" class="modal-overlay" @click.self="showDeleteSalaryModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Delete Salary Payment</h2>
          <button class="modal-close" @click="showDeleteSalaryModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this salary payment of <strong>₹{{ deletingSalary?.amount?.toLocaleString() }}</strong>?</p>
          <p class="delete-warn">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showDeleteSalaryModal = false">Cancel</button>
          <button class="btn-delete" @click="deleteSalary" :disabled="saving">
            <span v-if="saving" class="mini-spinner"></span>
            {{ saving ? 'Deleting…' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ BATCH PROFILE MODAL ══ -->
    <div v-if="showBatchProfile" class="modal-overlay" @click.self="closeBatchProfile">
      <div class="modal modal-lg profile-modal">
        <div class="modal-header">
          <h2>📚 Batch Profile</h2>
          <button class="modal-close" @click="closeBatchProfile">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="batchProfileLoading" class="state-msg">Loading profile...</div>
          <div v-else-if="batchProfileError" class="state-msg error">{{ batchProfileError }}</div>
          <div v-else-if="selectedBatchProfile" class="profile-content">
            
            <!-- Batch Info Section -->
            <section class="profile-section">
              <h3>📋 Batch Information</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>Batch ID:</label>
                  <span class="bold">{{ selectedBatchProfile.batch.id }}</span>
                </div>
                <div class="info-item">
                  <label>Batch Name:</label>
                  <span class="bold">{{ selectedBatchProfile.batch.batch_name }}</span>
                </div>
                <div class="info-item">
                  <label>Year:</label>
                  <span>{{ selectedBatchProfile.batch.year }}</span>
                </div>
                <div class="info-item">
                  <label>Batch Cost:</label>
                  <span class="bold">₹{{ selectedBatchProfile.batch.batch_cost?.toLocaleString() }}</span>
                </div>
                <div class="info-item">
                  <label>Start Date:</label>
                  <span>{{ selectedBatchProfile.batch.start_date || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>End Date:</label>
                  <span>{{ selectedBatchProfile.batch.end_date || '—' }}</span>
                </div>
                <div class="info-item">
                  <label>Status:</label>
                  <span :class="['badge', selectedBatchProfile.batch.is_active ? 'badge-green' : 'badge-grey']">
                    {{ selectedBatchProfile.batch.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
            </section>

            <!-- Financial Summary -->
            <section class="profile-section">
              <h3>💰 Financial Summary</h3>
              <div class="financial-grid">
                <div class="finance-card">
                  <div class="finance-label">Total Students</div>
                  <div class="finance-value">{{ selectedBatchProfile.financial_summary.total_students }}</div>
                </div>
                <div class="finance-card">
                  <div class="finance-label">Total Revenue (Gross)</div>
                  <div class="finance-value">₹{{ selectedBatchProfile.financial_summary.total_revenue?.toLocaleString() }}</div>
                  <div class="finance-sub">{{ selectedBatchProfile.financial_summary.total_students }} × ₹{{ selectedBatchProfile.batch.batch_cost?.toLocaleString() }}</div>
                </div>
                <div class="finance-card discount">
                  <div class="finance-label">Total Discounts</div>
                  <div class="finance-value">- ₹{{ selectedBatchProfile.financial_summary.total_discount_amount?.toLocaleString() }}</div>
                </div>
                <div class="finance-card expected">
                  <div class="finance-label">Expected Revenue (After Discounts)</div>
                  <div class="finance-value">₹{{ selectedBatchProfile.financial_summary.expected_revenue?.toLocaleString() }}</div>
                </div>
                <div class="finance-card received">
                  <div class="finance-label">Total Received</div>
                  <div class="finance-value">₹{{ selectedBatchProfile.financial_summary.total_received?.toLocaleString() }}</div>
                </div>
                <div class="finance-card outstanding">
                  <div class="finance-label">Outstanding Amount</div>
                  <div class="finance-value">₹{{ selectedBatchProfile.financial_summary.outstanding?.toLocaleString() }}</div>
                </div>
              </div>
            </section>

            <!-- Teachers Section -->
            <section class="profile-section">
              <div class="section-header">
                <h3>👨‍🏫 Assigned Teachers ({{ selectedBatchProfile.teachers.length }})</h3>
                <button class="btn-primary btn-sm" @click="openAssignTeacherModal">
                  + Assign Teacher
                </button>
              </div>
              <div v-if="selectedBatchProfile.teachers.length === 0" class="empty-state">
                <p>No teachers assigned to this batch.</p>
                <button class="btn-primary" @click="openAssignTeacherModal">
                  Assign First Teacher
                </button>
              </div>
              <div v-else class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Specialization</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="teacher in selectedBatchProfile.teachers" :key="teacher.id">
                      <td>{{ teacher.id }}</td>
                      <td class="bold">{{ teacher.full_name || '—' }}</td>
                      <td>{{ teacher.email || '—' }}</td>
                      <td>{{ teacher.phone_number || '—' }}</td>
                      <td>{{ teacher.specialization || '—' }}</td>
                      <td class="actions-cell">
                        <button class="btn-icon delete" @click="confirmRemoveTeacher(teacher)" title="Remove from Batch">🗑️</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Students Section -->
            <section class="profile-section">
              <h3>🎓 Enrolled Students ({{ selectedBatchProfile.students.length }})</h3>
              <div v-if="selectedBatchProfile.students.length === 0" class="empty-state">
                <p>No students enrolled in this batch.</p>
              </div>
              <div v-else class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Discount %</th>
                      <th>Discount Amount</th>
                      <th>Fee After Discount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="student in selectedBatchProfile.students" :key="student.id">
                      <td>{{ student.id }}</td>
                      <td class="bold">{{ student.full_name || '—' }}</td>
                      <td>{{ student.email || '—' }}</td>
                      <td>{{ student.phone_number || '—' }}</td>
                      <td>{{ student.discount_percent }}%</td>
                      <td class="discount-text">- ₹{{ student.discount_amount?.toLocaleString() }}</td>
                      <td class="bold">₹{{ student.fee_after_discount?.toLocaleString() }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>

    <!-- ══ ASSIGN TEACHER TO BATCH MODAL ══ -->
    <div v-if="showAssignTeacherModal" class="modal-overlay" @click.self="closeAssignTeacherModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Assign Teacher to Batch</h2>
          <button class="modal-close" @click="closeAssignTeacherModal">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="assignTeacherError" class="form-error">⚠️ {{ assignTeacherError }}</div>
          
          <p class="modal-info">
            Select a teacher to assign to <strong>{{ selectedBatchProfile?.batch.batch_name }}</strong>
          </p>
          
          <div class="form-field">
            <label>Search Teacher</label>
            <input 
              v-model="assignTeacherSearch" 
              type="text" 
              placeholder="Search by name, email, or specialization..."
              class="search-input"
            />
          </div>
          
          <div class="teacher-select-list">
            <div v-if="availableTeachersForAssignment.length === 0" class="empty-state">
              <p>{{ assignTeacherSearch ? 'No teachers match your search' : 'All teachers are already assigned to this batch' }}</p>
            </div>
            <div 
              v-for="teacher in availableTeachersForAssignment" 
              :key="teacher.id" 
              class="teacher-select-item"
              :class="{ selected: selectedTeacherToAssign?.id === teacher.id }"
              @click="selectedTeacherToAssign = teacher"
            >
              <div class="teacher-info">
                <span class="teacher-name">{{ teacher.user?.full_name || '—' }}</span>
                <span class="teacher-details">{{ teacher.user?.email }} • {{ teacher.specialization || 'No specialization' }}</span>
              </div>
              <span v-if="selectedTeacherToAssign?.id === teacher.id" class="check-mark">✓</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeAssignTeacherModal">Cancel</button>
          <button 
            class="btn-primary" 
            @click="assignTeacherToBatch" 
            :disabled="!selectedTeacherToAssign || assigningTeacher"
          >
            <span v-if="assigningTeacher" class="mini-spinner"></span>
            {{ assigningTeacher ? 'Assigning…' : 'Assign Teacher' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══ REMOVE TEACHER FROM BATCH CONFIRM MODAL ══ -->
    <div v-if="showRemoveTeacherModal" class="modal-overlay" @click.self="showRemoveTeacherModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Remove Teacher</h2>
          <button class="modal-close" @click="showRemoveTeacherModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to remove <strong>{{ teacherToRemove?.full_name }}</strong> from batch <strong>{{ selectedBatchProfile?.batch.batch_name }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showRemoveTeacherModal = false">Cancel</button>
          <button class="btn-delete" @click="removeTeacherFromBatch" :disabled="removingTeacher">
            <span v-if="removingTeacher" class="mini-spinner"></span>
            {{ removingTeacher ? 'Removing…' : 'Yes, Remove' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'
import { teacherService, type Teacher } from '@/services/teacher'
import { studentService, type Student } from '@/services/student'
import { authService } from '@/services/auth'
import { userService, type User as UserType } from '@/services/user'
import { feeService, type FeePayment } from '@/services/fee'
import { salaryService, type Salary } from '@/services/salary'
import { aiService } from '@/services/ai'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

// ── Section nav ──────────────────────────────────────────────────────────────
const activeSection = ref('dashboard')

// ── Stats ────────────────────────────────────────────────────────────────────
const stats = ref({ totalStudents: 0, activeBatches: 0, pendingFees: 0, collections: 0 })

// ── Batch list ───────────────────────────────────────────────────────────────
interface Batch {
  id: number
  batch_name: string
  year: number
  batch_cost: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  teachers: { id: number; user_id: number; full_name: string }[]
}

const batches = ref<Batch[]>([])
const batchLoading = ref(false)
const batchError = ref<string | null>(null)
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = 20

// Batch search
const batchSearchQuery = ref('')
const filteredBatches = computed(() => {
  if (!batchSearchQuery.value.trim()) return batches.value
  const q = batchSearchQuery.value.toLowerCase().trim()
  return batches.value.filter(batch => {
    const idMatch = batch.id.toString().includes(q)
    const nameMatch = batch.batch_name?.toLowerCase().includes(q)
    return idMatch || nameMatch
  })
})

// Batch Profile
interface BatchProfileStudent {
  id: number
  user_id: number
  full_name: string | null
  email: string | null
  phone_number: string | null
  enrollment_date: string | null
  discount_percent: number
  discount_amount: number
  fee_after_discount: number
}

interface BatchProfileTeacher {
  id: number
  user_id: number
  full_name: string | null
  email: string | null
  phone_number: string | null
  specialization: string | null
}

interface BatchProfileData {
  batch: {
    id: number
    batch_name: string
    year: number
    batch_cost: number
    start_date: string | null
    end_date: string | null
    is_active: boolean
    created_at: string | null
    updated_at: string | null
  }
  financial_summary: {
    batch_cost: number
    total_students: number
    total_revenue: number
    total_discount_amount: number
    expected_revenue: number
    total_received: number
    outstanding: number
  }
  students: BatchProfileStudent[]
  teachers: BatchProfileTeacher[]
}

const showBatchProfile = ref(false)
const selectedBatchProfile = ref<BatchProfileData | null>(null)
const batchProfileLoading = ref(false)
const batchProfileError = ref<string | null>(null)

async function openBatchProfile(batch: Batch) {
  showBatchProfile.value = true
  batchProfileLoading.value = true
  batchProfileError.value = null
  selectedBatchProfile.value = null
  
  try {
    const res = await apiClient.get(`/batches/${batch.id}/profile`)
    selectedBatchProfile.value = res.data.data
    
    // Also load teachers list if not already loaded (for assignment modal)
    if (teachers.value.length === 0) {
      await loadTeachers()
    }
  } catch (err: any) {
    batchProfileError.value = err?.response?.data?.message ?? 'Failed to load batch profile'
  } finally {
    batchProfileLoading.value = false
  }
}

function closeBatchProfile() {
  showBatchProfile.value = false
  selectedBatchProfile.value = null
}

// ── Assign/Remove Teacher from Batch ──────────────────────────────────────────
const showAssignTeacherModal = ref(false)
const assignTeacherSearch = ref('')
const selectedTeacherToAssign = ref<Teacher | null>(null)
const assigningTeacher = ref(false)
const assignTeacherError = ref<string | null>(null)

const showRemoveTeacherModal = ref(false)
const teacherToRemove = ref<BatchProfileTeacher | null>(null)
const removingTeacher = ref(false)

// Get teachers not already assigned to this batch
const availableTeachersForAssignment = computed(() => {
  if (!selectedBatchProfile.value) return []
  
  const assignedIds = new Set(selectedBatchProfile.value.teachers.map(t => t.id))
  let available = teachers.value.filter(t => !assignedIds.has(t.id) && t.is_active)
  
  if (assignTeacherSearch.value.trim()) {
    const q = assignTeacherSearch.value.toLowerCase().trim()
    available = available.filter(t => {
      const nameMatch = t.user?.full_name?.toLowerCase().includes(q)
      const emailMatch = t.user?.email?.toLowerCase().includes(q)
      const specMatch = t.specialization?.toLowerCase().includes(q)
      return nameMatch || emailMatch || specMatch
    })
  }
  
  return available
})

function openAssignTeacherModal() {
  assignTeacherSearch.value = ''
  selectedTeacherToAssign.value = null
  assignTeacherError.value = null
  showAssignTeacherModal.value = true
}

function closeAssignTeacherModal() {
  showAssignTeacherModal.value = false
  selectedTeacherToAssign.value = null
  assignTeacherSearch.value = ''
}

async function assignTeacherToBatch() {
  if (!selectedTeacherToAssign.value || !selectedBatchProfile.value) return
  
  assigningTeacher.value = true
  assignTeacherError.value = null
  
  try {
    await apiClient.post(`/batches/${selectedBatchProfile.value.batch.id}/teachers`, {
      teacher_id: selectedTeacherToAssign.value.id
    })
    
    // Refresh the batch profile
    const res = await apiClient.get(`/batches/${selectedBatchProfile.value.batch.id}/profile`)
    selectedBatchProfile.value = res.data.data
    
    // Also refresh the batches list to update teacher count
    await loadBatches(currentPage.value)
    
    closeAssignTeacherModal()
  } catch (err: any) {
    assignTeacherError.value = err?.response?.data?.message ?? 'Failed to assign teacher'
  } finally {
    assigningTeacher.value = false
  }
}

function confirmRemoveTeacher(teacher: BatchProfileTeacher) {
  teacherToRemove.value = teacher
  showRemoveTeacherModal.value = true
}

async function removeTeacherFromBatch() {
  if (!teacherToRemove.value || !selectedBatchProfile.value) return
  
  removingTeacher.value = true
  
  try {
    await apiClient.delete(`/batches/${selectedBatchProfile.value.batch.id}/teachers/${teacherToRemove.value.id}`)
    
    // Refresh the batch profile
    const res = await apiClient.get(`/batches/${selectedBatchProfile.value.batch.id}/profile`)
    selectedBatchProfile.value = res.data.data
    
    // Also refresh the batches list to update teacher count
    await loadBatches(currentPage.value)
    
    showRemoveTeacherModal.value = false
    teacherToRemove.value = null
  } catch (err: any) {
    console.error('Failed to remove teacher:', err)
  } finally {
    removingTeacher.value = false
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ── FEE MANAGEMENT SECTION ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

interface FeePaymentItem {
  id: number
  student_id: number
  amount: number
  payment_date: string
  payment_method: string
  reference_no: string | null
  remarks: string | null
  received_by: number
  receiver_name: string | null
  created_at: string
  updated_at: string
  student: {
    id: number
    user: {
      full_name: string
      email: string
    }
  } | null
}

const feePaymentsList = ref<FeePaymentItem[]>([])
const feeListLoading = ref(false)
const feeListError = ref<string | null>(null)
const feePagination = ref({ page: 1, per_page: 20, total: 0, pages: 1, has_next: false, has_prev: false })
const expandedFeeListId = ref<number | null>(null)

// Filters
const feeQuickFilter = ref('')
const feeMonthFilter = ref('')
const feeStartDate = ref('')
const feeEndDate = ref('')

const feeTotalAmount = computed(() => {
  return feePaymentsList.value.reduce((sum, p) => sum + (p.amount || 0), 0)
})

async function loadFeePaymentsList(page = 1) {
  feeListLoading.value = true
  feeListError.value = null
  
  try {
    let url = `/fee-payments?page=${page}&per_page=20`
    
    if (feeQuickFilter.value) {
      url = `/fee-payments?last_n=${feeQuickFilter.value}`
    } else {
      if (feeMonthFilter.value) {
        url += `&last_months=${feeMonthFilter.value}`
      }
      if (feeStartDate.value) {
        url += `&start_date=${feeStartDate.value}`
      }
      if (feeEndDate.value) {
        url += `&end_date=${feeEndDate.value}`
      }
    }
    
    const res = await apiClient.get(url)
    const data = res.data.data
    feePaymentsList.value = data.fee_payments || []
    feePagination.value = data.pagination || { page: 1, per_page: 20, total: 0, pages: 1, has_next: false, has_prev: false }
  } catch (err: any) {
    feeListError.value = err?.response?.data?.message ?? 'Failed to load fee payments'
  } finally {
    feeListLoading.value = false
  }
}

function applyFeeQuickFilter() {
  feeMonthFilter.value = ''
  feeStartDate.value = ''
  feeEndDate.value = ''
  loadFeePaymentsList()
}

function applyFeeFilters() {
  feeQuickFilter.value = ''
  loadFeePaymentsList()
}

function clearFeeFilters() {
  feeQuickFilter.value = ''
  feeMonthFilter.value = ''
  feeStartDate.value = ''
  feeEndDate.value = ''
  loadFeePaymentsList()
}

function changeFeeListPage(page: number) {
  loadFeePaymentsList(page)
}

function toggleFeeListDetails(id: number) {
  expandedFeeListId.value = expandedFeeListId.value === id ? null : id
}

// ══════════════════════════════════════════════════════════════════════════════
// ── SALARY MANAGEMENT SECTION ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

interface SalaryPaymentItem {
  id: number
  teacher_id: number
  amount: number
  payment_date: string
  payment_method: string
  reference_no: string | null
  remarks: string | null
  paid_by: number | null
  payer_name: string | null
  created_at: string
  updated_at: string
  teacher: {
    id: number
    specialization: string | null
    user: {
      full_name: string
      email: string
    }
  } | null
}

const salaryPaymentsList = ref<SalaryPaymentItem[]>([])
const salaryListLoading = ref(false)
const salaryListError = ref<string | null>(null)
const salaryPagination = ref({ page: 1, per_page: 20, total: 0, pages: 1, has_next: false, has_prev: false })
const expandedSalaryListId = ref<number | null>(null)

// Filters
const salaryQuickFilter = ref('')
const salaryMonthFilter = ref('')
const salaryStartDate = ref('')
const salaryEndDate = ref('')

const salaryTotalAmount = computed(() => {
  return salaryPaymentsList.value.reduce((sum, s) => sum + (s.amount || 0), 0)
})

async function loadSalaryPaymentsList(page = 1) {
  salaryListLoading.value = true
  salaryListError.value = null
  
  try {
    let url = `/salaries?page=${page}&per_page=20`
    
    if (salaryQuickFilter.value) {
      url = `/salaries?last_n=${salaryQuickFilter.value}`
    } else {
      if (salaryMonthFilter.value) {
        url += `&last_months=${salaryMonthFilter.value}`
      }
      if (salaryStartDate.value) {
        url += `&start_date=${salaryStartDate.value}`
      }
      if (salaryEndDate.value) {
        url += `&end_date=${salaryEndDate.value}`
      }
    }
    
    const res = await apiClient.get(url)
    const data = res.data.data
    salaryPaymentsList.value = data.salaries || []
    salaryPagination.value = data.pagination || { page: 1, per_page: 20, total: 0, pages: 1, has_next: false, has_prev: false }
  } catch (err: any) {
    salaryListError.value = err?.response?.data?.message ?? 'Failed to load salary payments'
  } finally {
    salaryListLoading.value = false
  }
}

function applySalaryQuickFilter() {
  salaryMonthFilter.value = ''
  salaryStartDate.value = ''
  salaryEndDate.value = ''
  loadSalaryPaymentsList()
}

function applySalaryFilters() {
  salaryQuickFilter.value = ''
  loadSalaryPaymentsList()
}

function clearSalaryFilters() {
  salaryQuickFilter.value = ''
  salaryMonthFilter.value = ''
  salaryStartDate.value = ''
  salaryEndDate.value = ''
  loadSalaryPaymentsList()
}

function changeSalaryListPage(page: number) {
  loadSalaryPaymentsList(page)
}

function toggleSalaryListDetails(id: number) {
  expandedSalaryListId.value = expandedSalaryListId.value === id ? null : id
}

// ══════════════════════════════════════════════════════════════════════════════
// ░░ DASHBOARD DATA ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ══════════════════════════════════════════════════════════════════════════════

const dashboardStats = ref({
  totalStudents: 0,
  activeStudents: 0,
  activeBatches: 0,
  totalTeachers: 0,
  totalRevenue: 0,
  thisMonthRevenue: 0,
  totalOutstanding: 0,
  studentsWithOutstanding: 0,
  expectedRevenue: 0,
  totalReceived: 0,
  thisMonthSalaries: 0
})

const recentFeePayments = ref<any[]>([])
const recentSalaryPayments = ref<any[]>([])
const recentStudents = ref<any[]>([])
const batchesOverview = ref<any[]>([])
const dashboardLoading = ref(false)
const opsAiInsights = ref<any | null>(null)
const opsAiLoading = ref(false)
const opsAiError = ref<string | null>(null)
const feeRiskInsights = ref<any | null>(null)
const feeRiskLoading = ref(false)
const feeRiskError = ref<string | null>(null)

function formatRiskItem(risk: any): string {
  if (typeof risk === 'string') return risk
  if (!risk || typeof risk !== 'object') return 'Operational risk detected'
  const label = risk.label || risk.risk || 'Risk'
  const reason = risk.reason || risk.impact || ''
  return reason ? `${label}: ${reason}` : String(label)
}

function formatActionItem(action: any): string {
  if (typeof action === 'string') return action
  if (!action || typeof action !== 'object') return 'Follow up with operations team'
  const title = action.action || action.title || 'Action item'
  const owner = action.owner ? `Owner: ${action.owner}` : ''
  const timeframe = action.timeframe ? `Timeline: ${action.timeframe}` : ''
  return [title, owner, timeframe].filter(Boolean).join(' | ')
}

async function loadOpsAiInsights(year: number) {
  opsAiLoading.value = true
  opsAiError.value = null
  try {
    const response = await aiService.getOperationsSummary({
      year,
      focus: 'operations dashboard health and cashflow'
    })
    opsAiInsights.value = response?.data?.insights || null
  } catch (error: any) {
    const detail = error?.response?.data?.message || error?.message || 'Failed to fetch AI insights'
    opsAiError.value = detail
    opsAiInsights.value = null
  } finally {
    opsAiLoading.value = false
  }
}

async function loadFeeRiskPrediction(year: number) {
  feeRiskLoading.value = true
  feeRiskError.value = null
  try {
    const response = await aiService.getFeeRiskPrediction({
      year,
      focus: 'high-risk dues and prioritized collection follow-up'
    })
    feeRiskInsights.value = response?.data?.insights || null
  } catch (error: any) {
    feeRiskError.value = error?.response?.data?.message || error?.message || 'Failed to generate fee risk prediction'
    feeRiskInsights.value = null
  } finally {
    feeRiskLoading.value = false
  }
}

async function loadDashboardData() {
  dashboardLoading.value = true
  try {
    // Load all dashboard data in parallel
    const [
      studentsRes,
      batchesRes,
      feesRes,
      salariesRes,
      recentFeesRes,
      recentSalariesRes,
      teachersRes
    ] = await Promise.all([
      apiClient.get('/students?page=1&per_page=100'),
      apiClient.get('/batches?page=1&per_page=100'),
      apiClient.get('/fee-payments?page=1&per_page=100'),
      apiClient.get('/salaries?page=1&per_page=100'),
      apiClient.get('/fee-payments?last_n=5'),
      apiClient.get('/salaries?last_n=5'),
      apiClient.get('/teachers?page=1&per_page=100')
    ])

    const unwrap = (res: any) => res?.data?.data ?? res?.data ?? {}

    const studentsData = unwrap(studentsRes)
    const batchesData = unwrap(batchesRes)
    const feesData = unwrap(feesRes)
    const salariesData = unwrap(salariesRes)
    const recentFeesData = unwrap(recentFeesRes)
    const recentSalariesData = unwrap(recentSalariesRes)
    const teachersData = unwrap(teachersRes)

    const students = studentsData.students || []
    const batches = batchesData.batches || []
    const allFees = feesData.fee_payments || []
    const allSalaries = salariesData.salaries || []
    const teachers = teachersData.teachers || []

    // Calculate statistics
    dashboardStats.value.totalStudents = students.length
    dashboardStats.value.activeStudents = students.filter((s: any) => s.is_active).length
    dashboardStats.value.activeBatches = batches.filter((b: any) => b.is_active).length
    dashboardStats.value.totalTeachers = teachers.length

    // Calculate financial metrics
    dashboardStats.value.totalRevenue = allFees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0)
    dashboardStats.value.expectedRevenue = students.reduce((sum: number, s: any) => {
      const batchCost = Number(s.batch?.batch_cost ?? 0)
      const discountPercent = Number(s.discount_percent ?? 0)
      const discountAmount = batchCost * discountPercent / 100
      return sum + (batchCost - discountAmount)
    }, 0)
    dashboardStats.value.totalReceived = dashboardStats.value.totalRevenue
    dashboardStats.value.totalOutstanding = dashboardStats.value.expectedRevenue - dashboardStats.value.totalReceived
    const paidByStudent = new Map<number, number>()
    allFees.forEach((fee: any) => {
      if (!fee.student_id) return
      paidByStudent.set(fee.student_id, (paidByStudent.get(fee.student_id) || 0) + (fee.amount || 0))
    })
    dashboardStats.value.studentsWithOutstanding = students.filter((s: any) => {
      const batchCost = Number(s.batch?.batch_cost ?? 0)
      const discountPercent = Number(s.discount_percent ?? 0)
      const expected = batchCost - (batchCost * discountPercent / 100)
      const paid = paidByStudent.get(s.id) || 0
      return expected - paid > 0
    }).length

    // This month's revenue (current month payments)
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    dashboardStats.value.thisMonthRevenue = allFees.filter((f: any) => {
      const paymentDate = new Date(f.payment_date)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    }).reduce((sum: number, f: any) => sum + (f.amount || 0), 0)

    // This month's salaries
    dashboardStats.value.thisMonthSalaries = allSalaries.filter((s: any) => {
      const paymentDate = new Date(s.payment_date)
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
    }).reduce((sum: number, s: any) => sum + (s.amount || 0), 0)

    // Recent data
    recentFeePayments.value = (recentFeesData.fee_payments || []).map((payment: any) => ({
      ...payment,
      student_name: payment.student?.user?.full_name || `Student #${payment.student_id}`,
      student_enrollment_no: `ID ${payment.student_id}`
    }))
    recentSalaryPayments.value = (recentSalariesData.salaries || []).map((payment: any) => ({
      ...payment,
      teacher_name: payment.teacher?.user?.full_name || `Teacher #${payment.teacher_id}`,
      month: payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
      }) : '—'
    }))
    
    // Recent students (sorted by enrollment date)
    recentStudents.value = students
      .map((student: any) => ({
        ...student,
        name: student.user?.full_name || '—',
        enrollment_no: `ID ${student.id}`
      }))
      .sort((a: any, b: any) => new Date(b.enrollment_date).getTime() - new Date(a.enrollment_date).getTime())
      .slice(0, 5)

    // Batches overview (top 5 by student count)
    batchesOverview.value = batches
      .map((b: any) => ({
        ...b,
        name: b.batch_name,
        student_count: b.students?.length || 0,
        teacher_count: b.teachers?.length || 0
      }))
      .sort((a: any, b: any) => b.student_count - a.student_count)
      .slice(0, 5)

  } catch (error: any) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    dashboardLoading.value = false
  }
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

// ══════════════════════════════════════════════════════════════════════════════

async function loadBatches(page = 1) {
  batchLoading.value = true
  batchError.value = null
  try {
    const res = await apiClient.get(`/batches?page=${page}&per_page=${perPage}`)
    const data = res.data.data
    batches.value = data.batches ?? data.items ?? []
    totalPages.value = data.pages ?? data.total_pages ?? 1
    currentPage.value = page
    stats.value.activeBatches = batches.value.filter(b => b.is_active).length
  } catch (err: any) {
    batchError.value = err?.response?.data?.message ?? 'Failed to load batches'
  } finally {
    batchLoading.value = false
  }
}

function changePage(p: number) {
  loadBatches(p)
}

// ── Create/Edit modal ─────────────────────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)
const modalError = ref<string | null>(null)

const emptyForm = () => ({
  batch_name: '',
  year: new Date().getFullYear(),
  batch_cost: 10000,
  start_date: '',
  end_date: '',
  is_active: true,
})

const form = ref(emptyForm())

function openCreateModal() {
  form.value = emptyForm()
  isEditing.value = false
  editingId.value = null
  modalError.value = null
  showModal.value = true
}

function openEditModal(batch: Batch) {
  form.value = {
    batch_name: batch.batch_name,
    year: batch.year,
    batch_cost: batch.batch_cost ?? 10000,
    start_date: batch.start_date ?? '',
    end_date: batch.end_date ?? '',
    is_active: batch.is_active,
  }
  isEditing.value = true
  editingId.value = batch.id
  modalError.value = null
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  modalError.value = null
}

async function saveBatch() {
  modalError.value = null
  if (!form.value.batch_name.trim()) { modalError.value = 'Batch name is required'; return }
  if (!form.value.year) { modalError.value = 'Year is required'; return }
  if (!form.value.batch_cost || form.value.batch_cost < 0) { modalError.value = 'Valid batch cost is required'; return }

  const payload: Record<string, any> = {
    batch_name: form.value.batch_name.trim(),
    year: form.value.year,
    batch_cost: form.value.batch_cost,
    is_active: form.value.is_active,
    start_date: form.value.start_date || null,
    end_date: form.value.end_date || null,
  }

  saving.value = true
  try {
    if (isEditing.value) {
      await apiClient.put(`/batches/${editingId.value}`, payload)
    } else {
      await apiClient.post('/batches', payload)
    }
    closeModal()
    await loadBatches(currentPage.value)
  } catch (err: any) {
    modalError.value = err?.response?.data?.message ?? 'Failed to save batch'
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const showDeleteModal = ref(false)
const deletingBatch = ref<Batch | null>(null)

function confirmDelete(batch: Batch) {
  deletingBatch.value = batch
  showDeleteModal.value = true
}

async function deleteBatch() {
  if (!deletingBatch.value) return
  saving.value = true
  try {
    await apiClient.delete(`/batches/${deletingBatch.value.id}`)
    showDeleteModal.value = false
    deletingBatch.value = null
    await loadBatches(currentPage.value)
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to delete batch')
  } finally {
    saving.value = false
  }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
function handleLogout() {
  authStore.logout()
  router.push('/login')
}

// ── Teacher Management ────────────────────────────────────────────────────────
const teachers = ref<Teacher[]>([])
const teacherLoading = ref(false)
const teacherError = ref<string | null>(null)
const teacherCurrentPage = ref(1)
const teacherTotalPages = ref(1)
const teacherPerPage = 20
const teacherSearchQuery = ref('')

// Computed filtered teachers
const filteredTeachers = computed(() => {
  if (!teacherSearchQuery.value.trim()) {
    return teachers.value
  }
  const query = teacherSearchQuery.value.toLowerCase().trim()
  return teachers.value.filter(t => 
    String(t.id).includes(query) ||
    t.user?.full_name?.toLowerCase().includes(query) ||
    t.user?.email?.toLowerCase().includes(query) ||
    t.phone_number?.toLowerCase().includes(query) ||
    t.specialization?.toLowerCase().includes(query)
  )
})

function searchTeachers() {
  // Filtering is done via computed property
}

function clearTeacherSearch() {
  teacherSearchQuery.value = ''
}

async function loadTeachers(page = 1) {
  teacherLoading.value = true
  teacherError.value = null
  try {
    const res = await teacherService.list(page, teacherPerPage)
    const data = res.data
    teachers.value = data.teachers ?? []
    teacherTotalPages.value = data.pagination?.pages ?? 1
    teacherCurrentPage.value = page
  } catch (err: any) {
    teacherError.value = err?.response?.data?.message ?? 'Failed to load teachers'
  } finally {
    teacherLoading.value = false
  }
}

function changeTeacherPage(p: number) {
  loadTeachers(p)
}

// ── Teacher Create/Edit modal ─────────────────────────────────────────────────
const showTeacherModal = ref(false)
const isEditingTeacher = ref(false)
const editingTeacherId = ref<number | null>(null)
const teacherModalError = ref<string | null>(null)

interface User {
  id: number
  email: string
  full_name: string
  role: string
}

const coachUsers = ref<User[]>([])

const emptyTeacherForm = () => ({
  user_id: null as number | null,
  specialization: '',
  phone_number: '',
  hire_date: '',
  is_active: true,
})

const teacherForm = ref(emptyTeacherForm())

async function loadCoachUsers() {
  try {
    const res = await authService.getRegisteredUsers()
    // Filter only users with 'coach' role (teachers in the system)
    const allUsers = res.data.users || []
    
    // Get list of user_ids that already have teacher profiles
    const existingTeacherUserIds = new Set(teachers.value.map(t => t.user_id))
    
    // Filter to show only coach users who DON'T have a teacher profile yet
    coachUsers.value = allUsers.filter((u: User) => 
      u.role.toLowerCase() === 'coach' && !existingTeacherUserIds.has(u.id)
    )
  } catch (err: any) {
    console.error('Failed to load users with coach role:', err)
  }
}

async function openCreateTeacherModal() {
  teacherForm.value = emptyTeacherForm()
  isEditingTeacher.value = false
  editingTeacherId.value = null
  teacherModalError.value = null
  showTeacherModal.value = true
  // Ensure teachers are loaded before loading coach users so we can filter properly
  if (teachers.value.length === 0) {
    await loadTeachers()
  }
  await loadCoachUsers()
}

function openEditTeacherModal(teacher: Teacher) {
  teacherForm.value = {
    user_id: teacher.user_id,
    specialization: teacher.specialization ?? '',
    phone_number: teacher.phone_number ?? '',
    hire_date: teacher.hire_date ?? '',
    is_active: teacher.is_active,
  }
  isEditingTeacher.value = true
  editingTeacherId.value = teacher.id
  teacherModalError.value = null
  showTeacherModal.value = true
}

function closeTeacherModal() {
  showTeacherModal.value = false
  teacherModalError.value = null
}

async function saveTeacher() {
  teacherModalError.value = null
  
  if (!isEditingTeacher.value && !teacherForm.value.user_id) {
    teacherModalError.value = 'Please select a user account'
    return
  }

  const payload: any = {
    specialization: teacherForm.value.specialization || null,
    phone_number: teacherForm.value.phone_number || null,
    hire_date: teacherForm.value.hire_date || null,
    is_active: teacherForm.value.is_active,
  }

  if (!isEditingTeacher.value) {
    payload.user_id = teacherForm.value.user_id
  }

  saving.value = true
  try {
    if (isEditingTeacher.value && editingTeacherId.value) {
      await teacherService.update(editingTeacherId.value, payload)
    } else {
      await teacherService.create(payload)
    }
    closeTeacherModal()
    await loadTeachers(teacherCurrentPage.value)
  } catch (err: any) {
    teacherModalError.value = err?.response?.data?.message ?? 'Failed to save teacher'
  } finally {
    saving.value = false
  }
}

// ── Teacher Delete ────────────────────────────────────────────────────────────
const showDeleteTeacherModal = ref(false)
const deletingTeacher = ref<Teacher | null>(null)

function confirmDeleteTeacher(teacher: Teacher) {
  deletingTeacher.value = teacher
  showDeleteTeacherModal.value = true
}

async function deleteTeacher() {
  if (!deletingTeacher.value) return
  saving.value = true
  try {
    await teacherService.delete(deletingTeacher.value.id)
    showDeleteTeacherModal.value = false
    deletingTeacher.value = null
    await loadTeachers(teacherCurrentPage.value)
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to delete teacher')
  } finally {
    saving.value = false
  }
}

// ── User Management ──────────────────────────────────────────────────────────
const users = ref<UserType[]>([])
const userLoading = ref(false)
const userError = ref<string | null>(null)

// Filter to show only student, parent, coach roles
const filteredUsers = computed(() => {
  return users.value.filter(u => ['student', 'parent', 'coach'].includes(u.role.toLowerCase()))
})

async function loadUsers() {
  userLoading.value = true
  userError.value = null
  try {
    const res = await userService.list()
    users.value = res.data.users ?? []
  } catch (err: any) {
    userError.value = err?.response?.data?.message ?? 'Failed to load users'
  } finally {
    userLoading.value = false
  }
}

// ── User Create/Edit modal ───────────────────────────────────────────────────
const showUserModal = ref(false)
const isEditingUser = ref(false)
const editingUserId = ref<number | null>(null)
const userModalError = ref<string | null>(null)

const emptyUserForm = () => ({
  email: '',
  full_name: '',
  role: '',
  password: '',
  is_active: true,
})

const userForm = ref(emptyUserForm())

function openCreateUserModal() {
  userForm.value = emptyUserForm()
  isEditingUser.value = false
  editingUserId.value = null
  userModalError.value = null
  showUserModal.value = true
}

function openEditUserModal(user: UserType) {
  userForm.value = {
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    password: '',
    is_active: user.is_active,
  }
  isEditingUser.value = true
  editingUserId.value = user.id
  userModalError.value = null
  showUserModal.value = true
}

function closeUserModal() {
  showUserModal.value = false
  userModalError.value = null
}

async function saveUser() {
  userModalError.value = null

  if (!userForm.value.full_name.trim()) {
    userModalError.value = 'Full name is required'
    return
  }

  if (!isEditingUser.value && !userForm.value.email.trim()) {
    userModalError.value = 'Email is required'
    return
  }

  if (!userForm.value.role) {
    userModalError.value = 'Role is required'
    return
  }

  if (!isEditingUser.value && !userForm.value.password.trim()) {
    userModalError.value = 'Password is required'
    return
  }

  saving.value = true
  try {
    if (isEditingUser.value && editingUserId.value) {
      const payload: any = {
        full_name: userForm.value.full_name,
        role: userForm.value.role,
        is_active: userForm.value.is_active,
      }
      if (userForm.value.password.trim()) {
        payload.password = userForm.value.password
      }
      await userService.update(editingUserId.value, payload)
    } else {
      await userService.create({
        email: userForm.value.email,
        full_name: userForm.value.full_name,
        role: userForm.value.role,
        password: userForm.value.password,
      })
    }
    closeUserModal()
    await loadUsers()
  } catch (err: any) {
    userModalError.value = err?.response?.data?.message ?? 'Failed to save user'
  } finally {
    saving.value = false
  }
}

// ── User Delete ──────────────────────────────────────────────────────────────
const showDeleteUserModal = ref(false)
const deletingUser = ref<UserType | null>(null)

function confirmDeleteUser(user: UserType) {
  deletingUser.value = user
  showDeleteUserModal.value = true
}

async function deleteUser() {
  if (!deletingUser.value) return
  saving.value = true
  try {
    await userService.delete(deletingUser.value.id)
    showDeleteUserModal.value = false
    deletingUser.value = null
    await loadUsers()
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to delete user')
  } finally {
    saving.value = false
  }
}

// ── Helper functions ─────────────────────────────────────────────────────────
function getRoleBadgeClass(role: string): string {
  const roleLower = role.toLowerCase()
  if (roleLower === 'coach') return 'badge-blue'
  if (roleLower === 'student') return 'badge-green'
  if (roleLower === 'parent') return 'badge-purple'
  return 'badge-grey'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

// ── Student Management ───────────────────────────────────────────────────────
const students = ref<Student[]>([])
const studentLoading = ref(false)
const studentError = ref<string | null>(null)
const studentCurrentPage = ref(1)
const studentTotalPages = ref(1)
const studentPerPage = 20
const studentSearchQuery = ref('')

// Filtered students based on search query
const filteredStudents = computed(() => {
  if (!studentSearchQuery.value.trim()) {
    return students.value
  }
  
  const query = studentSearchQuery.value.toLowerCase().trim()
  return students.value.filter(student => {
    const id = student.id.toString()
    const name = student.user?.full_name?.toLowerCase() || ''
    const email = student.user?.email?.toLowerCase() || ''
    const phone = student.phone_number?.toLowerCase() || ''
    
    return id.includes(query) || 
           name.includes(query) || 
           email.includes(query) || 
           phone.includes(query)
  })
})

function handleStudentSearch() {
  // Search is handled by computed property
}

async function loadStudents(page = 1) {
  studentLoading.value = true
  studentError.value = null
  try {
    const res = await studentService.list(page, studentPerPage)
    const data = res.data
    students.value = data.students ?? []
    studentTotalPages.value = data.pagination?.pages ?? 1
    studentCurrentPage.value = page
  } catch (err: any) {
    studentError.value = err?.response?.data?.message ?? 'Failed to load students'
  } finally {
    studentLoading.value = false
  }
}

function changeStudentPage(p: number) {
  loadStudents(p)
}

// ── Student Create/Edit modal ────────────────────────────────────────────────
const showStudentModal = ref(false)
const isEditingStudent = ref(false)
const editingStudentId = ref<number | null>(null)
const studentModalError = ref<string | null>(null)

interface User {
  id: number
  email: string
  full_name: string
  role: string
}

const studentUsers = ref<User[]>([])

const emptyStudentForm = () => ({
  user_id: null as number | null,
  batch_id: null as number | null,
  phone_number: '',
  address: '',
  date_of_birth: '',
  enrollment_date: '',
  discount_percent: 0,
  is_active: true,
})

const studentForm = ref(emptyStudentForm())

async function loadStudentUsers() {
  try {
    const res = await authService.getRegisteredUsers()
    const allUsers = res.data.users || []
    
    // Get list of user_ids that already have student profiles
    const existingStudentUserIds = new Set(students.value.map(s => s.user_id))
    
    // Filter to show only student users who DON'T have a student profile yet
    studentUsers.value = allUsers.filter((u: User) => 
      u.role.toLowerCase() === 'student' && !existingStudentUserIds.has(u.id)
    )
  } catch (err: any) {
    console.error('Failed to load users with student role:', err)
  }
}

async function openCreateStudentModal() {
  studentForm.value = emptyStudentForm()
  isEditingStudent.value = false
  editingStudentId.value = null
  studentModalError.value = null
  showStudentModal.value = true
  // Ensure students are loaded before loading student users so we can filter properly
  if (students.value.length === 0) {
    await loadStudents()
  }
  await loadStudentUsers()
}

function openEditStudentModal(student: Student) {
  studentForm.value = {
    user_id: student.user_id,
    batch_id: student.batch_id,
    phone_number: student.phone_number ?? '',
    address: student.address ?? '',
    date_of_birth: student.date_of_birth ?? '',
    enrollment_date: student.enrollment_date ?? '',
    discount_percent: student.discount_percent ?? 0,
    is_active: student.is_active,
  }
  isEditingStudent.value = true
  editingStudentId.value = student.id
  studentModalError.value = null
  showStudentModal.value = true
}

function closeStudentModal() {
  showStudentModal.value = false
  studentModalError.value = null
}

async function saveStudent() {
  studentModalError.value = null
  
  if (!isEditingStudent.value && !studentForm.value.user_id) {
    studentModalError.value = 'Please select a user account'
    return
  }

  const payload: any = {
    batch_id: studentForm.value.batch_id,
    phone_number: studentForm.value.phone_number || null,
    address: studentForm.value.address || null,
    date_of_birth: studentForm.value.date_of_birth || null,
    enrollment_date: studentForm.value.enrollment_date || null,
    discount_percent: studentForm.value.discount_percent || 0,
    is_active: studentForm.value.is_active,
  }

  if (!isEditingStudent.value) {
    payload.user_id = studentForm.value.user_id
  }

  saving.value = true
  try {
    if (isEditingStudent.value && editingStudentId.value) {
      await studentService.update(editingStudentId.value, payload)
    } else {
      await studentService.create(payload)
    }
    closeStudentModal()
    await loadStudents(studentCurrentPage.value)
  } catch (err: any) {
    studentModalError.value = err?.response?.data?.message ?? 'Failed to save student'
  } finally {
    saving.value = false
  }
}

// ── Student Delete ───────────────────────────────────────────────────────────
const showDeleteStudentModal = ref(false)
const deletingStudent = ref<Student | null>(null)

function confirmDeleteStudent(student: Student) {
  deletingStudent.value = student
  showDeleteStudentModal.value = true
}

async function deleteStudent() {
  if (!deletingStudent.value) return
  saving.value = true
  try {
    await studentService.delete(deletingStudent.value.id)
    showDeleteStudentModal.value = false
    deletingStudent.value = null
    await loadStudents(studentCurrentPage.value)
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to delete student')
  } finally {
    saving.value = false
  }
}

// ── Student Profile & Fee Payments ──────────────────────────────────────────
const showStudentProfile = ref(false)
const selectedStudentProfile = ref<Student | null>(null)
const profileLoading = ref(false)
const profileError = ref<string | null>(null)
const batchDetails = ref<any>(null)
const payments = ref<FeePayment[]>([])
const loadingPayments = ref(false)
const expandedPaymentId = ref<number | null>(null)

function togglePaymentDetails(paymentId: number) {
  if (expandedPaymentId.value === paymentId) {
    expandedPaymentId.value = null
  } else {
    expandedPaymentId.value = paymentId
  }
}

// Computed values for fee calculations
const actualFeeAmount = computed(() => {
  if (!batchDetails.value || !selectedStudentProfile.value) return 0
  const batchCost = parseFloat(String(batchDetails.value.batch_cost)) || 0
  const discount = Number(selectedStudentProfile.value.discount_percent) || 0
  return batchCost - (batchCost * discount / 100)
})

const totalPaid = computed(() => {
  return payments.value.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
})

const remainingAmount = computed(() => {
  return Math.max(0, actualFeeAmount.value - totalPaid.value)
})

const paymentProgress = computed(() => {
  if (actualFeeAmount.value === 0) return 0
  return Math.min(100, Math.round((totalPaid.value / actualFeeAmount.value) * 100))
})

async function openStudentProfile(student: Student) {
  showStudentProfile.value = true
  profileLoading.value = true
  profileError.value = null
  batchDetails.value = null
  payments.value = []
  selectedStudentProfile.value = null
  
  try {
    // Reload student data to get fresh info
    const studentRes = await studentService.getById(student.id)
    selectedStudentProfile.value = studentRes.data.student
    
    console.log('Student profile loaded:', selectedStudentProfile.value)
    console.log('Batch ID:', selectedStudentProfile.value.batch_id)
    console.log('Has batch?', !!selectedStudentProfile.value.batch_id)
    
    // Load batch details if student has a batch
    if (selectedStudentProfile.value.batch_id) {
      console.log('Fetching batch details for batch_id:', selectedStudentProfile.value.batch_id)
      try {
        // First check if batch data is already included in student response
        if (selectedStudentProfile.value.batch && selectedStudentProfile.value.batch.batch_cost !== undefined) {
          console.log('Using batch from student response:', selectedStudentProfile.value.batch)
          batchDetails.value = selectedStudentProfile.value.batch
        } else {
          // Fetch full batch details if not included
          const batchRes = await apiClient.get(`/batches/${selectedStudentProfile.value.batch_id}`)
          console.log('Batch API response:', batchRes.data)
          batchDetails.value = batchRes.data.batch
        }
        console.log('Batch details loaded:', batchDetails.value)
        console.log('batchDetails has batch_cost?', !!batchDetails.value?.batch_cost)
        console.log('Condition check - batch_id:', !!selectedStudentProfile.value.batch_id, 'batchDetails:', !!batchDetails.value)
      } catch (batchErr: any) {
        console.error('Failed to load batch details:', batchErr)
        console.error('Batch error response:', batchErr.response?.data)
      }
    } else {
      console.log('No batch_id found for student')
    }
    
    // Load payment history
    await loadPaymentHistory(student.id)
  } catch (err: any) {
    console.error('Profile loading error:', err)
    profileError.value = err?.response?.data?.message ?? 'Failed to load profile details'
  } finally {
    profileLoading.value = false
  }
}

async function loadPaymentHistory(studentId: number) {
  loadingPayments.value = true
  try {
    const res = await feeService.list(1, 100, studentId)
    console.log('Fee payments API response:', res.data)
    // The API returns { success, message, data: { fee_payments: [...] } }
    const feePayments = (res.data as any).data?.fee_payments || res.data.fee_payments || []
    console.log('Fee payments array:', feePayments)
    payments.value = feePayments
    console.log('payments.value after assignment:', payments.value)
    console.log('payments.value.length:', payments.value.length)
  } catch (err: any) {
    console.error('Failed to load payments:', err)
  } finally {
    loadingPayments.value = false
  }
}

function closeStudentProfile() {
  showStudentProfile.value = false
  selectedStudentProfile.value = null
  batchDetails.value = null
  payments.value = []
  expandedPaymentId.value = null
  showConnectParentDropdown.value = false
  selectedParentUserId.value = null
  connectParentError.value = null
}

// ── Parent Connect / Disconnect ─────────────────────────────────────────────
const showConnectParentDropdown = ref(false)
const selectedParentUserId = ref<number | null>(null)
const connectingParent = ref(false)
const disconnectingParentId = ref<number | null>(null)
const connectParentError = ref<string | null>(null)
const parentUsers = ref<UserType[]>([])

const availableParents = computed(() => {
  if (!selectedStudentProfile.value) return []
  const connectedIds = new Set(selectedStudentProfile.value.parent_user_ids || [])
  return parentUsers.value.filter(u => !connectedIds.has(u.id) && u.is_active)
})

async function loadParentUsers() {
  try {
    const res = await userService.list()
    const allUsers = res.data.users || []
    parentUsers.value = allUsers.filter((u: UserType) => u.role.toLowerCase() === 'parent')
  } catch (err) {
    console.error('Failed to load parent users:', err)
  }
}

function openConnectParentDropdown() {
  showConnectParentDropdown.value = true
  selectedParentUserId.value = null
  connectParentError.value = null
  loadParentUsers()
}

async function handleConnectParent() {
  if (!selectedStudentProfile.value || !selectedParentUserId.value) return
  connectingParent.value = true
  connectParentError.value = null
  try {
    const res = await studentService.connectParent(selectedStudentProfile.value.id, selectedParentUserId.value)
    selectedStudentProfile.value = res.data.student
    showConnectParentDropdown.value = false
    selectedParentUserId.value = null
  } catch (err: any) {
    connectParentError.value = err?.response?.data?.message ?? 'Failed to connect parent'
  } finally {
    connectingParent.value = false
  }
}

async function handleDisconnectParent(parent: { id: number; full_name: string }) {
  if (!selectedStudentProfile.value) return
  if (!confirm(`Disconnect parent "${parent.full_name}" from this student?`)) return
  disconnectingParentId.value = parent.id
  try {
    const res = await studentService.disconnectParent(selectedStudentProfile.value.id, parent.id)
    selectedStudentProfile.value = res.data.student
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to disconnect parent')
  } finally {
    disconnectingParentId.value = null
  }
}

// ── Payment Management ──────────────────────────────────────────────────────
const showPaymentModal = ref(false)
const isEditingPayment = ref(false)
const editingPaymentId = ref<number | null>(null)
const paymentModalError = ref<string | null>(null)

const emptyPaymentForm = () => ({
  amount: 0,
  payment_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  reference_no: '',
  remarks: '',
})

const paymentForm = ref(emptyPaymentForm())

function openAddPaymentModal() {
  paymentForm.value = emptyPaymentForm()
  isEditingPayment.value = false
  editingPaymentId.value = null
  paymentModalError.value = null
  showPaymentModal.value = true
}

function openEditPaymentModal(payment: FeePayment) {
  paymentForm.value = {
    amount: payment.amount,
    payment_date: payment.payment_date,
    payment_method: payment.payment_method,
    reference_no: payment.reference_no || '',
    remarks: payment.remarks || '',
  }
  isEditingPayment.value = true
  editingPaymentId.value = payment.id
  paymentModalError.value = null
  showPaymentModal.value = true
}

function closePaymentModal() {
  showPaymentModal.value = false
  paymentModalError.value = null
}

async function savePayment() {
  paymentModalError.value = null
  
  if (!paymentForm.value.amount || paymentForm.value.amount <= 0) {
    paymentModalError.value = 'Amount must be greater than 0'
    return
  }
  
  if (!selectedStudentProfile.value) return
  
  saving.value = true
  try {
    if (isEditingPayment.value && editingPaymentId.value) {
      // Update existing payment
      const updatePayload = {
        amount: paymentForm.value.amount,
        payment_date: paymentForm.value.payment_date,
        payment_method: paymentForm.value.payment_method,
        reference_no: paymentForm.value.reference_no || undefined,
        remarks: paymentForm.value.remarks || undefined,
      }
      await feeService.update(editingPaymentId.value, updatePayload)
    } else {
      // Create new payment
      const createPayload = {
        student_id: selectedStudentProfile.value.id,
        amount: paymentForm.value.amount,
        payment_date: paymentForm.value.payment_date,
        payment_method: paymentForm.value.payment_method,
        reference_no: paymentForm.value.reference_no || undefined,
        remarks: paymentForm.value.remarks || undefined,
      }
      await feeService.create(createPayload)
    }
    closePaymentModal()
    await loadPaymentHistory(selectedStudentProfile.value.id)
  } catch (err: any) {
    paymentModalError.value = err?.response?.data?.message ?? 'Failed to save payment'
  } finally {
    saving.value = false
  }
}

// ── Delete Payment ──────────────────────────────────────────────────────────
const showDeletePaymentModal = ref(false)
const deletingPayment = ref<FeePayment | null>(null)

function confirmDeletePayment(payment: FeePayment) {
  deletingPayment.value = payment
  showDeletePaymentModal.value = true
}

async function deletePayment() {
  if (!deletingPayment.value || !selectedStudentProfile.value) return
  saving.value = true
  try {
    await feeService.delete(deletingPayment.value.id)
    showDeletePaymentModal.value = false
    deletingPayment.value = null
    await loadPaymentHistory(selectedStudentProfile.value.id)
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to delete payment')
  } finally {
    saving.value = false
  }
}

// ── Teacher Profile & Salary Payments ──────────────────────────────────────────
const showTeacherProfile = ref(false)
const selectedTeacherProfile = ref<Teacher | null>(null)
const teacherProfileLoading = ref(false)
const teacherProfileError = ref<string | null>(null)
const teacherSalaries = ref<Salary[]>([])
const loadingSalaries = ref(false)
const expandedSalaryId = ref<number | null>(null)
const totalSalaryPaid = computed(() => 
  teacherSalaries.value.reduce((sum, s) => sum + (s.amount || 0), 0)
)

function toggleSalaryDetails(salaryId: number) {
  if (expandedSalaryId.value === salaryId) {
    expandedSalaryId.value = null
  } else {
    expandedSalaryId.value = salaryId
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function openTeacherProfile(teacher: Teacher) {
  showTeacherProfile.value = true
  teacherProfileLoading.value = true
  teacherProfileError.value = null
  teacherSalaries.value = []
  selectedTeacherProfile.value = null
  
  try {
    // Reload teacher data to get fresh info
    const teacherRes = await teacherService.getById(teacher.id)
    selectedTeacherProfile.value = teacherRes.data.teacher
    
    // Load salary history
    await loadSalaryHistory(teacher.id)
  } catch (err: any) {
    console.error('Teacher profile loading error:', err)
    teacherProfileError.value = err?.response?.data?.message ?? 'Failed to load profile details'
  } finally {
    teacherProfileLoading.value = false
  }
}

async function loadSalaryHistory(teacherId: number) {
  loadingSalaries.value = true
  try {
    const res = await salaryService.list(1, 100, teacherId)
    const data = res.data as any
    teacherSalaries.value = data.data?.salaries || data.salaries || []
  } catch (err: any) {
    console.error('Failed to load salaries:', err)
  } finally {
    loadingSalaries.value = false
  }
}

function closeTeacherProfile() {
  showTeacherProfile.value = false
  selectedTeacherProfile.value = null
  teacherSalaries.value = []
  expandedSalaryId.value = null
}

// ── Salary Payment Modal ──────────────────────────────────────────────────────
const showSalaryModal = ref(false)
const isEditingSalary = ref(false)
const editingSalaryId = ref<number | null>(null)
const salaryModalError = ref<string | null>(null)

const emptySalaryForm = () => ({
  amount: 0,
  payment_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  reference_no: '',
  remarks: '',
})

const salaryForm = ref(emptySalaryForm())

function openAddSalaryModal() {
  salaryForm.value = emptySalaryForm()
  isEditingSalary.value = false
  editingSalaryId.value = null
  salaryModalError.value = null
  showSalaryModal.value = true
}

function openEditSalaryModal(salary: Salary) {
  salaryForm.value = {
    amount: salary.amount,
    payment_date: salary.payment_date || new Date().toISOString().split('T')[0],
    payment_method: salary.payment_method || 'cash',
    reference_no: salary.reference_no || '',
    remarks: salary.remarks || '',
  }
  isEditingSalary.value = true
  editingSalaryId.value = salary.id
  salaryModalError.value = null
  showSalaryModal.value = true
}

function closeSalaryModal() {
  showSalaryModal.value = false
  salaryModalError.value = null
}

async function saveSalary() {
  salaryModalError.value = null
  
  if (!salaryForm.value.amount || salaryForm.value.amount <= 0) {
    salaryModalError.value = 'Amount must be greater than 0'
    return
  }
  
  if (!selectedTeacherProfile.value) return
  
  saving.value = true
  try {
    if (isEditingSalary.value && editingSalaryId.value) {
      // Update existing salary
      const updatePayload = {
        amount: salaryForm.value.amount,
        payment_date: salaryForm.value.payment_date,
        payment_method: salaryForm.value.payment_method,
        reference_no: salaryForm.value.reference_no || undefined,
        remarks: salaryForm.value.remarks || undefined,
      }
      await salaryService.update(editingSalaryId.value, updatePayload)
    } else {
      // Create new salary
      const createPayload = {
        teacher_id: selectedTeacherProfile.value.id,
        amount: salaryForm.value.amount,
        payment_date: salaryForm.value.payment_date,
        payment_method: salaryForm.value.payment_method,
        reference_no: salaryForm.value.reference_no || undefined,
        remarks: salaryForm.value.remarks || undefined,
      }
      await salaryService.create(createPayload)
    }
    closeSalaryModal()
    await loadSalaryHistory(selectedTeacherProfile.value.id)
  } catch (err: any) {
    salaryModalError.value = err?.response?.data?.message ?? 'Failed to save salary payment'
  } finally {
    saving.value = false
  }
}

// ── Delete Salary ──────────────────────────────────────────────────────────────
const showDeleteSalaryModal = ref(false)
const deletingSalary = ref<Salary | null>(null)

function confirmDeleteSalary(salary: Salary) {
  deletingSalary.value = salary
  showDeleteSalaryModal.value = true
}

async function deleteSalary() {
  if (!deletingSalary.value || !selectedTeacherProfile.value) return
  saving.value = true
  try {
    await salaryService.delete(deletingSalary.value.id)
    showDeleteSalaryModal.value = false
    deletingSalary.value = null
    await loadSalaryHistory(selectedTeacherProfile.value.id)
  } catch (err: any) {
    alert(err?.response?.data?.message ?? 'Failed to delete salary payment')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadBatches()
  // Load dashboard data immediately since dashboard is the default section
  if (activeSection.value === 'dashboard') {
    loadDashboardData()
  }
})

// Watch for section changes to load data
watch(activeSection, (newSection) => {
  if (newSection === 'dashboard' && dashboardStats.value.totalStudents === 0) {
    loadDashboardData()
  }
  if (newSection === 'fees' && feePaymentsList.value.length === 0) {
    loadFeePaymentsList()
  }
  if (newSection === 'salary' && salaryPaymentsList.value.length === 0) {
    loadSalaryPaymentsList()
  }
})
</script>

<style scoped>
/* ── Layout ── */
.dashboard-container { display: flex; min-height: 100vh; background: var(--bg-page); }

/* Operations accent */
.sidebar {
  width: 220px; min-width: 200px;
}
.nav-item.active {
  border-left-color: var(--accent-manager);
}
.sidebar-header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.2); }
.sidebar-header h2 { margin: 0 0 6px; font-size: 20px; }
.sidebar-header p  { margin: 0 0 6px; font-size: 13px; opacity: 0.9; }
.role-badge {
  display: inline-block; padding: 3px 10px;
  background: rgba(255,255,255,0.2); border-radius: var(--radius-full);
  font-size: var(--font-size-xs); text-transform: capitalize;
}

/* ── Main (uses shared) ── */
.row-between { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }

/* ── Stats (uses shared) ── */

/* ── Content section ── */
.content-section.no-pad { padding: 0; overflow: hidden; }

.feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.feature-card {
  padding: 18px; background: var(--bg-muted); border-radius: var(--radius-sm);
  border-left: 4px solid var(--brand-primary-light); cursor: pointer; transition: box-shadow var(--transition-base);
}
.feature-card:hover { box-shadow: var(--shadow-md); }
.feature-card h3 { margin: 0 0 6px; color: var(--text-primary); font-size: var(--font-size-md); }
.feature-card p  { margin: 0; color: var(--text-muted); font-size: var(--font-size-sm); }



/* ── Table toolbar ── */
.table-toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 14px 20px; border-bottom: 1px solid var(--border-light);
  background: var(--bg-card);
}
.search-box {
  flex: 1; max-width: 400px;
}
.search-input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-default);
  border-radius: var(--radius-sm); font-size: 14px; transition: all 0.2s;
  background: var(--bg-input); color: var(--text-primary);
}
.search-input:focus {
  outline: none; border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}
.table-count { font-size: 13px; color: var(--text-muted); margin-left: auto; }
.btn-refresh {
  padding: 6px 14px; background: var(--bg-muted); border: none;
  border-radius: var(--radius-sm); cursor: pointer; font-size: 13px; transition: background 0.2s;
}
.btn-refresh:hover { background: var(--bg-card-hover); }

/* ── Table ── */
.table-wrap { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th {
  background: var(--bg-muted); padding: 12px 16px; text-align: left;
  font-size: 12px; color: var(--text-muted); text-transform: uppercase;
  letter-spacing: 0.5px; border-bottom: 1px solid var(--border-light);
}
.data-table td {
  padding: 14px 16px; border-bottom: 1px solid var(--border-light); color: var(--text-secondary); vertical-align: middle;
}
.data-table tbody tr:hover { background: var(--bg-card-hover); }
.data-table .bold { font-weight: 600; color: var(--text-primary); }
.empty-row { text-align: center; color: var(--text-muted); padding: 40px !important; }

.badge {
  display: inline-block; padding: 3px 10px;
  border-radius: 12px; font-size: 12px; font-weight: 600;
}
.badge-green { background: var(--color-success-light); color: #166534; }
.badge-grey  { background: var(--bg-muted); color: var(--text-muted); }
.badge-blue  { background: var(--color-info-light); color: #1e40af; }
.badge-purple { background: #f3e8ff; color: #6b21a8; }

.actions-cell { display: flex; gap: 6px; align-items: center; }
.btn-icon {
  width: 30px; height: 30px; border: none; border-radius: var(--radius-sm);
  cursor: pointer; font-size: 15px; display: flex; align-items: center;
  justify-content: center; transition: background 0.15s;
}
.btn-icon.edit   { background: var(--color-info-light); }
.btn-icon.edit:hover   { background: #cfe1ff; }
.btn-icon.delete { background: var(--color-danger-light); }
.btn-icon.delete:hover { background: #fecaca; }

/* ── Pagination ── */
.pagination {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px; justify-content: flex-end; border-top: 1px solid var(--border-light);
  background: var(--bg-card);
}
.pagination button {
  padding: 6px 14px; border: 1px solid var(--border-light); border-radius: var(--radius-sm);
  background: var(--bg-card); cursor: pointer; font-size: 13px;
}
.pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.pagination span { font-size: 13px; color: var(--text-muted); }

/* ── State messages ── */
.state-msg { padding: 32px; text-align: center; color: var(--text-muted); background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-light); }
.state-msg.error { color: var(--color-danger); background: var(--color-danger-light); border-color: #fecaca; }

/* ── Modal overlay ── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px;
}
.modal {
  background: var(--bg-card); border-radius: var(--radius-lg); width: 100%;
  max-width: 560px; box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; max-height: 90vh; overflow: hidden;
}
.modal-sm { max-width: 400px; }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border-light);
}
.modal-header h2 { margin: 0; font-size: 18px; color: var(--text-primary); }
.modal-close {
  width: 32px; height: 32px; border: none; border-radius: var(--radius-sm);
  background: var(--bg-muted); cursor: pointer; font-size: 16px; display: flex;
  align-items: center; justify-content: center;
}
.modal-close:hover { background: var(--bg-card-hover); }
.modal-body { padding: 24px; overflow-y: auto; flex: 1; }
.modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 16px 24px; border-top: 1px solid var(--border-light); background: var(--bg-muted);
}

/* ── Form ── */
.form-error {
  background: var(--color-danger-light); color: var(--color-danger); border: 1px solid #fecaca;
  padding: 10px 14px; border-radius: var(--radius-sm); font-size: 14px; margin-bottom: 18px;
}
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-field label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.form-field input[type=text],
.form-field input[type=number],
.form-field input[type=date],
.form-field select,
.form-field textarea,
.form-select,
.form-textarea {
  padding: 10px 12px; border: 1.5px solid var(--border-light); border-radius: var(--radius-sm);
  font-size: 14px; color: var(--text-primary); outline: none; transition: border-color 0.2s;
  background: var(--bg-input);
}
.form-textarea {
  resize: vertical;
  font-family: inherit;
  min-height: 60px;
}
.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus,
.form-select:focus,
.form-textarea:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
.req { color: #ef4444; }
.field-hint { font-size: 12px; color: var(--text-muted); margin-top: -2px; }

/* toggle */
.toggle-field { flex-direction: row; align-items: center; gap: 14px; margin-top: 4px; }
.toggle-label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--text-secondary); }
.toggle-wrap { position: relative; }
.toggle-input { display: none; }
.toggle-slider {
  display: block; width: 42px; height: 24px; background: var(--border-light);
  border-radius: 12px; cursor: pointer; transition: background 0.2s;
  position: relative;
}
.toggle-slider::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 18px; height: 18px; border-radius: 50%; background: white;
  transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-input:checked + .toggle-slider { background: #22c55e; }
.toggle-input:checked + .toggle-slider::after { transform: translateX(18px); }
.toggle-hint { font-size: 12px; color: var(--text-muted); }

/* ── Buttons ── */
.btn-cancel {
  padding: 9px 20px; border: 1.5px solid var(--border-light); border-radius: var(--radius-sm);
  background: var(--bg-card); cursor: pointer; font-size: 14px; color: var(--text-secondary);
}
.btn-cancel:hover { background: var(--bg-card-hover); }
.btn-cancel:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-save {
  padding: 9px 22px; background: var(--brand-gradient);
  color: white; border: none; border-radius: var(--radius-sm); font-size: var(--font-size-base);
  font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
  transition: opacity var(--transition-base);
}
.btn-save:hover:not(:disabled) { opacity: 0.88; }
.btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-delete {
  padding: 9px 22px; background: var(--color-danger); color: white;
  border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;
}
.btn-delete:hover:not(:disabled) { opacity: 0.88; }
.btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }

.delete-warn { color: #b91c1c !important; font-size: 13px; margin-top: 6px !important; }

.mini-spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Student Profile Modal ── */
.modal-lg { max-width: 900px; width: 90%; }
.clickable-name { cursor: pointer; color: var(--brand-primary); transition: color 0.2s; }
.clickable-name:hover { color: var(--brand-primary-dark); text-decoration: underline; }

.profile-content { display: flex; flex-direction: column; gap: 24px; }
.profile-section { background: var(--bg-muted); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-light); }
.profile-section h3 { margin: 0 0 16px 0; font-size: 16px; color: var(--text-primary); display: flex; align-items: center; gap: 8px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.section-header h3 { margin: 0; }

.info-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px;
}
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.info-item span { font-size: 14px; color: var(--text-primary); }
.info-item .bold { font-weight: 600; }

.fee-summary {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;
}
.fee-card {
  background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-light);
}
.fee-card.highlight {
  background: var(--color-info-light); border-color: #3b82f6; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}
.fee-card label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px; }
.fee-value {
  font-size: 18px; color: var(--text-primary); font-weight: 600;
}
.fee-value.big { font-size: 24px; color: #3b82f6; }
.fee-value.discount { color: #16a34a; }

.fee-status-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;
}
.status-card {
  background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-light); text-align: center;
}
.status-card.paid { border-color: #16a34a; background: #f0fdf4; }
.status-card.pending { border-color: #f59e0b; background: #fffbeb; }
.status-label { font-size: 12px; color: var(--text-muted); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
.status-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
.status-value.small { font-size: 14px; margin-top: 4px; }

.progress-bar {
  width: 100%; height: 12px; background: var(--border-light); border-radius: 6px; overflow: hidden; margin: 8px 0;
}
.progress-fill {
  height: 100%; background: var(--brand-gradient); transition: width 0.3s ease;
}

.alert-info {
  padding: 12px 16px; background: var(--color-info-light); border: 1px solid #93c5fd; border-radius: var(--radius-sm);
  color: #1e40af; font-size: 14px;
}

.empty-state {
  text-align: center; padding: 40px 20px; color: var(--text-muted);
}
.empty-state p { margin-bottom: 16px; }

.payments-table { overflow-x: auto; }
.btn-sm { padding: 6px 14px !important; font-size: 13px !important; }
.badge-blue { background: #dbeafe; color: #1e40af; }

/* Expandable Details Row */
.btn-expand {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-muted);
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}
.btn-expand:hover {
  background: var(--bg-muted);
  color: var(--text-secondary);
}
.details-row {
  background: var(--bg-muted);
}
.details-row td {
  padding: 0 !important;
}
.details-content {
  padding: 16px 24px;
  border-top: 1px dashed var(--border-light);
  border-bottom: 1px dashed var(--border-light);
}
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-item label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
}
.detail-item span {
  font-size: 14px;
  color: var(--text-primary);
}

/* ── Parent Connect/Disconnect ── */
.connect-parent-form {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}
.connect-parent-form .form-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.connect-parent-form .form-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: 14px;
  background: var(--bg-input);
}
.connect-parent-form .form-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}
.parent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.parent-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  transition: box-shadow 0.2s;
}
.parent-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.parent-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.parent-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(79, 70, 229, 0.12);
  border-radius: 50%;
}
.parent-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
}
.parent-email {
  font-size: 12px;
  color: var(--text-muted);
}

/* Financial Grid for Batch Profile */
.financial-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.finance-card {
  background: var(--bg-card);
  padding: 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  text-align: center;
}
.finance-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.finance-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}
.finance-sub {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}
.finance-card.discount {
  border-color: #f59e0b;
  background: #fffbeb;
}
.finance-card.discount .finance-value {
  color: #d97706;
}
.finance-card.expected {
  border-color: #3b82f6;
  background: #eff6ff;
}
.finance-card.expected .finance-value {
  color: #2563eb;
}
.finance-card.received {
  border-color: #16a34a;
  background: #f0fdf4;
}
.finance-card.received .finance-value {
  color: #16a34a;
}
.finance-card.outstanding {
  border-color: #ef4444;
  background: #fef2f2;
}
.finance-card.outstanding .finance-value {
  color: #dc2626;
}
.discount-text {
  color: #d97706;
  font-weight: 500;
}

/* Teacher Selection List for Assignment */
.modal-info {
  margin-bottom: 16px;
  color: var(--text-secondary);
}
.teacher-select-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  margin-top: 12px;
  background: var(--bg-card);
}
.teacher-select-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.2s;
}
.teacher-select-item:last-child {
  border-bottom: none;
}
.teacher-select-item:hover {
  background: var(--bg-card-hover);
}
.teacher-select-item.selected {
  background: var(--color-info-light);
  border-color: #3b82f6;
}
.teacher-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.teacher-name {
  font-weight: 600;
  color: var(--text-primary);
}
.teacher-details {
  font-size: 12px;
  color: var(--text-muted);
}
.check-mark {
  color: var(--brand-primary);
  font-weight: bold;
  font-size: 18px;
}

/* Filter Section */
.filter-section {
  margin-bottom: 16px;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
}
.form-select, .form-input {
  padding: 8px 12px;
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  font-size: 14px;
  min-width: 150px;
  background: var(--bg-input);
}
.form-select:focus, .form-input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12);
}
.btn-secondary {
  padding: 8px 16px;
  background: var(--bg-muted);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-secondary:hover {
  background: var(--bg-card-hover);
}

/* Summary Cards */
.summary-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}
.summary-card {
  flex: 1;
  background: var(--bg-card);
  padding: 20px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  text-align: center;
}
.summary-card.received {
  border-color: #16a34a;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}
.summary-card.paid {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}
.summary-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 8px;
}
.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}
.summary-card.received .summary-value {
  color: #16a34a;
}
.summary-card.paid .summary-value {
  color: #2563eb;
}

/* ── Dashboard Statistics Cards ── */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.dash-stat-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  border-left: 4px solid;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dash-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dash-stat-card.blue { border-left-color: var(--color-info); }
.dash-stat-card.purple { border-left-color: #8b5cf6; }
.dash-stat-card.green { border-left-color: var(--color-success); }
.dash-stat-card.orange { border-left-color: var(--color-warning); }

.stat-icon {
  font-size: 32px;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.12);
}

.dash-stat-card.purple .stat-icon {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05));
}

.dash-stat-card.green .stat-icon {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05));
}

.dash-stat-card.orange .stat-icon {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05));
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px 0;
}

.stat-detail {
  font-size: 12px;
  color: var(--text-muted);
}

/* ── Dashboard Grid ── */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.dashboard-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.dashboard-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.view-all-btn {
  background: none;
  border: none;
  color: var(--brand-primary);
  font-size: 13px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: background 0.2s;
}

.view-all-btn:hover {
  background: var(--color-info-light);
}

/* ── Activity List ── */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--bg-muted);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--border-light);
  transition: border-color 0.2s, background 0.2s;
}

.activity-item:hover {
  background: var(--bg-card-hover);
  border-left-color: var(--brand-primary);
}

.activity-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.activity-info strong {
  font-size: 14px;
  color: var(--text-primary);
}

.activity-detail {
  font-size: 12px;
  color: var(--text-muted);
}

.activity-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount-value {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-success);
}

.activity-time {
  font-size: 11px;
  color: var(--text-muted);
}

.activity-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.batch-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.batch-status.active {
  background: var(--color-success-light);
  color: #065f46;
}

.batch-status.inactive {
  background: var(--color-danger-light);
  color: #991b1b;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 14px;
}

/* ── Financial Overview ── */
.financial-overview {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.financial-metric {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 150px;
}

.metric-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 600;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
}

.metric-value.green { color: var(--color-success); }
.metric-value.blue { color: var(--color-info); }
.metric-value.orange { color: var(--color-warning); }
.metric-value.purple { color: #8b5cf6; }
.metric-value.red { color: var(--color-danger); }

/* ── AI Insights ── */
.ai-insights-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.ai-headline {
  margin: 0;
  font-size: 18px;
  color: var(--text-primary);
}

.ai-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 1fr));
  gap: 16px;
}

.ai-column {
  background: var(--bg-muted);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 14px;
}

.ai-column h5 {
  margin: 0 0 10px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--text-muted);
}

.ai-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--text-primary);
}

.ai-list.risks li::marker {
  color: var(--color-warning);
}

.ai-list.actions li::marker {
  color: var(--color-success);
}

/* ── Quick Actions ── */
.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-sm);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-icon {
  font-size: 16px;
}

.action-btn.primary {
  background: var(--brand-gradient);
  color: white;
}

.action-btn.success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.action-btn.info {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: white;
}

.action-btn.warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.action-btn.secondary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.action-btn.refresh {
  background: linear-gradient(135deg, #6b7280, #4b5563);
  color: white;
}

@media (max-width: 980px) {
  .ai-columns {
    grid-template-columns: 1fr;
  }
  .dashboard-container { flex-direction: column; }
  .sidebar { width: 260px; height: 100vh; position: fixed; left: 0; top: 0; transform: translateX(-100%); transition: transform 0.3s ease; z-index: 30; }
  .sidebar-open .sidebar { transform: translateX(0); }
  .sidebar-nav { display: flex; flex-wrap: wrap; gap: 8px; }
  .nav-item { flex: 1 1 160px; }
  .main-content { margin-left: 0; padding: 16px; }
  .content-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .dashboard-stats { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .dashboard-grid { grid-template-columns: 1fr; }
  .mobile-menu-btn { display: inline-flex; }
}

@media (max-width: 600px) {
  .dashboard-stats { grid-template-columns: 1fr; }
  .financial-overview { grid-template-columns: 1fr; }
  .table-container { overflow-x: auto; }
  .data-table { min-width: 640px; }
}

.mobile-menu-btn {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 12px;
}
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  z-index: 20;
}
</style>
