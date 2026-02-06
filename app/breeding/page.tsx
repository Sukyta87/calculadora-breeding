"use client";

import { useEffect, useState } from "react";

// TIPOS - ESSENCIAIS PARA O TYPESCRIPT NÃO RECLAMAR
type Pokemon = {
  id: number;
  name: string;
  sprite: string;
  gender_rate: number;
  egg_groups: string[];
  is_legendary: boolean;
};

type IVs = {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
};

// CONSTANTES
const stats: (keyof IVs)[] = ["hp", "atk", "def", "spa", "spd", "spe"];
const emptyIV: IVs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

const natures = [
  "Hardy","Lonely","Brave","Adamant","Naughty",
  "Bold","Docile","Relaxed","Impish","Lax",
  "Timid","Hasty","Serious","Jolly","Naive",
  "Modest","Mild","Quiet","Bashful","Rash",
  "Calm","Gentle","Sassy","Careful","Quirky"
];

const powerItems: Record<string, keyof IVs | null> = {
  Nenhum: null,
  "Power Weight": "hp",
  "Power Bracer": "atk",
  "Power Belt": "def",
  "Power Lens": "spa",
  "Power Band": "spd",
  "Power Anklet": "spe",
};

// HELPERS
function randomIV() {
  return Math.floor(Math.random() * 32);
}

function genderFromRate(rate: number) {
  if (rate === -1) return "Genderless";
  const femaleChance = rate / 8;
  return Math.random() < femaleChance ? "Female" : "Male";
}

function inheritIVs(
  father: IVs,
  mother: IVs,
  destiny: boolean,
  powerFather: keyof IVs | null,
  powerMother: keyof IVs | null
): IVs {
  const result: IVs = {
    hp: randomIV(), atk: randomIV(), def: randomIV(),
    spa: randomIV(), spd: randomIV(), spe: randomIV()
  };
  const inherited = destiny ? 5 : 3;
  const shuffled = [...stats].sort(() => Math.random() - 0.5);
  for (let i = 0; i < inherited; i++) {
    const s = shuffled[i];
    result[s] = Math.random() < 0.5 ? father[s] : mother[s];
  }
  if (powerFather) result[powerFather] = father[powerFather];
  if (powerMother) result[powerMother] = mother[powerMother];
  return result;
}

function compatibleEggGroup(a: Pokemon, b: Pokemon) {
  if (a.name === "ditto" || b.name === "ditto") return true;
  return a.egg_groups.some((g) => b.egg_groups.includes(g));
}

function babySpecies(father: Pokemon, mother: Pokemon) {
  if (mother.name === "ditto") return father.name;
  return mother.name;
}

// COMPONENTE PRINCIPAL
export default function BreedingSystem() {
  const [list, setList] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState("");
  const [father, setFather] = useState<Pokemon | null>(null);
  const [mother, setMother] = useState<Pokemon | null>(null);
  const [fatherIV, setFatherIV] = useState<IVs>(emptyIV);
  const [motherIV, setMotherIV] = useState<IVs>(emptyIV);
  const [natureFather, setNatureFather] = useState("Timid");
  const [natureMother, setNatureMother] = useState("Jolly");
  const [powerFather, setPowerFather] = useState<keyof IVs | null>(null);
  const [powerMother, setPowerMother] = useState<keyof IVs | null>(null);
  const [destiny, setDestiny] = useState(true);
  const [everstone, setEverstone] = useState(true);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000", { cache: 'no-store' });
      const data = await res.json();
      const detailed: Pokemon[] = await Promise.all(
        data.results.map(async (p: any) => {
          const poke = await fetch(p.url).then((r) => r.json());
          const species = await fetch(poke.species.url).then((r) => r.json());
          return {
            id: poke.id,
            name: poke.name,
            sprite: poke.sprites.front_default,
            gender_rate: species.gender_rate,
            egg_groups: species.egg_groups.map((g: any) => g.name),
            is_legendary: species.is_legendary,
          };
        })
      );
      setList(detailed.filter((p) => !p.is_legendary));
    }
    load();
  }, []);

  function breed() {
    if (!father || !mother) return alert("Selecione pai e mãe");
    if (!compatibleEggGroup(father, mother)) return alert("Egg group incompatível");
    const ivs = inheritIVs(fatherIV, motherIV, destiny, powerFather, powerMother);
    const gender = genderFromRate(mother.gender_rate);
    const nature = everstone ? natureMother : natures[Math.floor(Math.random() * natures.length)];
    const baby = babySpecies(father, mother);
    setResult({ species: baby, ivs, gender, nature });
  }

  const filtered = list.filter((p) => p.name.includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-800 to-black text-white p-6 font-sans">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-wide text-yellow-400 drop-shadow-lg">
          Pokédex Breeding System
        </h1>
        <p className="text-xl mt-2 opacity-80">Calcule o breeding competitivo com IVs perfeitos!</p>
      </header>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <input
          placeholder="Busque Pokémon (ex: charizard, ditto...)"
          className="w-full p-4 text-lg bg-zinc-900/80 border-2 border-yellow-400 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-500 shadow-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Lista de Pokémon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-yellow-500">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => (!father ? setFather(p) : setMother(p))}
            className={`bg-zinc-900/70 backdrop-blur-sm border-2 border-gray-700 rounded-xl p-3 hover:border-yellow-400 hover:scale-105 transition-all duration-200 shadow-md flex flex-col items-center ${
              (father?.id === p.id || mother?.id === p.id) ? "ring-4 ring-yellow-400" : ""
            }`}
          >
            {p.sprite ? (
              <img src={p.sprite} alt={p.name} className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center text-xs">
                No sprite
              </div>
            )}
            <p className="mt-2 text-sm font-semibold capitalize">{p.name}</p>
            <p className="text-xs opacity-70">#{p.id.toString().padStart(3, "0")}</p>
          </button>
        ))}
      </div>

      {/* Resultado (adicione o resto do return aqui se quiser) */}
      {result && (
        <div className="mt-12 max-w-2xl mx-auto bg-zinc-900/90 p-8 rounded-2xl border-4 border-yellow-400 shadow-2xl text-center">
          <h2 className="text-4xl font-bold text-yellow-400 mb-6">Filhote Gerado!</h2>
          <p className="text-3xl capitalize mb-4">{result.species}</p>
          <p className="text-xl mb-2">Gênero: <span className="font-bold">{result.gender}</span></p>
          <p className="text-xl mb-6">Nature: <span className="font-bold">{result.nature}</span></p>
          <pre className="text-left text-sm bg-zinc-800 p-4 rounded overflow-auto">
            {JSON.stringify(result.ivs, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}