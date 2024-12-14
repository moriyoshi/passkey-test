import { SignupForm } from "./components";

export default async function () {
  return (
    <div>
      <header>
        <h1>Sign up with Passkey</h1>
      </header>
      <main>
        <SignupForm />
      </main>
    </div>
  );
}
