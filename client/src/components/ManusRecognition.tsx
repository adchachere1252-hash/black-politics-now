import { useAudio } from "@/contexts/AudioContext";

export default function ManusRecognition() {
  const { currentTrack } = useAudio();

  return (
    <a
      href="https://manus.im"
      target="_blank"
      rel="noreferrer"
      aria-label="Built with Manus"
      title="Built with Manus"
      className={`fixed right-2 z-40 inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-card/92 px-1.5 py-1 sm:right-3 sm:px-2.5 sm:py-1.5 text-[10px] font-semibold text-muted-foreground shadow-md backdrop-blur transition-colors hover:border-primary/45 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 ${currentTrack ? "bottom-20" : "bottom-2 sm:bottom-3"}`}
    >
      <span aria-hidden="true" className="grid h-4 w-4 place-items-center rounded-full bg-foreground text-[9px] font-black leading-none text-background">m</span>
      <span className="hidden sm:inline">Built with <strong className="font-bold text-foreground">Manus</strong></span>
    </a>
  );
}
