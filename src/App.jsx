import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Music, Timer, PlayCircle } from 'lucide-react';

// 1. Updated Game Data with your tracks using your custom filename style
const GAME_DATA = [
  {
    id: 1,
    audioSrc: '/audio/blinding_lights.mpeg', 
    correctAnswer: 'Blinding Lights - The Weeknd',
    options: [
      'Starboy - The Weeknd',
      'Blinding Lights - The Weeknd',
      "Don't Start Now - Dua Lipa",
      'Circles - Post Malone'
    ]
  },
  {
    id: 2,
    audioSrc: '/audio/stay.mpeg',
    correctAnswer: 'Stay - Kid LAROI & Justin Bieber',
    options: [
      'Stay - Kid LAROI & Justin Bieber',
      'Peaches - Justin Bieber',
      'As It Was - Harry Styles',
      'Bad Habits - Ed Sheeran'
    ]
  },
  {
    id: 3,
    audioSrc: '/audio/i_hate_you_i_love_you.mpeg',
    correctAnswer: 'i hate you, i love you - gnash ft. olivia o\'brien',
    options: [
      'Say Something - A Great Big World',
      'i hate you, i love you - gnash ft. olivia o\'brien',
      'Let Me Love You - DJ Snake ft. Justin Bieber',
      'We Don\'t Talk Anymore - Charlie Puth'
    ]
  },
  {
    id: 4,
    audioSrc: '/audio/enemy.mpeg',
    correctAnswer: 'Enemy - Imagine Dragons x J.I.D',
    options: [
      'Natural - Imagine Dragons',
      'Bones - Imagine Dragons',
      'Enemy - Imagine Dragons x J.I.D',
      'Centuries - Fall Out Boy'
    ]
  },
  {
    id: 5,
    audioSrc: '/audio/believer.mpeg',
    correctAnswer: 'Believer - Imagine Dragons',
    options: [
      'Radioactive - Imagine Dragons',
      'Believer - Imagine Dragons',
      'Thunder - Imagine Dragons',
      'Counting Stars - OneRepublic'
    ]
  },
  {
    id: 6,
    audioSrc: '/audio/fearless.mpeg',
    correctAnswer: 'Fearless - Taylor Swift',
    options: [
      'Love Story - Lost Sky',
      'You Belong With Me - Taylor Swift',
      'Mine - Taylor Swift',
      'Fearless - Taylor Swift'
    ]
  }
];

export default function MusicGuessingGame() {
  // Game Flow States: 'LOBBY' | 'PLAYING' | 'GAMEOVER'
  const [gameState, setGameState] = useState('LOBBY');
  
  // Game & Navigation State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  
  // Audio & Dynamic Timer State
  const [timeLeft, setTimeLeft] = useState(0);
  const [duration, setDuration] = useState(0); // Tracks total length for the progress bar
  const audioRef = useRef(null);

  const currentSong = GAME_DATA[currentQuestion];

  // --- Start the Game ---
  const startGame = () => {
    setScore(0);
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setGameState('PLAYING');
  };

  // --- Core Game Logic Effects ---

  // 1. Handle Question Switching & Reset States
  useEffect(() => {
    if (gameState !== 'PLAYING' || !currentSong) return;

    setSelectedOption(null);
    setIsCorrect(null);

    // Reload the audio element to get fresh metadata for the next track
    if (audioRef.current) {
      audioRef.current.load();
    }
  }, [currentQuestion, gameState]);

  // 2. Triggered automatically when the file metadata finishes loading
  const handleMetadataLoaded = () => {
    if (!audioRef.current) return;
    
    const audioLength = Math.ceil(audioRef.current.duration);
    setTimeLeft(audioLength);
    setDuration(audioLength);

    // Autoplay instantly now that duration tracking is set
    audioRef.current.play().catch(err => {
      console.log("Autoplay blocked or interrupted:", err);
    });
  };

  // 3. Continuous Countdown Timer Loop
  useEffect(() => {
    if (gameState !== 'PLAYING' || selectedOption !== null || timeLeft <= 0) return;

    const timerIdx = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timerIdx);
  }, [timeLeft, selectedOption, gameState]);

  // Watcher to catch absolute zero
  useEffect(() => {
    if (gameState === 'PLAYING' && timeLeft === 0 && duration > 0 && selectedOption === null) {
      handleTimeOut();
    }
  }, [timeLeft, duration, gameState]);


  // --- Event Handlers ---

  // Triggered when time ticks down to 0 or audio naturally ends
  const handleTimeOut = () => {
    if (selectedOption !== null) return; 
    setSelectedOption("TIME_EXPIRED");
    setIsCorrect(false);
    if (audioRef.current) audioRef.current.pause();
  };

  // Handle user's guess click
  const handleOptionClick = (option) => {
    if (selectedOption !== null) return; 
    
    setSelectedOption(option);
    const correct = option === currentSong.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    if (audioRef.current) audioRef.current.pause();
  };

  // Move to next track
  const handleNext = () => {
    setDuration(0); // Reset base tracking scale
    if (currentQuestion < GAME_DATA.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setGameState('GAMEOVER');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
        
        {/* HTML5 Audio Element connected to Metadata Event hooks */}
        {gameState === 'PLAYING' && currentSong && (
          <audio 
            ref={audioRef} 
            src={currentSong.audioSrc} 
            onLoadedMetadata={handleMetadataLoaded}
            onEnded={handleTimeOut} 
          />
        )}

        {/* SCREEN 1: LOBBY / START SCREEN */}
        {gameState === 'LOBBY' && (
          <div className="text-center py-12 flex flex-col items-center">
            <div className="p-4 bg-cyan-950/50 text-cyan-400 rounded-full mb-6 border border-cyan-800/30">
              <Music size={48} className="animate-bounce" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Music Guessing Challenge
            </h1>
            <p className="text-slate-400 max-w-sm mb-8 text-sm leading-relaxed">
              The clock is tied exactly to the length of the track snippet. Guess before the file ends!
            </p>
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-bold px-8 py-4 rounded-xl transition-all shadow-lg transform hover:scale-105 active:scale-95 text-lg"
            >
              <PlayCircle size={22} fill="currentColor" /> Start Game
            </button>
          </div>
        )}

        {/* SCREEN 2: ACTIVE GAMEPLAY */}
        {gameState === 'PLAYING' && (
          <div>
            {/* Header Metadata */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
                Question {currentQuestion + 1} of {GAME_DATA.length}
              </p>
              
              {/* Dynamic Countdown Display */}
              <div className={`flex items-center gap-1.5 font-bold px-3 py-1 rounded-lg border text-sm transition-colors ${
                timeLeft <= 5 && selectedOption === null
                  ? 'bg-rose-950/50 text-rose-400 border-rose-800 animate-pulse' 
                  : 'bg-slate-900 text-cyan-400 border-slate-700'
              }`}>
                <Timer size={16} />
                <span>{timeLeft}s remaining</span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-slate-700 h-1.5 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / GAME_DATA.length) * 100}%` }}
              />
            </div>

            {/* Audio Spinning Vinyl Graphic */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className={`w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center relative shadow-lg ${
                selectedOption === null && duration > 0 ? 'animate-spin [animation-duration:6s]' : ''
              }`}>
                <Music className={`w-12 h-12 ${timeLeft <= 5 && selectedOption === null ? 'text-rose-400' : 'text-cyan-400'}`} />
                <div className="w-8 h-8 rounded-full bg-slate-800 absolute border border-slate-700"></div>
              </div>
              <span className="text-xs text-slate-500 font-medium tracking-wider mt-4 uppercase">
                {selectedOption === null && duration > 0 ? '🎵 Playing Snippet...' : '⏸️ Audio Stopped'}
              </span>
            </div>

            {/* Time's Up Alert Box */}
            {selectedOption === "TIME_EXPIRED" && (
              <div className="mb-4 text-center p-3 rounded-xl border border-rose-800 bg-rose-950/30 text-rose-400 text-sm font-semibold">
                ⏰ Time's up! You didn't guess before the track finished.
              </div>
            )}

            {/* Options Interactive Grid */}
            <div className="grid grid-cols-1 gap-3.5 mb-6">
              {currentSong.options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isOptionCorrect = option === currentSong.correctAnswer;
                
                let optionStyle = "border-slate-700 bg-slate-750/70 hover:bg-slate-700 text-slate-200 cursor-pointer";
                
                if (selectedOption !== null) {
                  if (isOptionCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-400 font-medium pointer-events-none";
                  } else if (isSelected && !isOptionCorrect) {
                    optionStyle = "border-rose-500 bg-rose-950/40 text-rose-400 font-medium pointer-events-none";
                  } else {
                    optionStyle = "border-slate-800 bg-slate-800/30 text-slate-600 opacity-40 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={selectedOption !== null || duration === 0}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between font-medium ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {selectedOption !== null && isOptionCorrect && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
                    {selectedOption !== null && isSelected && !isOptionCorrect && <XCircle size={18} className="text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="h-12 flex items-center justify-end">
              {selectedOption !== null && (
                <button
                  onClick={handleNext}
                  className="bg-slate-100 hover:bg-white text-slate-900 font-bold px-6 py-2 rounded-xl transition-all shadow-md text-sm"
                >
                  {currentQuestion === GAME_DATA.length - 1 ? 'See Results' : 'Next Song'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* SCREEN 3: GAME OVER SUMMARY */}
        {gameState === 'GAMEOVER' && (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-cyan-950 rounded-full text-cyan-400 mb-4">
              <Music size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Challenge Complete!</h2>
            <p className="text-slate-400 mb-6">
              You correctly guessed <span className="text-cyan-400 font-bold text-lg">{score}</span> out of {GAME_DATA.length} tracks.
            </p>
            
            <button
              onClick={startGame}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:opacity-90"
            >
              <RotateCcw size={18} /> Try Challenge Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}