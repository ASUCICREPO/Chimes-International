const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient({ region: 'us-east-1' });
const dynamodb = DynamoDBDocumentClient.from(client);

const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE || 'chimes-feedback';

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { messageId, rating, timestamp } = body;

    if (!messageId || !rating) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'messageId and rating are required' })
      };
    }

    // Save feedback to DynamoDB
    await dynamodb.send(new PutCommand({
      TableName: FEEDBACK_TABLE,
      Item: {
        messageId,
        rating,
        timestamp: timestamp || Date.now(),
        createdAt: new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true, message: 'Feedback recorded' })
    };

  } catch (error) {
    console.error('Error saving feedback:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to save feedback' })
    };
  }
};
