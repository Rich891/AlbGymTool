import React, { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import CustomerStep from './consultation/CustomerStep';
import AnamnesisStep from './consultation/AnamnesisStep';
import GoalStep from './consultation/GoalStep';
import AnalysisScreen from './consultation/AnalysisScreen';
import RecommendationStep from './consultation/RecommendationStep';
import ClosingStep from './consultation/ClosingStep';
import { syncConsultationCrmArtifacts } from '@/lib/crmAutomation';
import { enrichCustomerWithConsentSnapshot } from '@/lib/crmModel';
import {
  buildUnifiedCustomerPayload,
  deriveCurrentFocus,
  deriveProfileStatus,
  mergeCustomerContextSnapshot,
  upsertUnifiedCustomer,
} from '@/lib/customerDataModel';
import {
  buildGoalProfilePayload,
  GOAL_PROFILE_SOURCES,
  upsertGoalProfile,
} from '@/lib/goalProfileModel';

export default function ConsultationFlow() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState({});
  const [anamnesis, setAnamnesis] = useState({});
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedTariff, setSelectedTariff] = useState(null);

  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('-created_date', 200),
  });
  const { data: tariffs = [] } = useQuery({
    queryKey: ['tariffs'],
    queryFn: () => base44.entities.Tariff.list('sort_order', 50),
  });
  const { data: rules = [] } = useQuery({
    queryKey: ['rules'],
    queryFn: () => base44.entities.RecommendationRule.list('-priority', 100),
  });

  const totalMonthly = (selectedTariff?.monthly_price || 0) +
    selectedAddons.reduce((sum, addon) => sum + (addon.price_monthly || 0), 0);

  const handleClose = async (outcome, notes) => {
    const now = new Date().toISOString();
    const leadIdFromUrl = searchParams.get('lead');
    const consentCustomer = enrichCustomerWithConsentSnapshot(customer, {
      source: `consultation_${type || 'neukunde'}`,
    });
    const initialFocus = deriveCurrentFocus({
      lead: leadIdFromUrl ? { status: 'APPOINTMENT_BOOKED' } : null,
    });
    const customerPayload = buildUnifiedCustomerPayload({
      ...consentCustomer,
      active_lead_id: leadIdFromUrl || consentCustomer.active_lead_id,
      last_contact_at: now,
      profile_status: deriveProfileStatus({
        lead: leadIdFromUrl ? { status: 'APPOINTMENT_BOOKED' } : null,
      }),
      current_focus: initialFocus.type,
      next_action_at: initialFocus.next_action_at,
      training_goal: selectedGoals[0] || consentCustomer.training_goal,
      privacy_consent: consentCustomer.privacy_consent,
      privacy_consent_date: consentCustomer.privacy_consent_date,
    }, {
      source: `consultation_${type || 'neukunde'}`,
      sourceSystem: 'navigator',
    });

    const upsert = await upsertUnifiedCustomer(base44, customerPayload, {
      existingCustomerId: customer.id || undefined,
    });
    const customerId = upsert.customer.id;
    const persistedCustomer = {
      ...upsert.customer,
      ...customerPayload,
      id: customerId,
    };

    let goalProfileId = null;
    try {
      const goalSource = type === 'rehasport'
        ? GOAL_PROFILE_SOURCES.CONSULTATION_REHA
        : GOAL_PROFILE_SOURCES.CONSULTATION_NEUKUNDE;
      const goalPayload = buildGoalProfilePayload({
        customer: persistedCustomer,
        selectedGoals,
        anamnesis,
        source: goalSource,
      });
      const goalResult = await upsertGoalProfile(base44, customerId, goalPayload);
      goalProfileId = goalResult?.id || null;
    } catch (err) {
      console.warn('GoalProfile upsert skipped:', err);
    }

    const consultationPayload = {
      customer_id: customerId,
      customer_name: `${persistedCustomer.first_name || ''} ${persistedCustomer.last_name || ''}`.trim(),
      consultation_type: type || 'neukunde',
      status: outcome === 'abschluss' ? 'abgeschlossen' : outcome === 'testphase' ? 'testphase' : 'angebot_gespeichert',
      anamnesis,
      selected_goals: selectedGoals,
      selected_tariff: selectedTariff?.name,
      selected_addons: selectedAddons.map(addon => addon.name),
      monthly_price: totalMonthly,
      start_costs: selectedTariff?.start_fee || 0,
      contract_duration: `${selectedTariff?.duration_months || 12} Monate`,
      trial_period: outcome === 'testphase',
      outcome,
      notes,
      upsells_accepted: selectedAddons.map(addon => addon.name),
      recommendation_result: {
        selected_tariff_id: selectedTariff?.id || null,
        selected_tariff_name: selectedTariff?.name || null,
        selected_addon_ids: selectedAddons.map(addon => addon.id),
        total_monthly: totalMonthly,
      },
    };

    const savedConsultation = await base44.entities.Consultation.create(consultationPayload);

    const crmResult = await syncConsultationCrmArtifacts({
      base44,
      customer: persistedCustomer,
      customerId,
      consultation: savedConsultation,
      selectedGoals,
      selectedTariff,
      selectedAddons,
      totalMonthly,
      outcome,
      notes,
      type,
      leadId: leadIdFromUrl,
    });
    const contractDraft = crmResult.results
      ?.find(result => result.entityName === 'ContractDraft' && result.data?.id)
      ?.data;
    const followUpTasks = crmResult.results
      ?.filter(result => result.entityName === 'FollowUpTask' && result.data)
      .map(result => result.data) || [];
    const pipelineSnapshot = {
      status: crmResult.status,
      next_action_at: followUpTasks[0]?.due_at || crmResult.customerPipelinePayload?.next_action_at,
    };
    const currentFocus = deriveCurrentFocus({
      lead: pipelineSnapshot,
      followUpTasks,
    });
    const profileStatus = deriveProfileStatus({
      lead: pipelineSnapshot,
      consultation: savedConsultation,
      contractDraft,
    });

    await base44.entities.Customer.update(customerId, mergeCustomerContextSnapshot(persistedCustomer, {
      ...crmResult.customerPipelinePayload,
      active_consultation_id: savedConsultation.id,
      active_contract_draft_id: contractDraft?.id || persistedCustomer.active_contract_draft_id,
      active_goal_profile_id: goalProfileId || persistedCustomer.active_goal_profile_id,
      profile_status: profileStatus,
      current_focus: currentFocus.type,
      next_action_at: currentFocus.next_action_at,
      last_contact_at: now,
    }));

    queryClient.invalidateQueries({ queryKey: ['consultations-recent'] });
    queryClient.invalidateQueries({ queryKey: ['customers'] });
    queryClient.invalidateQueries({ queryKey: ['personen-cockpit', 'customers'] });
    queryClient.invalidateQueries({ queryKey: ['crm-leads'] });
    queryClient.invalidateQueries({ queryKey: ['crm-appointments'] });

    toast.success(
      outcome === 'abschluss' ? '🎉 Vertrag abgeschlossen!' :
      outcome === 'testphase' ? '✅ 14-Tage-Test gestartet!' :
      '💾 Angebot gespeichert!'
    );
    navigate('/');
  };

  // Steps: 0=customer, 1=anamnesis, 2=goals, 3=analysis, 4=recommendation, 5=closing
  const TOTAL_STEPS = 5; // visible steps (excl. analysis)
  const progressStep = step > 3 ? step - 1 : step; // analysis is step 3, no progress dot

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        {/* Progress dots */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 4, 5].map((s) => (
            <div
              key={s}
              className={`rounded-full transition-all duration-300 ${
                step === s ? 'w-6 h-2.5 bg-primary' :
                step > s ? 'w-2.5 h-2.5 bg-primary/50' :
                'w-2.5 h-2.5 bg-border'
              }`}
            />
          ))}
        </div>

        <img
          src="https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/96b390eb9_AlbGymLogomark.png"
          alt="AlbGym"
          className="h-8 object-contain"
        />

        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <StepWrapper key="customer">
              <CustomerStep customer={customer} setCustomer={setCustomer} onNext={() => setStep(1)} />
            </StepWrapper>
          )}
          {step === 1 && (
            <StepWrapper key="anamnesis">
              <AnamnesisStep anamnesis={anamnesis} setAnamnesis={setAnamnesis} onNext={() => setStep(2)} onBack={() => setStep(0)} />
            </StepWrapper>
          )}
          {step === 2 && (
            <StepWrapper key="goals">
              <GoalStep selectedGoals={selectedGoals} setSelectedGoals={setSelectedGoals} onNext={() => setStep(3)} onBack={() => setStep(1)} />
            </StepWrapper>
          )}
          {step === 3 && (
            <StepWrapper key="analysis">
              <AnalysisScreen onDone={() => setStep(4)} />
            </StepWrapper>
          )}
          {step === 4 && (
            <StepWrapper key="recommendation">
              <RecommendationStep
                customer={customer} anamnesis={anamnesis} selectedGoals={selectedGoals}
                services={services} tariffs={tariffs} rules={rules}
                selectedAddons={selectedAddons} setSelectedAddons={setSelectedAddons}
                selectedTariff={selectedTariff} setSelectedTariff={setSelectedTariff}
                onNext={() => setStep(5)} onBack={() => setStep(2)}
              />
            </StepWrapper>
          )}
          {step === 5 && (
            <StepWrapper key="closing">
              <ClosingStep
                customer={customer} selectedTariff={selectedTariff}
                selectedAddons={selectedAddons} totalMonthly={totalMonthly}
                onClose={handleClose} onBack={() => setStep(4)}
              />
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}
