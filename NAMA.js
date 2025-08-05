document.addEventListener('DOMContentLoaded', function () {
  const BASE_URL = 'http://127.0.0.1:8001'; // Your FastAPI backend URL

  // Theme Toggle Logic
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      const current = body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', next);
      // Update icon based on theme
      themeToggle.innerHTML =
        next === 'dark'
          ? '<i class="bi bi-sun-fill"></i>' // Sun icon for light mode
          : '<i class="bi bi-moon-stars-fill"></i>'; // Moon icon for dark mode
      // Re-render chart to update text color
      if (chart) {
        chart.destroy();
        const currentChartType = revenueBtn.classList.contains('btn-primary')
          ? 'revenue'
          : 'profit';
        renderChart(currentChartType);
      }
    });
  }

  // --- Chart and Data Elements ---
  const revenueBtn = document.getElementById('revenueBtn');
  const profitBtn = document.getElementById('profitBtn');
  const ctx = document.getElementById('chartCanvas')?.getContext('2d');

  let financialChartData = []; // To store data fetched from /analytics
  let chart; // Chart.js instance

  if (!ctx) {
    console.error('Chart canvas not found!');
    return;
  }

  function getTextColor() {
    return getComputedStyle(document.body).getPropertyValue('--text-color');
  }

  function renderChart(type) {
    if (chart) chart.destroy();

    const chartLabels = financialChartData.map((d) => d.month);
    const datasets =
      type === 'revenue'
        ? [
            {
              label: 'الإيرادات',
              data: financialChartData.map((d) => d.revenue),
              backgroundColor: 'rgba(0, 119, 200, 0.8)', // NAMA blue
              borderColor: 'rgba(0, 119, 200, 1)',
              borderWidth: 1,
            },
            {
              label: 'المصروفات',
              data: financialChartData.map((d) => d.expenses),
              backgroundColor: 'rgba(220, 53, 69, 0.8)', // Bootstrap red
              borderColor: 'rgba(220, 53, 69, 1)',
              borderWidth: 1,
            },
          ]
        : [
            {
              label: 'صافي الربح',
              data: financialChartData.map((d) => d.net_profit),
              borderColor: 'rgba(40, 167, 69, 1)', // Bootstrap green
              backgroundColor: 'rgba(40, 167, 69, 0.2)',
              fill: true,
              tension: 0.3,
            },
          ];

    chart = new Chart(ctx, {
      type: type === 'revenue' ? 'bar' : 'line',
      data: {
        labels: chartLabels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: getTextColor(), // Dynamic text color
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('ar-SA', {
                    style: 'currency',
                    currency: 'SAR',
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: getTextColor(), // Dynamic text color
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.1)', // Light grid lines
            },
          },
          y: {
            ticks: {
              color: getTextColor(), // Dynamic text color
              callback: function (value) {
                return new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                  notation: 'compact',
                  compactDisplay: 'short',
                }).format(value);
              },
            },
            grid: {
              color: 'rgba(200, 200, 200, 0.1)', // Light grid lines
            },
          },
        },
      },
    });
  }

  // --- API Calls ---

  // 1. Load Summary Data
  async function loadSummary() {
    const summaryResultDiv = document.getElementById('summary-result');
    summaryResultDiv.innerHTML = '<p>جاري تحميل الملخص...</p>';
    try {
      const response = await fetch(`${BASE_URL}/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      summaryResultDiv.innerHTML = `
        <div class="col-md-4 mb-3">
          <div class="card p-3 summary-card">
            <h6><i class="bi bi-currency-dollar me-2"></i>الإيرادات الكلية</h6>
            <p class="h5">${new Intl.NumberFormat('ar-SA', {
              style: 'currency',
              currency: 'SAR',
            }).format(data.total_revenue)}</p>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card p-3 summary-card">
            <h6><i class="bi bi-cash-coin me-2"></i>المصروفات الكلية</h6>
            <p class="h5">${new Intl.NumberFormat('ar-SA', {
              style: 'currency',
              currency: 'SAR',
            }).format(data.total_expenses)}</p>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card p-3 summary-card">
            <h6><i class="bi bi-piggy-bank me-2"></i>صافي الربح</h6>
            <p class="h5">${new Intl.NumberFormat('ar-SA', {
              style: 'currency',
              currency: 'SAR',
            }).format(data.total_net)}</p>
          </div>
        </div>
      `;
    } catch (error) {
      summaryResultDiv.innerHTML = `<p class="text-danger">فشل تحميل الملخص: ${error.message}</p>`;
      console.error('Error loading summary:', error);
    }
  }

  // 2. Load Analytics Data (for chart and monthly summary)
  async function loadAnalytics() {
    const analyticsMonthlySummaryDiv = document.getElementById(
      'analytics-monthly-summary',
    );
    // You can add parameters like year/month if you want more specific analytics
    const url = `${BASE_URL}/analytics`; // Or `${BASE_URL}/analytics?year=2023` for a specific year
    analyticsMonthlySummaryDiv.innerHTML = '<p>جاري تحميل بيانات التحليلات...</p>';

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      financialChartData = data.monthly_summary || [];
      if (financialChartData.length > 0) {
        renderChart('revenue'); // Render initial chart with revenue
      } else {
        ctx.innerHTML = '<p class="text-muted">لا توجد بيانات متاحة للرسم البياني.</p>';
      }

      // Populate monthly summary table
      if (data.monthly_summary && data.monthly_summary.length > 0) {
        let tableHTML = `<table class="table table-striped table-hover">
          <thead>
            <tr>
              <th>الشهر</th>
              <th>الإيرادات</th>
              <th>المصروفات</th>
              <th>صافي الربح</th>
            </tr>
          </thead>
          <tbody>`;
        data.monthly_summary.forEach((row) => {
          tableHTML += `
            <tr>
              <td>${row.month}</td>
              <td>${new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
              }).format(row.revenue)}</td>
              <td>${new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
              }).format(row.expenses)}</td>
              <td>${new Intl.NumberFormat('ar-SA', {
                style: 'currency',
                currency: 'SAR',
              }).format(row.net_profit)}</td>
            </tr>`;
        });
        tableHTML += `</tbody></table>`;
        analyticsMonthlySummaryDiv.innerHTML = tableHTML;
      } else {
        analyticsMonthlySummaryDiv.innerHTML = `<p class="text-muted">لا توجد بيانات شهرية متاحة.</p>`;
      }
    } catch (error) {
      analyticsMonthlySummaryDiv.innerHTML = `<p class="text-danger">فشل تحميل التحليلات: ${error.message}</p>`;
      console.error('Error loading analytics:', error);
    }
  }

  // 3. Load Risk Forecast
  async function loadRiskForecast() {
    const riskForecastCard = document.getElementById('risk-forecast-card');
    riskForecastCard.innerHTML = `<h6><i class="bi bi-graph-up-arrow me-2"></i>توقعات المخاطر</h6><p>جاري تحميل توقعات المخاطر...</p>`;
    try {
      const response = await fetch(`${BASE_URL}/risk_forecast`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      riskForecastCard.innerHTML = `
        <h6><i class="bi bi-graph-up-arrow me-2"></i>توقعات المخاطر</h6>
        <p>الإيرادات المتوقعة (3 أشهر): <strong>${new Intl.NumberFormat(
          'ar-SA',
          { style: 'currency', currency: 'SAR' },
        ).format(data.projected_revenue)}</strong></p>
        <p>نسبة الأمان: <strong>${data.safety_ratio.toFixed(2)}%</strong></p>
        <p>مستوى المخاطرة: <strong>${data.risk_level}</strong></p>
        <p class="text-muted small">${data.recommendation}</p>
      `;
    } catch (error) {
      riskForecastCard.innerHTML = `<p class="text-danger">فشل تحميل توقعات المخاطر: ${error.message}</p>`;
      console.error('Error loading risk forecast:', error);
    }
  }

  // 4. Generate Report (on button click)
  async function generateReport() {
    const reportYear = document.getElementById('reportYear').value;
    const reportMonth = document.getElementById('reportMonth').value;
    const reportOutputDiv = document.getElementById('report-output');
    reportOutputDiv.innerHTML = '<p>جاري توليد التقرير...</p>';

    let url = `${BASE_URL}/report?`;
    if (reportYear) {
      url += `year=${reportYear}`;
    } else if (reportMonth) {
      url += `month=${reportMonth}`;
    } else {
      reportOutputDiv.innerHTML = `<p class="text-warning">الرجاء إدخال سنة أو شهر لتوليد التقرير.</p>`;
      return;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || response.statusText}`);
      }
      const data = await response.json();
      if (data.error) {
        reportOutputDiv.innerHTML = `<p class="text-danger">خطأ: ${data.error}</p>`;
      } else {
        reportOutputDiv.innerHTML = `
          <h5>تقرير الفترة: ${data.year || data.month}</h5>
          <table class="table table-bordered mt-3">
            <tbody>
              <tr>
                <td>الإيرادات:</td>
                <td><strong>${new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(data.revenue)}</strong></td>
              </tr>
              <tr>
                <td>المصروفات:</td>
                <td><strong>${new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(data.expenses)}</strong></td>
              </tr>
              <tr>
                <td>صافي الربح:</td>
                <td><strong>${new Intl.NumberFormat('ar-SA', {
                  style: 'currency',
                  currency: 'SAR',
                }).format(data.net_profit)}</strong></td>
              </tr>
            </tbody>
          </table>
        `;
      }
    } catch (error) {
      reportOutputDiv.innerHTML = `<p class="text-danger">فشل توليد التقرير: ${error.message}</p>`;
      console.error('Error generating report:', error);
    }
  }

  // --- Event Listeners and Initial Load ---

  // Chart Type Buttons
  revenueBtn?.addEventListener('click', () => {
    revenueBtn.classList.add('btn-primary');
    revenueBtn.classList.remove('btn-outline-primary');
    profitBtn.classList.remove('btn-primary');
    profitBtn.classList.add('btn-outline-primary');
    document.getElementById('chartTitle').innerText = 'تحليل الإيرادات مقابل المصروفات';
    document.getElementById('chartDesc').innerText = 'مقارنة شهرية تُظهر الدخل مقابل التكاليف';
    renderChart('revenue');
  });

  profitBtn?.addEventListener('click', () => {
    profitBtn.classList.add('btn-primary');
    profitBtn.classList.remove('btn-outline-primary');
    revenueBtn.classList.remove('btn-primary');
    revenueBtn.classList.add('btn-outline-primary');
    document.getElementById('chartTitle').innerText = 'نمو صافي الربح';
    document.getElementById('chartDesc').innerText = 'مسار نمو الأرباح على مدى الأشهر';
    renderChart('profit');
  });

  // Navigation Buttons
  const navBtns = document.querySelectorAll('.nav-btn');
  const dashboardSection = document.getElementById('dashboard-section');
  const analyticsSection = document.getElementById('analytics-section');
  const reportsSection = document.getElementById('reports-section');

  navBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      navBtns.forEach((b) => b.classList.remove('active'));
      this.classList.add('active');

      const section = this.dataset.section;

      dashboardSection.classList.add('d-none');
      analyticsSection.classList.add('d-none');
      reportsSection.classList.add('d-none');

      if (section === 'dashboard') {
        dashboardSection.classList.remove('d-none');
        loadSummary(); // Reload summary on dashboard
        loadAnalytics(); // Reload analytics for chart on dashboard
      } else if (section === 'analytics') {
        analyticsSection.classList.remove('d-none');
        loadAnalytics(); // Load analytics details
      } else if (section === 'reports') {
        reportsSection.classList.remove('d-none');
      }
    });
  });

  // Report Generation Button
  document.getElementById('generateReportBtn')?.addEventListener('click', generateReport);

  // Initial Load of data when the page loads
  loadSummary();
  loadAnalytics(); // Initial load for the dashboard chart and analytics section
  loadRiskForecast();
});