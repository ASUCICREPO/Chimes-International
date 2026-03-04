const { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } = require('@aws-sdk/client-bedrock-agent-runtime');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID;
const AWS_REGION = 'us-east-1';
const CONVERSATIONS_TABLE = process.env.CONVERSATIONS_TABLE || 'chimes-conversations';

const bedrockAgent = new BedrockAgentRuntimeClient({ region: AWS_REGION });
const ddbClient = new DynamoDBClient({ region: AWS_REGION });
const dynamodb = DynamoDBDocumentClient.from(ddbClient);

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

  let language = 'en';

  try {
    const body = JSON.parse(event.body || '{}');
    language = body.language || 'en';
    const { message } = body;
    const requestedModel = body.model || 'amazon.nova-pro-v1:0';
    const modelArn = requestedModel.startsWith('arn:') ? requestedModel : `arn:aws:bedrock:${AWS_REGION}::foundation-model/${requestedModel}`;

    if (!message) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // System prompt for better responses
    const systemPrompt = language === 'es'
      ? `Eres el Compañero de Conocimiento de Chimes, un asistente útil para empleados de Chimes.
Responde completamente en español.

Reglas de formato:
- Responde la pregunta directamente en la primera oración. No repitas la pregunta ni uses frases como "¡Qué buena pregunta!"
- Mantén las respuestas cortas: 3-5 oraciones para preguntas simples. Solo elabora si la pregunta lo requiere.
- Usa formato markdown: **negrita** para información clave (nombres, fechas, contactos, plazos), viñetas para listas de 3+ elementos
- Mantén los párrafos a 2-3 oraciones máximo
- Si hay pasos a seguir, ponlos en una lista numerada clara
- Termina con UNA línea breve de seguimiento como "¿Necesitas más detalles sobre algún punto?" — no párrafos largos de despedida
- Nunca uses lenguaje legal o corporativo innecesario. Escribe como un compañero de trabajo amigable y conocedor.`
      : `You are the Chimes Knowledge Companion, a helpful assistant for Chimes employees.

Formatting rules:
- Answer the question directly in your first sentence. Do NOT repeat the question back or use filler like "Great question!" or "I'm glad you asked."
- Keep responses short: 3-5 sentences for simple questions. Only elaborate if the question genuinely requires detail.
- Use markdown formatting: **bold** for key info (names, dates, contacts, deadlines), bullet points for lists of 3+ items
- Keep paragraphs to 2-3 sentences max
- If there are action steps, use a clear numbered list
- End with ONE short follow-up line like "Need more details on any of this?" — not a long closing paragraph
- Never use unnecessary legal or corporate hedging language. Write like a friendly, knowledgeable coworker.`;

    const fullPrompt = `${systemPrompt}

Employee question: ${message}`;

    // Use RetrieveAndGenerate - KB handles both retrieval AND response generation
    const command = new RetrieveAndGenerateCommand({
      input: {
        text: fullPrompt
      },
      retrieveAndGenerateConfiguration: {
        type: 'KNOWLEDGE_BASE',
        knowledgeBaseConfiguration: {
          knowledgeBaseId: KNOWLEDGE_BASE_ID,
          modelArn: modelArn
        }
      }
    });

    console.log('Sending command to Bedrock KB:', KNOWLEDGE_BASE_ID);
    const response = await bedrockAgent.send(command);
    console.log('Bedrock response received:', JSON.stringify(response, null, 2));

    // Extract the response text
    const assistantMessage = response.output?.text || 'I apologize, but I was unable to generate a response.';

    // Extract citations from the response
    const citations = response.citations?.map((citation, idx) => {
      const ref = citation.retrievedReferences?.[0];
      return {
        id: idx + 1,
        source: ref?.location?.s3Location?.uri || 'Unknown source',
        snippet: ref?.content?.text?.substring(0, 200) + '...' || ''
      };
    }) || [];

    // Log conversation to DynamoDB (don't block the response on failure)
    try {
      const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await dynamodb.send(new PutCommand({
        TableName: CONVERSATIONS_TABLE,
        Item: {
          conversationId,
          timestamp: new Date().toISOString(),
          userMessage: message,
          assistantMessage,
          language,
          topic: 'General',
          createdAt: Date.now()
        }
      }));
    } catch (logError) {
      console.error('Failed to log conversation:', logError);
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        message: assistantMessage,
        citations: citations,
        language: language
      })
    };

  } catch (error) {
    console.error('Error processing chat request:', error);

    const errorMessage = language === 'es'
      ? 'Lo siento, hubo un error al procesar su solicitud. Por favor, intente de nuevo.'
      : 'Sorry, there was an error processing your request. Please try again.';

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
