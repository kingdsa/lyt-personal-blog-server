export interface GenerateTokenDto {
  sub: string;
  username: string;
  roles: string[];
}

export interface VerifyTokenDto {
  token: string;
}

export interface DecodeTokenDto {
  token: string;
}
