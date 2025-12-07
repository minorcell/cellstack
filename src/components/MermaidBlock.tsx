'use client';

import React, { useEffect, useMemo, useState } from "react";
import { Copy } from "lucide-react";

type MermaidBlockProps = {
  code: string;
};

export function MermaidBlock({ code }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const renderId = useMemo(() => `mermaid-${Math.random().toString(36).slice(2)}`, []);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          theme: "dark",
          fontFamily: "Source Sans 3, Inter, -apple-system, sans-serif",
          themeVariables: {
            background: "#0b0d11",
            primaryColor: "#1a73e8",
            primaryTextColor: "#e5e7eb",
            lineColor: "#94a3b8",
          },
        });
        const { svg } = await mermaid.render(renderId, code);
        if (mounted) {
          setSvg(svg);
          setError(null);
        }
      } catch (err) {
        console.error("Mermaid render failed", err);
        if (mounted) setError("Mermaid 图渲染失败");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [code, renderId]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-gray-200/50 bg-[#0b0d11] shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between px-4 py-3 bg-[#0f1116]/90">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-200">Mermaid Diagram</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium text-gray-200 hover:bg-white/5 active:scale-[0.99] transition"
          aria-label="Copy mermaid source"
        >
          <Copy className="h-4 w-4" />
          <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <div className="overflow-auto bg-[#0b0d11] m-0 p-0">
        {error && <div className="p-4 text-sm text-red-300">{error}</div>}
        {!error && !svg && <div className="p-4 text-sm text-gray-300">渲染中...</div>}
        {!error && svg && (
          <div
            className="p-4 sm:p-5 md:p-6 min-w-full mermaid-diagram"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  );
}
