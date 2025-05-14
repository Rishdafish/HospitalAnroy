import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Users, FilePlus, PlusCircle, Search, FileText, Settings, Home, BarChart2, X, Upload, FileType, Mic, UserCircle } from 'lucide-react';

// Import services
import SessionService from './services/SessionService';
import PatientService from './services/PatientService';

const Dashboard = () => {
 const [activeHoverMenu, setActiveHoverMenu] = useState(null);
 const [notes, setNotes] = useState([]);
 
 // Load notes from session service
 useEffect(() => {
   // Get sessions and format them as notes
   const loadNotes = () => {
     const sessions = SessionService.getEnrichedSessions();
     
     // Convert sessions to notes format
     const formattedNotes = sessions.map(session => {
       const patient = PatientService.getPatient(session.patientId);
       
       let sessionTags = [];
       if (patient?.category) {
         sessionTags.push(patient.category.charAt(0).toUpperCase() + patient.category.slice(1));
       }
       if (session.sessionType) {
         sessionTags.push(session.sessionType.charAt(0).toUpperCase() + session.sessionType.slice(1));
       }
       
       return {
         id: session.id,
         client: patient?.name || 'Unknown',
         initial: patient?.initial || '?',
         title: session.title || 'Untitled Session',
         date: `${session.date}, ${session.startTime || ''}`,
         tags: sessionTags,
         content: "John's first visit, discussed PTSD" || 'No notes available.',
         status: session.status || 'completed',
         isNew: new Date(session.date) > new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
       };
     });
     
     setNotes(formattedNotes);
   };
   
   // Load initially
   loadNotes();
   
   // Subscribe to changes
   const unsubscribe = SessionService.subscribe(loadNotes);
   
   // Cleanup subscription
   return () => unsubscribe();
 }, []);


 // Handle hover for menu items
 const handleMouseEnter = (menuId) => {
   setActiveHoverMenu(menuId);
 };


 const handleMouseLeave = () => {
   setActiveHoverMenu(null);
 };


 return (
   <div className="flex h-screen bg-gray-50">
     {/* Left Sidebar */}
     <div className="w-16 bg-white border-r border-gray-200">
       <div className="flex flex-col items-center py-4">
         <div className="w-8 h-8 bg-gray-200 rounded-full mb-6 flex items-center justify-center">
           <span className="text-gray-700 text-sm font-medium">R</span>
         </div>
        
         <div className="mt-6 flex flex-col items-center space-y-6">
           <div className="relative" onMouseEnter={() => handleMouseEnter('home')} onMouseLeave={handleMouseLeave}>
             <a 
               href="#/"
               className="p-2 hover:bg-gray-100 rounded-full"
               style={{
                 backgroundColor: 'transparent',
                 boxShadow: 'none',
                 border: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <Home className="w-5 h-5 text-gray-600" />
             </a>
             {activeHoverMenu === 'home' && (
               <div className="absolute left-14 top-0 bg-white shadow-lg rounded-lg p-3 w-40 z-10">
                 <p className="text-sm font-medium">Home</p>
                 <p className="text-xs text-gray-500">View your dashboard</p>
               </div>
             )}
           </div>
          
           <div className="relative" onMouseEnter={() => handleMouseEnter('viewPatients')} onMouseLeave={handleMouseLeave}>
             <a 
               href="#/patients"
               className="p-2 hover:bg-gray-100 rounded-full"
               style={{
                 backgroundColor: 'transparent',
                 boxShadow: 'none',
                 border: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <Users className="w-5 h-5 text-gray-500" />
             </a>
             {activeHoverMenu === 'viewPatients' && (
               <div className="absolute left-14 top-0 bg-white shadow-lg rounded-lg p-3 w-40 z-10">
                 <p className="text-sm font-medium">Patients</p>
                 <p className="text-xs text-gray-500">View your patients</p>
               </div>
             )}
           </div>
          
           <div className="relative" onMouseEnter={() => handleMouseEnter('session')} onMouseLeave={handleMouseLeave}>
             <a 
               href="#/new-session"
               className="p-2 hover:bg-gray-100 rounded-full"
               style={{
                 backgroundColor: 'transparent',
                 boxShadow: 'none',
                 border: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <PlusCircle className="w-5 h-5 text-gray-500" />
             </a>
             {activeHoverMenu === 'session' && (
               <div className="absolute left-14 top-0 bg-white shadow-lg rounded-lg p-3 w-64 z-10">
                 <p className="text-sm font-medium">Start A Session</p>
                 <p className="text-xs text-gray-500">Capture live session, dictate, upload, or describe session</p>
               </div>
             )}
           </div>
          
           <div className="relative" onMouseEnter={() => handleMouseEnter('template')} onMouseLeave={handleMouseLeave}>
             <a 
               href="#/templates"
               className="p-2 hover:bg-gray-100 rounded-full"
               style={{
                 backgroundColor: 'transparent',
                 boxShadow: 'none',
                 border: 'none',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center'
               }}
             >
               <FileText className="w-5 h-5 text-gray-500" />
             </a>
             {activeHoverMenu === 'template' && (
               <div className="absolute left-14 top-0 bg-white shadow-lg rounded-lg p-3 w-64 z-10">
                 <p className="text-sm font-medium">Custom Templates</p>
                 <p className="text-xs text-gray-500">Manage your note templates</p>
               </div>
             )}
           </div>
         </div>
       </div>
     </div>


     {/* Main Content */}
     <div className="flex-1 flex flex-col overflow-hidden">
       {/* Header */}
       <header className="bg-white border-b border-gray-200 p-4">
         <div className="flex items-center justify-between">
           <h1 className="text-xl font-bold text-gray-800 tracking-wide">SUNDER</h1>
           <div className="flex items-center space-x-4">
             <a 
               href="#/patients"
               className="text-sm flex items-center space-x-2 px-3 py-1.5 rounded-full no-underline" 
               style={{
                 color: '#4B5563',
                 backgroundColor: 'transparent',
                 border: '1px solid #E5E7EB',
                 boxShadow: 'none',
               }}
             >
               <User className="w-4 h-4 mr-1" />
               <span>Select a client</span>
             </a>
           </div>
         </div>
       </header>


       {/* Content Area */}
       <div className="flex-1 overflow-y-auto p-6">
         <div className="mb-4">
           <h2 className="text-lg font-medium text-gray-800">Past Notes</h2>
         </div>
        
         {/* Notes List */}
         <div className="space-y-4">
           {notes.map(note => (
             <div key={note.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
               <div className="flex justify-between items-start">
                 <a href={`#/note/${note.id}`} className="flex items-center no-underline text-black">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3`}
                     style={{
                       backgroundColor: note.initial === 'J' ? '#BFDBFE' : 
                         note.initial === 'A' ? '#BBF7D0' : 
                         note.initial === 'S' ? '#FBCFE8' : 
                         note.initial === 'R' ? '#FEF3C7' : '#E5E7EB'
                     }}
                   >
                     <span className="text-sm font-medium">{note.initial}</span>
                   </div>
                   <div>
                     <div className="flex items-center flex-wrap">
                       <h3 className="font-medium text-gray-800 mr-2">{note.title}</h3>
                       {note.id === notes[0]?.id && (
                         <span className="mr-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded">New</span>
                       )}
                       {note.status === 'in-progress' && (
                         <span className="mr-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded">In Progress</span>
                       )}
                       {note.status === 'processing' && (
                         <span className="mr-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">Processing</span>
                       )}
                     </div>
                     <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content}</p>
                   </div>
                 </a>
                 <a 
                   href={`#/note/${note.id}`}
                   className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
                   style={{
                     backgroundColor: 'transparent',
                     border: 'none',
                     boxShadow: 'none',
                     display: 'flex'
                   }}
                 >
                   <FileText className="w-5 h-5" />
                 </a>
               </div>
               <div className="mt-3 flex items-center text-xs text-gray-500">
                 <Clock className="w-3 h-3 mr-1" />
                 <span>{note.date}</span>
                 <span className="mx-2">•</span>
                 <div className="flex space-x-2">
                   {note.tags.map((tag, index) => {
                     // Get tag-specific styling for more variety and appeal
                     let tagStyle;
                     switch(tag.toLowerCase()) {
                       case 'family':
                         tagStyle = 'bg-sky-100 text-sky-800';
                         break;
                       case 'emdr':
                         tagStyle = 'bg-violet-100 text-violet-800';
                         break;
                       case 'psychiatric intake':
                         tagStyle = 'bg-emerald-100 text-emerald-800';
                         break;
                       case 'psychiatric follow-up':
                         tagStyle = 'bg-teal-100 text-teal-800';
                         break;
                       case 'relationship':
                         tagStyle = 'bg-pink-100 text-pink-800';
                         break;
                       case 'dap':
                         tagStyle = 'bg-amber-100 text-amber-800';
                         break;
                       case 'soap':
                         tagStyle = 'bg-cyan-100 text-cyan-800';
                         break;
                       case 'individual':
                         tagStyle = 'bg-indigo-100 text-indigo-800';
                         break;
                       case 'therapy':
                         tagStyle = 'bg-purple-100 text-purple-800';
                         break;
                       case 'intake':
                         tagStyle = 'bg-lime-100 text-lime-800';
                         break;
                       case 'eap intake':
                         tagStyle = 'bg-orange-100 text-orange-800';
                         break;
                       case 'speech therapy':
                         tagStyle = 'bg-rose-100 text-rose-800';
                         break;
                       case 'consult':
                         tagStyle = 'bg-fuchsia-100 text-fuchsia-800';
                         break;
                       default:
                         tagStyle = 'bg-gray-100 text-gray-800';
                     }
                     
                     return (
                       <span key={index} className={`px-2 py-0.5 rounded-full text-xs ${tagStyle}`}>
                         {tag}
                       </span>
                     );
                   })}
                 </div>
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>


   </div>
 );
};


export default Dashboard;