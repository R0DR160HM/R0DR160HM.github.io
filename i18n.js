// English, Portuguese and German.
//
// The page is written in English, so English is what crawlers and visitors
// without script get. This swaps every [data-i18n] string (and every
// [data-i18n-attr] attribute) for the visitor's language: their saved choice,
// else the first of their browser's languages the page has, else English.
// It also hands the 3D sky its figures' names ("lang:change"; ocean.js).
// motion.html (the reduced-motion notice) loads it too, for its own strings.
//
// Hive's rules are quoted from the tour, whose Portuguese edition is the
// author's own (hive-lang.run/?lang=pt); the German quotes are translations,
// and the page says so. Compiler output stays as hive check prints it.
//
// Loaded as a classic script at the end of <body>, so the swap happens
// before the modules run and, in practice, before the first paint.

(function () {
  const LANGS = ["en", "pt", "de"];
  const STORE = "rhm.lang";

  const TOUR_PT = "https://hive-lang.run";

  const T = {
    pt: {
      "hero.role": "Engenheiro de software",
      "hero.bio":
        "Sete anos construindo aplicações web e sistemas distribuídos. Ultimamente tenho me interessado por design de linguagens: sistemas de tipos, compiladores e tornar a concorrência algo sobre o que se consegue raciocinar.",
      "hero.contact": "Contato",
      "hero.next": "Hive, meu projeto principal",

      "hive.lede": "Uma linguagem compilada para sistemas distribuídos, em que o que falharia não compila.",
      "hive.body":
        "O Hive é meu projeto principal: uma pequena linguagem que eu projetei e construí. Não existe null, nada é lançado, e todo índice é provado dentro dos limites antes de o programa rodar. Ele compila para Go e é distribuído como um único executável nativo. Ainda é jovem — não chegou à 1.0 — e seu tour cobre a linguagem inteira em 74 slides curtos.",
      "hive.tour": "Fazer o tour",
      "hive.source": "Código",
      "hive.f1.t": "Sem falhas em produção",
      "hive.f1.d": "Sem null, sem exceções, sem índice fora do intervalo: o que falharia em outra linguagem não compila.",
      "hive.f2.t": "Um processo ou muitas máquinas",
      "hive.f2.d":
        "Serviços guardam seu estado atrás de uma caixa de mensagens, então nada precisa de lock, e chamar um serviço pela rede é exatamente igual a chamar um local.",
      "hive.f3.t": "Roda em qualquer lugar",
      "hive.f3.d": "O mesmo código no Windows, Linux, macOS, navegador, contêiner e Android.",

      "demo.files": "Programa de exemplo",
      "status.no": "Recusado na compilação",
      "a.about": `Todo índice é provado dentro dos limites antes de o programa rodar &middot; <a href="${TOUR_PT}/18?lang=pt" target="_blank" rel="noopener noreferrer">tour, slide 18</a>`,
      "a.legend": "Indexar o último elemento com",
      "a.yes": "Compila: a guarda prova o índice",
      "b.about": `Um JWT é um codec: assine um valor de um tipo seu e confira-o antes de lê-lo de volta &middot; <a href="${TOUR_PT}/60?lang=pt" target="_blank" rel="noopener noreferrer">tour, slide 60</a>`,
      "b.c1": "// Confere a assinatura e os prazos, e então lê as claims.",
      "b.yes": "Assinado, conferido e lido de volta",
      "b.why": `&ldquo;Só HS256 é aceito, o que fecha de vez o clássico ataque de confusão de algoritmo.&rdquo; (<a href="${TOUR_PT}/60?lang=pt" target="_blank" rel="noopener noreferrer">slide 60</a>)`,
      "c.about": `Um serviço trata uma mensagem por vez, aqui ou em outra máquina &middot; tour, slides <a href="${TOUR_PT}/38?lang=pt" target="_blank" rel="noopener noreferrer">38</a> e <a href="${TOUR_PT}/59?lang=pt" target="_blank" rel="noopener noreferrer">59</a>`,
      "c.c1": "// Uma mensagem por vez: sem lock, onde quer que rode.",
      "c.c2": "// em outra máquina",
      "c.pane":
        `<p class="pane-h">Rode nas duas máquinas</p><p>Na segunda, troque os dois endereços. Um nó é identificado por onde pode ser alcançado, então nada mais difere entre os dois processos.</p><p>Chamar o serviço lá é a mesma linha que chamar um aqui, e as mensagens entre dois nós chegam na ordem em que foram enviadas. &ldquo;Toda conexão entre dois nós é TLS 1.3, com autenticação mútua&rdquo; (<a href="${TOUR_PT}/59?lang=pt" target="_blank" rel="noopener noreferrer">slide 59</a>).</p>`,
      "d.about": `Uma interface é um valor: uma árvore de widgets, servida como página ou mostrada numa janela &middot; tour, slides <a href="${TOUR_PT}/64?lang=pt" target="_blank" rel="noopener noreferrer">64</a> e <a href="${TOUR_PT}/65?lang=pt" target="_blank" rel="noopener noreferrer">65</a>`,
      "d.c1": "// um documento inteiro, servido diretamente",
      "d.label": "Mais ou menos como o <code>hive.ui</code> desenha isto",
      "d.aria": "Um título dizendo Hive Tour, um campo dizendo your name e um botão Say hi",
      "d.why": `&ldquo;Como uma view é um valor, uma interface pode ser testada sem navegador&rdquo; (<a href="${TOUR_PT}/64?lang=pt" target="_blank" rel="noopener noreferrer">slide 64</a>).`,
      "demo.note": `Quatro programas pequenos, adaptados do tour do Hive. O primeiro vem numa forma que o compilador recusa e numa que ele aceita; a mensagem é do próprio <code>hive check</code>, citada do <a href="${TOUR_PT}/70?lang=pt" target="_blank" rel="noopener noreferrer">slide 70</a>.`,

      "projects.h": "Outros projetos",
      "webproxy.d": "Motor de cache distribuído baseado na web.",
      "database.d": "Banco de dados embutido para Gleam, baseado em DETS/ETS.",
      "slop.d": "Agente de IA de uso geral e foco em pesquisa, feito de brincadeira, que acabou surpreendentemente funcional.",
      "go.github": "Ver no GitHub",
      "go.hex": "Ver no Hex",
      "tags.aria": "Feito com",
      "tools.h": "Tecnologias com que trabalho",
      "tools.hint": "Aperte uma: cada uma muda a página.",
      "chip.ds": "Sistemas distribuídos",
      "chip.ai": "Agentes de IA",

      "sky.h": "O céu lá em cima",
      "sky.p":
        "Seis constelações tupi-guarani estão desenhadas no céu desta página. Elas foram registradas entre os Tupinambá por Claude d&rsquo;Abbeville em 1614 e mapeadas de novo pelo astrônomo Germano Afonso junto a comunidades guarani. Passe o cursor pelas estrelas para acendê-las, ou escolha uma abaixo.",
      "sky.aria": "Constelações",
      "sky.rhea": "a Ema",
      "sky.cross": "o Cruzeiro do Sul",
      "sky.oldman": "o Homem Velho",
      "sky.nest": "o Vespeiro",
      "sky.tapir": "a Anta",
      "sky.deer": "o Veado",
      "sky.default":
        "<h3>Seis figuras <small>escolha uma para destacá-la</small></h3><p>Cada uma foi traçada a partir das cartas de Germano Afonso. A Ema é uma constelação escura, desenhada tanto nas lacunas da Via Láctea quanto em suas estrelas.</p>",
      "fig.guyra":
        "<h3>Guyra Nhandu <small>a Ema</small></h3><p>Uma constelação escura: sua cabeça é a nebulosa do Saco de Carvão. Ela está de pé, bico erguido, os dois pés de três dedos pisando para a esquerda e a cauda enrolada, baixa, à direita, com Alfa e Beta do Centauro brilhando dentro do corpo.</p>",
      "fig.curuxu": "<h3>Curuxu <small>o Cruzeiro do Sul</small></h3><p>Logo acima e à direita da cabeça da Ema, segurando-a presa.</p>",
      "fig.tuya":
        "<h3>Tuya&rsquo;i <small>o Homem Velho</small></h3><p>Uma cabeça triangular nas Híades, sobre Aldebarã; um penacho que chega às Plêiades; um braço erguido e uma linha até Betelgeuse. A perna boa dobra nas Três Marias, as estrelas do cinturão de Órion, e a perna cortada é traçada em tracejado até Rigel.</p>",
      "fig.eixu":
        "<h3>Eixu <small>o Vespeiro, as Plêiades</small></h3><p>O mesmo aglomerado que fica na ponta do penacho do Homem Velho. Os dois foram nomeados como constelações separadas, então o vespeiro fica nesse ponto, com algumas vespas soltas em volta.</p>",
      "fig.tapi":
        "<h3>Tapi&rsquo;i <small>a Anta</small></h3><p>Ela caminha pela ponta distante da Via Láctea, baixa junto ao horizonte: o focinho na estrela brilhante perto da nebulosa, orelhas em pé, as patas traseiras arrastando atrás.</p>",
      "fig.guaxu":
        "<h3>Guaxu <small>o Veado</small></h3><p>Sobre a Via Láctea, logo à frente da Ema, saltando na mesma direção em que ela corre: focinho erguido, galhada jogada para trás, as quatro patas estendidas no meio do salto.</p>",

      "contact.h": "Fale comigo",
      "contact.p":
        "O jeito mais rápido de falar comigo é por e-mail. Meu código está no GitHub, e minha trajetória profissional está no LinkedIn.",
      "fine.made":
        "Feito à mão: HTML, CSS e three.js, sem etapa de build. Constelações segundo d&rsquo;Abbeville (1614) e Germano Afonso.",
      "lang.aria": "Idioma",
      "href.tour": `${TOUR_PT}/?lang=pt`,

      // motion.html, for visitors whose device asks for reduced motion
      "motion.title": "Animações desligadas — Rodrigo Heinzen de Moraes",
      "motion.h": "Este site fica melhor em movimento",
      "motion.lede":
        "Ele se passa num mar noturno em 3D: a câmera voa sobre a água enquanto você rola a página, um farol varre o seu feixe e as constelações se acendem quando você passa.",
      "motion.p":
        "Seu dispositivo está pedindo aos sites que reduzam o movimento, então tudo isso ficaria parado. Se você configurou isso de propósito, pode entrar: tudo funciona, só que parado.",
      "motion.how": "Ligue as animações",
      "motion.live": "Esta página percebe a mudança e deixa você entrar; se não perceber, recarregue-a.",
      "motion.mine": "seu sistema",
      "os.windows":
        "Abra <b>Configurações › Acessibilidade › Efeitos visuais</b> e ative <b>Efeitos de animação</b>.",
      "os.windows10":
        "No Windows 10: <b>Configurações › Facilidade de Acesso › Vídeo</b>, e ative <b>Mostrar animações no Windows</b>.",
      "os.macos": "Abra <b>Ajustes do Sistema › Acessibilidade › Tela</b> e desative <b>Reduzir movimento</b>.",
      "os.ios.name": "iPhone e iPad",
      "os.ios": "Abra <b>Ajustes › Acessibilidade › Movimento</b> e desative <b>Reduzir Movimento</b>.",
      "os.android":
        "Abra <b>Configurações › Acessibilidade</b> e desative <b>Remover animações</b>. Nos Pixel mais recentes fica em <b>Cor e movimento</b>; nos Samsung, em <b>Melhorias de visibilidade</b>.",
      "os.gnome":
        "GNOME: em <b>Configurações › Acessibilidade</b>, desative a opção que reduz as animações. Em versões antigas, ative <b>Ajustes › Geral › Animações</b>.",
      "os.kde":
        "KDE Plasma: nas <b>Configurações do sistema</b>, em Comportamento geral, tire a velocidade da animação de &ldquo;Instantânea&rdquo;.",
      "motion.firefox":
        "O Firefox também pode reduzir o movimento por conta própria. Se esta página continuar depois que você mudar o sistema, abra <code>about:config</code> e defina <code>ui.prefersReducedMotion</code> como 0, ou apague-o.",
      "motion.enter": "Entrar mesmo assim",
      "motion.kept": "Sua escolha fica lembrada neste dispositivo.",
    },

    de: {
      "hero.role": "Softwareentwickler",
      "hero.bio":
        "Sieben Jahre Webanwendungen und verteilte Systeme. In letzter Zeit zieht es mich zum Sprachdesign: zu Typsystemen, Compilern und zu Nebenläufigkeit, über die man vernünftig nachdenken kann.",
      "hero.contact": "Kontakt",
      "hero.next": "Hive, mein Hauptprojekt",

      "hive.lede": "Eine kompilierte Sprache für verteilte Systeme, in der nicht kompiliert, was abstürzen würde.",
      "hive.body":
        "Hive ist mein Hauptprojekt: eine kleine Sprache, die ich entworfen und gebaut habe. Es gibt kein null, nichts wird geworfen, und jeder Index wird vor dem Programmstart als gültig bewiesen. Hive kompiliert nach Go und wird als einzelne native Programmdatei ausgeliefert. Die Sprache ist jung – noch nicht 1.0 –, und ihre Tour deckt sie in 74 kurzen Folien vollständig ab.",
      "hive.tour": "Zur Tour",
      "hive.source": "Quellcode",
      "hive.f1.t": "Keine Abstürze in Produktion",
      "hive.f1.d": "Kein null, keine Exceptions, kein Index außerhalb des Bereichs: Was anderswo abstürzen würde, kompiliert nicht.",
      "hive.f2.t": "Ein Prozess oder viele Maschinen",
      "hive.f2.d":
        "Services halten ihren Zustand hinter einem Postfach, sodass nichts ein Lock braucht, und ein Aufruf über das Netzwerk sieht genauso aus wie ein lokaler.",
      "hive.f3.t": "Läuft überall",
      "hive.f3.d": "Derselbe Code unter Windows, Linux und macOS, im Browser, in einem Container und auf Android.",

      "demo.files": "Beispielprogramm",
      "status.no": "Beim Kompilieren abgelehnt",
      "a.about": `Jeder Index wird vor dem Programmstart als gültig bewiesen &middot; <a href="https://hive-lang.run/18" target="_blank" rel="noopener noreferrer">Tour, Folie 18</a>`,
      "a.legend": "Das letzte Element indizieren mit",
      "a.yes": "Kompiliert: der Guard beweist den Index",
      "b.about": `Ein JWT ist ein Codec: einen Wert des eigenen Typs signieren und vor dem Zurücklesen prüfen &middot; <a href="https://hive-lang.run/60" target="_blank" rel="noopener noreferrer">Tour, Folie 60</a>`,
      "b.c1": "// Prüft Signatur und Zeiten, dann liest es die Claims.",
      "b.yes": "Signiert, geprüft und zurückgelesen",
      "b.why": `&bdquo;Nur HS256 wird akzeptiert, was den klassischen Algorithmus-Verwechslungsangriff von vornherein ausschließt.&ldquo; (<a href="https://hive-lang.run/60" target="_blank" rel="noopener noreferrer">Folie 60</a>, übersetzt)`,
      "c.about": `Ein Service bearbeitet eine Nachricht nach der anderen, hier oder auf einer anderen Maschine &middot; Tour, Folien <a href="https://hive-lang.run/38" target="_blank" rel="noopener noreferrer">38</a> und <a href="https://hive-lang.run/59" target="_blank" rel="noopener noreferrer">59</a>`,
      "c.c1": "// Eine Nachricht nach der anderen: kein Lock, wo immer es läuft.",
      "c.c2": "// auf einer anderen Maschine",
      "c.pane":
        `<p class="pane-h">Auf beiden Maschinen ausführen</p><p>Auf der zweiten die beiden Adressen tauschen. Ein Knoten wird dadurch identifiziert, wo er erreichbar ist, also unterscheidet sich sonst nichts an den beiden Prozessen.</p><p>Den Service dort aufzurufen ist dieselbe Zeile wie ein Aufruf hier, und Nachrichten zwischen zwei Knoten kommen in der Reihenfolge an, in der sie gesendet wurden. &bdquo;Jede Verbindung zwischen zwei Knoten ist TLS 1.3, gegenseitig authentifiziert&ldquo; (<a href="https://hive-lang.run/59" target="_blank" rel="noopener noreferrer">Folie 59</a>, übersetzt).</p>`,
      "d.about": `Eine Oberfläche ist ein Wert: ein Baum aus Widgets, als Seite ausgeliefert oder in einem Fenster gezeigt &middot; Tour, Folien <a href="https://hive-lang.run/64" target="_blank" rel="noopener noreferrer">64</a> und <a href="https://hive-lang.run/65" target="_blank" rel="noopener noreferrer">65</a>`,
      "d.c1": "// ein ganzes Dokument, direkt ausgeliefert",
      "d.label": "Ungefähr so zeichnet <code>hive.ui</code> das",
      "d.aria": "Eine Überschrift Hive Tour, ein Feld your name und eine Schaltfläche Say hi",
      "d.why": `&bdquo;Weil eine View ein Wert ist, lässt sich eine Oberfläche ohne Browser testen&ldquo; (<a href="https://hive-lang.run/64" target="_blank" rel="noopener noreferrer">Folie 64</a>, übersetzt).`,
      "demo.note": `Vier kleine Programme, adaptiert aus der Hive-Tour. Das erste gibt es in einer Form, die der Compiler ablehnt, und einer, die er annimmt; die Meldung stammt von <code>hive check</code> selbst, zitiert aus <a href="https://hive-lang.run/70" target="_blank" rel="noopener noreferrer">Folie 70</a>. Zitate aus der Tour sind aus dem Englischen übersetzt.`,

      "projects.h": "Weitere Projekte",
      "webproxy.d": "Webbasierte verteilte Cache-Engine.",
      "database.d": "Eingebettete Datenbank für Gleam auf Basis von DETS/ETS.",
      "slop.d": "Ein spielerischer, recherche-orientierter Allzweck-KI-Agent, der überraschend gut funktioniert.",
      "go.github": "Auf GitHub ansehen",
      "go.hex": "Auf Hex ansehen",
      "tags.aria": "Gebaut mit",
      "tools.h": "Technologien, mit denen ich arbeite",
      "tools.hint": "Drücken Sie eine: Jede verändert die Seite.",
      "chip.ds": "Verteilte Systeme",
      "chip.ai": "KI-Agenten",

      "sky.h": "Der Himmel darüber",
      "sky.p":
        "Sechs Tupi-Guarani-Sternbilder sind in den Himmel dieser Seite gezeichnet. Claude d&rsquo;Abbeville hat sie 1614 bei den Tupinambá aufgezeichnet, und der Astronom Germano Afonso hat sie mit Guarani-Gemeinschaften neu kartiert. Fahren Sie über die Sterne, um sie aufleuchten zu lassen, oder wählen Sie unten eines aus.",
      "sky.aria": "Sternbilder",
      "sky.rhea": "der Nandu",
      "sky.cross": "das Kreuz des Südens",
      "sky.oldman": "der Alte Mann",
      "sky.nest": "das Wespennest",
      "sky.tapir": "der Tapir",
      "sky.deer": "der Hirsch",
      "sky.default":
        "<h3>Sechs Figuren <small>wählen Sie eine aus, um sie hervorzuheben</small></h3><p>Jede ist nach den Karten von Germano Afonso gezeichnet. Der Nandu ist ein dunkles Sternbild, ebenso in den Lücken der Milchstraße gezeichnet wie in ihren Sternen.</p>",
      "fig.guyra":
        "<h3>Guyra Nhandu <small>der Nandu</small></h3><p>Ein dunkles Sternbild: Sein Kopf ist der Kohlensack-Nebel. Er steht aufrecht, den Schnabel erhoben, beide dreizehigen Füße nach links schreitend und den Schwanz rechts tief eingerollt; α und β Centauri leuchten in seinem Körper.</p>",
      "fig.curuxu": "<h3>Curuxu <small>das Kreuz des Südens</small></h3><p>Knapp über und rechts vom Kopf des Nandus, den es festhält.</p>",
      "fig.tuya":
        "<h3>Tuya&rsquo;i <small>der Alte Mann</small></h3><p>Ein dreieckiger Kopf in den Hyaden, auf Aldebaran; ein Federbusch, der bis zu den Plejaden reicht; ein erhobener Arm und eine Linie zu Beteigeuze. Sein gesundes Bein knickt bei den drei Gürtelsternen des Orion ein, und sein abgetrenntes Bein ist gestrichelt bis Rigel gezeichnet.</p>",
      "fig.eixu":
        "<h3>Eixu <small>das Wespennest, die Plejaden</small></h3><p>Derselbe Sternhaufen, der den Federbusch des Alten Mannes krönt. Beide wurden als eigene Sternbilder benannt, deshalb sitzt das Nest auf diesem Punkt, mit ein paar verirrten Wespen darum.</p>",
      "fig.tapi":
        "<h3>Tapi&rsquo;i <small>der Tapir</small></h3><p>Er wandert am fernen Ende der Milchstraße, tief am Horizont: die Schnauze auf dem hellen Stern beim Nebel, die Ohren gespitzt, die Hinterbeine hinter sich herziehend.</p>",
      "fig.guaxu":
        "<h3>Guaxu <small>der Hirsch</small></h3><p>Auf der Milchstraße knapp vor dem Nandu, in dieselbe Richtung springend, in die er läuft: Maul erhoben, Geweih zurückgeworfen, alle vier Beine mitten im Sprung nach hinten gestreckt.</p>",

      "contact.h": "Kontakt aufnehmen",
      "contact.p": "Am schnellsten erreichen Sie mich per E-Mail. Mein Code liegt auf GitHub, mein beruflicher Werdegang auf LinkedIn.",
      "fine.made":
        "Von Hand gebaut: HTML, CSS und three.js, ohne Build-Schritt. Sternbilder nach d&rsquo;Abbeville (1614) und Germano Afonso.",
      "lang.aria": "Sprache",

      "motion.title": "Animationen aus — Rodrigo Heinzen de Moraes",
      "motion.h": "Diese Seite lebt von Bewegung",
      "motion.lede":
        "Sie spielt auf einem nächtlichen Meer in 3D: Beim Scrollen fliegt die Kamera über das Wasser, ein Leuchtturm lässt seinen Strahl kreisen, und die Sternbilder leuchten auf, wenn Sie vorbeikommen.",
      "motion.p":
        "Ihr Gerät bittet Websites, Bewegung zu reduzieren, also stünde all das still. Wenn Sie das bewusst so eingestellt haben, kommen Sie einfach herein: Alles funktioniert, nur ohne Bewegung.",
      "motion.how": "Animationen einschalten",
      "motion.live": "Diese Seite bemerkt die Änderung und lässt Sie herein; falls nicht, laden Sie sie neu.",
      "motion.mine": "Ihr System",
      "os.windows":
        "Öffnen Sie <b>Einstellungen › Barrierefreiheit › Visuelle Effekte</b> und schalten Sie <b>Animationseffekte</b> ein.",
      "os.windows10":
        "Unter Windows 10: <b>Einstellungen › Erleichterte Bedienung › Bildschirm</b>, dann <b>Animationen in Windows anzeigen</b> einschalten.",
      "os.macos":
        "Öffnen Sie <b>Systemeinstellungen › Bedienungshilfen › Anzeige</b> und schalten Sie <b>Bewegung reduzieren</b> aus.",
      "os.ios.name": "iPhone und iPad",
      "os.ios":
        "Öffnen Sie <b>Einstellungen › Bedienungshilfen › Bewegung</b> und schalten Sie <b>Bewegung reduzieren</b> aus.",
      "os.android":
        "Öffnen Sie <b>Einstellungen › Bedienungshilfen</b> und schalten Sie <b>Animationen entfernen</b> aus. Auf neueren Pixel-Geräten liegt die Option unter <b>Farbe und Bewegung</b>, bei Samsung unter den Optionen zur Sichtbarkeit.",
      "os.gnome":
        "GNOME: Unter <b>Einstellungen › Barrierefreiheit</b> die Option zum Reduzieren von Animationen ausschalten. In älteren Versionen <b>Optimierungen › Allgemein › Animationen</b> einschalten.",
      "os.kde":
        "KDE Plasma: In den <b>Systemeinstellungen</b> unter Allgemeines Verhalten die Animationsgeschwindigkeit von &bdquo;Sofort&ldquo; wegschieben.",
      "motion.firefox":
        "Firefox kann Bewegung auch selbst reduzieren. Bleibt diese Seite, nachdem Sie das System umgestellt haben, öffnen Sie <code>about:config</code> und setzen Sie <code>ui.prefersReducedMotion</code> auf 0 oder löschen Sie den Eintrag.",
      "motion.enter": "Trotzdem weiter",
      "motion.kept": "Ihre Wahl wird auf diesem Gerät gespeichert.",
    },
  };

  const META = {
    en: {
      title: "Rodrigo Heinzen de Moraes — Software Engineer",
      description:
        "Rodrigo Heinzen de Moraes is a software engineer with seven years in web applications and distributed systems, and the author of Hive, a compiled language for distributed systems in which what would crash does not compile.",
    },
    pt: {
      title: "Rodrigo Heinzen de Moraes — Engenheiro de software",
      description:
        "Rodrigo Heinzen de Moraes é engenheiro de software, com sete anos em aplicações web e sistemas distribuídos, e autor do Hive, uma linguagem compilada para sistemas distribuídos em que o que falharia não compila.",
    },
    de: {
      title: "Rodrigo Heinzen de Moraes — Softwareentwickler",
      description:
        "Rodrigo Heinzen de Moraes ist Softwareentwickler mit sieben Jahren Erfahrung in Webanwendungen und verteilten Systemen und Autor von Hive, einer kompilierten Sprache für verteilte Systeme, in der nicht kompiliert, was abstürzen würde.",
    },
  };

  // the 3D sky's labels: [leading name, [the rest, dimmer]] per figure
  const SKY = {
    en: {
      "guyra-nhandu": ["The Rhea", ["Guyra Nhandu"]],
      "tuya-i": ["The Old Man", ["Tuya’i"]],
      "tapi-i": ["The Tapir", ["Tapi’i"]],
      guaxu: ["The Deer", ["Guaxu"]],
      eixu: ["Pleiades", ["Eixu (the Wasps’ Nest)"]],
      curuxu: ["The Southern Cross", ["Curuxu"]],
    },
    pt: {
      "guyra-nhandu": ["A Ema", ["Guyra Nhandu"]],
      "tuya-i": ["O Homem Velho", ["Tuya’i"]],
      "tapi-i": ["A Anta", ["Tapi’i"]],
      guaxu: ["O Veado", ["Guaxu"]],
      eixu: ["Plêiades", ["Eixu (o Vespeiro)"]],
      curuxu: ["O Cruzeiro do Sul", ["Curuxu"]],
    },
    de: {
      "guyra-nhandu": ["Der Nandu", ["Guyra Nhandu"]],
      "tuya-i": ["Der Alte Mann", ["Tuya’i"]],
      "tapi-i": ["Der Tapir", ["Tapi’i"]],
      guaxu: ["Der Hirsch", ["Guaxu"]],
      eixu: ["Plejaden", ["Eixu (das Wespennest)"]],
      curuxu: ["Das Kreuz des Südens", ["Curuxu"]],
    },
  };

  // every place a string can live: the document, and the page's templates
  const roots = () => [document, ...Array.from(document.querySelectorAll("template"), (t) => t.content)];

  const english = new Map();
  const englishAttr = new Map();
  const attrPairs = (el) => el.dataset.i18nAttr.split(";").map((pair) => pair.split(":"));

  for (const root of roots()) {
    for (const el of root.querySelectorAll("[data-i18n]")) {
      if (!english.has(el.dataset.i18n)) english.set(el.dataset.i18n, el.innerHTML.trim());
    }
    for (const el of root.querySelectorAll("[data-i18n-attr]")) {
      for (const [attr, key] of attrPairs(el)) if (!englishAttr.has(key)) englishAttr.set(key, el.getAttribute(attr));
    }
  }

  const said = (lang, key, fallback) => (lang !== "en" && T[lang][key] != null ? T[lang][key] : fallback.get(key));

  let current = "en";

  function apply(lang) {
    current = lang;
    for (const root of roots()) {
      for (const el of root.querySelectorAll("[data-i18n]")) {
        const html = said(lang, el.dataset.i18n, english);
        if (html != null && el.innerHTML.trim() !== html) el.innerHTML = html;
      }
      for (const el of root.querySelectorAll("[data-i18n-attr]")) {
        for (const [attr, key] of attrPairs(el)) {
          const value = said(lang, key, englishAttr);
          if (value != null) el.setAttribute(attr, value);
        }
      }
    }
    document.documentElement.lang = lang;
    // a page that translates its own <title> (motion.html) keeps its own meta
    if (!document.querySelector("title[data-i18n]")) {
      document.title = META[lang].title;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute("content", META[lang].description);
    }
    for (const b of document.querySelectorAll(".lang button[data-lang]")) {
      b.setAttribute("aria-pressed", String(b.dataset.lang === lang));
    }
    window.dispatchEvent(new CustomEvent("lang:change", { detail: { lang, sky: SKY[lang] } }));
  }

  function initial() {
    try {
      const saved = localStorage.getItem(STORE);
      if (LANGS.includes(saved)) return saved;
    } catch (e) {
      // storage blocked: fall through to the browser's languages
    }
    const wanted = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    for (const tag of wanted) {
      const base = String(tag).toLowerCase().split("-")[0];
      if (LANGS.includes(base)) return base;
    }
    return "en";
  }

  function choose(lang) {
    if (!LANGS.includes(lang) || lang === current) return;
    try {
      localStorage.setItem(STORE, lang);
    } catch (e) {
      // the choice still holds for this visit
    }
    apply(lang);
  }

  for (const b of document.querySelectorAll(".lang button[data-lang]")) {
    b.addEventListener("click", () => choose(b.dataset.lang));
  }

  window.siteI18n = {
    get lang() {
      return current;
    },
    sky: () => SKY[current],
    choose,
  };

  const start = initial();
  if (start !== "en") apply(start);
  else document.documentElement.lang = "en";
})();
