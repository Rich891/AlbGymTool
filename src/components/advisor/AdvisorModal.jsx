import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, ArrowRight } from 'lucide-react';

const ADVISOR_PASSWORD = 'albgym2024';

const ADVISOR_LINKS = [
  { label: 'Beratungsverlauf', path: '/berater/verlauf' },
  { label: 'Kundenverwaltung', path: '/berater/kunden' },
  { label: 'Leistungen', path: '/berater/leistungen' },
  { label: 'Tarife', path: '/berater/tarife' },
  { label: 'Regeln', path: '/berater/regeln' },
  { label: 'Analytics', path: '/berater/analytics' },
  { label: 'Admin', path: '/berater/admin' },
];

export default function AdvisorModal({ open, onClose }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState(false);

  const handleUnlock = () => {
    if (password === ADVISOR_PASSWORD) {
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleNav = (path) => {
    onClose();
    setUnlocked(false);
    setPassword('');
    navigate(path);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setUnlocked(false); setPassword(''); setError(false); }, 300);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm"
          >
            <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-bold text-foreground">Beraterbereich</h2>
                </div>
                <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!unlocked ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Bitte Passwort eingeben, um den internen Beraterbereich zu öffnen.</p>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="Passwort"
                    className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-sm ${error ? 'border-destructive' : 'border-input'}`}
                    autoFocus
                  />
                  {error && <p className="text-xs text-destructive">Falsches Passwort</p>}
                  <button
                    onClick={handleUnlock}
                    className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
                  >
                    Entsperren
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {ADVISOR_LINKS.map((link) => (
                    <button
                      key={link.path}
                      onClick={() => handleNav(link.path)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left group"
                    >
                      <span className="text-sm font-medium text-foreground">{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}