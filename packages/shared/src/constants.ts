export const GAME_NUMBERS = Array.from({ length: 19 }, (_, i) => i); // 0-18

export const BET_MIN = 10;
export const BET_MAX = 1000;

export const ROUND_DURATION_MINUTES = 5;
export const ROUND_CLOSE_WARNING_SECONDS = 30;
export const ROUND_DRAW_DURATION_SECONDS = 20;

export const SOCKET_ROOMS = {
  branch: (branchId: number) => `branch:${branchId}`,
  ticket: (uuid: string) => `ticket:${uuid}`,
} as const;
