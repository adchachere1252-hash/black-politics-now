import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Activity, ArrowRight, BookOpen, Bot, BrainCircuit, CheckCircle2, ClipboardCheck, ExternalLink, FileSearch, Landmark, Map, ShieldCheck, Sparkles } from "lucide-react";

const EDITOR_LINKS = [
  {
    title: "Supreme Court strikes down Louisiana’s second majority-Black district",
    source: "Black Politics Now · Voting Rights",
    href: "https://blkpoliticsnow.com/supreme-court-expands-scope-of-louisiana-redistricting-case/",
    record: "Louisiana: representation, boundaries, and redistricting context",
    detail: "A selected link from the reporting record to the Historical Atlas state view.",
    to: "/atlas?state=LA",
    kind: "Historical Atlas",
  },
  {
    title: "Georgia halts redistricting plan to redraw congressional map",
    source: "Black Politics Now · Voting Rights",
    href: "https://blkpoliticsnow.com/georgia-gov-brian-kemp-calls-special-legislative-session-to-redraw-congressional-map/",
    record: "Georgia: active redistricting watch and election context",
    detail: "A selected link from a verified newsroom story to the live Election Center.",
    to: "/elections",
    kind: "Election Map",
  },
  {
    title: "Tennessee approves congressional map dismantling state’s sole majority-Black district",
    source: "Black Politics Now · Voting Rights",
    href: "https://blkpoliticsnow.com/tennessee-governor-lee-calls-special-session-to-redraw-congressional-maps/",
    record: "Tennessee: historical boundary archive and current watch context",
    detail: "A selected link from reporting to a shareable state record in the Historical Atlas.",
    to: "/atlas?state=TN",
    kind: "Historical Atlas",
  },
];

const GUIDED_QUESTIONS = [
  "What does the Louisiana map change mean for Black representation?",
  "What does the Historical Atlas show about voting rights and redistricting?",
  "Which states are in Black Politics Now’s active redistricting watch?",
  "What is Black Politics Now tracking in the 2026 Senate races?",
];

export default function IntelligenceExample() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [briefState, setBriefState] = useState<"idle" | "researching" | "ready">("idle");
  const chat = trpc.agent.chat.useMutation({
    onSuccess: (result) => {
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
      setBriefState("ready");
    },
    onError: () => {
      setMessages((current) => [...current, { role: "assistant", content: "I could not complete that research request right now. Please try a guided question or explore the linked platform record directly." }]);
      setBriefState("idle");
    },
  });

  const ask = (question: string) => {
    const history = messages.slice(-6).map(({ role, content }) => ({ role: role as "user" | "assistant", content }));
    setMessages((current) => [...current, { role: "user", content: question }]);
    setBriefState("researching");
    chat.mutate({ question, history });
  };

  return <div className="min-h-screen bg-background text-foreground">
    <section className="border-b border-border bg-card/50">
      <div className="container py-9 md:py-12">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 text-primary"><BrainCircuit size={16}/><span className="text-[10px] font-bold uppercase tracking-[.22em]">Research & intelligence agent · review-first preview</span></div>
          <h1 className="mt-4 font-display text-4xl font-black leading-[.95] tracking-tight sm:text-5xl md:text-6xl">Reporting, evidence, and a human decision—in one reader path.</h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">This is more than a chatbot. The Research & Intelligence Agent gathers the platform record, prepares a cited research brief, identifies a possible next action, and returns it for an editor’s decision. Nothing below automatically links, publishes, alerts readers, or changes a public record.</p>
          <div className="mt-6 flex flex-wrap gap-3"><Link href="/newsroom" className="inline-flex items-center gap-2 rounded-sm border border-border px-4 py-2.5 text-sm font-bold hover:border-primary/50 hover:text-primary"><BookOpen size={16}/> Return to newsroom</Link><Link href="/elections" className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/85"><Map size={16}/> Open Election Map</Link></div>
        </div>
      </div>
    </section>

    <main className="container py-8 md:py-12">
      <section aria-labelledby="related-intelligence" className="border-b border-border pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Example 01 · editor confirmed</p><h2 id="related-intelligence" className="mt-2 font-display text-3xl font-black">Related intelligence beneath the story</h2></div><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">Each connection is selected by an editor, visible to readers, and reversible. The article remains at the original WordPress address.</p></div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">{EDITOR_LINKS.map((item) => <article key={item.href} className="border border-border bg-card p-5">
          <div className="flex items-start justify-between gap-3"><span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.16em] text-primary"><CheckCircle2 size={13}/> Editor confirmed</span><Landmark size={18} className="text-primary"/></div>
          <a href={item.href} target="_blank" rel="noreferrer" className="mt-5 block font-display text-2xl font-black leading-[1.04] hover:text-primary">{item.title}</a>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{item.source}</p>
          <div className="mt-5 border-l-2 border-primary bg-primary/5 p-4"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">{item.kind}</p><h3 className="mt-2 font-semibold leading-tight">{item.record}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p><Link href={item.to} className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-foreground">Open selected record <ArrowRight size={14}/></Link></div>
          <a href={item.href} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-primary">Read original reporting <ExternalLink size={13}/></a>
        </article>)}</div>
      </section>

      <section className="border-b border-border py-10 lg:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Example 02 · agent workflow</p><h2 className="mt-2 font-display text-4xl font-black">What the agent does beyond a chat answer</h2></div><p className="max-w-xl text-sm leading-relaxed text-muted-foreground">The public reader sees evidence and citations. The protected Admin workspace receives research packages and review-only recommendations.</p></div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><AgentStage icon={FileSearch} number="01" title="Gather evidence" detail="Collect relevant platform reporting, election, Atlas, World, and Daily Brief records."/><AgentStage icon={Activity} number="02" title="Compare the record" detail="Surface agreement, missing context, or a reason to research further—without guessing."/><AgentStage icon={ClipboardCheck} number="03" title="Prepare a proposal" detail="Recommend a story link, data-quality review, or sourced editorial follow-up for a human owner."/><AgentStage icon={ShieldCheck} number="04" title="Return for approval" detail="An editor decides whether anything becomes a public link, correction, task, or story."/></div>
      </section>

      <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1.15fr)_360px] lg:py-14">
        <div>
          <div className="flex items-center gap-2 text-primary"><Bot size={18}/><span className="text-[10px] font-bold uppercase tracking-[.22em]">Example 03 · launch a research brief</span></div>
          <h2 className="mt-3 font-display text-4xl font-black leading-none">Ask the record. Receive a cited brief.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">Choose a guided question or enter your own. The agent retrieves source context, returns a concise cited answer, and shows the same evidence-first behavior that supports protected editor recommendations.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><AgentStatus label="Evidence" value={briefState === "idle" ? "Waiting for brief" : "Collected from platform sources"} active={briefState !== "idle"}/><AgentStatus label="Analysis" value={briefState === "researching" ? "Comparing records" : briefState === "ready" ? "Cited brief prepared" : "Starts with your question"} active={briefState !== "idle"}/><AgentStatus label="Editorial action" value={briefState === "ready" ? "Ready for human review" : "No public change"} active={briefState === "ready"}/></div>
          <div className="mt-6"><AIChatBox messages={messages} onSendMessage={ask} isLoading={chat.isPending} height="min(590px, 65vh)" placeholder="Ask a research question about Black Politics Now’s tracked records..." emptyStateMessage="Choose a guided question or ask about the platform’s reporting, elections, Atlas, World Elections, or Daily Brief." suggestedPrompts={GUIDED_QUESTIONS} className="border-primary/25 shadow-xl shadow-primary/5"/></div>
        </div>
        <aside className="space-y-4 lg:pt-8"><div className="border border-primary/25 bg-primary/5 p-5"><ShieldCheck className="text-primary" size={24}/><h3 className="mt-4 font-display text-2xl font-black">The agent boundary</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">It can research, compare evidence, generate a cited brief, and recommend a next step. It cannot automatically publish, alter an election record, send a public alert, or change a WordPress article.</p></div><div className="border border-border bg-card p-5"><p className="text-[10px] font-bold uppercase tracking-[.16em] text-primary">About the Q&A collection</p><h3 className="mt-3 font-display text-2xl font-black">A durable answer library can be the next layer.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">This preview uses the current source-cited Research Desk. Your existing thousands of questions and answers can be imported as a separately labeled, editor-reviewed collection—so historical answers never masquerade as current election facts.</p></div><div className="border border-border p-5"><p className="font-semibold">Recommended owner workflow</p><ol className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground"><li><span className="font-bold text-primary">01</span> Agent prepares evidence and a proposed link or follow-up.</li><li><span className="font-bold text-primary">02</span> An editor checks the source and approves, dismisses, or revises it.</li><li><span className="font-bold text-primary">03</span> Only the approved action reaches the public product.</li></ol></div></aside>
      </section>
    </main>
  </div>;
}

function AgentStage({ icon: Icon, number, title, detail }: { icon: any; number: string; title: string; detail: string }) {
  return <div className="border border-border bg-card p-5"><div className="flex items-center justify-between"><Icon className="text-primary" size={20}/><span className="text-[10px] font-bold tracking-[.16em] text-primary">{number}</span></div><h3 className="mt-7 font-display text-2xl font-black">{title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{detail}</p></div>;
}

function AgentStatus({ label, value, active }: { label: string; value: string; active: boolean }) {
  return <div className={`border p-3 ${active ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}><p className="text-[10px] font-bold uppercase tracking-[.14em] text-primary">{label}</p><p className="mt-1 text-xs font-semibold leading-snug text-foreground">{value}</p></div>;
}
