document.addEventListener('DOMContentLoaded', function () {
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const body = document.body;
      const current = body.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      body.setAttribute('data-theme', next);
      themeToggle.innerHTML = next === 'dark'
        ? '<i class="bi bi-moon-stars-fill"></i>'
        : '<i class="bi bi-sun-fill"></i>';
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      window.location.href = 'NAMA.html';
    });
  }

  const revenueBtn = document.getElementById('revenueBtn');
  const profitBtn = document.getElementById('profitBtn');
  const ctx = document.getElementById('chartCanvas')?.getContext('2d');
  const navBtns = document.querySelectorAll('.nav-btn');
  const chartSection = document.querySelector('.chart-section');
  const incomeSection = document.querySelector('.income-section');

  if (!ctx) return;

  const financialData = [
    { month: 'يناير', revenue: 45000, expenses: 32000, netProfit: 13000 },
    { month: 'فبراير', revenue: 52000, expenses: 35000, netProfit: 17000 },
    { month: 'مارس', revenue: 48000, expenses: 33000, netProfit: 15000 },
    { month: 'أبريل', revenue: 61000, expenses: 38000, netProfit: 23000 },
    { month: 'مايو', revenue: 58000, expenses: 36000, netProfit: 22000 },
    { month: 'يونيو', revenue: 67000, expenses: 41000, netProfit: 26000 }
  ];

  let chart;

  function getTextColor() {
    return getComputedStyle(document.body).color;
  }

  function renderChart(type) {
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: type === 'revenue' ? 'bar' : 'line',
      data: {
        labels: financialData.map(d => d.month),
        datasets: type === 'revenue'
          ? [
              { label: 'الإيرادات', data: financialData.map(d => d.revenue), backgroundColor: '#0077c8' },
              { label: 'المصروفات', data: financialData.map(d => d.expenses), backgroundColor: '#dc3545' }
            ]
          : [
              { label: 'صافي الربح', data: financialData.map(d => d.netProfit), borderColor: '#28a745', backgroundColor: '#28a745', fill: false, tension: 0.3 }
            ]
      },
      options: {
        plugins: {
          legend: { labels: { color: getTextColor() } }
        },
        scales: {
          x: { ticks: { color: getTextColor() } },
          y: { ticks: { color: getTextColor() } }
        }
      }
    });
  }

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

  navBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      navBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const section = this.dataset.section;
      chartSection.classList.toggle('d-none', section === 'reports');
      incomeSection.classList.toggle('d-none', section !== 'reports');

      if (section === 'reports') {
        showIncomeStatement();
      }
    });
  });

const table = `<table class="table"><thead><tr><th>الشهر</th><th>الإيرادات</th><th>المصروفات</th><th>صافي الربح</th></tr></thead><tbody>
${financialData.map(d => `<tr><td>${d.month}</td><td>$${d.revenue.toLocaleString()}</td><td>$${d.expenses.toLocaleString()}</td><td>$${d.netProfit.toLocaleString()}</td></tr>`).join('')}
</tbody></table>`;

function loadAPI() {
  fetch("http://127.0.0.1:8001/summary")  // هذا رابط API تبعك
    .then(response => response.json())
    .then(data => {
      // عرض البيانات داخل div
      document.getElementById("result").innerText = JSON.stringify(data, null, 2);
    })
    .catch(error => {
      document.getElementById("result").innerText = "فشل الاتصال بالـ API";
      console.error("API Error:", error);
    });
}

loadAPI();
})
function loadSummary() {
  fetch("http://127.0.0.1:8001/summary")
    .then(response => response.json())
    .then(data => {
      const div = document.getElementById("result");
      div.innerHTML = `
        <div class="card p-3 mb-3">
          <h5>الإيرادات الكلية</h5>
          <p>$${data.total_revenue.toLocaleString()}</p>
        </div>
        <div class="card p-3 mb-3">
          <h5>المصروفات الكلية</h5>
          <p>$${data.total_expenses.toLocaleString()}</p>
        </div>
        <div class="card p-3 mb-3">
          <h5>صافي الربح</h5>
          <p>$${data.total_net.toLocaleString()}</p>
        </div>
      `;
    })
    .catch(error => {
      document.getElementById("result").innerText = "فشل تحميل البيانات.";
      console.error(error);
    });
}

loadSummary();
