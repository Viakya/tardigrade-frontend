<template>
  <div class="dashboard-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>👨‍👩‍👧 Parent Portal</h2>
        <p>{{ authStore.user?.full_name }}</p>
      </div>
      <nav class="sidebar-nav">
        <a href="#" :class="['nav-item', { active: activeSection === 'dashboard' }]" @click.prevent="activeSection = 'dashboard'">
          <span>📊</span> Dashboard
        </a>
        <a href="#" :class="['nav-item', { active: activeSection === 'children' }]" @click.prevent="activeSection = 'children'">
          <span>👶</span> My Children
        </a>
        <a href="#" :class="['nav-item', { active: activeSection === 'attendance' }]" @click.prevent="activeSection = 'attendance'">
          <span>✅</span> Attendance
        </a>
        <a href="#" :class="['nav-item', { active: activeSection === 'results' }]" @click.prevent="activeSection = 'results'">
          <span>🧠</span> Quizzes & Results
        </a>
        <a href="#" :class="['nav-item', { active: activeSection === 'fees' }]" @click.prevent="activeSection = 'fees'">
          <span>💰</span> Fee Status
        </a>
      </nav>
      <button @click="handleLogout" class="btn-logout">🚪 Logout</button>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>❌ {{ error }}</p>
        <button @click="loadDashboard" class="btn-retry">Try Again</button>
      </div>

      <!-- Dashboard Section -->
      <template v-else-if="activeSection === 'dashboard'">
        <header class="content-header">
          <h1>👋 Welcome, {{ authStore.user?.full_name }}!</h1>
          <p class="breadcrumb">Parent Portal / Dashboard</p>
        </header>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card pink">
            <div class="stat-icon">👶</div>
            <div class="stat-info">
              <h3>Children</h3>
              <p class="stat-value">{{ dashboardData?.total_children || 0 }}</p>
            </div>
          </div>
          <div class="stat-card green">
            <div class="stat-icon">✅</div>
            <div class="stat-info">
              <h3>Avg Attendance</h3>
              <p class="stat-value">{{ dashboardData?.average_attendance || 0 }}%</p>
            </div>
          </div>
          <div class="stat-card blue">
            <div class="stat-icon">🧠</div>
            <div class="stat-info">
              <h3>Recent Quizzes</h3>
              <p class="stat-value">{{ dashboardData?.recent_quizzes_count || 0 }}</p>
            </div>
          </div>
          <div :class="['stat-card', (dashboardData?.total_pending_fees || 0) > 0 ? 'orange' : 'green']">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <h3>Pending Fees</h3>
              <p class="stat-value">₹{{ (dashboardData?.total_pending_fees || 0).toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- Children Overview Cards -->
        <div class="section-title">
          <h2>👨‍👩‍👧‍👦 Your Children</h2>
        </div>

        <div v-if="!dashboardData?.children?.length" class="empty-state">
          <p>😔 No children linked to your account yet.</p>
          <p class="sub">Please contact the administration to link your children.</p>
        </div>

        <div v-else class="children-grid">
          <div v-for="child in dashboardData.children" :key="child.id" class="child-card">
            <div class="child-header">
              <div class="child-avatar">{{ getInitials(child.name) }}</div>
              <div class="child-basic">
                <h3>{{ child.name }}</h3>
                <p class="batch-name">{{ child.batch_name || 'No batch assigned' }}</p>
              </div>
            </div>
            
            <div class="child-stats">
              <div class="child-stat">
                <span class="label">Attendance</span>
                <span :class="['value', child.attendance_rate >= 75 ? 'good' : 'warning']">
                  {{ child.attendance_rate }}%
                </span>
              </div>
              <div class="child-stat">
                <span class="label">Quiz Avg</span>
                <span :class="['value', child.quiz_average >= 60 ? 'good' : 'warning']">
                  {{ child.quiz_average }}%
                </span>
              </div>
              <div class="child-stat">
                <span class="label">Fee Status</span>
                <span :class="['value', child.is_fee_paid ? 'good' : 'warning']">
                  {{ child.is_fee_paid ? 'Paid' : '₹' + child.pending_fee.toLocaleString() }}
                </span>
              </div>
            </div>

            <div class="child-actions">
              <button class="btn-view" @click="viewChildDetails(child)">View Details</button>
            </div>
          </div>
        </div>

        <div class="section-title" style="margin-top: 30px;">
          <h2>🤖 Weekly AI Digest</h2>
        </div>

        <div class="weekly-digest-card">
          <div class="digest-controls">
            <select v-model="digestChildId" class="digest-select">
              <option value="">-- Select Child --</option>
              <option v-for="child in dashboardData?.children || []" :key="`digest-child-${child.id}`" :value="child.id">
                {{ child.name }}
              </option>
            </select>
            <button class="btn-primary" @click="loadWeeklyDigest" :disabled="digestLoading || !digestChildId">
              {{ weeklyDigest ? 'Refresh Digest' : 'Generate Digest' }}
            </button>
          </div>

          <div v-if="digestLoading" class="loading-inline">
            <div class="spinner small"></div>
            <span>Generating weekly digest...</span>
          </div>
          <div v-else-if="digestError" class="warning-text">⚠️ {{ digestError }}</div>
          <div v-else-if="weeklyDigest" class="digest-grid">
            <div class="digest-col">
              <h4>Week Snapshot</h4>
              <ul>
                <li v-for="(item, idx) in (weeklyDigest.week_snapshot || []).slice(0, 4)" :key="`week-snapshot-${idx}`">
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="digest-col">
              <h4>Alerts</h4>
              <ul>
                <li v-for="(alert, idx) in (weeklyDigest.alerts || []).slice(0, 4)" :key="`week-alert-${idx}`">
                  {{ alert.label || alert }}
                </li>
              </ul>
            </div>
            <div class="digest-col">
              <h4>Next Steps</h4>
              <ul>
                <li v-for="(step, idx) in (weeklyDigest.next_steps || []).slice(0, 4)" :key="`week-step-${idx}`">
                  {{ step.action || step }}
                </li>
              </ul>
            </div>
          </div>
          <div v-else class="empty-state small">
            <p>Select child and generate weekly AI digest.</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="section-title" style="margin-top: 30px;">
          <h2>⚡ Quick Actions</h2>
        </div>

        <div class="quick-actions">
          <div class="action-card" @click="activeSection = 'attendance'">
            <span class="action-icon">📅</span>
            <h4>Check Attendance</h4>
            <p>View daily attendance records</p>
          </div>
          <div class="action-card" @click="activeSection = 'results'">
            <span class="action-icon">🧠</span>
            <h4>Quiz Results</h4>
            <p>Check practice & graded quiz progress</p>
          </div>
          <div class="action-card" @click="activeSection = 'fees'">
            <span class="action-icon">💳</span>
            <h4>Fee Status</h4>
            <p>View payments & pending dues</p>
          </div>
        </div>
      </template>

      <!-- Children Section -->
      <template v-else-if="activeSection === 'children'">
        <header class="content-header">
          <h1>👶 My Children</h1>
          <p class="breadcrumb">Parent Portal / My Children</p>
        </header>

        <div v-if="!dashboardData?.children?.length" class="empty-state">
          <p>😔 No children linked to your account.</p>
        </div>

        <div v-else class="children-detailed-list">
          <div v-for="child in dashboardData.children" :key="child.id" class="child-detail-card">
            <div class="detail-header">
              <div class="child-avatar large">{{ getInitials(child.name) }}</div>
              <div class="child-info">
                <h2>{{ child.name }}</h2>
                <p class="email">{{ child.email }}</p>
                <span class="batch-badge">{{ child.batch_name || 'No Batch' }}</span>
              </div>
            </div>

            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">📚 Batch</span>
                <span class="detail-value">{{ child.batch_name || 'Not assigned' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">✅ Attendance Rate</span>
                <span :class="['detail-value', child.attendance_rate >= 75 ? 'text-green' : 'text-orange']">
                  {{ child.attendance_rate }}%
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">🧠 Quiz Average</span>
                <span :class="['detail-value', child.quiz_average >= 60 ? 'text-green' : 'text-orange']">
                  {{ child.quiz_average }}%
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label"> Total Fee</span>
                <span class="detail-value">₹{{ child.total_fee.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">💵 Paid</span>
                <span class="detail-value text-green">₹{{ child.fee_paid.toLocaleString() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">⏳ Pending</span>
                <span :class="['detail-value', child.pending_fee > 0 ? 'text-orange' : 'text-green']">
                  {{ child.pending_fee > 0 ? '₹' + child.pending_fee.toLocaleString() : 'Fully Paid ✓' }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">� Recent Activity</span>
                <span class="detail-value">Attendance + Quizzes</span>
              </div>
            </div>

            <!-- Teachers Section -->
            <div v-if="childTeachers[child.id]?.length" class="teachers-section">
              <h4>👨‍🏫 Teachers</h4>
              <div class="teachers-list">
                <div v-for="teacher in childTeachers[child.id]" :key="teacher.id" class="teacher-chip">
                  <span class="teacher-name">{{ teacher.name }}</span>
                  <span class="teacher-subject">{{ teacher.specialization }}</span>
                </div>
              </div>
            </div>

            <div class="detail-actions">
              <button class="btn-secondary" @click="loadChildAttendance(child)">View Attendance</button>
              <button class="btn-secondary" @click="loadChildQuizzes(child)">View Quizzes</button>
              <button class="btn-primary" @click="loadChildFees(child)">View Fees</button>
            </div>
          </div>
        </div>
      </template>

      <!-- Attendance Section -->
      <template v-else-if="activeSection === 'attendance'">
        <header class="content-header">
          <h1>✅ Attendance Records</h1>
          <p class="breadcrumb">Parent Portal / Attendance</p>
        </header>

        <!-- Child Selector -->
        <div class="filter-bar">
          <label>Select Child:</label>
          <select v-model="selectedChildId" @change="loadAttendanceForChild">
            <option value="">-- Select --</option>
            <option v-for="child in dashboardData?.children" :key="child.id" :value="child.id">
              {{ child.name }}
            </option>
          </select>
          <label style="margin-left: 20px;">Period:</label>
          <select v-model="attendanceDays" @change="loadAttendanceForChild">
            <option :value="7">Last 7 days</option>
            <option :value="30">Last 30 days</option>
            <option :value="60">Last 60 days</option>
            <option :value="90">Last 90 days</option>
          </select>
        </div>

        <div v-if="!selectedChildId" class="empty-state">
          <p>👆 Please select a child to view attendance records.</p>
        </div>

        <div v-else-if="loadingAttendance" class="loading-inline">
          <div class="spinner small"></div>
          <span>Loading attendance...</span>
        </div>

        <div v-else-if="attendanceError" class="empty-state">
          <p>⚠️ {{ attendanceError }}</p>
        </div>

        <div v-else-if="attendanceData">
          <!-- Attendance Summary -->
          <div class="attendance-summary">
            <div class="summary-card green">
              <h4>{{ attendanceData.present }}</h4>
              <p>Present</p>
            </div>
            <div class="summary-card red">
              <h4>{{ attendanceData.absent }}</h4>
              <p>Absent</p>
            </div>
            <div class="summary-card blue">
              <h4>{{ attendanceData.total_classes }}</h4>
              <p>Total Classes</p>
            </div>
            <div :class="['summary-card', attendanceData.attendance_rate >= 75 ? 'green' : 'orange']">
              <h4>{{ attendanceData.attendance_rate }}%</h4>
              <p>Rate</p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-header">
              <span>Attendance Progress</span>
              <span :class="attendanceData.attendance_rate >= 75 ? 'text-green' : 'text-orange'">
                {{ attendanceData.attendance_rate }}%
              </span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :class="attendanceData.attendance_rate >= 75 ? 'green' : 'orange'"
                :style="{ width: attendanceData.attendance_rate + '%' }"
              ></div>
            </div>
            <p v-if="attendanceData.attendance_rate < 75" class="warning-text">
              ⚠️ Attendance is below 75%. Please ensure regular attendance.
            </p>
          </div>

          <div class="trend-card">
            <div class="trend-header">
              <h3>📈 Attendance Trend</h3>
              <div class="trend-pills">
                <span class="trend-pill">Latest <strong>{{ attendanceTrend.latestLabel }}: {{ attendanceTrend.latest }}%</strong></span>
                <span class="trend-pill">Best <strong>{{ attendanceTrend.bestLabel }}: {{ attendanceTrend.best }}%</strong></span>
                <span :class="['trend-pill', 'momentum', { positive: attendanceTrend.momentum >= 0, negative: attendanceTrend.momentum < 0 }]">
                  Momentum <strong>{{ attendanceTrend.momentum >= 0 ? '+' : '' }}{{ attendanceTrend.momentum }}%</strong>
                </span>
              </div>
            </div>
            <div class="trend-board">
              <h4>Attendance %</h4>
              <div class="trend-bars">
                <div v-for="point in attendanceTrend.points" :key="`attendance-trend-${point.key}`" class="trend-col">
                  <div class="trend-track">
                    <div class="trend-bar attendance" :style="{ height: point.value + '%' }"></div>
                  </div>
                  <div class="trend-month">{{ point.label }}</div>
                  <div class="trend-value">{{ point.value }}%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Table -->
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Day</th>
                  <th>Status</th>
                  <th>Batch</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in attendanceData.records" :key="record.id">
                  <td>{{ formatDate(record.date) }}</td>
                  <td>{{ getDayName(record.date) }}</td>
                  <td>
                    <span :class="['status-badge', record.status]">
                      {{ record.status === 'present' ? '✓ Present' : '✗ Absent' }}
                    </span>
                  </td>
                  <td>{{ record.batch_name || '—' }}</td>
                  <td>{{ record.remarks || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>No attendance data found for this child.</p>
        </div>
      </template>

      <!-- Quizzes & Results Section -->
      <template v-else-if="activeSection === 'results'">
        <header class="content-header">
          <h1>🧠 Quizzes & Results</h1>
          <p class="breadcrumb">Parent Portal / Quizzes & Results</p>
        </header>

        <div class="filter-bar">
          <label>Select Child:</label>
          <select v-model="selectedChildId" @change="loadQuizzesForChild">
            <option value="">-- Select --</option>
            <option v-for="child in dashboardData?.children" :key="child.id" :value="child.id">
              {{ child.name }}
            </option>
          </select>
        </div>

        <div v-if="!selectedChildId" class="empty-state">
          <p>👆 Please select a child to view quiz results.</p>
        </div>

        <div v-else-if="loadingQuizResults" class="loading-inline">
          <div class="spinner small"></div>
          <span>Loading quiz results...</span>
        </div>

        <div v-else-if="quizError" class="empty-state">
          <p>⚠️ {{ quizError }}</p>
        </div>

        <div v-else-if="quizResults">
          <div class="test-summary">
            <div class="summary-card blue">
              <h4>{{ quizResults.practice_count }}</h4>
              <p>Practice Assignments</p>
            </div>
            <div class="summary-card green">
              <h4>{{ quizResults.practice_average }}%</h4>
              <p>Practice Avg</p>
            </div>
            <div class="summary-card orange">
              <h4>{{ quizResults.graded_count }}</h4>
              <p>Graded Assignments</p>
            </div>
            <div class="summary-card orange">
              <h4>{{ quizResults.graded_average }}%</h4>
              <p>Graded Avg (Closed)</p>
            </div>
          </div>

          <div class="trend-card">
            <div class="trend-header">
              <h3>📈 Quiz Performance Trend</h3>
              <div class="trend-pills">
                <span class="trend-pill">Latest <strong>{{ quizTrend.latestLabel }}: {{ quizTrend.latest }}%</strong></span>
                <span class="trend-pill">Best <strong>{{ quizTrend.bestLabel }}: {{ quizTrend.best }}%</strong></span>
                <span :class="['trend-pill', 'momentum', { positive: quizTrend.momentum >= 0, negative: quizTrend.momentum < 0 }]">
                  Momentum <strong>{{ quizTrend.momentum >= 0 ? '+' : '' }}{{ quizTrend.momentum }}%</strong>
                </span>
              </div>
            </div>
            <div class="trend-board">
              <h4>Quiz Score %</h4>
              <div class="trend-bars">
                <div v-for="point in quizTrend.points" :key="`quiz-trend-${point.key}`" class="trend-col">
                  <div class="trend-track">
                    <div class="trend-bar quiz" :style="{ height: point.value + '%' }"></div>
                  </div>
                  <div class="trend-month">{{ point.label }}</div>
                  <div class="trend-value">{{ point.value }}%</div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>✅ Practice Assignments</h3></div>
            <div v-if="practiceQuizzes.length === 0" class="empty-state small">
              <p>No practice assignments yet.</p>
            </div>
            <div v-else class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in practiceQuizzes" :key="`practice-${quiz.id}`" @click="openQuizDetail(quiz)">
                    <td class="fw-600">{{ quiz.title }}</td>
                    <td>{{ quiz.status }}</td>
                    <td>{{ formatQuizScore(quiz, true) }}</td>
                    <td>
                      <span v-if="quiz.student_submission">{{ formatDate(quiz.student_submission?.submitted_at) }}</span>
                      <span v-else class="badge badge-warning">Not submitted</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="card">
            <div class="card-head"><h3>🎯 Graded Assignments</h3></div>
            <div v-if="gradedQuizzes.length === 0" class="empty-state small">
              <p>No graded assignments yet.</p>
            </div>
            <div v-else class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="quiz in gradedQuizzes" :key="`graded-${quiz.id}`" @click="openQuizDetail(quiz)">
                    <td class="fw-600">{{ quiz.title }}</td>
                    <td>{{ quiz.status }}</td>
                    <td>{{ formatQuizScore(quiz, quiz.status === 'closed') }}</td>
                    <td>
                      <span v-if="quiz.student_submission">{{ formatDate(quiz.student_submission?.submitted_at) }}</span>
                      <span v-else class="badge badge-warning">Not submitted</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>No quiz data found for this child yet.</p>
        </div>
      </template>

      <!-- Fee Status Section -->
      <template v-else-if="activeSection === 'fees'">
        <header class="content-header">
          <h1>💰 Fee Status</h1>
          <p class="breadcrumb">Parent Portal / Fee Status</p>
        </header>

        <!-- Child Selector -->
        <div class="filter-bar">
          <label>Select Child:</label>
          <select v-model="selectedChildId" @change="loadFeesForChild">
            <option value="">-- Select --</option>
            <option v-for="child in dashboardData?.children" :key="child.id" :value="child.id">
              {{ child.name }}
            </option>
          </select>
        </div>

        <div v-if="!selectedChildId" class="empty-state">
          <p>👆 Please select a child to view fee status.</p>
        </div>

        <div v-else-if="loadingFees" class="loading-inline">
          <div class="spinner small"></div>
          <span>Loading fee information...</span>
        </div>

        <div v-else-if="feeError" class="empty-state">
          <p>⚠️ {{ feeError }}</p>
        </div>

        <div v-else-if="feeData">
          <!-- Fee Summary Cards -->
          <div class="fee-summary">
            <div class="fee-card">
              <span class="fee-label">Total Fee</span>
              <span class="fee-value">₹{{ feeData.total_fee.toLocaleString() }}</span>
              <span class="fee-sub">For {{ feeData.batch_name || 'current batch' }}</span>
            </div>
            <div class="fee-card green">
              <span class="fee-label">Total Paid</span>
              <span class="fee-value">₹{{ feeData.total_paid.toLocaleString() }}</span>
              <span class="fee-sub">{{ feeData.payments.length }} payment(s)</span>
            </div>
            <div :class="['fee-card', feeData.remaining > 0 ? 'orange' : 'green']">
              <span class="fee-label">Remaining</span>
              <span class="fee-value">₹{{ feeData.remaining.toLocaleString() }}</span>
              <span class="fee-sub">{{ feeData.is_fully_paid ? '✓ Fully Paid' : 'Pending' }}</span>
              <div v-if="!feeData.is_fully_paid" class="pay-input">
                <span class="pay-label">Pay amount</span>
                <input
                  v-model="payAmountInput"
                  type="number"
                  min="1"
                  :max="feeRemaining"
                  step="1"
                  placeholder="Enter amount"
                />
                <div class="pay-quick">
                  <button type="button" class="btn-secondary" @click="payAmountInput = String(feeRemaining)">
                    Pay Full
                  </button>
                  <button
                    type="button"
                    class="btn-secondary"
                    @click="payAmountInput = String(Math.ceil(feeRemaining / 2))"
                  >
                    Pay 50%
                  </button>
                </div>
                <p v-if="payAmountError" class="pay-error">{{ payAmountError }}</p>
              </div>
              <button
                v-if="!feeData.is_fully_paid"
                class="btn-primary"
                style="margin-top: 12px; padding: 6px 12px; font-size: 13px;"
                :disabled="paying"
                @click="payRemainingFee"
              >
                {{ paying ? 'Processing…' : 'Pay Now' }}
              </button>
            </div>
          </div>

          <!-- Discount Info -->
          <div v-if="feeData.discount_percent > 0" class="discount-info">
            🎉 Discount Applied: <strong>{{ feeData.discount_percent }}%</strong>
          </div>

          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-header">
              <span>Payment Progress</span>
              <span>{{ feeData.total_fee > 0 ? Math.round((feeData.total_paid / feeData.total_fee) * 100) : 0 }}%</span>
            </div>
            <div class="progress-bar large">
              <div 
                class="progress-fill green" 
                :style="{ width: feeData.total_fee > 0 ? Math.min(100, (feeData.total_paid / feeData.total_fee) * 100) + '%' : '0%' }"
              ></div>
            </div>
          </div>

          <!-- Payment History -->
          <div class="section-title">
            <h3>📋 Payment History</h3>
          </div>

          <div v-if="!feeData.payments.length" class="empty-state small">
            <p>No payments recorded yet.</p>
          </div>

          <div v-else class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment, index) in feeData.payments" :key="payment.id">
                  <td>{{ Number(index) + 1 }}</td>
                  <td class="fw-600 text-green">₹{{ payment.amount.toLocaleString() }}</td>
                  <td>{{ formatDate(payment.payment_date) }}</td>
                  <td>
                    <span class="method-badge">{{ payment.payment_method }}</span>
                  </td>
                  <td>{{ payment.reference_no || '—' }}</td>
                  <td>{{ payment.remarks || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div v-else class="empty-state">
          <p>No fee data found for this child yet.</p>
        </div>
      </template>

      <!-- Child Details Modal -->
      <div v-if="showChildModal" class="modal-overlay" @click.self="showChildModal = false">
        <div class="modal-content large">
          <div class="modal-header">
            <h2>{{ selectedChild?.name }} - Details</h2>
            <button class="modal-close" @click="showChildModal = false">×</button>
          </div>
          <div class="modal-body" v-if="selectedChild">
            <div class="modal-stats">
              <div class="modal-stat">
                <span class="label">Batch</span>
                <span class="value">{{ selectedChild.batch_name || 'Not assigned' }}</span>
              </div>
              <div class="modal-stat">
                <span class="label">Attendance</span>
                <span :class="['value', selectedChild.attendance_rate >= 75 ? 'good' : 'warning']">
                  {{ selectedChild.attendance_rate }}%
                </span>
              </div>
              <div class="modal-stat">
                <span class="label">Quiz Average</span>
                <span :class="['value', selectedChild.quiz_average >= 60 ? 'good' : 'warning']">
                  {{ selectedChild.quiz_average }}%
                </span>
              </div>
              <div class="modal-stat">
                <span class="label">Fee Status</span>
                <span :class="['value', selectedChild.is_fee_paid ? 'good' : 'warning']">
                  {{ selectedChild.is_fee_paid ? 'Fully Paid' : '₹' + selectedChild.pending_fee.toLocaleString() + ' pending' }}
                </span>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="showChildModal = false">Close</button>
            <button class="btn-primary" @click="goToChildSection(selectedChild)">View Full Details</button>
          </div>
        </div>
      </div>

      <!-- Quiz Detail Modal -->
      <div v-if="showQuizModal && selectedQuiz" class="modal-overlay" @click.self="closeQuizModal">
        <div class="modal-content large">
          <div class="modal-header">
            <h2>{{ selectedQuiz.title }}</h2>
            <button class="modal-close" @click="closeQuizModal">×</button>
          </div>
          <div class="modal-body">
            <div v-for="q in selectedQuiz.questions || []" :key="q.id" class="quiz-question">
              <div class="fw-600">{{ q.question }}</div>
              <div class="quiz-options">
                <div v-for="(opt, idx) in q.options" :key="`${q.id}-${idx}`" class="quiz-option">
                  <span class="option-label">{{ getOptionLabel(idx) }}.</span>
                  <span>{{ opt }}</span>
                </div>
              </div>
              <div class="quiz-meta">
                <span>Your answer: {{ q.student_answer || 'Not submitted' }}</span>
                <span v-if="showParentCorrectAnswers">Correct: {{ q.correct_option || '—' }}</span>
              </div>
              <div v-if="showParentExplanations && q.explanation" class="quiz-explanation">
                Explanation: {{ q.explanation }}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-secondary" @click="closeQuizModal">Close</button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import apiClient from '@/services/api'
import { aiService } from '@/services/ai'
import { paymentsService } from '@/services/payments'

const router = useRouter()
const authStore = useAuthStore()

// State
const activeSection = ref('dashboard')
const loading = ref(true)
const error = ref('')
const dashboardData = ref<any>(null)

// Child-specific data
const selectedChildId = ref<number | string>('')
const selectedChild = ref<any>(null)
const showChildModal = ref(false)

// Attendance
const loadingAttendance = ref(false)
const attendanceData = ref<any>(null)
const attendanceError = ref('')
const attendanceDays = ref(30)

// Quizzes
const loadingQuizResults = ref(false)
const quizResults = ref<any>(null)
const quizError = ref('')


// Fees
const loadingFees = ref(false)
const feeData = ref<any>(null)
const feeError = ref('')
const payAmountInput = ref('')
const payAmountError = ref<string | null>(null)
const paying = ref(false)

// Teachers per child
const childTeachers = ref<Record<number, any[]>>({})

// Weekly AI digest
const digestChildId = ref<number | string>('')
const digestLoading = ref(false)
const digestError = ref('')
const weeklyDigest = ref<any | null>(null)

// Quiz detail modal
const showQuizModal = ref(false)
const selectedQuiz = ref<any>(null)
const optionLabels = ['A', 'B', 'C', 'D']

function getOptionLabel(idx: number | string) {
  return optionLabels[Number(idx)] ?? ''
}

const showParentCorrectAnswers = computed(() =>
  selectedQuiz.value?.mode === 'graded' && selectedQuiz.value?.status === 'closed'
)
const showParentExplanations = computed(() =>
  showParentCorrectAnswers.value || (selectedQuiz.value?.mode === 'practice' && !!selectedQuiz.value?.student_submission)
)

type TrendPoint = { key: string; label: string; value: number }

function getRecentMonthBuckets(count = 6) {
  const buckets: Array<{ key: string; label: string }> = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i -= 1) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
    const label = dt.toLocaleDateString('en-IN', { month: 'short' })
    buckets.push({ key, label })
  }
  return buckets
}

function toMonthKey(dateValue: string | null | undefined) {
  if (!dateValue) return null
  const dt = new Date(dateValue)
  if (Number.isNaN(dt.getTime())) return null
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`
}

function roundPercent(value: number) {
  const safe = Number.isFinite(value) ? value : 0
  return Math.max(0, Math.min(100, Math.round(safe)))
}

function buildTrend(points: TrendPoint[]) {
  const fallback: TrendPoint = { key: 'na', label: 'N/A', value: 0 }
  const safePoints = points.length ? points : [fallback]
  const latestPoint = safePoints[safePoints.length - 1] ?? fallback
  const bestPoint = safePoints.reduce((best, p) => (p.value > best.value ? p : best), safePoints[0] ?? fallback)
  const prevPoint = safePoints.length > 1 ? (safePoints[safePoints.length - 2] ?? fallback) : (safePoints[0] ?? fallback)

  return {
    points: safePoints,
    latest: latestPoint.value,
    latestLabel: latestPoint.label,
    best: bestPoint.value,
    bestLabel: bestPoint.label,
    momentum: latestPoint.value - prevPoint.value,
  }
}

const quizTrend = computed(() => {
  const buckets = getRecentMonthBuckets(6)
  const grouped = new Map<string, number[]>()

  for (const quiz of quizResults.value?.quizzes || []) {
    const score = Number(quiz?.student_submission?.score)
    if (!Number.isFinite(score)) continue

    const total = Number(quiz?.total_marks || 100)
    if (!Number.isFinite(total) || total <= 0) continue

    const dateRef =
      quiz?.student_submission?.submitted_at ||
      quiz?.updated_at ||
      quiz?.created_at ||
      null
    const monthKey = toMonthKey(dateRef)
    if (!monthKey) continue

    if (!grouped.has(monthKey)) grouped.set(monthKey, [])
    grouped.get(monthKey)?.push((score / total) * 100)
  }

  const points = buckets.map(({ key, label }) => {
    const values = grouped.get(key) || []
    const avg = values.length ? values.reduce((s, n) => s + n, 0) / values.length : 0
    return { key, label, value: roundPercent(avg) }
  })

  return buildTrend(points)
})

const attendanceTrend = computed(() => {
  const buckets = getRecentMonthBuckets(6)
  const grouped = new Map<string, { present: number; total: number }>()

  for (const rec of attendanceData.value?.records || []) {
    const monthKey = toMonthKey(rec?.date)
    if (!monthKey) continue
    if (!grouped.has(monthKey)) grouped.set(monthKey, { present: 0, total: 0 })

    const slot = grouped.get(monthKey)
    if (!slot) continue
    slot.total += 1
    if (rec?.status === 'present') slot.present += 1
  }

  const points = buckets.map(({ key, label }) => {
    const slot = grouped.get(key)
    const rate = slot && slot.total > 0 ? (slot.present / slot.total) * 100 : 0
    return { key, label, value: roundPercent(rate) }
  })

  return buildTrend(points)
})

const feeRemaining = computed(() => Math.max(0, Number(feeData.value?.remaining || 0)))

watch(feeRemaining, (val) => {
  const current = Number(payAmountInput.value || 0)
  if (!payAmountInput.value || current > val) {
    payAmountInput.value = val ? String(val) : ''
  }
})

watch([activeSection, selectedChildId], ([section, childId]) => {
  if (!childId) return
  if (section === 'results') loadQuizzesForChild()
  if (section === 'attendance') loadAttendanceForChild()
  if (section === 'fees') loadFeesForChild()
})

declare global {
  interface Window {
    Razorpay?: any
  }
}

// Load dashboard on mount
onMounted(() => {
  loadDashboard()
})

async function loadDashboard() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiClient.get('/parents/dashboard')
    dashboardData.value = res.data.data.summary
    if (!digestChildId.value && dashboardData.value?.children?.length) {
      digestChildId.value = dashboardData.value.children[0].id
    }
    
    // Load teachers for each child
    for (const child of dashboardData.value.children || []) {
      await loadChildTeachers(child)
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load dashboard'
    console.error('Dashboard error:', e)
  } finally {
    loading.value = false
  }
}

async function loadWeeklyDigest() {
  if (!digestChildId.value) {
    digestError.value = 'Select a child first'
    return
  }

  digestLoading.value = true
  digestError.value = ''
  try {
    const res = await aiService.getParentWeeklyDigest(Number(digestChildId.value), {
      focus: 'weekly progress, concern alerts, and home action plan'
    })
    weeklyDigest.value = res?.data?.digest || null
  } catch (e: any) {
    digestError.value = e?.response?.data?.message || 'Failed to generate weekly digest'
    weeklyDigest.value = null
  } finally {
    digestLoading.value = false
  }
}

async function loadChildTeachers(child: any) {
  if (!child.batch_id) return
  try {
    const res = await apiClient.get(`/parents/children/${child.id}`)
    const childData = res.data.data.child
    if (childData?.batch?.teachers) {
      childTeachers.value[child.id] = childData.batch.teachers
    }
  } catch (e) {
    console.error('Failed to load teachers for child:', child.id)
  }
}

async function loadAttendanceForChild() {
  if (!selectedChildId.value) {
    attendanceData.value = null
    attendanceError.value = ''
    return
  }
  loadingAttendance.value = true
  attendanceError.value = ''
  try {
    const res = await apiClient.get(`/parents/children/${selectedChildId.value}/attendance`, {
      params: { days: attendanceDays.value }
    })
    attendanceData.value = res.data.data.attendance
  } catch (e: any) {
    console.error('Failed to load attendance:', e)
    attendanceData.value = null
    attendanceError.value = e?.response?.data?.message || 'Failed to load attendance data'
  } finally {
    loadingAttendance.value = false
  }
}


async function loadFeesForChild() {
  if (!selectedChildId.value) {
    feeData.value = null
    feeError.value = ''
    return
  }
  loadingFees.value = true
  feeError.value = ''
  try {
    const res = await apiClient.get(`/parents/children/${selectedChildId.value}/fees`)
    feeData.value = res.data.data.fees
  } catch (e: any) {
    console.error('Failed to load fees:', e)
    feeData.value = null
    feeError.value = e?.response?.data?.message || 'Failed to load fee details'
  } finally {
    loadingFees.value = false
  }
}

function resolvePayAmount() {
  const raw = Number(payAmountInput.value)
  if (Number.isNaN(raw) || raw <= 0) {
    return feeRemaining.value
  }
  return raw
}

function validatePayAmount(amount: number) {
  if (amount <= 0) {
    throw new Error('Amount must be greater than 0')
  }
  if (amount > feeRemaining.value) {
    throw new Error('Amount cannot exceed remaining fee')
  }
}

async function payRemainingFee() {
  if (!selectedChildId.value || feeRemaining.value <= 0) return

  paying.value = true
  payAmountError.value = null
  try {
    const amount = resolvePayAmount()
    validatePayAmount(amount)
    const res: any = await paymentsService.createRazorpayOrder(Number(selectedChildId.value), amount)
  const order = res?.data?.data?.order ?? res?.data?.order ?? res?.order
  const razorpayKeyId = res?.data?.data?.key_id ?? res?.data?.key_id ?? import.meta.env.VITE_RAZORPAY_KEY_ID

    if (!order) {
      throw new Error('Failed to create payment order')
    }

    if (!window.Razorpay) {
      alert('Payment SDK not loaded')
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
        student_id: String(selectedChildId.value),
      },
      handler: async (response: any) => {
        try {
          await paymentsService.verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            student_id: Number(selectedChildId.value),
            amount,
          })
          await loadFeesForChild()
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
    rzp.on('payment.failed', (response: any) => {
      const reason = response?.error?.description || response?.error?.reason || 'Payment failed'
      alert(reason)
    })
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

function loadChildAttendance(child: any) {
  selectedChildId.value = child.id
  activeSection.value = 'attendance'
  loadAttendanceForChild()
}

function loadChildQuizzes(child: any) {
  selectedChildId.value = child.id
  activeSection.value = 'results'
  loadQuizzesForChild()
}


function loadChildFees(child: any) {
  selectedChildId.value = child.id
  activeSection.value = 'fees'
  loadFeesForChild()
}

async function loadQuizzesForChild() {
  if (!selectedChildId.value) {
    quizResults.value = null
    quizError.value = ''
    return
  }
  loadingQuizResults.value = true
  quizError.value = ''
  try {
    const res = await apiClient.get(`/parents/children/${selectedChildId.value}/quizzes`)
    quizResults.value = res.data.data.quiz_results
  } catch (e: any) {
    console.error('Failed to load quizzes:', e)
    quizResults.value = null
    quizError.value = e?.response?.data?.message || 'Failed to load quiz results'
  } finally {
    loadingQuizResults.value = false
  }
}

async function openQuizDetail(quiz: any) {
  if (!selectedChildId.value) return
  try {
    const res = await apiClient.get(`/parents/children/${selectedChildId.value}/quizzes/${quiz.id}`)
    selectedQuiz.value = res?.data?.data?.quiz ?? null
    showQuizModal.value = true
  } catch (e) {
    console.error('Failed to load quiz detail:', e)
  }
}

function closeQuizModal() {
  showQuizModal.value = false
  selectedQuiz.value = null
}

const practiceQuizzes = computed(() => (quizResults.value?.quizzes || []).filter((q: any) => q.mode === 'practice'))
const gradedQuizzes = computed(() => (quizResults.value?.quizzes || []).filter((q: any) => q.mode === 'graded'))

function formatQuizScore(quiz: any, showWhenOpen: boolean) {
  const score = quiz.student_submission?.score
  if (quiz.mode === 'graded' && !showWhenOpen && quiz.status !== 'closed') {
    return 'Awaiting closure'
  }
  if (score === null || score === undefined) return 'Not submitted'
  const total = quiz.total_marks ?? 100
  return `${Math.round(Number(score))} / ${total}`
}

function viewChildDetails(child: any) {
  selectedChild.value = child
  showChildModal.value = true
}

function goToChildSection(child: any) {
  showChildModal.value = false
  selectedChildId.value = child.id
  activeSection.value = 'children'
}

function getInitials(name: string) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getDayName(dateStr: string) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { weekday: 'short' })
}


function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* Parent accent */
.nav-item.active {
  border-left-color: var(--accent-parent);
}

.main-content { flex: 1; padding: var(--space-xl); min-height: 100vh; }

.stat-card.pink { border-left-color: #f472b6; }
.stat-card.green { border-left-color: var(--color-success); }
.stat-card.blue { border-left-color: var(--color-info); }
.stat-card.orange { border-left-color: var(--color-warning); }
.stat-icon { font-size: 36px; }
.section-title { margin-bottom: 20px; }
.section-title h2, .section-title h3 { margin: 0; color: var(--text-primary); font-size: var(--font-size-lg); font-weight: 700; }
.children-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; }
.child-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.child-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.child-avatar { width: 56px; height: 56px; border-radius: 50%; background: var(--brand-gradient); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; }
.child-avatar.large { width: 80px; height: 80px; font-size: 24px; }
.child-basic h3 { margin: 0 0 4px 0; font-size: var(--font-size-lg); color: var(--text-primary); }
.batch-name { margin: 0; color: var(--text-muted); font-size: var(--font-size-base); }
.child-stats { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
.child-stat { flex: 1; min-width: 80px; text-align: center; padding: 12px; background: var(--bg-muted); border-radius: var(--radius-sm); }
.child-stat .label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.child-stat .value { display: block; font-size: 16px; font-weight: 700; color: var(--text-primary); }
.child-stat .value.good { color: var(--color-success); }
.child-stat .value.warning { color: var(--color-warning); }
.child-actions { text-align: center; }
.btn-view { padding: 10px 24px; background: var(--brand-gradient); color: white; border: none; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600; transition: transform var(--transition-base), box-shadow var(--transition-base); }
.btn-view:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(79,70,229,0.3); }
.quick-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
.weekly-digest-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 20px;
}
.digest-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.digest-select {
  min-width: 220px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
}
.digest-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.digest-col {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px;
}
.digest-col h4 {
  margin: 0 0 8px;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: #475569;
}
.digest-col ul {
  margin: 0;
  padding-left: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  color: #334155;
}
.action-card { background: white; padding: 24px; border-radius: 12px; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.action-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.action-icon { font-size: 36px; display: block; margin-bottom: 12px; }
.action-card h4 { margin: 0 0 8px 0; color: #333; }
.action-card p { margin: 0; color: #888; font-size: 13px; }
.children-detailed-list { display: flex; flex-direction: column; gap: 24px; }
.child-detail-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.detail-header { display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #eee; }
.child-info h2 { margin: 0 0 4px 0; font-size: 22px; color: #333; }
.child-info .email { margin: 0 0 8px 0; color: #888; font-size: 14px; }
.batch-badge { display: inline-block; padding: 4px 12px; background: var(--brand-gradient); color: white; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; }
.detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
.detail-item { padding: 12px; background: var(--bg-muted); border-radius: var(--radius-sm); }
.detail-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.detail-value { display: block; font-size: 16px; font-weight: 600; color: var(--text-primary); }
.teachers-section { margin-bottom: 24px; padding: 16px; background: rgba(79,70,229,0.04); border-radius: var(--radius-lg); }
.teachers-section h4 { margin: 0 0 12px 0; color: var(--text-primary); }
.teachers-list { display: flex; flex-wrap: wrap; gap: 12px; }
.teacher-chip { display: flex; flex-direction: column; padding: 10px 16px; background: var(--bg-card); border-radius: var(--radius-sm); box-shadow: var(--shadow-sm); }
.teacher-name { font-weight: 600; color: var(--text-primary); font-size: var(--font-size-base); }
.teacher-subject { color: var(--text-muted); font-size: 12px; }
.detail-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.filter-bar { background: white; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.filter-bar label { font-weight: 600; color: #555; }
.filter-bar select { padding: 10px 16px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; min-width: 180px; }
.attendance-summary, .fee-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; align-items: start; }
.summary-card { background: white; padding: 20px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.summary-card.green { background: linear-gradient(135deg, #d4fc79, #96e6a1); }
.summary-card.red { background: linear-gradient(135deg, #ff9a9e, #fecfef); }
.summary-card.blue { background: linear-gradient(135deg, #a1c4fd, #c2e9fb); }
.summary-card.orange { background: linear-gradient(135deg, #f6d365, #fda085); }
.summary-card h4 { margin: 0 0 4px 0; font-size: 28px; color: #333; }
.summary-card p { margin: 0; color: #555; font-size: 14px; }
.fee-card { background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); text-align: center; box-shadow: var(--shadow-sm); align-self: start; }
.fee-card.green { border-left: 4px solid var(--color-success); }
.fee-card.orange { border-left: 4px solid var(--color-warning); }
.pay-input { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
.pay-label { font-size: 12px; color: var(--text-muted); }
.pay-input input { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 8px; }
.pay-quick { display: flex; gap: 8px; flex-wrap: wrap; }
.pay-error { color: var(--color-danger); font-size: 12px; }
.fee-label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 8px; }
.fee-value { display: block; font-size: 24px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
.fee-sub { display: block; font-size: 12px; color: var(--text-muted); }
.discount-info { background: var(--color-success-light); color: #166534; padding: 12px 20px; border-radius: var(--radius-sm); margin-bottom: 24px; text-align: center; }
.progress-section { background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); margin-bottom: 24px; box-shadow: var(--shadow-sm); }
.progress-header { display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 600; }
.progress-bar { height: 12px; background: var(--bg-muted); border-radius: 6px; overflow: hidden; }
.progress-bar.large { height: 16px; border-radius: 8px; }
.progress-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.progress-fill.green { background: linear-gradient(90deg, var(--color-success), #34d399); }
.progress-fill.orange { background: linear-gradient(90deg, var(--color-warning), #f97316); }
.warning-text { margin-top: 12px; color: var(--color-warning); font-size: var(--font-size-base); }
.trend-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.trend-header h3 {
  margin: 0 0 12px;
  color: var(--text-primary);
  font-size: 22px;
}
.trend-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.trend-pill {
  border: 1px solid #dbe2ea;
  background: #f1f5f9;
  border-radius: 999px;
  padding: 8px 14px;
  color: #64748b;
  font-size: 14px;
}
.trend-pill strong {
  color: #0f172a;
  font-weight: 700;
}
.trend-pill.momentum {
  border-color: #a7f3d0;
  background: #ecfdf5;
}
.trend-pill.momentum.negative {
  border-color: #fecaca;
  background: #fef2f2;
}
.trend-board {
  margin-top: 14px;
  border: 1px solid #dbe2ea;
  border-radius: 16px;
  padding: 16px;
}
.trend-board h4 {
  margin: 0 0 10px;
  color: #0f172a;
  font-size: 20px;
}
.trend-bars {
  display: grid;
  grid-template-columns: repeat(6, minmax(88px, 1fr));
  gap: 12px;
  align-items: end;
}
.trend-col {
  text-align: center;
}
.trend-track {
  height: 190px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #cfd6de 0%, #e2e8f0 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}
.trend-track::before {
  content: '';
  position: absolute;
  top: 22%;
  left: 0;
  right: 0;
  border-top: 2px dashed #94a3b8;
}
.trend-bar {
  width: 100%;
  min-height: 4px;
  border-radius: 12px 12px 10px 10px;
  transition: height 0.35s ease;
}
.trend-bar.quiz {
  background: linear-gradient(180deg, #22c55e 0%, #f59e0b 58%, #ef4444 100%);
}
.trend-bar.attendance {
  background: linear-gradient(180deg, #10b981 0%, #84cc16 40%, #f59e0b 72%, #ef4444 100%);
}
.trend-month {
  margin-top: 10px;
  color: #64748b;
  font-size: 15px;
}
.trend-value {
  margin-top: 4px;
  color: #0f172a;
  font-size: 36px;
  line-height: 1;
  font-weight: 700;
}
.table-container { background: var(--bg-card); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600; }
.status-badge.present { background: var(--color-success-light); color: #166534; }
.status-badge.absent { background: var(--color-danger-light); color: #991b1b; }
.percentage-badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-weight: 600; font-size: 13px; }
.percentage-badge.excellent { background: var(--color-success-light); color: #166534; }
.percentage-badge.good { background: var(--color-info-light); color: #1e40af; }
.percentage-badge.average { background: var(--color-warning-light); color: #92400e; }
.percentage-badge.poor { background: var(--color-danger-light); color: #991b1b; }
.marks { font-weight: 600; }
.method-badge { display: inline-block; padding: 4px 10px; background: var(--color-info-light); color: #1e40af; border-radius: 4px; font-size: 12px; text-transform: capitalize; }
.empty-state.small { padding: 30px 20px; }
.empty-state .sub { margin-top: 8px; font-size: var(--font-size-base); }
.spinner.small { width: 24px; height: 24px; border-width: 3px; margin-bottom: 0; margin-right: 12px; }
.loading-inline { display: flex; align-items: center; justify-content: center; padding: 40px; color: var(--text-muted); }
.modal-body { padding: 24px; }
.modal-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.modal-stat { padding: 16px; background: var(--bg-muted); border-radius: var(--radius-sm); text-align: center; }
.modal-stat .label { display: block; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; }
.modal-stat .value { display: block; font-size: 18px; font-weight: 700; color: var(--text-primary); }
.modal-stat .value.good { color: var(--color-success); }
.modal-stat .value.warning { color: var(--color-warning); }
.badge { display: inline-block; padding: 4px 8px; border-radius: 999px; font-size: 11px; font-weight: 600; }
.badge-warning { background: #fef3c7; color: #b45309; }
.quiz-question { border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; margin-bottom: 12px; }
.quiz-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 8px; }
.quiz-option { display: flex; gap: 6px; font-size: 13px; color: #334155; }
.option-label { font-weight: 600; color: #475569; }
.quiz-meta { margin-top: 8px; font-size: 12px; color: #64748b; display: flex; gap: 12px; flex-wrap: wrap; }
.quiz-explanation { margin-top: 6px; font-size: 12px; color: #64748b; }
@media (max-width: 768px) {
  .sidebar { width: 100%; height: auto; position: relative; }
  .main-content { margin-left: 0; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .children-grid { grid-template-columns: 1fr; }
  .trend-bars { grid-template-columns: repeat(3, minmax(84px, 1fr)); }
  .trend-value { font-size: 24px; }
}
</style>
