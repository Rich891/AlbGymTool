import React, { useState } from 'react';
import { Download, Check, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { generateLaufschuleVertrag } from './generateLaufschuleVertrag';

const LOGO_URL = 'https://media.base44.com/images/public/user_69ebb5f9878e5267e7fcc9b3/0137b7bb4_AlbGymLogo.png';
const COMPANY_ADDRESS = {
  name: 'AlbGym GmbH',
  street: 'Auingerweg 39',
  city: '72525 Münsingen',
  phone: '07381 - 93 86 510',
  email: 'info@alb-gym.de',
};

export default function RehaContract({ profile, onDone }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadVertrag = async () => {
    setDownloading(true);
    try {
      const doc = generateLaufschuleVertrag(profile);
      doc.save(`AlbGym-Vertrag-${profile.name?.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`);
      setTimeout(() => onDone?.(), 500);
    } catch (err) {
      console.error('Fehler beim Download:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-12 pb-10">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight leading-none mb-3">
            GLÜCKWUNSCH!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Deine Anmeldung ist abgeschlossen.
          </p>
          <p className="text-muted-foreground">
            Lade deinen Mitgliedschaftsvertrag herunter und starte sofort.
          </p>
        </motion.div>

        {/* Contract Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border-2 border-primary/40 bg-card p-8 mb-10 shadow-xl">

          <div className="text-center mb-6">
            <img src={LOGO_URL} alt="AlbGym" className="h-12 object-contain mx-auto mb-4" />
            <h2 className="text-2xl font-black text-foreground uppercase">Mitgliedschaftsvertrag Rehasport+</h2>
            <p className="text-sm text-muted-foreground mt-2">{new Date().toLocaleDateString('de-DE')}</p>
          </div>

          <div className="space-y-6 text-sm">
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Kundendaten</p>
              <div className="space-y-1 bg-secondary/50 rounded-xl p-4 text-foreground">
                <p><span className="font-bold">Name:</span> {profile.name}</p>
                <p><span className="font-bold">Geb.:</span> {profile.birthdate}</p>
                <p><span className="font-bold">Adresse:</span> {profile.address}</p>
                <p><span className="font-bold">E-Mail:</span> {profile.email}</p>
                <p><span className="font-bold">Telefon:</span> {profile.phone}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Leistungen</p>
              <div className="space-y-2">
                {[
                  { name: 'Rehasport+', included: true },
                  { name: 'FIVE Training', included: profile.selectedOffers?.includes('five') },
                  { name: 'Milon Training', included: profile.selectedOffers?.includes('milon') },
                ].map(s => (
                  <p key={s.name} className="text-foreground">{s.included ? '✓' : '–'} {s.name}</p>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Finanzielles</p>
              <div className="space-y-1 bg-secondary/50 rounded-xl p-4 text-foreground">
                <p><span className="font-bold">Wochenpreis:</span> {(profile.weekly_price || 6.98).toFixed(2).replace('.', ',')} €</p>
                <p><span className="font-bold">Monatspreis (ca.):</span> {((profile.weekly_price || 6.98) * 4.33).toFixed(2).replace('.', ',')} €</p>
                {profile.subsidyActive && (
                  <>
                    <p><span className="font-bold">§20-Pauschalen:</span> 199,00 € (2 × Kurs)</p>
                    <p className="text-primary font-bold">Voraussichtlicher Zuschuss: − 159,00 €</p>
                    <p><span className="font-bold">Eigenanteil:</span> 40,00 €</p>
                  </>
                )}
              </div>
            </div>

            <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
              <p className="font-bold mb-1">{COMPANY_ADDRESS.name}</p>
              <p>{COMPANY_ADDRESS.street}, {COMPANY_ADDRESS.city}</p>
              <p>{COMPANY_ADDRESS.phone} | {COMPANY_ADDRESS.email}</p>
            </div>
          </div>
        </motion.div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownloadVertrag}
          disabled={downloading}
          className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black text-lg uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-lg mb-4">
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Wird vorbereitet...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Vertrag herunterladen (PDF)
            </>
          )}
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="w-full h-14 rounded-2xl border-2 border-border text-foreground font-bold text-base uppercase tracking-wide hover:bg-secondary transition-all flex items-center justify-center gap-3">
          <Home className="w-5 h-5" />
          Zur Startseite
        </motion.button>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Behalte deinen heruntergeladenen Vertrag sicher. <br />
          Unser Team wird dich in Kürze kontaktieren, um die Einweisung zu planen.
        </p>
      </div>
    </div>
  );
}