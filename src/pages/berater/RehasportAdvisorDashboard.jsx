import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, Users, TrendingUp, FileText, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import TeilnahmebescheinigungDownload from './TeilnahmebescheinigungDownload';
import CustomerDetail from './CustomerDetail';

const NAV_ITEMS = [
  { id: 'customers', label: 'Kundenkatalog', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'insurance', label: 'Krankenkassen-DB', icon: FileText },
  { id: 'tariffs', label: 'Tarifverwaltung', icon: TrendingUp },
  { id: 'admin', label: 'Admin', icon: Settings },
];

export default function RehasportAdvisorDashboard() {
  const [activeTab, setActiveTab] = useState('customers');
  const [searchTerm, setSearchTerm] = useState('');
  const [bescheinigungFor, setBescheinigungFor] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const { data: consultations = [] } = useQuery({
    queryKey: ['rehasport-consultations'],
    queryFn: () => base44.entities.RehasportConsultation.list('-created_date', 100),
  });

  const { data: insurances = [] } = useQuery({
    queryKey: ['health-insurances'],
    queryFn: () => base44.entities.HealthInsurance.list('name', 100),
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

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border p-6">
        <h2 className="text-2xl font-black text-foreground uppercase mb-8">Berater-Area</h2>
        <nav className="space-y-2 mb-8">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 4 }}
                className={`w-full px-4 py-3 rounded-2xl flex items-center gap-3 transition-all text-sm font-bold uppercase tracking-wide ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}>
                <Icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            );
          })}
        </nav>
        <button className="w-full px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold text-destructive hover:bg-destructive/10 transition-all uppercase tracking-wide">
          <LogOut className="w-4 h-4" />
          Abmelden
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'customers' && selectedCustomer ? (
          <CustomerDetail consultation={selectedCustomer} onBack={() => setSelectedCustomer(null)} />
        ) : activeTab === 'customers' && (
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase mb-6">Kundenkatalog</h1>
            
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
                    <tr key={consultation.id} onClick={() => setSelectedCustomer(consultation)} className="border-b border-border hover:bg-secondary/50 transition-all cursor-pointer">
                      <td className="p-3 font-medium text-foreground">{consultation.customer_name}</td>
                      <td className="p-3 text-muted-foreground">{consultation.email || '–'}</td>
                      <td className="p-3 text-muted-foreground">{consultation.phone || '–'}</td>
                      <td className="p-3 text-muted-foreground">{consultation.health_insurance || '–'}</td>
                      <td className="p-3 text-muted-foreground">{consultation.selected_offers?.join(', ') || 'Rehasport+'}</td>
                      <td className="p-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          consultation.status === 'abgeschlossen'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-orange-500/10 text-orange-500'
                        }`}>
                          {consultation.status}
                        </span>
                      </td>
                      <td className="p-3" onClick={e => e.stopPropagation()}>
                        {consultation.subsidy_active && (
                          <button
                            onClick={() => setBescheinigungFor(consultation)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                            <FileText className="w-3.5 h-3.5" />
                            §20 PDFs
                          </button>
                        )}
                      </td>
                    </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'insurance' && (
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase mb-6">Krankenkassen-Datenbank</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insurances.map(insurance => (
                <motion.div
                  key={insurance.id}
                  className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-black text-foreground mb-4">{insurance.name}</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zuschuss/Kurs</span>
                      <span className="font-bold text-foreground">{insurance.subsidy_per_course}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Zuschuss/Jahr</span>
                      <span className="font-bold text-foreground">{insurance.subsidy_per_year}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kurse/Jahr</span>
                      <span className="font-bold text-foreground">{insurance.courses_per_year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className={`font-bold ${insurance.status === 'bestätigt' ? 'text-primary' : insurance.status === 'prüfen' ? 'text-orange-500' : 'text-destructive'}`}>
                        {insurance.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Zuletzt geprüft</span>
                      <span>{insurance.last_verified}</span>
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

        {activeTab === 'tariffs' && (
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase mb-6">Tarifverwaltung</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tariffs.map(tariff => (
                <motion.div
                  key={tariff.id}
                  className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-black text-foreground mb-4">{tariff.name}</h3>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Wochenpreis</span>
                      <span className="font-bold text-foreground">{tariff.weekly_price}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FIVE</span>
                      <span className="font-bold">{tariff.includes_five ? '✓' : '–'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Milon</span>
                      <span className="font-bold">{tariff.includes_milon ? '✓' : '–'}</span>
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
            <h1 className="text-3xl font-black text-foreground uppercase mb-6">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm mb-2">Beratungen</p>
                <p className="text-4xl font-black text-primary">{consultations.length}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm mb-2">Abgeschlossen</p>
                <p className="text-4xl font-black text-primary">{consultations.filter(c => c.status === 'abgeschlossen').length}</p>
              </div>
              <div className="bg-card border border-border rounded-2xl p-6">
                <p className="text-muted-foreground text-sm mb-2">Mit Zuschuss</p>
                <p className="text-4xl font-black text-primary">{consultations.filter(c => c.subsidy_active).length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div>
            <h1 className="text-3xl font-black text-foreground uppercase mb-6">Admin</h1>
            <p className="text-muted-foreground">Admin-Funktionen folgen...</p>
          </div>
        )}
      </div>

      {bescheinigungFor && (
        <TeilnahmebescheinigungDownload
          consultation={bescheinigungFor}
          onClose={() => setBescheinigungFor(null)}
        />
      )}
    </div>
  );
}