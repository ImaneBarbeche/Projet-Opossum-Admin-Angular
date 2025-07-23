export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  is_revoked: boolean;
  created_at: Date;
}