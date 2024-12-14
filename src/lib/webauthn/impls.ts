import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/browser";
import type {
  PasskeyOptions,
  SimpleWebAuthn,
  WebAuthnServerAPI,
} from "./types";

export class PasskeyMethodsImpl {
  readonly simpleWebAuthn: SimpleWebAuthn;
  readonly serverAPI: WebAuthnServerAPI;

  async get(username?: string): Promise<AuthenticationResponseJSON> {
    return this.simpleWebAuthn.startAuthentication({
      optionsJSON: await this.serverAPI.generateRequestOptions(username),
      useBrowserAutofill: true,
      verifyBrowserAutofillInput: false,
    });
  }

  async create(username: string): Promise<RegistrationResponseJSON> {
    return this.simpleWebAuthn.startRegistration({
      optionsJSON: await this.serverAPI.generateCreationOptions(username),
      useAutoRegister: true,
    });
  }

  async onConditionalMediationAvailable(
    callback: (creds: AuthenticationResponseJSON) => Promise<void>,
  ): Promise<void> {
    if (
      this.options?.useConditionalMediation &&
      (await this.simpleWebAuthn.browserSupportsWebAuthnAutofill())
    ) {
      let creds: AuthenticationResponseJSON;
      try {
        creds = await this.get();
      } catch (e) {
        console.info(e);
        return;
      }
      await callback(creds);
    }
  }

  constructor(
    dependencies: {
      simpleWebAuthn: SimpleWebAuthn;
      api: WebAuthnServerAPI;
    },
    readonly options?: PasskeyOptions,
  ) {
    this.simpleWebAuthn = dependencies.simpleWebAuthn;
    this.serverAPI = dependencies.api;
  }
}

export class WebAuthnAPIStub {
  async generateCreationOptions(
    username: string,
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const resp = await fetch(`${this.baseURL}/initiate-registration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    return await resp.json();
  }

  async generateRequestOptions(
    username?: string,
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const resp = await fetch(`${this.baseURL}/initiate-authentication`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });
    return await resp.json();
  }

  constructor(readonly baseURL: string) {}
}
