import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw,
  MessageSquarePlus,
  MessageSquare,
  LayoutDashboard,
  ChevronDown,
  Plus,
  User,
  LogOut,
  Settings,
  HelpCircle,
  Heart,
  BookOpen,
  Laptop,
  GraduationCap,
  History,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { LoginPage } from './components/LoginPage';
import { ChatMessage } from './components/ChatMessage';
import { TypingIndicator } from './components/TypingIndicator';
import { LanguageToggle } from './components/LanguageToggle';
import AdminDashboard from './AdminDashboard';
const chimesLogo = '/chimes-logo.png';

interface Message {
  id?: string;
  type: 'user' | 'assistant';
  content: string;
  citations?: Array<{ text: string; url: string }>;
}

type ViewType = 'chat' | 'dashboard';

interface ConversationHistoryItem {
  conversationId: string;
  userMessage: string;
  assistantMessage: string;
  timestamp: string;
  language: string;
}

interface ChatInterfaceProps {
  language: 'en' | 'es';
  setLanguage: (lang: 'en' | 'es') => void;
  onNewChat?: () => void;
}

function ChatInterface({ language, setLanguage, onNewChat }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<ConversationHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation history
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://lo0it0ghy2.execute-api.us-east-1.amazonaws.com/Prod';
      const response = await fetch(`${apiEndpoint}/conversations`);
      const data = await response.json();
      setConversationHistory(data);
    } catch (error) {
      console.error('Failed to fetch conversation history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Refresh history after sending a message
  const refreshHistoryAfterSend = () => {
    setTimeout(() => fetchHistory(), 1500);
  };

  const formatRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'es' ? 'Ahora' : 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return language === 'es' ? 'Ayer' : 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const loadConversation = (conv: ConversationHistoryItem) => {
    setMessages([
      { type: 'user', content: conv.userMessage },
      { type: 'assistant', content: conv.assistantMessage },
    ]);
  };

  // Translations object
  const translations = {
    en: {
      title: 'Chimes Knowledge Companion',
      welcome: 'Hello! I\'m the Chimes Knowledge Companion. I\'m here to help you with questions about HR policies, IT support, benefits, training, and more. How can I assist you today?',
      prompts: ['Benefits & PTO', 'Employee Handbook', 'IT Help', 'Training Requirements'],
      promptDescriptions: [
        'Learn about your benefits and time off',
        'Access policies and guidelines',
        'Get technical support and help',
        'View required training modules'
      ],
      placeholder: 'Ask your own question about Chimes policies, programs, or resources...',
      responses: {
        'Benefits & PTO': {
          content: 'Chimes offers comprehensive benefits including medical, dental, and vision coverage. Full-time employees receive 15 days of PTO annually, increasing with tenure. You also have access to 401(k) matching and wellness programs.',
          citations: [
            { text: 'Benefits Guide 2025', url: 'https://chimes.org/benefits' },
            { text: 'PTO Policy', url: 'https://chimes.org/pto' },
          ],
        },
        'Employee Handbook': {
          content: 'The Employee Handbook covers our policies, procedures, code of conduct, and organizational values. You can find information on workplace expectations, safety protocols, and employee resources.',
          citations: [{ text: 'Employee Handbook', url: 'https://chimes.org/handbook' }],
        },
        'IT Help': {
          content: 'For IT support, you can submit a ticket through our internal portal or contact the IT helpdesk at ext. 5555. Common issues like password resets, software installations, and access requests are usually resolved within 24 hours.',
          citations: [{ text: 'IT Support Portal', url: 'https://chimes.org/it-support' }],
        },
        'Training Requirements': {
          content: 'All employees must complete annual training modules including: HIPAA compliance, workplace safety, diversity & inclusion, and cybersecurity awareness. New employees have additional onboarding requirements specific to their role.',
          citations: [
            { text: 'Training Portal', url: 'https://chimes.org/training' },
            { text: 'Compliance Requirements', url: 'https://chimes.org/compliance' },
          ],
        },
      },
      defaultResponse: (query: string) => `Thank you for your question about "${query}". I'm here to help! Based on our knowledge base, I can provide you with relevant information. Would you like me to look up specific policies or resources related to your inquiry?`,
    },
    es: {
      title: 'Compañero de Conocimiento Chimes',
      welcome: '¡Hola! Soy el Compañero de Conocimiento Chimes. Estoy aquí para ayudarte con preguntas sobre políticas de recursos humanos, soporte de TI, beneficios, capacitación y más. ¿Cómo puedo asistirte hoy?',
      prompts: ['Beneficios y PTO', 'Manual del Empleado', 'Ayuda de TI', 'Requisitos de Capacitación'],
      promptDescriptions: [
        'Aprende sobre tus beneficios y tiempo libre',
        'Accede a políticas y directrices',
        'Obtén soporte técnico y ayuda',
        'Ver módulos de capacitación requeridos'
      ],
      placeholder: 'Haz tu propia pregunta sobre políticas, programas o recursos de Chimes...',
      responses: {
        'Beneficios y PTO': {
          content: 'Chimes ofrece beneficios integrales que incluyen cobertura médica, dental y de visión. Los empleados de tiempo completo reciben 15 días de PTO anualmente, que aumentan con la antigüedad. También tienes acceso a igualación 401(k) y programas de bienestar.',
          citations: [
            { text: 'Guía de Beneficios 2025', url: 'https://chimes.org/benefits' },
            { text: 'Política de PTO', url: 'https://chimes.org/pto' },
          ],
        },
        'Manual del Empleado': {
          content: 'El Manual del Empleado cubre nuestras políticas, procedimientos, código de conducta y valores organizacionales. Puedes encontrar información sobre expectativas laborales, protocolos de seguridad y recursos para empleados.',
          citations: [{ text: 'Manual del Empleado', url: 'https://chimes.org/handbook' }],
        },
        'Ayuda de TI': {
          content: 'Para soporte de TI, puedes enviar un ticket a través de nuestro portal interno o contactar al servicio de ayuda de TI en la ext. 5555. Los problemas comunes como restablecimiento de contraseñas, instalaciones de software y solicitudes de acceso generalmente se resuelven en 24 horas.',
          citations: [{ text: 'Portal de Soporte de TI', url: 'https://chimes.org/it-support' }],
        },
        'Requisitos de Capacitación': {
          content: 'Todos los empleados deben completar módulos de capacitación anual que incluyen: cumplimiento de HIPAA, seguridad en el lugar de trabajo, diversidad e inclusión, y conciencia de ciberseguridad. Los nuevos empleados tienen requisitos de incorporación adicionales específicos para su función.',
          citations: [
            { text: 'Portal de Capacitación', url: 'https://chimes.org/training' },
            { text: 'Requisitos de Cumplimiento', url: 'https://chimes.org/compliance' },
          ],
        },
      },
      defaultResponse: (query: string) => `Gracias por tu pregunta sobre "${query}". ¡Estoy aquí para ayudar! Basándome en nuestra base de conocimientos, puedo proporcionarte información relevante. ¿Te gustaría que busque políticas o recursos específicos relacionados con tu consulta?`,
    },
  };

  const t = translations[language];

  // Follow-up suggestions
  const followUpSuggestions = {
    en: [
      'Tell me more about health insurance',
      'How do I request time off?',
      'What are the retirement benefits?',
      'How do I reset my password?',
      'Where can I find training materials?',
      'What is the dress code policy?',
    ],
    es: [
      'Cuéntame más sobre el seguro de salud',
      '¿Cómo solicito tiempo libre?',
      '¿Cuáles son los beneficios de jubilación?',
      '¿Cómo restablezco mi contraseña?',
      '¿Dónde puedo encontrar materiales de capacitación?',
      '¿Cuál es la política de vestimenta?',
    ],
  };

  const promptIcons = [Heart, BookOpen, Laptop, GraduationCap];

  // Set initial welcome message when language changes
  useEffect(() => {
    setMessages([]);
  }, [language]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    // Add user message
    const newUserMessage: Message = {
      type: 'user',
      content: messageText,
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://lo0it0ghy2.execute-api.us-east-1.amazonaws.com/Prod';

      const response = await fetch(`${apiEndpoint}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          language: language,
          conversationHistory: messages.map(m => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content
          }))
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform citations from API format to UI format
      const citations = data.citations?.map((c: { source: string; snippet: string }) => ({
        text: c.source.split('/').pop() || 'Source Document',
        url: c.source
      })) || [];

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'assistant',
        content: data.message,
        citations: citations.length > 0 ? citations : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      refreshHistoryAfterSend();
    } catch (error) {
      console.error('Error calling chat API:', error);
      // Fallback to error message
      const errorMessage: Message = {
        type: 'assistant',
        content: language === 'es'
          ? 'Lo siento, hubo un error al procesar su solicitud. Por favor, intente de nuevo.'
          : 'Sorry, there was an error processing your request. Please try again.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputText('');
    setIsTyping(false);
    if (onNewChat) {
      onNewChat();
    }
  };

  const handleRegenerate = async (messageIndex: number) => {
    // Find the user message that prompted this response
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.type === 'user') {
        // Remove the old response and regenerate
        const newMessages = messages.slice(0, messageIndex);
        setMessages(newMessages);
        setIsTyping(true);

        try {
          const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://lo0it0ghy2.execute-api.us-east-1.amazonaws.com/Prod';

          const response = await fetch(`${apiEndpoint}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: userMessage.content,
              language: language,
              conversationHistory: newMessages.slice(0, -1).map(m => ({
                role: m.type === 'user' ? 'user' : 'assistant',
                content: m.content
              }))
            }),
          });

          const data = await response.json();

          if (data.error) {
            throw new Error(data.error);
          }

          const citations = data.citations?.map((c: { source: string; snippet: string }) => ({
            text: c.source.split('/').pop() || 'Source Document',
            url: c.source
          })) || [];

          const assistantMessage: Message = {
            type: 'assistant',
            content: data.message,
            citations: citations.length > 0 ? citations : undefined,
          };

          setMessages([...newMessages, assistantMessage]);
        } catch (error) {
          console.error('Error regenerating response:', error);
          const errorMessage: Message = {
            type: 'assistant',
            content: language === 'es'
              ? 'Lo siento, hubo un error al procesar su solicitud. Por favor, intente de nuevo.'
              : 'Sorry, there was an error processing your request. Please try again.',
          };
          setMessages([...newMessages, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }
    }
  };

  const handleFileUpload = (type: string) => {
    // Placeholder for file upload functionality
    console.log(`Upload ${type} clicked`);
    setShowUploadMenu(false);
    // In a real implementation, this would trigger a file picker
  };

  const uploadOptions = [
    { 
      icon: Paperclip, 
      label: language === 'en' ? 'Upload PDF' : 'Subir PDF', 
      type: 'pdf' 
    },
    { 
      icon: Paperclip, 
      label: language === 'en' ? 'Upload Document' : 'Subir Documento', 
      type: 'doc' 
    },
    { 
      icon: Paperclip, 
      label: language === 'en' ? 'Upload Image' : 'Subir Imagen', 
      type: 'image' 
    },
    { 
      icon: Paperclip, 
      label: language === 'en' ? 'Upload from Drive' : 'Subir desde Drive', 
      type: 'drive' 
    },
  ];

  return (
    <div className="size-full flex overflow-hidden relative bg-gradient-to-br from-[#FFF9F5] via-[#FFF5ED] to-[#FFEDE0]">
      {/* History Sidebar */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 h-full border-r border-gray-200/50 bg-white/60 backdrop-blur-sm flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50">
              <h3 className="text-sm font-medium text-[#004165]">
                {language === 'es' ? 'Historial' : 'History'}
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-[#2A6EBB] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversationHistory.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8 px-4">
                  {language === 'es' ? 'Sin conversaciones aún' : 'No conversations yet'}
                </p>
              ) : (
                conversationHistory.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => loadConversation(conv)}
                    className="w-full text-left px-4 py-3 hover:bg-[#E3EEF8]/50 transition-colors border-b border-gray-100 last:border-b-0 group"
                  >
                    <p className="text-sm text-[#004165] truncate group-hover:text-[#2A6EBB] transition-colors">
                      {conv.userMessage}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatRelativeTime(conv.timestamp)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sidebar toggle when hidden */}
        {!showHistory && (
          <button
            onClick={() => setShowHistory(true)}
            className="absolute left-2 top-2 z-10 p-2 rounded-lg bg-white/80 border border-gray-200/50 hover:bg-white text-gray-500 hover:text-[#2A6EBB] transition-colors shadow-sm"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8 overflow-hidden">
        {/* Title Section - Only show when no messages or just initial message */}
        {messages.length === 0 && (
          <div className="text-center mb-8">
            <h1 className="text-4xl text-[#004165] mb-3">
              {t.title}
            </h1>
          </div>
        )}

        {/* Suggested Prompts - Show as cards when no conversation started */}
        {messages.length === 0 && (
          <div className="grid grid-cols-2 gap-4 max-w-4xl w-full">
            {t.prompts.map((prompt, index) => {
              const Icon = promptIcons[index];
              return (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="p-6 rounded-xl backdrop-blur-sm bg-white border border-[#ff7900]/30 shadow-md hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#E3EEF8] group-hover:bg-[#A7C1E3] transition-colors">
                      <Icon className="w-5 h-5 text-[#2A6EBB]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[#004165] mb-1">{prompt}</h3>
                      <p className="text-sm text-[#004165]/70">
                        {t.promptDescriptions[index]}
                      </p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Messages Container */}
        {messages.length > 0 && (
          <div className="flex-1 w-full max-w-4xl overflow-y-auto mb-4 space-y-4 px-2">
            {messages.map((message, index) => (
              <div key={index}>
                <ChatMessage
                  type={message.type}
                  content={message.content}
                  citations={message.citations}
                  onRegenerate={() => handleRegenerate(index)}
                  messageId={message.id}
                />
                {/* Show follow-up suggestions after assistant messages (but not after typing indicator) */}
                {message.type === 'assistant' && index === messages.length - 1 && !isTyping && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {followUpSuggestions[language].slice(0, 3).map((suggestion, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestedPrompt(suggestion)}
                        className="px-4 py-2 rounded-full bg-white border border-[#2A6EBB]/30 text-[#004165] text-sm hover:bg-[#E3EEF8] hover:border-[#2A6EBB] transition-all shadow-sm"
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="px-8 pb-6">
        <div className="max-w-4xl mx-auto space-y-3 relative">
          {/* Upload Menu */}
          <AnimatePresence>
            {showUploadMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 mb-2 ml-6 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-10"
              >
                <div className="py-2">
                  {uploadOptions.map((option, index) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.type}
                        onClick={() => handleFileUpload(option.type)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#004165] hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-[#E3EEF8]">
                          <Icon className="w-4 h-4 text-[#2A6EBB]" />
                        </div>
                        <span className="text-sm whitespace-nowrap">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3 items-center bg-white rounded-2xl shadow-sm border border-orange-200/30 px-6 py-4">
            {/* Plus Button for Upload Menu */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadMenu(!showUploadMenu)}
              className={`p-2 rounded-lg transition-colors ${
                showUploadMenu
                  ? 'bg-[#ff7900] text-white'
                  : 'bg-gray-100 text-[#004165] hover:bg-gray-200'
              }`}
              title={language === 'en' ? 'Attach file' : 'Adjuntar archivo'}
            >
              <Plus className="w-5 h-5" />
            </motion.button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent text-[#004165] placeholder:text-[#004165]/50 focus:outline-none"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSendMessage()}
              className="p-3 rounded-xl bg-[#ff7900] text-white hover:bg-[#FC9F24] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              disabled={!inputText.trim()}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      </div>
      {/* End Main Chat Area */}
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<ViewType>('dashboard'); // Changed from 'chat' to 'dashboard'
  const [language, setLanguage] = useState<'en' | 'es'>('en');
  const [chatKey, setChatKey] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleNewChat = () => {
    setChatKey(prev => prev + 1);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setView('dashboard'); // Reset to dashboard
    setShowUserMenu(false);
  };

  const handleViewChange = (newView: ViewType) => {
    if (newView === 'chat') {
      // Reset chat to homepage when switching to chat view
      setChatKey(prev => prev + 1);
    }
    setView(newView);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="size-full flex flex-col overflow-hidden">
      {/* Unified Header */}
      <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <img src={chimesLogo} alt="Chimes" className="h-14" />
        </div>
        
        {/* Center Toggle */}
        <div className="absolute left-1/2 -translate-x-1/2 inline-flex items-center bg-gray-100 rounded-lg p-1">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleViewChange('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              view === 'chat'
                ? 'bg-white text-[#2A6EBB] shadow-sm'
                : 'text-[#004165] hover:text-[#2A6EBB]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Chat</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleViewChange('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
              view === 'dashboard'
                ? 'bg-white text-[#2A6EBB] shadow-sm'
                : 'text-[#004165] hover:text-[#2A6EBB]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm">Dashboard</span>
          </motion.button>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          {view === 'chat' && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewChat}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E3EEF8] hover:bg-[#A7C1E3] text-[#004165] transition-colors shadow-sm"
                title={language === 'en' ? 'New Chat' : 'Nueva Conversación'}
              >
                <MessageSquarePlus className="w-5 h-5" />
              </motion.button>
              <LanguageToggle language={language} onChange={setLanguage} />
            </>
          )}
          
          {/* User Avatar & Menu */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-full bg-gradient-to-br from-[#2A6EBB] to-[#5A245A] text-white shadow-md hover:shadow-lg transition-all"
              title="User Menu"
            >
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
                >
                  {/* User Info Section */}
                  <div className="px-4 py-3 bg-gradient-to-br from-[#E3EEF8] to-[#F5E6FF] border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A6EBB] to-[#5A245A] flex items-center justify-center text-white">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#004165] truncate">Admin User</p>
                        <p className="text-xs text-[#004165]/60 truncate">admin@chimes.org</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to profile - placeholder
                        console.log('Navigate to profile');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#004165] hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#2A6EBB]" />
                      <span className="text-sm">My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to settings - placeholder
                        console.log('Navigate to settings');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#004165] hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#2A6EBB]" />
                      <span className="text-sm">Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        // Navigate to help - placeholder
                        console.log('Navigate to help');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#004165] hover:bg-gray-50 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#2A6EBB]" />
                      <span className="text-sm">Help & Support</span>
                    </button>
                  </div>

                  {/* Logout Section */}
                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'chat' ? (
          <ChatInterface key={chatKey} language={language} setLanguage={setLanguage} onNewChat={handleNewChat} />
        ) : (
          <AdminDashboard />
        )}
      </div>
    </div>
  );
}