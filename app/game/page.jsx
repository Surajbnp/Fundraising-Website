"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';

const DONATION_URL = 'https://milaap.org/fundraisers/support-sarika-31';
const PLAYER_SIZE = 25;
const BULLET_SPEED = 12;
const CHEMO_DURATION = 7000;

export default function ImmunoDefenseGame() {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('MENU'); // MENU, PLAYING, GAMEOVER
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [highScore, setHighScore] = useState(0);
  const [btnText, setBtnText] = useState('Start Response');
  const [chemoActive, setChemoActive] = useState(false);
  const [chemoTimeLeft, setChemoTimeLeft] = useState(0);

  // Game Logic Refs
  const stateRef = useRef({
    playerX: 0,
    enemies: [],
    bullets: [],
    particles: [],
    poolCells: [],
    powerups: [],
    lastSpawn: 0,
    lastPowerupSpawn: 0,
    spawnRate: 1500,
    chemoActive: false,
    chemoStartTime: 0,
    keys: {},
    canShoot: true,
    width: 0,
    height: 0,
    touchStartX: 0,
    playerStartX: 0,
    currentTouchX: 0,
    touchStartTime: 0
  });

  const audioCtxRef = useRef(null);

  const initAudio = () => {
    if (typeof window === 'undefined') return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playSound = (type) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (type) {
      case 'shoot':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(now + 0.08);
        break;
      case 'shriek':
        const osc2 = ctx.createOscillator();
        osc.type = 'sawtooth'; osc2.type = 'sine';
        osc.frequency.setValueAtTime(3000, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        osc2.frequency.setValueAtTime(3100, now);
        osc2.frequency.exponentialRampToValueAtTime(700, now + 0.25);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.connect(gain); osc2.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc2.start();
        osc.stop(now + 0.3); osc2.stop(now + 0.3);
        break;
      case 'powerup':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(now + 0.4);
        break;
      case 'hit':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.4);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.connect(gain); gain.connect(ctx.destination);
        osc.start(); osc.stop(now + 0.4);
        break;
      default: break;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem('immuno_highscore');
    if (saved) setHighScore(parseInt(saved));

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      stateRef.current.width = window.innerWidth;
      stateRef.current.height = window.innerHeight;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stateRef.current.playerX = canvas.width / 2;
      
      const spacing = 55;
      const cells = [];
      for (let x = 0; x <= canvas.width + spacing; x += spacing) {
        cells.push({ x, y: canvas.height - 25, radius: 18, color: '#2ed573', offset: Math.random() * 1000 });
      }
      stateRef.current.poolCells = cells;
    };

    const handleKeyDown = (e) => (stateRef.current.keys[e.code] = true);
    const handleKeyUp = (e) => (stateRef.current.keys[e.code] = false);

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const shoot = useCallback(() => {
    const s = stateRef.current;
    const x = s.playerX;
    const y = s.height - 110;
    if (s.chemoActive) {
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        s.bullets.push({ x, y, vx: Math.cos(angle) * BULLET_SPEED, vy: Math.sin(angle) * BULLET_SPEED });
      }
    } else {
      s.bullets.push({ x, y, vx: 0, vy: -BULLET_SPEED });
    }
    playSound('shoot');
  }, []);

  const gameOver = useCallback((finalScore) => {
    setGameState('GAMEOVER');
    setBtnText('Donate to Replay');
    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('immuno_highscore', finalScore.toString());
    }
  }, [highScore]);

  const update = useCallback(() => {
    const s = stateRef.current;
    if (gameState !== 'PLAYING') return;

    const moveSpeed = 9;
    if (s.keys['ArrowLeft'] || s.keys['KeyA']) s.playerX -= moveSpeed;
    if (s.keys['ArrowRight'] || stateRef.current.keys['KeyD']) s.playerX += moveSpeed;
    
    s.playerX = Math.max(PLAYER_SIZE, Math.min(s.width - PLAYER_SIZE, s.playerX));

    if (s.keys['Space']) {
      if (s.canShoot) { shoot(); s.canShoot = false; }
    } else { s.canShoot = true; }

    if (s.chemoActive) {
      const rem = CHEMO_DURATION - (Date.now() - s.chemoStartTime);
      if (rem <= 0) {
        s.chemoActive = false;
        setChemoActive(false);
      } else {
        setChemoTimeLeft(rem / CHEMO_DURATION);
      }
    }

    const now = Date.now();
    if (now - s.lastSpawn > s.spawnRate) {
      s.enemies.push({
        radius: Math.random() * 15 + 18,
        x: Math.random() * (s.width - 40) + 20,
        y: -40,
        speed: 1.8 + (stateRef.current.enemies.length / 50) + (score / 50),
        wobble: Math.random() * Math.PI * 2
      });
      s.lastSpawn = now;
      s.spawnRate = Math.max(200, 1400 - (score * 15));
    }
    if (now - s.lastPowerupSpawn > 15000) {
      s.powerups.push({ x: Math.random() * (s.width - 60) + 30, y: -40, radius: 18, speed: 2.5 });
      s.lastPowerupSpawn = now;
    }

    s.powerups.forEach((p, i) => {
      p.y += p.speed;
      if (Math.hypot(p.x - s.playerX, p.y - (s.height - 90)) < p.radius + PLAYER_SIZE) {
        s.chemoActive = true;
        s.chemoStartTime = Date.now();
        setChemoActive(true);
        playSound('powerup');
        s.powerups.splice(i, 1);
      } else if (p.y > s.height) s.powerups.splice(i, 1);
    });

    s.bullets.forEach((b, i) => {
      b.x += b.vx; b.y += b.vy;
      if (b.y < -50 || b.y > s.height + 50 || b.x < -50 || b.x > s.width + 50) s.bullets.splice(i, 1);
    });

    s.enemies.forEach((e, i) => {
      e.y += e.speed;
      e.wobble += 0.08;
      if (e.y > s.height - 50) {
        setHealth(h => {
          const newH = h - 10;
          if (newH <= 0) gameOver(score);
          return Math.max(0, newH);
        });
        playSound('hit');
        s.poolCells.forEach(cell => { if (Math.abs(cell.x - e.x) < 140) cell.color = '#ff4757'; });
        for(let p=0; p<15; p++) s.particles.push({ x: e.x, y: e.y, color: '#ff4757', radius: Math.random()*4, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, alpha: 1 });
        s.enemies.splice(i, 1);
      }
      s.bullets.forEach((b, j) => {
        if (Math.hypot(e.x - b.x, e.y - b.y) < e.radius + 5) {
          playSound('shriek');
          for(let p=0; p<15; p++) s.particles.push({ x: e.x, y: e.y, color: '#a55eea', radius: Math.random()*4, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, alpha: 1 });
          s.enemies.splice(i, 1);
          s.bullets.splice(j, 1);
          setScore(prev => prev + 1);
        }
      });
    });

    s.particles.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.025;
      if (p.alpha <= 0) s.particles.splice(i, 1);
    });

  }, [gameState, score, gameOver, shoot]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    ctx.clearRect(0, 0, s.width, s.height);

    // Pool
    const poolHeight = 50;
    const gradient = ctx.createLinearGradient(0, s.height - poolHeight, 0, s.height);
    gradient.addColorStop(0, 'rgba(46, 213, 115, 0)');
    gradient.addColorStop(1, 'rgba(46, 213, 115, 0.2)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, s.height - poolHeight, s.width, poolHeight);
    s.poolCells.forEach(cell => {
      const wobble = Math.sin(Date.now() / 600 + cell.offset) * 8;
      ctx.beginPath();
      ctx.arc(cell.x + wobble, cell.y, cell.radius, 0, Math.PI * 2);
      ctx.fillStyle = cell.color;
      ctx.globalAlpha = 0.5;
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // Player
    const px = s.playerX;
    const py = s.height - 90;
    if (s.chemoActive) {
      ctx.shadowBlur = 25;
      ctx.shadowColor = '#eccc68';
    }
    ctx.beginPath();
    ctx.ellipse(px, py, PLAYER_SIZE, PLAYER_SIZE * 0.7, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4757';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(px, py, PLAYER_SIZE * 0.6, PLAYER_SIZE * 0.4, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#b33939';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillRect(px - 2, py - 28, 4, 12);
    ctx.shadowBlur = 0;

    // Entities
    s.powerups.forEach(p => {
        const glow = Math.sin(Date.now() / 150) * 10;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(p.x - 12, p.y - 18, 24, 36, 12);
        else ctx.rect(p.x - 12, p.y - 18, 24, 36);
        ctx.fillStyle = '#eccc68';
        ctx.shadowBlur = 20 + glow;
        ctx.shadowColor = '#eccc68';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#000";
        ctx.font = "bold 18px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("C", p.x, p.y + 7);
    });

    s.bullets.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = s.chemoActive ? '#eccc68' : '#fff';
      ctx.fill();
    });

    s.enemies.forEach(e => {
      const wobbleX = Math.sin(e.wobble) * 3;
      ctx.beginPath();
      ctx.arc(e.x + wobbleX, e.y, e.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#a55eea';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(e.x + wobbleX + e.radius/3, e.y - e.radius/3, e.radius/4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fill();
    });

    s.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.restore();
    });

    if (gameState === 'PLAYING') requestAnimationFrame(draw);
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      const loop = setInterval(update, 1000 / 60);
      requestAnimationFrame(draw);
      return () => clearInterval(loop);
    }
  }, [gameState, update, draw]);

  const startGame = () => {
    initAudio();
    const s = stateRef.current;
    s.enemies = []; s.bullets = []; s.particles = []; s.powerups = [];
    s.spawnRate = 1500; s.chemoActive = false;
    s.lastSpawn = Date.now(); s.lastPowerupSpawn = Date.now();
    setScore(0); setHealth(100); setChemoActive(false);
    setGameState('PLAYING');
  };

  const handleBtnClick = () => {
    if (btnText === "Donate to Replay") {
      window.open(DONATION_URL, '_blank');
      setBtnText("Play Again");
    } else {
      startGame();
    }
  };

  const handleTouchStart = (e) => {
    if (gameState !== 'PLAYING') return;
    const touch = e.touches[0];
    const s = stateRef.current;
    s.touchStartX = touch.clientX;
    s.playerStartX = s.playerX;
    s.currentTouchX = touch.clientX;
    s.touchStartTime = Date.now();
  };

  const handleTouchMove = (e) => {
    if (gameState !== 'PLAYING') return;
    const touch = e.touches[0];
    const s = stateRef.current;
    s.currentTouchX = touch.clientX;
    const deltaX = (s.currentTouchX - s.touchStartX) * 1.5;
    const newX = s.playerStartX + deltaX;
    s.playerX = Math.max(PLAYER_SIZE, Math.min(s.width - PLAYER_SIZE, newX));
  };

  const handleTouchEnd = (e) => {
    if (gameState !== 'PLAYING') return;
    const s = stateRef.current;
    const diff = Math.abs(s.currentTouchX - s.touchStartX);
    const time = Date.now() - s.touchStartTime;
    if (time < 300 && diff < 20) shoot();
  };

  // TAILWIND STYLING FOR PREVIEW
  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden font-sans select-none touch-none">
      <canvas 
        ref={canvasRef} 
        className="block"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      <div className="absolute top-5 left-0 w-full flex flex-col gap-4 px-8 pointer-events-none z-10">
        <div className="flex justify-between w-full">
          <div className="bg-white/5 backdrop-blur-md p-3 px-6 rounded-xl border border-white/10 shadow-lg">
            <span className="text-xs uppercase tracking-widest text-white/50 block">Eliminated</span>
            <span className="text-2xl font-black text-amber-400 tabular-nums">{score}</span>
          </div>
          <div className="bg-white/5 backdrop-blur-md p-3 px-6 rounded-xl border border-white/10 shadow-lg text-right">
            <span className="text-xs uppercase tracking-widest text-white/50 block">Vitality</span>
            <span className={`text-2xl font-black tabular-nums ${health < 30 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
                {health}%
            </span>
          </div>
        </div>

        {chemoActive && (
          <div className="self-center w-60 h-2 bg-white/10 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-amber-400 shadow-[0_0_15px_#eccc68] transition-all duration-100 ease-linear"
              style={{ width: `${chemoTimeLeft * 100}%` }}
            />
          </div>
        )}
      </div>

      {(gameState === 'MENU' || gameState === 'GAMEOVER') && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-5 z-20">
          <div className="max-w-md w-full p-10 rounded-3xl bg-red-950/20 border border-white/10 shadow-2xl text-center">
            <div className="text-amber-400 font-bold mb-2 uppercase tracking-[0.2em] text-[10px]">
                Global High Score: {highScore}
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-b from-white to-red-400 bg-clip-text text-transparent leading-none">
              {gameState === 'MENU' ? 'IMMUNO DEFENSE' : 'INVASION COMPLETE'}
            </h1>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              {gameState === 'MENU' 
                ? 'Neutralize the malignant invasion before they reach the healthy pool. Capture Chemo-Orbs for maximum suppression fire.'
                : `Defense systems neutralized ${score} malignant cells. Help fund real medical treatments while you prepare for the next round.`
              }
            </p>

            <button 
              onClick={handleBtnClick}
              className="w-full bg-gradient-to-br from-red-500 to-red-700 text-white py-4 px-10 rounded-2xl font-black text-xl uppercase tracking-wider shadow-xl shadow-red-900/20 hover:scale-105 active:scale-95 transition-all"
            >
              {btnText}
            </button>

            <div className="mt-8 grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                <div>Arrows / Swipe<br/><span className="text-white">Navigate</span></div>
                <div>Space / Tap<br/><span className="text-white">Fire Blast</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}