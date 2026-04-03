import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Loader2, X } from 'lucide-react';

import Footer from '../components/Footer';

export default function StudentsList() {
  const [allStudents, setAllStudents] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const res = await axios.get('https://smart-results-viewer.onrender.com/students');
        
        // FIX DUPLICATES: Use a Map to ensure unique IDs only
        const uniqueMap = new Map();
        res.data.forEach(student => {
          uniqueMap.set(student.id, student);
        });

        // Convert Map back to array and sort
        const uniqueList = Array.from(uniqueMap.values()).sort((a, b) => 
          a.name.localeCompare(b.name)
        );

        setAllStudents(uniqueList);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filter logic remains client-side for accuracy
  const filteredStudents = allStudents.filter(student => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      student.name.toLowerCase().includes(term) ||
      student.indexNumber.toLowerCase().includes(term) ||
      student.major.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      
      {/* SOLID STICKY HEADER */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-white/10 px-6 py-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')} 
              className="p-2 hover:bg-white/5 rounded-full transition-colors group"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-white" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-white">Student Directory</h1>
          </div>

          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search directory..."
              className="w-full bg-black border border-white/10 rounded-xl py-2.5 pl-11 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT GRID */}
      <main className="max-w-6xl mx-auto px-6 pt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-500 h-10 w-10" />
            <p className="mt-4 text-gray-400">Syncing data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id} // Essential for React reconciliation
                  onClick={() => navigate(`/student/${student.id}`)} 
                  className="bg-black/40 border border-white/5 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-600/5 cursor-pointer transition-all flex flex-col justify-between group h-44"
                >
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-indigo-400 transition-colors truncate">
                      {student.name}
                    </h3>
                    <p className="text-gray-400 text-xs mt-1 uppercase tracking-wider">{student.major}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-xs font-mono text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-md border border-indigo-500/20">
                      ID: {student.indexNumber}
                    </span>
                    <span className="text-indigo-500 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                      View Report →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredStudents.length === 0 && (
              <div className="text-center py-24 bg-black/20 rounded-3xl border border-dashed border-white/10 text-gray-400">
                No students match "<span className="text-white">{searchTerm}</span>"
              </div>
            )}
          </>
        )}
      </main>

    <Footer />

    </div>
  );
}
