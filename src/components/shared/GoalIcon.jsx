import React from 'react';
import { 
  Scale, Dumbbell, Activity, Move, Heart, 
  HeartPulse, Zap, Brain, Play, Users 
} from 'lucide-react';

const ICON_MAP = {
  Scale, Dumbbell, Activity, Move, Heart, 
  HeartPulse, Zap, Brain, Play, Users
};

export default function GoalIcon({ iconName, className = "w-5 h-5" }) {
  const Icon = ICON_MAP[iconName] || Heart;
  return <Icon className={className} />;
}