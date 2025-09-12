import { Button, MantineProvider } from "@mantine/core";
import '@mantine/core/styles.css';
import { invoke } from "@tauri-apps/api/core";

function App() {
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    <main>
      <MantineProvider>
        <h1>Hello World!</h1>
        <Button>Click me!</Button>
      </MantineProvider>
    </main>
  );
}

export default App;
