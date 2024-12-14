import { SigninForm } from "./components";

export default function Home() {
  return (
    <div>
      <header>
        <h1>Sign in with Passkey</h1>
      </header>
      <main>
        <SigninForm />
      </main>
    </div>
  );
}
