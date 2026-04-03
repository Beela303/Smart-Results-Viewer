import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf'; // Corrected import
import autoTable from 'jspdf-autotable';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

import Footer from '../components/Footer';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/students/${id}`)
      .then((res) => setStudent(res.data))
      .catch(err => console.error("Error fetching student:", err));
  }, [id]);

  if (!student) return <div className="text-white p-10 text-center">Loading...</div>;

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
            if (grade === 'A') data.cell.styles.textColor = [34, 197, 94];  // Green
            if (grade === 'B') data.cell.styles.textColor = [249, 115, 22]; // Orange
            if (grade === 'C') data.cell.styles.textColor = [239, 68, 68];  // Red
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

      {/* Header Section  */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 bg-black/20 p-6 rounded-3xl border border-white/5">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold break-words">{student.name}</h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Index: {student.indexNumber} <span className="hidden sm:inline">|</span> <br className="sm:hidden" /> {student.major}
          </p>
        </div>
        <button 
          onClick={downloadPDF} 
          className="w-full sm:w-auto bg-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-all active:scale-95"
        >
          Download PDF
        </button>
      </div>

      <div className="grid gap-8 sm:gap-12">
        {(student.semesters || []).map((sem, index) => (
          <div key={index} className="space-y-6 bg-black/10 p-4 sm:p-8 rounded-3xl border border-white/5">
            <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 border-b border-white/10 pb-2">
              {sem.semesterName}
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[400px] sm:min-w-full">
                    <thead className="bg-white/5 uppercase text-xs text-gray-400">
                      <tr>
                        <th className="px-4 sm:px-6 py-4">Course</th>
                        <th className="px-4 sm:px-6 py-4">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {sem.results.map((res, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 sm:px-6 py-4 text-sm sm:text-base">{res.course}</td>
                          <td className="px-4 sm:px-6 py-4">
                            <span className={`px-3 py-1 rounded-full border text-[10px] sm:text-xs font-bold ${getGradeStyle(res.score)}`}>
                              {res.score}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Chart - Fixed height for mobile stability */}
              <div className="bg-black/20 p-4 rounded-2xl border border-white/10 h-[250px] sm:h-[300px]">
                 <Bar 
                   data={{
                     labels: sem.results.map(r => r.course),
                     datasets: [{ 
                       label: 'Score %', 
                       data: sem.results.map(r => r.score), 
                       backgroundColor: sem.results.map(r => 
                        r.score >= 80 ? '#4ade80' : r.score >= 60 ? '#fb923c' : '#f87171'
                       ),
                       borderRadius: 6
                     }]
                   }} 
                   options={{ 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { 
                        x: { ticks: { font: { size: 10 }, color: '#9ca3af' } },
                        y: { beginAtZero: true, max: 100, ticks: { font: { size: 10 }, color: '#9ca3af' }, grid: { color: '#ffffff05' } } 
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