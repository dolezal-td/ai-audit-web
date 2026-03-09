'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'neutral',
  fontFamily: 'inherit',
});

let idCounter = 0;

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState('');

  useEffect(() => {
    const id = `mermaid-${idCounter++}`;
    mermaid.render(id, chart.trim()).then(({ svg }) => {
      setSvg(svg);
    });
  }, [chart]);

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center [&_svg]:max-w-full"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
