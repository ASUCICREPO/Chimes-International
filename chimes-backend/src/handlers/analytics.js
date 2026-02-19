const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE || 'chimes-conversations';
const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE || 'chimes-feedback';

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    // Scan both tables in parallel
    const [conversationsResult, feedbackResult] = await Promise.all([
      dynamodb.send(new ScanCommand({ TableName: CONVERSATIONS_TABLE })),
      dynamodb.send(new ScanCommand({ TableName: FEEDBACK_TABLE }))
    ]);

    const conversations = conversationsResult.Items || [];
    const feedbackItems = feedbackResult.Items || [];

    // Total conversations
    const totalConversations = conversations.length;

    // Feedback counts
    const positiveFeedback = feedbackItems.filter(f => f.rating === 'up').length;
    const negativeFeedback = feedbackItems.filter(f => f.rating === 'down').length;

    // Conversation trend (last 7 days)
    const now = new Date();
    const trendMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      trendMap[key] = 0;
    }

    conversations.forEach(conv => {
      if (conv.timestamp) {
        const dateKey = conv.timestamp.split('T')[0];
        if (trendMap.hasOwnProperty(dateKey)) {
          trendMap[dateKey]++;
        }
      }
    });

    const conversationTrend = Object.entries(trendMap).map(([date, count]) => {
      const d = new Date(date + 'T00:00:00');
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { date: label, conversations: count };
    });

    // Language distribution
    const languageCounts = { en: 0, es: 0 };
    conversations.forEach(conv => {
      const lang = (conv.language || 'en').toLowerCase();
      if (lang === 'es') languageCounts.es++;
      else languageCounts.en++;
    });

    const languageDistribution = [
      { name: 'English', value: languageCounts.en },
      { name: 'Spanish', value: languageCounts.es }
    ];

    // Topic distribution
    const topicCounts = {};
    conversations.forEach(conv => {
      const topic = conv.topic || 'General';
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    });

    const topicDistribution = Object.entries(topicCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    // Recent conversations (last 50, for logs tab)
    const recentConversations = conversations
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, 50)
      .map(conv => ({
        id: conv.conversationId,
        date: conv.timestamp,
        topic: conv.topic || 'General',
        language: (conv.language || 'en').toUpperCase(),
        userMessage: conv.userMessage,
        assistantMessage: conv.assistantMessage,
        feedback: 'none'
      }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        totalConversations,
        positiveFeedback,
        negativeFeedback,
        conversationTrend,
        languageDistribution,
        topicDistribution,
        recentConversations
      })
    };

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch analytics data' })
    };
  }
};
