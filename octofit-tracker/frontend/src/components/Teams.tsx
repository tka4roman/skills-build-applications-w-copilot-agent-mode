import { CapabilityCard } from './CapabilityCard.js';

type TeamResponse = {
  teams: Array<{ name: string; mascot?: string; members: Array<string | { name?: string }> }>;
};

export default function Teams() {
  return (
    <CapabilityCard<TeamResponse>
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
      emptyMessage="No teams yet."
      isEmpty={({ teams }) => teams.length === 0}
    >
      {({ teams }) => (
        <ul className="list-group">
          {teams.map((team) => (
            <li className="list-group-item" key={team.name}>
              <strong>{team.name}</strong>
              {team.mascot ? ` — ${team.mascot}` : ''}
              {team.members.length > 0 && (
                <span> Members: {team.members.map((member) => typeof member === 'string' ? member : member.name ?? 'Member').join(', ')}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
