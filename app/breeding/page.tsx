// ... (mantenha todos os tipos, constantes e helpers exatamente iguais ao seu código)

// -------------------- COMPONENTE --------------------
export default function BreedingSystem() {
  const [list, setList] = useState<Pokemon[]>([]);
  const [searchFather, setSearchFather] = useState(""); // Pesquisa separada pro Pai
  const [searchMother, setSearchMother] = useState(""); // Pesquisa separada pra Mãe
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

  // ... (mantenha o useEffect de fetch igual)

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

      {/* SELEÇÃO SEPARADA: PAI */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Pai</h2>
        <input
          placeholder="Buscar Pokémon Pai..."
          className="w-full p-2 mb-2 bg-zinc-900 rounded"
          value={searchFather}
          onChange={(e) => setSearchFather(e.target.value)}
        />
        <div className="grid grid-cols-6 gap-2 max-h-64 overflow-auto">
          {filteredFather.map((p) => (
            <button
              key={p.id}
              className={`bg-zinc-900 p-2 rounded text-xs ${father?.id === p.id ? "border-2 border-blue-500" : ""}`}
              onClick={() => setFather(p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* SELEÇÃO SEPARADA: MÃE */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Mãe</h2>
        <input
          placeholder="Buscar Pokémon Mãe..."
          className="w-full p-2 mb-2 bg-zinc-900 rounded"
          value={searchMother}
          onChange={(e) => setSearchMother(e.target.value)}
        />
        <div className="grid grid-cols-6 gap-2 max-h-64 overflow-auto">
          {filteredMother.map((p) => (
            <button
              key={p.id}
              className={`bg-zinc-900 p-2 rounded text-xs ${mother?.id === p.id ? "border-2 border-pink-500" : ""}`}
              onClick={() => setMother(p)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* IVs, Natures, Power Items, Toggles, Botão BREEDAR e Resultado */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div>
          <h2>IVs do Pai</h2>
          {stats.map((s) => (
            <input
              key={s}
              type="number"
              value={fatherIV[s]}
              min={0}
              max={31}
              onChange={(e) => setFatherIV({ ...fatherIV, [s]: Number(e.target.value) })}
              className="w-full bg-zinc-900 p-1 mb-1"
            />
          ))}
        </div>
        <div>
          <h2>IVs da Mãe</h2>
          {stats.map((s) => (
            <input
              key={s}
              type="number"
              value={motherIV[s]}
              min={0}
              max={31}
              onChange={(e) => setMotherIV({ ...motherIV, [s]: Number(e.target.value) })}
              className="w-full bg-zinc-900 p-1 mb-1"
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <select value={natureFather} onChange={(e) => setNatureFather(e.target.value)} className="bg-zinc-900 p-2">
          {natures.map((n) => <option key={n}>{n}</option>)}
        </select>
        <select value={natureMother} onChange={(e) => setNatureMother(e.target.value)} className="bg-zinc-900 p-2">
          {natures.map((n) => <option key={n}>{n}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <select onChange={(e) => setPowerFather(powerItems[e.target.value])} className="bg-zinc-900 p-2">
          {Object.keys(powerItems).map((k) => <option key={k}>{k}</option>)}
        </select>
        <select onChange={(e) => setPowerMother(powerItems[e.target.value])} className="bg-zinc-900 p-2">
          {Object.keys(powerItems).map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>

      <div className="mt-4 space-x-4">
        <label>
          <input type="checkbox" checked={destiny} onChange={(e) => setDestiny(e.target.checked)} /> Destiny Knot
        </label>
        <label>
          <input type="checkbox" checked={everstone} onChange={(e) => setEverstone(e.target.checked)} /> Everstone
        </label>
      </div>

      <button onClick={breed} className="mt-6 bg-blue-600 px-4 py-2 rounded">
        BREEDAR
      </button>

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