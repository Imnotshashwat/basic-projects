// Dark/Light Theme
const themeToggle = document.getElementById('theme-toggle');
function setTheme(enabled) {
  document.body.classList.toggle('dark', enabled);
  themeToggle.textContent = enabled ? '☀️ Light Mode' : '🌙 Dark Mode';
  localStorage.setItem('expense_theme', enabled ? 'dark' : 'light');
}
// Load preferred theme
setTheme(localStorage.getItem('expense_theme') === 'dark');
themeToggle.onclick = () => setTheme(!document.body.classList.contains('dark'));

// Expense and budget utils
function getExpenses() {
  return JSON.parse(localStorage.getItem('expenses') || '[]');
}
function saveExpenses(arr) {
  localStorage.setItem('expenses', JSON.stringify(arr));
}
function getBudget() {
  return parseFloat(localStorage.getItem('monthly_budget') || '0');
}
function setBudget(val) {
  localStorage.setItem('monthly_budget', val);
}
function filterMonth(expArr) {
  const now = new Date();
  const mm = now.getMonth();
  const yyyy = now.getFullYear();
  return expArr.filter(e => {
    const [d,m,y] = e.date.split('/');
    return parseInt(m,10)-1 === mm && parseInt(y) === yyyy;
  });
}
let expenseChart = null;
function drawChart(expArr) {
  const byCat = {};
  expArr.forEach(e => {
    byCat[e.category] = (byCat[e.category] || 0) + parseFloat(e.amount);
  });
  const labels = Object.keys(byCat);
  const values = labels.map(k=>byCat[k]);
  if (expenseChart) expenseChart.destroy();
  const ctx = document.getElementById('expenseChart').getContext('2d');
  expenseChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#44a5c2','#ffa726','#66bb6a','#ef5350','#ab47bc','#ff7043',
          '#26a69a','#7e57c2','#26c6da'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position:'bottom' } }
    }
  });
}
function updateDisplay() {
  const all = getExpenses();
  let total = 0;
  const tbody = document.querySelector('#expense-table tbody');
  tbody.innerHTML = '';
  all.forEach((e, i) => {
    total += +e.amount;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${e.desc}</td>
      <td>₹${parseFloat(e.amount).toFixed(2)}</td>
      <td>${e.category}</td><td>${e.date}</td>
      <td><button class="delete-btn" data-i="${i}">X</button></td>`;
    tbody.appendChild(tr);
  });
  document.getElementById('total').textContent = total.toFixed(2);
  Array.from(document.getElementsByClassName('delete-btn')).forEach(btn=>{
    btn.onclick=()=>{
      const i=btn.getAttribute('data-i');
      const arr=getExpenses();
      arr.splice(i,1);
      saveExpenses(arr);
      updateDisplay();
    }
  });
  drawChart(all);
  const monthArr = filterMonth(all);
  let monthSpent = 0;
  monthArr.forEach(e=>monthSpent+=+e.amount);
  const budget = getBudget();
  document.getElementById('budget-value').textContent = budget.toFixed(2);
  document.getElementById('monthly-total').textContent = monthSpent.toFixed(2);
  document.getElementById('remaining').textContent = (budget ? (budget-monthSpent).toFixed(2) : "0.00");
  const alertEl = document.getElementById('budget-alert');
  if (budget > 0) {
    if (monthSpent > budget) {
      alertEl.textContent = "You are OVER your budget this month!";
    } else if ((budget-monthSpent) < budget*0.2) {
      alertEl.textContent = "Warning: Less than 20% of your budget left!";
    } else {
      alertEl.textContent = "";
    }
  } else alertEl.textContent = "";
}
document.getElementById('expense-form').addEventListener('submit', function(e){
  e.preventDefault();
  const desc = document.getElementById('desc').value.trim();
  const amt = document.getElementById('amount').value;
  const cat = document.getElementById('category').value.trim();
  const date = new Date().toLocaleDateString('en-IN');
  if (desc && amt && cat) {
    const arr = getExpenses();
    arr.push({desc, amount:amt, category:cat, date});
    saveExpenses(arr);
    updateDisplay();
    this.reset();
  }
});
document.getElementById('budget-form').addEventListener('submit', function(e){
  e.preventDefault();
  const val = parseFloat(document.getElementById('budget-input').value);
  if(!isNaN(val) && val>=0) {
    setBudget(val); 
    updateDisplay();
    this.reset();
  }
});
updateDisplay();
  
