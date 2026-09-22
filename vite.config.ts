import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// "/mozservices/" tem de bater certo com o nome do repositório no GitHub
// (https://github.com/teu-usuario/mozservices → base "/mozservices/").
// Se o teu repositório tiver outro nome, muda aqui.
export default defineConfig({
  base: "/mozservices/",
  plugins: [react()],
});
