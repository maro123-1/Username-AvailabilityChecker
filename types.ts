
export interface PlatformAvailability {
  instagram: boolean;
  tiktok: boolean;
  x: boolean;
  snapchat: boolean;
  youtube: boolean;
}

export interface UsernameInfo {
  name: string;
  availability: PlatformAvailability;
}

export enum AppStatus {
  Idle,
  Loading,
  Success,
  Error,
}
