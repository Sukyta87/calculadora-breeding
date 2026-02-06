"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ================= CONFIG =================

const STATS = ["HP", "Atk", "Def", "SpA", "SpD", "Spe"] as const;
const MAX_IV = 31;

// ================= SUPABASE SETUP =================

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ================= UTIL =================

function randomIV() {
  return Math.floor(Math.random() * (MAX_IV + 1));
}

function inheritIVs(mother: number[], father: number[]) {
  const child = Array(6).fill(0);

  const chosen = new Set<number>();
  while (chosen.size < 5) chosen.add(Math.floor(Math.random() * 6));

  chosen.forEach((i) => {
    child[i] = Math.random() < 0.5 ? mother[i] : father[i];
  });

  for (let i = 0; i < 6; i++) {
    if (!chosen.has(i)) child[i] = randomIV();
  }

  return child;
}

// ================= COMPONENT =================

export default function Home() {
  const [pokemonList, setPokemonList] = useState<string[]>([]);
  const [pokemon1, setPokemon1] = useState("");
  const [pokemon2, setPokemon2] = useState("");

  const [ivsMother, setIvsMother] = useState<number[]>(Array(6).fill(31));
  const [ivsFather, setIvsFather] = useState<number[]>(Array(6).fill(31));

  const [natureMother] = useState("Adamant");
  const [natureFather] = useState("Adamant");

  const [result, setResult] = useState<string | null>(null);
  const [childIVs, setChildIVs] = useState<number[] | null>(null);

  const [user, setUser] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);

  // ================= LOAD ALL 1000+ POKÉMON =================

  useEffect(() => {
    async function loadPokemon() {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
      const data = await res.json();
      setPokemonList(data.results.map((p: any) => p.name));
    }

    loadPokemon();
  }, []);

  // ================= AUTH DISCORD =================

  async function loginDiscord() {
    await supabase.auth.signInWithOAuth({ provider: "discord" });
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // ================= BREED =================

  function breed() {
    if (!pokemon1 || !pokemon2) {
      setResult("Selecione os dois Pokémon.");
      return;
    }

    const child = inheritIVs(ivsMother, ivsFather);
    const nature = Math.random() < 0.5 ? natureMother : natureFather;

    setChildIVs(child);
    setResult(`Filhote: ${pokemon1} | Nature: ${nature}`);
  }

  // ================= SAVE ONLINE =================

  async function saveBreed() {
    if (!user || !childIVs) return alert("Faça login primeiro");

    await supabase.from("breeds").insert({
      user_id: user.id,
      pokemon: pokemon1,
      ivs: childIVs,
    });

    loadRanking();
    alert("Breed salvo online!");
  }

  // ================= RANKING =================

  async function loadRanking() {
    const { data } = await supabase
      .from("breeds")
      .select("user_id")
      .order("user_id", { ascending: true });

    const counts: Record<string, number> = {};

    data?.forEach((b: any) => {
      counts[b.user_id] = (counts[b.user_id] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .map(([user, total]) => ({ user, total }))
      .sort((a, b) => b.total - a.total);

    setRanking(sorted);
  }

  useEffect(() => {
    loadRanking();
  }, []);

  // ================= UI =================

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl bg-zinc-900 text-white">
        <CardContent className="flex flex-col gap-4 p-6">
          <h1 className="text-2xl font-bold text-center">Sistema Profissional de Breeding</h1>

          {!user && <Button onClick={loginDiscord}>Login com Discord</Button>}

          <Tabs defaultValue="breed">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="breed">Breeding</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="breed" className="flex flex-col gap-3">
              <Input placeholder="Pokémon mãe" list="pokemon" value={pokemon1} onChange={(e) => setPokemon1(e.target.value)} />
              <Input placeholder="Pokémon pai" list="pokemon" value={pokemon2} onChange={(e) => setPokemon2(e.target.value)} />

              <datalist id="pokemon">
                {pokemonList.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>

              <Button onClick={breed}>Gerar filhote</Button>
              <Button onClick={saveBreed} variant="secondary">Salvar online</Button>

              {result && <p className="text-center">{result}</p>}

              {childIVs && (
                <div className="grid grid-cols-3 gap-2">
                  {childIVs.map((v, i) => (
                    <div key={i} className="bg-zinc-800 p-2 rounded text-center">
                      {STATS[i]}: {v}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="ranking">
              <div className="flex flex-col gap-2">
                {ranking.map((r, i) => (
                  <div key={i} className="bg-zinc-800 p-3 rounded flex justify-between">
                    <span>Player {r.user}</span>
                    <span>{r.total} breeds</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <p>Histórico online em breve…</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}
