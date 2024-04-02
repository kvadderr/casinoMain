export interface OpenGameRequest {
  cmd: string;
  hall: string;
  language: string;
  key: string;
  demo: number;
  login: number;
  gameId: number;
  bm?: string;
}