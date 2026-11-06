# Studiendatenbank – wird am Ende von build.py ausgeführt (teilt page, write, esc, BASE, eps, CSS).
# Quelle: _werkzeug/studien.json  ·  Ausgabe: studien/, studien/<id>/, studien/methodik/, studien/daten.json, llms.txt
import json as _json, os as _os

_SRC = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "studien.json")
STUDIEN = _json.load(open(_SRC, encoding="utf-8"))
_W = dict(design=.30, datenbasis=.15, unabhaengigkeit=.20, replikation=.25, uebertragbarkeit=.10)
for _s in STUDIEN:
    _s["score"]["gesamt"] = round(sum(_s["score"][k] * w for k, w in _W.items()), 1)
STUDIEN.sort(key=lambda s: (-s["score"]["gesamt"], s["id"]))

ACHSEN = [("design", "Studiendesign"), ("datenbasis", "Datenbasis"), ("unabhaengigkeit", "Unabhängigkeit"),
          ("replikation", "Replikation"), ("uebertragbarkeit", "Übertragbarkeit")]
RICHTUNG = {"bestaetigt": ("bestätigt", "Die verbreitete Aussage hält der Prüfung stand."),
            "gemischt": ("gemischt", "Die Befundlage ist uneinheitlich oder nur unter Bedingungen gültig."),
            "widerlegt": ("widerlegt", "Die verbreitete Lesart hält nicht – oft ein Fehlzitat oder ein Mythos."),
            "offen": ("offen", "Zu neu oder zu wenig geprüft für ein Urteil.")}
_folge = {e["n"]: e for e in eps}
STAND = max(s.get("stand", "") for s in STUDIEN)
LIZENZ = "CC BY 4.0"

CSS_STUDIEN = """
.sfilter{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 18px}
.sfilter input,.sfilter select{font:inherit;font-size:15px;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px}
.sfilter input{flex:1 1 260px;min-width:0}
.scount{font-size:14px;color:var(--mute);margin:0 0 6px}
.st{display:grid;grid-template-columns:64px 1fr;gap:16px;padding:16px 0;border-top:1px solid var(--line)}
.sc{width:64px;height:64px;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--card);border:1px solid var(--line)}
.sc b{font-size:22px;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}
.sc span{font-size:10px;letter-spacing:.12em;color:var(--mute);margin-top:4px}
.st h3{margin:0 0 4px;font-size:18px;line-height:1.3}.st h3 a{color:var(--ink);text-decoration:none}.st h3 a:hover{color:var(--teal)}
.st p{margin:0 0 6px;font-size:15px}.st .meta{font-size:13px}
.chip{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:999px;padding:1px 9px;margin:0 6px 4px 0;color:var(--mute)}
.chip.r-bestaetigt{border-color:var(--teal);color:var(--teal)}.chip.r-widerlegt{border-color:#e8735a;color:#e8735a}.chip.r-gemischt{border-color:#d8b44a;color:#d8b44a}
.scard{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px 20px;margin:18px 0 24px}
.scard .top{display:flex;align-items:baseline;gap:12px;margin-bottom:10px}
.scard .top b{font-size:40px;line-height:1;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}
.bar{display:grid;grid-template-columns:150px 1fr 32px;gap:10px;align-items:center;font-size:14px;margin:6px 0}
.bar i{display:block;height:8px;border-radius:4px;background:var(--line);overflow:hidden}.bar i em{display:block;height:100%;background:var(--grad)}
.ztab{width:100%;border-collapse:collapse;font-size:15px;margin:0 0 16px}.ztab td{border-top:1px solid var(--line);padding:8px 10px 8px 0;vertical-align:top}.ztab td:first-child{font-weight:700;white-space:nowrap;padding-right:16px}
.facts dt{font-weight:700;margin-top:14px}.facts dd{margin:2px 0 0}
.facts dd,.quellen li,.meta{overflow-wrap:anywhere}
@media (max-width:720px){.sfilter select{flex:1 1 calc(50% - 5px);min-width:0}.st{grid-template-columns:52px 1fr;gap:12px}.sc{width:52px;height:52px}.sc b{font-size:18px}.bar{grid-template-columns:110px 1fr 28px}}
@media (max-width:460px){.brand span{display:none}nav.links{gap:14px}}
"""
write("style.css", CSS.strip() + "\n" + CSS_STUDIEN.strip() + "\n")


def _chips(s):
    r = RICHTUNG[s["richtung"]][0]
    return f'<span class="chip r-{s["richtung"]}">{r}</span>' + "".join(f'<span class="chip">{esc(t)}</span>' for t in s["themen"])


def _folgen_links(s, pre):
    out = []
    for n in s.get("folgen") or []:
        e = _folge.get(n)
        out.append(f'<a href="{pre}folge/{e["slug"]}/">Folge {n}: {esc(e["kopf"])}</a>' if e else f"Folge {n} (erscheint demnächst)")
    return out


# ---------- Übersicht
themen = sorted({t for s in STUDIEN for t in s["themen"]})
typen = sorted({s["studientyp"] for s in STUDIEN})
zeilen = []
for s in STUDIEN:
    such = " ".join([s["titel_de"], s["titel_original"], s["autoren"], s["herausgeber"], s["kernaussage"], " ".join(s["themen"]), str(s.get("jahr") or "")]).lower()
    zeilen.append(f"""<article class="st" data-q="{esc(such)}" data-t="{esc('|'.join(s['themen']))}" data-r="{s['richtung']}" data-y="{esc(s['studientyp'])}" data-s="{s['score']['gesamt']}" data-j="{s.get('jahr') or 0}">
<a class="sc" href="{s['id']}/" aria-label="MFK-Score {s['score']['gesamt']}"><b>{str(s['score']['gesamt']).replace('.', ',')}</b><span>SCORE</span></a><div>
<h3><a href="{s['id']}/">{esc(s['titel_de'])}</a></h3>
<p class="meta">{esc(s['autoren'])} · {s.get('jahr') or 'o. J.'} · {esc(s['studientyp'])}</p>
<p>{esc(s['kernaussage'])}</p>{_chips(s)}</div></article>""")
opt = lambda xs: "".join(f'<option value="{esc(x)}">{esc(x)}</option>' for x in xs)
uebersicht = f"""<div style="padding:36px 0 0"><p class="kicker">Studiendatenbank</p><h1>Was die Marketing-Forschung <span class="g">wirklich</span> zeigt</h1>
<p class="lead">{len(STUDIEN)} Studien, Meta-Analysen und Datensätze aus Marketing, Media und KI-Suche – jede mit Kernaussage, geprüften Zahlen, Einschränkungen und einem offen gelegten MFK-Score für die Belastbarkeit. Die meisten Einträge stammen aus der Recherche zu den Podcastfolgen.</p>
<p class="btns"><a class="btn" href="methodik/">So funktioniert der MFK-Score</a><a class="btn" href="daten.json">Alle Daten als JSON</a></p></div>
<div class="sfilter" role="search"><input id="q" type="search" placeholder="Suchen: Autor, Thema, Stichwort …" aria-label="Studien durchsuchen">
<select id="ft" aria-label="Thema"><option value="">Alle Themen</option>{opt(themen)}</select>
<select id="fr" aria-label="Richtung"><option value="">Alle Ergebnisse</option>{''.join(f'<option value="{k}">{v[0]}</option>' for k, v in RICHTUNG.items())}</select>
<select id="fy" aria-label="Studientyp"><option value="">Alle Studientypen</option>{opt(typen)}</select>
<select id="so" aria-label="Sortierung"><option value="s">Sortierung: Score</option><option value="j">Sortierung: neueste</option><option value="a">Sortierung: A–Z</option></select></div>
<p class="scount" id="cnt">{len(STUDIEN)} Studien</p>
<div id="liste">{''.join(zeilen)}</div>
<p class="meta" style="margin-top:28px">Stand: {STAND} · Zusammenfassungen in eigenen Worten, Zahlen an den Quellen geprüft. Der MFK-Score ist eine redaktionelle Einschätzung nach <a href="methodik/">offengelegten Regeln</a>, keine wissenschaftliche Begutachtung. Daten frei nutzbar unter {LIZENZ} mit Quellenangabe „Marketing Facts Kompakt“.</p>
<script>(function(){{var L=document.getElementById('liste'),A=[].slice.call(L.children),q=document.getElementById('q'),ft=document.getElementById('ft'),fr=document.getElementById('fr'),fy=document.getElementById('fy'),so=document.getElementById('so'),c=document.getElementById('cnt');
function run(){{var w=q.value.toLowerCase().trim().split(/\\s+/).filter(Boolean),n=0,s=so.value;
A.sort(function(a,b){{return s=='j'?b.dataset.j-a.dataset.j:s=='a'?a.querySelector('h3').textContent.localeCompare(b.querySelector('h3').textContent,'de'):b.dataset.s-a.dataset.s}});
A.forEach(function(e){{var ok=w.every(function(x){{return e.dataset.q.indexOf(x)>-1}})&&(!ft.value||e.dataset.t.split('|').indexOf(ft.value)>-1)&&(!fr.value||e.dataset.r==fr.value)&&(!fy.value||e.dataset.y==fy.value);e.hidden=!ok;if(ok)n++;L.appendChild(e)}});
c.textContent=n+(n==1?' Studie':' Studien')}}
[q,ft,fr,fy,so].forEach(function(e){{e.addEventListener('input',run)}});
var p=new URLSearchParams(location.search);if(p.get('q')){{q.value=p.get('q');run()}}}})();</script>
<script type="application/ld+json">{_json.dumps({"@context": "https://schema.org", "@type": "Dataset", "name": "MFK-Studiendatenbank", "description": f"{len(STUDIEN)} Marketing-Studien mit Kernaussage, geprüften Zahlen, Einschränkungen und MFK-Score zur Belastbarkeit.", "url": BASE + "/studien/", "license": "https://creativecommons.org/licenses/by/4.0/", "creator": {"@type": "Person", "name": "Paul Höser"}, "inLanguage": "de", "dateModified": STAND, "distribution": {"@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": BASE + "/studien/daten.json"}}, ensure_ascii=False)}</script>"""
write("studien/index.html", page(f"Studiendatenbank: {len(STUDIEN)} Marketing-Studien geprüft – Marketing Facts Kompakt",
                                 f"{len(STUDIEN)} Marketing-Studien mit Kernaussage, geprüften Zahlen, Einschränkungen und MFK-Score: von 60/40 und Double Jeopardy bis GEO und KI-Suche.",
                                 uebersicht, path="studien/", cur="studien", depth=1))

# ---------- Einzelseiten
for s in STUDIEN:
    sc = s["score"]
    bars = "".join(f'<div class="bar"><span>{lab}</span><i><em style="width:{sc[k]*10}%"></em></i><span>{sc[k]}</span></div>' for k, lab in ACHSEN)
    rl, rt = RICHTUNG[s["richtung"]]
    zahlen = ("<h2>Die Zahlen</h2><table class=ztab>" + "".join(f"<tr><td>{esc(z['wert'])}</td><td>{esc(z['bedeutung'])}</td></tr>" for z in s["zahlen"]) + "</table>") if s.get("zahlen") else ""
    fl = _folgen_links(s, "../../")
    folgen = ("<h2>Im Podcast</h2><ul class=quellen>" + "".join(f"<li>{x}</li>" for x in fl) + "</ul>") if fl else ""
    zug = {"offen": "frei zugänglich", "paywall": "kostenpflichtig", "teilweise": "teilweise frei zugänglich"}.get(s.get("zugang"), "")
    zit = f"Marketing Facts Kompakt (Hrsg.): „{s['titel_de']}“. MFK-Studiendatenbank, Stand {s.get('stand', STAND)}. {BASE}/studien/{s['id']}/"
    body = f"""<div class="article" style="padding-top:36px"><p class="kicker"><a href="../" style="color:inherit;text-decoration:none">Studiendatenbank</a> · {esc(s['studientyp'])}</p>
<h1>{esc(s['titel_de'])}<small>{esc(s['titel_original'])}</small></h1>
<p class="meta">{esc(s['autoren'])} · {esc(s['herausgeber'])} · {s.get('jahr') or 'o. J.'}</p>
<p style="margin-top:14px"><strong>{esc(s['kernaussage'])}</strong></p>
<div class="scard"><div class="top"><b>{str(sc['gesamt']).replace('.', ',')}</b><span>MFK-Score von 10 · Ergebnis: <span class="chip r-{s['richtung']}" style="margin:0">{rl}</span></span></div>
{bars}<p class="meta" style="margin:10px 0 0">{esc(sc.get('begruendung', ''))} {esc(rt)} <a href="../methodik/">Wie der Score entsteht →</a></p></div>
{zahlen}
<dl class="facts"><dt>Methode</dt><dd>{esc(s['methode'])}</dd><dt>Datenbasis</dt><dd>{esc(s['datenbasis'])}</dd>
<dt>Einschränkungen und häufige Fehlzitate</dt><dd>{esc(s['einschraenkungen'])}</dd><dt>Interessenlage</dt><dd>{esc(s['interessenlage'])}</dd>
<dt>Quelle</dt><dd><a href="{esc(s['quelle_url'])}" rel="noopener">{esc(s['quelle_url'])}</a>{f' ({zug})' if zug else ''}</dd></dl>
{folgen}
<h2>Zitieren</h2><p class="meta">{esc(zit)}</p>
<p style="margin-top:20px">{_chips(s)}</p>
<p style="margin-top:20px"><a href="../">← Alle Studien</a></p></div>"""
    ld = {"@context": "https://schema.org", "@type": "WebPage", "name": s["titel_de"], "url": f"{BASE}/studien/{s['id']}/", "inLanguage": "de",
          "dateModified": s.get("stand", STAND), "isPartOf": {"@type": "Dataset", "name": "MFK-Studiendatenbank", "url": BASE + "/studien/"},
          "about": {"@type": "ScholarlyArticle", "name": s["titel_original"], "author": s["autoren"], "publisher": s["herausgeber"],
                    **({"datePublished": str(s["jahr"])} if s.get("jahr") else {}), "url": s["quelle_url"]},
          "review": {"@type": "Review", "author": {"@type": "Organization", "name": "Marketing Facts Kompakt"}, "reviewBody": s["kernaussage"],
                     "reviewRating": {"@type": "Rating", "ratingValue": sc["gesamt"], "bestRating": 10, "worstRating": 0, "name": "MFK-Score"}}}
    write(f"studien/{s['id']}/index.html",
          page(f"{s['titel_de']} – MFK-Score {str(sc['gesamt']).replace('.', ',')} – Marketing Facts Kompakt", s["kernaussage"][:300],
               body + f'<script type="application/ld+json">{_json.dumps(ld, ensure_ascii=False)}</script>', path=f"studien/{s['id']}/", cur="studien", depth=2))

# ---------- Methodik
met = f"""<div class="prose"><p class="kicker">Studiendatenbank</p><h1>So funktioniert der MFK-Score</h1>
<p>Der MFK-Score bewertet, <strong>wie belastbar die Befundlage einer Studie ist</strong> – nicht, ob ihr Ergebnis gut oder schlecht für Marketer ist. Eine sauber gemachte Studie, die einen beliebten Mythos widerlegt, bekommt einen hohen Score.</p>
<h2>Fünf Achsen, je 0 bis 10</h2>
<p><strong>Studiendesign (30 %).</strong> 10 = Feldexperiment mit Kontrollgruppe · 8 = Quasi-Experiment, natürliches Experiment, validiertes Marketing-Mix-Modell · 6 = große Panel- oder Beobachtungsdaten · 4 = Fallsammlung (etwa Award-Datenbanken), Umfrage, Laborexperiment · 2 = Anbieterzahl ohne offengelegte Methode. Meta-Analysen erben das Design ihrer Einzelstudien plus einen Punkt.</p>
<p><strong>Replikation (25 %).</strong> 10 = mehrfach unabhängig bestätigt · 6 = einmal oder teilweise bestätigt · 3 = nie geprüft · 0 = Replikation gescheitert oder klar widersprochen.</p>
<p><strong>Unabhängigkeit (20 %).</strong> 10 = akademisch ohne Geld von Betroffenen · 7 = akademisch mit Industriedaten oder unabhängiges Institut · 5 = Branchenverband, Medienvermarkter, Beratung mit Produktbezug · 3 = Anbieter mit Eigeninteresse, Methode offen · 1 = Anbieter, Methode verschlossen.</p>
<p><strong>Datenbasis (15 %).</strong> Umfang und Breite: Fallzahl, Kategorien, Märkte, Zeitraum.</p>
<p><strong>Übertragbarkeit (10 %).</strong> Gilt der Befund heute noch und über den Ursprungskontext hinaus?</p>
<h2>Gesamtwert</h2><p>0,30 × Design + 0,25 × Replikation + 0,20 × Unabhängigkeit + 0,15 × Datenbasis + 0,10 × Übertragbarkeit, auf eine Nachkommastelle gerundet.</p>
<h2>Ergebnis</h2><p>Zusätzlich steht bei jeder Studie, wie es um die <em>populär zitierte</em> Aussage steht: {', '.join(f'<strong>{v[0]}</strong> – {v[1]}' for v in RICHTUNG.values())}</p>
<h2>Wie die Einträge entstehen</h2><p>Die Recherche ist KI-gestützt und redaktionell verantwortet von Paul Höser. Jede Zahl stammt aus der Primärquelle oder ist dort nachgeprüft; was sich nicht prüfen ließ, steht nicht drin. Bezeichnungen der Studien (DOIs) werden automatisch gegen Crossref abgeglichen, eine Stichprobe jeder Erweiterung prüft ein unabhängiger Durchgang gegen die Originale. Inhalte werden in eigenen Worten zusammengefasst; Texte und Grafiken der Originale übernehmen wir nicht.</p>
<p>Der Score ist eine redaktionelle Einschätzung nach diesen offen gelegten Regeln, keine wissenschaftliche Begutachtung. Fehler gefunden? Schreib an {MAIL_JS}.</p>
<h2>Nutzung der Daten</h2><p>Alle Einträge stehen als <a href="../daten.json">JSON-Datei</a> unter der Lizenz {LIZENZ} zur Verfügung – frei nutzbar mit Quellenangabe „Marketing Facts Kompakt“.</p>
<p style="margin-top:24px"><a href="../">← Zur Studiendatenbank</a></p></div>"""
write("studien/methodik/index.html", page("MFK-Score: Methodik der Studiendatenbank – Marketing Facts Kompakt",
                                          "Wie der MFK-Score die Belastbarkeit von Marketing-Studien bewertet: fünf Achsen, offengelegte Regeln.",
                                          met, path="studien/methodik/", cur="studien", depth=2))

# ---------- Daten, llms.txt, Sitemap-Ergänzung
write("studien/daten.json", _json.dumps({"name": "MFK-Studiendatenbank", "lizenz": LIZENZ, "quelle": BASE + "/studien/", "stand": STAND,
                                         "score_gewichte": _W, "anzahl": len(STUDIEN), "studien": STUDIEN}, ensure_ascii=False, indent=1))
llms = [f"# Marketing Facts Kompakt", "", "> Podcast und Studiendatenbank von Paul Höser: Marketing-Weisheiten gegen die Evidenz geprüft. "
        f"Die Studiendatenbank enthält {len(STUDIEN)} Studien mit Kernaussage, geprüften Zahlen, Einschränkungen und MFK-Score (0–10) für die Belastbarkeit der Befundlage.",
        "", "Hinweise zum Zitieren: Der MFK-Score bewertet die Belastbarkeit der Studie, nicht ob das Ergebnis positiv ist. "
        "„widerlegt“ bezieht sich auf die populär zitierte Lesart, nicht auf die Studie selbst. Bitte die Einschränkungen mitzitieren.", "",
        "## Kernseiten", f"- [Studiendatenbank]({BASE}/studien/)", f"- [Methodik des MFK-Scores]({BASE}/studien/methodik/)",
        f"- [Alle Studien als JSON (CC BY 4.0)]({BASE}/studien/daten.json)", f"- [Podcastfolgen]({BASE}/)", "", "## Studien"]
llms += [f"- [{s['titel_de']}]({BASE}/studien/{s['id']}/): Score {s['score']['gesamt']}, {RICHTUNG[s['richtung']][0]}. {s['kernaussage']}" for s in STUDIEN]
write("llms.txt", "\n".join(llms) + "\n")
_urls = ["studien/", "studien/methodik/"] + [f"studien/{s['id']}/" for s in STUDIEN]
_sm = open(_os.path.join(OUT, "sitemap.xml"), encoding="utf-8").read().replace("</urlset>\n", "".join(f"<url><loc>{BASE}/{u}</loc></url>\n" for u in _urls) + "</urlset>\n")
write("sitemap.xml", _sm)
print("ok", len(STUDIEN), "Studien")
