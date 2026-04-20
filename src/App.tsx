/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Calendar, 
  Search, 
  Plus, 
  Clock, 
  Building2, 
  Stethoscope,
  ChevronRight,
  Filter,
  CheckCircle2,
  X,
  ArrowRightLeft
} from 'lucide-react';
import { INITIAL_DOCTORS, CENTERS } from './constants';
import { Doctor, Shift } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'directory' | 'scheduler'>('directory');
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scheduler State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [selectedCenterId, setSelectedCenterId] = useState<string>('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [doctors, searchQuery]);

  const handleApplyShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !selectedCenterId) return;

    const newShift: Shift = {
      doctorId: selectedDoctorId,
      centerId: selectedCenterId,
      startTime,
      endTime,
      date: new Date().toISOString().split('T')[0]
    };

    setDoctors(prev => prev.map(doc => 
      doc.id === selectedDoctorId 
        ? { ...doc, currentCenterId: selectedCenterId, currentShift: newShift }
        : doc
    ));

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-slate-100 font-sans selection:bg-sky-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f172a]/80 glass px-6 py-4 flex items-center justify-between border-none">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2 rounded-lg shadow-lg shadow-sky-500/20">
            <Stethoscope className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-white">MedShift Pro</h1>
            <p className="text-[11px] text-slate-400 font-mono mt-1 uppercase tracking-wider">v1.2.0 • Personnel Registry</p>
          </div>
        </div>

        <div className="flex bg-black/20 p-1 rounded-full gap-1 border border-white/5">
          <button 
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${activeTab === 'directory' ? 'bg-white/10 text-white shadow-none border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Doctors Directory
          </button>
          <button 
            onClick={() => setActiveTab('scheduler')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${activeTab === 'scheduler' ? 'bg-white/10 text-white shadow-none border-b-2 border-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Shift Scheduler
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'directory' ? (
            <motion.div 
              key="directory"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Directory Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between glass p-4 rounded-3xl">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text"
                    placeholder="Search by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono whitespace-nowrap">
                  <Filter className="w-3.5 h-3.5 text-sky-400" />
                  Showing <span className="text-sky-400 font-bold">{filteredDoctors.length}</span> of {doctors.length} Doctors
                </div>
              </div>

              {/* Data Grid */}
              <div className="glass rounded-3xl overflow-hidden">
                <div className="grid grid-cols-[2.5fr,1.5fr,2fr,1fr] bg-white/5 border-b border-white/10 px-6 py-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Doctor Name / ID</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Specialization</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Current Center Assignment</span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Shift Status</span>
                </div>
                
                <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
                  {filteredDoctors.map((doc) => (
                    <div key={doc.id} className="grid grid-cols-[2.5fr,1.5fr,2fr,1fr] items-center px-6 py-4 hover:bg-white/5 transition-colors group cursor-default">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-mono text-sky-400">
                          {doc.name.split(' ').pop()?.charAt(0)}{doc.name.split(' ')[1]?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-100">{doc.name}</p>
                          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">{doc.id}</p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-300 font-sans">
                        {doc.specialty}
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.currentCenterId ? (
                          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
                            <Building2 className="w-3.5 h-3.5" />
                            {CENTERS.find(c => c.id === doc.currentCenterId)?.name}
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-600 italic font-sans italic">Unassigned</span>
                        )}
                      </div>
                      <div>
                        {doc.currentShift ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-tight border border-green-500/20">
                            <Clock className="w-3 h-3" />
                            {doc.currentShift.startTime} - {doc.currentShift.endTime}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-slate-500 text-[10px] font-medium uppercase tracking-tight border border-white/5">
                            Off Duty
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="scheduler"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Shift Entry Form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass rounded-3xl p-8 shadow-2xl shadow-black/20">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                    <Plus className="w-5 h-5 text-sky-400" />
                    Assign New Shift
                  </h3>
                  
                  <form onSubmit={handleApplyShift} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Select Physician</label>
                      <select 
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all text-slate-100 appearance-none"
                        required
                      >
                        <option value="" className="bg-[#1e293b]">Choose a doctor...</option>
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id} className="bg-[#1e293b]">{doc.name} ({doc.specialty})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Working Facility</label>
                      <select 
                        value={selectedCenterId}
                        onChange={(e) => setSelectedCenterId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all text-slate-100 appearance-none"
                        required
                      >
                        <option value="" className="bg-[#1e293b]">Choose a center...</option>
                        {CENTERS.map(center => (
                          <option key={center.id} value={center.id} className="bg-[#1e293b]">{center.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">Start Time</label>
                        <input 
                          type="time" 
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all text-slate-100"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-widest text-slate-500 ml-1">End Time</label>
                        <input 
                          type="time" 
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all text-slate-100"
                          required
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 active:scale-[0.98] mt-4"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                      Apply Changes to Master
                    </button>
                  </form>
                </div>

                {/* Legend/Info */}
                <div className="glass-card rounded-2xl p-6">
                  <h4 className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-2">Live Sync Active</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Applying this will automatically update your primary registry in real-time. Changes are reflected synchronously across all dashboard views.
                  </p>
                </div>
              </div>

              {/* Physician Schedule View */}
              <div className="lg:col-span-2">
                <div className="glass rounded-3xl overflow-hidden h-full flex flex-col">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                      <Calendar className="w-5 h-5 text-sky-400" />
                      Physician Shift Overview
                    </h3>
                    {selectedDoctor && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-mono text-green-400 font-bold uppercase tracking-wider tabular-nums">Sync Active</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-dots">
                    {selectedDoctor ? (
                      <div className="w-full max-w-xl">
                        <div className="mb-10">
                          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Users className="w-8 h-8 text-sky-400" />
                          </div>
                          <h4 className="text-3xl font-bold text-white tracking-tight">{selectedDoctor.name}</h4>
                          <p className="text-sm text-sky-400 mt-2 font-mono uppercase tracking-widest">{selectedDoctor.specialty}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="glass-card p-8 rounded-2xl space-y-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Facility Assignment</span>
                            <div className="flex items-center justify-center gap-3 text-lg font-bold text-white">
                              <Building2 className="w-5 h-5 text-sky-400" />
                              {selectedDoctor.currentCenterId ? CENTERS.find(c => c.id === selectedDoctor.currentCenterId)?.name : 'Not Assigned'}
                            </div>
                          </div>
                          <div className="glass-card p-8 rounded-2xl space-y-3">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Operation Window</span>
                            <div className="flex items-center justify-center gap-3 text-lg font-bold text-white">
                              <Clock className="w-5 h-5 text-sky-400" />
                              {selectedDoctor.currentShift ? `${selectedDoctor.currentShift.startTime} — ${selectedDoctor.currentShift.endTime}` : 'No Shift Data'}
                            </div>
                          </div>
                        </div>

                        {!selectedDoctor.currentCenterId && (
                          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3 text-left">
                            <X className="w-5 h-5 text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-200/70 leading-relaxed">
                              This doctor is currently <span className="text-amber-400 font-bold">Unassigned</span>. Please configure their shift parameters in the sidebar to synchronize their location data.
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6 max-w-sm">
                        <div className="w-20 h-20 glass-card rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                          <Users className="w-10 h-10 text-slate-600" />
                        </div>
                        <div className="space-y-2">
                          <h5 className="text-lg font-bold text-slate-300">No Profile Selected</h5>
                          <p className="text-slate-500 text-sm leading-relaxed px-4">
                            Select a physician from the management menu to interact with their live scheduling timeline and facility assignments.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Persistence/Feedback Overlays */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass bg-[#1e293b]/90 text-white px-8 py-3.5 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/20"
          >
            <div className="bg-green-400 rounded-full p-1">
              <CheckCircle2 className="w-4 h-4 text-slate-900" />
            </div>
            <span className="text-sm font-bold tracking-tight">Master Record Updated Locally</span>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .bg-dots {
          background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1.5px, transparent 1.5px);
          background-size: 32px 32px;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        select option {
          background-color: #1e293b;
          color: #f1f5f9;
        }
      `}</style>
    </div>
  );
}
