"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Bot, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAdvisor } from "@/lib/api";

interface Message {
  role: "user" | "twin";
  text: string;
}

const OPENING: Message = {
  role: "twin",
  text: "I'm your financial twin. I know your income, spending, debts and goals — ask me anything about your money's future.",
};

const DEFAULT_SUGGESTIONS = [
  "Can I afford a Rp15,000,000 laptop?",
  "What happens if I save Rp500,000 more per month?",
  "Should I pay debt first or invest?",
];

export default function AdvisorPage() {
  const [messages, setMessages] = React.useState<Message[]>([OPENING]);
  const [input, setInput] = React.useState("");
  const [suggestions, setSuggestions] = React.useState(DEFAULT_SUGGESTIONS);
  const [busy, setBusy] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setBusy(true);
    try {
      const reply = await askAdvisor(message);
      setMessages((m) => [...m, { role: "twin", text: reply.reply }]);
      if (reply.suggestions?.length) setSuggestions(reply.suggestions);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-3xl flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={
              "flex gap-3 " + (message.role === "user" ? "flex-row-reverse" : "")
            }
          >
            <div
              className={
                "flex size-8 shrink-0 items-center justify-center rounded-full " +
                (message.role === "twin"
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white"
                  : "bg-muted text-muted-foreground")
              }
            >
              {message.role === "twin" ? (
                <Bot className="size-4" />
              ) : (
                <User className="size-4" />
              )}
            </div>
            <div
              className={
                "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed " +
                (message.role === "twin"
                  ? "rounded-tl-sm border bg-card"
                  : "rounded-tr-sm bg-primary text-primary-foreground")
              }
            >
              {message.text}
            </div>
          </motion.div>
        ))}

        {busy && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
              <Bot className="size-4" />
            </div>
            <div className="rounded-2xl rounded-tl-sm border bg-card px-4 py-3">
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                    style={{ animationDelay: `${i * 120}ms` }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="space-y-3 border-t pt-3">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => send(suggestion)}
              className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground cursor-pointer"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your twin about any financial decision…"
            aria-label="Message"
          />
          <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
