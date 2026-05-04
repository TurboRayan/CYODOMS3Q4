'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { REVOLUCIONARIOS, EXILIADOS } from '../lib/data';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const STREAK_THRESHOLD = 3;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RopeBar({ position }) {
  const revPct = Math.round(position * 10) / 10;
  const exilPct = Math.round((100 - position) * 10) / 10;

  return (
    <div className="w-full px-4 py-3">
      {/* Labels */}
      <div className="flex justify-between text-xs font-bold mb-1 px-1">
        <span className="text-red-400 uppercase tracking-widest">⭐ Revolucionarios</span>
        <span className="text-blue-400 uppercase tracking-widest">Exiliados 🗽</span>
      </div>

      {/* Rope bar */}
      <div className="relative w-full h-14 flex rounded-2xl overflow-hidden border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
        {/* Red (Revolucionarios) side */}
        <div
          className="flex items-center justify-end pr-3 transition-all duration-700 ease-out bg-gradient-to-r from-red-800 to-red-600"
          style={{ width: `${position}%` }}
        >
          {position > 15 && (
            <span className="text-white font-bold text-sm tabular-nums drop-shadow">
              {revPct}%
            </span>
          )}
        </div>

        {/* Center knot */}
        <div className="absolute inset-y-0 flex items-center" style={{ left: `calc(${position}% - 14px)` }}>
          <div className="w-7 h-7 rounded-full bg-yellow-400 border-2 border-yellow-200 shadow-lg z-10 flex items-center justify-center text-xs">
            🪢
          </div>
        </div>

        {/* Blue (Exiliados) side */}
        <div
          className="flex items-center justify-start pl-3 transition-all duration-700 ease-out bg-gradient-to-l from-blue-800 to-blue-600"
          style={{ width: `${100 - position}%` }}
        >
          {(100 - position) > 15 && (
            <span className="text-white font-bold text-sm tabular-nums drop-shadow">
              {exilPct}%
            </span>
          )}
        </div>
      </div>

      {/* Victory zone markers */}
      <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
        <span>← Victoria Revolucionaria (25%)</span>
        <span className="text-yellow-600 font-bold">EMPATE</span>
        <span>Victoria Exiliada (75%) →</span>
      </div>
    </div>
  );
}

function PowerupCard({ powerup, onUse, active, isShield, isGuerrilla, isMercado }) {
  const isOneUse = active || isShield || isGuerrilla || isMercado;
  return (
    <button
      onClick={onUse}
      className={`
        w-full py-3 px-4 rounded-xl border-2 text-left transition-all duration-200
        font-semibold text-sm
        ${isOneUse
          ? 'border-yellow-400 bg-yellow-900/40 text-yellow-300 cursor-default'
          : 'border-yellow-500 bg-yellow-900/20 hover:bg-yellow-800/40 text-yellow-200 active:scale-95'
        }
      `}
      disabled={isOneUse}
    >
      <span className="text-xl mr-2">{powerup.emoji}</span>
      <span className="font-bold">{powerup.name}</span>
      {isOneUse && <span className="ml-2 text-xs text-yellow-400">(activo)</span>}
      <p className="text-xs text-gray-400 mt-1 ml-7">{powerup.description}</p>
    </button>
  );
}

function FeedbackOverlay({ feedback }) {
  if (!feedback) return null;
  return (
    <div
      className={`
        fixed inset-0 pointer-events-none flex items-center justify-center z-50
        transition-opacity duration-300
        ${feedback === 'correct' ? 'bg-green-900/20' : 'bg-red-900/20'}
      `}
    >
      <div className="bounce-in text-7xl">
        {feedback === 'correct' ? '✅' : '❌'}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function GamePage() {
  const [faction, setFaction] = useState(null);
  const [factionData, setFactionData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  // Score state
  const [ropePosition, setRopePosition] = useState(50);
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Round state
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [eliminatedAnswer, setEliminatedAnswer] = useState(null);

  // Power-up state
  const [powerupAvailable, setPowerupAvailable] = useState(false);
  const [pendingPowerup, setPendingPowerup] = useState(null);  // powerup object ready to use
  const [activePowerupId, setActivePowerupId] = useState(null); // id of triggered one-shot powerup
  const [shieldActive, setShieldActive] = useState(false);
  const [bonusMultiplier, setBonusMultiplier] = useState(1); // 2x or 3x for next correct

  // Notification
  const [notification, setNotification] = useState(null);

  const answerLockRef = useRef(false); // prevents double-submit

  // ─── Faction assignment ──────────────────────────────────────────────────
  useEffect(() => {
    let saved = null;
    try {
      saved = sessionStorage.getItem('cg_faction');
    } catch (_) {}

    const chosen = saved || (Math.random() < 0.5 ? 'revolucionarios' : 'exiliados');
    try {
      sessionStorage.setItem('cg_faction', chosen);
    } catch (_) {}

    const fd = chosen === 'revolucionarios' ? REVOLUCIONARIOS : EXILIADOS;
    setFaction(chosen);
    setFactionData(fd);
    setQuestions(shuffle(fd.questions));
  }, []);

  // ─── Shuffle answers whenever question changes ───────────────────────────
  useEffect(() => {
    if (questions.length === 0) return;
    const q = questions[currentQIndex];
    setShuffledAnswers(shuffle([q.correct, q.incorrect]));
    setEliminatedAnswer(null);
    setActivePowerupId(null);
  }, [currentQIndex, questions]);

  // ─── Supabase realtime setup ─────────────────────────────────────────────
  useEffect(() => {
    // Initial fetch
    supabase
      .from('game_state')
      .select('rope_position')
      .eq('id', 1)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setRopePosition(Number(data.rope_position));
      });

    // Subscribe to real-time updates
    const channel = supabase
      .channel('rope_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_state' },
        (payload) => {
          setRopePosition(Number(payload.new.rope_position));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ─── Notification helper ─────────────────────────────────────────────────
  const showNotification = useCallback((msg, duration = 2500) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), duration);
  }, []);

  // ─── Atomic rope update via RPC ──────────────────────────────────────────
  const nudgeRope = useCallback(async (delta) => {
    await supabase.rpc('update_rope_position', { delta });
  }, []);

  // ─── Advance to next question ────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    setAnswered(false);
    setFeedback(null);
    setSelectedAnswer(null);
    answerLockRef.current = false;
    setCurrentQIndex((prev) => (prev + 1) % questions.length);
  }, [questions.length]);

  // ─── Handle CIA powerup (auto-correct) ───────────────────────────────────
  const triggerCIA = useCallback(async () => {
    setActivePowerupId('cia');
    setPendingPowerup(null);
    setPowerupAvailable(false);
    setStreak(0);

    const points = bonusMultiplier;
    const delta = factionData.ropeDirection * points;
    await nudgeRope(delta);
    setBonusMultiplier(1);

    setAnswered(true);
    setSelectedAnswer(questions[currentQIndex].correct);
    setFeedback('correct');
    setTotalCorrect((c) => c + 1);
    setTotalAnswered((a) => a + 1);

    showNotification('🕵️ ¡Apoyo de la CIA! Respuesta automática correcta');
    setTimeout(nextQuestion, 1800);
  }, [bonusMultiplier, currentQIndex, factionData, nudgeRope, nextQuestion, questions, showNotification]);

  // ─── Main answer handler ─────────────────────────────────────────────────
  const handleAnswer = useCallback(
    async (answer) => {
      if (answered || answerLockRef.current) return;
      answerLockRef.current = true;
      setAnswered(true);
      setSelectedAnswer(answer);
      setTotalAnswered((a) => a + 1);

      const currentQuestion = questions[currentQIndex];
      const isCorrect = answer === currentQuestion.correct;

      if (isCorrect) {
        setFeedback('correct');
        const newStreak = streak + 1;
        setStreak(newStreak);
        setTotalCorrect((c) => c + 1);

        // Unlock powerup at streak threshold (once per streak cycle)
        if (newStreak >= STREAK_THRESHOLD && !powerupAvailable && !pendingPowerup) {
          const randomPowerup = pickRandom(factionData.powerups);
          setPendingPowerup(randomPowerup);
          setPowerupAvailable(true);
          showNotification(`🎯 ¡Racha de ${newStreak}! Power-up desbloqueado: ${randomPowerup.name}`, 3000);
        }

        // Guerrilla triple multiplier already baked into bonusMultiplier
        const points = bonusMultiplier;
        const delta = factionData.ropeDirection * points;
        await nudgeRope(delta);
        if (bonusMultiplier > 1) {
          showNotification(`💥 ¡${bonusMultiplier}x puntos! +${points} para tu facción`);
        }
        setBonusMultiplier(1);
      } else {
        setFeedback('incorrect');
        setStreak(0);

        if (shieldActive) {
          setShieldActive(false);
          showNotification('✈️ ¡Escudo activado! No pierdes puntos esta vez');
        } else {
          const delta = factionData.ropeDirection * -0.5;
          await nudgeRope(delta);
        }
        setBonusMultiplier(1);
      }

      setTimeout(nextQuestion, 1800);
    },
    [
      answered,
      questions,
      currentQIndex,
      streak,
      powerupAvailable,
      pendingPowerup,
      factionData,
      bonusMultiplier,
      shieldActive,
      nudgeRope,
      nextQuestion,
      showNotification,
    ]
  );

  // ─── Power-up usage ───────────────────────────────────────────────────────
  const activatePowerup = useCallback(
    async (powerup) => {
      if (!powerupAvailable || !pendingPowerup) return;

      switch (powerup.id) {
        case 'alfabetizacion': {
          // Eliminate the wrong answer
          const wrong = questions[currentQIndex].incorrect;
          setEliminatedAnswer(wrong);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('📚 ¡Campaña de Alfabetización! La respuesta incorrecta ha sido eliminada');
          break;
        }
        case 'nacionalizacion': {
          // Steal 2 points: +2 for Rev, -2 for Exil = net 4 on the 0-100 scale
          const delta = 4; // always moves toward Revolucionarios
          await nudgeRope(delta);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('🏭 ¡Nacionalización! +2 puntos robados de Los Exiliados');
          break;
        }
        case 'guerrilla': {
          setBonusMultiplier(3);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('⚔️ ¡Táctica de Guerrilla! Próxima respuesta correcta vale 3 puntos');
          break;
        }
        case 'cia': {
          // Auto-answer — handle separately
          await triggerCIA();
          break;
        }
        case 'mercado': {
          setBonusMultiplier(2);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('💰 ¡El Mercado Libre! Próxima respuesta correcta vale 2 puntos');
          break;
        }
        case 'miami': {
          setShieldActive(true);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('✈️ ¡Vuelo a Miami! Escudo activo: si fallas, no pierdes puntos');
          break;
        }
        default:
          break;
      }
    },
    [
      powerupAvailable,
      pendingPowerup,
      questions,
      currentQIndex,
      nudgeRope,
      triggerCIA,
      showNotification,
    ]
  );

  // ─── Derived win state ────────────────────────────────────────────────────
  const winningFaction = useMemo(() => {
    if (ropePosition <= 25) return 'exiliados';
    if (ropePosition >= 75) return 'revolucionarios';
    return null;
  }, [ropePosition]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (!faction || !factionData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-300 text-xl font-semibold">Cargando el campo de batalla…</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQIndex];
  const isRev = faction === 'revolucionarios';

  // Button style per answer state
  const getAnswerStyle = (answer) => {
    const base = 'w-full py-4 px-5 rounded-xl border-2 text-left text-sm font-semibold transition-all duration-200 ';
    if (eliminatedAnswer === answer) {
      return base + 'border-gray-700 bg-gray-800/30 text-gray-600 line-through cursor-not-allowed opacity-40';
    }
    if (!answered) {
      return (
        base +
        (isRev
          ? 'border-red-700 bg-red-950/40 hover:bg-red-800/50 text-red-100 active:scale-95 cursor-pointer'
          : 'border-blue-700 bg-blue-950/40 hover:bg-blue-800/50 text-blue-100 active:scale-95 cursor-pointer')
      );
    }
    // After answering
    if (answer === currentQuestion.correct) {
      return base + 'border-green-500 bg-green-900/50 text-green-200';
    }
    if (answer === selectedAnswer && answer !== currentQuestion.correct) {
      return base + 'border-red-500 bg-red-900/50 text-red-200 shake';
    }
    return base + 'border-gray-700 bg-gray-800/30 text-gray-500 opacity-50';
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${factionData.bgClass} to-gray-950 text-white flex flex-col`}>
      {/* ── Feedback flash ── */}
      <FeedbackOverlay feedback={feedback} />

      {/* ── Notification toast ── */}
      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bounce-in">
          <div className="bg-gray-900 border border-yellow-500 text-yellow-200 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold max-w-sm text-center">
            {notification}
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="px-4 pt-5 pb-2 text-center">
        <h1 className="text-sm uppercase tracking-[0.2em] text-gray-400 font-semibold">
          La Casa Dividida
        </h1>
        <h2 className="text-2xl font-extrabold mt-0.5 tracking-tight">
          ⚔️ Cabo de Guerra
        </h2>
      </header>

      {/* ── Rope ── */}
      <RopeBar position={ropePosition} />

      {/* ── Win banner ── */}
      {winningFaction && (
        <div
          className={`mx-4 mb-2 py-2 rounded-xl text-center font-bold text-sm ${
            winningFaction === 'revolucionarios'
              ? 'bg-red-800/60 text-red-200 border border-red-500'
              : 'bg-blue-800/60 text-blue-200 border border-blue-500'
          }`}
        >
          {winningFaction === 'revolucionarios'
            ? '🏆 ¡Los Revolucionarios dominan el campo!'
            : '🏆 ¡Los Exiliados dominan el campo!'}
        </div>
      )}

      {/* ── Faction badge + stats ── */}
      <div className="flex items-center justify-between px-4 py-2">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border ${
            isRev ? 'border-red-500 bg-red-900/40 text-red-200' : 'border-blue-500 bg-blue-900/40 text-blue-200'
          } ${isRev ? 'glow-red' : 'glow-blue'}`}
        >
          <span>{factionData.emoji}</span>
          <span>{factionData.name}</span>
        </div>

        <div className="flex gap-3 text-xs text-gray-400">
          <span>
            Racha:{' '}
            <span className={streak >= STREAK_THRESHOLD ? 'text-yellow-400 font-bold' : 'text-white font-semibold'}>
              {streak} 🔥
            </span>
          </span>
          <span>
            Aciertos:{' '}
            <span className="text-white font-semibold">
              {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%
            </span>
          </span>
        </div>
      </div>

      {/* ── Streak progress bar ── */}
      <div className="px-4 mb-2">
        <div className="flex gap-1">
          {[...Array(STREAK_THRESHOLD)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < streak
                  ? 'bg-yellow-400'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">
          {streak < STREAK_THRESHOLD
            ? `${STREAK_THRESHOLD - streak} respuesta(s) más para desbloquear un power-up`
            : powerupAvailable
            ? '⚡ ¡Power-up disponible! Úsalo abajo'
            : 'Siguiente racha en progreso…'}
        </p>
      </div>

      {/* ── Active powerup indicators ── */}
      {(shieldActive || bonusMultiplier > 1) && (
        <div className="flex gap-2 px-4 mb-2">
          {shieldActive && (
            <div className="text-xs px-2 py-1 rounded-full bg-cyan-900/60 border border-cyan-500 text-cyan-300 font-semibold">
              ✈️ Escudo activo
            </div>
          )}
          {bonusMultiplier > 1 && (
            <div className="text-xs px-2 py-1 rounded-full bg-yellow-900/60 border border-yellow-500 text-yellow-300 font-semibold">
              ⚡ {bonusMultiplier}x próxima respuesta
            </div>
          )}
        </div>
      )}

      {/* ── Question card ── */}
      <main className="flex-1 px-4 pb-4 flex flex-col gap-3">
        <div
          className={`rounded-2xl border p-4 bg-gray-900/60 ${
            isRev ? 'border-red-800' : 'border-blue-800'
          }`}
        >
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
            Pregunta {currentQIndex + 1} / {questions.length}
          </p>
          <p className="text-base font-bold leading-snug text-white">
            {currentQuestion.question}
          </p>
        </div>

        {/* Answer buttons */}
        <div className="flex flex-col gap-2.5">
          {shuffledAnswers.map((answer) => (
            <button
              key={answer}
              onClick={() => {
                if (eliminatedAnswer === answer) return;
                if (!answered) handleAnswer(answer);
              }}
              className={getAnswerStyle(answer)}
              disabled={answered || eliminatedAnswer === answer}
            >
              {answer}
              {answered && answer === currentQuestion.correct && (
                <span className="ml-2 text-green-400">✓</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Power-up panel ── */}
        {powerupAvailable && pendingPowerup && (
          <div className="mt-2 rounded-2xl border border-yellow-600 bg-yellow-950/30 p-4">
            <p className="text-xs text-yellow-400 uppercase tracking-widest font-bold mb-2">
              ⚡ Power-up desbloqueado
            </p>
            <PowerupCard
              powerup={pendingPowerup}
              onUse={() => activatePowerup(pendingPowerup)}
              active={activePowerupId === pendingPowerup.id}
              isShield={shieldActive && pendingPowerup.id === 'miami'}
              isGuerrilla={bonusMultiplier === 3 && pendingPowerup.id === 'guerrilla'}
              isMercado={bonusMultiplier === 2 && pendingPowerup.id === 'mercado'}
            />
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-3 text-[10px] text-gray-600">
        La Casa Dividida · {isRev ? '⭐ Revolucionarios' : '🗽 Exiliados'}
      </footer>
    </div>
  );
}
