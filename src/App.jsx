import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Moon, Layers, ChevronRight, ChevronDown, Zap, Bot, Loader2, ArrowRight, Briefcase, Coins, Heart, Users, MessageCircle, AlertTriangle, Infinity, Home, Hash, Shuffle, Lock } from 'lucide-react';
import {
  calculateLifePath, calculateNameNumber,
  calculatePersonalYear, getDetailedAnalysis
} from './utils/numerology';
import { westernDeck } from './utils/westernCards';
import { generateAIAdvice, askFollowUpQuestion, generateIndividualCardMeanings, generateNumerologyReport, generateMonthlyPredictions, generateSoulmateAnalysis, generateDailyCosmicMessage } from './utils/aiWisdom';
import { generateTransactionCode, fetchSePayAccount, getVietQRUrl, pollPaymentConfirmation, PRICE } from './utils/payment';

const useMousePosition = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, px: 0, py: 0 });
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: e.clientX,
        y: e.clientY,
        px: (e.clientX / window.innerWidth - 0.5) * 40,
        py: (e.clientY / window.innerHeight - 0.5) * 40
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  return mousePos;
};

const ShootingStars = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.5) {
        setStars(prev => [...prev.slice(-3), { id: Date.now(), x: Math.random() * 100, y: Math.random() * 40 }]);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 1, overflow: 'hidden' }}>
      <AnimatePresence>
        {stars.map(star => (
          <motion.div
            key={star.id}
            initial={{ opacity: 0, x: `${star.x}vw`, y: `${star.y}vh`, scale: 0 }}
            animate={{ opacity: [0, 1, 0], x: `${star.x - 15}vw`, y: `${star.y + 15}vh`, scale: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              position: 'absolute',
              width: '120px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)',
              transformOrigin: 'left',
              transform: 'rotate(-45deg)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const getContextualCardMeaning = (card, category) => {
  const rank = card.rank;
  const symbol = card.symbol;
  const isReversed = card.isReversed;
  const baseTone = isReversed ? 'năng lượng đang bị chặn hoặc đi chậm hơn dự tính' : 'năng lượng đang mở ra khá rõ';

  const suitTone = {
    '♥': {
      love: 'cảm xúc thật, sự quan tâm và khả năng tiến gần nhau hơn',
      career: 'mối quan hệ nơi làm việc, sự hỗ trợ và thiện cảm từ người khác',
      money: 'tiền bạc chịu ảnh hưởng bởi gia đình, cảm xúc hoặc người thân',
      future: 'một giai đoạn mềm lại, dễ có tin vui hoặc sự hàn gắn',
    },
    '♦': {
      love: 'tin nhắn, khoảng cách, sự dịch chuyển hoặc một thay đổi trong cách hai người tương tác',
      career: 'cơ hội mới, thay đổi nhịp làm việc hoặc việc cần quyết nhanh',
      money: 'dòng tiền biến động, khoản chi/thu đến nhanh và cần tính toán kỹ',
      future: 'một chuyển động mới sắp xuất hiện, nhưng cần tỉnh táo khi ra quyết định',
    },
    '♣': {
      love: 'sự ổn định, thực tế và cách hai người xây dựng niềm tin qua hành động',
      career: 'nền tảng công việc, kỹ năng, đồng nghiệp và những kết quả đến từ sự bền bỉ',
      money: 'nguồn lợi nhỏ, khả năng xoay xở và bài học về quản lý tài chính',
      future: 'kết quả đến chậm nhưng chắc, miễn là bạn đi từng bước rõ ràng',
    },
    '♠': {
      love: 'khúc mắc, im lặng, hiểu lầm hoặc cảm giác bất an cần được nói rõ',
      career: 'áp lực, cạnh tranh hoặc một trở ngại cần xử lý bằng kỷ luật',
      money: 'rủi ro hao hụt, khoản chi bất ngờ hoặc quyết định tài chính cần tránh nóng vội',
      future: 'một thử thách đang nhắc bạn thận trọng trước khi bước tiếp',
    },
  };

  const byCategory = {
    'Tình cảm': 'love',
    'Sự nghiệp': 'career',
    'Tiền bạc': 'money',
    'Tương lai': 'future',
  };

  const key = byCategory[category] || 'future';
  const theme = suitTone[symbol]?.[key] || (card.isReversed && card.meaningReversed ? card.meaningReversed : (card.meaningUpright || card.meaning));
  const direction = isReversed
    ? 'Bạn nên chậm lại, kiểm tra kỳ vọng và đừng vội kết luận.'
    : 'Bạn có thể chủ động hơn, nhưng vẫn nên quan sát tín hiệu thực tế.';

  return `Với chủ đề ${category}, lá ${rank} ${card.suit} cho thấy ${theme}; ${baseTone}. ${direction}`;
};

const FormattedText = ({ text }) => {
  if (!text) return null;
  let htmlText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #fff; font-weight: 600;">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em style="color: #cbd5e1;">$1</em>')
    .replace(/^>\s?(.*)$/gm, '<blockquote style="border-left: 3px solid var(--primary-light); padding-left: 1rem; margin: 1.5rem 0; color: var(--primary-light); font-style: italic; background: rgba(139, 92, 246, 0.05); padding: 1rem; border-radius: 0 8px 8px 0;">$1</blockquote>')
    .replace(/^- (.*)$/gm, '<li style="margin-bottom: 0.5rem; margin-left: 1.5rem; list-style-type: none; position: relative;"><span style="color: var(--primary-light); position: absolute; left: -1.2rem; top: 0.1rem; font-size: 0.8rem;">✦</span>$1</li>');

  htmlText = htmlText.replace(/(<li.*?>.*?<\/li>(\n)?)+/g, '<ul style="margin: 0.5rem 0; padding: 0;">$&</ul>');

  return <div dangerouslySetInnerHTML={{ __html: htmlText }} style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', wordBreak: 'break-word' }} />;
};

const App = () => {
  const mousePos = useMousePosition();
  const [currentView, setCurrentView] = useState('home');
  const [formData, setFormData] = useState({ name: '', dob: '' });
  const [dobParts, setDobParts] = useState({ day: '', month: '', year: '' });
  const [formError, setFormError] = useState('');
  const [numResults, setNumResults] = useState(null);
  const [numLoading, setNumLoading] = useState(false);
  const [monthlyPredictions, setMonthlyPredictions] = useState(null);

  const [westernStep, setWesternStep] = useState(1);
  const [westernConfig, setWesternConfig] = useState({ name: '', dob: '', gender: 'Nam', category: 'Tương lai', shuffleGoal: 7 });
  const [westernFormError, setWesternFormError] = useState('');
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [finalCards, setFinalCards] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState([]);
  const [aiCardMeanings, setAiCardMeanings] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // AI State
  const [aiLoading, setAiLoading] = useState({ numerology: false, western: false });
  const [chatHistory, setChatHistory] = useState({ numerology: [], western: [] });

  // Global Payment State
  const [paidFeatures, setPaidFeatures] = useState({ numerology: false, western: false, soulmate: false });
  const [showPaywall, setShowPaywall] = useState(false);
  const [payStatus, setPayStatus] = useState('idle');
  const [qrUrl, setQrUrl] = useState('');
  const [txCode, setTxCode] = useState('');
  const stopPollRef = useRef(null);
  const pendingActionRef = useRef(null);
  const pendingFeatureRef = useRef(null);

  // Soulmate State
  const [soulmateForm, setSoulmateForm] = useState({ name1: '', dob1: '', name2: '', dob2: '' });
  const [soulmateResult, setSoulmateResult] = useState(null);
  const [soulmateLoading, setSoulmateLoading] = useState(false);
  const [soulmateError, setSoulmateError] = useState('');

  // Daily Cosmic Message State
  const [showDailyMessage, setShowDailyMessage] = useState(false);
  const [dailyMessage, setDailyMessage] = useState('');
  const [dailyMessageLoading, setDailyMessageLoading] = useState(false);

  const handleDailyMessage = async () => {
    setShowDailyMessage(true);
    if (!dailyMessage) {
      setDailyMessageLoading(true);
      const msg = await generateDailyCosmicMessage();
      setDailyMessage(msg);
      setDailyMessageLoading(false);
    }
  };

  const shuffleSound = useRef(null);
  useEffect(() => {
    shuffleSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
    shuffleSound.current.volume = 0.8;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (shuffleSound.current) {
        shuffleSound.current.pause();
        shuffleSound.current = null;
      }
    };
  }, []);

  const handleNumerology = (e) => {
    e.preventDefault();

    const day = parseInt(dobParts.day, 10);
    const month = parseInt(dobParts.month, 10);
    const year = parseInt(dobParts.year, 10);

    if (!day || !month || !year) {
      setFormError('Vui lòng nhập đầy đủ ngày, tháng, năm sinh.');
      return;
    }

    if (day < 1 || day > 31) {
      setFormError('Ngày sinh không hợp lệ (1-31).');
      return;
    }

    if (month < 1 || month > 12) {
      setFormError('Tháng sinh không hợp lệ (1-12).');
      return;
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      setFormError('Năm sinh không hợp lệ.');
      return;
    }

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      setFormError('Ngày tháng năm sinh không tồn tại.');
      return;
    }

    setFormError('');

    const dob = `${year}-${dobParts.month.padStart(2, '0')}-${dobParts.day.padStart(2, '0')}`;
    const lp = calculateLifePath(dob);
    const destiny = calculateNameNumber(formData.name, 'destiny');
    const soul = calculateNameNumber(formData.name, 'soul');
    const personality = calculateNameNumber(formData.name, 'personality');
    const py = calculatePersonalYear(dob);
    const detailed = getDetailedAnalysis(lp, destiny, soul);
    setNumResults({ dob, lp, destiny, soul, personality, py, detailed });
    setMonthlyPredictions(null);
    setNumLoading(false);
    setChatHistory(prev => ({ ...prev, numerology: [] }));
    setCurrentView('numerology');
  };

  // ── Payment handlers (App-level) ──────────────────────────────────────────
  const openPaywall = async (feature, action) => {
    pendingFeatureRef.current = feature;
    pendingActionRef.current = action || null;
    setShowPaywall(true);
    setPayStatus('loading');
    try {
      const account = await fetchSePayAccount();
      const code = generateTransactionCode();
      setTxCode(code);
      setQrUrl(getVietQRUrl({
        bankId: account?.payment_bank_id || account?.bank_short_name || account?.bank_code || 'MB',
        accountNo: account?.payment_account_number || account?.account_number || account?.accountNo || '',
        amount: PRICE, description: code,
      }));
      setPayStatus('qr');
    } catch (err) {
      console.warn('Failed to fetch SePay account, using fallback:', err.message);
      const code = generateTransactionCode();
      setTxCode(code);
      setQrUrl(getVietQRUrl({
        bankId: 'BIDV',
        accountNo: '5611355650',
        amount: PRICE,
        description: code,
      }));
      setPayStatus('qr');
    }
  };

  const requirePayment = (feature, action) => {
    if (paidFeatures[feature]) { action(); return; }
    openPaywall(feature, action);
  };
  useEffect(() => {
    if (payStatus === 'qr' && txCode) {
      const stop = pollPaymentConfirmation(txCode,
        () => {
          const feature = pendingFeatureRef.current;
          if (feature) setPaidFeatures(prev => ({ ...prev, [feature]: true }));
          setShowPaywall(false); setPayStatus('idle');
          const pending = pendingActionRef.current;
          pendingActionRef.current = null;
          pendingFeatureRef.current = null;
          pending?.();
        },
        () => {
          console.log('Auto polling timed out or failed');
        }
      );
      stopPollRef.current = stop;
      return () => stop();
    }
  }, [payStatus, txCode]);

  const handlePaymentPolling = () => {
    stopPollRef.current?.(); // Dừng vòng lặp polling tự động trước đó để tránh bị đơ/trùng lặp
    setPayStatus('polling');
    const stop = pollPaymentConfirmation(txCode,
      () => {
        const feature = pendingFeatureRef.current;
        if (feature) setPaidFeatures(prev => ({ ...prev, [feature]: true }));
        setShowPaywall(false); setPayStatus('idle');
        const pending = pendingActionRef.current;
        pendingActionRef.current = null;
        pendingFeatureRef.current = null;
        pending?.();
      },
      () => setPayStatus('error')
    );
    stopPollRef.current = stop;
  };

  const handleClosePaywall = () => {
    stopPollRef.current?.();
    setShowPaywall(false); setPayStatus('idle');
    setQrUrl(''); setTxCode('');
    pendingActionRef.current = null;
    pendingFeatureRef.current = null;
  };

  const unlockNumerologyAi = () => {
    if (!numResults) return;
    requirePayment('numerology', async () => {
      setNumLoading(true);
      setMonthlyPredictions(null);
      const { lp, destiny, soul, personality, py } = numResults;
      const aiDetailed = await generateNumerologyReport({ lp, destiny, soul, personality, py });
      if (aiDetailed) {
        setNumResults(prev => ({
          ...prev,
          detailed: { ...prev.detailed, lpText: aiDetailed.lpText, destinyText: aiDetailed.destinyText }
        }));
      }
      await new Promise(r => setTimeout(r, 1500));
      const aiMonths = await generateMonthlyPredictions({ lp, destiny, py });
      if (aiMonths) setMonthlyPredictions(aiMonths);
      setNumLoading(false);
    });
  };

  const unlockWesternCardAi = () => {
    if (!finalCards.length) return;
    requirePayment('western', async () => {
      setLoadingCards(true);
      const meanings = await generateIndividualCardMeanings(finalCards, westernConfig.category, westernConfig);
      setAiCardMeanings(meanings);
      setLoadingCards(false);
    });
  };

  const startWesternReading = () => {
    const name = westernConfig.name.trim();
    const dob = westernConfig.dob.trim();
    const match = dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!name) {
      setWesternFormError('Vui lòng nhập họ tên.');
      return;
    }

    if (!match) {
      setWesternFormError('Nhập ngày sinh theo định dạng dd/mm/yyyy.');
      return;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day);
    if (
      day < 1 || day > 31 ||
      month < 1 || month > 12 ||
      year < 1900 || year > new Date().getFullYear() ||
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      setWesternFormError('Ngày sinh không hợp lệ.');
      return;
    }

    setWesternFormError('');
    setWesternStep(2);
  };

  const handleShuffle = () => {
    if (isShuffling) return;
    const nextShuffleCount = shuffleCount + 1;
    setIsShuffling(true);
    if (shuffleSound.current) {
      shuffleSound.current.currentTime = 0;
      shuffleSound.current.play().catch(() => { });
    }
    setTimeout(() => {
      setShuffleCount(nextShuffleCount);
      setIsShuffling(false);
      if (nextShuffleCount >= westernConfig.shuffleGoal) {
        const shuffled = [...westernDeck].sort(() => 0.5 - Math.random());
        setShuffledDeck(shuffled);
        setSelectedCardIndices([]);
        setTimeout(() => setWesternStep(3), 1000);
      }
    }, 600);
  };

  const handleSelectCard = (index) => {
    if (selectedCardIndices.includes(index) || selectedCardIndices.length >= 3) return;
    const newSelected = [...selectedCardIndices, index];
    setSelectedCardIndices(newSelected);

    if (newSelected.length === 3) {
      const results = newSelected.map(i => {
        const card = shuffledDeck[i];
        const shouldReverse = card.meaningReversed ? Math.random() > 0.5 : false;
        return { ...card, isReversed: shouldReverse };
      });
      setFinalCards(results);
      setChatHistory(prev => ({ ...prev, western: [] }));
      setAiCardMeanings([]);
      setLoadingCards(false);
      setTimeout(() => {
        setWesternStep(4);
      }, 1000);
    }
  };

  const resetWesternReading = () => {
    setWesternStep(1);
    setShuffleCount(0);
    setIsShuffling(false);
    setFinalCards([]);
    setShuffledDeck([]);
    setSelectedCardIndices([]);
    setAiCardMeanings([]);
    setLoadingCards(false);
    setChatHistory(prev => ({ ...prev, western: [] }));
  };

  const askAI = (type) => {
    requirePayment(type, async () => {
      setAiLoading(prev => ({ ...prev, [type]: true }));
      setChatHistory(prev => ({ ...prev, [type]: [] }));
      const data = type === 'numerology' ? { ...numResults, ...numResults.detailed } : { cards: finalCards, category: westernConfig.category, person: westernConfig };
      const advice = await generateAIAdvice(type, data);
      setChatHistory(prev => ({ ...prev, [type]: [{ role: 'ai', text: advice }] }));
      setAiLoading(prev => ({ ...prev, [type]: false }));
    });
  };

  const handleSendQuestion = (type, question) => {
    if (!question.trim()) return;
    requirePayment(type, async () => {
      const currentHistory = chatHistory[type] || [];
      const newHistory = [...currentHistory, { role: 'user', text: question }];
      setChatHistory(prev => ({ ...prev, [type]: newHistory }));
      setAiLoading(prev => ({ ...prev, [type]: true }));
      const data = type === 'numerology' ? { ...numResults, ...numResults.detailed } : { cards: finalCards, category: westernConfig.category, person: westernConfig };
      const answer = await askFollowUpQuestion(type, data, newHistory, question);
      setChatHistory(prev => ({ ...prev, [type]: [...newHistory, { role: 'ai', text: answer }] }));
      setAiLoading(prev => ({ ...prev, [type]: false }));
    });
  };

  const spreadDistance = windowWidth < 480 ? 50 : windowWidth < 768 ? 65 : 180;
  const fanWidth = windowWidth < 480 ? 210 : windowWidth < 768 ? 240 : 280;
  const fanHeight = windowWidth < 480 ? 280 : windowWidth < 768 ? 310 : 360;

  return (
    <>
      <div className="app-wrapper">
        <div className="cursor-trail" style={{ left: mousePos.x, top: mousePos.y }} />
        <ShootingStars />
        <div className="celestial-bg" style={{ transform: `translate(${mousePos.px}px, ${mousePos.py}px)`, transition: 'transform 0.1s ease-out' }}>
          <div className="nebula-glow" style={{ top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 60%)' }}></div>
          <div className="nebula-glow" style={{ bottom: '-20%', right: '-10%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 60%)' }}></div>
          <div className="stars-layer"></div>
        </div>

        <nav className="nav-premium">
          <button className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => setCurrentView('home')}>Khám Phá</button>
          <button className={`nav-link ${currentView === 'numerology' ? 'active' : ''}`} onClick={() => setCurrentView('numerology')}>Thần Số Học</button>
          <button className={`nav-link ${currentView === 'western' ? 'active' : ''}`} onClick={() => setCurrentView('western')}>Bói Bài Tây</button>
          <button className={`nav-link ${currentView === 'soulmate' ? 'active' : ''}`} onClick={() => setCurrentView('soulmate')}>Tương Hợp</button>
        </nav>

        {/* Mobile Bottom Navigation */}
        <nav className="bottom-nav">
          {[
            { id: 'home', label: 'Trang chủ', Icon: Home, activeColor: '#a78bfa' },
            { id: 'numerology', label: 'Thần số', Icon: Hash, activeColor: '#818cf8' },
            { id: 'western', label: 'Bói bài', Icon: Shuffle, activeColor: '#60a5fa' },
            { id: 'soulmate', label: 'Tương hợp', Icon: Heart, activeColor: '#f43f5e' },
          ].map(({ id, label, Icon, activeColor }) => {
            const isActive = currentView === id;
            return (
              <button
                key={id}
                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setCurrentView(id)}
              >
                <div className="bottom-nav-icon" style={isActive ? { background: `${activeColor}25`, boxShadow: `0 0 14px ${activeColor}60` } : {}}>
                  <Icon size={20} color={isActive ? activeColor : 'var(--text-dim)'} strokeWidth={isActive ? 2.5 : 1.5} />
                </div>
                <span style={{ color: isActive ? activeColor : '' }}>{label}</span>
              </button>
            );
          })}
        </nav>

        <main className="main-container">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <motion.section key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                <div style={{ minHeight: 'calc(100dvh - 70px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '1rem' }}>
                  {/* Hero */}
                  <div style={{ textAlign: 'center', padding: '0 1rem 1.25rem' }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    >
                      <h1 className="hero-title primary-gradient-text" style={{ marginBottom: '0.5rem' }}>TOMATO</h1>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>
                        Tiềm năng&nbsp;•&nbsp;Duyên số&nbsp;•&nbsp;Trực giác
                      </p>
                      <p style={{ color: 'var(--primary-light)', fontSize: '0.8rem', marginTop: '0.25rem', letterSpacing: '0.05em', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>
                        AI Spiritual Experience
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDailyMessage}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          borderRadius: '20px',
                          padding: '0.4rem 1rem',
                          marginTop: '1.25rem',
                          color: '#fff',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.2)'
                        }}
                      >
                        <span>✨</span> Thông điệp hôm nay
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Feature Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '0 1rem' }}>

                    {/* Card 1 — Thần Số Học */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
                      onClick={() => setCurrentView('numerology')}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.08) 100%)',
                        border: '1px solid rgba(139,92,246,0.3)',
                        borderRadius: '20px', padding: '1.25rem 1.25rem 1.25rem 1.5rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(139,92,246,0.4)' }}>
                        <Sparkles size={24} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>Thần Số Học</div>
                        <div style={{ color: '#555', fontSize: '0.76rem', lineHeight: 1.4, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>Giải mã chỉ số đường đời &amp; năng lượng cá nhân</div>
                      </div>
                      <ChevronRight size={18} color="rgba(139,92,246,0.8)" style={{ flexShrink: 0 }} />
                    </motion.div>

                    {/* Card 2 — Bói Bài Tây */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.18, duration: 0.4 }}
                      onClick={() => setCurrentView('western')}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(59,130,246,0.08) 100%)',
                        border: '1px solid rgba(96,165,250,0.3)',
                        borderRadius: '20px', padding: '1.25rem 1.25rem 1.25rem 1.5rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(96,165,250,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(59,130,246,0.4)' }}>
                        <Layers size={24} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>Bói Bài Tây</div>
                        <div style={{ color: '#555', fontSize: '0.76rem', lineHeight: 1.4, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>Trải 3 lá bài nhận thông điệp từ vũ trụ</div>
                      </div>
                      <ChevronRight size={18} color="rgba(96,165,250,0.8)" style={{ flexShrink: 0 }} />
                    </motion.div>

                    {/* Card 3 — Tương Hợp */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.26, duration: 0.4 }}
                      onClick={() => setCurrentView('soulmate')}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(244,63,94,0.18) 0%, rgba(236,72,153,0.08) 100%)',
                        border: '1px solid rgba(244,63,94,0.3)',
                        borderRadius: '20px', padding: '1.25rem 1.25rem 1.25rem 1.5rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem',
                        position: 'relative', overflow: 'hidden',
                      }}
                    >
                      <div style={{ position: 'absolute', top: '-30px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(244,63,94,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
                      <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'linear-gradient(135deg, #f43f5e, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(244,63,94,0.4)' }}>
                        <Heart size={24} color="#fff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>Tương Hợp Tâm Linh</div>
                        <div style={{ color: '#555', fontSize: '0.76rem', lineHeight: 1.4, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>AI phân tích nghiệp duyên &amp; cảnh báo tình cảm</div>
                      </div>
                      <ChevronRight size={18} color="rgba(244,63,94,0.8)" style={{ flexShrink: 0 }} />
                    </motion.div>

                  </div>

                  {/* Footer tagline */}
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                    style={{ textAlign: 'center', padding: '1rem 1rem 0', color: 'rgba(255,255,255,0.12)', fontSize: '10px', letterSpacing: '0.05em' }}
                  >
                    <span style={{ fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>Powered by AI&nbsp;·&nbsp;Thần số học Pythagoras</span>
                  </motion.div>

                </div>
              </motion.section>
            )}

            {currentView === 'numerology' && (
              <motion.section key="num" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {!numResults ? (
                  <div style={{ minHeight: 'calc(100dvh - 140px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 0.5rem', width: '100%' }}>
                      {/* Hero Header */}
                      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="primary-gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.35rem', lineHeight: 1.2, fontWeight: 700, whiteSpace: 'nowrap' }}>Thần Số Học</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.4 }}>Giải mã chỉ số đường đời, sứ mệnh và năng lượng năm cá nhân.</p>
                      </div>

                      <form onSubmit={handleNumerology}>
                        {/* Name field */}
                        <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '0.75rem' }}>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Họ và Tên đầy đủ (không dấu)
                          </label>
                          <input
                            type="text"
                            className="modern-input"
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '0.85rem 1rem' }}
                            placeholder="VD: NGUYEN VAN A"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        {/* DOB field */}
                        <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            Ngày tháng năm sinh
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: '0.5rem' }}>
                            {[
                              { placeholder: 'Ngày', key: 'day', min: 1, max: 31 },
                              { placeholder: 'Tháng', key: 'month', min: 1, max: 12 },
                              { placeholder: 'Năm', key: 'year', min: 1900, max: 2026 },
                            ].map(({ placeholder, key, min, max }) => (
                              <input
                                key={key}
                                type="number"
                                placeholder={placeholder}
                                value={dobParts[key]}
                                onChange={(e) => setDobParts({ ...dobParts, [key]: e.target.value })}
                                className="modern-input"
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'center', padding: '0.85rem 0.5rem' }}
                                min={min}
                                max={max}
                              />
                            ))}
                          </div>
                        </div>

                        {formError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center' }}>{formError}</p>}

                        <motion.button
                          type="submit"
                          whileTap={{ scale: 0.97 }}
                          whileHover={{ scale: 1.02 }}
                          className="app-button app-button--secondary app-button--full app-button--lg"
                        >
                          <Sparkles size={18} /> Phân Tích Ngay
                        </motion.button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="results-container" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
                    <div className="results-header flex-between">
                      <h2 className="primary-gradient-text">Kết quả phân tích</h2>
                      <button onClick={() => setNumResults(null)} className="back-btn">← Nhập lại</button>
                    </div>

                    <div className="grid-4" style={{ marginBottom: '2rem' }}>
                      <StatBox label="Đường Đời" value={numResults.lp} color="violet" />
                      <StatBox label="Sứ Mệnh" value={numResults.destiny} color="blue" />
                      <StatBox label="Linh Hồn" value={numResults.soul} color="indigo" />
                      <StatBox label="Nhân Cách" value={numResults.personality} color="purple" />
                    </div>

                    {/* Personal Year UI */}
                    <div className="glass-container highlight-box" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>Năm Cá Nhân {new Date().getFullYear()}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>Năng lượng chủ đạo bao trùm toàn bộ năm nay của bạn</p>
                      </div>
                      <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--primary-light)', textShadow: '0 0 20px rgba(139, 92, 246, 0.5)', lineHeight: 1 }}>
                        {numResults.py}
                      </div>
                    </div>

                    {/* Birth Chart & Predictions */}
                    <div className="grid-2-asym" style={{ marginBottom: '2rem', alignItems: 'start', position: 'relative' }}>

                      {/* Ambient Center Void Filler */}
                      <div style={{
                        position: 'absolute', top: '50%', left: '35%', transform: 'translate(-50%, -50%)',
                        width: '500px', height: '500px',
                        background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)',
                        filter: 'blur(60px)', pointerEvents: 'none', zIndex: -1
                      }} />
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                        style={{ position: 'absolute', top: '50%', left: '35%', width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1, opacity: 0.5, backgroundImage: 'radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.8), rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 100px, rgba(255, 255, 255, 0.6), rgba(0,0,0,0))', backgroundSize: '150px 150px' }}
                      />
                      {/* Birth Chart */}
                      <div className="glass-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 0 }}>
                        <h3 style={{ fontSize: '1.125rem', color: '#fff', marginBottom: '0.5rem' }}>Biểu đồ Chòm sao</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>Các năng lượng bẩm sinh trên lưới Pythagoras</p>
                        <BirthChart dob={numResults.dob} />
                      </div>

                      {/* Monthly Predictions */}
                      <div className="glass-container" style={{ margin: 0 }}>
                        <h3 style={{ fontSize: '1.125rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Star size={18} color="var(--primary-light)" /> Tháng Đỉnh Cao Năng Lượng
                        </h3>
                        {numLoading ? (
                          <div className="ai-loading" style={{ margin: '2rem 0' }}>
                            <Loader2 className="loader-spin" size={24} />
                            <span className="ai-loading-text">AI đang tính toán các đỉnh năng lượng...</span>
                          </div>
                        ) : !paidFeatures.numerology ? (
                          <LockedAiPanel
                            title="Mở khóa dự đoán AI"
                            description="Phần đỉnh cao năng lượng theo tháng dùng AI cá nhân hóa từ các chỉ số của bạn."
                            onUnlock={unlockNumerologyAi}
                          />
                        ) : monthlyPredictions ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* 12-Month Timeline */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', position: 'relative', padding: '0 0.5rem' }}>
                              <div style={{ position: 'absolute', top: '6px', left: '0.5rem', right: '0.5rem', height: '2px', background: 'rgba(255,255,255,0.05)', zIndex: 0 }} />
                              <div style={{ position: 'absolute', top: '6px', left: '0.5rem', width: `${((new Date().getMonth()) / 11) * 100}%`, height: '2px', background: 'linear-gradient(90deg, var(--primary-light), #ec4899)', zIndex: 0 }} />
                              {Array.from({ length: 12 }).map((_, i) => {
                                const month = i + 1;
                                const currentMonth = new Date().getMonth() + 1;
                                const isCurrent = month === currentMonth;
                                return (
                                  <div key={month} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                    {isCurrent ? (
                                      <motion.div
                                        animate={{ boxShadow: ['0 0 0px #ec4899', '0 0 15px #ec4899', '0 0 0px #ec4899'] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#ec4899', border: '2px solid #fff' }}
                                      />
                                    ) : (
                                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: month < currentMonth ? '#ec4899' : 'rgba(255,255,255,0.1)', marginTop: '3px' }} />
                                    )}
                                    <span style={{ fontSize: '0.6rem', color: isCurrent ? '#fff' : (month < currentMonth ? 'rgba(255,255,255,0.5)' : 'var(--text-dim)'), fontWeight: isCurrent ? 700 : 400 }}>
                                      T{month}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {monthlyPredictions.map((pred, i) => {
                              const Icon = i === 0 ? Briefcase : i === 1 ? Coins : Heart;
                              const color = i === 0 ? '#60a5fa' : i === 1 ? '#fcd34d' : '#f43f5e';
                              return (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '12px', borderLeft: `4px solid ${color}`, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ background: `${color}20`, padding: '0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <Icon size={20} color={color} />
                                    </div>
                                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '1.05rem', lineHeight: 1.3 }}>
                                      {pred.title}
                                    </span>
                                  </div>
                                  <div>
                                    <span style={{
                                      display: 'inline-block',
                                      whiteSpace: 'nowrap',
                                      fontSize: '0.85rem',
                                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8))',
                                      color: '#fff',
                                      padding: '0.35rem 1rem',
                                      borderRadius: '20px',
                                      fontWeight: 700,
                                      boxShadow: '0 4px 15px rgba(236, 72, 153, 0.25)',
                                      letterSpacing: '0.02em'
                                    }}>
                                      {pred.months}
                                    </span>
                                  </div>
                                  <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.6 }}>{pred.desc}</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <LockedAiPanel title="Tạo dự đoán AI" description="Tạo lại phân tích tháng và diễn giải chuyên sâu cho hồ sơ hiện tại." actionLabel="Tạo bằng AI" onUnlock={unlockNumerologyAi} unlocked />
                        )}
                      </div>
                    </div>

                    <div className="report-section">
                      <ReportCard title="Chỉ số Đường Đời" text={numResults.detailed.lpText} loading={numLoading} />
                      <ReportCard title="Chỉ số Sứ Mệnh" text={numResults.detailed.destinyText} loading={numLoading} />
                    </div>

                    <AIWisdomSection loading={aiLoading.numerology} chatHistory={chatHistory.numerology} onAsk={() => askAI('numerology')} onSendQuestion={(q) => handleSendQuestion('numerology', q)} isAIPaid={paidFeatures.numerology} />
                  </div>
                )}
              </motion.section>
            )}

            {currentView === 'soulmate' && (
              <SoulmateSection
                form={soulmateForm}
                setForm={setSoulmateForm}
                result={soulmateResult}
                setResult={setSoulmateResult}
                loading={soulmateLoading}
                setLoading={setSoulmateLoading}
                error={soulmateError}
                setError={setSoulmateError}
                isPaid={paidFeatures.soulmate}
                requirePayment={requirePayment}
              />
            )}

            {currentView === 'western' && (
              <motion.section key="western" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {westernStep === 1 && (
                  <div className="western-setup-screen" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', padding: '1rem 0' }}>
                    <div className="western-setup-shell">
                      <div className="western-setup-header">
                        <h2 className="primary-gradient-text">Bói Bài Tây</h2>
                        <p>Trải 3 lá bài, nhận thông điệp từ vũ trụ.</p>
                      </div>
                      <div className="western-setup-grid">
                        <div className="setup-panel">
                          <div className="input-group">
                            <label className="input-label">Họ và tên</label>
                            <input
                              className="modern-input"
                              placeholder="VD: Nguyễn Văn A"
                              value={westernConfig.name}
                              onChange={(e) => setWesternConfig({ ...westernConfig, name: e.target.value })}
                            />
                          </div>
                          <div className="input-group">
                            <label className="input-label">Ngày sinh</label>
                            <input
                              className="modern-input"
                              placeholder="dd/mm/yyyy"
                              value={westernConfig.dob}
                              onChange={(e) => setWesternConfig({ ...westernConfig, dob: e.target.value })}
                            />
                          </div>
                          <SelectionGroup label="Giới tính" options={['Nam', 'Nữ']} value={westernConfig.gender} onChange={(v) => setWesternConfig({ ...westernConfig, gender: v, shuffleGoal: v === 'Nam' ? 7 : 9 })} />
                          <CustomSelect
                            label="Chủ đề muốn hỏi"
                            options={['Tình cảm', 'Sự nghiệp', 'Tương lai', 'Tiền bạc']}
                            value={westernConfig.category}
                            onChange={(v) => setWesternConfig({ ...westernConfig, category: v })}
                          />
                        </div>
                        <div className="setup-instructions">
                          <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                            Giữ tâm trí tĩnh lặng, tập trung vào câu hỏi về chủ đề <strong>{westernConfig.category}</strong>.
                          </p>
                          <motion.button
                            onClick={startWesternReading}
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.02 }}
                            className="app-button app-button--secondary app-button--full app-button--lg"
                          >
                            <Layers size={18} /> Bắt đầu trải bài
                          </motion.button>
                          {westernFormError && <p style={{ color: '#ef4444', fontSize: '0.82rem', margin: '0.25rem 0 0', textAlign: 'center' }}>{westernFormError}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {westernStep === 2 && (
                  <div className="western-shuffle-screen">
                  <div className="glass-container centered shuffle-panel">
                    <div className="shuffle-header">
                      <div className="shuffle-eyebrow">Nghi thức trải bài</div>
                      <h2 className="primary-gradient-text">Đang xào bài</h2>
                      <div className="shuffle-progress-text">{shuffleCount}/{westernConfig.shuffleGoal}</div>
                      <div className="shuffle-progress-track">
                        <motion.div
                          className="shuffle-progress-fill"
                          animate={{ width: `${Math.min(100, (shuffleCount / westernConfig.shuffleGoal) * 100)}%` }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    <div className="shuffling-stage">
                      <div className="shuffle-orbit shuffle-orbit-one" />
                      <div className="shuffle-orbit shuffle-orbit-two" />
                      {Array.from({ length: 7 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={isShuffling ? {
                            x: i % 2 === 0 ? [0, -72, 28, 0] : [0, 72, -28, 0],
                            y: [0, -18, 8, -i * 2],
                            rotate: i % 2 === 0 ? [0, -9, 6, 0] : [0, 9, -6, 0],
                            scale: [1, 1.02, 1],
                          } : { x: 0, y: -i * 2, rotate: 0, scale: 1 }}
                          transition={{ duration: 0.42, ease: "easeInOut", times: [0, 0.4, 0.72, 1] }}
                          className="shuffle-card"
                          style={{ zIndex: isShuffling ? (i % 2 === 0 ? 50 + i : 50 - i) : 100 - i }}
                        >
                          <div className="shuffle-card-inner" />
                        </motion.div>
                      ))}
                    </div>
                    <button className="app-button app-button--primary app-button--pill shuffle-action" onClick={handleShuffle} disabled={isShuffling || shuffleCount >= westernConfig.shuffleGoal}>
                      {isShuffling ? 'Đang trộn...' : (shuffleCount >= westernConfig.shuffleGoal ? 'Hoàn tất' : 'Xào bài')}
                    </button>
                    <p className="shuffle-hint">Mỗi lượt xào giúp bộ bài ổn định năng lượng trước khi chọn 3 lá.</p>
                  </div>
                  </div>
                )}

                {westernStep === 3 && (
                  <div className="glass-container centered" style={{ maxWidth: '1050px' }}>
                    <h2 className="primary-gradient-text" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Chọn Bài</h2>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '3rem' }}>Hãy lắng nghe trực giác và chọn 3 lá bài ({selectedCardIndices.length}/3)</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                      {shuffledDeck.map((card, index) => {
                        const isSelected = selectedCardIndices.includes(index);
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1, y: isSelected ? -15 : 0 }}
                            whileHover={!isSelected ? { y: -10, boxShadow: '0 5px 15px rgba(139, 92, 246, 0.3)' } : {}}
                            onClick={() => handleSelectCard(index)}
                            className={`select-card-back ${isSelected ? 'selected' : ''}`}
                          >
                            <div className="select-card-back-glow" />
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {westernStep === 4 && (
                  <div className="result-display">
                    <div className="cards-stage">
                      <div className="fan-spread" style={{ width: fanWidth, height: fanHeight }}>
                        {finalCards.map((card, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: i * 14, x: (i - 1) * spreadDistance, rotate: (i - 1) * 8, scale: 1 }}
                            transition={{ delay: i * 0.2, type: "spring" }}
                            className="fan-card-item"
                          >
                            <PremiumCard card={card} />
                          </motion.div>
                        ))}
                      </div>
                    </div>
                    <div className="analysis-scroller">
                      <div className="western-result-header">
                        <div>
                          <p className="western-result-kicker">Chủ đề</p>
                          <h2 className="primary-gradient-text">{westernConfig.category}</h2>
                        </div>
                        <button onClick={resetWesternReading} className="back-btn">← Trải bài mới</button>
                      </div>

                      <div className="western-card-meanings">
                        {finalCards.map((card, i) => (
                          <div key={i} className="report-card" style={{ marginBottom: 0 }}>
                            <div className="title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{i + 1}</span>
                              {card.rank} {card.suit} {card.isReversed ? '(Ngược)' : ''}
                            </div>
                            {loadingCards ? (
                              <div className="ai-loading" style={{ margin: '1rem 0' }}>
                                <Loader2 className="loader-spin" size={16} />
                                <span className="ai-loading-text" style={{ fontSize: '0.875rem' }}>AI đang giải mã ý nghĩa lá bài theo chủ đề {westernConfig.category}...</span>
                              </div>
                            ) : (
                              <p className="text">"{paidFeatures.western && aiCardMeanings[i] ? aiCardMeanings[i] : getContextualCardMeaning(card, westernConfig.category)}"</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {!paidFeatures.western || !aiCardMeanings.length ? (
                        <div style={{ marginBottom: '2rem' }}>
                          <LockedAiPanel
                            title={paidFeatures.western ? 'Tạo diễn giải AI' : 'Mở khóa diễn giải AI'}
                            description="Các lá bài cơ bản đã hiển thị. AI sẽ cá nhân hóa lời giải theo chủ đề bạn chọn."
                            actionLabel={paidFeatures.western ? 'Tạo diễn giải AI' : 'Mở khóa AI'}
                            onUnlock={unlockWesternCardAi}
                            unlocked={paidFeatures.western}
                          />
                        </div>
                      ) : null}

                      <AIWisdomSection loading={aiLoading.western} chatHistory={chatHistory.western} onAsk={() => askAI('western')} onSendQuestion={(q) => handleSendQuestion('western', q)} isAIPaid={paidFeatures.western} />
                    </div>
                  </div>
                )}
              </motion.section>
            )}
          </AnimatePresence>
        </main>

        {/* Daily Cosmic Message Modal */}
        <AnimatePresence>
          {showDailyMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(5, 5, 15, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.5rem'
              }}
              onClick={() => setShowDailyMessage(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 20 }}
                style={{
                  background: 'rgba(15, 15, 30, 0.72)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '2.5rem',
                  maxWidth: '450px',
                  width: '100%',
                  textAlign: 'center',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                  position: 'relative'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <Sparkles size={32} color="var(--primary-light)" />
                </div>
                <h3 className="primary-gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Thông Điệp Vũ Trụ</h3>
                
                {dailyMessageLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                    <Loader2 className="loader-spin" size={24} color="var(--primary-light)" />
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Đang kết nối với các vì sao...</p>
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>
                    "{dailyMessage}"
                  </p>
                )}

                <button
                  onClick={() => setShowDailyMessage(false)}
                  className="app-button app-button--primary"
                >
                  Đón nhận
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── App-level Paywall Modal ── */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div key="app-paywall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            onClick={payStatus === 'polling' ? undefined : handleClosePaywall}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'linear-gradient(145deg,#1a0a2e,#0d0d1a)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: '24px', padding: '2rem 1.75rem', width: '100%', maxWidth: '320px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(139,92,246,0.35)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '160px', height: '2px', background: 'linear-gradient(90deg,transparent,#8b5cf6,#ec4899,transparent)', borderRadius: '2px' }} />

              {payStatus === 'loading' && (<><Loader2 size={36} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} /><div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Đang tạo mã thanh toán...</div></>)}

              {payStatus === 'qr' && (<>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>Quét QR để thanh toán</div>
                {qrUrl
                  ? <img src={qrUrl} alt="QR" style={{ width: '240px', height: 'auto', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.4)', background: '#fff' }} />
                  : <div style={{ width: '240px', height: '240px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', padding: '1rem', textAlign: 'center' }}>Không tải được QR.<br />Chuyển khoản thủ công với nội dung bên dưới.</div>
                }
                <div style={{ background: 'rgba(139,92,246,0.15)', borderRadius: '10px', padding: '0.6rem 1rem', width: '100%' }}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>Nội dung chuyển khoản</div>
                  <div style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>{txCode}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', borderRadius: '10px', padding: '0.45rem 1.25rem', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>2.000 ₫</div>
                <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
                  <button onClick={handleClosePaywall} className="app-button app-button--ghost app-button--sm app-button--grow">Huỷ</button>
                  <button onClick={handlePaymentPolling} className="app-button app-button--primary app-button--sm app-button--grow-2">Đã chuyển khoản ✓</button>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem' }}>Thanh toán an toàn · Một lần duy nhất</div>
              </>)}

              {payStatus === 'polling' && (<>
                <Loader2 size={40} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ color: '#fff', fontWeight: 600 }}>Đang xác nhận thanh toán...</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.6 }}>Tự động mở khoá sau khi xác nhận.</div>
                <button 
                  onClick={() => {
                    stopPollRef.current?.();
                    setPayStatus('qr');
                  }} 
                  className="app-button app-button--ghost app-button--sm" style={{ marginTop: '1rem' }}
                >
                  ← Quay lại
                </button>
              </>)}

              {payStatus === 'error' && (<>
                <div style={{ fontSize: '2rem' }}>⚠️</div>
                <div style={{ color: '#fbbf24', fontWeight: 600 }}>Không tìm thấy giao dịch</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>Hết thời gian. Nếu đã chuyển khoản, liên hệ hỗ trợ.</div>
                <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
                  <button onClick={handleClosePaywall} className="app-button app-button--ghost app-button--sm app-button--grow">Đóng</button>
                  <button onClick={() => setPayStatus('qr')} className="app-button app-button--primary app-button--sm app-button--grow-2">Thử lại</button>
                </div>
              </>)}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Sub-components
const LockedAiPanel = ({ title, description, actionLabel = 'Mở khóa AI', onUnlock, unlocked = false }) => (
  <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(236,72,153,0.28)', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.08))', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
    <Lock size={20} color="#f59e0b" />
    <div style={{ color: '#fff', fontWeight: 700 }}>{title}</div>
    <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>{description}</p>
    <button type="button" onClick={onUnlock} className="app-button app-button--primary app-button--sm app-button--pill">
      {unlocked ? actionLabel : `${actionLabel} · ${PRICE.toLocaleString('vi-VN')} ₫`}
    </button>
  </div>
);

const AIWisdomSection = ({ loading, chatHistory, onAsk, onSendQuestion, isAIPaid }) => {
  const [questionInput, setQuestionInput] = useState('');
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = () => {
    if (questionInput.trim() && !loading) {
      onSendQuestion(questionInput);
      setQuestionInput('');
    }
  };

  return (
    <div className="ai-section">
      <div className="ai-edge-glow" />
      <div className="ai-header">
        <div className="ai-icon-bg"><Bot size={24} /></div>
        <span className="ai-title">Trợ lý AI Phân tích</span>
      </div>

      {/* LOCKED state */}
      {chatHistory.length === 0 && !loading && !isAIPaid && (
        <motion.div
          style={{
            position: 'relative', padding: '2rem 1.5rem', borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.1))',
            border: '1px solid rgba(236,72,153,0.3)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: '1.25rem', margin: '1rem 0'
          }}
        >
          <motion.div
            animate={{ background: ['radial-gradient(circle at 0% 0%, rgba(139,92,246,0.25) 0%, transparent 60%)', 'radial-gradient(circle at 100% 100%, rgba(236,72,153,0.25) 0%, transparent 60%)', 'radial-gradient(circle at 0% 0%, rgba(139,92,246,0.25) 0%, transparent 60%)'] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            style={{ position: 'absolute', inset: 0, zIndex: 0, borderRadius: '20px' }}
          />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ y: [-3, 3, -3], boxShadow: ['0 0 18px rgba(236,72,153,0.4)', '0 0 32px rgba(236,72,153,0.7)', '0 0 18px rgba(236,72,153,0.4)'] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.2)' }}
              >
                <Bot size={32} color="#fff" />
              </motion.div>
              <div style={{ position: 'absolute', bottom: -3, right: -3, width: '24px', height: '24px', borderRadius: '50%', background: '#0f0f1a', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={12} color="#f59e0b" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.35rem', fontWeight: 700 }}>Trợ lý AI Phân tích</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                Phân tích chuyên sâu, cá nhân hoá bởi AI.
              </p>
            </div>
            <motion.button
              onClick={onAsk}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="app-button app-button--primary app-button--pill"
            >
              <Lock size={14} color="#fff" /> Mở khoá AI · {PRICE.toLocaleString('vi-VN')} ₫
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* UNLOCKED CTA */}
      {chatHistory.length === 0 && !loading && isAIPaid && (
        <motion.div
          onClick={onAsk}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          style={{ position: 'relative', cursor: 'pointer', padding: '2rem', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(236,72,153,0.15))', border: '1px solid rgba(236,72,153,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1rem', margin: '1rem 0', boxShadow: '0 10px 40px rgba(236,72,153,0.2)' }}
        >
          <Bot size={32} color="#ec4899" />
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>Nhấn để nhận phân tích chuyên sâu từ AI</p>
          <motion.div whileHover={{ scale: 1.05 }} className="app-button app-button--pill" style={{ background: '#fff', color: '#ec4899', boxShadow: 'none' }}>
            <Zap size={18} fill="#ec4899" /> Bắt đầu ngay
          </motion.div>
        </motion.div>
      )}


      {chatHistory.length > 0 && (
        <div className="chat-container">
          {chatHistory.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
              {msg.role === 'ai' && idx === chatHistory.length - 1 ? (
                <Typewriter text={msg.text} speed={10} />
              ) : (
                msg.role === 'ai' ? <FormattedText text={msg.text} /> : <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.text}</span>
              )}
            </motion.div>
          ))}
          {loading && (
            <div className="ai-loading" style={{ margin: '1rem 0' }}>
              <Loader2 className="loader-spin" size={24} />
              <span className="ai-loading-text">AI đang suy nghĩ...</span>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
      )}

      {chatHistory.length > 0 && !loading && (
        <div className="chat-input-wrapper">
          <input
            type="text"
            className="chat-input"
            placeholder="Hỏi thêm trợ lý AI..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={!questionInput.trim() || loading}>
            Gửi
          </button>
        </div>
      )}
    </div>
  );
};

// ── Soulmate / Compatibility Section ─────────────────────────────────────────
const LP_COLORS = {
  1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e',
  5: '#06b6d4', 6: '#a855f7', 7: '#3b82f6', 8: '#ec4899',
  9: '#f43f5e', 11: '#c084fc', 22: '#facc15', 33: '#67e8f9',
};

const AuraVenn = ({ lp1, lp2, matchPercent }) => {
  const c1 = LP_COLORS[lp1] || '#8b5cf6';
  const c2 = LP_COLORS[lp2] || '#ec4899';
  return (
    <div style={{ position: 'relative', width: '280px', height: '180px', margin: '0 auto' }}>
      {/* Ring 1 */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '170px', height: '170px', borderRadius: '50%',
          background: `radial-gradient(circle at 60% 50%, ${c1}60, ${c1}20)`,
          border: `2px solid ${c1}80`,
          boxShadow: `0 0 40px ${c1}60`,
        }}
      />
      {/* Ring 2 */}
      <motion.div
        animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{
          position: 'absolute', top: 0, right: 0,
          width: '170px', height: '170px', borderRadius: '50%',
          background: `radial-gradient(circle at 40% 50%, ${c2}60, ${c2}20)`,
          border: `2px solid ${c2}80`,
          boxShadow: `0 0 40px ${c2}60`,
        }}
      />
      {/* Blend center */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity }}
        style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2,
        }}
      >
        <span style={{
          fontSize: '2.2rem', fontWeight: 900,
          background: `linear-gradient(135deg, ${c1}, ${c2})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}>{matchPercent}%</span>
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px', whiteSpace: 'nowrap' }}>Độ tương hợp</span>
      </motion.div>
    </div>
  );
};

const SoulmateInsightCard = ({ title, icon: Icon, color, content, loading }) => (
  <div className="report-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
      <div style={{ background: `${color}20`, padding: '6px', borderRadius: '8px', display: 'flex' }}>
        <Icon size={18} color={color} />
      </div>
      <span style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{title}</span>
    </div>
    {loading ? (
      <div className="ai-loading" style={{ padding: '1rem 0' }}>
        <Loader2 className="loader-spin" size={20} />
      </div>
    ) : (
      <FormattedText text={content || ''} />
    )}
  </div>
);

const SoulmateSection = ({ form, setForm, result, setResult, loading, setLoading, error, setError, isPaid, requirePayment }) => {
  const parseDob = (str) => {
    // Accept dd/mm/yyyy
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (!day || !month || !year) return null;
    return { isoStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` };
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    const d1 = parseDob(form.dob1);
    const d2 = parseDob(form.dob2);
    if (!d1 || !d2) { setError('Nhập ngày sinh theo định dạng dd/mm/yyyy'); return; }
    if (!form.name1.trim() || !form.name2.trim()) { setError('Vui lòng nhập đầy đủ tên cả hai người'); return; }

    const runAnalysis = async () => {
      setLoading(true);
      const lp1 = calculateLifePath(d1.isoStr);
      const dest1 = calculateNameNumber(form.name1);
      const lp2 = calculateLifePath(d2.isoStr);
      const dest2 = calculateNameNumber(form.name2);

      const res = await generateSoulmateAnalysis(
        { name: form.name1, dob: form.dob1, lp: lp1, destiny: dest1 },
        { name: form.name2, dob: form.dob2, lp: lp2, destiny: dest2 }
      );
      setLoading(false);
      if (res) {
        setResult({ ...res, lp1, lp2, name1: form.name1, name2: form.name2 });
      } else {
        setError('AI không thể phân tích lúc này, thử lại nhé!');
      }
    };

    runAnalysis();
  };

  if (result) {
    return (
      <motion.section key="soulmate-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>Phân tích Tương Hợp</h2>
            <motion.button
              onClick={() => setResult(null)}
              whileTap={{ scale: 0.95 }}
              className="app-button app-button--ghost app-button--sm app-button--pill"
            >
              ← Nhập lại
            </motion.button>
          </div>

          {/* Aura + Match score */}
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem', textAlign: 'center' }}>
            {/* Two people */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'nowrap' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: LP_COLORS[result.lp1] || '#8b5cf6', margin: '0 auto 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: `0 0 18px ${LP_COLORS[result.lp1] || '#8b5cf6'}80` }}>{result.lp1}</div>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{result.name1}</span>
              </div>
              <AuraVenn lp1={result.lp1} lp2={result.lp2} matchPercent={result.matchPercent} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: LP_COLORS[result.lp2] || '#ec4899', margin: '0 auto 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: `0 0 18px ${LP_COLORS[result.lp2] || '#ec4899'}80` }}>{result.lp2}</div>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{result.name2}</span>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>"{result.summary}"</p>
          </div>

          {/* 4 Insight Cards */}
          <div className="report-section">
            <SoulmateInsightCard title="Cảm xúc & Tình cảm" icon={Heart} color="#f43f5e" content={result.emotion} loading={loading} />
            <SoulmateInsightCard title="Giao tiếp & Xung đột" icon={MessageCircle} color="#60a5fa" content={result.communication} loading={loading} />
            <SoulmateInsightCard title="Nghiệp duyên & Bài học chung" icon={Infinity} color="#c084fc" content={result.karmic} loading={loading} />
            <SoulmateInsightCard title="⚠️ Red Flag cần lưu ý" icon={AlertTriangle} color="#f97316" content={result.redFlag} loading={loading} />
          </div>
        </div>
      </motion.section>
    );
  }

  const loadingMessages = [
    "Đang đọc tần số cảm xúc...",
    "Giải mã năng lượng tâm linh...",
    "Kết nối hai vũ trụ...",
    "Phân tích nghiệp duyên...",
    "AI đang chiêm tinh...",
  ];
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingMsgIdx(i => (i + 1) % loadingMessages.length), 1800);
    return () => clearInterval(t);
  }, [loading]);

  if (loading) {
    return (
      <motion.section key="soulmate-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ minHeight: 'calc(100dvh - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.75rem' }}>
          {/* Orbit Loader */}
          <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 20px #ec489980', '0 0 50px #ec4899cc', '0 0 20px #ec489980'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ position: 'absolute', inset: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}
            >💞</motion.div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.4)', borderTopColor: '#8b5cf6' }} />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '2px solid rgba(236,72,153,0.3)', borderTopColor: '#ec4899' }} />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', inset: 0 }}>
              <div style={{ position: 'absolute', top: '-5px', left: '50%', width: '10px', height: '10px', background: '#8b5cf6', borderRadius: '50%', boxShadow: '0 0 10px #8b5cf6', transform: 'translateX(-50%)' }} />
            </motion.div>
          </div>
          <AnimatePresence mode="wait">
            <motion.p key={loadingMsgIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              style={{ color: 'var(--primary-light)', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em', textAlign: 'center' }}
            >{loadingMessages[loadingMsgIdx]}</motion.p>
          </AnimatePresence>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-dim)', fontSize: '0.825rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#fff" />
            </div>
            AI Tâm Linh đang phân tích duyên số...
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section key="soulmate-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div style={{ minHeight: 'calc(100dvh - 140px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', padding: '0 1rem', width: '100%' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 className="primary-gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.35rem', lineHeight: 1.2, fontWeight: 700, whiteSpace: 'nowrap' }}>Tương Hợp Tâm Linh</h2>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.4 }}>AI phân tích nghiệp duyên<br />&amp; cảnh báo tình cảm.</p>
          </div>

          <form onSubmit={handleAnalyze}>
            {/* Single unified card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem' }}>

              {/* Person 1 */}
              <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>1</div>
                  <span style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.875rem' }}>Người thứ nhất</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)' }} placeholder="Họ và tên (không dấu)" value={form.name1} onChange={e => setForm({ ...form, name1: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)' }} placeholder="Ngày sinh  dd/mm/yyyy" value={form.dob1} onChange={e => setForm({ ...form, dob1: e.target.value })} />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4))' }} />
                <motion.div
                  animate={{ scale: [0.9, 1.2, 0.9] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', boxShadow: '0 0 12px rgba(236,72,153,0.4)', flexShrink: 0 }}
                >❤️</motion.div>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(244,63,94,0.4), transparent)' }} />
              </div>

              {/* Person 2 */}
              <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>2</div>
                  <span style={{ color: '#fb7185', fontWeight: 600, fontSize: '0.875rem' }}>Người thứ hai</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)' }} placeholder="Họ và tên (không dấu)" value={form.name2} onChange={e => setForm({ ...form, name2: e.target.value })} />
                  <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)' }} placeholder="Ngày sinh  dd/mm/yyyy" value={form.dob2} onChange={e => setForm({ ...form, dob2: e.target.value })} />
                </div>
              </div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.825rem', marginBottom: '0.75rem', textAlign: 'center' }}>{error}</p>}

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              whileHover={{ scale: 1.02 }}
              className="app-button app-button--primary app-button--full app-button--lg"
            >
              <Heart size={18} fill="#fff" /> Phân tích duyên số
            </motion.button>
          </form>

        </div>
      </div>
    </motion.section>
  );

};

const Typewriter = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setIndex(0);
  }, [text]);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return <FormattedText text={displayedText} />;
};

const ModuleCard = ({ title, desc, onClick, icon }) => (
  <motion.div
    onClick={onClick}
    className="glass-container module-card"
    style={{ margin: 0, maxWidth: 'none', padding: '2.5rem', cursor: 'pointer' }}
    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(139, 92, 246, 0.35)', borderColor: 'rgba(139, 92, 246, 0.5)' }}
    whileTap={{ scale: 0.97, boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
  >
    <div className="module-icon-box">
      {icon}
    </div>
    <h3 className="module-title">{title}</h3>
    <p className="module-desc">{desc}</p>
    <div className="module-link">
      Khám phá ngay <ChevronRight size={16} />
    </div>
  </motion.div>
);

const ModernButton = ({ children, onClick, type = "button", className = "", disabled = false }) => (
  <button type={type} onClick={onClick} disabled={disabled} className={`btn-modern ${className}`}>
    {children}
  </button>
);

const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <input
      type={type}
      className="modern-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required
    />
  </div>
);

const SelectionGroup = ({ label, options, value, onChange }) => (
  <div className="input-group">
    <label className="input-label">{label}</label>
    <div className="selection-buttons">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`select-btn ${value === o ? 'active' : ''}`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

const CustomSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="input-group custom-select-wrapper" ref={dropdownRef}>
      {label && <label className="input-label">{label}</label>}
      <div className="custom-select-header" onClick={() => setIsOpen(!isOpen)}>
        <span>{value}</span>
        <ChevronDown size={18} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="custom-select-options"
          >
            {options.map((option) => (
              <div
                key={option}
                className={`custom-select-option ${value === option ? 'selected' : ''}`}
                onClick={() => { onChange(option); setIsOpen(false); }}
              >
                {option}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatBox = ({ label, value, color = "violet" }) => {
  return (
    <div className={`stat-box ${color}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
};

const ReportCard = ({ title, text, loading }) => (
  <div className="report-card">
    <div className="title">{title}</div>
    {loading ? (
      <div className="ai-loading" style={{ margin: '1rem 0' }}>
        <Loader2 className="loader-spin" size={16} />
        <span className="ai-loading-text" style={{ fontSize: '0.875rem' }}>AI đang phân tích chuyên sâu...</span>
      </div>
    ) : (
      <div className="text" style={{ margin: 0 }}><FormattedText text={text} /></div>
    )}
  </div>
);

const gridMeanings = {
  '1': 'Thể hiện bản thân', '11': 'Trực giác nhạy bén (11)', '111': 'Thích chia sẻ, nói nhiều', '1111': 'Rất nhạy cảm, khó giãi bày',
  '2': 'Trực giác cơ bản', '22': 'Năng lượng kiến tạo (22)', '222': 'Quá nhạy cảm, dễ tổn thương',
  '3': 'Trí nhớ tốt', '33': 'Tư duy sáng tạo cao', '333': 'Dễ xa rời thực tế',
  '4': 'Thực tế, kỷ luật', '44': 'Tổ chức xuất sắc', '444': 'Bảo thủ, cứng nhắc',
  '5': 'Cảm xúc, kết nối', '55': 'Mạnh mẽ, đam mê', '555': 'Dễ căng thẳng thần kinh',
  '6': 'Trách nhiệm gia đình', '66': 'Sáng tạo xuất chúng', '666': 'Lo âu quá mức',
  '7': 'Học qua trải nghiệm', '77': 'Thấu hiểu tâm linh', '777': 'Bài học lớn về buông bỏ',
  '8': 'Độc lập, nhạy bén', '88': 'Trí tuệ kinh doanh', '888': 'Khát vọng quyền lực',
  '9': 'Hoài bão, lý tưởng', '99': 'Lý tưởng hóa', '999': 'Dễ mù quáng vì lý tưởng'
};

const BirthChart = ({ dob }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const digits = dob.replace(/[^1-9]/g, '').split('');
  const gridMap = {
    3: { x: 2, y: 0 }, 6: { x: 2, y: 1 }, 9: { x: 2, y: 2 },
    2: { x: 1, y: 0 }, 5: { x: 1, y: 1 }, 8: { x: 1, y: 2 },
    1: { x: 0, y: 0 }, 4: { x: 0, y: 1 }, 7: { x: 0, y: 2 }
  };

  const digitCounts = {};
  digits.forEach(d => {
    digitCounts[d] = (digitCounts[d] || 0) + 1;
  });

  const activeNodes = Object.keys(gridMap).map(num => ({
    num,
    count: digitCounts[num] || 0,
    ...gridMap[num]
  }));

  const activeNumbers = Object.keys(digitCounts).map(Number);

  const lines = [];

  activeNumbers.forEach(n1 => {
    activeNumbers.forEach(n2 => {
      if (n1 >= n2) return;
      const dx = Math.abs(gridMap[n1].x - gridMap[n2].x);
      const dy = Math.abs(gridMap[n1].y - gridMap[n2].y);
      if (dx <= 1 && dy <= 1) {
        lines.push({ n1, n2 });
      }
    });
  });

  const getPos = (x, y) => ({ cx: 40 + y * 85, cy: 210 - x * 85 });

  return (
    <div style={{ width: '250px', height: '250px', position: 'relative', overflow: 'visible' }}>
      {/* Background Constellation Pattern */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%',
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        opacity: 0.3, zIndex: 0,
        maskImage: 'radial-gradient(circle, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 70%)'
      }} />

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            style={{
              position: 'absolute',
              left: hoveredNode.x,
              top: hoveredNode.y - 45,
              transform: 'translateX(-50%)',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              backdropFilter: 'blur(10px)',
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: '#fff',
              whiteSpace: 'nowrap',
              zIndex: 50,
              pointerEvents: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}
          >
            <span style={{ color: 'var(--primary-light)', fontWeight: 600 }}>{hoveredNode.val}:</span> {hoveredNode.meaning}
          </motion.div>
        )}
      </AnimatePresence>

      <svg width="100%" height="100%" viewBox="0 0 250 250" style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.2))' }}>
        <defs>
          <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--primary-light)" stopOpacity="1" />
            <stop offset="30%" stopColor="var(--primary-light)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Lines */}
        {lines.map((line, i) => {
          const p1 = getPos(gridMap[line.n1].x, gridMap[line.n1].y);
          const p2 = getPos(gridMap[line.n2].x, gridMap[line.n2].y);
          return (
            <g key={i}>
              <motion.line
                x1={p1.cx} y1={p1.cy} x2={p2.cx} y2={p2.cy}
                stroke="rgba(139, 92, 246, 0.3)"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: i * 0.15 }}
              />
              <motion.line
                x1={p1.cx} y1={p1.cy} x2={p2.cx} y2={p2.cy}
                stroke="var(--primary-light)"
                strokeWidth="2"
                filter="url(#lineGlow)"
                strokeDasharray="10 100"
                initial={{ strokeDashoffset: 110, opacity: 0 }}
                animate={{ strokeDashoffset: -110, opacity: [0, 1, 1, 0] }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity, ease: "linear" }}
              />
            </g>
          );
        })}

        {/* Nodes */}
        {activeNodes.map((node, i) => {
          const { cx, cy } = getPos(node.x, node.y);
          const isActive = node.count > 0;
          const nodeStr = isActive ? node.num.repeat(node.count) : '';
          const meaning = gridMeanings[nodeStr] || 'Năng lượng đặc biệt';

          return (
            <g key={node.num}
              onMouseEnter={() => isActive && setHoveredNode({ x: cx, y: cy, val: nodeStr, meaning })}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: isActive ? 'pointer' : 'default' }}
            >
              <circle cx={cx} cy={cy} r="6" fill={isActive ? "transparent" : "rgba(255,255,255,0.05)"} />

              {isActive && (
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', delay: 0.5 + i * 0.05 }}
                >
                  {/* Breathing Glow */}
                  <motion.circle
                    cx={cx} cy={cy} r="22"
                    fill="url(#starGlow)"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 2.5 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Core */}
                  <circle cx={cx} cy={cy} r="4" fill="#fff" filter="url(#lineGlow)" />
                  <text x={cx} y={cy - 14} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle" style={{ textShadow: '0 0 5px rgba(139, 92, 246, 0.8)' }}>
                    {nodeStr}
                  </text>

                  {/* Orbiting Particles */}
                  {[0, 1].map(pIdx => (
                    <motion.circle
                      key={pIdx}
                      cx={cx} cy={cy - 12} r="1.5" fill="#fff"
                      animate={{
                        rotate: [0, 360],
                        scale: [0.5, 1, 0.5]
                      }}
                      style={{ originX: '50%', originY: '12px' }}
                      transition={{
                        rotate: { duration: 3 + pIdx * 2, repeat: Infinity, ease: "linear", delay: pIdx },
                        scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                      }}
                    />
                  ))}
                </motion.g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const PremiumCard = ({ card }) => {
  const getRankChar = (rank) => rank === 'Át' ? 'A' : rank === 'Bồi' ? 'J' : rank === 'Đầm' ? 'Q' : rank === 'Già' ? 'K' : rank;
  return (
    <div className={`western-card-premium ${card.color === 'red' ? 'red' : ''} ${card.isReversed ? 'reversed' : ''}`}>
      <div className="index-corner top"><span>{getRankChar(card.rank)}</span><span style={{ fontSize: '1.125rem' }}>{card.symbol}</span></div>
      <div className="card-art">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.2))' }}>{card.symbol}</motion.div>
      </div>
      <div className="index-corner bottom"><span>{getRankChar(card.rank)}</span><span style={{ fontSize: '1.125rem' }}>{card.symbol}</span></div>
    </div>
  );
};

export default App;



