import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, BookOpen, FileText, Plus, Settings, SlidersHorizontal, TrendingUp, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import TeilnahmebescheinigungDownload from './TeilnahmebescheinigungDownload';
import CustomerDetail from './CustomerDetail';
import InsuranceManager from './InsuranceManager';
import NewCustomerModal from './NewCustomerModal';
import ServiceCatalog from '@/pages/ServiceCatalog';
import AdvisorOptions from './AdvisorOptions';

const WORKSPACE_TABS = [
  { id: 'customers', label: 'Reha-Kunden', icon: Users },
  { id: 'insurance', label: 'Krankenkassen', icon: FileText },
  { id: 'options', label: 'Optionen', icon: SlidersHorizontal },
  { id: 'analytics', label: 'Reha-Analytics', icon: BarChart3 },
  { id: 'tariffs', label: 'Reha-Tarife', icon: TrendingUp },
  { id: 'services', label: 'Leistungen', icon: BookOpen },
  { id: 'admin', label: 'Reha-Admin', icon: Settings },
];

export default function RehasportAdvisorDashboard() {
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [bescheinigungFor, setBescheinigungFor] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const { data: consultations = [] } = useQuery({
    queryKey: ['rehasport-consultations'],
    queryFn: () => base44.entities.RehasportConsultation.list('-created_date', 100),
  });

  const { data: tariffs = [] } = useQuery({
    queryKey: ['rehasport-tariffs'],
    queryFn: () => base44.entities.RehasportTariff.list('package_type', 20),
  });

  const filteredConsultations = consultations.filter(c =>
    c.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm)
  );

  const completedConsultations = consultations.filter(c => c.status === 'abgeschlossen').length;
  const subsidizedConsultations = consultations.filter(c => c.subsidy_active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-2">Rehasport</p>
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Berater-Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Operativer Bereich fuer Rehasport-Kunden, Krankenkassen, Dokumente und lokale Abschlussoptionen.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 min-w-0 xl:min-w-[420px]">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Beratungen</p>
            <p className="text-2xl font-black text-foreground">{consultations.length}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Abgeschlossen</p>
            <p className="text-2xl font-black text-primary">{completedConsultations}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Zuschuss</p>
            <p className="text-2xl font-black text-primary">{subsidizedConsultations}</p>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto border-b border-border pb-3">
        {WORKSPACE_TABS.map(item => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedCustomer(null); }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all text-sm font-bold uppercase tracking-wide whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </motion.button>
          );
        })}
      </nav>

      {activeTab === 'customers' && selectedCustomer ? (
        <CustomerDetail
          consultation={selectedCustomer}
          onBack={() => setSelectedCustomer(null)}
          onDeleted={() => setSelectedCustomer(null)}
        />
      ) : activeTab === 'customers' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-foreground uppercase">Reha-Kunden</h2>
            <button
              onClick={() => setShowNewCustomer(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground font-black text-sm uppercase tracking-wide hover:bg-primary/90 transition-all"
            >
              <Plus className="w-4 h-4" /> Neuer Kunde
            </button>
          </div>

          <input
            type="text"
            placeholder="Nach Name, E-Mail oder Telefon suchen..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-md h-12 px-4 rounded-2xl border border-border bg-card text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary mb-6"
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-bold text-muted-foreground">Name</th>
                  <th className="text-left p-3 font-bold text-muted-foreground">E-Mail</th>
                  <th className="text-left p-3 font-bold text-muted-foreground">Telefon</th>
                  <th className="text-left p-3 font-bold text-muted-foreground">Krankenkasse</th>
                  <th className="text-left p-3 font-bold text-muted-foreground">Paket</th>
                  <th className="text-left p-3 font-bold text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-bold text-muted-foreground">Dokumente</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultations.map(consultation => (
                  <tr
                    key={consultation.id}
                    onClick={() => setSelectedCustomer(consultation)}
                    className="border-b border-border hover:bg-secondary/50 transition-all cursor-pointer"
                  >
                    <td className="p-3 font-medium text-foreground">{consultation.customer_name}</td>
                    <td className="p-3 text-muted-foreground">{consultation.email || '-'}</td>
                    <td className="p-3 text-muted-foreground">{consultation.phone || '-'}</td>
                    <td className="p-3 text-muted-foreground">{consultation.health_insurance || '-'}</td>
                    <td className="p-3 text-muted-foreground">{consultation.selected_offers?.join(', ') || 'Rehasport+'}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        consultation.status === 'abgeschlossen'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-orange-500/10 text-orange-500'
                      }`}>
                        {consultation.status || 'offen'}
                      </span>
                    </td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      {consultation.subsidy_active && (
                        <button
                          onClick={() => setBescheinigungFor(consultation)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-wide whitespace-nowrap"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Par. 20 PDFs
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredConsultations.length === 0 && (
              <p className="text-center text-muted-foreground py-12 text-sm">Keine Kunden gefunden.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'insurance' && <InsuranceManager />}

      {activeTab === 'tariffs' && (
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase mb-6">Reha-Tarife</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tariffs.map(tariff => (
              <motion.div key={tariff.id} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="text-lg font-black text-foreground mb-4">{tariff.name}</h3>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wochenpreis</span>
                    <span className="font-bold text-foreground">{tariff.weekly_price} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">FIVE</span>
                    <span className="font-bold">{tariff.includes_five ? 'Ja' : '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Milon</span>
                    <span className="font-bold">{tariff.includes_milon ? 'Ja' : '-'}</span>
                  </div>
                </div>
                <button className="w-full h-10 rounded-xl border border-border text-foreground hover:bg-secondary transition-all text-sm font-bold uppercase">
                  Bearbeiten
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase mb-6">Reha-Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-muted-foreground text-sm mb-2">Beratungen</p>
              <p className="text-4xl font-black text-primary">{consultations.length}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-muted-foreground text-sm mb-2">Abgeschlossen</p>
              <p className="text-4xl font-black text-primary">{completedConsultations}</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <p className="text-muted-foreground text-sm mb-2">Mit Zuschuss</p>
              <p className="text-4xl font-black text-primary">{subsidizedConsultations}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && <ServiceCatalog />}

      {activeTab === 'admin' && (
        <div>
          <h2 className="text-2xl font-black text-foreground uppercase mb-6">Reha-Admin</h2>
          <p className="text-muted-foreground">Admin-Funktionen folgen...</p>
        </div>
      )}

      {activeTab === 'options' && <AdvisorOptions />}

      {bescheinigungFor && (
        <TeilnahmebescheinigungDownload
          consultation={bescheinigungFor}
          onClose={() => setBescheinigungFor(null)}
        />
      )}

      <AnimatePresence>
        {showNewCustomer && (
          <NewCustomerModal
            onClose={() => setShowNewCustomer(false)}
            onCreated={(record) => { setShowNewCustomer(false); setSelectedCustomer(record); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
