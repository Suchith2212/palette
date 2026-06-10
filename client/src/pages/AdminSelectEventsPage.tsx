import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { IEvent } from '../types/event';
import './AdminSelectEventsPage.css';

type DraftState = Record<
  string,
  {
    loopEnabled: boolean;
    loopOrder: number | '';
    archiveEnabled: boolean;
    archiveOrder: number | '';
  }
>;

const AdminSelectEventsPage: React.FC = () => {
  const [events, setEvents] = useState<IEvent[]>([]);
  const [drafts, setDrafts] = useState<DraftState>({});
  const [filter, setFilter] = useState<'all' | 'past' | 'upcoming' | 'ongoing'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/events/admin/all');
        const data = Array.isArray(res.data) ? res.data : [];
        setEvents(data);
        const nextDrafts: DraftState = {};
        data.forEach((event: IEvent) => {
          nextDrafts[event._id] = {
            loopEnabled: event.loopOrder !== null && event.loopOrder !== undefined,
            loopOrder: event.loopOrder ?? '',
            archiveEnabled: event.archiveOrder !== null && event.archiveOrder !== undefined,
            archiveOrder: event.archiveOrder ?? '',
          };
        });
        setDrafts(nextDrafts);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

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
    const normalizedSearch = search.trim().toLowerCase();
    return events.filter((event) => {
      const status = getEventStatus(event);
      if (filter !== 'all' && status !== filter) return false;
      if (!normalizedSearch) return true;
      return (
        event.title.toLowerCase().includes(normalizedSearch) ||
        event.description.toLowerCase().includes(normalizedSearch) ||
        event.location.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [events, filter, search]);

  const updateDraft = (eventId: string, patch: Partial<DraftState[string]>) => {
    setDrafts((prev) => ({
      ...prev,
      [eventId]: {
        ...prev[eventId],
        ...patch,
      },
    }));
  };

  const handleSave = async () => {
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

        if (currentLoopOrder === loopOrder && currentArchiveOrder === archiveOrder) {
          return null;
        }

        return {
          id: event._id,
          loopOrder,
          archiveOrder,
        };
      })
      .filter(Boolean) as Array<{ id: string; loopOrder: number | null; archiveOrder: number | null }>;

    const invalid = updates.find((update) => {
      if (update.loopOrder !== null && (isNaN(update.loopOrder) || update.loopOrder < 1)) return true;
      if (update.archiveOrder !== null && (isNaN(update.archiveOrder) || update.archiveOrder < 1)) return true;
      return false;
    });

    if (invalid) {
      setError('Please enter a valid positive order number for all selected events.');
      return;
    }

    if (updates.length === 0) {
      setSuccess('No changes to save.');
      return;
    }

    try {
      setSaving(true);
      const res = await api.put('/events/admin/selections', { updates });
      type UpdatedSelection = Pick<IEvent, '_id' | 'loopOrder' | 'archiveOrder'>;
      const updatedEvents: UpdatedSelection[] = Array.isArray(res.data?.updatedEvents)
        ? (res.data.updatedEvents as UpdatedSelection[])
        : [];
      const updatedEventMap = new Map<string, UpdatedSelection>(
        updatedEvents.map((event) => [event._id, event])
      );

      const nextEvents = events.map((event) => {
        const updatedEvent = updatedEventMap.get(event._id);
        if (!updatedEvent) return event;
        return {
          ...event,
          loopOrder: updatedEvent.loopOrder ?? null,
          archiveOrder: updatedEvent.archiveOrder ?? null,
        };
      });

      setEvents(nextEvents);
      setSuccess(res.data?.message || 'Selections saved.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save selections.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-select-events-page">
      <div className="container py-5">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
          <div>
            <h2 className="page-title mb-1">Select Events</h2>
            <p className="text-muted mb-0">Curate the homepage loop and archive highlights.</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Selections'}
          </button>
        </div>

        <div className="filters-bar d-flex flex-wrap gap-3 align-items-center mb-4">
          <div className="filter-item">
            <label className="form-label">Filter</label>
            <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">Events (All Types)</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
            </select>
          </div>
          <div className="filter-item flex-grow-1">
            <label className="form-label">Search</label>
            <input
              className="form-control"
              placeholder="Search by title, description, location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {loading ? (
          <p>Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p>No events found for this filter.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle select-events-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Status</th>
                  <th>Loop</th>
                  <th>Loop Order</th>
                  <th>Archive</th>
                  <th>Archive Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const draft = drafts[event._id];
                  const status = getEventStatus(event);
                  return (
                    <tr key={event._id}>
                      <td>
                        <div className="event-title">{event.title}</div>
                        <div className="event-meta">
                          {new Date(event.date).toLocaleDateString()}
                          {event.location ? ` | ${event.location}` : ''}
                        </div>
                      </td>
                      <td>
                        <span className={`badge status-badge status-${status}`}>{status}</span>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={draft?.loopEnabled || false}
                          onChange={(e) =>
                            updateDraft(event._id, {
                              loopEnabled: e.target.checked,
                              loopOrder: e.target.checked ? draft?.loopOrder || 1 : '',
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="form-control order-input"
                          value={draft?.loopOrder ?? ''}
                          onChange={(e) =>
                            updateDraft(event._id, { loopOrder: e.target.value === '' ? '' : Number(e.target.value) })
                          }
                          disabled={!draft?.loopEnabled}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={draft?.archiveEnabled || false}
                          onChange={(e) =>
                            updateDraft(event._id, {
                              archiveEnabled: e.target.checked,
                              archiveOrder: e.target.checked ? draft?.archiveOrder || 1 : '',
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="form-control order-input"
                          value={draft?.archiveOrder ?? ''}
                          onChange={(e) =>
                            updateDraft(event._id, { archiveOrder: e.target.value === '' ? '' : Number(e.target.value) })
                          }
                          disabled={!draft?.archiveEnabled}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSelectEventsPage;
