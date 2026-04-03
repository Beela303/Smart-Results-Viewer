'use client'

import { useState, useEffect } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { Search } from 'lucide-react';

import './App.css'

//import SplashScreen from './components/SplashScreen';
import Footer from './components/Footer';

export default function App() {

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSelection, setActiveSelection] = useState(-1);
    const navigate = useNavigate();

      useEffect(() => {
        if (query.trim().length > 1) {
          setIsLoading(true); // Start loading
          
          axios.get(`https://smart-results-viewer.onrender.com/students`)
            .then(res => {
              const lowerQuery = query.toLowerCase();
              const filtered = res.data.filter(s => 
                s.name.toLowerCase().includes(lowerQuery) || 
                s.indexNumber.toLowerCase().includes(lowerQuery) ||
                s.major.toLowerCase().includes(lowerQuery)
              );
              setSuggestions(filtered);
              setIsLoading(false); // Stop loading
            })
            .catch(err => {
              console.error("Server error:", err);
              setIsLoading(false); // Stop loading even on error
            });
        } else {
          setSuggestions([]);
          setIsLoading(false);
        }
      }, [query]);

  return (
    <div className="bg-gray-900 min-h-screen">
      <div className="relative isolate px-6 pt-4 lg:px-8">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        >
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-288.75"
          />
        </div>
        <div className="mx-auto max-w-2xl py-4 sm:py-20 lg:py-24">
          
          <div className="text-center">
            <h1 className="text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
              Results enriching your academic performance
            </h1>

             <div className="mt-16 mb-10 flex justify-center w-full px-4">
             
             <div className="relative w-full lg:w-[75%]"> 
              {/* Search button */}
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500" />
              
              {/* Search box */}
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
                      navigate(`/student/${suggestions[0].id}`); // Default to first if none selected
                    }
                  }
                }}
                className="w-full rounded-2xl bg-black pl-16 pr-24 py-6 text-xl text-gray-200 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-2xl" 
              />

              {/* LOADING SPINNER & CLEAR BUTTON CONTAINER */}
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                {/* Keyboard Hint (Only shows if there are results) */}
                {suggestions.length > 0 && !isLoading && (
                  <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono">
                    <span className="text-xs">↵</span> ENTER
                  </div>
                )}

                {/* Loading & Xmark Icon */}
                {isLoading && (
                  <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                
                {query && !isLoading && (
                  <button
                    onClick={() => { setQuery(''); setSuggestions([]); }}
                    className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
            
              {/* Autocomplete Dropdown */}
              {query.length > 1 && (
                <div className="absolute w-full mt-3 z-50">
                  {suggestions.length > 0 ? (
                    <ul className="absolute w-full bg-gray-800 mt-3 rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/10 text-left">
                      {suggestions.map((s, index) => (
                        <li 
                          key={s.id} 
                          onMouseEnter={() => setActiveSelection(index)} // Sync mouse hover with keyboard
                          className={`p-6 cursor-pointer text-white border-b border-white/5 flex justify-between items-center transition-colors 
                            ${activeSelection === index ? 'bg-indigo-600' : 'hover:bg-indigo-600/50'}`} // Highlight logic
                          onClick={() => navigate(`/student/${s.id}`)}
                        >
                          <div className="flex flex-col">
                            <span className="font-bold text-xl">{s.name}</span>
                            <span className={`${activeSelection === index ? 'text-indigo-100' : 'text-gray-400'} text-sm`}>
                              {s.major}
                            </span>
                          </div>
                          <span className={`font-mono px-4 py-2 rounded-lg border 
                            ${activeSelection === index 
                              ? 'bg-white/20 border-white/40 text-white' 
                              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'}`}>
                            {s.indexNumber}
                          </span>
                        </li>
                      ))}
                    </ul>

                  ) : (

                    /* No Results Message */
                    <div className="bg-gray-800 p-6 rounded-2xl border border-white/10 shadow-2xl text-left">
                      <p className="text-gray-400 flex items-center gap-3">
                        <XMarkIcon className="h-5 w-5 text-red-500" />
                        No students found matching <span className="text-white font-bold italic">"{query}"</span>
                      </p>
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
