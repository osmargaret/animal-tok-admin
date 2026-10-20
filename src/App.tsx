import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { 
  LayoutDashboard, 
  Users, 
  PawPrint, 
  Settings, 
  Bell, 
  Search, 
  CheckCircle2, 
  Trash2, 
  Video, 
  ShoppingBag, 
  Calendar, 
  RefreshCw,
  TrendingUp,
  Heart,
  AlertTriangle,
  ShieldAlert,
  FileText,
  UserX,
  UserCheck,
  UserPlus,
  Mail,
  Key,
  ShieldCheck,
  Check,
  Eye,
  Play,
  X,
  MapPin,
  Clock,
  CheckSquare
} from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  username: string;
  avatar: string;
  coverImage?: string;
  breed: string;
  age?: string;
  location?: string;
  bio?: string;
  handlerName: string;
  followersCount?: number;
  followers?: number;
  photos?: string[];
  isVerified?: boolean;
}

interface UserItem {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status?: 'active' | 'suspended' | 'banned';
  subscriptionPlan: string;
}

interface PostItem {
  id: string;
  animalId?: string;
  animalName: string;
  animalAvatar: string;
  videoUrl?: string;
  imageUrl?: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  createdAt: string;
}

interface ProductItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  sellerName: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

interface ServiceItem {
  id: string;
  title: string;
  providerName: string;
  category: string;
  price: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

interface ReportItem {
  id: string;
  targetType: string;
  targetId: string;
  targetTitle: string;
  reason: string;
  reporterName: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  details: string;
  timestamp: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  invitedAt: string;
}

interface DashboardStats {
  totalAnimals?: number;
  totalUsers?: number;
  totalPosts?: number;
  totalProducts?: number;
  totalServices?: number;
  totalEvents?: number;
  totalReports?: number;
  totalFollows?: number;
  totalLikes?: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles' | 'users' | 'reports' | 'approvals' | 'posts' | 'audit' | 'settings'>('dashboard');
  const [stats, setStats] = useState<DashboardStats>({});
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Modals & Panels State
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(3);

  // Settings Form States
  const [adminEmail, setAdminEmail] = useState('admin@animaltok.com');
  const [adminName, setAdminName] = useState('System Admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // System Configuration Toggles
  const [autoApproveVerified, setAutoApproveVerified] = useState(true);
  const [enable2FA, setEnable2FA] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [socketActive, setSocketActive] = useState(true);

  // Invite Form States
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'moderator'>('moderator');
  const [inviteMsg, setInviteMsg] = useState('');

  const fetchDashboardData = () => {
    setLoading(true);
    fetch('http://localhost:5000/api/admin/dashboard')
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.animals) setAnimals(data.animals);
        if (data.users) setUsers(data.users);
        if (data.posts) setPosts(data.posts);
        if (data.products) setProducts(data.products);
        if (data.services) setServices(data.services);
        if (data.reports) setReports(data.reports);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.teamMembers) setTeamMembers(data.teamMembers);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  };

  // Real-time WebSockets Listener
  useEffect(() => {
    fetchDashboardData();

    // Connect to backend Socket.IO engine
    const socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      console.log("⚡ Connected to real-time AnimalTok socket engine.");
    });

    socket.on('followers_updated', () => fetchDashboardData());
    socket.on('post_stats_updated', () => fetchDashboardData());
    socket.on('new_comment', () => fetchDashboardData());
    socket.on('post_created', () => fetchDashboardData());
    socket.on('animal_updated', () => fetchDashboardData());

    const interval = setInterval(fetchDashboardData, 5000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const handleToggleVerify = (animalId: string) => {
    fetch(`http://localhost:5000/api/admin/animals/${animalId}/verify`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to verify animal:", err));
  };

  const handleUserStatusToggle = (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to update status:", err));
  };

  const handleSubscriptionChange = (userId: string, plan: string) => {
    fetch(`http://localhost:5000/api/admin/users/${userId}/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionPlan: plan })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to update subscription:", err));
  };

  const handleReportAction = (reportId: string, action: 'resolved' | 'dismissed') => {
    fetch(`http://localhost:5000/api/admin/reports/${reportId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed report action:", err));
  };

  const handleMarketplaceApproval = (type: 'product' | 'service', id: string, status: 'approved' | 'rejected') => {
    fetch(`http://localhost:5000/api/admin/marketplace/${type}/${id}/approval`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed approval:", err));
  };

  const confirmDeletePost = () => {
    if (!postToDelete) return;
    fetch(`http://localhost:5000/api/admin/posts/${postToDelete}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setPostToDelete(null);
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to delete post:", err));
  };

  const handleInviteTeamMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    fetch('http://localhost:5000/api/admin/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole })
    })
      .then(res => res.json())
      .then(data => {
        if (data.teamMembers) setTeamMembers(data.teamMembers);
        setInviteMsg(`Invitation sent successfully to ${inviteEmail}!`);
        setInviteEmail('');
        setInviteName('');
        setTimeout(() => setInviteMsg(''), 4000);
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to invite team member:", err));
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setProfileMsg("New passwords do not match!");
      return;
    }

    fetch('http://localhost:5000/api/admin/profile/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, name: adminName, newPassword })
    })
      .then(res => res.json())
      .then(() => {
        setProfileMsg("Admin credentials updated successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setProfileMsg(''), 4000);
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to update profile:", err));
  };

  // Real-time Global Search Filtering
  const filteredAnimals = animals.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.breed?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = posts.filter(p => 
    p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.animalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingReports = reports.filter(r => r.status === 'pending');
  const pendingApprovalsCount = products.filter(p => p.approvalStatus === 'pending').length + services.filter(s => s.approvalStatus === 'pending').length;

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="mb-8 flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)' }}>
            <PawPrint color="white" size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>AnimalTok</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', margin: 0, fontWeight: 600 }}>Live Admin Portal</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </div>
          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <ShieldAlert size={18} color={pendingReports.length > 0 ? '#f87171' : 'currentColor'} />
            <span>Reports Queue ({pendingReports.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
            <ShoppingBag size={18} color={pendingApprovalsCount > 0 ? '#fbbf24' : 'currentColor'} />
            <span>Approvals ({pendingApprovalsCount})</span>
          </div>
          <div className={`nav-item ${activeTab === 'profiles' ? 'active' : ''}`} onClick={() => setActiveTab('profiles')}>
            <PawPrint size={18} />
            <span>Animal Profiles ({animals.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} />
            <span>Pet Handlers ({users.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
            <Video size={18} />
            <span>Video Content ({posts.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            <FileText size={18} />
            <span>Audit Logs ({auditLogs.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} />
            <span>Admin & Settings</span>
          </div>
        </nav>

        <div style={{ padding: 12, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 12, border: '1px solid var(--border-color)' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Backend Connection</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: socketActive ? '#34d399' : '#f87171', display: 'inline-block' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: socketActive ? '#34d399' : '#f87171' }}>
              {socketActive ? 'Real-Time Socket (Port 5000)' : 'Disconnected'}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ position: 'relative' }}>
        {/* Top App Bar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-elevated)', padding: '8px 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', width: 340 }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: 8 }} />
            <input 
              type="text" 
              placeholder="Real-time filter animals, handlers, videos..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.88rem' }}
            />
            {searchQuery && (
              <X size={16} color="var(--text-muted)" cursor="pointer" onClick={() => setSearchQuery('')} />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Real-time Refresh Button */}
            <button 
              onClick={fetchDashboardData}
              title="Click to trigger instant backend data fetch"
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--border-color)', color: 'var(--brand-primary)', padding: '6px 14px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh ({lastUpdated})</span>
            </button>

            {/* Interactive Bell Icon & Notification Panel */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
                style={{ position: 'relative', cursor: 'pointer', padding: 8, borderRadius: '50%', background: showNotifications ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              >
                <Bell size={20} color="var(--text-secondary)" />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 4, right: 4, width: 16, height: 16, borderRadius: '50%', background: '#f87171', color: 'white', fontSize: '0.65rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Notification Popover Panel */}
              {showNotifications && (
                <div className="glass-panel" style={{ position: 'absolute', top: 44, right: 0, width: 340, padding: '1rem', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderBottom: '1px solid var(--border-color)', paddingBottom: 8 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>System Notifications</h4>
                    <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto' }}>
                    <div style={{ padding: '8px 10px', background: 'rgba(248, 113, 113, 0.1)', borderLeft: '3px solid #f87171', borderRadius: 4 }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#f87171' }}>Flagged Video Report</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>@arivera reported video post_1 for dangerous stunts.</p>
                    </div>

                    <div style={{ padding: '8px 10px', background: 'rgba(251, 191, 36, 0.1)', borderLeft: '3px solid #fbbf24', borderRadius: 4 }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#fbbf24' }}>Marketplace Review</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>New product "Organic Salmon Oil" awaiting admin approval.</p>
                    </div>

                    <div style={{ padding: '8px 10px', background: 'rgba(56, 189, 248, 0.1)', borderLeft: '3px solid #38bdf8', borderRadius: 4 }}>
                      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8' }}>New Pet Handler Joined</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Clemence registered animal profile @bella.lab</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Clickable Admin Profile Card */}
            <div 
              onClick={() => setActiveTab('settings')}
              title="Click to open Admin Profile & Settings"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                cursor: 'pointer', 
                padding: '6px 12px', 
                borderRadius: 'var(--radius-full)', 
                background: activeTab === 'settings' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                border: activeTab === 'settings' ? '1px solid var(--brand-primary)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = activeTab === 'settings' ? 'rgba(56, 189, 248, 0.15)' : 'transparent')}
            >
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>{adminName}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#34d399' }}>● Online</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, boxShadow: '0 0 10px rgba(56, 189, 248, 0.4)' }}>
                A
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard View */}
        <div className="dashboard-scroll">
          {activeTab === 'dashboard' && (
            <>
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Platform Overview</h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Real-time stats, flagged items, and pending marketplace approvals.</p>
                </div>
              </div>

              {/* Metric Cards */}
              <div className="metric-grid">
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <PawPrint size={56} className="metric-icon" color="var(--brand-primary)" />
                  <span className="metric-title">Animal Profiles</span>
                  <span className="metric-value text-gradient">{stats.totalAnimals || animals.length}</span>
                </div>
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <Users size={56} className="metric-icon" color="var(--brand-secondary)" />
                  <span className="metric-title">Registered Handlers</span>
                  <span className="metric-value">{stats.totalUsers || users.length}</span>
                </div>
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <ShieldAlert size={56} className="metric-icon" color="#f87171" />
                  <span className="metric-title">Pending Reports</span>
                  <span className="metric-value" style={{ color: '#f87171' }}>{pendingReports.length}</span>
                </div>
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <ShoppingBag size={56} className="metric-icon" color="#f59e0b" />
                  <span className="metric-title">Pending Approvals</span>
                  <span className="metric-value" style={{ color: '#fbbf24' }}>{pendingApprovalsCount}</span>
                </div>
              </div>

              {/* Secondary Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Heart color="#f43f5e" size={24} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Likes</span>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{stats.totalLikes || 0}</h4>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <TrendingUp color="#38bdf8" size={24} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Platform Follows</span>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{stats.totalFollows || 0}</h4>
                  </div>
                </div>
                <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Calendar color="#a855f7" size={24} />
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pet Events</span>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>{stats.totalEvents || 0}</h4>
                  </div>
                </div>
              </div>

              {/* Animal Profiles Preview */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.25rem' }}>Recent Animal Profiles</h3>
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Pet Name</th>
                        <th>Breed / Species</th>
                        <th>Handler</th>
                        <th>Followers</th>
                        <th>Verified</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAnimals.map((animal) => (
                        <tr key={animal.id}>
                          <td style={{ fontWeight: 600 }}>
                            <span style={{ marginRight: 8 }}>{animal.avatar}</span>
                            {animal.name} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({animal.username})</span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{animal.breed || 'Pet'}</td>
                          <td>{animal.handlerName || 'Sarah'}</td>
                          <td>{((animal.followersCount || animal.followers || 0)).toLocaleString()}</td>
                          <td>
                            {animal.isVerified ? (
                              <span className="status-badge status-active" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={12} /> Verified
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unverified</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button 
                                onClick={() => setSelectedAnimal(animal)}
                                title="View full pet profile details"
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '5px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <Eye size={14} /> View
                              </button>
                              <button 
                                onClick={() => handleToggleVerify(animal.id)}
                                style={{ background: animal.isVerified ? 'rgba(239, 68, 68, 0.1)' : 'rgba(56, 189, 248, 0.1)', border: '1px solid var(--border-color)', color: animal.isVerified ? '#f87171' : 'var(--brand-primary)', padding: '5px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                {animal.isVerified ? 'Unverify' : 'Verify'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'reports' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldAlert color="#f87171" size={24} /> Flagged Content & Reports Queue
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Review safety alerts, spam reports, and community policy violations.</p>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Target Type</th>
                      <th>Content / Title</th>
                      <th>Reason</th>
                      <th>Reporter</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <span className="status-badge" style={{ background: 'rgba(248, 113, 113, 0.15)', color: '#f87171', textTransform: 'uppercase' }}>
                            {report.targetType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{report.targetTitle}</td>
                        <td style={{ color: '#fbbf24' }}>
                          <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
                          {report.reason}
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{report.reporterName}</td>
                        <td>
                          <span className="status-badge" style={{ background: report.status === 'pending' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(52, 211, 153, 0.15)', color: report.status === 'pending' ? '#fbbf24' : '#34d399' }}>
                            {report.status}
                          </span>
                        </td>
                        <td>
                          {report.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button 
                                onClick={() => handleReportAction(report.id, 'resolved')}
                                style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '4px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                              >
                                Resolve
                              </button>
                              <button 
                                onClick={() => handleReportAction(report.id, 'dismissed')}
                                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}
                              >
                                Dismiss
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Actioned</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShoppingBag color="#fbbf24" size={24} /> Marketplace Listing Approvals
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Review seller products & services before they go live on the public store.</p>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '16px 0 10px 0' }}>Products Awaiting Review</h3>
              <div className="data-table-wrap" style={{ marginBottom: 24 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Seller</th>
                      <th>Status</th>
                      <th>Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td style={{ fontWeight: 600 }}>{prod.title}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{prod.category}</td>
                        <td style={{ color: '#34d399', fontWeight: 600 }}>{prod.currency}{prod.price}</td>
                        <td>{prod.sellerName}</td>
                        <td>
                          <span className="status-badge" style={{ background: prod.approvalStatus === 'approved' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)', color: prod.approvalStatus === 'approved' ? '#34d399' : '#fbbf24' }}>
                            {prod.approvalStatus || 'approved'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => handleMarketplaceApproval('product', prod.id, 'approved')}
                              style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '4px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleMarketplaceApproval('product', prod.id, 'rejected')}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #f87171', color: '#f87171', padding: '4px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '16px 0 10px 0' }}>Services Awaiting Review</h3>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Provider</th>
                      <th>Status</th>
                      <th>Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((serv) => (
                      <tr key={serv.id}>
                        <td style={{ fontWeight: 600 }}>{serv.title}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{serv.category}</td>
                        <td style={{ color: '#38bdf8', fontWeight: 600 }}>{serv.price}</td>
                        <td>{serv.providerName}</td>
                        <td>
                          <span className="status-badge" style={{ background: serv.approvalStatus === 'approved' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)', color: serv.approvalStatus === 'approved' ? '#34d399' : '#fbbf24' }}>
                            {serv.approvalStatus || 'approved'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => handleMarketplaceApproval('service', serv.id, 'approved')}
                              style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '4px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleMarketplaceApproval('service', serv.id, 'rejected')}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #f87171', color: '#f87171', padding: '4px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem' }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Animal Profiles Directory</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage pet accounts, verification badges, and handler links.</p>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Avatar</th>
                      <th>Pet Name</th>
                      <th>Username</th>
                      <th>Breed</th>
                      <th>Handler</th>
                      <th>Followers</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAnimals.map((animal) => (
                      <tr key={animal.id}>
                        <td style={{ fontSize: '1.5rem' }}>{animal.avatar}</td>
                        <td style={{ fontWeight: 600 }}>{animal.name}</td>
                        <td style={{ color: 'var(--brand-primary)' }}>{animal.username}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{animal.breed}</td>
                        <td>{animal.handlerName}</td>
                        <td>{(animal.followersCount || animal.followers || 0).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => setSelectedAnimal(animal)}
                              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Eye size={14} /> View
                            </button>
                            <button 
                              onClick={() => handleToggleVerify(animal.id)}
                              style={{ background: animal.isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: animal.isVerified ? '#34d399' : 'white', padding: '6px 12px', borderRadius: 'var(--radius-full)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <CheckCircle2 size={14} color={animal.isVerified ? '#34d399' : '#64748b'} />
                              <span>{animal.isVerified ? 'Verified Pet' : 'Click to Verify'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Registered Handlers & Account Governance</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage pet owners, ban/suspend accounts, and adjust subscription plans.</p>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Handler Name</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Account Status</th>
                      <th>Subscription Plan</th>
                      <th>Governance Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 600 }}>
                          {user.name}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>@{user.username}</td>
                        <td>
                          <span className="status-badge" style={{ background: user.role === 'business' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(56, 189, 248, 0.15)', color: user.role === 'business' ? '#c084fc' : '#38bdf8' }}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className="status-badge" style={{ background: user.status === 'suspended' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)', color: user.status === 'suspended' ? '#f87171' : '#34d399' }}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td>
                          <select 
                            value={user.subscriptionPlan || 'free'}
                            onChange={(e) => handleSubscriptionChange(user.id, e.target.value)}
                            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', color: 'white', padding: '4px 8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                          >
                            <option value="free">Free Tier</option>
                            <option value="basic">Basic Business ($19/mo)</option>
                            <option value="enterprise">Enterprise Pro ($99/mo)</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleUserStatusToggle(user.id, user.status)}
                            style={{ background: user.status === 'suspended' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--border-color)', color: user.status === 'suspended' ? '#34d399' : '#f87171', padding: '5px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                          >
                            {user.status === 'suspended' ? <UserCheck size={14} /> : <UserX size={14} />}
                            <span>{user.status === 'suspended' ? 'Reinstate' : 'Suspend'}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Video Content Moderation</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Review platform posts, comments count, and enforce content safety policies.</p>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Caption</th>
                      <th>Likes</th>
                      <th>Comments</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id}>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ marginRight: 6 }}>{post.animalAvatar}</span>
                          {post.animalName}
                        </td>
                        <td style={{ maxWidth: 350, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                          {post.caption}
                        </td>
                        <td>❤️ {post.likesCount?.toLocaleString()}</td>
                        <td>💬 {post.commentsCount}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button 
                              onClick={() => setSelectedPost(post)}
                              style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Play size={14} /> Preview
                            </button>
                            <button 
                              onClick={() => setPostToDelete(post.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Trash2 size={14} /> Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText color="#38bdf8" size={24} /> Moderator Audit Logs
                </h2>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Timestamped security trail of all actions performed by administrators.</p>
              </div>
              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Admin User</th>
                      <th>Action Performed</th>
                      <th>Details & Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{log.timestamp}</td>
                        <td style={{ fontWeight: 600 }}>{log.adminName}</td>
                        <td>
                          <span className="status-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                            {log.action}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
              
              {/* Card 1: Admin Profile & Credentials */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ShieldCheck color="#38bdf8" size={24} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Admin Profile & Credentials</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Update email, name, and admin security password.</p>
                  </div>
                </div>

                {profileMsg && (
                  <div style={{ padding: '8px 12px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: 8, color: '#34d399', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={16} /> {profileMsg}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Admin Display Name</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px' }}>
                      <Users size={16} color="var(--text-muted)" style={{ marginRight: 8 }} />
                      <input 
                        type="text" 
                        value={adminName} 
                        onChange={(e) => setAdminName(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>Admin Email Address</label>
                    <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px' }}>
                      <Mail size={16} color="var(--text-muted)" style={{ marginRight: 8 }} />
                      <input 
                        type="email" 
                        value={adminEmail} 
                        onChange={(e) => setAdminEmail(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                      />
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 4 }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Change Password</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div>
                        <input 
                          type="password" 
                          placeholder="Current password" 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'white', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <input 
                          type="password" 
                          placeholder="New password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'white', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                        />
                      </div>
                      <div>
                        <input 
                          type="password" 
                          placeholder="Confirm new password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'white', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    style={{ background: 'linear-gradient(135deg, #38bdf8, #818cf8)', border: 'none', color: 'white', padding: '10px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <Key size={16} /> Save Admin Profile
                  </button>
                </form>
              </div>

              {/* Card 2: Invite Admins & Moderators */}
              <div className="glass-panel" style={{ padding: '1.5rem' }}>
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <UserPlus color="#818cf8" size={24} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Invite Admins & Moderators</h3>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Grant moderation privileges to team members.</p>
                  </div>
                </div>

                {inviteMsg && (
                  <div style={{ padding: '8px 12px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: 8, color: '#34d399', fontSize: '0.85rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={16} /> {inviteMsg}
                  </div>
                )}

                <form onSubmit={handleInviteTeamMember} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Email Address</label>
                    <input 
                      type="email" 
                      placeholder="colleague@animaltok.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'white', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Full Name (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="Alex Rivera" 
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'white', outline: 'none', width: '100%', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Role Permission</label>
                      <select 
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as 'admin' | 'moderator')}
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '8px 12px', color: 'white', outline: 'none', width: '100%', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        <option value="moderator">Moderator (Reports & Content)</option>
                        <option value="admin">Full Admin (All Controls)</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    style={{ background: 'rgba(129, 140, 248, 0.15)', border: '1px solid #818cf8', color: '#818cf8', padding: '9px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <UserPlus size={16} /> Send Invitation Email
                  </button>
                </form>

                {/* Team Members List */}
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>Active Team Members ({teamMembers.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {teamMembers.map(member => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>{member.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="status-badge" style={{ background: member.role === 'Super Admin' || member.role === 'Admin' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(168, 85, 247, 0.15)', color: member.role === 'Super Admin' || member.role === 'Admin' ? '#38bdf8' : '#c084fc', fontSize: '0.7rem' }}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: System & Security Rules */}
              <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 12 }}>Platform & Security Configuration</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Auto-Approve Verified Animals</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically grant verified status to registered business profiles</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={autoApproveVerified} 
                      onChange={(e) => setAutoApproveVerified(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Two-Factor Authentication (2FA)</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Require 2FA code on admin login</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={enable2FA} 
                      onChange={(e) => setEnable2FA(e.target.checked)}
                      style={{ width: 18, height: 18, cursor: 'pointer' }} 
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.9rem' }}>Realtime Socket Engine</h4>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Broadcast live post likes, comments, & follower changes</p>
                    </div>
                    <span 
                      onClick={() => setSocketActive(!socketActive)}
                      className="status-badge" 
                      style={{ background: socketActive ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)', color: socketActive ? '#34d399' : '#f87171', cursor: 'pointer' }}
                    >
                      {socketActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      {/* --- INTERACTIVE MODALS --- */}

      {/* 1. Animal Profile Detail Modal */}
      {selectedAnimal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 550, maxHeight: '90vh', overflowY: 'auto', padding: 0, overflow: 'hidden', position: 'relative' }}>
            <button 
              onClick={() => setSelectedAnimal(null)}
              style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            <div style={{ height: 160, backgroundImage: `url(${selectedAnimal.coverImage || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800&auto=format&fit=crop&q=80'})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', bottom: -30, left: 24, fontSize: '3.5rem', width: 70, height: 70, borderRadius: '50%', background: 'var(--bg-surface)', border: '3px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)' }}>
                {selectedAnimal.avatar}
              </div>
            </div>

            <div style={{ padding: '40px 24px 24px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {selectedAnimal.name}
                    {selectedAnimal.isVerified && <CheckCircle2 size={18} color="#34d399" />}
                  </h3>
                  <p style={{ margin: 0, color: 'var(--brand-primary)', fontWeight: 600 }}>{selectedAnimal.username}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="status-badge status-active">{selectedAnimal.breed || 'Pet'}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, margin: '16px 0', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Followers</span>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{((selectedAnimal.followersCount || selectedAnimal.followers || 0)).toLocaleString()}</p>
                </div>
                <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: 16 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Location</span>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={14} color="#38bdf8" /> {selectedAnimal.location || 'United States'}
                  </p>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                {selectedAnimal.bio || 'Official pet account on AnimalTok.'}
              </p>

              <div style={{ marginTop: 20 }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Photo Gallery</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  {(selectedAnimal.photos || [selectedAnimal.coverImage]).map((img, idx) => (
                    <img key={idx} src={img} alt="Pet photo" style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Video Preview Modal */}
      {selectedPost && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 440, padding: 0, overflow: 'hidden', position: 'relative' }}>
            <button 
              onClick={() => setSelectedPost(null)}
              style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}
            >
              <X size={18} />
            </button>

            <div style={{ background: '#000', height: 380, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {selectedPost.videoUrl ? (
                <video src={selectedPost.videoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <img src={selectedPost.imageUrl} alt="Post content" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '1.5rem' }}>{selectedPost.animalAvatar}</span>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{selectedPost.animalName}</h4>
              </div>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {selectedPost.caption}
              </p>
              <div style={{ display: 'flex', gap: 16, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>❤️ {selectedPost.likesCount?.toLocaleString()} Likes</span>
                <span>💬 {selectedPost.commentsCount} Comments</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Modal */}
      {postToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 400, padding: '1.5rem', textAlign: 'center' }}>
            <AlertTriangle size={48} color="#f87171" style={{ marginBottom: 12 }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Confirm Post Removal</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '8px 0 20px 0' }}>
              Are you sure you want to delete this video post from AnimalTok? This moderation action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button 
                onClick={() => setPostToDelete(null)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDeletePost}
                style={{ background: '#f87171', border: 'none', color: 'white', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
              >
                Yes, Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
