import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders the NullBoard landing page without a feature message', () => {
  render(<App />);

  expect(screen.getByRole('heading', { name: 'NullBoard Pro Max' })).toBeInTheDocument();
  expect(screen.getByRole('main')).toHaveClass('bg-black', 'text-white');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('switches between light and dark themes', () => {
  render(<App />);

  userEvent.click(screen.getByRole('button', { name: /Light/ }));
  expect(screen.getByRole('main')).toHaveClass('bg-white', 'text-black');

  userEvent.click(screen.getByRole('button', { name: /Dark/ }));
  expect(screen.getByRole('main')).toHaveClass('bg-black', 'text-white');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test.each([
  'Create a new task',
  'Add tags',
  'Collaborate with team',
  'Save your progress',
  '✨ Premium AI Assistant (New!)',
])('shows and dismisses the message for %s', (featureName) => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: featureName });

  userEvent.click(trigger);
  expect(screen.getByRole('status')).toHaveTextContent("Sorry, that feature doesn't exist.");

  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(trigger).toHaveFocus();
});

test('opens with the keyboard and dismisses with Escape', () => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Create a new task' });

  userEvent.tab();
  userEvent.tab();
  expect(trigger).toHaveFocus();
  userEvent.keyboard('{Enter}');
  expect(screen.getByRole('status')).not.toBeEmptyDOMElement();

  screen.getByRole('button', { name: 'Accept defeat' }).focus();
  userEvent.keyboard('{Escape}');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(trigger).toHaveFocus();
});

test('returns focus to the most recent feature after repeated interactions', () => {
  render(<App />);
  const firstTrigger = screen.getByRole('button', { name: 'Create a new task' });
  const lastTrigger = screen.getByRole('button', { name: 'Add tags' });

  userEvent.click(firstTrigger);
  userEvent.click(lastTrigger);
  expect(screen.getAllByRole('status')).toHaveLength(1);
  userEvent.keyboard('{Escape}');
  expect(lastTrigger).toHaveFocus();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();

  userEvent.click(firstTrigger);
  expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  expect(firstTrigger).toHaveFocus();
});

test('Escape does not move focus when no message is open', () => {
  render(<App />);
  const themeButton = screen.getByRole('button', { name: /Light/ });

  themeButton.focus();
  userEvent.keyboard('{Escape}');

  expect(themeButton).toHaveFocus();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});



test('keeps the same live region mounted while its message changes', () => {
  render(<App />);
  const status = screen.getByRole('status');
  expect(status).toBeEmptyDOMElement();

  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
  expect(screen.getByRole('status')).toBe(status);
  expect(status).not.toBeEmptyDOMElement();

  userEvent.keyboard('{Escape}');
  expect(screen.getByRole('status')).toBe(status);
  expect(status).toBeEmptyDOMElement();
});

test('dismisses with Escape after a click moves focus to the page body', () => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Add tags' });

  userEvent.click(trigger);
  userEvent.click(screen.getByRole('heading', { name: 'NullBoard Pro Max' }));
  expect(document.body).toHaveFocus();
  userEvent.keyboard('{Escape}');

  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  expect(trigger).toHaveFocus();
});

test('does not dismiss the message for unrelated keys', () => {
  render(<App />);
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));

  userEvent.keyboard('{ArrowDown}');

  expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
});

test('removes the Escape listener when the app unmounts', () => {
  const { unmount } = render(<App />);
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));
  unmount();

  const escape = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
  document.dispatchEvent(escape);

  expect(escape.defaultPrevented).toBe(false);
});
