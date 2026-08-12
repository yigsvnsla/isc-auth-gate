"use client";

import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { CheckIcon, CopyIcon } from "lucide-react";

export function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copy, isCopied] = useCopyToClipboard();

  return (
    <div className="relative overflow-hidden rounded-md border bg-muted/40">
      <div className="flex items-center justify-between border-b px-3 py-1.5">
        <span className="font-mono text-[10px] text-muted-foreground">
          {language ?? "code"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-6"
          aria-label="Copiar código"
          title="Copiar"
          onClick={() => copy(code)}
        >
          {isCopied ? (
            <CheckIcon className="size-3" />
          ) : (
            <CopyIcon className="size-3" />
          )}
        </Button>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  );
}
