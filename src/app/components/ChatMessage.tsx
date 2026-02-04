import { ThumbsUp, ThumbsDown, ExternalLink, ChevronDown, ChevronUp, RotateCw, Copy, Bot, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface Citation {
  text: string;
  url: string;
}

interface ChatMessageProps {
  type: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  onRegenerate?: () => void;
  messageId?: string;
}

export function ChatMessage({ type, content, citations, onRegenerate, messageId }: ChatMessageProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [showSources, setShowSources] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = async (rating: 'up' | 'down') => {
    const newFeedback = feedback === rating ? null : rating;
    setFeedback(newFeedback);

    // Send feedback to API (will be implemented when backend is ready)
    if (newFeedback && messageId) {
      try {
        const apiEndpoint = import.meta.env.VITE_API_ENDPOINT || 'https://lo0it0ghy2.execute-api.us-east-1.amazonaws.com/Prod';
        await fetch(`${apiEndpoint}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, rating: newFeedback, timestamp: Date.now() })
        });
      } catch (error) {
        console.error('Failed to send feedback:', error);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-3 ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {/* Bot Avatar - Left side for assistant */}
      {type === 'assistant' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A6EBB] to-[#5A245A] flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div className={`max-w-[75%] ${type === 'user' ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-6 py-4 ${
            type === 'user'
              ? 'bg-[#ff7900] text-white shadow-md'
              : 'backdrop-blur-sm bg-white/80 text-[#004165] border border-gray-200/50 shadow-sm'
          }`}
        >
          <p className="leading-relaxed">{content}</p>
        </div>

        {/* Sources Button - Only for assistant messages with citations */}
        {type === 'assistant' && citations && citations.length > 0 && (
          <div className="mt-2">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/90 border border-gray-200 text-xs text-[#004165] hover:bg-white hover:border-gray-300 transition-colors"
            >
              <span className="font-medium">Sources ({citations.length})</span>
              {showSources ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </motion.button>

            {/* Citations List */}
            {showSources && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1"
              >
                {citations.map((citation, index) => (
                  <motion.a
                    key={index}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 text-xs text-[#004165] hover:bg-white hover:border-[#2A6EBB] hover:text-[#2A6EBB] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{citation.text}</span>
                  </motion.a>
                ))}
              </motion.div>
            )}
          </div>
        )}

        {/* Feedback and Action buttons for assistant messages */}
        {type === 'assistant' && (
          <div className="flex gap-2 mt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeedback('up')}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'up'
                  ? 'bg-[#ff7900]/15 border border-[#ff7900] text-[#ff7900]'
                  : 'bg-white/90 border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300'
              }`}
              title="Good response"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeedback('down')}
              className={`p-1.5 rounded-lg transition-colors ${
                feedback === 'down'
                  ? 'bg-[#ff7900]/15 border border-[#ff7900] text-[#ff7900]'
                  : 'bg-white/90 border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300'
              }`}
              title="Bad response"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRegenerate}
              className="p-1.5 rounded-lg transition-colors bg-white/90 border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300"
              title="Regenerate response"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className={`p-1.5 rounded-lg transition-colors ${
                copied
                  ? 'bg-[#ff7900]/15 border border-[#ff7900] text-[#ff7900]'
                  : 'bg-white/90 border border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300'
              }`}
              title={copied ? 'Copied!' : 'Copy response'}
            >
              <Copy className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        )}
      </div>

      {/* User Avatar - Right side for user */}
      {type === 'user' && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ff7900] to-[#FC9F24] flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      )}
    </motion.div>
  );
}