"use client";
import { useEffect, useState } from "react";
// ... (mantenha todos os tipos, constantes e helpers exatamente como você mandou)
// type Pokemon, IVs, stats, emptyIV, natures, powerItems, randomIV, genderFromRate, inheritIVs, compatibleEggGroup, babySpecies

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

  // -------------------- FETCH 1000+ --------------------
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

  // -------------------- BREED --------------------
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

  // -------------------- UI (Visual Pokédex em cima do original) --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-800 to-black text-white p-6 font-sans">
      {/* Header estilo Pokédex */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-wide text-yellow-400 drop-shadow-lg">
          Pokédex Breeding System
        </h1>
        <p className="text-xl mt-2 opacity-80">Calcule o breeding competitivo com IVs perfeitos!</p>
      </header>

      {/* Search Bar destacada */}
      <div className="max-w-2xl mx-auto mb-8">
        <input
          placeholder="Busque Pokémon (ex: charizard, ditto...)"
          className="w-full p-4 text-lg bg-zinc-900/80 border-2 border-yellow-400 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-500 shadow-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid de Pokémon (cards estilo Pokédex) */}
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

      {/* Seleção atual de Pai/Mãe */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-zinc-900/80 p-6 rounded-xl border border-blue-500">
          <h2 className="text-2xl font-bold mb-4 text-blue-300">Pai Selecionado</h2>
          {father ? (
            <div className="text-center">
              <img src={father.sprite} alt={father.name} className="w-32 h-32 mx-auto" />
              <p className="text-xl capitalize">{father.name}</p>
            </div>
          ) : (
            <p className="text-center opacity-70">Selecione o pai na lista</p>
          )}
        </div>

        <div className="bg-zinc-900/80 p-6 rounded-xl border border-pink-500">
          <h2 className="text-2xl font-bold mb-4 text-pink-300">Mãe Selecionada</h2>
          {mother ? (
            <div className="text-center">
              <img src={mother.sprite} alt={mother.name} className="w-32 h-32 mx-auto" />
              <p className="text-xl capitalize">{mother.name}</p>
            </div>
          ) : (
            <p className="text-center opacity-70">Selecione a mãe na lista</p>
          )}
        </div>
      </div>

      {/* Configurações IVs, Natures, Power Items, Toggles */}
      <div className="mt-10 max-w-4xl mx-auto bg-zinc-900/80 p-8 rounded-2xl border border-yellow-500 shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-yellow-400">Configurações Avançadas</h2>

        {/* IVs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-xl mb-4 text-center">IVs do Pai</h3>
            {stats.map((s) => (
              <div key={s} className="flex items-center mb-2">
                <label className="w-20 uppercase font-bold">{s}</label>
                <input
                  type="number"
                  value={fatherIV[s]}
                  min={0}
                  max={31}
                  onChange={(e) => setFatherIV({ ...fatherIV, [s]: Number(e.target.value) })}
                  className="flex-1 p-2 bg-zinc-800 border border-gray-600 rounded text-white"
                />
              </div>
            ))}
          </div>
          <div>
            <h3 className="text-xl mb-4 text-center">IVs da Mãe</h3>
            {stats.map((s) => (
              <div key={s} className="flex items-center mb-2">
                <label className="w-20 uppercase font-bold">{s}</label>
                <input
                  type="number"
                  value={motherIV[s]}
                  min={0}
                  max={31}
                  onChange={(e) => setMotherIV({ ...motherIV, [s]: Number(e.target.value) })}
                  className="flex-1 p-2 bg-zinc-800 border border-gray-600 rounded text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Natures */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xl mb-2">Nature do Pai</h3>
            <select
              value={natureFather}
              onChange={(e) => setNatureFather(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-gray-600 rounded"
            >
              {natures.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <h3 className="text-xl mb-2">Nature da Mãe</h3>
            <select
              value={natureMother}
              onChange={(e) => setNatureMother(e.target.value)}
              className="w-full p-3 bg-zinc-800 border border-gray-600 rounded"
            >
              {natures.map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {/* Power Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xl mb-2">Power Item Pai</h3>
            <select
              onChange={(e) => setPowerFather(powerItems[e.target.value])}
              className="w-full p-3 bg-zinc-800 border border-gray-600 rounded"
            >
              {Object.keys(powerItems).map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
          <div>
            <h3 className="text-xl mb-2">Power Item Mãe</h3>
            <select
              onChange={(e) => setPowerMother(powerItems[e.target.value])}
              className="w-full p-3 bg-zinc-800 border border-gray-600 rounded"
            >
              {Object.keys(powerItems).map((k) => <option key={k}>{k}</option>)}
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row justify-center gap-8 mb-8">
          <label className="flex items-center gap-3 text-lg">
            <input
              type="checkbox"
              checked={destiny}
              onChange={(e) => setDestiny(e.target.checked)}
              className="w-6 h-6 accent-yellow-400"
            />
            Destiny Knot (5 IVs garantidos)
          </label>
          <label className="flex items-center gap-3 text-lg">
            <input
              type="checkbox"
              checked={everstone}
              onChange={(e) => setEverstone(e.target.checked)}
              className="w-6 h-6 accent-yellow-400"
            />
            Everstone (Nature da mãe)
          </label>
        </div>

        {/* Botão Breed */}
        <button
          onClick={breed}
          className="w-full max-w-md mx-auto block bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-bold py-4 px-8 rounded-full text-xl shadow-lg transform hover:scale-105 transition-all duration-300"
        >
          BREEDAR / GERAR FILHOTE
        </button>
      </div>

      {/* Resultado */}
      {result && (
        <div className="mt-12 max-w-2xl mx-auto bg-zinc-900/90 p-8 rounded-2xl border-4 border-yellow-400 shadow-2xl text-center">
          <h2 className="text-4xl font-bold text-yellow-400 mb-6">Filhote Gerado!</h2>
          <div className="flex flex-col items-center">
            {/* Aqui você pode adicionar sprite do baby se quiser fetch depois */}
            <p className="text-3xl capitalize mb-4">{result.species}</p>
            <p className="text-xl mb-2">Gênero: <span className="font-bold">{result.gender}</span></p>
            <p className="text-xl mb-6">Nature: <span className="font-bold">{result.nature}</span></p>
            <div className="w-full bg-black/50 p-6 rounded-xl">
              <h3 className="text-2xl mb-4">IVs Perfeitos</h3>
              <pre className="text-left text-sm font-mono bg-zinc-800 p-4 rounded overflow-auto">
                {JSON.stringify(result.ivs, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}