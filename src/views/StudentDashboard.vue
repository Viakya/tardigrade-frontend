<template>
  <div class="dashboard-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <div v-if="isSidebarOpen" class="sidebar-backdrop" @click="closeSidebar"></div>
    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="avatar">{{ initials }}</div>
        <h2>{{ authStore.user?.full_name }}</h2>
        <span class="role-badge">Student</span>
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
          <span>🧠</span> Quizzes
        </a>
        <a :class="['nav-item', { active: activeSection === 'attendance' }]" @click="activeSection = 'attendance'">
          <span>✅</span> Attendance
        </a>
        <a :class="['nav-item', { active: activeSection === 'results' }]" @click="activeSection = 'results'">
          <span>🧠</span> Quizzes & Results
        </a>
      </nav>
      <button @click="handleLogout" class="btn-logout">Logout</button>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="main-content">
      <button class="mobile-menu-btn" @click="toggleSidebar">☰ Menu</button>

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
              <div class="stat-icon">�</div>
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
                  <span class="attend-date">{{ rec.attendance_date }}</span>
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
                <button class="link-btn" @click="activeSection = 'results'">View All →</button>
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
                <h2 style="margin:0 0 4px;font-size:22px;color:#1a202c">{{ studentProfile.user?.full_name }}</h2>
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
                <h2 style="margin:0;font-size:22px;color:#1a202c">{{ studentProfile.batch.batch_name }}</h2>
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
              <div v-if="loadingFees" class="state-msg">Loading payments…</div>
              <div v-else-if="feePayments.length === 0" class="empty-msg">No payments recorded yet.</div>
              <div v-else class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>#</th><th>Amount</th><th>Date</th><th>Method</th><th>Reference</th><th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in feePayments" :key="p.id">
                      <td>{{ p.id }}</td>
                      <td class="fw700 col-green">₹{{ Number(p.amount).toLocaleString() }}</td>
                      <td>{{ p.payment_date }}</td>
                      <td><span class="badge blue-badge">{{ p.payment_method }}</span></td>
                      <td>{{ p.reference_no || '—' }}</td>
                      <td>{{ p.remarks || '—' }}</td>
                    </tr>
                  </tbody>
                </table>
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
              <select v-model="attendanceFilter" class="filter-select">
                <option value="all">All</option>
                <option value="present">Present Only</option>
                <option value="absent">Absent Only</option>
              </select>
            </div>
            <div v-if="loadingAttendance" class="state-msg">Loading…</div>
            <div v-else-if="filteredAttendance.length === 0" class="empty-msg">No records found.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Date</th><th>Status</th><th>Batch</th><th>Remarks</th></tr>
                </thead>
                <tbody>
                  <tr v-for="rec in filteredAttendance" :key="rec.id">
                    <td>{{ rec.attendance_date }}</td>
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
            <div v-if="loadingResources" class="state-msg">Loading resources…</div>
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
            </div>
            <div v-if="loadingQuizzes" class="state-msg">Loading quizzes…</div>
            <div v-else-if="quizError" class="state-msg" style="color: var(--color-danger)">
              {{ quizError }}
            </div>
            <div v-else-if="quizzes.length === 0" class="empty-msg">No quizzes available.</div>
            <div v-else class="quiz-list">
              <button
                v-for="quiz in quizzes"
                :key="quiz.id"
                class="portal-row"
                :class="{ active: selectedQuiz?.id === quiz.id }"
                @click="openQuiz(quiz)"
              >
                <div>
                  <strong>{{ quiz.title }}</strong>
                  <p>
                    {{ quiz.status }} • {{ quiz.mode }} • {{ quiz.question_count }} Qs
                    <span v-if="quiz.mode === 'practice'">• Score: {{ formatQuizScore(quiz) }}</span>
                    <span v-else-if="quiz.status === 'closed'">• Score: {{ formatQuizScore(quiz) }}</span>
                    <span v-else>• {{ quiz.student_submission ? 'Submitted' : 'Not submitted' }}</span>
                  </p>
                </div>
                <span>{{ quiz.creator?.full_name || 'Coach' }}</span>
              </button>
            </div>
          </div>
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
            <div v-if="loadingQuizzes" class="state-msg">Loading…</div>
            <div v-else-if="practiceAssignments.length === 0" class="empty-msg">No practice assignments yet.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Status</th><th>Score</th><th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in practiceAssignments" :key="`practice-${quiz.id}`">
                    <td class="fw700">{{ quiz.title }}</td>
                    <td>{{ quiz.status }}</td>
                    <td>{{ formatAssignmentScore(quiz, true) }}</td>
                    <td>{{ formatDate(quiz.student_submission?.submitted_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>🎯 Graded Assignments</h3></div>
            <div v-if="loadingQuizzes" class="state-msg">Loading…</div>
            <div v-else-if="gradedAssignments.length === 0" class="empty-msg">No graded assignments yet.</div>
            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Title</th><th>Status</th><th>Score</th><th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in gradedAssignments" :key="`graded-${quiz.id}`">
                    <td class="fw700">{{ quiz.title }}</td>
                    <td>{{ quiz.status }}</td>
                    <td>{{ formatAssignmentScore(quiz, false) }}</td>
                    <td>{{ formatDate(quiz.student_submission?.submitted_at) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </template>

      </template>
    </main>

    <Transition name="modal">
      <div v-if="showQuizModal && selectedQuiz" class="modal-overlay" @click.self="closeQuizModal">
        <div class="modal-container">
          <button class="modal-close" @click="closeQuizModal">✕</button>
          <div class="card-head" style="margin-bottom: 1rem;">
            <h3>{{ selectedQuiz.title }}</h3>
            <button class="btn-secondary" @click="closeQuizModal">Close</button>
          </div>
          <div v-for="q in selectedQuiz.questions || []" :key="q.id" class="quiz-question">
            <div class="fw700">{{ q.question }}</div>
            <div class="quiz-options">
              <label v-for="(opt, idx) in q.options" :key="`${q.id}-${idx}`" class="quiz-option">
                <input
                  type="radio"
                  :name="`q-${q.id}`"
                  :value="['A','B','C','D'][idx]"
                  v-model="quizAnswers[String(q.id)]"
                />
                <span>{{ opt }}</span>
              </label>
            </div>
            <div class="quiz-meta">
              <span>Your answer: {{ formatStudentAnswer(q.student_answer) }}</span>
              <span v-if="showCorrectAnswers">Correct: {{ q.correct_option || '—' }}</span>
            </div>
            <div v-if="showExplanations && q.explanation" class="quiz-explanation">
              Explanation: {{ q.explanation }}
            </div>
          </div>
          <button class="btn-primary" :disabled="submittingQuiz" @click="submitQuiz">
            {{ submittingQuiz ? 'Submitting…' : 'Submit Quiz' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { studentService, type Student } from '@/services/student'
import { feeService, type FeePayment } from '@/services/fee'
import { paymentsService } from '@/services/payments'
import { batchResourcesService, type BatchResource } from '@/services/batchResources'
import { quizzesService, type Quiz } from '@/services/quizzes'
import apiClient from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()

const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }

const activeSection = ref('overview')
const pageLoading = ref(false)
const pageError = ref<string | null>(null)
const studentProfile = ref<Student | null>(null)

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


const feePayments = ref<FeePayment[]>([])
const loadingFees = ref(false)
const paying = ref(false)
const payAmountInput = ref('')
const payAmountError = ref<string | null>(null)
const batchResources = ref<BatchResource[]>([])
const loadingResources = ref(false)
const resourceError = ref<string | null>(null)
const selectedResource = ref<BatchResource | null>(null)
const resourceSearch = ref('')
const resourceFilter = ref('all')
const quizzes = ref<Quiz[]>([])
const loadingQuizzes = ref(false)
const quizError = ref<string | null>(null)
const selectedQuiz = ref<Quiz | null>(null)
const quizAnswers = ref<Record<string, string>>({})
const submittingQuiz = ref(false)
const showQuizModal = ref(false)

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

    if (!order) {
      throw new Error('Failed to create payment order')
    }

    if (!window.Razorpay) {
      alert('Payment SDK not loaded')
      return
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
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
          alert('Payment succeeded but verification failed. Please contact support.')
        }
      },
      theme: {
        color: '#3b82f6',
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (err) {
    console.error('Failed to start payment', err)
    const message = (err as any)?.response?.data?.message
      ?? (err as Error)?.message
      ?? 'Failed to start payment. Please try again.'
    payAmountError.value = message
    alert(message)
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
  if (attendanceFilter.value === 'all') return attendanceRecords.value
  if (attendanceFilter.value === 'present') return attendanceRecords.value.filter(r => r.status === 'present')
  return attendanceRecords.value.filter(r => r.status !== 'present')
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

async function openQuiz(quiz: Quiz) {
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
    quizAnswers.value = {}
    showQuizModal.value = true
  } catch (err: any) {
    quizError.value = err?.response?.data?.message || 'Failed to load quiz'
  }
}

function closeQuizModal() {
  showQuizModal.value = false
  selectedQuiz.value = null
  quizAnswers.value = {}
}

function formatQuizScore(quiz: Quiz) {
  const score = quiz.student_submission?.score
  if (score === null || score === undefined) return 'Not submitted'
  const total = quiz.total_marks ?? 100
  return `${Math.round(Number(score))} / ${total}`
}

function formatStudentAnswer(answer?: string | null) {
  return answer ? answer : 'Not submitted'
}

async function submitQuiz() {
  if (!selectedQuiz.value) return
  submittingQuiz.value = true
  try {
    const answers = (selectedQuiz.value.questions || []).map((q: any) => ({
      question_id: Number(q.id),
      selected_option: String(quizAnswers.value[String(q.id)] || ''),
    }))
    if (answers.some((a) => !a.selected_option)) {
      throw new Error('Answer all questions before submitting')
    }
    await quizzesService.submit(selectedQuiz.value.id, answers)
    await loadQuizzes()
  closeQuizModal()
    showMessage('Quiz submitted')
  } catch (err: any) {
    const message = err?.response?.data?.message || err?.message || 'Failed to submit quiz'
    showMessage(message)
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

function showMessage(message: string) {
  alert(message)
}

onMounted(loadAll)
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
.role-badge { display: inline-block; padding: 3px 12px; background: rgba(52,211,153,0.15); color: var(--accent-student); border-radius: var(--radius-full); font-size: 11px; font-weight: 700; text-transform: uppercase; }

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

/* Attendance mini */
.attendance-mini-list { display: flex; flex-direction: column; gap: 6px; }
.attend-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f4f8; }
.attend-row:last-child { border-bottom: none; }
.attend-date { font-size: 13px; color: #4a5568; }
.attend-badge { padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.attend-badge.present { background: #c6f6d5; color: #276749; }
.attend-badge.absent  { background: #fed7d7; color: #c53030; }

/* Test mini */
.test-mini-list { display: flex; flex-direction: column; gap: 10px; }
.test-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f4f8; }
.test-row:last-child { border-bottom: none; }
.test-title { font-size: var(--font-size-base); font-weight: 600; color: var(--text-primary); }
.test-subject { font-size: 12px; color: var(--text-muted); }
.test-score-pill { font-size: 13px; font-weight: 700; white-space: nowrap; }
.pct { font-size: 11px; margin-left: 4px; }

/* Fee mini */
.fee-mini-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 16px; }
.fee-mini-item { background: #f7fafc; border-radius: 8px; padding: 12px; text-align: center; }
.fee-mini-item.fee-green  { background: #f0fff4; }
.fee-mini-item.fee-orange { background: #fffbeb; }
.fee-mini-item label { display: block; font-size: 11px; color: #a0aec0; margin-bottom: 6px; text-transform: uppercase; font-weight: 600; }
.fee-val { font-size: 17px; font-weight: 700; color: #1a202c; }

/* Batch mini */
.batch-mini { text-align: center; padding: 16px 0; }
.batch-name { font-size: 22px; font-weight: 800; color: #1a202c; }
.batch-year { font-size: 14px; color: #a0aec0; margin-top: 4px; }

/* Progress */
.progress-bar-wrap { display: flex; flex-direction: column; gap: 4px; }
.progress-track { width: 100%; height: 10px; background: var(--bg-muted); border-radius: 5px; overflow: hidden; }
.progress-track.large { height: 14px; border-radius: 7px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-success), #38f9d7); border-radius: inherit; transition: width 0.5s ease; }
.progress-fill.red-fill { background: linear-gradient(90deg, #fc8181, var(--color-danger)); }
.progress-label { font-size: 12px; color: var(--text-muted); text-align: right; }
.prog-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 14px; color: #4a5568; font-weight: 500; }
.prog-pct { font-weight: 700; }
.prog-pct.pct-green { color: #276749; }
.prog-pct.pct-red   { color: #c53030; }
.prog-hint { margin: 8px 0 0; font-size: 13px; font-weight: 600; }
.prog-hint.hint-green { color: #276749; }
.prog-hint.hint-red   { color: #c53030; }

/* Profile */
.profile-avatar-row { display: flex; align-items: center; gap: 20px; }
.avatar-lg { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-student), #38f9d7); display: flex; align-items: center; justify-content: center; font-size: 30px; font-weight: 800; color: #1e1b4b; flex-shrink: 0; }
.profile-email { margin: 0 0 8px; color: #718096; font-size: 14px; }
.role-pill { display: inline-block; padding: 3px 12px; background: #e6fffa; color: #2c7a7b; border-radius: 20px; font-size: 12px; font-weight: 700; }
.section-divider { height: 1px; background: #edf2f7; margin: 20px 0; }
.sub-heading { margin: 0 0 14px; font-size: 15px; font-weight: 700; color: #4a5568; }
.parents-row { display: flex; flex-wrap: wrap; gap: 12px; }
.parent-chip { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
.parent-chip > span { font-size: 22px; }
.chip-name  { font-size: 14px; font-weight: 600; color: #2d3748; }
.chip-email { font-size: 12px; color: #a0aec0; }

/* Info Grid */
.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.info-item { display: flex; flex-direction: column; gap: 4px; }
.info-item label { font-size: 11px; color: #a0aec0; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
.info-item span { font-size: 15px; color: #2d3748; }

/* Batch detail */
.batch-header-row { display: flex; justify-content: space-between; align-items: flex-start; }
.year-badge { padding: 4px 14px; background: #ebf8ff; color: #2b6cb0; border-radius: 20px; font-size: 13px; font-weight: 700; }
.batch-cost-pill { display: flex; flex-direction: column; align-items: flex-end; background: #f0fff4; border: 1px solid #9ae6b4; border-radius: 10px; padding: 10px 16px; }
.cost-value { font-size: 22px; font-weight: 800; color: #276749; }
.cost-label  { font-size: 11px; color: #718096; text-transform: uppercase; margin-top: 2px; }

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
.asm-num   { font-size: 32px; font-weight: 800; color: #1a202c; }
.asm-label { font-size: 13px; color: #718096; font-weight: 600; margin-top: 4px; }
.filter-select { padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px; background: white; color: #4a5568; cursor: pointer; }

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
.score-chip.score-high { background: #c6f6d5; color: #276749; }
.score-chip.score-mid  { background: #fef3c7; color: #92400e; }
.score-chip.score-low  { background: #fed7d7; color: #c53030; }

/* Table (uses shared, overrides removed) */

/* Badge */
.blue-badge { background: var(--color-info-light); color: #2b6cb0; }

/* Batch portal */
.portal-layout { display: grid; grid-template-columns: minmax(220px, 1fr) 2fr; gap: 16px; }
.portal-list { display: flex; flex-direction: column; gap: 10px; }
.portal-row {
  border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;
  background: #f9fafb; display: flex; justify-content: space-between; align-items: center;
  gap: 10px; cursor: pointer; text-align: left;
}
.portal-row p { margin: 4px 0 0; font-size: 12px; color: #718096; }
.portal-row.active { border-color: #667eea; background: #eef2ff; }
.portal-detail { border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #fff; }
.resource-head { display: flex; justify-content: space-between; font-size: 11px; text-transform: uppercase; color: #718096; }
.resource-title { margin: 8px 0 6px; font-size: 16px; color: #1a202c; }
.resource-desc { font-size: 13px; color: #4a5568; margin-bottom: 10px; }
.resource-embed { width: 100%; aspect-ratio: 16 / 9; border-radius: 10px; overflow: hidden; margin-bottom: 10px; }
.resource-embed iframe { width: 100%; height: 100%; }
.resource-link { display: inline-flex; align-items: center; gap: 6px; font-weight: 600; color: #2563eb; }
.resource-meta { margin-top: 8px; font-size: 12px; color: #718096; }
.resource-hint { margin-top: 6px; font-size: 12px; color: #9ca3af; }
.resource-controls { display: flex; gap: 10px; align-items: center; }
.resource-search, .resource-filter {
  padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px;
}
@media (max-width: 900px) {
  .dashboard-container { flex-direction: column; }
  .sidebar { width: 260px; height: 100vh; position: fixed; left: 0; top: 0; transform: translateX(-100%); transition: transform 0.3s ease; z-index: 30; }
  .sidebar-open .sidebar { transform: translateX(0); }
  .sidebar-nav { display: flex; flex-wrap: wrap; gap: 8px; }
  .nav-item { flex: 1 1 160px; }
  .main-content { margin-left: 0; padding: 16px; }
  .content-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .overview-grid { grid-template-columns: 1fr; }
  .portal-layout { grid-template-columns: 1fr; }
  .fee-mini-grid { grid-template-columns: repeat(2, 1fr); }
  .mobile-menu-btn { display: inline-flex; }
}

@media (max-width: 600px) {
  .stats-grid,
  .fee-overview-grid,
  .attend-summary-grid,
  .test-summary-grid { grid-template-columns: 1fr; }
  .fee-mini-grid { grid-template-columns: 1fr; }
  .profile-avatar-row { flex-direction: column; align-items: flex-start; }
  .batch-header-row { flex-direction: column; gap: 10px; align-items: flex-start; }
  .portal-row { flex-direction: column; align-items: flex-start; }
  .table-wrap { overflow-x: auto; }
  .data-table { min-width: 560px; }
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
.resource-icon { margin-right: 6px; }
.resource-open {
  display: inline-flex; margin-top: 6px; font-size: 12px; color: #1d4ed8; font-weight: 600;
}

/* Quiz styles */
.quiz-list { display: flex; flex-direction: column; gap: 10px; }
.quiz-question { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 12px; background: #f9fafb; }
.quiz-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
.quiz-option { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #1f2937; }
</style>
