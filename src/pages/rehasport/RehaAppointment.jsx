import React from 'react';
import { Check, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

function AppointmentCard({ title, sub, image, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl h-56 text-left focus:outline-none w-full hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300"
    >
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-black/40 group-hover:from-black/75 transition-all duration-300" />
      <div className="absolute inset-0 rounded-3xl ring-1 ring-border group-hover:ring-white/20 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <h3 className="text-xl font-black text-white uppercase leading-tight group-hover:text-foreground transition-colors duration-300">{title}</h3>
        <p className="text-sm text-white/60 mt-1 leading-snug">{sub}</p>
      </div>
    </motion.button>
  );
}

export default function RehaAppointment({ profile, onDone }) {
  const selected = profile.selectedOffers || [];
  const hasFive = selected.includes('five');
  const hasMilon = selected.includes('milon');
  // If Milon is selected, no separate Geräte-Einweisung needed
  const hasGeraete = hasFive && !hasMilon;
  const firstName = (profile.name || 'du').split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col items-center px-4 md:px-8 pt-8 pb-10">
      <div className="w-full max-w-3xl">

        {/* Success header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs text-primary uppercase tracking-widest font-bold">Alles bereit</p>
            <h1 className="text-3xl font-black text-foreground uppercase">Zeit zu starten!</h1>
          </div>
        </div>

        <p className="text-muted-foreground mb-8 max-w-xl leading-relaxed">
          Super, {firstName}! Alles ist vorbereitet. Wähle jetzt deinen Einweisungstermin, damit du sicher starten kannst.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hasFive && (
            <AppointmentCard
              title="FIVE-Einweisung"
              sub="Wir zeigen dir, wie du FIVE sinnvoll nutzt und gezielt trainierst."
              image="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80"
              onClick={() => alert('Termin FIVE – wird verknüpft')}
            />
          )}
          {hasGeraete && (
            <AppointmentCard
              title="Geräte-Einweisung"
              sub="Wir zeigen dir alle relevanten Geräte, damit du sicher und selbstständig trainieren kannst."
              image="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80"
              onClick={() => alert('Termin Geräte – wird verknüpft')}
            />
          )}
          {hasMilon && (
            <AppointmentCard
              title="Milon-Einweisung"
              sub="Wir richten deine Geräte ein und zeigen dir, wie du sicher und einfach trainierst."
              image="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=700&q=80"
              onClick={() => alert('Termin Milon – wird verknüpft')}
            />
          )}
          {hasFive && hasMilon && (
            <AppointmentCard
              title="Beide Termine planen"
              sub="FIVE und Milon – wir planen beides zusammen für deinen optimalen Start."
              image="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=700&q=80"
              onClick={() => alert('Beide Termine – wird verknüpft')}
            />
          )}
          {!hasFive && !hasMilon && (
            <div className="p-6 rounded-3xl border border-border bg-card">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-black text-foreground text-lg mb-2">Kursstart</h3>
              <p className="text-muted-foreground text-sm leading-snug">Dein Rehasport-Kurs startet nach Vorlage deines Rezepts. Das Team vor Ort hilft dir beim nächsten Schritt.</p>
            </div>
          )}
        </div>

        <div className="mt-10">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onDone}
            className="w-full h-14 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-semibold transition-all"
          >
            Zur Startseite
          </motion.button>
        </div>
      </div>
    </div>
  );
}