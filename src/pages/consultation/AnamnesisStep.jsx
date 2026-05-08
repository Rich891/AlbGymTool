import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check } from 'lucide-react';
import {
  Scale, Dumbbell, HeartPulse, Zap, Leaf,
  Clock, Users, AlertCircle, ThumbsUp, Rocket,
  BookOpen, Shuffle, Star,
  Activity, Bone, Wind,
  Waves, Coffee, Trophy
} from 'lucide-react';

// ─── Question Matrix ────────────────────────────────────────────────────────
// 5 unique questions, no overlap with GoalStep (which covers primary goals).
// Each question uncovers a different axis: motivation, experience, schedule, 
// physical constraints, and lifestyle priority.

const QUESTIONS = [
  {
    id: 'motivation',
    question: 'Was treibt dich wirklich an?',
    hint: 'Wähle eine Antwort',
    multi: false,
    layout: 'grid3',
    options: [
      {
        id: 'look',
        label: 'Aussehen',
        sub: 'Ich möchte meinen Körper formen und sichtbare Veränderungen erzielen',
        icon: Scale,
        image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80',
        color: 'from-orange-500/70',
      },
      {
        id: 'strength',
        label: 'Stärke',
        sub: 'Leistungsfähiger werden – mehr Kraft, mehr Energie im Alltag',
        icon: Dumbbell,
        image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&q=80',
        color: 'from-red-500/70',
      },
      {
        id: 'health',
        label: 'Gesundheit',
        sub: 'Langfristig fit bleiben, Prävention, Wohlbefinden steigern',
        icon: HeartPulse,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
        color: 'from-pink-500/70',
      },
      {
        id: 'energy',
        label: 'Energie',
        sub: 'Stress abbauen, besser schlafen, mehr Vitalität im Alltag',
        icon: Zap,
        image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80',
        color: 'from-yellow-500/70',
      },
      {
        id: 'recovery',
        label: 'Erholung',
        sub: 'Nach Verletzung, Beschwerden oder langer Pause wieder aktiv werden',
        icon: Leaf,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
        color: 'from-emerald-500/70',
      },
      {
        id: 'fun',
        label: 'Spaß & Community',
        sub: 'Gemeinsam trainieren, Kurse ausprobieren, neue Leute kennenlernen',
        icon: Users,
        image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=600&q=80',
        color: 'from-indigo-500/70',
      },
    ],
  },
  {
    id: 'experience',
    question: 'Wie viel Erfahrung bringst du mit?',
    hint: 'Wähle eine Antwort',
    multi: false,
    layout: 'grid4',
    options: [
      {
        id: 'none',
        label: 'Einsteiger',
        sub: 'Ich war noch nie regelmäßig im Fitnessstudio – ich brauche Führung und einen klaren Einstieg',
        icon: BookOpen,
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80',
        color: 'from-sky-500/70',
      },
      {
        id: 'some',
        label: 'Gelegentlich',
        sub: 'Ich war schon mal dabei, aber unregelmäßig – ich kenne die Basics',
        icon: Activity,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
        color: 'from-teal-500/70',
      },
      {
        id: 'regular',
        label: 'Regelmäßig',
        sub: 'Ich trainiere seit einer Weile – ich weiß was ich tue und suche Optimierung',
        icon: Trophy,
        image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80',
        color: 'from-amber-500/70',
      },
      {
        id: 'advanced',
        label: 'Fortgeschritten',
        sub: 'Ich trainiere intensiv und gezielt – ich brauche professionelle Strukturen',
        icon: Star,
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80',
        color: 'from-purple-500/70',
      },
    ],
  },
  {
    id: 'schedule',
    question: 'Wie oft kannst du realistisch kommen?',
    hint: 'Wähle eine Antwort',
    multi: false,
    layout: 'grid3',
    options: [
      {
        id: '1x',
        label: '1× pro Woche',
        sub: 'Mein Alltag ist voll – aber einmal schaffe ich es zuverlässig',
        icon: Clock,
        image: 'https://images.unsplash.com/photo-1506784365847-bbad939e9501?w=600&q=80',
        color: 'from-slate-500/70',
      },
      {
        id: '2-3x',
        label: '2–3× pro Woche',
        sub: 'Das ist mein Zielrhythmus – machbar und effektiv',
        icon: Shuffle,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
        color: 'from-blue-500/70',
      },
      {
        id: '4x+',
        label: '4× oder öfter',
        sub: 'Sport ist Priorität – ich will das Training zu einem festen Teil meines Lebens machen',
        icon: Rocket,
        image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80',
        color: 'from-primary/70',
      },
    ],
  },
  {
    id: 'complaints',
    question: 'Gibt es körperliche Einschränkungen?',
    hint: 'Mehrfachauswahl möglich – wähle alles Zutreffende',
    multi: true,
    layout: 'grid3',
    options: [
      {
        id: 'back',
        label: 'Rücken & Nacken',
        sub: 'Verspannungen, Bandscheiben, Haltungsprobleme oder chronische Schmerzen im Rücken',
        icon: Bone,
        image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
        color: 'from-orange-600/70',
      },
      {
        id: 'joints',
        label: 'Knie & Hüfte',
        sub: 'Arthrose, Meniskus, Hüftprobleme oder Beschwerden bei Belastung',
        icon: Activity,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
        color: 'from-red-600/70',
      },
      {
        id: 'cardio',
        label: 'Herz & Kreislauf',
        sub: 'Bluthochdruck, Herzprobleme oder ärztliche Empfehlung zur Vorsicht',
        icon: HeartPulse,
        image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80',
        color: 'from-pink-600/70',
      },
      {
        id: 'breath',
        label: 'Atemwege',
        sub: 'Asthma oder Einschränkungen bei starker Ausdauerbelastung',
        icon: Wind,
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80',
        color: 'from-sky-600/70',
      },
      {
        id: 'other',
        label: 'Andere Beschwerden',
        sub: 'Schulter, Arm, Fuß oder sonstige Einschränkungen – wir berücksichtigen das',
        icon: AlertCircle,
        image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
        color: 'from-amber-600/70',
      },
      {
        id: 'none',
        label: 'Keine – alles fit',
        sub: 'Ich habe keine körperlichen Einschränkungen und kann voll loslegen',
        icon: ThumbsUp,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
        color: 'from-emerald-600/70',
      },
    ],
  },
  {
    id: 'lifestyle',
    question: 'Was soll das Training für dich sein?',
    hint: 'Wähle eine Antwort',
    multi: false,
    layout: 'grid3',
    options: [
      {
        id: 'coached',
        label: 'Betreut & geführt',
        sub: 'Ich möchte Anleitung, einen Trainingsplan und Begleitung durch Experten',
        icon: Users,
        image: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=600&q=80',
        color: 'from-violet-500/70',
      },
      {
        id: 'mixed',
        label: 'Flexibel & gemischt',
        sub: 'Manchmal geführt, manchmal frei – je nach Lust und Zeit',
        icon: Shuffle,
        image: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=80',
        color: 'from-teal-500/70',
      },
      {
        id: 'selfguided',
        label: 'Eigenständig',
        sub: 'Ich trainiere lieber selbst – gib mir die Infrastruktur, den Rest mache ich',
        icon: Star,
        image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80',
        color: 'from-primary/70',
      },
      {
        id: 'wellness',
        label: 'Training & Wellness',
        sub: 'Sport ist für mich komplett – mit Sauna, Entspannung und Auszeit danach',
        icon: Waves,
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
        color: 'from-blue-500/70',
      },
      {
        id: 'social',
        label: 'Community & Kurse',
        sub: 'Ich will Kurse, Gemeinschaft und Spaß beim Training – nicht alleine trainieren',
        icon: Coffee,
        image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80',
        color: 'from-pink-500/70',
      },
      {
        id: 'efficient',
        label: 'Effizient & kurz',
        sub: 'Ich habe wenig Zeit – maximale Wirkung in minimaler Zeit ist mein Ziel',
        icon: Zap,
        image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80',
        color: 'from-yellow-500/70',
      },
    ],
  },
];

// ─── Option Card ─────────────────────────────────────────────────────────────

function OptionCard({ option, selected, onClick, multi }) {
  const [hovered, setHovered] = useState(false);
  const Icon = option.icon;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative overflow-hidden rounded-2xl text-left focus:outline-none transition-all duration-200 h-36 md:h-44
        ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'ring-1 ring-transparent hover:ring-primary/30'}`}
    >
      {/* Background image */}
      <img
        src={option.image}
        alt={option.label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-t ${option.color} to-black/80 transition-opacity duration-300 ${hovered || selected ? 'opacity-100' : 'opacity-90'}`} />

      {/* Selected check */}
      {selected && (
        <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary flex items-center justify-center z-10">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Icon */}
      <div className={`absolute top-3 left-3 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 z-10
        ${selected ? 'bg-primary' : 'bg-black/40 backdrop-blur-sm group-hover:bg-black/60'}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>

      {/* Label always visible */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <h3 className={`text-sm md:text-base font-black uppercase leading-tight transition-colors duration-200 ${selected ? 'text-primary' : 'text-white'}`}>
          {option.label}
        </h3>

        {/* Hover sub-text */}
        <AnimatePresence>
          {(hovered || selected) && (
            <motion.p
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-white/80 leading-snug overflow-hidden"
            >
              {option.sub}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AnamnesisStep({ anamnesis, setAnamnesis, onNext, onBack }) {
  const [currentQ, setCurrentQ] = useState(0);
  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  const handleSelect = (option) => {
    if (question.multi) {
      const current = anamnesis[question.id] || [];
      const updated = current.includes(option.id)
        ? current.filter(o => o !== option.id)
        : [...current, option.id];
      setAnamnesis(prev => ({ ...prev, [question.id]: updated }));
    } else {
      setAnamnesis(prev => ({ ...prev, [question.id]: option.id }));
      if (currentQ < QUESTIONS.length - 1) {
        setTimeout(() => setCurrentQ(currentQ + 1), 320);
      } else {
        setTimeout(() => onNext(), 320);
      }
    }
  };

  const isSelected = (option) => {
    if (question.multi) return (anamnesis[question.id] || []).includes(option.id);
    return anamnesis[question.id] === option.id;
  };

  const canProceed = question.multi
    ? (anamnesis[question.id] || []).length > 0
    : !!anamnesis[question.id];

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) setCurrentQ(currentQ + 1);
    else onNext();
  };

  const gridClass = question.layout === 'grid4'
    ? 'grid grid-cols-2 md:grid-cols-4 gap-3'
    : 'grid grid-cols-2 md:grid-cols-3 gap-3';

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-5">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span className="font-medium">Schritt {currentQ + 1} / {QUESTIONS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Question + Options */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="flex-1 flex flex-col px-4 md:px-6 pt-6 pb-4"
        >
          {/* Heading */}
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-foreground leading-tight">
              {question.question}
            </h2>
            <p className={`mt-1.5 text-sm font-medium ${question.multi ? 'text-primary' : 'text-muted-foreground'}`}>
              {question.hint}
            </p>
          </div>

          {/* Cards grid */}
          <div className={gridClass}>
            {question.options.map((option) => (
              <OptionCard
                key={option.id}
                option={option}
                selected={isSelected(option)}
                onClick={() => handleSelect(option)}
                multi={question.multi}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="px-4 md:px-6 pb-8 pt-3 flex gap-3">
        <button
          onClick={currentQ > 0 ? () => setCurrentQ(currentQ - 1) : onBack}
          className="h-14 px-5 rounded-2xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all flex items-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        {question.multi && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            disabled={!canProceed}
            className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base uppercase tracking-wide hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Weiter →
          </motion.button>
        )}
      </div>
    </div>
  );
}