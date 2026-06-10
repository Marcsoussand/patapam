/** Règles affichées dans le popup « Chasse au trésor » (dérivées de la logique dans Games.tsx). */
export const TREASURE_HUNT_RULES = {
  title: 'Règles — Chasse au trésor',
  html: `
<p>À tour de rôle, retourne des cartes face visible. Tu peux continuer à en retourner ou appuyer sur <strong>Ramasser</strong> pour garder les combinaisons valides et passer la main.</p>
<p>En fin de tour, les cartes retournées mais non ramassées se cachent à nouveau.</p>

<h4>Combinaisons ramassables</h4>
<ul>
  <li><strong>Dauphinou, Lapinou, Tartuffe</strong> — par paires (2 cartes identiques visibles).</li>
  <li><strong>Mollasson</strong> — chaque carte visible, une par une.</li>
  <li><strong>Bobby</strong> — par triplets (3 cartes identiques visibles).</li>
  <li><strong>Patapam</strong> — par quadruplets (4 cartes identiques visibles).</li>
  <li><strong>Betachou</strong> — uniquement si <em>toutes</em> les cartes visibles sont des Betachou (tu peux alors toutes les ramasser).</li>
</ul>

<h4>Pièges — tour perdu</h4>
<ul>
  <li><strong>René le Poney</strong> — dès qu’il est retourné, le tour s’arrête : rien n’est ramassé.</li>
  <li><strong>Betachou</strong> — si un Betachou est déjà visible et que tu retournes une autre carte, ou si Betachou et d’autres personnages sont visibles en même temps (hors cas « que des Betachou »).</li>
</ul>

<h4>Fin de partie</h4>
<ul>
  <li>La partie se termine quand il ne reste plus que des cartes René sur le plateau.</li>
  <li>Les René restants vont au joueur qui a ramassé le plus de Betachou.</li>
  <li>En cas d’égalité de Betachou, les René ne sont attribués à personne.</li>
  <li>Le gagnant est celui qui possède le plus de cartes au total (René inclus s’ils sont attribués).</li>
</ul>

<h4>Modes de jeu</h4>
<ul>
  <li><strong>Joueur vs Joueur</strong> — deux profils (ou un invité) alternent sur le même appareil.</li>
  <li><strong>Joueur vs IA</strong> — quatre niveaux de difficulté (Betachou → Bobby).</li>
</ul>
`,
} as const
