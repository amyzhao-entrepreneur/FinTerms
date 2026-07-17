import { join } from "path";
import { readFileSync } from "fs";
import {
  CONST_DEFAULT_WEB_CLOUD,
  RocketRideClient,
} from "rocketride";

export const RR_TIMEOUT_MS = 10_000;

const PIPE_PATH = join(process.cwd(), "finterms.pipe");
const WEBHOOK_SOURCE = "webhook_1";

function getAuth(): { uri: string; auth: string } {
  const uri = process.env.ROCKETRIDE_URI?.trim() || CONST_DEFAULT_WEB_CLOUD;
  const auth =
    process.env.ROCKETRIDE_APIKEY?.trim() ||
    process.env.ROCKETRIDE_AUTH?.trim() ||
    "";
  if (!auth) {
    throw new Error(
      "Missing ROCKETRIDE_APIKEY. Set it in .env after connecting Cursor to Rocket Ride Cloud.",
    );
  }
  return { uri, auth };
}

function projectIdFromPipe(): string {
  try {
    const raw = JSON.parse(readFileSync(PIPE_PATH, "utf8")) as {
      project_id?: string;
    };
    return raw.project_id || "";
  } catch {
    return "";
  }
}

let shared: RocketRideClient | null = null;

async function getClient(): Promise<RocketRideClient> {
  if (shared) return shared;
  const { uri, auth } = getAuth();
  const client = new RocketRideClient({ uri, auth, persist: true });
  await client.connect();
  shared = client;
  return client;
}

function extractAnswerText(result: unknown): string {
  if (result == null) return "";
  if (typeof result === "string") return result;
  const r = result as Record<string, unknown>;
  if (typeof r.answers === "string") return r.answers;
  if (Array.isArray(r.answers)) {
    return r.answers
      .map((a) => {
        if (typeof a === "string") return a;
        if (a && typeof a === "object") {
          const o = a as Record<string, unknown>;
          return String(o.text ?? o.answer ?? o.content ?? JSON.stringify(a));
        }
        return String(a);
      })
      .join("\n");
  }
  if (typeof r.answer === "string") return r.answer;
  if (typeof r.text === "string") return r.text;
  if (r.data && typeof r.data === "object") return extractAnswerText(r.data);
  return JSON.stringify(result);
}

function parseJsonFromText(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error(`Rocket Ride returned non-JSON: ${trimmed.slice(0, 240)}`);
  }
}

async function safeTerminate(
  client: RocketRideClient,
  token: string | null,
): Promise<void> {
  if (!token) return;
  try {
    await Promise.race([
      client.terminate(token),
      new Promise((r) => setTimeout(r, 1500)),
    ]);
  } catch {
    /* ignore */
  }
}

async function clearStuckRun(client: RocketRideClient): Promise<void> {
  const projectId = projectIdFromPipe();
  if (!projectId) return;
  try {
    const token = await Promise.race([
      client.getTaskToken({ projectId, source: WEBHOOK_SOURCE }),
      new Promise<undefined>((r) => setTimeout(() => r(undefined), 2000)),
    ]);
    if (token) await safeTerminate(client, token);
  } catch {
    /* ignore */
  }
}

/** Primary path: Rocket Ride Cloud webhook branch of finterms.pipe */
export async function runOnRocketRide(userMessage: string): Promise<unknown> {
  const client = await getClient();
  let token: string | null = null;

  const run = async () => {
    await clearStuckRun(client);

    let started: { token: string };
    try {
      started = (await client.use({
        filepath: PIPE_PATH,
        source: WEBHOOK_SOURCE,
      })) as { token: string };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("already running")) {
        await clearStuckRun(client);
        started = (await client.use({
          filepath: PIPE_PATH,
          source: WEBHOOK_SOURCE,
        })) as { token: string };
      } else {
        throw err;
      }
    }

    token = started.token;
    const response = await client.send(
      token,
      userMessage,
      { name: "finterms-request.txt" },
      "text/plain",
    );
    const parsed = parseJsonFromText(extractAnswerText(response));
    await safeTerminate(client, token);
    token = null;
    return parsed;
  };

  try {
    return await Promise.race([
      run(),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error(`TIMEOUT:${RR_TIMEOUT_MS}`)),
          RR_TIMEOUT_MS,
        );
      }),
    ]);
  } catch (err) {
    // Never block the request on cleanup.
    void safeTerminate(client, token).then(() => clearStuckRun(client));
    throw err;
  }
}
