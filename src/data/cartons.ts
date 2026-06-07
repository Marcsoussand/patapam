import type { Language } from '../store/languageStore'

export interface CardWord {
  fr: string
  en: string
  he: string
  audio: string
}

export interface CartonCategory {
  key: string
  words: CardWord[]
}

export type AgeGroup = 'young' | 'older'

export const CATEGORY_KEYS = ['famille', 'corps', 'animaux', 'jouets', 'nourriture'] as const
export type CategoryKey = (typeof CATEGORY_KEYS)[number]

export const YOUNG_CATEGORIES: CartonCategory[] = [
  {
    key: 'famille',
    words: [
      { fr: 'papa', en: 'Papa', he: 'אבא', audio: '/audio/young/famille/papa.m4a' },
      { fr: 'maman', en: 'Maman', he: 'אמא', audio: '/audio/young/famille/maman.m4a' },
      { fr: 'aaron', en: 'Aaron', he: 'אהרון', audio: '/audio/young/famille/aaron.m4a' },
      { fr: 'naor', en: 'Naor', he: 'נאור', audio: '/audio/young/famille/naor.m4a' },
      { fr: 'elon', en: 'Elon', he: 'אלון', audio: '/audio/young/famille/elon.m4a' },
    ],
  },
  {
    key: 'corps',
    words: [
      { fr: 'tête', en: 'Head', he: 'ראש', audio: '/audio/young/corps/tete.m4a' },
      { fr: 'main', en: 'Hand', he: 'יד', audio: '/audio/young/corps/main.m4a' },
      { fr: 'pied', en: 'Foot', he: 'רגל', audio: '/audio/young/corps/pied.m4a' },
      { fr: 'oreilles', en: 'Ears', he: 'אוזניים', audio: '/audio/young/corps/oreilles.m4a' },
      { fr: 'bouche', en: 'Mouth', he: 'פה', audio: '/audio/young/corps/bouche.m4a' },
    ],
  },
  {
    key: 'animaux',
    words: [
      { fr: 'lion', en: 'Lion', he: 'אריה', audio: '/audio/young/animaux/lion.m4a' },
      { fr: 'tigre', en: 'Tiger', he: 'נמר', audio: '/audio/young/animaux/tigre.m4a' },
      { fr: 'vache', en: 'Cow', he: 'פרה', audio: '/audio/young/animaux/vache.m4a' },
      { fr: 'tortue', en: 'Turtle', he: 'צב', audio: '/audio/young/animaux/tortue.m4a' },
      { fr: 'hippopotame', en: 'Hippopotamus', he: 'היפופוטם', audio: '/audio/young/animaux/hippopotame.m4a' },
    ],
  },
  {
    key: 'jouets',
    words: [
      { fr: 'Ballon', en: 'Ball', he: 'כדור', audio: '/audio/young/jouets/ballon.m4a' },
      { fr: 'Voiture', en: 'Car', he: 'מכונית', audio: '/audio/young/jouets/voiture.m4a' },
      { fr: 'Robot', en: 'Robot', he: 'רובוט', audio: '/audio/young/jouets/robot.m4a' },
      { fr: 'Peluche', en: 'Plushie', he: 'בובה רכה', audio: '/audio/young/jouets/peluche.m4a' },
      { fr: 'Cubes', en: 'Blocks', he: 'קוביות', audio: '/audio/young/jouets/cubes.m4a' },
    ],
  },
  {
    key: 'nourriture',
    words: [
      { fr: 'Compote', en: 'Compote', he: 'קומפוט', audio: '/audio/young/nourriture/compote.m4a' },
      { fr: 'Gâteau', en: 'Cake', he: 'עוגה', audio: '/audio/young/nourriture/gateau.m4a' },
      { fr: 'Banane', en: 'Banana', he: 'בננה', audio: '/audio/young/nourriture/banane.m4a' },
      { fr: 'Pomme', en: 'Apple', he: 'תפוח', audio: '/audio/young/nourriture/pomme.m4a' },
      { fr: 'Carotte', en: 'Carrot', he: 'גזר', audio: '/audio/young/nourriture/carotte.m4a' },
    ],
  },
]

export const DOMAN_CONTENT: Record<Language, { title: string; dir: 'ltr' | 'rtl'; html: string }> = {
  fr: {
    title: 'La méthode Glenn Doman',
    dir: 'ltr',
    html: `
<p>La méthode de lecture précoce développée par Glenn Doman s'inscrit dans un contexte initialement thérapeutique et empirique. Dans les années 1950, au sein de l'<em>Institutes for the Achievement of Human Potential</em>, Doman travaillait avec des enfants atteints de lésions cérébrales ou de troubles neurologiques sévères. Il observa que ces enfants, soumis à des stimulations sensorielles intensives, structurées et répétées — notamment visuelles et linguistiques — développaient parfois des capacités de lecture et de compréhension supérieures à celles d'enfants dits « normaux » du même âge, scolarisés de manière classique.</p>
<p>Ce constat contre-intuitif l'amena à formuler l'hypothèse que ce n'était pas l'immaturité du cerveau du jeune enfant qui limitait l'apprentissage, mais au contraire un manque de stimulation adaptée et précoce. La méthode fut ainsi extrapolée à des enfants sans handicap, non comme une thérapie, mais comme une opportunité d'exploiter pleinement les capacités exceptionnelles du cerveau en développement.</p>
<p>Les bébés ont une capacité d'apprentissage exceptionnelle dès la naissance, bien supérieure à ce que l'on imagine, et ils peuvent apprendre à lire très tôt, souvent avant 3 ans, avec plaisir et sans effort, si l'approche est adaptée.</p>
<h4>Idées clés</h4>
<ul>
    <li>Le cerveau du bébé est une « éponge » : plus l'apprentissage commence tôt, plus il est facile et naturel.</li>
    <li>Lire n'est pas déchiffrer, mais reconnaître des mots, comme on reconnaît des visages.</li>
    <li>L'apprentissage doit être rapide, joyeux, bref et volontaire (on s'arrête avant que l'enfant se lasse).</li>
    <li>Le parent est le meilleur enseignant de son enfant.</li>
</ul>
<h4>Méthode proposée</h4>
<ul>
    <li>Montrer des mots entiers, écrits en gros caractères rouges sur des cartes (ex. : <em>maman</em>, <em>papa</em>).</li>
    <li>Dire le mot clairement et avec enthousiasme, sans demander à l'enfant de répéter.</li>
    <li>Faire des séances très courtes (quelques secondes), plusieurs fois par jour.</li>
</ul>
<h4>Progression en 5 étapes</h4>
<ul>
    <li>Mots simples → Couples de mots → Phrases simples → Phrases plus complexes → Lecture de vrais livres</li>
</ul>
<h4>Principes pédagogiques</h4>
<ul>
    <li>Aucune pression, aucun test.</li>
    <li>Pas de correction : on montre, c'est tout.</li>
    <li>Arrêter avant l'ennui.</li>
    <li>Associer l'apprentissage à une relation affective positive.</li>
</ul>
<h4>Objectif</h4>
<ul>
    <li>Donner à l'enfant un avantage durable : goût de la lecture, confiance en soi, facilité d'apprentissage.</li>
    <li>Montrer que la lecture précoce stimule le développement global du cerveau, pas seulement le langage.</li>
</ul>`,
  },
  en: {
    title: 'The Glenn Doman Method',
    dir: 'ltr',
    html: `
<p>Glenn Doman's early reading method originated in a therapeutic and empirical context. In the 1950s, at the <em>Institutes for the Achievement of Human Potential</em>, Doman worked with children who had suffered brain injuries or severe neurological disorders. He observed that these children, exposed to intensive, structured and repeated sensory stimulation — particularly visual and linguistic — sometimes developed reading and comprehension abilities superior to those of typically developing children of the same age in conventional schooling.</p>
<p>This counter-intuitive finding led him to hypothesize that it was not brain immaturity that limited learning in young children, but rather a lack of appropriate early stimulation. The method was therefore extended to children without disabilities — not as therapy, but as an opportunity to fully harness the exceptional learning capacities of the developing brain.</p>
<p>Babies have an exceptional capacity to learn from birth, far greater than commonly imagined. They can learn to read very early — often before age 3 — with joy and without effort, provided the approach is right.</p>
<h4>Key ideas</h4>
<ul>
    <li>The baby's brain is a "sponge": the earlier learning begins, the easier and more natural it is.</li>
    <li>Reading is not decoding — it is recognising whole words, just as we recognise faces.</li>
    <li>Learning must be fast, joyful, brief and voluntary (stop before the child gets bored).</li>
    <li>The parent is the child's best teacher.</li>
</ul>
<h4>Proposed method</h4>
<ul>
    <li>Show whole words written in large red letters on cards (e.g. <em>mum</em>, <em>dad</em>).</li>
    <li>Say the word clearly and enthusiastically — never ask the child to repeat it.</li>
    <li>Keep sessions very short (a few seconds), several times a day.</li>
</ul>
<h4>5-stage progression</h4>
<ul>
    <li>Single words → Word pairs → Simple sentences → More complex sentences → Real books</li>
</ul>
<h4>Teaching principles</h4>
<ul>
    <li>No pressure, no testing.</li>
    <li>No correction: just show the card.</li>
    <li>Always stop before boredom sets in.</li>
    <li>Link learning to a warm, positive relationship.</li>
</ul>
<h4>Goal</h4>
<ul>
    <li>Give the child a lasting advantage: a love of reading, self-confidence, and ease of learning.</li>
    <li>Show that early reading stimulates the overall development of the brain, not just language.</li>
</ul>`,
  },
  he: {
    title: 'שיטת גלן דומן',
    dir: 'rtl',
    html: `
<p>שיטת הקריאה המוקדמת של גלן דומן נולדה בהקשר טיפולי ואמפירי. בשנות ה-50, במכון <em>Institutes for the Achievement of Human Potential</em>, עבד דומן עם ילדים שסבלו מפגיעות מוח או הפרעות נוירולוגיות קשות. הוא הבחין שילדים אלה, שנחשפו לגירויים חושיים אינטנסיביים, מובנים וחוזרים — ובמיוחד ויזואליים ולשוניים — פיתחו לעיתים יכולות קריאה והבנה גבוהות מאלה של ילדים מתפתחים בגילם הלומדים בדרך המסורתית.</p>
<p>ממצא מפתיע זה הוביל אותו להשערה שאין זה הבשלות המוחית הלוקה שמגבילה את הלמידה, אלא דווקא היעדר גירוי מתאים ומוקדם. השיטה הורחבה לילדים ללא מוגבלות — לא כטיפול, אלא כהזדמנות לנצל את יכולות הלמידה היוצאות מן הכלל של המוח המתפתח.</p>
<p>לתינוקות יש יכולת למידה יוצאת דופן מלידה, גבוהה הרבה יותר ממה שנדמה לנו. הם יכולים ללמוד לקרוא מוקדם מאוד — לעיתים לפני גיל 3 — בשמחה ובלי מאמץ, אם הגישה מתאימה.</p>
<h4>רעיונות מרכזיים</h4>
<ul>
    <li>מוח התינוק הוא "ספוג": ככל שהלמידה מתחילה מוקדם יותר, כך היא קלה וטבעית יותר.</li>
    <li>קריאה אינה פיצוח — היא זיהוי מילים שלמות, בדיוק כשם שמזהים פנים.</li>
    <li>הלמידה חייבת להיות מהירה, שמחה, קצרה ומרצון (מפסיקים לפני שהילד מתעייף).</li>
    <li>ההורה הוא המורה הטוב ביותר של ילדו.</li>
</ul>
<h4>השיטה המוצעת</h4>
<ul>
    <li>להראות מילים שלמות הכתובות באותיות גדולות ואדומות על גבי קלפים (למשל: <em>אמא</em>, <em>אבא</em>).</li>
    <li>לומר את המילה בבהירות ובהתלהבות — מבלי לבקש מהילד לחזור עליה.</li>
    <li>לקיים מפגשים קצרים מאוד (כמה שניות), מספר פעמים ביום.</li>
</ul>
<h4>התקדמות ב-5 שלבים</h4>
<ul>
    <li>מילים בודדות ← זוגות מילים ← משפטים פשוטים ← משפטים מורכבים יותר ← ספרים אמיתיים</li>
</ul>
<h4>עקרונות פדגוגיים</h4>
<ul>
    <li>אין לחץ, אין מבחנים.</li>
    <li>אין תיקונים — רק מראים את הקלף.</li>
    <li>תמיד עוצרים לפני שהילד משתעמם.</li>
    <li>מקשרים את הלמידה לקשר חם וחיובי.</li>
</ul>
<h4>מטרה</h4>
<ul>
    <li>לתת לילד יתרון מתמשך: אהבת קריאה, ביטחון עצמי וקלות למידה.</li>
    <li>להראות שקריאה מוקדמת מגרה את ההתפתחות הכוללת של המוח — לא רק את השפה.</li>
</ul>`,
  },
}

export function wordLabel(word: CardWord, lang: Language): string {
  if (lang === 'he') return word.he
  if (lang === 'en') return word.en
  return word.fr
}

export function whereisAudio(audio: string): string {
  const slash = audio.lastIndexOf('/')
  const dir = audio.slice(0, slash)
  const file = audio.slice(slash + 1)
  return `${dir}/whereis/whereis_${file}`
}

export function getCategory(key: string): CartonCategory | undefined {
  return YOUNG_CATEGORIES.find((c) => c.key === key)
}

export function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}
