// ... (mantenha TODOS os tipos, constantes, helpers e estados exatamente iguais ao seu código)

// -------------------- UI (apenas o return mudou) --------------------
return (
  <div className="p-6 text-white bg-black min-h-screen">
    <h1 className="text-3xl font-bold mb-4">Breeding Competitivo</h1>

    <input
      placeholder="Buscar Pokémon..."
      className="w-full p-2 mb-4 bg-zinc-900 rounded"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <div className="grid grid-cols-6 gap-2 max-h-64 overflow-auto">
      {filtered.map((p) => (
        <button
          key={p.id}
          className="bg-zinc-900 p-2 rounded text-xs flex flex-col items-center"
          onClick={() => (!father ? setFather(p) : setMother(p))}
        >
          {p.sprite ? (
            <img 
              src={p.sprite} 
              alt={p.name} 
              className="w-12 h-12 object-contain mb-1" // sprite pequeno acima do nome
            />
          ) : (
            <div className="w-12 h-12 bg-zinc-800 rounded-full mb-1 flex items-center justify-center text-[10px]">
              ?
            </div>
          )}
          <span className="capitalize">{p.name}</span>
        </button>
      ))}
    </div>

    {/* IVs */}
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