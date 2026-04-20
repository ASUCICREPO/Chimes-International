const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE || 'kb-conversations';

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
    const result = await dynamodb.send(new ScanCommand({ TableName: CONVERSATIONS_TABLE }));
    const conversations = result.Items || [];

    // Sort by timestamp descending and take last 10
    const recent = conversations
      .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
      .slice(0, 10)
      .map(conv => ({
        conversationId: conv.conversationId,
        userMessage: conv.userMessage,
        assistantMessage: conv.assistantMessage,
        timestamp: conv.timestamp,
        language: conv.language || 'en'
      }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(recent)
    };

  } catch (error) {
    console.error('Error fetching conversations:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to fetch conversations' })
    };
  }
};
