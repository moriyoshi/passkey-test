"use client";

import { useEffect, useRef } from "react";
import Form from "next/form";

import {
  encodeAuthenticatorAssertionResponse,
  usePasskey,
} from "@/lib/webauthn";
import { signin } from "./actions";

export const SigninForm = () => {
  const passkeyMethods = usePasskey();
  const usernameRef = useRef<HTMLInputElement>(null);
  const authnDataRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    passkeyMethods?.onConditionalMediationAvailable(async (creds) => {
      if (authnDataRef.current === null) {
        return;
      }
      authnDataRef.current.value = encodeAuthenticatorAssertionResponse(
        creds.response,
      );
      formRef.current?.requestSubmit();
    });
  }, [passkeyMethods]);
  return (
    <Form ref={formRef} className="form" action={signin}>
      <div className="form-main">
        <label className="form-field">
          <span>Username</span>
          <input
            ref={usernameRef}
            type="email"
            placeholder="Username"
            name="username"
            autoComplete="username webauthn"
          />
          <input ref={authnDataRef} type="hidden" name="authnData" value="" />
        </label>
      </div>
      <div className="form-footer">
        {passkeyMethods && <button type="submit">Sign in</button>}
        <div className="text-sm text-center">
          <a href="/signup">Sign up</a>
        </div>
      </div>
    </Form>
  );
};
