import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Activities from '../src/components/Activities.js';

const createdActivity = {
  user: '64b000000000000000000001',
  team: '64b000000000000000000002',
  type: 'run',
  minutes: 30,
  points: 30,
  occurredAt: '2026-10-28T12:00:00.000Z',
};

describe('Activity creation form', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('submits existing user and team IDs and refreshes the activity list', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        return new Response(JSON.stringify({ activity: createdActivity }), { status: 201 });
      }
      return new Response(
        JSON.stringify({ activities: fetchMock.mock.calls.some(([, options]) => options?.method === 'POST') ? [createdActivity] : [] }),
        { status: 200 },
      );
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<Activities />);
    await screen.findByText('No activities yet.');
    await user.type(screen.getByRole('textbox', { name: 'User ID' }), createdActivity.user);
    await user.type(screen.getByRole('textbox', { name: 'Team ID' }), createdActivity.team);
    await user.type(screen.getByRole('textbox', { name: 'Activity type' }), createdActivity.type);
    await user.type(screen.getByRole('spinbutton', { name: 'Minutes' }), String(createdActivity.minutes));
    await user.click(screen.getByRole('button', { name: 'Create activity' }));

    expect(await screen.findByText('Activity created successfully.')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: createdActivity.user,
        teamId: createdActivity.team,
        type: createdActivity.type,
        minutes: createdActivity.minutes,
      }),
    });
    await waitFor(() => expect(screen.getByText(/run: 30 minutes, 30 points/)).toBeInTheDocument());
  });

  it('announces API errors accessibly', async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => (
      init?.method === 'POST'
        ? new Response(JSON.stringify({ error: 'Invalid user ID' }), { status: 400 })
        : new Response(JSON.stringify({ activities: [] }), { status: 200 })
    ));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();

    render(<Activities />);
    await screen.findByText('No activities yet.');
    await user.type(screen.getByRole('textbox', { name: 'User ID' }), 'invalid');
    await user.type(screen.getByRole('textbox', { name: 'Team ID' }), createdActivity.team);
    await user.type(screen.getByRole('textbox', { name: 'Activity type' }), createdActivity.type);
    await user.type(screen.getByRole('spinbutton', { name: 'Minutes' }), String(createdActivity.minutes));
    await user.click(screen.getByRole('button', { name: 'Create activity' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to create activity.*400/i);
  });
});
