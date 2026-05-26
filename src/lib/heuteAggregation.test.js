import { describe, it, expect } from 'vitest';
import {
  filterAppointmentsToday,
  filterFollowUpsDue,
  groupNewLeads,
  buildHeuteOverview,
} from '@/lib/heuteAggregation';

const NOW = new Date('2026-05-26T10:00:00Z');

describe('filterAppointmentsToday', () => {
  it('returns [] for null / empty / undefined', () => {
    expect(filterAppointmentsToday(null, NOW)).toEqual([]);
    expect(filterAppointmentsToday(undefined, NOW)).toEqual([]);
    expect(filterAppointmentsToday([], NOW)).toEqual([]);
  });

  it('keeps only appointments starting on the same calendar day', () => {
    // Hinweis: filterAppointmentsToday vergleicht in der lokalen Zeitzone.
    // Wir nutzen Dates relativ zu NOW, damit der Test in jeder Zeitzone
    // konsistent ist.
    const sameDay = new Date(NOW.getTime());
    sameDay.setHours(8, 30, 0, 0);
    const sameDayLater = new Date(NOW.getTime());
    sameDayLater.setHours(15, 45, 0, 0);
    const yesterday = new Date(NOW.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(NOW.getTime() + 24 * 60 * 60 * 1000);

    const data = [
      { id: 'a', start: sameDay.toISOString() },
      { id: 'b', start: sameDayLater.toISOString() },
      { id: 'c', start: yesterday.toISOString() },
      { id: 'd', start: tomorrow.toISOString() },
    ];
    const result = filterAppointmentsToday(data, NOW);
    expect(result.map(x => x.id).sort()).toEqual(['a', 'b']);
  });

  it('sorts by start ascending', () => {
    const data = [
      { id: 'late', start: '2026-05-26T18:00:00Z' },
      { id: 'early', start: '2026-05-26T06:00:00Z' },
      { id: 'mid', start: '2026-05-26T12:00:00Z' },
    ];
    const result = filterAppointmentsToday(data, NOW);
    expect(result.map(x => x.id)).toEqual(['early', 'mid', 'late']);
  });

  it('drops entries with missing or invalid start', () => {
    const data = [
      { id: 'ok', start: '2026-05-26T08:00:00Z' },
      { id: 'no_start' },
      { id: 'bad', start: 'not-a-date' },
      { id: 'null_start', start: null },
    ];
    expect(filterAppointmentsToday(data, NOW).map(x => x.id)).toEqual(['ok']);
  });
});

describe('filterFollowUpsDue', () => {
  it('returns [] for null / empty', () => {
    expect(filterFollowUpsDue(null, NOW)).toEqual([]);
    expect(filterFollowUpsDue([], NOW)).toEqual([]);
  });

  it('keeps tasks due today and overdue tasks; drops future', () => {
    const data = [
      { id: 'overdue', status: 'open', due_at: '2026-05-20T08:00:00Z' },
      { id: 'today', status: 'open', due_at: '2026-05-26T16:00:00Z' },
      { id: 'future', status: 'open', due_at: '2026-05-28T08:00:00Z' },
    ];
    const result = filterFollowUpsDue(data, NOW);
    expect(result.map(x => x.id).sort()).toEqual(['overdue', 'today'].sort());
  });

  it('drops closed/completed tasks', () => {
    const data = [
      { id: 'open', status: 'open', due_at: '2026-05-26T16:00:00Z' },
      { id: 'done', status: 'done', due_at: '2026-05-26T16:00:00Z' },
      { id: 'erledigt', status: 'erledigt', due_at: '2026-05-26T16:00:00Z' },
      { id: 'cancelled', status: 'cancelled', due_at: '2026-05-26T16:00:00Z' },
    ];
    expect(filterFollowUpsDue(data, NOW).map(x => x.id)).toEqual(['open']);
  });

  it('orders overdue before today, oldest first', () => {
    const data = [
      { id: 'today_late', status: 'open', due_at: '2026-05-26T18:00:00Z' },
      { id: 'today_early', status: 'open', due_at: '2026-05-26T08:00:00Z' },
      { id: 'overdue_recent', status: 'open', due_at: '2026-05-25T08:00:00Z' },
      { id: 'overdue_old', status: 'open', due_at: '2026-05-10T08:00:00Z' },
    ];
    const result = filterFollowUpsDue(data, NOW);
    expect(result.map(x => x.id)).toEqual([
      'overdue_old',
      'overdue_recent',
      'today_early',
      'today_late',
    ]);
  });

  it('keeps tasks without status (defensive)', () => {
    const data = [{ id: 'no_status', due_at: '2026-05-26T08:00:00Z' }];
    expect(filterFollowUpsDue(data, NOW).map(x => x.id)).toEqual(['no_status']);
  });
});

describe('groupNewLeads', () => {
  it('returns [] for null / empty', () => {
    expect(groupNewLeads(null)).toEqual([]);
    expect(groupNewLeads([])).toEqual([]);
  });

  it('sorts by created_date descending and caps at limit', () => {
    const data = [
      { id: 'a', created_date: '2026-05-20T10:00:00Z' },
      { id: 'b', created_date: '2026-05-25T10:00:00Z' },
      { id: 'c', created_date: '2026-05-26T09:00:00Z' },
      { id: 'd', created_date: '2026-05-15T10:00:00Z' },
    ];
    const result = groupNewLeads(data, 2);
    expect(result.map(x => x.id)).toEqual(['c', 'b']);
  });

  it('default limit is 5', () => {
    const data = Array.from({ length: 8 }, (_, i) => ({
      id: `lead${i}`,
      created_date: `2026-05-${String(20 + i).padStart(2, '0')}T10:00:00Z`,
    }));
    expect(groupNewLeads(data)).toHaveLength(5);
  });

  it('falls back to created_at when created_date is missing', () => {
    const data = [
      { id: 'old', created_at: '2026-05-20T10:00:00Z' },
      { id: 'new', created_at: '2026-05-25T10:00:00Z' },
    ];
    expect(groupNewLeads(data, 2).map(x => x.id)).toEqual(['new', 'old']);
  });
});

describe('buildHeuteOverview', () => {
  it('returns empty result with zero counts on empty input', () => {
    const result = buildHeuteOverview({});
    expect(result.todayAppointments).toEqual([]);
    expect(result.dueFollowUps).toEqual([]);
    expect(result.newLeads).toEqual([]);
    expect(result.newContacts).toEqual([]);
    expect(result.counts).toEqual({
      todayAppointments: 0,
      dueFollowUps: 0,
      newContacts: 0,
      newLeads: 0,
    });
  });

  it('aggregates all three sections and reports counts', () => {
    const result = buildHeuteOverview({
      appointments: [
        { id: 'today_appt', start: '2026-05-26T11:00:00Z' },
        { id: 'tomorrow', start: '2026-05-27T11:00:00Z' },
      ],
      followUps: [
        { id: 'due_today', status: 'open', due_at: '2026-05-26T15:00:00Z' },
      ],
      leads: [
        { id: 'lead1', created_date: '2026-05-26T08:00:00Z' },
        { id: 'lead2', created_date: '2026-05-25T08:00:00Z' },
      ],
      now: NOW,
    });
    expect(result.counts).toEqual({
      todayAppointments: 1,
      dueFollowUps: 1,
      newContacts: 2,
      newLeads: 2,
    });
    expect(result.todayAppointments[0].id).toBe('today_appt');
  });

  it('uses customers as the primary contact source', () => {
    const result = buildHeuteOverview({
      customers: [
        { id: 'customer1', created_date: '2026-05-26T08:00:00Z' },
        { id: 'customer2', created_date: '2026-05-25T08:00:00Z' },
      ],
      leads: [
        { id: 'legacy_lead', created_date: '2026-05-26T09:00:00Z' },
      ],
      now: NOW,
    });

    expect(result.newContacts.map(item => item.id)).toEqual(['customer1', 'customer2']);
    expect(result.counts.newContacts).toBe(2);
  });
});
