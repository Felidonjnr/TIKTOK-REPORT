export interface SessionContext {
  team_member: string;
  team: "A" | "B";
  instructor: string;
  target_account: string;
  date: string;
}

export interface ExtractedData {
  subscriber_name: string;
  tiktok_handle: string;
  time: string;
}

export interface Entry extends ExtractedData {
  id: string;
  team_member: string;
  team: string;
  instructor: string;
  target_account: string;
  type: "New" | "Renewal";
  date: string;
  screenshot_ref?: string; // We'll keep it simple or base64 thumbnail
  created_at: number;
}
