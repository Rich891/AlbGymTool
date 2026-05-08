import React from 'react';
import { Check, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

function AppointmentCard({ title, sub, image, onClick }) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-3xl h-56 text-left focus:outline-none w-full hover:shadow-[0_0_40px_rgba(0,230,80,0.3)] transition-all duration-300"
    >
      <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-black/60 group-hover:from-primary/80 transition-all duration-300" />
      <div className="absolute inset-0 rounded-3xl ring-inset ring-0 group-hover:ring-2 group-hover:ring-primary/70 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="flex items-center gap-2 mb-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <span className="text-xs text-primary font-bold uppercase tracking-widest">Termin vereinbaren</span>
        </div>
        <h3 className="text-xl font-black text-white uppercase leading-tight group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-sm text-white/70 mt-1 leading-snug">{sub}</p>
      </div>
    </motion.button>
  );
}

export default function RehaAppointment({ profile, onDone }) {
  const selected = profile.selectedOffers || [];
  const hasFive = selected.includes('five');
  const hasMilon = selected.includes('milon');
  const firstName = (profile.name || 'du').split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col px-4 md:px-8 pt-8 pb-10">
      {/* Success header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs text-primary uppercase tracking-widest font-bold">Alles bereit</p>
          <h1 className="text-2xl font-black text-foreground uppercase">Dein nächster Schritt</h1>
        </div>
      </div>

      <p className="text-muted-foreground mb-8 max-w-xl leading-relaxed">
        Super, {firstName}! Alles ist vorbereitet. Wähle jetzt deinen Einweisungstermin, damit du sicher starten kannst.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        {hasFive && (
          <AppointmentCard
            title="FIVE & Geräte-Einweisung"
            sub="Wir zeigen dir, wie du FIVE sinnvoll nutzt und dein ergänzendes Training sicher startest."
            image="https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&q=80"
            onClick={() => alert('Termin FIVE – wird verknüpft')}
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

      <div className="mt-auto pt-10 max-w-3xl">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onDone}
          className="w-full h-14 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-semibold transition-all"
        >
          Zur Startseite
        </motion.button>
      </div>
    </div>
  );
}