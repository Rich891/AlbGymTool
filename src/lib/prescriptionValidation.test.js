import { describe, expect, it } from 'vitest';
import {
  evaluatePrescription,
  matchHealthInsurance,
  PRESCRIPTION_VALIDATION_STATUS,
  validationStatusToPrescriptionStatus,
  validationStatusToRehaPrescriptionStatus,
} from '@/lib/prescriptionValidation';

const completePrescription = {
  patient_first_name: 'Armin',
  patient_last_name: 'Bader',
  birthdate: '1960-04-12',
  street: 'Hauptstrasse 1',
  postal_code: '72458',
  city: 'Albstadt',
  health_insurance: 'AOK Baden-Wuerttemberg',
  insurance_number: 'A 123 456 789',
  prescription_date: '2026-01-09',
  prescribed_service: 'Rehabilitationssport',
  sport_type: 'Gymnastik',
  prescribed_units: 50,
  duration_months: 18,
  frequency: '1-2x pro Woche',
  diagnosis_text: 'Rueckenschmerzen',
  icd_codes: ['M54.5'],
  rehab_goal: 'Beweglichkeit verbessern',
  practice_site_number: '123456789',
  doctor_signature_present: true,
  doctor_stamp_present: true,
};

describe('matchHealthInsurance', () => {
  it('matches by aliases and normalized spelling', () => {
    const match = matchHealthInsurance('AOK BW', [
      { id: 'aok', name: 'AOK Baden-Wuerttemberg', aliases: ['AOK BW'] },
    ]);

    expect(match.id).toBe('aok');
  });

  it('matches umlaut spelling against ue spelling', () => {
    const match = matchHealthInsurance('AOK Baden-Württemberg', [
      { id: 'aok', name: 'AOK Baden-Wuerttemberg', aliases: [] },
    ]);

    expect(match.id).toBe('aok');
  });
});

describe('evaluatePrescription', () => {
  it('returns valid for complete prescription without approval requirement', () => {
    const review = evaluatePrescription(completePrescription, [
      { id: 'aok', name: 'AOK Baden-Wuerttemberg', approval_required: false },
    ], { today: new Date('2026-02-01') });

    expect(review.status).toBe(PRESCRIPTION_VALIDATION_STATUS.VALID);
    expect(review.error_count).toBe(0);
    expect(review.score).toBe(100);
  });

  it('requires approval when local insurance marks it as required', () => {
    const review = evaluatePrescription(completePrescription, [
      { id: 'aok', name: 'AOK Baden-Wuerttemberg', approval_required: true },
    ], { today: new Date('2026-02-01') });

    expect(review.status).toBe(PRESCRIPTION_VALIDATION_STATUS.INCOMPLETE);
    expect(review.issues.some(issue => issue.code === 'approval_missing')).toBe(true);
  });

  it('lets the local insurance database override OCR approval hints', () => {
    const review = evaluatePrescription({
      ...completePrescription,
      approval_required_hint: true,
      approval_present: false,
    }, [
      { id: 'aok', name: 'AOK Baden-Wuerttemberg', approval_required: false },
    ], { today: new Date('2026-02-01') });

    expect(review.approval_required).toBe(false);
    expect(review.issues.some(issue => issue.code === 'approval_missing')).toBe(false);
    expect(review.status).toBe(PRESCRIPTION_VALIDATION_STATUS.VALID);
  });

  it('uses a safe AOK fallback when the local database is not loaded yet', () => {
    const review = evaluatePrescription({
      ...completePrescription,
      health_insurance: 'AOK Baden-Württemberg',
      approval_required_hint: true,
      approval_present: false,
    }, [], { today: new Date('2026-02-01') });

    expect(review.matched_health_insurance_name).toBe('AOK');
    expect(review.approval_required).toBe(false);
    expect(review.issues.some(issue => issue.code === 'approval_missing')).toBe(false);
  });

  it('marks missing OCR fields on their input fields', () => {
    const review = evaluatePrescription({
      patient_first_name: 'Armin',
      patient_last_name: '',
      health_insurance: '',
    }, [], { today: new Date('2026-02-01') });

    expect(review.status).toBe(PRESCRIPTION_VALIDATION_STATUS.INCOMPLETE);
    expect(review.field_issues.patient_last_name).toBeDefined();
    expect(review.field_issues.health_insurance).toBeDefined();
  });

  it('maps validation status to stored entity status', () => {
    expect(validationStatusToPrescriptionStatus(PRESCRIPTION_VALIDATION_STATUS.VALID)).toBe('verified');
    expect(validationStatusToPrescriptionStatus(PRESCRIPTION_VALIDATION_STATUS.INCOMPLETE)).toBe('manual_review');
    expect(validationStatusToRehaPrescriptionStatus(PRESCRIPTION_VALIDATION_STATUS.VALID)).toBe('scan_saved');
    expect(validationStatusToRehaPrescriptionStatus(PRESCRIPTION_VALIDATION_STATUS.NEEDS_REVIEW)).toBe('manual_review');
  });
});
