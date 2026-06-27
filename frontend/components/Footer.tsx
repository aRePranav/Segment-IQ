import { Github, Linkedin, Mail } from "lucide-react";
import { Container } from "@/components/ui/Container";

export function Footer() {
  return (
    <footer className="py-12">
      <Container className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-sm font-semibold text-ink">SegmentIQ AI</p>
          <p className="mt-1 text-xs text-ink-faint">
            Every customer leaves patterns. AI reveals them.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/aRePranav/Segment-IQ"
            target="_blank"
            rel="noreferrer"
            className="text-ink-faint transition hover:text-ink"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="https://linkedin.com/in/pranavr25"
            target="_blank"
            rel="noreferrer"
            className="text-ink-faint transition hover:text-ink"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href="mailto:connectwithpranav.r@gmail.com"
            className="text-ink-faint transition hover:text-ink"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </Container>
    </footer>
  );
}
