import { useEffect, useRef } from 'react';
import { LOGROS, PERSONAJES, TOTAL_PAGINAS, TOTAL_ZONAS } from '../data/content';
import { getLevelForXP, getNextLevelXP, LEVEL_NAMES, type MemoryStats, type WhoAmIStats } from '../hooks/useGame';
import { tr } from '../i18n';

interface PerfilProps {
  playerName: string;
  xp: number;
  completedSections: string[];
  completedMissions: string[];
  unlockedAchievements: string[];
  quizAnswers: Record<number, string>;
  quizCompleted: boolean;
  memory: MemoryStats;
  whoAmI: WhoAmIStats;
  charactersViewed: number;
  onChangeName: (name: string) => void;
  onReset: () => void;
  /** Progreso en el mapa del videojuego. */
  adventure?: { zones: number; pages: number; talked: number; answered: number };
}

const SECTIONS_TOTAL = ['novela', 'personajes', 'mentefacto', 'timeline', 'mapa', 'quiz'];
const SECTION_LABELS: Record<string, string> = {
  novela: 'La Novela',
  personajes: 'Personajes',
  mentefacto: 'Mentefacto',
  timeline: 'Línea del tiempo',
  mapa: 'Mapa',
  quiz: 'Quiz',
};

export default function Perfil({ playerName, xp, completedSections, completedMissions, unlockedAchievements, quizAnswers, quizCompleted, memory, whoAmI, charactersViewed, onReset, adventure }: PerfilProps) {
  const ref = useRef<HTMLDivElement>(null);
  const levelInfo = getLevelForXP(xp);
  const nextXP = getNextLevelXP(xp);
  const prevXP = levelInfo.minXP;
  const progress = Math.min(100, ((xp - prevXP) / (nextXP - prevXP)) * 100);

  const quizTotal = Object.keys(quizAnswers).length;
  const quizCorrect = Object.entries(quizAnswers).filter(([id, ans]) => {
    const q = [
      { id: 0, correcta: 'Andrés Chiliquinga' }, { id: 1, correcta: '1934' },
      { id: 2, correcta: 'Un terreno asignado al indígena por el patrón a cambio de trabajo' },
      { id: 3, correcta: 'Cunshi' }, { id: 4, correcta: 'Denuncia social e indigenismo' },
      { id: 5, correcta: 'Es el terrateniente opresor' }, { id: 6, correcta: 'Falso' },
      { id: 7, correcta: 'Ecuador' }, { id: 8, correcta: 'La Iglesia Católica como aliada del poder terrateniente' },
      { id: 9, correcta: '"¡Ñucanchic huasipungo!" (¡Nuestro huasipungo!)' }, { id: 10, correcta: 'Verdadero' },
      { id: 11, correcta: 'El amor romántico idealizado' }, { id: 12, correcta: '1964' },
      { id: 13, correcta: 'Abusa de ella sexualmente' }, { id: 14, correcta: 'Indigenismo' },
    ];
    return q.find(qq => qq.id === Number(id))?.correcta === ans;
  }).length;

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-2xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>{tr('Sistema', 'System')}</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>{tr('Perfil', 'Profile')}</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {/* Player card */}
      <div className="section-reveal mb-6 p-6 rounded" style={{ background: '#17100a', border: '1px solid #c9a22744' }}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-display font-bold flex-shrink-0"
            style={{ background: '#c9a22722', border: '2px solid #c9a227', color: '#c9a227' }}>
            {playerName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="font-display text-xl font-bold" style={{ color: '#e8d5b0' }}>{playerName}</h3>
            <p className="font-body text-sm" style={{ color: '#c9a227' }}>{tr(levelInfo.name)}</p>
          </div>
        </div>

        {/* XP bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-body mb-1" style={{ color: '#8c7459' }}>
            <span>{xp} XP</span>
            <span>{levelInfo.level < 5 ? `${nextXP} XP (${tr('Nivel', 'Level')} ${levelInfo.level + 1})` : tr('Nivel máximo', 'Max level')}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Level pills */}
        <div className="flex flex-wrap gap-2">
          {LEVEL_NAMES.map((name, i) => (
            <span key={name} className="text-xs px-2 py-0.5 rounded-full font-body"
              style={{
                background: i + 1 <= levelInfo.level ? '#c9a22722' : '#17100a',
                border: `1px solid ${i + 1 <= levelInfo.level ? '#c9a227' : '#2a1f0f'}`,
                color: i + 1 <= levelInfo.level ? '#c9a227' : '#4a3820',
              }}>
              {i + 1}. {tr(name)}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="section-reveal mb-6">
        <h3 className="font-display text-sm uppercase tracking-widest mb-4" style={{ color: '#7a6118' }}>{tr('Estadísticas de progreso', 'Progress statistics')}</h3>
        <div className="space-y-3">
          {SECTIONS_TOTAL.map(sec => {
            const done = completedSections.includes(sec);
            const pct = done ? 100 : 0;
            return (
              <div key={sec}>
                <div className="flex justify-between text-xs font-body mb-1" style={{ color: '#8c7459' }}>
                  <span>{tr(SECTION_LABELS[sec])}</span>
                  <span style={{ color: done ? '#4a7c59' : '#4a3820' }}>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {quizTotal > 0 && (
            <div>
              <div className="flex justify-between text-xs font-body mb-1" style={{ color: '#8c7459' }}>
                <span>{tr('Quiz (respuestas correctas)', 'Quiz (correct answers)')}</span>
                <span style={{ color: '#c9a227' }}>{quizTotal > 0 ? Math.round((quizCorrect / 15) * 100) : 0}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${quizTotal > 0 ? Math.round((quizCorrect / 15) * 100) : 0}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="section-reveal grid grid-cols-3 gap-3 mb-6">
        {[
          { label: tr('XP Total', 'Total XP'), value: xp, color: '#c9a227' },
          { label: tr('Misiones', 'Missions'), value: `${completedMissions.length}/6`, color: '#4a7c59' },
          { label: tr('Logros', 'Achievements'), value: `${unlockedAchievements.length}/${LOGROS.length}`, color: '#7a6118' },
        ].map(stat => (
          <div key={stat.label} className="p-4 rounded text-center" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
            <div className="font-display text-xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
            <div className="font-body text-xs mt-1" style={{ color: '#8c7459' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Juegos */}
      <div className="section-reveal mb-6">
        <h3 className="font-display text-sm uppercase tracking-widest mb-4" style={{ color: '#7a6118' }}>{tr('Juegos', 'Games')}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: tr('Memoria: victorias', 'Memory: wins'), value: (memory.wins.facil ?? 0) + (memory.wins.media ?? 0) + (memory.wins.dificil ?? 0) },
            { label: tr('Memoria: mejor puntaje', 'Memory: best score'), value: Math.max(0, ...Object.values(memory.best)) },
            { label: tr('¿Quién soy? resueltos', 'Who am I? solved'), value: `${whoAmI.solved.length}/${PERSONAJES.length}` },
            { label: tr('Personajes vistos', 'Characters viewed'), value: `${charactersViewed}/${PERSONAJES.length}` },
          ].map(stat => (
            <div key={stat.label} className="p-3 rounded text-center" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
              <div className="font-display text-lg font-bold" style={{ color: '#c9a227' }}>{stat.value}</div>
              <div className="font-body text-xs mt-1" style={{ color: '#8c7459' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Aventura en el mapa */}
      {adventure && (
        <div className="section-reveal mb-6">
          <h3 className="font-display text-sm uppercase tracking-widest mb-4" style={{ color: '#7a6118' }}>{tr('Aventura', 'Adventure')}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: tr('Zonas descubiertas', 'Zones discovered'), value: `${adventure.zones}/${TOTAL_ZONAS}` },
              { label: tr('Páginas encontradas', 'Pages found'), value: `${adventure.pages}/${TOTAL_PAGINAS}` },
              { label: tr('Personajes conocidos', 'Characters met'), value: `${adventure.talked}/${PERSONAJES.length}` },
              { label: tr('Preguntas acertadas', 'Questions answered'), value: `${adventure.answered}/${PERSONAJES.length}` },
            ].map(stat => (
              <div key={stat.label} className="p-3 rounded text-center" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
                <div className="font-display text-lg font-bold" style={{ color: '#c9a227' }}>{stat.value}</div>
                <div className="font-body text-xs mt-1" style={{ color: '#8c7459' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="section-reveal text-center">
        <button
          onClick={() => { if (window.confirm(tr('¿Reiniciar todo el progreso?', 'Reset all progress?'))) onReset(); }}
          className="text-xs font-body px-4 py-2 rounded cursor-pointer border-0 transition-colors"
          style={{ background: '#17100a', color: '#4a3820', border: '1px solid #2a1f0f' }}
        >
          {tr('Reiniciar progreso', 'Reset progress')}
        </button>
      </div>
    </div>
  );
}
