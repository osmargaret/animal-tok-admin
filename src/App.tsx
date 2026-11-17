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
  Megaphone,
  Music,
  Plus,
  ExternalLink,
  Pause
} from 'lucide-react';

// Backend API URL — set VITE_API_URL in Vercel env vars to your Render backend URL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_URL: string = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';


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
  isSuspended?: boolean;
  suspensionReason?: string;
  suspendedAt?: string;
  createdAt: string;
}

interface ProductItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  sellerName: string;
  image?: string;
  description?: string;
  inStock?: boolean;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

interface ServiceItem {
  id: string;
  title: string;
  providerName: string;
  category: string;
  price: string;
  image?: string;
  location?: string;
  description?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  category: string;
  petType?: string;
  image?: string;
  attendeesCount?: number;
  organizerName?: string;
  isPaid?: boolean;
  ticketPrice?: string;
  capacity?: number;
  status?: string;
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

interface AdItem {
  id: string;
  title: string;
  advertiserName: string;
  advertiserAvatar: string;
  adType: 'video' | 'image' | 'audio';
  mediaUrl: string;
  caption: string;
  category: string;
  sponsorBadge: string;
  ctaText: string;
  ctaUrl: string;
  status: 'active' | 'paused' | 'completed';
  targetType?: 'external' | 'post' | 'event' | 'service' | 'sound';
  targetId?: string;
  impressions: number;
  clicks: number;
  createdAt: string;
}

interface SoundItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  category: string;
  isPromoted: boolean;
  sponsorBadge?: string;
  coverUrl: string;
  previewUrl: string;
  usageCount: string;
  externalUrl?: string;
  status?: string;
  createdAt?: string;
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
  totalAds?: number;
  activeAds?: number;
  totalSounds?: number;
  totalAdImpressions?: number;
  totalAdClicks?: number;
}

function renderAvatar(avatar: string | undefined, name?: string, size = 36) {
  const initials = name ? name.charAt(0).toUpperCase() : '?';
  const fallback = (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, color: 'white', verticalAlign: 'middle',
      border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0
    }}>{initials}</span>
  );
  if (!avatar) return fallback;
  // Handle emoji-only avatars
  if ([...avatar].length <= 2 && !avatar.startsWith('http') && !avatar.startsWith('/')) {
    return <span style={{ fontSize: size * 0.75, display: 'inline-block', verticalAlign: 'middle' }}>{avatar}</span>;
  }
  if (avatar.startsWith('http') || avatar.startsWith('data:') || avatar.startsWith('/')) {
    return (
      <img
        src={avatar}
        alt={name || 'Avatar'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'inline-block', verticalAlign: 'middle', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}
        onError={(e) => {
          const parent = e.currentTarget.parentNode as HTMLElement;
          if (parent) {
            const fb = document.createElement('span');
            fb.textContent = initials;
            fb.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#06b6d4,#8b5cf6);display:inline-flex;align-items:center;justify-content:center;font-size:${size * 0.4}px;font-weight:700;color:white;vertical-align:middle;border:1px solid rgba(255,255,255,0.15)`;
            parent.replaceChild(fb, e.currentTarget);
          } else {
            e.currentTarget.style.display = 'none';
          }
        }}
      />
    );
  }
  return fallback;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profiles' | 'users' | 'reports' | 'approvals' | 'posts' | 'audit' | 'settings' | 'ads' | 'events'>('dashboard');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [postsFilter, setPostsFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [postToSuspend, setPostToSuspend] = useState<PostItem | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('🐾 Animal Welfare / Cruelty Violation (Zero Tolerance)');
  const [customSuspensionNote, setCustomSuspensionNote] = useState('');
  const [marketSubTab, setMarketSubTab] = useState<'approvals' | 'products' | 'services'>('approvals');

  // Event Form State
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('Saturday, Dec 5 • 11:00 AM');
  const [newEventLocation, setNewEventLocation] = useState('Zilker Park, Austin TX');
  const [newEventCategory, setNewEventCategory] = useState('Meetup');
  const [newEventPetType, setNewEventPetType] = useState('all');
  const [newEventIsPaid, setNewEventIsPaid] = useState(false);
  const [newEventPrice, setNewEventPrice] = useState('$15.00');
  const [newEventImage, setNewEventImage] = useState('https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&fit=crop');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [eventFormMsg, setEventFormMsg] = useState('');

  // Product Form State
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('19.99');
  const [newProdCategory, setNewProdCategory] = useState('Food & Treats');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&auto=format&fit=crop&q=80');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdSeller, setNewProdSeller] = useState('Animandler Official Store');
  const [prodFormMsg, setProdFormMsg] = useState('');

  // Service Form State
  const [showCreateServiceModal, setShowCreateServiceModal] = useState(false);
  const [newServTitle, setNewServTitle] = useState('');
  const [newServCategory, setNewServCategory] = useState('Grooming & Spa');
  const [newServPrice, setNewServPrice] = useState('$45/session');
  const [newServProvider, setNewServProvider] = useState('Verified Pet Specialist');
  const [newServLocation, setNewServLocation] = useState('Austin, TX & In-Home');
  const [newServDesc, setNewServDesc] = useState('');
  const [newServImage, setNewServImage] = useState('https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800&fit=crop');
  const [servFormMsg, setServFormMsg] = useState('');
  const [adsSubTab, setAdsSubTab] = useState<'campaigns' | 'sounds'>('campaigns');
  const [adsFilter, setAdsFilter] = useState<'all' | 'video' | 'image' | 'audio'>('all');
  const [ads, setAds] = useState<AdItem[]>([]);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [selectedAdForPreview, setSelectedAdForPreview] = useState<AdItem | null>(null);
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [showAddSoundModal, setShowAddSoundModal] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Create Ad Form State
  const [newAdTitle, setNewAdTitle] = useState('');
  const [newAdAdvertiser, setNewAdAdvertiser] = useState('');
  const [newAdAvatar, setNewAdAvatar] = useState('https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=150&auto=format&fit=crop&q=80');
  const [newAdType, setNewAdType] = useState<'video' | 'image' | 'audio'>('video');
  const [newAdMediaUrl, setNewAdMediaUrl] = useState('');
  const [newAdCaption, setNewAdCaption] = useState('');
  const [newAdCategory, setNewAdCategory] = useState('Pet Hospital');
  const [newAdBadge, setNewAdBadge] = useState('Verified Hospital Partner');
  const [newAdCtaText, setNewAdCtaText] = useState('Call Emergency Vet 📞');
  const [newAdCtaUrl, setNewAdCtaUrl] = useState('tel:+15125550199');
  const [adFormMsg, setAdFormMsg] = useState('');

  // Add Sound Form State
  const [newSoundTitle, setNewSoundTitle] = useState('');
  const [newSoundArtist, setNewSoundArtist] = useState('');
  const [newSoundPreviewUrl, setNewSoundPreviewUrl] = useState('');
  const [newSoundCoverUrl, setNewSoundCoverUrl] = useState('https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80');
  const [newSoundCategory, setNewSoundCategory] = useState<'Trending' | 'Promoted' | 'Sports' | 'Relaxing' | 'Funny'>('Promoted');
  const [newSoundBadge, setNewSoundBadge] = useState('Artist Spotlight');
  const [newSoundExternalUrl, setNewSoundExternalUrl] = useState('');
  const [soundFormMsg, setSoundFormMsg] = useState('');

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
  const [adminEmail, setAdminEmail] = useState('admin@animandler.com');
  const [adminName, setAdminName] = useState('System Admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');

  // System Configuration Toggles
  const [autoApproveVerified, setAutoApproveVerified] = useState(true);
  const [enable2FA, setEnable2FA] = useState(true);
  const [_securityAlerts, _setSecurityAlerts] = useState(true);
  const [socketActive, setSocketActive] = useState(true);

  // Invite Form States
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'moderator'>('moderator');
  const [inviteMsg, setInviteMsg] = useState('');

  const fetchDashboardData = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin/dashboard`)
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
        if (data.animals) setAnimals(data.animals);
        if (data.users) setUsers(data.users);
        if (data.posts) setPosts(data.posts);
        if (data.products) setProducts(data.products);
        if (data.services) setServices(data.services);
        if (data.events) setEvents(data.events);
        if (data.reports) setReports(data.reports);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        if (data.ads) setAds(data.ads);
        if (data.sounds) setSounds(data.sounds);
        if (data.teamMembers) setTeamMembers(data.teamMembers);
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch dashboard data:", err);
        setLoading(false);
      });
  };

  const handleToggleAdStatus = (adId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    fetch(`${API_URL}/api/admin/ads/${adId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to toggle ad status:", err));
  };

  const handleDeleteAd = (adId: string) => {
    if (!window.confirm("Are you sure you want to delete this ad campaign?")) return;
    fetch(`${API_URL}/api/admin/ads/${adId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to delete ad:", err));
  };

  const handleCreateAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdTitle || !newAdAdvertiser || !newAdMediaUrl) {
      setAdFormMsg("Please complete all required fields.");
      return;
    }

    fetch(`${API_URL}/api/admin/ads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newAdTitle,
        advertiserName: newAdAdvertiser,
        advertiserAvatar: newAdAvatar,
        adType: newAdType,
        mediaUrl: newAdMediaUrl,
        caption: newAdCaption,
        category: newAdCategory,
        sponsorBadge: newAdBadge,
        ctaText: newAdCtaText,
        ctaUrl: newAdCtaUrl,
        targetType: 'external',
      })
    })
      .then(res => res.json())
      .then(() => {
        setShowCreateAdModal(false);
        setNewAdTitle('');
        setNewAdAdvertiser('');
        setNewAdMediaUrl('');
        setNewAdCaption('');
        setAdFormMsg('');
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to create ad:", err));
  };

  const handleQuickPromote = (targetType: 'post' | 'event' | 'service', targetId: string) => {
    fetch(`${API_URL}/api/admin/ads/promote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId })
    })
      .then(res => res.json())
      .then(() => {
        alert(`Successfully boosted this ${targetType} to the vertical feed ads!`);
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to promote item:", err));
  };

  const handleAddSound = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoundTitle || !newSoundArtist || !newSoundPreviewUrl) {
      setSoundFormMsg("Title, Artist, and Audio URL are required.");
      return;
    }

    fetch(`${API_URL}/api/admin/sounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newSoundTitle,
        artist: newSoundArtist,
        previewUrl: newSoundPreviewUrl,
        coverUrl: newSoundCoverUrl,
        category: newSoundCategory,
        sponsorBadge: newSoundBadge,
        externalUrl: newSoundExternalUrl,
        duration: '0:30'
      })
    })
      .then(res => res.json())
      .then(() => {
        setShowAddSoundModal(false);
        setNewSoundTitle('');
        setNewSoundArtist('');
        setNewSoundPreviewUrl('');
        setSoundFormMsg('');
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to add sound:", err));
  };

  const handleDeleteSound = (soundId: string) => {
    if (!window.confirm("Remove this sound track from the catalog?")) return;
    fetch(`${API_URL}/api/admin/sounds/${soundId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to delete sound:", err));
  };

  const toggleAudioPreview = (soundId: string, url: string) => {
    if (playingAudioId === soundId && audioElement) {
      audioElement.pause();
      setPlayingAudioId(null);
      setAudioElement(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(url);
    audio.play();
    audio.onended = () => {
      setPlayingAudioId(null);
      setAudioElement(null);
    };
    setAudioElement(audio);
    setPlayingAudioId(soundId);
  };

  // Post Moderation: Suspend / Flag or Restore
  const handleToggleSuspendPost = (post: PostItem, reason?: string) => {
    const isCurrentlySuspended = Boolean(post.isSuspended);
    const nextState = !isCurrentlySuspended;
    fetch(`${API_URL}/api/admin/posts/${post.id}/suspend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isSuspended: nextState,
        reason: nextState ? (reason || suspensionReason) : undefined
      })
    })
      .then(res => res.json())
      .then(() => {
        setPostToSuspend(null);
        setCustomSuspensionNote('');
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to toggle post suspension:", err));
  };

  // Events Handlers
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) {
      setEventFormMsg("Event title is required.");
      return;
    }
    fetch(`${API_URL}/api/admin/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newEventTitle,
        date: newEventDate,
        location: newEventLocation,
        category: newEventCategory,
        petType: newEventPetType,
        isPaid: newEventIsPaid,
        ticketPrice: newEventPrice,
        image: newEventImage,
        description: newEventDesc
      })
    })
      .then(res => res.json())
      .then(() => {
        setShowCreateEventModal(false);
        setNewEventTitle('');
        setNewEventDesc('');
        setEventFormMsg('');
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to create event:", err));
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!window.confirm("Permanently delete this event from Animandler?")) return;
    fetch(`${API_URL}/api/admin/events/${eventId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to delete event:", err));
  };

  // Marketplace Products Handlers
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle) {
      setProdFormMsg("Product title is required.");
      return;
    }
    fetch(`${API_URL}/api/admin/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newProdTitle,
        price: Number(newProdPrice) || 19.99,
        category: newProdCategory,
        image: newProdImage,
        description: newProdDesc,
        sellerName: newProdSeller
      })
    })
      .then(res => res.json())
      .then(() => {
        setShowCreateProductModal(false);
        setNewProdTitle('');
        setNewProdDesc('');
        setProdFormMsg('');
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to create product:", err));
  };

  const handleDeleteProduct = (productId: string) => {
    if (!window.confirm("Delete this marketplace product listing?")) return;
    fetch(`${API_URL}/api/admin/products/${productId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to delete product:", err));
  };

  // Pet Care Services Handlers
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServTitle) {
      setServFormMsg("Service title is required.");
      return;
    }
    fetch(`${API_URL}/api/admin/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newServTitle,
        category: newServCategory,
        price: newServPrice,
        providerName: newServProvider,
        location: newServLocation,
        description: newServDesc,
        image: newServImage
      })
    })
      .then(res => res.json())
      .then(() => {
        setShowCreateServiceModal(false);
        setNewServTitle('');
        setNewServDesc('');
        setServFormMsg('');
        fetchDashboardData();
      })
      .catch(err => console.error("Failed to create service:", err));
  };

  const handleDeleteService = (serviceId: string) => {
    if (!window.confirm("Delete this pet care service listing?")) return;
    fetch(`${API_URL}/api/admin/services/${serviceId}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to delete service:", err));
  };

  // Real-time WebSockets Listener
  useEffect(() => {
    fetchDashboardData();

    // Connect to backend Socket.IO engine
    const socket = io(API_URL);
    
    socket.on('connect', () => {
      console.log("⚡ Connected to real-time Animandler socket engine.");
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
    fetch(`${API_URL}/api/admin/animals/${animalId}/verify`, { method: 'POST' })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to verify animal:", err));
  };

  const handleUserStatusToggle = (userId: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    fetch(`${API_URL}/api/admin/users/${userId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to update status:", err));
  };

  const handleSubscriptionChange = (userId: string, plan: string) => {
    fetch(`${API_URL}/api/admin/users/${userId}/subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionPlan: plan })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed to update subscription:", err));
  };

  const handleReportAction = (reportId: string, action: 'resolved' | 'dismissed') => {
    fetch(`${API_URL}/api/admin/reports/${reportId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    })
      .then(res => res.json())
      .then(() => fetchDashboardData())
      .catch(err => console.error("Failed report action:", err));
  };

  const handleMarketplaceApproval = (type: 'product' | 'service', id: string, status: 'approved' | 'rejected') => {
    fetch(`${API_URL}/api/admin/marketplace/${type}/${id}/approval`, {
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
    fetch(`${API_URL}/api/admin/posts/${postToDelete}`, { method: 'DELETE' })
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

    fetch(`${API_URL}/api/admin/team/invite`, {
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

    fetch(`${API_URL}/api/admin/profile/update`, {
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

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.animalName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (postsFilter === 'active') return !p.isSuspended;
    if (postsFilter === 'suspended') return Boolean(p.isSuspended);
    return true;
  });

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.category.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>Animandler</h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', margin: 0, fontWeight: 600 }}>Live Admin Portal</p>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </div>
          <div className={`nav-item ${activeTab === 'ads' ? 'active' : ''}`} onClick={() => setActiveTab('ads')}>
            <Megaphone size={18} color="#38bdf8" />
            <span style={{ fontWeight: 600 }}>Ads &amp; Monetization ({ads.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <ShieldAlert size={18} color={pendingReports.length > 0 ? '#f87171' : 'currentColor'} />
            <span>Reports Queue ({pendingReports.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
            <Calendar size={18} color="#06b6d4" />
            <span style={{ fontWeight: 600 }}>Events &amp; Meetups ({events.length})</span>
          </div>
          <div className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`} onClick={() => setActiveTab('approvals')}>
            <ShoppingBag size={18} color={pendingApprovalsCount > 0 ? '#fbbf24' : 'currentColor'} />
            <span>Marketplace &amp; Care ({products.length + services.length})</span>
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
            <span>Video Content &amp; Policy ({posts.length})</span>
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
                            <span style={{ marginRight: 8 }}>{renderAvatar(animal.avatar, animal.name, 28)}</span>
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

          {activeTab === 'ads' && (
            <div>
              {/* Top Banner & Header */}
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Megaphone color="#38bdf8" size={28} /> Ads &amp; Monetization Studio
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Manage company advertising (vets, animal hospitals, brands), promote artist songs in the sound picker, and boost user content to the feed.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    onClick={() => setShowAddSoundModal(true)}
                    style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#c084fc', padding: '10px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <Music size={16} /> + Add Artist Song
                  </button>
                  <button 
                    onClick={() => setShowCreateAdModal(true)}
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)' }}
                  >
                    <Plus size={18} /> + Create Ad Campaign
                  </button>
                </div>
              </div>

              {/* Ads Performance KPI Metric Cards */}
              <div className="metric-grid" style={{ marginBottom: '1.5rem' }}>
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <Megaphone size={56} className="metric-icon" color="#38bdf8" />
                  <span className="metric-title">Active Campaigns</span>
                  <span className="metric-value text-gradient">{ads.filter(a => a.status === 'active').length} / {ads.length}</span>
                </div>
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <Eye size={56} className="metric-icon" color="#34d399" />
                  <span className="metric-title">Impressions Delivered</span>
                  <span className="metric-value" style={{ color: '#34d399' }}>
                    {ads.reduce((acc, a) => acc + (Number(a.impressions) || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <TrendingUp size={56} className="metric-icon" color="#fbbf24" />
                  <span className="metric-title">Total Clicks &amp; CTR</span>
                  <span className="metric-value" style={{ color: '#fbbf24' }}>
                    {ads.reduce((acc, a) => acc + (Number(a.clicks) || 0), 0).toLocaleString()}
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 500 }}>
                      ({ads.reduce((acc, a) => acc + (Number(a.impressions) || 0), 0) > 0 
                        ? ((ads.reduce((acc, a) => acc + (Number(a.clicks) || 0), 0) / ads.reduce((acc, a) => acc + (Number(a.impressions) || 0), 0)) * 100).toFixed(1) + '%'
                        : '0%'})
                    </span>
                  </span>
                </div>
                <div className="glass-panel metric-card" style={{ position: 'relative' }}>
                  <Music size={56} className="metric-icon" color="#c084fc" />
                  <span className="metric-title">Promoted Songs in Catalog</span>
                  <span className="metric-value" style={{ color: '#c084fc' }}>{sounds.length} Tracks</span>
                </div>
              </div>

              {/* Sub Navigation Bar */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
                <button
                  onClick={() => setAdsSubTab('campaigns')}
                  style={{
                    background: adsSubTab === 'campaigns' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: adsSubTab === 'campaigns' ? '1px solid #38bdf8' : '1px solid transparent',
                    color: adsSubTab === 'campaigns' ? '#38bdf8' : 'var(--text-secondary)',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Megaphone size={16} /> Company &amp; Partner Campaigns ({ads.length})
                </button>
                <button
                  onClick={() => setAdsSubTab('sounds')}
                  style={{
                    background: adsSubTab === 'sounds' ? 'rgba(192, 132, 252, 0.15)' : 'transparent',
                    border: adsSubTab === 'sounds' ? '1px solid #c084fc' : '1px solid transparent',
                    color: adsSubTab === 'sounds' ? '#c084fc' : 'var(--text-secondary)',
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <Music size={16} /> Artist Songs &amp; Sounds Catalog ({sounds.length})
                </button>
              </div>

              {/* SUBTAB 1: CAMPAIGNS */}
              {adsSubTab === 'campaigns' && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  {/* Filter Pills */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(['all', 'video', 'image', 'audio'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setAdsFilter(type)}
                          style={{
                            background: adsFilter === type ? 'var(--brand-primary)' : 'rgba(255,255,255,0.05)',
                            color: adsFilter === type ? '#0f172a' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)',
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                          }}
                        >
                          {type === 'all' ? 'All Formats' : type === 'video' ? '🎬 Video Ads' : type === 'image' ? '🖼️ Picture Ads' : '🎵 Audio Ads'}
                        </button>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Showing {ads.filter(a => adsFilter === 'all' || a.adType === adsFilter).length} campaigns
                    </span>
                  </div>

                  {/* Campaigns Table */}
                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Advertiser / Company</th>
                          <th>Ad Format</th>
                          <th>Headline &amp; Copy</th>
                          <th>Sponsor Badge</th>
                          <th>Call To Action</th>
                          <th>Performance</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ads.filter(a => adsFilter === 'all' || a.adType === adsFilter).map(ad => (
                          <tr key={ad.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img 
                                  src={ad.advertiserAvatar || 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=150&auto=format&fit=crop&q=80'} 
                                  alt="Advertiser logo" 
                                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #06b6d4' }} 
                                />
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{ad.advertiserName}</div>
                                  <span style={{ fontSize: '0.72rem', color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: 4 }}>
                                    {ad.category || 'Vet Partner'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: 6,
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                background: ad.adType === 'video' ? 'rgba(59, 130, 246, 0.15)' : ad.adType === 'image' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                                color: ad.adType === 'video' ? '#60a5fa' : ad.adType === 'image' ? '#34d399' : '#f472b6',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                {ad.adType === 'video' ? '🎬 Vertical Video' : ad.adType === 'image' ? '🖼️ Picture Ad' : '🎵 Audio Ad'}
                              </span>
                            </td>
                            <td style={{ maxWidth: 260 }}>
                              <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)', marginBottom: 2 }}>{ad.title}</div>
                              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {ad.caption}
                              </p>
                            </td>
                            <td>
                              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                                ✨ {ad.sponsorBadge || 'Sponsored'}
                              </span>
                            </td>
                            <td>
                              <a 
                                href={ad.ctaUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  background: 'rgba(6, 182, 212, 0.15)',
                                  border: '1px solid #06b6d4',
                                  color: '#06b6d4',
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  fontSize: '0.78rem',
                                  fontWeight: 600,
                                  textDecoration: 'none'
                                }}
                              >
                                {ad.ctaText} <ExternalLink size={12} />
                              </a>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem' }}>
                                <div>👁️ <strong>{(Number(ad.impressions) || 0).toLocaleString()}</strong> views</div>
                                <div style={{ color: '#fbbf24' }}>👆 <strong>{(Number(ad.clicks) || 0).toLocaleString()}</strong> clicks</div>
                              </div>
                            </td>
                            <td>
                              <button
                                onClick={() => handleToggleAdStatus(ad.id, ad.status)}
                                style={{
                                  background: ad.status === 'active' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                                  border: `1px solid ${ad.status === 'active' ? '#34d399' : '#f59e0b'}`,
                                  color: ad.status === 'active' ? '#34d399' : '#fbbf24',
                                  padding: '4px 10px',
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  fontSize: '0.78rem',
                                  fontWeight: 700
                                }}
                              >
                                {ad.status === 'active' ? '● Active' : '⏸ Paused'}
                              </button>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => setSelectedAdForPreview(ad)}
                                  title="Preview Vertical Mobile Card"
                                  style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
                                >
                                  📱 Preview
                                </button>
                                <button
                                  onClick={() => handleDeleteAd(ad.id)}
                                  title="Delete Ad"
                                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                  <Trash2 size={14} />
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

              {/* SUBTAB 2: ARTIST SOUNDS */}
              {adsSubTab === 'sounds' && (
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Music color="#c084fc" size={22} /> Promoted Artist Songs &amp; In-App Sounds
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        These songs appear directly in the creator Sound Picker modal on the Animandler mobile app.
                      </p>
                    </div>
                  </div>

                  <div className="data-table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Track / Song</th>
                          <th>Artist Name</th>
                          <th>Category</th>
                          <th>Spotlight Badge</th>
                          <th>Listen Preview</th>
                          <th>Usage Count</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sounds.map(sound => (
                          <tr key={sound.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <img 
                                  src={sound.coverUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'} 
                                  alt="Song cover" 
                                  style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                                />
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{sound.title}</div>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>⏱ {sound.duration || '0:30'}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sound.artist}</td>
                            <td>
                              <span style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '3px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>
                                {sound.category}
                              </span>
                            </td>
                            <td>
                              <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '3px 8px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 700 }}>
                                ✨ {sound.sponsorBadge || 'Artist Spotlight'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => toggleAudioPreview(sound.id, sound.previewUrl)}
                                style={{
                                  background: playingAudioId === sound.id ? '#f43f5e' : 'rgba(56, 189, 248, 0.15)',
                                  border: `1px solid ${playingAudioId === sound.id ? '#f43f5e' : '#38bdf8'}`,
                                  color: playingAudioId === sound.id ? 'white' : '#38bdf8',
                                  padding: '6px 12px',
                                  borderRadius: 20,
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 600,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                {playingAudioId === sound.id ? <Pause size={14} /> : <Play size={14} />}
                                {playingAudioId === sound.id ? 'Stop Playing' : 'Play Preview'}
                              </button>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{sound.usageCount || 'Active'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: 6 }}>
                                {sound.externalUrl && (
                                  <a
                                    href={sound.externalUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', padding: '6px 10px', borderRadius: 6, textDecoration: 'none', display: 'flex', alignItems: 'center' }}
                                  >
                                    <ExternalLink size={14} />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleDeleteSound(sound.id)}
                                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}
                                >
                                  <Trash2 size={14} />
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
            </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <ShoppingBag color="#fbbf24" size={24} /> Marketplace &amp; Care Services Hub
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage product store inventory, verified grooming &amp; veterinary services, and review listings.</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => setShowCreateProductModal(true)}
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', padding: '10px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={16} /> + Add Product
                  </button>
                  <button
                    onClick={() => setShowCreateServiceModal(true)}
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'none', color: 'white', padding: '10px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <Plus size={16} /> + Add Service
                  </button>
                </div>
              </div>

              {/* Sub-Tabs: Pending Approvals | All Products | All Services */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 20 }}>
                <button
                  onClick={() => setMarketSubTab('approvals')}
                  style={{
                    background: marketSubTab === 'approvals' ? 'rgba(251, 191, 36, 0.15)' : 'transparent',
                    border: marketSubTab === 'approvals' ? '1px solid #fbbf24' : '1px solid transparent',
                    color: marketSubTab === 'approvals' ? '#fbbf24' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Pending Approvals ({pendingApprovalsCount})
                </button>
                <button
                  onClick={() => setMarketSubTab('products')}
                  style={{
                    background: marketSubTab === 'products' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                    border: marketSubTab === 'products' ? '1px solid #10b981' : '1px solid transparent',
                    color: marketSubTab === 'products' ? '#10b981' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  All Products ({products.length})
                </button>
                <button
                  onClick={() => setMarketSubTab('services')}
                  style={{
                    background: marketSubTab === 'services' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                    border: marketSubTab === 'services' ? '1px solid #06b6d4' : '1px solid transparent',
                    color: marketSubTab === 'services' ? '#06b6d4' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  All Services &amp; Care ({services.length})
                </button>
              </div>

              {marketSubTab === 'approvals' && (
                <>
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
                </>
              )}

              {marketSubTab === 'products' && (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Seller</th>
                        <th>Stock &amp; Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => (
                        <tr key={prod.id}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={prod.image || 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=100&auto=format&fit=crop&q=80'} alt={prod.title} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
                              <div>{prod.title}</div>
                            </div>
                          </td>
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
                                onClick={() => handleDeleteProduct(prod.id)}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {marketSubTab === 'services' && (
                <div className="data-table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Service</th>
                        <th>Category</th>
                        <th>Rate</th>
                        <th>Provider</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.map((serv) => (
                        <tr key={serv.id}>
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <img src={serv.image || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=100&fit=crop'} alt={serv.title} style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }} />
                              <div>{serv.title}</div>
                            </div>
                          </td>
                          <td style={{ color: 'var(--text-secondary)' }}>{serv.category}</td>
                          <td style={{ color: '#38bdf8', fontWeight: 600 }}>{serv.price}</td>
                          <td>{serv.providerName}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{serv.location || 'Local & Virtual'}</td>
                          <td>
                            <span className="status-badge" style={{ background: serv.approvalStatus === 'approved' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)', color: serv.approvalStatus === 'approved' ? '#34d399' : '#fbbf24' }}>
                              {serv.approvalStatus || 'approved'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button
                                onClick={() => handleQuickPromote('service', serv.id)}
                                style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                                title="Promote service into vertical feed ads"
                              >
                                <Megaphone size={14} /> Promote
                              </button>
                              <button
                                onClick={() => handleDeleteService(serv.id)}
                                style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                              >
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="glass-panel" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar color="#06b6d4" size={24} /> Community Events &amp; Meetups
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Manage local adoption drives, agility competitions, meetups, and promote events directly to the mobile feed.</p>
                </div>
                <button
                  onClick={() => setShowCreateEventModal(true)}
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'none', color: 'white', padding: '10px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <Plus size={16} /> + Create New Event
                </button>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Date &amp; Time</th>
                      <th>Location</th>
                      <th>Category</th>
                      <th>Attendees</th>
                      <th>Admission</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src={ev.image || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=100&fit=crop'} alt={ev.title} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                            <div>
                              <div>{ev.title}</div>
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host: {ev.organizerName || 'Animandler Host'}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{ev.date} {ev.time ? `• ${ev.time}` : ''}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{ev.location}</td>
                        <td>
                          <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                            {ev.category || 'Meetup'}
                          </span>
                        </td>
                        <td>{ev.attendeesCount || 1} attending</td>
                        <td>
                          <span style={{ color: ev.isPaid ? '#34d399' : '#38bdf8', fontWeight: 600 }}>
                            {ev.isPaid ? `${ev.ticketPrice || '$15'}` : 'Free'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => handleQuickPromote('event', ev.id)}
                              style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                              title="Promote event into vertical ads in user feeds"
                            >
                              <Megaphone size={14} /> Promote
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredEvents.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          No events scheduled yet. Click "+ Create New Event" above to schedule an official community pet gathering!
                        </td>
                      </tr>
                    )}
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
                        <td>{renderAvatar(animal.avatar, animal.name, 40)}</td>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Video color="#38bdf8" size={24} /> Video Content &amp; Policy Moderation
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Enforce strict zero animal cruelty policies, suspend violating posts, or permanently remove non-compliant content.</p>
                </div>
              </div>

              {/* Policy Filter Pills */}
              <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)', paddingBottom: 12, marginBottom: 20 }}>
                <button
                  onClick={() => setPostsFilter('all')}
                  style={{
                    background: postsFilter === 'all' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                    border: postsFilter === 'all' ? '1px solid #38bdf8' : '1px solid transparent',
                    color: postsFilter === 'all' ? '#38bdf8' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  All Posts ({posts.length})
                </button>
                <button
                  onClick={() => setPostsFilter('active')}
                  style={{
                    background: postsFilter === 'active' ? 'rgba(52, 211, 153, 0.15)' : 'transparent',
                    border: postsFilter === 'active' ? '1px solid #34d399' : '1px solid transparent',
                    color: postsFilter === 'active' ? '#34d399' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Active &amp; Compliant ({posts.filter(p => !p.isSuspended).length})
                </button>
                <button
                  onClick={() => setPostsFilter('suspended')}
                  style={{
                    background: postsFilter === 'suspended' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    border: postsFilter === 'suspended' ? '1px solid #f87171' : '1px solid transparent',
                    color: postsFilter === 'suspended' ? '#f87171' : 'var(--text-secondary)',
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  Suspended / Flagged ({posts.filter(p => p.isSuspended).length})
                </button>
              </div>

              <div className="data-table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Author</th>
                      <th>Caption</th>
                      <th>Engagement</th>
                      <th>Policy Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post.id} style={{ background: post.isSuspended ? 'rgba(239, 68, 68, 0.05)' : undefined }}>
                        <td style={{ fontWeight: 600 }}>
                          <span style={{ marginRight: 6 }}>{renderAvatar(post.animalAvatar, post.animalName, 28)}</span>
                          {post.animalName}
                        </td>
                        <td style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                          {post.caption}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 10, fontSize: '0.85rem' }}>
                            <span>❤️ {post.likesCount?.toLocaleString()}</span>
                            <span>💬 {post.commentsCount}</span>
                          </div>
                        </td>
                        <td>
                          {post.isSuspended ? (
                            <span style={{ background: 'rgba(239, 68, 68, 0.18)', border: '1px solid #f87171', color: '#f87171', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <AlertTriangle size={12} /> Suspended: {post.suspensionReason || 'Policy Violation'}
                            </span>
                          ) : (
                            <span style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              <CheckCircle2 size={12} /> Active &amp; Safe
                            </span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button 
                              onClick={() => setSelectedPost(post)}
                              style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                            >
                              <Play size={14} /> Preview
                            </button>
                            {!post.isSuspended ? (
                              <>
                                <button 
                                  onClick={() => handleQuickPromote('post', post.id)}
                                  style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', color: '#fbbf24', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                                  title="Promote post to vertical feed ads"
                                >
                                  <Megaphone size={14} /> Promote
                                </button>
                                <button 
                                  onClick={() => setPostToSuspend(post)}
                                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.5)', color: '#f87171', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                                  title="Suspend post for policy violation (hides from user feed)"
                                >
                                  <ShieldAlert size={14} /> Suspend Post
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleToggleSuspendPost(post)}
                                style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                                title="Restore post back to active feed"
                              >
                                <CheckCircle2 size={14} /> Restore Post
                              </button>
                            )}
                            <button 
                              onClick={() => setPostToDelete(post.id)}
                              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-color)', color: '#94a3b8', padding: '6px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
                              title="Permanently remove post from database"
                            >
                              <Trash2 size={14} /> Delete
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
              <div style={{ position: 'absolute', bottom: -30, left: 24, width: 70, height: 70, borderRadius: '50%', background: 'var(--bg-surface)', border: '3px solid var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', overflow: 'hidden' }}>
                {renderAvatar(selectedAnimal.avatar, selectedAnimal.name, 70)}
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
                <span>{renderAvatar(selectedPost.animalAvatar, selectedPost.animalName, 36)}</span>
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

      {/* 4. Create Ad Campaign Modal (with Live Smartphone Preview) */}
      {showCreateAdModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowCreateAdModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Megaphone color="#06b6d4" size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>Create Vertical Ad Campaign</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Launch sponsored ads for veterinary hospitals, pet clinics, animal brands, or promoted handlers.
                </p>
              </div>
            </div>

            {adFormMsg && (
              <div style={{ padding: '8px 14px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: 8, color: '#fca5a5', fontSize: '0.85rem', marginBottom: 16 }}>
                {adFormMsg}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'start' }}>
              {/* Form Column */}
              <form onSubmit={handleCreateAd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Company / Advertiser Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Austin Pet Emergency Hospital"
                    value={newAdAdvertiser}
                    onChange={e => setNewAdAdvertiser(e.target.value)}
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Ad Format *
                    </label>
                    <select
                      value={newAdType}
                      onChange={e => setNewAdType(e.target.value as any)}
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      <option value="video">🎬 Vertical Video Ad</option>
                      <option value="image">🖼️ Picture / Banner Ad</option>
                      <option value="audio">🎵 Audio Ad (Single / Track)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Category
                    </label>
                    <select
                      value={newAdCategory}
                      onChange={e => setNewAdCategory(e.target.value)}
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                    >
                      <option value="Pet Hospital">Pet Hospital</option>
                      <option value="Vet Care">Vet Care & Vaccines</option>
                      <option value="Emergency Care">Emergency Care 24/7</option>
                      <option value="Pet Products">Pet Products & Food</option>
                      <option value="Grooming">Pet Grooming & Spa</option>
                      <option value="Artist Music">Artist Music Promotion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Media File URL ({newAdType === 'video' ? 'Direct .mp4 video URL' : newAdType === 'image' ? 'Vertical image URL' : 'Audio .mp3 URL'}) *
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../video.mp4 or image.jpg"
                    value={newAdMediaUrl}
                    onChange={e => setNewAdMediaUrl(e.target.value)}
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Advertiser Logo / Avatar URL
                  </label>
                  <input
                    type="url"
                    value={newAdAvatar}
                    onChange={e => setNewAdAvatar(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Headline / Campaign Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 24/7 Emergency Surgery & Radiography"
                    value={newAdTitle}
                    onChange={e => setNewAdTitle(e.target.value)}
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Promotional Copy / Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter message for pet owners scrolling through the feed..."
                    value={newAdCaption}
                    onChange={e => setNewAdCaption(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      Sponsor Tag / Badge
                    </label>
                    <input
                      type="text"
                      placeholder="Verified Hospital Partner"
                      value={newAdBadge}
                      onChange={e => setNewAdBadge(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                      CTA Button Label
                    </label>
                    <input
                      type="text"
                      placeholder="Book Appointment 🩺"
                      value={newAdCtaText}
                      onChange={e => setNewAdCtaText(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    Destination Link (Website, Deep Link, or Phone)
                  </label>
                  <input
                    type="text"
                    placeholder="https://... or tel:+1512..."
                    value={newAdCtaUrl}
                    onChange={e => setNewAdCtaUrl(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', color: 'white', padding: '12px 20px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 8, boxShadow: '0 4px 14px rgba(6, 182, 212, 0.4)' }}
                >
                  Publish Vertical Ad to Feed 🚀
                </button>
              </form>

              {/* Live Vertical Mockup Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live Mobile Vertical Preview
                </span>
                <div style={{
                  width: 270,
                  height: 520,
                  borderRadius: 36,
                  border: '10px solid #1a2230',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(6,182,212,0.2)',
                  overflow: 'hidden',
                  background: '#0b0f19',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontFamily: 'Inter, sans-serif'
                }}>
                  {/* Dynamic Island / Notch */}
                  <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 70, height: 16, background: '#000', borderRadius: 12, zIndex: 30 }} />

                  {/* Media Backdrop */}
                  <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                    {newAdType === 'video' && newAdMediaUrl ? (
                      <video src={newAdMediaUrl} autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : newAdType === 'image' && newAdMediaUrl ? (
                      <img src={newAdMediaUrl} alt="Ad background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0b0f19 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#0f172a', border: '3px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'spin 8s linear infinite' }}>
                          <span style={{ fontSize: 32 }}>🐾</span>
                        </div>
                        <span style={{ marginTop: 12, color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>🎵 Audio Single</span>
                      </div>
                    )}
                    {/* Dark gradient overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 35%, rgba(11,15,25,0.92) 80%, #0b0f19 100%)' }} />
                  </div>

                  {/* Top Bar on Mobile */}
                  <div style={{ position: 'relative', zIndex: 20, padding: '32px 14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(245, 158, 11, 0.9)', color: '#000', fontWeight: 900, fontSize: '0.68rem', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.5px' }}>
                      AD • {newAdBadge || 'SPONSORED'}
                    </span>
                    <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>Animandler</span>
                  </div>

                  {/* Bottom Content & CTA */}
                  <div style={{ position: 'relative', zIndex: 20, padding: '0 14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <img src={newAdAvatar} alt="Logo" style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #06b6d4', objectFit: 'cover' }} />
                      <div>
                        <div style={{ color: 'white', fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.1 }}>{newAdAdvertiser || 'Advertiser Name'}</div>
                        <div style={{ color: '#06b6d4', fontSize: '0.68rem', fontWeight: 600 }}>{newAdCategory}</div>
                      </div>
                    </div>

                    <h4 style={{ color: 'white', margin: '0 0 4px 0', fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.2 }}>
                      {newAdTitle || 'Campaign Headline'}
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.75)', margin: '0 0 12px 0', fontSize: '0.72rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {newAdCaption || 'Promotional description of services, vaccines, checkups, or products.'}
                    </p>

                    {/* High Converting CTA Button */}
                    <div style={{
                      background: 'linear-gradient(135deg, #06b6d4, #ff2b54)',
                      color: 'white',
                      textAlign: 'center',
                      padding: '10px 14px',
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      boxShadow: '0 4px 15px rgba(6, 182, 212, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6
                    }}>
                      {newAdCtaText || 'Learn More'} ➔
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Add Promoted Artist Song Modal */}
      {showAddSoundModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 520, padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowAddSoundModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Music color="#c084fc" size={24} />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700 }}>Add Promoted Artist Track</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  This song will be placed at the top of the in-app Sound Picker for all video creators.
                </p>
              </div>
            </div>

            {soundFormMsg && (
              <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', borderRadius: 8, color: '#fca5a5', fontSize: '0.85rem', marginBottom: 14 }}>
                {soundFormMsg}
              </div>
            )}

            <form onSubmit={handleAddSound} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Song Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Bark & Bounce (Single)"
                  value={newSoundTitle}
                  onChange={e => setNewSoundTitle(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Artist Name *</label>
                <input
                  type="text"
                  placeholder="e.g. The Paws Crew"
                  value={newSoundArtist}
                  onChange={e => setNewSoundArtist(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Audio File URL (.mp3 or .wav) *</label>
                <input
                  type="url"
                  placeholder="https://.../audio.mp3"
                  value={newSoundPreviewUrl}
                  onChange={e => setNewSoundPreviewUrl(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Cover Artwork URL</label>
                  <input
                    type="url"
                    value={newSoundCoverUrl}
                    onChange={e => setNewSoundCoverUrl(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Category</label>
                  <select
                    value={newSoundCategory}
                    onChange={e => setNewSoundCategory(e.target.value as any)}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="Promoted">Promoted</option>
                    <option value="Trending">Trending</option>
                    <option value="Sports">Sports / Agility</option>
                    <option value="Relaxing">Relaxing / Lofi</option>
                    <option value="Funny">Funny / Quirky</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Sponsor Badge</label>
                  <input
                    type="text"
                    placeholder="Artist Spotlight"
                    value={newSoundBadge}
                    onChange={e => setNewSoundBadge(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Spotify / Stream URL</label>
                  <input
                    type="url"
                    placeholder="https://spotify.com/..."
                    value={newSoundExternalUrl}
                    onChange={e => setNewSoundExternalUrl(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', border: 'none', color: 'white', padding: '12px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 8 }}
              >
                Add Promoted Track to App 🎵
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Vertical Mobile Ad Preview Modal */}
      {selectedAdForPreview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setSelectedAdForPreview(null)}
              style={{ position: 'absolute', top: -14, right: -14, background: '#f43f5e', border: 'none', color: 'white', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 40, boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
            >
              <X size={18} />
            </button>

            {/* Smartphone shell */}
            <div style={{
              width: 320,
              height: 640,
              borderRadius: 44,
              border: '12px solid #1a2230',
              boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 40px rgba(6,182,212,0.3)',
              overflow: 'hidden',
              background: '#0b0f19',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontFamily: 'Inter, sans-serif'
            }}>
              {/* Dynamic Island */}
              <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', width: 85, height: 20, background: '#000', borderRadius: 14, zIndex: 30 }} />

              {/* Media Content */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
                {selectedAdForPreview.adType === 'video' ? (
                  <video src={selectedAdForPreview.mediaUrl} autoPlay loop muted controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : selectedAdForPreview.adType === 'image' ? (
                  <img src={selectedAdForPreview.mediaUrl} alt="Ad background" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: 'linear-gradient(180deg, #0f172a 0%, #1e1b4b 50%, #0b0f19 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: '#0f172a', border: '4px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 48 }}>🐾</span>
                    </div>
                    <span style={{ marginTop: 16, color: '#38bdf8', fontSize: '0.95rem', fontWeight: 700 }}>🎵 Audio Ad Playing</span>
                    <audio src={selectedAdForPreview.mediaUrl} autoPlay controls style={{ width: '80%', marginTop: 16 }} />
                  </div>
                )}
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 30%, rgba(11,15,25,0.92) 75%, #0b0f19 100%)', pointerEvents: 'none' }} />
              </div>

              {/* Header on Phone */}
              <div style={{ position: 'relative', zIndex: 20, padding: '38px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
                <span style={{ background: '#f59e0b', color: '#000', fontWeight: 900, fontSize: '0.72rem', padding: '3px 8px', borderRadius: 4, letterSpacing: '0.5px' }}>
                  AD • {selectedAdForPreview.sponsorBadge || 'SPONSORED'}
                </span>
                <span style={{ color: 'white', fontSize: '0.82rem', fontWeight: 800 }}>Animandler</span>
              </div>

              {/* Bottom Card Content & Call to Action */}
              <div style={{ position: 'relative', zIndex: 20, padding: '0 18px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <img src={selectedAdForPreview.advertiserAvatar} alt="Logo" style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid #06b6d4', objectFit: 'cover' }} />
                  <div>
                    <div style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1 }}>{selectedAdForPreview.advertiserName}</div>
                    <div style={{ color: '#06b6d4', fontSize: '0.72rem', fontWeight: 600 }}>{selectedAdForPreview.category}</div>
                  </div>
                </div>

                <h3 style={{ color: 'white', margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 800, lineHeight: 1.25 }}>
                  {selectedAdForPreview.title}
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', margin: '0 0 16px 0', fontSize: '0.78rem', lineHeight: 1.4 }}>
                  {selectedAdForPreview.caption}
                </p>

                {/* Pulsing CTA Button */}
                <a
                  href={selectedAdForPreview.ctaUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #06b6d4, #ff2b54)',
                    color: 'white',
                    textAlign: 'center',
                    padding: '12px 18px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 18px rgba(6, 182, 212, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    textDecoration: 'none'
                  }}
                >
                  {selectedAdForPreview.ctaText || 'Learn More'} ➔
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Suspend Post for Policy Violation Modal */}
      {postToSuspend && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 520, padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => { setPostToSuspend(null); setCustomSuspensionNote(''); }}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldAlert size={24} color="#f87171" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f87171' }}>Suspend Post (Policy Moderation)</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This post will be immediately hidden from the mobile feed.</p>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, marginBottom: 16, border: '1px solid var(--border-color)' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>Author: {postToSuspend.animalName}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>"{postToSuspend.caption}"</div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Primary Community Standards Violation *
              </label>
              <select
                value={suspensionReason}
                onChange={e => setSuspensionReason(e.target.value)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <option value="🐾 Animal Cruelty / Welfare Violation (Zero Tolerance)">🐾 Animal Cruelty / Harm Violation (Zero Tolerance)</option>
                <option value="⚠️ Dangerous Activity / Animal Neglect">⚠️ Dangerous Activity / Animal Neglect</option>
                <option value="🚫 Inappropriate / Sexually Explicit / Vulgar">🚫 Inappropriate / Graphic / Vulgar</option>
                <option value="📢 Spam / Commercial Scam / Phishing">📢 Spam / Commercial Scam / Phishing</option>
                <option value="© Copyright Infringement / Stolen Media">© Copyright Infringement / Stolen Media</option>
                <option value="Other Policy Violation">Other Policy Violation</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Additional Moderator Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Details of the violation for the audit log..."
                value={customSuspensionNote}
                onChange={e => setCustomSuspensionNote(e.target.value)}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setPostToSuspend(null); setCustomSuspensionNote(''); }}
                style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'white', padding: '10px 18px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleToggleSuspendPost(postToSuspend, customSuspensionNote || suspensionReason)}
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 700 }}
              >
                Confirm &amp; Suspend Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Create Event Modal */}
      {showCreateEventModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowCreateEventModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Create Community Pet Event</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Publish an official pet meetup, adoption drive, or agility tournament.</p>

            {eventFormMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 12px', borderRadius: 8, marginBottom: 14, fontSize: '0.85rem' }}>
                {eventFormMsg}
              </div>
            )}

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Event Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Austin Golden Retriever Playday 🎾"
                  value={newEventTitle}
                  onChange={e => setNewEventTitle(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Date &amp; Time *</label>
                  <input
                    type="text"
                    placeholder="Saturday, Dec 5 • 11:00 AM"
                    value={newEventDate}
                    onChange={e => setNewEventDate(e.target.value)}
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Category</label>
                  <select
                    value={newEventCategory}
                    onChange={e => setNewEventCategory(e.target.value)}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="Meetup">🐾 Meetup &amp; Play</option>
                    <option value="Adoption">🏠 Adoption Drive</option>
                    <option value="Sports">🏆 Sports &amp; Agility</option>
                    <option value="Contest">🎃 Costume Contest</option>
                    <option value="Mating">❤️ Mating &amp; Breeding</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Pet Type</label>
                  <select
                    value={newEventPetType}
                    onChange={e => setNewEventPetType(e.target.value)}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="all">🐾 All Pets Welcome</option>
                    <option value="dogs">🐕 Dogs Only</option>
                    <option value="cats">🐈 Cats Only</option>
                    <option value="birds">🦜 Birds & Parrots</option>
                    <option value="reptiles">🦎 Reptiles & Exotic</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Location *</label>
                <input
                  type="text"
                  placeholder="e.g. Zilker Park, Austin TX"
                  value={newEventLocation}
                  onChange={e => setNewEventLocation(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Admission Type</label>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button
                      type="button"
                      onClick={() => setNewEventIsPaid(false)}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: !newEventIsPaid ? '1px solid #06b6d4' : '1px solid var(--border-color)', background: !newEventIsPaid ? 'rgba(6,182,212,0.15)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                    >
                      Free RSVP
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEventIsPaid(true)}
                      style={{ flex: 1, padding: '8px', borderRadius: 8, border: newEventIsPaid ? '1px solid #10b981' : '1px solid var(--border-color)', background: newEventIsPaid ? 'rgba(16,185,129,0.15)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}
                    >
                      Paid Ticket
                    </button>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Ticket Price (if paid)</label>
                  <input
                    type="text"
                    placeholder="$15.00"
                    disabled={!newEventIsPaid}
                    value={newEventPrice}
                    onChange={e => setNewEventPrice(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', opacity: newEventIsPaid ? 1 : 0.5 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newEventImage}
                  onChange={e => setNewEventImage(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe activities, snacks provided, leash requirements..."
                  value={newEventDesc}
                  onChange={e => setNewEventDesc(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'none', color: 'white', padding: '12px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 6 }}
              >
                Publish Event to App 📅
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. Create Product Modal */}
      {showCreateProductModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 500, padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowCreateProductModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Add Marketplace Product</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>List verified pet merchandise, toys, or organic food in the store.</p>

            {prodFormMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 12px', borderRadius: 8, marginBottom: 14, fontSize: '0.85rem' }}>
                {prodFormMsg}
              </div>
            )}

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Product Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Grain-Free Salmon Bites (12oz)"
                  value={newProdTitle}
                  onChange={e => setNewProdTitle(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="19.99"
                    value={newProdPrice}
                    onChange={e => setNewProdPrice(e.target.value)}
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Category</label>
                  <select
                    value={newProdCategory}
                    onChange={e => setNewProdCategory(e.target.value)}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="Food & Treats">🥩 Food &amp; Treats</option>
                    <option value="Toys & Gear">🧸 Toys &amp; Gear</option>
                    <option value="Accessories">🎀 Accessories</option>
                    <option value="Health & Wellness">💊 Health &amp; Wellness</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Product Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newProdImage}
                  onChange={e => setNewProdImage(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Seller / Brand Name</label>
                <input
                  type="text"
                  placeholder="Animandler Official Store"
                  value={newProdSeller}
                  onChange={e => setNewProdSeller(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Key features and ingredients..."
                  value={newProdDesc}
                  onChange={e => setNewProdDesc(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', padding: '12px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 6 }}
              >
                Publish Product to Store 🛍️
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 10. Create Service Modal */}
      {showCreateServiceModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: 500, padding: '2rem', position: 'relative' }}>
            <button 
              onClick={() => setShowCreateServiceModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: 32, height: 32, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={18} />
            </button>

            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 700, color: 'white' }}>Add Pet Care Service</h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>List verified grooming, vet telehealth, behavioral training, or boarding.</p>

            {servFormMsg && (
              <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 12px', borderRadius: 8, marginBottom: 14, fontSize: '0.85rem' }}>
                {servFormMsg}
              </div>
            )}

            <form onSubmit={handleCreateService} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Service Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Full Luxury Spa Grooming &amp; Nail Trim"
                  value={newServTitle}
                  onChange={e => setNewServTitle(e.target.value)}
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Category</label>
                  <select
                    value={newServCategory}
                    onChange={e => setNewServCategory(e.target.value)}
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', cursor: 'pointer' }}
                  >
                    <option value="Grooming & Spa">✨ Grooming &amp; Spa</option>
                    <option value="Veterinary Care">🩺 Veterinary Wellness</option>
                    <option value="Dog Walking">🐕 Dog Walking</option>
                    <option value="Sitting & Boarding">🏠 Sitting &amp; Boarding</option>
                    <option value="Training">🎓 Behavioral Training</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Rate / Price *</label>
                  <input
                    type="text"
                    placeholder="$45.00/session"
                    value={newServPrice}
                    onChange={e => setNewServPrice(e.target.value)}
                    required
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Provider Name</label>
                  <input
                    type="text"
                    placeholder="Verified Specialist"
                    value={newServProvider}
                    onChange={e => setNewServProvider(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Location / Coverage</label>
                  <input
                    type="text"
                    placeholder="Austin, TX &amp; In-Home"
                    value={newServLocation}
                    onChange={e => setNewServLocation(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Cover Photo URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newServImage}
                  onChange={e => setNewServImage(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Service breakdown, products used, vaccination requirements..."
                  value={newServDesc}
                  onChange={e => setNewServDesc(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: 8, padding: '10px 14px', color: 'white', width: '100%', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'none', color: 'white', padding: '12px 18px', borderRadius: 8, fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', marginTop: 6 }}
              >
                Publish Service to Directory 🩺
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
