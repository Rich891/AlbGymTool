import { describe, expect, it } from 'vitest';

import {
  embedCustomerCompatibilitySnapshot,
  getMissingCustomerPersistenceFields,
  hydrateCustomerRecord,
  prepareCustomerPersistencePayload,
  splitCustomerNotes,
} from './customerPersistenceCompat';

describe('customer persistence compatibility', () => {
  it('stores profile and prescription fields in notes and hydrates them back', () => {
    const payload = prepareCustomerPersistencePayload({
      first_name: 'Gisela',
      last_name: 'Daucher',
      birthdate: '1959-02-03',
      health_insurance: 'AOK Baden-Wuerttemberg',
      prescription_date: '2026-01-09',
      prescription_valid_to: '2027-07-09',
      prescribed_units: 50,
      notes: 'Bitte Rueckruf vormittags.',
    });

    expect(payload.notes).toContain('[ALBGYM_CUSTOMER_SNAPSHOT_V1]');
    expect(payload.notes).toContain('Bitte Rueckruf vormittags.');

    const liveRecord = {
      id: 'customer-1',
      first_name: 'Gisela',
      last_name: 'Daucher',
      notes: payload.notes,
    };
    const hydrated = hydrateCustomerRecord(liveRecord);

    expect(hydrated.id).toBe('customer-1');
    expect(hydrated.birthdate).toBe('1959-02-03');
    expect(hydrated.health_insurance).toBe('AOK Baden-Wuerttemberg');
    expect(hydrated.prescription_valid_to).toBe('2027-07-09');
    expect(hydrated.prescribed_units).toBe(50);
    expect(hydrated.notes).toBe('Bitte Rueckruf vormittags.');
  });

  it('does not show the snapshot as human notes', () => {
    const notes = embedCustomerCompatibilitySnapshot('Interne Notiz', {
      first_name: 'Armin',
      last_name: 'Bader',
      health_insurance: 'AOK',
    });

    const split = splitCustomerNotes(notes);

    expect(split.humanNotes).toBe('Interne Notiz');
    expect(split.snapshot.health_insurance).toBe('AOK');
  });

  it('detects missing expected fields after a live persistence roundtrip', () => {
    const expected = {
      first_name: 'Gisela',
      last_name: 'Daucher',
      birthdate: '1959-02-03',
      health_insurance: 'AOK',
      prescription_valid_to: '2027-07-09',
    };

    const missing = getMissingCustomerPersistenceFields(expected, {
      first_name: 'Gisela',
      last_name: 'Daucher',
      notes: embedCustomerCompatibilitySnapshot('', {
        birthdate: '1959-02-03',
      }),
    });

    expect(missing).toEqual(['health_insurance', 'prescription_valid_to']);
  });
});
