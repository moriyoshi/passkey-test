"use client";

import type { FunctionComponent, ReactNode } from "react";
import type { PasskeyMethods } from "./types";

import { createContext, useContext, useEffect, useState } from "react";
import * as simpleWebAuthn from "@simplewebauthn/browser";
import { PasskeyMethodsImpl, WebAuthnAPIStub } from "./impls";

const passkeyContext = createContext<PasskeyMethods | undefined>(undefined);

export const usePasskey = () => {
  return useContext(passkeyContext);
};

export const PasskeyContext: FunctionComponent<{
  useConditionalMediation?: boolean;
  children: ReactNode;
}> = ({ useConditionalMediation, children }) => {
  const [passkeyMethods, setPassKeyMethods] = useState<
    PasskeyMethods | undefined
  >(undefined);
  useEffect(() => {
    if (window.PublicKeyCredential === undefined) {
      return;
    }
    const methods = new PasskeyMethodsImpl(
      {
        simpleWebAuthn,
        api: new WebAuthnAPIStub("/_/webauthn"),
      },
      {
        useConditionalMediation,
      },
    );
    setPassKeyMethods(methods);
  }, [useConditionalMediation]);

  return (
    <passkeyContext.Provider value={passkeyMethods}>
      {children}
    </passkeyContext.Provider>
  );
};
