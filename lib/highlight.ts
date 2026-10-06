// lib/highlight.ts
// Highlights are saved as character offsets into the reading's plain text
// (e.g. "characters 120 to 184"). That's stable as long as the text doesn't
// change, and it's easy to store as JSON.

import type { Highlight } from "./storage";

/** Convert a browser text selection into { start, end } offsets within `root`. */
export function selectionToOffsets(root: HTMLElement, range: Range) {
  if (!root.contains(range.commonAncestorContainer)) return null;
  const before = document.createRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const end = start + range.toString().length;
  return end > start ? { start, end } : null;
}

/**
 * Wrap each saved highlight in a <mark>. Walks every text node in order,
 * keeping a running character count, and splits text nodes where a
 * highlight starts or ends.
 */
export function paintHighlights(root: HTMLElement, highlights: Highlight[]) {
  for (const hl of [...highlights].sort((a, b) => a.start - b.start)) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const targets: { node: Text; from: number; to: number }[] = [];
    let pos = 0;
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      const len = node.data.length;
      const from = Math.max(hl.start - pos, 0);
      const to = Math.min(hl.end - pos, len);
      if (from < to) targets.push({ node, from, to });
      pos += len;
      if (pos >= hl.end) break;
    }
    // Wrap after walking so we don't disturb the walker mid-loop.
    for (const { node, from, to } of targets) {
      const middle = node.splitText(from);
      middle.splitText(to - from);
      const mark = document.createElement("mark");
      mark.dataset.hl = hl.id;
      mark.className = `hl hl-${hl.color}`;
      middle.parentNode?.insertBefore(mark, middle);
      mark.appendChild(middle);
    }
  }
}
