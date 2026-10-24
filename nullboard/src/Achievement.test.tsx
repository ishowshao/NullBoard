import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { features } from './features';

const certificateName = 'View Certificate of Nothing';
const certificate = 'Certificate of Nothing: I explored every NullBoard feature and accomplished absolutely nothing. Five buttons. Zero tasks. Perfect score.';
const exploreAll = () => features.forEach((feature) => userEvent.click(screen.getByRole('button', { name: feature.label })));

test('unlocks only after all distinct features without replacing the last joke or moving focus', () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: certificateName })).not.toBeInTheDocument();
  const first = screen.getByRole('button', { name: features[0].label });
  for (let i = 0; i < 6; i++) userEvent.click(first);
  userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  features.slice(1, -1).reverse().forEach((feature) => userEvent.click(screen.getByRole('button', { name: feature.label })));
  expect(screen.queryByRole('button', { name: certificateName })).not.toBeInTheDocument();
  const last = features[features.length - 1];
  const trigger = screen.getByRole('button', { name: last.label });
  userEvent.click(trigger);
  expect(screen.getByRole('button', { name: certificateName, expanded: false })).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(last.message);
  expect(trigger).toHaveFocus();
  expect(screen.getByText('Zero achievement unlocked. You tried everything. Nothing happened.')).toHaveAttribute('aria-live', 'polite');
  exploreAll();
  expect(screen.getAllByRole('button', { name: certificateName })).toHaveLength(1);
});

test.each(['{Enter}', ' '])('opens the souvenir with %s and preserves dismissal, focus, theme and reopening', (key) => {
  render(<App />);
  exploreAll();
  const souvenir = screen.getByRole('button', { name: certificateName, expanded: false });
  souvenir.focus();
  userEvent.keyboard(key);
  expect(screen.getByRole('status').textContent).toBe(certificate);
  expect(souvenir).toHaveAttribute('aria-controls', screen.getByRole('status').id);
  expect(souvenir).toHaveAttribute('aria-expanded', 'true');
  expect(souvenir).toHaveAttribute('type', 'button');
  expect(souvenir).toHaveClass('min-h-[44px]', 'focus-visible:outline', 'focus-visible:outline-white', 'bg-purple-800');
  features.forEach((feature) => expect(screen.getByRole('button', { name: feature.label })).toHaveAttribute('aria-expanded', 'false'));
  userEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
  expect(souvenir).toHaveClass('focus-visible:outline-black', 'bg-purple-200');
  expect(screen.getByRole('status').textContent).toBe(certificate);
  userEvent.keyboard('{Escape}');
  expect(souvenir).toHaveFocus();
  expect(souvenir).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  userEvent.keyboard(key);
  expect(screen.getByRole('status').textContent).toBe(certificate);
  userEvent.click(screen.getByRole('button', { name: 'Accept defeat' }));
  expect(souvenir).toHaveFocus();
  userEvent.keyboard(key);
  userEvent.click(screen.getByRole('button', { name: features[0].label }));
  expect(souvenir).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByRole('status').textContent).toBe(features[0].message);
});

test('starts fresh on remount rather than persisting the achievement', () => {
  const { unmount } = render(<App />);
  exploreAll();
  expect(screen.getByRole('button', { name: certificateName })).toBeInTheDocument();
  unmount();
  render(<App />);
  expect(screen.queryByRole('button', { name: certificateName })).not.toBeInTheDocument();
  userEvent.click(screen.getByRole('button', { name: features[0].label }));
  expect(screen.queryByRole('button', { name: certificateName })).not.toBeInTheDocument();
});

test('copies the certificate only on request using the existing honest clipboard feedback', async () => {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const writeText = jest.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  try {
    render(<App />);
    exploreAll();
    userEvent.click(screen.getByRole('button', { name: certificateName }));
    expect(writeText).not.toHaveBeenCalled();
    userEvent.click(screen.getByRole('button', { name: 'Copy this joke' }));
    expect(await screen.findByText('Joke copied. Productivity remains unchanged.')).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith(`NullBoard Pro Max\n\n${certificate}\n\nZero tasks. Zero pressure.`);
  } finally {
    if (original) Object.defineProperty(navigator, 'clipboard', original);
    else Reflect.deleteProperty(navigator, 'clipboard');
  }
});
