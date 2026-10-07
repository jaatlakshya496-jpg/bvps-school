import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, Loader2, MessageCircle, Phone, RotateCcw, Send, Sparkles, X } from "lucide-react";
import campusImage from "@assets/bal-vikas-public-school-kalayat-kaithal-schools-3t6w6qk_1784611430223.webp";
import studentsImage from "@assets/Screenshot_20260721_101418_1784611875385.webp";
import facilitiesImage from "@assets/Screenshot_20260721_100254_1784611512184.webp";
import { getLocalAnswer } from "@/lib/school-kb";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  images?: ChatImage[];
  offline?: boolean;
  action?: { label: string; path: string };
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

// Render ka free service idle ke baad so jata hai, aur cold start me 30-60
// second lag sakte hain — isliye timeout generous rakha hai aur request
// fail hone par ek baar automatic retry hota hai.
const REQUEST_TIMEOUT_MS = 45_000;
const RETRY_DELAY_MS = 1_500;
const OFFICE_PHONE = "+91 98125 50200";

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Namaste! Welcome to Bal Vikas Public School, Kalayat. I’m the school assistant—ask me about admissions, fees, timings, facilities, or how to contact the office.",
};

const QUICK_PROMPTS = [
  "Are admissions open?",
  "What are the school timings?",
  "Fees for Class 5?",
  "Contact number?",
];

const OFFLINE_NOTICE =
  "Note: main abhi school server se connect nahi ho paya, isliye ye answer website ke saved information se diya hai. Exact jaanch ke liye office ko call karein.";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type ChatResult = { reply: string; imageIds: string[] };

async function callChatApi(message: string, history: ChatMessage[]): Promise<ChatResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        history: history
          .slice(-12)
          .map(({ role, content }) => ({ role, content })),
      }),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      reply?: string;
      message?: string;
      error?: string;
      imageIds?: string[];
    };

    if (!response.ok || !(payload.reply || payload.message)) {
      throw new Error(payload.error || `Chat request failed (${response.status})`);
    }

    return {
      reply: (payload.reply || payload.message || "").trim(),
      imageIds: payload.imageIds ?? [],
    };
  } finally {
    clearTimeout(timer);
  }
}

async function askAssistant(message: string, history: ChatMessage[]): Promise<ChatResult> {
  if (!API_BASE_URL) throw new Error("API base URL missing");
  try {
    return await callChatApi(message, history);
  } catch (firstError) {
    // Ek baar retry — zyadatar tar Render ka cold start hi reason hota hai.
    await sleep(RETRY_DELAY_MS);
    try {
      return await callChatApi(message, history);
    } catch {
      throw firstError;
    }
  }
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastFailed, setLastFailed] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Render ke free service ko jaag rakhte hain — page load par hi ek silent
  // ping, taaki user ke puchhne se pehle service na soyi.
  const warmUp = useCallback(() => {
    if (!API_BASE_URL) return;
    try {
      void fetch(`${API_BASE_URL}/health`, { mode: "no-cors" }).catch(() => undefined);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    warmUp();
  }, [warmUp]);

  useEffect(() => {
    if (isOpen) warmUp();
  }, [isOpen, warmUp]);

  const sendMessage = useCallback(
    async (value = input) => {
      const content = value.trim();
      if (!content || isLoading) return;

      const userMessage: ChatMessage = { role: "user", content };
      const history = messages.slice(-12);
      setMessages((current) => [...current, userMessage]);
      setInput("");
      setIsLoading(true);
      setLastFailed("");

      const pushImages = (ids: string[]) =>
        ids.map((imageId) => IMAGE_LIBRARY[imageId]).filter((image): image is ChatImage => Boolean(image));

      try {
        warmUp();
        const result = await askAssistant(content, history);
        if (!result.reply) throw new Error("Empty reply");
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: result.reply,
            images: pushImages(result.imageIds),
          },
        ]);
      } catch {
        // Server se connect nahi ho paya — website ke saved school information
        // se jawab de do, taaki assistant k kabhi dead-end na lage.
        const local = getLocalAnswer(content);
        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content: `${local.text}\n\n${OFFLINE_NOTICE}`,
            images: pushImages(local.images ?? []),
            offline: true,
            action: local.link,
          },
        ]);
        setLastFailed(content);
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading, messages, warmUp],
  );

  const retryLast = useCallback(() => {
    if (!lastFailed) return;
    const text = lastFailed;
    setLastFailed("");
    // failed user message hata kar dobara bhejte hain (double na dikhe)
    setMessages((current) => {
      const trimmed = [...current];
      const lastUserIndex = trimmed.map((m) => m.role).lastIndexOf("user");
      if (lastUserIndex >= 0 && trimmed[lastUserIndex]?.content === text) trimmed.splice(lastUserIndex, 1);
      return trimmed;
    });
    window.setTimeout(() => void sendMessage(text), 0);
  }, [lastFailed, sendMessage]);

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
          className="fixed inset-x-3 bottom-[5.5rem] left-3 z-[60] flex h-[min(620px,calc(100dvh-9rem))] max-h-[calc(100dvh-9rem)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:inset-x-auto sm:left-5 sm:w-[380px]"
          aria-label="BVPS school assistant"
        >
          <header className="flex items-center justify-between gap-2 bg-primary px-4 py-3.5 text-white sm:px-5 sm:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary shadow-sm">
                <Bot className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-base font-bold leading-tight sm:text-lg">
                  BVPS Assistant
                </p>
                <p className="mt-0.5 truncate text-[11px] text-white/70 sm:text-xs">
                  Bal Vikas Public School, Kalayat
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="shrink-0 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close school assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto overscroll-contain bg-slate-50 px-3 py-4 sm:px-4 sm:py-5">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      message.role === "user"
                        ? "rounded-br-md bg-primary text-white"
                        : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <p className="whitespace-pre-line break-words">{message.content}</p>
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
                    {message.action && (
                      <a
                        href={message.action.path}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-secondary/15 px-3 py-2 text-xs font-bold text-primary transition-colors hover:bg-secondary/30"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {message.action.label}
                      </a>
                    )}
                    {message.offline && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={retryLast}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                        >
                          <RotateCcw className="h-3 w-3" /> Retry
                        </button>
                        <a
                          href={`tel:${OFFICE_PHONE}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                        >
                          <Phone className="h-3 w-3" /> Call office
                        </a>
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
            <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
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

            <div className="flex items-end gap-2 px-3 pb-3 sm:px-4 sm:pb-4">
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

      {/* Launcher — bottom LEFT corner (jaisa pehle tha) */}
      <div className="fixed bottom-5 left-4 z-[60] flex items-center gap-2 sm:left-5">
        {!isOpen && (
          <span className="hidden rounded-full bg-primary px-3 py-1.5 text-[11px] font-bold text-white shadow-md sm:block">
            Ask BVPS
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary shadow-xl shadow-secondary/30 transition-all hover:scale-105 hover:bg-secondary/90 focus:outline-none focus:ring-4 focus:ring-secondary/30"
          aria-label={isOpen ? "Close BVPS Assistant" : "Open BVPS Assistant"}
          aria-expanded={isOpen}
        >
          {!isOpen && (
            <span
              className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-secondary/40"
              aria-hidden="true"
            />
          )}
          {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        </button>
      </div>

      {!isOpen && (
        <a
          href={`tel:${OFFICE_PHONE}`}
          className="fixed bottom-[4.75rem] left-4 z-[59] hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-primary shadow-md sm:flex sm:left-5"
        >
          <Phone className="h-3 w-3 text-secondary" />
          Need help?
        </a>
      )}
    </>
  );
}
