import { MessageSquare, Send, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'support' | 'user';
  text: string;
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'support',
      text: 'আসসালামু আলাইকুম! Welcome to E-shop. Looking for a gadget not listed here, or need delivery help?',
    },
  ]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };

    let reply =
      'Thanks for reaching out! Cash on Delivery is available across Bangladesh (1–3 days). You can also message the E-shop Facebook page for custom product requests.';
    if (trimmed.toLowerCase().includes('delivery') || trimmed.toLowerCase().includes('charge')) {
      reply = 'Delivery charge is ৳60 inside Dhaka and ৳120 outside Dhaka with Cash on Delivery.';
    } else if (trimmed.toLowerCase().includes('warranty') || trimmed.toLowerCase().includes('return')) {
      reply = 'All E-shop gadgets include 7-day replacement warranty for manufacturing defects.';
    }

    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: `s-${Date.now() + 1}`, sender: 'support', text: reply },
    ]);
    setInput('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="E-shop live support"
          className="fixed right-4 bottom-[158px] md:bottom-24 z-40 w-[min(calc(100vw-32px),360px)] bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col"
        >
          <div className="bg-[#171717] text-white px-4 py-3.5 flex items-center justify-between">
            <div>
              <div className="font-display font-bold text-sm">E-shop Support</div>
              <div className="text-[11px] text-neutral-300">Fast reply · Gadget Desk</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close support chat"
              className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3.5 space-y-2.5 max-h-64 overflow-y-auto bg-neutral-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs sm:text-[13px] rounded-2xl px-3.5 py-2.5 max-w-[85%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'ml-auto bg-[#171717] text-white'
                    : 'bg-white border border-neutral-200 text-[#171717]'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="px-3 pt-2 pb-1 bg-white flex flex-wrap gap-1.5 border-t border-neutral-100">
            {['Delivery charge?', 'Warranty policy?'].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
              >
                {q}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-3 bg-white flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a product..."
              className="flex-1 h-10 px-3 rounded-xl border border-neutral-200 focus:border-[#12a800] outline-none text-xs sm:text-sm"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-[#08ae50] hover:bg-[#079645] text-white flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open customer support chat"
        className="fixed right-4 sm:right-6 bottom-[84px] md:bottom-6 z-40 w-14 h-14 rounded-full bg-[#08ae50] hover:bg-[#069946] text-white shadow-[0_6px_20px_rgba(8,174,80,0.35)] flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
      >
        {open ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </>
  );
}
