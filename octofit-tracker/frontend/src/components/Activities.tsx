import { CapabilityCard } from './CapabilityCard.js';

type ActivityResponse = {
  activities: Array<{ type: string; minutes: number; points: number }>;
};

export default function Activities() {
  return (
    <CapabilityCard<ActivityResponse>
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      emptyMessage="No activities yet."
      isEmpty={({ activities }) => activities.length === 0}
    >
      {({ activities }) => (
        <ul className="list-group">
          {activities.map((activity, index) => (
            <li className="list-group-item" key={`${activity.type}-${index}`}>
              {activity.type}: {activity.minutes} minutes, {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
