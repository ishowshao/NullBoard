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

  userEvent.click(screen.getByRole('button', { name: 'Dark mode', pressed: true }));
  expect(screen.getByRole('main')).toHaveClass('bg-white', 'text-black');

  userEvent.click(screen.getByRole('button', { name: 'Dark mode', pressed: false }));
  expect(screen.getByRole('main')).toHaveClass('bg-black', 'text-white');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test.each([
  ['Create a new task', 'Task created in a parallel universe. This one remains beautifully empty.'],
  ['Add tags', 'Tag rejected: even #nothing was too much commitment.'],
  ['Collaborate with team', 'Your team is perfectly aligned on doing nothing. No invitations were sent.'],
  ['Save your progress', "Progress saved to your imagination. Please don't clear your daydreams."],
  ['✨ Premium AI Assistant (New!)', 'Our premium AI recommends taking a break. Zero tokens. Zero tasks. Maximum confidence.'],
])('shows and dismisses the unique message for %s', (featureName, message) => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: featureName });

  userEvent.click(trigger);
  expect(screen.getByRole('status').textContent).toBe(message);

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
  const firstMessage = screen.getByRole('status').textContent;
  userEvent.click(lastTrigger);
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status')).toHaveTextContent('Tag rejected:');
  expect(screen.getByRole('status').textContent).not.toBe(firstMessage);
  userEvent.keyboard('{Escape}');
  expect(lastTrigger).toHaveFocus();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();

  userEvent.click(firstTrigger);
  expect(screen.getByRole('status').textContent).toBe(firstMessage);
  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  expect(firstTrigger).toHaveFocus();
});

test('Escape does not move focus when no message is open', () => {
  render(<App />);
  const themeButton = screen.getByRole('button', { name: 'Dark mode', pressed: true });

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

  userEvent.click(screen.getByRole('button', { name: 'Save your progress' }));
  expect(screen.getByRole('status')).toBe(status);
  expect(status).toHaveTextContent('Progress saved to your imagination.');

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

test('keeps the active joke and premium styling when switching themes', () => {
  render(<App />);
  const premiumButton = screen.getByRole('button', { name: '✨ Premium AI Assistant (New!)' });
  const regularButton = screen.getByRole('button', { name: 'Add tags' });

  userEvent.click(premiumButton);
  const message = screen.getByRole('status').textContent;
  expect(premiumButton).toHaveClass('bg-purple-800');
  expect(regularButton).toHaveClass('bg-gray-800');

  userEvent.click(screen.getByRole('button', { name: 'Dark mode', pressed: true }));
  expect(screen.getByRole('status').textContent).toBe(message);
  expect(premiumButton).toHaveClass('bg-purple-200');
  expect(regularButton).toHaveClass('bg-gray-200');

  userEvent.click(screen.getByRole('button', { name: 'Dark mode', pressed: false }));
  expect(screen.getByRole('status').textContent).toBe(message);
  expect(premiumButton).toHaveClass('bg-purple-800');
  expect(regularButton).toHaveClass('bg-gray-800');

  userEvent.keyboard('{Escape}');
  expect(premiumButton).toHaveFocus();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('repeated clicks keep one message and allow the same joke to reopen', () => {
  render(<App />);
  const trigger = screen.getByRole('button', { name: 'Save your progress' });

  userEvent.click(trigger);
  const message = screen.getByRole('status').textContent;
  userEvent.click(trigger);
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe(message);
  expect(screen.getAllByRole('button', { name: 'Accept defeat' })).toHaveLength(1);

  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  expect(trigger).toHaveFocus();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  userEvent.keyboard('{Enter}');
  expect(screen.getByRole('status').textContent).toBe(message);
});


test.each(['{Enter}', ' '])('toggles dark mode with %s while keeping its name and focus', (key) => {
  render(<App />);
  const themeButton = screen.getByRole('button', { name: 'Dark mode', pressed: true });

  userEvent.tab();
  expect(themeButton).toHaveFocus();
  expect(themeButton).toHaveTextContent('Dark mode: On');

  userEvent.keyboard(key);
  expect(screen.getByRole('button', { name: 'Dark mode', pressed: false })).toBe(themeButton);
  expect(themeButton).toHaveFocus();
  expect(themeButton).toHaveTextContent('Dark mode: Off');
  expect(screen.getByRole('main')).toHaveClass('bg-white', 'text-black');

  userEvent.keyboard(key);
  expect(screen.getByRole('button', { name: 'Dark mode', pressed: true })).toBe(themeButton);
  expect(themeButton).toHaveFocus();
  expect(themeButton).toHaveTextContent('Dark mode: On');
  expect(screen.getByRole('main')).toHaveClass('bg-black', 'text-white');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('gives every control an explicit button type, touch-target and keyboard-focus styles in both themes', () => {
  render(<App />);
  userEvent.click(screen.getByRole('button', { name: 'Add tags' }));

  const expectControls = (outline: string) => {
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(9);
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveClass('min-h-[44px]', 'focus-visible:outline', 'focus-visible:outline-2', 'focus-visible:outline-offset-2', outline);
    });
  };

  expectControls('focus-visible:outline-white');
  userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expectControls('focus-visible:outline-black');
  userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expectControls('focus-visible:outline-white');
});


test.each(['{Enter}', ' '])('exposes the active joke and its feedback target with %s', (key) => {
  render(<App />);
  const featureNames = ['Create a new task', 'Add tags', 'Collaborate with team', 'Save your progress', '✨ Premium AI Assistant (New!)'];
  const buttons = featureNames.map((name) => screen.getByRole('button', { name, expanded: false }));
  const feedbackId = buttons[0].getAttribute('aria-controls');
  const feedback = screen.getByRole('status');
  expect(feedback).toHaveAttribute('id', feedbackId);
  buttons.forEach((button) => expect(button).toHaveAttribute('aria-controls', feedbackId));

  buttons.forEach((button) => {
    button.focus();
    userEvent.keyboard(key);
    buttons.forEach((candidate) => {
      expect(candidate).toHaveAttribute('aria-expanded', String(candidate === button));
    });
    expect(screen.getByRole('status')).toBe(feedback);
    expect(screen.getByRole('status')).not.toBeEmptyDOMElement();
  });

  userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(buttons[4]).toHaveAttribute('aria-expanded', 'true');
  userEvent.keyboard('{Escape}');
  buttons.forEach((button) => expect(button).toHaveAttribute('aria-expanded', 'false'));
  expect(buttons[4]).toHaveFocus();

  userEvent.keyboard(key);
  expect(buttons[4]).toHaveAttribute('aria-expanded', 'true');
  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  buttons.forEach((button) => expect(button).toHaveAttribute('aria-expanded', 'false'));
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('keeps feedback relationships unique when two app instances are mounted', () => {
  render(<><App /><App /></>);
  const buttons = screen.getAllByRole('button', { name: 'Add tags' });
  const statuses = screen.getAllByRole('status');
  const firstId = buttons[0].getAttribute('aria-controls');
  const secondId = buttons[1].getAttribute('aria-controls');

  expect(firstId).toBeTruthy();
  expect(secondId).toBeTruthy();
  expect(firstId).not.toBe(secondId);
  expect(statuses[0]).toHaveAttribute('id', firstId);
  expect(statuses[1]).toHaveAttribute('id', secondId);
});
