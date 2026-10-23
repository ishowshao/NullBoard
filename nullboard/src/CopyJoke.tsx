import React, { useEffect, useRef, useState } from 'react';

type CopyState = 'idle' | 'copying' | 'copied' | 'failed';

export default function CopyJoke({ message, className }: { message: string; className: string }) {
  const [state, setState] = useState<CopyState>('idle');
  const mounted = useRef(false);
  const pending = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const copy = async () => {
    if (pending.current) return;
    pending.current = true;
    setState('copying');
    try {
      await navigator.clipboard.writeText(`NullBoard Pro Max\n\n${message}\n\nZero tasks. Zero pressure.`);
      if (mounted.current) setState('copied');
    } catch {
      if (mounted.current) setState('failed');
    } finally {
      pending.current = false;
    }
  };

  return (
    <div className="mt-4 text-center">
      <button type="button" className={className} onClick={copy} disabled={state === 'copying'}>
        Copy this joke
      </button>
      <p className="mt-2 text-sm" aria-live="polite" aria-atomic="true">
        {state === 'copying' && 'Copying nothing…'}
        {state === 'copied' && 'Joke copied. Productivity remains unchanged.'}
        {state === 'failed' && 'Could not copy. Select the joke above and copy it manually.'}
      </p>
    </div>
  );
}
