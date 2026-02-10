
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Layout from './components/Layout';
import { BIHAR_DISTRICTS, getBlocksForDistrict } from './constants';
import { UserProfile, Caste, Education, Scheme, Sector, SchemeApplication } from './types';
import { getEligibilityAdvice, createChatSession } from './services/geminiService';
import { api } from './services/api';
import { ArrowLeft, ChevronRight, Info, LogOut, Phone, Smartphone, User, Briefcase, GraduationCap, Sprout, HardHat, Factory, UserPlus, Send, Sparkles, Loader2, Clock, Database, CheckCircle } from 'lucide-react';
import { GenerateContentResponse } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'home' | 'schemes' | 'chat' | 'notifications' | 'profile'>('home');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [eligibleSchemes, setEligibleSchemes] = useState<Scheme[]>([]);
  const [myApplications, setMyApplications] = useState<SchemeApplication[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const [chatMessages, setChatMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am SchemeSense AI. I can access our backend database to help you track your applications and check new eligibility rules.' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<any>(null);

  const [phone, setPhone] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const [regData, setRegData] = useState<Partial<UserProfile>>({
    fullName: '', age: 0, income: 0, caste: Caste.GENERAL, education: Education.NONE,
    district: BIHAR_DISTRICTS[0], block: '', sector: Sector.UNEMPLOYED, sectorDetails: {}
  });

  const blocks = useMemo(() => regData.district ? getBlocksForDistrict(regData.district) : [], [regData.district]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const loadAppData = async () => {
    try {
      setIsApiLoading(true);
      const [schemes, apps] = await Promise.all([
        api.schemes.getEligible(),
        api.applications.getMyApplications()
      ]);
      setEligibleSchemes(schemes);
      setMyApplications(apps);
    } catch (err) {
      console.error("Data fetch error:", err);
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('ss_token');
    if (token) {
      api.auth.getProfile()
        .then(u => {
          setUser(u);
          setIsLoggedIn(true);
        })
        .catch(() => localStorage.removeItem('ss_token'));
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) loadAppData();
  }, [isLoggedIn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOtpSent) {
      setIsApiLoading(true);
      try {
        const data = await api.auth.login(phone, '123456');
        if (data.user) {
          setUser(data.user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        setRegData({ ...regData, phone });
        setShowRegister(true);
      } finally {
        setIsApiLoading(false);
      }
    } else {
      setIsOtpSent(true);
    }
  };

  const handleRegistrationSubmit = async () => {
    setIsApiLoading(true);
    try {
      const data = await api.auth.register({ ...regData, password: '123456' });
      setUser(data.user);
      setIsLoggedIn(true);
      setShowRegister(false);
    } catch (err) {
      alert("Registration failed. Please check your data.");
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleApply = async (scheme: Scheme) => {
    try {
      setIsApiLoading(true);
      await api.applications.apply(scheme.id || (scheme as any)._id, scheme.title);
      const apps = await api.applications.getMyApplications();
      setMyApplications(apps);
      setSelectedScheme(null);
      alert("Application stored in MongoDB successfully!");
    } catch (err) {
      alert("Failed to apply. Database connection error.");
    } finally {
      setIsApiLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg: Message = { role: 'user', text: inputMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      if (!chatSessionRef.current) chatSessionRef.current = createChatSession(user || undefined);
      const stream = await chatSessionRef.current.sendMessageStream({ message: inputMessage });
      let fullText = '';
      setChatMessages(prev => [...prev, { role: 'model', text: '', isStreaming: true }]);
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          fullText += c.text;
          setChatMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText, isStreaming: true };
            return newMsgs;
          });
        }
      }
      setChatMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'model', text: fullText, isStreaming: false };
        return newMsgs;
      });
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', text: 'Cloud AI service currently unavailable.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGetAiAdvice = async (scheme: Scheme) => {
    if (!user) return;
    setIsLoadingAdvice(true);
    setAiAdvice(null);
    const advice = await getEligibilityAdvice(user, scheme);
    setAiAdvice(advice);
    setIsLoadingAdvice(false);
  };

  const getSectorIcon = (sector: Sector) => {
    switch (sector) {
      case Sector.AGRICULTURE: return <Sprout className="text-green-600" />;
      case Sector.STUDENT: return <GraduationCap className="text-blue-600" />;
      case Sector.CORPORATE: return <Factory className="text-gray-600" />;
      case Sector.LABORER: return <HardHat className="text-orange-600" />;
      case Sector.GOVERNMENT: return <Briefcase className="text-indigo-600" />;
      default: return <User className="text-gray-400" />;
    }
  };

  if (isApiLoading && !isLoggedIn && !showRegister) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col items-center justify-center">
        <Database className="animate-pulse text-blue-700 mb-4" size={48} />
        <p className="text-gray-500 font-medium">Communicating with Backend...</p>
      </div>
    );
  }

  if (!isLoggedIn && !showRegister) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-white flex flex-col justify-center px-8">
        <div className="text-center mb-10">
          <div className="bg-blue-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Smartphone className="text-blue-700" size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2 tracking-tight">SchemeSense</h1>
          <p className="text-gray-500">Node.js + MongoDB Secure Portal</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Mobile Number" className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none" required />
          {isOtpSent && <input type="text" placeholder="OTP (Any 6 digits)" className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none text-center" maxLength={6} required />}
          <button type="submit" className="w-full bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all">{isOtpSent ? 'Login & Sync' : 'Login via OTP'}</button>
        </form>
        <button onClick={() => setShowRegister(true)} className="mt-4 w-full text-blue-700 font-bold py-3">New Registration</button>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="min-h-screen max-w-md mx-auto bg-gray-50 flex flex-col">
        {isApiLoading && <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center font-bold text-blue-700">Writing to Database...</div>}
        <div className="p-6 bg-white border-b border-gray-100 flex items-center gap-4">
          <button onClick={() => regStep > 1 ? setRegStep(regStep - 1) : setShowRegister(false)}><ArrowLeft /></button>
          <h2 className="text-lg font-bold">Step {regStep} of 4</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {regStep === 1 && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Full Name (As per Aadhar)</label>
                <input value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} className="w-full p-4 bg-white border rounded-xl" placeholder="Full Name" />
              </div>
              <input type="number" value={regData.age || ''} onChange={e => setRegData({...regData, age: Number(e.target.value)})} className="w-full p-4 bg-white border rounded-xl" placeholder="Age" />
              <input type="number" value={regData.income || ''} onChange={e => setRegData({...regData, income: Number(e.target.value)})} className="w-full p-4 bg-white border rounded-xl" placeholder="Annual Income (₹)" />
            </>
          )}
          {regStep === 2 && (
            <>
              <select value={regData.district} onChange={e => setRegData({...regData, district: e.target.value})} className="w-full p-4 bg-white border rounded-xl">
                {BIHAR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={regData.block} onChange={e => setRegData({...regData, block: e.target.value})} className="w-full p-4 bg-white border rounded-xl">
                <option value="">Select Block</option>
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </>
          )}
          {regStep === 3 && (
            <div className="grid grid-cols-2 gap-3">
              {Object.values(Sector).map(s => (
                <button key={s} onClick={() => setRegData({...regData, sector: s})} className={`p-4 rounded-xl border-2 transition-all ${regData.sector === s ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white'}`}>
                  <div className="flex flex-col items-center gap-1">
                    {getSectorIcon(s)}
                    <span className="text-[10px] font-bold text-gray-700">{s}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          {regStep === 4 && (
            <div className="bg-white p-6 rounded-2xl border border-blue-100 text-center">
              <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
              <p className="text-sm text-gray-600">Verification ready for <b>{regData.sector}</b> profile.</p>
            </div>
          )}
        </div>
        <div className="p-6 bg-white border-t border-gray-100">
          <button onClick={() => regStep < 4 ? setRegStep(regStep + 1) : handleRegistrationSubmit()} className="w-full bg-blue-700 text-white font-bold py-4 rounded-2xl">
            {regStep === 4 ? "Finalize & Sync" : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab} title={activeTab === 'home' ? 'SchemeSense' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}>
      {activeTab === 'home' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl relative">
            <p className="text-blue-100 text-[10px] uppercase font-bold">UID: {user?._id?.slice(-8)}</p>
            <h2 className="text-2xl font-bold mt-1">{user?.fullName}</h2>
            <p className="text-xs opacity-80">{user?.block}, {user?.district}</p>
            <div className="absolute top-4 right-4 bg-white/10 p-2 rounded-xl backdrop-blur-md">
               <Database size={20} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col">
              <span className="text-blue-700 font-bold text-2xl">{eligibleSchemes.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Matched Schemes</span>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex flex-col">
              <span className="text-green-600 font-bold text-2xl">{myApplications.length}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Live Applications</span>
            </div>
          </div>

          {myApplications.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Clock size={16} className="text-orange-500" /> My Recent Requests
              </h3>
              {myApplications.slice(0, 3).map(app => (
                <div key={app._id} className="bg-white p-3.5 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-bold text-xs text-gray-800">{app.schemeTitle}</h4>
                    <p className="text-[9px] text-gray-400">Request ID: {app._id?.slice(-6)}</p>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${app.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                    {app.status}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-bold text-gray-800">Directly Eligible for You</h3>
            {eligibleSchemes.map(s => (
              <div key={s._id} onClick={() => setSelectedScheme(s)} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 active:scale-95 transition-all shadow-sm">
                <span className="text-2xl w-12 h-12 flex items-center justify-center bg-blue-50 rounded-xl">{s.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-sm leading-tight">{s.title}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{s.benefit}</p>
                </div>
                <ChevronRight className="text-gray-300" size={16} />
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex flex-col h-[calc(100vh-160px)]">
          <div className="flex-1 overflow-y-auto space-y-4 px-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-blue-700 text-white rounded-tr-none' : 'bg-white border border-gray-100 rounded-tl-none'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="mt-4 flex gap-2 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm sticky bottom-0">
            <input type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} placeholder="Ask AI anything..." className="flex-1 px-3 outline-none text-sm" />
            <button onClick={handleSendMessage} disabled={isTyping} className="bg-blue-700 text-white p-2.5 rounded-xl active:scale-90 transition-all"><Send size={18} /></button>
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white shadow-inner">{user ? getSectorIcon(user.sector) : <User />}</div>
            <h3 className="font-bold text-xl">{user?.fullName}</h3>
            <p className="text-sm text-gray-400 mt-1">Status: Verified Citizen</p>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50">
             {[
               { l: 'Phone', v: user?.phone },
               { l: 'District', v: user?.district },
               { l: 'Income', v: `₹${user?.income?.toLocaleString()}` },
               { l: 'Caste', v: user?.caste }
             ].map((it, i) => (
               <div key={i} className="flex justify-between p-4 border-b border-gray-50 last:border-0 text-xs">
                 <span className="text-gray-400 font-bold uppercase">{it.l}</span>
                 <span className="font-bold text-gray-900">{it.v}</span>
               </div>
             ))}
          </div>
          <button onClick={() => { api.auth.logout(); setIsLoggedIn(false); setUser(null); }} className="w-full py-4 bg-red-50 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 active:bg-red-100"><LogOut size={18} /> Logout</button>
        </div>
      )}

      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-md rounded-t-[40px] p-8 pb-10 shadow-2xl animate-in slide-in-from-bottom-full overflow-y-auto max-h-[90vh]">
            {isApiLoading && <div className="absolute inset-0 bg-white/50 z-10 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-blue-700 mb-2" /><span className="text-xs font-bold text-blue-900 uppercase">Processing API Call...</span></div>}
            <div className="w-12 h-1 bg-gray-100 rounded-full mx-auto mb-6"></div>
            <div className="flex justify-between items-start mb-6">
               <span className="text-5xl bg-blue-50 w-20 h-20 flex items-center justify-center rounded-3xl">{selectedScheme.icon}</span>
               <button onClick={() => { setSelectedScheme(null); setAiAdvice(null); }} className="text-gray-300 p-2 font-bold hover:text-gray-600 transition-colors">✕</button>
            </div>
            <h2 className="text-2xl font-bold mb-2 leading-tight">{selectedScheme.title}</h2>
            <div className="text-sm text-gray-600 mb-6 leading-relaxed">{selectedScheme.description}</div>
            
            <div className="space-y-6">
              <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                <div className="text-[10px] font-bold text-green-700 uppercase mb-1">Government Benefit</div>
                <div className="text-green-900 font-bold text-lg">{selectedScheme.benefit}</div>
              </div>
              
              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 text-sm mb-2 flex items-center gap-2"><Sparkles size={14} /> AI Analysis</h3>
                {aiAdvice ? <p className="text-xs text-indigo-800 leading-relaxed animate-in fade-in slide-in-from-left-2">{aiAdvice}</p> : <button onClick={() => handleGetAiAdvice(selectedScheme)} disabled={isLoadingAdvice} className="w-full py-2 bg-white text-indigo-700 font-bold rounded-lg text-xs border border-indigo-100">{isLoadingAdvice ? "Analyzing Profile..." : "Verify Document List"}</button>}
              </div>

              <button onClick={() => handleApply(selectedScheme)} disabled={isApiLoading} className="w-full bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 disabled:opacity-50 transition-all">Apply & Save to Record</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
