import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
const writeText = jest.fn();

beforeEach(() => {
  writeText.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
});

afterEach(() => {
  if (originalClipboard) Object.defineProperty(navigator, 'clipboard', originalClipboard);
  else Reflect.deleteProperty(navigator, 'clipboard');
});

test('copies only on request and supports the keyboard without moving focus', async () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: 'Copy this joke' })).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
  expect(writeText).not.toHaveBeenCalled();
  const copy = screen.getByRole('button', { name: 'Copy this joke' });
  copy.focus();
  userEvent.keyboard('{Enter}');
  expect(await screen.findByText('Joke copied. Productivity remains unchanged.')).toBeInTheDocument();
  expect(writeText).toHaveBeenCalledTimes(1);
  expect(writeText).toHaveBeenCalledWith('NullBoard Pro Max\n\nTag rejected: even #nothing was too much commitment.\n\nZero tasks. Zero pressure.\nhttps://github.com/ishowshao/NullBoard');
  expect(copy).toHaveFocus();
  userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(screen.getByText('Joke copied. Productivity remains unchanged.')).toBeInTheDocument();
});

test.each(['missing', 'rejected'])('offers manual copying when the clipboard is %s, then allows retry', async (failure) => {
  if (failure === 'missing') Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  else writeText.mockRejectedValueOnce(new Error('Permission denied'));
  render(<App />);
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  expect(await screen.findByText('Could not copy. Select the text below and copy it manually.')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Tag rejected:');
  const manual = screen.getByRole('textbox', { name: 'Text to copy manually' }) as HTMLTextAreaElement;
  expect(manual).toHaveAttribute('readonly');
  expect(manual).toHaveValue('NullBoard Pro Max\n\nTag rejected: even #nothing was too much commitment.\n\nZero tasks. Zero pressure.\nhttps://github.com/ishowshao/NullBoard');
  expect(screen.getByRole('button', { name: 'Copy this joke' })).toHaveFocus();
  userEvent.tab();
  expect(screen.getByRole('button', { name: 'Copy manually' })).toHaveFocus();
  userEvent.tab();
  expect(manual).toHaveFocus();
  expect(manual.selectionStart).toBe(0);
  expect(manual.selectionEnd).toBe(manual.value.length);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  expect(await screen.findByText('Joke copied. Productivity remains unchanged.')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

test.each(['resolve', 'reject'])('ignores a late clipboard %s after switching jokes', async (outcome) => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  writeText.mockImplementationOnce(() => new Promise<void>((done, fail) => { resolve = done; reject = fail; }));
  render(<App />);
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
  const copy = screen.getByRole('button', { name: 'Copy this joke' });
  userEvent.click(copy);
  expect(copy).toBeDisabled();
  userEvent.click(copy);
  expect(writeText).toHaveBeenCalledTimes(1);
  userEvent.click(screen.getByRole('button', { name: 'Save your progress' }));
  expect(screen.getByRole('button', { name: 'Copy this joke' })).toBeEnabled();
  await act(async () => { if (outcome === 'resolve') resolve(); else reject(new Error('Denied')); });
  expect(screen.queryByText(/Joke copied|Could not copy|Copying nothing/)).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  expect(await screen.findByText('Joke copied. Productivity remains unchanged.')).toBeInTheDocument();
  expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining('Progress saved to your imagination.'));
});

test.each(['resolve', 'reject'])('ignores a late clipboard %s after Escape and reopening the same joke', async (outcome) => {
  let resolveOld!: () => void;
  let rejectOld!: (error: Error) => void;
  let resolveNew!: () => void;
  writeText
    .mockImplementationOnce(() => new Promise<void>((done, fail) => { resolveOld = done; rejectOld = fail; }))
    .mockImplementationOnce(() => new Promise<void>((done) => { resolveNew = done; }));
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Add tags' });
  userEvent.click(trigger);
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  userEvent.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('button', { name: 'Copy this joke' })).not.toBeInTheDocument();
  userEvent.keyboard('{Enter}');
  const reopenedCopy = screen.getByRole('button', { name: 'Copy this joke' });
  expect(reopenedCopy).toBeEnabled();
  expect(trigger).toHaveFocus();
  expect(screen.queryByText(/Joke copied|Could not copy|Copying nothing/)).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();

  // The old request must not finish or fail the new instance's pending copy.
  userEvent.click(reopenedCopy);
  await act(async () => { if (outcome === 'resolve') resolveOld(); else rejectOld(new Error('Denied')); });
  expect(screen.getByText('Copying nothing…')).toBeInTheDocument();
  expect(reopenedCopy).toBeDisabled();
  expect(screen.queryByText(/Joke copied|Could not copy/)).not.toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Copy manually' })).toHaveAttribute('aria-expanded', 'false');
  expect(reopenedCopy).toHaveFocus();
  expect(writeText).toHaveBeenCalledTimes(2);

  await act(async () => resolveNew());
  expect(screen.getByText('Joke copied. Productivity remains unchanged.')).toBeInTheDocument();
  expect(reopenedCopy).toBeEnabled();
  expect(reopenedCopy).toHaveFocus();
  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  expect(screen.queryByRole('button', { name: 'Copy this joke' })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});

test('shares a stable repository link without leaking the current address', async () => {
  const originalAddress = window.location.href;
  window.history.replaceState(null, '', '/local-preview?private=value#draft');
  const previewAddress = window.location.href;
  try {
    render(<App />);
    userEvent.click(screen.getByRole('button', { name: 'Create a new task' }));
    userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
    expect(await screen.findByText('Joke copied. Productivity remains unchanged.')).toBeInTheDocument();
    const sharedText = writeText.mock.calls[0][0];
    expect(sharedText).toContain('Task created in a parallel universe.');
    expect(sharedText).toMatch(/\nhttps:\/\/github\.com\/ishowshao\/NullBoard$/);
    expect(sharedText).not.toMatch(/local-preview|private=value|#draft|localhost/);
    expect(window.location.href).toBe(previewAddress);
  } finally {
    window.history.replaceState(null, '', originalAddress);
  }
});

test('removes failed manual-copy text when switching or dismissing a joke', async () => {
  writeText.mockRejectedValue(new Error('Denied'));
  render(<App />);
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  await screen.findByRole('textbox', { name: 'Text to copy manually' });
  userEvent.click(screen.getByRole('button', { name: 'Save your progress' }));
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  const manual = await screen.findByRole('textbox', { name: 'Text to copy manually' });
  expect((manual as HTMLTextAreaElement).value).toContain('Progress saved to your imagination.');
  userEvent.click(manual);
  userEvent.keyboard('{Escape}');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save your progress' })).toHaveFocus();
});

test('offers manual sharing without requesting clipboard access and resets on a different joke', () => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Add tags' });
  userEvent.click(trigger);
  const manualButton = screen.getByRole('button', { name: 'Copy manually', expanded: false });
  manualButton.focus();
  userEvent.keyboard('{Enter}');
  const manual = screen.getByRole('textbox', { name: 'Text to copy manually' }) as HTMLTextAreaElement;
  expect(writeText).not.toHaveBeenCalled();
  expect(manualButton).toHaveFocus();
  expect(manualButton).toHaveAttribute('aria-expanded', 'true');
  expect(manualButton).toHaveAttribute('aria-controls', `${manual.getAttribute('id')}-panel`);
  expect(manual).toHaveAttribute('readonly');
  expect(manual.value).toContain('Tag rejected:');
  expect(manual.value).toContain('https://github.com/ishowshao/NullBoard');
  userEvent.tab();
  expect(manual).toHaveFocus();
  expect(manual.selectionEnd).toBe(manual.value.length);
  userEvent.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: 'Copy manually' }));
  userEvent.click(screen.getByRole('button', { name: 'Save your progress' }));
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Copy manually' })).toHaveAttribute('aria-expanded', 'false');
  expect(writeText).not.toHaveBeenCalled();
});

test.each(['resolve', 'reject'])('keeps manual sharing usable while copying is pending and after a late %s', async (outcome) => {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  writeText.mockImplementationOnce(() => new Promise<void>((done, fail) => { resolve = done; reject = fail; }));
  render(<App />);
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  const manualButton = screen.getByRole('button', { name: 'Copy manually' });
  expect(manualButton).toBeEnabled();
  manualButton.focus();
  userEvent.keyboard(' ');
  const manual = screen.getByRole('textbox', { name: 'Text to copy manually' }) as HTMLTextAreaElement;
  expect(manualButton).toHaveFocus();
  userEvent.tab();
  expect(manual).toHaveFocus();
  const value = manual.value;
  expect(manual.selectionStart).toBe(0);
  expect(manual.selectionEnd).toBe(value.length);
  expect(writeText).toHaveBeenCalledTimes(1);
  await act(async () => { if (outcome === 'resolve') resolve(); else reject(new Error('Denied')); });
  expect(screen.getByRole('textbox', { name: 'Text to copy manually' })).toBe(manual);
  expect(manual).toHaveValue(value);
  expect(manual).toHaveFocus();
  expect(manual.selectionEnd).toBe(value.length);
  expect(screen.getByRole('button', { name: 'Copy this joke' })).toBeEnabled();
});
