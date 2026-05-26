import { describe, it, expect } from 'vitest';
import {
  buildCustomerPayloadFromPrescription,
  buildPrescriptionScanPayload,
  buildRehasportConsultationFromPrescription,
  buildCustomerSummary,
  calculateDataQualityScore,
  calculateMissingRequiredFields,
  CURRENT_FOCUS_TYPES,
  deriveCurrentFocus,
  deriveProfileStatus,
  normalizeInsuranceNumber,
  PROFILE_STATUSES,
  splitFullName,
} from '@/lib/customerDataModel';

describe('deriveProfileStatus', () => {
  it('returns LOST when lead is lost', () => {
    expect(deriveProfileStatus({ lead: { status: 'LOST' } })).toBe(PROFILE_STATUSES.LOST);
  });

  it('returns LOST when consultation outcome is kein_abschluss', () => {
    expect(deriveProfileStatus({ consultation: { outcome: 'kein_abschluss' } })).toBe(PROFILE_STATUSES.LOST);
  });

  it('returns MEMBER on consultation abschluss', () => {
    expect(deriveProfileStatus({ consultation: { outcome: 'abschluss' } })).toBe(PROFILE_STATUSES.MEMBER);
  });

  it('returns MEMBER when contract draft ready', () => {
    expect(deriveProfileStatus({ contractDraft: { status: 'ready' } })).toBe(PROFILE_STATUSES.MEMBER);
  });

  it('returns TRIAL on consultation testphase outcome', () => {
    expect(deriveProfileStatus({ consultation: { outcome: 'testphase' } })).toBe(PROFILE_STATUSES.TRIAL);
  });

  it('returns OFFER_OPEN when lead status OFFER_OPEN', () => {
    expect(deriveProfileStatus({ lead: { status: 'OFFER_OPEN' } })).toBe(PROFILE_STATUSES.OFFER_OPEN);
  });

  it('returns REHA_ACTIVE when reha case has active status', () => {
    expect(deriveProfileStatus({ rehaCase: { status: 'rezept_erfasst' } })).toBe(PROFILE_STATUSES.REHA_ACTIVE);
  });

  it('returns LEAD as fallback', () => {
    expect(deriveProfileStatus({})).toBe(PROFILE_STATUSES.LEAD);
    expect(deriveProfileStatus({ lead: { status: 'NEW' } })).toBe(PROFILE_STATUSES.LEAD);
  });
});

describe('calculateDataQualityScore', () => {
  it('returns 0 on empty input', () => {
    expect(calculateDataQualityScore({})).toBe(0);
  });

  it('returns 100 when all fields filled', () => {
    expect(
      calculateDataQualityScore({
        first_name: 'Hans',
        last_name: 'Mueller',
        birthdate: '1980-01-01',
        gender: 'maennlich',
        address: 'Hauptstr 1, 70173 Stuttgart',
        phone: '+49 711 1234567',
        email: 'hans@example.com',
        health_insurance: 'AOK',
        insurance_number: 'A 123 456 789',
      })
    ).toBe(100);
  });

  it('returns intermediate value for partially filled input', () => {
    // 3 of 9 fields filled -> round(3/9 * 100) = 33
    const score = calculateDataQualityScore({
      first_name: 'Hans',
      last_name: 'Mueller',
      phone: '+49 711 1234567',
    });
    expect(score).toBe(33);
  });
});

describe('calculateMissingRequiredFields', () => {
  it('returns expected labels for a customer with gaps', () => {
    const missing = calculateMissingRequiredFields({
      first_name: 'Hans',
      // last_name missing
      phone: '',
      // email missing
    });
    expect(missing).toEqual(['Nachname', 'Telefon', 'E-Mail']);
  });

  it('returns empty array when all required fields present', () => {
    const missing = calculateMissingRequiredFields({
      first_name: 'Hans',
      last_name: 'Mueller',
      phone: '+49 711 1234567',
      email: 'hans@example.com',
    });
    expect(missing).toEqual([]);
  });
});

describe('normalizeInsuranceNumber', () => {
  it('normalizes a standard insurance number with letter prefix', () => {
    expect(normalizeInsuranceNumber('A123456789')).toBe('A 123 456 789');
  });

  it('handles input with whitespace and lowercase', () => {
    expect(normalizeInsuranceNumber('  a 123 456 789  ')).toBe('A 123 456 789');
  });

  it('falls back to digits-only when no leading letter', () => {
    expect(normalizeInsuranceNumber('123456789')).toBe('123456789');
  });

  it('returns empty string for empty / null input', () => {
    expect(normalizeInsuranceNumber('')).toBe('');
    expect(normalizeInsuranceNumber()).toBe('');
  });
});

describe('splitFullName', () => {
  it('splits "Hans Mueller" into first/last', () => {
    expect(splitFullName('Hans Mueller')).toEqual({ first_name: 'Hans', last_name: 'Mueller' });
  });

  it('keeps multi-word surnames intact for "Maria del Carmen Lopez"', () => {
    expect(splitFullName('Maria del Carmen Lopez')).toEqual({
      first_name: 'Maria',
      last_name: 'del Carmen Lopez',
    });
  });

  it('returns empty struct for blank input', () => {
    expect(splitFullName('')).toEqual({ first_name: '', last_name: '' });
  });

  it('handles single-name input', () => {
    expect(splitFullName('Madonna')).toEqual({ first_name: 'Madonna', last_name: '' });
  });
});

describe('deriveCurrentFocus', () => {
  it('returns GOAL_PROFILE_REVIEW when goalProfile confidence is below 50 and nothing else pending', () => {
    const focus = deriveCurrentFocus({
      goalProfile: { status: 'active', confidence_score: 40 },
    });
    expect(focus.type).toBe(CURRENT_FOCUS_TYPES.GOAL_PROFILE_REVIEW);
  });

  it('returns NONE when goalProfile confidence is high enough', () => {
    const focus = deriveCurrentFocus({
      goalProfile: { status: 'active', confidence_score: 80 },
    });
    expect(focus.type).toBe(CURRENT_FOCUS_TYPES.NONE);
  });

  it('prioritizes blocked sync over goal profile review', () => {
    const focus = deriveCurrentFocus({
      syncJobs: [{ status: 'blocked_missing_data' }],
      goalProfile: { status: 'active', confidence_score: 30 },
    });
    expect(focus.type).toBe(CURRENT_FOCUS_TYPES.SYNC_PREPARE);
  });

  it('prioritizes open follow-up over goal profile review', () => {
    const focus = deriveCurrentFocus({
      followUpTasks: [{ status: 'open', due_at: '2026-06-01' }],
      goalProfile: { status: 'active', confidence_score: 30 },
    });
    expect(focus.type).toBe(CURRENT_FOCUS_TYPES.OFFER_FOLLOW_UP);
  });
});

describe('buildCustomerSummary', () => {
  it('does NOT add active_goal_headline when goalProfile is missing', () => {
    const summary = buildCustomerSummary(
      { id: 'cust-1', first_name: 'Hans', last_name: 'Mueller' },
      {}
    );
    expect(summary).not.toHaveProperty('active_goal_headline');
  });

  it('adds active_goal_headline when goalProfile is provided', () => {
    const summary = buildCustomerSummary(
      { id: 'cust-1', first_name: 'Hans', last_name: 'Mueller' },
      {
        goalProfile: {
          primary_goal: 'abnehmen',
          secondary_goals: ['kraft'],
          confidence_score: 70,
          life_phase: 'family',
        },
      }
    );
    expect(summary.active_goal_headline).toBeDefined();
    expect(summary.active_goal_headline.headline).toContain('Ziel');
  });
});

describe('prescription data mapping', () => {
  const prescription = {
    patient_first_name: 'Armin',
    patient_last_name: 'Bader',
    birthdate: '1960-04-12',
    gender: 'maennlich',
    street: 'Hauptstrasse 1',
    postal_code: '72458',
    city: 'Albstadt',
    health_insurance: 'AOK Baden-Wuerttemberg',
    insurance_number: 'A123456789',
    cost_carrier_number: '108018007',
    insured_status: '1',
    prescription_date: '2026-01-09',
    prescribed_service: 'Rehabilitationssport',
    prescribed_units: 50,
    duration_months: 18,
    approval_required_hint: true,
    approval_present: false,
    validation_report: {
      status: 'valid',
      score: 100,
      issues: [],
      approval_required: false,
      approval_present: false,
    },
    prescription_validation_status: 'valid',
  };

  it('copies OCR profile fields into the unified customer payload', () => {
    const customer = buildCustomerPayloadFromPrescription(prescription);

    expect(customer.first_name).toBe('Armin');
    expect(customer.last_name).toBe('Bader');
    expect(customer.birthdate).toBe('1960-04-12');
    expect(customer.street).toBe('Hauptstrasse 1');
    expect(customer.postal_code).toBe('72458');
    expect(customer.city).toBe('Albstadt');
    expect(customer.health_insurance).toBe('AOK Baden-Wuerttemberg');
    expect(customer.insurance_number).toBe('A 123 456 789');
    expect(customer.cost_carrier_number).toBe('108018007');
  });

  it('stores approval requirement from the validation report, not from OCR hints', () => {
    const customer = buildCustomerPayloadFromPrescription(prescription);
    const scan = buildPrescriptionScanPayload({
      customer,
      prescription,
      fileMeta: { file_name: 'Bader Armin.pdf', storage_mode: 'private' },
      extraction: { status: 'extracted', confidence: 'review_required' },
    });
    const reha = buildRehasportConsultationFromPrescription({
      customer,
      prescription,
      prescriptionScanId: 'scan-1',
    });

    expect(scan.approval_required).toBe(false);
    expect(reha.approval_required).toBe(false);
  });
});
