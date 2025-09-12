import { Button, Input, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { useState } from "react";

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

function App() {
  const [flag, setFlag] = useState(false);
  const [authCookie, setAuthCookie] = useState("");
  const [twofaCookie, setTwofaCookie] = useState("");
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFlag(true);
  };

  return (
    <main>
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <h1>Hello World!</h1>
          <form onSubmit={handleSubmit}>
            <Input placeholder="Auth Cookie" onInput={(e) => setAuthCookie(e.currentTarget.value)} />
            <Input placeholder="2FA Cookie" onInput={(e) => setTwofaCookie(e.currentTarget.value)} />
            <Button type="submit">Fetch</Button>
          </form>
          {flag && <AvatarList rawAuthCookie={authCookie} raw2faCookie={twofaCookie} />}
        </MantineProvider>
      </QueryClientProvider>
    </main>
  );
}

export default App;
