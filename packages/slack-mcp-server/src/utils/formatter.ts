export function formatMessage(msg: Record<string, unknown>): string {
  const user = (msg.user as string) || 'unknown';
  const text = (msg.text as string) || '';
  const ts = msg.ts as string;
  const threadTs = msg.thread_ts as string | undefined;
  const reactions = msg.reactions as Array<{ name: string; count: number }> | undefined;

  let result = `[${ts}] <${user}>: ${text}`;
  if (threadTs && threadTs !== ts) {
    result += ` (thread: ${threadTs})`;
  }
  if (reactions && reactions.length > 0) {
    const rxns = reactions.map((r) => `:${r.name}: (${r.count})`).join(' ');
    result += `\n  Reactions: ${rxns}`;
  }
  return result;
}

export function formatChannel(ch: Record<string, unknown>): string {
  const id = ch.id as string;
  const name = ch.name as string;
  const topic = (ch.topic as Record<string, string>)?.value || '';
  const purpose = (ch.purpose as Record<string, string>)?.value || '';
  const memberCount = ch.num_members as number | undefined;

  let result = `#${name} (${id})`;
  if (topic) result += ` — Topic: ${topic}`;
  if (purpose) result += ` — Purpose: ${purpose}`;
  if (memberCount !== undefined) result += ` — Members: ${memberCount}`;
  return result;
}

export function formatUser(user: Record<string, unknown>): string {
  const id = user.id as string;
  const name = user.name as string;
  const profile = user.profile as Record<string, string> | undefined;
  const realName = profile?.real_name || (user.real_name as string) || '';
  const displayName = profile?.display_name || '';
  const email = profile?.email || '';

  let result = `@${name} (${id})`;
  if (realName) result += ` — ${realName}`;
  if (displayName && displayName !== realName) result += ` [${displayName}]`;
  if (email) result += ` <${email}>`;
  return result;
}

export function formatUserGroup(ug: Record<string, unknown>): string {
  const id = ug.id as string;
  const name = ug.name as string;
  const handle = ug.handle as string;
  const description = ug.description as string | undefined;
  const userCount = ug.user_count as number | undefined;

  let result = `@${handle} — ${name} (${id})`;
  if (description) result += ` — ${description}`;
  if (userCount !== undefined) result += ` — Members: ${userCount}`;
  return result;
}
