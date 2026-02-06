"use client";

import { useEffect, useState } from "react";

// -------------------- TIPOS --------------------
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

// -------------------- CONSTANTES --------------------
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

// -------------------- HELPERS --------------------
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

// -------------------- COMPONENTE --------------------
export default function BreedingSystem() {
  const [list, setList] = useState<Pokemon[]>([]);
  const [searchFather, setSearchFather] = useState("");
  const [searchMother, setSearchMother] = useState("");
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
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
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

  const filteredFather = list.filter((p) => p.name.includes(searchFather.toLowerCase()));
  const filteredMother = list.filter((p) => p.name.includes(searchMother.toLowerCase()));

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Breeding Competitivo</h1>

      {/* PAI e MÃE lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* PAI */}
        <div>
          <h2 className="text-2xl font-bold mb-2 text-blue-400">Pai</h2>
          <input
            placeholder="Buscar Pokémon Pai..."
            className="w-full p-2 mb-2 bg-zinc-900 rounded border border-blue-500 focus:border-blue-400"
            value={searchFather}
            onChange={(e) => setSearchFather(e.target.value)}
          />
          <div className="grid grid-cols-6 gap-2 max-h-64 overflow-auto">
            {filteredFather.map((p) => (
              <button
                key={p.id}
                className={`bg-zinc-900 p-2 rounded text-xs flex flex-col items-center justify-center border ${father?.id === p.id ? "border-blue-500" : "border-zinc-700"}`}
                onClick={() => setFather(p)}
              >
                {p.sprite ? (
                  <img
                    src={p.sprite}
                    alt={p.name}
                    className="w-12 h-12 object-contain mb-1"
                  />
                ) : (
                  <div className="w-12 h-12 bg-zinc-800 rounded mb-1 flex items-center justify-center text-[10px]">
                    ?
                  </div>
                )}
                <span className="capitalize">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MÃE */}
        <div>
          <h2 className="text-2xl font-bold mb-2 text-pink-400">Mãe</h2>
          <input
            placeholder="Buscar Pokémon Mãe..."
            className="w-full p-2 mb-2 bg-zinc-900 rounded border border-pink-500 focus:border-pink-400"
            value={searchMother}
            onChange={(e) => setSearchMother(e.target.value)}
          />
          <div className="grid grid-cols-6 gap-2 max-h-64 overflow-auto">
            {filteredMother.map((p) => (
              <button
                key={p.id}
                className={`bg-zinc-900 p-2 rounded text-xs flex flex-col items-center justify-center border ${mother?.id === p.id ? "border-pink-500" : "border-zinc-700"}`}
                onClick={() => setMother(p)}
              >
                {p.sprite ? (
                  <img
                    src={p.sprite}
                    alt={p.name}
                    className="w-12 h-12 object-contain mb-1"
                  />
                ) : (
                  <div className="w-12 h-12 bg-zinc-800 rounded mb-1 flex items-center justify-center text-[10px]">
                    ?
                  </div>
                )}
                <span className="capitalize">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* IVs */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h2>IVs do Pai</h2>
          {stats.map((s) => (
            <input key={s} type="number" value={fatherIV[s]} min={0} max={31}
              onChange={(e) => setFatherIV({ ...fatherIV, [s]: Number(e.target.value) })}
              className="w-full bg-zinc-900 p-1 mb-1" />
          ))}
        </div>
        <div>
          <h2>IVs da Mãe</h2>
          {stats.map((s) => (
            <input key={s} type="number" value={motherIV[s]} min={0} max={31}
              onChange={(e) => setMotherIV({ ...motherIV, [s]: Number(e.target.value) })}
              className="w-full bg-zinc-900 p-1 mb-1" />
          ))}
        </div>
      </div>

      {/* Natures */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <select value={natureFather} onChange={(e) => setNatureFather(e.target.value)} className="bg-zinc-900 p-2">
          {natures.map((n) => <option key={n}>{n}</option>)}
        </select>
        <select value={natureMother} onChange={(e) => setNatureMother(e.target.value)} className="bg-zinc-900 p-2">
          {natures.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>

      {/* Power Items */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <select onChange={(e) => setPowerFather(powerItems[e.target.value])} className="bg-zinc-900 p-2">
          {Object.keys(powerItems).map((k) => <option key={k}>{k}</option>)}
        </select>
        <select onChange={(e) => setPowerMother(powerItems[e.target.value])} className="bg-zinc-900 p-2">
          {Object.keys(powerItems).map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      {/* Toggles */}
      <div className="mt-4 space-x-4">
        <label><input type="checkbox" checked={destiny} onChange={(e) => setDestiny(e.target.checked)} /> Destiny Knot</label>
        <label><input type="checkbox" checked={everstone} onChange={(e) => setEverstone(e.target.checked)} /> Everstone</label>
      </div>

      <button onClick={breed} className="mt-6 bg-blue-600 px-4 py-2 rounded">BREEDAR</button>

      {result && (
        <div className="mt-6 bg-zinc-900 p-4 rounded">
          <h2 className="text-xl">Filhote: {result.species}</h2>
          <p>Gênero: {result.gender}</p>
          <p>Nature: {result.nature}</p>
          <pre className="text-xs">{JSON.stringify(result.ivs, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}