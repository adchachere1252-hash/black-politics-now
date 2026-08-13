import { AIChatBox, type Message } from "@/components/AIChatBox";
import { trpc } from "@/lib/trpc";
import { BookOpen, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";

const PROMPTS = [
  "What is Black Politics Now tracking in the 2026 Senate races?",
  "Explain the current Black Representation tracker.",
  "What does the Historical Atlas show about voting rights?",
  "Which World Elections are coming up next?",
];

export default function ResearchDesk() {
  const [messages, setMessages] = useState<Message[]>([]);
  const chat = trpc.agent.chat.useMutation({
    onSuccess: (result) => {
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    },
    onError: () => {
      setMessages((current) => [...current, {
        role: "assistant",
        content: "I could not complete that research request right now. Please try again, or explore the Election Map, Historical Atlas, World Elections, or Daily Brief directly.",
      }]);
    },
  });

  const handleSend = (question: string) => {
    const history = messages
      .filter((message) => message.role === "user" || message.role === "assistant")
      .slice(-6)
      .map((message) => ({ role: message.role as "user" | "assistant", content: message.content }));
    setMessages((current) => [...current, { role: "user", content: question }]);
    chat.mutate({ question, history });
  };

  return (
    <div className="container py-8 lg:py-12">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
        <section>
          <div className="mb-6 max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Sparkles size={17} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Black Politics Now Research Desk</span>
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Ask better questions.</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              A source-grounded guide to the platform’s election coverage, Black Representation tracker, Voting Rights Act context, Daily Intelligence Brief, and World Elections calendar.
            </p>
          </div>
          <AIChatBox
            messages={messages}
            onSendMessage={handleSend}
            isLoading={chat.isPending}
            height="min(650px, 68vh)"
            placeholder="Ask about the platform’s reporting and election intelligence..."
            emptyStateMessage="Start with a question about the information Black Politics Now is tracking."
            suggestedPrompts={PROMPTS}
            className="border-primary/20 shadow-xl shadow-primary/5"
          />
        </section>

        <aside className="space-y-4 lg:pt-[3.15rem]">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <ShieldCheck className="mb-3 text-primary" size={24} />
            <h2 className="font-semibold">Research, not spin.</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Answers use Black Politics Now’s tracked records and reporting context. When the platform record is incomplete, the desk says so rather than guessing.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <BookOpen className="mb-3 text-primary" size={22} />
            <h2 className="font-semibold">What it can help with</h2>
            <ul className="mt-3 space-y-2 text-sm leading-5 text-muted-foreground">
              <li>Election race context and ratings</li>
              <li>Black political representation</li>
              <li>Voting rights and redistricting history</li>
              <li>Daily Brief and world-election context</li>
            </ul>
          </div>
          <p className="px-1 text-xs leading-5 text-muted-foreground">
            The desk does not provide personalized voting advice, invent sources, or change platform records. Editorial and data improvements remain subject to human review.
          </p>
        </aside>
      </div>
    </div>
  );
}
