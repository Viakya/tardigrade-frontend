<template>
  <div class="dashboard-container" :class="{ 'exam-active': activeSection === 'exam' }">
    <!-- SIDEBAR -->
    <aside class="sidebar" v-if="activeSection !== 'exam'">
      <div class="sidebar-header">
        <div class="avatar">{{ initials }}</div>
        <h2>{{ authStore.user?.full_name }}</h2>
        <span class="role-badge">Student</span>
        <button class="theme-toggle-btn" type="button" @click="toggleTheme">
          <span class="theme-toggle-icon">{{ isDarkTheme ? '☀️' : '🌙' }}</span>
          <span class="theme-toggle-text">{{ isDarkTheme ? 'Light' : 'Dark' }}</span>
        </button>
      </div>
      <nav class="sidebar-nav">
        <a :class="['nav-item', { active: activeSection === 'overview' }]" @click="activeSection = 'overview'">
          <span>📊</span> Overview
        </a>
        <a :class="['nav-item', { active: activeSection === 'profile' }]" @click="activeSection = 'profile'">
          <span>👤</span> My Profile
        </a>
        <a :class="['nav-item', { active: activeSection === 'batch' }]" @click="activeSection = 'batch'">
          <span>📚</span> My Batch
        </a>
        <a :class="['nav-item', { active: activeSection === 'fees' }]" @click="activeSection = 'fees'">
          <span>💰</span> Fee Status
        </a>
        <a :class="['nav-item', { active: activeSection === 'resources' }]" @click="activeSection = 'resources'">
          <span>📌</span> Batch Portal
        </a>
        <a :class="['nav-item', { active: activeSection === 'quizzes' }]" @click="activeSection = 'quizzes'">
          <span>🧠</span> Quizzes & Results
        </a>
        <a :class="['nav-item', { active: activeSection === 'attendance' }]" @click="activeSection = 'attendance'">
          <span>✅</span> Attendance
        </a>
      </nav>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content" :class="{ 'exam-content': activeSection === 'exam' }">
      <div class="toast-stack" v-if="toasts.length">
        <div v-for="toast in toasts" :key="toast.id" :class="['toast-item', `toast-${toast.type}`]">
          <span>{{ toast.message }}</span>
          <button class="toast-close" @click="dismissToast(toast.id)">×</button>
        </div>
      </div>

      <!-- Global Loading / Error -->
      <div v-if="pageLoading" class="page-loading">
        <div class="spinner-lg"></div>
        <p>Loading your dashboard…</p>
      </div>
      <div v-else-if="pageError" class="page-error">
        <div class="error-icon">⚠️</div>
        <h2>Could not load your profile</h2>
        <p>{{ pageError }}</p>
        <button class="btn-primary" @click="loadAll">Retry</button>
      </div>

      <template v-else>

        <!-- ── OVERVIEW ── -->
        <template v-if="activeSection === 'overview'">
          <header class="content-header">
            <h1>Welcome back, {{ firstName }}! 👋</h1>
            <p class="breadcrumb">Home / Overview</p>
          </header>

          <div class="stats-grid">
            <div class="stat-card green">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <h3>Attendance Rate</h3>
                <p class="stat-value">{{ attendanceRate }}%</p>
                <span class="stat-sub">{{ presentCount }} / {{ totalAttendance }} classes</span>
              </div>
            </div>
            <div class="stat-card blue">
              <div class="stat-icon">🧠</div>
              <div class="stat-info">
                <h3>Assignments Completed</h3>
                <p class="stat-value">{{ completedAssignments }}</p>
                <span class="stat-sub">practice + graded</span>
              </div>
            </div>
            <div class="stat-card purple">
              <div class="stat-icon">📈</div>
              <div class="stat-info">
                <h3>Avg Quiz Score</h3>
                <p class="stat-value">{{ overallAssignmentAverage }}%</p>
                <span class="stat-sub">submitted attempts</span>
              </div>
            </div>
            <div :class="['stat-card', feeFullyPaid ? 'green' : 'orange']">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <h3>Fee Status</h3>
                <p class="stat-value">{{ feeFullyPaid ? 'Paid' : 'Pending' }}</p>
                <span class="stat-sub">₹{{ remainingFee.toLocaleString() }} remaining</span>
              </div>
            </div>
          </div>

          <div class="overview-grid">
            <!-- Recent Attendance -->
            <div class="card">
              <div class="card-head">
                <h3>🗓️ Recent Attendance</h3>
                <button class="link-btn" @click="activeSection = 'attendance'">View All →</button>
              </div>
              <div v-if="attendanceRecords.length === 0" class="empty-msg">No attendance records yet.</div>
              <div v-else class="attendance-mini-list">
                <div v-for="rec in attendanceRecords.slice(0, 6)" :key="rec.id" class="attend-row">
                  <span class="attend-date">{{ formatDate(rec.attendance_date) }}</span>
                  <span :class="['attend-badge', rec.status === 'present' ? 'present' : 'absent']">
                    {{ rec.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Quiz Results -->
            <div class="card">
              <div class="card-head">
                <h3>🧠 Recent Quiz Results</h3>
                <button class="link-btn" @click="activeSection = 'quizzes'">View All →</button>
              </div>
              <div v-if="recentQuizResults.length === 0" class="empty-msg">No quiz submissions yet.</div>
              <div v-else class="test-mini-list">
                <div v-for="quiz in recentQuizResults" :key="quiz.id" class="test-row">
                  <div class="test-row-info">
                    <span class="test-title">{{ quiz.title }}</span>
                    <span class="test-subject">{{ quiz.mode }} • {{ quiz.status }}</span>
                  </div>
                  <div class="test-score-pill score-mid">
                    {{ formatQuizScore(quiz) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Fee Summary -->
            <div class="card">
              <div class="card-head">
                <h3>💳 Fee Summary</h3>
                <button class="link-btn" @click="activeSection = 'fees'">View All →</button>
              </div>
              <div class="fee-mini-grid">
                <div class="fee-mini-item">
                  <label>Total Fee</label>
                  <span class="fee-val">₹{{ totalFee.toLocaleString() }}</span>
                </div>
                <div class="fee-mini-item fee-green">
                  <label>Total Paid</label>
                  <span class="fee-val">₹{{ totalPaid.toLocaleString() }}</span>
                </div>
                <div class="fee-mini-item" :class="remainingFee > 0 ? 'fee-orange' : 'fee-green'">
                  <label>Remaining</label>
                  <span class="fee-val">₹{{ remainingFee.toLocaleString() }}</span>
                </div>
              </div>
              <div class="progress-bar-wrap">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: feeProgress + '%' }"></div>
                </div>
                <span class="progress-label">{{ feeProgress }}% paid</span>
              </div>
            </div>

            <!-- Batch Info -->
            <div class="card">
              <div class="card-head">
                <h3>🎓 My Batch</h3>
                <button class="link-btn" @click="activeSection = 'batch'">Details →</button>
              </div>
              <div v-if="!studentProfile?.batch" class="empty-msg">No batch assigned yet.</div>
              <div v-else class="batch-mini">
                <div class="batch-name">{{ studentProfile.batch.batch_name }}</div>
                <div class="batch-year">Year {{ studentProfile.batch.year }}</div>
              </div>
            </div>
          </div>

          <div class="card trend-card">
            <div class="card-head">
              <h3>📈 Quiz Performance Trend</h3>
              <span class="trend-note">Last 6 months</span>
            </div>
            <div class="trend-insights">
              <div class="trend-insight-chip">
                <span>Latest</span>
                <strong>{{ quizTrendInsights.latest.label }}: {{ quizTrendInsights.latest.value }}%</strong>
              </div>
              <div class="trend-insight-chip">
                <span>Best</span>
                <strong>{{ quizTrendInsights.best.label }}: {{ quizTrendInsights.best.value }}%</strong>
              </div>
              <div class="trend-insight-chip" :class="quizTrendInsights.delta >= 0 ? 'up' : 'down'">
                <span>Momentum</span>
                <strong>{{ quizTrendInsights.delta >= 0 ? '+' : '' }}{{ quizTrendInsights.delta }}%</strong>
              </div>
            </div>
            <div class="trend-grid">
              <div class="trend-panel">
                <h4>Quiz Score %</h4>
                <div class="trend-bars">
                  <div v-for="point in quizTrendData" :key="`quiz-${point.monthKey}`" class="trend-bar-item">
                    <div class="trend-track">
                      <span class="trend-target-line" title="Target: 75%"></span>
                      <div
                        class="trend-fill"
                        :style="{ height: `${point.value}%` }"
                        :title="`${point.label}: ${point.value}%`"
                      ></div>
                    </div>
                    <span class="trend-label">{{ point.label }}</span>
                    <span class="trend-value">{{ point.value }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── MY PROFILE ── -->
        <template v-if="activeSection === 'profile'">
          <header class="content-header">
            <h1>👤 My Profile</h1>
            <p class="breadcrumb">Home / Profile</p>
          </header>
          <div class="card" v-if="studentProfile">
            <div class="profile-avatar-row">
              <div class="avatar-lg">{{ initials }}</div>
              <div>
                <h2 style="margin:0 0 4px;font-size:22px;color:var(--text-primary)">{{ studentProfile.user?.full_name }}</h2>
                <p class="profile-email">{{ studentProfile.user?.email }}</p>
                <span class="role-pill">Student</span>
              </div>
            </div>

            <div class="section-divider"></div>

            <div class="info-grid">
              <div class="info-item">
                <label>Student ID</label>
                <span>#{{ studentProfile.id }}</span>
              </div>
              <div class="info-item">
                <label>Phone</label>
                <span>{{ studentProfile.phone_number || '—' }}</span>
              </div>
              <div class="info-item">
                <label>Date of Birth</label>
                <span>{{ studentProfile.date_of_birth || '—' }}</span>
              </div>
              <div class="info-item">
                <label>Enrollment Date</label>
                <span>{{ studentProfile.enrollment_date || '—' }}</span>
              </div>
              <div class="info-item" style="grid-column:1/-1">
                <label>Address</label>
                <span>{{ studentProfile.address || '—' }}</span>
              </div>
            </div>

            <template v-if="studentProfile.parents?.length">
              <div class="section-divider"></div>
              <h3 class="sub-heading">👨‍👩‍👧 Connected Parents</h3>
              <div class="parents-row">
                <div v-for="p in studentProfile.parents" :key="p.id" class="parent-chip">
                  <span>👤</span>
                  <div>
                    <div class="chip-name">{{ p.full_name }}</div>
                    <div class="chip-email">{{ p.email }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </template>

        <!-- ── MY BATCH ── -->
        <template v-if="activeSection === 'batch'">
          <header class="content-header">
            <h1>📚 My Batch</h1>
            <p class="breadcrumb">Home / Batch</p>
          </header>
          <div v-if="!studentProfile?.batch" class="card empty-full">
            <p>You have not been assigned to a batch yet.</p>
          </div>
          <div v-else class="card">
            <div class="batch-header-row">
              <div style="display:flex;align-items:center;gap:12px">
                <h2 style="margin:0;font-size:22px;color:var(--text-primary)">{{ studentProfile.batch.batch_name }}</h2>
                <span class="year-badge">{{ studentProfile.batch.year }}</span>
              </div>
              <div class="batch-cost-pill">
                <span class="cost-value">₹{{ studentProfile.batch.batch_cost?.toLocaleString() ?? '—' }}</span>
                <span class="cost-label">Batch Fee</span>
              </div>
            </div>
            <div class="section-divider"></div>
            <div class="info-grid">
              <div class="info-item">
                <label>Batch Name</label>
                <span class="fw700">{{ studentProfile.batch.batch_name }}</span>
              </div>
              <div class="info-item">
                <label>Year</label>
                <span>{{ studentProfile.batch.year }}</span>
              </div>
              <div class="info-item">
                <label>Batch Fee</label>
                <span>₹{{ studentProfile.batch.batch_cost?.toLocaleString() ?? '—' }}</span>
              </div>
              <div class="info-item">
                <label>Your Discount</label>
                <span class="col-green fw700">{{ studentProfile.discount_percent }}%</span>
              </div>
              <div class="info-item">
                <label>Your Fee (After Discount)</label>
                <span class="fw700" style="font-size:20px">₹{{ totalFee.toLocaleString() }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- ── FEE STATUS ── -->
        <template v-if="activeSection === 'fees'">
          <header class="content-header">
            <h1>💰 Fee Status</h1>
            <p class="breadcrumb">Home / Fees</p>
          </header>

          <div v-if="!studentProfile?.batch" class="card empty-full">
            <p>No batch assigned — fee information not available yet.</p>
          </div>
          <template v-else>
            <div class="fee-overview-grid">
              <div class="fee-ov-card blue">
                <div class="fov-label">Total Fee</div>
                <div class="fov-value">₹{{ totalFee.toLocaleString() }}</div>
                <div class="fov-sub">After {{ studentProfile.discount_percent }}% discount</div>
              </div>
              <div class="fee-ov-card green">
                <div class="fov-label">Total Paid</div>
                <div class="fov-value">₹{{ totalPaid.toLocaleString() }}</div>
                <div class="fov-sub">{{ feePayments.length }} payment{{ feePayments.length !== 1 ? 's' : '' }}</div>
              </div>
              <div class="fee-ov-card" :class="remainingFee > 0 ? 'orange' : 'green'">
                <div class="fov-label">Remaining</div>
                <div class="fov-value">₹{{ remainingFee.toLocaleString() }}</div>
                <div class="fov-sub">{{ feeFullyPaid ? '✅ Fully paid' : '⚠️ Pending' }}</div>
                <div v-if="!feeFullyPaid" class="pay-input">
                  <span class="pay-label">Pay amount</span>
                  <input
                    v-model="payAmountInput"
                    type="number"
                    min="1"
                    :max="remainingFee"
                    step="1"
                    placeholder="Enter amount"
                  />
                  <div class="pay-quick">
                    <button type="button" class="btn-secondary" @click="payAmountInput = String(remainingFee)">
                      Pay Full
                    </button>
                    <button
                      type="button"
                      class="btn-secondary"
                      @click="payAmountInput = String(Math.ceil(remainingFee / 2))"
                    >
                      Pay 50%
                    </button>
                  </div>
                  <p v-if="payAmountError" class="pay-error">{{ payAmountError }}</p>
                </div>
                <button
                  v-if="!feeFullyPaid"
                  class="btn-primary"
                  style="margin-top: 12px; padding: 6px 12px; font-size: 13px;"
                  :disabled="paying"
                  @click="payRemainingFee"
                >
                  {{ paying ? 'Processing…' : 'Pay Now' }}
                </button>
              </div>
            </div>

            <div class="card" style="margin-bottom:24px">
              <div class="prog-row">
                <span>Payment Progress</span>
                <span class="prog-pct">{{ feeProgress }}%</span>
              </div>
              <div class="progress-track large">
                <div class="progress-fill" :style="{ width: feeProgress + '%' }"></div>
              </div>
            </div>

            <div class="card">
              <h3 class="card-title">Payment History</h3>
              <div class="table-toolbar student-toolbar">
                <input v-model="feeSearchQuery" class="search-input" placeholder="Search method/reference/remarks" />
                <select v-model="feeSortBy" class="filter-select">
                  <option value="date_desc">Latest First</option>
                  <option value="date_asc">Oldest First</option>
                  <option value="amount_desc">Amount High-Low</option>
                  <option value="amount_asc">Amount Low-High</option>
                </select>
                <span class="table-count">{{ filteredFeePayments.length }} payment{{ filteredFeePayments.length !== 1 ? 's' : '' }}</span>
              </div>
              <div v-if="loadingFees" class="table-skeleton-wrap">
                <div v-for="i in 5" :key="`fee-skeleton-${i}`" class="table-skeleton-row"></div>
              </div>
              <div v-else-if="feePayments.length === 0" class="empty-msg">No payments recorded yet.</div>
              <div v-else class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Amount</th><th>Date</th><th>Method</th><th>Reference</th><th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in paginatedFeePayments" :key="p.id">
                      <td>{{ p.id }}</td>
                      <td class="fw700 col-green">₹{{ Number(p.amount).toLocaleString() }}</td>
                      <td>{{ formatDate(p.payment_date) }}</td>
                      <td><span class="badge blue-badge">{{ p.payment_method }}</span></td>
                      <td>{{ p.reference_no || '—' }}</td>
                      <td>{{ p.remarks || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-if="filteredFeePayments.length > feePageSize" class="pagination">
                <button :disabled="feeCurrentPage === 1" @click="feeCurrentPage -= 1">‹ Prev</button>
                <span>Page {{ feeCurrentPage }} of {{ feeTotalPages }}</span>
                <button :disabled="feeCurrentPage >= feeTotalPages" @click="feeCurrentPage += 1">Next ›</button>
              </div>
            </div>
          </template>
        </template>

        <!-- ── ATTENDANCE ── -->
        <template v-if="activeSection === 'attendance'">
          <header class="content-header">
            <h1>✅ Attendance</h1>
            <p class="breadcrumb">Home / Attendance</p>
          </header>

          <div class="attend-summary-grid">
            <div class="attend-sum-card a-green">
              <div class="asm-num">{{ presentCount }}</div>
              <div class="asm-label">Present</div>
            </div>
            <div class="attend-sum-card a-red">
              <div class="asm-num">{{ absentCount }}</div>
              <div class="asm-label">Absent</div>
            </div>
            <div class="attend-sum-card a-blue">
              <div class="asm-num">{{ totalAttendance }}</div>
              <div class="asm-label">Total Classes</div>
            </div>
            <div class="attend-sum-card a-purple">
              <div class="asm-num">{{ attendanceRate }}%</div>
              <div class="asm-label">Attendance Rate</div>
            </div>
          </div>

          <div class="card" style="margin-bottom:24px">
            <div class="prog-row">
              <span>Overall Attendance</span>
              <span class="prog-pct" :class="Number(attendanceRate) >= 75 ? 'pct-green' : 'pct-red'">
                {{ attendanceRate }}%
              </span>
            </div>
            <div class="progress-track large">
              <div
                class="progress-fill"
                :class="Number(attendanceRate) < 75 ? 'red-fill' : ''"
                :style="{ width: attendanceRate + '%' }"
              ></div>
            </div>
            <p class="prog-hint" :class="Number(attendanceRate) >= 75 ? 'hint-green' : 'hint-red'">
              {{ Number(attendanceRate) >= 75 ? '✅ Good standing' : '⚠️ Below 75% — please improve attendance' }}
            </p>
          </div>

          <div class="card">
            <div class="card-head">
              <h3>📋 All Attendance Records</h3>
              <div class="attend-controls">
                <input v-model="attendanceSearchQuery" class="search-input" placeholder="Search date, remarks, batch" />
                <select v-model="attendanceFilter" class="filter-select">
                  <option value="all">All</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                </select>
                <select v-model="attendanceSortBy" class="filter-select">
                  <option value="date_desc">Latest First</option>
                  <option value="date_asc">Oldest First</option>
                </select>
              </div>
            </div>
            <div v-if="loadingAttendance" class="table-skeleton-wrap">
              <div v-for="i in 5" :key="`attendance-skeleton-${i}`" class="table-skeleton-row"></div>
            </div>
            <div v-else-if="filteredAttendance.length === 0" class="empty-msg">No records found.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Date</th><th>Status</th><th>Batch</th><th>Remarks</th></tr>
                </thead>
                <tbody>
                  <tr v-for="rec in paginatedAttendance" :key="rec.id">
                    <td>{{ formatDate(rec.attendance_date) }}</td>
                    <td>
                      <span :class="['attend-badge', rec.status === 'present' ? 'present' : 'absent']">
                        {{ rec.status }}
                      </span>
                    </td>
                    <td>{{ rec.batch?.batch_name || '—' }}</td>
                    <td>{{ rec.remarks || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="filteredAttendance.length > attendancePageSize" class="pagination">
              <button :disabled="attendanceCurrentPage === 1" @click="attendanceCurrentPage -= 1">‹ Prev</button>
              <span>Page {{ attendanceCurrentPage }} of {{ attendanceTotalPages }}</span>
              <button :disabled="attendanceCurrentPage >= attendanceTotalPages" @click="attendanceCurrentPage += 1">Next ›</button>
            </div>
          </div>
        </template>

        <!-- ── BATCH PORTAL ── -->
        <template v-if="activeSection === 'resources'">
          <header class="content-header">
            <h1>📌 Batch Portal</h1>
            <p class="breadcrumb">Home / Batch Portal</p>
          </header>

          <div v-if="!studentProfile?.batch" class="card empty-full">
            <p>No batch assigned — portal content not available yet.</p>
          </div>
          <div v-else class="card">
            <div class="card-head">
              <h3>Resources for {{ studentProfile.batch.batch_name }}</h3>
              <div class="resource-controls">
                <input v-model="resourceSearch" class="resource-search" placeholder="Search resources" />
                <select v-model="resourceFilter" class="resource-filter">
                  <option value="all">All</option>
                  <option value="youtube">YouTube</option>
                  <option value="article">Article</option>
                  <option value="link">Link</option>
                  <option value="tool">Tool</option>
                </select>
              </div>
            </div>
            <div v-if="loadingResources" class="table-skeleton-wrap">
              <div v-for="i in 4" :key="`resource-skeleton-${i}`" class="table-skeleton-row"></div>
            </div>
            <div v-else-if="resourceError" class="state-msg" style="color: var(--color-danger)">
              {{ resourceError }}
            </div>
            <div v-else-if="filteredResources.length === 0" class="empty-msg">
              No resources added yet.
            </div>
            <div v-else class="portal-layout">
              <div class="portal-list">
                <button
                  v-for="res in filteredResources"
                  :key="res.id"
                  class="portal-row"
                  :class="{ active: selectedResource?.id === res.id }"
                  @click="selectedResource = res"
                >
                  <div>
                    <strong>
                      <span class="resource-icon">{{ resourceIcon(res.resource_type) }}</span>
                      {{ res.title }}
                    </strong>
                    <p>{{ res.resource_type }} • {{ formatDate(res.created_at) }}</p>
                  </div>
                  <span>{{ res.creator?.full_name || 'Coach' }}</span>
                </button>
              </div>
              <div class="portal-detail">
                <div v-if="!selectedResource" class="empty-msg">Select a resource to preview.</div>
                <div v-else class="resource-preview">
                  <div class="resource-head">
                    <span class="resource-type">{{ resourceIcon(selectedResource.resource_type) }} {{ selectedResource.resource_type }}</span>
                    <span class="resource-date">{{ formatDate(selectedResource.created_at) }}</span>
                  </div>
                  <h4 class="resource-title">{{ selectedResource.title }}</h4>
                  <p v-if="selectedResource.description" class="resource-desc">{{ selectedResource.description }}</p>
                  <div v-if="getYoutubeEmbedUrl(selectedResource.url)" class="resource-embed">
                    <iframe
                      :src="getYoutubeEmbedUrl(selectedResource.url)"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <div v-else-if="getGenericEmbedUrl(selectedResource.url)" class="resource-embed">
                    <iframe
                      :src="getGenericEmbedUrl(selectedResource.url)"
                      frameborder="0"
                      allowfullscreen
                    ></iframe>
                  </div>
                  <a v-else :href="selectedResource.url" target="_blank" rel="noopener" class="resource-link">
                    Open resource ↗
                  </a>
                  <p class="resource-fallback-note">
                    Preview may not load for some websites due to security restrictions. Use "Open in new tab" for guaranteed access.
                  </p>
                  <a :href="selectedResource.url" target="_blank" rel="noopener" class="resource-open">
                    Open in new tab
                  </a>
                  <div v-if="selectedResource.creator" class="resource-meta">
                    Added by {{ selectedResource.creator.full_name }}
                  </div>
                  <div class="resource-hint">Note: some websites block embedding; if so, use the open link.</div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ── QUIZZES ── -->
        <template v-if="activeSection === 'quizzes'">
          <header class="content-header">
            <h1>🧠 Quizzes</h1>
            <p class="breadcrumb">Home / Quizzes</p>
          </header>

          <div v-if="!studentProfile?.batch" class="card empty-full">
            <p>No batch assigned — quizzes not available yet.</p>
          </div>
          <div v-else class="card">
            <div class="card-head">
              <h3>Available Quizzes</h3>
              <div class="quiz-filters">
                <input v-model="quizSearchQuery" class="search-input quiz-search" placeholder="Search by title" />
                <select v-model="quizStatusFilter" class="filter-select">
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="closed">Closed</option>
                </select>
                <select v-model="quizAttemptFilter" class="filter-select">
                  <option value="all">All Attempts</option>
                  <option value="attempted">Attempted</option>
                  <option value="not_attempted">Not Attempted</option>
                </select>
                <select v-model="quizSortBy" class="filter-select">
                  <option value="recent">Recent First</option>
                  <option value="title">Title A-Z</option>
                  <option value="score_desc">Score High-Low</option>
                  <option value="score_asc">Score Low-High</option>
                </select>
              </div>
            </div>
            <div v-if="loadingQuizzes" class="table-skeleton-wrap">
              <div v-for="i in 5" :key="`quiz-skeleton-${i}`" class="table-skeleton-row"></div>
            </div>
            <div v-else-if="quizError" class="state-msg" style="color: var(--color-danger)">
              {{ quizError }}
            </div>
            <div v-else-if="quizzes.length === 0" class="empty-msg">No quizzes available.</div>
            <div v-else class="quiz-two-col">
              <div class="quiz-col">
                <div class="quiz-group-head">
                  <h4 class="quiz-group-title">🎯 Graded Quizzes</h4>
                  <span class="quiz-group-count">{{ filteredGradedAssignments.length }}</span>
                </div>
                <div v-if="filteredGradedAssignments.length === 0" class="empty-msg">No graded quizzes.</div>
                <div v-else class="table-wrap">
                  <table class="data-table quiz-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Attempt</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="quiz in filteredGradedAssignments"
                        :key="`graded-${quiz.id}`"
                        class="quiz-row-click"
                        @click="openQuiz(quiz)"
                      >
                        <td class="fw700" data-label="Title">{{ quiz.title }}</td>
                        <td data-label="Status">{{ quiz.status }} • {{ quiz.question_count }} Qs</td>
                        <td data-label="Attempt">
                          <span :class="['attempt-pill', isQuizAttempted(quiz) ? 'attempted' : 'not-attempted']">
                            {{ isQuizAttempted(quiz) ? 'Attempted' : 'Not Attempted' }}
                          </span>
                        </td>
                        <td data-label="Marks">{{ marksForAttemptedQuiz(quiz) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="quiz-col">
                <div class="quiz-group-head">
                  <h4 class="quiz-group-title">🧪 Practice Quizzes</h4>
                  <span class="quiz-group-count">{{ filteredPracticeAssignments.length }}</span>
                </div>
                <div v-if="filteredPracticeAssignments.length === 0" class="empty-msg">No practice quizzes.</div>
                <div v-else class="table-wrap">
                  <table class="data-table quiz-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Attempt</th>
                        <th>Marks</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="quiz in filteredPracticeAssignments"
                        :key="`practice-${quiz.id}`"
                        class="quiz-row-click"
                        @click="openQuiz(quiz)"
                      >
                        <td class="fw700" data-label="Title">{{ quiz.title }}</td>
                        <td data-label="Status">{{ quiz.status }} • {{ quiz.question_count }} Qs</td>
                        <td data-label="Attempt">
                          <span :class="['attempt-pill', isQuizAttempted(quiz) ? 'attempted' : 'not-attempted']">
                            {{ isQuizAttempted(quiz) ? 'Attempted' : 'Not Attempted' }}
                          </span>
                        </td>
                        <td data-label="Marks">{{ marksForAttemptedQuiz(quiz) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="activeSection === 'exam' && selectedQuiz">
          <section class="exam-screen">
            <header class="exam-screen-header">
              <div class="exam-head-left">
                <h2>{{ selectedQuiz.title }}</h2>
                <p>{{ selectedQuiz.mode }} • {{ selectedQuiz.status }} • {{ selectedQuiz.questions?.length || 0 }} questions</p>
              </div>
              <div class="exam-head-center">
                <div class="exam-student">Candidate: {{ authStore.user?.full_name }}</div>
                <div class="exam-student">Batch: {{ studentProfile?.batch?.batch_name || 'Not assigned' }}</div>
              </div>
              <div class="exam-head-right">
                <div class="exam-timer">⏱ {{ formatExamTimer(examSecondsLeft) }}</div>
                <button class="btn-secondary" @click="exitExam">Back to Quizzes</button>
                <button class="btn-primary" :disabled="submittingQuiz || !canSubmitQuiz" @click="submitQuiz">
                  {{ submittingQuiz ? 'Submitting…' : `Submit (${unansweredCount} unanswered)` }}
                </button>
              </div>
            </header>

            <div class="exam-layout" v-if="currentQuizQuestion">
              <section class="exam-question-panel">
                <div class="exam-qmeta">
                  <strong>Question {{ quizCurrentIndex + 1 }}</strong>
                  <span>of {{ selectedQuiz.questions?.length || 0 }}</span>
                </div>

                <div class="quiz-question">
                  <div class="fw700">{{ currentQuizQuestion.question }}</div>
                  <div class="quiz-options">
                    <label v-for="(opt, idx) in currentQuizQuestion.options" :key="`${currentQuestionKey}-${idx}`" class="quiz-option">
                      <input
                        type="radio"
                        :name="`q-${currentQuestionKey}`"
                        :value="['A','B','C','D'][idx]"
                        v-model="quizAnswers[currentQuestionKey]"
                        :disabled="!canSubmitQuiz"
                      />
                      <span :class="questionOptionClass(currentQuizQuestion, idx)">
                        {{ ['A','B','C','D'][idx] }}. {{ opt }}
                      </span>
                    </label>
                  </div>
                  <div class="quiz-meta">
                    <span>Your answer: {{ formatStudentAnswer(currentQuizQuestion.student_answer || quizAnswers[currentQuestionKey]) }}</span>
                    <span v-if="showCorrectAnswers">Correct: {{ currentQuizQuestion.correct_option || '—' }}</span>
                  </div>
                  <div v-if="showExplanations && currentQuizQuestion.explanation" class="quiz-explanation">
                    Explanation: {{ currentQuizQuestion.explanation }}
                  </div>

                  <div class="exam-actions-row" v-if="canSubmitQuiz">
                    <button class="btn-secondary" @click="toggleMarkForReview(currentQuestionKey)">
                      {{ markedForReview.has(currentQuestionKey) ? 'Unmark Review' : 'Mark for Review' }}
                    </button>
                    <button class="btn-secondary" @click="clearCurrentAnswer">Clear Response</button>
                  </div>
                </div>

                <div class="exam-nav-actions" v-if="canSubmitQuiz">
                  <button class="btn-secondary" @click="prevQuestion" :disabled="quizCurrentIndex === 0">Previous</button>
                  <button class="btn-secondary" @click="nextQuestion" :disabled="quizCurrentIndex >= (selectedQuiz.questions?.length || 1) - 1">Save & Next</button>
                </div>
              </section>

              <aside class="exam-sidebar">
                <div class="exam-stats">
                  <div class="exam-stat"><strong>{{ answeredCount }}</strong><span>Answered</span></div>
                  <div class="exam-stat"><strong>{{ notAnsweredCount }}</strong><span>Not Answered</span></div>
                  <div class="exam-stat"><strong>{{ reviewCount }}</strong><span>Review</span></div>
                  <div class="exam-stat"><strong>{{ notVisitedCount }}</strong><span>Not Visited</span></div>
                </div>
                <h4>Question Palette</h4>
                <div class="palette-grid">
                  <button
                    v-for="(q, idx) in (selectedQuiz.questions || [])"
                    :key="`palette-${questionKeyFrom(q, idx)}`"
                    class="palette-btn"
                    :class="questionStatusClass(idx)"
                    @click="jumpToQuestion(idx)"
                  >
                    {{ idx + 1 }}
                  </button>
                </div>
                <div class="palette-legend">
                  <span><i class="dot dot-current"></i> Current</span>
                  <span><i class="dot dot-answered"></i> Answered</span>
                  <span><i class="dot dot-not-answered"></i> Not Answered</span>
                  <span><i class="dot dot-review"></i> Marked For Review</span>
                  <span><i class="dot dot-not-visited"></i> Not Visited</span>
                </div>
              </aside>
            </div>

            <div v-if="latestQuizReport" class="quiz-report-card">
              <div class="card-head" style="margin-top: 0;">
                <h3>📊 Instant Quiz Report</h3>
              </div>
              <div class="quiz-report-grid">
                <div><strong>Attempt:</strong> #{{ latestQuizReport.attempt_number }}</div>
                <div><strong>Score:</strong> {{ latestQuizReport.score }} / {{ latestQuizReport.total_marks }}</div>
                <div><strong>Percentage:</strong> {{ latestQuizReport.percentage }}%</div>
                <div><strong>Correct:</strong> {{ latestQuizReport.correct_answers }}</div>
                <div><strong>Incorrect:</strong> {{ latestQuizReport.incorrect_answers }}</div>
                <div v-if="latestQuizReport.previous_attempt_score !== null">
                  <strong>Attempt {{ latestQuizReport.attempt_number - 1 }}:</strong> {{ latestQuizReport.previous_attempt_score }}
                </div>
                <div>
                  <strong>Attempt {{ latestQuizReport.attempt_number }}:</strong> {{ latestQuizReport.current_attempt_score }}
                </div>
              </div>

              <div v-if="latestQuizReport.ai_analysis" class="quiz-ai-analysis">
                <h4>🤖 AI Performance Analysis</h4>
                <p class="ai-source" v-if="latestQuizReport.ai_analysis.source">
                  Source: {{ latestQuizReport.ai_analysis.source === 'ai_model' ? 'Live AI model' : 'Rule-based fallback' }}
                </p>
                <p class="ai-summary">{{ latestQuizReport.ai_analysis.summary }}</p>

                <div class="ai-columns">
                  <div>
                    <h5>Strengths</h5>
                    <ul>
                      <li v-for="(item, idx) in latestQuizReport.ai_analysis.strengths" :key="`strength-${idx}`">{{ item }}</li>
                    </ul>
                  </div>
                  <div>
                    <h5>Weaknesses</h5>
                    <ul>
                      <li v-for="(item, idx) in latestQuizReport.ai_analysis.weaknesses" :key="`weak-${idx}`">{{ item }}</li>
                    </ul>
                  </div>
                  <div>
                    <h5>Suggestions</h5>
                    <ul>
                      <li v-for="(item, idx) in latestQuizReport.ai_analysis.suggestions" :key="`suggest-${idx}`">{{ item }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="question-review" v-if="latestQuizReport.question_feedback?.length">
                <h4>📝 Question-wise Review</h4>
                <div class="question-review-list">
                  <div
                    v-for="(item, idx) in latestQuizReport.question_feedback"
                    :key="`q-review-${item.question_id || idx}`"
                    class="question-review-item"
                    :class="item.is_correct ? 'correct' : 'wrong'"
                  >
                    <div class="qri-head">
                      <strong>Q{{ idx + 1 }}.</strong>
                      <span>{{ item.question }}</span>
                    </div>
                    <div class="qri-meta">
                      <span :class="item.is_correct ? 'badge-correct' : 'badge-wrong'">
                        {{ item.is_correct ? 'Correct' : 'Wrong' }}
                      </span>
                      <span>Your Answer: {{ item.selected_option || 'Not Attempted' }}</span>
                      <span>Correct Answer: {{ item.correct_option }}</span>
                    </div>
                    <div class="qri-exp" v-if="item.explanation">Explanation: {{ item.explanation }}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </template>

        <!-- ── QUIZZES & RESULTS ── -->
        <template v-if="activeSection === 'results'">
          <header class="content-header">
            <h1>🧠 Quizzes & Results</h1>
            <p class="breadcrumb">Home / Quizzes & Results</p>
          </header>

          <div class="card">
            <div class="card-head"><h3>📌 Assignments Overview</h3></div>
            <div class="test-summary-grid">
              <div class="test-sum-card t-blue">
                <div class="tsm-num">{{ practiceAssignments.length }}</div>
                <div class="tsm-label">Practice Assignments</div>
              </div>
              <div class="test-sum-card t-green">
                <div class="tsm-num">{{ practiceAverageScore }}%</div>
                <div class="tsm-label">Practice Avg Score</div>
              </div>
              <div class="test-sum-card t-purple">
                <div class="tsm-num">{{ gradedAssignments.length }}</div>
                <div class="tsm-label">Graded Assignments</div>
              </div>
              <div class="test-sum-card t-orange">
                <div class="tsm-num">{{ gradedAverageScore }}%</div>
                <div class="tsm-label">Graded Avg Score</div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>✅ Practice Assignments</h3></div>
            <div v-if="loadingQuizzes" class="table-skeleton-wrap">
              <div v-for="i in 4" :key="`practice-result-skeleton-${i}`" class="table-skeleton-row"></div>
            </div>
            <div v-else-if="filteredPracticeAssignments.length === 0" class="empty-msg">No practice assignments yet.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Status</th><th>Score</th><th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in filteredPracticeAssignments" :key="`practice-${quiz.id}`">
                    <td class="fw700" data-label="Title">{{ quiz.title }}</td>
                    <td data-label="Status">{{ quiz.status }}</td>
                    <td data-label="Score">{{ formatAssignmentScore(quiz, true) }}</td>
                    <td data-label="Submitted">{{ formatDate(quiz.student_submission?.submitted_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>🎯 Graded Assignments</h3></div>
            <div v-if="loadingQuizzes" class="table-skeleton-wrap">
              <div v-for="i in 4" :key="`graded-result-skeleton-${i}`" class="table-skeleton-row"></div>
            </div>
            <div v-else-if="filteredGradedAssignments.length === 0" class="empty-msg">No graded assignments yet.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Status</th><th>Score</th><th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in filteredGradedAssignments" :key="`graded-${quiz.id}`">
                    <td class="fw700" data-label="Title">{{ quiz.title }}</td>
                    <td data-label="Status">{{ quiz.status }}</td>
                    <td data-label="Score">{{ formatAssignmentScore(quiz, false) }}</td>
                    <td data-label="Submitted">{{ formatDate(quiz.student_submission?.submitted_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </template>

      </template>
    </main>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { studentService, type Student } from '@/services/student'
import { feeService, type FeePayment } from '@/services/fee'
import { paymentsService } from '@/services/payments'
import { batchResourcesService, type BatchResource } from '@/services/batchResources'
import { quizzesService, type Quiz, type QuizSubmissionReport } from '@/services/quizzes'
import apiClient from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const isDarkTheme = ref(false)

const activeSection = ref('overview')
const pageLoading = ref(false)
const pageError = ref<string | null>(null)
const studentProfile = ref<Student | null>(null)
const toasts = ref<Array<{ id: number; type: 'success' | 'error' | 'info'; message: string }>>([])
let toastIdSeq = 1

interface AttendanceRecord {
  id: number
  attendance_date: string
  status: string
  remarks: string | null
  batch?: { id: number; batch_name: string }
}
const attendanceRecords = ref<AttendanceRecord[]>([])
const loadingAttendance = ref(false)
const attendanceFilter = ref<'all' | 'present' | 'absent'>('all')
const attendanceSearchQuery = ref('')
const attendanceSortBy = ref<'date_desc' | 'date_asc'>('date_desc')
const attendanceCurrentPage = ref(1)
const attendancePageSize = 10


const feePayments = ref<FeePayment[]>([])
const loadingFees = ref(false)
const paying = ref(false)
const payAmountInput = ref('')
const payAmountError = ref<string | null>(null)
const feeSearchQuery = ref('')
const feeSortBy = ref<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc')
const feeCurrentPage = ref(1)
const feePageSize = 8
const batchResources = ref<BatchResource[]>([])
const loadingResources = ref(false)
const resourceError = ref<string | null>(null)
const selectedResource = ref<BatchResource | null>(null)
const resourceSearch = ref('')
const resourceFilter = ref('all')
const quizzes = ref<Quiz[]>([])
const loadingQuizzes = ref(false)
const quizError = ref<string | null>(null)
const quizStatusFilter = ref<'all' | 'published' | 'closed'>('all')
const quizAttemptFilter = ref<'all' | 'attempted' | 'not_attempted'>('all')
const quizSearchQuery = ref('')
const quizSortBy = ref<'recent' | 'title' | 'score_desc' | 'score_asc'>('recent')
const selectedQuiz = ref<Quiz | null>(null)
const quizAnswers = ref<Record<string, string>>({})
const submittingQuiz = ref(false)
const latestQuizReport = ref<QuizSubmissionReport | null>(null)
const quizCurrentIndex = ref(0)
const markedForReview = ref<Set<string>>(new Set())
const visitedQuestionKeys = ref<Set<string>>(new Set())
const examSecondsLeft = ref(0)
let examTimer: ReturnType<typeof setInterval> | null = null

function questionKeyFrom(q: any, index: number) {
  return q?.id != null ? String(q.id) : `idx_${index}`
}

const questionKeys = computed(() => (selectedQuiz.value?.questions || []).map((q: any, idx: number) => questionKeyFrom(q, idx)))

const currentQuestionKey = computed(() => {
  const keys = questionKeys.value
  return keys[quizCurrentIndex.value] || ''
})

const currentQuizQuestion = computed(() => {
  const questions = selectedQuiz.value?.questions || []
  return questions[quizCurrentIndex.value] || null
})

const canSubmitQuiz = computed(() => {
  if (!selectedQuiz.value || selectedQuiz.value.status !== 'published') return false
  if (selectedQuiz.value.mode === 'graded' && !!selectedQuiz.value.student_submission) return false
  return true
})

const unansweredCount = computed(() => questionKeys.value.filter((key) => !quizAnswers.value[key]).length)
const answeredCount = computed(() => questionKeys.value.filter((key) => !!quizAnswers.value[key]).length)
const notVisitedCount = computed(() => questionKeys.value.filter((key) => !visitedQuestionKeys.value.has(key)).length)
const notAnsweredCount = computed(() => questionKeys.value.filter((key) => visitedQuestionKeys.value.has(key) && !quizAnswers.value[key]).length)
const reviewCount = computed(() => markedForReview.value.size)

const showCorrectAnswers = computed(() =>
  selectedQuiz.value?.mode === 'graded' && selectedQuiz.value?.status === 'closed'
)
const showExplanations = computed(() =>
  showCorrectAnswers.value || (selectedQuiz.value?.mode === 'practice' && !!selectedQuiz.value?.student_submission)
)

declare global {
  interface Window {
    Razorpay?: any
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = computed(() => {
  const name = authStore.user?.full_name || ''
  return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
})
const firstName = computed(() => authStore.user?.full_name?.split(' ')[0] || 'Student')

// ── Fee ───────────────────────────────────────────────────────────────────────
const totalFee = computed(() => {
  if (!studentProfile.value?.batch) return 0
  const cost = parseFloat(String(studentProfile.value.batch.batch_cost ?? 0))
  const disc = Number(studentProfile.value.discount_percent) || 0
  return Math.round(cost - (cost * disc / 100))
})
const totalPaid = computed(() =>
  feePayments.value.reduce((s, p) => s + (Number(p.amount) || 0), 0)
)
const filteredFeePayments = computed(() => {
  const query = feeSearchQuery.value.trim().toLowerCase()

  let list = feePayments.value.filter((item) => {
    if (!query) return true
    const method = String(item.payment_method || '').toLowerCase()
    const refNo = String(item.reference_no || '').toLowerCase()
    const remarks = String(item.remarks || '').toLowerCase()
    return method.includes(query) || refNo.includes(query) || remarks.includes(query)
  })

  list = [...list].sort((a, b) => {
    if (feeSortBy.value === 'amount_desc') return Number(b.amount || 0) - Number(a.amount || 0)
    if (feeSortBy.value === 'amount_asc') return Number(a.amount || 0) - Number(b.amount || 0)

    const aDate = new Date(a.payment_date || '').getTime() || 0
    const bDate = new Date(b.payment_date || '').getTime() || 0
    return feeSortBy.value === 'date_asc' ? aDate - bDate : bDate - aDate
  })

  return list
})

const feeTotalPages = computed(() => Math.max(1, Math.ceil(filteredFeePayments.value.length / feePageSize)))
const paginatedFeePayments = computed(() => {
  const start = (feeCurrentPage.value - 1) * feePageSize
  return filteredFeePayments.value.slice(start, start + feePageSize)
})
const remainingFee = computed(() => Math.max(0, totalFee.value - totalPaid.value))
const feeFullyPaid = computed(() => totalFee.value > 0 && remainingFee.value === 0)
const feeProgress = computed(() => {
  if (totalFee.value === 0) return 0
  return Math.min(100, Math.round((totalPaid.value / totalFee.value) * 100))
})

const filteredResources = computed(() => {
  const q = resourceSearch.value.toLowerCase().trim()
  const type = resourceFilter.value
  return batchResources.value.filter((res) => {
    const matchesType = type === 'all' || res.resource_type === type
    const matchesQuery = !q || res.title.toLowerCase().includes(q) || (res.description || '').toLowerCase().includes(q)
    return matchesType && matchesQuery
  })
})

const filteredQuizzes = computed(() => {
  const query = quizSearchQuery.value.trim().toLowerCase()

  let list = quizzes.value.filter((quiz) => {
    if (query && !String(quiz.title || '').toLowerCase().includes(query)) return false
    if (quizStatusFilter.value !== 'all' && quiz.status !== quizStatusFilter.value) return false

    if (quizAttemptFilter.value === 'attempted' && !isQuizAttempted(quiz)) return false
    if (quizAttemptFilter.value === 'not_attempted' && isQuizAttempted(quiz)) return false

    return true
  })

  list = [...list].sort((a, b) => {
    if (quizSortBy.value === 'title') return String(a.title || '').localeCompare(String(b.title || ''))

    const aScore = Number(a.student_submission?.score ?? -1)
    const bScore = Number(b.student_submission?.score ?? -1)
    if (quizSortBy.value === 'score_desc') return bScore - aScore
    if (quizSortBy.value === 'score_asc') return aScore - bScore

    const aCreated = new Date(a.created_at || '').getTime() || 0
    const bCreated = new Date(b.created_at || '').getTime() || 0
    return bCreated - aCreated
  })

  return list
})

const filteredPracticeAssignments = computed(() => filteredQuizzes.value.filter((q) => q.mode === 'practice'))
const filteredGradedAssignments = computed(() => filteredQuizzes.value.filter((q) => q.mode === 'graded'))

watch(remainingFee, (val) => {
  const current = Number(payAmountInput.value || 0)
  if (!payAmountInput.value || current > val) {
    payAmountInput.value = val ? String(val) : ''
  }
})

function resolvePayAmount() {
  const raw = Number(payAmountInput.value)
  if (Number.isNaN(raw) || raw <= 0) {
    return remainingFee.value
  }
  return raw
}

function validatePayAmount(amount: number) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  if (amount > remainingFee.value) {
    throw new Error('Amount cannot exceed remaining fee')
  }
}

async function payRemainingFee() {
  if (!studentProfile.value || remainingFee.value <= 0) return

  paying.value = true
  payAmountError.value = null
  try {
    const amount = resolvePayAmount()
    validatePayAmount(amount)
    const res: any = await paymentsService.createRazorpayOrder(studentProfile.value.id, amount)
  const order = res?.data?.data?.order ?? res?.data?.order ?? res?.order
  const razorpayKeyId = res?.data?.data?.key_id ?? res?.data?.key_id ?? import.meta.env.VITE_RAZORPAY_KEY_ID

    if (!order) {
      throw new Error('Failed to create payment order')
    }

    if (!window.Razorpay) {
      showToast('error', 'Payment SDK not loaded')
      return
    }

    if (!razorpayKeyId) {
      throw new Error('Razorpay key is not configured')
    }

    const options = {
      key: razorpayKeyId,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'Tardigrade Coaching',
      description: 'Fee payment',
      order_id: order.id,
      prefill: {
        name: authStore.user?.full_name,
        email: authStore.user?.email,
      },
      notes: {
        student_id: String(studentProfile.value.id),
      },
      handler: async (response: any) => {
        try {
          await paymentsService.verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            student_id: studentProfile.value!.id,
            amount,
          })
          await loadFeePayments()
        } catch (err) {
          console.error('Verification failed', err)
          showToast('error', 'Payment succeeded but verification failed. Please contact support.')
        }
      },
      theme: {
        color: '#3b82f6',
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (response: any) => {
      const reason = response?.error?.description || response?.error?.reason || 'Payment failed'
      showToast('error', reason)
    })
    rzp.open()
  } catch (err) {
    console.error('Failed to start payment', err)
    const message = (err as any)?.response?.data?.message
      ?? (err as Error)?.message
      ?? 'Failed to start payment. Please try again.'
    payAmountError.value = message
    showToast('error', message)
  } finally {
    paying.value = false
  }
}

// ── Attendance ────────────────────────────────────────────────────────────────
const presentCount = computed(() => attendanceRecords.value.filter(r => r.status === 'present').length)
const absentCount = computed(() => attendanceRecords.value.filter(r => r.status !== 'present').length)
const totalAttendance = computed(() => attendanceRecords.value.length)
const attendanceRate = computed(() => {
  if (totalAttendance.value === 0) return 0
  return Math.round((presentCount.value / totalAttendance.value) * 100)
})
const filteredAttendance = computed(() => {
  const query = attendanceSearchQuery.value.trim().toLowerCase()

  let list = attendanceRecords.value.filter((record) => {
    const statusMatch =
      attendanceFilter.value === 'all' ||
      (attendanceFilter.value === 'present' ? record.status === 'present' : record.status !== 'present')

    if (!statusMatch) return false
    if (!query) return true

    const dateText = formatDate(record.attendance_date).toLowerCase()
    const remarks = String(record.remarks || '').toLowerCase()
    const batch = String(record.batch?.batch_name || '').toLowerCase()
    return dateText.includes(query) || remarks.includes(query) || batch.includes(query)
  })

  list = [...list].sort((a, b) => {
    const aDate = new Date(a.attendance_date || '').getTime() || 0
    const bDate = new Date(b.attendance_date || '').getTime() || 0
    return attendanceSortBy.value === 'date_asc' ? aDate - bDate : bDate - aDate
  })

  return list
})

const attendanceTotalPages = computed(() => Math.max(1, Math.ceil(filteredAttendance.value.length / attendancePageSize)))
const paginatedAttendance = computed(() => {
  const start = (attendanceCurrentPage.value - 1) * attendancePageSize
  return filteredAttendance.value.slice(start, start + attendancePageSize)
})

// ── Assignments (Quizzes) ────────────────────────────────────────────────────
const practiceAssignments = computed(() => quizzes.value.filter((q) => q.mode === 'practice'))
const gradedAssignments = computed(() => quizzes.value.filter((q) => q.mode === 'graded'))
const practiceAverageScore = computed(() => {
  const scores = practiceAssignments.value
    .map((q) => assignmentScorePercent(q))
    .filter((s): s is number => s !== null)
  if (!scores.length) return 0
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
})
const gradedAverageScore = computed(() => {
  const scores = gradedAssignments.value
    .filter((q) => q.status === 'closed')
    .map((q) => assignmentScorePercent(q))
    .filter((s): s is number => s !== null)
  if (!scores.length) return 0
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
})
const completedAssignments = computed(() =>
  quizzes.value.filter((q) => q.student_submission && q.student_submission.score !== null && q.student_submission.score !== undefined).length
)
const overallAssignmentAverage = computed(() => {
  const scores = quizzes.value
    .map((q) => assignmentScorePercent(q))
    .filter((s): s is number => s !== null)
  if (!scores.length) return 0
  return Math.round(scores.reduce((s, v) => s + v, 0) / scores.length)
})
const recentQuizResults = computed(() => {
  const submitted = quizzes.value.filter((q) => q.student_submission?.submitted_at)
  return [...submitted]
    .sort((a, b) => String(b.student_submission?.submitted_at || '').localeCompare(String(a.student_submission?.submitted_at || '')))
    .slice(0, 5)
})

function monthBucketFromDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  if (!year || !month) return monthKey
  return new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'short' })
}

const lastSixMonthKeys = computed(() => {
  const now = new Date()
  const buckets: string[] = []
  for (let i = 5; i >= 0; i -= 1) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1)
    buckets.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`)
  }
  return buckets
})

const quizTrendData = computed(() => {
  const aggregate = new Map<string, { totalPercent: number; count: number }>()

  quizzes.value.forEach((quiz) => {
    const submission = quiz.student_submission
    if (!submission?.submitted_at) return
    if (submission.score === null || submission.score === undefined) return

    const key = monthBucketFromDate(submission.submitted_at)
    if (!key) return

    const totalMarks = Number(quiz.total_marks || 100)
    if (!totalMarks) return
    const percent = Math.round((Number(submission.score) / totalMarks) * 100)

    const item = aggregate.get(key) || { totalPercent: 0, count: 0 }
    item.totalPercent += percent
    item.count += 1
    aggregate.set(key, item)
  })

  return lastSixMonthKeys.value.map((key) => {
    const item = aggregate.get(key)
    const value = item && item.count > 0 ? Math.round(item.totalPercent / item.count) : 0
    return {
      monthKey: key,
      label: monthLabel(key),
      value,
    }
  })
})

const quizTrendInsights = computed(() => {
  const points = quizTrendData.value
  const latest = points[points.length - 1] || { label: 'N/A', value: 0 }

  const best = points.reduce(
    (max, item) => (item.value > max.value ? item : max),
    points[0] || { label: 'N/A', value: 0 }
  )

  const prev = points[points.length - 2]
  const delta = prev ? latest.value - prev.value : 0

  return { latest, best, delta }
})

function assignmentScorePercent(quiz: Quiz) {
  const score = quiz.student_submission?.score
  if (score === null || score === undefined) return null
  const total = quiz.total_marks ?? 100
  if (!total) return null
  return Math.round((Number(score) / Number(total)) * 100)
}
function formatAssignmentScore(quiz: Quiz, showWhenOpen: boolean) {
  const score = quiz.student_submission?.score
  if (quiz.mode === 'graded' && !showWhenOpen && quiz.status !== 'closed') {
    return 'Awaiting closure'
  }
  if (score === null || score === undefined) return 'Not submitted'
  const total = quiz.total_marks ?? 100
  return `${Math.round(Number(score))} / ${total}`
}

// ── Data Fetching ─────────────────────────────────────────────────────────────
async function loadStudentProfile() {
  const res = await studentService.getMe()
  studentProfile.value = res.data.student
}

async function loadFeePayments() {
  if (!studentProfile.value) return
  loadingFees.value = true
  try {
    const res: any = await feeService.list(1, 500, studentProfile.value.id)
    console.log('Fee API response:', JSON.stringify(res.data, null, 2))
    // Response structure: { data: { success, message, data: { fee_payments: [] } } }
    const raw = res?.data?.data?.fee_payments ?? res?.data?.fee_payments ?? []
    console.log('Parsed fee payments:', raw)
    feePayments.value = raw
  } catch (e) { 
    console.error('Failed to load fees', e)
  }
  finally { loadingFees.value = false }
}

async function loadBatchResources() {
  if (!studentProfile.value?.batch_id) return
  loadingResources.value = true
  resourceError.value = null
  try {
    const res: any = await batchResourcesService.list(studentProfile.value.batch_id)
    const list = res?.data?.data?.resources ?? res?.data?.resources ?? []
    batchResources.value = [...list].sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''))
    selectedResource.value = batchResources.value[0] || null
  } catch (err: any) {
    resourceError.value = err?.response?.data?.message || 'Failed to load resources'
  } finally {
    loadingResources.value = false
  }
}

async function loadQuizzes() {
  if (!studentProfile.value?.batch_id) return
  loadingQuizzes.value = true
  quizError.value = null
  try {
    const res: any = await quizzesService.list(studentProfile.value.batch_id)
    quizzes.value = res?.data?.data?.quizzes ?? res?.data?.quizzes ?? []
  } catch (err: any) {
    quizError.value = err?.response?.data?.message || 'Failed to load quizzes'
  } finally {
    loadingQuizzes.value = false
  }
}

async function loadAttendance() {
  if (!studentProfile.value) return
  loadingAttendance.value = true
  try {
    const res = await apiClient.get('/attendance', {
      params: { student_id: studentProfile.value.id, per_page: 500 }
    })
    const data = res.data?.data ?? res.data
    attendanceRecords.value = data?.attendance ?? []
  } catch (e) { console.error('Failed to load attendance', e) }
  finally { loadingAttendance.value = false }
}


async function loadAll() {
  pageLoading.value = true
  pageError.value = null
  try {
    await loadStudentProfile()
  await Promise.all([loadFeePayments(), loadAttendance(), loadBatchResources(), loadQuizzes()])
  } catch (err: any) {
    pageError.value = err?.response?.data?.message ?? 'Failed to load dashboard data'
  } finally {
    pageLoading.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
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

function getGenericEmbedUrl(url: string) {
  if (!url) return ''
  return url.startsWith('http://') || url.startsWith('https://') ? url : ''
}

function applyTheme(dark: boolean) {
  const root = document.documentElement
  if (dark) {
    root.setAttribute('data-theme', 'dark')
  } else {
    root.removeAttribute('data-theme')
  }
  isDarkTheme.value = dark
  localStorage.setItem('tardigrade-theme', dark ? 'dark' : 'light')
}

function initializeTheme() {
  const stored = localStorage.getItem('tardigrade-theme')
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

async function openQuiz(quiz: Quiz) {
  if (quiz.mode === 'graded' && quiz.status === 'published' && isQuizAttempted(quiz)) {
    showToast('info', 'Already attempted. Graded quiz can only be attempted once.')
    return
  }

  try {
    const res: any = await quizzesService.get(quiz.id)
    const full = res?.data?.data?.quiz ?? res?.data?.quiz ?? quiz
    const normalizedQuestions = (full.questions || []).map((q: any) => ({
      ...q,
      question: q.question_text || q.question,
      options: q.options || [],
      correct_option: q.correct_option,
      student_answer: q.student_answer,
      explanation: q.explanation,
    }))
    selectedQuiz.value = { ...full, questions: normalizedQuestions }
    const storageKey = `student-quiz-answers-${full.id}`
    const savedAnswers = localStorage.getItem(storageKey)
    quizAnswers.value = savedAnswers ? JSON.parse(savedAnswers) : {}
    quizCurrentIndex.value = 0
    markedForReview.value = new Set<string>()
    visitedQuestionKeys.value = new Set<string>()
    latestQuizReport.value = null
    startExamTimer()
    markCurrentQuestionVisited()
    activeSection.value = 'exam'
  } catch (err: any) {
    quizError.value = err?.response?.data?.message || 'Failed to load quiz'
    showToast('error', quizError.value || 'Failed to load quiz')
  }
}

function startExamTimer() {
  if (!selectedQuiz.value) return
  stopExamTimer()
  const totalQuestions = selectedQuiz.value.questions?.length || 1
  examSecondsLeft.value = totalQuestions * 90
  if (!canSubmitQuiz.value) return
  examTimer = setInterval(() => {
    if (examSecondsLeft.value <= 0) {
      stopExamTimer()
      submitQuiz()
      return
    }
    examSecondsLeft.value -= 1
  }, 1000)
}

function stopExamTimer() {
  if (examTimer) {
    clearInterval(examTimer)
    examTimer = null
  }
}

function exitExam() {
  stopExamTimer()
  if (selectedQuiz.value?.id) {
    localStorage.removeItem(`student-quiz-answers-${selectedQuiz.value.id}`)
  }
  activeSection.value = 'quizzes'
  selectedQuiz.value = null
  quizAnswers.value = {}
  latestQuizReport.value = null
  quizCurrentIndex.value = 0
  markedForReview.value = new Set<string>()
  visitedQuestionKeys.value = new Set<string>()
}

function formatExamTimer(seconds: number) {
  const safe = Math.max(0, Number(seconds || 0))
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function jumpToQuestion(index: number) {
  quizCurrentIndex.value = index
  markCurrentQuestionVisited()
}

function nextQuestion() {
  const maxIndex = (selectedQuiz.value?.questions?.length || 1) - 1
  quizCurrentIndex.value = Math.min(maxIndex, quizCurrentIndex.value + 1)
  markCurrentQuestionVisited()
}

function prevQuestion() {
  quizCurrentIndex.value = Math.max(0, quizCurrentIndex.value - 1)
  markCurrentQuestionVisited()
}

function toggleMarkForReview(questionId?: string) {
  const key = questionId || currentQuestionKey.value
  if (!key) return
  const next = new Set(markedForReview.value)
  if (next.has(key)) {
    next.delete(key)
  } else {
    next.add(key)
  }
  markedForReview.value = next
}

function clearCurrentAnswer() {
  const key = currentQuestionKey.value
  if (!key) return
  const next = { ...quizAnswers.value }
  delete next[key]
  quizAnswers.value = next
}

function questionStatusClass(index: number) {
  const question = selectedQuiz.value?.questions?.[index]
  if (!question) return 'not-visited'
  const questionId = questionKeyFrom(question, index)
  const classes: string[] = []
  if (index === quizCurrentIndex.value) classes.push('current')
  if (markedForReview.value.has(questionId)) {
    classes.push('review')
  } else if (quizAnswers.value[questionId]) {
    classes.push('answered')
  } else if (visitedQuestionKeys.value.has(questionId)) {
    classes.push('not-answered')
  } else {
    classes.push('not-visited')
  }
  return classes.join(' ')
}

function questionOptionClass(question: any, optionIndex: number) {
  if (!latestQuizReport.value || !question?.id) return ''
  const feedback = latestQuizReport.value.question_feedback?.find((f) => Number(f.question_id) === Number(question.id))
  if (!feedback) return ''
  const optionLabel = ['A', 'B', 'C', 'D'][optionIndex]
  if (feedback.correct_option === optionLabel) return 'option-correct'
  if (feedback.selected_option === optionLabel && feedback.selected_option !== feedback.correct_option) return 'option-wrong'
  return ''
}

function markCurrentQuestionVisited() {
  const key = currentQuestionKey.value
  if (!key) return
  if (visitedQuestionKeys.value.has(key)) return
  const next = new Set(visitedQuestionKeys.value)
  next.add(key)
  visitedQuestionKeys.value = next
}

function formatQuizScore(quiz: Quiz) {
  const score = quiz.student_submission?.score
  if (score === null || score === undefined) return 'Not submitted'
  const total = quiz.total_marks ?? 100
  return `${Math.round(Number(score))} / ${total}`
}

function isQuizAttempted(quiz: Quiz) {
  const submission = quiz.student_submission
  if (!submission) return false
  const status = String(submission.status || '').toLowerCase()
  return status !== 'auto_zero'
}

function marksForAttemptedQuiz(quiz: Quiz) {
  if (!isQuizAttempted(quiz)) return '—'
  const score = quiz.student_submission?.score
  if (score === null || score === undefined) return 'Pending'
  const total = quiz.total_marks ?? 100
  return `${Math.round(Number(score))} / ${total}`
}

function formatStudentAnswer(answer?: string | null) {
  return answer ? answer : 'Not submitted'
}

async function submitQuiz() {
  if (!selectedQuiz.value) return
  if (!canSubmitQuiz.value) return
  submittingQuiz.value = true
  try {
    const answers = (selectedQuiz.value.questions || []).map((q: any, idx: number) => ({
      question_id: Number(q.id),
      selected_option: String(quizAnswers.value[questionKeyFrom(q, idx)] || ''),
    }))
    const res: any = await quizzesService.submit(selectedQuiz.value.id, answers)
    latestQuizReport.value = res?.data?.data?.report ?? res?.data?.report ?? null
    stopExamTimer()
    localStorage.removeItem(`student-quiz-answers-${selectedQuiz.value.id}`)
    await loadQuizzes()
    showToast('success', 'Quiz submitted')
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Failed to submit quiz'
    showToast('error', message)
  } finally {
    submittingQuiz.value = false
  }
}

function resourceIcon(type: string | null | undefined) {
  const map: Record<string, string> = {
    youtube: '▶️',
    article: '📰',
    link: '🔗',
    tool: '🧰',
  }
  return map[(type || '').toLowerCase()] || '📌'
}

function dismissToast(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

function showToast(type: 'success' | 'error' | 'info', message: string) {
  const id = toastIdSeq++
  toasts.value = [...toasts.value, { id, type, message }]
  window.setTimeout(() => dismissToast(id), 3500)
}

watch([feeSearchQuery, feeSortBy], () => {
  feeCurrentPage.value = 1
})

watch(filteredFeePayments, () => {
  if (feeCurrentPage.value > feeTotalPages.value) feeCurrentPage.value = feeTotalPages.value
})

watch([attendanceSearchQuery, attendanceFilter, attendanceSortBy], () => {
  attendanceCurrentPage.value = 1
})

watch(filteredAttendance, () => {
  if (attendanceCurrentPage.value > attendanceTotalPages.value) {
    attendanceCurrentPage.value = attendanceTotalPages.value
  }
})

watch(
  quizAnswers,
  (value) => {
    if (activeSection.value !== 'exam' || !selectedQuiz.value?.id) return
    localStorage.setItem(`student-quiz-answers-${selectedQuiz.value.id}`, JSON.stringify(value))
  },
  { deep: true }
)

onMounted(() => {
  initializeTheme()
  loadAll()
})
onUnmounted(() => stopExamTimer())
</script>

<style scoped>
/* Student accent */
.nav-item.active {
  border-left-color: var(--accent-student);
}

.avatar {
  width: 64px; height: 64px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-student), #38f9d7);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px; font-weight: 800; color: #1e1b4b; margin: 0 auto 12px;
}

.sidebar-header h2 {
  margin: 0 0 6px;
  color: var(--sidebar-text-active);
  font-size: 16px;
  font-weight: 700;
}
.role-badge { display: inline-block; padding: 3px 12px; background: rgba(52,211,153,0.15); color: var(--accent-student); border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: uppercase; }

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

.toast-stack {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1200;
  display: grid;
  gap: 8px;
  max-width: min(92vw, 360px);
}

.toast-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border-radius: 10px;
  padding: 10px 12px;
  color: #fff;
  box-shadow: var(--shadow-md);
  font-size: 13px;
}

.toast-success { background: #15803d; }
.toast-error { background: #b91c1c; }
.toast-info { background: #1d4ed8; }

.toast-close {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.profile-controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 12px;
}

.quiz-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 6px;
}

.quiz-explanation {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  color: var(--text-primary);
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}

.table-skeleton-wrap {
  display: grid;
  gap: 10px;
  padding: 8px 0;
}

.table-skeleton-row {
  height: 46px;
  border-radius: 10px;
  border: 1px solid var(--border-light);
  background: linear-gradient(100deg, #f4f7fb 25%, #e8eef7 50%, #f4f7fb 75%);
  background-size: 220% 100%;
  animation: studentShimmer 1.2s ease infinite;
}

@keyframes studentShimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}

.student-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.student-toolbar .search-input {
  min-width: min(100%, 300px);
}

.attend-controls,
.quiz-filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.quiz-search {
  min-width: min(100%, 220px);
}

.attend-controls .search-input {
  min-width: min(100%, 260px);
}

.resource-fallback-note {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.dashboard-container.exam-active {
  grid-template-columns: 1fr;
}

.main-content.exam-content {
  max-width: 100%;
  padding: 0;
}

.exam-screen {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 18px;
}

.exam-screen-header {
  display: grid;
  grid-template-columns: 1.4fr 1fr auto;
  gap: 12px;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 12px 14px;
  margin-bottom: 14px;
}

.exam-head-left h2 {
  margin: 0;
  font-size: 18px;
}

.exam-head-left p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 12px;
  text-transform: capitalize;
}

.exam-head-center {
  font-size: 12px;
  color: var(--text-secondary);
}

.exam-head-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exam-qmeta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 10px;
}

.exam-qmeta span {
  font-size: 12px;
  color: var(--text-muted);
}

.exam-timer {
  font-weight: 700;
  color: var(--brand-primary);
  background: var(--bg-muted);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
}

.exam-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 14px;
}

.exam-question-panel {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  padding: 14px;
}

.exam-actions-row {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.exam-nav-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
}

.exam-sidebar {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  padding: 12px;
  height: fit-content;
}

.exam-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 10px;
}

.exam-stat {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-muted);
  text-align: center;
  padding: 8px 4px;
}

.exam-stat strong {
  display: block;
  font-size: 16px;
  color: var(--text-primary);
}

.exam-stat span {
  font-size: 11px;
  color: var(--text-muted);
}

.exam-sidebar h4 {
  margin: 0 0 10px;
  font-size: 14px;
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
}

.palette-btn {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-muted);
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
}

.palette-btn.current {
  box-shadow: inset 0 0 0 2px #1f2937;
}

.palette-btn.answered {
  background: #22c55e;
  border-color: #16a34a;
  color: #fff;
}

.palette-btn.not-answered {
  background: #ef4444;
  border-color: #dc2626;
  color: #fff;
}

.palette-btn.review {
  background: #8b5cf6;
  border-color: #7c3aed;
  color: #fff;
}

.palette-btn.not-visited {
  background: #9ca3af;
  border-color: #6b7280;
  color: #fff;
}

.palette-legend {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
}

.dot-current { background: var(--brand-primary); }
.dot-answered { background: #22c55e; }
.dot-not-answered { background: #ef4444; }
.dot-review { background: #8b5cf6; }
.dot-not-visited { background: #9ca3af; }

.option-correct {
  background: rgba(34, 197, 94, 0.18);
  border: 1px solid rgba(34, 197, 94, 0.45);
  border-radius: 6px;
  padding: 4px 6px;
}

.option-wrong {
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.45);
  border-radius: 6px;
  padding: 4px 6px;
}

.question-review {
  margin-top: 14px;
}

.question-review h4 {
  margin-bottom: 8px;
}

.question-review-list {
  display: grid;
  gap: 10px;
}

.question-review-item {
  border: 1px solid var(--border-light);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  padding: 10px;
}

.question-review-item.correct {
  border-left: 4px solid var(--color-success);
}

.question-review-item.wrong {
  border-left: 4px solid var(--color-danger);
}

.qri-head {
  display: flex;
  gap: 6px;
  margin-bottom: 6px;
  color: var(--text-primary);
}

.qri-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.badge-correct,
.badge-wrong {
  border-radius: 999px;
  font-weight: 700;
  padding: 2px 8px;
}

.badge-correct {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge-wrong {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.qri-exp {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

[data-theme='dark'] .quiz-question,
[data-theme='dark'] .portal-row,
[data-theme='dark'] .portal-detail {
  background: var(--bg-card);
  border-color: var(--border-light);
  color: var(--text-primary);
}

[data-theme='dark'] .palette-btn.current {
  box-shadow: inset 0 0 0 2px #e2e8f0;
}

@media (max-width: 900px) {
  .exam-screen-header {
    grid-template-columns: 1fr;
  }

  .exam-head-right {
    flex-wrap: wrap;
  }

  .exam-layout {
    grid-template-columns: 1fr;
  }

  .exam-nav-actions {
    flex-wrap: wrap;
  }
}

.quiz-report-card {
  margin-top: 16px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 14px;
  background: var(--bg-muted);
}

.quiz-report-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
  font-size: 13px;
}

.quiz-ai-analysis h4 {
  margin: 8px 0;
}

.ai-summary {
  margin: 0 0 8px;
  color: var(--text-secondary);
}

.ai-source {
  margin: 0 0 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.ai-columns {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.ai-columns h5 {
  margin: 0 0 6px;
  font-size: 13px;
}

.ai-columns ul {
  margin: 0;
  padding-left: 16px;
  font-size: 12px;
  color: var(--text-secondary);
}

/* Page loading/error overrides */
.error-icon { font-size: 48px; }
.page-error h2 { margin: 0; color: var(--color-danger); }

/* ── Stat Cards (uses shared, plus overrides) ── */
.stat-card { border-top: 4px solid var(--border-light); border-left: none; }
.stat-card.green { border-top-color: var(--color-success); }
.stat-card.blue  { border-top-color: var(--color-info); }
.stat-card.purple{ border-top-color: var(--brand-primary); }
.stat-card.orange{ border-top-color: var(--color-warning); }
.stat-sub { font-size: 12px; color: var(--text-muted); }

/* ── Card (uses shared) ── */
.card-title { margin: 0 0 20px; font-size: var(--font-size-md); font-weight: 700; color: var(--text-primary); }

/* ── Overview Grid ── */
.overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }

.trend-card {
  margin-top: 22px;
}

.trend-note {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 600;
}

.trend-insights {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.trend-insight-chip {
  border: 1px solid var(--border-light);
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.trend-insight-chip strong {
  color: var(--text-primary);
}

.trend-insight-chip.up {
  border-color: rgba(34, 197, 94, 0.35);
  background: var(--color-success-light);
}

.trend-insight-chip.down {
  border-color: rgba(239, 68, 68, 0.35);
  background: var(--color-danger-light);
}

.trend-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.trend-panel {
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 12px;
  background: var(--bg-card);
}

.trend-panel h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--text-primary);
}

.trend-bars {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.trend-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.trend-track {
  position: relative;
  width: 100%;
  min-height: 90px;
  height: 90px;
  border-radius: 8px;
  background: var(--bg-muted);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.trend-fill {
  position: relative;
  z-index: 2;
  width: 100%;
  border-radius: 8px 8px 0 0;
  min-height: 4px;
  background: linear-gradient(0deg, #ef4444 0%, #f59e0b 55%, #22c55e 100%);
}

.trend-target-line {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 75%;
  border-top: 1px dashed rgba(31, 41, 55, 0.35);
  z-index: 1;
}

.trend-label {
  font-size: 11px;
  color: var(--text-secondary);
}

.trend-value {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
}

/* Attendance mini */
.attendance-mini-list { display: flex; flex-direction: column; gap: 6px; }
.attend-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.attend-row:last-child { border-bottom: none; }
.attend-date { font-size: 13px; color: var(--text-secondary); }
.attend-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.attend-badge.present { background: var(--color-success-light); color: var(--color-success); }
.attend-badge.absent  { background: var(--color-danger-light); color: var(--color-danger); }

/* Test mini */
.test-mini-list { display: flex; flex-direction: column; gap: 10px; }
.test-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
.test-row:last-child { border-bottom: none; }
.test-title { font-size: var(--font-size-base); font-weight: 600; color: var(--text-primary); }
.test-subject { font-size: 12px; color: var(--text-muted); }
.test-score-pill { font-size: 13px; font-weight: 700; white-space: nowrap; }
.pct { font-size: 11px; margin-left: 4px; }

/* Fee mini */
.fee-mini-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
.fee-mini-item { background: var(--bg-muted); border-radius: 8px; padding: 12px; text-align: center; }
.fee-mini-item.fee-green  { background: var(--color-success-light); }
.fee-mini-item.fee-orange { background: var(--color-warning-light); }
.fee-mini-item label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; font-weight: 600; }
.fee-val { font-size: 17px; font-weight: 700; color: var(--text-primary); }

/* Batch mini */
.batch-mini { text-align: center; padding: 16px 0; }
.batch-name { font-size: 22px; font-weight: 800; color: var(--text-primary); }
.batch-year { font-size: 14px; color: var(--text-muted); margin-top: 4px; }

/* Progress */
.progress-bar-wrap { display: flex; flex-direction: column; gap: 4px; }
.progress-track { width: 100%; height: 10px; background: var(--bg-muted); border-radius: 5px; overflow: hidden; }
.progress-track.large { height: 14px; border-radius: 7px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-success), #38f9d7); border-radius: inherit; transition: width 0.5s ease; }
.progress-fill.red-fill { background: linear-gradient(90deg, #fc8181, var(--color-danger)); }
.progress-label { font-size: 12px; color: var(--text-muted); text-align: right; }
.prog-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; color: var(--text-secondary); font-weight: 500; }
.prog-pct { font-weight: 700; }
.prog-pct.pct-green { color: var(--color-success); }
.prog-pct.pct-red   { color: var(--color-danger); }
.prog-hint { margin: 8px 0 0; font-size: 13px; font-weight: 600; }
.prog-hint.hint-green { color: var(--color-success); }
.prog-hint.hint-red   { color: var(--color-danger); }

/* Profile */
.profile-avatar-row { display: flex; align-items: center; gap: 20px; }
.avatar-lg { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-student), #38f9d7); display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 800; color: #1e1b4b; flex-shrink: 0; }
.profile-email { margin: 0 0 8px; color: var(--text-muted); font-size: 14px; }
.role-pill { display: inline-block; padding: 3px 12px; background: var(--color-info-light); color: var(--color-info); border-radius: 20px; font-size: 12px; font-weight: 700; }
.section-divider { height: 1px; background: var(--border-light); margin: 20px 0; }
.sub-heading { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: var(--text-secondary); }
.parents-row { display: flex; flex-wrap: wrap; gap: 12px; }
.parent-chip { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 10px; }
.parent-chip > span { font-size: 22px; }
.chip-name  { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.chip-email { font-size: 12px; color: var(--text-muted); }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
.info-item span { font-size: 15px; color: var(--text-primary); }

/* Batch detail */
.batch-header-row { display: flex; justify-content: space-between; align-items: flex-start; }
.year-badge { padding: 4px 14px; background: var(--color-info-light); color: var(--color-info); border-radius: 20px; font-size: 13px; font-weight: 700; }
.batch-cost-pill { display: flex; flex-direction: column; align-items: flex-end; background: var(--color-success-light); border: 1px solid rgba(34, 197, 94, 0.45); border-radius: 10px; padding: 10px 16px; }
.cost-value { font-size: 22px; font-weight: 800; color: var(--color-success); }
.cost-label  { font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-top: 2px; }

/* Fee Overview */
.fee-overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; align-items: start; }
.fee-ov-card { border-radius: 14px; padding: 22px; text-align: center; color: white; box-shadow: 0 2px 12px rgba(0,0,0,0.1); align-self: start; }
.fee-ov-card.blue   { background: linear-gradient(135deg,#4facfe,#00f2fe); }
.fee-ov-card.green  { background: linear-gradient(135deg,#43e97b,#38f9d7); }
.fee-ov-card.orange { background: linear-gradient(135deg,#f59e0b,#f97316); }
.fov-label { font-size: 12px; font-weight: 700; text-transform: uppercase; opacity: 0.85; margin-bottom: 8px; }
.fov-value { font-size: 28px; font-weight: 800; margin-bottom: 6px; }
.fov-sub   { font-size: 12px; opacity: 0.85; }
.pay-input { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.pay-label { font-size: 11px; text-transform: uppercase; opacity: 0.9; font-weight: 700; }
.pay-input input {
  padding: 8px 10px;
  border-radius: 8px;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.9);
  color: #1f2937;
  font-weight: 600;
}
.pay-quick { display: flex; gap: 8px; flex-wrap: wrap; }
.pay-error { font-size: 12px; font-weight: 600; color: #fde68a; margin: 0; }

/* Attendance Summary */
.attend-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 20px; margin-bottom: 24px; }
.attend-sum-card { border-radius: 14px; padding: 22px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.attend-sum-card.a-green  { background: linear-gradient(135deg,#f0fff4,#c6f6d5); border: 1px solid #9ae6b4; }
.attend-sum-card.a-red    { background: linear-gradient(135deg,#fff5f5,#fed7d7); border: 1px solid #fc8181; }
.attend-sum-card.a-blue   { background: linear-gradient(135deg,#ebf8ff,#bee3f8); border: 1px solid #90cdf4; }
.attend-sum-card.a-purple { background: linear-gradient(135deg,#faf5ff,#e9d8fd); border: 1px solid #d6bcfa; }
.asm-num   { font-size: 32px; font-weight: 800; color: var(--text-primary); }
.asm-label { font-size: 13px; color: var(--text-muted); font-weight: 600; margin-top: 4px; }
.filter-select { padding: 6px 10px; border: 1px solid var(--border-light); border-radius: 6px; font-size: 13px; background: var(--bg-input); color: var(--text-secondary); cursor: pointer; }

/* Test Summary */
.test-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px,1fr)); gap: 20px; margin-bottom: 24px; }
.test-sum-card { border-radius: 14px; padding: 22px; text-align: center; color: white; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
.test-sum-card.t-blue   { background: linear-gradient(135deg,#4facfe,#00f2fe); }
.test-sum-card.t-green  { background: linear-gradient(135deg,#43e97b,#38f9d7); }
.test-sum-card.t-purple { background: linear-gradient(135deg,#a855f7,#7c3aed); }
.test-sum-card.t-orange { background: linear-gradient(135deg,#f59e0b,#f97316); }
.tsm-num   { font-size: 32px; font-weight: 800; }
.tsm-label { font-size: 12px; opacity: 0.9; font-weight: 700; margin-top: 4px; text-transform: uppercase; }

/* Score chip */
.score-chip { padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; }
.score-chip.score-high { background: var(--color-success-light); color: var(--color-success); }
.score-chip.score-mid  { background: var(--color-warning-light); color: var(--color-warning); }
.score-chip.score-low  { background: var(--color-danger-light); color: var(--color-danger); }

/* Table (uses shared, overrides removed) */

/* Badge */
.blue-badge { background: var(--color-info-light); color: var(--color-info); }

/* Batch portal */
.portal-layout { display: grid; grid-template-columns: minmax(220px, 1fr) 2fr; gap: 16px; }
.portal-list { display: flex; flex-direction: column; gap: 10px; }
.portal-row {
  border: 1px solid var(--border-light); border-radius: 10px; padding: 12px;
  background: var(--bg-muted); display: flex; justify-content: space-between; align-items: center;
  gap: 10px; cursor: pointer; text-align: left;
}
.portal-row p { margin: 4px 0 0; font-size: 12px; color: var(--text-muted); }
.portal-row.active { border-color: var(--brand-primary); background: var(--bg-card); }
.portal-detail { border: 1px solid var(--border-light); border-radius: 12px; padding: 16px; background: var(--bg-card); }
.resource-head { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; color: var(--text-muted); }
.resource-title { margin: 8px 0 6px; font-size: 16px; color: var(--text-primary); }
.resource-desc { font-size: 13px; color: var(--text-secondary); margin-bottom: 10px; }
.resource-embed { width: 100%; aspect-ratio: 16 / 9; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.resource-embed iframe { width: 100%; height: 100%; }
.resource-link { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: var(--brand-primary); }
.resource-meta { margin-top: 8px; font-size: 12px; color: var(--text-muted); }
.resource-hint { margin-top: 6px; font-size: 12px; color: var(--text-muted); }
.resource-controls { display: flex; gap: 10px; align-items: center; }
.resource-search, .resource-filter {
  padding: 6px 10px; border: 1px solid var(--border-light); border-radius: 8px; font-size: 13px; background: var(--bg-input); color: var(--text-primary);
}
.resource-icon { margin-right: 6px; }
.resource-open {
  display: inline-flex; margin-top: 6px; font-size: 12px; color: var(--brand-primary); font-weight: 600;
}

/* Quiz styles */
.quiz-list { display: flex; flex-direction: column; gap: 10px; }
.quiz-two-col {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.quiz-col {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 10px;
  background: var(--bg-card);
}
.quiz-group-head { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; }
.quiz-group-title { margin: 0; font-size: 14px; color: var(--text-primary); }
.quiz-group-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  background: var(--bg-muted);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 700;
  padding: 0 8px;
}
.quiz-row-right { display: flex; align-items: center; gap: 8px; }
.quiz-table th,
.quiz-table td {
  white-space: nowrap;
}
.quiz-table td:first-child,
.quiz-table th:first-child {
  white-space: normal;
}
.quiz-row-click {
  cursor: pointer;
}
.quiz-row-click:hover td {
  background: var(--bg-muted);
}
.attempt-pill {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
}
.attempt-pill.attempted {
  background: var(--color-success-light);
  color: var(--color-success);
}
.attempt-pill.not-attempted {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

@media (max-width: 1100px) {
  .quiz-two-col {
    grid-template-columns: 1fr;
  }

  .trend-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .quiz-table thead {
    display: none;
  }

  .quiz-table tbody {
    display: grid;
    gap: 10px;
  }

  .quiz-table tr {
    display: grid;
    gap: 6px;
    padding: 10px;
    border: 1px solid var(--border-light);
    border-radius: 10px;
    background: var(--bg-card);
  }

  .quiz-table td {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 0;
    border: none;
    white-space: normal;
  }

  .quiz-table td::before {
    content: attr(data-label);
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    min-width: 72px;
  }

  .quiz-row-click:hover td {
    background: transparent;
  }
}
.quiz-question { border: 1px solid var(--border-light); border-radius: 12px; padding: 12px; margin-bottom: 12px; background: var(--bg-card); }
.quiz-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
.quiz-option { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-primary); }

[data-theme='dark'] .attend-row,
[data-theme='dark'] .test-row,
[data-theme='dark'] .section-divider {
  border-color: var(--border-light);
}

[data-theme='dark'] .attend-date,
[data-theme='dark'] .prog-row,
[data-theme='dark'] .sub-heading,
[data-theme='dark'] .chip-name,
[data-theme='dark'] .info-item span,
[data-theme='dark'] .resource-title,
[data-theme='dark'] .resource-desc,
[data-theme='dark'] .fee-val,
[data-theme='dark'] .batch-name,
[data-theme='dark'] .cost-value,
[data-theme='dark'] .asm-num {
  color: var(--text-primary);
}

[data-theme='dark'] .profile-email,
[data-theme='dark'] .chip-email,
[data-theme='dark'] .info-item label,
[data-theme='dark'] .batch-year,
[data-theme='dark'] .cost-label,
[data-theme='dark'] .asm-label,
[data-theme='dark'] .portal-row p,
[data-theme='dark'] .resource-head,
[data-theme='dark'] .resource-meta,
[data-theme='dark'] .resource-hint {
  color: var(--text-muted);
}

[data-theme='dark'] .fee-mini-item,
[data-theme='dark'] .parent-chip,
[data-theme='dark'] .portal-row,
[data-theme='dark'] .portal-detail,
[data-theme='dark'] .quiz-question {
  background: var(--bg-card);
  border-color: var(--border-light);
}

[data-theme='dark'] .role-pill {
  background: rgba(34, 211, 153, 0.18);
  color: #6ee7b7;
}

[data-theme='dark'] .year-badge {
  background: rgba(59, 130, 246, 0.16);
  color: #93c5fd;
}

[data-theme='dark'] .batch-cost-pill {
  background: rgba(34, 197, 94, 0.14);
  border-color: rgba(34, 197, 94, 0.35);
}

[data-theme='dark'] .resource-search,
[data-theme='dark'] .resource-filter,
[data-theme='dark'] .filter-select,
[data-theme='dark'] .pay-input input {
  background: var(--bg-input);
  color: var(--text-primary);
  border-color: var(--border-light);
}

[data-theme='dark'] .resource-link,
[data-theme='dark'] .resource-open,
[data-theme='dark'] .blue-badge {
  color: #93c5fd;
}

[data-theme='dark'] .theme-toggle {
  background: var(--bg-card);
  color: var(--text-primary);
}

[data-theme='dark'] .option-correct {
  color: #bbf7d0;
}

[data-theme='dark'] .option-wrong {
  color: #fecaca;
}
</style>
