import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Moon, Layers, ChevronRight, ChevronDown, Zap, Bot, Loader2, ArrowRight, Briefcase, Coins, Heart, Users, MessageCircle, AlertTriangle, Infinity, Home, Hash, Shuffle, Lock } from 'lucide-react';
import {
  calculateLifePath, calculateNameNumber,
  calculatePersonalYear, getDetailedAnalysis
} from './utils/numerology';
import { westernDeck } from './utils/westernCards';
import { tarotCardBack, tarotDeck } from './utils/tarotDeck';
import { generateAIAdvice, askFollowUpQuestion, generateIndividualCardMeanings, generateNumerologyReport, generateMonthlyPredictions, generateSoulmateAnalysis, generateDailyCosmicMessage } from './utils/aiWisdom';
import { generateTransactionCode, fetchSePayAccount, getVietQRUrl, pollPaymentConfirmation, PRICE } from './utils/payment';

const LANGUAGES = [
  { code: 'vi', short: 'VI', label: 'Ti\u1ebfng Vi\u1ec7t' },
  { code: 'en', short: 'EN', label: 'English' },
  { code: 'zh', short: '\u4e2d\u6587', label: '\u4e2d\u6587' },
];

const pageMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
};

const TOPICS = {
  LOVE: 'T\u00ecnh c\u1ea3m',
  CAREER: 'S\u1ef1 nghi\u1ec7p',
  FUTURE: 'T\u01b0\u01a1ng lai',
  MONEY: 'Ti\u1ec1n b\u1ea1c',
};

const SUITS = {
  HEARTS: '\u2665',
  DIAMONDS: '\u2666',
  CLUBS: '\u2663',
  SPADES: '\u2660',
};

const decodeMojibake = (value) => {
  if (typeof value !== 'string' || !/[ÃÂâÄÆðá]/.test(value)) return value;
  try {
    const bytes = Uint8Array.from(Array.from(value, ch => ch.charCodeAt(0) & 255));
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return value;
  }
};

const normalizeCard = (card) => ({
  ...card,
  rank: decodeMojibake(card.rank),
  suit: decodeMojibake(card.suit),
  symbol: decodeMojibake(card.symbol),
  meaning: decodeMojibake(card.meaning),
  meaningUpright: decodeMojibake(card.meaningUpright),
  meaningReversed: decodeMojibake(card.meaningReversed),
  combinations: card.combinations?.map(item => ({
    ...item,
    cards: item.cards?.map(decodeMojibake) || [],
    text: decodeMojibake(item.text),
  })),
});

const UI_TEXT = {
  vi: {
    navExplore: 'Kh\u00e1m Ph\u00e1',
    navNumerology: 'Th\u1ea7n S\u1ed1 H\u1ecdc',
    navWestern: 'B\u00f3i B\u00e0i T\u00e2y',
    navTarot: 'B\u00f3i B\u00e0i Tarot',
    navSoulmate: 'T\u01b0\u01a1ng H\u1ee3p',
    bottomHome: 'Trang ch\u1ee7',
    bottomNumerology: 'Th\u1ea7n s\u1ed1',
    bottomWestern: 'B\u00f3i b\u00e0i',
    bottomTarot: 'Tarot',
    bottomSoulmate: 'T\u01b0\u01a1ng h\u1ee3p',
    heroTagline: 'Ti\u1ec1m n\u0103ng \u2022 Duy\u00ean s\u1ed1 \u2022 Tr\u1ef1c gi\u00e1c',
    dailyButton: 'Th\u00f4ng \u0111i\u1ec7p h\u00f4m nay',
    dailyTitle: 'Th\u00f4ng \u0110i\u1ec7p V\u0169 Tr\u1ee5',
    dailyLoading: '\u0110ang k\u1ebft n\u1ed1i v\u1edbi c\u00e1c v\u00ec sao...',
    dailyAccept: '\u0110\u00f3n nh\u1eadn',
    cardNumerologyTitle: 'Th\u1ea7n S\u1ed1 H\u1ecdc',
    cardNumerologyDesc: 'Gi\u1ea3i m\u00e3 ch\u1ec9 s\u1ed1 \u0111\u01b0\u1eddng \u0111\u1eddi & n\u0103ng l\u01b0\u1ee3ng c\u00e1 nh\u00e2n',
    cardWesternTitle: 'B\u00f3i B\u00e0i T\u00e2y',
    cardWesternDesc: 'Tr\u1ea3i 3 l\u00e1 b\u00e0i nh\u1eadn th\u00f4ng \u0111i\u1ec7p t\u1eeb v\u0169 tr\u1ee5',
    cardSoulmateTitle: 'T\u01b0\u01a1ng H\u1ee3p T\u00e2m Linh',
    cardSoulmateDesc: 'AI ph\u00e2n t\u00edch nghi\u1ec7p duy\u00ean & c\u1ea3nh b\u00e1o t\u00ecnh c\u1ea3m',
    numerologyTitle: 'Th\u1ea7n S\u1ed1 H\u1ecdc',
    numerologySubtitle: 'Gi\u1ea3i m\u00e3 ch\u1ec9 s\u1ed1 \u0111\u01b0\u1eddng \u0111\u1eddi, s\u1ee9 m\u1ec7nh v\u00e0 n\u0103ng l\u01b0\u1ee3ng n\u0103m c\u00e1 nh\u00e2n.',
    fullNameLabel: 'H\u1ecd v\u00e0 t\u00ean \u0111\u1ea7y \u0111\u1ee7 (kh\u00f4ng d\u1ea5u)',
    fullNamePlaceholder: 'VD: NGUYEN VAN A',
    birthDateLabel: 'Ng\u00e0y th\u00e1ng n\u0103m sinh',
    dayPlaceholder: 'Ng\u00e0y',
    monthPlaceholder: 'Th\u00e1ng',
    yearPlaceholder: 'N\u0103m',
    analyzeNow: 'Ph\u00e2n T\u00edch Ngay',
    westernTitle: 'B\u00f3i B\u00e0i T\u00e2y',
    westernSubtitle: 'Tr\u1ea3i 3 l\u00e1 b\u00e0i, nh\u1eadn th\u00f4ng \u0111i\u1ec7p t\u1eeb v\u0169 tr\u1ee5.',
    tarotTitle: 'B\u00f3i B\u00e0i Tarot',
    tarotSubtitle: 'T\u1eadp trung v\u00e0o c\u00e2u h\u1ecfi, sau \u0111\u00f3 t\u1ef1 tay ch\u1ecdn 3 l\u00e1 t\u1eeb b\u1ed9 Tarot 78 l\u00e1.',
    tarotQuestionLabel: 'C\u00e2u h\u1ecfi mu\u1ed1n soi chi\u1ebfu',
    tarotQuestionPlaceholder: 'VD: T\u00ecnh c\u1ea3m n\u00e0y s\u1ebd \u0111i v\u1ec1 \u0111\u00e2u?',
    tarotQuestionError: 'Vui l\u00f2ng nh\u1eadp c\u00e2u h\u1ecfi mu\u1ed1n soi chi\u1ebfu.',
    tarotStart: 'Tr\u1ea3i b\u00e0i Tarot',
    tarotReset: '\u2190 R\u00fat l\u1ea1i',
    tarotPositions: ['Qu\u00e1 kh\u1ee9', 'Hi\u1ec7n t\u1ea1i', 'T\u01b0\u01a1ng lai'],
    tarotReversed: 'Ng\u01b0\u1ee3c',
    tarotDeckCount: 'B\u1ed9 b\u00e0i 78 l\u00e1',
    tarotChooseTitle: 'Ch\u1ecdn 3 l\u00e1 Tarot',
    tarotChooseDesc: 'H\u00e3y l\u1eafng nghe tr\u1ef1c gi\u00e1c v\u00e0 ch\u1ecdn 3 l\u00e1 b\u00e0i',
    tarotViewResult: 'Xem k\u1ebft qu\u1ea3',
    nameLabel: 'H\u1ecd v\u00e0 t\u00ean',
    nameExample: 'VD: Nguy\u1ec5n V\u0103n A',
    dobLabel: 'Ng\u00e0y sinh',
    genderLabel: 'Gi\u1edbi t\u00ednh',
    male: 'Nam',
    female: 'N\u1eef',
    topicLabel: 'Ch\u1ee7 \u0111\u1ec1 mu\u1ed1n h\u1ecfi',
    topicLove: 'T\u00ecnh c\u1ea3m',
    topicCareer: 'S\u1ef1 nghi\u1ec7p',
    topicFuture: 'T\u01b0\u01a1ng lai',
    topicMoney: 'Ti\u1ec1n b\u1ea1c',
    focusText: 'Gi\u1eef t\u00e2m tr\u00ed t\u0129nh l\u1eb7ng, t\u1eadp trung v\u00e0o c\u00e2u h\u1ecfi v\u1ec1 ch\u1ee7 \u0111\u1ec1',
    startReading: 'B\u1eaft \u0111\u1ea7u tr\u1ea3i b\u00e0i',
    soulmateTitle: 'T\u01b0\u01a1ng H\u1ee3p T\u00e2m Linh',
    soulmateSubtitle: 'AI ph\u00e2n t\u00edch nghi\u1ec7p duy\u00ean & c\u1ea3nh b\u00e1o t\u00ecnh c\u1ea3m.',
    soulmatePerson1: 'Ng\u01b0\u1eddi th\u1ee9 nh\u1ea5t',
    soulmatePerson2: 'Ng\u01b0\u1eddi th\u1ee9 hai',
    namePlaceholder: 'H\u1ecd v\u00e0 t\u00ean (kh\u00f4ng d\u1ea5u)',
    dobPlaceholder: 'Ng\u00e0y sinh  dd/mm/yyyy',
    soulmateSubmit: 'Ph\u00e2n t\u00edch duy\u00ean s\u1ed1',
    footerTagline: 'Powered by AI \u00b7 Th\u1ea7n s\u1ed1 h\u1ecdc Pythagoras',
    langLabel: 'Ng\u00f4n ng\u1eef',
    resultsTitle: 'K\u1ebft qu\u1ea3 ph\u00e2n t\u00edch',
    backEdit: '\u2190 Nh\u1eadp l\u1ea1i',
    lifePath: '\u0110\u01b0\u1eddng \u0110\u1eddi',
    destiny: 'S\u1ee9 M\u1ec7nh',
    soul: 'Linh H\u1ed3n',
    personality: 'Nh\u00e2n C\u00e1ch',
    personalYear: 'N\u0103m C\u00e1 Nh\u00e2n',
    personalYearDesc: 'N\u0103ng l\u01b0\u1ee3ng ch\u1ee7 \u0111\u1ea1o bao tr\u00f9m to\u00e0n b\u1ed9 n\u0103m nay c\u1ee7a b\u1ea1n',
    birthChartTitle: 'Bi\u1ec3u \u0111\u1ed3 Ch\u00f2m sao',
    birthChartDesc: 'C\u00e1c n\u0103ng l\u01b0\u1ee3ng b\u1ea9m sinh tr\u00ean l\u01b0\u1edbi Pythagoras',
    monthlyPeaksTitle: 'Th\u00e1ng \u0110\u1ec9nh Cao N\u0103ng L\u01b0\u1ee3ng',
    monthlyPeaksLoading: 'AI \u0111ang t\u00ednh to\u00e1n c\u00e1c \u0111\u1ec9nh n\u0103ng l\u01b0\u1ee3ng...',
    unlockMonthlyTitle: 'M\u1edf kh\u00f3a d\u1ef1 \u0111o\u00e1n AI',
    unlockMonthlyDesc: 'Ph\u1ea7n \u0111\u1ec9nh cao n\u0103ng l\u01b0\u1ee3ng theo th\u00e1ng d\u00f9ng AI c\u00e1 nh\u00e2n h\u00f3a t\u1eeb c\u00e1c ch\u1ec9 s\u1ed1 c\u1ee7a b\u1ea1n.',
    createMonthlyTitle: 'T\u1ea1o d\u1ef1 \u0111o\u00e1n AI',
    createMonthlyDesc: 'T\u1ea1o l\u1ea1i ph\u00e2n t\u00edch th\u00e1ng v\u00e0 di\u1ec5n gi\u1ea3i chuy\u00ean s\u00e2u cho h\u1ed3 s\u01a1 hi\u1ec7n t\u1ea1i.',
    createWithAI: 'T\u1ea1o b\u1eb1ng AI',
    lifePathReport: 'Ch\u1ec9 s\u1ed1 \u0110\u01b0\u1eddng \u0110\u1eddi',
    destinyReport: 'Ch\u1ec9 s\u1ed1 S\u1ee9 M\u1ec7nh',
    unlockAI: 'M\u1edf kh\u00f3a AI',
    aiAssistantTitle: 'Tr\u1ee3 l\u00fd AI Ph\u00e2n t\u00edch',
    aiAssistantDesc: 'Ph\u00e2n t\u00edch chuy\u00ean s\u00e2u, c\u00e1 nh\u00e2n ho\u00e1 b\u1edfi AI.',
    aiStartPrompt: 'Nh\u1ea5n \u0111\u1ec3 nh\u1eadn ph\u00e2n t\u00edch chuy\u00ean s\u00e2u t\u1eeb AI',
    startNow: 'B\u1eaft \u0111\u1ea7u ngay',
    aiThinking: 'AI \u0111ang suy ngh\u0129...',
    askMorePlaceholder: 'H\u1ecfi th\u00eam tr\u1ee3 l\u00fd AI...',
    send: 'G\u1eedi',
    payCreating: '\u0110ang t\u1ea1o m\u00e3 thanh to\u00e1n...',
    payQrTitle: 'Qu\u00e9t QR \u0111\u1ec3 thanh to\u00e1n',
    payQrFallback: 'Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c QR. Chuy\u1ec3n kho\u1ea3n th\u1ee7 c\u00f4ng v\u1edbi n\u1ed9i dung b\u00ean d\u01b0\u1edbi.',
    payTransferContent: 'N\u1ed9i dung chuy\u1ec3n kho\u1ea3n',
    cancel: 'Hu\u1ef7',
    transferred: '\u0110\u00e3 chuy\u1ec3n kho\u1ea3n',
    paySafe: 'Thanh to\u00e1n an to\u00e0n \u00b7 M\u1ed9t l\u1ea7n duy nh\u1ea5t',
    payConfirming: '\u0110ang x\u00e1c nh\u1eadn thanh to\u00e1n...',
    payAutoUnlock: 'T\u1ef1 \u0111\u1ed9ng m\u1edf kho\u00e1 sau khi x\u00e1c nh\u1eadn.',
    back: '\u2190 Quay l\u1ea1i',
    payNotFound: 'Kh\u00f4ng t\u00ecm th\u1ea5y giao d\u1ecbch',
    payTimeout: 'H\u1ebft th\u1eddi gian. N\u1ebfu \u0111\u00e3 chuy\u1ec3n kho\u1ea3n, li\u00ean h\u1ec7 h\u1ed7 tr\u1ee3.',
    close: '\u0110\u00f3ng',
    retry: 'Th\u1eed l\u1ea1i',
    shuffleRitual: 'Nghi th\u1ee9c tr\u1ea3i b\u00e0i',
    shufflingTitle: '\u0110ang x\u00e0o b\u00e0i',
    shufflingAction: '\u0110ang tr\u1ed9n...',
    shuffleComplete: 'Ho\u00e0n t\u1ea5t',
    shuffleAction: 'X\u00e0o b\u00e0i',
    shuffleHint: 'M\u1ed7i l\u01b0\u1ee3t x\u00e0o gi\u00fap b\u1ed9 b\u00e0i \u1ed5n \u0111\u1ecbnh n\u0103ng l\u01b0\u1ee3ng tr\u01b0\u1edbc khi ch\u1ecdn 3 l\u00e1.',
    chooseCardsTitle: 'Ch\u1ecdn B\u00e0i',
    chooseCardsDesc: 'H\u00e3y l\u1eafng nghe tr\u1ef1c gi\u00e1c v\u00e0 ch\u1ecdn 3 l\u00e1 b\u00e0i',
    topic: 'Ch\u1ee7 \u0111\u1ec1',
    newReading: '\u2190 Tr\u1ea3i b\u00e0i m\u1edbi',
    readingSummary: 'T\u00f3m t\u1eaft qu\u1ebb b\u00e0i',
    reversed: '(Ng\u01b0\u1ee3c)',
    cardAiLoading: 'AI \u0111ang gi\u1ea3i m\u00e3 \u00fd ngh\u0129a l\u00e1 b\u00e0i theo ch\u1ee7 \u0111\u1ec1',
    createCardAi: 'T\u1ea1o di\u1ec5n gi\u1ea3i AI',
    unlockCardAi: 'M\u1edf kh\u00f3a di\u1ec5n gi\u1ea3i AI',
    cardAiDesc: 'C\u00e1c l\u00e1 b\u00e0i c\u01a1 b\u1ea3n \u0111\u00e3 hi\u1ec3n th\u1ecb. AI s\u1ebd c\u00e1 nh\u00e2n h\u00f3a l\u1eddi gi\u1ea3i theo ch\u1ee7 \u0111\u1ec1 b\u1ea1n ch\u1ecdn.',
    aiDeepLoading: 'AI \u0111ang ph\u00e2n t\u00edch chuy\u00ean s\u00e2u...',
    compatPreviewTitle: 'Xem tr\u01b0\u1edbc t\u01b0\u01a1ng h\u1ee3p',
    emotionTitle: 'C\u1ea3m x\u00fac & T\u00ecnh c\u1ea3m',
    unlockFullTitle: 'M\u1edf kh\u00f3a ph\u00e2n t\u00edch \u0111\u1ea7y \u0111\u1ee7',
    unlockFullDesc: 'Xem tr\u1ecdn b\u1ed9 di\u1ec5n gi\u1ea3i AI v\u1ec1 c\u1ea3m x\u00fac, giao ti\u1ebfp, nghi\u1ec7p duy\u00ean v\u00e0 c\u1ea3nh b\u00e1o c\u1ea7n l\u01b0u \u00fd cho hai ng\u01b0\u1eddi.',
    viewFullAnalysis: 'Xem ph\u00e2n t\u00edch \u0111\u1ea7y \u0111\u1ee7',
    unlockFull: 'M\u1edf kh\u00f3a full',
    communicationTitle: 'Giao ti\u1ebfp & Xung \u0111\u1ed9t',
    karmicTitle: 'Nghi\u1ec7p duy\u00ean & B\u00e0i h\u1ecdc chung',
    redFlagTitle: 'Red Flag c\u1ea7n l\u01b0u \u00fd',
    soulmatePreviewSummary: '{name1} v\u00e0 {name2} c\u00f3 m\u1ee9c c\u1ed9ng h\u01b0\u1edfng {percent}%, \u0111\u1ee7 \u0111\u1ec3 xem h\u01b0\u1edbng k\u1ebft n\u1ed1i ch\u00ednh gi\u1eefa hai ng\u01b0\u1eddi.',
    soulmatePreviewEmotion: '\u0110i\u1ec3m xem tr\u01b0\u1edbc: \u0110\u01b0\u1eddng \u0110\u1eddi {lp1} v\u00e0 {lp2} cho th\u1ea5y c\u00e1ch hai ng\u01b0\u1eddi trao \u0111\u1ed5i c\u1ea3m x\u00fac c\u00f3 th\u1ec3 b\u1ed5 tr\u1ee3 nhau n\u1ebfu bi\u1ebft gi\u1eef nh\u1ecbp l\u1eafng nghe. Ph\u1ea7n ph\u00e2n t\u00edch \u0111\u1ea7y \u0111\u1ee7 s\u1ebd m\u1edf kh\u00f3a c\u1ea3m x\u00fac, giao ti\u1ebfp, nghi\u1ec7p duy\u00ean v\u00e0 c\u1ea3nh b\u00e1o c\u1ea7n l\u01b0u \u00fd.',
    soulmateDateError: 'Nh\u1eadp ng\u00e0y sinh theo \u0111\u1ecbnh d\u1ea1ng dd/mm/yyyy',
    soulmateNameError: 'Vui l\u00f2ng nh\u1eadp \u0111\u1ea7y \u0111\u1ee7 t\u00ean c\u1ea3 hai ng\u01b0\u1eddi',
    soulmateAiError: 'AI kh\u00f4ng th\u1ec3 ph\u00e2n t\u00edch l\u00fac n\u00e0y, th\u1eed l\u1ea1i nh\u00e9!',
    soulmateLoadingMessages: ['\u0110ang \u0111\u1ecdc t\u1ea7n s\u1ed1 c\u1ea3m x\u00fac...', 'Gi\u1ea3i m\u00e3 n\u0103ng l\u01b0\u1ee3ng t\u00e2m linh...', 'K\u1ebft n\u1ed1i hai v\u0169 tr\u1ee5...', 'Ph\u00e2n t\u00edch nghi\u1ec7p duy\u00ean...', 'AI \u0111ang chi\u00eam tinh...'],
    dobMissingError: 'Vui l\u00f2ng nh\u1eadp \u0111\u1ea7y \u0111\u1ee7 ng\u00e0y, th\u00e1ng, n\u0103m sinh.',
    dayInvalidError: 'Ng\u00e0y sinh kh\u00f4ng h\u1ee3p l\u1ec7 (1-31).',
    monthInvalidError: 'Th\u00e1ng sinh kh\u00f4ng h\u1ee3p l\u1ec7 (1-12).',
    yearInvalidError: 'N\u0103m sinh kh\u00f4ng h\u1ee3p l\u1ec7.',
    dateInvalidError: 'Ng\u00e0y th\u00e1ng n\u0103m sinh kh\u00f4ng t\u1ed3n t\u1ea1i.',
    nameRequiredError: 'Vui l\u00f2ng nh\u1eadp h\u1ecd t\u00ean.',
    dobFormatError: 'Nh\u1eadp ng\u00e0y sinh theo \u0111\u1ecbnh d\u1ea1ng dd/mm/yyyy.',
    compatScoreLabel: '\u0110\u1ed9 t\u01b0\u01a1ng h\u1ee3p',
    soulmateAnalyzing: 'AI T\u00e2m Linh \u0111ang ph\u00e2n t\u00edch duy\u00ean s\u1ed1...',
    exploreNow: 'Kh\u00e1m ph\u00e1 ngay',
    specialEnergy: 'N\u0103ng l\u01b0\u1ee3ng \u0111\u1eb7c bi\u1ec7t',
  },
  en: {
    navExplore: 'Explore',
    navNumerology: 'Numerology',
    navWestern: 'Card Reading',
    navTarot: 'Tarot Reading',
    navSoulmate: 'Compatibility',
    bottomHome: 'Home',
    bottomNumerology: 'Numbers',
    bottomWestern: 'Cards',
    bottomTarot: 'Tarot',
    bottomSoulmate: 'Match',
    heroTagline: 'Potential \u2022 Destiny \u2022 Intuition',
    dailyButton: "Today's cosmic message",
    dailyTitle: 'Cosmic Message',
    dailyLoading: 'Connecting with the stars...',
    dailyAccept: 'Receive',
    cardNumerologyTitle: 'Numerology',
    cardNumerologyDesc: 'Decode life path numbers & personal energy',
    cardWesternTitle: 'Western Card Reading',
    cardWesternDesc: 'Draw 3 cards and receive a cosmic message',
    cardSoulmateTitle: 'Spiritual Compatibility',
    cardSoulmateDesc: 'AI analyzes karmic bonds & relationship signals',
    numerologyTitle: 'Numerology',
    numerologySubtitle: 'Decode life path, destiny, and personal year energy.',
    fullNameLabel: 'Full name',
    fullNamePlaceholder: 'E.g. NGUYEN VAN A',
    birthDateLabel: 'Date of birth',
    dayPlaceholder: 'Day',
    monthPlaceholder: 'Month',
    yearPlaceholder: 'Year',
    analyzeNow: 'Analyze now',
    westernTitle: 'Western Card Reading',
    westernSubtitle: 'Draw 3 cards and receive a cosmic message.',
    tarotTitle: 'Tarot Reading',
    tarotSubtitle: 'Focus on your question, then choose 3 cards from the 78-card tarot deck.',
    tarotQuestionLabel: 'Question',
    tarotQuestionPlaceholder: 'E.g. Where is this relationship going?',
    tarotQuestionError: 'Please enter the question you want to explore.',
    tarotStart: 'Spread tarot cards',
    tarotReset: '\u2190 Draw again',
    tarotPositions: ['Past', 'Present', 'Guidance'],
    tarotReversed: 'Reversed',
    tarotDeckCount: '78-card deck',
    tarotChooseTitle: 'Choose 3 tarot cards',
    tarotChooseDesc: 'Listen to your intuition and choose 3 cards',
    tarotViewResult: 'View result',
    nameLabel: 'Full name',
    nameExample: 'E.g. Alex Nguyen',
    dobLabel: 'Date of birth',
    genderLabel: 'Gender',
    male: 'Male',
    female: 'Female',
    topicLabel: 'Question topic',
    topicLove: 'Love',
    topicCareer: 'Career',
    topicFuture: 'Future',
    topicMoney: 'Money',
    focusText: 'Keep your mind still and focus on your question about',
    startReading: 'Start reading',
    soulmateTitle: 'Spiritual Compatibility',
    soulmateSubtitle: 'AI analyzes karmic bonds & relationship signals.',
    soulmatePerson1: 'First person',
    soulmatePerson2: 'Second person',
    namePlaceholder: 'Full name',
    dobPlaceholder: 'Birth date  dd/mm/yyyy',
    soulmateSubmit: 'Analyze connection',
    footerTagline: 'Powered by AI \u00b7 Pythagorean numerology',
    langLabel: 'Language',
    resultsTitle: 'Analysis results',
    backEdit: '\u2190 Edit',
    lifePath: 'Life Path',
    destiny: 'Destiny',
    soul: 'Soul',
    personality: 'Personality',
    personalYear: 'Personal Year',
    personalYearDesc: 'The main energy guiding your year',
    birthChartTitle: 'Birth Chart',
    birthChartDesc: 'Innate energies on the Pythagorean grid',
    monthlyPeaksTitle: 'Monthly Energy Peaks',
    monthlyPeaksLoading: 'AI is calculating your energy peaks...',
    unlockMonthlyTitle: 'Unlock AI forecast',
    unlockMonthlyDesc: 'Monthly energy peaks are personalized by AI from your core numbers.',
    createMonthlyTitle: 'Create AI forecast',
    createMonthlyDesc: 'Regenerate monthly analysis and deeper interpretation for this profile.',
    createWithAI: 'Create with AI',
    lifePathReport: 'Life Path Number',
    destinyReport: 'Destiny Number',
    unlockAI: 'Unlock AI',
    aiAssistantTitle: 'AI Analysis Assistant',
    aiAssistantDesc: 'Deep, personalized interpretation powered by AI.',
    aiStartPrompt: 'Tap to receive deeper AI interpretation',
    startNow: 'Start now',
    aiThinking: 'AI is thinking...',
    askMorePlaceholder: 'Ask the AI assistant...',
    send: 'Send',
    payCreating: 'Creating payment code...',
    payQrTitle: 'Scan QR to pay',
    payQrFallback: 'Could not load the QR. Transfer manually using the content below.',
    payTransferContent: 'Transfer content',
    cancel: 'Cancel',
    transferred: 'I have transferred',
    paySafe: 'Secure payment \u00b7 One-time unlock',
    payConfirming: 'Confirming payment...',
    payAutoUnlock: 'Unlocks automatically after confirmation.',
    back: '\u2190 Back',
    payNotFound: 'Transaction not found',
    payTimeout: 'Time expired. If you already transferred, contact support.',
    close: 'Close',
    retry: 'Try again',
    shuffleRitual: 'Reading ritual',
    shufflingTitle: 'Shuffling cards',
    shufflingAction: 'Shuffling...',
    shuffleComplete: 'Complete',
    shuffleAction: 'Shuffle',
    shuffleHint: 'Each shuffle helps the deck settle before you choose 3 cards.',
    chooseCardsTitle: 'Choose Cards',
    chooseCardsDesc: 'Listen to your intuition and choose 3 cards',
    topic: 'Topic',
    newReading: '\u2190 New reading',
    readingSummary: 'Reading summary',
    reversed: '(Reversed)',
    cardAiLoading: 'AI is decoding the card meanings for',
    createCardAi: 'Create AI reading',
    unlockCardAi: 'Unlock AI reading',
    cardAiDesc: 'The basic card meanings are visible. AI will personalize the reading to your chosen topic.',
    aiDeepLoading: 'AI is analyzing deeply...',
    compatPreviewTitle: 'Compatibility preview',
    emotionTitle: 'Emotion & Love',
    unlockFullTitle: 'Unlock full analysis',
    unlockFullDesc: 'See the full AI interpretation of emotions, communication, karmic lessons, and relationship warnings.',
    viewFullAnalysis: 'View full analysis',
    unlockFull: 'Unlock full',
    communicationTitle: 'Communication & Conflict',
    karmicTitle: 'Karmic Lessons',
    redFlagTitle: 'Red Flags',
    soulmatePreviewSummary: '{name1} and {name2} have a {percent}% resonance, enough to view the main connection pattern between you.',
    soulmatePreviewEmotion: 'Preview insight: Life Path {lp1} and {lp2} show how your emotional rhythms may support each other when both people listen with care. The full analysis unlocks emotion, communication, karmic lessons, and key relationship warnings.',
    soulmateDateError: 'Enter birth dates in dd/mm/yyyy format',
    soulmateNameError: 'Please enter both full names',
    soulmateAiError: 'AI cannot analyze this right now. Please try again.',
    soulmateLoadingMessages: ['Reading emotional frequency...', 'Decoding spiritual energy...', 'Connecting two universes...', 'Analyzing karmic bonds...', 'AI is consulting the stars...'],
    dobMissingError: 'Please enter day, month, and year of birth.',
    dayInvalidError: 'Birth day is invalid (1-31).',
    monthInvalidError: 'Birth month is invalid (1-12).',
    yearInvalidError: 'Birth year is invalid.',
    dateInvalidError: 'This birth date does not exist.',
    nameRequiredError: 'Please enter your full name.',
    dobFormatError: 'Enter birth date in dd/mm/yyyy format.',
    compatScoreLabel: 'Compatibility',
    soulmateAnalyzing: 'Spiritual AI is analyzing your connection...',
    exploreNow: 'Explore now',
    specialEnergy: 'Special energy',
  },
  zh: {
    navExplore: '\u63a2\u7d22',
    navNumerology: '\u6570\u5b57\u547d\u7406',
    navWestern: '\u897f\u65b9\u7eb8\u724c',
    navTarot: '\u5854\u7f57\u5360\u535c',
    navSoulmate: '\u7075\u9b42\u5951\u5408',
    bottomHome: '\u9996\u9875',
    bottomNumerology: '\u547d\u7406',
    bottomWestern: '\u7eb8\u724c',
    bottomTarot: '\u5854\u7f57',
    bottomSoulmate: '\u5951\u5408',
    heroTagline: '\u6f5c\u80fd \u2022 \u7f18\u5206 \u2022 \u76f4\u89c9',
    dailyButton: '\u4eca\u65e5\u5b87\u5b99\u8baf\u606f',
    dailyTitle: '\u5b87\u5b99\u8baf\u606f',
    dailyLoading: '\u6b63\u5728\u8fde\u63a5\u661f\u8fb0...',
    dailyAccept: '\u63a5\u6536',
    cardNumerologyTitle: '\u6570\u5b57\u547d\u7406',
    cardNumerologyDesc: '\u89e3\u8bfb\u751f\u547d\u9053\u8def\u6570\u5b57\u4e0e\u4e2a\u4eba\u80fd\u91cf',
    cardWesternTitle: '\u897f\u65b9\u7eb8\u724c\u5360\u535c',
    cardWesternDesc: '\u62bd\u53d6 3 \u5f20\u724c\uff0c\u63a5\u6536\u5b87\u5b99\u8baf\u606f',
    cardSoulmateTitle: '\u7075\u9b42\u5951\u5408\u5206\u6790',
    cardSoulmateDesc: 'AI \u5206\u6790\u4e1a\u529b\u7f18\u5206\u4e0e\u60c5\u611f\u63d0\u9192',
    numerologyTitle: '\u6570\u5b57\u547d\u7406',
    numerologySubtitle: '\u89e3\u8bfb\u751f\u547d\u9053\u8def\u3001\u4f7f\u547d\u4e0e\u4e2a\u4eba\u5e74\u80fd\u91cf\u3002',
    fullNameLabel: '\u59d3\u540d',
    fullNamePlaceholder: '\u4f8b\uff1aZHANG SAN',
    birthDateLabel: '\u51fa\u751f\u65e5\u671f',
    dayPlaceholder: '\u65e5',
    monthPlaceholder: '\u6708',
    yearPlaceholder: '\u5e74',
    analyzeNow: '\u7acb\u5373\u5206\u6790',
    westernTitle: '\u897f\u65b9\u7eb8\u724c\u5360\u535c',
    westernSubtitle: '\u62bd\u53d6 3 \u5f20\u724c\uff0c\u63a5\u6536\u5b87\u5b99\u8baf\u606f\u3002',
    tarotTitle: '\u5854\u7f57\u5360\u535c',
    tarotSubtitle: '\u4e13\u6ce8\u4e8e\u4f60\u7684\u95ee\u9898\uff0c\u7136\u540e\u4ece78\u5f20\u5854\u7f57\u724c\u4e2d\u4eb2\u81ea\u9009\u62e93\u5f20\u3002',
    tarotQuestionLabel: '\u60f3\u8981\u7167\u89c1\u7684\u95ee\u9898',
    tarotQuestionPlaceholder: '\u4f8b\uff1a\u8fd9\u6bb5\u5173\u7cfb\u4f1a\u8d70\u5411\u54ea\u91cc\uff1f',
    tarotQuestionError: '\u8bf7\u8f93\u5165\u4f60\u60f3\u63a2\u7d22\u7684\u95ee\u9898\u3002',
    tarotStart: '\u5c55\u5f00\u5854\u7f57\u724c',
    tarotReset: '\u2190 \u91cd\u65b0\u62bd\u724c',
    tarotPositions: ['\u8fc7\u53bb', '\u73b0\u5728', '\u6307\u5f15'],
    tarotReversed: '\u9006\u4f4d',
    tarotDeckCount: '78\u5f20\u724c\u7ec4',
    tarotChooseTitle: '\u9009\u62e93\u5f20\u5854\u7f57\u724c',
    tarotChooseDesc: '\u503e\u542c\u76f4\u89c9\uff0c\u9009\u62e93\u5f20\u724c',
    tarotViewResult: '\u67e5\u770b\u7ed3\u679c',
    nameLabel: '\u59d3\u540d',
    nameExample: '\u4f8b\uff1aZHANG SAN',
    dobLabel: '\u51fa\u751f\u65e5\u671f',
    genderLabel: '\u6027\u522b',
    male: '\u7537',
    female: '\u5973',
    topicLabel: '\u95ee\u9898\u4e3b\u9898',
    topicLove: '\u611f\u60c5',
    topicCareer: '\u4e8b\u4e1a',
    topicFuture: '\u672a\u6765',
    topicMoney: '\u91d1\u94b1',
    focusText: '\u8bf7\u4fdd\u6301\u5fc3\u5883\u5b89\u9759\uff0c\u4e13\u6ce8\u4e8e\u4f60\u5173\u4e8e\u8fd9\u4e2a\u4e3b\u9898\u7684\u95ee\u9898',
    startReading: '\u5f00\u59cb\u5360\u535c',
    soulmateTitle: '\u7075\u9b42\u5951\u5408\u5206\u6790',
    soulmateSubtitle: 'AI \u5206\u6790\u4e1a\u529b\u7f18\u5206\u4e0e\u60c5\u611f\u63d0\u9192\u3002',
    soulmatePerson1: '\u7b2c\u4e00\u4f4d',
    soulmatePerson2: '\u7b2c\u4e8c\u4f4d',
    namePlaceholder: '\u59d3\u540d',
    dobPlaceholder: '\u51fa\u751f\u65e5\u671f  dd/mm/yyyy',
    soulmateSubmit: '\u5206\u6790\u7f18\u5206',
    footerTagline: '\u7531 AI \u9a71\u52a8 \u00b7 \u6bd5\u8fbe\u54e5\u62c9\u65af\u6570\u5b57\u547d\u7406',
    langLabel: '\u8bed\u8a00',
    resultsTitle: '\u5206\u6790\u7ed3\u679c',
    backEdit: '\u2190 \u91cd\u586b',
    lifePath: '\u751f\u547d\u9053\u8def',
    destiny: '\u4f7f\u547d',
    soul: '\u7075\u9b42',
    personality: '\u4eba\u683c',
    personalYear: '\u4e2a\u4eba\u5e74',
    personalYearDesc: '\u4eca\u5e74\u5f15\u5bfc\u4f60\u7684\u4e3b\u8981\u80fd\u91cf',
    birthChartTitle: '\u51fa\u751f\u56fe\u8868',
    birthChartDesc: '\u6bd5\u8fbe\u54e5\u62c9\u65af\u6570\u5b57\u683c\u4e2d\u7684\u5148\u5929\u80fd\u91cf',
    monthlyPeaksTitle: '\u6708\u5ea6\u80fd\u91cf\u9ad8\u5cf0',
    monthlyPeaksLoading: 'AI \u6b63\u5728\u8ba1\u7b97\u4f60\u7684\u80fd\u91cf\u9ad8\u5cf0...',
    unlockMonthlyTitle: '\u89e3\u9501 AI \u9884\u6d4b',
    unlockMonthlyDesc: '\u6708\u5ea6\u80fd\u91cf\u9ad8\u5cf0\u5c06\u7531 AI \u6839\u636e\u4f60\u7684\u6838\u5fc3\u6570\u5b57\u4e2a\u6027\u5316\u89e3\u8bfb\u3002',
    createMonthlyTitle: '\u751f\u6210 AI \u9884\u6d4b',
    createMonthlyDesc: '\u4e3a\u5f53\u524d\u6863\u6848\u91cd\u65b0\u751f\u6210\u6708\u5ea6\u5206\u6790\u548c\u6df1\u5ea6\u89e3\u8bfb\u3002',
    createWithAI: '\u7528 AI \u751f\u6210',
    lifePathReport: '\u751f\u547d\u9053\u8def\u6570',
    destinyReport: '\u4f7f\u547d\u6570',
    unlockAI: '\u89e3\u9501 AI',
    aiAssistantTitle: 'AI \u5206\u6790\u52a9\u624b',
    aiAssistantDesc: '\u7531 AI \u63d0\u4f9b\u6df1\u5ea6\u4e2a\u6027\u5316\u89e3\u8bfb\u3002',
    aiStartPrompt: '\u70b9\u51fb\u83b7\u53d6\u66f4\u6df1\u5165\u7684 AI \u89e3\u8bfb',
    startNow: '\u7acb\u5373\u5f00\u59cb',
    aiThinking: 'AI \u6b63\u5728\u601d\u8003...',
    askMorePlaceholder: '\u7ee7\u7eed\u8be2\u95ee AI \u52a9\u624b...',
    send: '\u53d1\u9001',
    payCreating: '\u6b63\u5728\u751f\u6210\u4ed8\u6b3e\u7801...',
    payQrTitle: '\u626b\u7801\u4ed8\u6b3e',
    payQrFallback: '\u65e0\u6cd5\u52a0\u8f7d QR\u3002\u8bf7\u4f7f\u7528\u4e0b\u65b9\u5185\u5bb9\u624b\u52a8\u8f6c\u8d26\u3002',
    payTransferContent: '\u8f6c\u8d26\u5185\u5bb9',
    cancel: '\u53d6\u6d88',
    transferred: '\u6211\u5df2\u8f6c\u8d26',
    paySafe: '\u5b89\u5168\u4ed8\u6b3e \u00b7 \u4e00\u6b21\u89e3\u9501',
    payConfirming: '\u6b63\u5728\u786e\u8ba4\u4ed8\u6b3e...',
    payAutoUnlock: '\u786e\u8ba4\u540e\u5c06\u81ea\u52a8\u89e3\u9501\u3002',
    back: '\u2190 \u8fd4\u56de',
    payNotFound: '\u672a\u627e\u5230\u4ea4\u6613',
    payTimeout: '\u5df2\u8d85\u65f6\u3002\u5982\u679c\u5df2\u8f6c\u8d26\uff0c\u8bf7\u8054\u7cfb\u5ba2\u670d\u3002',
    close: '\u5173\u95ed',
    retry: '\u91cd\u8bd5',
    shuffleRitual: '\u5360\u535c\u4eea\u5f0f',
    shufflingTitle: '\u6b63\u5728\u6d17\u724c',
    shufflingAction: '\u6d17\u724c\u4e2d...',
    shuffleComplete: '\u5b8c\u6210',
    shuffleAction: '\u6d17\u724c',
    shuffleHint: '\u6bcf\u6b21\u6d17\u724c\u90fd\u5e2e\u52a9\u724c\u7ec4\u5728\u9009\u51fa 3 \u5f20\u524d\u7a33\u5b9a\u80fd\u91cf\u3002',
    chooseCardsTitle: '\u9009\u724c',
    chooseCardsDesc: '\u503e\u542c\u76f4\u89c9\uff0c\u9009\u62e9 3 \u5f20\u724c',
    topic: '\u4e3b\u9898',
    newReading: '\u2190 \u65b0\u5360\u535c',
    readingSummary: '\u5360\u535c\u6458\u8981',
    reversed: '(\u9006\u4f4d)',
    cardAiLoading: 'AI \u6b63\u5728\u89e3\u8bfb\u8be5\u4e3b\u9898\u7684\u724c\u610f',
    createCardAi: '\u751f\u6210 AI \u89e3\u8bfb',
    unlockCardAi: '\u89e3\u9501 AI \u89e3\u8bfb',
    cardAiDesc: '\u57fa\u7840\u724c\u610f\u5df2\u663e\u793a\u3002AI \u5c06\u6839\u636e\u4f60\u9009\u62e9\u7684\u4e3b\u9898\u4e2a\u6027\u5316\u89e3\u8bfb\u3002',
    aiDeepLoading: 'AI \u6b63\u5728\u6df1\u5ea6\u5206\u6790...',
    compatPreviewTitle: '\u5951\u5408\u9884\u89c8',
    emotionTitle: '\u60c5\u611f\u4e0e\u7231',
    unlockFullTitle: '\u89e3\u9501\u5b8c\u6574\u5206\u6790',
    unlockFullDesc: '\u67e5\u770b AI \u5bf9\u60c5\u611f\u3001\u6c9f\u901a\u3001\u4e1a\u529b\u8bfe\u9898\u548c\u5173\u7cfb\u63d0\u9192\u7684\u5b8c\u6574\u89e3\u8bfb\u3002',
    viewFullAnalysis: '\u67e5\u770b\u5b8c\u6574\u5206\u6790',
    unlockFull: '\u89e3\u9501\u5b8c\u6574\u7248',
    communicationTitle: '\u6c9f\u901a\u4e0e\u51b2\u7a81',
    karmicTitle: '\u4e1a\u529b\u8bfe\u9898',
    redFlagTitle: '\u9700\u6ce8\u610f\u7684\u98ce\u9669',
    soulmatePreviewSummary: '{name1} \u548c {name2} \u7684\u5171\u9e23\u5ea6\u4e3a {percent}%\uff0c\u8db3\u4ee5\u67e5\u770b\u4e24\u4eba\u7684\u4e3b\u8981\u8fde\u7ed3\u65b9\u5411\u3002',
    soulmatePreviewEmotion: '\u9884\u89c8\u89e3\u8bfb\uff1a\u751f\u547d\u9053\u8def {lp1} \u548c {lp2} \u663e\u793a\u4e24\u4eba\u7684\u60c5\u611f\u8282\u594f\u5728\u7528\u5fc3\u503e\u542c\u65f6\u53ef\u4ee5\u4e92\u76f8\u652f\u6301\u3002\u5b8c\u6574\u5206\u6790\u5c06\u89e3\u9501\u60c5\u611f\u3001\u6c9f\u901a\u3001\u4e1a\u529b\u8bfe\u9898\u548c\u5173\u7cfb\u63d0\u9192\u3002',
    soulmateDateError: '\u8bf7\u6309 dd/mm/yyyy \u683c\u5f0f\u8f93\u5165\u51fa\u751f\u65e5\u671f',
    soulmateNameError: '\u8bf7\u8f93\u5165\u4e24\u4eba\u7684\u5b8c\u6574\u59d3\u540d',
    soulmateAiError: 'AI \u73b0\u5728\u65e0\u6cd5\u5206\u6790\uff0c\u8bf7\u7a0d\u540e\u91cd\u8bd5\u3002',
    soulmateLoadingMessages: ['\u6b63\u5728\u8bfb\u53d6\u60c5\u611f\u9891\u7387...', '\u6b63\u5728\u89e3\u7801\u7075\u6027\u80fd\u91cf...', '\u6b63\u5728\u8fde\u63a5\u4e24\u4e2a\u5b87\u5b99...', '\u6b63\u5728\u5206\u6790\u4e1a\u529b\u7f18\u5206...', 'AI \u6b63\u5728\u89c2\u661f...'],
    dobMissingError: '\u8bf7\u8f93\u5165\u5b8c\u6574\u7684\u51fa\u751f\u65e5\u3001\u6708\u3001\u5e74\u3002',
    dayInvalidError: '\u51fa\u751f\u65e5\u65e0\u6548 (1-31)\u3002',
    monthInvalidError: '\u51fa\u751f\u6708\u65e0\u6548 (1-12)\u3002',
    yearInvalidError: '\u51fa\u751f\u5e74\u65e0\u6548\u3002',
    dateInvalidError: '\u8be5\u51fa\u751f\u65e5\u671f\u4e0d\u5b58\u5728\u3002',
    nameRequiredError: '\u8bf7\u8f93\u5165\u5b8c\u6574\u59d3\u540d\u3002',
    dobFormatError: '\u8bf7\u6309 dd/mm/yyyy \u683c\u5f0f\u8f93\u5165\u51fa\u751f\u65e5\u671f\u3002',
    compatScoreLabel: '\u5951\u5408\u5ea6',
    soulmateAnalyzing: '\u7075\u6027 AI \u6b63\u5728\u5206\u6790\u4f60\u4eec\u7684\u7f18\u5206...',
    exploreNow: '\u7acb\u5373\u63a2\u7d22',
    specialEnergy: '\u7279\u6b8a\u80fd\u91cf',
  },
};

const useMousePosition = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarsePointer || prefersReducedMotion) {
      document.documentElement.style.setProperty('--parallax-x', '0px');
      document.documentElement.style.setProperty('--parallax-y', '0px');
      return undefined;
    }

    let rafId = 0;
    let nextX = 0;
    let nextY = 0;
    const commit = () => {
      rafId = 0;
      document.documentElement.style.setProperty('--parallax-x', `${nextX}px`);
      document.documentElement.style.setProperty('--parallax-y', `${nextY}px`);
    };
    const handleMouseMove = (e) => {
      nextX = (e.clientX / window.innerWidth - 0.5) * 26;
      nextY = (e.clientY / window.innerHeight - 0.5) * 26;
      if (!rafId) rafId = requestAnimationFrame(commit);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);
};

const ShootingStars = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isCoarsePointer || prefersReducedMotion) return undefined;

    const interval = setInterval(() => {
      if (Math.random() > 0.62) {
        setStars(prev => [
          ...prev.slice(-2),
          {
            id: Date.now(),
            x: 10 + Math.random() * 80,
            y: 4 + Math.random() * 34,
            drift: 18 + Math.random() * 18,
            drop: 10 + Math.random() * 12,
            length: 54 + Math.random() * 52,
            duration: 1.15 + Math.random() * 0.75,
            angle: -28 - Math.random() * 16,
            delay: Math.random() * 0.2
          }
        ]);
      }
    }, 5200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="shooting-stars-layer">
      <AnimatePresence>
        {stars.map(star => (
          <motion.div
            key={star.id}
            className="shooting-star"
            initial={{ opacity: 0, x: `${star.x}vw`, y: `${star.y}vh`, scaleX: 0.45 }}
            animate={{
              opacity: [0, 0.75, 0.55, 0],
              x: `${star.x - star.drift}vw`,
              y: `${star.y + star.drop}vh`,
              scaleX: [0.55, 1, 0.92, 0.25]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: star.duration, delay: star.delay, ease: [0.2, 0.65, 0.2, 1] }}
            style={{ width: star.length, rotate: `${star.angle}deg` }}
          >
            <span />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const getContextualCardMeaning = (card, category, language = 'vi') => {
  const rank = decodeMojibake(card.rank);
  const suit = decodeMojibake(card.suit);
  const symbol = decodeMojibake(card.symbol);
  const topic = decodeMojibake(category);
  const isReversed = card.isReversed;
  const topicKey = {
    [TOPICS.LOVE]: 'love',
    [TOPICS.CAREER]: 'career',
    [TOPICS.MONEY]: 'money',
    [TOPICS.FUTURE]: 'future',
  }[topic] || 'future';

  if (language === 'en' || language === 'zh') {
    const categoryLabel = {
      en: { love: 'love', career: 'career', money: 'money', future: 'future' },
      zh: { love: '\u611f\u60c5', career: '\u4e8b\u4e1a', money: '\u91d1\u94b1', future: '\u672a\u6765' },
    }[language][topicKey] || topic;
    const tone = {
      en: {
        [SUITS.HEARTS]: 'emotions, care, and intuitive connection',
        [SUITS.DIAMONDS]: 'movement, news, choices, and changing circumstances',
        [SUITS.CLUBS]: 'steady effort, practical action, work, and resources',
        [SUITS.SPADES]: 'pressure, hidden concerns, or a challenge that needs patience',
      },
      zh: {
        [SUITS.HEARTS]: '\u60c5\u611f\u3001\u5173\u5fc3\u548c\u76f4\u89c9\u8fde\u7ed3',
        [SUITS.DIAMONDS]: '\u53d8\u52a8\u3001\u6d88\u606f\u3001\u9009\u62e9\u548c\u5c40\u52bf\u8f6c\u6362',
        [SUITS.CLUBS]: '\u7a33\u5b9a\u52aa\u529b\u3001\u5b9e\u9645\u884c\u52a8\u3001\u5de5\u4f5c\u548c\u8d44\u6e90',
        [SUITS.SPADES]: '\u538b\u529b\u3001\u9690\u85cf\u62c5\u5fe7\u6216\u9700\u8981\u8010\u5fc3\u5904\u7406\u7684\u6311\u6218',
      }
    }[language][symbol] || (language === 'en' ? 'a mixed signal' : '\u590d\u6742\u4fe1\u53f7');
    const direction = isReversed
      ? (language === 'en' ? 'Move slowly, check assumptions, and avoid quick conclusions.' : '\u8bf7\u653e\u6162\u8282\u594f\uff0c\u68c0\u67e5\u9884\u671f\uff0c\u4e0d\u8981\u8fc7\u65e9\u4e0b\u7ed3\u8bba\u3002')
      : (language === 'en' ? 'You can take initiative, while still watching the practical signs.' : '\u4f60\u53ef\u4ee5\u66f4\u4e3b\u52a8\uff0c\u4f46\u4ecd\u8981\u7559\u610f\u73b0\u5b9e\u4e2d\u7684\u4fe1\u53f7\u3002');

    return language === 'en'
      ? `For ${categoryLabel}, the ${rank} ${suit} points to ${tone}. ${direction}`
      : `\u5173\u4e8e${categoryLabel}\uff0c${rank} ${suit} \u663e\u793a${tone}\u3002${direction}`;
  }

  const baseTone = isReversed
    ? 'n\u0103ng l\u01b0\u1ee3ng \u0111ang b\u1ecb ch\u1eb7n ho\u1eb7c \u0111i ch\u1eadm h\u01a1n d\u1ef1 t\u00ednh'
    : 'n\u0103ng l\u01b0\u1ee3ng \u0111ang m\u1edf ra kh\u00e1 r\u00f5';

  const suitTone = {
    [SUITS.HEARTS]: {
      love: 'c\u1ea3m x\u00fac th\u1eadt, s\u1ef1 quan t\u00e2m v\u00e0 kh\u1ea3 n\u0103ng ti\u1ebfn g\u1ea7n nhau h\u01a1n',
      career: 'm\u1ed1i quan h\u1ec7 n\u01a1i l\u00e0m vi\u1ec7c, s\u1ef1 h\u1ed7 tr\u1ee3 v\u00e0 thi\u1ec7n c\u1ea3m t\u1eeb ng\u01b0\u1eddi kh\u00e1c',
      money: 'ti\u1ec1n b\u1ea1c ch\u1ecbu \u1ea3nh h\u01b0\u1edfng b\u1edfi gia \u0111\u00ecnh, c\u1ea3m x\u00fac ho\u1eb7c ng\u01b0\u1eddi th\u00e2n',
      future: 'm\u1ed9t giai \u0111o\u1ea1n m\u1ec1m l\u1ea1i, d\u1ec5 c\u00f3 tin vui ho\u1eb7c s\u1ef1 h\u00e0n g\u1eafn',
    },
    [SUITS.DIAMONDS]: {
      love: 'tin nh\u1eafn, kho\u1ea3ng c\u00e1ch, s\u1ef1 d\u1ecbch chuy\u1ec3n ho\u1eb7c thay \u0111\u1ed5i trong c\u00e1ch hai ng\u01b0\u1eddi t\u01b0\u01a1ng t\u00e1c',
      career: 'c\u01a1 h\u1ed9i m\u1edbi, thay \u0111\u1ed5i nh\u1ecbp l\u00e0m vi\u1ec7c ho\u1eb7c vi\u1ec7c c\u1ea7n quy\u1ebft nhanh',
      money: 'd\u00f2ng ti\u1ec1n bi\u1ebfn \u0111\u1ed9ng, kho\u1ea3n chi ho\u1eb7c thu \u0111\u1ebfn nhanh v\u00e0 c\u1ea7n t\u00ednh k\u1ef9',
      future: 'm\u1ed9t chuy\u1ec3n \u0111\u1ed9ng m\u1edbi s\u1eafp xu\u1ea5t hi\u1ec7n, nh\u01b0ng c\u1ea7n t\u1ec9nh t\u00e1o khi ra quy\u1ebft \u0111\u1ecbnh',
    },
    [SUITS.CLUBS]: {
      love: 's\u1ef1 \u1ed5n \u0111\u1ecbnh, th\u1ef1c t\u1ebf v\u00e0 c\u00e1ch hai ng\u01b0\u1eddi x\u00e2y d\u1ef1ng ni\u1ec1m tin qua h\u00e0nh \u0111\u1ed9ng',
      career: 'n\u1ec1n t\u1ea3ng c\u00f4ng vi\u1ec7c, k\u1ef9 n\u0103ng, \u0111\u1ed3ng nghi\u1ec7p v\u00e0 k\u1ebft qu\u1ea3 \u0111\u1ebfn t\u1eeb s\u1ef1 b\u1ec1n b\u1ec9',
      money: 'ngu\u1ed3n l\u1ee3i nh\u1ecf, kh\u1ea3 n\u0103ng xoay x\u1edf v\u00e0 b\u00e0i h\u1ecdc v\u1ec1 qu\u1ea3n l\u00fd t\u00e0i ch\u00ednh',
      future: 'k\u1ebft qu\u1ea3 \u0111\u1ebfn ch\u1eadm nh\u01b0ng ch\u1eafc, mi\u1ec5n l\u00e0 b\u1ea1n \u0111i t\u1eebng b\u01b0\u1edbc r\u00f5 r\u00e0ng',
    },
    [SUITS.SPADES]: {
      love: 'kh\u00fac m\u1eafc, im l\u1eb7ng, hi\u1ec3u l\u1ea7m ho\u1eb7c c\u1ea3m gi\u00e1c b\u1ea5t an c\u1ea7n \u0111\u01b0\u1ee3c n\u00f3i r\u00f5',
      career: '\u00e1p l\u1ef1c, c\u1ea1nh tranh ho\u1eb7c tr\u1edf ng\u1ea1i c\u1ea7n x\u1eed l\u00fd b\u1eb1ng k\u1ef7 lu\u1eadt',
      money: 'r\u1ee7i ro hao h\u1ee5t, kho\u1ea3n chi b\u1ea5t ng\u1edd ho\u1eb7c quy\u1ebft \u0111\u1ecbnh t\u00e0i ch\u00ednh c\u1ea7n tr\u00e1nh n\u00f3ng v\u1ed9i',
      future: 'm\u1ed9t th\u1eed th\u00e1ch \u0111ang nh\u1eafc b\u1ea1n th\u1eadn tr\u1ecdng tr\u01b0\u1edbc khi b\u01b0\u1edbc ti\u1ebfp',
    },
  };

  const theme = suitTone[symbol]?.[topicKey] || decodeMojibake(card.isReversed && card.meaningReversed ? card.meaningReversed : (card.meaningUpright || card.meaning));
  const direction = isReversed
    ? 'B\u1ea1n n\u00ean ch\u1eadm l\u1ea1i, ki\u1ec3m tra k\u1ef3 v\u1ecdng v\u00e0 \u0111\u1eebng v\u1ed9i k\u1ebft lu\u1eadn.'
    : 'B\u1ea1n c\u00f3 th\u1ec3 ch\u1ee7 \u0111\u1ed9ng h\u01a1n, nh\u01b0ng v\u1eabn n\u00ean quan s\u00e1t t\u00edn hi\u1ec7u th\u1ef1c t\u1ebf.';

  return `V\u1edbi ch\u1ee7 \u0111\u1ec1 ${topic}, l\u00e1 ${rank} ${suit} cho th\u1ea5y ${theme}; ${baseTone}. ${direction}`;
};

const getQuickSummary = (cards, language = 'vi') => {
  if (!cards || cards.length === 0) return '';
  const suits = cards.map(c => decodeMojibake(c.symbol));
  const counts = {};
  suits.forEach(s => counts[s] = (counts[s] || 0) + 1);

  let maxSuit = SUITS.HEARTS;
  let maxCount = 0;
  for (const s in counts) {
    if (counts[s] > maxCount) {
      maxCount = counts[s];
      maxSuit = s;
    }
  }

  const summariesByLanguage = {
    vi: {
      [SUITS.HEARTS]: 'Qu\u1ebb b\u00e0i mang n\u0103ng l\u01b0\u1ee3ng t\u00edch c\u1ef1c c\u1ee7a t\u00ecnh c\u1ea3m v\u00e0 tr\u1ef1c gi\u00e1c. M\u1ecdi vi\u1ec7c \u0111ang h\u01b0\u1edbng t\u1edbi s\u1ef1 h\u00e0i h\u00f2a, h\u00e3y l\u1eafng nghe con tim d\u1eabn l\u1ed1i.',
      [SUITS.DIAMONDS]: 'Qu\u1ebb b\u00e0i cho th\u1ea5y s\u1ef1 chuy\u1ec3n d\u1ecbch, tin t\u1ee9c ho\u1eb7c c\u01a1 h\u1ed9i m\u1edbi \u0111ang \u0111\u1ebfn. B\u1ea1n c\u1ea7n nhanh nh\u1ea1y n\u1eafm b\u1eaft v\u00e0 t\u00ednh to\u00e1n k\u1ef9 l\u01b0\u1ee1ng.',
      [SUITS.CLUBS]: 'N\u0103ng l\u01b0\u1ee3ng c\u1ee7a s\u1ef1 b\u1ec1n b\u1ec9, c\u00f4ng vi\u1ec7c v\u00e0 t\u00e0i ch\u00ednh \u0111ang l\u00e0m ch\u1ee7. K\u1ebft qu\u1ea3 t\u1ed1t \u0111\u1eb9p s\u1ebd \u0111\u1ebfn t\u1eeb h\u00e0nh \u0111\u1ed9ng th\u1ef1c t\u1ebf c\u1ee7a b\u1ea1n.',
      [SUITS.SPADES]: 'Qu\u1ebb b\u00e0i c\u1ea3nh b\u00e1o th\u1eed th\u00e1ch, tr\u1edf ng\u1ea1i ho\u1eb7c \u00e1p l\u1ef1c d\u1ed3n n\u00e9n. \u0110\u00e2y l\u00e0 l\u00fac b\u1ea1n c\u1ea7n ch\u1eadm l\u1ea1i v\u00e0 th\u1eadn tr\u1ecdng trong m\u1ecdi quy\u1ebft \u0111\u1ecbnh.'
    },
    en: {
      [SUITS.HEARTS]: 'This reading is led by emotion and intuition. Harmony is possible when you listen to what feels true.',
      [SUITS.DIAMONDS]: 'This reading points to movement, news, or a new opportunity. Stay alert and make decisions with care.',
      [SUITS.CLUBS]: 'Steady effort, work, and practical resources are central here. Progress comes through grounded action.',
      [SUITS.SPADES]: 'This reading warns of pressure, obstacles, or hidden tension. Slow down and choose carefully.'
    },
    zh: {
      [SUITS.HEARTS]: '\u8fd9\u7ec4\u724c\u4ee5\u60c5\u611f\u548c\u76f4\u89c9\u4e3a\u4e3b\u3002\u5f53\u4f60\u503e\u542c\u771f\u5b9e\u611f\u53d7\u65f6\uff0c\u548c\u8c10\u5c31\u6709\u673a\u4f1a\u51fa\u73b0\u3002',
      [SUITS.DIAMONDS]: '\u8fd9\u7ec4\u724c\u6307\u5411\u53d8\u52a8\u3001\u6d88\u606f\u6216\u65b0\u673a\u4f1a\u3002\u4fdd\u6301\u654f\u9510\uff0c\u5e76\u8c28\u614e\u51b3\u5b9a\u3002',
      [SUITS.CLUBS]: '\u7a33\u5b9a\u52aa\u529b\u3001\u5de5\u4f5c\u548c\u5b9e\u9645\u8d44\u6e90\u662f\u6838\u5fc3\u3002\u8fdb\u5c55\u6765\u81ea\u624e\u5b9e\u884c\u52a8\u3002',
      [SUITS.SPADES]: '\u8fd9\u7ec4\u724c\u63d0\u9192\u4f60\u6ce8\u610f\u538b\u529b\u3001\u963b\u788d\u6216\u9690\u85cf\u7d27\u5f20\u3002\u653e\u6162\u811a\u6b65\uff0c\u8c28\u614e\u9009\u62e9\u3002'
    }
  };

  const summaries = summariesByLanguage[language] || summariesByLanguage.vi;
  return summaries[maxSuit] || summaries[SUITS.HEARTS];
};

const getDisplayCardName = (card, language = 'vi') => {
  const rankMap = {
    vi: { '\u00c1t': 'A', 'B\u1ed3i': 'J', '\u0110\u1ea7m': 'Q', 'Gi\u00e0': 'K' },
    en: { '\u00c1t': 'Ace', 'B\u1ed3i': 'Jack', '\u0110\u1ea7m': 'Queen', 'Gi\u00e0': 'King' },
    zh: { '\u00c1t': 'A', 'B\u1ed3i': 'J', '\u0110\u1ea7m': 'Q', 'Gi\u00e0': 'K' },
  };
  const suitMap = {
    vi: { [SUITS.HEARTS]: 'C\u01a1', [SUITS.DIAMONDS]: 'R\u00f4', [SUITS.CLUBS]: 'Chu\u1ed3n', [SUITS.SPADES]: 'B\u00edch' },
    en: { [SUITS.HEARTS]: 'Hearts', [SUITS.DIAMONDS]: 'Diamonds', [SUITS.CLUBS]: 'Clubs', [SUITS.SPADES]: 'Spades' },
    zh: { [SUITS.HEARTS]: '\u7ea2\u5fc3', [SUITS.DIAMONDS]: '\u65b9\u5757', [SUITS.CLUBS]: '\u6885\u82b1', [SUITS.SPADES]: '\u9ed1\u6843' },
  };
  const lang = rankMap[language] ? language : 'vi';
  const rank = decodeMojibake(card.rank);
  const symbol = decodeMojibake(card.symbol);
  const suit = decodeMojibake(card.suit);
  const displayRank = rankMap[lang][rank] || rank;
  const displaySuit = suitMap[lang][symbol] || suit;
  return `${displayRank} ${displaySuit}`;
};

const TAROT_MAJOR_PERSONALITIES = {
  'The Fool': {
    upright: {
      pulse: 'Có một phần trong bạn muốn bước tới trước khi mọi thứ thật sự chắc chắn.',
      shadow: 'Sự non trẻ ở đây không yếu đuối; nó chỉ chưa biết mình sẽ gặp điều gì sau bước đầu tiên.',
      guidance: 'Hãy để sự tò mò dẫn đường, nhưng đừng bỏ qua những dấu hiệu nhỏ đang xin bạn chậm lại.',
    },
    reversed: {
      pulse: 'Bạn có thể đang đứng trước một lựa chọn mà bên ngoài trông tự do, nhưng bên trong lại thấy chênh vênh.',
      shadow: 'Lá này đảo chiều thường xuất hiện khi sự bốc đồng đang che đi một nỗi sợ bị mắc kẹt.',
      guidance: 'Đừng vội nhảy chỉ để thoát khỏi cảm giác hiện tại. Hãy chắc rằng bước đi này thật sự là của bạn.',
    },
  },
  'The Magician': {
    upright: {
      pulse: 'Bạn đang có nhiều thứ trong tay hơn mình nghĩ.',
      shadow: 'Điều còn thiếu không hẳn là năng lực, mà là khoảnh khắc bạn quyết định gom chúng lại thành một hướng rõ ràng.',
      guidance: 'Hãy chọn một việc để bắt đầu. Sức mạnh của lá này nằm ở hành động cụ thể, không phải chờ thêm dấu hiệu.',
    },
    reversed: {
      pulse: 'Có điều gì đó trong bạn đang bị phân tán, như thể càng cố kiểm soát thì càng khó thấy trọng tâm.',
      shadow: 'Lá này đảo chiều nhắc rằng bạn có thể đang dùng quá nhiều năng lượng để thuyết phục người khác, thay vì thành thật với mình.',
      guidance: 'Quay lại với điều đơn giản nhất: bạn thật sự muốn tạo ra điều gì từ tình huống này?',
    },
  },
  'The High Priestess': {
    upright: {
      pulse: 'Bạn đã cảm thấy điều này từ trước, chỉ là chưa muốn gọi tên nó.',
      shadow: 'Lá này đi rất khẽ. Nó thường xuất hiện khi trực giác biết nhiều hơn những gì lý trí đang cho phép.',
      guidance: 'Đừng ép câu trả lời phải ồn ào. Hãy tin vào phần trong bạn vẫn im lặng nhưng rất tỉnh.',
    },
    reversed: {
      pulse: 'Có quá nhiều tiếng nói bên ngoài khiến bạn khó nghe được tiếng của chính mình.',
      shadow: 'Khi lá này đảo chiều, điều bị che giấu đôi khi không nằm ở người khác, mà ở cảm giác bạn đang né tránh.',
      guidance: 'Tạm rời khỏi những suy đoán. Một khoảng lặng thật sự sẽ cho bạn biết điều gì đang lệch.',
    },
  },
  'The Empress': {
    upright: {
      pulse: 'Bạn đang cần được nâng niu theo cách mềm hơn, không phải chỉ tiếp tục cho đi.',
      shadow: 'Lá này mang cảm giác ấm, nhưng cũng nhắc rằng sự sống chỉ nở ra khi có đủ chăm sóc.',
      guidance: 'Hãy để điều gì lành mạnh được lớn lên chậm rãi. Đừng ép mình phải nở hoa trong một nơi khiến bạn cạn sức.',
    },
    reversed: {
      pulse: 'Bạn có thể đã chăm sóc quá nhiều thứ mà quên hỏi mình còn đủ đầy không.',
      shadow: 'Khi The Empress đảo chiều, sự dịu dàng dễ biến thành kiệt sức vì cho đi mà không được đáp lại.',
      guidance: 'Rút bớt năng lượng khỏi nơi chỉ nhận. Việc quay về chăm mình không phải ích kỷ.',
    },
  },
  'The Emperor': {
    upright: {
      pulse: 'Bạn đang cần một ranh giới rõ hơn để không bị cuốn theo cảm xúc của tình huống.',
      shadow: 'Lá này không lạnh lùng; nó chỉ hỏi bạn có đang đủ vững để giữ điều quan trọng không.',
      guidance: 'Hãy đặt lại cấu trúc. Một quyết định bình tĩnh có thể bảo vệ bạn nhiều hơn một phản ứng mạnh.',
    },
    reversed: {
      pulse: 'Có thứ gì đó đang bị siết quá chặt, đến mức cả bạn cũng khó thở trong chính lựa chọn của mình.',
      shadow: 'The Emperor đảo chiều thường nói về kiểm soát, hoặc nỗi sợ mất kiểm soát được ngụy trang thành lý trí.',
      guidance: 'Nới tay một chút. Điều bền vững không cần lúc nào cũng được giữ bằng sức ép.',
    },
  },
  'The Hierophant': {
    upright: {
      pulse: 'Bạn đang đứng trước một điều liên quan đến niềm tin, cam kết, hoặc khuôn mẫu mà mình từng xem là đúng.',
      shadow: 'The Hierophant mang nhịp trang nghiêm: nó không vội phá bỏ, mà hỏi điều gì trong bạn thật sự còn đáng tin.',
      guidance: 'Hãy phân biệt giữa lời khuyên có nền tảng và một quy tắc chỉ còn tồn tại vì thói quen.',
    },
    reversed: {
      pulse: 'Có một phần trong bạn không còn muốn đi theo cách cũ, dù vẫn sợ bị xem là sai.',
      shadow: 'The Hierophant đảo chiều thường xuất hiện khi niềm tin vay mượn bắt đầu nứt ra.',
      guidance: 'Đừng nổi loạn chỉ để thoát ra. Hãy chọn điều khiến bạn sống thật hơn với chính mình.',
    },
  },
  'The Lovers': {
    upright: {
      pulse: 'Trọng tâm ở đây không chỉ là cảm xúc, mà là một lựa chọn chạm vào giá trị thật của bạn.',
      shadow: 'The Lovers có nhịp mềm nhưng sắc: nó kéo hai phía lại gần để xem chúng có thật sự cùng hướng không.',
      guidance: 'Hãy nhìn vào sự thành thật, không chỉ sự hấp dẫn. Điều nào khiến bạn thấy mình nguyên vẹn hơn mới là điều đáng nghe.',
    },
    reversed: {
      pulse: 'Có sự lệch nhịp giữa điều trái tim muốn và điều bạn biết là đúng với mình.',
      shadow: 'The Lovers đảo chiều thường không nói về thiếu tình cảm, mà về một lựa chọn đang thiếu sự đồng thuận bên trong.',
      guidance: 'Đừng cố gọi sự mâu thuẫn là định mệnh. Hãy quay về với điều khiến bạn bớt phải tự phản bội mình.',
    },
  },
  'The Chariot': {
    upright: {
      pulse: 'Tình huống này cần một hướng đi rõ, không chỉ thêm cảm xúc hay thêm suy đoán.',
      shadow: 'The Chariot mang nhịp tiến về phía trước: mạnh, tập trung, đôi khi căng vì phải giữ nhiều lực trái chiều cùng chạy.',
      guidance: 'Hãy cầm lại tay lái bằng một quyết định cụ thể. Nếu cứ để mọi thứ kéo mỗi hướng, bạn sẽ mệt trước khi tới nơi.',
    },
    reversed: {
      pulse: 'Bạn có thể đang cố tiến lên trong khi bên trong chưa thật sự thống nhất.',
      shadow: 'The Chariot đảo chiều làm lộ cảm giác mất lái: càng thúc ép, tình huống càng dễ lệch khỏi hướng ban đầu.',
      guidance: 'Chậm lại để chỉnh hướng. Sức mạnh lúc này không nằm ở việc đi nhanh, mà ở việc biết mình đang đi vì điều gì.',
    },
  },
  Strength: {
    upright: {
      pulse: 'Bạn đang cố mạnh mẽ theo một cách rất lặng.',
      shadow: 'Strength không phải tiếng gầm lớn. Nó là khoảnh khắc bạn vẫn dịu dàng dù bên trong đang phải tự giữ mình.',
      guidance: 'Đừng nhầm mềm mại với yếu đuối. Điều bạn cần lúc này có thể là bớt chống lại chính cảm xúc của mình.',
    },
    reversed: {
      pulse: 'Bạn có thể đang nghi ngờ bản thân ngay cả khi đã cố rất nhiều.',
      shadow: 'Strength đảo chiều thường chạm vào phần mỏi mệt khi cứ phải tỏ ra ổn, bình tĩnh, hiểu chuyện.',
      guidance: 'Hãy dừng việc tự trách mình vì chưa đủ vững. Sự hồi phục bắt đầu khi bạn thôi ép mình gồng thêm.',
    },
  },
  'The Hermit': {
    upright: {
      pulse: 'Bạn đang cần lùi lại, không phải vì bỏ cuộc, mà vì mọi thứ bên ngoài đã quá ồn.',
      shadow: 'The Hermit mang ánh sáng nhỏ nhưng bền. Nó soi vào phần câu trả lời chỉ xuất hiện khi bạn ngừng hỏi người khác.',
      guidance: 'Cho mình một khoảng riêng thật sự. Không phải để cô lập, mà để nghe rõ điều mình đã biết.',
    },
    reversed: {
      pulse: 'Bạn có thể đã ở một mình quá lâu với những suy nghĩ chưa được nói ra.',
      shadow: 'Khi lá này đảo chiều, im lặng không còn chữa lành nếu nó khiến bạn xa dần khỏi sự nâng đỡ.',
      guidance: 'Hãy mở một khe cửa nhỏ. Không cần kể hết, chỉ cần để ai đó đáng tin bước gần hơn một chút.',
    },
  },
  'Wheel of Fortune': {
    upright: {
      pulse: 'Có một vòng chuyển động đang bắt đầu, dù bạn chưa kiểm soát được nhịp của nó.',
      shadow: 'Lá này mang cảm giác số phận xoay bánh: điều cũ đổi hướng, điều mới chen vào rất tự nhiên.',
      guidance: 'Đừng bám quá chặt vào cách mọi thứ từng diễn ra. Sự thay đổi này cần bạn linh hoạt hơn là phòng thủ.',
    },
    reversed: {
      pulse: 'Bạn có thể đang thấy mình lặp lại một cảm giác quen thuộc và tự hỏi vì sao vẫn quay về đây.',
      shadow: 'Wheel of Fortune đảo chiều thường chỉ ra một vòng cũ chưa được học xong.',
      guidance: 'Hãy nhìn mẫu lặp, không chỉ sự kiện. Khi bạn đổi cách phản ứng, bánh xe cũng bắt đầu đổi hướng.',
    },
  },
  Justice: {
    upright: {
      pulse: 'Có một sự thật trong chuyện này đang cần được nhìn thẳng, dù nó không hoàn toàn dễ chịu.',
      shadow: 'Justice không vội xoa dịu. Nó đặt mọi thứ lên bàn và hỏi điều gì thật sự công bằng với bạn.',
      guidance: 'Hãy chọn dựa trên sự rõ ràng, không dựa trên cảm giác tội lỗi hay sợ làm ai thất vọng.',
    },
    reversed: {
      pulse: 'Bạn có thể đang chấp nhận một điều lệch chỉ vì đã quen tự điều chỉnh mình trước.',
      shadow: 'Justice đảo chiều xuất hiện khi sự công bằng bị bóp méo, hoặc khi bạn né một quyết định cần nói ra.',
      guidance: 'Đừng tự thuyết phục rằng mọi thứ ổn nếu bên trong bạn vẫn thấy có điều không đúng.',
    },
  },
  'The Hanged Man': {
    upright: {
      pulse: 'Bạn đang ở giữa một khoảng dừng khó chịu, nhưng nó không vô nghĩa.',
      shadow: 'The Hanged Man thay đổi góc nhìn bằng cách lấy đi cảm giác phải hành động ngay.',
      guidance: 'Đừng ép tiến trình phải nhanh. Điều bạn nhìn thấy khi ngừng chống cự có thể là chìa khóa.',
    },
    reversed: {
      pulse: 'Bạn có thể đang mắc kẹt không phải vì thiếu lựa chọn, mà vì sợ cái giá của việc buông ra.',
      shadow: 'Lá này đảo chiều nói về sự trì hoãn mang vẻ hy sinh, nhưng bên trong là kiệt sức.',
      guidance: 'Hãy hỏi mình: điều gì đang giữ bạn lại thật sự, và điều gì chỉ còn là thói quen chịu đựng?',
    },
  },
  Death: {
    upright: {
      pulse: 'Một điều trong bạn đã biết rằng có thứ không thể trở lại như cũ.',
      shadow: 'Death không đến để làm mất mát vô nghĩa. Nó dọn chỗ cho một phiên bản thật hơn của bạn.',
      guidance: 'Đừng níu điều chỉ còn tồn tại bằng ký ức. Có những kết thúc là cách sự sống đổi hình.',
    },
    reversed: {
      pulse: 'Bạn có thể đang đứng trước một cánh cửa đã mở, nhưng vẫn quay lại nhìn căn phòng cũ.',
      shadow: 'Death đảo chiều thường là nỗi sợ buông bỏ, ngay cả khi điều đó đã không còn nuôi bạn nữa.',
      guidance: 'Không cần ép mình quên ngay. Nhưng hãy ngừng gọi sự níu kéo là hy vọng.',
    },
  },
  Temperance: {
    upright: {
      pulse: 'Bạn đang cần nhịp chậm hơn để những phần rối bên trong có thể hòa lại.',
      shadow: 'Temperance không vội sửa mọi thứ. Nó tìm điểm dịu giữa hai cực đang kéo bạn mệt.',
      guidance: 'Hãy chọn cách ít làm bạn vỡ ra nhất. Sự chữa lành thường bắt đầu bằng một nhịp vừa đủ.',
    },
    reversed: {
      pulse: 'Có thứ gì đó trong bạn đang lệch nhịp, như thể càng cố cân bằng càng thấy chao đảo.',
      shadow: 'Temperance đảo chiều nói về sự quá mức: quá chịu đựng, quá mong, hoặc quá cố làm yên mọi chuyện.',
      guidance: 'Hãy bớt pha loãng nhu cầu của mình để hợp với người khác. Bạn cũng cần được vừa vặn.',
    },
  },
  'The Devil': {
    upright: {
      pulse: 'Bạn có thể biết điều gì đang trói mình, nhưng vẫn khó rời mắt khỏi nó.',
      shadow: 'The Devil chạm vào ham muốn, thói quen và những ràng buộc khiến ta vừa muốn thoát vừa muốn ở lại.',
      guidance: 'Đừng phán xét phần yếu lòng của mình. Hãy gọi đúng tên sợi dây, rồi bạn mới biết cách tháo nó.',
    },
    reversed: {
      pulse: 'Một phần trong bạn đã bắt đầu không còn muốn thỏa hiệp với điều làm mình nhỏ lại.',
      shadow: 'The Devil đảo chiều là khoảnh khắc xiềng xích vẫn còn đó, nhưng bạn đã nhìn thấy khóa.',
      guidance: 'Hãy giữ lấy sự tỉnh táo này. Tự do thường bắt đầu bằng một lần không quay lại như cũ.',
    },
  },
  'The Tower': {
    upright: {
      pulse: 'Có thứ trong tình huống này không còn chịu đứng yên dưới lớp vỏ cũ.',
      shadow: 'The Tower mang nhịp mạnh và thẳng. Nó không thì thầm; nó phá vỡ điều đã lung lay từ lâu.',
      guidance: 'Đừng cố cứu một cấu trúc chỉ vì nó quen thuộc. Phần còn lại sau cú rơi mới nói thật với bạn.',
    },
    reversed: {
      pulse: 'Bạn có thể đang cảm nhận một sự đổ vỡ đến gần, nhưng vẫn cố giữ mọi thứ trông bình thường.',
      shadow: 'The Tower đảo chiều thường là biến động bị trì hoãn, hoặc sự thật bị nén quá lâu.',
      guidance: 'Thay vì sợ cú sụp, hãy nhìn xem điều gì đã nứt từ trước. Sự thật không đến để trừng phạt bạn.',
    },
  },
  'The Star': {
    upright: {
      pulse: 'Sau những căng thẳng, vẫn có một phần trong bạn chưa hoàn toàn mất niềm tin.',
      shadow: 'The Star rất nhẹ. Nó không hứa mọi thứ sẽ hoàn hảo, chỉ nhắc rằng bạn vẫn có thể hồi phục.',
      guidance: 'Hãy để mình tin vào một điều nhỏ thôi. Đôi khi một tia sáng đủ để bạn không bỏ rơi chính mình.',
    },
    reversed: {
      pulse: 'Bạn có thể đang mệt đến mức ngay cả hy vọng cũng thấy xa.',
      shadow: 'The Star đảo chiều không nói rằng ánh sáng biến mất; nó nói bạn đã quay lưng với nó quá lâu.',
      guidance: 'Đừng ép mình lạc quan. Chỉ cần cho phép bản thân được dịu lại trước.',
    },
  },
  'The Moon': {
    upright: {
      pulse: 'Có quá nhiều thứ chưa rõ khiến bạn dễ tự lấp khoảng trống bằng suy đoán.',
      shadow: 'The Moon đi bằng ánh sáng mờ: nó khuếch đại linh cảm, nỗi sợ, và những tín hiệu chưa đủ hình dạng.',
      guidance: 'Đừng ép mình kết luận khi mọi thứ còn phủ sương. Hãy quan sát điều lặp lại, không chỉ điều làm bạn lo trong một khoảnh khắc.',
    },
    reversed: {
      pulse: 'Màn sương đang mỏng đi, nhưng sự thật có thể hiện ra chậm hơn mong muốn.',
      shadow: 'The Moon đảo chiều là lúc một nỗi sợ bắt đầu mất quyền điều khiển, dù dư âm vẫn còn.',
      guidance: 'Hãy để sự rõ ràng đến từng lớp. Không cần phủ nhận cảm giác cũ, nhưng cũng đừng để nó dẫn đường thay hiện tại.',
    },
  },
  'The Sun': {
    upright: {
      pulse: 'Có một phần rất thật trong tình huống này muốn được bước ra ánh sáng.',
      shadow: 'The Sun có nhịp sáng, thẳng và ấm; nó làm mọi thứ bớt phức tạp khi bạn dám nhìn bằng sự thành thật.',
      guidance: 'Hãy chọn điều khiến bạn nhẹ hơn, rõ hơn, và không cần giấu mình quá nhiều.',
    },
    reversed: {
      pulse: 'Niềm vui ở đây chưa biến mất, nhưng nó đang bị che bởi áp lực hoặc một kỳ vọng làm bạn co lại.',
      shadow: 'The Sun đảo chiều thường là ánh sáng bị giảm âm lượng: vẫn có điều tốt, chỉ là bạn chưa chạm vào nó trọn vẹn.',
      guidance: 'Đừng ép mình phải ổn ngay. Hãy bắt đầu từ điều nhỏ khiến bạn thấy dễ thở hơn.',
    },
  },
  Judgement: {
    upright: {
      pulse: 'Có một tiếng gọi bên trong đang yêu cầu bạn nhìn lại mọi thứ trung thực hơn.',
      shadow: 'Judgement không dịu như lời an ủi; nó đánh thức phần bạn đã biết đến lúc phải thay đổi cách phản ứng.',
      guidance: 'Hãy nghe điều đang lặp lại trong lòng. Không phải để tự trách, mà để bước tiếp bằng một phiên bản tỉnh hơn.',
    },
    reversed: {
      pulse: 'Bạn có thể đang trì hoãn một sự thật vì sợ nó kéo theo quyết định lớn.',
      shadow: 'Judgement đảo chiều thường xuất hiện khi người ta tự xét xử mình quá nặng, rồi đứng yên vì không biết bắt đầu lại từ đâu.',
      guidance: 'Tha thứ không có nghĩa là quên hết. Nó chỉ mở đủ khoảng trống để bạn không sống mãi trong bản án cũ.',
    },
  },
  'The World': {
    upright: {
      pulse: 'Một vòng trải nghiệm đang tiến tới điểm khép lại, không phải bằng vội vàng mà bằng sự tích hợp.',
      shadow: 'The World mang nhịp rộng và tròn: những mảnh rời bắt đầu tìm được vị trí của chúng.',
      guidance: 'Hãy công nhận điều bạn đã đi qua. Có những kết thúc không đóng cửa lại, mà mở ra một tầng trưởng thành mới.',
    },
    reversed: {
      pulse: 'Có điều gì đó gần hoàn tất nhưng vẫn khiến bạn thấy chưa thể thật sự bước sang trang.',
      shadow: 'The World đảo chiều thường là cảm giác thiếu một mảnh cuối: chưa nói xong, chưa hiểu xong, hoặc chưa cho mình quyền kết thúc.',
      guidance: 'Đừng kéo dài chỉ vì cần một cái kết hoàn hảo. Hãy tìm bước nhỏ giúp vòng này được khép lại tử tế.',
    },
  },
};

const TAROT_SUIT_PERSONALITIES = {
  Wands: {
    pulse: 'nhiệt bên trong bạn đang muốn được hành động, nhưng cũng dễ cháy quá nhanh nếu không có hướng',
    guidance: 'Hãy chọn điều thật sự làm bạn sống động, không phải điều chỉ khiến bạn phải chứng minh mình mạnh.',
  },
  Cups: {
    pulse: 'cảm xúc ở đây không nằm yên; nó chuyển động dưới bề mặt và khiến bạn khó hoàn toàn khách quan',
    guidance: 'Hãy để cảm nhận của mình có chỗ đứng, nhưng đừng để nó một mình quyết định mọi thứ.',
  },
  Swords: {
    pulse: 'tâm trí bạn đang làm việc không ngừng, cố tìm một câu trả lời đủ sắc để cắt qua sự mơ hồ',
    guidance: 'Đừng biến suy nghĩ thành nơi trú ẩn quá lâu. Có lúc sự rõ ràng cần cả lòng can đảm để nói thật.',
  },
  Pentacles: {
    pulse: 'điều này chạm vào cảm giác an toàn, giá trị bản thân và những gì bạn đang cố xây cho lâu dài',
    guidance: 'Hãy quay về với điều có thể nâng đỡ bạn trong thực tế, không chỉ trong mong muốn.',
  },
};

const TAROT_RANK_PERSONALITIES = {
  1: { pulse: 'một khởi đầu còn rất mới đang mở ra', guidance: 'Đừng xem nhẹ tia đầu tiên chỉ vì nó chưa thành hình rõ.' },
  2: { pulse: 'bạn đang đứng giữa hai nhịp kéo khác nhau', guidance: 'Hãy chậm lại đủ lâu để biết bên nào thật sự làm bạn vững hơn.' },
  3: { pulse: 'điều này cần sự cộng hưởng hoặc một tầm nhìn rộng hơn', guidance: 'Đừng tự gánh một mình nếu câu trả lời cần nhiều hơn một góc nhìn.' },
  4: { pulse: 'bạn đang tìm nền tảng để có thể thở ổn định hơn', guidance: 'Điều bền không nhất thiết phải cứng; nó chỉ cần đủ thật.' },
  5: { pulse: 'có một điểm thiếu hụt hoặc va chạm khiến bạn khó bình thản', guidance: 'Hãy nhìn thẳng vào chỗ đau, nhưng đừng để nó định nghĩa toàn bộ câu chuyện.' },
  6: { pulse: 'một sự điều chỉnh mềm hơn đang muốn đưa mọi thứ về lại cân bằng', guidance: 'Cho phép mình nhận lại, không chỉ tiếp tục cho đi hoặc cố vượt qua.' },
  7: { pulse: 'bạn đang phải chọn giữa niềm tin, phòng thủ và điều mình thật sự thấy', guidance: 'Đừng để sự nghi ngờ làm bạn xa khỏi trực giác tỉnh táo.' },
  8: { pulse: 'nhịp chuyển động đang tăng lên, kéo theo cả cơ hội lẫn áp lực', guidance: 'Hãy đi cùng dòng chảy, nhưng giữ một điểm neo bên trong.' },
  9: { pulse: 'bạn đã đi xa hơn mình nghĩ, dù vẫn còn một phần chưa thật sự yên', guidance: 'Đừng phủ nhận thành quả chỉ vì hành trình chưa hoàn hảo.' },
  10: { pulse: 'một chu kỳ đang chạm ngưỡng, mang theo cả kết quả lẫn sức nặng', guidance: 'Hãy để điều đã đủ được khép lại đúng lúc.' },
  11: { pulse: 'một tín hiệu non trẻ đang xuất hiện, vừa tò mò vừa chưa ổn định', guidance: 'Hãy lắng nghe nó, nhưng đừng vội biến nó thành kết luận cuối.' },
  12: { pulse: 'năng lượng tiến về phía trước rất mạnh, đôi khi nhanh hơn khả năng lắng nghe của bạn', guidance: 'Hãy để sự chủ động đi cùng sự tinh tế, không phải hấp tấp.' },
  13: { pulse: 'bạn đang đứng gần một nguồn chăm sóc, trực giác hoặc quyền lực mềm', guidance: 'Hãy dùng sự hiểu biết của mình để nuôi dưỡng, không phải tự tiêu hao.' },
  14: { pulse: 'câu chuyện này cần sự trưởng thành, trách nhiệm và một cái nhìn bao quát hơn', guidance: 'Hãy chọn cách dẫn dắt tình huống mà không đánh mất sự mềm mại bên trong.' },
};

const getTarotPersonality = (card) => {
  const orientation = card.isReversed ? 'reversed' : 'upright';
  if (TAROT_MAJOR_PERSONALITIES[card.name]) {
    return TAROT_MAJOR_PERSONALITIES[card.name][orientation] || TAROT_MAJOR_PERSONALITIES[card.name].upright;
  }
  const suitPersonality = TAROT_SUIT_PERSONALITIES[card.suit] || TAROT_SUIT_PERSONALITIES.Cups;
  const rankPersonality = TAROT_RANK_PERSONALITIES[card.number] || TAROT_RANK_PERSONALITIES[1];
  return {
    pulse: `${rankPersonality.pulse}; ${suitPersonality.pulse}.`,
    shadow: card.isReversed
      ? 'Khi lá này đảo chiều, dòng năng lượng ấy dễ bị kẹt lại, thành do dự, phòng thủ hoặc một kiểu cố gắng không còn tự nhiên.'
      : 'Lá này không ồn ào, nhưng nó làm rõ nơi bạn đang đặt quá nhiều sự chú ý hoặc kỳ vọng.',
    guidance: `${rankPersonality.guidance} ${suitPersonality.guidance}`,
  };
};

const TAROT_READING_OVERRIDES = {
  'Wheel of Fortune': {
    past: [
      'Đã có một giai đoạn mọi thứ thay đổi quá nhanh, khiến bạn luôn phải chạy theo để giữ thăng bằng.',
      'Có thể tiền bạc, cơ hội, hoặc một biến cố cũ đã làm bạn mất cảm giác kiểm soát.',
      'Wheel of Fortune không nói rằng bạn kém may mắn. Nó chỉ cho thấy cuộc sống từng đẩy bạn vào một vòng xoay mà bạn chưa kịp thích nghi.',
    ],
    present: [
      'Hiện tại có một nhịp xoay mới đang kéo bạn ra khỏi vùng quen thuộc.',
      'Bạn càng cố giữ mọi thứ đứng yên, tình huống càng cho thấy nó có chuyển động riêng.',
      'Wheel of Fortune cần sự linh hoạt. Có lúc bước đúng không phải là giữ chặt, mà là đổi nhịp kịp thời.',
    ],
    future: [
      'Phía trước có một bước ngoặt đang thành hình, không ồn ào nhưng đủ để đổi hướng câu chuyện.',
      'Nếu bạn vẫn phản ứng như cũ, vòng lặp cũ có thể quay lại trong một hình dạng mới.',
      'Wheel of Fortune mời bạn chuẩn bị cho thay đổi thay vì chờ mọi thứ chắc chắn rồi mới tin.',
    ],
  },
  'Two of Pentacles': {
    past: [
      'Bạn từng phải xoay xở nhiều thứ cùng lúc, đến mức sự ổn định chỉ còn là giữ cho mọi thứ chưa rơi.',
      'Giai đoạn đó có thể đã dạy bạn linh hoạt, nhưng cũng khiến bạn quen sống trong trạng thái luôn phải tính bước tiếp theo.',
      'Two of Pentacles mang nhịp chao đảo thực tế: không hẳn sụp đổ, nhưng cũng chưa thật sự yên.',
    ],
    present: [
      'Hiện tại bạn đang cố giữ nhiều đầu việc, nhiều nỗi lo, hoặc nhiều lựa chọn cùng chuyển động.',
      'Có cảm giác như chỉ cần dừng lại một chút, một thứ nào đó sẽ lệch khỏi quỹ đạo.',
      'Two of Pentacles không bảo bạn yếu. Nó chỉ cho thấy hệ thống hiện tại đang cần được cân lại.',
    ],
    future: [
      'Phía trước đòi hỏi bạn chọn nhịp bền hơn, thay vì tiếp tục xoay xở bằng phản xạ.',
      'Nếu mọi thứ đều quan trọng như nhau, bạn sẽ khó giữ được sự ổn định thật sự.',
      'Two of Pentacles khuyên bạn giảm bớt một quả bóng trước khi tay mình mỏi đến mức buông tất cả.',
    ],
  },
  'Ace of Pentacles': {
    past: [
      'Từng có một cơ hội thực tế xuất hiện, nhưng nền bên dưới có thể chưa đủ vững để bạn nắm lấy.',
      'Ace of Pentacles nhắc về một hạt mầm cần đất tốt, thời gian và sự chăm sóc đều đặn.',
      'Điều đáng nhìn lại không phải là tiếc nuối, mà là bạn đã có đủ điều kiện để bắt đầu hay chưa.',
    ],
    present: [
      'Hiện tại có một cơ hội mới, nhưng nó cần được đặt xuống bằng hành động cụ thể chứ không chỉ bằng mong muốn.',
      'Ace of Pentacles không mang nhịp vội. Nó hỏi bạn có đang xây từ nền thật hay chỉ đang chờ một cảm giác chắc chắn tuyệt đối.',
      'Bắt đầu nhỏ, rõ, và đều. Đó là cách cơ hội này bớt mong manh.',
    ],
    future: [
      'Một cơ hội mới có thể đến, nhưng bạn sẽ khó nắm lấy nếu vẫn nhìn bản thân từ tâm thế thiếu thốn.',
      'Ace of Pentacles thường xuất hiện khi điều cần nhất không phải liều lĩnh, mà là bắt đầu xây lại từ thứ nhỏ nhưng thực tế.',
      'Đừng chờ mọi thứ hoàn hảo mới gieo hạt. Hãy chuẩn bị mảnh đất trước.',
    ],
  },
  'Five of Pentacles': {
    past: [
      'Bạn từng đi qua một giai đoạn thấy mình đứng ngoài sự đủ đầy của người khác.',
      'Five of Pentacles mang cái lạnh rất cụ thể: thiếu hỗ trợ, thiếu nguồn lực, hoặc thiếu cảm giác được chọn.',
      'Vết đó có thể vẫn khiến bạn thận trọng mỗi khi phải tin vào một điều mới.',
    ],
    present: [
      'Hiện tại có một nỗi lo thực tế đang làm bạn co lại.',
      'Five of Pentacles không chỉ nói về thiếu thốn; nó nói về cảm giác phải tự chịu đựng khi đáng ra có thể tìm thấy một cánh cửa mở.',
      'Đừng để khó khăn khiến bạn tin rằng mình không được phép nhận giúp đỡ.',
    ],
    future: [
      'Nếu tiếp tục nhìn mọi thứ qua cảm giác thiếu, bạn có thể bỏ qua một nguồn hỗ trợ đang ở gần hơn mình nghĩ.',
      'Five of Pentacles nhắc rằng sự phục hồi không bắt đầu bằng việc có đủ ngay lập tức, mà bằng việc thôi đứng một mình ngoài cửa.',
      'Hãy tìm nơi có ánh sáng thật, không phải nơi chỉ khiến bạn thấy mình nhỏ lại.',
    ],
  },
  'Nine of Pentacles': {
    past: [
      'Bạn từng xây được một điều gì đó bằng sự kiên nhẫn của riêng mình.',
      'Nine of Pentacles mang cảm giác tự đứng vững sau nhiều lần phải tự lo, tự học, tự giữ giá trị của mình.',
      'Quá khứ này nhắc rằng bạn không hề bắt đầu từ con số không.',
    ],
    present: [
      'Hiện tại bạn đang được nhắc nhìn lại những gì mình đã tạo dựng, thay vì chỉ nhìn phần còn thiếu.',
      'Nine of Pentacles không ồn ào. Nó là sự đủ đầy đến từ việc biết mình đã đi qua bao nhiêu để có mặt ở đây.',
      'Hãy cho phép bản thân nhận thành quả mà không lập tức biến nó thành áp lực tiếp theo.',
    ],
    future: [
      'Phía trước có khả năng ổn định hơn, nếu bạn tiếp tục chọn điều nâng mình lên thay vì làm mình nhỏ lại.',
      'Nine of Pentacles là nhịp của sự độc lập chín muồi, không phải cô lập.',
      'Điều bền thường đến từ những lựa chọn lặng nhưng nhất quán.',
    ],
  },
  'Page of Swords': {
    present: [
      'Hiện tại bạn đang nhìn rất kỹ, có thể kỹ đến mức một chi tiết nhỏ cũng đủ làm bạn đổi hướng suy nghĩ.',
      'Page of Swords không bình yên. Nó muốn biết, muốn hỏi, muốn bóc tách điều chưa rõ.',
      'Một câu hỏi thẳng có thể nhẹ hơn rất nhiều so với nhiều ngày tự suy diễn.',
    ],
  },
  'Queen of Cups': {
    present: [
      'Hiện tại bạn đang nhận rất nhiều tín hiệu bằng cảm giác hơn là bằng lời.',
      'Queen of Cups hiểu những thay đổi nhỏ trong giọng nói, khoảng cách, sự im lặng.',
      'Hãy tin vào độ nhạy của mình, nhưng nhớ rằng bạn cũng cần được nâng đỡ chứ không chỉ nâng đỡ người khác.',
    ],
  },
  'The Tower': {
    past: [
      'Đã có một cú rung chuyển làm bạn không thể nhìn mọi thứ như trước.',
      'Nó có thể đến quá nhanh, quá thẳng, hoặc quá thật, khiến những gì từng có vẻ chắc chắn bỗng lộ ra vết nứt.',
      'The Tower không mềm. Nó phá vỡ lớp vỏ đã yếu từ lâu để bạn không phải tiếp tục sống trong một cấu trúc sai.',
    ],
    present: [
      'Có điều gì đó trong hiện tại không còn chịu nằm yên dưới bề mặt.',
      'Bạn có thể cảm thấy càng cố giữ bình thường thì bên trong càng căng, như một sự thật đang đòi được nhìn thấy.',
      'The Tower xuất hiện khi điều giả vững chắc bắt đầu sụp xuống. Điều còn lại sau đó mới là thứ đáng tin.',
    ],
    future: [
      'Phía trước có thể mang một khoảnh khắc buộc bạn nhìn thẳng vào điều đã lung lay từ lâu.',
      'Đây không nhất thiết là mất mát, nhưng nó khó đi cùng sự phủ nhận.',
      'The Tower khuyên bạn đừng chờ mọi thứ đổ xuống mới thừa nhận nơi nào đã nứt.',
    ],
  },
  'The Star': {
    present: [
      'Hiện tại cần một kiểu tin tưởng rất nhỏ, không ồn ào và không ép buộc.',
      'The Star xuất hiện khi bạn chưa chắc mọi chuyện sẽ tốt hơn, nhưng vẫn có một chỗ trong lòng muốn được thở nhẹ.',
      'Đừng ép mình phải lạc quan. Chỉ cần đừng quay lưng với phần còn muốn lành lại.',
    ],
  },
};

const getTarotPositionKey = (position, positions) => {
  if (Array.isArray(positions) && position === positions[0]) return 'past';
  if (Array.isArray(positions) && position === positions[1]) return 'present';
  return 'future';
};

const getTarotQuestionContext = (question, topic) => {
  const normalized = question.toLowerCase();
  const hasAny = (words) => words.some(word => normalized.includes(word));
  if (hasAny(['ghen', 'người thứ ba', 'third person', 'phản bội', 'lừa dối', 'ngoại tình', 'crush ai', 'có ai khác'])) {
    return {
      mood: 'jealousy',
      line: 'Vì câu hỏi có màu của nghi ngờ và bất an, lá bài nên được đọc qua cách bạn đang quan sát từng dấu hiệu nhỏ mà vẫn chưa thấy yên.',
    };
  }
  if (hasAny(['chia tay', 'quay lại', 'người yêu cũ', 'ex', 'rời xa', 'kết thúc', 'buông', 'move on'])) {
    return {
      mood: 'breakup',
      line: 'Vì câu hỏi chạm đến chia lìa hoặc khoảng cách, lá bài nghiêng về phần còn vương lại sau một kết nối hơn là một lời dự đoán đơn giản.',
    };
  }
  if (hasAny(['tiền', 'tài chính', 'nợ', 'lương', 'thu nhập', 'đầu tư', 'kinh doanh', 'mua', 'bán', 'money', 'finance'])) {
    return {
      mood: 'money',
      line: 'Vì câu hỏi đặt vào chuyện nguồn lực, lá bài cần được đọc qua áp lực thực tế: điều gì đang nuôi bạn, và điều gì đang làm bạn phải gồng.',
    };
  }
  if (hasAny(['công việc', 'sự nghiệp', 'career', 'job', 'nghỉ việc', 'đổi việc', 'dự án', 'sếp', 'đồng nghiệp'])) {
    return {
      mood: 'career',
      line: 'Vì câu hỏi nằm trong công việc, lá bài nói rõ hơn về nhịp hành động, trách nhiệm và cách bạn đang giữ vị trí của mình.',
    };
  }
  if (hasAny(['tương lai', 'sắp tới', 'liệu có', 'có nên', 'kết quả', 'future', 'outcome'])) {
    return {
      mood: 'future',
      line: 'Vì câu hỏi hướng về điều chưa xảy ra, lá bài mang sắc thái của khả năng đang thành hình chứ không phải một kết luận đóng lại.',
    };
  }
  if (hasAny(['yêu', 'tình cảm', 'mối quan hệ', 'relationship', 'thích', 'nhớ', 'liên lạc', 'im lặng', 'seen'])) {
    return {
      mood: 'love',
      line: 'Vì câu hỏi nằm trong một kết nối cảm xúc, lá bài nên được đọc qua khoảng cách giữa điều được thể hiện và điều thật sự đang diễn ra bên trong.',
    };
  }
  const topicLine = {
    [TOPICS.LOVE]: 'Vì chủ đề là tình cảm, lá bài nghiêng về cách cảm xúc đang được trao đi, giữ lại, hoặc hiểu sai.',
    [TOPICS.CAREER]: 'Vì chủ đề là sự nghiệp, lá bài nghiêng về áp lực hành động, trách nhiệm và hướng đi thực tế.',
    [TOPICS.FUTURE]: 'Vì chủ đề là tương lai, lá bài nghiêng về xu hướng đang thành hình và điều bạn cần chuẩn bị bên trong.',
    [TOPICS.MONEY]: 'Vì chủ đề là tiền bạc, lá bài nghiêng về cảm giác an toàn, nguồn lực và lựa chọn thực tế.',
  }[topic];
  return { mood: 'general', line: topicLine || '' };
};

const getTarotQuestionReflection = (mood, positionKey, question, topic) => {
  const linesByMood = {
    jealousy: {
      past: 'Trong nền câu hỏi này, quá khứ nghiêng về những dấu hiệu từng khiến bạn bắt đầu nghi ngờ thay vì thấy yên.',
      present: 'Ở hiện tại, điều cần nhìn kỹ là phản ứng bên trong mỗi khi bạn phải đoán thay vì được nghe rõ ràng.',
      future: 'Phía trước, năng lượng này khuyên bạn đừng để sự mập mờ biến mình thành người luôn phải canh chừng.',
    },
    breakup: {
      past: 'Trong nền câu hỏi này, quá khứ giữ lại phần cảm xúc chưa kịp có một lời kết thật sự.',
      present: 'Ở hiện tại, trọng tâm nằm ở khoảng cách giữa điều bạn còn nhớ và điều đang thật sự diễn ra.',
      future: 'Phía trước, câu trả lời không chỉ nằm ở việc quay lại hay rời đi, mà ở cách bạn giữ mình sau mất mát.',
    },
    money: {
      past: 'Trong nền tài chính, quá khứ nói về cách bạn từng học phải xoay xở để giữ cảm giác an toàn.',
      present: 'Ở hiện tại, lá bài đặt trọng tâm vào nguồn lực thật: tiền, sức, thời gian và điều đang làm bạn hao đi.',
      future: 'Phía trước, năng lượng này cần được đưa về những bước thực tế hơn là chỉ chờ vận may đổi chiều.',
    },
    career: {
      past: 'Trong nền công việc, quá khứ nghiêng về những trách nhiệm đã định hình cách bạn đang tự chứng minh mình.',
      present: 'Ở hiện tại, điều quan trọng là nhịp hành động: bạn đang tiến vì rõ hướng hay vì sợ tụt lại.',
      future: 'Phía trước, lá bài hỏi bạn muốn xây một vị trí bền hơn hay chỉ tiếp tục chịu áp lực quen thuộc.',
    },
    future: {
      past: 'Với câu hỏi hướng về tương lai, quá khứ cho thấy mẫu chuyển động cũ vẫn còn ảnh hưởng đến điều bạn đang chờ.',
      present: 'Ở hiện tại, trọng tâm không phải biết chắc mọi thứ, mà là nhận ra năng lượng nào đang dẫn câu chuyện đi.',
      future: 'Phía trước, lá bài mở ra khả năng, nhưng khả năng đó vẫn cần được đi qua bằng lựa chọn tỉnh táo.',
    },
    love: {
      past: 'Trong nền tình cảm, quá khứ giữ lại cách bạn từng yêu, từng chờ, hoặc từng tự bảo vệ mình.',
      present: 'Ở hiện tại, điều đáng nghe là khoảng cách giữa điều được thể hiện và điều bạn thật sự cảm nhận.',
      future: 'Phía trước, cảm xúc cần sự thật đủ mềm để không biến hy vọng thành một nơi tự làm đau mình.',
    },
    general: {
      past: 'Câu hỏi này làm quá khứ hiện lên như một nền cảm xúc, nhưng lá bài vẫn là hướng đọc chính.',
      present: 'Ở hiện tại, câu hỏi chỉ đổi góc sáng; nhịp tâm lý vẫn phải đi từ chính lá bài.',
      future: 'Phía trước, điều cần giữ là sự tỉnh táo: để câu hỏi mở bối cảnh, không để nó ép lá bài nói khác đi.',
    },
  };
  const topicFallback = {
    [TOPICS.LOVE]: 'love',
    [TOPICS.CAREER]: 'career',
    [TOPICS.FUTURE]: 'future',
    [TOPICS.MONEY]: 'money',
  }[topic] || 'general';
  const moodKey = linesByMood[mood] ? mood : topicFallback;
  const line = linesByMood[moodKey]?.[positionKey] || linesByMood.general[positionKey];
  return question ? `${line}` : '';
};

const getTarotQuestionProfile = (question, topic) => {
  const normalized = question.toLowerCase();
  const hasAny = (words) => words.some(word => normalized.includes(word));
  const base = {
    mood: 'general',
    domain: 'self',
    tension: 'điều chưa được gọi tên',
    dynamic: 'một tình huống còn thiếu dữ kiện cảm xúc',
    atmosphere: 'trầm và thận trọng',
    pressure: 'nhu cầu hiểu rõ chuyện đang diễn ra',
    urgency: 'low',
    intensity: 'low',
    casual: hasAny(['vui', 'cho vui', 'thử xem', 'crush', 'hôm nay', 'nhắn không', 'có nhắn', 'may mắn', 'lucky', 'random', 'đùa', 'hihi', 'haha']),
  };

  if (hasAny(['ghen', 'người thứ ba', 'third person', 'phản bội', 'lừa dối', 'ngoại tình', 'crush ai', 'có ai khác', 'nói dối'])) {
    return {
      mood: 'jealousy',
      domain: 'love',
      tension: 'niềm tin bị kéo căng',
      dynamic: 'nghi ngờ, che giấu và nhu cầu được nghe sự thật',
      atmosphere: 'căng, sắc và khó yên',
      pressure: 'phải đọc từng dấu hiệu nhỏ để tự bảo vệ mình',
      urgency: 'high',
      intensity: 'high',
      casual: false,
    };
  }
  if (hasAny(['chia tay', 'quay lại', 'người yêu cũ', 'ex', 'rời xa', 'kết thúc', 'buông', 'move on', 'còn yêu'])) {
    return {
      mood: 'breakup',
      domain: 'love',
      tension: 'sự gắn bó chưa chịu rời đi',
      dynamic: 'khoảng cách, tiếc nuối và mong muốn biết người kia còn giữ gì',
      atmosphere: 'buồn, lửng lơ và dễ nhói',
      pressure: 'muốn có một câu trả lời đủ rõ để thôi tự mắc kẹt',
      urgency: 'medium',
      intensity: 'high',
      casual: false,
    };
  }
  if (hasAny(['tiền', 'tài chính', 'nợ', 'lương', 'thu nhập', 'đầu tư', 'kinh doanh', 'mua', 'bán', 'hết tiền', 'money', 'finance'])) {
    const urgentMoney = hasAny(['hết tiền', 'nợ', 'thiếu tiền', 'mất tiền', 'phá sản', 'không đủ']);
    return {
      mood: 'money',
      domain: 'money',
      tension: 'áp lực sinh tồn và nguồn lực',
      dynamic: 'thiếu hụt, tính toán và nỗi lo không đủ chống đỡ',
      atmosphere: urgentMoney ? 'thực tế, nặng và cần quyết định tỉnh' : 'thực tế, tỉnh táo và hơi dè chừng',
      pressure: urgentMoney ? 'phải giữ mình ổn trong khi nguồn lực bị kéo mỏng' : 'muốn biết nguồn lực nên được đặt vào đâu cho đáng',
      urgency: urgentMoney ? 'high' : 'medium',
      intensity: urgentMoney ? 'high' : 'medium',
      casual: false,
    };
  }
  if (hasAny(['công việc', 'sự nghiệp', 'career', 'job', 'nghỉ việc', 'đổi việc', 'dự án', 'sếp', 'đồng nghiệp'])) {
    const urgentCareer = hasAny(['nghỉ việc', 'đổi việc', 'mất việc', 'sếp', 'áp lực', 'burnout']);
    const vocationCareer = hasAny(['làm công việc gì', 'nghề gì', 'ngành gì', 'hợp nghề', 'hợp công việc', 'làm gì', 'vocation']);
    return {
      mood: 'career',
      domain: 'career',
      tension: vocationCareer ? 'chưa rõ hướng nghề nghiệp phù hợp' : 'mâu thuẫn giữa ổn định và thay đổi',
      dynamic: vocationCareer ? 'định hướng nghề, kiểu làm việc hợp tính cách và môi trường có thể đi lâu dài' : 'trách nhiệm, bản sắc cá nhân và sợ chọn sai hướng',
      atmosphere: urgentCareer ? 'kỷ luật, áp lực và cần nhìn thẳng' : 'tỉnh táo, thực tế và có chút chờ đợi',
      pressure: urgentCareer ? 'phải biết mình đang đi tiếp vì mục tiêu hay vì chịu đựng' : 'muốn hiểu kiểu công việc nào hợp với năng lượng của mình',
      urgency: urgentCareer ? 'medium' : 'low',
      intensity: urgentCareer || vocationCareer ? 'medium' : 'low',
      casual: false,
    };
  }
  if (hasAny(['tương lai', 'sắp tới', 'liệu có', 'có nên', 'kết quả', 'future', 'outcome'])) {
    return {
      mood: 'future',
      domain: 'future',
      tension: 'sự chờ đợi chưa có hình dạng',
      dynamic: 'dự cảm, do dự và nhu cầu nhìn thấy hướng đi',
      atmosphere: 'mở, dao động và nhiều khả năng',
      pressure: 'muốn biết chuyện sẽ ngả về đâu trước khi dám tin',
      urgency: 'medium',
      intensity: base.casual ? 'low' : 'medium',
      casual: base.casual,
    };
  }
  if (hasAny(['yêu', 'tình cảm', 'mối quan hệ', 'relationship', 'thích', 'nhớ', 'liên lạc', 'im lặng', 'seen'])) {
    const longingLove = hasAny(['nhớ', 'còn yêu', 'có nhớ', 'có còn', 'nghĩ về', 'người yêu']);
    const urgentLove = hasAny(['im lặng', 'seen', 'còn yêu', 'nói dối', 'chia tay', 'ghen']);
    return {
      mood: 'love',
      domain: 'love',
      tension: longingLove ? 'muốn biết người kia còn giữ cảm xúc hay không' : 'sự lệch nhịp trong kết nối',
      dynamic: urgentLove || longingLove ? 'nhớ, khoảng cách, cảm xúc được giữ kín và nhu cầu có một dấu hiệu rõ hơn' : 'tò mò, rung động và muốn biết tín hiệu kia có đáng để ý không',
      atmosphere: urgentLove || longingLove ? 'mềm, dễ chạnh lòng và cần được nói thẳng hơn' : 'nhẹ, ấm và hơi hồi hộp',
      pressure: urgentLove || longingLove ? 'muốn biết mình có còn xuất hiện trong lòng người kia hay chỉ đang tự nhớ một mình' : 'muốn đọc tín hiệu mà không làm mọi thứ trở nên quá nghiêm trọng',
      urgency: urgentLove ? 'medium' : 'low',
      intensity: urgentLove || longingLove ? 'medium' : 'low',
      casual: !urgentLove && !longingLove && base.casual,
    };
  }

  const topicMood = {
    [TOPICS.LOVE]: 'love',
    [TOPICS.CAREER]: 'career',
    [TOPICS.FUTURE]: 'future',
    [TOPICS.MONEY]: 'money',
  }[topic];
  return topicMood ? { ...base, mood: topicMood } : base;
};

const getTarotQuestionAngle = (context, positionKey, question) => {
  if (!question) return '';
  if (context.casual || context.intensity === 'low') {
    const lightLines = {
      past: 'Lá bài đọc câu hỏi này như một tín hiệu nhẹ từ trải nghiệm gần đây, không phải một vấn đề cần đào sâu.',
      present: `Hiện tại, năng lượng chính là ${context.dynamic}; hãy đọc nó như một gợi ý tinh tế hơn là kết luận nặng nề.`,
      future: 'Phía trước có vài khả năng nhỏ đang mở ra; lá bài chỉ giúp bạn nhìn hướng nào đang có sức hút hơn.',
    };
    return lightLines[positionKey] || lightLines.present;
  }
  const linesByMood = {
    jealousy: {
      past: `Dấu vết cũ của ${context.dynamic} khiến bạn khó tin vào những gì chỉ được nói nửa vời.`,
      present: `Lúc này, ${context.pressure}; lá bài cần được đọc trong nhịp cảnh giác đó.`,
      future: `Nếu tình huống tiếp tục mập mờ, điều đáng giữ không phải là kiểm soát người kia mà là quyền được biết sự thật.`,
    },
    breakup: {
      past: `Một kết nối cũ vẫn để lại âm vang, nhất là khi ${context.tension}.`,
      present: `Hiện tại không chỉ là nhớ hay quên; đó là cách bạn đứng trước ${context.dynamic}.`,
      future: `Hướng đi sắp tới phụ thuộc vào việc bạn còn chờ một tín hiệu mơ hồ hay bắt đầu nghe lại đời sống của mình.`,
    },
    money: {
      past: `Những lần phải xoay xở trước đây đã dạy bạn tính toán nhanh, nhưng cũng để lại phản xạ luôn nhìn thấy rủi ro trước tiên.`,
      present: `Áp lực hiện tại rất thật: ${context.pressure}.`,
      future: `Điều sắp mở ra cần kế hoạch nhỏ, tiền thật, giới hạn thật; không nên đặt cược bằng nỗi sợ.`,
    },
    career: {
      past: `Trải nghiệm cũ có thể đã ảnh hưởng đến cách bạn chọn nghề: chọn vì hợp mình, vì an toàn, hay vì kỳ vọng.`,
      present: `Câu hỏi này đang xoay quanh ${context.dynamic}; lá bài sẽ soi vào kiểu công việc và môi trường hợp với bạn hơn.`,
      future: `Hướng tiếp theo cần được nhìn qua năng lực, động lực và nhịp làm việc lâu dài, không chỉ tên nghề nghe có vẻ ổn.`,
    },
    future: {
      past: `Mẫu chuyển động cũ vẫn ảnh hưởng đến cách bạn đoán về điều chưa xảy ra.`,
      present: `Sự chờ đợi đang làm mọi dấu hiệu có vẻ lớn hơn bình thường.`,
      future: `Khả năng mới có thể đến, nhưng lá bài sẽ cho thấy nhịp nào cần được tin và nhịp nào cần được kiểm chứng.`,
    },
    love: {
      past: `Cách bạn từng yêu và từng tự bảo vệ mình đang ảnh hưởng đến cách đọc kết nối này.`,
      present: `Điểm căng nằm ở ${context.dynamic}; không phải mọi im lặng đều giống nhau.`,
      future: `Tình cảm chỉ có thể đi xa nếu điều được cảm nhận cũng có cơ hội được nói rõ.`,
    },
    general: {
      past: `Bối cảnh cảm xúc nằm ở ${context.tension}, và lá bài cho thấy nó đã hình thành từ đâu.`,
      present: `Hiện tại, ${context.pressure}; phần còn lại phải được đọc qua tính cách riêng của lá bài.`,
      future: `Hướng mở ra phụ thuộc vào cách bạn phản ứng với nhịp tâm lý mà lá bài đang làm lộ.`,
    },
  };
  const moodLines = linesByMood[context.mood] || linesByMood.general;
  return moodLines[positionKey] || moodLines.present;
};

const getCareerCardInterpretation = (card, positionKey) => {
  const reversed = card.isReversed;
  const specific = {
    'The Devil': {
      past: [
        'Bạn có thể từng nghĩ về công việc qua áp lực an toàn: tiền bạc, kỳ vọng, hoặc nỗi sợ bị tụt lại.',
        'The Devil trong câu hỏi nghề nghiệp thường chỉ một hướng đi khiến người ta thấy bị kẹt giữa điều mình cần và điều mình thật sự muốn làm lâu dài.',
      ],
      present: [
        'Hiện tại, lá này hỏi bạn có đang chọn nghề vì đam mê thật hay vì cảm giác phải ổn, phải kiếm được, phải chứng minh.',
        'Nếu có một công việc nghe có vẻ chắc chắn nhưng làm bạn thấy bị trói, đó là tín hiệu cần nhìn thẳng chứ không nên bỏ qua.',
      ],
      future: [
        'Về phía trước, The Devil cảnh báo một con đường có thể cho bạn cảm giác an toàn hoặc địa vị, nhưng dễ đổi lại bằng sự mắc kẹt.',
        'Bạn hợp hơn với hướng đi có quyền chủ động rõ ràng, thay vì chỉ chạy theo tiền, danh xưng hoặc kỳ vọng của người khác.',
      ],
    },
    'The Star': {
      past: [
        reversed
          ? 'Bạn có thể từng mất niềm tin vào một hướng nghề vì thấy mình không đủ cảm hứng hoặc không nhìn ra tương lai trong đó.'
          : 'Bạn từng có một hình dung khá trong sáng về điều mình muốn làm, dù nó có thể còn xa thực tế.',
        'Trong nghề nghiệp, The Star nói về cảm hứng, niềm tin vào hướng đi và cảm giác công việc có ý nghĩa.',
      ],
      present: [
        reversed
          ? 'Hiện tại có vẻ bạn chưa thật sự nhìn rõ mình muốn xây cuộc sống nghề nghiệp kiểu gì trong vài năm tới.'
          : 'Hiện tại bạn cần một hướng làm việc khiến mình có lại cảm hứng, không chỉ một lựa chọn nghe có vẻ ổn.',
        'Không hẳn là thiếu khả năng; vấn đề là hướng bên trong chưa đủ rõ để tạo cảm giác chắc chắn.',
      ],
      future: [
        reversed
          ? 'Nếu tiếp tục chọn nghề chỉ vì sợ sai, bạn dễ đi vào một hướng không còn nuôi cảm hứng của mình.'
          : 'Phía trước có thể mở ra một công việc gắn với sáng tạo, chữa lành, cộng đồng, hình ảnh, hoặc điều khiến bạn thấy có hy vọng hơn.',
        'The Star cần một môi trường cho bạn được tin vào điều mình đang làm, không chỉ hoàn thành nhiệm vụ.',
      ],
    },
    'The Hermit': {
      past: [
        'Bạn từng học được nhiều nhất khi tự quan sát, tự mày mò hoặc làm việc trong không gian riêng.',
        'The Hermit trong nghề nghiệp thường chỉ năng lực đi sâu: nghiên cứu, phân tích, sáng tạo độc lập, tư vấn, viết lách, chuyên môn hóa.',
      ],
      present: [
        'Hiện tại bạn có thể không hợp với môi trường quá ồn, quá nhiều giao tiếp hời hợt hoặc phải chạy theo nhịp của người khác.',
        'Lá này nghiêng về kiểu công việc cần tập trung sâu, tự học và có khoảng riêng để phát triển chuyên môn.',
      ],
      future: [
        'The Hermit cho thấy bạn hợp với kiểu công việc cần chiều sâu, tự học, quan sát hoặc làm độc lập hơn là môi trường quá ồn ào.',
        'Hướng phù hợp có thể đến chậm, nhưng càng về sau bạn càng cần một nghề có ý nghĩa thật với mình, không chỉ để ổn.',
      ],
    },
    Strength: {
      past: [
        reversed
          ? 'Bạn có thể từng chọn một hướng làm việc vì nghĩ mình phải chịu được, dù bên trong đã thấy đuối.'
          : 'Bạn có thể từng quen với việc cố gắng bền bỉ, ngay cả khi công việc đó không thật sự làm mình muốn gắn bó lâu dài.',
        'Strength trong câu hỏi nghề nghiệp không nói về cố thêm; nó hỏi bạn đang chọn vì thật sự hợp, hay vì mình giỏi chịu đựng.',
      ],
      present: [
        reversed
          ? 'Hiện tại bạn có thể đang nghi ngờ sức bền của mình, nhất là khi nghĩ đến một công việc cần theo lâu dài.'
          : 'Hiện tại, lá này cho thấy bạn có sức bền và khả năng xử lý áp lực, nhưng không nên lấy “chịu được” làm tiêu chuẩn chọn nghề.',
        'Hướng phù hợp nên cho bạn cảm giác vững dần, không phải ngày nào cũng phải gồng để chứng minh mình ổn.',
      ],
      future: [
        reversed
          ? 'Nếu chọn một nghề chỉ vì nghĩ mình có thể chịu được, bạn dễ mất năng lượng trước khi kịp phát triển thật.'
          : 'Phía trước, bạn hợp với công việc cần sự kiên nhẫn, chăm sóc, rèn kỹ năng hoặc dẫn dắt bằng sự bình tĩnh.',
        'Điểm quan trọng là công việc đó phải giúp bạn lớn lên, không chỉ kiểm tra sức chịu đựng của bạn.',
      ],
    },
    'Ten of Swords': {
      past: [
        reversed
          ? 'Bạn từng đi qua một giai đoạn công việc hoặc học tập làm mình kiệt sức, rồi phải tự kéo mình đứng dậy.'
          : 'Bạn có thể từng chạm tới một điểm rất mệt trong chuyện định hướng: học quá sức, làm quá sức, hoặc thấy một hướng cũ không còn đi tiếp được.',
        'Điều đó khiến bạn nhạy hơn với những môi trường luôn căng đầu, cạnh tranh hoặc ép mình phải phòng thủ.',
      ],
      present: [
        reversed
          ? 'Hiện tại bạn có thể làm tốt những việc cần suy nghĩ sâu, phân tích hoặc xử lý vấn đề, nhưng không hợp với môi trường khiến đầu óc luôn phải căng như đang tự vệ.'
          : 'Hiện tại, lá này cho thấy một hướng nghề cũ hoặc một kỳ vọng cũ đã tới giới hạn; cố tiếp có thể chỉ làm bạn cạn thêm.',
        'Bạn cần công việc dùng trí óc rõ ràng, nhưng không biến mỗi ngày thành một trận chịu đựng.',
      ],
      future: [
        reversed
          ? 'Phía trước có thể hợp hơn với hướng dùng kinh nghiệm từ áp lực cũ: phân tích, viết, tư vấn, xử lý khủng hoảng, hoặc giúp người khác tránh sai lầm tương tự.'
          : 'Nếu một con đường khiến bạn luôn kiệt sức trước khi thấy ý nghĩa, nó không phải hướng nên đi lâu.',
        'Lá này nghiêng về việc rời khỏi kiểu môi trường làm bạn cạn năng lượng tinh thần.',
      ],
    },
    'Two of Cups': {
      past: [
        reversed
          ? 'Bạn có thể từng ở trong môi trường làm việc lệch nhịp: phải hợp tác, chiều ý hoặc kết nối với người khác nhưng không thật sự thấy được đáp lại.'
          : 'Bạn từng làm tốt hơn khi có người đồng hành, cộng sự hoặc một môi trường biết trao đổi thật.',
        'Điều đó ảnh hưởng đến cách bạn nhìn những công việc cần giao tiếp và phối hợp.',
      ],
      present: [
        reversed
          ? 'Hiện tại, bạn có thể không hợp với kiểu công việc phải liên tục chiều cảm xúc người khác mà không có khoảng thở riêng.'
          : 'Hiện tại, bạn có thể cần một công việc có kết nối vừa đủ: có người để phối hợp, nhưng không quá mất mình trong quan hệ.',
        'Bạn cần môi trường giao tiếp rõ ràng, không phải nơi cứ phải đoán ý hoặc giữ hòa khí cả ngày.',
      ],
      future: [
        reversed
          ? 'Phía trước, nên tránh hướng khiến bạn phải luôn “có mặt” cho mọi người nhưng không có ranh giới.'
          : 'Phía trước, công việc hợp hơn có thể liên quan hợp tác, tư vấn, chăm sóc khách hàng, nghệ thuật, cộng đồng hoặc những vai trò cần sự tinh tế với con người.',
        'Điểm mấu chốt là kết nối phải có qua lại, không phải chỉ một mình bạn gánh phần cảm xúc.',
      ],
    },
  }[card.name];
  if (specific) return specific[positionKey] || specific.present;

  if (card.arcana === 'Major Arcana') {
    const majorFallback = {
      past: [
        `${card.name} cho thấy một trải nghiệm cũ đã ảnh hưởng đến cách bạn nhìn công việc và sự ổn định.`,
        'Lá này không nói về cảm xúc chung chung; nó đang hỏi bài học nghề nghiệp nào đã định hình lựa chọn của bạn.',
      ],
      present: [
        `${card.name} đang làm rõ một chủ đề lớn trong hướng nghề: bạn cần chọn theo năng lực thật, áp lực bên ngoài, hay cảm giác có ý nghĩa.`,
        'Đây là lúc nhìn vào kiểu môi trường và vai trò khiến bạn vận hành tốt nhất.',
      ],
      future: [
        `${card.name} cho thấy hướng nghề sắp tới sẽ kéo theo một thay đổi lớn hơn trong cách bạn sống và làm việc.`,
        'Đừng chỉ hỏi nghề nào nghe hay; hãy hỏi con đường nào làm bạn trưởng thành đúng kiểu của mình.',
      ],
    };
    return majorFallback[positionKey];
  }

  const suitLens = {
    Wands: [
      `${card.name} cho thấy bạn dễ hợp hơn với công việc có nhịp chủ động, được thử ý tưởng và thấy mình tạo ra chuyển động rõ ràng.`,
      reversed
        ? 'Nếu công việc chỉ kích thích lúc đầu nhưng không có hướng đi cụ thể, bạn sẽ nhanh mất lửa.'
        : 'Bạn cần môi trường cho phép làm thật, bắt đầu thứ mới hoặc dẫn một phần việc bằng năng lượng của mình.',
    ],
    Cups: [
      `${card.name} đưa câu hỏi nghề nghiệp về cách bạn làm việc với con người, cảm xúc, thẩm mỹ hoặc sự kết nối trong môi trường hằng ngày.`,
      reversed
        ? 'Nếu phải luôn chiều cảm xúc người khác hoặc giữ hòa khí quá lâu, bạn sẽ dễ kiệt cảm hứng.'
        : 'Bạn làm tốt hơn khi công việc có tương tác thật và một chút ý nghĩa, không chỉ là nhiệm vụ khô.',
    ],
    Swords: [
      `${card.name} kéo sự chú ý về cách bạn dùng đầu óc trong công việc: suy nghĩ sâu, nói rõ, phân tích, viết hoặc xử lý vấn đề.`,
      reversed
        ? 'Bạn khó hợp với nơi luôn khiến mình căng đầu, phải phòng thủ hoặc nghi ngờ năng lực mỗi ngày.'
        : 'Bạn hợp với nơi cần sự rõ ràng, tốc độ xử lý và khả năng nhìn thẳng vào vấn đề.',
    ],
    Pentacles: [
      `${card.name} nói nhiều về phần thực tế của nghề: thu nhập, kỹ năng tích lũy, lịch làm, trách nhiệm và khả năng đi đường dài.`,
      reversed
        ? 'Nếu hướng này thiếu nền rõ ràng, bạn nên kiểm tra kỹ thu nhập, thời gian, độ ổn định và cơ hội phát triển thật.'
        : 'Bạn hợp với con đường có thể tích lũy kỹ năng và tạo kết quả nhìn thấy được theo thời gian.',
    ],
  };
  return suitLens[card.suit] || null;
};

const getRelationshipCardInterpretation = (card, positionKey, context) => {
  const reversed = card.isReversed;
  const specific = {
    'King of Cups': {
      past: [
        'Giữa hai người từng có cảm xúc được giữ khá kín, không phải kiểu bộc phát rồi nói ra ngay.',
        'King of Cups cho thấy nếu người này từng thương hoặc nhớ, họ có xu hướng kiểm soát cảm xúc hơn là để bạn nhìn thấy hết.',
      ],
      present: [
        'King of Cups cho thấy cảm xúc vẫn có khả năng còn đó, nhưng được giữ rất kín.',
        'Nếu người này đang nhớ bạn, đó không phải kiểu nhớ vội vàng hay dễ bộc lộ; nó giống một điều được giữ lại bên trong hơn là nói ra.',
      ],
      future: [
        'Về phía trước, cảm xúc có thể vẫn được giữ trong trạng thái im lặng, chín chắn hoặc khó đoán.',
        'Lá này không cho cảm giác đã quên hẳn, nhưng cũng không hứa người kia sẽ chủ động bộc lộ ngay.',
      ],
    },
    'Three of Cups': {
      past: [
        'Giữa hai người từng có những khoảnh khắc nhẹ và tự nhiên khi ở cạnh nhau.',
        'Three of Cups không mang cảm giác đã bị xóa sạch; nó giống một kỷ niệm vui thỉnh thoảng vẫn có thể quay lại.',
      ],
      present: [
        'Hiện tại, lá này nghiêng về ký ức dễ chịu hơn là nỗi nhớ nặng nề.',
        'Nếu người này nhớ bạn, có thể là qua một khoảnh khắc vui, một câu chuyện cũ, hoặc cảm giác từng rất thoải mái khi ở gần nhau.',
      ],
      future: [
        'Phía trước vẫn có khả năng một dịp gặp lại, một tin nhắn nhẹ hoặc một lý do xã giao kéo hai người lại gần hơn.',
        'Nhưng Three of Cups thường nhẹ: nó nói về sự nhớ thoáng qua, không hẳn là một quyết định tình cảm sâu ngay lập tức.',
      ],
    },
    'Seven of Swords': {
      past: [
        'Đã từng có điều gì đó không được nói thẳng, khiến bạn phải đoán nhiều hơn là được nghe rõ.',
        'Seven of Swords cho thấy sự nhớ, nếu có, cũng từng đi kèm né tránh hoặc giữ khoảng cách.',
      ],
      present: [
        'Seven of Swords cho thấy có điều gì đó chưa được nói thẳng.',
        'Ngay cả khi vẫn còn nhớ, người này cũng có xu hướng giữ khoảng cách, quan sát nhiều hơn là chủ động bộc lộ.',
      ],
      future: [
        'Phía trước, nếu người này còn nhớ bạn, họ vẫn có thể chọn cách đi vòng: xem bạn phản ứng ra sao trước khi nói thật.',
        'Lá này khuyên đừng chỉ nhìn một tín hiệu nhỏ; hãy nhìn xem họ có dám rõ ràng hơn không.',
      ],
    },
    'Two of Cups': {
      past: [
        reversed
          ? 'Hai người từng có kết nối, nhưng nhịp cảm xúc có thể đã lệch: một bên cần gần hơn, một bên lại giữ khoảng cách.'
          : 'Giữa hai người từng có sự đáp lại khá rõ, dù có thể không phải lúc nào cũng được gọi tên.',
        'Lá này thường không xuất hiện khi một kết nối hoàn toàn vô nghĩa.',
      ],
      present: [
        reversed
          ? 'Hiện tại, nếu người này nhớ bạn, cảm xúc đó đang bị vướng bởi sự lệch nhịp hoặc một điều chưa nói rõ.'
          : 'Hiện tại vẫn có khả năng hai bên còn cảm được nhau, nhất là khi từng có sự gần gũi thật.',
        'Điểm cần nhìn là họ có dám bước lại gần bằng hành động hay chỉ để cảm xúc nằm yên.',
      ],
      future: [
        reversed
          ? 'Phía trước, nỗi nhớ nếu còn cũng chưa đủ để tự sửa sự lệch nhịp giữa hai người.'
          : 'Phía trước có khả năng kết nối lại nếu cả hai cùng cho cảm xúc một cách nói rõ hơn.',
        'Lá này cần sự đáp lại hai chiều; một mình nhớ là chưa đủ.',
      ],
    },
  }[card.name];
  if (specific) return specific[positionKey] || specific.present;

  if (card.arcana === 'Major Arcana') {
    const major = {
      past: [
        `${card.name} cho thấy câu chuyện này từng để lại một dấu ấn rõ trong cách hai người cảm nhận nhau.`,
        `Với câu hỏi này, lá bài không né phần “có nhớ không”; nó chỉ cho thấy nỗi nhớ ấy bị ảnh hưởng bởi ${context.tension}.`,
      ],
      present: [
        `${card.name} cho thấy cảm xúc hiện tại không đơn giản là có hoặc không.`,
        `Nó đang đi qua ${context.dynamic}, nên nếu còn nhớ, người này cũng không nhất thiết bộc lộ theo cách trực tiếp.`,
      ],
      future: [
        `${card.name} cho thấy cảm xúc sắp tới sẽ phụ thuộc vào việc hai người có dám rõ ràng hơn hay tiếp tục giữ khoảng cách.`,
        'Lá này không đóng câu trả lời lại, nhưng nó cho thấy cảm xúc vẫn đang có lực tác động lên câu chuyện.',
      ],
    };
    return major[positionKey];
  }

  const suitLens = {
    Cups: [
      `${card.name} nghiêng về cảm xúc còn lưu lại, nhất là những điều người ta không luôn nói ra nhưng vẫn cảm thấy.`,
      reversed
        ? 'Nếu còn nhớ, cảm xúc này có thể bị nghẹn, lệch nhịp hoặc không biết phải bộc lộ thế nào.'
        : 'Lá này cho cảm giác có sự mềm lại trong lòng, không phải kiểu đã quên sạch.',
    ],
    Swords: [
      `${card.name} cho thấy người này có thể nghĩ về bạn nhiều hơn họ để lộ.`,
      reversed
        ? 'Nhưng suy nghĩ đó dễ rối, phòng thủ hoặc bị giữ lại vì sợ nói sai.'
        : 'Điểm chính là họ quan sát và suy tính nhiều hơn là bộc lộ cảm xúc trực tiếp.',
    ],
    Wands: [
      `${card.name} mang cảm giác có sức hút hoặc phản ứng nhanh khi nghĩ tới bạn.`,
      reversed
        ? 'Nhưng năng lượng này thất thường: nhớ đó, muốn lại gần đó, rồi lại chùn hoặc mất nhịp.'
        : 'Nếu còn nhớ, đó thường là kiểu nhớ có lửa, dễ bị kích hoạt bởi hình ảnh, tin nhắn hoặc một khoảnh khắc bất ngờ.',
    ],
    Pentacles: [
      `${card.name} cho thấy nỗi nhớ, nếu có, gắn với thói quen, sự quen thuộc và cảm giác từng có chỗ đứng trong đời nhau.`,
      reversed
        ? 'Nhưng người này có thể ngại quay lại vì sợ mất ổn định hoặc không biết phải xây lại từ đâu.'
        : 'Đây không phải kiểu cảm xúc bốc đồng; nó đi chậm và nhìn vào sự có mặt thực tế.',
    ],
  };
  return suitLens[card.suit] || null;
};

const TAROT_MINOR_CARD_ARCHETYPES = {
  'Ace of Wands': {
    past: ['Từng có một tia lửa khiến bạn muốn bắt đầu ngay, dù mọi thứ còn thô và chưa có hình dạng.', 'Nó để lại trong bạn cảm giác rằng mình đã chạm vào một hướng sống động hơn.'],
    present: ['Một nguồn động lực mới đang nổi lên, nhanh và nóng hơn những gì bạn quen kiểm soát.', 'Ace of Wands cần được thử bằng hành động nhỏ, không phải giữ mãi trong tưởng tượng.'],
    future: ['Phía trước có một cơ hội khởi động lại nhiệt huyết.', 'Nếu bạn chờ đến khi hết nghi ngờ, tia lửa này có thể nguội trước khi thành ngọn.'],
    reversed: ['Khi đảo chiều, ngọn lửa này bị nghẹn lại: muốn bắt đầu nhưng thiếu nhịp, thiếu can đảm, hoặc thiếu một lý do đủ thật.'],
  },
  'Two of Wands': {
    past: ['Bạn từng đứng trước một ngưỡng mở rộng, nhìn ra xa nhưng vẫn chưa thật sự bước khỏi vùng quen.', 'Ký ức đó mang vị của kế hoạch còn bỏ dở.'],
    present: ['Hiện tại bạn đang nhìn thấy nhiều hơn phạm vi cũ của mình.', 'Two of Wands không vội; nó đặt bạn trước câu hỏi liệu mình có dám chọn một hướng lớn hơn không.'],
    future: ['Một lựa chọn xa hơn đang chờ bạn chuẩn bị nghiêm túc.', 'Điều này cần tầm nhìn, nhưng cũng cần một bước thật sự rời khỏi chỗ đứng hiện tại.'],
    reversed: ['Khi đảo chiều, tầm nhìn dễ co lại thành do dự; bạn thấy khả năng, nhưng vẫn ngại cái giá của việc bước ra.'],
  },
  'Three of Wands': {
    past: ['Bạn từng gửi một phần hy vọng ra xa và chờ nó hồi đáp.', 'Có thứ đã bắt đầu chuyển động từ trước khi bạn thấy kết quả.'],
    present: ['Hiện tại không còn là lúc chỉ tưởng tượng.', 'Three of Wands mang nhịp chờ đợi chủ động: bạn đã đặt điều gì đó ra ngoài thế giới và đang nhìn nó quay về.'],
    future: ['Phía trước mở ra nhờ một tầm nhìn rộng hơn hiện tại.', 'Điều bạn cần là kiên nhẫn với tiến trình, nhưng không buông tay khỏi hướng mình đã chọn.'],
    reversed: ['Khi đảo chiều, sự chờ đợi dễ thành hụt hơi; kế hoạch cần chỉnh lại trước khi bạn tiếp tục gửi năng lượng vào nó.'],
  },
  'Four of Wands': {
    past: ['Từng có một nơi, một người, hoặc một khoảnh khắc khiến bạn tin rằng mình có thể thuộc về.', 'Dấu ấm đó vẫn ảnh hưởng đến tiêu chuẩn hạnh phúc của bạn.'],
    present: ['Hiện tại đang cần một cảm giác an cư trong lòng, không chỉ một kết quả bên ngoài.', 'Four of Wands hỏi bạn nơi nào thật sự làm mình được thả lỏng.'],
    future: ['Phía trước có khả năng ổn định và vui hơn, nếu nền tảng được xây bằng sự có mặt thật lòng.', 'Niềm vui này cần được chia sẻ, không phải giữ một mình.'],
    reversed: ['Khi đảo chiều, cảm giác thuộc về bị lệch; có thể bạn đang ở trong một khung cảnh đáng lẽ vui, nhưng lòng vẫn chưa thật sự yên.'],
  },
  'Five of Wands': {
    past: ['Bạn từng ở trong một giai đoạn nhiều va chạm, nơi ai cũng muốn giành phần đúng của mình.', 'Nó làm bạn quen với việc phải thủ thế trước khi được lắng nghe.'],
    present: ['Hiện tại có nhiều lực kéo khác nhau, và không lực nào chịu đứng yên.', 'Five of Wands mang nhịp hỗn, nóng, cạnh tranh; vấn đề không chỉ là xung đột, mà là thiếu một hướng chung.'],
    future: ['Phía trước dễ có va chạm nếu mọi người tiếp tục nói từ cái tôi của mình.', 'Bạn cần chọn trận đáng bước vào, không phải phản ứng với mọi tiếng ồn.'],
    reversed: ['Khi đảo chiều, xung đột có thể không nổ ra ngoài nhưng vẫn âm ỉ bên dưới, khiến mọi thứ khó thật sự nhẹ.'],
  },
  'Six of Wands': {
    past: ['Bạn từng có một khoảnh khắc được công nhận, dù có thể chính bạn chưa cho phép mình nhận trọn nó.', 'Dấu ấn đó nhắc rằng bạn đã từng vượt qua điều không nhỏ.'],
    present: ['Hiện tại có cơ hội để bạn đứng thẳng hơn trong thành quả của mình.', 'Six of Wands không chỉ là chiến thắng; nó là cảm giác được nhìn thấy sau một hành trình nhiều thử thách.'],
    future: ['Phía trước có sự ghi nhận, nếu bạn tiếp tục đi theo điều mình đã chứng minh bằng hành động.', 'Đừng thu nhỏ mình chỉ để người khác thấy dễ chịu hơn.'],
    reversed: ['Khi đảo chiều, sự công nhận bị nghẹn lại; bạn có thể đã làm nhiều, nhưng vẫn thấy mình chưa đủ hoặc chưa được thấy đúng.'],
  },
  'Seven of Wands': {
    past: ['Bạn từng phải bảo vệ vị trí của mình trong một tình huống không cho phép mềm quá lâu.', 'Điều đó tạo nên phản xạ đứng gồng ngay cả khi chưa ai tấn công.'],
    present: ['Hiện tại bạn đang ở thế phải giữ lập trường.', 'Seven of Wands có nhịp căng, dựng đứng, không dễ thỏa hiệp; nó hỏi bạn điều gì thật sự đáng bảo vệ.'],
    future: ['Phía trước cần sự kiên định, nhưng không phải mọi lời phản đối đều xứng đáng lấy năng lượng của bạn.', 'Giữ vị trí, nhưng đừng biến cả đời mình thành một trận phòng thủ.'],
    reversed: ['Khi đảo chiều, bạn có thể mệt vì phải chứng minh quá lâu, hoặc bắt đầu nghi ngờ chính điều mình từng bảo vệ.'],
  },
  'Eight of Wands': {
    past: ['Từng có một giai đoạn mọi thứ đến dồn dập, nhanh đến mức bạn chỉ kịp phản ứng.', 'Tốc độ đó để lại cảm giác vừa hứng khởi vừa hụt hơi.'],
    present: ['Hiện tại năng lượng đang tăng tốc.', 'Eight of Wands không thích trì hoãn; tin tức, chuyển động hoặc quyết định có thể đến nhanh hơn bạn dự tính.'],
    future: ['Phía trước có sự chuyển động rõ rệt.', 'Nếu đã biết mình muốn gì, đây là lúc đi cùng nhịp thay vì kéo lùi vì sợ thay đổi quá nhanh.'],
    reversed: ['Khi đảo chiều, tốc độ bị nghẽn: tin chậm, phản hồi lệch, hoặc quá nhiều tín hiệu làm bạn khó biết đâu là hướng thật.'],
  },
  'Nine of Wands': {
    past: ['Bạn từng phải đi qua nhiều hơn những gì người khác thấy.', 'Nine of Wands giữ ký ức của một người vẫn đứng đó, nhưng không còn bước nhẹ như ban đầu.'],
    present: ['Hiện tại bạn đang cảnh giác, như thể chỉ cần lơi tay là mọi thứ lại làm mình đau.', 'Lá này không yếu; nó mỏi vì đã chịu đựng lâu.'],
    future: ['Phía trước cần bền bỉ, nhưng cũng cần phân biệt đâu là bảo vệ mình và đâu là tự nhốt mình.', 'Bạn gần hơn mình nghĩ, chỉ là đừng bước tiếp bằng toàn bộ vết thương.'],
    reversed: ['Khi đảo chiều, sự phòng thủ đã chuyển thành kiệt sức; bạn không cần chứng minh sức chịu đựng bằng cách tiếp tục đứng một mình.'],
  },
  'Ten of Wands': {
    past: ['Bạn từng gánh quá nhiều trách nhiệm đến mức quên cảm giác đi nhẹ là như thế nào.', 'Giai đoạn đó có thể đã dạy bạn mạnh, nhưng cũng lấy đi nhiều khoảng thở.'],
    present: ['Hiện tại có một sức nặng rất rõ trên vai.', 'Ten of Wands không nói về bi kịch lớn; nó nói về việc ôm quá nhiều thứ cho đến khi từng bước đều nặng.'],
    future: ['Phía trước buộc bạn nhìn lại điều gì không còn nên do một mình bạn mang.', 'Nếu không đặt xuống bớt, thành quả cũng có thể trở thành gánh nặng.'],
    reversed: ['Khi đảo chiều, cơ thể và lòng bạn đã bắt đầu phản đối. Việc buông bớt không phải bỏ cuộc, mà là sống tiếp có sức hơn.'],
  },
  'Page of Wands': {
    past: ['Bạn từng có một hứng khởi non trẻ, bốc lên nhanh và đầy tò mò.', 'Nó có thể chưa thành kế hoạch, nhưng đã đánh thức phần muốn thử của bạn.'],
    present: ['Hiện tại có một tín hiệu mới khiến bạn muốn khám phá.', 'Page of Wands mang nhịp trẻ, sáng, hơi liều; nó cần không gian để thử sai.'],
    future: ['Phía trước mở ra qua một lời mời, một ý tưởng, hoặc một ham muốn được sống khác đi.', 'Đừng bắt nó trưởng thành quá sớm; hãy để nó chứng minh bằng chuyển động.'],
    reversed: ['Khi đảo chiều, lửa trẻ dễ tắt vì thiếu cam kết, thiếu tự tin, hoặc vì bạn sợ mình chỉ hứng lên nhất thời.'],
  },
  'Knight of Wands': {
    past: ['Bạn từng lao theo một điều gì đó với rất nhiều nhiệt, có thể nhanh hơn mức tình huống chịu được.', 'Dấu vết của nó là cảm giác vừa sống động vừa khó giữ lâu.'],
    present: ['Hiện tại có năng lượng muốn tiến ngay.', 'Knight of Wands không đứng yên để cân đo quá lâu; nó bốc, thẳng, và đôi khi quên hỏi mình đang chạy về đâu.'],
    future: ['Phía trước cần hành động, nhưng hành động thiếu hướng sẽ dễ cháy hết trước khi tới đích.', 'Giữ ngọn lửa, nhưng đừng để nó lái thay bạn.'],
    reversed: ['Khi đảo chiều, sự nóng vội dễ biến thành thất thường: đến nhanh, rời nhanh, hứa nhanh, rồi mệt cũng nhanh.'],
  },
  'Queen of Wands': {
    past: ['Bạn từng có một giai đoạn sáng rực hơn, dám hiện diện và dám muốn nhiều hơn cho mình.', 'Ký ức đó vẫn còn trong cách bạn nhớ về sức hút của chính mình.'],
    present: ['Hiện tại bạn được nhắc bước ra với nhiều tự tin hơn.', 'Queen of Wands không xin phép để được tỏa sáng; cô ấy biết sự ấm áp và bản lĩnh có thể cùng tồn tại.'],
    future: ['Phía trước cần bạn chọn vai chủ động hơn trong câu chuyện của mình.', 'Đừng thu nhỏ sức sống chỉ vì sợ người khác thấy bạn quá nhiều.'],
    reversed: ['Khi đảo chiều, ánh lửa quay vào trong thành nghi ngờ, ghen tị hoặc cảm giác mình không còn đủ cuốn hút như trước.'],
  },
  'King of Wands': {
    past: ['Bạn từng phải dẫn dắt hoặc đưa ra quyết định khi chưa có ai thật sự chỉ đường.', 'Điều đó tạo trong bạn một kiểu bản lĩnh đi trước kết quả.'],
    present: ['Hiện tại cần tầm nhìn hơn là phản ứng tức thì.', 'King of Wands không chạy theo từng đốm lửa; ông chọn ngọn lửa đáng giữ và biến nó thành hướng đi.'],
    future: ['Phía trước cần sự quyết đoán có trách nhiệm.', 'Nếu bạn biết mình muốn xây điều gì, hãy dẫn dắt bằng tầm nhìn chứ không bằng áp lực.'],
    reversed: ['Khi đảo chiều, quyền chủ động dễ biến thành áp đặt hoặc hấp tấp; sức mạnh cần được điều khiển, không phóng ra để chứng minh.'],
  },
  'Ace of Cups': {
    past: ['Từng có một cảm xúc mới mở ra, trong trẻo hơn những gì bạn dự tính.', 'Nó có thể là một sự rung động, một lời xin lỗi, hoặc cảm giác lòng mình mềm lại.'],
    present: ['Hiện tại trái tim đang muốn mở, dù vẫn còn dè dặt.', 'Ace of Cups không ép bạn phải yêu hay tha thứ ngay; nó chỉ cho thấy nước đã bắt đầu chảy lại.'],
    future: ['Phía trước có khả năng chữa lành hoặc bắt đầu một dòng cảm xúc mới.', 'Điều này cần được đón bằng sự thật lòng, không phải bằng nỗi sợ lặp lại chuyện cũ.'],
    reversed: ['Khi đảo chiều, cảm xúc bị giữ lại trong lòng: muốn nói nhưng nghẹn, muốn nhận nhưng vẫn sợ mình quá dễ tổn thương.'],
  },
  'Two of Cups': {
    past: ['Bạn từng chạm vào một kết nối khiến mình tin vào sự gặp gỡ thật lòng.', 'Dù kết quả ra sao, nó đã để lại chuẩn mực về sự đồng điệu.'],
    present: ['Hiện tại câu chuyện xoay quanh sự trao đổi giữa hai phía.', 'Two of Cups cần sự đáp lại, không phải một người cứ đoán còn một người cứ im.'],
    future: ['Phía trước có thể mở ra sự gần gũi hơn nếu hai bên cùng bước về phía nhau.', 'Kết nối này cần lời thật hơn là tín hiệu mơ hồ.'],
    reversed: ['Khi đảo chiều, nhịp giữa hai người lệch: một bên muốn gần, một bên giữ khoảng cách, hoặc cả hai đều sợ nói thật.'],
  },
  'Three of Cups': {
    past: ['Từng có sự nâng đỡ từ bạn bè, cộng đồng, hoặc một khoảnh khắc được chia vui.', 'Nó nhắc bạn rằng không phải mọi hành trình đều cần đi một mình.'],
    present: ['Hiện tại cần nhiều không khí nhẹ hơn và ít tự cô lập hơn.', 'Three of Cups mang nhịp gặp gỡ, chia sẻ, để lòng mình được đặt vào một vòng an toàn hơn.'],
    future: ['Phía trước có niềm vui đến qua người khác, qua sự kết nối hoặc một tin đáng mừng.', 'Hãy để bản thân được nhận sự có mặt của những người thật lòng.'],
    reversed: ['Khi đảo chiều, các mối quan hệ xung quanh có thể rối, loãng, hoặc khiến bạn thấy mình đứng ngoài một vòng mà đáng ra mình thuộc về.'],
  },
  'Four of Cups': {
    past: ['Bạn từng khép lại trước một lời mời hoặc một cơ hội vì lòng đã quá mệt để đón nhận thêm.', 'Sự thờ ơ đó có thể không phải lạnh nhạt, mà là tự vệ.'],
    present: ['Hiện tại bạn đang khó thấy điều đang được đưa tới.', 'Four of Cups mang nhịp trầm, khép, như một người ngồi rất gần cơ hội nhưng mắt vẫn hướng vào khoảng trống trong lòng.'],
    future: ['Phía trước có điều muốn đến gần, nhưng bạn cần mở ra vừa đủ để nhận ra nó.', 'Không phải mọi cơ hội đều rực rỡ ngay từ đầu.'],
    reversed: ['Khi đảo chiều, lớp khép kín bắt đầu nứt ra; bạn có thể đang sẵn sàng nhìn lại điều từng bị mình từ chối.'],
  },
  'Five of Cups': {
    past: ['Bạn từng mất một điều khiến mắt mình chỉ còn nhìn vào phần đổ vỡ.', 'Five of Cups giữ ký ức của tiếc nuối, nhưng cũng có những chiếc cốc chưa hề biến mất.'],
    present: ['Hiện tại nỗi buồn có thể đang kéo sự chú ý về thứ đã không như mong đợi.', 'Lá này không ép bạn vui lên; nó chỉ nhắc rằng toàn bộ câu chuyện không nằm trong phần đã mất.'],
    future: ['Phía trước cần một khoảnh khắc quay người lại.', 'Khi bạn thôi chỉ nhìn vào điều không còn, một con đường khác mới hiện ra đủ rõ.'],
    reversed: ['Khi đảo chiều, sự hồi phục đã bắt đầu, nhưng bạn có thể vẫn chưa tin mình được phép nhẹ lòng.'],
  },
  'Six of Cups': {
    past: ['Quá khứ ở đây rất gần, có thể qua một người cũ, một ký ức dịu, hoặc một phiên bản bạn từng là.', 'Six of Cups mang mùi của hồi ức hơn là hiện tại.'],
    present: ['Hiện tại bạn có thể đang nhìn tình huống bằng một lớp kỷ niệm.', 'Điều đó làm mọi thứ mềm hơn, nhưng cũng dễ khiến bạn lý tưởng hóa điều đã qua.'],
    future: ['Phía trước có sự trở lại của một cảm giác cũ.', 'Hãy đón nó bằng lòng dịu, nhưng đừng để ký ức quyết định thay hiện tại.'],
    reversed: ['Khi đảo chiều, quá khứ không còn chỉ là nơi để nhớ; nó có thể đang giữ chân bạn lâu hơn mức cần thiết.'],
  },
  'Seven of Cups': {
    past: ['Bạn từng đứng trước quá nhiều khả năng, đến mức điều nào cũng có vẻ đúng trong một khoảnh khắc.', 'Sự mơ hồ đó làm bạn khó chọn, hoặc chọn bằng hình ảnh hơn là sự thật.'],
    present: ['Hiện tại có nhiều viễn cảnh đang cạnh tranh trong đầu bạn.', 'Seven of Cups không thiếu lựa chọn; nó thiếu một mặt đất đủ rõ để biết lựa chọn nào có thật.'],
    future: ['Phía trước cần phân biệt giữa điều làm bạn say mê và điều có thể sống cùng bạn sau cơn mơ.', 'Đừng để một hình ảnh đẹp thay thế cho sự thật.'],
    reversed: ['Khi đảo chiều, sương bắt đầu tan; điều từng hấp dẫn có thể lộ ra phần không thực tế của nó.'],
  },
  'Eight of Cups': {
    past: ['Bạn từng rời khỏi một điều không còn nuôi được lòng mình, dù nó chưa hẳn đã hoàn toàn xấu.', 'Eight of Cups mang nỗi buồn của người biết mình phải đi.'],
    present: ['Hiện tại có một phần trong bạn muốn bước ra khỏi thứ đã cạn nghĩa.', 'Lá này không ồn ào; nó quay lưng trong im lặng vì ở lại cũng không còn thật.'],
    future: ['Phía trước có một cuộc rời đi cần thiết.', 'Bạn không cần ghét điều cũ mới được phép chọn điều sâu hơn cho mình.'],
    reversed: ['Khi đảo chiều, bạn có thể đang quay lại với điều không còn nuôi mình, chỉ vì rời đi vẫn quá khó.'],
  },
  'Nine of Cups': {
    past: ['Bạn từng có một khoảnh khắc thấy mình gần với điều mong muốn.', 'Nine of Cups giữ dư vị của sự hài lòng, nhưng cũng hỏi liệu điều đó có thật sự đủ sâu không.'],
    present: ['Hiện tại một mong muốn cá nhân đang rất rõ.', 'Lá này không xấu khi đặt bản thân lên trước; nó chỉ hỏi bạn đang muốn điều gì vì vui thật, không phải vì muốn lấp khoảng trống.'],
    future: ['Phía trước có khả năng đạt được điều bạn mong, nhưng niềm vui cần được cảm nhận chứ không chỉ sở hữu.', 'Hãy chọn điều làm lòng bạn đầy, không chỉ làm hình ảnh bên ngoài đẹp hơn.'],
    reversed: ['Khi đảo chiều, sự thỏa mãn có thể hơi rỗng; bạn đạt được một điều, nhưng vẫn thấy thiếu thứ khó gọi tên hơn.'],
  },
  'Ten of Cups': {
    past: ['Bạn từng tin vào một hình ảnh hạnh phúc rất trọn: gia đình, kết nối, hoặc một nơi mình có thể yên lòng.', 'Ten of Cups lưu giữ lý tưởng đó như một bầu trời từng rất sáng.'],
    present: ['Hiện tại câu chuyện xoay quanh sự hòa hợp thật, không phải vẻ ngoài êm đẹp.', 'Ten of Cups hỏi liệu niềm vui này có được chia sẻ đều, hay chỉ đang được giữ bằng mong muốn của một phía.'],
    future: ['Phía trước có khả năng đi tới một trạng thái ấm hơn, nếu mọi người cùng muốn xây sự bình yên đó.', 'Hạnh phúc ở đây cần sự thật, không chỉ một bức tranh đẹp.'],
    reversed: ['Khi đảo chiều, lý tưởng hạnh phúc bị lệch: có thể vẫn còn tình cảm, nhưng sự kết nối không chạm nhau như bạn từng mong.'],
  },
  'Page of Cups': {
    past: ['Từng có một cảm xúc rất non, vụng về nhưng thật.', 'Page of Cups mang ký ức của lời nhắn nhỏ, một rung động bất ngờ, hoặc một lần lòng bạn mềm ra trước điều không dự tính.'],
    present: ['Hiện tại có một tín hiệu cảm xúc muốn được nghe, dù nó chưa trưởng thành thành lời rõ ràng.', 'Page of Cups không chắc chắn, nhưng rất thành thật trong sự ngập ngừng của nó.'],
    future: ['Phía trước có thể đến một lời mở lòng, một lời xin lỗi, hoặc một cảm xúc mới còn ngại ngùng.', 'Đừng xem nhẹ điều nhỏ chỉ vì nó chưa biết cách đứng vững.'],
    reversed: ['Khi đảo chiều, sự nhạy cảm dễ thành phòng thủ hoặc phản ứng trẻ con; điều cần nói ra có thể đang bị giấu sau vẻ im lặng.'],
  },
  'Knight of Cups': {
    past: ['Bạn từng đi theo một lời hứa đẹp hoặc một cảm giác rất cuốn.', 'Knight of Cups để lại dư vị lãng mạn, nhưng cũng có thể là sự hụt hẫng khi mộng đẹp không đủ thực tế.'],
    present: ['Hiện tại có một mong muốn được chạm tới điều mềm và đẹp hơn.', 'Knight of Cups tiến bằng trái tim, bằng lời mời, bằng hình ảnh khiến người ta muốn tin.'],
    future: ['Phía trước có một lời mời cảm xúc hoặc một hướng đi nhiều cảm hứng.', 'Hãy đón vẻ đẹp của nó, nhưng đừng bỏ qua việc nó có đứng được trong đời thật không.'],
    reversed: ['Khi đảo chiều, lời đẹp có thể mỏng, cảm xúc có thể trôi, và điều hứa hẹn chưa chắc đã có nền để ở lại.'],
  },
  'Queen of Cups': {
    past: ['Bạn từng cảm nhận rất sâu, có thể sâu hơn những gì mình nói ra.', 'Queen of Cups giữ ký ức của sự thấu hiểu, chăm sóc, và cả những điều bạn giữ trong lòng để người khác được yên.'],
    present: ['Hiện tại bạn đang nhận rất nhiều tín hiệu bằng cảm giác hơn là bằng lời.', 'Queen of Cups hiểu những thay đổi nhỏ trong giọng nói, khoảng cách, sự im lặng.'],
    future: ['Phía trước cần một trái tim mềm nhưng không tan vào mọi cảm xúc xung quanh.', 'Queen of Cups cho thấy sự dịu dàng vẫn là sức mạnh, nếu nó đi cùng ranh giới.'],
    reversed: ['Khi đảo chiều, sự thấu cảm có thể trở thành kiệt sức; bạn nghe được người khác quá rõ nhưng lại bỏ qua tiếng mình.',
    ],
  },
  'King of Cups': {
    past: ['Bạn từng học cách giữ bình tĩnh ngay cả khi bên trong không hoàn toàn yên.', 'King of Cups mang ký ức của một người đã phải trưởng thành trong cảm xúc.'],
    present: ['Hiện tại cần sự điềm tĩnh, nhưng không phải kiểu nuốt hết mọi thứ vào trong.', 'King of Cups biết cảm xúc có sức mạnh khi nó được giữ bằng sự hiểu biết, không phải bị khóa lại.'],
    future: ['Phía trước cần một phản ứng chín chắn hơn, ít bị cuốn bởi sóng nhất thời.', 'Sự vững vàng ở đây không phải lạnh đi, mà là biết mình đang cảm gì mà vẫn chọn đúng.'],
    reversed: ['Khi đảo chiều, vẻ bình thản có thể che đi kiểm soát, né tránh, hoặc một cảm xúc bị nén quá lâu.'],
  },
  'Ace of Swords': {
    past: ['Từng có một sự thật cắt qua màn mơ hồ.', 'Ace of Swords để lại cảm giác tỉnh ra, đôi khi sắc đến mức khó dịu ngay.'],
    present: ['Hiện tại cần một câu nói rõ, một quyết định rõ, hoặc một cách nhìn không tự lừa mình nữa.', 'Ace of Swords không trang trí sự thật; nó đưa lưỡi kiếm vào đúng chỗ nhập nhằng.'],
    future: ['Phía trước mở ra bằng sự minh bạch.', 'Điều này có thể không êm, nhưng nó giúp bạn thôi đi vòng quanh điều đã biết.'],
    reversed: ['Khi đảo chiều, sự thật bị nhiễu: lời nói dễ gây đau, suy nghĩ dễ rối, và quyết định dễ đến từ phản ứng hơn là tỉnh táo.'],
  },
  'Two of Swords': {
    past: ['Bạn từng chọn cách không chọn, vì nhìn thẳng vào vấn đề lúc đó quá khó.', 'Two of Swords giữ ký ức của một sự im lặng căng như dây.'],
    present: ['Hiện tại bạn đang bị kẹt giữa hai phía hoặc hai phiên bản của chính mình.', 'Lá này không thiếu thông tin hoàn toàn; nó thiếu sự sẵn sàng mở mắt trước điều mình đã cảm thấy.'],
    future: ['Phía trước không thể đứng mãi trong vùng trung lập.', 'Một quyết định sẽ nhẹ hơn nhiều so với việc tiếp tục giữ cả hai cánh cửa khép hờ.'],
    reversed: ['Khi đảo chiều, sự né tránh bắt đầu mất tác dụng; điều bị trì hoãn sẽ tự tìm cách bước ra.'],
  },
  'Three of Swords': {
    past: ['Bạn từng bị một sự thật làm đau theo cách không dễ nói gọn.', 'Three of Swords mang vết cắt của thất vọng, mất mát, hoặc một lời đã đi quá sâu.'],
    present: ['Hiện tại có một điểm đau đang cần được thừa nhận thay vì giải thích cho nhỏ lại.', 'Lá này không đến để làm bạn chìm xuống, mà để vết thương không bị phủ thêm lớp im lặng.'],
    future: ['Phía trước có sự thật cần được nói hoặc được chấp nhận.', 'Nó có thể nhói, nhưng né tránh lâu hơn sẽ chỉ làm vết cắt kéo dài.'],
    reversed: ['Khi đảo chiều, quá trình lành đã bắt đầu, dù thỉnh thoảng ký ức vẫn chạm vào đúng chỗ đau.'],
  },
  'Four of Swords': {
    past: ['Bạn từng phải rút lui để không vỡ thêm.', 'Four of Swords giữ nhịp nghỉ sau căng thẳng, khi im lặng là cách cơ thể tự cứu mình.'],
    present: ['Hiện tại cần một khoảng dừng thật sự.', 'Không phải dừng để bỏ cuộc, mà để tâm trí thôi chạy qua cùng một hành lang quá nhiều lần.'],
    future: ['Phía trước sẽ rõ hơn sau khi bạn cho mình thời gian hồi sức.', 'Câu trả lời không đến nhanh hơn chỉ vì bạn ép mình nghĩ nhiều hơn.'],
    reversed: ['Khi đảo chiều, sự nghỉ ngơi bị trì hoãn quá lâu; bạn có thể vẫn hoạt động, nhưng bên trong đã đòi được yên.'],
  },
  'Five of Swords': {
    past: ['Bạn từng đi qua một cuộc hơn thua để lại vị đắng.', 'Five of Swords không chỉ hỏi ai thắng, mà hỏi cái giá của việc thắng là gì.'],
    present: ['Hiện tại có thể đang tồn tại một căng thẳng nơi lời nói dễ thành vũ khí.', 'Lá này mang cảm giác sau một cuộc tranh chấp: còn đứng đó, nhưng không hẳn thấy nhẹ.'],
    future: ['Phía trước cần tránh một chiến thắng làm tổn hại điều bạn thật sự muốn giữ.', 'Có lúc rời khỏi cuộc đấu mới là cách giữ lại phẩm giá.'],
    reversed: ['Khi đảo chiều, cánh cửa sửa chữa vẫn còn, nhưng chỉ mở nếu cái tôi chịu đặt vũ khí xuống trước.'],
  },
  'Six of Swords': {
    past: ['Bạn từng rời khỏi một vùng khó, không phải trong chiến thắng, mà trong im lặng mệt mỏi.', 'Six of Swords giữ ký ức của chuyến đi khỏi điều đã làm mình nặng.'],
    present: ['Hiện tại bạn đang ở giữa quá trình chuyển sang nơi yên hơn.', 'Chưa hẳn nhẹ ngay, nhưng ít nhất dòng nước đã bắt đầu đưa bạn ra khỏi bờ cũ.'],
    future: ['Phía trước là một giai đoạn bớt nhiễu hơn nếu bạn chấp nhận không mang toàn bộ quá khứ theo mình.', 'Đi tiếp không có nghĩa là quên; chỉ là thôi sống trong vùng cũ.'],
    reversed: ['Khi đảo chiều, hành trình bị kéo chậm bởi thứ bạn vẫn ngoái lại quá nhiều.'],
  },
  'Seven of Swords': {
    past: ['Bạn từng phải đi vòng, giấu một phần kế hoạch, hoặc tự bảo vệ mình bằng cách không nói hết.', 'Seven of Swords để lại cảm giác luôn phải tính đường lui.'],
    present: ['Hiện tại có điều gì đó chưa hoàn toàn minh bạch.', 'Lá này mang nhịp lặng, khôn, thận trọng; không nhất thiết là phản bội, nhưng chắc chắn có phần đang tránh ánh sáng.'],
    future: ['Phía trước cần chiến lược, nhưng chiến lược không nên trở thành né tránh sự thật.', 'Đi đường vòng chỉ hữu ích khi bạn vẫn biết mình đang đi về đâu.'],
    reversed: ['Khi đảo chiều, điều bị giấu dễ lộ ra, hoặc chính bạn bắt đầu mệt vì phải giữ quá nhiều lớp phòng vệ.'],
  },
  'Eight of Swords': {
    past: ['Bạn từng ở trong một trạng thái tự giới hạn, nơi lựa chọn có đó nhưng rất khó nhìn thấy.', 'Eight of Swords giữ cảm giác bị trói bởi chính nỗi sợ và suy nghĩ lặp lại.'],
    present: ['Hiện tại bạn có thể đang tin rằng mình không còn lối ra, trong khi một phần của chiếc khóa nằm ở cách bạn nhìn tình huống.', 'Lá này căng vì tâm trí dựng tường nhanh hơn thực tế.'],
    future: ['Phía trước cần một lần tháo khăn bịt mắt, không phải một phép màu lớn.', 'Khi bạn gọi đúng điều đang sợ, sợi dây đầu tiên sẽ lỏng ra.'],
    reversed: ['Khi đảo chiều, bạn bắt đầu thấy lối ra; nó chưa rộng, nhưng đủ để chứng minh mình không bị kẹt mãi.'],
  },
  'Nine of Swords': {
    past: ['Bạn từng mất ngủ trong một nỗi lo phóng đại mọi khả năng xấu nhất.', 'Nine of Swords giữ ký ức của những đêm tâm trí không chịu dừng.'],
    present: ['Hiện tại có một nỗi sợ đang lớn hơn sự kiện thật.', 'Lá này không xem nhẹ điều bạn chịu; nó chỉ chỉ ra rằng suy nghĩ đang làm nỗi đau vang to hơn.'],
    future: ['Phía trước cần bạn nói ra điều đang ám mình trước khi nó thành một căn phòng kín.', 'Ánh sáng ban ngày thường làm những bóng đêm này nhỏ lại.'],
    reversed: ['Khi đảo chiều, cơn lo bắt đầu mất quyền lực, nhưng bạn vẫn cần dịu với hệ thần kinh đã căng quá lâu.'],
  },
  'Ten of Swords': {
    past: ['Bạn từng chạm đáy của một câu chuyện khiến mình kiệt hơn cả lời có thể diễn tả.', 'Ten of Swords là khoảnh khắc sau cùng, khi không còn sức để giả vờ rằng mọi thứ vẫn ổn.'],
    present: ['Hiện tại có một kết thúc đau hoặc một nhận thức không thể né thêm.', 'Lá này không nhẹ, nhưng nó có một sự thật: điều tệ nhất đã lộ mặt thì nó không còn rình trong bóng tối nữa.'],
    future: ['Phía trước là quá trình bò ra khỏi điều đã làm bạn cạn sức.', 'Ten of Swords không hứa hồi phục nhanh; nó chỉ nói rằng sau đáy vẫn có mặt đất để đứng dậy.'],
    reversed: ['Khi đảo chiều, bạn đang sống sót qua hậu chấn. Chưa khỏe hẳn, nhưng đã không còn nằm yên dưới cùng một lưỡi dao.'],
  },
  'Page of Swords': {
    past: ['Bạn từng bước vào chuyện này với nhiều câu hỏi hơn câu trả lời.', 'Page of Swords mang nhịp nhanh, sắc, hơi căng: quan sát nhiều, nghĩ nhiều, cố hiểu từng dấu hiệu.'],
    present: ['Hiện tại bạn đang nhìn rất kỹ, có thể kỹ đến mức một chi tiết nhỏ cũng đủ làm bạn đổi hướng suy nghĩ.', 'Page of Swords không bình yên. Nó muốn biết, muốn hỏi, muốn bóc tách điều chưa rõ.'],
    future: ['Phía trước cần sự rõ ràng, nhưng không cần bạn nghi ngờ mọi thứ để tự bảo vệ mình.', 'Một câu hỏi thẳng có thể nhẹ hơn rất nhiều so với nhiều ngày tự suy diễn.'],
    reversed: ['Khi đảo chiều, sự sắc bén dễ biến thành nghi ngờ quá mức hoặc lời nói vội làm tình huống thêm rối.'],
  },
  'Knight of Swords': {
    past: ['Bạn từng lao vào một quyết định hoặc cuộc đối thoại quá nhanh.', 'Knight of Swords để lại dư âm của lời nói thẳng, hành động gấp, và đôi khi là điều chưa kịp nghe hết.'],
    present: ['Hiện tại năng lượng đang thúc bạn tiến nhanh.', 'Lá này sắc và trực diện, nhưng nếu chạy chỉ để thoát khỏi sự khó chịu, nó dễ cắt nhầm điều cần giữ.'],
    future: ['Phía trước cần hành động rõ, nhưng không cần hấp tấp.', 'Sự thật có thể được nói bằng một lưỡi kiếm vững, không nhất thiết phải vung mạnh.'],
    reversed: ['Khi đảo chiều, tốc độ vượt qua sự tỉnh táo; lời nói hoặc quyết định có thể đến trước khi trái tim kịp hiểu hậu quả.'],
  },
  'Queen of Swords': {
    past: ['Bạn từng phải học cách lạnh hơn một chút để bảo vệ phần mềm của mình.', 'Queen of Swords giữ ký ức của những ranh giới được dựng lên sau thất vọng.'],
    present: ['Hiện tại cần sự rõ ràng không vòng vo.', 'Lá này không ghét cảm xúc; nó chỉ không để cảm xúc làm mờ sự thật đã quá rõ.'],
    future: ['Phía trước cần một câu nói sắc nhưng công bằng.', 'Bạn có thể giữ lòng mình sạch mà vẫn không cho phép điều sai tiếp tục đi qua.'],
    reversed: ['Khi đảo chiều, sự phòng vệ dễ thành cứng, hoặc lời nói sắc hơn mức tình huống thật sự cần.'],
  },
  'King of Swords': {
    past: ['Bạn từng phải dùng lý trí để đi qua một tình huống nhiều nhiễu.', 'King of Swords giữ dấu ấn của quyết định dựa trên nguyên tắc hơn là cảm giác nhất thời.'],
    present: ['Hiện tại cần cái nhìn thẳng và công bằng.', 'Lá này không bị kéo bởi drama; nó đặt câu hỏi điều gì đúng, điều gì có căn cứ, điều gì cần được nói rõ.'],
    future: ['Phía trước cần một quyết định trưởng thành, có ranh giới và có trách nhiệm.', 'Đừng dùng sự thông minh để né cảm xúc, nhưng cũng đừng để cảm xúc thay bạn ký quyết định.'],
    reversed: ['Khi đảo chiều, lý trí có thể trở thành công cụ kiểm soát, hoặc sự lạnh lùng được gọi nhầm là khách quan.'],
  },
  'Ace of Pentacles': {
    past: ['Từng có một cơ hội thực tế xuất hiện, nhưng nền bên dưới có thể chưa đủ vững để bạn nắm lấy.', 'Ace of Pentacles nhắc về một hạt mầm cần đất tốt, thời gian và sự chăm sóc đều đặn.'],
    present: ['Hiện tại có một cơ hội mới, nhưng nó cần được đặt xuống bằng hành động cụ thể chứ không chỉ bằng mong muốn.', 'Ace of Pentacles không mang nhịp vội. Nó hỏi bạn có đang xây từ nền thật hay chỉ đang chờ một cảm giác chắc chắn tuyệt đối.'],
    future: ['Một cơ hội mới có thể đến, nhưng bạn sẽ khó nắm lấy nếu vẫn nhìn bản thân từ tâm thế thiếu thốn.', 'Ace of Pentacles thường xuất hiện khi điều cần nhất không phải liều lĩnh, mà là bắt đầu xây lại từ thứ nhỏ nhưng thực tế.'],
    reversed: ['Khi đảo chiều, hạt mầm có đó nhưng đất chưa chắc; nỗi sợ mất an toàn có thể khiến bạn chần chừ quá lâu.'],
  },
  'Two of Pentacles': {
    past: ['Bạn từng phải xoay xở nhiều thứ cùng lúc, đến mức sự ổn định chỉ còn là giữ cho mọi thứ chưa rơi.', 'Giai đoạn đó có thể đã dạy bạn linh hoạt, nhưng cũng khiến bạn quen sống trong trạng thái luôn phải tính bước tiếp theo.'],
    present: ['Hiện tại bạn đang cố giữ nhiều đầu việc, nhiều nỗi lo, hoặc nhiều lựa chọn cùng chuyển động.', 'Có cảm giác như chỉ cần dừng lại một chút, một thứ nào đó sẽ lệch khỏi quỹ đạo.'],
    future: ['Phía trước đòi hỏi bạn chọn nhịp bền hơn, thay vì tiếp tục xoay xở bằng phản xạ.', 'Nếu mọi thứ đều quan trọng như nhau, bạn sẽ khó giữ được sự ổn định thật sự.'],
    reversed: ['Khi đảo chiều, nhịp xoay xở đã bắt đầu quá tải; đây là lúc bớt một thứ khỏi tay, không phải chứng minh mình giữ được tất cả.'],
  },
  'Three of Pentacles': {
    past: ['Bạn từng học được rằng một việc bền cần nhiều bàn tay hoặc một cấu trúc hợp tác rõ ràng.', 'Three of Pentacles giữ ký ức của tay nghề, ghi nhận, và việc xây từng phần nhỏ cho đúng.'],
    present: ['Hiện tại cần phối hợp hơn là tự gồng.', 'Lá này hỏi ai đang thật sự cùng xây với bạn, và ai chỉ đứng gần công trình.'],
    future: ['Phía trước tiến triển qua cộng tác, kỹ năng và sự công nhận đúng chỗ.', 'Đừng làm một mình điều vốn cần được chia vai.'],
    reversed: ['Khi đảo chiều, nhịp phối hợp lệch; bạn có thể đang làm nhiều hơn phần mình, hoặc chưa được nhìn đúng năng lực.'],
  },
  'Four of Pentacles': {
    past: ['Bạn từng phải giữ chặt để thấy an toàn.', 'Four of Pentacles giữ ký ức của việc kiểm soát nguồn lực, cảm xúc, hoặc một vị trí không dễ buông.'],
    present: ['Hiện tại bạn đang nắm chặt một điều vì sợ mất nó.', 'Lá này không trách sự cẩn thận, nhưng hỏi cái giá của việc không cho gì được chảy ra hay chảy vào.'],
    future: ['Phía trước cần phân biệt giữa bảo vệ và đóng kín.', 'Có thứ chỉ bền khi được thở, không phải khi bị giữ quá lâu.'],
    reversed: ['Khi đảo chiều, bàn tay bắt đầu mỏi; hoặc bạn buông quá nhanh vì đã giữ quá lâu. Cân bằng mới là chìa khóa.'],
  },
  'Five of Pentacles': {
    past: ['Bạn từng đi qua một giai đoạn thấy mình đứng ngoài sự đủ đầy của người khác.', 'Five of Pentacles mang cái lạnh rất cụ thể: thiếu hỗ trợ, thiếu nguồn lực, hoặc thiếu cảm giác được chọn.'],
    present: ['Hiện tại có một nỗi lo thực tế đang làm bạn co lại.', 'Five of Pentacles không chỉ nói về thiếu thốn; nó nói về cảm giác phải tự chịu đựng khi đáng ra có thể tìm thấy một cánh cửa mở.'],
    future: ['Nếu tiếp tục nhìn mọi thứ qua cảm giác thiếu, bạn có thể bỏ qua một nguồn hỗ trợ đang ở gần hơn mình nghĩ.', 'Sự phục hồi bắt đầu bằng việc thôi đứng một mình ngoài cửa.'],
    reversed: ['Khi đảo chiều, cánh cửa hỗ trợ đã bắt đầu hiện ra; vấn đề là bạn có cho phép mình bước vào không.'],
  },
  'Six of Pentacles': {
    past: ['Bạn từng ở trong một thế cho-nhận không hoàn toàn cân bằng.', 'Six of Pentacles giữ ký ức của sự giúp đỡ, biết ơn, hoặc quyền lực nằm trong tay người đang cho.'],
    present: ['Hiện tại câu chuyện xoay quanh việc ai đang cho, ai đang nhận, và có điều kiện nào đi kèm không.', 'Lá này rất thực tế: sự hào phóng chỉ đẹp khi không làm một bên nhỏ lại.'],
    future: ['Phía trước cần sự trao đổi công bằng hơn.', 'Hãy nhận điều cần nhận, nhưng đừng để lòng biết ơn biến thành món nợ vô hình.'],
    reversed: ['Khi đảo chiều, cán cân lệch: có thể bạn đang cho quá nhiều, hoặc nhận trong một thế khiến mình mất tự do.'],
  },
  'Seven of Pentacles': {
    past: ['Bạn từng đầu tư thời gian, công sức hoặc niềm tin vào một điều chưa trả kết quả ngay.', 'Seven of Pentacles giữ nhịp chờ, quan sát, tự hỏi liệu mình có gieo đúng chỗ không.'],
    present: ['Hiện tại bạn đang nhìn lại tiến độ.', 'Lá này không vội thu hoạch; nó hỏi điều gì đáng tiếp tục chăm, điều gì cần đổi cách nuôi.'],
    future: ['Phía trước cần kiên nhẫn có ý thức.', 'Đừng bỏ cuộc chỉ vì cây chưa ra quả, nhưng cũng đừng tiếp tục tưới một mảnh đất đã cạn.'],
    reversed: ['Khi đảo chiều, sự chờ đợi dễ thành bực bội; bạn cần xem lại mình đang đầu tư vì niềm tin hay vì tiếc công.'],
  },
  'Eight of Pentacles': {
    past: ['Bạn từng rèn một kỹ năng hoặc một thói quen bằng sự lặp lại bền bỉ.', 'Eight of Pentacles giữ dấu tay của người âm thầm làm cho tốt hơn từng chút.'],
    present: ['Hiện tại cần tập trung vào tay nghề, quy trình, và việc làm thật.', 'Lá này không thích đường tắt; nó tin vào sự tiến bộ được nhìn thấy qua từng lần sửa.'],
    future: ['Phía trước mở ra nhờ sự chăm chỉ có hướng.', 'Nếu bạn tiếp tục nâng chất lượng, thành quả sẽ đến từ độ vững chứ không phải may mắn.'],
    reversed: ['Khi đảo chiều, việc lặp lại có thể thành máy móc; bạn làm nhiều nhưng chưa chắc đang tốt lên đúng chỗ.'],
  },
  'Nine of Pentacles': {
    past: ['Bạn từng xây được một điều gì đó bằng sự kiên nhẫn của riêng mình.', 'Nine of Pentacles mang cảm giác tự đứng vững sau nhiều lần phải tự lo, tự học, tự giữ giá trị của mình.'],
    present: ['Hiện tại bạn đang được nhắc nhìn lại những gì mình đã tạo dựng, thay vì chỉ nhìn phần còn thiếu.', 'Nine of Pentacles là sự đủ đầy đến từ việc biết mình đã đi qua bao nhiêu để có mặt ở đây.'],
    future: ['Phía trước có khả năng ổn định hơn, nếu bạn tiếp tục chọn điều nâng mình lên thay vì làm mình nhỏ lại.', 'Nine of Pentacles là nhịp của sự độc lập chín muồi, không phải cô lập.'],
    reversed: ['Khi đảo chiều, sự độc lập có thể đi kèm cô đơn hoặc cảm giác chưa xứng đáng với thành quả mình đang có.'],
  },
  'Ten of Pentacles': {
    past: ['Bạn từng nhìn thấy hoặc khao khát một kiểu ổn định dài hạn.', 'Ten of Pentacles giữ ký ức về gia đình, tài sản, di sản, hoặc cảm giác có một nền lớn để dựa vào.'],
    present: ['Hiện tại câu chuyện không chỉ là tiền, mà là thứ gì có thể bền qua thời gian.', 'Lá này hỏi bạn đang xây một nền tảng thật, hay chỉ đang giữ một hình ảnh ổn định.'],
    future: ['Phía trước có tiềm năng tạo sự vững vàng lâu dài.', 'Nhưng điều bền cần được xây bằng giá trị chung, không chỉ bằng thành quả bên ngoài.'],
    reversed: ['Khi đảo chiều, nền tảng gia đình, tài chính hoặc niềm tin về sự ổn định đang cần được xem lại từ gốc.'],
  },
  'Page of Pentacles': {
    past: ['Bạn từng bắt đầu học một điều thực tế với sự cẩn thận của người mới.', 'Page of Pentacles giữ năng lượng của hạt giống nhỏ nhưng có khả năng lớn nếu được chăm đều.'],
    present: ['Hiện tại cần học, thử, ghi chép, làm từng bước.', 'Lá này không hào nhoáng; nó thích sự chuẩn bị khiêm tốn và chắc tay.'],
    future: ['Phía trước có một cơ hội học hoặc làm mới rất thực tế.', 'Nếu bạn tôn trọng bước đầu, nó có thể trở thành nền vững hơn bạn nghĩ.'],
    reversed: ['Khi đảo chiều, ý định tốt dễ bị bỏ lửng vì thiếu kỷ luật, thiếu kế hoạch, hoặc chưa thật sự tin mình có thể học được.'],
  },
  'Knight of Pentacles': {
    past: ['Bạn từng tiến rất chậm nhưng không bỏ cuộc.', 'Knight of Pentacles giữ nhịp của người đi đường dài, không cần gây chú ý nhưng vẫn có mặt đều đặn.'],
    present: ['Hiện tại cần sự bền bỉ hơn là cảm hứng nhất thời.', 'Lá này không nhanh, nhưng đáng tin; nó hỏi bạn có sẵn sàng làm việc cần làm dù không lãng mạn không.'],
    future: ['Phía trước thành quả đến qua sự nhất quán.', 'Một bước nhỏ lặp lại đủ lâu sẽ mạnh hơn nhiều lần bắt đầu rực rỡ rồi tắt.'],
    reversed: ['Khi đảo chiều, sự ổn định dễ hóa ì trệ; bạn có thể đang gọi nỗi sợ thay đổi là sự cẩn thận.'],
  },
  'Queen of Pentacles': {
    past: ['Bạn từng là người giữ cho mọi thứ vận hành, chăm sóc cả phần thực tế lẫn cảm xúc của người khác.', 'Queen of Pentacles mang sự ấm áp có tay nghề: nuôi dưỡng bằng việc làm cụ thể.'],
    present: ['Hiện tại bạn đang được hỏi ai đang chăm sóc bạn trong lúc bạn chăm nhiều thứ khác.', 'Lá này rất dịu, nhưng không chịu được việc bản thân bị tiêu hao âm thầm.'],
    future: ['Phía trước cần một kiểu ổn định biết nuôi dưỡng cả bạn, không chỉ mọi người quanh bạn.', 'Sự đủ đầy thật không bắt bạn biến thành nguồn cung vô tận.'],
    reversed: ['Khi đảo chiều, sự chăm sóc biến thành emotional labor; bạn có thể đang giữ quá nhiều thứ sống bằng sức của mình.'],
  },
  'King of Pentacles': {
    past: ['Bạn từng học cách xây hoặc quản một điều có giá trị lâu dài.', 'King of Pentacles giữ ký ức của trách nhiệm, thành quả, và quyền kiểm soát vật chất.'],
    present: ['Hiện tại cần sự vững vàng thực tế.', 'Lá này hỏi bạn đang quản trị nguồn lực bằng sự trưởng thành hay bằng nỗi sợ mất quyền kiểm soát.'],
    future: ['Phía trước có thể ổn định và có kết quả rõ, nếu bạn giữ được tầm nhìn dài hạn.', 'Sự giàu có của lá này không chỉ là sở hữu, mà là biết điều gì đáng xây.'],
    reversed: ['Khi đảo chiều, tham kiểm soát hoặc quá bám vào vật chất có thể khiến điều đáng quý trở nên nặng nề.'],
  },
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

const LanguageSelector = ({ language, onChange, label = 'NgÃ´n ngá»¯' }) => (
  <div className="language-selector" aria-label={label}>
    {LANGUAGES.map(({ code, short, label: optionLabel }) => (
      <button
        key={code}
        type="button"
        className={`language-option ${language === code ? 'active' : ''}`}
        onClick={() => onChange(code)}
        title={optionLabel}
      >
        {short}
      </button>
    ))}
  </div>
);

const TAB_ACCENTS = {
  home: '#8fb3ff',
  numerology: '#9b5cff',
  western: '#38bdf8',
  tarot: '#facc15',
  soulmate: '#ec4899',
};

const AppShell = ({ children, className = '' }) => (
  <div className={`app-shell ${className}`}>{children}</div>
);

const PageHeader = ({ title, subtitle, className = '' }) => (
  <div className={`page-header ${className}`}>
    <h2 className="primary-gradient-text">{title}</h2>
    {subtitle && <p>{subtitle}</p>}
  </div>
);

const GlassCard = ({ children, className = '' }) => (
  <div className={`glass-card ${className}`}>{children}</div>
);

const FormField = ({ label, children, className = '' }) => (
  <div className={`form-field ${className}`}>
    {label && <label className="input-label">{label}</label>}
    {children}
  </div>
);

const PrimaryButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileTap={{ scale: 0.98 }}
    className={`app-button app-button--primary app-button--full app-button--lg ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

const BottomNav = ({ currentView, onChange, t }) => (
  <nav className="bottom-nav">
    {[
      { id: 'home', label: t('bottomHome'), Icon: Home, activeColor: TAB_ACCENTS.home },
      { id: 'numerology', label: t('bottomNumerology'), Icon: Hash, activeColor: TAB_ACCENTS.numerology },
      { id: 'western', label: t('bottomWestern'), Icon: Shuffle, activeColor: TAB_ACCENTS.western },
      { id: 'tarot', label: t('bottomTarot'), Icon: Star, activeColor: TAB_ACCENTS.tarot },
      { id: 'soulmate', label: t('bottomSoulmate'), Icon: Heart, activeColor: TAB_ACCENTS.soulmate },
    ].map(({ id, label, Icon, activeColor }) => {
      const isActive = currentView === id;
      return (
        <button
          key={id}
          className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          onClick={() => onChange(id)}
          style={{ '--tab-color': activeColor }}
        >
          <div className="bottom-nav-icon">
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
          </div>
          <span>{label}</span>
        </button>
      );
    })}
  </nav>
);

const getViewportTier = () => {
  if (typeof window === 'undefined') return 'desktop';
  if (window.innerWidth <= 480) return 'compact';
  if (window.innerWidth <= 768) return 'mobile';
  return 'desktop';
};

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [language, setLanguage] = useState(() => localStorage.getItem('astra_language') || 'vi');
  const [formData, setFormData] = useState({ name: '', dob: '' });
  const [dobParts, setDobParts] = useState({ day: '', month: '', year: '' });
  const formDataRef = useRef({ name: '', dob: '' });
  const dobPartsRef = useRef({ day: '', month: '', year: '' });
  const [formError, setFormError] = useState('');
  const [numResults, setNumResults] = useState(null);
  const [numLoading, setNumLoading] = useState(false);
  const [monthlyPredictions, setMonthlyPredictions] = useState(null);

  const [westernStep, setWesternStep] = useState(1);
  const [westernConfig, setWesternConfig] = useState({ name: '', dob: '', gender: 'Nam', category: TOPICS.FUTURE, shuffleGoal: 7 });
  const westernDraftRef = useRef({ name: '', dob: '' });
  const [westernFormError, setWesternFormError] = useState('');
  const [shuffleCount, setShuffleCount] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [finalCards, setFinalCards] = useState([]);
  const [shuffledDeck, setShuffledDeck] = useState([]);
  const [selectedCardIndices, setSelectedCardIndices] = useState([]);
  const [aiCardMeanings, setAiCardMeanings] = useState([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [viewportTier, setViewportTier] = useState(getViewportTier);
  const [tarotTopic, setTarotTopic] = useState(TOPICS.FUTURE);
  const [tarotQuestion, setTarotQuestion] = useState('');
  const [tarotStep, setTarotStep] = useState(1);
  const [tarotIsShuffling, setTarotIsShuffling] = useState(false);
  const [tarotShuffledDeck, setTarotShuffledDeck] = useState([]);
  const [selectedTarotIndices, setSelectedTarotIndices] = useState([]);
  const [tarotCards, setTarotCards] = useState([]);
  const [tarotError, setTarotError] = useState('');
  const [expandedTarotCards, setExpandedTarotCards] = useState({});
  const [tarotModalCard, setTarotModalCard] = useState(null);
  const normalizedWesternDeck = useMemo(() => westernDeck.map(normalizeCard), []);
  const normalizedTarotDeck = useMemo(() => tarotDeck, []);
  const t = (key) => UI_TEXT[language]?.[key] || UI_TEXT.vi[key] || key;
  const handleViewChange = (nextView) => {
    if (currentView === nextView) return;
    setCurrentView(nextView);
  };
  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    localStorage.setItem('astra_language', nextLanguage);
    setDailyMessage('');
  };

  useEffect(() => {
    setFormError('');
    setWesternFormError('');
    setSoulmateError('');
    setDailyMessage('');
    setAiCardMeanings([]);
    setMonthlyPredictions(null);
    setChatHistory({ numerology: [], western: [] });
    setNumResults(prev => prev
      ? { ...prev, detailed: getDetailedAnalysis(prev.lp, prev.destiny, prev.soul, language) }
      : prev
    );
  }, [language]);

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
      const msg = await generateDailyCosmicMessage(language);
      setDailyMessage(msg);
      setDailyMessageLoading(false);
    }
  };

  const shuffleSound = useRef(null);
  useEffect(() => {
    let rafId = 0;
    const handleResize = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setViewportTier(prev => {
          const next = getViewportTier();
          return prev === next ? prev : next;
        });
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (shuffleSound.current) {
        shuffleSound.current.pause();
        shuffleSound.current = null;
      }
    };
  }, []);

  const handleNumerology = (e) => {
    e.preventDefault();

    const currentFormData = formDataRef.current;
    const currentDobParts = dobPartsRef.current;
    const day = parseInt(currentDobParts.day, 10);
    const month = parseInt(currentDobParts.month, 10);
    const year = parseInt(currentDobParts.year, 10);

    if (!day || !month || !year) {
      setFormError(t('dobMissingError'));
      return;
    }

    if (day < 1 || day > 31) {
      setFormError(t('dayInvalidError'));
      return;
    }

    if (month < 1 || month > 12) {
      setFormError(t('monthInvalidError'));
      return;
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      setFormError(t('yearInvalidError'));
      return;
    }

    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
      setFormError(t('dateInvalidError'));
      return;
    }

    setFormError('');
    setFormData(currentFormData);
    setDobParts(currentDobParts);

    const dob = `${year}-${currentDobParts.month.padStart(2, '0')}-${currentDobParts.day.padStart(2, '0')}`;
    const lp = calculateLifePath(dob);
    const destiny = calculateNameNumber(currentFormData.name, 'destiny');
    const soul = calculateNameNumber(currentFormData.name, 'soul');
    const personality = calculateNameNumber(currentFormData.name, 'personality');
    const py = calculatePersonalYear(dob);
    const detailed = getDetailedAnalysis(lp, destiny, soul, language);
    setNumResults({ dob, lp, destiny, soul, personality, py, detailed });
    setMonthlyPredictions(null);
    setNumLoading(false);
    setChatHistory(prev => ({ ...prev, numerology: [] }));
    handleViewChange('numerology');
  };

  // â”€â”€ Payment handlers (App-level) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    stopPollRef.current?.(); // Dá»«ng vÃ²ng láº·p polling tá»± Ä‘á»™ng trÆ°á»›c Ä‘Ã³ Ä‘á»ƒ trÃ¡nh bá»‹ Ä‘Æ¡/trÃ¹ng láº·p
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
      const aiDetailed = await generateNumerologyReport({ lp, destiny, soul, personality, py, language });
      if (aiDetailed) {
        setNumResults(prev => ({
          ...prev,
          detailed: { ...prev.detailed, lpText: aiDetailed.lpText, destinyText: aiDetailed.destinyText }
        }));
      }
      await new Promise(r => setTimeout(r, 1500));
      const aiMonths = await generateMonthlyPredictions({ lp, destiny, py, language });
      if (aiMonths) setMonthlyPredictions(aiMonths);
      setNumLoading(false);
    });
  };

  const unlockWesternCardAi = () => {
    if (!finalCards.length) return;
    requirePayment('western', async () => {
      setLoadingCards(true);
      const meanings = await generateIndividualCardMeanings(finalCards, westernConfig.category, { ...westernConfig, language });
      setAiCardMeanings(meanings);
      setLoadingCards(false);
    });
  };

  const startWesternReading = () => {
    const nextConfig = { ...westernConfig, ...westernDraftRef.current };
    const name = nextConfig.name.trim();
    const dob = nextConfig.dob.trim();
    const match = dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

    if (!name) {
      setWesternFormError(t('nameRequiredError'));
      return;
    }

    if (!match) {
      setWesternFormError(t('dobFormatError'));
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
      setWesternFormError(t('dateInvalidError'));
      return;
    }

    setWesternFormError('');
    setWesternConfig(nextConfig);
    setWesternStep(2);
  };

  const handleShuffle = () => {
    if (isShuffling) return;
    const nextShuffleCount = shuffleCount + 1;
    setIsShuffling(true);
    if (!shuffleSound.current) {
      shuffleSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
      shuffleSound.current.volume = 0.65;
      shuffleSound.current.preload = 'auto';
    }
    if (shuffleSound.current) {
      shuffleSound.current.currentTime = 0;
      shuffleSound.current.play().catch(() => { });
    }
    setTimeout(() => {
      setShuffleCount(nextShuffleCount);
      setIsShuffling(false);
      if (nextShuffleCount >= westernConfig.shuffleGoal) {
        const shuffled = [...normalizedWesternDeck].sort(() => 0.5 - Math.random());
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

  const startTarotReading = () => {
    if (!tarotQuestion.trim()) {
      setTarotError(t('tarotQuestionError'));
      return;
    }

    const shuffled = [...normalizedTarotDeck]
      .sort(() => 0.5 - Math.random());

    setTarotShuffledDeck(shuffled);
    setSelectedTarotIndices([]);
    setTarotCards([]);
    setExpandedTarotCards({});
    setTarotModalCard(null);
    setTarotError('');
    setTarotStep(2);
    setTarotIsShuffling(true);
    setTimeout(() => setTarotIsShuffling(false), 950);
  };

  const handleSelectTarotCard = (index) => {
    if (selectedTarotIndices.includes(index) || selectedTarotIndices.length >= 3) return;
    const nextSelected = [...selectedTarotIndices, index];
    const pickedCard = {
      ...tarotShuffledDeck[index],
      isReversed: Math.random() > 0.5,
    };
    setSelectedTarotIndices(nextSelected);
    setTarotCards(prev => [...prev, pickedCard].slice(0, 3));

    if (nextSelected.length === 3) {
      setTimeout(() => setTarotStep(3), 4300);
    }
  };

  const revealTarotResult = () => {
    if (tarotCards.length === 3) setTarotStep(3);
  };

  const resetTarotReading = () => {
    setTarotStep(1);
    setTarotIsShuffling(false);
    setTarotShuffledDeck([]);
    setSelectedTarotIndices([]);
    setTarotCards([]);
    setExpandedTarotCards({});
    setTarotModalCard(null);
    setTarotError('');
  };

  const getTarotKeyword = (card) => {
    const meaning = card.isReversed ? card.reversed : card.upright;
    return meaning?.split(/[,.]/)[0]?.trim() || meaning || card.theme;
  };

  // eslint-disable-next-line no-unused-vars
  const getTarotInsightBase = (card, position) => {
    const meaning = card.isReversed ? card.reversed : card.upright;
    const topicLabel = t({ [TOPICS.LOVE]: 'topicLove', [TOPICS.CAREER]: 'topicCareer', [TOPICS.FUTURE]: 'topicFuture', [TOPICS.MONEY]: 'topicMoney' }[tarotTopic] || 'topicFuture');
    return `${position} trong chủ đề ${topicLabel}: ${meaning} Hãy nhìn lá này như tín hiệu về ${card.theme}.`;
  };

  const getTarotInsight = (card, position) => {
    const question = tarotQuestion.trim();
    const questionContext = getTarotQuestionProfile(question, tarotTopic);
    const personality = getTarotPersonality(card);
    const positions = t('tarotPositions');
    const positionKey = getTarotPositionKey(position, positions);
    const fullCard = TAROT_MINOR_CARD_ARCHETYPES[card.name];
    const fullCardLines = fullCard
      ? [...(fullCard[positionKey] || fullCard.present || []), ...(card.isReversed ? [fullCard.reversed] : [])]
      : null;
    const domainLines = questionContext.domain === 'career'
      ? getCareerCardInterpretation(card, positionKey)
      : null;
    const relationshipLines = questionContext.domain === 'love'
      ? getRelationshipCardInterpretation(card, positionKey, questionContext)
      : null;
    const override = fullCardLines || TAROT_READING_OVERRIDES[card.name]?.[positionKey]
      || TAROT_READING_OVERRIDES[card.name]?.present;

    if (relationshipLines) {
      const questionLine = getTarotQuestionAngle(questionContext, positionKey, question);
      return [...relationshipLines, questionLine].filter(Boolean).join('\n\n');
    }

    if (domainLines) {
      const questionLine = getTarotQuestionAngle(questionContext, positionKey, question);
      return [...domainLines, questionLine].filter(Boolean).join('\n\n');
    }

    if (override) {
      const questionLine = getTarotQuestionAngle(questionContext, positionKey, question);
      return [...override, questionLine].filter(Boolean).join('\n\n');
    }

    const pastPosition = Array.isArray(positions) ? positions[0] : 'Quá khứ';
    const presentPosition = Array.isArray(positions) ? positions[1] : 'Hiện tại';
    const isPast = position === pastPosition;
    const isPresent = position === presentPosition;
    const tensionByPosition = isPast
      ? `Điều từng xảy ra đã tạo thói quen phản ứng trong bạn: ${questionContext.pressure}.`
      : isPresent
        ? `Hiện tại, lá bài đang chỉ vào ${questionContext.dynamic}.`
        : `Nếu nhịp này tiếp tục, điều rõ nhất không phải kết quả, mà là cách bạn sẽ phản ứng với ${questionContext.tension}.`;

    const adaptiveContextualBridge = getTarotQuestionAngle(questionContext, positionKey, question);
    const positionBridge = questionContext.casual || questionContext.intensity === 'low'
      ? adaptiveContextualBridge
      : `${tensionByPosition} ${adaptiveContextualBridge}`;

    return `${personality.pulse}\n\n${positionBridge}\n\n${personality.shadow}\n\n${personality.guidance}`;
  };

  const getTarotGuidanceTitle = (card, context) => {
    if (context.domain === 'career') {
      if (card.name === 'The Devil' || card.name === 'Ten of Swords' || card.suit === 'Swords') return '✦ Điều công việc này dễ lấy đi khỏi bạn';
      if (card.name === 'The Hermit' || card.suit === 'Pentacles') return '✦ Dạng công việc có thể hợp lâu dài';
      if (card.name === 'Two of Cups' || card.suit === 'Cups') return '✦ Kiểu môi trường bạn nên chú ý';
      if (card.name === 'Strength' || card.suit === 'Wands') return '✦ Nhịp làm việc phù hợp hơn với bạn';
      return '✦ Hướng nghề cần nhìn rõ';
    }
    if (context.domain === 'love') {
      if (card.name === 'Seven of Swords' || card.suit === 'Swords') return '✦ Điều chưa được nói thẳng';
      if (card.name === 'King of Cups' || card.suit === 'Cups') return '✦ Cảm xúc đang được giữ lại';
      if (card.suit === 'Wands') return '✦ Sức hút cần quan sát';
      if (card.suit === 'Pentacles') return '✦ Dấu hiệu nằm ở sự có mặt';
      return '✦ Điều lá bài muốn bạn nhìn rõ';
    }
    if (card.arcana === 'Major Arcana') return '✦ Điều lá bài đang nhắc bạn';
    if (context.mood === 'jealousy') return '✦ Điều chưa nên bỏ qua';
    if (context.mood === 'money') return '✦ Năng lượng cần chú ý';
    if (card.suit === 'Swords') return '✦ Điều lá bài muốn bạn nhìn rõ';
    if (card.suit === 'Cups') return '✦ Góc khuất cần được nhìn thấy';
    if (card.suit === 'Pentacles') return '✦ Năng lượng cần chú ý';
    return '✦ Điều chưa nên bỏ qua';
  };

  const getTarotGuidance = (card, position) => {
    const question = tarotQuestion.trim();
    const context = getTarotQuestionProfile(question, tarotTopic);
    const positions = t('tarotPositions');
    const positionKey = getTarotPositionKey(position, positions);
    const reversed = card.isReversed;

    if (context.domain === 'love') {
      const loveSpecific = {
        'King of Cups': reversed
          ? 'Có thể vẫn còn cảm xúc, nhưng người này đang giữ nó bằng im lặng hoặc kiểm soát.'
          : 'Nếu họ nhớ bạn, họ sẽ không dễ để lộ; hãy nhìn sự ổn định trong cách họ quay lại gần bạn.',
        'Three of Cups': reversed
          ? 'Kỷ niệm vui có thể còn, nhưng hiện tại bị nhiễu bởi khoảng cách, người khác hoặc nhịp sống riêng.'
          : 'Nỗi nhớ ở đây đến qua những khoảnh khắc nhẹ: một nơi từng đi, một câu chuyện cũ, một cảm giác từng vui.',
        'Seven of Swords': reversed
          ? 'Nếu họ còn nhớ, sự thật đó có thể đang lộ dần qua những hành động nhỏ khó giấu.'
          : 'Đừng chỉ hỏi họ có nhớ không; hãy xem họ có dám rõ ràng với nỗi nhớ đó không.',
        'Two of Cups': reversed
          ? 'Còn cảm xúc không có nghĩa là hai người đang cùng một nhịp.'
          : 'Nếu sự nhớ còn thật, nó cần được đáp lại bằng hành động từ cả hai phía.',
      }[card.name];
      if (loveSpecific) return loveSpecific;

      const loveSuitGuidance = {
        Cups: reversed
          ? 'Cảm xúc có thể còn, nhưng đang bị giữ lại, lệch nhịp hoặc không biết nói ra thế nào.'
          : 'Lá này nghiêng về cảm xúc thật hơn là sự thờ ơ; chỉ là cần xem nó có được bộc lộ không.',
        Swords: reversed
          ? 'Người này có thể nghĩ nhiều, nhưng suy nghĩ chưa chắc biến thành lời nói rõ ràng.'
          : 'Nếu họ nhớ, dấu hiệu sẽ nằm ở cách họ quan sát, hỏi han hoặc tìm lý do để biết về bạn.',
        Wands: reversed
          ? 'Sức hút có thể còn nhưng thất thường; đừng nhầm một phút bốc lên với sự quay lại thật.'
          : 'Nếu họ nhớ, năng lượng này thường hiện qua sự chủ động nhanh hoặc một phản ứng khó giấu.',
        Pentacles: reversed
          ? 'Có nhớ cũng chưa chắc họ biết cách quay lại một cách ổn định.'
          : 'Dấu hiệu đáng tin không nằm ở lời nói nhiều, mà ở việc họ có xuất hiện đều hơn không.',
      };
      return loveSuitGuidance[card.suit] || 'Lá bài đang trả lời vào cảm xúc còn lại, nhưng cần nhìn qua hành động cụ thể.';
    }

    if (context.domain === 'career') {
      const careerSpecific = {
        'The Devil': reversed
          ? 'Đừng chọn một nghề chỉ vì sợ thiếu tiền hoặc sợ thua người khác; đó là cách dễ bị kẹt nhất.'
          : 'Hãy để ý hướng nào cho bạn tiền hoặc danh xưng, nhưng khiến bạn thấy mình phải đánh đổi quá nhiều tự do.',
        'The Star': reversed
          ? 'Bạn không cần biết chính xác nghề gì ngay lúc này; hãy để ý kiểu công việc nào còn cho bạn năng lượng sau khi làm.'
          : 'Hướng phù hợp là hướng khiến bạn có cảm hứng quay lại mỗi ngày, không chỉ thấy nó đẹp trên giấy.',
        'The Hermit': reversed
          ? 'Làm một mình có thể giúp bạn rõ hơn, nhưng đừng biến việc tìm nghề thành quá trình tự cô lập.'
          : 'Bạn hợp với việc đi sâu vào một kỹ năng hoặc chuyên môn; càng ồn ào, bạn càng khó nghe được năng lực thật của mình.',
        'The Lovers': reversed
          ? 'Nếu phải chọn nghề, đừng chọn hướng chỉ làm người khác yên tâm còn bạn thì thấy lệch bên trong.'
          : 'Nghề hợp với bạn cần có sự đồng thuận giữa năng lực, hứng thú và giá trị sống.',
        'The Chariot': reversed
          ? 'Bạn cần chọn hướng trước khi tăng tốc; đi nhanh trong một nghề không hợp chỉ làm bạn mệt sớm hơn.'
          : 'Bạn hợp với môi trường có mục tiêu rõ, cạnh tranh vừa đủ và cho bạn cảm giác đang tiến lên.',
        Strength: reversed
          ? 'Đừng lấy sức chịu đựng làm thước đo nghề hợp. Một công việc đúng không nên bắt bạn gồng từ đầu đến cuối.'
          : 'Bạn có thể đi xa với công việc cần kiên nhẫn, nhưng nó vẫn phải là thứ bạn muốn nuôi lâu dài.',
        'Ten of Swords': reversed
          ? 'Tránh hướng khiến đầu óc bạn luôn phải phòng thủ, tranh cãi hoặc nghi ngờ năng lực của mình.'
          : 'Nếu một nghề khiến bạn kiệt trước khi kịp giỏi, đó là dấu hiệu nên đổi cách chọn.',
        'Two of Cups': reversed
          ? 'Bạn không hợp môi trường bắt mình luôn chiều cảm xúc người khác nhưng lại thiếu ranh giới rõ.'
          : 'Bạn có thể cần công việc có hợp tác thật, nơi trao đổi hai chiều thay vì chỉ một mình bạn giữ nhịp.',
      }[card.name];
      if (careerSpecific) return careerSpecific;

      const careerSuitGuidance = {
        Wands: reversed
          ? 'Nếu một hướng chỉ làm bạn hào hứng lúc đầu rồi nhanh chán, đó chưa chắc là nghề nên theo lâu dài.'
          : 'Hãy nhìn công việc nào cho bạn quyền thử, tạo, dẫn dắt hoặc bắt đầu thứ mới.',
        Cups: reversed
          ? 'Nếu công việc khiến bạn phải cho cảm xúc quá nhiều mà không có ranh giới, nó sẽ rút cạn bạn nhanh.'
          : 'Bạn có thể hợp với việc liên quan con người, thẩm mỹ, chăm sóc hoặc kết nối, miễn là cảm xúc không bị dùng quá sức.',
        Swords: reversed
          ? 'Tránh hướng khiến đầu óc bạn luôn phải phòng thủ, tranh cãi hoặc nghi ngờ năng lực của mình.'
          : 'Bạn hợp với việc cần phân tích, viết, nói, lập luận, dữ liệu hoặc xử lý vấn đề rõ ràng.',
        Pentacles: reversed
          ? 'Trước khi chọn, hãy kiểm tra thu nhập, lịch làm, độ ổn định và khả năng học nghề thật sự.'
          : 'Bạn hợp với hướng có kỹ năng tích lũy, kết quả đo được và nền tảng ổn định theo thời gian.',
      };
      return careerSuitGuidance[card.suit] || 'Hãy đọc lá này qua kiểu công việc, môi trường và nhịp làm việc bạn có thể theo lâu dài.';
    }

    if (context.casual || context.intensity === 'low') {
      if (card.arcana === 'Major Arcana') {
        const lightMajor = {
          past: 'Lá này không làm câu chuyện nặng hơn; nó chỉ nhắc bạn để ý mẫu nhỏ đã lặp lại gần đây.',
          present: 'Có một tín hiệu rõ hơn bạn nghĩ. Hãy nhìn nó bình tĩnh, không cần vội biến thành câu trả lời cuối.',
          future: 'Điều sắp tới có thể nhẹ thôi, nhưng vẫn đủ để đổi cách bạn nhìn tình huống này.',
        };
        return lightMajor[positionKey] || lightMajor.present;
      }
      const lightSuitGuidance = {
        Swords: reversed
          ? 'Đừng đoán quá nhanh từ một chi tiết nhỏ; hãy chờ thêm một dấu hiệu rõ hơn.'
          : 'Một tin nhắn, một câu nói, hoặc một phản ứng nhỏ có thể cho bạn manh mối đủ dùng.',
        Cups: reversed
          ? 'Cảm xúc ở đây chưa rõ hẳn; cứ để nó nhẹ trước khi gọi tên quá sớm.'
          : 'Nếu thấy vui hoặc rung động, hãy ghi nhận nó như một tín hiệu mềm, chưa cần ép thành cam kết.',
        Pentacles: reversed
          ? 'Chưa cần quyết lớn. Hãy xem điều này có thật sự phù hợp với nhịp sống của bạn không.'
          : 'Tín hiệu đáng tin nằm ở điều người ta làm đều đặn, dù rất nhỏ.',
        Wands: reversed
          ? 'Đừng để một phút hào hứng khiến bạn đi nhanh hơn mức cần thiết.'
          : 'Có chút lửa ở đây; cứ thử một bước nhỏ thay vì nghĩ quá xa.',
      };
      return lightSuitGuidance[card.suit] || 'Lá bài chỉ đang gợi một hướng nhẹ để bạn quan sát thêm.';
    }

    const specificGuidance = {
      Strength: reversed
        ? 'Bạn không cần phải tỏ ra bình tĩnh để cảm xúc của mình trở nên hợp lý.'
        : 'Điều bạn đang giữ bằng sự kiềm chế cần được nói ra trước khi nó biến thành mệt mỏi.',
      'King of Swords': reversed
        ? 'Nếu lời giải thích quá lạnh và quá gọn, hãy xem nó đang làm rõ sự thật hay chỉ tránh cảm xúc.'
        : 'Đừng chỉ nghe lời giải thích; hãy nhìn sự nhất quán trong hành động.',
      'The Hierophant': reversed
        ? 'Nếu một quy tắc khiến bạn phải tự bóp nhỏ cảm giác của mình, nó cần được xem lại.'
        : 'Có những điều được giữ lại không phải vì đúng, mà vì người ta đã quá quen với nó.',
      'Ace of Pentacles': reversed
        ? 'Một cơ hội có thể trượt đi nếu bạn cứ chờ mình thấy hoàn toàn sẵn sàng mới bắt đầu.'
        : 'Điều này chỉ có giá trị nếu nó bước được vào đời sống thật: thời gian, tiền bạc, cam kết và hành động.',
      'The Tower': reversed
        ? 'Bạn có thể đang thấy vấn đề từ lâu, nhưng vẫn cố giữ vẻ bình thường để khỏi phải đối diện.'
        : 'Lá này chỉ thẳng vào thứ đã lung lay; nếu cố giữ nó, bạn sẽ phải trả bằng sự căng thẳng nhiều hơn.',
      'The Star': reversed
        ? 'Đừng ép mình tin ngay. Trước hết hãy nhìn xem điều gì đã làm bạn mất niềm tin đến mức này.'
        : 'Điều này không bảo bạn lạc quan; nó chỉ cho thấy vẫn còn một hướng nhẹ hơn cách bạn đang chịu đựng.',
      'Page of Swords': reversed
        ? 'Không phải mọi nghi ngờ đều là trực giác; có thứ chỉ là nỗi sợ đang mặc áo lý trí.'
        : 'Bạn đang nhìn thấy chi tiết quan trọng, nhưng đừng biến việc quan sát thành thói quen tự làm mình bất an.',
      'Queen of Pentacles': reversed
        ? 'Nếu bạn đang lo cho quá nhiều thứ, lá này hỏi phần nào trong đó thật sự đang lo lại cho bạn.'
        : 'Sự ổn định ở đây không nằm ở lời hứa, mà ở cách một người có mặt đều đặn khi bạn cần.',
      'Five of Pentacles': reversed
        ? 'Có hỗ trợ hoặc lối ra, nhưng bạn có thể vẫn đang hành động như thể mình phải chịu một mình.'
        : 'Lá này chỉ ra cảm giác bị bỏ ngoài cuộc: không chỉ thiếu thứ gì đó, mà thiếu cảm giác được nâng đỡ.',
      'Ten of Swords': reversed
        ? 'Bạn đang đi ra khỏi một điều đau, nhưng vẫn có thể phản ứng như thể nó còn đang xảy ra.'
        : 'Nếu một chuyện đã chạm đáy, việc cố phân tích thêm có thể chỉ kéo dài cảm giác bị đâm lại.',
      'The Lovers': reversed
        ? 'Điều cần nhìn là sự lệch nhau giữa lời nói, lựa chọn và cảm xúc thật.'
        : 'Sự hấp dẫn chưa đủ; lá này hỏi hai bên có đang chọn cùng một điều hay không.',
    }[card.name];

    if (specificGuidance) return specificGuidance;

    if (context.mood === 'jealousy' && card.suit === 'Swords') {
      return reversed
        ? 'Sự thật bị thiếu không nên được lấp bằng tưởng tượng. Hãy nhìn nơi lời nói và hành động bắt đầu lệch nhau.'
        : 'Nếu phải nghi ngờ liên tục, vấn đề không chỉ nằm ở câu trả lời mà còn ở cách nó được giấu đi.';
    }
    if (context.mood === 'money' && card.suit === 'Pentacles') {
      return reversed
        ? 'Điều chưa vững cần được gọi đúng tên trước khi bạn đặt thêm nguồn lực vào đó.'
        : 'Sự ổn định không đến từ một cú đổi vận, mà từ thứ bạn có thể giữ được khi áp lực tăng lên.';
    }
    if (context.mood === 'breakup' && card.suit === 'Cups') {
      return reversed
        ? 'Có những cảm xúc chưa rời đi, nhưng cũng chưa chắc còn đủ sức nuôi một kết nối.'
        : 'Điều còn thương không phải lúc nào cũng là điều còn nên tiếp tục.';
    }
    if (context.mood === 'career' && card.suit === 'Wands') {
      return reversed
        ? 'Nếu ngọn lửa chỉ còn làm bạn nóng ruột, nó cần hướng đi hơn là thêm thúc ép.'
        : 'Động lực thật không chỉ đẩy bạn tiến lên; nó cho bạn biết vì sao mình đang tiến.';
    }

    if (card.arcana === 'Major Arcana') {
      const majorByPosition = {
        past: `Điều cũ vẫn ảnh hưởng đến cách bạn xử lý ${context.tension} trong câu hỏi này.`,
        present: `Lá bài đang chỉ ra cách bạn phản ứng với ${context.dynamic} ngay lúc này.`,
        future: `Nếu không nhìn rõ ${context.pressure}, bạn có thể bước tới nhưng vẫn mang cùng một phản xạ cũ.`,
      };
      return majorByPosition[positionKey];
    }

    const suitGuidance = {
      Swords: reversed
        ? `Bạn đang cố nghĩ cho ra câu trả lời, nhưng phần cần kiểm chứng là sự thật trong hành động.`
        : `Điều cần nhìn rõ là lời nói, bằng chứng và sự nhất quán; đừng để cảm xúc tự điền phần còn thiếu.`,
      Cups: reversed
        ? `Cảm xúc đang bị giữ lại hoặc nói vòng; điều đó làm ${context.dynamic} khó được giải quyết thẳng.`
        : `Cảm xúc của bạn có thật, nhưng lá này hỏi nó đang được đáp lại hay chỉ được bạn tự giữ một mình.`,
      Pentacles: reversed
        ? `Điều chưa vững sẽ lộ ra qua tiền bạc, thời gian, trách nhiệm hoặc sự có mặt không đều.`
        : `Hãy nhìn thứ có thể duy trì được trong thực tế, không chỉ điều nghe có vẻ ổn trong cảm xúc.`,
      Wands: reversed
        ? `Bạn có thể đang phản ứng nhanh vì khó chịu hoặc sợ mất cơ hội, không hẳn vì đã rõ mình muốn gì.`
        : `Năng lượng này cần một hướng cụ thể; nếu không, nó dễ thành nóng ruột hoặc chứng minh cái tôi.`,
    };
    return suitGuidance[card.suit] || `Lá bài đang chỉ ra ${context.dynamic}; đó là phần cần nhìn rõ trước khi kết luận.`;
  };

  const getTarotReadingParts = (card, position) => {
    const context = getTarotQuestionProfile(tarotQuestion.trim(), tarotTopic);
    return {
      interpretation: getTarotInsight(card, position),
      guidanceTitle: getTarotGuidanceTitle(card, context),
      guidance: getTarotGuidance(card, position),
    };
  };

  const askAI = (type) => {
    requirePayment(type, async () => {
      setAiLoading(prev => ({ ...prev, [type]: true }));
      setChatHistory(prev => ({ ...prev, [type]: [] }));
      const data = type === 'numerology' ? { ...numResults, ...numResults.detailed, language } : { cards: finalCards, category: westernConfig.category, person: westernConfig, language };
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
      const data = type === 'numerology' ? { ...numResults, ...numResults.detailed, language } : { cards: finalCards, category: westernConfig.category, person: westernConfig, language };
      const answer = await askFollowUpQuestion(type, data, newHistory, question);
      setChatHistory(prev => ({ ...prev, [type]: [...newHistory, { role: 'ai', text: answer }] }));
      setAiLoading(prev => ({ ...prev, [type]: false }));
    });
  };

  const isCompactViewport = viewportTier === 'compact';
  const isTouchLayout = viewportTier !== 'desktop';
  const spreadDistance = isCompactViewport ? 50 : isTouchLayout ? 65 : 180;
  const fanWidth = isCompactViewport ? 210 : isTouchLayout ? 240 : 280;
  const fanHeight = isCompactViewport ? 280 : isTouchLayout ? 310 : 360;
  const shuffleCardCount = isTouchLayout ? 9 : 13;
  const selectionRowCount = isCompactViewport ? 3 : 2;
  const tarotCardsPerRow = isTouchLayout ? 26 : 39;
  const tarotRowCount = isTouchLayout ? 3 : 2;

  return (
    <>
      <div className={`app-wrapper view-${currentView}`} style={{ '--active-color': TAB_ACCENTS[currentView] || TAB_ACCENTS.home }}>
        <ShootingStars />
        <div className="celestial-bg">
          <div className="nebula-glow" style={{ top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 60%)' }}></div>
          <div className="nebula-glow" style={{ bottom: '-20%', right: '-10%', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 60%)' }}></div>
          <div className="stars-layer"></div>
        </div>

        <nav className="nav-premium">
          <button className="nav-brand" onClick={() => handleViewChange('home')} aria-label="ASTRA home">
            <img src="/logonum-256.png" alt="" />
            <span>ASTRA</span>
          </button>
          <div className="nav-links">
            <button className={`nav-link ${currentView === 'home' ? 'active' : ''}`} onClick={() => handleViewChange('home')}>{t('navExplore')}</button>
            <button className={`nav-link ${currentView === 'numerology' ? 'active' : ''}`} onClick={() => handleViewChange('numerology')}>{t('navNumerology')}</button>
            <button className={`nav-link ${currentView === 'western' ? 'active' : ''}`} onClick={() => handleViewChange('western')}>{t('navWestern')}</button>
            <button className={`nav-link ${currentView === 'tarot' ? 'active' : ''}`} onClick={() => handleViewChange('tarot')}>{t('navTarot')}</button>
            <button className={`nav-link ${currentView === 'soulmate' ? 'active' : ''}`} onClick={() => handleViewChange('soulmate')}>{t('navSoulmate')}</button>
          </div>
          <LanguageSelector language={language} onChange={handleLanguageChange} label={t('langLabel')} />
        </nav>

        <button className="mobile-brand-bar" onClick={() => handleViewChange('home')} aria-label="ASTRA home">
          <img src="/logonum-256.png" alt="" />
          <span>ASTRA</span>
        </button>
        <div className={`mobile-language-switcher ${currentView !== 'home' ? 'hide-off-home' : ''}`}>
          <LanguageSelector language={language} onChange={handleLanguageChange} label={t('langLabel')} />
        </div>

        <BottomNav currentView={currentView} onChange={handleViewChange} t={t} />

        <main className="main-container">
          <AnimatePresence mode="wait" initial={false}>
            {currentView === 'home' && (
              <motion.section key="home" className="page-view" {...pageMotion}>
                <div style={{ minHeight: 'calc(100dvh - 70px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: '1rem' }}>
                  {/* Hero */}
                  <div style={{ textAlign: 'center', padding: '0 1rem 1.25rem' }}>
                    <motion.div initial={false} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.16, ease: 'easeOut' }}>
                      <h1 className="hero-title primary-gradient-text" style={{ marginBottom: '0.5rem' }}>ASTRA</h1>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>
                        {t('heroTagline')}
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
                        <Sparkles size={16} aria-hidden="true" /> {t('dailyButton')}
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Feature Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '0 1rem' }}>

                    {/* Card 1 â€” Tháº§n Sá»‘ Há»c */}
                    <motion.div
                      initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.14 }}
                      onClick={() => handleViewChange('numerology')}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(255,255,255,0.08) 100%)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 14px 38px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
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
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>{t('cardNumerologyTitle')}</div>
                        <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.76rem', lineHeight: 1.4, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>{t('cardNumerologyDesc')}</div>
                      </div>
                      <ChevronRight size={18} color="rgba(139,92,246,0.8)" style={{ flexShrink: 0 }} />
                    </motion.div>

                    {/* Card 2 â€” BÃ³i BÃ i TÃ¢y */}
                    <motion.div
                      initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.14 }}
                      onClick={() => handleViewChange('western')}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(96,165,250,0.18) 0%, rgba(255,255,255,0.08) 100%)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 14px 38px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
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
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>{t('cardWesternTitle')}</div>
                        <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.76rem', lineHeight: 1.4, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>{t('cardWesternDesc')}</div>
                      </div>
                      <ChevronRight size={18} color="rgba(96,165,250,0.8)" style={{ flexShrink: 0 }} />
                    </motion.div>

                    {/* Card 3 â€” TÆ°Æ¡ng Há»£p */}
                    <motion.div
                      initial={false} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.14 }}
                      onClick={() => handleViewChange('soulmate')}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        background: 'linear-gradient(135deg, rgba(244,63,94,0.22) 0%, rgba(255,255,255,0.09) 100%)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        backdropFilter: 'blur(6px)',
                        boxShadow: '0 14px 38px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.08)',
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
                        <div style={{ fontWeight: 600, fontSize: '0.8rem', color: '#fff', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '1px', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>{t('cardSoulmateTitle')}</div>
                        <div style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.76rem', lineHeight: 1.4, fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>{t('cardSoulmateDesc')}</div>
                      </div>
                      <ChevronRight size={18} color="rgba(244,63,94,0.8)" style={{ flexShrink: 0 }} />
                    </motion.div>

                  </div>

                  {/* Footer tagline */}
                  <motion.div
                    initial={false} animate={{ opacity: 1 }} transition={{ duration: 0.12 }}
                    style={{ textAlign: 'center', padding: '1rem 1rem 0', color: 'rgba(255,255,255,0.12)', fontSize: '10px', letterSpacing: '0.05em' }}
                  >
                    <span style={{ fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>{t('footerTagline')}</span>
                  </motion.div>

                </div>
              </motion.section>
            )}

            {currentView === 'numerology' && (
              <motion.section key="num" className="page-view" {...pageMotion}>
                {!numResults ? (
                  <div className="balanced-form-stage numerology-setup-stage">
                    <div className="balanced-form-shell numerology-setup-shell">
                      {/* Hero Header */}
                      <div className="balanced-form-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <h2 className="primary-gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.35rem', lineHeight: 1.2, fontWeight: 700, whiteSpace: 'nowrap' }}>{t('numerologyTitle')}</h2>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', lineHeight: 1.4 }}>{t('numerologySubtitle')}</p>
                      </div>

                      <form onSubmit={handleNumerology}>
                        {/* Name field */}
                        <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '0.75rem' }}>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            {t('fullNameLabel')}
                          </label>
                          <input
                            type="text"
                            className="modern-input"
                            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', padding: '0.85rem 1rem' }}
                            placeholder={t('fullNamePlaceholder')}
                            defaultValue={formData.name}
                            onChange={(e) => { formDataRef.current = { ...formDataRef.current, name: e.target.value }; }}
                          />
                        </div>

                        {/* DOB field */}
                        <div style={{ background: 'rgba(139, 92, 246, 0.06)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.25rem' }}>
                          <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                            {t('birthDateLabel')}
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: '0.5rem' }}>
                            {[
                              { placeholder: t('dayPlaceholder'), key: 'day', min: 1, max: 31 },
                              { placeholder: t('monthPlaceholder'), key: 'month', min: 1, max: 12 },
                              { placeholder: t('yearPlaceholder'), key: 'year', min: 1900, max: 2026 },
                            ].map(({ placeholder, key, min, max }) => (
                              <input
                                key={key}
                                type="number"
                                placeholder={placeholder}
                                defaultValue={dobParts[key]}
                                onChange={(e) => { dobPartsRef.current = { ...dobPartsRef.current, [key]: e.target.value }; }}
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
                          <Sparkles size={18} /> {t('analyzeNow')}
                        </motion.button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="results-container" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}>
                    <div className="results-header flex-between">
                      <h2 className="primary-gradient-text">{t('resultsTitle')}</h2>
                      <button onClick={() => setNumResults(null)} className="back-btn">{t('backEdit')}</button>
                    </div>

                    <div className="grid-4" style={{ marginBottom: '2rem' }}>
                      <StatBox label={t('lifePath')} value={numResults.lp} color="violet" />
                      <StatBox label={t('destiny')} value={numResults.destiny} color="blue" />
                      <StatBox label={t('soul')} value={numResults.soul} color="indigo" />
                      <StatBox label={t('personality')} value={numResults.personality} color="purple" />
                    </div>

                    {/* Personal Year UI */}
                    <div className="glass-container highlight-box" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>{t('personalYear')} {new Date().getFullYear()}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', margin: 0 }}>{t('personalYearDesc')}</p>
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
                      <div
                        style={{ position: 'absolute', top: '50%', left: '35%', width: '100%', height: '100%', pointerEvents: 'none', zIndex: -1, opacity: 0.5, backgroundImage: 'radial-gradient(1px 1px at 20px 30px, rgba(255, 255, 255, 0.8), rgba(0,0,0,0)), radial-gradient(1px 1px at 80px 100px, rgba(255, 255, 255, 0.6), rgba(0,0,0,0))', backgroundSize: '150px 150px' }}
                      />
                      {/* Birth Chart */}
                      <div className="glass-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: 0 }}>
                        <h3 style={{ fontSize: '1.125rem', color: '#fff', marginBottom: '0.5rem' }}>{t('birthChartTitle')}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>{t('birthChartDesc')}</p>
                        <BirthChart dob={numResults.dob} language={language} uiText={UI_TEXT[language] || UI_TEXT.vi} />
                      </div>

                      {/* Monthly Predictions */}
                      <div className="glass-container" style={{ margin: 0 }}>
                        <h3 style={{ fontSize: '1.125rem', color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Star size={18} color="var(--primary-light)" /> {t('monthlyPeaksTitle')}
                        </h3>
                        {numLoading ? (
                          <div className="ai-loading" style={{ margin: '2rem 0' }}>
                            <Loader2 className="loader-spin" size={24} />
                            <span className="ai-loading-text">{t('monthlyPeaksLoading')}</span>
                          </div>
                        ) : !paidFeatures.numerology ? (
                          <LockedAiPanel
                            title={t('unlockMonthlyTitle')}
                            description={t('unlockMonthlyDesc')}
                            actionLabel={t('unlockAI')}
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
                                      <div
                                        style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#ec4899', border: '2px solid #fff', boxShadow: '0 0 12px #ec4899' }}
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
                          <LockedAiPanel title={t('createMonthlyTitle')} description={t('createMonthlyDesc')} actionLabel={t('createWithAI')} onUnlock={unlockNumerologyAi} unlocked />
                        )}
                      </div>
                    </div>

                    <div className="report-section">
                      <ReportCard title={t('lifePathReport')} text={numResults.detailed.lpText} loading={numLoading} loadingLabel={t('aiDeepLoading')} />
                      <ReportCard title={t('destinyReport')} text={numResults.detailed.destinyText} loading={numLoading} loadingLabel={t('aiDeepLoading')} />
                    </div>

                    <AIWisdomSection loading={aiLoading.numerology} chatHistory={chatHistory.numerology} onAsk={() => askAI('numerology')} onSendQuestion={(q) => handleSendQuestion('numerology', q)} isAIPaid={paidFeatures.numerology} uiText={UI_TEXT[language] || UI_TEXT.vi} />
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
                language={language}
                uiText={UI_TEXT[language] || UI_TEXT.vi}
              />
            )}

            {currentView === 'western' && (
              <motion.section key="western" className="page-view" {...pageMotion}>
                {westernStep === 1 && (
                  <div className="western-setup-screen balanced-form-stage" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', padding: '1rem 0' }}>
                    <div className="western-setup-shell balanced-form-shell">
                      <div className="western-setup-header balanced-form-header">
                        <h2 className="primary-gradient-text">{t('westernTitle')}</h2>
                        <p>{t('westernSubtitle')}</p>
                      </div>
                      <div className="western-setup-grid">
                        <div className="setup-panel">
                          <div className="input-group">
                            <label className="input-label">{t('nameLabel')}</label>
                            <input
                              className="modern-input"
                              placeholder={t('nameExample')}
                              defaultValue={westernConfig.name}
                              onChange={(e) => { westernDraftRef.current = { ...westernDraftRef.current, name: e.target.value }; }}
                            />
                          </div>
                          <div className="input-group">
                            <label className="input-label">{t('dobLabel')}</label>
                            <input
                              className="modern-input"
                              placeholder="dd/mm/yyyy"
                              defaultValue={westernConfig.dob}
                              onChange={(e) => { westernDraftRef.current = { ...westernDraftRef.current, dob: e.target.value }; }}
                            />
                          </div>
                          <SelectionGroup label={t('genderLabel')} options={[{ value: 'Nam', label: t('male') }, { value: 'N\u1eef', label: t('female') }]} value={westernConfig.gender} onChange={(v) => setWesternConfig({ ...westernConfig, gender: v, shuffleGoal: v === 'Nam' ? 7 : 9 })} />
                          <CustomSelect
                            label={t('topicLabel')}
                            options={[{ value: TOPICS.LOVE, label: t('topicLove') }, { value: TOPICS.CAREER, label: t('topicCareer') }, { value: TOPICS.FUTURE, label: t('topicFuture') }, { value: TOPICS.MONEY, label: t('topicMoney') }]}
                            value={westernConfig.category}
                            onChange={(v) => setWesternConfig({ ...westernConfig, category: v })}
                          />
                        </div>
                        <div className="setup-instructions">
                          <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>
                            {t('focusText')} <strong>{t({ [TOPICS.LOVE]: 'topicLove', [TOPICS.CAREER]: 'topicCareer', [TOPICS.FUTURE]: 'topicFuture', [TOPICS.MONEY]: 'topicMoney' }[westernConfig.category] || 'topicFuture')}</strong>.
                          </p>
                          <motion.button
                            onClick={startWesternReading}
                            whileTap={{ scale: 0.97 }}
                            whileHover={{ scale: 1.02 }}
                            className="app-button app-button--secondary app-button--full app-button--lg"
                          >
                            <Layers size={18} /> {t('startReading')}
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
                        <div className="shuffle-eyebrow">{t('shuffleRitual')}</div>
                        <h2 className="primary-gradient-text">{t('shufflingTitle')}</h2>
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
                        <div className="shuffle-table-glow" />
                        <div className="shuffle-orbit shuffle-orbit-one" />
                        <div className="shuffle-orbit shuffle-orbit-two" />
                        {Array.from({ length: shuffleCardCount }).map((_, i) => {
                          const side = i % 2 === 0 ? -1 : 1;
                          const depth = i - Math.floor(shuffleCardCount / 2);
                          return (
                            <motion.div
                              key={i}
                              initial={false}
                              animate={isShuffling ? {
                                x: [0, side * (118 + Math.abs(depth) * 4), side * (34 - Math.abs(depth) * 2), 0],
                                y: [-i * 1.15, -38 + Math.abs(depth) * 2, 28 - Math.abs(depth), -i * 1.15],
                                rotate: [depth * 0.9, side * (18 + Math.abs(depth) * 1.4), side * -9, depth * 0.9],
                                scale: [1, 1.035, 0.985, 1],
                              } : { x: 0, y: -i * 1.15, rotate: depth * 0.9, scale: 1 }}
                              transition={{ duration: 0.78, ease: [0.22, 0.72, 0.24, 1], times: [0, 0.34, 0.7, 1], delay: isShuffling ? i * 0.012 : 0 }}
                              className="shuffle-card"
                              style={{ zIndex: isShuffling ? 80 + i : 100 - i }}
                            >
                              <div className="shuffle-card-inner" />
                            </motion.div>
                          );
                        })}
                        <motion.div
                          className="shuffle-cut-light"
                          animate={isShuffling ? { opacity: [0, 1, 0], scaleX: [0.4, 1, 0.75], x: [-80, 70, 0] } : { opacity: 0 }}
                          transition={{ duration: 0.72, ease: 'easeOut' }}
                        />
                      </div>
                      <button className="app-button app-button--primary app-button--pill shuffle-action" onClick={handleShuffle} disabled={isShuffling || shuffleCount >= westernConfig.shuffleGoal}>
                        {isShuffling ? t('shufflingAction') : (shuffleCount >= westernConfig.shuffleGoal ? t('shuffleComplete') : t('shuffleAction'))}
                      </button>
                      <p className="shuffle-hint">{t('shuffleHint')}</p>
                    </div>
                  </div>
                )}

                {westernStep === 3 && (
                  <div className="glass-container centered selection-panel">
                    <div className="selection-header">
                      <h2 className="primary-gradient-text">{t('chooseCardsTitle')}</h2>
                      <p>{t('chooseCardsDesc')} ({selectedCardIndices.length}/3)</p>
                    </div>
                    <div className="selection-picked-zone">
                      {selectedCardIndices.map((selectedIndex, pickedIndex) => {
                        const pickedCard = shuffledDeck[selectedIndex];
                        if (!pickedCard) return null;
                        return (
                          <motion.div
                            key={selectedIndex}
                            className="selection-picked-card"
                            initial={{ opacity: 0, y: 40, rotateY: 180, scale: 0.78 }}
                            animate={{ opacity: 1, y: 0, rotateY: 0, scale: 1 }}
                            transition={{ duration: 0.42, ease: [0.2, 0.75, 0.25, 1] }}
                            style={{ zIndex: 20 + pickedIndex }}
                          >
                            <div className="selection-picked-card-inner">
                              <PremiumCard card={{ ...pickedCard, isReversed: false }} />
                            </div>
                            <div className="selected-card-mark picked">{pickedIndex + 1}</div>
                          </motion.div>
                        );
                      })}
                    </div>
                    <div className="selection-table">
                      <div className="selection-orbit selection-orbit-one" />
                      <div className="selection-orbit selection-orbit-two" />
                      <div className="card-spread-stage">
                        {Array.from({ length: selectionRowCount }).map((_, row) => {
                          const perRow = Math.ceil(shuffledDeck.length / selectionRowCount);
                          const rowCards = shuffledDeck.slice(row * perRow, row * perRow + perRow);
                          return (
                            <div key={row} className="card-spread-row">
                              {rowCards.map((card, rowIndex) => {
                                const index = row * perRow + rowIndex;
                                const isSelected = selectedCardIndices.includes(index);
                                return (
                                  <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 18, scale: 0.94 }}
                                    animate={{ opacity: isSelected ? 0.25 : 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.24, delay: index * 0.004, ease: [0.2, 0.75, 0.25, 1] }}
                                    whileHover={!isSelected ? { y: -12, scale: 1.025 } : {}}
                                    onClick={() => handleSelectCard(index)}
                                    className={`select-card-back ${isSelected ? 'selected in-row' : ''}`}
                                    style={{ zIndex: isSelected ? 1 : rowIndex }}
                                  >
                                    <div className="select-card-back-glow" />
                                  </motion.div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
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
                          <p className="western-result-kicker">{t('topic')}</p>
                          <h2 className="primary-gradient-text">{t({ [TOPICS.LOVE]: 'topicLove', [TOPICS.CAREER]: 'topicCareer', [TOPICS.FUTURE]: 'topicFuture', [TOPICS.MONEY]: 'topicMoney' }[westernConfig.category] || 'topicFuture')}</h2>
                        </div>
                        <button onClick={resetWesternReading} className="back-btn">{t('newReading')}</button>
                      </div>

                      <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                        <p style={{ color: 'var(--primary-light)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{t('readingSummary')}</p>
                        <p style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>"{getQuickSummary(finalCards, language)}"</p>
                      </div>

                      <div className="western-card-meanings">
                        {finalCards.map((card, i) => (
                          <div key={i} className="report-card" style={{ marginBottom: 0 }}>
                            <div className="title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>{i + 1}</span>
                              {getDisplayCardName(card, language)} {card.isReversed ? t('reversed') : ''}
                            </div>
                            {loadingCards ? (
                              <div className="ai-loading" style={{ margin: '1rem 0' }}>
                                <Loader2 className="loader-spin" size={16} />
                                <span className="ai-loading-text" style={{ fontSize: '0.875rem' }}>{t('cardAiLoading')} {t({ [TOPICS.LOVE]: 'topicLove', [TOPICS.CAREER]: 'topicCareer', [TOPICS.FUTURE]: 'topicFuture', [TOPICS.MONEY]: 'topicMoney' }[westernConfig.category] || 'topicFuture')}...</span>
                              </div>
                            ) : (
                              <p className="text">"{paidFeatures.western && aiCardMeanings[i] ? aiCardMeanings[i] : getContextualCardMeaning(card, westernConfig.category, language)}"</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {!paidFeatures.western || !aiCardMeanings.length ? (
                        <div style={{ marginBottom: '2rem' }}>
                          <LockedAiPanel
                            title={paidFeatures.western ? t('createCardAi') : t('unlockCardAi')}
                            description={t('cardAiDesc')}
                            actionLabel={paidFeatures.western ? t('createCardAi') : t('unlockAI')}
                            onUnlock={unlockWesternCardAi}
                            unlocked={paidFeatures.western}
                          />
                        </div>
                      ) : null}

                      <AIWisdomSection loading={aiLoading.western} chatHistory={chatHistory.western} onAsk={() => askAI('western')} onSendQuestion={(q) => handleSendQuestion('western', q)} isAIPaid={paidFeatures.western} uiText={UI_TEXT[language] || UI_TEXT.vi} />
                    </div>
                  </div>
                )}
              </motion.section>
            )}
            {currentView === 'tarot' && (
              <motion.section key="tarot" className="page-view tarot-page-view" {...pageMotion}>
                <div className="tarot-shell">
                  <PageHeader title={t('tarotTitle')} subtitle={<span className="tarot-mobile-hidden-subtitle">{t('tarotSubtitle')}</span>} className="western-setup-header" />

                  {tarotStep === 1 && (
                    <div className="tarot-setup-stage balanced-form-stage">
                      <GlassCard className="centered tarot-setup-panel">
                        <FormField label={t('topicLabel')}>
                          <CustomSelect
                            options={[{ value: TOPICS.LOVE, label: t('topicLove') }, { value: TOPICS.CAREER, label: t('topicCareer') }, { value: TOPICS.FUTURE, label: t('topicFuture') }, { value: TOPICS.MONEY, label: t('topicMoney') }]}
                            value={tarotTopic}
                            onChange={setTarotTopic}
                          />
                        </FormField>
                        <FormField label={t('tarotQuestionLabel')}>
                          <textarea
                            className="modern-input tarot-question"
                            value={tarotQuestion}
                            onChange={(e) => setTarotQuestion(e.target.value)}
                            placeholder={t('tarotQuestionPlaceholder')}
                          />
                        </FormField>
                        {tarotError && <p style={{ color: '#ef4444', fontSize: '0.82rem', textAlign: 'center' }}>{tarotError}</p>}
                        <PrimaryButton type="button" onClick={startTarotReading}>
                          <Star size={18} /> {t('tarotStart')}
                        </PrimaryButton>
                      </GlassCard>
                    </div>
                  )}

                  {tarotStep === 2 && (
                    <div className={`glass-container centered tarot-selection-panel ${tarotCards.length === 3 ? 'has-picked' : ''} ${tarotIsShuffling ? 'is-shuffling' : ''}`}>
                      <div className="tarot-sparkle-field" aria-hidden="true">
                        {Array.from({ length: 12 }).map((_, i) => <span key={i} />)}
                      </div>
                      <div className="selection-header">
                        <h2 className="primary-gradient-text">{t('tarotChooseTitle')}</h2>
                        <p>{t('tarotChooseDesc')} ({selectedTarotIndices.length}/3)</p>
                      </div>

                      <div className="tarot-pick-meter" aria-label={`${selectedTarotIndices.length}/3`}>
                        {t('tarotPositions').map((position, index) => {
                          const pickedDeckIndex = selectedTarotIndices[index];
                          const pickedCard = pickedDeckIndex !== undefined ? tarotShuffledDeck[pickedDeckIndex] : null;
                          return (
                            <div
                              key={position}
                              className={`tarot-pick-slot ${pickedCard ? 'filled' : ''} ${selectedTarotIndices.length === index ? 'next' : ''}`}
                            >
                              <span className="tarot-pick-slot-card">
                                {pickedCard ? <img src={tarotCardBack} alt="" /> : index + 1}
                              </span>
                              <span className="tarot-pick-slot-label">{position}</span>
                            </div>
                          );
                        })}
                      </div>

                      {tarotCards.length === 3 && (
                        <motion.div
                          className="tarot-reveal-stage"
                          initial={{ opacity: 0, y: 24 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.42, delay: 0.42, ease: [0.2, 0.75, 0.25, 1] }}
                        >
                          <motion.div
                            className="tarot-ai-loading"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: [0, 1, 1, 0.92], y: 0 }}
                            transition={{ duration: 1.2, delay: 0.72, ease: 'easeOut' }}
                          >
                            <Loader2 size={18} className="spin" /> {t('aiDeepLoading')}
                          </motion.div>
                          <div className="tarot-reveal-cards">
                            {tarotCards.map((card, index) => (
                              <motion.div
                                key={`${card.id}-reveal-${index}`}
                                className="tarot-reveal-card"
                                initial={{ opacity: 0, y: 44, scale: 0.84 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.56, delay: 0.82 + index * 0.14, ease: [0.18, 0.86, 0.22, 1] }}
                              >
                                <motion.span
                                  className="tarot-card-flip-inner"
                                  initial={{ rotateY: 0 }}
                                  animate={{ rotateY: [0, 82, 98, 180] }}
                                  transition={{ duration: 0.78, delay: 1.55 + index * 0.42, times: [0, 0.42, 0.52, 1], ease: [0.16, 0.84, 0.24, 1] }}
                                >
                                  <span className="tarot-card-face tarot-card-face-back">
                                    <img src={tarotCardBack} alt="" />
                                  </span>
                                  <span className="tarot-card-face tarot-card-face-front">
                                    <img src={card.image} alt={card.name} className={card.isReversed ? 'reversed' : ''} />
                                  </span>
                                </motion.span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      <motion.div
                        className={`tarot-fan-table tarot-two-row-table ${tarotCards.length === 3 ? 'dimmed' : ''}`}
                        animate={tarotCards.length === 3
                          ? { opacity: 0, filter: 'blur(7px)', x: '-50%', y: 28, scale: 0.985 }
                          : { opacity: 1, filter: 'blur(0px)', x: '-50%', y: 0, scale: 1 }}
                        transition={{ duration: 0.58, ease: [0.2, 0.75, 0.25, 1] }}
                        style={{ pointerEvents: tarotCards.length === 3 ? 'none' : 'auto' }}
                      >
                        {Array.from({ length: tarotRowCount }).map((_, row) => (
                          <div key={row} className="tarot-two-row">
                            {tarotShuffledDeck.slice(row * tarotCardsPerRow, row * tarotCardsPerRow + tarotCardsPerRow).map((card, rowIndex) => {
                              const index = row * tarotCardsPerRow + rowIndex;
                              const pickedOrder = selectedTarotIndices.indexOf(index);
                              const isSelected = pickedOrder !== -1;
                              return (
                                <motion.button
                                  key={`${card.id}-${index}`}
                                  type="button"
                                  className={`tarot-back-card tarot-back-card-row ${isSelected ? 'selected' : ''}`}
                                  onClick={() => handleSelectTarotCard(index)}
                                  disabled={isSelected || selectedTarotIndices.length >= 3}
                                  initial={{ opacity: 0, y: 18 }}
                                  animate={isSelected
                                    ? { opacity: 1, x: 0, y: -36, scale: 1.035, zIndex: 120 + pickedOrder }
                                    : { opacity: 1, x: 0, y: 0, scale: 1, zIndex: 1 }}
                                  whileHover={!isSelected && selectedTarotIndices.length < 3 && !tarotIsShuffling ? { y: -26, scale: 1.035, zIndex: 120 } : {}}
                                  whileTap={!isSelected && selectedTarotIndices.length < 3 ? { y: -32, scale: 1.045 } : {}}
                                  transition={isSelected
                                    ? { type: 'spring', stiffness: 340, damping: 25, mass: 0.7 }
                                    : { duration: 0.24, delay: Math.min(index * 0.0025, 0.14), ease: [0.2, 0.75, 0.25, 1] }}
                                  aria-label={`Tarot card ${index + 1}`}
                                >
                                  <motion.span
                                    className="tarot-card-flip-inner"
                                    animate={{ rotateY: 0, scale: 1 }}
                                    transition={{ duration: 0.24, ease: [0.2, 0.75, 0.25, 1] }}
                                  >
                                    <span className="tarot-card-face tarot-card-face-back">
                                      <img src={tarotCardBack} alt="" loading={index < 18 ? 'eager' : 'lazy'} />
                                    </span>
                                    <span className="tarot-card-face tarot-card-face-front">
                                    </span>
                                  </motion.span>
                                  <span className="tarot-card-spark" aria-hidden="true" />
                                </motion.button>
                              );
                            })}
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  )}

                  {tarotStep === 3 && (
                    <div className="tarot-result">
                      <div className="tarot-result-header">
                        <div>
                          <p className="western-result-kicker">{t('topic')}</p>
                          <h2 className="primary-gradient-text">{tarotQuestion}</h2>
                        </div>
                        <button className="back-btn" onClick={resetTarotReading}>{t('tarotReset')}</button>
                      </div>
                      <div className="tarot-card-grid">
                        {tarotCards.map((card, index) => {
                          const positions = t('tarotPositions');
                          const position = Array.isArray(positions) ? positions[index] : ['Quá khứ', 'Hiện tại', 'Tương lai'][index];
                          return (
                            <motion.article
                              key={`${card.id}-${index}`}
                              className="tarot-card-reading"
                              initial={{ opacity: 0, y: 24 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.28, delay: index * 0.08, ease: [0.2, 0.75, 0.25, 1] }}
                              onClick={() => setTarotModalCard({ card, position })}
                            >
                              <div className="tarot-card-topline">
                                <div className="tarot-image-wrap">
                                  <img src={card.image} alt={card.name} loading={index === 0 ? 'eager' : 'lazy'} className={card.isReversed ? 'reversed' : ''} />
                                </div>
                                <div className="tarot-card-heading">
                                  <h3>
                                    {card.name}
                                    {card.isReversed && <span className="tarot-inline-reversed">↻ {t('tarotReversed')}</span>}
                                  </h3>
                                  <p className="western-result-kicker">{position}</p>
                                </div>
                              </div>
                              <div className="tarot-card-copy">
                                {expandedTarotCards[index] && (
                                  <div className="tarot-reading-body">
                                    <p className="tarot-full-reading">{getTarotReadingParts(card, position).interpretation}</p>
                                    <div className="tarot-guidance-section">
                                      <h4>{getTarotReadingParts(card, position).guidanceTitle}</h4>
                                      <p>{getTarotReadingParts(card, position).guidance}</p>
                                    </div>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  className="tarot-reading-toggle"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedTarotCards(prev => ({ ...prev, [index]: !prev[index] }));
                                  }}
                                >
                                  {expandedTarotCards[index] ? 'Ẩn luận giải' : 'Xem luận giải đầy đủ'}
                                </button>
                              </div>
                            </motion.article>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {tarotModalCard && (
                          <motion.div
                            className="tarot-detail-modal"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setTarotModalCard(null)}
                          >
                            <motion.div
                              className="tarot-detail-card"
                              initial={{ opacity: 0, y: 18, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 12, scale: 0.97 }}
                              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <img src={tarotModalCard.card.image} alt={tarotModalCard.card.name} className={tarotModalCard.card.isReversed ? 'reversed' : ''} />
                              <div>
                                <p className="western-result-kicker">{tarotModalCard.position}</p>
                                <h3>
                                  {tarotModalCard.card.name}
                                  {tarotModalCard.card.isReversed && <span className="tarot-inline-reversed">↻ {t('tarotReversed')}</span>}
                                </h3>
                                <div className="tarot-reading-body">
                                  <p className="tarot-full-reading">{getTarotReadingParts(tarotModalCard.card, tarotModalCard.position).interpretation}</p>
                                  <div className="tarot-guidance-section">
                                    <h4>{getTarotReadingParts(tarotModalCard.card, tarotModalCard.position).guidanceTitle}</h4>
                                    <p>{getTarotReadingParts(tarotModalCard.card, tarotModalCard.position).guidance}</p>
                                  </div>
                                </div>
                                <button type="button" className="tarot-reading-toggle" onClick={() => setTarotModalCard(null)}>{t('close')}</button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
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
                backdropFilter: 'blur(6px)',
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
                <div className="cosmic-modal-logo-wrap">
                  <img className="cosmic-modal-logo" src="/logonum-256.png" alt="ASTRA astrology logo" />
                </div>
                <h3 className="primary-gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{t('dailyTitle')}</h3>

                {dailyMessageLoading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
                    <Loader2 className="loader-spin" size={24} color="var(--primary-light)" />
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{t('dailyLoading')}</p>
                  </div>
                ) : (
                  <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem', fontFamily: '"Be Vietnam Pro", Outfit, sans-serif' }}>
                    {dailyMessage}
                  </p>
                )}

                <button
                  onClick={() => setShowDailyMessage(false)}
                  className="app-button app-button--primary"
                >
                  {t('dailyAccept')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* â”€â”€ App-level Paywall Modal â”€â”€ */}
      <AnimatePresence>
        {showPaywall && (
          <motion.div key="app-paywall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
            onClick={payStatus === 'polling' ? undefined : handleClosePaywall}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.88, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'linear-gradient(145deg,#1a0a2e,#0d0d1a)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: '24px', padding: '2rem 1.75rem', width: '100%', maxWidth: '320px', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center', boxShadow: '0 20px 60px rgba(139,92,246,0.35)' }}
            >
              <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '160px', height: '2px', background: 'linear-gradient(90deg,transparent,#8b5cf6,#ec4899,transparent)', borderRadius: '2px' }} />

              {payStatus === 'loading' && (<><Loader2 size={36} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} /><div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>{t('payCreating')}</div></>)}

              {payStatus === 'qr' && (<>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1.1rem' }}>{t('payQrTitle')}</div>
                {qrUrl
                  ? <img src={qrUrl} alt="QR" style={{ width: '240px', height: 'auto', borderRadius: '12px', border: '2px solid rgba(139,92,246,0.4)', background: '#fff' }} />
                  : <div style={{ width: '240px', height: '240px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', padding: '1rem', textAlign: 'center' }}>{t('payQrFallback')}</div>
                }
                <div style={{ background: 'rgba(139,92,246,0.15)', borderRadius: '10px', padding: '0.6rem 1rem', width: '100%' }}>
                  <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.68rem', marginBottom: '0.2rem' }}>{t('payTransferContent')}</div>
                  <div style={{ color: '#c4b5fd', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.05em' }}>{txCode}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', borderRadius: '10px', padding: '0.45rem 1.25rem', fontWeight: 800, fontSize: '1.3rem', color: '#fff' }}>{PRICE.toLocaleString('vi-VN')} VND</div>
                <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
                  <button onClick={handleClosePaywall} className="app-button app-button--ghost app-button--sm app-button--grow">{t('cancel')}</button>
                  <button onClick={handlePaymentPolling} className="app-button app-button--primary app-button--sm app-button--grow-2">{t('transferred')} ✓</button>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.65rem' }}>{t('paySafe')}</div>
              </>)}

              {payStatus === 'polling' && (<>
                <Loader2 size={40} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ color: '#fff', fontWeight: 600 }}>{t('payConfirming')}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', lineHeight: 1.6 }}>{t('payAutoUnlock')}</div>
                <button
                  onClick={() => {
                    stopPollRef.current?.();
                    setPayStatus('qr');
                  }}
                  className="app-button app-button--ghost app-button--sm" style={{ marginTop: '1rem' }}
                >
                  {t('back')}
                </button>
              </>)}

              {payStatus === 'error' && (<>
                <div style={{ fontSize: '2rem' }}>⚠</div>
                <div style={{ color: '#fbbf24', fontWeight: 600 }}>{t('payNotFound')}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>{t('payTimeout')}</div>
                <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
                  <button onClick={handleClosePaywall} className="app-button app-button--ghost app-button--sm app-button--grow">{t('close')}</button>
                  <button onClick={() => setPayStatus('qr')} className="app-button app-button--primary app-button--sm app-button--grow-2">{t('retry')}</button>
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
const LockedAiPanel = ({ title, description, actionLabel = 'Unlock AI', onUnlock, unlocked = false }) => (
  <div style={{ padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(236,72,153,0.28)', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.08))', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem' }}>
    <Lock size={20} color="#f59e0b" />
    <div style={{ color: '#fff', fontWeight: 700 }}>{title}</div>
    <p style={{ color: 'rgba(255,255,255,0.58)', fontSize: '0.82rem', lineHeight: 1.55, margin: 0 }}>{description}</p>
    <button type="button" onClick={onUnlock} className="app-button app-button--primary app-button--sm app-button--pill">
      {unlocked ? actionLabel : `${actionLabel} · ${PRICE.toLocaleString('vi-VN')} VND`}
    </button>
  </div>
);

const AIWisdomSection = ({ loading, chatHistory, onAsk, onSendQuestion, isAIPaid, uiText = UI_TEXT.vi }) => {
  const [questionInput, setQuestionInput] = useState('');
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'auto' });
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
        <span className="ai-title">{uiText.aiAssistantTitle}</span>
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
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 0, borderRadius: '20px' }}
          />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid rgba(255,255,255,0.2)', boxShadow: '0 0 22px rgba(236,72,153,0.45)' }}
              >
                <Bot size={32} color="#fff" />
              </div>
              <div style={{ position: 'absolute', bottom: -3, right: -3, width: '24px', height: '24px', borderRadius: '50%', background: '#0f0f1a', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Lock size={12} color="#f59e0b" />
              </div>
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.35rem', fontWeight: 700 }}>{uiText.aiAssistantTitle}</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.6, margin: 0 }}>
                {uiText.aiAssistantDesc}
              </p>
            </div>
            <motion.button
              onClick={onAsk}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="app-button app-button--primary app-button--pill"
            >
              <Lock size={14} color="#fff" /> {uiText.unlockAI} · {PRICE.toLocaleString('vi-VN')} VND
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
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem' }}>{uiText.aiStartPrompt}</p>
          <motion.div whileHover={{ scale: 1.05 }} className="app-button app-button--pill" style={{ background: '#fff', color: '#ec4899', boxShadow: 'none' }}>
            <Zap size={18} fill="#ec4899" /> {uiText.startNow}
          </motion.div>
        </motion.div>
      )}


      {chatHistory.length > 0 && (
        <div className="chat-container">
          {chatHistory.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-ai'}`}>
              {msg.role === 'ai' && idx === chatHistory.length - 1 ? (
                <FormattedText text={msg.text} />
              ) : (
                msg.role === 'ai' ? <FormattedText text={msg.text} /> : <span style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{msg.text}</span>
              )}
            </motion.div>
          ))}
          {loading && (
            <div className="ai-loading" style={{ margin: '1rem 0' }}>
              <Loader2 className="loader-spin" size={24} />
              <span className="ai-loading-text">{uiText.aiThinking}</span>
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
            placeholder={uiText.askMorePlaceholder}
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-send-btn" onClick={handleSend} disabled={!questionInput.trim() || loading}>
            {uiText.send}
          </button>
        </div>
      )}
    </div>
  );
};

// â”€â”€ Soulmate / Compatibility Section â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LP_COLORS = {
  1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#22c55e',
  5: '#06b6d4', 6: '#a855f7', 7: '#3b82f6', 8: '#ec4899',
  9: '#f43f5e', 11: '#c084fc', 22: '#facc15', 33: '#67e8f9',
};

const AuraVenn = ({ lp1, lp2, matchPercent, label = UI_TEXT.vi.compatScoreLabel }) => {
  const c1 = LP_COLORS[lp1] || '#8b5cf6';
  const c2 = LP_COLORS[lp2] || '#ec4899';
  return (
    <div style={{ position: 'relative', width: '280px', height: '180px', margin: '0 auto' }}>
      {/* Ring 1 */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '170px', height: '170px', borderRadius: '50%',
          background: `radial-gradient(circle at 60% 50%, ${c1}60, ${c1}20)`,
          border: `2px solid ${c1}80`,
          boxShadow: `0 0 40px ${c1}60`,
        }}
      />
      {/* Ring 2 */}
      <div
        style={{
          position: 'absolute', top: 0, right: 0,
          width: '170px', height: '170px', borderRadius: '50%',
          background: `radial-gradient(circle at 40% 50%, ${c2}60, ${c2}20)`,
          border: `2px solid ${c2}80`,
          boxShadow: `0 0 40px ${c2}60`,
        }}
      />
      {/* Blend center */}
      <div
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
        <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginTop: '4px', whiteSpace: 'nowrap' }}>{label}</span>
      </div>
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

const SoulmateSection = ({ form, setForm, result, setResult, loading, setLoading, error, setError, isPaid, requirePayment, language = 'vi', uiText = UI_TEXT.vi }) => {
  const formRef = useRef(form);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

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

  const buildPreviewResult = (d1, d2) => {
    const currentForm = formRef.current;
    const lp1 = calculateLifePath(d1.isoStr);
    const dest1 = calculateNameNumber(currentForm.name1);
    const lp2 = calculateLifePath(d2.isoStr);
    const dest2 = calculateNameNumber(currentForm.name2);
    const lpGap = Math.abs(lp1 - lp2);
    const destinyGap = Math.abs(dest1 - dest2);
    const matchPercent = Math.max(45, Math.min(92, 82 - lpGap * 4 - destinyGap * 2 + (lp1 === lp2 ? 10 : 0)));

    const name1 = currentForm.name1.trim();
    const name2 = currentForm.name2.trim();
    const fill = (template) => template
      .replace('{name1}', name1)
      .replace('{name2}', name2)
      .replace('{percent}', matchPercent)
      .replace('{lp1}', lp1)
      .replace('{lp2}', lp2);

    return {
      isPreview: true,
      lp1,
      lp2,
      dest1,
      dest2,
      name1,
      name2,
      matchPercent,
      summary: fill(uiText.soulmatePreviewSummary),
      emotion: fill(uiText.soulmatePreviewEmotion)
    };
  };

  const unlockFullAnalysis = async () => {
    if (!result) return;
    setLoading(true);
    const currentForm = formRef.current;
    const res = await generateSoulmateAnalysis(
      { name: result.name1, dob: currentForm.dob1, lp: result.lp1, destiny: result.dest1 },
      { name: result.name2, dob: currentForm.dob2, lp: result.lp2, destiny: result.dest2 },
      language
    );
    setLoading(false);

    if (res) {
      setResult({ ...res, lp1: result.lp1, lp2: result.lp2, dest1: result.dest1, dest2: result.dest2, name1: result.name1, name2: result.name2, isPreview: false });
    } else {
      setError(uiText.soulmateAiError);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    const currentForm = formRef.current;
    const d1 = parseDob(currentForm.dob1);
    const d2 = parseDob(currentForm.dob2);
    if (!d1 || !d2) { setError(uiText.soulmateDateError); return; }
    if (!currentForm.name1.trim() || !currentForm.name2.trim()) { setError(uiText.soulmateNameError); return; }

    setForm(currentForm);
    setResult(buildPreviewResult(d1, d2));
  };

  const loadingMessages = uiText.soulmateLoadingMessages;
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingMsgIdx(i => (i + 1) % loadingMessages.length), 1800);
    return () => clearInterval(t);
  }, [loading, loadingMessages.length]);

  if (result) {
    return (
      <motion.section key="soulmate-result" className="page-view soulmate-page" {...pageMotion}>
        <div style={{ maxWidth: '640px', margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>

          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{uiText.soulmateTitle}</h2>
            <motion.button
              onClick={() => setResult(null)}
              whileTap={{ scale: 0.95 }}
              className="app-button app-button--ghost app-button--sm app-button--pill"
            >
              {uiText.backEdit}
            </motion.button>
          </div>

          {/* Aura + Match score */}
          <div className="glass-card" style={{ marginBottom: '1rem', textAlign: 'center' }}>
            {/* Two people */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'nowrap' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: LP_COLORS[result.lp1] || '#8b5cf6', margin: '0 auto 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: `0 0 18px ${LP_COLORS[result.lp1] || '#8b5cf6'}80` }}>{result.lp1}</div>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{result.name1}</span>
              </div>
              <AuraVenn lp1={result.lp1} lp2={result.lp2} matchPercent={result.matchPercent} label={uiText.compatScoreLabel} />
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: LP_COLORS[result.lp2] || '#ec4899', margin: '0 auto 0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: `0 0 18px ${LP_COLORS[result.lp2] || '#ec4899'}80` }}>{result.lp2}</div>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', display: 'block' }}>{result.name2}</span>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.6, margin: 0 }}>"{result.summary}"</p>
          </div>

          {/* 4 Insight Cards */}
          <div className="report-section">
            <SoulmateInsightCard title={result.isPreview ? uiText.compatPreviewTitle : uiText.emotionTitle} icon={Heart} color="#f43f5e" content={result.emotion} loading={loading} />
            {result.isPreview ? (
              <LockedAiPanel
                title={uiText.unlockFullTitle}
                description={uiText.unlockFullDesc}
                actionLabel={isPaid ? uiText.viewFullAnalysis : uiText.unlockFull}
                onUnlock={() => requirePayment('soulmate', unlockFullAnalysis)}
                unlocked={isPaid}
              />
            ) : (
              <>
                <SoulmateInsightCard title={uiText.communicationTitle} icon={MessageCircle} color="#60a5fa" content={result.communication} loading={loading} />
                <SoulmateInsightCard title={uiText.karmicTitle} icon={Infinity} color="#c084fc" content={result.karmic} loading={loading} />
                <SoulmateInsightCard title={uiText.redFlagTitle} icon={AlertTriangle} color="#f97316" content={result.redFlag} loading={loading} />
              </>
            )}
          </div>
        </div>
      </motion.section>
    );
  }

  if (loading) {
    return (
      <motion.section key="soulmate-loading" className="page-view soulmate-page" {...pageMotion}>
        <div style={{ minHeight: 'calc(100dvh - 140px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.75rem' }}>
          {/* Orbit Loader */}
          <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 20px #ec489980', '0 0 50px #ec4899cc', '0 0 20px #ec489980'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{ position: 'absolute', inset: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}
            >♥</motion.div>
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
            {uiText.soulmateAnalyzing}
          </div>
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section key="soulmate-form" className="page-view soulmate-page" {...pageMotion}>
      <div className="balanced-form-stage soulmate-setup-stage">
        <div className="balanced-form-shell soulmate-setup-shell">

          {/* Header */}
          <div className="balanced-form-header" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h2 className="primary-gradient-text" style={{ fontSize: '1.5rem', marginBottom: '0.35rem', lineHeight: 1.2, fontWeight: 700, whiteSpace: 'nowrap' }}>{uiText.soulmateTitle}</h2>
            <p className="soulmate-form-subtitle">{uiText.soulmateSubtitle}</p>
          </div>

          <form onSubmit={handleAnalyze}>
            {/* Single unified card */}
            <div className="glass-card" style={{ marginBottom: '1rem', padding: 0 }}>

              {/* Person 1 */}
              <div style={{ padding: '1.25rem 1.25rem 1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>1</div>
                  <span style={{ color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.875rem' }}>{uiText.soulmatePerson1}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)' }} placeholder={uiText.namePlaceholder} defaultValue={form.name1} onChange={e => { formRef.current = { ...formRef.current, name1: e.target.value }; }} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)' }} placeholder={uiText.dobPlaceholder} defaultValue={form.dob1} onChange={e => { formRef.current = { ...formRef.current, dob1: e.target.value }; }} />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 1.25rem', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4))' }} />
                <div
                  style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', boxShadow: '0 0 12px rgba(236,72,153,0.4)', flexShrink: 0 }}
                >♥</div>
                <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(244,63,94,0.4), transparent)' }} />
              </div>

              {/* Person 2 */}
              <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #f43f5e, #fb7185)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>2</div>
                  <span style={{ color: '#fb7185', fontWeight: 600, fontSize: '0.875rem' }}>{uiText.soulmatePerson2}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)' }} placeholder={uiText.namePlaceholder} defaultValue={form.name2} onChange={e => { formRef.current = { ...formRef.current, name2: e.target.value }; }} />
                  <input className="modern-input" style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(255,255,255,0.12)' }} placeholder={uiText.dobPlaceholder} defaultValue={form.dob2} onChange={e => { formRef.current = { ...formRef.current, dob2: e.target.value }; }} />
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
              <Heart size={18} fill="#fff" /> {uiText.soulmateSubmit}
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

const ModuleCard = ({ title, desc, onClick, icon, linkText = UI_TEXT.vi.exploreNow }) => (
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
      {linkText} <ChevronRight size={16} />
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
      {options.map(option => {
        const optionValue = typeof option === 'string' ? option : option.value;
        const optionLabel = typeof option === 'string' ? option : option.label;
        return (
          <button
            key={optionValue}
            type="button"
            onClick={() => onChange(optionValue)}
            className={`select-btn ${value === optionValue ? 'active' : ''}`}
          >
            {optionLabel}
          </button>
        );
      })}
    </div>
  </div>
);

const CustomSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const normalizedOptions = options.map(option => typeof option === 'string' ? { value: option, label: option } : option);
  const selectedLabel = normalizedOptions.find(option => option.value === value)?.label || value;

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
        <span>{selectedLabel}</span>
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
            {normalizedOptions.map((option) => (
              <div
                key={option.value}
                className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => { onChange(option.value); setIsOpen(false); }}
              >
                {option.label}
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

const ReportCard = ({ title, text, loading, loadingLabel = UI_TEXT.vi.aiDeepLoading }) => (
  <div className="report-card">
    <div className="title">{title}</div>
    {loading ? (
      <div className="ai-loading" style={{ margin: '1rem 0' }}>
        <Loader2 className="loader-spin" size={16} />
        <span className="ai-loading-text" style={{ fontSize: '0.875rem' }}>{loadingLabel}</span>
      </div>
    ) : (
      <div className="text" style={{ margin: 0 }}><FormattedText text={text} /></div>
    )}
  </div>
);

const gridMeanings = {
  vi: {
    '1': 'Th\u1ec3 hi\u1ec7n b\u1ea3n th\u00e2n', '11': 'Tr\u1ef1c gi\u00e1c nh\u1ea1y b\u00e9n (11)', '111': 'Th\u00edch chia s\u1ebb, n\u00f3i nhi\u1ec1u', '1111': 'R\u1ea5t nh\u1ea1y c\u1ea3m, kh\u00f3 gi\u00e3i b\u00e0y',
    '2': 'Tr\u1ef1c gi\u00e1c c\u01a1 b\u1ea3n', '22': 'N\u0103ng l\u01b0\u1ee3ng ki\u1ebfn t\u1ea1o (22)', '222': 'Qu\u00e1 nh\u1ea1y c\u1ea3m, d\u1ec5 t\u1ed5n th\u01b0\u01a1ng',
    '3': 'Tr\u00ed nh\u1edb t\u1ed1t', '33': 'T\u01b0 duy s\u00e1ng t\u1ea1o cao', '333': 'D\u1ec5 xa r\u1eddi th\u1ef1c t\u1ebf',
    '4': 'Th\u1ef1c t\u1ebf, k\u1ef7 lu\u1eadt', '44': 'T\u1ed5 ch\u1ee9c xu\u1ea5t s\u1eafc', '444': 'B\u1ea3o th\u1ee7, c\u1ee9ng nh\u1eafc',
    '5': 'C\u1ea3m x\u00fac, k\u1ebft n\u1ed1i', '55': 'M\u1ea1nh m\u1ebd, \u0111am m\u00ea', '555': 'D\u1ec5 c\u0103ng th\u1eb3ng th\u1ea7n kinh',
    '6': 'Tr\u00e1ch nhi\u1ec7m gia \u0111\u00ecnh', '66': 'S\u00e1ng t\u1ea1o xu\u1ea5t ch\u00fang', '666': 'Lo \u00e2u qu\u00e1 m\u1ee9c',
    '7': 'H\u1ecdc qua tr\u1ea3i nghi\u1ec7m', '77': 'Th\u1ea5u hi\u1ec3u t\u00e2m linh', '777': 'B\u00e0i h\u1ecdc l\u1edbn v\u1ec1 bu\u00f4ng b\u1ecf',
    '8': '\u0110\u1ed9c l\u1eadp, nh\u1ea1y b\u00e9n', '88': 'Tr\u00ed tu\u1ec7 kinh doanh', '888': 'Kh\u00e1t v\u1ecdng quy\u1ec1n l\u1ef1c',
    '9': 'Ho\u00e0i b\u00e3o, l\u00fd t\u01b0\u1edfng', '99': 'L\u00fd t\u01b0\u1edfng h\u00f3a', '999': 'D\u1ec5 m\u00f9 qu\u00e1ng v\u00ec l\u00fd t\u01b0\u1edfng'
  },
  en: {
    '1': 'Self-expression', '11': 'Sharp intuition (11)', '111': 'Expressive and talkative', '1111': 'Highly sensitive, hard to express',
    '2': 'Basic intuition', '22': 'Builder energy (22)', '222': 'Very sensitive and easily hurt',
    '3': 'Strong memory', '33': 'High creative thinking', '333': 'Can drift from reality',
    '4': 'Practical and disciplined', '44': 'Excellent organization', '444': 'Rigid or conservative',
    '5': 'Emotion and connection', '55': 'Passionate and strong', '555': 'Prone to nervous tension',
    '6': 'Family responsibility', '66': 'Exceptional creativity', '666': 'Excessive worry',
    '7': 'Learns through experience', '77': 'Spiritual understanding', '777': 'Major lesson in release',
    '8': 'Independent and perceptive', '88': 'Business intelligence', '888': 'Drive for influence',
    '9': 'Ambition and ideals', '99': 'Idealistic', '999': 'Can be blinded by ideals'
  },
  zh: {
    '1': '\u81ea\u6211\u8868\u8fbe', '11': '\u654f\u9510\u76f4\u89c9 (11)', '111': '\u5584\u4e8e\u8868\u8fbe', '1111': '\u9ad8\u5ea6\u654f\u611f\uff0c\u96be\u4ee5\u8868\u8fbe',
    '2': '\u57fa\u7840\u76f4\u89c9', '22': '\u5efa\u9020\u8005\u80fd\u91cf (22)', '222': '\u8fc7\u4e8e\u654f\u611f\uff0c\u5bb9\u6613\u53d7\u4f24',
    '3': '\u8bb0\u5fc6\u529b\u5f3a', '33': '\u521b\u9020\u601d\u7ef4\u9ad8', '333': '\u5bb9\u6613\u8131\u79bb\u73b0\u5b9e',
    '4': '\u52a1\u5b9e\u4e14\u81ea\u5f8b', '44': '\u7ec4\u7ec7\u80fd\u529b\u4f18\u79c0', '444': '\u56fa\u6267\u6216\u4fdd\u5b88',
    '5': '\u60c5\u611f\u4e0e\u8fde\u7ed3', '55': '\u70ed\u60c5\u800c\u575a\u5f3a', '555': '\u5bb9\u6613\u795e\u7ecf\u7d27\u5f20',
    '6': '\u5bb6\u5ead\u8d23\u4efb', '66': '\u975e\u51e1\u521b\u9020\u529b', '666': '\u8fc7\u5ea6\u62c5\u5fe7',
    '7': '\u4ece\u7ecf\u9a8c\u4e2d\u5b66\u4e60', '77': '\u7075\u6027\u7406\u89e3', '777': '\u5173\u4e8e\u653e\u4e0b\u7684\u91cd\u8981\u8bfe\u9898',
    '8': '\u72ec\u7acb\u4e14\u654f\u9510', '88': '\u5546\u4e1a\u667a\u6167', '888': '\u5bf9\u5f71\u54cd\u529b\u7684\u8ffd\u6c42',
    '9': '\u62b1\u8d1f\u4e0e\u7406\u60f3', '99': '\u7406\u60f3\u5316', '999': '\u53ef\u80fd\u88ab\u7406\u60f3\u8499\u853d'
  }
};

const BirthChart = ({ dob, language = 'vi', uiText = UI_TEXT.vi }) => {
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
              <line
                x1={p1.cx} y1={p1.cy} x2={p2.cx} y2={p2.cy}
                stroke="rgba(167, 139, 250, 0.42)"
                strokeWidth="2"
                filter="url(#lineGlow)"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {activeNodes.map((node, i) => {
          const { cx, cy } = getPos(node.x, node.y);
          const isActive = node.count > 0;
          const nodeStr = isActive ? node.num.repeat(node.count) : '';
          const meanings = gridMeanings[language] || gridMeanings.vi;
          const meaning = meanings[nodeStr] || uiText.specialEnergy;

          return (
            <g key={node.num}
              onMouseEnter={() => isActive && setHoveredNode({ x: cx, y: cy, val: nodeStr, meaning })}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: isActive ? 'pointer' : 'default' }}
            >
              <circle cx={cx} cy={cy} r="6" fill={isActive ? "transparent" : "rgba(255,255,255,0.05)"} />

              {isActive && (
                <g>
                  {/* Breathing Glow */}
                  <circle
                    cx={cx} cy={cy} r="22"
                    fill="url(#starGlow)"
                  />

                  {/* Core */}
                  <circle cx={cx} cy={cy} r="4" fill="#fff" filter="url(#lineGlow)" />
                  <text x={cx} y={cy - 14} fill="#fff" fontSize="11" fontWeight="700" textAnchor="middle" style={{ textShadow: '0 0 5px rgba(139, 92, 246, 0.8)' }}>
                    {nodeStr}
                  </text>

                  {/* Orbiting Particles */}
                  {[0, 1].map(pIdx => (
                    <circle
                      key={pIdx}
                      cx={cx} cy={cy - 12} r="1.5" fill="#fff"
                    />
                  ))}
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const PremiumCard = ({ card }) => {
  const getRankChar = (rank) => {
    const normalized = decodeMojibake(rank);
    return normalized === '\u00c1t' ? 'A' : normalized === 'B\u1ed3i' ? 'J' : normalized === '\u0110\u1ea7m' ? 'Q' : normalized === 'Gi\u00e0' ? 'K' : normalized;
  };
  const symbol = decodeMojibake(card.symbol);
  return (
    <div className={`western-card-premium ${card.color === 'red' ? 'red' : ''} ${card.isReversed ? 'reversed' : ''}`}>
      <div className="index-corner top"><span>{getRankChar(card.rank)}</span><span style={{ fontSize: '1.125rem' }}>{symbol}</span></div>
      <div className="card-art">
        <div style={{ filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.2))' }}>{symbol}</div>
      </div>
      <div className="index-corner bottom"><span>{getRankChar(card.rank)}</span><span style={{ fontSize: '1.125rem' }}>{symbol}</span></div>
    </div>
  );
};

export default App;




