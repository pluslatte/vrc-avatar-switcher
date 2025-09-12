import { Button, Input, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  thumbnailImageUrl: string;
}

interface AvatarListProps {
  rawAuthCookie: string;
  raw2faCookie: string;
}
const AvatarList = (props: AvatarListProps) => {
  const query = useQuery({
    queryKey: ['avatars', props.rawAuthCookie, props.raw2faCookie], queryFn: async () => (
      await invoke<Avatar[]>(
        "command_fetch_avatars",
        {
          rawAuthCookie: props.rawAuthCookie,
          raw2faCookie: props.raw2faCookie
        }
      )
    )
  });

  return (<div>
    {query.isPending && <div>Loading...</div>}
    {query.isError && <div>Error: {(query.error as Error).message}</div>}
    {query.data && (
      <ul>
        {query.data.map(avatar => (
          <li key={avatar.id}>
            <img src={avatar.thumbnailImageUrl} alt={avatar.name} />
            <p>{avatar.name}</p>
          </li>
        ))}
      </ul>
    )}
  </div>
  );
}

interface CommandLoginOk {
  status: 'Success' | 'Requires2FA' | 'RequiresEmail2FA';
  auth_cookie: string;
  two_fa_cookie: string | null;
}

interface Command2FAOk {
  auth_cookie: string;
  two_fa_cookie: string | null;
}

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"login" | "2fa" | "email2fa" | "done">("login");
  const [authCookie, setAuthCookie] = useState("");
  const [twofaCookie, setTwofaCookie] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await invoke<CommandLoginOk>(
        "command_new_auth",
        { username, password }
      );
      if (result.status === 'Success') {
        setStep("done");
        const store = await load('auth.json');
        await store.set('auth_cookie', result.auth_cookie);
        await store.set('two_fa_cookie', result.two_fa_cookie);
        await store.save();
      } else if (result.status === 'Requires2FA') {
        setAuthCookie(result.auth_cookie);
        setTwofaCookie(result.two_fa_cookie || "");
        setStep("2fa");
      } else if (result.status === 'RequiresEmail2FA') {
        setAuthCookie(result.auth_cookie);
        setTwofaCookie(result.two_fa_cookie || "");
        setStep("email2fa");
      } else {
        console.error("Unknown login status:", result.status);
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await invoke<Command2FAOk>(
        "command_2fa",
        { rawAuthCookie: authCookie, raw2faCookie: twofaCookie, username, password, twoFaCode: code }
      );
      setStep("done");
      const store = await load('auth.json');
      await store.set('auth_cookie', result.auth_cookie);
      await store.set('two_fa_cookie', result.two_fa_cookie);
      await store.save();
    } catch (error) {
      console.error("2FA submission failed:", error);
    }
  };
  const handleEmail2FASubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const result = await invoke<Command2FAOk>(
        "command_email_2fa",
        { rawAuthCookie: authCookie, raw2faCookie: twofaCookie, username, password, twoFaCode: code }
      );
      setStep("done");
      const store = await load('auth.json');
      await store.set('auth_cookie', result.auth_cookie);
      await store.set('two_fa_cookie', result.two_fa_cookie);
      await store.save();
    } catch (error) {
      console.error("Email 2FA submission failed:", error);
    }
  };

  const checkStoredAuth = async () => {
    const store = await load('auth.json');
    const storedAuthCookie = await store.get('auth_cookie') as string | undefined;
    const storedTwofaCookie = await store.get('two_fa_cookie') as string | undefined;

    if (storedAuthCookie && storedTwofaCookie) {
      setStep("done");
    }
  };
  useEffect(() => {
    checkStoredAuth();
  }, []);

  return (
    <div>
      {step === "login" && (
        <form onSubmit={handleLoginSubmit}>
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit">Login</Button>
        </form>
      )}
      {step === "2fa" && (
        <form onSubmit={handle2FASubmit}>
          <Input placeholder="2FA Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit">Submit 2FA</Button>
        </form>
      )}
      {step === "email2fa" && (
        <form onSubmit={handleEmail2FASubmit}>
          <Input placeholder="Email 2FA Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button type="submit">Submit Email 2FA</Button>
        </form>
      )}
      {step === "done" && <div>Login successful!</div>}
    </div>
  );
};

function App() {
  // const [flag, setFlag] = useState(false);
  // const [authCookie, setAuthCookie] = useState("");
  // const [twofaCookie, setTwofaCookie] = useState("");
  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setFlag(true);
  // };

  return (
    <main>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <h1>Hello World!</h1>
          {/* <form onSubmit={handleSubmit}>
            <Input placeholder="Auth Cookie" onInput={(e) => setAuthCookie(e.currentTarget.value)} />
            <Input placeholder="2FA Cookie" onInput={(e) => setTwofaCookie(e.currentTarget.value)} />
            <Button type="submit">Fetch</Button>
          </form> */}
          <LoginForm />
          {/* {flag && <AvatarList rawAuthCookie={authCookie} raw2faCookie={twofaCookie} />} */}
        </MantineProvider>
      </QueryClientProvider>
    </main>
  );
}

export default App;
