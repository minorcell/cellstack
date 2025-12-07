"use client";

import React, { type ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";
import { MermaidBlock } from "./MermaidBlock";

type MdxPreProps = {
  children?: ReactNode;
};

type SafeCodeElement = React.ReactElement<{
  className?: string;
  children?: React.ReactNode;
}>;

function isCodeElement(node: ReactNode): node is SafeCodeElement {
  return React.isValidElement(node);
}

const extractText = (node: React.ReactNode): string => {
  if (node === null || node === undefined || typeof node === "boolean")
    return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (isCodeElement(node)) return extractText(node.props?.children);
  return "";
};

export function MdxPre({ children }: MdxPreProps) {
  const child =
    (React.Children.toArray(children)[0] as ReactNode | undefined) ?? null;

  if (isCodeElement(child)) {
    const className = child.props?.className ?? "";
    const match = className.match(/language-([a-z0-9#+-]+)/i);
    const lang = match?.[1]?.toLowerCase();

    if (lang === "mermaid") {
      const code = extractText(child.props?.children).trim();
      return <MermaidBlock code={code} />;
    }
  }

  return <CodeBlock>{children}</CodeBlock>;
}
