import React, { useMemo, useState } from "react";
import Breadcrumb from "./Breadcrumb.jsx";
import machines from "./machines.json";

const months = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  id: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"],
};
const labels = {
  en: {
    about: "about", work: "what I did", categories: "categories", demo: "demo", workload: "workload",
    interpretation: "interpretation", terminal: "terminal", files: "source files",
    title: "Preventive Maintenance", subtitle: "Scheduler for 36 workshop machines",
    intro: "Engineering portfolio project. It turns a raw machine inventory into a maintenance plan: what to inspect or repair, when, and how much work lands on each month. The spreadsheets are rebuilt here as an interactive demo.",
    problem: "A workshop with dozens of drilling, bending, cutting, sawing and grinding machines needs a predictable maintenance plan, or breakdowns decide the schedule for you.",
    process: "Collect every machine, score repair complexity, choose a 2/4/6-month preventive-maintenance cycle, and place tasks across the year.",
    filter: "Search machine / model…", any: "any month", all: "all", machine: "machine", complexity: "cx",
    machineCount: "machines", avg: "avg repair complexity", highest: "highest complexity",
    period: "period", model: "model/spec", dim: "work dimension", taskLegend: "cx = repair complexity",
    peak: "peak", note: "Interpretation notes are my reading of the data, not statements from the original sheets.",
    terminalText: "Read-only preview from the schedule sheet. Pick a machine to inspect its planned tasks.",
    source: "Source workbook preview", tasks: "tasks / year", yearly: "2027 plan",
    chartDesc: "Tasks scheduled by month and type. A flatter chart means steadier workload.",
  },
  id: {
    about: "tentang", work: "yang saya kerjakan", categories: "kategori", demo: "demo", workload: "beban kerja",
    interpretation: "interpretasi", terminal: "terminal", files: "file sumber",
    title: "Preventive Maintenance", subtitle: "Scheduler untuk 36 mesin bengkel",
    intro: "Proyek portofolio teknik yang mengubah inventaris mesin menjadi rencana perawatan: apa yang diperiksa atau diperbaiki, kapan, dan beban kerja setiap bulan. Spreadsheet dibangun ulang di sini sebagai demo interaktif.",
    problem: "Bengkel dengan banyak mesin bor, tekuk, potong, gergaji, dan gerinda membutuhkan rencana perawatan yang terjadwal.",
    process: "Kumpulkan data mesin, beri skor kompleksitas perbaikan, tentukan siklus PM 2/4/6 bulan, lalu jadwalkan pekerjaan sepanjang tahun.",
    filter: "Cari mesin / model…", any: "semua bulan", all: "semua", machine: "mesin", complexity: "cx",
    machineCount: "mesin", avg: "rata-rata kompleksitas", highest: "kompleksitas tertinggi",
    period: "periode", model: "model/spesifikasi", dim: "dimensi kerja", taskLegend: "cx = kompleksitas perbaikan",
    peak: "puncak", note: "Catatan interpretasi adalah pembacaan saya atas data, bukan pernyataan dari lembar asli.",
    terminalText: "Pratinjau hanya-baca dari jadwal. Pilih mesin untuk melihat tugas perawatannya.",
    source: "Pratinjau workbook sumber", tasks: "pekerjaan / tahun", yearly: "rencana 2027",
    chartDesc: "Pekerjaan terjadwal per bulan dan jenis. Grafik yang lebih rata menunjukkan beban kerja lebih stabil.",
  },
};
const categoryNames = {
  Drilling: ["Drilling", "Pengeboran"], Bending: ["Bending", "Tekuk"],
  Cutting: ["Cutting", "Pemotongan"], Sawing: ["Sawing", "Penggergajian"],
  Grinding: ["Grinding", "Penggerindaan"],
};
const taskType = { I: ["Inspection", "Inspeksi"], S: ["Small repair", "Perbaikan kecil"], M: ["Medium repair", "Perbaikan menengah"] };
const taskList = (machine) => machine.m.flatMap((code, index) => code ? [{ code: code.toUpperCase(), month: index, type: code[0].toUpperCase() }] : []);
const categories = [...new Set(machines.map((machine) => machine.cat))];
const draft2028 = Array.from({ length: 24 }, (_, index) => {
  if (index < 15) return [index + 1, `Bubut ${index + 1}`, "", "", "", ""];
  if (index < 21) return [index + 1, `Frais ${index - 14}`, "", "", "", ""];
  return [index + 1, `Bor ${index - 20}`, "", "", "", ""];
}).map((row, index) => {
  if (index === 0) return [1, "Bubut 1", "Tekman Barat", 2, "M1", 11];
  if (index === 2) return [3, "Bubut 3", "BLIB", 3, "S1", 10];
  if (index === 4) return [5, "Bubut 5", "", 5, "I2", 11];
  if (index === 21) return [22, "Bor 1", "PLAT-KB", "", "", ""];
  return row;
});
const monthly = Array.from({ length: 12 }, (_, month) => machines.reduce((counts, machine) => {
  const task = machine.m[month];
  if (task) counts[task[0].toUpperCase()] += 1;
  return counts;
}, { I: 0, S: 0, M: 0 }));
const totals = monthly.map((month) => month.I + month.S + month.M);
const totalTasks = totals.reduce((sum, total) => sum + total, 0);
const color = { I: "#0969da", S: "#9a6700", M: "#cf222e" };
const localized = (language, values) => values[language === "en" ? 0 : 1];

export default function Scheduler() {
  const [language, setLanguage] = useState("en");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState("");
  const [selected, setSelected] = useState(null);
  const [showInventory, setShowInventory] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [terminal, setTerminal] = useState(false);
  const text = labels[language];
  const filtered = useMemo(() => machines.filter((machine) =>
    (category === "all" || machine.cat === category) &&
    `${machine.name} ${machine.model}`.toLowerCase().includes(query.toLowerCase()) &&
    (month === "" || machine.m[Number(month)]),
  ), [category, query, month]);
  const peak = Math.max(...totals);
  const selectedTasks = selected ? taskList(selected) : [];

  return <>
    <nav><b>~/Zaky Azhari</b>
      {["about", "work", "categories", "demo", "workload", "interpretation", "terminal", "files"].map((item) => <a key={item} href={`#${item}`}>{text[item]}</a>)}
      <div className="lang"><button className={language === "en" ? "on" : ""} onClick={() => { setLanguage("en"); document.documentElement.lang = "en"; }}>EN</button>
        <button className={language === "id" ? "on" : ""} onClick={() => { setLanguage("id"); document.documentElement.lang = "id"; }}>ID</button></div>
    </nav>
    <main>
      <Breadcrumb current="Preventive Maintenance Scheduler" />
      <section className="hero"><div className="c">$ status</div>
        <h1>{text.title}<br /><span className="g">{text.subtitle}</span><span className="cur" /></h1>
        <p className="c" style={{ maxWidth: 660 }}>{text.intro}</p>
        <div className="kv">{[[language === "en" ? "role" : "peran", language === "en" ? "Maintenance planning" : "Perencanaan perawatan"], [language === "en" ? "domain" : "bidang", language === "en" ? "Workshop machines" : "Mesin bengkel"], ["input", "2 Excel sheets"], ["output", "Annual PM schedule"], ["year", text.yearly]].map(([key, value]) => <span key={key}><i>{key}:</i> {value}</span>)}</div>
        <div className="tags"><span>maintenance-engineering</span><span>PM-cycle</span><span>asset-register</span><span>scheduling</span><span>excel → web</span></div>
        <a href="#demo"><button>{language === "en" ? "▶ run demo" : "▶ jalankan demo"}</button></a>
      </section>
      <section id="about"><h2>{text.about}</h2><div className="win"><div className="bar">● ● ● &nbsp; README.md</div><pre style={{ padding: 14 }}>{text.problem}{"\n\n"}# What this project does{"\n"}1. Collect and organize machine inventory.{"\n"}2. Rate repair complexity (2–8).{"\n"}3. Plan the inspection / small / medium task cycle.{"\n"}4. Balance tasks across the year.{"\n\n"}# Result{"\n"}{totalTasks} tasks scheduled across 2027; a 2028 draft is in progress.</pre></div></section>
      <section id="work"><h2>{text.work}</h2><p className="sub">{text.process}</p><div className="cards">
        {["COLLECT", "RATE", "CYCLE", "SCHEDULE"].map((step, index) => <div className="card" key={step}><span className="lbl">{`STEP ${index + 1} · ${step}`}</span><div>{["List every machine with its model/specification and maximum work dimension.", "Score each machine’s repair complexity.", "Choose a PM interval of 2, 4 or 6 months.", "Offset start months to balance annual workload."][index]}</div><div style={{ marginTop: 8 }}><span className="lbl o">output</span> <b className="g">{[`${machines.length} machines`, "complexity 2–8", "periods 2 · 4 · 6 mo", `${totalTasks} tasks / year`][index]}</b></div></div>)}
      </div></section>
      <section id="categories"><h2>{text.categories}</h2><p className="sub">Derived from the source sheets: how the {machines.length} machines group by type.</p>
        <div className="cards" style={{ marginBottom: 14 }}>{[[machines.length, text.machineCount], [categories.length, language === "en" ? "categories" : "kategori"], [(machines.reduce((sum, machine) => sum + machine.cx, 0) / machines.length).toFixed(1), text.avg], [Math.max(...machines.map((machine) => machine.cx)), text.highest]].map(([value, label]) => <div className="card" key={label}><div className="n">{value}</div><div className="c">{label}</div></div>)}</div>
        <div className="sc"><table style={{ minWidth: 520 }}><thead><tr>{[language === "en" ? "Category" : "Kategori", text.machineCount, text.avg, text.period, text.tasks].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{categories.map((name) => { const items = machines.filter((machine) => machine.cat === name); return <tr key={name}><td style={{ textAlign: "left" }}><b>{localized(language, categoryNames[name] || [name, name])}</b></td><td>{items.length}</td><td>{(items.reduce((sum, machine) => sum + machine.cx, 0) / items.length).toFixed(1)}</td><td>{items[0].period} mo</td><td>{items.reduce((sum, machine) => sum + taskList(machine).length, 0)}</td></tr>; })}</tbody></table></div>
      </section>
      <section id="demo"><h2>{text.demo}</h2><p className="sub">Filter, search, and select any row to inspect its planned service tasks.</p>
        <div className="ctl">{["all", ...categories].map((item) => <button key={item} className={category === item ? "on" : ""} onClick={() => setCategory(item)}>{item === "all" ? text.all : localized(language, categoryNames[item] || [item, item])}</button>)}</div>
        <div className="ctl"><input aria-label={text.machine} style={{ flex: 1, minWidth: 180 }} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.filter} />
          <select aria-label={text.any} value={month} onChange={(event) => setMonth(event.target.value)}><option value="">{text.any}</option>{months[language].map((name, index) => <option value={index} key={name}>{name}</option>)}</select></div>
        <div className="sc"><table id="tb"><thead><tr><th>#</th><th>{text.machine}</th><th>{text.complexity}</th>{months[language].map((name) => <th title={name} key={name}>{name}</th>)}</tr></thead><tbody>{filtered.map((machine) => <tr className="row" key={machine.no} onClick={() => setSelected(machine)} aria-selected={selected?.no === machine.no}><td className="c">{machine.no}</td><td>{machine.name}</td><td>{machine.cx}</td>{machine.m.map((code, index) => <td key={index}>{code && <span className={`t t${code[0].toUpperCase()}`}>{code.toUpperCase()}</span>}</td>)}</tr>)}{filtered.length === 0 && <tr><td colSpan="15" className="c">—</td></tr>}</tbody></table></div>
        <div className="legend c" style={{ marginTop: 10 }}><span><b className="t tI">I</b> {localized(language, taskType.I)}</span><span><b className="t tS">S</b> {localized(language, taskType.S)}</span><span><b className="t tM">M</b> {localized(language, taskType.M)}</span><span>{text.taskLegend}</span></div>
        <div className="card" id="det">{selected ? <><b className="g">{selected.name}</b> <span className="c">#{selected.no} · {localized(language, categoryNames[selected.cat] || [selected.cat, selected.cat])}</span><br />{text.model}: {selected.model || "—"} · {text.dim}: {selected.dim} · {text.complexity}: <span className="a">{selected.cx}</span> · {text.period}: every <span className="b">{selected.period}</span> months<br />{selectedTasks.map((task) => <span className={`t t${task.type}`} style={{ margin: "4px 6px 0 0" }} key={task.month}>{months[language][task.month]}: {task.code} {localized(language, taskType[task.type])}</span>)}</> : <span className="c">// select a machine row…</span>}</div>
      </section>
      <section id="workload"><h2>{text.workload}</h2><p className="sub">{text.chartDesc}</p><div className="card"><svg viewBox="0 0 700 250" style={{ width: "100%", height: "auto" }} role="img" aria-label={text.tasks}>
        {[0, 0.5, 1].map((fraction) => <g key={fraction}><line x1="40" x2="690" y1={200 - fraction * 140} y2={200 - fraction * 140} stroke="var(--line)" /><text x="34" y={204 - fraction * 140} textAnchor="end" fontSize="10" fill="var(--mut)">{Math.round(peak * fraction)}</text></g>)}
        {monthly.map((monthData, index) => { let offset = 0; const x = 50 + index * 54; return <g key={index}>{["I", "S", "M"].map((type) => { const height = monthData[type] / peak * 140; offset += height; return <rect key={type} x={x} y={200 - offset} width="36" height={height} fill={color[type]}><title>{months[language][index]} {type}: {monthData[type]}</title></rect>; })}<text x={x + 18} y={194 - offset} textAnchor="middle" fontSize="11" fill="var(--fg)">{totals[index]}</text><text x={x + 18} y="218" textAnchor="middle" fontSize="11" fill="var(--mut)">{months[language][index]}</text></g>; })}
        <text x="690" y="240" textAnchor="end" fontSize="10" fill="var(--acc)">● {text.peak} = {peak}</text></svg></div></section>
      <section id="interpretation"><h2>{text.interpretation}</h2><p className="sub">What the numbers suggest. Each point is tagged as an observation or assumption.</p><ul className="ins">
        <li className="card"><span className="lbl o">OBSERVATION</span><div>Period does not follow complexity directly: drills (complexity 4) are serviced every 2 months while the more complex shearing machines share a 4-month interval.</div></li>
        <li className="card"><span className="lbl o">OBSERVATION</span><div>Drilling contributes {machines.filter((machine) => machine.cat === "Drilling").reduce((sum, machine) => sum + taskList(machine).length, 0)} of {totalTasks} annual tasks because drills are serviced more often.</div></li>
        <li className="card"><span className="lbl o">OBSERVATION</span><div>Monthly workload ranges from {Math.min(...totals)} to {peak} tasks; offsets between machines help smooth the schedule.</div></li>
        <li className="card"><span className="lbl w">ASSUMPTION</span><div>Drills may be serviced more often because of heavier usage. The source sheets do not state the reason.</div></li>
      </ul><div className="note">{text.note}</div></section>
      <section id="terminal"><h2>{text.terminal}</h2><p className="sub">{text.terminalText}</p><div className="win"><div className="bar">bash — pm-cli (read-only demo)</div><div style={{ padding: 12 }}><button onClick={() => setTerminal((value) => !value)}>{terminal ? "↻ run demo" : "▶ run demo"}</button><pre style={{ marginTop: 12 }}>{terminal ? `machines: ${machines.length}\ntasks: ${totalTasks}\navg repair complexity: ${(machines.reduce((sum, machine) => sum + machine.cx, 0) / machines.length).toFixed(1)}\n\n${categories.map((name) => `${name.padEnd(16)} ${machines.filter((machine) => machine.cat === name).length}`).join("\n")}\n\ncycle: C - I1 - S1 - I2 - S2 - I3 - M1 - I4 - S3 - I5 - S4 - I6 - M2 - I7 - S5 - I8 - S6 - I9 - C` : "Ready. Choose Run demo to inspect the read-only schedule summary."}</pre></div></div></section>
      <section id="files"><h2>{text.files}</h2><div className="win">{["Machine data collection sheet", "Annual PM schedule sheet"].map((name, index) => <div className="file" key={name}><span>📄 {name}.xlsx</span><span className="c">{index === 0 ? "inventory + repair complexity (36 rows)" : "2027 schedule + 2028 draft"} <button onClick={() => index ? setShowSchedule((value) => !value) : setShowInventory((value) => !value)}>{(index ? showSchedule : showInventory) ? "▼ hide preview" : "▶ preview data"}</button></span>{((index && showSchedule) || (!index && showInventory)) && <div className="pv">{index === 0 ? <table><thead><tr>{["No.", "Nama Mesin", "Work Dimensi MAX. (mm)", "Spesifikasi", "Repair Complexity"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{machines.map((machine) => <tr key={machine.no}><td>{machine.no}</td><td>{machine.name}</td><td>{machine.dim}</td><td>{machine.model}</td><td>{machine.cx}</td></tr>)}</tbody></table> : <><table><thead><tr>{["No.", "Machine", "Model", "Work dim.", "Period", ...months[language].map((name) => name)].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{machines.map((machine) => <tr key={machine.no}><td>{machine.no}</td><td>{machine.name}</td><td>{machine.model}</td><td>{machine.dim}</td><td>{machine.period}</td>{machine.m.map((code, i) => <td key={i}>{code}</td>)}</tr>)}</tbody></table><p className="c" style={{ padding: "8px 12px" }}>2028 draft: only 3 lathes have last-year classification filled in so far.</p><table style={{ minWidth: 520 }}><thead><tr>{["No.", "Machine", "Location code", "Period", "Type", "Month"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{draft2028.map((row) => <tr key={row[0]}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></>}</div>}</div>)}</div><p className="c" style={{ marginTop: 16 }}>PM cycle: <span className="g">C – I1 – S1 – I2 – S2 – I3 – M1 – I4 – S3 – I5 – S4 – I6 – M2 – I7 – S5 – I8 – S6 – I9 – C</span> (M=2, S=6, I=9)</p><div className="note">2028 draft (WIP): lathes, milling machines, and drills are listed; only some assets have last-year classification filled in so far.</div></section>
    </main>
    <footer>built from Excel → React · <span className="g">status: online</span></footer>
  </>;
}
