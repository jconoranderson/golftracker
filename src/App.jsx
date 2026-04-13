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
  Target,
  Flag,
  Check,
  ChevronRight,
  Trash2
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'golf_tracker_rounds';
const LOCAL_STORAGE_COURSES = 'golf_tracker_courses';

export default function App() {
  const [activeTab, setActiveTab] = useState('new'); // new, stats, history
  const [rounds, setRounds] = useState([]);
  const [courses, setCourses] = useState([]);

  // Load from local storage
  useEffect(() => {
    const savedRounds = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedRounds) {
      try { setRounds(JSON.parse(savedRounds)); } catch (e) {}
    }

    const savedCourses = localStorage.getItem(LOCAL_STORAGE_COURSES);
    if (savedCourses) {
      try { 
        setCourses(JSON.parse(savedCourses)); 
      } catch (e) {}
    } else {
      setCourses([]);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rounds));
  }, [rounds]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_COURSES, JSON.stringify(courses));
  }, [courses]);

  const addRound = (round) => {
    setRounds([round, ...rounds].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setActiveTab('stats');
  };

  const addCourse = (courseConfig) => {
    setCourses([...courses, courseConfig]);
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ rounds, courses }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "golf_tracker_export.json");
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
        {activeTab === 'new' && <NewRoundWrapper courses={courses} onSaveRound={addRound} onSaveCourse={addCourse} />}
        {activeTab === 'stats' && <StatsDashboard rounds={rounds} />}
        {activeTab === 'history' && <History rounds={rounds} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-slate-900/95 backdrop-blur-md border-t border-slate-800 z-50">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <NavButton icon={<Plus className="w-6 h-6" />} label="New" active={activeTab === 'new'} onClick={() => setActiveTab('new')} />
          <NavButton icon={<Activity className="w-6 h-6" />} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <NavButton icon={<List className="w-6 h-6" />} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${ active ? 'text-[#006747] scale-105' : 'text-slate-500 hover:text-slate-300' }`}>
      <div className={`${active ? 'bg-[#006747]/10' : ''} p-1.5 rounded-lg mb-1 transition-colors duration-200`}>{icon}</div>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
}

function NewRoundWrapper({ courses, onSaveRound, onSaveCourse }) {
  const [courseName, setCourseName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [configuringCourse, setConfiguringCourse] = useState(false);

  const matchedCourse = courses.find(c => c.name.toLowerCase() === courseName.toLowerCase());

  // Show Add Course form if they are explicitly configuring
  if (configuringCourse) {
    return (
      <AddCourseForm 
        initialName={courseName} 
        initialPars={matchedCourse ? matchedCourse.pars : null}
        onCancel={() => setConfiguringCourse(false)}
        onSave={(c) => {
          // If overwriting existing course, filter it out first
          const newCourses = courses.filter(xc => xc.name.toLowerCase() !== c.name.toLowerCase());
          newCourses.push(c);
          localStorage.setItem(LOCAL_STORAGE_COURSES, JSON.stringify(newCourses));
          // Because state might be delayed, we can reload or call onSaveCourse which updates parent state:
          // Wait, onSaveCourse appends. Let's make an onUpdateCourses
          
          setCourseName(c.name);
          setConfiguringCourse(false);
          window.location.reload(); // Simple brute force to reload latest from local storage 
        }} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 fade-in">
      <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6">
        
        <div className="space-y-4">
          <div className="relative">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Course Name</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Search or add course..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent transition-all placeholder:text-slate-600"
              />
            </div>
            
            {courseName.length > 0 && !matchedCourse && (
               <div className="absolute z-20 w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto">
                 {courses.filter(c => c.name.toLowerCase().includes(courseName.toLowerCase())).map(course => (
                   <button
                     key={course.name}
                     onClick={() => setCourseName(course.name)}
                     className="w-full text-left px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors border-b border-slate-800/50"
                   >
                     {course.name}
                   </button>
                 ))}
                 <button
                   onClick={() => setConfiguringCourse(true)}
                   className="w-full text-left px-4 py-3 text-[#006747] font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                 >
                   <Plus className="w-4 h-4" /> Add "{courseName}" to Registry
                 </button>
               </div>
            )}
            
            {/* Show an Edit & Delete button if they selected a course so they can update its pars */}
            {matchedCourse && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={() => setConfiguringCourse(true)}
                  className="text-xs font-bold text-[#006747] hover:text-[#007a54] bg-[#006747]/10 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                >
                  Edit Option
                </button>
                <button
                  onClick={() => {
                    if(window.confirm(`Remove ${matchedCourse.name} from your local registry?`)) {
                      const newC = courses.filter(c => c.name !== matchedCourse.name);
                      localStorage.setItem(LOCAL_STORAGE_COURSES, JSON.stringify(newC));
                      window.location.reload();
                    }
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg active:scale-95 transition-all shrink-0"
                  aria-label="Delete Course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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

        {matchedCourse ? (
          <HoleByHoleTracker course={matchedCourse} date={date} onSaveRound={onSaveRound} />
        ) : (
          <div className="text-center p-6 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50 text-slate-500">
            <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select or add a course to start tracking your holes.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function AddCourseForm({ initialName, initialPars, onSave, onCancel }) {
  const [name, setName] = useState(initialName);
  const [pars, setPars] = useState(initialPars || Array(18).fill(4));

  const handleParChange = (index, delta) => {
    const newPars = [...pars];
    newPars[index] = Math.max(3, Math.min(6, newPars[index] + delta)); // restrict between Par 3 and Par 6
    setPars(newPars);
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#006747]" />
          Configure Course
        </h2>
        <button onClick={onCancel} className="text-slate-500 hover:text-white text-sm font-semibold">Cancel</button>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Club Name</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#006747] focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Set Pars (Hole 1 - 18)</label>
        <div className="grid grid-cols-3 gap-2">
          {pars.map((par, i) => (
            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
              <span className="text-[10px] text-slate-500 font-bold mb-1">Hole {i + 1}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => handleParChange(i, -1)} className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-md"><Minus className="w-3 h-3" /></button>
                <span className="font-bold text-sm w-3 text-center">{par}</span>
                <button onClick={() => handleParChange(i, 1)} className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-md"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
        <span className="text-sm font-semibold text-slate-400">Total Course Par:</span>
        <span className="text-2xl font-black text-white">{pars.reduce((a,b)=>a+b,0)}</span>
      </div>

      <button 
        onClick={() => onSave({ name, pars })}
        className="w-full bg-[#006747] hover:bg-[#007a54] text-white font-bold text-lg py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Check className="w-5 h-5" />
        Save Configuration
      </button>
    </div>
  );
}

function HoleByHoleTracker({ course, date, onSaveRound }) {
  // Initialize hole data based on the course pars
  const [holes, setHoles] = useState(
    course.pars.map((par) => ({
      par: par,
      shots: par, // default to par
      putts: 2,   // default 2 putts
      fairway: par > 3 ? true : null, // par 3s don't have fairways typically
      gir: true,  // default to hitting the green
    }))
  );

  const updateHole = (index, field, value) => {
    const newHoles = [...holes];
    newHoles[index] = { ...newHoles[index], [field]: value };
    setHoles(newHoles);
  };

  const handleSave = () => {
    // Derive totals
    const score = holes.reduce((sum, h) => sum + h.shots, 0);
    const putts = holes.reduce((sum, h) => sum + h.putts, 0);
    const fairwaysHit = holes.filter(h => h.fairway === true).length;
    const girsHit = holes.filter(h => h.gir === true).length;

    onSaveRound({
      id: Date.now().toString(),
      courseName: course.name,
      date,
      score,
      putts,
      fairwaysHit,
      girsHit,
      holeData: holes // Save granular data for future if requested!
    });
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-800">
      
      {/* Sticky header for current totals */}
      <div className="sticky top-20 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-lg flex justify-between items-center">
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
          <div className="text-2xl font-black text-[#006747] leading-none">{holes.reduce((a,b)=>a+b.shots, 0)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-slate-400 text-right">To Par</div>
          <div className="text-xl font-bold text-white leading-none">
            {holes.reduce((a,b)=>a+b.shots, 0) - course.pars.reduce((a,b)=>a+b, 0) > 0 ? '+' : ''}{holes.reduce((a,b)=>a+b.shots, 0) - course.pars.reduce((a,b)=>a+b, 0)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {holes.map((hole, i) => (
          <div key={i} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Flag className="w-3 h-3 text-[#006747]" /> Hole {i + 1}
              </span>
              <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">Par {hole.par}</span>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <CompactStepper 
                  label="Shots" 
                  value={hole.shots} 
                  onChange={(val) => updateHole(i, 'shots', val)} 
                  highlight={hole.shots < hole.par ? 'text-green-400' : hole.shots > hole.par ? 'text-red-400' : 'text-white'}
                />
                <CompactStepper 
                  label="Putts" 
                  value={hole.putts} 
                  onChange={(val) => updateHole(i, 'putts', Math.max(0, val))} 
                />
              </div>

              <div className="flex gap-2">
                {hole.par > 3 ? (
                  <button 
                    onClick={() => updateHole(i, 'fairway', !hole.fairway)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                      hole.fairway ? 'bg-[#006747]/20 border-[#006747] text-[#006747]' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    Fairway {hole.fairway && <Check className="w-3 h-3" />}
                  </button>
                ) : (
                  <div className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-900/50 border border-slate-800/50 text-slate-600 flex items-center justify-center">
                    N/A (Par 3)
                  </div>
                )}
                
                <button 
                  onClick={() => updateHole(i, 'gir', !hole.gir)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1 ${
                    hole.gir ? 'bg-[#006747] border-[#006747] text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  GIR {hole.gir && <Check className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        className="w-full bg-[#006747] hover:bg-[#007a54] text-white font-bold text-lg py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all relative z-10"
      >
        <Trophy className="w-5 h-5" />
        Finish & Save Round
      </button>

    </div>
  );
}

function CompactStepper({ label, value, onChange, highlight = "text-white" }) {
  return (
    <div className="flex flex-col items-center bg-slate-900 border border-slate-800 rounded-xl p-2">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</span>
      <div className="flex items-center justify-between w-full px-2">
        <button onClick={() => onChange(value - 1)} className="w-8 h-8 rounded-full bg-slate-950 text-slate-400 flex items-center justify-center active:bg-slate-800 border border-slate-800"><Minus className="w-4 h-4" /></button>
        <span className={`text-xl font-black ${highlight}`}>{value}</span>
        <button onClick={() => onChange(value + 1)} className="w-8 h-8 rounded-full bg-slate-950 text-slate-400 flex items-center justify-center active:bg-slate-800 border border-slate-800"><Plus className="w-4 h-4" /></button>
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

  // Note: Total fairways varies per course, but typically 14
  const totalFairways = rounds.reduce((sum, r) => sum + r.fairwaysHit, 0);
  const fairwayPercentage = ((totalFairways / (rounds.length * 14)) * 100).toFixed(1);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Main Stat Card */}
      <div className="bg-gradient-to-br from-[#006747] to-[#004d35] rounded-3xl p-6 shadow-xl relative overflow-hidden">
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
