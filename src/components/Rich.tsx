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