import { createClient } from "@supabase/supabase-js";

// Nota: o cliente não usa o generic <Database> do supabase-js aqui porque a
// tipagem manual em database.types.ts serve para tipar o estado da aplicação
// (useState, props), não para satisfazer o contrato genérico completo que o
// supabase-js exige (que inclui "Relationships" por tabela). Para gerar
// tipos 100% compatíveis com o cliente, correr:
//   supabase gen types typescript --project-id <PROJECT_REF> > src/types/database.types.ts
// e voltar a passar createClient<Database>(...).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não definidos. Configure o ficheiro .env."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
