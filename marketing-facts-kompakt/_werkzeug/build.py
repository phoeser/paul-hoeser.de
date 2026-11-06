#!/usr/bin/env python3
"""Baut die statische Website "Marketing Facts Kompakt" aus data.json (aus dem RSS-Feed)."""
import json, re, html, os
from email.utils import parsedate_to_datetime

BASE = "https://phoeser.github.io/marketing-facts-kompakt"
SPOTIFY = "https://open.spotify.com/show/033JO00A6BiFuyAd5QFUDY"
RSS = "https://anchor.fm/s/1148b8840/podcast/rss"
import sys, urllib.request, xml.etree.ElementTree as ET
# Aufruf: python3 build.py [ausgabeordner]   – liest den RSS-Feed selbst
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), "site")

MONATE = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."]
TAGE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]

def lade_feed():
    req = urllib.request.Request("https://anchor.fm/s/1148b8840/podcast/rss", headers={"User-Agent": "mfk-site-builder"})
    root = ET.fromstring(urllib.request.urlopen(req, timeout=30).read())
    ns = {"itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd"}
    ch = root.find("channel")
    out = []
    for it in ch.findall("item"):
        num = it.find("itunes:episode", ns)
        if num is None:
            continue
        out.append(dict(n=int(num.text), title=it.find("title").text, date=it.find("pubDate").text,
                        dur=it.find("itunes:duration", ns).text, mp3=it.find("enclosure").get("url"),
                        img=it.find("itunes:image", ns).get("href"), desc=it.find("description").text))
    return dict(show_img=ch.find("itunes:image", ns).get("href"), eps=out)

d = lade_feed()
eps = sorted(d["eps"], key=lambda e: e["n"], reverse=True)

esc = lambda s: html.escape(s, quote=True)


def datum(s):
    dt = parsedate_to_datetime(s)
    return f"{TAGE[dt.weekday()]}, {dt.day}. {MONATE[dt.month-1]} {dt.year}", dt.date().isoformat()


def minuten(dur):
    h, m, s = [int(x) for x in dur.split(":")]
    return round(h * 60 + m + s / 60)


def titel(t):
    t = re.sub(r"^Folge \d+:\s*", "", t)
    if " – " in t:
        a, b = t.split(" – ", 1)
        return a.strip(), b.strip()
    return t.strip(), ""


def absaetze(desc):
    """Zerlegt die Beschreibung in Fließtext-Absätze und Quellenliste; Boilerplate fällt weg."""
    paras = re.findall(r"<p>(.*?)</p>", desc, flags=re.S)
    text, quellen = [], []
    for p in paras:
        plain = re.sub(r"<[^>]+>", "", p)
        if p.startswith("<b>Quellen</b>"):
            body = p.split("<br />", 1)[1] if "<br />" in p else ""
            quellen = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip() for x in body.split("<br />") if x.strip()]
            continue
        if plain.startswith("Marketing Facts Kompakt –") or "Weitere Podcasts" in plain \
                or plain.startswith("Biohacking Kompakt") or plain.startswith("Topf "):
            continue
        text.append(html.unescape(plain).strip())
    return text, quellen


for e in eps:
    e["kopf"], e["unter"] = titel(e["title"])
    e["datum"], e["iso"] = datum(e["date"])
    e["min"] = minuten(e["dur"])
    e["text"], e["quellen"] = absaetze(e["desc"])
    e["slug"] = f"{e['n']:02d}"

CSS = """
:root{color-scheme:dark;--bg:#071012;--bg2:#0c1a1c;--card:#0f2124;--line:#1d3538;--ink:#eef5f2;--mute:#9fb6b0;--lime:#b8f040;--teal:#2fd3b2;--grad:linear-gradient(90deg,#b8f040,#2fd3b2)}
:root[data-theme="light"]{color-scheme:light;--bg:#f6faf8;--bg2:#eaf3ef;--card:#fff;--line:#d5e4de;--ink:#0b1a1c;--mute:#4d6661;--lime:#4e8f00;--teal:#0f8f78;--grad:linear-gradient(90deg,#4e8f00,#0f8f78)}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--teal)}a:hover{color:var(--lime)}
.wrap{max-width:960px;margin:0 auto;padding:0 20px}
header.top{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
header.top .wrap{display:flex;align-items:center;gap:16px;height:60px}
.brand{white-space:nowrap;display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--ink);font-weight:700;letter-spacing:.01em}
.brand img{width:34px;height:34px;border-radius:7px}
.brand b{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
nav.links{margin-left:auto;display:flex;gap:18px;font-size:15px}
nav.links a{color:var(--mute);text-decoration:none}nav.links a:hover,nav.links a[aria-current]{color:var(--ink)}
.hero{display:grid;grid-template-columns:260px 1fr;gap:36px;align-items:center;padding:48px 0 40px}
.hero img{width:100%;border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.35)}
.kicker{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:var(--lime);font-weight:700;margin:0 0 6px}
h1{font-size:44px;line-height:1.08;margin:0 0 14px;letter-spacing:-.01em}
h1 .g{background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent}
.lead{color:var(--mute);font-size:18px;margin:0 0 20px;max-width:56ch}
.btns{display:flex;flex-wrap:wrap;gap:10px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 16px;border:1px solid var(--line);border-radius:999px;text-decoration:none;color:var(--ink);font-size:15px;font-weight:600;background:var(--card)}
.btn:hover{border-color:var(--teal);color:var(--ink)}
.btn.primary{background:var(--grad);color:#071012;border:0}
h2{font-size:28px;margin:40px 0 18px;letter-spacing:-.01em}
.ep{display:grid;grid-template-columns:120px 1fr;gap:20px;padding:22px 0;border-top:1px solid var(--line)}
.tile{width:120px;height:120px;border-radius:10px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;background:radial-gradient(circle at 25% 30%,#2a5a1c 0,transparent 55%),radial-gradient(circle at 80% 20%,#0f4a46 0,transparent 50%),#081214;box-shadow:inset 0 0 0 1px rgba(255,255,255,.06)}.tile span{font-size:11px;letter-spacing:.2em;color:#b8f040;font-weight:700}.tile b{font-size:46px;line-height:1;background:linear-gradient(90deg,#b8f040,#2fd3b2);-webkit-background-clip:text;background-clip:text;color:transparent;font-weight:800}.tile i{font-style:normal;font-size:9px;letter-spacing:.12em;color:#cfe;opacity:.75;margin-top:6px}
.meta{font-size:14px;color:var(--mute);margin:0 0 4px}
.meta .new{color:#071012;background:var(--lime);border-radius:4px;padding:1px 6px;font-weight:700;margin-left:6px;font-size:12px}
.ep h3{margin:0 0 6px;font-size:21px;line-height:1.25}
.ep h3 a{color:var(--ink);text-decoration:none}.ep h3 a:hover{color:var(--teal)}
.ep h3 small{display:block;font-weight:500;color:var(--mute);font-size:16px;margin-top:2px}
.ep p.t{margin:0 0 10px;color:var(--ink);opacity:.9;font-size:16px}
audio{width:100%;max-width:520px;height:40px;margin:4px 0 6px}
.more{font-size:15px;font-weight:600;text-decoration:none}
.pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.pill{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px}
.pill h3{margin:0 0 6px;font-size:18px}.pill p{margin:0;color:var(--mute);font-size:15px}
.family{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.family .pill a{margin-right:12px;font-size:15px;font-weight:600}
footer{margin-top:56px;border-top:1px solid var(--line);padding:28px 0 40px;color:var(--mute);font-size:14px}
footer .wrap{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:space-between}
footer nav a{color:var(--mute);margin-right:14px}
.article{max-width:720px}
.article .head{display:grid;grid-template-columns:200px 1fr;gap:28px;align-items:center;padding:40px 0 10px}
.article .head img{width:100%;border-radius:14px}
.article h1{font-size:34px}
.article h1 small{display:block;font-size:20px;font-weight:500;color:var(--mute);margin-top:8px;line-height:1.35}
.article p{margin:0 0 16px}
.quellen{padding-left:20px;color:var(--mute);font-size:15px}.quellen li{margin-bottom:6px}
.pager{display:flex;justify-content:space-between;gap:16px;margin:36px 0 0;font-size:15px}
.prose{max-width:720px;padding:36px 0}.prose h1{font-size:34px}.prose h2{font-size:21px;margin:28px 0 8px}
.theme{display:inline-flex;align-items:center;justify-content:center;flex:none;background:none;border:1px solid var(--line);color:var(--mute);border-radius:999px;width:34px;height:34px;cursor:pointer;font-size:15px}
@media (max-width:720px){.hero{grid-template-columns:1fr;gap:22px;padding:28px 0}.hero img{max-width:220px}h1{font-size:34px}
.ep{grid-template-columns:76px 1fr;gap:14px}.tile{width:76px;height:76px}.tile b{font-size:30px}.tile i{display:none}.tile span{font-size:9px}.pillars,.family{grid-template-columns:1fr}
.article .head{grid-template-columns:1fr}.article .head img{max-width:220px}nav.links{gap:12px}.brand{font-size:15px}.brand img{width:28px;height:28px}nav.links .hide-s{display:none}}
"""

THEME_JS = """<script>try{var t=localStorage.getItem('mfk-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>"""

# nur ein Player gleichzeitig
PLAYER_JS = '<script src="{pre}site.js" defer></script>'

MAIL_JS = """<span class="mail"><noscript>phoeser [at] web.de</noscript></span><script>document.querySelectorAll('.mail').forEach(function(s){var a='phoeser',b='web.de',l=document.createElement('a');l.href='mailto:'+a+'@'+b;l.textContent=a+'@'+b;s.appendChild(l)})</script>"""


def page(title, desc, body, path="", og_img=None, cur="", depth=0):
    og_img = og_img or d["show_img"]
    pre = "../" * depth
    canon = BASE + "/" + path
    nav = lambda href, label, key, cls="": f'<a href="{pre}{href}"{" aria-current=page" if cur==key else ""}{f" class={cls}" if cls else ""}>{label}</a>'
    return f"""<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title><meta name="description" content="{esc(desc)}">
<link rel="canonical" href="{canon}"><meta name="theme-color" content="#071012">
<meta property="og:type" content="website"><meta property="og:site_name" content="Marketing Facts Kompakt">
<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">
<meta property="og:url" content="{canon}"><meta property="og:image" content="{og_img}"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%227%22 fill=%22%23081214%22/%3E%3Cpath d=%22M7 23l6-6 5 3 7-9%22 fill=%22none%22 stroke=%22%23b8f040%22 stroke-width=%222.6%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3Ccircle cx=%2225%22 cy=%2211%22 r=%222.6%22 fill=%22%232fd3b2%22/%3E%3C/svg%3E"><link rel="alternate" type="application/rss+xml" title="Marketing Facts Kompakt" href="{RSS}">
<link rel="stylesheet" href="{pre}style.css">{THEME_JS}</head><body>
<header class="top"><div class="wrap"><a class="brand" href="{pre}./"><img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Crect width=%2232%22 height=%2232%22 rx=%227%22 fill=%22%23081214%22/%3E%3Cpath d=%22M7 23l6-6 5 3 7-9%22 fill=%22none%22 stroke=%22%23b8f040%22 stroke-width=%222.6%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/%3E%3Ccircle cx=%2225%22 cy=%2211%22 r=%222.6%22 fill=%22%232fd3b2%22/%3E%3C/svg%3E" alt=""><span>Marketing Facts <b>Kompakt</b></span></a>
<nav class="links">{nav("./", "Folgen", "home")}{nav("ueber/", "Über", "ueber", "hide-s")}{nav("./#weitere-podcasts", "Weitere Podcasts", "x", "hide-s")}</nav>
<button class="theme" onclick="mfkTheme()" aria-label="Hell/Dunkel umschalten" title="Hell/Dunkel"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg></button></div></header>
<main class="wrap">{body}</main>
<footer><div class="wrap"><span>© 2026 Paul Höser · Marketing Facts Kompakt</span>
<nav><a href="{RSS}">RSS</a><a href="{pre}ueber/">Über</a><a href="{pre}impressum/">Impressum</a><a href="{pre}datenschutz/">Datenschutz</a></nav></div></footer>
{PLAYER_JS.format(pre=pre)}</body></html>"""


def plattformen():
    return f"""<div class="btns"><a class="btn primary" href="{SPOTIFY}" rel="noopener">▶ Auf Spotify hören</a><a class="btn" href="{RSS}">RSS-Feed</a></div>"""


FAMILIE = """<section id="weitere-podcasts"><p class="kicker" style="margin-top:48px">Auch von Paul Höser</p><h2 style="margin-top:0">Weitere Podcasts</h2>
<div class="family">
<div class="pill"><h3>KI News Kompakt</h3><p>Was in der KI-Welt wirklich passiert, montags bis freitags eingeordnet.</p><p style="margin-top:10px"><a href="https://open.spotify.com/show/2aoSg3uVbgoZe22oOwdLqp" rel="noopener">Spotify</a><a href="https://ki-news-kompakt.de" rel="noopener">Website</a></p></div>
<div class="pill"><h3>Biohacking Kompakt</h3><p>Longevity und Biohacking, evidenzbasiert in zehn Minuten.</p><p style="margin-top:10px"><a href="https://open.spotify.com/show/033JO82L47Sg4YSmPYas0z" rel="noopener">Spotify</a><a href="https://biohackingkompakt.de" rel="noopener">Website</a></p></div>
<div class="pill"><h3>Topf &amp; Tempo</h3><p>Schnelle Alltagsküche mit Mira und Jonas.</p><p style="margin-top:10px"><a href="https://open.spotify.com/show/4b9mKGp43hKHWoVJnmaYRd" rel="noopener">Spotify</a><a href="https://phoeser.github.io/topf-und-tempo" rel="noopener">Website</a></p></div>
</div></section>"""


def write(rel, content):
    p = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(content)


# ---------- Startseite
items = []
for i, e in enumerate(eps):
    teaser = e["text"][0] if e["text"] else ""
    neu = '<span class="new">Neu</span>' if i == 0 else ""
    unter = f"<small>{esc(e['unter'])}</small>" if e["unter"] else ""
    items.append(f"""<article class="ep"><a class="tile" href="folge/{e['slug']}/" aria-label="Folge {e['n']}"><span>FOLGE</span><b>{e['n']}</b><i>MFK</i></a><div>
<p class="meta">Folge {e['n']} · {e['datum']} · {e['min']} Min.{neu}</p>
<h3><a href="folge/{e['slug']}/">{esc(e['kopf'])}{unter}</a></h3>
<p class="t">{esc(teaser)}</p>
<audio controls preload="none" src="{esc(e['mp3'])}"></audio><br><a class="more" href="folge/{e['slug']}/">Shownotes &amp; Quellen →</a></div></article>""")

home = f"""<section class="hero"><img src="{d['show_img']}" alt="Marketing Facts Kompakt – Podcast-Cover" width="260" height="260">
<div><p class="kicker">Podcast · Neue Folgen montags und donnerstags</p><h1>Marketing Facts <span class="g">Kompakt</span></h1>
<p class="lead">Paul und Paula nehmen pro Folge eine verbreitete Marketing-Weisheit vor und schauen nach, was die Evidenz hergibt: welche Studie dahintersteckt, wie stark sie ist und wem die Zahl nützt. Ein Thema, ein Kernfakt, eine ehrliche Bilanz – in rund zehn Minuten.</p>
{plattformen()}</div></section>
<h2 id="folgen">Alle Folgen</h2>
{''.join(items)}
<h2>Worum es geht</h2>
<div class="pillars">
<div class="pill"><h3>Die Zahl</h3><p>Jede Folge startet mit einer Marketing-Weisheit, die auf Konferenzfolien steht – 95:5, 60/40, Double Jeopardy, Share of Search.</p></div>
<div class="pill"><h3>Die Quelle</h3><p>Woher stammt sie, wer hat sie bezahlt, wie belastbar ist das Studiendesign? Herstellerzahlen nennen wir als solche.</p></div>
<div class="pill"><h3>Die Bilanz</h3><p>Was bleibt übrig, was kannst du am Montag damit tun – und wo hören die Daten auf. Alle Quellen stehen in den Shownotes.</p></div>
</div>
{FAMILIE}"""
write("index.html", page("Marketing Facts Kompakt – der Podcast mit Paul & Paula",
                         "Relevante Marketing-Themen in zehn Minuten kompakt erklärt: Paul und Paula prüfen Marketing-Weisheiten gegen die Evidenz.",
                         home, cur="home"))

# ---------- Folgenseiten
by_n = {e["n"]: e for e in eps}
nums = sorted(by_n)
for e in eps:
    idx = nums.index(e["n"])
    prev_e = by_n[nums[idx - 1]] if idx > 0 else None
    next_e = by_n[nums[idx + 1]] if idx < len(nums) - 1 else None
    unter = f"<small>{esc(e['unter'])}</small>" if e["unter"] else ""
    paras = "".join(f"<p>{esc(t)}</p>" for t in e["text"])
    quellen = ("<h2>Quellen</h2><ul class=quellen>" + "".join(f"<li>{esc(q)}</li>" for q in e["quellen"]) + "</ul>") if e["quellen"] else ""
    pager = '<div class="pager">' + \
        (f'<a href="../{prev_e["slug"]}/">← Folge {prev_e["n"]}: {esc(prev_e["kopf"])}</a>' if prev_e else "<span></span>") + \
        (f'<a href="../{next_e["slug"]}/">Folge {next_e["n"]}: {esc(next_e["kopf"])} →</a>' if next_e else "<span></span>") + "</div>"
    ld = json.dumps({"@context": "https://schema.org", "@type": "PodcastEpisode", "episodeNumber": e["n"],
                     "name": e["title"], "datePublished": e["iso"], "url": f"{BASE}/folge/{e['slug']}/",
                     "description": e["text"][0] if e["text"] else "", "timeRequired": f"PT{e['min']}M",
                     "associatedMedia": {"@type": "MediaObject", "contentUrl": e["mp3"]},
                     "partOfSeries": {"@type": "PodcastSeries", "name": "Marketing Facts Kompakt", "url": BASE + "/"}},
                    ensure_ascii=False)
    body = f"""<div class="article"><div class="head"><img src="{e['img']}" alt="Cover Folge {e['n']}" width="200" height="200">
<div><p class="kicker">Folge {e['n']}</p><h1>{esc(e['kopf'])}{unter}</h1><p class="meta">{e['datum']} · {e['min']} Min. · mit Paul und Paula</p></div></div>
<audio controls preload="none" src="{esc(e['mp3'])}" style="max-width:none"></audio>
<p class="btns" style="margin:6px 0 26px"><a class="btn" href="{SPOTIFY}" rel="noopener">Auf Spotify hören</a></p>
{paras}{quellen}{pager}
<p style="margin-top:28px"><a href="../../">← Alle Folgen</a></p></div>
<script type="application/ld+json">{ld}</script>"""
    write(f"folge/{e['slug']}/index.html",
          page(f"Folge {e['n']}: {e['kopf']} – Marketing Facts Kompakt", e["text"][0] if e["text"] else e["title"], body,
               path=f"folge/{e['slug']}/", og_img=e['img'], depth=2))

# ---------- Über
ueber = f"""<div class="prose"><p class="kicker">Über den Podcast</p><h1>Marketing Facts Kompakt</h1>
<p>Marketing lebt von Zahlen, die jeder zitiert und kaum jemand nachgerechnet hat. In Marketing Facts Kompakt nehmen sich Paul und Paula pro Folge genau eine davon vor: Woher kommt sie, wie wurde sie gemessen, wer hat die Studie bezahlt – und was bleibt am Ende übrig?</p>
<p>Der Podcast richtet sich an Marketing-Profis und Entscheider, die Budgets verantworten. Die Themen sind branchenneutral: mal Grundlagen und Evergreens, mal Mythen gegen Evidenz, mal ganz aktuelle Entwicklungen – mit einem Schwerpunkt auf KI-Suche und Werbung in KI-Antworten.</p>
<h2>Wie die Folgen entstehen</h2>
<p>Recherche, Themenauswahl und redaktionelle Verantwortung liegen bei Paul Höser. Die Folgen werden mit KI-gestützter Sprachsynthese vertont; die Stimme „Paul“ basiert auf einer Stimmklonung des Betreibers, „Paula“ ist eine synthetische Stimme. Jede Folge nennt ihre Quellen in den Shownotes.</p>
<h2>Hören</h2>{plattformen()}
<h2>Kontakt</h2><p>Paul Höser · {MAIL_JS}</p></div>"""
write("ueber/index.html", page("Über – Marketing Facts Kompakt", "Worum es im Podcast Marketing Facts Kompakt geht und wie die Folgen entstehen.", ueber, path="ueber/", cur="ueber", depth=1))

# ---------- Impressum
impressum = f"""<div class="prose"><h1>Impressum</h1>
<h2>Angaben gemäß § 5 DDG</h2><p>Paul Höser<br>Lohengrinstraße 8<br>81925 München</p>
<h2>Kontakt</h2><p>E-Mail: {MAIL_JS}</p>
<h2>Umsatzsteuer-ID</h2><p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: DE343546867</p>
<h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2><p>Paul Höser, Anschrift wie oben. Das gilt auch für den Podcast „Marketing Facts Kompakt“.</p>
<h2>Hinweis zu den Inhalten</h2><p>Die Inhalte dienen der allgemeinen Information und ersetzen keine Rechts-, Steuer- oder Unternehmensberatung. Genannte Unternehmen, Studien und Produkte werden redaktionell ausgewählt; bezahlte Partnerschaften bestehen nicht.</p>
<h2>KI-Stimmen</h2><p>Die Audioinhalte entstehen mit KI-gestützter Sprachsynthese. Die Stimme „Paul“ basiert auf einer Stimmklonung des Betreibers. Recherche, Themenauswahl und redaktionelle Verantwortung liegen beim Betreiber.</p>
<h2>Haftung für Inhalte und Links</h2><p>Als Diensteanbieter bin ich für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Für Inhalte externer Websites, auf die verlinkt wird, ist der jeweilige Anbieter verantwortlich. Werden mir Rechtsverletzungen bekannt, entferne ich die betreffenden Inhalte oder Links umgehend.</p>
<h2>Urheberrecht</h2><p>Die Inhalte dieser Website und des Podcasts unterliegen dem deutschen Urheberrecht.</p>
<h2>Verbraucherstreitbeilegung</h2><p>Ich bin nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
<p class="meta">Stand: November 2026 · <a href="../datenschutz/">Datenschutzerklärung</a></p></div>"""
write("impressum/index.html", page("Impressum – Marketing Facts Kompakt", "Impressum des Podcasts Marketing Facts Kompakt.", impressum, path="impressum/", depth=1))

# ---------- Datenschutz
ds = f"""<div class="prose"><h1>Datenschutzerklärung</h1>
<h2>1. Verantwortlicher</h2><p>Paul Höser, Lohengrinstraße 8, 81925 München, E-Mail: {MAIL_JS}. Ein Datenschutzbeauftragter ist gesetzlich nicht vorgeschrieben und daher nicht benannt.</p>
<h2>2. Hosting über GitHub Pages</h2><p>Diese Website wird über GitHub Pages bereitgestellt (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA, ein Unternehmen von Microsoft). Beim Aufruf verarbeitet GitHub technisch notwendige Zugriffsdaten, insbesondere IP-Adresse, Datum und Uhrzeit, abgerufene Datei, Referrer sowie Browser und Betriebssystem, um die Seite auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. GitHub ist nach dem EU-U.S. Data Privacy Framework zertifiziert. Ich werte diese Daten nicht personenbezogen aus.</p>
<h2>3. Audio und Cover-Bilder</h2><p>Audiodateien und Cover-Bilder werden nicht von dieser Website, sondern über Spotify for Creators (Spotify AB, Regeringsgatan 19, 111 53 Stockholm, Schweden) und deren Auslieferungsnetz (Amazon CloudFront) bereitgestellt. Die Cover werden beim Seitenaufruf geladen, die Audiodateien erst, wenn du auf Abspielen drückst. Dabei überträgt dein Browser die oben genannten Zugriffsdaten, insbesondere deine IP-Adresse, an diese Anbieter. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO bzw. deine Handlung (Klick auf Abspielen). Es gelten zusätzlich die <a href="https://www.spotify.com/de/legal/privacy-policy/" rel="noopener">Datenschutzhinweise von Spotify</a>.</p>
<h2>4. Cookies, Schriften und Tracking</h2><p>Diese Website setzt keine Cookies, nutzt keine Reichweitenmessung und lädt keine Schriften von Drittanbietern. Gespeichert wird lediglich deine Wahl zwischen heller und dunkler Darstellung im lokalen Speicher deines Browsers, wenn du den Umschalter benutzt; diese Information verlässt dein Gerät nicht und ist für die von dir gewünschte Funktion erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG).</p>
<h2>5. Externe Links</h2><p>Links zu Spotify, anderen Podcasts oder Quellen werden erst wirksam, wenn du sie anklickst. Dann gelten die Datenschutzbestimmungen des jeweiligen Anbieters.</p>
<h2>6. Kontakt per E-Mail</h2><p>Wenn du mir schreibst, verarbeite ich deine E-Mail-Adresse und den Inhalt deiner Nachricht, um sie zu beantworten (Art. 6 Abs. 1 lit. b bzw. f DSGVO). Die Nachricht wird gelöscht, sobald sie erledigt ist und keine Aufbewahrungspflichten bestehen.</p>
<h2>7. Deine Rechte</h2><p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch (Art. 15 bis 21 DSGVO). Wende dich dazu per E-Mail an mich. Außerdem kannst du dich beim Bayerischen Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach, beschweren.</p>
<p class="meta">Stand: November 2026</p></div>"""
write("datenschutz/index.html", page("Datenschutz – Marketing Facts Kompakt", "Datenschutzerklärung des Podcasts Marketing Facts Kompakt.", ds, path="datenschutz/", depth=1))

# ---------- 404, Stil, Sitemap, robots
write("404.html", page("Seite nicht gefunden – Marketing Facts Kompakt", "Diese Seite gibt es nicht.",
                       '<div class="prose"><h1>Diese Seite gibt es nicht.</h1><p><a href="/marketing-facts-kompakt/">Zu allen Folgen →</a></p></div>'))
write("style.css", CSS.strip() + "\n")
write("site.js", "function mfkTheme(){var r=document.documentElement,n=(r.getAttribute('data-theme')||'dark')==='light'?'dark':'light';r.setAttribute('data-theme',n);try{localStorage.setItem('mfk-theme',n)}catch(e){}}\ndocument.addEventListener('play',function(e){document.querySelectorAll('audio').forEach(function(a){if(a!==e.target)a.pause()})},true);\n")
write(".nojekyll", "")
urls = ["", "ueber/", "impressum/", "datenschutz/"] + [f"folge/{e['slug']}/" for e in eps]
write("sitemap.xml", '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      "".join(f"<url><loc>{BASE}/{u}</loc></url>\n" for u in urls) + "</urlset>\n")
write("robots.txt", f"User-agent: *\nAllow: /\nSitemap: {BASE}/sitemap.xml\n")
write("README.md", "# Marketing Facts Kompakt\n\nWebsite zum Podcast von Paul Höser: " + BASE + "\n\nStatisch erzeugt aus dem RSS-Feed (" + RSS + ").\n")
print("ok", len(eps), "Folgen")
