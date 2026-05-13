/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Download, Printer, ChevronLeft, ChevronRight, Briefcase, MapPin, Users, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FARMER_GROUPS, WORK_DESCRIPTIONS, MONTHLY_CONTEXT, MONTH_NAMES_BN, DAYS_BN } from './constants';

interface TourEntry {
  id: number;
  date: string;
  dayName: string;
  time: string;
  location: string;
  description: string | React.ReactNode;
  indicator: string;
  result: string | React.ReactNode;
  comment: string;
  isHoliday?: boolean;
  isMeeting?: boolean;
}

export default function App() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(2026);

  const generateReport = (month: number, year: number): TourEntry[] => {
    const entries: TourEntry[] = [];
    const context = MONTHLY_CONTEXT[month] || { crops: [], tasks: [], issue: "" };
    
    let groupIndex = (month * 10) % FARMER_GROUPS.length;

    for (let d = 1; d <= 14; d++) {
      const dateObj = new Date(year, month, d);
      const day = dateObj.getDay();
      const dayName = DAYS_BN[day];
      const dateStr = `${d}/${month + 1}/${year}`;

      if (day === 5 || day === 6) {
        entries.push({
          id: entries.length + 1,
          date: dateStr,
          dayName,
          time: "-",
          location: "সাপ্তাহিক ছুটি",
          description: "-",
          indicator: "-",
          result: "-",
          comment: "-",
          isHoliday: true
        });
        continue;
      }

      if (day === 1) {
        entries.push({
          id: entries.length + 1,
          date: dateStr,
          dayName,
          time: "০৯-০৫ ঘটিকা",
          location: "উপজেলা কৃষি অফিস, নাঙ্গলকোট",
          description: "সাপ্তাহিক বিভাগীয় সভায় অংশগ্রহণ",
          indicator: "উপস্থিতি",
          result: "সভায় অংশগ্রহণ ও নির্দেশনা গ্রহণ",
          comment: "নিয়মিত সভা",
          isMeeting: true
        });
        continue;
      }

      const slots = ["০৯-১২ ঘটিকা", "১২-০৩ ঘটিকা", "০৩-০৫ ঘটিকা"];
      slots.forEach((slot, sIdx) => {
        const isFIAC = sIdx === 2;
        const group = isFIAC ? "ফিয়াক সেন্টার (FIAC)" : FARMER_GROUPS[groupIndex % FARMER_GROUPS.length];
        
        // Pick 2-3 points
        const dailyCrops = context.crops.join(", ");
        const dailyTasks = [
          context.tasks[sIdx % context.tasks.length] || context.tasks[0],
          WORK_DESCRIPTIONS[(groupIndex + sIdx) % WORK_DESCRIPTIONS.length]
        ];

        const description = isFIAC 
          ? "কৃষক পরামর্শ ও তথ্য সেবা প্রদান" 
          : (
            <ul className="list-disc pl-4 space-y-1">
              <li>{dailyCrops}-এর {dailyTasks[0]}</li>
              <li>{dailyTasks[1]}</li>
              {(d + sIdx) % 2 === 0 && <li>আধুনিক কৃষি প্রযুক্তি প্রদর্শন ও উঠান বৈঠক</li>}
            </ul>
          );

        const result = isFIAC
          ? "সফলভাবে কৃষক পরামর্শ প্রদান সম্পন্ন।"
          : (
            <ul className="list-disc pl-4 space-y-1">
              <li>{dailyCrops}-এর ওপর আধুনিক চাষ পদ্ধতি আলোকপাত।</li>
              <li>{dailyTasks[0]} বিষয়ে কৃষকদের উদ্বুদ্ধকরণ।</li>
              <li>{context.issue} নিয়ে বিস্তারিত আলোচনা।</li>
            </ul>
          );

        entries.push({
          id: entries.length + 1,
          date: sIdx === 0 ? dateStr : "",
          dayName: sIdx === 0 ? dayName : "",
          time: slot,
          location: group,
          description: description,
          indicator: "সম্পন্ন",
          result: result,
          comment: "সন্তোষজনক"
        });

        if (!isFIAC) {
          groupIndex++;
        }
      });
    }

    return entries;
  };

  const currentReport = useMemo(() => generateReport(selectedMonth, selectedYear), [selectedMonth, selectedYear]);

  const exportToExcel = () => {
    const table = document.getElementById('tour-table');
    if (!table) return;

    const html = table.outerHTML;
    const url = 'data:application/vnd.ms-excel,' + encodeURIComponent(html);
    const downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    downloadLink.href = url;
    downloadLink.download = `Tour_Schedule_${MONTH_NAMES_BN[selectedMonth]}.xls`;
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = () => {
    const table = document.getElementById('tour-table');
    if (!table) return;

    const range = document.createRange();
    range.selectNode(table);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
    window.getSelection()?.removeAllRanges();
    alert('টেবিলটি কপি হয়েছে! এখন আপনি এটি Excel-এ পেস্ট করতে পারবেন।');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-600 rounded-xl text-white">
              <Calendar size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">পাক্ষিক ভ্রমণসূচি ও বাস্তব ফলাফল</h1>
              <p className="text-slate-500">উপজেলা কৃষি অফিস, নাঙ্গলকোট, কুমিল্লা</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Download size={18} />
              <span>Excel ডাউনলোড করুন</span>
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer size={18} />
              <span>প্রিন্ট করুন</span>
            </button>
          </div>
        </header>

        {/* Month Selector */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {MONTH_NAMES_BN.map((name, index) => (
            <button
              key={index}
              onClick={() => setSelectedMonth(index)}
              className={`px-6 py-2 rounded-full whitespace-nowrap transition-all border ${
                selectedMonth === index 
                ? 'bg-green-600 border-green-600 text-white shadow-lg' 
                : 'bg-white border-slate-200 text-slate-600 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Seasonal Info Card */}
        <motion.div 
          key={selectedMonth}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3"
        >
          <div className="text-amber-600">
            <Briefcase size={24} />
          </div>
          <div>
            <span className="font-semibold text-amber-800">{MONTH_NAMES_BN[selectedMonth]} মাসের বিশেষ লক্ষ্যমাত্রা: </span>
            <span className="text-amber-700">{MONTHLY_CONTEXT[selectedMonth]?.issue} মাসভিত্তিক কৃষি কার্যক্রম।</span>
          </div>
        </motion.div>

        {/* Report Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMonth}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200"
          >
            {/* Table Area */}
            <div className="overflow-x-auto print:overflow-visible">
              <table id="tour-table" className="w-full text-sm text-left border-collapse print:text-[10pt]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="p-3 border">ক্রঃ নং</th>
                    <th className="p-3 border">তারিখ ও বার</th>
                    <th className="p-3 border">সময়</th>
                    <th className="p-3 border">পরিদর্শনের স্থান ও কৃষক দল</th>
                    <th className="p-3 border">কাজের বিবরণ</th>
                    <th className="p-3 border">কর্মসম্পাদনের নির্দেশক</th>
                    <th className="p-3 border">বাস্তব ফলাফল</th>
                    <th className="p-3 border">মন্তব্য</th>
                  </tr>
                </thead>
                <tbody>
                  {currentReport.map((entry) => (
                    <tr 
                      key={entry.id} 
                      className={`border-b transition-colors ${
                        entry.isHoliday ? 'bg-rose-50' : 
                        entry.isMeeting ? 'bg-blue-50' : 
                        'hover:bg-slate-50'
                      }`}
                    >
                      <td className="p-3 border text-center font-mono">{entry.id}</td>
                      <td className="p-3 border font-medium">
                        {entry.date && <div>{entry.date}</div>}
                        {entry.dayName && <div className="text-xs text-slate-500 font-normal">{entry.dayName}</div>}
                      </td>
                      <td className="p-3 border text-slate-600">
                        {entry.time}
                      </td>
                      <td className="p-3 border">
                        <div className="flex items-start gap-2">
                          {!entry.isHoliday && <MapPin size={14} className="mt-1 text-slate-400 shrink-0" />}
                          <span className={entry.isHoliday ? 'italic text-rose-600 font-semibold' : ''}>
                            {entry.location}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 border">
                        {entry.description}
                      </td>
                      <td className="p-3 border text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                          entry.isHoliday ? 'border-rose-200 text-rose-500' : 
                          entry.isMeeting ? 'border-blue-200 text-blue-500' : 
                          'border-green-200 text-green-600'
                        }`}>
                          {entry.indicator}
                        </span>
                      </td>
                      <td className="p-3 border text-slate-600">
                        {entry.result}
                      </td>
                      <td className="p-3 border italic text-slate-400">
                        {entry.comment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Print Footer */}
            <div className="hidden print:block p-12 mt-8">
              <div className="flex justify-between items-center text-[11pt]">
                <div className="text-center">
                  <div className="border-t border-slate-900 pt-1 w-48">স্বাক্ষর (এসএএও)</div>
                  <div className="text-xs">নাঙ্গলকোট, কুমিল্লা</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-900 pt-1 w-48">স্বাক্ষর (এইও/এএও)</div>
                  <div className="text-xs">উপজেলা কৃষি অফিস, নাঙ্গলকোট</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-slate-900 pt-1 w-48">অনুমোদন (ইউএও)</div>
                  <div className="text-xs">উপজেলা কৃষি অফিস, নাঙ্গলকোট</div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Instructions/Help */}
        <footer className="p-6 bg-white rounded-2xl border border-slate-200 text-sm text-slate-500 space-y-3">
          <h3 className="font-semibold text-slate-700 flex items-center gap-2">
            <Clock size={16} />
            ব্যবহারবিধি ও নির্দেশনা:
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>প্রতি মাসের জন্য আলাদা পাক্ষিক (১-১৪ তারিখ) ভ্রমণসূচি এবং ফলাফল এখানে পাওয়া যাবে।</li>
            <li>উপরে মাসের নামের উপর ক্লিক করে নির্দিষ্ট মাসের রিপোর্ট দেখুন।</li>
            <li>“Excel এ কপি করুন” বাটনে ক্লিক করে টেবিলটি কপি করে Excel ফাইলে পেস্ট করা যাবে।</li>
            <li>“প্রিন্ট করুন” বাটনে ক্লিক করলে সরাসরি অফিসিয়াল ফরমেটে প্রিন্ট কপি পাওয়া যাবে।</li>
            <li>প্রতি সোমবারে উপজেলা অফিসে সাপ্তাহিক সভায় অংশগ্রহণের তথ্য অটোমেটিক যোগ করা হয়েছে।</li>
            <li>শুক্রবার ও শনিবার সাপ্তাহিক ছুটি হিসেবে সংরক্ষিত।</li>
          </ul>
        </footer>
      </div>

      {/* Styled Print Fixes */}
      <style>{`
        @media print {
          body { background: white !important; padding: 0 !important; }
          .min-h-screen { background: white !important; padding: 0 !important; }
          header, .overflow-x-auto.pb-2, .bg-amber-50, footer { display: none !important; }
          .bg-white { box-shadow: none !important; border: none !important; }
          table { width: 100% !important; border: 1px solid black !important; }
          th, td { border: 1px solid black !important; color: black !important; }
          .bg-rose-50, .bg-blue-50 { background: transparent !important; }
          .text-rose-600, .text-blue-600 { color: black !important; font-weight: normal !important; }
          .print\\:text-\\[10pt\\] { font-size: 10pt !important; }
        }
      `}</style>
    </div>
  );
}
