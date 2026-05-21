import {
  buildActivityPayload,
  buildContractDraftPayload,
  buildLeadPayload,
  getNextActionForOutcome,
  mapOutcomeToPipelineStatus,
} from '@/lib/crmModel';

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
  const leadPayload = buildLeadPayload({
    customer,
    customerId,
    selectedGoals,
    outcome,
    type,
    selectedTariff,
    totalMonthly,
  });

  let leadId = providedLeadId || customer?.active_lead_id || customer?.lead_id || null;

  if (leadId) {
    results.push(await safeEntityAction(base44, 'Lead', 'update', leadId, {
      ...leadPayload,
      status,
      last_consultation_id: consultation?.id || null,
    }));
  } else {
    const leadResult = await safeEntityAction(base44, 'Lead', 'create', {
      ...leadPayload,
      last_consultation_id: consultation?.id || null,
    });
    results.push(leadResult);
    leadId = leadResult?.data?.id || null;
  }

  if (leadId && customerId && !customer?.active_lead_id) {
    results.push(await safeEntityAction(base44, 'Customer', 'update', customerId, {
      ...customer,
      active_lead_id: leadId,
      last_pipeline_status: status,
    }));
  }

  results.push(await safeEntityAction(base44, 'ActivityLog', 'create', buildActivityPayload({
    leadId,
    customerId,
    consultationId: consultation?.id,
    outcome,
    notes,
  })));

  if (outcome === 'angebot') {
    results.push(await safeEntityAction(base44, 'FollowUpTask', 'create', {
      lead_id: leadId,
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
    leadId,
    status,
    results,
  };
}
