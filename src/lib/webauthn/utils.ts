import type {
  AuthenticationResponseJSON,
  AuthenticatorAssertionResponseJSON,
  AuthenticatorAttestationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";

export const encodeAuthenticatorAssertionResponse = (
  response: AuthenticatorAssertionResponseJSON,
) =>
  [
    response.authenticatorData,
    response.clientDataJSON,
    response.signature,
    response.userHandle ?? "",
  ].join(".");

export const decodeAuthenticatorAssertionResponse = (
  encoded: string,
): AuthenticatorAssertionResponseJSON => {
  const parts = encoded.split(".");
  return {
    authenticatorData: parts[0],
    clientDataJSON: parts[1],
    signature: parts[2],
    userHandle: parts[3] || undefined,
  };
};

export const encodeAuthenticatorAttestationResponse = (
  response: AuthenticatorAttestationResponseJSON,
) => {
  const alg = 4294967296 + (response.publicKeyAlgorithm ?? 0);
  return [
    response.attestationObject,
    response.authenticatorData,
    response.clientDataJSON,
    btoa(
      String.fromCharCode(
        (alg >> 24) & 0xff,
        (alg >> 16) & 0xff,
        (alg >> 8) & 0xff,
        alg & 0xff,
      ),
    ),
    response.publicKey ?? "",
    ...(response.transports ?? []),
  ].join(".");
};

export const decodeAuthenticatorAttestationResponse = (
  encoded: string,
): AuthenticatorAttestationResponseJSON => {
  const parts = encoded.split(".");
  const alg = Number.parseInt(
    atob(parts[3])
      .split("")
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(""),
    16,
  );
  return {
    attestationObject: parts[0],
    authenticatorData: parts[1],
    clientDataJSON: parts[2],
    publicKeyAlgorithm: alg >= 2147483648 ? alg - 4294967296 : alg,
    publicKey: parts[4],
    transports: parts.slice(5) as AuthenticatorTransportFuture[],
  };
};
