function toArabicDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) =>
    '٠١٢٣٤٥٦٧٨٩'[Number(digit)]
  )
}

/** نص عادي مع دعم الأسس ^ فقط */
function plain(s: string) {
  return s.split(/(\^[0-9a-zA-Z]+)/g).map((b, i) =>
    b.startsWith('^') ? (
      <sup key={i}>{toArabicDigits(b.slice(1))}</sup>
    ) : (
      toArabicDigits(b)
    ),
  )
}

/** كسر مرسوم: البسط فوق خط والمقام تحته. يُستعمل أيضاً من الأدوات مباشرة */
export function Frac({ n, d }: { n: string; d: string }) {
  return (
    <span className="frac">
      <span className="fn">{plain(n.trim())}</span>
      <span className="fd">{plain(d.trim())}</span>
    </span>
  )
}

// {بسط/مقام}  أو  ^أس
const TOKEN = /(\{[^{}/]+\/[^{}]+\}|\^[0-9a-zA-Z]+)/g

export function Expr({ s }: { s: string }) {
  return (
    <span className="m" dir="rtl">
      {s.split(TOKEN).map((b, i) => {
        if (b.startsWith('{') && b.endsWith('}')) {
          const inner = b.slice(1, -1)
          const k = inner.indexOf('/')
          return <Frac key={i} n={inner.slice(0, k)} d={inner.slice(k + 1)} />
        }
        if (b.startsWith('^')) return <sup key={i}>{toArabicDigits(b.slice(1))}</sup>
        return toArabicDigits(b)
      })}
    </span>
  )
}

export function Rich({ t }: { t: string }) {
  return (
    <>
      {t.split(/(\$[^$]+\$|\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith('$') ? (
          <Expr key={i} s={p.slice(1, -1)} />
        ) : p.startsWith('**') ? (
          <b key={i}>
            <Rich t={p.slice(2, -2)} />
          </b>
        ) : (
          toArabicDigits(p)
        ),
      )}
    </>
  )
}

// مكوّن مستقل لكتل الشرح فقط؛ لا يغيّر سلوك Rich المستخدم داخل الأسئلة والأدوات.
type TableData = { headers: string[]; rows: string[][] }
type RichPart = { kind: 'text'; value: string } | { kind: 'table'; value: TableData }

function tableCells(line: string): string[] | null {
  const value = line.trim()
  if (!value.startsWith('|') || !value.endsWith('|')) return null
  const cells = value.slice(1, -1).split('|').map((cell) => cell.trim())
  return cells.length >= 2 ? cells : null
}

function isSeparator(cells: string[]) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell))
}

function splitRichParts(t: string): RichPart[] {
  const lines = t.split('\n')
  const parts: RichPart[] = []
  let textLines: string[] = []
  let i = 0

  const flushText = () => {
    if (textLines.length) {
      parts.push({ kind: 'text', value: textLines.join('\n') })
      textLines = []
    }
  }

  while (i < lines.length) {
    const headers = tableCells(lines[i])
    const separator = i + 1 < lines.length ? tableCells(lines[i + 1]) : null

    if (headers && separator && headers.length === separator.length && isSeparator(separator)) {
      flushText()
      const rows: string[][] = []
      i += 2

      while (i < lines.length) {
        const row = tableCells(lines[i])
        if (!row || row.length !== headers.length || isSeparator(row)) break
        rows.push(row)
        i++
      }

      parts.push({ kind: 'table', value: { headers, rows } })
      continue
    }

    textLines.push(lines[i])
    i++
  }

  flushText()
  return parts
}

export function RichBlock({ t }: { t: string }) {
  const parts = splitRichParts(t)
  if (parts.every((part) => part.kind === 'text')) return <p><Rich t={t} /></p>

  return (
    <div className="say-text">
      {parts.map((part, i) => part.kind === 'text' ? (
        <span className="rich-prose" key={i}><Rich t={part.value} /></span>
      ) : (
        <div className="rich-table-wrap" dir="rtl" key={i}>
          <table className="rich-table">
            <thead>
              <tr>{part.value.headers.map((cell, j) => <th key={j}><Rich t={cell} /></th>)}</tr>
            </thead>
            <tbody>
              {part.value.rows.map((row, j) => (
                <tr key={j}>{row.map((cell, k) => <td key={k}><Rich t={cell} /></td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
