const env = process.env;
import { OAuth2Client } from "google-auth-library";
import { _UserStep1 } from "../../types";

const client = new OAuth2Client();
export async function verifyGoogleToken(token: string): Promise<_UserStep1> {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.CLIENT_ID,
  });
  const payload = ticket.getPayload();
  return {
    name: payload!["given_name"] + " " + payload!["family_name"],
    email: payload!["email"] as string,
    password: null,
    picture: payload!["picture"] as string,
  };
}
