import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Trash2, ChevronRight, LayoutGrid, List, Star, Clock, Zap, Users, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ServiceForm from '@/components/admin/ServiceForm';

const CATEGORY_COLORS = {
  'Kraft & Muskelaufbau': { bg: 'bg-red-500/10', text: 'text-red-400', dot: 'bg-red-400' },
  'Einfaches Training': { bg: 'bg-blue-500/10', text: 'text-blue-400', dot: 'bg-blue-400' },
  'Beweglichkeit & Rücken': { bg: 'bg-green-500/10', text: 'text-green-400', dot: 'bg-green-400' },
  'Abnehmen & Stoffwechsel': { bg: 'bg-orange-500/10', text: 'text-orange-400', dot: 'bg-orange-400' },
  'Reha & Gesundheit': { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary' },
  'Performance & Koordination': { bg: 'bg-purple-500/10', text: 'text-purple-400', dot: 'bg-purple-400' },
  'Wellness & Regeneration': { bg: 'bg-pink-500/10', text: 'text-pink-400', dot: 'bg-pink-400' },
  'Kurse & Community': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  'Komfort': { bg: 'bg-gray-500/10', text: 'text-gray-400', dot: 'bg-gray-400' },
};

function DeleteModal({ service, onConfirm, onCancel, isDeleting }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.93 }} animate={{ scale: 1 }} exit={{ scale: 0.93 }}
        className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full">
        <h3 className="text-xl font-black text-foreground uppercase mb-2">Leistung löschen?</h3>
        <p className="text-muted-foreground text-sm mb-6">
          <strong className="text-foreground">„{service.name}"</strong> wird dauerhaft gelöscht.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">Abbrechen</Button>
          <Button onClick={onConfirm} disabled={isDeleting}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2">
            {isDeleting
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <><Trash2 className="w-4 h-4" /> Löschen</>}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ServiceCard({ service, onEdit, onDelete, viewMode }) {
  const cat = CATEGORY_COLORS[service.category] || { bg: 'bg-secondary', text: 'text-muted-foreground', dot: 'bg-muted-foreground' };

  if (viewMode === 'list') {
    return (
      <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-all group">
        {service.image_url ? (
          <img src={service.image_url} alt={service.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cat.dot}`} />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-foreground text-sm">{service.name}</h3>
            {!service.is_active && <span className="text-xs text-muted-foreground">(Inaktiv)</span>}
            {service.is_addon && <Badge variant="outline" className="text-xs py-0">Add-on</Badge>}
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{service.short_description || service.category}</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full hidden md:inline-block ${cat.bg} ${cat.text}`}>
          {service.category}
        </span>
        <span className="text-sm font-bold text-foreground whitespace-nowrap hidden sm:inline">
          {service.price_monthly ? `${service.price_monthly}€/Mo.` : service.price_once ? `${service.price_once}€` : 'Im Tarif'}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(service)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive" onClick={() => onDelete(service)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      className={`bg-card border rounded-2xl overflow-hidden hover:border-primary/30 transition-all group flex flex-col ${service.is_active ? 'border-border' : 'border-border opacity-60'}`}>
      {service.image_url && (
        <div className="relative h-40 w-full overflow-hidden">
          <img src={service.image_url} alt={service.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          <span className={`absolute bottom-2 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
            {service.category}
          </span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-foreground leading-tight">{service.name}</h3>
          {!service.image_url && (
            <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${cat.bg} ${cat.text}`}>
              {service.category}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onEdit(service)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive" onClick={() => onDelete(service)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {service.short_description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">{service.short_description}</p>
      )}
      {service.benefit_argument && (
        <p className="text-xs text-primary mb-3 line-clamp-1">💡 {service.benefit_argument}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {service.time_efficient && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            <Clock className="w-3 h-3" /> Zeiteffizient
          </span>
        )}
        {service.needs_coaching && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
            <Users className="w-3 h-3" /> Betreuung
          </span>
        )}
        {service.is_addon && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">
            <Zap className="w-3 h-3" /> Add-on
          </span>
        )}
        {service.included_in_tariff && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Im Tarif
          </span>
        )}
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
        <span className="text-sm font-bold text-foreground">
          {service.price_monthly ? `${service.price_monthly}€/Monat` : service.price_once ? `${service.price_once}€ einmalig` : 'Im Tarif enthalten'}
        </span>
        {service.upsell_priority > 0 && (
          <div className="flex items-center gap-0.5">
            {[...Array(Math.min(service.upsell_priority, 5))].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
            ))}
          </div>
        )}
      </div>
      </div>
    </motion.div>
  );
}

export default function ServiceCatalog() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('-upsell_priority', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => data.id
      ? base44.entities.Service.update(data.id, data)
      : base44.entities.Service.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowForm(false);
      setEditingService(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setDeleteTarget(null);
    },
  });

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))].sort();

  const filtered = services.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.short_description?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    const matchesActive = activeFilter === 'all' ||
      (activeFilter === 'active' && s.is_active !== false) ||
      (activeFilter === 'inactive' && s.is_active === false);
    return matchesSearch && matchesCat && matchesActive;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.is_active !== false).length,
    addons: services.filter(s => s.is_addon).length,
    categories: categories.length,
  };

  if (showForm) {
    return (
      <ServiceForm
        service={editingService}
        onSave={(data) => saveMutation.mutate(data)}
        onCancel={() => { setShowForm(false); setEditingService(null); }}
        isSaving={saveMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Leistungskatalog</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Alle konfigurierbaren Leistungen & Add-ons</p>
        </div>
        <Button onClick={() => { setEditingService(null); setShowForm(true); }} className="gap-2 font-bold">
          <Plus className="w-4 h-4" /> Neue Leistung
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Gesamt', value: stats.total, icon: '📦' },
          { label: 'Aktiv', value: stats.active, icon: '✅' },
          { label: 'Add-ons', value: stats.addons, icon: '⚡' },
          { label: 'Kategorien', value: stats.categories, icon: '🗂️' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters + View toggle */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Leistung oder Beschreibung suchen..."
              className="pl-11 h-11"
            />
          </div>
          <div className="flex gap-1 border border-border rounded-xl p-1">
            <button onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${categoryFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
            Alle Kategorien
          </button>
          {categories.map(cat => {
            const c = CATEGORY_COLORS[cat] || {};
            return (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${categoryFilter === cat ? `${c.bg} ${c.text} ring-1 ring-current` : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {cat}
              </button>
            );
          })}
        </div>

        {/* Active filter */}
        <div className="flex gap-2">
          {[['all', 'Alle'], ['active', 'Aktiv'], ['inactive', 'Inaktiv']].map(([val, label]) => (
            <button key={val} onClick={() => setActiveFilter(val)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${activeFilter === val ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
              {label}
            </button>
          ))}
          <span className="text-xs text-muted-foreground self-center ml-2">{filtered.length} Leistungen</span>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-muted-foreground">Keine Leistungen gefunden.</p>
          <Button variant="outline" className="mt-4" onClick={() => { setSearch(''); setCategoryFilter('all'); setActiveFilter('all'); }}>
            Filter zurücksetzen
          </Button>
        </div>
      ) : (
        <motion.div layout className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-2'}>
          <AnimatePresence>
            {filtered.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                viewMode={viewMode}
                onEdit={(s) => { setEditingService(s); setShowForm(true); }}
                onDelete={(s) => setDeleteTarget(s)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            service={deleteTarget}
            onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}