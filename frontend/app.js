// ===== AUTH SYSTEM =====
const USERS = [
  { email: 'admin@tmanager.io', password: 'admin123', name: 'Alex Kumar', role: 'admin', initials: 'AK' },
  { email: 'member@tmanager.io', password: 'member123', name: 'Sarah Chen', role: 'member', initials: 'SC' },
];
let currentUser = null;
let selectedRole = 'admin';

// ===== DOM REFS =====
const $ = s => document.querySelector(s);
const sidebar = $('#sidebar'), overlay = $('#sidebarOverlay'), pageContent = $('#pageContent');
const pageTitle = $('#pageTitle'), breadcrumb = $('#breadcrumbCurrent');
let charts = [];

// ===== THEME =====
function initTheme() {
  const saved = localStorage.getItem('tmanager-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeUI(saved);
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('tmanager-theme', next);
  updateThemeUI(next);
}
function updateThemeUI(t) {
  $('#themeIcon').textContent = t === 'dark' ? '☀️' : '🌙';
  $('#themeLabel').textContent = t === 'dark' ? 'Light Mode' : 'Dark Mode';
}

// ===== NAV =====
function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
  breadcrumb.textContent = page === 'dashboard' ? 'Overview' : page.charAt(0).toUpperCase() + page.slice(1);
  charts.forEach(c => c.destroy()); charts = [];
  pageContent.style.animation = 'none'; pageContent.offsetHeight; pageContent.style.animation = '';
  const renderers = { dashboard: renderDashboard, projects: renderProjects, tasks: renderTasks, team: renderTeam, calendar: renderCalendar, activity: renderActivity, reports: renderReports, settings: renderSettings };
  (renderers[page] || renderPlaceholder)(page);
}

// ===== HELPERS =====
function avatarHTML(member, size='sm') {
  if (member.img) return `<img class="avatar avatar-${size}" src="${member.img}" alt="${member.name}" style="object-fit:cover" />`;
  return `<div class="avatar avatar-${size}" style="background:${member.color}">${member.initials}</div>`;
}
function memberAvatars(ids) {
  return `<div class="avatar-group">${ids.slice(0,3).map(id => avatarHTML(TEAM.find(t=>t.id===id))).join('')}${ids.length>3?`<div class="avatar avatar-sm" style="background:var(--sage)">+${ids.length-3}</div>`:''}</div>`;
}
function progressBar(pct, color='var(--sage)') {
  return `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${color}"></div></div>`;
}

// ===== DASHBOARD =====
function renderDashboard() {
  const total = TASKS.length, done = TASKS.filter(t=>t.status==='completed').length;
  const pending = TASKS.filter(t=>t.status==='pending').length;
  const overdue = TASKS.filter(t=>new Date(t.due)<new Date()&&t.status!=='completed').length;

  pageContent.innerHTML = `
  <div class="stats-grid">
    <div class="stat-card"><div class="stat-icon forest"><img src="https://cdn-icons-png.flaticon.com/64/2921/2921222.png" width="22" alt="tasks"/></div><div class="stat-value">${total}</div><div class="stat-label">Total Tasks</div><div class="stat-change up">↑ 12% this week</div></div>
    <div class="stat-card"><div class="stat-icon sage"><img src="https://cdn-icons-png.flaticon.com/64/845/845646.png" width="22" alt="done"/></div><div class="stat-value">${done}</div><div class="stat-label">Completed</div><div class="stat-change up">↑ 8% this week</div></div>
    <div class="stat-card"><div class="stat-icon sand"><img src="https://cdn-icons-png.flaticon.com/64/2088/2088617.png" width="22" alt="pending"/></div><div class="stat-value">${pending}</div><div class="stat-label">Pending</div><div class="stat-change down">↓ 5% this week</div></div>
    <div class="stat-card"><div class="stat-icon danger"><img src="https://cdn-icons-png.flaticon.com/64/595/595067.png" width="22" alt="overdue"/></div><div class="stat-value">${overdue}</div><div class="stat-label">Overdue</div><div class="stat-change down">↓ 2 from last week</div></div>
  </div>
  <div class="grid-2">
    <div class="card"><div class="card-header"><div><div class="card-title">Productivity Trend</div><div class="card-subtitle">Tasks completed per week</div></div></div><div class="chart-wrap"><canvas id="lineChart"></canvas></div></div>
    <div class="card"><div class="card-header"><div><div class="card-title">Task Status</div><div class="card-subtitle">Current distribution</div></div></div><div class="chart-wrap"><canvas id="donutChart"></canvas></div></div>
  </div>
  <div class="grid-3">
    <div class="card"><div class="card-header"><div class="card-title">Recent Activity</div></div><div class="timeline">${ACTIVITY.map(a=>`<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-text">${a.text}</div><div class="timeline-time">${a.time}</div></div></div>`).join('')}</div></div>
    <div class="card"><div class="card-header"><div class="card-title">Upcoming Deadlines</div></div><div class="deadline-list">${DEADLINES.map(d=>`<div class="deadline-item"><div class="deadline-color" style="background:${d.color}"></div><div class="deadline-info"><div class="deadline-title">${d.title}</div><div class="deadline-date">${d.date}</div></div></div>`).join('')}</div></div>
    <div class="card"><div class="card-header"><div class="card-title">Team</div></div>${TEAM.slice(0,4).map(m=>`<div style="display:flex;align-items:center;gap:10px;padding:6px 0"><div class="avatar avatar-sm" style="background:${m.color}">${m.initials}</div><div style="flex:1"><div style="font-size:.8rem;font-weight:550">${m.name}</div><div style="font-size:.68rem;color:var(--text3)">${m.role}</div></div>${m.online?'<span class="online-dot"></span>':''}</div>`).join('')}</div>
  </div>
  <div class="card" style="margin-bottom:28px"><div class="card-header"><div><div class="card-title">Project Progress</div><div class="card-subtitle">Active projects overview</div></div></div><div class="chart-wrap"><canvas id="barChart"></canvas></div></div>`;
  initCharts();
}

function initCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? 'rgba(239,239,233,0.06)' : 'rgba(34,48,48,0.06)';
  const textColor = isDark ? '#959D90' : '#959D90';
  const defaults = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{grid:{display:false},ticks:{color:textColor,font:{family:'Outfit'}}},y:{grid:{color:gridColor},ticks:{color:textColor,font:{family:'Outfit'}}}} };

  // Line chart
  const lineCtx = document.getElementById('lineChart');
  if(lineCtx) {
    charts.push(new Chart(lineCtx, { type:'line', data:{ labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], datasets:[{data:[3,5,4,7,6,8,9],borderColor:'#523D35',backgroundColor:'rgba(82,61,53,0.08)',fill:true,tension:.4,pointRadius:4,pointBackgroundColor:'#523D35',borderWidth:2}]}, options:{...defaults} }));
  }
  // Donut chart
  const donutCtx = document.getElementById('donutChart');
  if(donutCtx) {
    const counts = ['pending','in-progress','review','completed'].map(s=>TASKS.filter(t=>t.status===s).length);
    charts.push(new Chart(donutCtx, { type:'doughnut', data:{ labels:['Pending','In Progress','Review','Completed'], datasets:[{data:counts,backgroundColor:['#BBA58F','#523D35','#959D90','#223030'],borderWidth:0,borderRadius:4}]}, options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{position:'bottom',labels:{padding:12,usePointStyle:true,pointStyle:'circle',color:textColor,font:{family:'Outfit',size:11}}}}} }));
  }
  // Bar chart
  const barCtx = document.getElementById('barChart');
  if(barCtx) {
    charts.push(new Chart(barCtx, { type:'bar', data:{ labels:PROJECTS.map(p=>p.name), datasets:[{label:'Completed',data:PROJECTS.map(p=>p.done),backgroundColor:'#223030',borderRadius:6},{label:'Remaining',data:PROJECTS.map(p=>p.tasks-p.done),backgroundColor:'#E8D9CD',borderRadius:6}]}, options:{...defaults,plugins:{legend:{display:true,position:'top',labels:{usePointStyle:true,pointStyle:'circle',color:textColor,font:{family:'Outfit',size:11},padding:16}}},scales:{...defaults.scales,x:{...defaults.scales.x,stacked:true},y:{...defaults.scales.y,stacked:true}}} }));
  }
}

// ===== PROJECTS =====
function renderProjects() {
  pageContent.innerHTML = `<h2 class="section-title">All Projects</h2><div class="projects-grid">${PROJECTS.map(p=>`
    <div class="project-card">
      <div class="project-card-header"><img class="project-img" src="${p.img}" alt="${p.name}" />${memberAvatars(p.members)}</div>
      <div class="project-name">${p.name}</div>
      <div class="project-desc">${p.desc}</div>
      <div class="project-stats"><div class="project-stat"><span>${p.tasks}</span>Tasks</div><div class="project-stat"><span>${p.done}</span>Done</div><div class="project-stat"><span>${p.progress}%</span>Progress</div></div>
      ${progressBar(p.progress, p.progress>75?'#223030':p.progress>50?'#959D90':'#BBA58F')}
      <div class="project-footer" style="margin-top:12px"><div class="project-deadline"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> ${p.deadline}</div><button class="btn btn-secondary" style="padding:5px 12px;font-size:.72rem">View</button></div>
    </div>`).join('')}</div>`;
}

// ===== TASKS (KANBAN) =====
function renderTasks() {
  const cols = [{key:'pending',label:'Pending',color:'#BBA58F'},{key:'in-progress',label:'In Progress',color:'#523D35'},{key:'review',label:'Review',color:'#959D90'},{key:'completed',label:'Completed',color:'#223030'}];
  pageContent.innerHTML = `<h2 class="section-title">Task Board</h2><div class="kanban">${cols.map(col=>{
    const tasks = TASKS.filter(t=>t.status===col.key);
    return `<div class="kanban-col"><div class="kanban-col-header"><div class="kanban-col-title"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${col.color}"></span>${col.label}<span class="kanban-count">${tasks.length}</span></div></div>
    <div class="kanban-cards" data-status="${col.key}">${tasks.map(t=>{
      const m = TEAM.find(x=>x.id===t.assignee);
      const isOverdue = new Date(t.due)<new Date()&&t.status!=='completed';
      return `<div class="task-card" draggable="true" data-id="${t.id}">
        <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:6px"><span class="priority-badge ${t.priority}">${t.priority}</span>${m?avatarHTML(m):''}</div>
        <div class="task-card-title">${t.title}</div>
        <div class="task-meta"><span>${t.project}</span></div>
        <div class="task-footer"><div class="task-due${isOverdue?' overdue':''}"><svg width="11" height="11" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> ${t.due}</div></div>
      </div>`;
    }).join('')}</div><button class="add-task-btn" onclick="openModal()">+ Add Task</button></div>`;
  }).join('')}</div>`;
  initDragDrop();
}

function initDragDrop() {
  document.querySelectorAll('.task-card[draggable]').forEach(card => {
    card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', card.dataset.id); card.classList.add('dragging'); });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  document.querySelectorAll('.kanban-cards').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('drag-over'); });
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
    col.addEventListener('drop', e => {
      e.preventDefault(); col.classList.remove('drag-over');
      const id = parseInt(e.dataTransfer.getData('text/plain'));
      const task = TASKS.find(t => t.id === id);
      if (task) { task.status = col.dataset.status; renderTasks(); }
    });
  });
}

// ===== TEAM =====
function renderTeam() {
  pageContent.innerHTML = `<h2 class="section-title">Team Members</h2><div class="team-grid">${TEAM.map(m=>`
    <div class="team-card">
      ${m.img ? `<img class="team-avatar" src="${m.img}" alt="${m.name}" style="object-fit:cover" />` : `<div class="team-avatar" style="background:${m.color}">${m.initials}</div>`}
      <div class="team-name">${m.online?'<span class="online-dot"></span>':''}${m.name}</div>
      <div class="team-role">${m.role}</div>
      <div class="team-stats-row">
        <div class="team-stat-item"><div class="team-stat-val">${m.tasks}</div><div class="team-stat-lbl">Tasks</div></div>
        <div class="team-stat-item"><div class="team-stat-val">${m.completed}</div><div class="team-stat-lbl">Done</div></div>
        <div class="team-stat-item"><div class="team-stat-val">${Math.round(m.completed/m.tasks*100)}%</div><div class="team-stat-lbl">Rate</div></div>
      </div>
      ${progressBar(Math.round(m.completed/m.tasks*100), m.color)}
    </div>`).join('')}</div>`;
}

// ===== CALENDAR =====
function renderCalendar() {
  const now = new Date(), year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const monthName = now.toLocaleString('default',{month:'long',year:'numeric'});
  let cells = '';
  for(let i=0;i<firstDay;i++) cells += '<div class="cal-cell empty"></div>';
  for(let d=1;d<=daysInMonth;d++){
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayTasks = TASKS.filter(t=>t.due===dateStr);
    const isToday = d===now.getDate();
    cells += `<div class="cal-cell${isToday?' today':''}"><span class="cal-day">${d}</span>${dayTasks.slice(0,2).map(t=>`<div class="cal-task" style="background:${t.priority==='urgent'?'rgba(155,107,94,.15)':'rgba(149,157,144,.12)'}; font-size:.6rem;padding:2px 4px;border-radius:4px;margin-top:2px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis">${t.title}</div>`).join('')}</div>`;
  }
  pageContent.innerHTML = `<h2 class="section-title">${monthName}</h2>
  <style>.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}.cal-header{font-size:.7rem;font-weight:600;color:var(--text3);text-align:center;padding:8px}.cal-cell{background:var(--card-bg);border-radius:var(--radius-sm);padding:8px;min-height:80px;border:1px solid var(--border);transition:all var(--transition)}.cal-cell:hover{box-shadow:var(--shadow)}.cal-cell.empty{background:transparent;border:none}.cal-cell.today{border-color:var(--sand);background:rgba(187,165,143,.06)}.cal-day{font-size:.8rem;font-weight:600}.cal-cell.today .cal-day{color:var(--brown);font-weight:700}</style>
  <div class="card"><div class="cal-grid"><div class="cal-header">Sun</div><div class="cal-header">Mon</div><div class="cal-header">Tue</div><div class="cal-header">Wed</div><div class="cal-header">Thu</div><div class="cal-header">Fri</div><div class="cal-header">Sat</div>${cells}</div></div>`;
}

// ===== ACTIVITY =====
function renderActivity() {
  pageContent.innerHTML = `<h2 class="section-title">Activity Feed</h2><div class="card"><div class="timeline">${ACTIVITY.concat(ACTIVITY).map(a=>`<div class="timeline-item"><div class="timeline-dot"></div><div class="timeline-content"><div class="timeline-text">${a.text}</div><div class="timeline-time">${a.time}</div></div></div>`).join('')}</div></div>`;
}

// ===== REPORTS =====
function renderReports() {
  pageContent.innerHTML = `<h2 class="section-title">Reports & Analytics</h2>
  <div class="grid-2">
    <div class="card"><div class="card-header"><div class="card-title">Weekly Output</div></div><div class="chart-wrap"><canvas id="reportLine"></canvas></div></div>
    <div class="card"><div class="card-header"><div class="card-title">By Priority</div></div><div class="chart-wrap"><canvas id="reportPie"></canvas></div></div>
  </div>
  <div class="card"><div class="card-header"><div class="card-title">Team Performance</div></div><div class="chart-wrap"><canvas id="reportBar"></canvas></div></div>`;
  const tc = '#959D90';
  charts.push(new Chart($('#reportLine'),{type:'line',data:{labels:['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6'],datasets:[{data:[5,8,6,12,10,15],borderColor:'#523D35',backgroundColor:'rgba(82,61,53,.08)',fill:true,tension:.4,borderWidth:2,pointRadius:4,pointBackgroundColor:'#523D35'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false},ticks:{color:tc}},y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{color:tc}}}}}));
  const pCounts = ['low','medium','high','urgent'].map(p=>TASKS.filter(t=>t.priority===p).length);
  charts.push(new Chart($('#reportPie'),{type:'doughnut',data:{labels:['Low','Medium','High','Urgent'],datasets:[{data:pCounts,backgroundColor:['#E8D9CD','#959D90','#523D35','#9B6B5E'],borderWidth:0}]},options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{position:'bottom',labels:{usePointStyle:true,pointStyle:'circle',color:tc,font:{family:'Outfit'}}}}}}));
  charts.push(new Chart($('#reportBar'),{type:'bar',data:{labels:TEAM.map(m=>m.name),datasets:[{label:'Completed',data:TEAM.map(m=>m.completed),backgroundColor:'#223030',borderRadius:6},{label:'Remaining',data:TEAM.map(m=>m.tasks-m.completed),backgroundColor:'#E8D9CD',borderRadius:6}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,labels:{usePointStyle:true,pointStyle:'circle',color:tc,font:{family:'Outfit'}}}},scales:{x:{stacked:true,grid:{display:false},ticks:{color:tc}},y:{stacked:true,grid:{color:'rgba(0,0,0,.04)'},ticks:{color:tc}}}}}));
}

// ===== SETTINGS =====
function renderSettings() {
  pageContent.innerHTML = `<h2 class="section-title">Settings</h2>
  <div class="card" style="max-width:600px">
    <div class="card-title" style="margin-bottom:18px">Profile</div>
    <div class="modal-body">
      <div class="form-group"><label class="form-label">Full Name</label><input class="form-input" value="Alex Kumar"/></div>
      <div class="form-row"><div class="form-group"><label class="form-label">Email</label><input class="form-input" value="alex@tmanager.io"/></div><div class="form-group"><label class="form-label">Role</label><input class="form-input" value="Product Lead" disabled/></div></div>
      <div class="form-group"><label class="form-label">Bio</label><textarea class="form-textarea" rows="3">Leading product strategy and team coordination at TManager.</textarea></div>
      <div style="display:flex;gap:10px;margin-top:8px"><button class="btn btn-primary">Save Changes</button><button class="btn btn-secondary">Cancel</button></div>
    </div>
  </div>
  <div class="card" style="max-width:600px;margin-top:18px">
    <div class="card-title" style="margin-bottom:18px">Preferences</div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:.85rem;font-weight:550">Dark Mode</div><div style="font-size:.72rem;color:var(--text3)">Switch between light and dark themes</div></div><button class="btn btn-secondary" onclick="toggleTheme()" style="padding:5px 14px;font-size:.75rem">Toggle</button></div>
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0"><div><div style="font-size:.85rem;font-weight:550">Email Notifications</div><div style="font-size:.72rem;color:var(--text3)">Receive task assignment alerts</div></div><button class="btn btn-secondary" style="padding:5px 14px;font-size:.75rem">Enabled</button></div>
  </div>`;
}

// ===== PLACEHOLDER =====
function renderPlaceholder(page) {
  pageContent.innerHTML = `<div style="text-align:center;padding:80px 20px"><div style="font-size:3rem;margin-bottom:16px">🚧</div><h2 style="font-size:1.3rem;font-weight:700;margin-bottom:8px">${page.charAt(0).toUpperCase()+page.slice(1)}</h2><p style="color:var(--text3);font-size:.9rem">This section is coming soon.</p></div>`;
}

// ===== MODAL =====
function openModal() {
  $('#taskModal').classList.add('active');
}
function closeModal() {
  $('#taskModal').classList.remove('active');
}

// ===== AUTH FUNCTIONS =====
function handleLogin(email, password) {
  const user = USERS.find(u => u.email === email && u.password === password && u.role === selectedRole);
  if (!user) {
    const err = $('#loginError');
    err.textContent = selectedRole === 'admin' ? 'Invalid admin credentials' : 'Invalid member credentials';
    err.classList.add('show');
    setTimeout(() => err.classList.remove('show'), 3000);
    return false;
  }
  currentUser = user;
  localStorage.setItem('tmanager-user', JSON.stringify(user));
  showApp();
  return true;
}

function showApp() {
  $('#loginScreen').classList.add('hidden');
  document.getElementById('app').style.display = 'flex';
  // Update profile in sidebar
  const profileName = document.querySelector('.profile-name');
  const profileRole = document.querySelector('.profile-role');
  const profileAvatar = document.querySelector('.profile-card .avatar');
  if (profileName) profileName.textContent = currentUser.name;
  if (profileRole) profileRole.textContent = currentUser.role === 'admin' ? 'Admin' : 'Team Member';
  if (profileAvatar) profileAvatar.textContent = currentUser.initials;

  // Role-based nav visibility
  const adminOnlyPages = ['reports', 'settings'];
  document.querySelectorAll('.nav-item').forEach(item => {
    if (currentUser.role === 'member' && adminOnlyPages.includes(item.dataset.page)) {
      item.style.display = 'none';
    } else {
      item.style.display = '';
    }
  });

  navigate('dashboard');
}

function logout() {
  currentUser = null;
  localStorage.removeItem('tmanager-user');
  document.getElementById('app').style.display = 'none';
  const screen = $('#loginScreen');
  screen.classList.remove('hidden');
  $('#loginEmail').value = '';
  $('#loginPassword').value = '';
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // Hide app initially
  document.getElementById('app').style.display = 'none';

  // Check saved session
  const saved = localStorage.getItem('tmanager-user');
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
      selectedRole = currentUser.role;
      showApp();
    } catch(e) {
      localStorage.removeItem('tmanager-user');
    }
  }

  // Role tabs
  document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedRole = tab.dataset.role;
    });
  });

  // Demo chips (auto-fill credentials)
  document.querySelectorAll('.demo-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      $('#loginEmail').value = chip.dataset.email;
      $('#loginPassword').value = chip.dataset.pass;
      selectedRole = chip.dataset.role;
      document.querySelectorAll('.role-tab').forEach(t => t.classList.toggle('active', t.dataset.role === selectedRole));
    });
  });

  // Login form submit
  $('#loginForm').addEventListener('submit', e => {
    e.preventDefault();
    handleLogin($('#loginEmail').value.trim(), $('#loginPassword').value);
  });

  // Nav clicks
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      // Role-based page guard
      if (currentUser && currentUser.role === 'member' && ['reports','settings'].includes(item.dataset.page)) return;
      navigate(item.dataset.page);
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });
  });

  // Theme
  $('#themeToggle').addEventListener('click', toggleTheme);

  // Mobile menu
  $('#mobileMenuBtn').addEventListener('click', () => { sidebar.classList.add('open'); overlay.classList.add('active'); });
  overlay.addEventListener('click', () => { sidebar.classList.remove('open'); overlay.classList.remove('active'); });

  // Modal
  $('#newTaskBtn').addEventListener('click', openModal);
  $('#closeModal').addEventListener('click', closeModal);
  $('#cancelModal').addEventListener('click', closeModal);
  $('#taskModal').addEventListener('click', e => { if(e.target.id==='taskModal') closeModal(); });

  // Save task
  $('#saveTask').addEventListener('click', () => {
    const title = $('#taskTitle').value.trim();
    if(!title) { $('#taskTitle').style.borderColor='#9B6B5E'; return; }
    TASKS.push({ id: TASKS.length+1, title, status: $('#taskStatus').value, priority: $('#taskPriority').value, project: $('#taskProject').value, assignee: 1, due: $('#taskDueDate').value || '2026-06-01' });
    closeModal();
    $('#taskTitle').value = '';
    const active = document.querySelector('.nav-item.active');
    if(active) navigate(active.dataset.page);
  });
});

