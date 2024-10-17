import { google, Auth } from "googleapis";
import { createInterface } from "readline";

const readline = createInterface({
    input: process.stdin,
    output: process.stdout
});

async function createOAuth2Client(
    clientId: string,
    clientSecret: string,
    redirectUri: string
): Promise<Auth.OAuth2Client> {
    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );

    const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
    const authorizationUrl = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
        prompt: "consent"
    });

    console.log("Authorize this app by visiting this url:", authorizationUrl);

    const authorizationCode = await new Promise<string>((resolve) => {
        readline.question("Enter the authorization code: ", (code: string) => {
            readline.close();
            resolve(code.trim());
        });
    });
    console.log("Authorization code:", authorizationCode);

    try {
        const { tokens } = await oauth2Client.getToken(authorizationCode);
        oauth2Client.setCredentials(tokens);

        console.log("Refresh token:", tokens.refresh_token);

        console.log("OAuth2 client created successfully");
        return oauth2Client;
    } catch (error) {
        console.error("Error creating OAuth2 client:", error);
        throw error;
    }
}

export function createOAuth2ClientFromRefreshToken(
    clientId: string,
    clientSecret: string,
    refreshToken: string
): Auth.OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return oauth2Client;
}

let oauth2Client: Auth.OAuth2Client | null = null;
export async function getOAuth2Client(
    clientId: string,
    clientSecret: string,
    refreshToken?: string,
    redirectUri?: string
) {
    if (oauth2Client) {
        return oauth2Client;
    }

    if (refreshToken) {
        oauth2Client = createOAuth2ClientFromRefreshToken(
            clientId,
            clientSecret,
            refreshToken
        );
    } else {
        oauth2Client = await createOAuth2Client(
            clientId,
            clientSecret,
            redirectUri ?? ""
        );
    }
    return oauth2Client;
}

export type Email = {
    to: string;
    subject: string;
    body: string;
};
export async function sendEmail(
    auth: Auth.OAuth2Client,
    email: Email
): Promise<void> {
    const gmail = google.gmail({ version: "v1", auth });

    const message = [
        `To: ${email.to}`,
        `Subject: ${email.subject}`,
        "",
        email.body
    ].join("\n");

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    try {
        await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage
            }
        });
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}
