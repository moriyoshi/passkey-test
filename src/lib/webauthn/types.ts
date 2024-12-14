import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";

export type PasskeyMethods = {
  get: (username?: string) => Promise<AuthenticationResponseJSON>;
  create: (username: string) => Promise<RegistrationResponseJSON>;
  onConditionalMediationAvailable: (
    callback: (creds: AuthenticationResponseJSON) => Promise<void>,
  ) => Promise<void>;
};

export type PasskeyOptions = {
  useConditionalMediation?: boolean;
};

export type WebAuthnServerAPI = {
  generateCreationOptions: (
    username: string,
  ) => Promise<PublicKeyCredentialCreationOptionsJSON>;
  generateRequestOptions: (
    username?: string,
  ) => Promise<PublicKeyCredentialRequestOptionsJSON>;
};

export type SimpleWebAuthn = {
  startRegistration: (options: {
    optionsJSON: PublicKeyCredentialCreationOptionsJSON;
    useAutoRegister?: boolean;
  }) => Promise<RegistrationResponseJSON>;
  startAuthentication: (options: {
    optionsJSON: PublicKeyCredentialRequestOptionsJSON;
    useBrowserAutofill?: boolean;
    verifyBrowserAutofillInput?: boolean;
  }) => Promise<AuthenticationResponseJSON>;
  browserSupportsWebAuthnAutofill: () => Promise<boolean>;
};
