'use client'

import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Search } from 'lucide-react';

import './App.css'
import Footer from './components/Footer';

export default function App() {

  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSelection, setActiveSelection] = useState(-1);

  const navigate = useNavigate();

  // FETCH ONCE
  useEffect(() => {
    axios.get("https://smart-results-viewer.onrender.com/students")
      .then(res => {
        setStudents(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Server error:", err);
        setIsLoading(false);
      });
  }, []);

  // FILTER LOCALLY (ONLY WHEN TYPING)
  useEffect(() => {
    if (query.trim().length > 1) {
      const lowerQuery = query.toLowerCase();

      const filtered = students.filter(s => 
        s.name.toLowerCase().includes(lowerQuery) || 
        s.indexNumber.toLowerCase().includes(lowerQuery) ||
        s.major.toLowerCase().includes(lowerQuery)
      );

      setSuggestions(filtered);
      setActiveSelection(-1);
    } else {
      setSuggestions([]); // ❗ no suggestions initially
    }
  }, [query, students]);

  // LOADING SCREEN
  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white text-xl">
        Waking up server... please wait ⏳
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="relative isolate px-6 pt-4 lg:px-8">

        <div className="mx-auto max-w-2xl py-4 sm:py-20 lg:py-24">
          
          <div className="text-center">
            <h1 className="text-5xl font-semibold text-white sm:text-7xl">
              Results enriching your academic performance
            </h1>

            {/* SEARCH */}
            <div className="mt-16 mb-10 flex justify-center w-full px-4">
              <div className="relative w-full lg:w-[75%]"> 

                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
                
                <input 
                  type="text" 
                  placeholder="Student's name/index no/course"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown') {
                      setActiveSelection(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
                    } else if (e.key === 'ArrowUp') {
                      setActiveSelection(prev => (prev > 0 ? prev - 1 : -1));
                    } else if (e.key === 'Enter') {
                      if (activeSelection >= 0) {
                        navigate(`/student/${suggestions[activeSelection].id}`);
                      } else if (suggestions.length > 0) {
                        navigate(`/student/${suggestions[0].id}`);
                      }
                    }
                  }}
                  className="w-full rounded-2xl bg-black pl-16 pr-24 py-6 text-xl text-gray-200 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {/* CLEAR BUTTON */}
                {query && (
                  <button
                    onClick={() => { 
                      setQuery(''); 
                      setSuggestions([]);
                    }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}

                {/* DROPDOWN */}
                {query.length > 1 && (
                  <div className="absolute w-full mt-3 z-50">
                    {suggestions.length > 0 ? (
                      <ul className="bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-left">
                        {suggestions.map((s, index) => (
                          <li 
                            key={s.id}
                            onMouseEnter={() => setActiveSelection(index)}
                            className={`p-6 cursor-pointer flex justify-between items-center
                              ${activeSelection === index ? 'bg-indigo-600' : 'hover:bg-indigo-600/50'}`}
                            onClick={() => navigate(`/student/${s.id}`)}
                          >
                            <div>
                              <span className="font-bold text-xl text-white">{s.name}</span>
                              <p className="text-gray-400 text-sm">{s.major}</p>
                            </div>
                            <span className="text-indigo-300 font-mono">
                              {s.indexNumber}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="bg-gray-800 p-6 rounded-2xl border text-gray-400">
                        No students found for "{query}"
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

            {/* Website's Features */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {[
                "Search by Semester/Name/Index No",
                "PDF Summaries",
                "Performance Graphs",
                "Grade Tables",
                "Color-Coded Results"
              ].map((feature) => (
                <span 
                  key={feature}
                  className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium tracking-wide shadow-sm"
                >
                  {feature}
                </span>
              ))}
            </div>


            {/* All Students Button */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
              <button 
                onClick={() => navigate('/students')}
                className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 transition-all"
              >
                See All Students
              </button>
            </div>

          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-288.75"
          />
        </div>
      </div>

    <Footer />
      
    </div>
  )
}
