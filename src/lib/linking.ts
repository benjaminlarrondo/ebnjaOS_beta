export function parseWikiRefs(input: string) {
  const out: string[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let match: RegExpExecArray | null = re.exec(input);
  while (match) {
    const ref = (match[1] || "").trim();
    if (ref) out.push(ref);
    match = re.exec(input);
  }
  return Array.from(new Set(out));
}

export function textIncludesRef(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}
