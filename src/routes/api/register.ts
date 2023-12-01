const env = process.env;
import { OAuth2Client } from "google-auth-library";
import { _UserStep1 } from "../../types";

const client = new OAuth2Client();
export async function verifyGoogleToken(token: string): Promise<_UserStep1> {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  console.log(payload);
  const userid = payload!["sub"];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  return {
    name: payload!["given_name"] + " " + payload!["family_name"],
    email: payload!["email"] as string,
    password: null,
    picture: payload!["picture"] as string,
  };
}
