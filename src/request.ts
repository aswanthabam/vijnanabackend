import { Request } from "express";
import { UserI } from "./models/User";
export default class CustomRequest extends Request {
  is_authenticated: boolean = false;
  is_admin: boolean = false;
  user: UserI | null | undefined;
}
export function is_authenticated(req: Request): boolean {
  return (req as any as CustomRequest).is_authenticated;
}
export function authenticated_user(req: Request): UserI | null | undefined {
  return (req as any as CustomRequest).user;
}
export function is_admin(req: Request): boolean {
  return (req as any as CustomRequest).is_admin;
}
