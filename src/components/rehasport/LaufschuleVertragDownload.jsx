import React, { useState } from 'react';
import { Download, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateLaufschuleVertrag } from '@/pages/rehasport/generateLaufschuleVertrag';

export default function LaufschuleVertragDownload({ profile, onDone }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const doc = generateLaufschuleVertrag(profile);
      doc.save(`Vertrag_${profile.name?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`);
      setTimeout(() => onDone?.(), 500);
    } catch (error) {
      console.error('Fehler beim Erstellen des PDFs:', error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 bg-background">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground uppercase tracking-tight leading-tight mb-3">
            VERTRAG BEREIT
          </h1>
          <p className="text-muted-foreground mb-6 text-base leading-relaxed">
            Dein Anmeldeververtrag wurde mit allen Angaben ausgefüllt. Du kannst ihn jetzt herunterladen und
            ausdrucken.
          </p>
        </motion.div>

        {/* Vertrag-Vorschau Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-3xl p-8 mb-8">
          <div className="space-y-4 mb-8">
            <h2 className="font-black text-lg text-foreground uppercase">Deine Vertragsdaten:</h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Name</p>
                <p className="font-semibold text-foreground">{profile.name || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase mb-1">E-Mail</p>
                <p className="font-semibold text-foreground">{profile.email || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Adresse</p>
                <p className="font-semibold text-foreground">{profile.address || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Geburtsdatum</p>
                <p className="font-semibold text-foreground">{profile.birthdate || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase mb-1">Krankenkasse</p>
                <p className="font-semibold text-foreground">{profile.health_insurance || '–'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase mb-1">IBAN</p>
                <p className="font-semibold text-foreground">{profile.iban?.slice(-8) || '–'}</p>
              </div>
            </div>

            {profile.selectedOffers && profile.selectedOffers.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-muted-foreground text-xs font-bold uppercase mb-3">Ausgewählte Kurse:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.selectedOffers.map((offer) => (
                    <span
                      key={offer}
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {offer.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-xs text-muted-foreground mb-4">
              ℹ️ Der Vertrag wird als PDF heruntergeladen. Bitte ausdrucken und unterschreiben.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleDownload}
              disabled={downloading}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-sm tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wird vorbereitet...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Vertrag herunterladen
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-sm text-muted-foreground">
          <p className="mb-2">
            <strong className="text-foreground">Nächste Schritte:</strong>
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>PDF herunterladen und ausdrucken</li>
            <li>Alle Angaben überprüfen und unterschreiben</li>
            <li>Den Vertrag an die AlbGym zurückgeben oder per Post versenden</li>
            <li>Kursbeginn nach Bestätigung</li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}