import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardResponse = {
  leaderboard: Array<{ teamName: string; totalPoints: number; rank: number }>;
};

const loadLeaderboard = () => getJson<LeaderboardResponse>('/api/leaderboard');

export default function Leaderboard() {
  return (
    <CapabilityCard<LeaderboardResponse>
      title="Leaderboard"
      description="Compare team point totals."
      load={loadLeaderboard}
      emptyMessage="No leaderboard scores yet."
      isEmpty={({ leaderboard }) => leaderboard.length === 0}
    >
      {({ leaderboard }) => (
        <ol className="list-group list-group-numbered">
          {leaderboard.map((entry) => (
            <li className="list-group-item" key={entry.teamName}>
              Rank {entry.rank}: {entry.teamName} — {entry.totalPoints} points
            </li>
          ))}
        </ol>
      )}
    </CapabilityCard>
  );
}
