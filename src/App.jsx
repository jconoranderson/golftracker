import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  MapPin, 
  Calendar as CalendarIcon, 
  Plus, 
  Minus, 
  List, 
  Activity, 
  Download, 
  ChevronRight,
  Target,
  Flag
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'golf_tracker_rounds';

export default function App() {
  const [activeTab, setActiveTab] = useState('new'); // new, stats, history
  const [rounds, setRounds] = useState([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setRounds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse rounds", e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rounds));
  }, [rounds]);

  const addRound = (round) => {
    setRounds([round, ...rounds].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setActiveTab('stats');
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rounds, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "golf_rounds_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 selection:bg-masters-green/30">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#006747] p-2 rounded-xl shadow-lg shadow-[#006747]/20">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">GolfTracker</h1>
          </div>
          {activeTab === 'stats' && (
            <button 
              onClick={exportToJson}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800"
              aria-label="Export to JSON"
            >
              <Download className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6">
        {activeTab === 'new' && <NewRoundForm onSave={addRound} rounds={rounds} />}
        {activeTab === 'stats' && <StatsDashboard rounds={rounds} />}
        {activeTab === 'history' && <History rounds={rounds} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <NavButton 
            icon={<Plus className="w-6 h-6" />} 
            label="New" 
            active={activeTab === 'new'} 
            onClick={() => setActiveTab('new')} 
          />
          <NavButton 
            icon={<Activity className="w-6 h-6" />} 
            label="Stats" 
            active={activeTab === 'stats'} 
            onClick={() => setActiveTab('stats')} 
          />
          <NavButton 
            icon={<List className="w-6 h-6" />} 
            label="History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
        active 
          ? 'text-[#006747] scale-105' 
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <div className={`${active ? 'bg-[#006747]/10' : ''} p-1.5 rounded-lg mb-1 transition-colors duration-200`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
}

function NewRoundForm({ onSave, rounds }) {
  const [courseName, setCourseName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [score, setScore] = useState(85);
  const [putts, setPutts] = useState(36);
  
  // Extract unique courses from previous rounds
  const pastCourses = Array.from(new Set(rounds.map(r => r.courseName)));
  const defaultCourses = ['Pleasantville Country Club', 'Walkill Golf Club', 'Augusta National', 'Pebble Beach', 'St Andrews', 'Pinehurst No. 2', 'Bethpage Black', 'TPC Sawgrass', 'Torrey Pines', 'Oakmont'];
  const allCourses = Array.from(new Set([...pastCourses, ...defaultCourses]));
  
  // Fairways out of 14, GIR out of 18 (using simple steppers with +/-)
  // Re-interpreting "toggle switches" to actual UI elements! 
  // Let's use simple toggles for the 18 holes!
  const [fairways, setFairways] = useState(Array(18).fill(false));
  const [girs, setGirs] = useState(Array(18).fill(false));

  const toggleFairway = (index) => {
    const newF = [...fairways];
    newF[index] = !newF[index];
    setFairways(newF);
  };

  const toggleGir = (index) => {
    const newG = [...girs];
    newG[index] = !newG[index];
    setGirs(newG);
  };

  const handleSave = () => {
    if (!courseName) {
      alert("Please enter a course name");
      return;
    }
    const fairwaysHit = fairways.filter(Boolean).length;
    const girsHit = girs.filter(Boolean).length;
    
    onSave({
      id: Date.now().toString(),
      courseName,
      date,
      score,
      putts,
      fairwaysHit,
      girsHit,
    });
    
    // Reset form
    setCourseName('');
    setScore(85);
    setPutts(36);
    setFairways(Array(18).fill(false));
    setGirs(Array(18).fill(false));
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 fade-in">
      <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
        
        {/* Course & Date */}
        <div className="space-y-4">
          <div className="relative">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Course Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Search or enter course..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent transition-all placeholder:text-slate-600"
              />
            </div>
            {/* Searchable Dropdown List */}
            {courseName.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                {allCourses.filter(c => c.toLowerCase().includes(courseName.toLowerCase()) && c !== courseName).map(course => (
                  <button
                    key={course}
                    onClick={() => setCourseName(course)}
                    className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800/50 last:border-0"
                  >
                    {course}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Date</label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 z-10 pointer-events-none" />
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent transition-all [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800 w-full" />

        {/* Score & Putts Steppers */}
        <div className="grid grid-cols-2 gap-4">
          <Stepper label="Total Score" value={score} setValue={setScore} icon={<Trophy className="w-4 h-4 text-[#006747]" />} />
          <Stepper label="Total Putts" value={putts} setValue={setPutts} />
        </div>

        <div className="h-px bg-slate-800 w-full" />

        {/* Fairways & GIRs Toggles */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Fairways Hit</label>
              <span className="text-lg font-bold text-white">{fairways.filter(Boolean).length}<span className="text-slate-500 text-sm font-normal">/14</span></span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {fairways.map((hit, i) => (
                i < 14 ? ( // Only 14 fairways typically
                  <button 
                    key={`fw-${i}`}
                    onClick={() => toggleFairway(i)}
                    className={`h-10 rounded-lg text-xs font-bold transition-all duration-200 border ${
                      hit 
                        ? 'bg-[#006747]/20 border-[#006747] text-[#006747] shadow-[0_0_10px_rgba(0,103,71,0.2)]' 
                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {i+1}
                  </button>
                ) : null
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">GIR (Greens In Regulation)</label>
              <span className="text-lg font-bold text-white">{girs.filter(Boolean).length}<span className="text-slate-500 text-sm font-normal">/18</span></span>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {girs.map((hit, i) => (
                <button 
                  key={`gir-${i}`}
                  onClick={() => toggleGir(i)}
                  className={`h-10 rounded-lg text-xs font-bold transition-all duration-200 border ${
                    hit 
                      ? 'bg-[#006747] border-[#006747] text-white shadow-[0_0_10px_rgba(0,103,71,0.4)]' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-[#006747] hover:bg-[#007a54] active:scale-[0.98] transition-all text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-[#006747]/25 flex items-center justify-center gap-2 mt-4"
        >
          <Plus className="w-5 h-5" />
          Save Round
        </button>
      </div>
    </div>
  );
}

function Stepper({ label, value, setValue, icon }) {
  return (
    <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex flex-col items-center shadow-inner">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-center justify-between w-full">
        <button 
          onClick={() => setValue(v => Math.max(0, v - 1))}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 active:bg-slate-800 transition-colors"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-3xl font-black tabular-nums tracking-tighter">{value}</span>
        <button 
          onClick={() => setValue(v => v + 1)}
          className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 active:bg-slate-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function StatsDashboard({ rounds }) {
  if (!rounds.length) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
          <Target className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Rounds Yet</h2>
        <p className="text-slate-500">Record your first round to see your stats.</p>
      </div>
    );
  }

  const avgScore = (rounds.reduce((sum, r) => sum + r.score, 0) / rounds.length).toFixed(1);
  const avgPutts = (rounds.reduce((sum, r) => sum + r.putts, 0) / rounds.length).toFixed(1);
  
  const totalGirs = rounds.reduce((sum, r) => sum + r.girsHit, 0);
  const girPercentage = ((totalGirs / (rounds.length * 18)) * 100).toFixed(1);

  const totalFairways = rounds.reduce((sum, r) => sum + r.fairwaysHit, 0);
  const fairwayPercentage = ((totalFairways / (rounds.length * 14)) * 100).toFixed(1);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Main Stat Card */}
      <div className="bg-gradient-to-br from-[#006747] to-[#004d35] rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
        
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-widest mb-1">Average Score</h2>
        <div className="flex items-baseline gap-2 mb-6">
          <span className="text-6xl font-black text-white tracking-tighter">{avgScore}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Putting Avg</div>
            <div className="text-2xl font-bold text-white">{avgPutts}</div>
          </div>
          <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">GIR %</div>
            <div className="text-2xl font-bold text-white">{girPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Fairways Hit</div>
            <div className="text-xl font-bold text-white">{fairwayPercentage}%</div>
          </div>
          <Target className="w-8 h-8 text-[#006747]/50" />
        </div>
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Rounds</div>
            <div className="text-xl font-bold text-white">{rounds.length}</div>
          </div>
          <Activity className="w-8 h-8 text-[#006747]/50" />
        </div>
      </div>

      {/* Recent Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#006747]" />
          Recent Scores
        </h3>
        <div className="flex items-end justify-between h-24 gap-2">
          {rounds.slice(0, 7).reverse().map((r, i) => {
            const height = Math.max(10, Math.min(100, 100 - (r.score - 70) * 1.5));
            return (
              <div key={i} className="flex flex-col items-center flex-1 gap-2">
                <div 
                  className="w-full bg-[#006747] rounded-t-sm rounded-b-sm opacity-80 hover:opacity-100 transition-opacity"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] font-semibold text-slate-500 tabular-nums">{r.score}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

function History({ rounds }) {
  if (!rounds.length) {
    return (
      <div className="text-center py-20 animate-in fade-in">
        <div className="bg-slate-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
          <List className="w-10 h-10 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No History Yet</h2>
        <p className="text-slate-500">Your past rounds will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      <h2 className="text-lg font-bold text-slate-100 mb-4 px-2">Past Rounds</h2>
      {rounds.map((round) => (
        <div key={round.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center shadow-sm hover:bg-slate-800/80 transition-colors active:scale-[0.98]">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold truncate text-base mb-1">{round.courseName}</h3>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {new Date(round.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span>•</span>
              <span>Putts: {round.putts}</span>
            </div>
          </div>
          <div className="ml-4 flex flex-col items-end">
            <div className="text-2xl font-black tabular-nums text-[#006747]">{round.score}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
