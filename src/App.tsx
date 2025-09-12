import { Button, Input, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';
import { invoke } from "@tauri-apps/api/core";

function App() {
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const auth_cookie = formData.get("auth_cookie") as string;
    const twofa_cookie = formData.get("2fa_cookie") as string;
    console.log("Auth Cookie:", auth_cookie);
    console.log("2FA Cookie:", twofa_cookie);

    invoke("fetch_avatars", { rawAuthCookie: auth_cookie, raw2faCookie: twofa_cookie })
  }

  return (
    <main>
      <MantineProvider>
        <h1>Hello World!</h1>
        <form onSubmit={handleSubmit}>
          <Input name="auth_cookie" placeholder="Auth Cookie" />
          <Input name="2fa_cookie" placeholder="2FA Cookie" />
          <Button type="submit">Fetch</Button>
        </form>
      </MantineProvider>
    </main>
  );
}

export default App;
