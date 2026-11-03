import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { ActivityCreateForm } from './ActivityCreateForm.js';

type ActivityResponse = {
  activities: Array<{ type: string; minutes: number; points: number }>;
};

export default function Activities() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [activities, setActivities] = useState<ActivityResponse['activities']>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let active = true;
    setError(undefined);
    getJson<ActivityResponse>('/api/activities')
      .then(({ activities: result }) => {
        if (active) setActivities(result);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unknown error');
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  return (
    <>
      <ActivityCreateForm onCreated={() => setRefreshKey((key) => key + 1)} />
      <section className="card h-100">
        <div className="card-body">
          <h2 className="h4">Activities</h2>
          <p>Track student activity minutes and points.</p>
          {error ? (
            <p role="alert">Unable to load Activities: {error}</p>
          ) : activities === undefined ? (
            <p role="status">Loading Activities...</p>
          ) : activities.length === 0 ? (
            <p>No activities yet.</p>
          ) : (
            <ul className="list-group">
              {activities.map((activity, index) => (
                <li className="list-group-item" key={`${activity.type}-${index}`}>
                  {activity.type}: {activity.minutes} minutes, {activity.points} points
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
