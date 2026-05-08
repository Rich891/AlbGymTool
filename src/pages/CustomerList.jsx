import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, Phone, Mail, ArrowRight, Edit, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerList() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [editData, setEditData] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers'],
    queryFn: () => base44.entities.Customer.list('-created_date', 200),
  });

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setEditData({ ...customer });
  };

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      await base44.entities.Customer.update(editData.id, editData);
      setSelectedCustomer(null);
      setEditData(null);
      refetch();
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Kunden</h1>
        <Link to="/beratung/neukunde">
          <Button className="gap-2">Neuer Kunde</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kunden suchen..."
          className="pl-12 h-12 text-base"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Keine Kunden gefunden</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(customer => (
            <Card key={customer.id} className="p-5 bg-card border border-border hover:border-primary/20 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <div className="space-y-1 mt-2">
                    {customer.email && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5" /> {customer.email}
                      </p>
                    )}
                    {customer.phone && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> {customer.phone}
                      </p>
                    )}
                  </div>
                  {customer.training_goal && (
                    <p className="text-xs text-primary mt-2">Ziel: {customer.training_goal}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(customer)}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors">
                    <Edit className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                  <Link to={`/beratung/upgrade`}>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {selectedCustomer && editData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-card border border-border rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-foreground uppercase">Kunde bearbeiten</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Vorname</label>
                  <Input
                    value={editData.first_name || ''}
                    onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                    placeholder="Vorname"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Nachname</label>
                  <Input
                    value={editData.last_name || ''}
                    onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                    placeholder="Nachname"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">E-Mail</label>
                  <Input
                    value={editData.email || ''}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    placeholder="E-Mail"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Telefon</label>
                  <Input
                    value={editData.phone || ''}
                    onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    placeholder="Telefon"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Alter</label>
                  <Input
                    type="number"
                    value={editData.age || ''}
                    onChange={e => setEditData({ ...editData, age: parseInt(e.target.value) })}
                    placeholder="Alter"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-2 block">Trainingsziel</label>
                  <Input
                    value={editData.training_goal || ''}
                    onChange={e => setEditData({ ...editData, training_goal: e.target.value })}
                    placeholder="Trainingsziel"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
                  Abbrechen
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-bold uppercase hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
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