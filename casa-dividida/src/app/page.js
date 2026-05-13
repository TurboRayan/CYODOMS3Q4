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
// Shop catalogue
// ---------------------------------------------------------------------------

const INDIVIDUAL_UPGRADES = [
  {
    id: 'double_pull',
    name: '🔥 Doble Tracción',
    desc: 'Tu próxima respuesta correcta vale 2× puntos',
    cost: 3,
  },
  {
    id: 'triple_pull',
    name: '⚡ Triple Tracción',
    desc: 'Tu próxima respuesta correcta vale 3× puntos',
    cost: 6,
  },
  {
    id: 'shield',
    name: '🛡️ Escudo Personal',
    desc: 'Si fallas la próxima pregunta, no pierdes puntos',
    cost: 4,
  },
];

const TEAM_COST_BOOST = 10;
const TEAM_COST_SABOTAJE = 8;
const TEAM_BOOST_SECONDS = 45;

// ---------------------------------------------------------------------------
// NameEntryScreen
// ---------------------------------------------------------------------------

function NameEntryScreen({ onJoin }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || loading) return;
    setLoading(true);
    await onJoin(name.trim());
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">⚔️ Cabo de Guerra</h1>
          <p className="text-gray-400 mt-1 text-sm uppercase tracking-widest">La Casa Dividida</p>
        </div>
        <div className="bg-gray-900 border border-yellow-600/50 rounded-2xl p-6 shadow-2xl">
          <p className="text-yellow-300 text-center font-semibold mb-4">¿Cuál es tu nombre?</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Tu nombre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              className="bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 text-center text-lg focus:outline-none focus:border-yellow-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="bg-yellow-600 hover:bg-yellow-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-black font-extrabold py-3 rounded-xl transition-all text-base"
            >
              {loading ? 'Uniéndose…' : '¡Unirse al campo de batalla!'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PlayerRoster — shows names + live streaks for both factions
// ---------------------------------------------------------------------------

function PlayerRoster({ players, myFaction, myName }) {
  const revPlayers = players.filter((p) => p.faction === 'revolucionarios');
  const exilPlayers = players.filter((p) => p.faction === 'exiliados');

  const renderPlayer = (p, activeFaction) => {
    const isMe = p.name === myName && p.faction === myFaction;
    const streak = p.current_streak || 0;
    return (
      <div
        key={p.id}
        className={`flex items-center justify-between text-xs py-0.5 leading-5 ${
          isMe
            ? 'text-yellow-300 font-bold'
            : activeFaction === 'revolucionarios'
            ? 'text-red-200'
            : 'text-blue-200'
        }`}
      >
        <span className="truncate">{isMe ? '★ ' : ''}{p.name}</span>
        {streak > 0 && (
          <span className="ml-1 shrink-0 text-orange-400 font-bold">
            🔥{streak > 1 ? streak : ''}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 mt-1 mb-2">
      <p className="text-[10px] text-gray-600 uppercase tracking-widest text-center mb-1.5">
        Jugadores ({players.length})
      </p>
      <div className="flex gap-2">
        <div className="flex-1 bg-red-950/30 border border-red-900/60 rounded-xl p-2.5 min-h-[60px]">
          <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            ⭐ Rev. ({revPlayers.length})
          </p>
          {revPlayers.length === 0 ? (
            <p className="text-gray-700 text-[10px]">Sin jugadores</p>
          ) : (
            revPlayers.map((p) => renderPlayer(p, 'revolucionarios'))
          )}
        </div>
        <div className="flex-1 bg-blue-950/30 border border-blue-900/60 rounded-xl p-2.5 min-h-[60px]">
          <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            🗽 Exil. ({exilPlayers.length})
          </p>
          {exilPlayers.length === 0 ? (
            <p className="text-gray-700 text-[10px]">Sin jugadores</p>
          ) : (
            exilPlayers.map((p) => renderPlayer(p, 'exiliados'))
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LobbyScreen
// ---------------------------------------------------------------------------

function LobbyScreen({ factionData, playerName, players, ropePosition }) {
  const isRev = factionData?.id === 'revolucionarios';
  return (
    <div className={`min-h-screen bg-gradient-to-b ${factionData?.bgClass} to-gray-950 text-white flex flex-col`}>
      <header className="px-4 pt-5 pb-2 text-center">
        <h1 className="text-sm uppercase tracking-[0.2em] text-gray-400 font-semibold">La Casa Dividida</h1>
        <h2 className="text-2xl font-extrabold mt-0.5">⚔️ Cabo de Guerra</h2>
      </header>

      <RopeBar position={ropePosition} />
      <PlayerRoster players={players} myFaction={factionData?.id} myName={playerName} />

      <div className="flex justify-center mt-3 mb-2">
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-base font-bold border ${
            isRev
              ? 'border-red-500 bg-red-900/40 text-red-200'
              : 'border-blue-500 bg-blue-900/40 text-blue-200'
          }`}
        >
          {factionData?.emoji} {factionData?.name}
        </div>
      </div>
      <p className="text-center text-gray-400 text-sm">
        ¡Bienvenido/a, <span className="text-white font-semibold">{playerName}</span>!
      </p>

      <div className="flex justify-center mt-4 px-4">
        <div className="flex items-center gap-3 bg-gray-900/70 border border-yellow-600/60 rounded-2xl px-5 py-3">
          <span className="text-yellow-400 text-xl animate-spin">⏳</span>
          <div>
            <p className="text-yellow-300 font-semibold text-sm">Esperando al/a la profesor/a…</p>
            <p className="text-gray-500 text-xs">El juego comenzará pronto</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RopeBar
// ---------------------------------------------------------------------------

function RopeBar({ position }) {
  const revPct = Math.round(position * 10) / 10;
  const exilPct = Math.round((100 - position) * 10) / 10;

  return (
    <div className="w-full px-4 py-3">
      <div className="flex justify-between text-xs font-bold mb-1 px-1">
        <span className="text-red-400 uppercase tracking-widest">⭐ Revolucionarios</span>
        <span className="text-blue-400 uppercase tracking-widest">Exiliados 🗽</span>
      </div>
      <div className="relative w-full h-14 flex rounded-2xl overflow-hidden border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
        <div
          className="flex items-center justify-end pr-3 transition-all duration-700 ease-out bg-gradient-to-r from-red-800 to-red-600"
          style={{ width: `${position}%` }}
        >
          {position > 15 && (
            <span className="text-white font-bold text-sm tabular-nums drop-shadow">{revPct}%</span>
          )}
        </div>
        <div className="absolute inset-y-0 flex items-center" style={{ left: `calc(${position}% - 14px)` }}>
          <div className="w-7 h-7 rounded-full bg-yellow-400 border-2 border-yellow-200 shadow-lg z-10 flex items-center justify-center text-xs">
            🪢
          </div>
        </div>
        <div
          className="flex items-center justify-start pl-3 transition-all duration-700 ease-out bg-gradient-to-l from-blue-800 to-blue-600"
          style={{ width: `${100 - position}%` }}
        >
          {100 - position > 15 && (
            <span className="text-white font-bold text-sm tabular-nums drop-shadow">{exilPct}%</span>
          )}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-gray-500 mt-1 px-1">
        <span>← Victoria Rev. (25%)</span>
        <span className="text-yellow-600 font-bold">EMPATE</span>
        <span>Victoria Exil. (75%) →</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PowerupCard
// ---------------------------------------------------------------------------

function PowerupCard({ powerup, onUse, active, isShield, isGuerrilla, isMercado }) {
  const isOneUse = active || isShield || isGuerrilla || isMercado;
  return (
    <button
      onClick={onUse}
      disabled={isOneUse}
      className={`w-full py-3 px-4 rounded-xl border-2 text-left transition-all duration-200 font-semibold text-sm ${
        isOneUse
          ? 'border-yellow-400 bg-yellow-900/40 text-yellow-300 cursor-default'
          : 'border-yellow-500 bg-yellow-900/20 hover:bg-yellow-800/40 text-yellow-200 active:scale-95'
      }`}
    >
      <span className="text-xl mr-2">{powerup.emoji}</span>
      <span className="font-bold">{powerup.name}</span>
      {isOneUse && <span className="ml-2 text-xs text-yellow-400">(activo)</span>}
      <p className="text-xs text-gray-400 mt-1 ml-7">{powerup.description}</p>
    </button>
  );
}

// ---------------------------------------------------------------------------
// FeedbackOverlay
// ---------------------------------------------------------------------------

function FeedbackOverlay({ feedback }) {
  if (!feedback) return null;
  return (
    <div
      className={`fixed inset-0 pointer-events-none flex items-center justify-center z-50 ${
        feedback === 'correct' ? 'bg-green-900/20' : 'bg-red-900/20'
      }`}
    >
      <div className="bounce-in text-7xl">{feedback === 'correct' ? '✅' : '❌'}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ShopPanel
// ---------------------------------------------------------------------------

function ShopPanel({
  myCoins,
  bonusMultiplier,
  shieldActive,
  teamBoostActive,
  teamBoostSecondsLeft,
  isRev,
  onBuyIndividual,
  onBuyTeamBoost,
  onBuySabotaje,
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Coin display */}
      <div className="bg-gray-900 border border-yellow-700/50 rounded-2xl p-4 text-center">
        <div className="text-3xl font-extrabold text-yellow-400">🪙 {myCoins}</div>
        <p className="text-gray-500 text-xs mt-0.5">monedas disponibles</p>
        <p className="text-gray-600 text-[10px] mt-1">Gana 1 moneda por cada respuesta correcta</p>
      </div>

      {/* Individual upgrades */}
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 px-1">
          ⚡ Mejoras Individuales
        </p>
        <div className="flex flex-col gap-2">
          {INDIVIDUAL_UPGRADES.map((upgrade) => {
            const isActive =
              (upgrade.id === 'double_pull' && bonusMultiplier >= 2) ||
              (upgrade.id === 'triple_pull' && bonusMultiplier >= 3) ||
              (upgrade.id === 'shield' && shieldActive);
            const canAfford = myCoins >= upgrade.cost;
            return (
              <button
                key={upgrade.id}
                onClick={() => !isActive && canAfford && onBuyIndividual(upgrade)}
                disabled={isActive || !canAfford}
                className={`w-full p-3 rounded-xl border text-left transition-all active:scale-95 ${
                  isActive
                    ? 'border-green-600 bg-green-900/30 text-green-300 cursor-default'
                    : canAfford
                    ? 'border-yellow-600/50 bg-gray-900 hover:bg-gray-800 text-white cursor-pointer'
                    : 'border-gray-800 bg-gray-900/40 text-gray-600 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm">{upgrade.name}</span>
                  <span
                    className={`text-xs font-bold ${
                      isActive ? 'text-green-400' : canAfford ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                  >
                    {isActive ? '✓ Activo' : `🪙 ${upgrade.cost}`}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{upgrade.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Team upgrades */}
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 px-1">
          🤝 Mejoras de Equipo
        </p>
        <div className="flex flex-col gap-2">
          {/* Team boost */}
          <button
            onClick={() => myCoins >= TEAM_COST_BOOST && !teamBoostActive && onBuyTeamBoost()}
            disabled={myCoins < TEAM_COST_BOOST || teamBoostActive}
            className={`w-full p-3 rounded-xl border text-left transition-all active:scale-95 ${
              teamBoostActive
                ? 'border-green-600 bg-green-900/30 text-green-300 cursor-default'
                : myCoins >= TEAM_COST_BOOST
                ? 'border-yellow-600/50 bg-gray-900 hover:bg-gray-800 text-white cursor-pointer'
                : 'border-gray-800 bg-gray-900/40 text-gray-600 cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">💪 Impulso de Equipo</span>
              <span
                className={`text-xs font-bold ${
                  teamBoostActive
                    ? 'text-green-400'
                    : myCoins >= TEAM_COST_BOOST
                    ? 'text-yellow-400'
                    : 'text-gray-600'
                }`}
              >
                {teamBoostActive
                  ? `✓ ${teamBoostSecondsLeft}s`
                  : `🪙 ${TEAM_COST_BOOST}`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Todo el equipo gana 1.5× en sus respuestas durante {TEAM_BOOST_SECONDS} seg
            </p>
          </button>

          {/* Sabotaje */}
          <button
            onClick={() => myCoins >= TEAM_COST_SABOTAJE && onBuySabotaje()}
            disabled={myCoins < TEAM_COST_SABOTAJE}
            className={`w-full p-3 rounded-xl border text-left transition-all active:scale-95 ${
              myCoins >= TEAM_COST_SABOTAJE
                ? 'border-red-600/50 bg-gray-900 hover:bg-gray-800 text-white cursor-pointer'
                : 'border-gray-800 bg-gray-900/40 text-gray-600 cursor-not-allowed'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold text-sm">🎯 Sabotaje</span>
              <span
                className={`text-xs font-bold ${
                  myCoins >= TEAM_COST_SABOTAJE ? 'text-yellow-400' : 'text-gray-600'
                }`}
              >
                🪙 {TEAM_COST_SABOTAJE}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRev ? 'Los Exiliados' : 'Los Revolucionarios'} pierden 3 puntos de cuerda instantáneamente
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LeaderboardPanel
// ---------------------------------------------------------------------------

function LeaderboardPanel({ players, myId }) {
  const revPlayers = [...players.filter((p) => p.faction === 'revolucionarios')].sort(
    (a, b) => (b.correct_count || 0) - (a.correct_count || 0)
  );
  const exilPlayers = [...players.filter((p) => p.faction === 'exiliados')].sort(
    (a, b) => (b.correct_count || 0) - (a.correct_count || 0)
  );

  const renderRow = (p, i, accentClass) => {
    const isMe = p.id === myId;
    return (
      <div
        key={p.id}
        className={`flex items-center gap-1 text-xs py-1 border-b border-gray-800/60 last:border-0 ${
          isMe ? 'bg-yellow-900/20 rounded-lg px-1' : ''
        }`}
      >
        <span className="w-5 text-gray-600 shrink-0 text-center">
          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
        </span>
        <span className={`flex-1 truncate ${isMe ? 'text-yellow-300 font-bold' : accentClass}`}>
          {isMe ? '★ ' : ''}{p.name}
        </span>
        <span className="text-green-400 font-bold shrink-0 w-7 text-right">{p.correct_count || 0}</span>
        <span className="text-gray-500 shrink-0 w-12 text-right">
          {(p.points_contributed || 0).toFixed(1)}pt
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-[10px] text-gray-600 px-1">
        <span># Jugador</span>
        <span className="flex gap-4">
          <span className="text-green-500">✓ Correctas</span>
          <span>Puntos</span>
        </span>
      </div>

      <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-3">
        <p className="text-red-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          ⭐ Revolucionarios ({revPlayers.length})
        </p>
        {revPlayers.length === 0 ? (
          <p className="text-gray-600 text-xs">Sin jugadores aún</p>
        ) : (
          revPlayers.map((p, i) => renderRow(p, i, 'text-red-200'))
        )}
      </div>

      <div className="bg-blue-950/20 border border-blue-900/50 rounded-xl p-3">
        <p className="text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-2">
          🗽 Exiliados ({exilPlayers.length})
        </p>
        {exilPlayers.length === 0 ? (
          <p className="text-gray-600 text-xs">Sin jugadores aún</p>
        ) : (
          exilPlayers.map((p, i) => renderRow(p, i, 'text-blue-200'))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main GamePage
// ---------------------------------------------------------------------------

export default function GamePage() {
  // Phase
  const [phase, setPhase] = useState('name_entry');
  const [gameStatus, setGameStatus] = useState('waiting');

  // Player identity
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [faction, setFaction] = useState(null);
  const [factionData, setFactionData] = useState(null);

  // Roster
  const [allPlayers, setAllPlayers] = useState([]);

  // Rope
  const [ropePosition, setRopePosition] = useState(50);

  // Team boosts
  const [revBoostUntil, setRevBoostUntil] = useState(null);
  const [exilBoostUntil, setExilBoostUntil] = useState(null);
  const [teamBoostSecondsLeft, setTeamBoostSecondsLeft] = useState(0);

  // Questions
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [shuffledAnswers, setShuffledAnswers] = useState([]);

  // Scoring
  const [streak, setStreak] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // Round state
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [eliminatedAnswer, setEliminatedAnswer] = useState(null);

  // Power-ups (faction-earned)
  const [powerupAvailable, setPowerupAvailable] = useState(false);
  const [pendingPowerup, setPendingPowerup] = useState(null);
  const [activePowerupId, setActivePowerupId] = useState(null);
  const [shieldActive, setShieldActive] = useState(false);
  const [bonusMultiplier, setBonusMultiplier] = useState(1);

  // Notification
  const [notification, setNotification] = useState(null);

  // Tab: 'game' | 'shop' | 'leaderboard'
  const [activeTab, setActiveTab] = useState('game');

  const answerLockRef = useRef(false);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const myPlayer = useMemo(
    () => allPlayers.find((p) => p.id === playerId),
    [allPlayers, playerId]
  );
  const myCoins = myPlayer?.coins ?? 0;

  const teamBoostActive = useMemo(() => {
    if (!faction) return false;
    const until = faction === 'revolucionarios' ? revBoostUntil : exilBoostUntil;
    return until ? new Date(until) > new Date() : false;
  }, [faction, revBoostUntil, exilBoostUntil]);

  // Team boost countdown
  useEffect(() => {
    if (!faction) return;
    const until = faction === 'revolucionarios' ? revBoostUntil : exilBoostUntil;
    if (!until) { setTeamBoostSecondsLeft(0); return; }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((new Date(until) - Date.now()) / 1000));
      setTeamBoostSecondsLeft(remaining);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [faction, revBoostUntil, exilBoostUntil]);

  // ── Reset all play state ──────────────────────────────────────────────────
  const resetPlayState = useCallback(() => {
    setPhase('name_entry');
    setGameStatus('waiting');
    setPlayerName('');
    setPlayerId(null);
    setFaction(null);
    setFactionData(null);
    setAllPlayers([]);
    setRopePosition(50);
    setRevBoostUntil(null);
    setExilBoostUntil(null);
    setTeamBoostSecondsLeft(0);
    setQuestions([]);
    setCurrentQIndex(0);
    setShuffledAnswers([]);
    setStreak(0);
    setTotalCorrect(0);
    setTotalAnswered(0);
    setAnswered(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setEliminatedAnswer(null);
    setPowerupAvailable(false);
    setPendingPowerup(null);
    setActivePowerupId(null);
    setShieldActive(false);
    setBonusMultiplier(1);
    setNotification(null);
    setActiveTab('game');
    answerLockRef.current = false;
  }, []);

  // ── Supabase subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    supabase
      .from('game_state')
      .select('*')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setRopePosition(Number(data.rope_position));
          setGameStatus(data.status || 'waiting');
          setRevBoostUntil(data.rev_boost_until ?? null);
          setExilBoostUntil(data.exil_boost_until ?? null);
        }
      });

    supabase
      .from('players')
      .select('*')
      .order('joined_at')
      .then(({ data }) => { if (data) setAllPlayers(data); });

    const gsChannel = supabase
      .channel('game_state_main')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_state' },
        (payload) => {
          const newRope = Number(payload.new.rope_position);
          const newStatus = payload.new.status || 'waiting';
          setRopePosition(newRope);
          setGameStatus(newStatus);
          if (payload.new.rev_boost_until !== undefined) setRevBoostUntil(payload.new.rev_boost_until);
          if (payload.new.exil_boost_until !== undefined) setExilBoostUntil(payload.new.exil_boost_until);

          if (newStatus === 'playing') {
            setPhase((prev) => (prev === 'lobby' ? 'playing' : prev));
          } else if (newStatus === 'waiting') {
            resetPlayState();
          }
        }
      )
      .subscribe();

    const playersChannel = supabase
      .channel('players_main')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        supabase
          .from('players')
          .select('*')
          .order('joined_at')
          .then(({ data }) => { if (data) setAllPlayers(data); });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gsChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [resetPlayState]);

  // ── Shuffle answers when question changes ─────────────────────────────────
  useEffect(() => {
    if (questions.length === 0) return;
    const q = questions[currentQIndex];
    setShuffledAnswers(shuffle([q.correct, q.incorrect]));
    setEliminatedAnswer(null);
    setActivePowerupId(null);
  }, [currentQIndex, questions]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showNotification = useCallback((msg, duration = 2500) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), duration);
  }, []);

  const nudgeRope = useCallback(async (delta) => {
    await supabase.rpc('update_rope_position', { delta });
  }, []);

  // ── Join ──────────────────────────────────────────────────────────────────
  const handleJoin = useCallback(
    async (name) => {
      const { data: gs } = await supabase
        .from('game_state')
        .select('status')
        .eq('id', 1)
        .single();

      const { data: existing } = await supabase.from('players').select('faction');
      const revCount = existing?.filter((p) => p.faction === 'revolucionarios').length ?? 0;
      const exilCount = existing?.filter((p) => p.faction === 'exiliados').length ?? 0;
      const chosenFaction =
        revCount < exilCount
          ? 'revolucionarios'
          : exilCount < revCount
          ? 'exiliados'
          : Math.random() < 0.5
          ? 'revolucionarios'
          : 'exiliados';

      const { data: player, error } = await supabase
        .from('players')
        .insert({ name, faction: chosenFaction, session_id: crypto.randomUUID() })
        .select()
        .single();

      if (error || !player) {
        showNotification('⚠️ Error al unirse. Intenta de nuevo.');
        return;
      }

      const fd = chosenFaction === 'revolucionarios' ? REVOLUCIONARIOS : EXILIADOS;
      setPlayerId(player.id);
      setPlayerName(name);
      setFaction(chosenFaction);
      setFactionData(fd);
      setQuestions(shuffle(fd.questions));

      const currentStatus = gs?.status || 'waiting';
      setPhase(currentStatus === 'playing' ? 'playing' : 'lobby');
    },
    [showNotification]
  );

  // ── Next question ─────────────────────────────────────────────────────────
  const nextQuestion = useCallback(() => {
    setAnswered(false);
    setFeedback(null);
    setSelectedAnswer(null);
    answerLockRef.current = false;
    setCurrentQIndex((prev) => (prev + 1) % questions.length);
  }, [questions.length]);

  // ── CIA auto-answer ───────────────────────────────────────────────────────
  const triggerCIA = useCallback(async () => {
    setActivePowerupId('cia');
    setPendingPowerup(null);
    setPowerupAvailable(false);

    const newStreak = streak + 1;
    const streakMult = 1 + newStreak * 0.1;
    const teamMult = teamBoostActive ? 1.5 : 1.0;
    const totalDelta = streakMult * bonusMultiplier * teamMult;

    await nudgeRope(factionData.ropeDirection * totalDelta);
    setBonusMultiplier(1);
    setStreak(newStreak);

    await supabase.rpc('update_player_stats', {
      p_player_id: playerId,
      p_coins_delta: 1,
      p_correct_delta: 1,
      p_points_delta: totalDelta,
      p_new_streak: newStreak,
    });

    setAnswered(true);
    setSelectedAnswer(questions[currentQIndex].correct);
    setFeedback('correct');
    setTotalCorrect((c) => c + 1);
    setTotalAnswered((a) => a + 1);

    showNotification('🕵️ ¡Apoyo de la CIA! Respuesta automática correcta');
    setTimeout(nextQuestion, 1800);
  }, [
    streak, teamBoostActive, bonusMultiplier, factionData, nudgeRope, playerId,
    currentQIndex, questions, nextQuestion, showNotification,
  ]);

  // ── Answer handler ────────────────────────────────────────────────────────
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

        // Unlock power-up on streak threshold
        if (newStreak >= STREAK_THRESHOLD && !powerupAvailable && !pendingPowerup) {
          const randomPowerup = pickRandom(factionData.powerups);
          setPendingPowerup(randomPowerup);
          setPowerupAvailable(true);
          showNotification(`🎯 ¡Racha de ${newStreak}! Power-up: ${randomPowerup.name}`, 3000);
        }

        // Streak-scaled pull: 1.0 + streak × 0.1 (e.g. streak 1 → 1.1, streak 5 → 1.5)
        const streakMult = 1 + newStreak * 0.1;
        const teamMult = teamBoostActive ? 1.5 : 1.0;
        const totalDelta = streakMult * bonusMultiplier * teamMult;

        await nudgeRope(factionData.ropeDirection * totalDelta);

        const notifications = [];
        if (newStreak > 1) notifications.push(`🔥 Racha ×${newStreak} → ${streakMult.toFixed(1)}× pull`);
        if (bonusMultiplier > 1) notifications.push(`⚡ ${bonusMultiplier}× bonus`);
        if (teamMult > 1) notifications.push(`💪 Impulso de equipo ×${teamMult}`);
        if (notifications.length) showNotification(notifications.join(' · '));

        setBonusMultiplier(1);

        // Sync stats to DB
        await supabase.rpc('update_player_stats', {
          p_player_id: playerId,
          p_coins_delta: 1,
          p_correct_delta: 1,
          p_points_delta: totalDelta,
          p_new_streak: newStreak,
        });
      } else {
        setFeedback('incorrect');
        const newStreak = 0;
        setStreak(newStreak);

        if (shieldActive) {
          setShieldActive(false);
          showNotification('🛡️ ¡Escudo activado! Sin penalización esta vez');
        } else {
          await nudgeRope(factionData.ropeDirection * -0.5);
        }
        setBonusMultiplier(1);

        // Reset streak in DB
        await supabase.rpc('update_player_stats', {
          p_player_id: playerId,
          p_coins_delta: 0,
          p_correct_delta: 0,
          p_points_delta: 0,
          p_new_streak: newStreak,
        });
      }

      setTimeout(nextQuestion, 1800);
    },
    [
      answered, questions, currentQIndex, streak, powerupAvailable, pendingPowerup,
      factionData, bonusMultiplier, shieldActive, teamBoostActive, nudgeRope,
      playerId, nextQuestion, showNotification,
    ]
  );

  // ── Power-up activation ───────────────────────────────────────────────────
  const activatePowerup = useCallback(
    async (powerup) => {
      if (!powerupAvailable || !pendingPowerup) return;

      switch (powerup.id) {
        case 'alfabetizacion':
          setEliminatedAnswer(questions[currentQIndex].incorrect);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('📚 ¡Alfabetización! Respuesta incorrecta eliminada');
          break;
        case 'nacionalizacion':
          await nudgeRope(4);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('🏭 ¡Nacionalización! +2 puntos robados a los Exiliados');
          break;
        case 'guerrilla':
          setBonusMultiplier(3);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('⚔️ ¡Guerrilla! Próxima respuesta vale 3×');
          break;
        case 'cia':
          await triggerCIA();
          break;
        case 'mercado':
          setBonusMultiplier(2);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('💰 ¡Mercado Libre! Próxima respuesta vale 2×');
          break;
        case 'miami':
          setShieldActive(true);
          setPowerupAvailable(false);
          setPendingPowerup(null);
          setStreak(0);
          showNotification('✈️ ¡Vuelo a Miami! Escudo activo: próxima falla sin penalización');
          break;
        default:
          break;
      }
    },
    [powerupAvailable, pendingPowerup, questions, currentQIndex, nudgeRope, triggerCIA, showNotification]
  );

  // ── Shop handlers ─────────────────────────────────────────────────────────
  const handleBuyIndividual = useCallback(
    async (upgrade) => {
      const { data: ok } = await supabase.rpc('spend_coins', {
        p_player_id: playerId,
        p_amount: upgrade.cost,
      });
      if (!ok) { showNotification('❌ Monedas insuficientes'); return; }

      if (upgrade.id === 'double_pull') setBonusMultiplier((prev) => Math.max(prev, 2));
      if (upgrade.id === 'triple_pull') setBonusMultiplier((prev) => Math.max(prev, 3));
      if (upgrade.id === 'shield') setShieldActive(true);
      showNotification(`✅ ¡${upgrade.name} activado!`);
    },
    [playerId, showNotification]
  );

  const handleBuyTeamBoost = useCallback(async () => {
    const { data: ok } = await supabase.rpc('activate_team_boost', {
      p_player_id: playerId,
      p_faction: faction,
      p_duration_seconds: TEAM_BOOST_SECONDS,
      p_cost: TEAM_COST_BOOST,
    });
    if (!ok) { showNotification('❌ Monedas insuficientes'); return; }
    showNotification(`💪 ¡Impulso de equipo! Todo el equipo 1.5× durante ${TEAM_BOOST_SECONDS}s`, 3500);
  }, [playerId, faction, showNotification]);

  const handleBuySabotaje = useCallback(async () => {
    const { data: ok } = await supabase.rpc('activate_sabotaje', {
      p_player_id: playerId,
      p_faction: faction,
      p_cost: TEAM_COST_SABOTAJE,
      p_rope_delta: factionData.ropeDirection * 3,
    });
    if (!ok) { showNotification('❌ Monedas insuficientes'); return; }
    showNotification('🎯 ¡Sabotaje ejecutado! El enemigo pierde 3 puntos');
  }, [playerId, faction, factionData, showNotification]);

  // ── Win detection ─────────────────────────────────────────────────────────
  const winningFaction = useMemo(() => {
    if (ropePosition <= 25) return 'exiliados';
    if (ropePosition >= 75) return 'revolucionarios';
    return null;
  }, [ropePosition]);

  // ── Answer button styles ──────────────────────────────────────────────────
  const getAnswerStyle = (answer) => {
    const base =
      'w-full py-4 px-5 rounded-xl border-2 text-left text-sm font-semibold transition-all duration-200 ';
    const isRev = faction === 'revolucionarios';
    if (eliminatedAnswer === answer)
      return base + 'border-gray-700 bg-gray-800/30 text-gray-600 line-through cursor-not-allowed opacity-40';
    if (!answered)
      return (
        base +
        (isRev
          ? 'border-red-700 bg-red-950/40 hover:bg-red-800/50 text-red-100 active:scale-95 cursor-pointer'
          : 'border-blue-700 bg-blue-950/40 hover:bg-blue-800/50 text-blue-100 active:scale-95 cursor-pointer')
      );
    if (answer === questions[currentQIndex]?.correct)
      return base + 'border-green-500 bg-green-900/50 text-green-200';
    if (answer === selectedAnswer)
      return base + 'border-red-500 bg-red-900/50 text-red-200 shake';
    return base + 'border-gray-700 bg-gray-800/30 text-gray-500 opacity-50';
  };

  // ── Phase renders ─────────────────────────────────────────────────────────

  if (phase === 'name_entry') {
    return <NameEntryScreen onJoin={handleJoin} />;
  }

  if (phase === 'lobby') {
    return (
      <LobbyScreen
        factionData={factionData}
        playerName={playerName}
        players={allPlayers}
        ropePosition={ropePosition}
      />
    );
  }

  // Loading guard
  if (!factionData || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⚙️</div>
          <p className="text-gray-300 text-xl font-semibold">Cargando…</p>
        </div>
      </div>
    );
  }

  const isRev = faction === 'revolucionarios';
  const currentQuestion = questions[currentQIndex];
  const pct = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // ── Playing phase ─────────────────────────────────────────────────────────

  return (
    <div className={`min-h-screen bg-gradient-to-b ${factionData.bgClass} to-gray-950 text-white flex flex-col`}>
      <FeedbackOverlay feedback={feedback} />

      {notification && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bounce-in">
          <div className="bg-gray-900 border border-yellow-500 text-yellow-200 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold max-w-sm text-center">
            {notification}
          </div>
        </div>
      )}

      <header className="px-4 pt-5 pb-2 text-center">
        <h1 className="text-sm uppercase tracking-[0.2em] text-gray-400 font-semibold">La Casa Dividida</h1>
        <h2 className="text-2xl font-extrabold mt-0.5 tracking-tight">⚔️ Cabo de Guerra</h2>
      </header>

      <RopeBar position={ropePosition} />
      <PlayerRoster players={allPlayers} myFaction={faction} myName={playerName} />

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

      {/* Faction badge + stats */}
      <div className="flex items-center justify-between px-4 py-1">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold border ${
            isRev
              ? 'border-red-500 bg-red-900/40 text-red-200'
              : 'border-blue-500 bg-blue-900/40 text-blue-200'
          }`}
        >
          {factionData.emoji} {playerName}
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="text-yellow-400 font-bold">🪙 {myCoins}</span>
          <span>
            Racha:{' '}
            <span
              className={streak >= STREAK_THRESHOLD ? 'text-yellow-400 font-bold' : 'text-white font-semibold'}
            >
              {streak} 🔥
            </span>
          </span>
          <span>
            Aciertos: <span className="text-white font-semibold">{pct}%</span>
          </span>
        </div>
      </div>

      {/* Streak progress bar */}
      <div className="px-4 mb-2">
        <div className="flex gap-1">
          {[...Array(STREAK_THRESHOLD)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < streak ? 'bg-yellow-400' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-0.5">
          {streak < STREAK_THRESHOLD
            ? `${STREAK_THRESHOLD - streak} más para power-up`
            : powerupAvailable
            ? '⚡ ¡Power-up disponible!'
            : streak > 0
            ? `🔥 Racha ×${streak} → +${(streak * 0.1).toFixed(1)} bonus de pull`
            : 'Siguiente racha…'}
        </p>
      </div>

      {/* Active status indicators */}
      {(shieldActive || bonusMultiplier > 1 || teamBoostActive) && (
        <div className="flex flex-wrap gap-2 px-4 mb-2">
          {shieldActive && (
            <div className="text-xs px-2 py-1 rounded-full bg-cyan-900/60 border border-cyan-500 text-cyan-300 font-semibold">
              🛡️ Escudo activo
            </div>
          )}
          {bonusMultiplier > 1 && (
            <div className="text-xs px-2 py-1 rounded-full bg-yellow-900/60 border border-yellow-500 text-yellow-300 font-semibold">
              ⚡ {bonusMultiplier}× próxima respuesta
            </div>
          )}
          {teamBoostActive && (
            <div className="text-xs px-2 py-1 rounded-full bg-green-900/60 border border-green-500 text-green-300 font-semibold">
              💪 Impulso equipo 1.5× ({teamBoostSecondsLeft}s)
            </div>
          )}
        </div>
      )}

      {/* Tab bar — only Juego and Tienda */}
      <div className="flex gap-1 px-4 mb-3">
        {[
          { id: 'game', label: '⚔️ Juego' },
          { id: 'shop', label: '🏪 Tienda' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? isRev
                  ? 'bg-red-700 text-white'
                  : 'bg-blue-700 text-white'
                : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <main className="px-4 flex flex-col gap-3">
        {/* ── GAME TAB ── */}
        {activeTab === 'game' && (
          <>
            <div
              className={`rounded-2xl border p-4 bg-gray-900/60 ${
                isRev ? 'border-red-800' : 'border-blue-800'
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">
                Pregunta {currentQIndex + 1} / {questions.length}
              </p>
              <p className="text-base font-bold leading-snug text-white">{currentQuestion.question}</p>
            </div>

            <div className="flex flex-col gap-2.5">
              {shuffledAnswers.map((answer) => (
                <button
                  key={answer}
                  onClick={() => {
                    if (eliminatedAnswer !== answer && !answered) handleAnswer(answer);
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
          </>
        )}

        {/* ── SHOP TAB ── */}
        {activeTab === 'shop' && (
          <ShopPanel
            myCoins={myCoins}
            bonusMultiplier={bonusMultiplier}
            shieldActive={shieldActive}
            teamBoostActive={teamBoostActive}
            teamBoostSecondsLeft={teamBoostSecondsLeft}
            isRev={isRev}
            onBuyIndividual={handleBuyIndividual}
            onBuyTeamBoost={handleBuyTeamBoost}
            onBuySabotaje={handleBuySabotaje}
          />
        )}
      </main>

      {/* ── LEADERBOARD — always visible ── */}
      <div className="px-4 pb-4 mt-4">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2 px-1">
          🏆 Tabla de Líderes
        </p>
        <LeaderboardPanel players={allPlayers} myId={playerId} />
      </div>

      <footer className="text-center py-3 text-[10px] text-gray-600">
        La Casa Dividida · {isRev ? '⭐ Revolucionarios' : '🗽 Exiliados'}
      </footer>
    </div>
  );
}
