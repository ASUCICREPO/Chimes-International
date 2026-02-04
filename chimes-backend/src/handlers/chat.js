const { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } = require('@aws-sdk/client-bedrock-agent-runtime');

const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID;
const AWS_REGION = 'us-east-1';

const bedrockAgent = new BedrockAgentRuntimeClient({ region: AWS_REGION });

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

    if (!message) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    // System prompt for better responses
    const systemPrompt = language === 'es'
      ? `Eres un asistente amigable y profesional para empleados de Chimes.
Responde completamente en español.
- Sé conversacional y cálido en tu tono
- Usa párrafos claros, no listas largas de viñetas
- Sé conciso pero completo
- Si mencionas políticas específicas, explícalas claramente
- Termina con una oferta de ayuda adicional si es apropiado`
      : `You are a friendly, professional assistant for Chimes employees.
- Be conversational and warm in your tone
- Use clear paragraphs, not long bullet lists
- Be concise but thorough
- If mentioning specific policies, explain them clearly
- End with an offer to help further if appropriate`;

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
          modelArn: `arn:aws:bedrock:${AWS_REGION}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`
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
