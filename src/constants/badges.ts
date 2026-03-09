// src/constants/badges.ts
export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  check: (s: UserStats) => boolean;
}

export interface UserStats {
  streak: number;
  maxSpeed: number;
  totalMeasures: number;
  rank: number;
  badges: string[];
}

export const BADGES: Badge[] = [
  { id: 'first_run',    icon: '🚀', name: 'Premier Départ',    description: 'Effectuer ta première mesure',  check: s => s.totalMeasures >= 1   },
  { id: 'streak_3',    icon: '✨', name: 'En Route',           description: '3 jours de suite',              check: s => s.streak >= 3          },
  { id: 'streak_7',    icon: '🔥', name: 'Semaine de Feu',     description: '7 jours de suite',              check: s => s.streak >= 7          },
  { id: 'streak_30',   icon: '⚡', name: 'Mois Électrique',    description: '30 jours de suite',             check: s => s.streak >= 30         },
  { id: 'streak_100',  icon: '💎', name: 'Centurion',          description: '100 jours de suite',            check: s => s.streak >= 100        },
  { id: 'speed_20',    icon: '💨', name: 'Vent Frais',         description: 'Dépasser 20 km/h',              check: s => s.maxSpeed >= 20       },
  { id: 'speed_50',    icon: '🏎️', name: 'Pilote Urbain',      description: 'Dépasser 50 km/h',              check: s => s.maxSpeed >= 50       },
  { id: 'speed_100',   icon: '🚀', name: 'Centurion Rapide',   description: 'Dépasser 100 km/h',             check: s => s.maxSpeed >= 100      },
  { id: 'speed_150',   icon: '🦅', name: "L'Aigle",            description: 'Dépasser 150 km/h',             check: s => s.maxSpeed >= 150      },
  { id: 'measures_10', icon: '📊', name: 'Régulier',           description: '10 mesures au total',           check: s => s.totalMeasures >= 10  },
  { id: 'measures_50', icon: '🎯', name: 'Assidu',             description: '50 mesures au total',           check: s => s.totalMeasures >= 50  },
  { id: 'top_10',      icon: '🌟', name: 'Élite',              description: 'Top 10 du classement',          check: s => s.rank <= 10           },
  { id: 'top_3',       icon: '🏆', name: 'Podium',             description: 'Top 3 du classement',           check: s => s.rank <= 3            },
  { id: 'number_1',    icon: '👑', name: 'Le Meilleur',        description: 'Numéro 1 du classement',        check: s => s.rank === 1           },
];

export function getNewlyUnlockedBadges(oldStats: UserStats, newStats: UserStats): Badge[] {
  return BADGES.filter(
    b => !b.check(oldStats) && b.check(newStats) && !newStats.badges.includes(b.id)
  );
}
