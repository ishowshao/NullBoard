import React, { useEffect, useId, useRef, useState } from 'react';

type CopyState = 'idle' | 'copying' | 'copied' | 'failed';

export default function CopyJoke({ message, className }: { message: string; className: string }) {
  const [state, setState] = useState<CopyState>('idle');
  const [manualCopyRequested, setManualCopyRequested] = useState(false);
  const showManualCopy = manualCopyRequested || state === 'failed';
  const manualCopyId = useId();
  const shareText = `NullBoard Pro Max\n\n${message}\n\nZero tasks. Zero pressure.\nhttps://github.com/ishowshao/NullBoard`;
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
      await navigator.clipboard.writeText(shareText);
      if (mounted.current) setState('copied');
    } catch {
      if (mounted.current) setState('failed');
    } finally {
      pending.current = false;
    }
  };

  return (
    <div className="mt-4 text-center">
      <div className="flex flex-wrap justify-center gap-2">
        <button type="button" className={className} onClick={copy} disabled={state === 'copying'}>
          Copy this joke
        </button>
        <button
          type="button"
          className={className}
          aria-expanded={showManualCopy}
          aria-controls={`${manualCopyId}-panel`}
          onClick={() => setManualCopyRequested(true)}
        >
          Copy manually
        </button>
      </div>
      <p className="mt-2 text-sm" aria-live="polite" aria-atomic="true">
        {state === 'copying' && 'Copying nothing…'}
        {state === 'copied' && 'Joke copied. Productivity remains unchanged.'}
        {state === 'failed' && 'Could not copy. Select the text below and copy it manually.'}
      </p>
      <div id={`${manualCopyId}-panel`} hidden={!showManualCopy}>
        {showManualCopy && (
          <div className="mt-2">
            <label htmlFor={manualCopyId} className="block text-sm">Text to copy manually</label>
            <textarea
              id={manualCopyId}
              readOnly
              rows={6}
              value={shareText}
              className={`mt-2 w-full text-sm ${className}`}
              onFocus={(event) => event.currentTarget.select()}
            />
          </div>
        )}
      </div>
    </div>
  );
}
