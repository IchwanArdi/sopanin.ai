"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "../components/ParticleBackground";
import { 
  Send, 
  Copy, 
  MessageCircle, 
  User, 
  Briefcase, 
  Heart, 
  Coffee,
  Sparkles,
  CheckCircle2,
  Clock,
  X,
  Trash2,
  Mic,
  MicOff,
  LayoutGrid,
  Calendar,
  Save,
  Smile,
  Frown,
  Meh,
  Edit2,
  TrendingUp,
  History as HistoryIcon,
  Minimize2,
  Download
} from "lucide-react";



const PERSONAS = [
  { id: "dosen", name: "Dosen", icon: User, example: "\"pak gue mau bimbingan\"" },
  { id: "atasan", name: "Bos", icon: Briefcase, example: "\"bos gue telat nih\"" },
  { id: "orangtua", name: "Ortu", icon: Heart, example: "\"ma titip duit dong\"" },
  { id: "teman_diplomatik", name: "Temen", icon: Coffee, example: "\"bro utang kapan balik?\"" },
];

const SkeletonLoader = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-orange-500/80 uppercase tracking-widest animate-pulse">
      <Sparkles className="w-3 h-3" />
      <span>Sopanin AI sedang berpikir</span>
      <div className="dot-pulse">
        <div />
        <div />
        <div />
      </div>
    </div>
    <div className="space-y-3 relative overflow-hidden rounded-xl">
      <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full w-3/4 relative">
        <div className="absolute inset-0 ai-shimmer" />
      </div>
      <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full w-full relative">
        <div className="absolute inset-0 ai-shimmer" />
      </div>
      <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full w-5/6 relative">
        <div className="absolute inset-0 ai-shimmer" />
      </div>
      <div className="h-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-full w-1/2 relative mt-4">
        <div className="absolute inset-0 ai-shimmer" />
      </div>
    </div>
  </div>
);

const QUICK_EXAMPLES = [
  { text: "pak gue mau bimbingan besok bisa?", persona: "dosen" },
  { text: "bu maaf gue telat ngumpulin tugas", persona: "dosen" },
  { text: "bos gue sakit ga bisa masuk", persona: "atasan" },
  { text: "pak minta izin pulang cepet", persona: "atasan" },
  { text: "ma kasih duit dong lagi bokek", persona: "orangtua" },
  { text: "bro utang kemarin kapan balikin?", persona: "teman_diplomatik" },
];

// Toast Component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3"
    >
      <CheckCircle2 className="w-5 h-5 text-green-400 dark:text-green-600" />
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [canShare, setCanShare] = useState(false);
  
  // Smart Context
  const [contextInfo, setContextInfo] = useState({
    timeOfDay: '',
    dayOfWeek: '',
    isWeekend: false
  });
  
  // Tone Indicator
  const [inputTone, setInputTone] = useState(null);
  const [outputTone, setOutputTone] = useState(null);
  
  // Smart Templates
  const [customTemplates, setCustomTemplates] = useState([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  
  // Revision states
  const [revisionHistory, setRevisionHistory] = useState([]);
  const [isRevising, setIsRevising] = useState(false);
  const [showCustomRevision, setShowCustomRevision] = useState(false);
  const [customFeedback, setCustomFeedback] = useState('');
  
  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize browser features
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.share) {
      setCanShare(true);
    }
  }, []);

  // Pull to refresh (simplified)
  useEffect(() => {
    let startY = 0;
    const handleTouchStart = (e) => { startY = e.touches[0].pageY; };
    const handleTouchMove = (e) => {
      const y = e.touches[0].pageY;
      if (window.scrollY === 0 && y > startY + 150) {
        // Simple visual indicator or just reset
        if (confirm("Reset chat?")) {
          setInput("");
          setOutput("");
          if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
        }
      }
    };
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);
  
  // PWA Install Event Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log('PWA: beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if it's iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isIOS && !isStandalone) {
      setShowInstallHelp(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no prompt available, maybe show a manual help tooltip for iOS or other browsers
      setToast("Buka menu browser dan pilih 'Add to Home Screen'");
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA: User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  // Voice Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "id-ID";

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + " " + transcript : transcript));
        setIsListening(false);
        setToast("Suara berhasil direkam!");
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        setToast("Gagal merekam suara.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setToast("Browser tidak mendukung rekam suara.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      setToast("Silakan bicara...");
    }
    if (navigator.vibrate) navigator.vibrate(15);
  };

  // Smart Context Detection
  const updateContextInfo = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    let timeOfDay = 'pagi';
    if (hour >= 11 && hour < 15) timeOfDay = 'siang';
    else if (hour >= 15 && hour < 19) timeOfDay = 'sore';
    else if (hour >= 19 || hour < 5) timeOfDay = 'malam';
    
    setContextInfo({
      timeOfDay,
      dayOfWeek: ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][day],
      isWeekend: day === 0 || day === 6
    });
  };

  // Initialize context on mount
  useEffect(() => {
    updateContextInfo();
  }, []);

  // Tone Analysis (client-side for input)
  const analyzeInputTone = (text) => {
    if (!text.trim()) {
      setInputTone(null);
      return;
    }
    
    const hasGreeting = /selamat|halo|hai|assalamualaikum/i.test(text);
    const hasPoliteWords = /mohon|terima kasih|maaf|permisi|tolong/i.test(text);
    const hasRudeWords = /gue|lu|gak|nih|dong|bego|tolol/i.test(text);
    const hasShortForm = /\b(ga|gw|lo|gak|aja)\b/i.test(text);
    
    let score = 3; // neutral
    if (hasGreeting) score += 0.5;
    if (hasPoliteWords) score += 1;
    if (hasRudeWords) score -= 1.5;
    if (hasShortForm) score -= 0.5;
    
    setInputTone(Math.max(1, Math.min(5, Math.round(score))));
  };

  // Debounced tone analysis
  useEffect(() => {
    const timer = setTimeout(() => {
      analyzeInputTone(input);
    }, 500);
    return () => clearTimeout(timer);
  }, [input]);


  // Template Management
  const saveAsTemplate = () => {
    if (!input.trim() || !output.trim()) return;
    
    const templateName = prompt("Nama template (contoh: 'Izin Sakit ke Pak Budi'):");
    if (!templateName) return;
    
    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      text: input,
      persona: selectedPersona.id,
      usageCount: 0,
      lastUsed: new Date().toISOString()
    };
    
    setCustomTemplates(prev => [...prev, newTemplate]);
    setToast("Template berhasil disimpan!");
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const useCustomTemplate = (template) => {
    setInput(template.text);
    const persona = PERSONAS.find(p => p.id === template.persona);
    if (persona) setSelectedPersona(persona);
    
    // Update usage count
    setCustomTemplates(prev => prev.map(t => 
      t.id === template.id 
        ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() }
        : t
    ));
    
    setToast("Template dimuat!");
  };

  const deleteTemplate = (templateId) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
    setToast("Template dihapus!");
  };

  // Load templates from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sopanin_templates');
    if (saved) {
      try {
        setCustomTemplates(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load templates:', e);
      }
    }
  }, []);

  // Save templates to localStorage
  useEffect(() => {
    if (customTemplates.length > 0) {
      localStorage.setItem('sopanin_templates', JSON.stringify(customTemplates));
    }
  }, [customTemplates]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sopanin-history");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
    // Auto-focus on load for mobile efficiency
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Save to history
  const saveToHistory = (input, output, persona) => {
    const newEntry = {
      id: Date.now(),
      input,
      output,
      persona: persona.name,
      timestamp: new Date().toLocaleString("id-ID", { 
        day: "2-digit", 
        month: "short", 
        hour: "2-digit", 
        minute: "2-digit" 
      })
    };
    const updated = [newEntry, ...history.slice(0, 4)]; // Keep only 5 items
    setHistory(updated);
    localStorage.setItem("sopanin-history", JSON.stringify(updated));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("sopanin-history");
    setShowHistory(false);
    setToast("Riwayat dihapus!");
  };

  const handleTransform = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setOutput(""); // Clear previous output
    setOutputTone(null);
    
    // Update context before transform
    updateContextInfo();
    setRevisionHistory([]); // Clear revision history for new input
    
    // Haptic feedback (vibration) for mobile
    if (navigator.vibrate) navigator.vibrate(10);
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: input, 
          persona: selectedPersona.id,
          timeOfDay: contextInfo.timeOfDay,
          dayOfWeek: contextInfo.dayOfWeek,
          isWeekend: contextInfo.isWeekend
        }),
      });
      const data = await response.json();
      setOutput(data.output);
      setOutputTone(data.tone || null);
      saveToHistory(input, data.output, selectedPersona);
    } catch (error) {
      setOutput("Waduh error nih, coba lagi deh!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevision = async (feedbackType) => {
    if (!output) return;
    
    setIsRevising(true);
    
    const feedbackMap = {
      shorter: "Persingkat pesan ini, hapus detail yang tidak penting, maksimal 3 kalimat",
      formal: "Tingkatkan tingkat formalitas, gunakan bahasa yang lebih resmi dan hormat",
      casual: "Turunkan tingkat formalitas sedikit, tetap sopan tapi lebih hangat dan personal",
      custom: customFeedback
    };
    
    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: input,
          persona: selectedPersona.id,
          timeOfDay: contextInfo.timeOfDay,
          dayOfWeek: contextInfo.dayOfWeek,
          isWeekend: contextInfo.isWeekend,
          revisionFeedback: feedbackMap[feedbackType],
          previousOutput: output
        }),
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      // Save to revision history
      setRevisionHistory(prev => [...prev, {
        feedback: feedbackMap[feedbackType],
        output: data.output,
        timestamp: new Date().toISOString()
      }]);
      
      setOutput(data.output);
      setOutputTone(data.tone || null);
      setToast("Revisi berhasil!");
    } catch (error) {
      setToast("Gagal merevisi, coba lagi!");
    } finally {
      setIsRevising(false);
      setShowCustomRevision(false);
      setCustomFeedback('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setToast("Tersalin ke clipboard!");
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(output)}`, "_blank");
    setToast("Dibuka di WhatsApp!");
  };

  const shareResult = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Sopanin.ai - Pesan Sopan",
          text: output,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      copyToClipboard();
    }
  };

  const useQuickExample = (example) => {
    setInput(example.text);
    const persona = PERSONAS.find(p => p.id === example.persona);
    if (persona) setSelectedPersona(persona);
    setToast("Contoh dimuat!");
  };

  const useHistoryItem = (item) => {
    setInput(item.input);
    setOutput(item.output);
    const persona = PERSONAS.find(p => p.name === item.persona);
    if (persona) setSelectedPersona(persona);
    setShowHistory(false);
    setToast("Riwayat dimuat!");
  };

  // Keyboard shortcut: Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleTransform();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 mb-20 lg:mb-0 relative overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Content Wrapper */}
      <div className="relative z-10">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-orange-500/20">
              <img src="/icon.png" alt="Sopanin.ai Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-white leading-none">Sopanin.ai</h1>
              <p className="text-[10px] text-zinc-500 hidden sm:block">Chat kasar → Sopan</p>
            </div>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Template Manager Button */}
            <button
              onClick={() => setShowTemplateManager(true)}
              className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400"
            >
              <Save className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">
                Template
              </span>
              {customTemplates.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {customTemplates.length}
                </span>
              )}
            </button>

            {/* PWA Install Button (Manual) */}
            {(deferredPrompt || showInstallHelp) && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors border border-orange-500 shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">
                  Install App
                </span>
                <span className="text-xs font-bold sm:hidden">
                  Install
                </span>
              </button>
            )}

            {/* History Button */}
            <div className="relative">
              <button
              onClick={() => setShowHistory(!showHistory)}
              aria-label="Tampilkan riwayat chat"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              <Clock className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                {history.length}
              </span>
            </button>

            {/* History Dropdown */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl p-4 max-h-96 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-zinc-900 dark:text-white">Riwayat Transformasi</h3>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        aria-label="Bersihkan semua riwayat"
                        className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    )}
                  </div>
                  
                  {history.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-4">Belum ada riwayat</p>
                  ) : (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => useHistoryItem(item)}
                          className="w-full text-left p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors border border-zinc-200 dark:border-zinc-700"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-orange-600">{item.persona}</span>
                            <span className="text-xs text-zinc-400">{item.timestamp}</span>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{item.input}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
        </div>
      </header>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Sopanin.ai",
            "operatingSystem": "Web",
            "applicationCategory": "ProductivityApplication",
            "description": "Ubah chat kasar jadi sopan dalam 1 klik. Solusi etika chat Dosen, Bos, Ortu & Teman.",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.9",
              "ratingCount": "1250"
            }
          })
        }}
      />

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-12 pb-32 lg:pb-12">
        {/* Hero */}
        <div className="text-center mb-6 md:mb-10 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-zinc-900 dark:text-white mb-3 md:mb-4 leading-tight px-2">
            Ubah chat kamu jadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">sopan</span> dalam 1 klik
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-400 px-4">
            Mau chat Dosen, Bos, atau Ortu tapi bingung gimana cara yang sopan? Biar AI yang urus.
          </p>
        </div>

        {/* Quick Examples */}
        <div className="mb-6 md:mb-10 overflow-hidden">
          <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 mb-3 text-center">
            💡 Coba contoh cepat:
          </p>
          <div className="flex flex-nowrap md:flex-wrap md:justify-center gap-2 px-4 pb-2 overflow-x-auto no-scrollbar snap-x">
            {QUICK_EXAMPLES.map((example, i) => (
              <button
                key={i}
                onClick={() => useQuickExample(example)}
                className="flex-none snap-center px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 active:scale-95 whitespace-nowrap shadow-sm"
              >
                "{example.text.length > 40 ? example.text.substring(0, 40) + "..." : example.text}"
              </button>
            ))}
          </div>
          {/* Mobile indicator - optional subtle hint */}
          <div className="md:hidden flex justify-center mt-1">
            <div className="w-12 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full opacity-30 animate-pulse" />
          </div>
        </div>



        {/* Main App */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Input */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800 relative">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Ketik chat kamu:
              </label>
              <button
                onClick={toggleListening}
                aria-label={isListening ? "Berhenti mendengarkan" : "Gunakan input suara"}
                className={`flex items-center gap-1.5 px-3 py-1 scale-95 transition-all text-xs font-bold rounded-full border ${
                  isListening 
                  ? "bg-red-500 border-red-600 text-white animate-pulse" 
                  : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                {isListening ? "Mendengarkan..." : "Pake Suara"}
              </button>
            </div>
            
            {/* Context Badge & Tone Indicator */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{contextInfo.timeOfDay}</span>
                <span>•</span>
                <Calendar className="w-3.5 h-3.5" />
                <span>{contextInfo.dayOfWeek}</span>
              </div>
              
              {inputTone && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-zinc-600 dark:text-zinc-400">Tone:</span>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(level => (
                      <div 
                        key={level}
                        className={`w-5 h-1.5 rounded-sm ${
                          level <= inputTone 
                            ? inputTone <= 2 ? 'bg-red-500' 
                              : inputTone === 3 ? 'bg-yellow-500' 
                              : 'bg-green-500'
                            : 'bg-zinc-200 dark:bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`font-semibold flex items-center gap-1 ${
                    inputTone <= 2 ? 'text-red-600' : inputTone === 3 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {inputTone <= 2 ? (
                      <><Frown className="w-3.5 h-3.5" /> Kasar</>
                    ) : inputTone === 3 ? (
                      <><Meh className="w-3.5 h-3.5" /> Netral</>
                    ) : (
                      <><Smile className="w-3.5 h-3.5" /> Sopan</>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik atau pakai suara..."
              className="w-full h-32 sm:h-40 p-3 sm:p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 text-base"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-zinc-400">
                {input.length}/500 karakter
              </p>
              <p className="text-[10px] text-zinc-500 hidden sm:block">
                <kbd className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">Ctrl+Enter</kbd> to Sopan!
              </p>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Mau kirim ke siapa?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const active = selectedPersona.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPersona(p)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center min-h-[70px] ${
                        active
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                          : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-1 ${active ? "text-orange-600" : "text-zinc-500"}`} />
                      <div className={`text-xs font-semibold ${active ? "text-orange-600" : "text-zinc-600 dark:text-zinc-400"}`}>
                        {p.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleTransform}
              disabled={isLoading || !input.trim()}
              className="hidden lg:flex w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all items-center justify-center gap-2 text-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mikir dulu...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Sopanin!
                </>
              )}
            </button>
          </div>

          {/* Output */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-3">
                <span>Hasil Sopanan:</span>
                {output && outputTone && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-zinc-500">Tone:</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(level => (
                        <div 
                          key={level}
                          className={`w-4 h-1 rounded-sm ${
                            level <= outputTone ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <Smile className="w-3.5 h-3.5" /> Sopan
                    </span>
                  </div>
                )}
              </div>
              {output && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveAsTemplate}
                    className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                    title="Simpan sebagai template"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Simpan</span>
                  </button>
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Sopan ✓
                  </span>
                </div>
              )}
            </div>

            <AnimatePresence mode="wait">
              {isLoading || isRevising ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-8"
                >
                  <SkeletonLoader />
                </motion.div>
              ) : output ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 min-h-[120px]">
                    <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
                      {output}
                    </p>
                  </div>

                  {/* Revision Section */}
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <p className="text-xs text-zinc-500 mb-2 font-semibold">Perlu revisi?</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRevision('shorter')}
                        disabled={isRevising || isLoading}
                        aria-label="Revisi: Persingkat pesan"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg transition-colors text-orange-600 dark:text-orange-400 disabled:opacity-50"
                      >
                        <Minimize2 className="w-3.5 h-3.5" />
                        Lebih Singkat
                      </button>
                      
                      <button
                        onClick={() => handleRevision('formal')}
                        disabled={isRevising || isLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-950/50 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors text-purple-600 dark:text-purple-400 disabled:opacity-50"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Lebih Formal
                      </button>
                      
                      <button
                        onClick={() => handleRevision('casual')}
                        disabled={isRevising || isLoading}
                        aria-label="Revisi: Buat lebih santai"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 border border-green-200 dark:border-green-800 rounded-lg transition-colors text-green-600 dark:text-green-400 disabled:opacity-50"
                      >
                        <Smile className="w-3.5 h-3.5" />
                        Lebih Santai
                      </button>
                      
                      <button
                        onClick={() => setShowCustomRevision(!showCustomRevision)}
                        disabled={isRevising || isLoading}
                        aria-label="Revisi: Tulis feedback custom"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-950/50 border border-orange-200 dark:border-orange-800 rounded-lg transition-colors text-orange-600 dark:text-orange-400 disabled:opacity-50"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Revisi Custom
                      </button>
                    </div>
                    
                    {/* Custom Revision Input */}
                    <AnimatePresence>
                      {showCustomRevision && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-2 overflow-hidden"
                        >
                          <input
                            type="text"
                            value={customFeedback}
                            onChange={(e) => setCustomFeedback(e.target.value)}
                            placeholder="Contoh: tambahkan ucapan terima kasih di akhir"
                            className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customFeedback.trim() && !isRevising) {
                                handleRevision('custom');
                              }
                            }}
                          />
                          <button
                            onClick={() => handleRevision('custom')}
                            disabled={!customFeedback.trim() || isRevising}
                            className="w-full py-2 text-sm bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isRevising ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Merevisi...
                              </>
                            ) : 'Terapkan Revisi'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Revision History Count */}
                    {revisionHistory.length > 0 && (
                      <p className="text-[10px] text-zinc-400 mt-2 flex items-center gap-1">
                        <HistoryIcon className="w-3 h-3" />
                        Sudah direvisi {revisionHistory.length}x
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={copyToClipboard}
                      aria-label="Salin hasil ke clipboard"
                      className="py-3 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-h-[48px]"
                    >
                      <Copy className="w-4 h-4" />
                      Salin
                    </button>
                    <button
                      onClick={shareResult}
                      aria-label={canShare ? "Bagikan hasil chat" : "Kirim ke WhatsApp"}
                      className="py-3 px-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90 rounded-xl font-medium transition-all flex items-center justify-center gap-2 min-h-[48px]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      {canShare ? "Bagikan" : "WhatsApp"}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-zinc-400 dark:text-zinc-600">
                  <Sparkles className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-xs">Hasil chat sopan akan muncul di sini</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>



        {/* Footer */}
        <div className="mt-6 md:mt-12 text-center pb-4">
          <p className="text-[10px] text-zinc-400">
            Dibuat khusus untuk budaya Indonesia 🇮🇩 • Gratis & Aman
          </p>
        </div>
      </main>

      {/* Sticky Bottom Bar for Mobile */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <button
          onClick={() => setShowPersonaPicker(true)}
          className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 z-50 shadow-2xl">
        <button
          onClick={handleTransform}
          disabled={isLoading || !input.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-60 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 text-base active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sopanin...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Sopanin Sekarang!
            </>
          )}
        </button>
      </div>

      {/* Persona Quick Picker Modal */}
      <AnimatePresence>
        {showPersonaPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPersonaPicker(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] cursor-pointer"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl p-6 z-[70] border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Pilih Tujuan Chat</h3>
                <button onClick={() => setShowPersonaPicker(false)} className="p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {PERSONAS.map((p) => {
                  const Icon = p.icon;
                  const active = selectedPersona.id === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPersona(p);
                        setShowPersonaPicker(false);
                        if (navigator.vibrate) navigator.vibrate(10);
                      }}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        active
                          ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-600"
                          : "border-zinc-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                      }`}
                    >
                      <Icon className="w-8 h-8" />
                      <span className="font-bold text-sm">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}

        {/* Template Manager Modal */}
        {showTemplateManager && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplateManager(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] cursor-pointer"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              onClick={(e) => e.stopPropagation()}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl p-6 z-[70] border-t border-zinc-200 dark:border-zinc-800 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Save className="w-5 h-5 text-orange-500" />
                  Template Saya
                </h3>
                <button 
                  onClick={() => setShowTemplateManager(false)} 
                  aria-label="Tutup pengelola template"
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {customTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <Save className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Belum ada template tersimpan.
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                    Klik tombol "Simpan" setelah transform untuk menyimpan template.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customTemplates
                    .sort((a, b) => b.usageCount - a.usageCount)
                    .map((template) => {
                      const persona = PERSONAS.find(p => p.id === template.persona);
                      return (
                        <div
                          key={template.id}
                          className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700 transition-colors bg-zinc-50 dark:bg-zinc-800/50"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 mb-1">
                                {template.name}
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                                {persona && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {persona.name}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {template.usageCount}x dipakai
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => {
                                  useCustomTemplate(template);
                                  setShowTemplateManager(false);
                                }}
                                className="p-2 hover:bg-orange-100 dark:hover:bg-orange-950/30 rounded-lg transition-colors text-orange-600"
                                title="Gunakan template"
                              >
                                <Copy className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteTemplate(template.id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-950/30 rounded-lg transition-colors text-red-600"
                                title="Hapus template"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-700">
                            "{template.text}"
                          </p>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
