import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle2, XCircle, RotateCcw, Music } from 'lucide-react';

// 1. Mock Data Setup (Replace with your local files and actual data)
const GAME_DATA = [
  {
    id: 1,
    audioSrc: '/audio/blinding.mpeg', // Path to your local file in public folder
    correctAnswer: 'Blinding Lights - The Weeknd',
    options: [
      'Starboy - The Weeknd',
      'Blinding Lights - The Weeknd',
      'Don\'t Start Now - Dua Lipa',
      'Circles - Post Malone'
    ]
  },
  {
    id: 2,
    audioSrc: '/audio/Stay-j.mpeg',
    correctAnswer: 'Stay - Kid LAROI & Justin Bieber',
    options: [
      'Stay - Kid LAROI & Justin Bieber',
      'Peaches - Justin Bieber',
      'As It Was - Harry Styles',
      'Bad Habits - Ed Sheeran'
    ]
  }
];

export default function MusicGuessingGame() {
  // Game State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const currentSong = GAME_DATA[currentQuestion];

  // Handle audio play/pause toggling
  const toggleAudio = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => console.log("Audio play interrupted:", err));
    }
    setIsPlaying(!isPlaying);
  };

  // Reset audio when switching questions
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setIsPlaying(false);
    }
  }, [currentQuestion]);

  // Handle Option Selection
  const handleOptionClick = (option) => {
    if (selectedOption !== null) return; // Prevent multiple guesses
    
    setSelectedOption(option);
    const correct = option === currentSong.correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    // Pause audio automatically when answered
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Move to Next Question
  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    
    if (currentQuestion < GAME_DATA.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setGameComplete(true);
    }
  };

  // Restart Game
  const restartGame = () => {
    setCurrentQuestion(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setGameComplete(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8 dynamic-shadow">
        
        {/* Header Details */}
        <div className="flex justify-between items-center mb-8">
          <span className="text-xs font-bold tracking-wider uppercase text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full">
            Song Guessing Game
          </span>
          <span className="text-sm font-semibold text-slate-400">
            Score: <span className="text-white font-bold">{score}</span> / {GAME_DATA.length}
          </span>
        </div>

        {/* Hidden HTML5 Audio Element */}
        {currentSong && !gameComplete && (
          <audio ref={audioRef} src={currentSong.audioSrc} onEnded={() => setIsPlaying(false)} />
        )}

        {!gameComplete ? (
          <div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-700 h-2 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / GAME_DATA.length) * 100}%` }}
              />
            </div>

            {/* Audio Player Vinyl Section */}
            <div className="flex flex-col items-center justify-center mb-10">
              <div className={`w-32 h-32 rounded-full bg-slate-900 border-4 border-slate-700 flex items-center justify-center mb-6 relative shadow-lg ${isPlaying ? 'animate-spin [animation-duration:8s]' : ''}`}>
                <Music className="w-12 h-12 text-cyan-400" />
                <div className="w-8 h-8 rounded-full bg-slate-800 absolute center border border-slate-700"></div>
              </div>

              <button
                onClick={toggleAudio}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg transition-all transform hover:scale-105 active:scale-95 shadow-md ${
                  isPlaying 
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-900' 
                    : 'bg-cyan-500 hover:bg-cyan-600 text-slate-900'
                }`}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                {isPlaying ? 'Pause Sample' : 'Play Sample'}
              </button>
              <p className="text-xs text-slate-400 mt-2">Question {currentQuestion + 1} of {GAME_DATA.length}</p>
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              {currentSong.options.map((option, index) => {
                const isSelected = selectedOption === option;
                const isOptionCorrect = option === currentSong.correctAnswer;
                
                // Dynamic styling rules based on game state
                let optionStyle = "border-slate-700 bg-slate-750 hover:bg-slate-700 text-slate-200";
                if (selectedOption !== null) {
                  if (isOptionCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-950/40 text-emerald-400 font-medium shadow-sm shadow-emerald-900/50";
                  } else if (isSelected && !isOptionCorrect) {
                    optionStyle = "border-rose-500 bg-rose-950/40 text-rose-400 font-medium shadow-sm shadow-rose-900/50";
                  } else {
                    optionStyle = "border-slate-800 bg-slate-800/40 text-slate-500 opacity-60 pointer-events-none";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={selectedOption !== null}
                    onClick={() => handleOptionClick(option)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {selectedOption !== null && isOptionCorrect && <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />}
                    {selectedOption !== null && isSelected && !isOptionCorrect && <XCircle size={20} className="text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback / Navigation Row */}
            <div className="h-14 flex items-center justify-end">
              {selectedOption !== null && (
                <button
                  onClick={handleNext}
                  className="bg-slate-100 hover:bg-white text-slate-900 font-bold px-6 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1"
                >
                  {currentQuestion === GAME_DATA.length - 1 ? 'See Results' : 'Next Song'}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Results Screen */
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-cyan-950 rounded-full text-cyan-400 mb-4">
              <Music size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-slate-400 mb-6">
              You scored <span className="text-cyan-400 font-bold text-lg">{score}</span> out of {GAME_DATA.length} songs correct.
            </p>
            
            <button
              onClick={restartGame}
              className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-bold px-6 py-3 rounded-xl transition-all"
            >
              <RotateCcw size={18} /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}