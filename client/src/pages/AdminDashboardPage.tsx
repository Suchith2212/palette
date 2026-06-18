import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiImage,
  FiMail,
  FiRefreshCw,
  FiSearch,
  FiUsers,
} from 'react-icons/fi';
import api from '../services/api';
import { IEvent } from '../types/event';
import { IArtwork } from '../types/artwork';
import { toMediaUrl } from '../utils/mediaUrl';
import './AdminDashboardPage.css';

type AdminUser = {
  _id: string;
  name: string;
  iitgEmail: string;
  personalEmail: string;
  phoneNumber?: string;
  photoUrl?: string;
  isAdmin: boolean;
  isVerified: boolean;
};

type AdminActivity = {
  _id: string;
  action: string;
  entityType: 'event' | 'artwork' | 'user' | 'system' | 'exhibition' | 'contact';
  details?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  actor?: { name: string; iitgEmail?: string };
};

type ContactResponse = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

type DraftState = Record<string, { loopEnabled: boolean; loopOrder: number | ''; archiveEnabled: boolean; archiveOrder: number | '' }>;
type DashboardView = 'overview' | 'users' | 'activity' | 'artworks' | 'contacts' | 'events';

const AdminDashboardPage: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [events, setEvents] = useState<IEvent[]>([]);
  const [artworks, setArtworks] = useState<IArtwork[]>([]);
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [drafts, setDrafts] = useState<DraftState>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [search, setSearch] = useState('');
  const [activitySearch, setActivitySearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [artSearch, setArtSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<'all' | 'past' | 'upcoming' | 'ongoing'>('all');
  const [activityFilter, setActivityFilter] = useState<'all' | 'event' | 'artwork' | 'user' | 'system' | 'exhibition' | 'contact'>('all');
  const [orderDrafts, setOrderDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [savingEvents, setSavingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadDashboard = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true); else setLoading(true);
      setError(null);
      const results = await Promise.allSettled([
        api.get('/admin/admins'),
        api.get('/admin/users'),
        api.get('/admin/activity'),
        api.get('/events/admin/all'),
        api.get('/artwork/admin/all'),
        api.get('/contact'),
      ]);
      const [adminsRes, usersRes, activityRes, eventsRes, artworksRes, contactsRes] = results;
      if (adminsRes.status === 'fulfilled') setAdmins(adminsRes.value.data || []);
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
      if (activityRes.status === 'fulfilled') setActivity(activityRes.value.data || []);
      if (eventsRes.status === 'fulfilled') {
        const nextEvents = eventsRes.value.data || [];
        setEvents(nextEvents);
        const nextDrafts: DraftState = {};
        (nextEvents as IEvent[]).forEach((event) => {
          nextDrafts[event._id] = {
            loopEnabled: event.loopOrder !== null && event.loopOrder !== undefined,
            loopOrder: event.loopOrder ?? '',
            archiveEnabled: event.archiveOrder !== null && event.archiveOrder !== undefined,
            archiveOrder: event.archiveOrder ?? '',
          };
        });
        setDrafts(nextDrafts);
      }
      if (artworksRes.status === 'fulfilled') {
        const nextArtworks = Array.isArray(artworksRes.value.data) ? artworksRes.value.data : [];
        setArtworks(nextArtworks);
        const orders: Record<string, string> = {};
        nextArtworks.forEach((art: IArtwork) => {
          orders[art._id] = art.displayOrder !== undefined && art.displayOrder !== null ? String(art.displayOrder) : '';
        });
        setOrderDrafts(orders);
      }
      if (contactsRes.status === 'fulfilled') setContacts(Array.isArray(contactsRes.value.data) ? contactsRes.value.data : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const pendingArtworks = useMemo(() => artworks.filter((art) => art.status === 'pending'), [artworks]);

  const metrics = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return {
      totalUsers: users.length,
      totalAdmins: admins.length,
      verifiedUsers: users.filter((u) => u.isVerified).length,
      pendingArtworks: pendingArtworks.length,
      openContacts: contacts.length,
      loopSelected: events.filter((e) => e.loopOrder !== null && e.loopOrder !== undefined).length,
      todayLogs: activity.filter((a) => new Date(a.createdAt) >= dayStart).length,
    };
  }, [users, admins.length, pendingArtworks.length, contacts.length, events, activity]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((item) => [item.name, item.iitgEmail, item.personalEmail, item.phoneNumber || ''].some((field) => field?.toLowerCase().includes(q)));
  }, [users, search]);

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => [c.name, c.email, c.subject, c.message].join(' ').toLowerCase().includes(q));
  }, [contacts, contactSearch]);

  const filteredArtworks = useMemo(() => {
    const q = artSearch.trim().toLowerCase();
    if (!q) return artworks;
    return artworks.filter((a) => [a.title, a.description || '', a.credits || '', a.artist?.name || '', a.status].join(' ').toLowerCase().includes(q));
  }, [artworks, artSearch]);

  const orderManagedArtworks = useMemo(
    () =>
      filteredArtworks
        .filter((art) => art.status === 'approved')
        .sort((a, b) => {
          const aOrder = a.displayOrder ?? Number.MAX_SAFE_INTEGER;
          const bOrder = b.displayOrder ?? Number.MAX_SAFE_INTEGER;
          if (aOrder !== bOrder) return aOrder - bOrder;
          return a.title.localeCompare(b.title);
        }),
    [filteredArtworks]
  );

  const filteredActivities = useMemo(() => {
    const q = activitySearch.trim().toLowerCase();
    return [...activity]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .filter((a) => activityFilter === 'all' || a.entityType === activityFilter)
      .filter((a) => !q || [a.action, a.entityType, a.details || '', a.actor?.name || '', a.actor?.iitgEmail || ''].join(' ').toLowerCase().includes(q))
      .slice(0, 30);
  }, [activity, activityFilter, activitySearch]);

  const getEventStatus = (event: IEvent) => {
    const now = new Date();
    const start = new Date(event.date);
    const end = event.endDate ? new Date(event.endDate) : null;
    if (end) {
      if (end < now) return 'past';
      if (start <= now && end >= now) return 'ongoing';
      return 'upcoming';
    }
    if (start < now) return 'past';
    if (start.toDateString() === now.toDateString()) return 'ongoing';
    return 'upcoming';
  };

  const filteredEvents = useMemo(() => {
    const q = eventSearch.trim().toLowerCase();
    return events.filter((e) => {
      const status = getEventStatus(e);
      if (eventFilter !== 'all' && status !== eventFilter) return false;
      if (!q) return true;
      return [e.title, e.description, e.location].join(' ').toLowerCase().includes(q);
    });
  }, [events, eventSearch, eventFilter]);

  const updateDraft = (eventId: string, patch: Partial<DraftState[string]>) => {
    setDrafts((prev) => ({ ...prev, [eventId]: { ...prev[eventId], ...patch } }));
  };

  const runArtworkAction = async (artworkId: string, fn: () => Promise<unknown>, successText: string) => {
    try {
      setActionId(artworkId);
      setError(null);
      setSuccess(null);
      await fn();
      await loadDashboard(true);
      setSuccess(successText);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Artwork action failed.');
    } finally {
      setActionId(null);
    }
  };

  const handlePromote = async (userId: string) => {
    try {
      setSavingId(userId);
      setError(null);
      setSuccess(null);
      await api.post('/admin/promote', { userId });
      await loadDashboard(true);
      setSuccess('Admin privileges updated.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to promote user.');
    } finally {
      setSavingId(null);
    }
  };

  const handleContactDelete = async (id: string) => {
    if (!window.confirm('Delete this contact submission?')) return;
    try {
      setActionId(id);
      setError(null);
      setSuccess(null);
      await api.delete(`/contact/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      setSuccess('Contact submission deleted.');
    } catch {
      setError('Failed to delete contact submission.');
    } finally {
      setActionId(null);
    }
  };

  const handleSaveEventSelections = async () => {
    setError(null);
    setSuccess(null);
    const updates = events
      .map((event) => {
        const draft = drafts[event._id];
        if (!draft) return null;
        const loopOrder = draft.loopEnabled ? Number(draft.loopOrder || 1) : null;
        const archiveOrder = draft.archiveEnabled ? Number(draft.archiveOrder || 1) : null;
        const currentLoopOrder = event.loopOrder ?? null;
        const currentArchiveOrder = event.archiveOrder ?? null;
        if (currentLoopOrder === loopOrder && currentArchiveOrder === archiveOrder) return null;
        return { id: event._id, loopOrder, archiveOrder };
      })
      .filter(Boolean) as Array<{ id: string; loopOrder: number | null; archiveOrder: number | null }>;

    if (updates.length === 0) {
      setSuccess('No event selection changes to save.');
      return;
    }

    try {
      setSavingEvents(true);
      await api.put('/events/admin/selections', { updates });
      await loadDashboard(true);
      setSuccess('Event selections saved.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save event selections.');
    } finally {
      setSavingEvents(false);
    }
  };

  const generateMailtoLink = (email: string, subject: string, message: string) => {
    const defaultSubject = `Re: ${subject || 'Your recent inquiry'}`;
    const defaultBody = `Hi,\n\nRegarding your message:\n"${message}"\n\n`;
    return `mailto:${email}?subject=${encodeURIComponent(defaultSubject)}&body=${encodeURIComponent(defaultBody)}`;
  };

  if (loading) return <div className="text-center py-5"><p>Loading admin dashboard...</p></div>;

  return (
    <div className="admin-console-page">
      <div className="admin-console-shell">
        <aside className="admin-console-sidebar">
          <div className="admin-brand">
            <img src={toMediaUrl('/uploads/exhibition/logo-transparent.png')} alt="Palette" />
            <div><h3>Palette</h3><p>Control Center | Admin</p></div>
          </div>

          <button className="admin-refresh-btn" onClick={() => loadDashboard(true)}><FiRefreshCw /> {refreshing ? 'Refreshing...' : 'Refresh Data'}</button>

          <nav className="admin-nav">
            <button className={`admin-nav-item ${activeView === 'overview' ? 'is-active' : ''}`} onClick={() => setActiveView('overview')}><FiBarChart2 /> Overview</button>
            <button className={`admin-nav-item ${activeView === 'users' ? 'is-active' : ''}`} onClick={() => setActiveView('users')}><FiUsers /> Users</button>
            <button className={`admin-nav-item ${activeView === 'activity' ? 'is-active' : ''}`} onClick={() => setActiveView('activity')}><FiActivity /> Activity</button>
            <button className={`admin-nav-item ${activeView === 'artworks' ? 'is-active' : ''}`} onClick={() => setActiveView('artworks')}><FiImage /> Artworks</button>
            <button className={`admin-nav-item ${activeView === 'contacts' ? 'is-active' : ''}`} onClick={() => setActiveView('contacts')}><FiMail /> Contacts</button>
            <button className={`admin-nav-item ${activeView === 'events' ? 'is-active' : ''}`} onClick={() => setActiveView('events')}><FiCalendar /> Event Curation</button>
          </nav>
        </aside>

        <main className="admin-console-main">
          <header className="admin-main-header">
            <div><h2>Admin Dashboard</h2><p>Single-window admin operations with right-panel workspace switching.</p></div>
            <span className="admin-main-badge">{activeView.toUpperCase()}</span>
          </header>

          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {activeView === 'overview' && <section className="admin-metric-grid">
            <article className="metric-card"><span>Users</span><strong>{metrics.totalUsers}</strong><small>{metrics.verifiedUsers} verified</small></article>
            <article className="metric-card"><span>Admins</span><strong>{metrics.totalAdmins}</strong><small>active controllers</small></article>
            <article className="metric-card"><span>Pending Artworks</span><strong>{metrics.pendingArtworks}</strong><small>awaiting review</small></article>
            <article className="metric-card"><span>Open Contacts</span><strong>{metrics.openContacts}</strong><small>in inbox queue</small></article>
            <article className="metric-card"><span>Loop Events</span><strong>{metrics.loopSelected}</strong><small>selected for homepage</small></article>
            <article className="metric-card"><span>Logs Today</span><strong>{metrics.todayLogs}</strong><small>admin actions</small></article>
          </section>}

          {activeView === 'users' && <section className="admin-panel admin-panel-wide">
            <div className="admin-section-head"><h3>User Management</h3><span>{users.length} users</span></div>
            <input className="form-control dashboard-search" placeholder="Search name, email, or phone number" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="user-table-wrap"><table className="table align-middle user-table"><thead><tr><th>User</th><th>Role</th><th>Verified</th><th>Action</th></tr></thead><tbody>
              {filteredUsers.map((item) => <tr key={item._id}><td><div className="user-name">{item.name}</div><div className="user-meta">{item.iitgEmail}</div><div className="user-meta">{item.phoneNumber || 'No phone number'}</div></td><td><span className={`role-pill ${item.isAdmin ? 'role-pill-admin' : 'role-pill-user'}`}>{item.isAdmin ? 'Admin' : 'User'}</span></td><td>{item.isVerified ? 'Yes' : 'No'}</td><td>{!item.isAdmin ? <button className="btn btn-sm btn-primary" onClick={() => handlePromote(item._id)} disabled={savingId === item._id}>{savingId === item._id ? 'Promoting...' : 'Make Admin'}</button> : <span className="text-muted">Already admin</span>}</td></tr>)}
            </tbody></table></div>
          </section>}

          {activeView === 'activity' && <section className="admin-panel admin-panel-wide">
            <div className="admin-section-head"><h3>Admin Activity</h3><span>{activity.length} logs</span></div>
            <div className="activity-controls"><input className="form-control activity-search" placeholder="Search logs" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} /><select className="form-select activity-filter" value={activityFilter} onChange={(e) => setActivityFilter(e.target.value as typeof activityFilter)}><option value="all">All logs</option><option value="event">Events</option><option value="artwork">Artworks</option><option value="user">Users</option><option value="system">System</option><option value="exhibition">Exhibition</option><option value="contact">Contact</option></select></div>
            <div className="activity-feed">{filteredActivities.map((entry) => <article className="activity-item" key={entry._id}><div className="activity-dot"></div><div className="activity-content"><div className="activity-title">{entry.action}</div><div className="activity-meta">{entry.actor?.name || 'Unknown'} | {new Date(entry.createdAt).toLocaleString()}</div></div></article>)}{filteredActivities.length === 0 && <div className="activity-empty">No records</div>}</div>
          </section>}

          {activeView === 'artworks' && <section className="admin-panel admin-panel-wide">
            <div className="admin-section-head"><h3>Artwork Order Management</h3><span>{pendingArtworks.length} pending / {artworks.length} total</span></div>
            <div className="input-with-icon"><FiSearch /><input type="text" placeholder="Search title, artist, credits" value={artSearch} onChange={(e) => setArtSearch(e.target.value)} /></div>

            <div className="artworks-split-layout">
              <section className="artworks-split-panel">
                <div className="admin-section-head">
                  <h3>Current Artwork Order</h3>
                  <span>{orderManagedArtworks.length} approved</span>
                </div>
                <div className="artwork-grid">
                  {orderManagedArtworks.map((artwork) => (
                    <article className="art-card" key={artwork._id}>
                      <img src={toMediaUrl(artwork.imageUrl)} alt={artwork.title} />
                      <div className="art-card-body">
                        <h4>{artwork.title}</h4>
                        <p className="muted">By {artwork.artist.name} | Current: {artwork.displayOrder ?? 'Auto'}</p>
                        <div className="score-row">
                          <input type="number" min={0} placeholder="Display order (0..n)" value={orderDrafts[artwork._id] ?? ''} onChange={(e) => setOrderDrafts((prev) => ({ ...prev, [artwork._id]: e.target.value }))} />
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => {
                              const raw = orderDrafts[artwork._id];
                              const displayOrder = raw === '' ? null : Number(raw);
                              if (displayOrder !== null && (Number.isNaN(displayOrder) || displayOrder < 0)) {
                                setError('Display order must be a non-negative number.');
                                return;
                              }
                              runArtworkAction(artwork._id, () => api.put(`/artwork/${artwork._id}/order`, { displayOrder }), `Display order updated${displayOrder === null ? ' (unset)' : ''}.`);
                            }}
                            disabled={actionId === artwork._id}
                          >
                            Set Order
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {orderManagedArtworks.length === 0 && <div className="empty-inline">No approved artworks for order assignment.</div>}
              </section>
            </div>
          </section>}

          {activeView === 'contacts' && <section className="admin-panel admin-panel-wide">
            <div className="admin-section-head"><h3>Contact Inbox</h3><span>{contacts.length} messages</span></div>
            <div className="input-with-icon"><FiSearch /><input type="text" placeholder="Search contact messages" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} /></div>
            <div className="contact-list">{filteredContacts.map((contact) => <article className="contact-item" key={contact._id}><div><h4>{contact.subject || 'No Subject'}</h4><p className="muted">{contact.name} | {contact.email}</p><p>{contact.message}</p></div><div className="contact-actions"><a href={generateMailtoLink(contact.email, contact.subject, contact.message)} className="btn btn-sm btn-primary">Reply</a><button className="btn btn-sm btn-outline-danger" onClick={() => handleContactDelete(contact._id)} disabled={actionId === contact._id}>{actionId === contact._id ? 'Deleting...' : 'Delete'}</button></div></article>)}</div>
            {filteredContacts.length === 0 && <div className="empty-inline">No contact messages match your search.</div>}
          </section>}

          {activeView === 'events' && <section className="admin-panel admin-panel-wide">
            <div className="admin-section-head"><h3>Event Curation</h3><button className="btn btn-primary btn-sm" onClick={handleSaveEventSelections} disabled={savingEvents}>{savingEvents ? 'Saving...' : 'Save Selections'}</button></div>
            <div className="events-controls"><select className="form-select" value={eventFilter} onChange={(e) => setEventFilter(e.target.value as typeof eventFilter)}><option value="all">Events (All Types)</option><option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option><option value="past">Past</option></select><div className="input-with-icon"><FiSearch /><input type="text" placeholder="Search title, description, location" value={eventSearch} onChange={(e) => setEventSearch(e.target.value)} /></div></div>
            <div className="user-table-wrap"><table className="table align-middle user-table"><thead><tr><th>Event</th><th>Status</th><th>Loop</th><th>Loop Order</th><th>Archive</th><th>Archive Order</th></tr></thead><tbody>{filteredEvents.map((event) => { const draft = drafts[event._id]; const status = getEventStatus(event); return <tr key={event._id}><td><div className="user-name">{event.title}</div><div className="user-meta">{new Date(event.date).toLocaleDateString()} {event.location ? `| ${event.location}` : ''}</div></td><td><span className={`role-pill role-pill-${status}`}>{status}</span></td><td><input type="checkbox" className="form-check-input" checked={draft?.loopEnabled || false} onChange={(e) => updateDraft(event._id, { loopEnabled: e.target.checked, loopOrder: e.target.checked ? draft?.loopOrder || 1 : '' })} /></td><td><input type="number" min={1} className="form-control mini-input" value={draft?.loopOrder ?? ''} onChange={(e) => updateDraft(event._id, { loopOrder: e.target.value === '' ? '' : Number(e.target.value) })} disabled={!draft?.loopEnabled} /></td><td><input type="checkbox" className="form-check-input" checked={draft?.archiveEnabled || false} onChange={(e) => updateDraft(event._id, { archiveEnabled: e.target.checked, archiveOrder: e.target.checked ? draft?.archiveOrder || 1 : '' })} /></td><td><input type="number" min={1} className="form-control mini-input" value={draft?.archiveOrder ?? ''} onChange={(e) => updateDraft(event._id, { archiveOrder: e.target.value === '' ? '' : Number(e.target.value) })} disabled={!draft?.archiveEnabled} /></td></tr>; })}</tbody></table></div>
            {filteredEvents.length === 0 && <div className="empty-inline">No events found for current filters.</div>}
          </section>}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
