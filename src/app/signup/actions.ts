"use server";

import { writeFile } from "node:fs/promises";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { PublicKeyCredentialCreationOptionsJSON } from "@simplewebauthn/server";

import { decodeAuthenticatorAttestationResponse } from "@/lib/webauthn";
import { verifyRegistrationResponse } from "@simplewebauthn/server";

export const signup = async (authnData: string) => {
  const cookieStore = await cookies();
  const _headers = await headers();
  const authnReqJSON = cookieStore.get("authnReq");
  if (!authnReqJSON) {
    throw new Error("Authentication request not found");
  }
  const authnReq = JSON.parse(
    authnReqJSON.value,
  ) as PublicKeyCredentialCreationOptionsJSON;
  const { verified, registrationInfo } = await verifyRegistrationResponse({
    response: {
      id: ".",
      rawId: ".",
      type: "public-key",
      clientExtensionResults: {},
      response: decodeAuthenticatorAttestationResponse(authnData.toString()),
    },
    expectedChallenge: authnReq.challenge,
    expectedRPID: authnReq.rp.id,
    expectedOrigin: _headers.get("origin") ?? "",
  });
  if (!verified) {
    throw new Error("Registration failed");
  }
  if (!registrationInfo) {
    throw new Error("Registration info not available");
  }
  await writeFile(
    "passkey.json",
    JSON.stringify({
      userId: authnReq.user.id,
      username: authnReq.user.name,
      id: registrationInfo.credential.id,
      publicKey: Buffer.from(registrationInfo.credential.publicKey).toString(
        "base64",
      ),
      counter: registrationInfo.credential.counter,
      transports: registrationInfo.credential.transports,
      backedUp: registrationInfo.credentialBackedUp,
    }),
  );
  redirect("/ok");
};
