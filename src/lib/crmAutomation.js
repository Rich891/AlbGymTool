import {
  buildActivityPayload,
  buildCustomerPipelinePayload,
  buildContractDraftPayload,
  getNextActionForOutcome,
  mapOutcomeToPipelineStatus,
} from '@/lib/crmModel';
import { mergeCustomerContextSnapshot } from '@/lib/customerDataModel';

async function safeEntityAction(base44, entityName, action, ...args) {
  try {
    const entity = base44?.entities?.[entityName];
    if (!entity?.[action]) return { skipped: true, entityName, action };
    const data = await entity[action](...args);
    return { data, entityName, action };
  } catch (error) {
    console.warn(`CRM ${entityName}.${action} skipped`, error?.message || error);
    return { error, entityName, action };
  }
}

export async function syncConsultationCrmArtifacts({
  base44,
  customer,
  customerId,
  consultation,
  selectedGoals,
  selectedTariff,
  selectedAddons,
  totalMonthly,
  outcome,
  notes,
  type,
  leadId: providedLeadId,
}) {
  const results = [];
  const status = mapOutcomeToPipelineStatus(outcome);
  const customerPipelinePayload = buildCustomerPipelinePayload({
    customer,
    customerId,
    selectedGoals,
    outcome,
    type,
    selectedTariff,
    totalMonthly,
    consultation,
  });
  const legacyLeadId = providedLeadId || customer?.active_lead_id || customer?.lead_id || null;

  if (customerId) {
    results.push(await safeEntityAction(base44, 'Customer', 'update', customerId, {
      ...mergeCustomerContextSnapshot(customer, customerPipelinePayload),
    }));
  }

  results.push(await safeEntityAction(base44, 'ActivityLog', 'create', buildActivityPayload({
    leadId: legacyLeadId,
    customerId,
    consultationId: consultation?.id,
    outcome,
    notes,
  })));

  if (outcome === 'angebot') {
    results.push(await safeEntityAction(base44, 'FollowUpTask', 'create', {
      lead_id: legacyLeadId,
      customer_id: customerId,
      consultation_id: consultation?.id || null,
      due_at: getNextActionForOutcome(outcome),
      status: 'open',
      channel: customer?.phone ? 'whatsapp' : 'email',
      reason: 'offer_follow_up',
      draft_message: `Hallo ${customer?.first_name || ''}, ich wollte kurz nachfragen, ob zu deiner Empfehlung noch eine Frage offen ist.`.trim(),
    }));
  }

  if (outcome === 'abschluss' || outcome === 'testphase') {
    results.push(await safeEntityAction(base44, 'ContractDraft', 'create', buildContractDraftPayload({
      customer,
      customerId,
      consultation,
      selectedTariff,
      selectedAddons,
      totalMonthly,
      outcome,
    })));
  }

  return {
    leadId: null,
    legacyLeadId,
    status,
    customerPipelinePayload,
    results,
  };
}
