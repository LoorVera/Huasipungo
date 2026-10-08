import { useState, useEffect, useRef } from 'react';
import { QUIZ_QUESTIONS } from '../data/content';
import { tr } from '../i18n';

interface QuizProps {
  onComplete: (score: number, total: number) => void;
  onAddXP: (amount: number) => void;
  quizCompleted: boolean;
  quizAnswers: Record<number, string>;
  onSubmitAnswer: (id: number, answer: string) => void;
}

export default function Quiz({ onComplete, onAddXP, quizCompleted, quizAnswers, onSubmitAnswer }: QuizProps) {
  const [currentQ, setCurrentQ] = useState(0);
  const [showResult, setShowResult] = useState<null | 'correct' | 'incorrect'>(null);
  const [finished, setFinished] = useState(quizCompleted);
  const ref = useRef<HTMLDivElement>(null);

  const TOTAL = QUIZ_QUESTIONS.length;
  const answeredCount = Object.keys(quizAnswers).length;
  const correctCount = QUIZ_QUESTIONS.filter(q => quizAnswers[q.id] === q.correcta).length;

  useEffect(() => {
    if (quizCompleted) setFinished(true);
  }, [quizCompleted]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const question = QUIZ_QUESTIONS[currentQ];

  const handleAnswer = (answer: string) => {
    if (quizAnswers[question.id] !== undefined) return; // already answered
    onSubmitAnswer(question.id, answer);
    const isCorrect = answer === question.correcta;
    setShowResult(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) onAddXP(100);
  };

  const handleNext = () => {
    setShowResult(null);
    if (currentQ < TOTAL - 1) {
      setCurrentQ(c => c + 1);
    } else {
      setFinished(true);
      onComplete(correctCount, TOTAL);
    }
  };

  const progress = ((currentQ + (showResult ? 1 : 0)) / TOTAL) * 100;

  const CATEGORIA_COLORS: Record<string, string> = {
    Personajes: '#c9a227',
    Argumento: '#6b3f2a',
    Contexto: '#4a7c59',
    Temas: '#7a6118',
    Autor: '#4a4a8a',
    'Análisis': '#8a4a4a',
    'Verdadero/Falso': '#4a6b7a',
  };

  return (
    <div ref={ref} className="max-w-2xl mx-auto px-4 py-12">
      <div className="section-reveal text-center mb-10">
        <p className="font-display text-xs tracking-[0.4em] uppercase mb-3" style={{ color: '#7a6118' }}>{tr('Sección VI', 'Section VI')}</p>
        <h2 className="font-display text-4xl md:text-5xl font-black mb-4" style={{
          background: 'linear-gradient(135deg, #e8c84a 0%, #c9a227 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>Quiz</h2>
        <div className="w-20 h-px mx-auto" style={{ background: 'linear-gradient(90deg, transparent, #c9a227, transparent)' }} />
      </div>

      {finished ? (
        /* Results screen */
        <div className="section-reveal text-center animate-fade-in-up">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl"
            style={{ background: correctCount >= TOTAL * 0.8 ? '#2d5a3d22' : '#6b3f2a22', border: `2px solid ${correctCount >= TOTAL * 0.8 ? '#4a7c59' : '#c9a227'}` }}>
            {correctCount >= TOTAL * 0.8 ? '🏆' : '📚'}
          </div>
          <h3 className="font-display text-2xl font-bold mb-2" style={{ color: '#e8d5b0' }}>
            {correctCount >= TOTAL * 0.8 ? tr('¡Excelente!', 'Excellent!') : tr('Buen intento', 'Good try')}
          </h3>
          <p className="font-body mb-6" style={{ color: '#8c7459' }}>
            {tr('Respondiste correctamente', 'You answered correctly')} <span style={{ color: '#c9a227' }}>{correctCount}</span> {tr('de', 'of')} <span style={{ color: '#c9a227' }}>{TOTAL}</span> {tr('preguntas', 'questions')}
          </p>

          <div className="text-4xl font-display font-black mb-2" style={{ color: '#c9a227' }}>
            {Math.round((correctCount / TOTAL) * 100)}%
          </div>
          <div className="w-48 mx-auto progress-bar mb-6">
            <div className="progress-fill" style={{ width: `${(correctCount / TOTAL) * 100}%` }} />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8 text-center">
            <div className="p-3 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
              <div className="font-display text-xl font-bold" style={{ color: '#4a7c59' }}>{correctCount}</div>
              <div className="text-xs font-body" style={{ color: '#8c7459' }}>{tr('Correctas', 'Correct')}</div>
            </div>
            <div className="p-3 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
              <div className="font-display text-xl font-bold" style={{ color: '#8a4a4a' }}>{TOTAL - correctCount}</div>
              <div className="text-xs font-body" style={{ color: '#8c7459' }}>{tr('Incorrectas', 'Incorrect')}</div>
            </div>
            <div className="p-3 rounded" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
              <div className="font-display text-xl font-bold" style={{ color: '#c9a227' }}>+{500 + (correctCount === TOTAL ? 300 : 0)} XP</div>
              <div className="text-xs font-body" style={{ color: '#8c7459' }}>{tr('Ganados', 'Earned')}</div>
            </div>
          </div>

          {/* Review */}
          <div className="text-left space-y-3">
            <h4 className="font-display text-sm" style={{ color: '#c9a227' }}>{tr('Revisión de respuestas', 'Answer review')}</h4>
            {QUIZ_QUESTIONS.map(q => {
              const userAnswer = quizAnswers[q.id];
              const isCorrect = userAnswer === q.correcta;
              return (
                <div key={q.id} className="p-4 rounded text-xs" style={{ background: '#17100a', border: `1px solid ${isCorrect ? '#2d5a3d' : '#6b3f2a'}` }}>
                  <div className="flex items-start gap-2">
                    <span>{isCorrect ? '✓' : '✗'}</span>
                    <div>
                      <p className="font-display mb-1" style={{ color: '#e8d5b0' }}>{tr(q.pregunta)}</p>
                      {!isCorrect && (
                        <p className="font-body" style={{ color: '#8c7459' }}>{tr('Tu respuesta', 'Your answer')}: <span style={{ color: '#8a4a4a' }}>{userAnswer ? tr(userAnswer) : '—'}</span></p>
                      )}
                      <p className="font-body" style={{ color: '#4a7c59' }}>{tr('Correcta', 'Correct')}: {tr(q.correcta)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Quiz question */
        <div className="section-reveal">
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-body" style={{ color: '#8c7459' }}>{tr('Pregunta', 'Question')} {currentQ + 1} {tr('de', 'of')} {TOTAL}</span>
            <span className="text-xs font-body" style={{ color: '#c9a227' }}>{correctCount} {tr('correctas', 'correct')}</span>
          </div>
          <div className="progress-bar mb-6">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>

          {/* Category badge */}
          <div className="mb-4">
            <span className="text-xs px-3 py-1 rounded-full font-display tracking-wide"
              style={{ background: `${CATEGORIA_COLORS[question.categoria] || '#c9a227'}22`, color: CATEGORIA_COLORS[question.categoria] || '#c9a227', border: `1px solid ${CATEGORIA_COLORS[question.categoria] || '#c9a227'}44` }}>
              {tr(question.categoria)}
            </span>
          </div>

          {/* Question */}
          <div className="p-6 rounded mb-6" style={{ background: '#17100a', border: '1px solid #2a1f0f' }}>
            <p className="font-display text-base font-semibold leading-relaxed" style={{ color: '#e8d5b0' }}>{tr(question.pregunta)}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {question.opciones.map(opcion => {
              const answered = quizAnswers[question.id] !== undefined;
              const isCorrect = opcion === question.correcta;
              const isUserAnswer = quizAnswers[question.id] === opcion;
              let borderColor = '#2a1f0f';
              let bgColor = '#17100a';
              let textColor = '#d4b896';
              if (answered) {
                if (isCorrect) { borderColor = '#2d5a3d'; bgColor = '#2d5a3d22'; textColor = '#4a7c59'; }
                else if (isUserAnswer) { borderColor = '#6b3f2a'; bgColor = '#6b3f2a22'; textColor = '#8a4a4a'; }
              }

              return (
                <button
                  key={opcion}
                  onClick={() => handleAnswer(opcion)}
                  disabled={answered}
                  className="w-full text-left px-5 py-3 rounded font-body text-sm cursor-pointer border-0 transition-all"
                  style={{ background: bgColor, border: `1px solid ${borderColor}`, color: textColor }}
                >
                  {isCorrect && answered && <span className="mr-2">✓</span>}
                  {isUserAnswer && !isCorrect && <span className="mr-2">✗</span>}
                  {tr(opcion)}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showResult && (
            <div className="animate-fade-in-up p-4 rounded mb-6" style={{ background: showResult === 'correct' ? '#2d5a3d22' : '#6b3f2a22', border: `1px solid ${showResult === 'correct' ? '#2d5a3d' : '#6b3f2a'}` }}>
              <p className="font-display text-sm font-semibold mb-1" style={{ color: showResult === 'correct' ? '#4a7c59' : '#c9a227' }}>
                {showResult === 'correct' ? tr('¡Correcto! +100 XP', 'Correct! +100 XP') : tr('Incorrecto', 'Incorrect')}
              </p>
              <p className="font-body text-xs leading-relaxed" style={{ color: '#d4b896' }}>{tr(question.explicacion)}</p>
            </div>
          )}

          {quizAnswers[question.id] !== undefined && (
            <button
              onClick={handleNext}
              className="btn-gold w-full px-6 py-3 rounded text-sm cursor-pointer border-0"
            >
              {currentQ < TOTAL - 1 ? tr('Siguiente pregunta →', 'Next question →') : tr('Ver resultados →', 'See results →')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
