import type { NextRequest } from "next/server";

import { z } from "zod";
import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { randomUUID } from "node:crypto";

const paramsSchema = z.object({
  username: z.string(),
});

export const POST = async (request: NextRequest) => {
  const params = await paramsSchema.parseAsync(await request.json());
  const userID = new Uint8Array(
    Array.from(randomUUID().matchAll(/[0-9a-fA-F]{2}/g)).map(([m]) =>
      Number.parseInt(m, 16),
    ),
  );
  const hostname = request.headers.get("host")?.replace(/:\d+$/, "") || request.nextUrl.hostname;
  const options = await generateRegistrationOptions({
    rpName: "RELYING PARTY",
    rpID: hostname,
    userName: params.username,
    userID: userID,
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "preferred",
      requireResidentKey: true,
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
  });
  const resp = NextResponse.json(options);
  resp.cookies.set("authnReq", JSON.stringify(options));
  return resp;
};
