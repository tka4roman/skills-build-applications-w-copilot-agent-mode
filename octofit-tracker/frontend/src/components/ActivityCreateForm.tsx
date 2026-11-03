import { useState, type FormEvent } from 'react';
import { postJson } from '../api/client.js';

type Props = { onCreated: () => void };
type ActivityResponse = { activity: { type: string; minutes: number; points: number } };

export function ActivityCreateForm({ onCreated }: Props) {
  const [userId, setUserId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [type, setType] = useState('');
  const [minutes, setMinutes] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string>();

  async function submitActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSuccess(false);
    setError(undefined);

    try {
      await postJson<ActivityResponse>('/api/activities', {
        userId: userId.trim(),
        teamId: teamId.trim(),
        type: type.trim(),
        minutes: Number(minutes),
      });
      setSuccess(true);
      setUserId('');
      setTeamId('');
      setType('');
      setMinutes('');
      onCreated();
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card mb-4">
      <div className="card-body">
        <h2 className="h4">Add activity</h2>
        <p>Use an existing team ID and member user ID; both are listed by <code>GET /api/teams</code>.</p>
        <form aria-label="Create activity" onSubmit={submitActivity}>
          <div className="mb-3">
            <label className="form-label" htmlFor="activity-user-id">User ID</label>
            <input
              className="form-control"
              id="activity-user-id"
              required
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="activity-team-id">Team ID</label>
            <input
              className="form-control"
              id="activity-team-id"
              required
              value={teamId}
              onChange={(event) => setTeamId(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="activity-type">Activity type</label>
            <input
              className="form-control"
              id="activity-type"
              required
              value={type}
              onChange={(event) => setType(event.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="activity-minutes">Minutes</label>
            <input
              className="form-control"
              id="activity-minutes"
              type="number"
              min="1"
              step="any"
              required
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={saving}>
            {saving ? 'Saving activity...' : 'Create activity'}
          </button>
        </form>
        {saving && <p role="status">Saving activity...</p>}
        {success && <p role="status">Activity created successfully.</p>}
        {error && <p role="alert">Unable to create activity: {error}</p>}
      </div>
    </section>
  );
}
