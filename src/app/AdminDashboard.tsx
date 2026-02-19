import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  MessageSquare, 
  BookOpen, 
  BarChart3, 
  Settings, 
  Search,
  Filter,
  Download,
  User,
  ChevronDown,
  TrendingUp,
  Users,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
const chimesLogo = '/chimes-logo.svg';

type TabType = 'dashboard' | 'conversations' | 'faqs' | 'analytics' | 'settings';

interface ConversationLog {
  id: string;
  date: string;
  userRole: string;
  topic: string;
  feedback: 'positive' | 'negative' | 'none';
  language: 'EN' | 'ES';
}

interface AnalyticsData {
  totalConversations: number;
  positiveFeedback: number;
  negativeFeedback: number;
  conversationTrend: Array<{ date: string; conversations: number }>;
  languageDistribution: Array<{ name: string; value: number }>;
  topicDistribution: Array<{ name: string; value: number }>;
  recentConversations: Array<{
    id: string;
    date: string;
    topic: string;
    language: string;
    userMessage: string;
    assistantMessage: string;
    feedback: string;
  }>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLanguage, setFilterLanguage] = useState<'all' | 'EN' | 'ES'>('all');
  const [filterFeedback, setFilterFeedback] = useState<'all' | 'positive' | 'negative' | 'none'>('all');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://lo0it0ghy2.execute-api.us-east-1.amazonaws.com/Prod';
      const response = await fetch(`${apiEndpoint}/analytics`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: AnalyticsData = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Derived values with safe defaults
  const summaryStats = {
    totalConversations: analyticsData?.totalConversations ?? 0,
    positiveFeedback: analyticsData?.positiveFeedback ?? 0,
    negativeFeedback: analyticsData?.negativeFeedback ?? 0,
  };

  const totalFeedback = summaryStats.positiveFeedback + summaryStats.negativeFeedback;
  const satisfactionRate = totalFeedback > 0
    ? ((summaryStats.positiveFeedback / totalFeedback) * 100).toFixed(1)
    : '0.0';
  const negativeRate = totalFeedback > 0
    ? ((summaryStats.negativeFeedback / totalFeedback) * 100).toFixed(1)
    : '0.0';

  const conversationTrend = analyticsData?.conversationTrend ?? [];
  const topicDistribution = analyticsData?.topicDistribution ?? [];
  const languageDistribution = analyticsData?.languageDistribution ?? [];

  const conversationLogs: ConversationLog[] = (analyticsData?.recentConversations ?? []).map(conv => ({
    id: conv.id,
    date: conv.date,
    userRole: 'Employee',
    topic: conv.topic,
    feedback: conv.feedback as 'positive' | 'negative' | 'none',
    language: conv.language as 'EN' | 'ES',
  }));

  const COLORS = ['#2A6EBB', '#ff7900', '#5A245A', '#A7C1E3'];

  const filteredLogs = conversationLogs.filter((log) => {
    const matchesLanguage = filterLanguage === 'all' || log.language === filterLanguage;
    const matchesFeedback = filterFeedback === 'all' || log.feedback === filterFeedback;
    const matchesSearch = searchQuery === '' || 
      log.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLanguage && matchesFeedback && matchesSearch;
  });

  const navigationItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Overview' },
    { id: 'conversations', icon: MessageSquare, label: 'Conversation Logs' },
    { id: 'faqs', icon: BookOpen, label: 'FAQs & Knowledge' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <div className="size-full flex overflow-hidden bg-gradient-to-br from-[#E3EEF8] via-[#F5E6FF] to-[#FFE6D9] relative">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-[#A7C1E3] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#FFB380] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#D4B3E3] rounded-full blur-3xl"
        />
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-64 bg-white/60 backdrop-blur-xl border-r border-white/50 flex-shrink-0 relative z-10"
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg text-[#004165]">Admin Panel</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-[#004165]"
                title="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                      isActive
                        ? 'bg-[#E3EEF8] text-[#2A6EBB]'
                        : 'text-[#004165] hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hamburger button when sidebar is closed */}
        {!sidebarOpen && (
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 text-[#004165]"
              title="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-[#004165] mb-1">Dashboard Overview</h2>
                  <p className="text-sm text-[#004165]/70">Monitor key metrics and system performance</p>
                </div>
                <button
                  onClick={fetchAnalytics}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#E3EEF8] text-[#2A6EBB] rounded-lg hover:bg-[#A7C1E3] transition-colors text-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {loading && (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-[#2A6EBB] animate-spin" />
                  <span className="ml-3 text-[#004165]/70">Loading dashboard data...</span>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 bg-[#2A6EBB] text-white rounded-lg hover:bg-[#004165] transition-colors text-sm"
                  >
                    Retry
                  </button>
                </div>
              )}

              {!loading && !error && <>
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#004165]/70 mb-1">Total Conversations</p>
                      <p className="text-3xl text-[#004165]">{summaryStats.totalConversations}</p>
                    </div>
                    <div className="p-3 bg-[#E3EEF8] rounded-lg">
                      <MessageCircle className="w-5 h-5 text-[#2A6EBB]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#004165]/70 mb-1">Total Feedback</p>
                      <p className="text-3xl text-[#004165]">{totalFeedback}</p>
                    </div>
                    <div className="p-3 bg-[#E3EEF8] rounded-lg">
                      <Users className="w-5 h-5 text-[#2A6EBB]" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#004165]/70 mb-1">Positive Feedback</p>
                      <p className="text-3xl text-[#004165]">{summaryStats.positiveFeedback}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <ThumbsUp className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-xs text-[#004165]/70">
                    <span>{satisfactionRate}% satisfaction rate</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-[#004165]/70 mb-1">Negative Feedback</p>
                      <p className="text-3xl text-[#004165]">{summaryStats.negativeFeedback}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <ThumbsDown className="w-5 h-5 text-red-600" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-xs text-[#004165]/70">
                    <span>{negativeRate}% of total feedback</span>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg text-[#004165] mb-4">Conversation Trend</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={conversationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="conversations" stroke="#2A6EBB" strokeWidth={2} dot={{ fill: '#2A6EBB', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg text-[#004165] mb-4">Top Topics</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topicDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2A6EBB" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              </>}
            </div>
          )}

          {/* Conversation Logs */}
          {activeTab === 'conversations' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl text-[#004165] mb-1">Conversation Logs</h2>
                <p className="text-sm text-[#004165]/70">Review all user interactions and feedback</p>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004165]/50" />
                    <input
                      type="text"
                      placeholder="Search by topic or user role..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-[#004165] placeholder:text-[#004165]/50 focus:outline-none focus:border-[#2A6EBB]"
                    />
                  </div>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-[#004165] focus:outline-none focus:border-[#2A6EBB]"
                  >
                    <option value="all">All Languages</option>
                    <option value="EN">English</option>
                    <option value="ES">Spanish</option>
                  </select>
                  <select
                    value={filterFeedback}
                    onChange={(e) => setFilterFeedback(e.target.value as any)}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-[#004165] focus:outline-none focus:border-[#2A6EBB]"
                  >
                    <option value="all">All Feedback</option>
                    <option value="positive">Positive</option>
                    <option value="negative">Negative</option>
                    <option value="none">No Feedback</option>
                  </select>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#E3EEF8] text-[#2A6EBB] rounded-lg hover:bg-[#A7C1E3] transition-colors text-sm">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs text-[#004165]/70 uppercase tracking-wider">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs text-[#004165]/70 uppercase tracking-wider">User Role</th>
                      <th className="px-6 py-3 text-left text-xs text-[#004165]/70 uppercase tracking-wider">Topic</th>
                      <th className="px-6 py-3 text-left text-xs text-[#004165]/70 uppercase tracking-wider">Feedback</th>
                      <th className="px-6 py-3 text-left text-xs text-[#004165]/70 uppercase tracking-wider">Language</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-[#004165]">{log.date}</td>
                        <td className="px-6 py-4 text-sm text-[#004165]">{log.userRole}</td>
                        <td className="px-6 py-4 text-sm text-[#004165]">{log.topic}</td>
                        <td className="px-6 py-4">
                          {log.feedback === 'positive' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                              <ThumbsUp className="w-3 h-3" />
                              Positive
                            </span>
                          )}
                          {log.feedback === 'negative' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs">
                              <ThumbsDown className="w-3 h-3" />
                              Negative
                            </span>
                          )}
                          {log.feedback === 'none' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                              No feedback
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-[#E3EEF8] text-[#2A6EBB] rounded text-xs">
                            {log.language}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl text-[#004165] mb-1">Analytics</h2>
                <p className="text-sm text-[#004165]/70">Detailed insights and performance metrics</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg text-[#004165] mb-4">Topic Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topicDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {topicDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg text-[#004165] mb-4">Language Preference</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={languageDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {languageDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#2A6EBB' : '#ff7900'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm col-span-2">
                  <h3 className="text-lg text-[#004165] mb-4">7-Day Conversation Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={conversationTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="conversations" stroke="#2A6EBB" strokeWidth={3} dot={{ fill: '#2A6EBB', r: 5 }} name="Conversations" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* FAQs & Knowledge */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-[#004165] mb-1">FAQs & Knowledge Content</h2>
                  <p className="text-sm text-[#004165]/70">Manage knowledge base and frequently asked questions</p>
                </div>
                <button className="px-4 py-2 bg-[#ff7900] text-white rounded-lg hover:bg-[#FC9F24] transition-colors text-sm">
                  Add New FAQ
                </button>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#004165]/50" />
                    <input
                      type="text"
                      placeholder="Search knowledge base..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-[#004165] placeholder:text-[#004165]/50 focus:outline-none focus:border-[#2A6EBB]"
                    />
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {['Benefits & PTO Policy', 'IT Support Procedures', 'Training Requirements', 'Employee Handbook Guidelines'].map((item, index) => (
                    <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-[#004165] mb-1">{item}</h3>
                          <p className="text-sm text-[#004165]/70">Last updated: Dec 28, 2025</p>
                        </div>
                        <button className="text-sm text-[#2A6EBB] hover:text-[#004165]">Edit</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl text-[#004165] mb-1">Settings</h2>
                <p className="text-sm text-[#004165]/70">Configure system preferences and options</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-[#004165] mb-3">General Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#004165]">Enable automatic responses</p>
                        <p className="text-xs text-[#004165]/70">AI will automatically suggest responses</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A6EBB]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#004165]">Multi-language support</p>
                        <p className="text-xs text-[#004165]/70">Allow users to switch between EN/ES</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A6EBB]"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-[#004165] mb-3">Notification Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#004165]">Email notifications</p>
                        <p className="text-xs text-[#004165]/70">Receive alerts for negative feedback</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A6EBB]"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <button className="px-6 py-2 bg-[#ff7900] text-white rounded-lg hover:bg-[#FC9F24] transition-colors text-sm">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}