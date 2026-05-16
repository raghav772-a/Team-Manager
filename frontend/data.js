// ===== SAMPLE DATA =====
const TEAM = [
  { id: 1, name: 'Alex Kumar', role: 'Product Lead', initials: 'AK', color: '#BBA58F', tasks: 8, completed: 5, online: true, img: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Sarah Chen', role: 'UI Designer', initials: 'SC', color: '#959D90', tasks: 12, completed: 9, online: true, img: 'https://i.pravatar.cc/150?img=5' },
  { id: 3, name: 'James Park', role: 'Frontend Dev', initials: 'JP', color: '#523D35', tasks: 10, completed: 7, online: false, img: 'https://i.pravatar.cc/150?img=12' },
  { id: 4, name: 'Mia Torres', role: 'Backend Dev', initials: 'MT', color: '#223030', tasks: 9, completed: 6, online: true, img: 'https://i.pravatar.cc/150?img=9' },
  { id: 5, name: 'Liam Osei', role: 'DevOps', initials: 'LO', color: '#9B6B5E', tasks: 6, completed: 4, online: false, img: 'https://i.pravatar.cc/150?img=53' },
  { id: 6, name: 'Priya Nair', role: 'QA Engineer', initials: 'PN', color: '#7a9d7a', tasks: 11, completed: 8, online: true, img: 'https://i.pravatar.cc/150?img=23' },
];

const PROJECTS = [
  { id: 1, name: 'Brand Refresh', img: 'https://picsum.photos/seed/brand/48/48', desc: 'Complete visual identity overhaul', progress: 72, tasks: 18, done: 13, deadline: '2026-06-15', members: [1,2,3] },
  { id: 2, name: 'Mobile App v2', img: 'https://picsum.photos/seed/mobile/48/48', desc: 'Next-gen mobile experience', progress: 45, tasks: 24, done: 11, deadline: '2026-07-01', members: [3,4,2] },
  { id: 3, name: 'API Gateway', img: 'https://picsum.photos/seed/api/48/48', desc: 'Unified API management layer', progress: 88, tasks: 15, done: 13, deadline: '2026-05-30', members: [4,5] },
  { id: 4, name: 'Analytics Dashboard', img: 'https://picsum.photos/seed/analytics/48/48', desc: 'Real-time business intelligence', progress: 35, tasks: 20, done: 7, deadline: '2026-08-10', members: [1,2,6] },
  { id: 5, name: 'Auth System', img: 'https://picsum.photos/seed/auth/48/48', desc: 'SSO and role-based access', progress: 60, tasks: 12, done: 7, deadline: '2026-06-20', members: [4,5,6] },
  { id: 6, name: 'Design System', img: 'https://picsum.photos/seed/design/48/48', desc: 'Component library & tokens', progress: 90, tasks: 16, done: 14, deadline: '2026-05-25', members: [2,3] },
];

const TASKS = [
  { id: 1, title: 'Design login screens', status: 'completed', priority: 'high', project: 'Brand Refresh', assignee: 2, due: '2026-05-10' },
  { id: 2, title: 'Setup CI/CD pipeline', status: 'completed', priority: 'urgent', project: 'API Gateway', assignee: 5, due: '2026-05-12' },
  { id: 3, title: 'User research interviews', status: 'review', priority: 'medium', project: 'Mobile App v2', assignee: 1, due: '2026-05-18' },
  { id: 4, title: 'Implement JWT auth', status: 'in-progress', priority: 'urgent', project: 'Auth System', assignee: 4, due: '2026-05-20' },
  { id: 5, title: 'Dashboard wireframes', status: 'in-progress', priority: 'high', project: 'Analytics Dashboard', assignee: 2, due: '2026-05-22' },
  { id: 6, title: 'API rate limiting', status: 'pending', priority: 'medium', project: 'API Gateway', assignee: 4, due: '2026-05-25' },
  { id: 7, title: 'Color system tokens', status: 'completed', priority: 'low', project: 'Design System', assignee: 2, due: '2026-05-14' },
  { id: 8, title: 'Onboarding flow design', status: 'in-progress', priority: 'high', project: 'Brand Refresh', assignee: 2, due: '2026-05-28' },
  { id: 9, title: 'Push notifications', status: 'pending', priority: 'medium', project: 'Mobile App v2', assignee: 3, due: '2026-06-01' },
  { id: 10, title: 'Write E2E tests', status: 'review', priority: 'high', project: 'Auth System', assignee: 6, due: '2026-05-19' },
  { id: 11, title: 'Performance audit', status: 'pending', priority: 'low', project: 'Mobile App v2', assignee: 3, due: '2026-06-05' },
  { id: 12, title: 'Data viz components', status: 'in-progress', priority: 'high', project: 'Analytics Dashboard', assignee: 3, due: '2026-05-30' },
  { id: 13, title: 'Role permissions matrix', status: 'review', priority: 'urgent', project: 'Auth System', assignee: 4, due: '2026-05-17' },
  { id: 14, title: 'Typography scale', status: 'completed', priority: 'medium', project: 'Design System', assignee: 2, due: '2026-05-11' },
  { id: 15, title: 'Swagger documentation', status: 'pending', priority: 'low', project: 'API Gateway', assignee: 5, due: '2026-06-10' },
  { id: 16, title: 'Offline mode support', status: 'pending', priority: 'high', project: 'Mobile App v2', assignee: 4, due: '2026-06-15' },
  { id: 17, title: 'Chart animations', status: 'in-progress', priority: 'medium', project: 'Analytics Dashboard', assignee: 3, due: '2026-06-02' },
  { id: 18, title: 'Logo variations', status: 'completed', priority: 'high', project: 'Brand Refresh', assignee: 2, due: '2026-05-08' },
  { id: 19, title: 'Load testing', status: 'pending', priority: 'urgent', project: 'API Gateway', assignee: 5, due: '2026-05-28' },
  { id: 20, title: 'Icon library', status: 'completed', priority: 'medium', project: 'Design System', assignee: 2, due: '2026-05-13' },
];

const ACTIVITY = [
  { text: '<strong>Sarah Chen</strong> completed "Design login screens"', time: '10 min ago' },
  { text: '<strong>James Park</strong> moved "Data viz" to In Progress', time: '25 min ago' },
  { text: '<strong>Mia Torres</strong> commented on "JWT auth"', time: '1 hour ago' },
  { text: '<strong>Alex Kumar</strong> created project "Analytics Dashboard"', time: '2 hours ago' },
  { text: '<strong>Priya Nair</strong> submitted "E2E tests" for review', time: '3 hours ago' },
  { text: '<strong>Liam Osei</strong> deployed API Gateway v2.1', time: '5 hours ago' },
];

const DEADLINES = [
  { title: 'Role permissions matrix', date: 'May 17', color: '#9B6B5E' },
  { title: 'User research interviews', date: 'May 18', color: '#BBA58F' },
  { title: 'Implement JWT auth', date: 'May 20', color: '#523D35' },
  { title: 'Dashboard wireframes', date: 'May 22', color: '#959D90' },
  { title: 'API rate limiting', date: 'May 25', color: '#223030' },
];
