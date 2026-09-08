import { useState, useRef, useEffect } from 'react';
import { Mic, Send, Volume2, User, Sparkles, AlertCircle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const UI_TRANSLATIONS = {
  English: {
    greeting: "How can I help you today?",
    placeholder: "Message Sethu...",
    disclaimer: "Sethu can make mistakes. Consider verifying scheme details with official sources.",
    examples: [
      "Am I eligible for PM Kisan?",
      "What documents do I need for Ayushman Bharat?",
      "Tell me about Sukanya Samriddhi Yojana.",
      "Can I apply for PM Awas Yojana if I already own a house?"
    ],
    langCode: 'en-IN'
  },
  Hindi: {
    greeting: "आज मैं आपकी कैसे मदद कर सकता हूँ?",
    placeholder: "सेतु को संदेश भेजें...",
    disclaimer: "सेतु से गलतियां हो सकती हैं। आधिकारिक स्रोतों से योजना विवरण सत्यापित करने पर विचार करें।",
    examples: [
      "क्या मैं पीएम किसान के लिए पात्र हूँ?",
      "आयुष्मान भारत के लिए मुझे किन दस्तावेजों की आवश्यकता है?",
      "मुझे सुकन्या समृद्धि योजना के बारे में बताएं।",
      "अगर मेरे पास पहले से घर है तो क्या मैं पीएम आवास योजना के लिए आवेदन कर सकता हूँ?"
    ],
    langCode: 'hi-IN'
  },
  Bengali: {
    greeting: "আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    placeholder: "সেতুকে বার্তা দিন...",
    disclaimer: "সেতু ভুল করতে পারে। অফিসিয়াল উৎস দিয়ে স্কিমের বিবরণ যাচাই করুন।",
    examples: [
      "আমি কি পিএম কিষানের যোগ্য?",
      "আয়ুষ্মান ভারতের জন্য কী কী নথি প্রয়োজন?",
      "সুকন্যা সমৃদ্ধি যোজনা সম্পর্কে বলুন।",
      "আমার যদি আগে থেকেই একটি বাড়ি থাকে তবে কি আমি পিএম আবাস যোজনার জন্য আবেদন করতে পারি?"
    ],
    langCode: 'bn-IN'
  },
  Telugu: {
    greeting: "ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?",
    placeholder: "సేతుకి సందేశం పంపండి...",
    disclaimer: "సేతు తప్పులు చేయవచ్చు. అధికారిక మూలాలతో వివరాలను ధృవీకరించండి.",
    examples: [
      "నేను పీఎం కిసాన్ కి అర్హుడినా?",
      "ఆయుష్మాన్ భారత్ కోసం నాకు ఏయే పత్రాలు కావాలి?",
      "సుకున్య సమృద్ధి యోజన గురించి చెప్పండి.",
      "నాకు ఇప్పటికే ఇల్లు ఉంటే నేను పీఎం ఆవాస్ యోజనకి దరఖాస్తు చేయవచ్చా?"
    ],
    langCode: 'te-IN'
  },
  Marathi: {
    greeting: "आज मी तुम्हाला कशी मदत करू शकतो?",
    placeholder: "सेतूला संदेश पाठवा...",
    disclaimer: "सेतूकडून चुका होऊ शकतात. अधिकृत स्रोतांद्वारे योजनांचे तपशील तपासा.",
    examples: [
      "मी पीएम किसानसाठी पात्र आहे का?",
      "आयुष्मान भारतसाठी मला कोणती कागदपत्रे लागतील?",
      "मला सुकन्या समृद्धी योजनेबद्दल सांगा.",
      "माझ्याकडे आधीच घर असल्यास मी पीएम आवास योजनेसाठी अर्ज करू शकतो का?"
    ],
    langCode: 'mr-IN'
  },
  Tamil: {
    greeting: "இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    placeholder: "சேதுவிற்கு செய்தி அனுப்பவும்...",
    disclaimer: "சேது தவறுகளைச் செய்யலாம். அதிகாரப்பூர்வ ஆதாரங்களுடன் திட்ட விவரங்களைச் சரிபார்க்கவும்.",
    examples: [
      "நான் பிஎம் கிசானுக்கு தகுதியானவனா?",
      "ஆயுஷ்மான் பாரதத்திற்கு எனக்கு என்ன ஆவணங்கள் தேவை?",
      "சுகன்யா சம்ரித்தி யோஜனா பற்றி எனக்குச் சொல்லுங்கள்.",
      "எனக்கு ஏற்கனவே சொந்தமாக வீடு இருந்தால் பிஎம் ஆவாஸ் யோஜனாவுக்கு விண்ணப்பிக்க முடியுமா?"
    ],
    langCode: 'ta-IN'
  },
  Urdu: {
    greeting: "میں آج آپ کی کیا مدد کر سکتا ہوں؟",
    placeholder: "سیتو کو پیغام بھیجیں...",
    disclaimer: "سیتو غلطیاں کر سکتا ہے۔ سرکاری ذرائع سے اسکیم کی تفصیلات کی تصدیق کریں۔",
    examples: [
      "کیا میں پی ایم کسان کے لیے اہل ہوں؟",
      "آیوشمان بھارت کے لیے مجھے کن دستاویزات کی ضرورت ہے؟",
      "مجھے سکنیا سمردھی یوجنا کے بارے میں بتائیں۔",
      "اگر میرے پاس پہلے سے گھر ہے تو کیا میں پی ایم آواس یوجنا کے لیے درخواست دے سکتا ہوں؟"
    ],
    langCode: 'ur-IN'
  },
  Gujarati: {
    greeting: "આજે હું તમારી કેવી રીતે મદદ કરી શકું?",
    placeholder: "સેતુને સંદેશ મોકલો...",
    disclaimer: "સેતુ ભૂલો કરી શકે છે. સત્તાવાર સ્ત્રોતો સાથે યોજનાની વિગતો ચકાસો.",
    examples: [
      "શું હું પીએમ કિસાન માટે પાત્ર છું?",
      "આયુષ્માન ભારત માટે મારે કયા દસ્તાવેજો જોઈએ?",
      "મને સુકન્યા સમૃદ્ધિ યોજના વિશે કહો.",
      "જો મારી પાસે પહેલેથી જ ઘર હોય તો શું હું પીએમ આવાસ યોજના માટે અરજી કરી શકું?"
    ],
    langCode: 'gu-IN'
  },
  Kannada: {
    greeting: "ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    placeholder: "ಸೇತುಗೆ ಸಂದೇಶ ಕಳುಹಿಸಿ...",
    disclaimer: "ಸೇತು ತಪ್ಪುಗಳನ್ನು ಮಾಡಬಹುದು. ಅಧಿಕೃತ ಮೂಲಗಳೊಂದಿಗೆ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.",
    examples: [
      "ನಾನು ಪಿಎಂ ಕಿಸಾನ್‌ಗೆ ಅರ್ಹನೇ?",
      "ಆಯುಷ್ಮಾನ್ ಭಾರತ್‌ಗೆ ನನಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?",
      "ಸುಕನ್ಯಾ ಸಮೃದ್ಧಿ ಯೋಜನೆ ಬಗ್ಗೆ ನನಗೆ ತಿಳಿಸಿ.",
      "ನನಗೆ ಈಗಾಗಲೇ ಮನೆ ಇದ್ದರೆ ಪಿಎಂ ಆವಾಸ್ ಯೋಜನೆಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಬಹುದೇ?"
    ],
    langCode: 'kn-IN'
  },
  Malayalam: {
    greeting: "ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കും?",
    placeholder: "സേതുവിനു സന്ദേശം അയക്കുക...",
    disclaimer: "സേതുവിന് തെറ്റുകൾ പറ്റിയേക്കാം. ഔദ്യോഗിക ഉറവിടങ്ങൾ വഴി വിശദാംശങ്ങൾ പരിശോധിക്കുക.",
    examples: [
      "ഞാൻ പിഎം കിസാന് അർഹനാണോ?",
      "ആയുഷ്മാൻ ഭാരതിന് എനിക്ക് എന്തൊക്കെ രേഖകൾ വേണം?",
      "സുകന്യ സമൃദ്ധി യോജനയെക്കുറിച്ച് പറയുക.",
      "എനിക്ക് ഇതിനകം സ്വന്തമായി വീടുണ്ടെങ്കിൽ പിഎം ആവാസ് യോജനയ്ക്ക് അപേക്ഷിക്കാമോ?"
    ],
    langCode: 'ml-IN'
  },
  Punjabi: {
    greeting: "ਮੈਂ ਅੱਜ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    placeholder: "ਸੇਤੂ ਨੂੰ ਸੁਨੇਹਾ ਭੇਜੋ...",
    disclaimer: "ਸੇਤੂ ਗਲਤੀਆਂ ਕਰ ਸਕਦਾ ਹੈ। ਅਧਿਕਾਰਤ ਸਰੋਤਾਂ ਨਾਲ ਸਕੀਮ ਦੇ ਵੇਰਵਿਆਂ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ।",
    examples: [
      "ਕੀ ਮੈਂ ਪੀਐਮ ਕਿਸਾਨ ਲਈ ਯੋਗ ਹਾਂ?",
      "ਆਯੁਸ਼ਮਾਨ ਭਾਰਤ ਲਈ ਮੈਨੂੰ ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਲੋੜ ਹੈ?",
      "ਮੈਨੂੰ ਸੁਕੰਨਿਆ ਸਮ੍ਰਿਧੀ ਯੋਜਨਾ ਬਾਰੇ ਦੱਸੋ।",
      "ਜੇ ਮੇਰੇ ਕੋਲ ਪਹਿਲਾਂ ਹੀ ਘਰ ਹੈ ਤਾਂ ਕੀ ਮੈਂ ਪੀਐਮ ਆਵਾਸ ਯੋਜਨਾ ਲਈ ਅਰਜ਼ੀ ਦੇ ਸਕਦਾ ਹਾਂ?"
    ],
    langCode: 'pa-IN'
  },
  Odia: {
    greeting: "ଆଜି ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?",
    placeholder: "ସେତୁକୁ ମେସେଜ୍ ପଠାନ୍ତୁ...",
    disclaimer: "ସେତୁ ଭୁଲ କରିପାରେ। ସରକାରୀ ଉତ୍ସ ସହିତ ସ୍କିମ୍ ବିବରଣୀ ଯାଞ୍ଚ କରନ୍ତୁ।",
    examples: [
      "ମୁଁ ପିଏମ କିଷାନ ପାଇଁ ଯୋଗ୍ୟ କି?",
      "ଆୟୁଷ୍ମାନ ଭାରତ ପାଇଁ ମୋତେ କେଉଁ ଦଲିଲ ଆବଶ୍ୟକ?",
      "ସୁକନ୍ୟା ସମୃଦ୍ଧି ଯୋଜନା ବିଷୟରେ ମୋତେ କୁହନ୍ତୁ।",
      "ଯଦି ମୋର ପୂର୍ବରୁ ଘର ଅଛି ତେବେ ମୁଁ ପିଏମ୍ ଆବାସ ଯୋଜନା ପାଇଁ ଆବେଦନ କରିପାରିବି କି?"
    ],
    langCode: 'or-IN'
  }
};

type Language = keyof typeof UI_TRANSLATIONS;

export default function App() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('sethu_chat_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
    return [
      { role: 'assistant', content: 'Hello! I am Sethu, your assistant for Indian government welfare schemes. How can I help you today? \n\n नमस्ते! मैं सेतु हूँ। मैं आपकी कैसे मदद कर सकता हूँ? \n\n வணக்கம்! நான் சேது, நான் உங்களுக்கு எப்படி உதவ முடியும்?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('English');
  const [isListening, setIsListening] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const currentUI = UI_TRANSLATIONS[language];
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('sethu_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, language })
      });
      
      const data = await response.json();
      if (response.ok && data.answer) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        speak(data.answer, language);
      } else {
        const errorMsg = data.error || 'Sorry, an error occurred.';
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ **Notice:** ${errorMsg}` }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string, lang: string) => {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLangCode = (UI_TRANSLATIONS as any)[lang]?.langCode || currentUI.langCode || 'en-IN';
    utterance.lang = targetLangCode;
    utterance.rate = speechRate;
    
    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      
      const baseLang = targetLangCode.split('-')[0];
      
      let targetVoice: SpeechSynthesisVoice | undefined;
      if (lang === 'Tamil') {
        targetVoice = voices.find(v => 
          v.name.includes('ta-IN-ValluvarNeural') || 
          v.name.includes('Valluvar')
        );
      }

      if (!targetVoice) {
        targetVoice = 
          voices.find(v => v.lang.replace('_', '-') === targetLangCode) || 
          voices.find(v => v.lang.replace('_', '-').startsWith(`${baseLang}-`)) ||
          voices.find(v => v.lang.replace('_', '-') === baseLang) ||
          voices.find(v => v.name.toLowerCase().includes(lang.toLowerCase()));
      }
      
      if (!targetVoice && baseLang === 'ur') {
         targetVoice = voices.find(v => v.lang.toLowerCase().includes('ur'));
      }

      if (targetVoice) {
        utterance.voice = targetVoice;
        window.speechSynthesis.speak(utterance);
      } else {
        if (baseLang !== 'en') {
          console.warn("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
          setToastMessage(`No native speech voice installed for ${lang} (${targetLangCode}). Using default fallback voice.`);
        }
        window.speechSynthesis.speak(utterance);
      }
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.addEventListener('voiceschanged', setVoiceAndSpeak, { once: true });
    } else {
      setVoiceAndSpeak();
    }
  };

  const toggleListen = async () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setToastMessage("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
      } catch (err: any) {
        console.warn("Microphone access notice:", err?.name, err?.message);
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setToastMessage("Microphone access was denied. Please allow microphone permissions in your browser settings.");
        } else if (err?.name === 'NotFoundError' || err?.name === 'DevicesNotFoundError') {
          setToastMessage("No microphone detected. Please connect or enable an audio input device.");
        } else if (err?.name === 'NotReadableError' || err?.name === 'TrackStartError') {
          setToastMessage("Microphone is currently in use by another application or unavailable.");
        } else {
          setToastMessage("Could not access microphone. Please check your audio input settings.");
        }
        setIsListening(false);
        return;
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = currentUI.langCode || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setToastMessage(null);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        const errType = event.error;
        console.warn("Speech recognition notice:", errType);

        if (errType === 'not-allowed') {
          setToastMessage("Microphone access was denied. Please allow microphone permissions in your browser settings.");
        } else if (errType === 'audio-capture') {
          setToastMessage("Audio capture failed. Ensure your microphone is connected and not busy in another app.");
        } else if (errType === 'network') {
          setToastMessage("Network error occurred during speech recognition. Please check your connection.");
        } else if (errType !== 'no-speech' && errType !== 'aborted') {
          setToastMessage(`Voice recognition notice: ${errType}`);
        }
      };

      recognition.onend = () => setIsListening(false);
      
      recognition.start();
    } catch (e: any) {
      console.warn("Speech recognition start notice:", e);
      setIsListening(false);
      setToastMessage("Could not start voice recognition. Please try again.");
    }
  };

  const handleClearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClearChat = () => {
    const defaultGreeting = [{ role: 'assistant', content: 'Hello! I am Sethu, your assistant for Indian government welfare schemes. How can I help you today? \n\n नमस्ते! मैं सेतु हूँ। मैं आपकी कैसे मदद कर सकता हूँ? \n\n வணக்கம்! நான் சேது, நான் உங்களுக்கு எப்படி உதவ முடியும்?' }] as Message[];
    setMessages(defaultGreeting);
    localStorage.setItem('sethu_chat_messages', JSON.stringify(defaultGreeting));
    setShowClearConfirm(false);
  };

  return (
    <div className="flex flex-col h-screen bg-[#212121] text-gray-100 font-sans selection:bg-gray-700 relative">
      <header className="flex items-center justify-between px-4 py-3 bg-[#212121] sticky top-0 z-10">
        <div className="flex items-center gap-2 select-none">
          <img src="/ss.png" alt="Sethu" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
          <span className="font-semibold text-lg">Sethu</span>
        </div>
        
        <div className="flex items-center gap-2 max-w-full overflow-hidden">
          <button 
            onClick={handleClearChat}
            className="text-xs font-medium text-gray-400 hover:text-white bg-[#2f2f2f] hover:bg-[#383838] p-2 rounded-lg transition-colors flex items-center justify-center"
            title="Clear Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
          </button>
          <div className="flex bg-[#2f2f2f] rounded-lg p-1">
            <select
              value={speechRate}
              onChange={(e) => setSpeechRate(Number(e.target.value))}
              className="bg-transparent text-gray-200 outline-none border-none py-1.5 px-2 text-sm cursor-pointer hover:bg-[#383838] rounded-md"
              title="Speech Speed"
            >
              <option value={0.75} className="bg-[#2f2f2f]">0.75x</option>
              <option value={1} className="bg-[#2f2f2f]">1x</option>
              <option value={1.25} className="bg-[#2f2f2f]">1.25x</option>
              <option value={1.5} className="bg-[#2f2f2f]">1.5x</option>
              <option value={2} className="bg-[#2f2f2f]">2x</option>
            </select>
          </div>
          <div className="flex bg-[#2f2f2f] rounded-lg p-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="bg-transparent text-gray-200 outline-none border-none py-1.5 px-2 text-sm cursor-pointer hover:bg-[#383838] rounded-md"
            >
              {Object.keys(UI_TRANSLATIONS).map(lang => (
                <option key={lang} value={lang} className="bg-[#2f2f2f] text-gray-200">
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] bg-[#2a2a2a] border border-amber-500/40 text-amber-200 text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle size={18} className="text-amber-400 shrink-0" />
            <span className="truncate sm:whitespace-normal">{toastMessage}</span>
          </div>
          <button 
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-gray-400 hover:text-white shrink-0 p-1 rounded-md transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">
        {messages.length === 1 && (
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-3xl px-4 mt-20 mb-8">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 overflow-hidden border border-white/20 shadow-lg">
               <img src="/ss.png" alt="Sethu" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-medium mb-8 text-center text-white">{currentUI.greeting}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
              {currentUI.examples.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="text-left p-4 rounded-xl border border-white/10 text-gray-300 hover:bg-[#2f2f2f] transition-colors text-sm"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="w-full pb-32">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className="w-full px-4 py-6 flex justify-center"
            >
              <div className="w-full max-w-3xl flex gap-4 md:gap-6">
                {msg.role === 'assistant' ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white text-[#212121] overflow-hidden border border-white/20">
                    <img src="/ss.png" alt="Sethu" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-auto order-2 bg-[#2f2f2f] text-gray-300">
                    <User size={18} />
                  </div>
                )}
                
                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                   {msg.role === 'user' ? (
                     <div className="bg-[#2f2f2f] px-5 py-3 rounded-3xl max-w-[85%] text-gray-100 text-[15px]">
                       <p className="whitespace-pre-wrap">{msg.content}</p>
                     </div>
                   ) : (
                     <div className="text-gray-200 text-[15px] leading-7 w-full pt-1">
                        <div className="prose prose-invert prose-p:leading-relaxed max-w-none [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:text-white [&>h3]:text-base [&>h3]:font-semibold [&>ul]:list-disc [&>ul]:pl-5 [&>li]:mb-1 [&>p]:mb-4">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {idx !== 0 && (
                          <div className="flex mt-3">
                            <button 
                              onClick={() => speak(msg.content, language)} 
                              className="text-gray-400 hover:text-white transition-colors p-1"
                              title="Read aloud"
                            >
                              <Volume2 size={16} />
                            </button>
                          </div>
                        )}
                     </div>
                   )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="w-full px-4 py-6 flex justify-center">
              <div className="w-full max-w-3xl flex gap-4 md:gap-6">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white text-[#212121] overflow-hidden border border-white/20">
                    <img src="/ss.png" alt="Sethu" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center pt-1.5">
                    <div className="flex space-x-1.5 items-center h-full">
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                       <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                  </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-6">
        <div className="max-w-3xl mx-auto px-4 pb-4 md:pb-6">
          <form 
            onSubmit={e => { e.preventDefault(); handleSend(input); }} 
            className="flex items-end gap-2 bg-[#2f2f2f] rounded-[24px] px-3 pb-2 pt-3 shadow-lg focus-within:ring-1 focus-within:ring-white/20 transition-all relative"
          >
            <button
              type="button"
              onClick={toggleListen}
              className={`p-2 rounded-full flex-shrink-0 transition-all mb-0.5 ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-white'}`}
              title="Voice Input"
            >
              <Mic size={20} />
            </button>

            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder={currentUI.placeholder}
              className="flex-1 max-h-48 bg-transparent border-none outline-none text-gray-100 placeholder:text-gray-400 resize-none py-1.5 px-1 min-h-[24px]"
              rows={1}
              disabled={isLoading}
            />
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-1.5 mb-1 rounded-full bg-white text-[#212121] hover:bg-gray-200 disabled:opacity-30 disabled:bg-[#424242] disabled:text-gray-500 transition-colors flex-shrink-0 mr-0.5"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-gray-400">
            {currentUI.disclaimer}
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#2f2f2f] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-white/10">
            <h3 className="text-xl font-semibold mb-2 text-white">Clear Conversation</h3>
            <p className="text-gray-300 mb-6 text-sm">Are you sure you want to clear the conversation and start a new chat?</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium text-gray-300 hover:text-white hover:bg-[#383838] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmClearChat}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
