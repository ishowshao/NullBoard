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

test('dismisses a pending copy with Escape and reopens without stale feedback', async () => {
  let resolve!: () => void;
  writeText.mockImplementationOnce(() => new Promise<void>((done) => { resolve = done; }));
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Add tags' });
  userEvent.click(trigger);
  userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
  userEvent.keyboard('{Escape}');
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('button', { name: 'Copy this joke' })).not.toBeInTheDocument();
  userEvent.keyboard('{Enter}');
  await act(async () => resolve());
  expect(screen.queryByText(/Joke copied|Could not copy|Copying nothing/)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Copy this joke' })).toBeEnabled();
  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  expect(screen.queryByRole('button', { name: 'Copy this joke' })).not.toBeInTheDocument();
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
