'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import Footer from '../components/Footer';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StudentDetail() {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // FETCH WITH ERROR + LOADING HANDLING
  useEffect(() => {
    setLoading(true);
    setError(false);

    axios.get(`https://smart-results-viewer.onrender.com/students/${id}`)
      .then((res) => {
        setStudent(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching student:", err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  // LOADING UI (handles Render sleep)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
        Loading student data... ⏳
      </div>
    );
  }

  // ERROR UI
  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white text-center px-4">
        <h2 className="text-2xl font-bold mb-4">Failed to load student</h2>
        <p className="text-gray-400 mb-6">
          The server may be waking up or unavailable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-500"
        >
          Retry
        </button>
      </div>
    );
  }

  const getGradeStyle = (score) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
    return 'bg-red-500/20 text-red-400 border-red-500/50';
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Results", 14, 20);
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Name: ${student.name}`, 14, 30);
    doc.text(`Index: ${student.indexNumber}`, 14, 37);
    doc.text(`Major: ${student.major}`, 14, 44);

    let finalY = 50;

    (student.semesters || []).forEach((sem) => {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(sem.semesterName, 14, finalY + 10);
      
      autoTable(doc, {
        startY: finalY + 15,
        head: [['Course', 'Percentage', 'Grade']],
        body: sem.results.map(r => [
          r.course, 
          `${r.score}%`, 
          r.score >= 80 ? 'A' : (r.score >= 60 ? 'B' : 'C')
        ]),
        headStyles: { fillColor: [99, 102, 241] },

        didParseCell: function(data) {
          if (data.section === 'body' && data.column.index === 2) {
            const grade = data.cell.text[0];
            if (grade === 'A') data.cell.styles.textColor = [34, 197, 94];
            if (grade === 'B') data.cell.styles.textColor = [249, 115, 22];
            if (grade === 'C') data.cell.styles.textColor = [239, 68, 68];
          }
        }
      });

      finalY = doc.lastAutoTable.finalY;
    });

    doc.save(`${student.name}_Results.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 bg-black/20 p-6 rounded-3xl border border-white/5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold break-words">{student.name}</h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Index: {student.indexNumber} <br className="sm:hidden" /> {student.major}
            </p>
          </div>

          <button 
            onClick={downloadPDF} 
            className="w-full sm:w-auto bg-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500"
          >
            Download PDF
          </button>
        </div>

        {/* SEMESTERS */}
        <div className="grid gap-8 sm:gap-12">
          {(student.semesters || []).map((sem, index) => (
            <div key={index} className="space-y-6 bg-black/10 p-4 sm:p-8 rounded-3xl border border-white/5">

              <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 border-b border-white/10 pb-2">
                {sem.semesterName}
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* TABLE */}
                <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-gray-400">
                      <tr>
                        <th className="px-6 py-4">Course</th>
                        <th className="px-6 py-4">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sem.results.map((res, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="px-6 py-4">{res.course}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full border text-xs font-bold ${getGradeStyle(res.score)}`}>
                              {res.score}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* CHART */}
                <div className="bg-black/20 p-4 rounded-2xl border border-white/10 h-[300px]">
                  <Bar 
                    data={{
                      labels: sem.results.map(r => r.course),
                      datasets: [{
                        data: sem.results.map(r => r.score),
                        backgroundColor: sem.results.map(r =>
                          r.score >= 80 ? '#4ade80' :
                          r.score >= 60 ? '#fb923c' :
                          '#f87171'
                        )
                      }]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        y: { beginAtZero: true, max: 100 }
                      }
                    }}
                  />
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}