export const PARTICIPANTS = [
  '김형진',
  '노다비',
  '정진철',
  '최용선',
  '지서연',
  '황차해',
  '양한목',
  '신국희',
  '김민철',
] as const;

export type Participant = (typeof PARTICIPANTS)[number];

export function selectRandomTwo(): [Participant, Participant] {
  const shuffled = [...PARTICIPANTS].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}
