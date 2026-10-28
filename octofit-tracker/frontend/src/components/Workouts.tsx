import { CapabilityCard } from './CapabilityCard.js';

type WorkoutResponse = {
  suggestions: Array<{ title: string; focus?: string; minutes?: number; difficulty?: string; reason?: string }>;
};

export default function Workouts() {
  return (
    <CapabilityCard<WorkoutResponse>
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
      emptyMessage="No workout suggestions available."
      isEmpty={({ suggestions }) => suggestions.length === 0}
    >
      {({ suggestions }) => (
        <ul className="list-group">
          {suggestions.map((workout) => (
            <li className="list-group-item" key={workout.title}>
              <strong>{workout.title}</strong>
              {workout.focus && <span> — {workout.focus}</span>}
              {workout.minutes !== undefined && <span>, {workout.minutes} minutes</span>}
              {workout.difficulty && <span>, {workout.difficulty}</span>}
              {workout.reason && <p className="mb-0">{workout.reason}</p>}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
