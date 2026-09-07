export function tsvCell(value: string | number | null | undefined): string {
  if (value == null || value === "") return "";
  return String(value).replaceAll("\t", " ").replaceAll("\r", " ").replaceAll("\n", " ");
}

export function toTsv(
  columns: string[],
  rows: Array<Array<string | number | null | undefined>>,
  title?: string,
  subtitle?: string,
): string {
  const lines: string[] = [];
  if (title) lines.push(tsvCell(title));
  if (subtitle) lines.push(tsvCell(subtitle));
  if (title || subtitle) lines.push("");
  lines.push(columns.map(tsvCell).join("\t"));
  for (const row of rows) lines.push(row.map(tsvCell).join("\t"));
  return `${lines.join("\n")}\n`;
}

export function sheetsFormula(url: string): string {
  return `=IMPORTDATA("${url}")`;
}
