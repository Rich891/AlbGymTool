import React, { useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import SignaturePad from '@/components/shared/SignaturePad';

export default function RehaSignature({ profile, update, onNext, onBack, skipAllowed = false }) {
  const [signature, setSignature] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSkip = () => {
    update({ signature: null });
    onNext();
  };

  const handleProceed = async () => {
    if (!signature) return;
    setSaving(true);
    try {
      console.log('Unterschrift wird gespeichert:', signature.slice(0, 50) + '...');
      update({ signature });
      // Warte kurz damit update durchgeht
      await new Promise(resolve => setTimeout(resolve, 100));
      onNext();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-2xl">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" /> Zurück
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            DEINE<br /><span className="text-primary">UNTERSCHRIFT</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Unterschreibe hier zur Bestätigung deiner Anmeldung.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-3xl p-8">
          
          <SignaturePad
            label="Unterschrift *"
            onSigned={setSignature}
          />

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Mit deiner Unterschrift stimmst du den Bedingungen zu.
          </p>

          <div className="flex gap-3 mt-8">
            <button
              onClick={onBack}
              className="flex-1 h-12 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all font-bold">
              Abbrechen
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleProceed}
              disabled={!signature || saving}
              className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Bestätigen & fortfahren →'}
            </motion.button>
          </div>

          {skipAllowed && (
            <div className="mt-4 text-center">
              <button
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                Unterschrift überspringen (Berater-Modus)
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}