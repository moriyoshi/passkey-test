import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { z } from "zod";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

const paramsSchema = z.object({
  username: z.string().optional(),
});

export const POST = async (request: NextRequest) => {
  const params = await paramsSchema.parseAsync(await request.json());
  const options = await generateAuthenticationOptions({
    rpID: new URL(request.nextUrl.origin).hostname,
    userVerification: "preferred",
  });
  const resp = NextResponse.json(options);
  resp.cookies.set("authnReq", JSON.stringify(options));
  return resp;
};
