export type Guest = {
  id: string;
  name: string;
  telephone: string;
  status: "pending" | "accepted" | "declined";
};
