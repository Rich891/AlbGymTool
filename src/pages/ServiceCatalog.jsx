import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Pencil, Package } from 'lucide-react';
import { CATEGORY_COLORS } from '@/lib/goalConfig';
import ServiceForm from '@/components/admin/ServiceForm';

export default function ServiceCatalog() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingService, setEditingService] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => base44.entities.Service.list('-created_date', 200),
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

  const categories = [...new Set(services.map(s => s.category).filter(Boolean))];
  
  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || s.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Leistungskatalog</h1>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" /> Leistung hinzufügen
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Leistung suchen..."
            className="pl-12 h-12"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button 
            variant={categoryFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setCategoryFilter('all')}
          >
            Alle
          </Button>
          {categories.map(cat => (
            <Button 
              key={cat} 
              variant={categoryFilter === cat ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(service => {
            const catColor = CATEGORY_COLORS[service.category] || { color: 'text-gray-400', bg: 'bg-gray-400/10' };
            return (
              <Card key={service.id} className="p-5 bg-card border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{service.name}</h3>
                    <Badge variant="outline" className={`${catColor.bg} ${catColor.color} mt-1 text-xs`}>
                      {service.category}
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" size="icon"
                    onClick={() => { setEditingService(service); setShowForm(true); }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
                {service.short_description && (
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{service.short_description}</p>
                )}
                {service.benefit_argument && (
                  <p className="text-xs text-primary mb-2">💡 {service.benefit_argument}</p>
                )}
                <div className="flex items-center justify-between text-sm mt-3 pt-3 border-t border-border">
                  <span className="text-muted-foreground">
                    {service.price_monthly ? `${service.price_monthly}€/mtl.` : service.price_once ? `${service.price_once}€ einmalig` : 'Im Tarif'}
                  </span>
                  <div className="flex gap-1">
                    {service.is_addon && <Badge variant="outline" className="text-xs">Addon</Badge>}
                    {service.time_efficient && <Badge variant="outline" className="text-xs text-primary">⚡</Badge>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}