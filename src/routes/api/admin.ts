const env = process.env;
import { Router, Request, Response } from "express";
import { CustomResponse } from "../../response";
import { is_admin } from "../../request";

export const adminApiRouter = Router();

adminApiRouter.post("/is_admin", async (req: Request, res: Response) => {
  var out = new CustomResponse(res);
  if (!is_admin(req)) {
    await out.send_response(200, "Not an admin", { is_admin: false });
    return;
  }
  await out.send_response(200, "Admin", { is_admin: true });
  return;
});
