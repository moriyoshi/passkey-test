"use server";

import type {
  AuthenticatorTransportFuture,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/server";

import { readFile } from "node:fs/promises";
import { z } from "zod";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { decodeAuthenticatorAssertionResponse } from "@/lib/webauthn";

const passkeySchema = z.object({
  userId: z.string(),
  username: z.string(),
  id: z.string(),
  publicKey: z.string(),
  counter: z.number(),
  transports: z.array(z.string()),
  backedUp: z.boolean(),
});

export const signin = async (formData: FormData) => {
  const cookieStore = await cookies();
  const _headers = await headers();
  const authnReqJSON = cookieStore.get("authnReq");
  if (!authnReqJSON) {
    throw new Error("Authentication request not found");
  }
  const authnReq = JSON.parse(
    authnReqJSON.value,
  ) as PublicKeyCredentialRequestOptionsJSON;
  const authnData = formData.get("authnData");
  if (authnData === null) {
    throw new Error("no authnData");
  }
  const resp = decodeAuthenticatorAssertionResponse(authnData.toString());
  const passkeyData = await passkeySchema.parseAsync(
    JSON.parse((await readFile("passkey.json")).toString("utf-8")),
  );
  if (resp.userHandle !== passkeyData.userId) {
    throw new Error("UserHandle mismatch");
  }
  const { verified } = await verifyAuthenticationResponse({
    response: {
      id: ".",
      rawId: ".",
      response: resp,
      type: "public-key",
      clientExtensionResults: {},
    },
    credential: {
      id: passkeyData.id,
      publicKey: Buffer.from(passkeyData.publicKey, "base64"),
      counter: 0,
      transports: passkeyData.transports as AuthenticatorTransportFuture[],
    },
    expectedOrigin: _headers.get("origin") ?? "",
    expectedRPID: authnReq.rpId ?? "",
    expectedChallenge: authnReq.challenge,
  });
  if (verified) {
    redirect("/ok");
  }
};
