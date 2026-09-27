import { useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Phone, Send, X } from "lucide-react";
import campusImage from "@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.webp";
import studentsImage from "@assets/Screenshot_20260721_101418_1784611875385.webp";
import facilitiesImage from "@assets/Screenshot_20260721_100254_1784611512184.webp";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  images?: ChatImage[];
};

type ChatImage = {
  src: string;
  alt: string;
};

const IMAGE_LIBRARY: Record<string, ChatImage> = {
  campus: {
    src: campusImage,
    alt: "Bal Vikas Public School campus in Kalayat",
  },
  students: {
    src: studentsImage,
    alt: "BVPS students and sports activities",
  },
  facilities: {
    src: facilitiesImage,
    alt: "BVPS smart classroom facility",
  },
};

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(
    /\/+$/,
    "",
  ) ?? "";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Namaste! Welcome to Bal Vikas Public School, Kalayat. I’m the school assistant—ask me about admissions, fees, timings, facilities, or how to contact the office.",
};

const QUICK_PROMPTS = [
  "Are admissions open?",
  "What are the school timings?",
  "How can I contact the school?",
  "What facilities are available?",
];

const FALLBACK_MESSAGE =
  "I’m sorry, the school assistant is temporarily unavailable. Please call the school office at +91 98125 50200 for help.";

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  async function sendMessage(value = input) {
    const content = value.trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content };
    const history = messages.slice(-12);
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        reply?: string;
        error?: string;
        imageIds?: string[];
      };

      if (!response.ok || !payload.reply) {
        throw new Error(payload.error || "Chat request failed");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: payload.reply!,
          images: (payload.imageIds ?? [])
            .map((imageId) => IMAGE_LIBRARY[imageId])
            .filter((image): image is ChatImage => Boolean(image)),
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: FALLBACK_MESSAGE },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <>
      {isOpen && (
        <section
          className="fixed inset-x-3 bottom-24 z-[60] flex h-[min(650px,calc(100dvh-7.5rem))] max-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:right-6 sm:w-[380px]"
          aria-label="BVPS school assistant"
        >
          <header className="flex items-center justify-between bg-primary px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="font-serif text-lg font-bold leading-tight">
                  BVPS Assistant
                </p>
                <p className="mt-0.5 text-xs text-white/70">
                  Bal Vikas Public School, Kalayat
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close school assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                    {message.images && message.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {message.images.map((image) => (
                          <img
                            key={image.src}
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            className="h-24 w-full rounded-xl object-cover"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"
                    aria-label="Assistant is typing"
                  >
                    <span>Typing</span>
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-secondary" />
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-slate-200 bg-white">
            <div className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void sendMessage(prompt)}
                  disabled={isLoading}
                  className="shrink-0 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-2 px-4 pb-4">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your question…"
                rows={1}
                maxLength={2000}
                className="max-h-24 min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                aria-label="Message for BVPS Assistant"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="fixed bottom-6 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary shadow-xl shadow-secondary/25 transition-all hover:scale-105 hover:bg-secondary/90 focus:outline-none focus:ring-4 focus:ring-secondary/30"
        aria-label={isOpen ? "Close BVPS Assistant" : "Open BVPS Assistant"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {!isOpen && (
        <a
          href="tel:+919812550200"
          className="fixed bottom-[4.55rem] right-5 z-[59] hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-primary shadow-md sm:flex"
        >
          <Phone className="h-3 w-3 text-secondary" />
          Need help?
        </a>
      )}
    </>
  );
}