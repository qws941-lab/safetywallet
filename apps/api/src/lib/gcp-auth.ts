export interface GcpCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
  location?: string;
}

interface CachedToken {
  credentialsKey: string;
  accessToken: string;
  expiresAt: number;
}

const OAUTH_SCOPE = "https://www.googleapis.com/auth/cloud-platform";
const OAUTH_AUDIENCE = "https://oauth2.googleapis.com/token";
const DEFAULT_LOCATION = "us-central1";

let cachedToken: CachedToken | null = null;

function base64UrlEncode(input: Uint8Array): string {
  let binary = "";
  const chunkSize = 8192;
  for (let i = 0; i < input.length; i += chunkSize) {
    binary += String.fromCharCode(...input.subarray(i, i + chunkSize));
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function encodeJsonBase64Url(value: unknown): string {
  const encoded = new TextEncoder().encode(JSON.stringify(value));
  return base64UrlEncode(encoded);
}

async function importPrivateKey(privateKey: string): Promise<CryptoKey> {
  const pemContents = privateKey.replace(
    /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n|\r/g,
    "",
  );
  const binaryKey = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

async function createServiceAccountJwt(
  credentials: GcpCredentials,
): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: credentials.clientEmail,
    scope: OAUTH_SCOPE,
    aud: OAUTH_AUDIENCE,
    iat: now,
    exp: now + 3600,
  };

  const encodedHeader = encodeJsonBase64Url(header);
  const encodedPayload = encodeJsonBase64Url(payload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const key = await importPrivateKey(credentials.privateKey);
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedToken),
  );

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function getCredentialsCacheKey(credentials: GcpCredentials): string {
  return [
    credentials.projectId,
    credentials.clientEmail,
    credentials.privateKey,
    credentials.location ?? DEFAULT_LOCATION,
  ].join("|");
}

export async function getVertexAccessToken(
  credentials: GcpCredentials,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const credentialsKey = getCredentialsCacheKey(credentials);

  if (
    cachedToken &&
    cachedToken.credentialsKey === credentialsKey &&
    now < cachedToken.expiresAt
  ) {
    return cachedToken.accessToken;
  }

  const assertion = await createServiceAccountJwt(credentials);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const response = await fetch(OAUTH_AUDIENCE, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Failed to obtain Vertex access token: ${response.status} ${details}`,
    );
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token || typeof payload.expires_in !== "number") {
    throw new Error("Invalid OAuth token response from Google");
  }

  cachedToken = {
    credentialsKey,
    accessToken: payload.access_token,
    expiresAt: now + Math.max(payload.expires_in - 60, 0),
  };

  return cachedToken.accessToken;
}

export function getVertexEndpoint(
  credentials: GcpCredentials,
  model: string,
): string {
  const location = credentials.location ?? DEFAULT_LOCATION;
  return `https://${location}-aiplatform.googleapis.com/v1/projects/${credentials.projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
}
