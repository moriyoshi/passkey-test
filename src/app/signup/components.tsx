"use client";

import { useRef, useState } from "react";
import Form from "next/form";
import { useForm } from "react-hook-form";

import {
  usePasskey,
  encodeAuthenticatorAttestationResponse,
} from "@/lib/webauthn";

import { signup } from "./actions";

export const SignupForm = () => {
  type FormFields = { username: string };
  const { register, handleSubmit } = useForm<FormFields>();
  const [errors, setErrors] = useState<string[]>();
  const passkeyMethods = globalThis.window && usePasskey();
  const onSubmit = async ({ username }: FormFields) => {
    if (passkeyMethods === undefined) {
      return;
    }
    let authnData: string;
    try {
      const creds = await passkeyMethods.create(username);
      authnData = encodeAuthenticatorAttestationResponse(creds.response);
    } catch (e) {
      if (e instanceof Error) {
        setErrors([e.message]);
      }
      return;
    }
    await signup(authnData);
  };
  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)}>
      {errors && (
        <div className="form-errors">
          {errors.map((error, i) => (
            /* biome-ignore lint/suspicious/noArrayIndexKey: <explanation> */
            <div key={i} className="form-error">
              {error}
            </div>
          ))}
        </div>
      )}
      <div className="form-main">
        <label className="form-field">
          <span>Username</span>
          <input
            type="email"
            placeholder="Username"
            autoComplete="username"
            {...register("username", { required: true })}
          />
        </label>
      </div>
      <div className="form-footer">
        <button type="submit">
          {passkeyMethods ? "Sign up with Passkey" : "Sign up"}
        </button>
        <div className="text-sm text-center">
          <a href="/signin">Sign in</a>
        </div>
      </div>
    </form>
  );
};
