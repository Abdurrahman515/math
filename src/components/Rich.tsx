export function Expr({ s }: { s: string }) {
  return (
    <span className="m" dir="ltr">
      {s.split(/(\^[0-9a-zA-Z]+)/g).map((b, i) => (b.startsWith('^') ? <sup key={i}>{b.slice(1)}</sup> : b))}
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
          <b key={i}><Rich t={p.slice(2, -2)} /></b>
        ) : (
          p
        ),
      )}
    </>
  )
}