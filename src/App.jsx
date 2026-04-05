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
  const [students, setStudents] = useState([]); // 🔥 store all students
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 🔥 global loading
  const [activeSelection, setActiveSelection] = useState(-1);

  const navigate = useNavigate();

  // ✅ FETCH ONCE (fixes Render delay + blank screen)
  useEffect(() => {
    axios.get("https://smart-results-viewer.onrender.com/students")
      .then(res => {
        setStudents(res.data);
        setSuggestions(res.data.slice(0, 5)); // optional preview
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Server error:", err);
        setIsLoading(false);
      });
  }, []);

  // ✅ FILTER LOCALLY (FAST)
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
      setSuggestions(students.slice(0, 5)); // show default suggestions
    }
  }, [query, students]);

  // ✅ LOADING SCREEN (prevents blank page)
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

            {/* 🔍 SEARCH */}
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
                    onClick={() => { setQuery(''); }}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-white"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}

                {/* DROPDOWN */}
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
                    query.length > 1 && (
                      <div className="bg-gray-800 p-6 rounded-2xl border text-gray-400">
                        No students found for "{query}"
                      </div>
                    )
                  )}
                </div>

              </div>
            </div>

            {/* BUTTON */}
            <button 
              onClick={() => navigate('/students')}
              className="mt-10 bg-indigo-500 px-4 py-2 text-white rounded"
            >
              See All Students
            </button>

          </div>
        </div>

      </div>

      <Footer />
    </div>
  )
}