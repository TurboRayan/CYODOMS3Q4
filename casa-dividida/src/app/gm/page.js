'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// ── Change this code to whatever you like ───────────────────────────────────
const GM_PASSCODE = 'MAESTRO24';

export default function GMPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [gameStatus, setGameStatus] = useState('waiting');
  const [ropePosition, setRopePosition] = useState(50);
  const [players, setPlayers] = useState([]);
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // GM view tab: 'roster' | 'leaderboard'
  const [gmTab, setGmTab] = useState('roster');

  // ── Load data once authenticated ──────────────────────────────────────────
  useEffect(() => {
    if (!authenticated) return;

    supabase
      .from('game_state')
      .select('rope_position, status')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data) {
          setRopePosition(Number(data.rope_position));
          setGameStatus(data.status || 'waiting');
        }
      });

    supabase
      .from('players')
      .select('*')
      .order('joined_at')
      .then(({ data }) => { if (data) setPlayers(data); });

    const gsChannel = supabase
      .channel('gm_game_state')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_state' }, (payload) => {
        setRopePosition(Number(payload.new.rope_position));
        setGameStatus(payload.new.status || 'waiting');
      })
      .subscribe();

    const playersChannel = supabase
      .channel('gm_players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'players' }, () => {
        supabase
          .from('players')
          .select('*')
          .order('joined_at')
          .then(({ data }) => { if (data) setPlayers(data); });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(gsChannel);
      supabase.removeChannel(playersChannel);
    };
  }, [authenticated]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleAuth = (e) => {
    e.preventDefault();
    if (input === GM_PASSCODE) {
      setAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Código incorrecto. Inténtalo de nuevo.');
      setInput('');
    }
  };

  // ── Game controls ──────────────────────────────────────────────────────────
  const startGame = async () => {
    setBusy(true);
    await supabase.rpc('start_game');
    setBusy(false);
  };

  const resetGame = async () => {
    setBusy(true);
    setConfirmReset(false);

    const { error } = await supabase.rpc('reset_game');

    if (error) {
      // RPC failed (e.g. schema not updated yet) — fall back to direct writes
      await supabase
        .from('game_state')
        .update({ rope_position: 50, status: 'waiting' })
        .eq('id', 1);
      // Delete all players (RLS policy allows this)
      await supabase.from('players').delete().gt('joined_at', '1970-01-01');
    }

    // Always update the GM UI immediately regardless of which path ran
    setRopePosition(50);
    setGameStatus('waiting');
    setPlayers([]);
    setBusy(false);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const revPlayers = players.filter((p) => p.faction === 'revolucionarios');
  const exilPlayers = players.filter((p) => p.faction === 'exiliados');
  const isPlaying = gameStatus === 'playing';

  // Leaderboard sorted lists
  const revLeader = [...revPlayers].sort((a, b) => (b.correct_count || 0) - (a.correct_count || 0));
  const exilLeader = [...exilPlayers].sort((a, b) => (b.correct_count || 0) - (a.correct_count || 0));

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="w-full max-w-xs">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🎮</div>
            <h1 className="text-2xl font-extrabold text-yellow-400">Game Master</h1>
            <p className="text-gray-500 text-sm mt-1">La Casa Dividida: Cabo de Guerra</p>
          </div>
          <div className="bg-gray-900 border border-yellow-700/50 rounded-2xl p-6 shadow-2xl">
            <form onSubmit={handleAuth} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Código de acceso…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoFocus
                className="bg-gray-800 border border-gray-600 text-white rounded-xl px-4 py-3 text-center text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              />
              {authError && (
                <p className="text-red-400 text-xs text-center">{authError}</p>
              )}
              <button
                type="submit"
                disabled={!input}
                className="bg-yellow-600 hover:bg-yellow-500 active:scale-95 disabled:opacity-40 text-black font-extrabold py-3 rounded-xl transition-all"
              >
                Entrar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── GM dashboard ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-extrabold text-yellow-400">🎮 Game Master</h1>
          <p className="text-gray-500 text-xs uppercase tracking-widest mt-0.5">La Casa Dividida</p>
        </div>

        {/* Status card */}
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-xs uppercase tracking-widest">Estado del juego</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isPlaying
                ? 'bg-green-900 text-green-400 border border-green-700'
                : 'bg-orange-900 text-orange-400 border border-orange-700'
            }`}>
              {isPlaying ? '● EN JUEGO' : '● ESPERANDO'}
            </span>
          </div>

          {/* Mini rope bar */}
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="text-red-400">⭐ Rev.</span>
            <span className="text-yellow-600 font-bold">{Number(ropePosition).toFixed(1)}%</span>
            <span className="text-blue-400">Exil. 🗽</span>
          </div>
          <div className="relative w-full h-4 flex rounded-full overflow-hidden border border-gray-700">
            <div className="bg-red-700 transition-all duration-700" style={{ width: `${ropePosition}%` }} />
            <div className="bg-blue-700 transition-all duration-700" style={{ width: `${100 - ropePosition}%` }} />
          </div>
          <p className={`text-center text-xs mt-1 font-semibold ${
            ropePosition >= 75 ? 'text-red-400' : ropePosition <= 25 ? 'text-blue-400' : 'text-gray-500'
          }`}>
            {ropePosition >= 75 ? '⭐ Revolucionarios dominan' :
             ropePosition <= 25 ? '🗽 Exiliados dominan' : '⚖️ Empate'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={startGame}
            disabled={busy || isPlaying}
            className="flex-1 py-4 rounded-xl font-extrabold text-base bg-green-700 hover:bg-green-600 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            ▶ Iniciar Juego
          </button>

          {confirmReset ? (
            <div className="flex-1 flex gap-2">
              <button
                onClick={resetGame}
                disabled={busy}
                className="flex-1 py-4 rounded-xl font-extrabold text-sm bg-red-700 hover:bg-red-600 active:scale-95 transition-all"
              >
                ✓ Confirmar
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-4 rounded-xl font-bold text-sm bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              disabled={busy}
              className="flex-1 py-4 rounded-xl font-extrabold text-base bg-red-900 hover:bg-red-800 active:scale-95 disabled:opacity-40 transition-all border border-red-700"
            >
              🔄 Reiniciar
            </button>
          )}
        </div>

        {confirmReset && (
          <div className="mb-4 text-center text-sm text-red-300 bg-red-950/40 border border-red-800 rounded-xl py-2 px-4">
            ⚠️ Esto borrará todos los jugadores y reiniciará la cuerda a 50%.
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-white">{players.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">Jugadores</div>
          </div>
          <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-red-300">{revPlayers.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">⭐ Rev.</div>
          </div>
          <div className="bg-blue-950/30 border border-blue-900/60 rounded-xl p-3 text-center">
            <div className="text-xl font-extrabold text-blue-300">{exilPlayers.length}</div>
            <div className="text-[10px] text-gray-500 uppercase">🗽 Exil.</div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setGmTab('roster')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              gmTab === 'roster' ? 'bg-yellow-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            👥 Jugadores
          </button>
          <button
            onClick={() => setGmTab('leaderboard')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              gmTab === 'leaderboard' ? 'bg-yellow-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🏆 Tabla
          </button>
        </div>

        {/* Roster tab */}
        {gmTab === 'roster' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-950/30 border border-red-900/70 rounded-2xl p-3">
              <h2 className="text-red-400 font-bold text-xs uppercase tracking-wider mb-2">
                ⭐ Revolucionarios ({revPlayers.length})
              </h2>
              {revPlayers.length === 0 ? (
                <p className="text-gray-600 text-xs">Sin jugadores</p>
              ) : (
                revPlayers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-red-200 text-sm py-0.5 border-b border-red-900/40 last:border-0">
                    <span className="truncate">{p.name}</span>
                    {(p.current_streak || 0) > 0 && (
                      <span className="ml-1 text-orange-400 text-xs shrink-0">
                        🔥{p.current_streak > 1 ? p.current_streak : ''}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="bg-blue-950/30 border border-blue-900/70 rounded-2xl p-3">
              <h2 className="text-blue-400 font-bold text-xs uppercase tracking-wider mb-2">
                🗽 Exiliados ({exilPlayers.length})
              </h2>
              {exilPlayers.length === 0 ? (
                <p className="text-gray-600 text-xs">Sin jugadores</p>
              ) : (
                exilPlayers.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-blue-200 text-sm py-0.5 border-b border-blue-900/40 last:border-0">
                    <span className="truncate">{p.name}</span>
                    {(p.current_streak || 0) > 0 && (
                      <span className="ml-1 text-orange-400 text-xs shrink-0">
                        🔥{p.current_streak > 1 ? p.current_streak : ''}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Leaderboard tab */}
        {gmTab === 'leaderboard' && (
          <div className="flex flex-col gap-3">
            {/* Column headers */}
            <div className="flex justify-end gap-2 text-[10px] text-gray-500 px-1 pr-2">
              <span className="text-green-500 w-10 text-right">✓ Aciertos</span>
              <span className="w-12 text-right">Puntos</span>
              <span className="w-8 text-right">🪙</span>
            </div>

            {/* Revolucionarios */}
            <div className="bg-red-950/20 border border-red-900/50 rounded-2xl p-3">
              <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                ⭐ Revolucionarios
              </p>
              {revLeader.length === 0 ? (
                <p className="text-gray-600 text-xs">Sin jugadores</p>
              ) : (
                revLeader.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-1 text-xs py-1 border-b border-red-900/30 last:border-0">
                    <span className="w-5 text-gray-500 text-center shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <span className="flex-1 truncate text-red-200">{p.name}</span>
                    <span className="text-green-400 font-bold w-10 text-right shrink-0">{p.correct_count || 0}</span>
                    <span className="text-gray-400 w-12 text-right shrink-0">{(p.points_contributed || 0).toFixed(1)}</span>
                    <span className="text-yellow-400 w-8 text-right shrink-0">{p.coins || 0}</span>
                  </div>
                ))
              )}
            </div>

            {/* Exiliados */}
            <div className="bg-blue-950/20 border border-blue-900/50 rounded-2xl p-3">
              <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                🗽 Exiliados
              </p>
              {exilLeader.length === 0 ? (
                <p className="text-gray-600 text-xs">Sin jugadores</p>
              ) : (
                exilLeader.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-1 text-xs py-1 border-b border-blue-900/30 last:border-0">
                    <span className="w-5 text-gray-500 text-center shrink-0">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                    </span>
                    <span className="flex-1 truncate text-blue-200">{p.name}</span>
                    <span className="text-green-400 font-bold w-10 text-right shrink-0">{p.correct_count || 0}</span>
                    <span className="text-gray-400 w-12 text-right shrink-0">{(p.points_contributed || 0).toFixed(1)}</span>
                    <span className="text-yellow-400 w-8 text-right shrink-0">{p.coins || 0}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <p className="text-center text-gray-600 text-xs mt-4">
          {players.length} jugador{players.length !== 1 ? 'es' : ''} en el campo
        </p>
      </div>
    </div>
  );
}
