import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import StepProgress from '@/components/shared/StepProgress';
import CustomerStep from './consultation/CustomerStep';
import AnamnesisStep from './consultation/AnamnesisStep';
import GoalStep from './consultation/GoalStep';
import RecommendationStep from './consultation/RecommendationStep';
import ClosingStep from './consultation/ClosingStep';

const STEPS = ['Kunde', 'Anamnese', 'Ziele', 'Empfehlung', 'Abschluss'];

export default function ConsultationFlow() {
  const { type } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState({});
  const [anamnesis, setAnamnesis] = useState({});
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
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
    selectedAddons.reduce((sum, a) => sum + (a.price_monthly || 0), 0);

  const handleClose = async (outcome, notes) => {
    // Save or update customer
    let customerId = customer.id;
    if (!customerId) {
      const saved = await base44.entities.Customer.create(customer);
      customerId = saved.id;
    } else {
      await base44.entities.Customer.update(customerId, customer);
    }

    // Save consultation
    await base44.entities.Consultation.create({
      customer_id: customerId,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      consultation_type: type || 'neukunde',
      status: outcome === 'abschluss' ? 'abgeschlossen' : outcome === 'testphase' ? 'testphase' : 'angebot_gespeichert',
      anamnesis,
      selected_goals: selectedGoals,
      recommended_services: services.slice(0, 10).map(s => ({ id: s.id, name: s.name })),
      selected_tariff: selectedTariff?.name,
      selected_services: selectedServices.map(s => s.name || s),
      selected_addons: selectedAddons.map(a => a.name),
      monthly_price: totalMonthly,
      start_costs: selectedTariff?.start_fee || 0,
      contract_duration: `${selectedTariff?.duration_months || 12} Monate`,
      trial_period: outcome === 'testphase',
      outcome,
      notes,
      upsells_shown: selectedAddons.map(a => a.name),
      upsells_accepted: selectedAddons.map(a => a.name),
    });

    queryClient.invalidateQueries({ queryKey: ['consultations-recent'] });
    toast.success(
      outcome === 'abschluss' ? 'Vertrag erfolgreich abgeschlossen!' :
      outcome === 'testphase' ? '14-Tage-Testphase gestartet!' :
      'Angebot gespeichert!'
    );
    navigate('/');
  };

  const consultationType = type === 'rehasport' ? 'Rehasport-Beratung' : 
                           type === 'upgrade' ? 'Bestandskunden-Upgrade' : 
                           'Neukunden-Beratung';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">{consultationType}</h1>
        <button 
          onClick={() => navigate('/')} 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Abbrechen
        </button>
      </div>

      <StepProgress steps={STEPS} currentStep={step} />

      {step === 0 && (
        <CustomerStep 
          customer={customer} 
          setCustomer={setCustomer} 
          onNext={() => setStep(1)} 
        />
      )}

      {step === 1 && (
        <AnamnesisStep 
          anamnesis={anamnesis} 
          setAnamnesis={setAnamnesis} 
          onNext={() => setStep(2)} 
          onBack={() => setStep(0)} 
        />
      )}

      {step === 2 && (
        <GoalStep 
          selectedGoals={selectedGoals} 
          setSelectedGoals={setSelectedGoals} 
          onNext={() => setStep(3)} 
          onBack={() => setStep(1)} 
        />
      )}

      {step === 3 && (
        <RecommendationStep
          customer={customer}
          anamnesis={anamnesis}
          selectedGoals={selectedGoals}
          services={services}
          tariffs={tariffs}
          rules={rules}
          selectedServices={selectedServices}
          setSelectedServices={setSelectedServices}
          selectedAddons={selectedAddons}
          setSelectedAddons={setSelectedAddons}
          selectedTariff={selectedTariff}
          setSelectedTariff={setSelectedTariff}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <ClosingStep
          customer={customer}
          selectedTariff={selectedTariff}
          selectedAddons={selectedAddons}
          totalMonthly={totalMonthly}
          onClose={handleClose}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  );
}