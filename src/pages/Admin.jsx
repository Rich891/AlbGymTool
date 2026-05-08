import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  BookOpen, Package, Settings, Target, TrendingUp, 
  FileText, ArrowRight, BarChart3, Edit, Trash2, Plus, X, Loader2, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ADMIN_SECTIONS = [
  { title: 'Leistungskatalog', description: 'Leistungen anlegen, bearbeiten und verwalten', icon: BookOpen, path: '/berater/leistungen', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { title: 'Tarife', description: 'Tarife und Vertragsmodelle bearbeiten', icon: Package, path: '/berater/tarife', color: 'text-primary', bg: 'bg-primary/10' },
  { title: 'Empfehlungsregeln', description: 'Scoring-Regeln und Prioritäten anpassen', icon: Target, path: '/berater/regeln', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { title: 'Analytics', description: 'Beratungen und Performance auswerten', icon: BarChart3, path: '/berater/analytics', color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { title: 'Beratungsverlauf', description: 'Alle Beratungen einsehen', icon: FileText, path: '/berater/verlauf', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
];

function HealthInsuranceAdmin() {
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { data: insurances = [], refetch } = useQuery({
    queryKey: ['health-insurances'],
    queryFn: () => base44.entities.HealthInsurance.list('name'),
  });

  const handleEdit = (insurance) => {
    setSelectedInsurance(insurance);
    setEditData({ ...insurance });
  };

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      await base44.entities.HealthInsurance.update(editData.id, editData);
      setSelectedInsurance(null);
      setEditData(null);
      refetch();
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Krankenkassen</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditData(null); }}
          className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm uppercase flex items-center gap-2 hover:bg-primary/90 transition-all">
          <Plus className="w-4 h-4" /> Neue KK
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insurances.map(insurance => (
          <Card key={insurance.id} className="p-5 cursor-pointer hover:border-primary/40 transition-all">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-foreground">{insurance.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{insurance.region || 'Bundesweit'}</p>
              </div>
              <button onClick={() => handleEdit(insurance)} className="p-2 hover:bg-secondary rounded-lg transition-all">
                <Edit className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-secondary p-2 rounded-lg">
                <p className="text-muted-foreground">Zuschuss/Kurs</p>
                <p className="font-black text-primary">{insurance.subsidy_per_course}€</p>
              </div>
              <div className="bg-secondary p-2 rounded-lg">
                <p className="text-muted-foreground">Zuschuss/Jahr</p>
                <p className="font-black text-primary">{insurance.subsidy_per_year}€</p>
              </div>
            </div>
            <div className="flex gap-1 text-xs">
              <span className={`px-2 py-1 rounded-full ${insurance.status === 'bestätigt' ? 'bg-primary/10 text-primary' : 'bg-orange-500/10 text-orange-500'}`}>
                {insurance.status}
              </span>
              {insurance.is_active && <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600">Aktiv</span>}
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {selectedInsurance && editData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-foreground">KK bearbeiten</h3>
                <button onClick={() => setSelectedInsurance(null)} className="p-2 hover:bg-secondary rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  value={editData.name || ''}
                  onChange={e => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Name"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={editData.subsidy_per_course || ''}
                  onChange={e => setEditData({ ...editData, subsidy_per_course: parseFloat(e.target.value) })}
                  placeholder="Zuschuss pro Kurs €"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={editData.subsidy_per_year || ''}
                  onChange={e => setEditData({ ...editData, subsidy_per_year: parseFloat(e.target.value) })}
                  placeholder="Zuschuss pro Jahr €"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary"
                />
                <input
                  type="number"
                  value={editData.courses_per_year || ''}
                  onChange={e => setEditData({ ...editData, courses_per_year: parseInt(e.target.value) })}
                  placeholder="Kurse pro Jahr"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground/40 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedInsurance(null)}
                  className="flex-1 h-10 rounded-lg border border-border text-sm font-bold hover:bg-secondary transition-all">
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-10 rounded-lg bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('sections');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('sections')}
          className={`px-4 py-2 font-bold text-sm uppercase transition-all ${activeTab === 'sections' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          Verwaltung
        </button>
        <button
          onClick={() => setActiveTab('insurance')}
          className={`px-4 py-2 font-bold text-sm uppercase transition-all ${activeTab === 'insurance' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          Krankenkassen
        </button>
      </div>

      {activeTab === 'sections' ? (
        <>
          <h1 className="text-2xl font-bold text-foreground">Admin-Verwaltung</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ADMIN_SECTIONS.map(section => {
              const Icon = section.icon;
              return (
                <Link key={section.path} to={section.path}>
                  <Card className="p-6 bg-card border border-border hover:border-primary/20 transition-all cursor-pointer group h-full">
                    <div className={`w-12 h-12 rounded-2xl ${section.bg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${section.color}`} />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-1">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                    <div className="mt-3 flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Öffnen <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </>
      ) : (
        <HealthInsuranceAdmin />
      )}
    </div>
  );
}