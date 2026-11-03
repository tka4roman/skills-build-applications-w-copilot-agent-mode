import { Types } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  return Object.assign(new Error(message), { status: 400 });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) throw badRequest('Activity details are required');
  const { userId, teamId, type, minutes } = input;
  if (typeof userId !== 'string' || typeof teamId !== 'string') {
    throw badRequest('A valid userId and teamId are required');
  }
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(teamId)) {
    throw badRequest('userId and teamId must be valid IDs');
  }
  if (typeof type !== 'string' || !type.trim()) throw badRequest('Activity type is required');
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes < 1) {
    throw badRequest('Minutes must be a positive number');
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user || !team) throw badRequest('The specified user and team must exist');

  return Activity.create({
    user: user._id,
    team: team._id,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input)) throw badRequest('Team details are required');
  const { name, mascot } = input;
  const members = input.members ?? [];
  if (typeof name !== 'string' || !name.trim()) throw badRequest('Team name is required');
  if (typeof mascot !== 'string' || !mascot.trim()) throw badRequest('Team mascot is required');
  if (!Array.isArray(members)) {
    throw badRequest('Team members must be an array of user IDs');
  }
  const memberIds = members.filter((member): member is string => typeof member === 'string');
  if (memberIds.length !== members.length) throw badRequest('Team members must be an array of user IDs');
  if (!memberIds.every((member) => Types.ObjectId.isValid(member))) {
    throw badRequest('Team members must contain valid user IDs');
  }
  const uniqueMemberIds = [...new Set(memberIds)];
  const existingMembers = await User.find({ _id: { $in: uniqueMemberIds } }).select('_id').lean();
  if (existingMembers.length !== uniqueMemberIds.length) {
    throw badRequest('Every team member must be an existing user');
  }
  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const [teams, pointTotals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: unknown; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);
  const totalsByTeam = new Map(pointTotals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));
  return teams
    .map((team) => ({ teamName: team.name, totalPoints: totalsByTeam.get(String(team._id)) ?? 0 }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  const recentActivity = await Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean();
  const activityFocus: Record<string, string> = {
    run: 'endurance',
    cycle: 'endurance',
    cycling: 'endurance',
    walk: 'mobility',
    strength: 'strength',
  };
  const workouts = await Workout.find().lean();
  const goalFocus = user.fitnessGoal;
  const recentFocus = recentActivity
    ? activityFocus[recentActivity.type.toLowerCase()] ?? recentActivity.type
    : undefined;
  const availableFocuses = new Set(workouts.map((workout) => workout.focus.toLowerCase()));
  const preferredFocus = goalFocus && availableFocuses.has(goalFocus.toLowerCase())
    ? goalFocus
    : recentFocus && availableFocuses.has(recentFocus.toLowerCase())
      ? recentFocus
      : goalFocus ?? recentFocus;
  workouts.sort((left, right) => {
    const leftMatches = left.focus.toLowerCase() === preferredFocus?.toLowerCase();
    const rightMatches = right.focus.toLowerCase() === preferredFocus?.toLowerCase();
    return Number(rightMatches) - Number(leftMatches) || left.title.localeCompare(right.title);
  });

  const reason = preferredFocus
    ? `Recommended to support your ${preferredFocus} goal and recent activity.`
    : 'Recommended based on the available workout options.';
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
