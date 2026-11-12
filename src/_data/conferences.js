/**
 * Central conferences data source.
 *
 * What this file is
 * -----------------
 * One structured entry per annual conference, sorted reverse-chronologically.
 * Drives:
 *   - the "Next conference" featured card on src/index{,.fr,.de}.njk
 *   - the archive list on src/past{,.fr,.de}.njk
 *   - (longer-term) the share-card generator and Indico sync, both of which
 *     can read from here instead of carrying their own duplicated copy.
 *
 * What this file is NOT
 * ---------------------
 * The per-year content pages (src/2026.njk, src/2025.njk, …) still live on
 * their own. Each year has substantial unique content — venue maps, partner
 * logos, programme PDFs, neighbourhood tile grids — that wouldn't fit a
 * one-size-fits-all template. Those pages can OPTIONALLY consume fields
 * from here to avoid restating dates / city / etc., but they're not
 * forced to.
 *
 * Adding a new conference
 * -----------------------
 * See docs/new-conference.md. The short version: prepend a new entry to
 * the `conferences` array below with `startDate` and `endDate` in
 * ISO-8601, then create the per-year .njk page (template at
 * docs/new-conference-template.njk). The featured card on / and the
 * archive list on /past automatically pick up the change on the next build.
 *
 * The "today" cut-off
 * -------------------
 * `next` is whichever entry has the earliest `startDate` that's strictly
 * in the future relative to the build's wall-clock day. `past` is everything
 * with `endDate` < today. Eleventy builds happen on every push and on a
 * daily cron (the schedule in .github/workflows/deploy.yml), so the cut-off
 * advances within ~24 hours of a conference ending without any manual edit.
 */

// Entries: most recent first. New conferences go at the top.
// All language-specific strings are pre-composed (cheaper to maintain than
// localising via a date-format library — adding a conference is annual).
const conferences = [
  {
    slug: "2027",
    year: 2027,
    ordinal: 10,
    startDate: "2027-06-10",
    endDate: "2027-06-11",
    city: "Belgrade",
    country: "Serbia",
    venue: {
      en: "University of Belgrade, Faculty of Political Science",
      fr: "Université de Belgrade, Faculté de sciences politiques",
      de: "Universität Belgrad, Fakultät für Politikwissenschaften",
    },
    dates: {
      en: "10–11 June 2027",
      fr: "10–11 juin 2027",
      de: "10.–11. Juni 2027",
    },
    archiveMeta: {
      en: "10th Annual Conference · 10–11 June 2027 · University of Belgrade, Faculty of Political Science, Belgrade",
      fr: "10e conférence annuelle · 10–11 juin 2027 · Université de Belgrade, Faculté de sciences politiques, Belgrade",
      de: "10. Jahreskonferenz · 10.–11. Juni 2027 · Universität Belgrad, Fakultät für Politikwissenschaften, Belgrad",
    },
    organisers: {
      en: "Jointly organised by the COST Action NetSec, the European Initiative for Security Studies (EISS), and the University of Belgrade, Faculty of Political Science.",
      fr: "Organisée conjointement par l'Action COST NetSec, l'Initiative européenne pour les études de sécurité (EISS), et la Faculté de sciences politiques de l'Université de Belgrade.",
      de: "Gemeinsam organisiert von der COST-Aktion NetSec, der Europäischen Initiative für Sicherheitsstudien (EISS) und der Fakultät für Politikwissenschaften der Universität Belgrad.",
    },
    monthLabel: {
      en: "June",
      fr: "Juin",
      de: "Juni",
    },
    dayRange: "10–11",
    yearLine: "2027 · Belgrade",
    cityLabel: { fr: "Belgrade", de: "Belgrad" },
    displayCity: { en: "Belgrade", fr: "Belgrade", de: "Belgrad" },
    // ponytail: no heroImage yet, so the homepage hero keeps the Stockholm
    // photo. Add a Belgrade stem (-480x270, -800x450, -1600x900) when one
    // is chosen (docs/new-conference.md step 1).
    hasOwnPage: true,
    // The call for papers section on /2027 (src/_includes/cfp.njk, #1526).
    // While `published` is false the page keeps its "coming soon" card and
    // nothing below renders. `published` goes to true only once
    // EISSeuropa/netsec.github.io#1563 records approval from EISS and COST.
    // The themes are the call's closed panels, in its order. The English is
    // the call's wording. The FR and DE are machine translations (CLAUDE.md §1).
    // The dates come from the "EISS dates" calendar through dashboard.js:
    // every EISS key date after `opens` and before the conference.
    cfp: {
      published: true,
      opens: "2026-11-10",
      // The proposals deadline. Until then the registration badge (home page
      // hero and /2027) reads "Submissions open".
      closes: "2027-01-26",
      // The ESSC 2027 event on Indico.
      submitUrl: "https://indico.eiss-europa.com/event/25/",
      // The approved call as a PDF.
      pdf: "/assets/files/EISS-2027-call-for-papers.pdf",
      // The call's practical points, shown as a list on /2027 and on NetSec's
      // ESSC 2027 page. FR and DE are machine translations (CLAUDE.md §1).
      practical: {
        en: [
          "Each panel has four presentations of 10 minutes. The chair, who is also the discussant, gives 10 minutes of feedback, and about 40 minutes of questions from the audience follow.",
          "Each participant presents one paper.",
          "EISS and the University of Belgrade do not fund travel or accommodation, and applicants are advised to seek funding from their home institution. The COST Action NetSec offers a limited number of travel grants (flight and a daily allowance for three days) to active participants: say in your proposal if you would like to be considered. The organising committee contacts those who are eligible.",
          "Participants in the NetSec Training School are reimbursed by the school.",
          "The programme includes a keynote lecture and thematic roundtables, announced with the final programme.",
        ],
        fr: [
          "Chaque panel comprend quatre présentations de 10 minutes. La présidence, qui assure aussi la discussion, fait 10 minutes de commentaires, suivies d'environ 40 minutes de questions du public.",
          "Chaque participant présente une seule communication.",
          "L'EISS et l'Université de Belgrade ne financent ni le voyage ni l'hébergement, et il est conseillé de solliciter un financement auprès de son institution. L'Action COST NetSec offre un nombre limité de bourses de voyage (vol et indemnité journalière pour trois jours) aux participants actifs : indiquez dans votre proposition si vous souhaitez en bénéficier. Le comité d'organisation contacte les personnes éligibles.",
          "Les participants de l'École de formation NetSec sont remboursés par l'école.",
          "Le programme comprend une conférence plénière et des tables rondes thématiques, annoncées avec le programme définitif.",
        ],
        de: [
          "Jedes Panel umfasst vier Vorträge von je 10 Minuten. Der Vorsitz, zugleich Diskutant, gibt 10 Minuten Feedback, danach folgen rund 40 Minuten Fragen aus dem Publikum.",
          "Jede Person präsentiert ein Paper.",
          "EISS und die Universität Belgrad finanzieren weder Reise noch Unterkunft. Bitte bemühen Sie sich um eine Förderung durch Ihre Heimatinstitution. Die COST-Aktion NetSec vergibt eine begrenzte Zahl von Reisestipendien (Flug und Tagegeld für drei Tage) an aktiv Teilnehmende: Geben Sie im Vorschlag an, ob Sie berücksichtigt werden möchten. Das Organisationskomitee meldet sich bei den Berechtigten.",
          "Teilnehmende der NetSec Training School erhalten ihre Kosten von der Training School erstattet.",
          "Das Programm umfasst einen Keynote-Vortrag und thematische Roundtables, die mit dem endgültigen Programm bekanntgegeben werden.",
        ],
      },
      // One entry per closed panel, in the order of the call:
      // { title: { en, fr, de }, chair: "Name (Institution)", text: { en, fr, de } }
      themes: [
        {
          title: {
            en: "Non-Proliferation and Arms Control",
            fr: "Non-prolifération et maîtrise des armements",
            de: "Nichtverbreitung und Rüstungskontrolle",
          },
          chair: "Eliza Gheorghe (Bilkent University)",
          text: {
            en: "This panel serves as a platform to present and discuss new research on arms control, disarmament, and the non-proliferation of Weapons of Mass Destruction (WMD). In light of Russia’s nuclear threats and uncertainties around Iran’s nuclear programme, the panel especially encourages submissions that focus on strategies and institutions to prevent the proliferation and use of nuclear weapons. The panel aims to bring into conversation scholars from different disciplines, such as political science, history, international law, and science and technology studies (STS), and seeks to facilitate a multidisciplinary dialogue on non-proliferation and arms control. Possible topics include, but are not limited to, the elements of the non-proliferation regime; the impact of sanctions on nuclear non-proliferation; international verification and international organisations; and the role of civil society in nuclear disarmament.",
            fr: "Ce panel permet de présenter et de discuter de nouvelles recherches sur la maîtrise des armements, le désarmement et la non-prolifération des armes de destruction massive (ADM). Compte tenu des menaces nucléaires de la Russie et des incertitudes entourant le programme nucléaire iranien, le panel encourage en particulier les propositions portant sur les stratégies et les institutions visant à empêcher la prolifération et l'emploi des armes nucléaires. Le panel entend faire dialoguer des chercheurs de différentes disciplines, comme la science politique, l'histoire, le droit international et les études sociales des sciences et des techniques (STS), et favoriser un dialogue pluridisciplinaire sur la non-prolifération et la maîtrise des armements. Les sujets possibles comprennent, sans s'y limiter, les éléments du régime de non-prolifération, l'effet des sanctions sur la non-prolifération nucléaire, la vérification internationale et les organisations internationales, et le rôle de la société civile dans le désarmement nucléaire.",
            de: "Dieses Panel bietet eine Plattform, um neue Forschung zu Rüstungskontrolle, Abrüstung und der Nichtverbreitung von Massenvernichtungswaffen vorzustellen und zu diskutieren. Angesichts der nuklearen Drohungen Russlands und der Ungewissheit um das iranische Atomprogramm sind besonders Beiträge zu Strategien und Institutionen willkommen, die die Verbreitung und den Einsatz von Kernwaffen verhindern sollen. Das Panel will Forschende aus verschiedenen Disziplinen wie Politikwissenschaft, Geschichte, Völkerrecht und Wissenschafts- und Technikforschung (STS) ins Gespräch bringen und einen multidisziplinären Dialog über Nichtverbreitung und Rüstungskontrolle fördern. Mögliche Themen sind unter anderem die Bestandteile des Nichtverbreitungsregimes, die Wirkung von Sanktionen auf die nukleare Nichtverbreitung, internationale Verifikation und internationale Organisationen sowie die Rolle der Zivilgesellschaft bei der nuklearen Abrüstung.",
          },
        },
        {
          title: {
            en: "Digital Transformations in the Information Age: Cyber, Digital, and AI",
            fr: "Transformations numériques à l'ère de l'information : cyber, numérique et IA",
            de: "Digitale Transformationen im Informationszeitalter: Cyber, Digitales und KI",
          },
          chair: "Julia Carver (Leiden University)",
          text: {
            en: "Digital technologies, such as artificial intelligence, cyber capabilities, and digital infrastructures (e.g. data centres, cloud computing infrastructure, undersea cables), have become increasingly entangled with our physical reality, confronting scholars with both novel questions and age-old debates. In our ‘information age’, the transformative potential of digital technologies introduces complex questions for both policymakers and academics. From the individual to the global scale, the tactical to the strategic levels, and the virtual to the physical realms, this panel explores: what are the global, political, social, legal, and economic dimensions and consequences arising from these developments? Encouraging a diversity of perspectives and approaches, this panel seeks proposals which may originate from different disciplines and can bring to bear a wide set of theoretical and methodological approaches.",
            fr: "Les technologies numériques, comme l'intelligence artificielle, les capacités cyber et les infrastructures numériques (centres de données, infrastructures d'informatique en nuage, câbles sous-marins), sont de plus en plus imbriquées dans notre réalité physique et confrontent les chercheurs à des questions nouvelles comme à des débats anciens. À l'« ère de l'information », le potentiel de transformation des technologies numériques pose des questions complexes aux décideurs comme aux universitaires. De l'échelle individuelle à l'échelle mondiale, du niveau tactique au niveau stratégique, du virtuel au physique, ce panel examine les dimensions et les conséquences mondiales, politiques, sociales, juridiques et économiques de ces évolutions. Ouvert à une diversité de perspectives et d'approches, il accueille des propositions issues de différentes disciplines et mobilisant un large éventail d'approches théoriques et méthodologiques.",
            de: "Digitale Technologien wie künstliche Intelligenz, Cyberfähigkeiten und digitale Infrastrukturen (etwa Rechenzentren, Cloud-Infrastruktur, Unterseekabel) sind zunehmend mit unserer physischen Wirklichkeit verflochten und konfrontieren die Forschung mit neuen Fragen ebenso wie mit alten Debatten. Im „Informationszeitalter“ wirft das Veränderungspotenzial digitaler Technologien komplexe Fragen für Politik und Wissenschaft auf. Vom Individuum bis zur globalen Ebene, von der taktischen bis zur strategischen Ebene und vom Virtuellen bis zum Physischen fragt dieses Panel nach den globalen, politischen, sozialen, rechtlichen und wirtschaftlichen Dimensionen und Folgen dieser Entwicklungen. Es lädt zu Beiträgen aus verschiedenen Disziplinen ein, die ein breites Spektrum theoretischer und methodischer Ansätze einbringen.",
          },
        },
        {
          title: {
            en: "War Abroad: Military Intervention, Assistance, and Peacekeeping",
            fr: "La guerre à l'étranger : intervention militaire, assistance et maintien de la paix",
            de: "Krieg im Ausland: Militärische Intervention, Unterstützung und Friedenssicherung",
          },
          chair: "Chiara Ruffa (Sciences Po)",
          text: {
            en: "In an era marked by shifting global alliances, protracted conflicts, and emerging threats, the role of foreign military engagement is more complex than ever. This panel examines the evolving dynamics of military intervention, international assistance, and peacekeeping operations across the globe. Papers can explore the political, ethical, and strategic considerations behind intervention, from crisis response and coalition-building to post-conflict reconstruction and long-term peacekeeping. Papers will bring to bear a variety of theoretical approaches and methodological tools to address how states and relevant actors project power, offer support, and strive to maintain peace in volatile regions.",
            fr: "À une époque marquée par des alliances mondiales changeantes, des conflits prolongés et des menaces émergentes, l'engagement militaire à l'étranger est plus complexe que jamais. Ce panel examine l'évolution des interventions militaires, de l'assistance internationale et des opérations de maintien de la paix dans le monde. Les communications peuvent porter sur les considérations politiques, éthiques et stratégiques qui sous-tendent l'intervention, de la réponse aux crises et de la constitution de coalitions à la reconstruction post-conflit et au maintien de la paix à long terme. Elles mobiliseront diverses approches théoriques et outils méthodologiques pour étudier la manière dont les États et les autres acteurs concernés projettent leur puissance, apportent leur soutien et s'efforcent de maintenir la paix dans des régions instables.",
            de: "In einer Zeit wechselnder globaler Allianzen, langwieriger Konflikte und neuer Bedrohungen ist militärisches Engagement im Ausland komplexer denn je. Dieses Panel untersucht die Dynamik militärischer Interventionen, internationaler Unterstützung und friedenssichernder Einsätze weltweit. Die Beiträge können die politischen, ethischen und strategischen Überlegungen hinter Interventionen behandeln, von Krisenreaktion und Koalitionsbildung bis zum Wiederaufbau nach Konflikten und zur langfristigen Friedenssicherung. Sie bringen verschiedene theoretische Ansätze und methodische Werkzeuge ein, um zu untersuchen, wie Staaten und andere Akteure Macht projizieren, Unterstützung leisten und den Frieden in instabilen Regionen zu wahren suchen.",
          },
        },
        {
          title: {
            en: "War and Strategy: Grand Strategy, Military Strategy, and Security Cooperation",
            fr: "Guerre et stratégie : grande stratégie, stratégie militaire et coopération de sécurité",
            de: "Krieg und Strategie: Grand Strategy, Militärstrategie und Sicherheitskooperation",
          },
          chair: "Chiara Libiseller (King’s College London)",
          text: {
            en: "This panel explores the evolving intersections between grand strategy, military strategy, and international cooperation in times of war, competition, and geopolitical tensions. It investigates how states conceptualise and implement strategy across different levels of conflict (from high-level national objectives to operational military planning) and how these strategic frameworks interact with, or resist, efforts at international collaboration. Topics include the theoretical foundations of grand strategy, case studies of strategic decision-making in historical and contemporary conflicts, and the role of alliances, coalitions, and institutions in shaping wartime outcomes. By rethinking how war is theorised and practised, this panel aims to deepen our understanding of strategic behaviour and the potential for cooperative security in a divided world.",
            fr: "Ce panel étudie les liens entre grande stratégie, stratégie militaire et coopération internationale en temps de guerre, de compétition et de tensions géopolitiques. Il examine comment les États conçoivent et mettent en œuvre la stratégie aux différents niveaux du conflit (des objectifs nationaux de haut niveau à la planification militaire opérationnelle) et comment ces cadres stratégiques interagissent avec les efforts de coopération internationale ou leur résistent. Les sujets comprennent les fondements théoriques de la grande stratégie, des études de cas de prise de décision stratégique dans des conflits historiques et contemporains, et le rôle des alliances, des coalitions et des institutions dans l'issue des guerres. En repensant la manière dont la guerre est théorisée et pratiquée, ce panel entend approfondir la compréhension des comportements stratégiques et des possibilités de sécurité coopérative dans un monde divisé.",
            de: "Dieses Panel untersucht die Schnittstellen von Grand Strategy, Militärstrategie und internationaler Zusammenarbeit in Zeiten von Krieg, Konkurrenz und geopolitischen Spannungen. Es fragt, wie Staaten Strategie auf den verschiedenen Ebenen eines Konflikts konzipieren und umsetzen (von nationalen Zielen bis zur operativen militärischen Planung) und wie diese strategischen Rahmen mit Bemühungen um internationale Zusammenarbeit zusammenwirken oder sich ihnen widersetzen. Themen sind unter anderem die theoretischen Grundlagen der Grand Strategy, Fallstudien strategischer Entscheidungen in historischen und gegenwärtigen Konflikten sowie die Rolle von Allianzen, Koalitionen und Institutionen für den Ausgang von Kriegen. Indem es neu betrachtet, wie Krieg theoretisiert und geführt wird, will das Panel das Verständnis strategischen Handelns und der Möglichkeiten kooperativer Sicherheit in einer gespaltenen Welt vertiefen.",
          },
        },
        {
          title: {
            en: "Autocratisation and Security Governance",
            fr: "Autocratisation et gouvernance de la sécurité",
            de: "Autokratisierung und Sicherheitsgovernance",
          },
          chair: "Sonja Stojanović Gajić (University of Rijeka)",
          text: {
            en: "This panel examines how security governance is reshaped during autocratisation and how it can be reclaimed during re-democratisation. Beyond institutional capture and misuse, we welcome studies of everyday security practices that narrow the space for political and economic competition. We also invite contributions analysing how, amid intensifying geopolitical competition, security logics spill over into other policy fields. Of particular interest is how security discourses feed affective polarisation, leading citizens to endorse restrictions on their own rights or on those of groups cast as threats, and at what point such consent turns from legitimate trade-off into an enabler of autocratisation. Empirical studies may address a variety of cases, including backsliding democracies, hybrid regimes and closed autocracies in Europe, as well as recent instances of re-democratisation. We particularly encourage conceptual work and research that connects literatures that rarely speak to each other: civil-military relations, policing and intelligence studies, comparative democratisation, and International Relations.",
            fr: "Ce panel examine comment la gouvernance de la sécurité se transforme au cours de l'autocratisation et comment elle peut être reconquise lors d'une redémocratisation. Au-delà de la capture et du détournement des institutions, nous accueillons des études sur les pratiques de sécurité quotidiennes qui restreignent l'espace de la compétition politique et économique. Nous invitons aussi des contributions analysant comment, dans un contexte de compétition géopolitique accrue, les logiques de sécurité débordent sur d'autres domaines de l'action publique. Nous nous intéressons en particulier à la manière dont les discours de sécurité alimentent la polarisation affective, conduisant les citoyens à approuver des restrictions de leurs propres droits ou de ceux de groupes présentés comme des menaces, et au moment où ce consentement cesse d'être un compromis légitime pour devenir un facteur d'autocratisation. Les études empiriques peuvent porter sur des cas variés, dont des démocraties en recul, des régimes hybrides et des autocraties fermées en Europe, ainsi que des cas récents de redémocratisation. Nous encourageons particulièrement les travaux conceptuels et les recherches qui relient des littératures qui dialoguent rarement : relations civilo-militaires, études de la police et du renseignement, démocratisation comparée et relations internationales.",
            de: "Dieses Panel untersucht, wie sich Sicherheitsgovernance im Zuge der Autokratisierung verändert und wie sie bei einer Redemokratisierung zurückgewonnen werden kann. Über die Vereinnahmung und den Missbrauch von Institutionen hinaus sind Studien zu alltäglichen Sicherheitspraktiken willkommen, die den Raum für politischen und wirtschaftlichen Wettbewerb einengen. Ebenso erwünscht sind Beiträge, die analysieren, wie Sicherheitslogiken bei zunehmender geopolitischer Konkurrenz auf andere Politikfelder übergreifen. Von besonderem Interesse ist, wie Sicherheitsdiskurse affektive Polarisierung nähren und Bürgerinnen und Bürger dazu bringen, Einschränkungen ihrer eigenen Rechte oder der Rechte von als Bedrohung dargestellten Gruppen zu billigen, und ab wann diese Zustimmung von einer legitimen Abwägung zu einem Wegbereiter der Autokratisierung wird. Empirische Studien können verschiedene Fälle behandeln, darunter Demokratien im Rückschritt, hybride Regime und geschlossene Autokratien in Europa sowie jüngere Fälle von Redemokratisierung. Besonders erwünscht sind konzeptionelle Arbeiten und Forschung, die Literaturen verbindet, die selten miteinander sprechen: zivil-militärische Beziehungen, Polizei- und Nachrichtendienstforschung, vergleichende Demokratisierungsforschung und Internationale Beziehungen.",
          },
        },
        {
          title: {
            en: "Addressing Non-Traditional Security Challenges: Climate, Development, and Gender Dimensions",
            fr: "Les défis de sécurité non traditionnels : climat, développement et genre",
            de: "Nicht-traditionelle Sicherheitsherausforderungen: Klima, Entwicklung und Geschlecht",
          },
          chair: "Nicolas Blarel (Leiden University)",
          text: {
            en: "Security today extends far beyond the battlefield. This panel delves into the increasingly urgent and complex realm of non-traditional security challenges, focusing on the intersections of climate change, sustainable development, and gender dynamics. These issues are reshaping global security priorities, particularly in vulnerable and conflict-affected regions. However, they are also conditioning the policy agendas of powerful economic and global actors. Open to a variety of theoretical and methodological approaches, this panel will explore how these cross-cutting challenges impact stability, peacebuilding, and resilience. Key topics include the security risks of climate-driven displacement, the role of development in preventing conflict, and how integrating gender perspectives changes security policy and scholarly approaches to security.",
            fr: "La sécurité dépasse aujourd'hui largement le champ de bataille. Ce panel aborde le domaine de plus en plus urgent et complexe des défis de sécurité non traditionnels, à l'intersection du changement climatique, du développement durable et des dynamiques de genre. Ces questions redessinent les priorités de sécurité mondiales, en particulier dans les régions vulnérables et touchées par des conflits, et conditionnent aussi les agendas politiques des grands acteurs économiques et mondiaux. Ouvert à diverses approches théoriques et méthodologiques, ce panel examinera l'effet de ces défis transversaux sur la stabilité, la consolidation de la paix et la résilience. Les thèmes comprennent les risques de sécurité liés aux déplacements causés par le climat, le rôle du développement dans la prévention des conflits, et la manière dont l'intégration des perspectives de genre modifie les politiques de sécurité et les approches scientifiques de la sécurité.",
            de: "Sicherheit reicht heute weit über das Schlachtfeld hinaus. Dieses Panel befasst sich mit dem zunehmend dringlichen und komplexen Feld nicht-traditioneller Sicherheitsherausforderungen an der Schnittstelle von Klimawandel, nachhaltiger Entwicklung und Geschlechterdynamiken. Diese Fragen verändern globale Sicherheitsprioritäten, besonders in verwundbaren und von Konflikten betroffenen Regionen, und prägen zugleich die politischen Agenden mächtiger wirtschaftlicher und globaler Akteure. Offen für verschiedene theoretische und methodische Ansätze untersucht das Panel, wie sich diese Querschnittsherausforderungen auf Stabilität, Friedensförderung und Resilienz auswirken. Themen sind unter anderem die Sicherheitsrisiken klimabedingter Vertreibung, die Rolle von Entwicklung bei der Konfliktprävention und die Frage, wie die Einbeziehung von Geschlechterperspektiven Sicherheitspolitik und wissenschaftliche Ansätze zur Sicherheit verändert.",
          },
        },
        {
          title: {
            en: "The Future of International Peace & Security Architecture",
            fr: "L'avenir de l'architecture internationale de paix et de sécurité",
            de: "Die Zukunft der internationalen Friedens- und Sicherheitsarchitektur",
          },
          chair: "Nemanja Džuverović (University of Belgrade)",
          text: {
            en: "The UN Charter assigns primary responsibility for international peace and security to the Security Council. That assignment is now far from where capability is concentrated and where violence occurs. Regional organisations (EU, AU, ASEAN, OSCE, CIS, SCO, etc.), ad hoc coalitions (BRICS, MIKTA, etc.), private military companies, and technology firms perform functions the Charter did not foresee more than 80 years ago. States adopted the Pact for the Future in September 2024, but have left the Council’s composition and voting rules untouched. This panel discusses what peace and security governance has become in the 2020s, as formal reform remains frozen. Contributors will examine four dimensions, notably 1) the delegation of enforcement to regional and private actors, 2) the future of the UN-led peacebuilding missions, 3) the erosion of arms control instruments negotiated in the 1970s and 1980s, and 4) the normative claims advanced by states outside the P5. We invite papers that combine empirical work with theoretical argument, including single-country studies, comparative designs, and work on institutions and norms.",
            fr: "La Charte des Nations unies confie au Conseil de sécurité la responsabilité principale du maintien de la paix et de la sécurité internationales. Cette attribution est aujourd'hui éloignée des lieux où se concentrent les capacités et où s'exerce la violence. Des organisations régionales (UE, UA, ASEAN, OSCE, CEI, OCS, etc.), des coalitions ad hoc (BRICS, MIKTA, etc.), des sociétés militaires privées et des entreprises technologiques exercent des fonctions que la Charte n'avait pas prévues il y a plus de 80 ans. Les États ont adopté le Pacte pour l'avenir en septembre 2024, sans toucher à la composition du Conseil ni à ses règles de vote. Ce panel examine ce qu'est devenue la gouvernance de la paix et de la sécurité dans les années 2020, alors que la réforme formelle reste au point mort. Les contributions porteront sur quatre dimensions : 1) la délégation de la coercition à des acteurs régionaux et privés, 2) l'avenir des missions de consolidation de la paix conduites par l'ONU, 3) l'érosion des instruments de maîtrise des armements négociés dans les années 1970 et 1980, et 4) les revendications normatives des États extérieurs au P5. Nous invitons des communications qui associent travail empirique et argumentation théorique, y compris des études de cas nationales, des approches comparatives et des travaux sur les institutions et les normes.",
            de: "Die Charta der Vereinten Nationen überträgt dem Sicherheitsrat die Hauptverantwortung für den Weltfrieden und die internationale Sicherheit. Diese Zuweisung liegt heute weit entfernt davon, wo Fähigkeiten konzentriert sind und wo Gewalt stattfindet. Regionalorganisationen (EU, AU, ASEAN, OSZE, GUS, SOZ usw.), Ad-hoc-Koalitionen (BRICS, MIKTA usw.), private Militärfirmen und Technologieunternehmen übernehmen Aufgaben, die die Charta vor mehr als 80 Jahren nicht vorsah. Die Staaten haben im September 2024 den Zukunftspakt angenommen, die Zusammensetzung und die Abstimmungsregeln des Rates aber unverändert gelassen. Dieses Panel erörtert, was aus der Friedens- und Sicherheitsgovernance in den 2020er Jahren geworden ist, während eine formale Reform blockiert bleibt. Die Beiträge behandeln vier Dimensionen: 1) die Übertragung der Durchsetzung auf regionale und private Akteure, 2) die Zukunft der von den Vereinten Nationen geführten Friedenskonsolidierungsmissionen, 3) die Erosion der in den 1970er und 1980er Jahren ausgehandelten Rüstungskontrollinstrumente und 4) die normativen Ansprüche von Staaten außerhalb der P5. Erwünscht sind Beiträge, die empirische Arbeit mit theoretischer Argumentation verbinden, darunter Länderstudien, vergleichende Designs und Arbeiten zu Institutionen und Normen.",
          },
        },
        {
          title: {
            en: "Security Beyond the State: Managing Transnational Threats and Vulnerabilities",
            fr: "La sécurité au-delà de l'État : gérer les menaces et les vulnérabilités transnationales",
            de: "Sicherheit jenseits des Staates: Umgang mit transnationalen Bedrohungen und Verwundbarkeiten",
          },
          chair: "John Helferich (University of Oxford)",
          text: {
            en: "Contemporary security challenges increasingly transcend national borders and traditional state-centred approaches to security governance. From geopolitical instability and technological disruption to economic interdependence and transnational threats, states, international organisations, private actors, and civil society face an increasingly complex landscape of risks and vulnerabilities. This panel examines how diverse actors and institutions respond to these challenges, focusing on the evolving dynamics of cooperation, competition, and governance across national, regional, and global levels. Drawing on a range of theoretical and methodological approaches, it seeks to advance our understanding of how transnational threats are identified, managed, and addressed in a changing global security environment.",
            fr: "Les défis de sécurité contemporains dépassent de plus en plus les frontières nationales et les approches traditionnelles de la gouvernance de la sécurité centrées sur l'État. Instabilité géopolitique, ruptures technologiques, interdépendance économique et menaces transnationales placent les États, les organisations internationales, les acteurs privés et la société civile face à un ensemble de plus en plus complexe de risques et de vulnérabilités. Ce panel examine comment des acteurs et des institutions divers répondent à ces défis, en s'intéressant aux dynamiques de coopération, de compétition et de gouvernance aux niveaux national, régional et mondial. En s'appuyant sur un éventail d'approches théoriques et méthodologiques, il cherche à mieux comprendre comment les menaces transnationales sont identifiées, gérées et traitées dans un environnement de sécurité mondial en mutation.",
            de: "Heutige Sicherheitsherausforderungen überschreiten zunehmend nationale Grenzen und traditionelle, staatszentrierte Ansätze der Sicherheitsgovernance. Geopolitische Instabilität, technologische Umbrüche, wirtschaftliche Verflechtung und transnationale Bedrohungen stellen Staaten, internationale Organisationen, private Akteure und die Zivilgesellschaft vor ein immer komplexeres Gefüge von Risiken und Verwundbarkeiten. Dieses Panel untersucht, wie unterschiedliche Akteure und Institutionen auf diese Herausforderungen reagieren, mit Blick auf die Dynamik von Kooperation, Konkurrenz und Governance auf nationaler, regionaler und globaler Ebene. Gestützt auf verschiedene theoretische und methodische Ansätze will es besser verstehen, wie transnationale Bedrohungen in einem sich wandelnden globalen Sicherheitsumfeld erkannt, bewältigt und angegangen werden.",
          },
        },
      ],
    },
  },
  {
    slug: "2026",
    year: 2026,
    ordinal: 9,
    startDate: "2026-06-11",
    endDate: "2026-06-12",
    city: "Stockholm",
    country: "Sweden",
    venue: {
      en: "Stockholm University",
      fr: "Université de Stockholm",
      de: "Universität Stockholm",
    },
    dates: {
      en: "11–12 June 2026",
      fr: "11–12 juin 2026",
      de: "11.–12. Juni 2026",
    },
    // Compact line used in archive lists (past.html). Includes ordinal +
    // dates + venue.
    archiveMeta: {
      en: "9th Annual Conference · 11–12 June 2026 · Stockholm University, Stockholm",
      fr: "9e conférence annuelle · 11–12 juin 2026 · Université de Stockholm, Stockholm",
      de: "9. Jahreskonferenz · 11.–12. Juni 2026 · Universität Stockholm, Stockholm",
    },
    // The "Jointly organised by ..." line on the featured card.
    organisers: {
      en: "Jointly organised by the COST Action NetSec, the European Initiative for Security Studies (EISS), and Stockholm University.",
      fr: "Organisée conjointement par l'Action COST NetSec, l'Initiative européenne pour les études de sécurité (EISS), et l'Université de Stockholm.",
      de: "Gemeinsam organisiert von der COST-Aktion NetSec, der Europäischen Initiative für Sicherheitsstudien (EISS) und der Universität Stockholm.",
    },
    monthLabel: {
      en: "June",
      fr: "Juin",
      de: "Juni",
    },
    dayRange: "11–12",     // for the featured-card .day block
    yearLine: "2026 · Stockholm",
    // Homepage hero photo: the path stem of a 16:9 JPEG exported at
    // -480x270, -800x450 and -1600x900. The hero shows the next edition's
    // photo, or the most recent edition's until the next one sets its own.
    heroImage: "/assets/images/8e43301e-7945-4a0c-aac2-04719ac702a8",
    // Conference film, shown in the homepage film band while this is the
    // most recent edition with one. Same file the /2026 page plays; the
    // title is that page's heading in each locale.
    film: {
      src: "/assets/video/essc-2026.mp4",
      poster: "/assets/images/2026/essc-2026-film-poster.jpg",
      title: {
        en: "Two days in Stockholm",
        fr: "Deux jours à Stockholm",
        de: "Zwei Tage in Stockholm",
      },
    },
    // Optional polished programme PDF. The live grid on /YYYY is the
    // primary programme display (pulled daily from Indico); the PDF is
    // the designer-made, print-friendly companion. See
    // docs/indico-programme-integration.md for the rationale.
    //
    // - `status: "draft"`  → labelled "Working programme (subject to
    //                        change)"; rendered as a small download
    //                        block under the live grid.
    // - `status: "final"`  → labelled "Final programme"; the polished
    //                        archival artefact.
    // - Omit the field entirely (or set to null) for years where you
    //   don't have a PDF.
    programmePdf: {
      url: "/assets/files/EISS-2026-programme.pdf",
      sizeKb: 279,
      pages: 9,
      status: "final",
    },
    // Manual override for the registration-status badge on /YYYY pages.
    //   "open"   — show the "Registration open" pill regardless of dates
    //   "closed" — show "Registration closed"; useful between the form
    //              closing and the conference starting (the date-only
    //              fallback would say "not yet open" in that window)
    //   null / unset — "Registration not yet open" until the start date,
    //              then "Happening now" / "Past edition" from the dates
    // We don't pull this from Indico because the anonymous API doesn't
    // expose registration-form state. Flip it by hand when the form
    // opens or closes; the daily rebuild picks up the change.
    registrationStatus: "closed",
    // Venue location for the map-pin card. No third-party widget loads on
    // page view (cf. /policy §3): the `map-embed.njk` partial shows the
    // venue name and `address` and links out to OpenStreetMap, which only
    // opens when the visitor clicks. `address` is the human-readable label
    // shown next to the map-pin and is also the OpenStreetMap search query.
    mapEmbed: {
      address: {
        en: "Universitetsvägen 10D, 114 18 Stockholm, Sweden",
        fr: "Universitetsvägen 10D, 114 18 Stockholm, Suède",
        de: "Universitetsvägen 10D, 114 18 Stockholm, Schweden",
      },
    },
    // Conference FAQ on the NetSec sister site. The shared ESSC FAQ holds
    // the per-role links chairs and speakers need (edit My Session / My
    // Contributions) plus visa-letter guidance, so the "Speaking or
    // chairing?" note on /YYYY points here. Per-year because a future
    // edition may host its FAQ elsewhere.
    faqUrl: "https://netsec-cost.eu/faq.html#conference",
    // Public livestream for the conference. ONE Zoom webinar link, reused
    // for every plenary session (a webinar, so it's view-only: remote
    // attendees can watch but can't interrupt the room). Surfaced on
    // /2026 as a plain outbound link, never embedded (no Zoom JS or IP
    // leak on page load, cf. /policy §5). The link is shown only while
    // the edition is current (endDate >= today) and auto-hides once the
    // conference is over; the recordings take over after that.
    livestreamUrl: "https://stockholmuniversity.zoom.us/j/62445444403",
    hasOwnPage: true,
  },
  {
    slug: "2025",
    year: 2025,
    ordinal: 8,
    startDate: "2025-06-26",
    endDate: "2025-06-27",
    city: "Thessaloniki",
    cityLabel: { fr: "Thessalonique", de: "Thessaloniki" },
    country: "Greece",
    venue: {
      en: "University of Macedonia",
      fr: "Université de Macédoine",
      de: "Universität Mazedonien",
    },
    archiveMeta: {
      en: "8th Annual Conference · 26–27 June 2025 · University of Macedonia, Thessaloniki",
      fr: "8e conférence annuelle · 26–27 juin 2025 · Université de Macédoine, Thessalonique",
      de: "8. Jahreskonferenz · 26.–27. Juni 2025 · Universität Mazedonien, Thessaloniki",
    },
    displayCity: { en: "Thessaloniki", fr: "Thessalonique", de: "Thessaloniki" },
    programmePdf: "EISS-2025-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2024",
    year: 2024,
    ordinal: 7,
    startDate: "2024-06-27",
    endDate: "2024-06-28",
    city: "Prague",
    cityLabel: { fr: "Prague", de: "Prag" },
    country: "Czech Republic",
    venue: {
      en: "Charles University",
      fr: "Université Charles",
      de: "Karls-Universität",
    },
    archiveMeta: {
      en: "7th Annual Conference · 27–28 June 2024 · Charles University, Prague",
      fr: "7e conférence annuelle · 27–28 juin 2024 · Université Charles, Prague",
      de: "7. Jahreskonferenz · 27.–28. Juni 2024 · Karls-Universität, Prag",
    },
    displayCity: { en: "Prague", fr: "Prague", de: "Prag" },
    youtubePlaylist: "PLkI2R8FsFqV6bNS0LmU-TxWNY7-fBXDOa",
    programmePdf: "EISS-2024-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2023",
    year: 2023,
    ordinal: 6,
    // Approximate — fill in if known exactly. Used for sort, not display.
    startDate: "2023-06-22",
    endDate: "2023-06-23",
    city: "Barcelona",
    cityLabel: { fr: "Barcelone", de: "Barcelona" },
    country: "Spain",
    venue: {
      en: "Barcelona, Spain",
      fr: "Barcelone, Espagne",
      de: "Barcelona, Spanien",
    },
    archiveMeta: {
      en: "6th Annual Conference · Barcelona, Spain",
      fr: "6e conférence annuelle · Barcelone, Espagne",
      de: "6. Jahreskonferenz · Barcelona, Spanien",
    },
    displayCity: { en: "Barcelona", fr: "Barcelone", de: "Barcelona" },
    youtubePlaylist: "PLkI2R8FsFqV4zwz12-ZFd_dV_ENX14--6",
    programmePdf: "EISS-2023-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2022",
    year: 2022,
    ordinal: 5,
    startDate: "2022-06-30",
    endDate: "2022-07-01",
    city: "Berlin",
    country: "Germany",
    venue: {
      en: "Hertie School, Berlin",
      fr: "Hertie School, Berlin",
      de: "Hertie School, Berlin",
    },
    archiveMeta: {
      en: "5th Annual Conference · Hertie School, Berlin",
      fr: "5e conférence annuelle · Hertie School, Berlin",
      de: "5. Jahreskonferenz · Hertie School, Berlin",
    },
    displayCity: { en: "Berlin", fr: "Berlin", de: "Berlin" },
    programmePdf: "EISS-2022-programme.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2021",
    year: 2021,
    ordinal: 4,
    startDate: "2021-09-03",
    endDate: "2021-09-04",
    city: "Lisbon",
    cityLabel: { fr: "Lisbonne", de: "Lissabon" },
    country: "Portugal",
    venue: {
      en: "Lisbon, Portugal",
      fr: "Lisbonne, Portugal",
      de: "Lissabon, Portugal",
    },
    archiveMeta: {
      en: "4th Annual Conference · Lisbon, Portugal",
      fr: "4e conférence annuelle · Lisbonne, Portugal",
      de: "4. Jahreskonferenz · Lissabon, Portugal",
    },
    displayCity: { en: "Lisbon", fr: "Lisbonne", de: "Lissabon" },
    hasOwnPage: true,
  },
  {
    slug: "2020",
    year: 2020,
    // The 2020 conference was DEFERRED to 2021 due to COVID-19 — it is
    // not a separate numbered edition. The deferred conference was held
    // at ISCTE-IUL, Lisbon on 3–4 September 2021 and counts as the 4th
    // (see the 2021 entry). `deferred: true` excludes it from the
    // edition count (see `editionCount` below). No `ordinal`.
    deferred: true,
    // startDate kept in 2020 only so /past sorts this entry between 2019
    // and 2021; the conference was actually held in September 2021.
    startDate: "2020-09-03",
    endDate: "2020-09-04",
    city: "",
    country: "Portugal",
    venue: {
      en: "Deferred to 2021 — held at ISCTE-IUL, Lisbon",
      fr: "Reportée à 2021 — tenue à l'ISCTE-IUL, Lisbonne",
      de: "Auf 2021 verschoben — abgehalten an der ISCTE-IUL, Lissabon",
    },
    archiveMeta: {
      en: "Deferred to 2021 due to the COVID-19 pandemic · held at ISCTE-IUL, Lisbon",
      fr: "Reportée à 2021 en raison de la pandémie de COVID-19 · tenue à l'ISCTE-IUL, Lisbonne",
      de: "Wegen der COVID-19-Pandemie auf 2021 verschoben · abgehalten an der ISCTE-IUL, Lissabon",
    },
    displayCity: {
      en: "Deferred to 2021",
      fr: "Reportée à 2021",
      de: "Auf 2021 verschoben",
    },
    hasOwnPage: true,
  },
  {
    slug: "2019",
    year: 2019,
    ordinal: 3,
    startDate: "2019-06-13",
    endDate: "2019-06-14",
    city: "Paris",
    country: "France",
    venue: {
      en: "Sciences Po CERI, Paris",
      fr: "Sciences Po CERI, Paris",
      de: "Sciences Po CERI, Paris",
    },
    archiveMeta: {
      en: "3rd Annual Conference · Sciences Po CERI, Paris",
      fr: "3e conférence annuelle · Sciences Po CERI, Paris",
      de: "3. Jahreskonferenz · Sciences Po CERI, Paris",
    },
    displayCity: { en: "Paris", fr: "Paris", de: "Paris" },
    youtubePlaylist: "PLkI2R8FsFqV4_TVOCV5qfPFAmZn1KbWGv",
    programmePdf: "Programme2019.pdf",
    hasOwnPage: true,
  },
  {
    slug: "2018",
    year: 2018,
    ordinal: 2,
    startDate: "2018-06-21",
    endDate: "2018-06-22",
    city: "Paris",
    country: "France",
    venue: {
      en: "University Panthéon-Assas (Paris 2), Paris",
      fr: "Université Panthéon-Assas (Paris 2), Paris",
      de: "Université Panthéon-Assas (Paris 2), Paris",
    },
    archiveMeta: {
      en: "2nd Annual Conference · University Panthéon-Assas (Paris 2)",
      fr: "2e conférence annuelle · Université Panthéon-Assas (Paris 2)",
      de: "2. Jahreskonferenz · Université Panthéon-Assas (Paris 2)",
    },
    displayCity: { en: "Paris", fr: "Paris", de: "Paris" },
    hasOwnPage: true,
  },
  {
    slug: "2017",
    year: 2017,
    ordinal: 1,
    startDate: "2017-01-13",
    endDate: "2017-01-14",
    city: "Paris",
    country: "France",
    venue: {
      en: "University Panthéon-Assas (Paris 2), Paris",
      fr: "Université Panthéon-Assas (Paris 2), Paris",
      de: "Université Panthéon-Assas (Paris 2), Paris",
    },
    archiveMeta: {
      en: "Inaugural Conference · University Panthéon-Assas (Paris 2)",
      fr: "Conférence inaugurale · Université Panthéon-Assas (Paris 2)",
      de: "Auftaktkonferenz · Université Panthéon-Assas (Paris 2)",
    },
    displayCity: { en: "Paris", fr: "Paris", de: "Paris" },
    hasOwnPage: true,
  },
];

// Build-time cut-off. Eleventy re-runs this whenever the build runs;
// the deploy workflow's daily schedule guarantees a daily build so the
// cut-off advances even on quiet weeks.
const today = new Date().toISOString().slice(0, 10);

const upcomingOrCurrent = conferences
  .filter((c) => c.endDate >= today)
  .sort((a, b) => a.startDate.localeCompare(b.startDate));

const past = conferences
  .filter((c) => c.endDate < today)
  .sort((a, b) => b.startDate.localeCompare(a.startDate));

// Year-keyed lookup for per-year content pages (/2026, /2027, ...) that
// want to read structured data — e.g. the registration-status badge in
// src/_includes/registration-badge.njk pulls `conferences.byYear[year]`.
const byYear = Object.fromEntries(conferences.map((c) => [String(c.year), c]));

// Distinct numbered editions, for display counts like /initiative's
// "N annual conferences" stat. Excludes only the deferred 2020, folded
// into the 2021 edition (`deferred: true`).
//
// This used to carry a `+ 2` for the founding-era 2017 and 2018 editions,
// which had their own pages but sat outside this array. They are entries
// now, so the offset would double-count them.
// Today: 2017, 2018, 2019, 2021, 2022, 2023, 2024, 2025, 2026 = 9.
const editionCount = conferences.filter((c) => !c.deferred).length;

// The editions listed in the Conference dropdown of the primary nav
// (#1319): the upcoming one when there is one, then the two most recent
// completed editions. Assembled here rather than in nav.njk so the
// template stays a plain loop, and so the yearly rollover moves the nav
// on its own. The deferred 2020 entry is skipped — it has no city and no
// page of its own.
const navEditions = [
  ...(upcomingOrCurrent[0] ? [{ ...upcomingOrCurrent[0], isNext: true }] : []),
  ...past.filter((c) => !c.deferred).slice(0, 2),
].map((c) => ({
  slug: c.slug,
  // Keyed by locale, because a handful of host cities are spelled
  // differently across the three (Thessalonique, Prag, Lisbonne). Entries
  // whose name is the same everywhere carry no `cityLabel` and fall back
  // to `city`.
  label: Object.fromEntries(
    ["en", "fr", "de"].map((L) => [
      L,
      `${c.year} · ${(c.cityLabel && c.cityLabel[L]) || c.city}`,
    ]),
  ),
  isNext: Boolean(c.isNext),
}));

// Host-city map (essc-map.njk, on /initiative and the homepage). Dot and
// label positions in the map's 1000x980 viewBox, per host city: the Europe
// outline is lat[35,71]/lon[-12,32] Plate-Carree, scaled 1.4x in y, so
// cx = (lon + 12) / 44 * 1000 and cy = (71 - lat) / 36 * 700 * 1.4.
// `end: true` sets the label to the left of the dot. A new host city needs
// a row here, or it is left off the map (docs/new-conference.md).
const MAP_POINTS = {
  Paris: { cx: 326, cy: 603, lx: 346, ly: 602 },
  Lisbon: { cx: 65, cy: 879, lx: 85, ly: 878 },
  Berlin: { cx: 577, cy: 503, lx: 597, ly: 502 },
  Barcelona: { cx: 322, cy: 806, lx: 342, ly: 805 },
  Prague: { cx: 601, cy: 570, lx: 621, ly: 569 },
  Thessaloniki: { cx: 794, cy: 826, lx: 784, ly: 846, end: true },
  Stockholm: { cx: 683, cy: 318, lx: 703, ly: 317 },
  Belgrade: { cx: 738, cy: 713, lx: 758, ly: 712 },
};

// One dot per host city, oldest first, carrying its editions. The dot links
// to the city's most recent edition; `isNext` marks the upcoming one and
// `inaugural` the city of the first edition. Consecutive years read as a
// range ("2017 - 2019"), others as a list.
const nextSlug = upcomingOrCurrent[0] && upcomingOrCurrent[0].slug;
const editions = conferences.filter((c) => !c.deferred).sort((a, b) => a.year - b.year);
const mapCities = [];
for (const c of editions) {
  if (!MAP_POINTS[c.city]) continue;
  let city = mapCities.find((m) => m.city === c.city);
  if (!city) {
    city = { city: c.city, cityLabel: c.cityLabel || null, point: MAP_POINTS[c.city], years: [] };
    mapCities.push(city);
  }
  city.years.push(c.year);
  city.slug = c.slug;
  city.isNext = c.slug === nextSlug;
}
for (const m of mapCities) {
  const ys = m.years;
  const consecutive = ys.length > 2 && ys.every((y, i) => !i || y === ys[i - 1] + 1);
  m.yearsLabel = consecutive ? `${ys[0]} - ${ys[ys.length - 1]}` : ys.join(", ");
  m.yearsList = ys.join(", ");
  m.inaugural = ys[0] === editions[0].year;
}
const mapSpan = editions.length ? `${editions[0].year} - ${editions[editions.length - 1].year}` : "";

// The edition whose photo fills the homepage hero: the next one when it has
// a heroImage, else the most recent edition that does.
const heroEdition = [...upcomingOrCurrent, ...past].find((c) => c.heroImage) || null;

// The most recent held edition with a film, for the homepage film band.
const filmEdition = past.find((c) => c.film) || null;

module.exports = {
  all: conferences,
  byYear,
  next: upcomingOrCurrent[0] || null,   // closest upcoming (or in-progress)
  upcoming: upcomingOrCurrent,
  past,
  navEditions,
  heroEdition,
  mapCities,
  mapSpan,
  filmEdition,
  editionCount,
  today,
};
