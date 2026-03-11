"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useCart } from "@/lib/contexts/CartContext";
import RatingStars from "@/components/RatingStars";
import { motion } from "framer-motion";
import ProductReviews from "@/app/components/ProductReview";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation,Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import useEmblaCarousel from "embla-carousel-react";


/* ============================================================================
   TYPES
   ============================================================================ */
type DbProduct = {
  id: number;
  nom: string;
  prix: number;
  tagline?: string | null;
  story?: string | null;
  description?: string | null;
  images?: string[] | null;
  benefits?: string[] | null;
  ingredients?: string[] | null;
  usage_instructions?: string | null;
  gummies_per_jar?: number | null;
  flavor?: string | null;
  shipping_note?: string | null;
  category?: string | null;
};

type ProductKey = "sleep" | "shine" | "source" | "strength" | "soul";

type ProductHighlight = { emoji: string; text: string };

type ProductConfig = {
  key: ProductKey;
  folder: string;
  emoji: string;
  highlights: ProductHighlight[];
  routineTitle: string;
  routineSubtitle: string;
  routineIntro: string;
  routineSub: string;
  routineTips: string[];
  routineNote: string;
  mythsTitle: string;
  myths: { id: number; myth: string; reality: string; image?: string; imageAlt?: string }[];
  faqTitle: string;
  faqSubtitle: string;
  faqs: { id: number; question: string; answer: string }[];
};

/* ============================================================================
   PRODUCT DATA CONFIG
   ============================================================================ */
const PRODUCT_CONFIG: Record<ProductKey, ProductConfig> = {
  sleep: {
    key: "sleep",
    folder: "sleep",
    emoji: "🌙",
    highlights: [
      { emoji: "🫐", text: "Myrtille" },
      { emoji: "🌙", text: "Soutien de l'endormissement" },
      { emoji: "🧘‍♂️", text: "Relaxation" },
      { emoji: "😴", text: "Repos nocturne" },
    ],
    routineTitle: "Optimiser votre routine du soir",
    routineSubtitle: "Mieux dormir grâce à une routine apaisante",
    routineIntro: "NUKU SLEEP accompagne le sommeil lorsqu'il est intégré dans une routine du soir adaptée à la vraie vie.",
    routineSub: "Il ne suffit pas de prendre un gummy : le contexte compte.",
    routineTips: [
      "Prendre les gummies dans le cadre de votre routine du soir, au moment qui vous convient le mieux.",
      "Éviter de les prendre au dernier moment dans le lit ; les consommer pendant un moment de transition (canapé, salle de bain, préparation du coucher).",
      "Si vous regardez un écran le soir, éviter les contenus trop stimulants juste après la prise.",
      "Accepter que l'endormissement ne soit pas immédiat : le sommeil vient progressivement.",
      "Comprendre que la formule fonctionne mieux sur la durée, pas comme un bouton \"off\".",
    ],
    routineNote: "La régularité et les habitudes du soir influencent davantage l'expérience que la recherche d'un effet instantané.",
    mythsTitle: "Mythes & Réalités — NUKU SLEEP",
    myths: [
      { id: 1, myth: "Il suffit de prendre un gummy pour s'endormir immédiatement.", reality: "NUKU SLEEP accompagne la transition naturelle vers le sommeil et s'inscrit dans une routine du soir régulière, sans effet instantané." },
      { id: 2, myth: "La mélatonine agit comme un somnifère.", reality: "La mélatonine est une hormone naturellement produite par l'organisme. Elle soutient le rythme veille-sommeil sans forcer l'endormissement." },
      { id: 3, myth: "Les aides au sommeil sont réservées aux personnes ayant de graves troubles.", reality: "NUKU SLEEP s'adresse à celles et ceux qui veulent améliorer leurs habitudes du soir, apaiser l'esprit et créer de meilleures conditions pour s'endormir." },
    ],
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Tout ce que vous devez savoir sur NUKU SLEEP",
    faqs: [
      { id: 1, question: "À quoi sert NUKU Sleep ?", answer: "NUKU Sleep est un complément alimentaire conçu pour accompagner la routine du soir et favoriser un état de détente avant le coucher, dans le cadre d'un mode de vie équilibré." },
      { id: 2, question: "Est-ce un somnifère ou un médicament ?", answer: "Non. NUKU Sleep n'est pas un médicament. Il ne remplace pas un suivi médical et ne traite pas les troubles du sommeil chroniques." },
      { id: 3, question: "En combien de temps peut-on en ressentir les effets ?", answer: "Les ressentis varient selon les personnes, leur rythme de vie et leurs habitudes de sommeil. Certaines peuvent percevoir un soutien rapidement, d'autres après une utilisation régulière." },
      { id: 4, question: "Peut-on en prendre tous les soirs ?", answer: "Oui, dans le respect de la dose recommandée. En cas de grossesse, d'allaitement, de pathologie ou de traitement médicamenteux, il est conseillé de demander l'avis d'un professionnel de santé." },
      { id: 5, question: "Ce produit peut-il provoquer une dépendance ?", answer: "NUKU Sleep est un complément alimentaire et n'a pas vocation à créer une dépendance. Il s'inscrit dans une approche progressive et douce du bien-être." },
      { id: 6, question: "Faut-il adopter une routine de sommeil en parallèle ?", answer: "Oui. Une bonne hygiène de sommeil (horaires réguliers, écrans limités le soir, environnement calme) renforce l'intérêt d'un complément alimentaire." },
      { id: 7, question: "Qui peut utiliser NUKU Sleep ?", answer: "Le produit est destiné aux adultes. Les personnes souffrant de troubles du sommeil persistants doivent consulter un professionnel de santé." },
      { id: 8, question: "Peut-on associer NUKU Sleep à d'autres compléments ?", answer: "Oui dans la plupart des cas, mais il faut rester attentif aux doublons d'ingrédients similaires et aux interactions possibles avec certains traitements." },
      { id: 9, question: "Combien de gummies faut-il prendre par jour ?", answer: "La portion recommandée est de 2 gummies par jour, à ne pas dépasser." },
      { id: 10, question: "À quel moment faut-il les consommer ?", answer: "Il est conseillé de prendre les 2 gummies le soir, avant le coucher, dans le cadre d'un rituel de détente." },
    ],
  },

  shine: {
    key: "shine",
    folder: "shine",
    emoji: "✨",
    highlights: [
      { emoji: "🍋", text: "Citron" },
      { emoji: "💇", text: "Nutrition capillaire" },
      { emoji: "🧬", text: "Structure du cheveu" },
      { emoji: "✨", text: "Maintien des cheveux" },
    ],
    routineTitle: "✨ Optimiser votre rituel beauté — NUKU SHINE",
    routineSubtitle: "Beauté & soutien interne pour des cheveux plus forts",
    routineIntro: "NUKU SHINE accompagne la beauté des cheveux lorsqu'il est utilisé de façon régulière et sur la durée. La formule agit de l'intérieur et ne remplace pas les soins externes.",
    routineSub: "La constance et la patience jouent un rôle plus important que la recherche d'un résultat rapide.",
    routineTips: [
      "Prendre les gummies quotidiennement dans le cadre d'une cure, afin d'accompagner le cycle naturel du cheveu.",
      "Comprendre que la formule n'agit pas directement sur le cheveu visible, mais accompagne les mécanismes internes liés à sa qualité et à sa résistance.",
      "Ne pas attendre de changement immédiat : le cycle du cheveu est lent, les effets s'observent dans le temps.",
      "Associer la formule à une routine capillaire cohérente (soins non agressifs, respect du cuir chevelu).",
      "Accepter que les résultats varient selon les personnes, l'hygiène de vie et la régularité.",
    ],
    routineNote: "La constance et la patience jouent un rôle plus important que la recherche d'un résultat rapide.",
    mythsTitle: "Mythes & Réalités — NUKU SHINE",
    myths: [
      { id: 1, myth: "Un complément cheveux peut relancer la repousse à lui seul.", reality: "NUKU SHINE n'est pas une solution de repousse. La formule accompagne la croissance naturelle des cheveux en soutenant leur équilibre interne, dans le cadre d'une routine beauté régulière." },
      { id: 2, myth: "Des cheveux plus forts signifient des résultats rapides et visibles.", reality: "La force du cheveu se construit dans le temps. Grâce à des actifs comme le MSM, NUKU SHINE accompagne la structure et la résistance du cheveu, avec une approche progressive et réaliste." },
    ],
    faqTitle: "FAQ – SHINE (Cheveux)",
    faqSubtitle: "Tout ce que vous devez savoir sur NUKU SHINE",
    faqs: [
      { id: 1, question: "À quoi sert réellement la formule SHINE ?", answer: "SHINE est conçue pour soutenir la santé normale des cheveux grâce à des nutriments impliqués dans leur structure et leur cycle naturel." },
      { id: 2, question: "Est-ce que SHINE fait repousser les cheveux rapidement ?", answer: "Non. La pousse des cheveux suit un rythme biologique lent. SHINE ne peut pas provoquer une repousse immédiate ni corriger une chute liée à une pathologie ou un déséquilibre hormonal." },
      { id: 3, question: "Quand peut-on raisonnablement évaluer les résultats ?", answer: "Une première évaluation est possible autour de 8 à 12 semaines, puis dans le cadre d'une cure de 3 à 6 mois." },
      { id: 4, question: "À qui s'adresse SHINE ?", answer: "SHINE peut convenir aux adultes souhaitant soutenir la vitalité de leurs cheveux, accompagner des périodes de fatigue ou renforcer leur routine capillaire." },
      { id: 5, question: "Combien de gummies faut-il prendre et pendant combien de temps ?", answer: "2 gummies par jour. Une cure de 3 à 6 mois est généralement recommandée, sans dépasser la dose journalière." },
      { id: 6, question: "SHINE convient-elle aussi aux hommes et aux femmes ?", answer: "Oui, les mécanismes biologiques du cheveu sont les mêmes pour les deux." },
      { id: 7, question: "Que puis-je faire en plus de SHINE pour prendre soin de mes cheveux ?", answer: "Alimentation variée, hydratation, sommeil, gestion du stress et soins capillaires doux. Les compléments agissent toujours en soutien." },
    ],
  },

  source: {
    key: "source",
    folder: "source",
    emoji: "🌿",
    highlights: [
      { emoji: "🍎", text: "Pomme" },
      { emoji: "🌿", text: "Confort intestinal" },
      { emoji: "💨", text: "Ballonnements" },
      { emoji: "⚖️", text: "Équilibre digestif" },
    ],
    routineTitle: "🌿 Optimiser votre confort digestif au quotidien — NUKU SOURCE",
    routineSubtitle: "Digestion & légèreté au quotidien",
    routineIntro: "NUKU SOURCE accompagne la digestion, le confort et la sensation de légèreté lorsqu'il est intégré dans une routine quotidienne cohérente. Il ne s'agit pas d'une solution immédiate ou radicale.",
    routineSub: "La régularité et la cohérence des habitudes influencent davantage l'expérience que la recherche d'un effet immédiat.",
    routineTips: [
      "Prendre les gummies chaque jour, à un moment facile à tenir (matin, après un repas ou à un moment fixe).",
      "La formule accompagne le confort digestif au quotidien, même après des repas plus lourds.",
      "Être attentif à son rythme de repas et à l'hydratation pour optimiser les effets.",
      "Les sensations de légèreté apparaissent progressivement avec une utilisation régulière.",
    ],
    routineNote: "La régularité et la cohérence des habitudes influencent davantage l'expérience que la recherche d'un effet immédiat.",
    mythsTitle: "Mythes & Réalités — NUKU SOURCE",
    myths: [
      { id: 1, myth: "Les formules pour la digestion 'détoxifient' totalement le corps.", reality: "Le corps se régule naturellement. NUKU SOURCE accompagne les fonctions digestives grâce à une synergie végétale, sans promesse de détox miracle." },
      { id: 2, myth: "La sensation de légèreté signifie perdre du poids.", reality: "NUKU SOURCE n'est pas une formule minceur. La légèreté évoquée est un mieux‑être digestif progressif." },
    ],
    faqTitle: "FAQ – SOURCE (Détox & Digestion)",
    faqSubtitle: "Tout ce que vous devez savoir sur NUKU SOURCE",
    faqs: [
      { id: 1, question: "À quoi sert réellement la formule SOURCE ?", answer: "SOURCE soutient les fonctions naturelles d'élimination et le confort digestif grâce à une sélection de plantes." },
      { id: 2, question: "Est-ce que SOURCE 'détoxifie' le corps ?", answer: "Non. Le corps possède déjà ses propres systèmes de régulation. SOURCE les accompagne sans les remplacer." },
      { id: 3, question: "Quand ressent-on des effets ?", answer: "Parfois dès les premières prises, mais surtout sur plusieurs semaines, dans une cure de 3 à 6 mois." },
      { id: 4, question: "À qui s'adresse SOURCE ?", answer: "Aux adultes souhaitant soutenir leur digestion, réduire les lourdeurs ou intégrer un rituel bien‑être." },
      { id: 5, question: "Combien de gummies faut-il prendre ?", answer: "2 gummies par jour. Une cure de 3 à 6 mois est recommandée." },
      { id: 6, question: "SOURCE aide-t-elle à perdre du poids ?", answer: "Non, ce n'est pas une formule minceur. Elle soutient le bien‑être digestif." },
      { id: 7, question: "Que puis-je faire en plus pour ma digestion ?", answer: "Alimentation riche en fibres, hydratation, activité physique, mastication lente et limitation des excès." },
    ],
  },

  strength: {
    key: "strength",
    folder: "strength",
    emoji: "💪",
    highlights: [
      { emoji: "🍉", text: "Pastèque" },
      { emoji: "⚡", text: "Énergie musculaire" },
      { emoji: "🏃", text: "Performance physique" },
      { emoji: "🧠", text: "Soutien cognitif" },
    ],
    routineTitle: "💪 Comment utiliser NUKU STRENGTH au quotidien",
    routineSubtitle: "Énergie · Performance · Clarté mentale",
    routineIntro: "NUKU STRENGTH accompagne l'énergie, la performance et la concentration dans la durée. La créatine joue un rôle essentiel dans la disponibilité énergétique, y compris au niveau cérébral.",
    routineSub: "Ce n'est pas la prise ponctuelle qui compte, mais la constance jour après jour.",
    routineTips: [
      "Adapter la prise selon la journée : plus lors d'un effort intense, moins lors d'une journée classique.",
      "2 à 3 gummies conviennent à la plupart des journées, 4 lors des efforts plus exigeants.",
      "La créatine fonctionne mieux lorsqu'elle est prise régulièrement.",
      "STRENGTH s'intègre à une routine sportive ou quotidienne, sans nécessité de sport intensif.",
      "Ne pas attendre un effet immédiat : l'efficacité se construit dans le temps.",
    ],
    routineNote: "La constance jour après jour est la clé d'un bon fonctionnement énergétique.",
    mythsTitle: "Mythes & Réalités — NUKU STRENGTH",
    myths: [
      { id: 1, myth: "La créatine est réservée aux sportifs.", reality: "La créatine est naturellement présente dans l'organisme et utile au quotidien, y compris en dehors du sport." },
      { id: 2, myth: "La créatine transforme immédiatement les performances.", reality: "Ce n'est pas un produit miracle. Les effets sont progressifs et soutiennent les efforts répétés." },
      { id: 3, myth: "La créatine agit comme un stimulant.", reality: "Elle ne stimule pas le système nerveux. Elle soutient l'énergie cellulaire sans nervosité." },
      { id: 4, myth: "La créatine n'a aucun lien avec la concentration.", reality: "Elle joue un rôle dans l'énergie globale du corps et peut soutenir la clarté mentale." },
    ],
    faqTitle: "FAQ – STRENGTH (Performance & Focus)",
    faqSubtitle: "Tout ce que vous devez savoir sur NUKU STRENGTH",
    faqs: [
      { id: 1, question: "À quoi sert STRENGTH ?", answer: "STRENGTH soutient la performance physique, la force musculaire et l'énergie, y compris au niveau cérébral." },
      { id: 2, question: "STRENGTH agit-elle sur la concentration ?", answer: "Oui, la créatine soutient la production d'énergie cellulaire, ce qui peut aider la clarté mentale." },
      { id: 3, question: "Quand ressent-on les effets ?", answer: "L'énergie peut évoluer rapidement, mais les adaptations musculaires demandent plusieurs semaines ou mois." },
      { id: 4, question: "À qui s'adresse STRENGTH ?", answer: "Aux adultes souhaitant soutenir leur énergie, leurs performances et leur concentration." },
      { id: 5, question: "Quelle dose prendre ?", answer: "3 gummies par jour. Une cure de 3 à 6 mois est recommandée." },
      { id: 6, question: "STRENGTH aide-t-il à prendre de la masse ?", answer: "Il accompagne les adaptations musculaires, mais ne remplace ni l'entraînement ni l'alimentation." },
      { id: 7, question: "Est-il réservé aux sportifs ?", answer: "Non. Il convient aussi aux personnes actives ayant besoin de soutenir leur énergie." },
      { id: 8, question: "Que faire en plus de STRENGTH ?", answer: "Sommeil, hydratation, alimentation équilibrée, progression et récupération physique et mentale." },
    ],
  },

  soul: {
    key: "soul",
    folder: "soul",
    emoji: "🕊️",
    highlights: [
      { emoji: "🍒", text: "Cerise" },
      { emoji: "🧘", text: "Gestion du stress" },
      { emoji: "🧠", text: "Calme mental" },
      { emoji: "🌿", text: "Équilibre émotionnel" },
    ],
    routineTitle: "🌿 Optimiser votre équilibre au quotidien — NUKU SOUL",
    routineSubtitle: "Calme intérieur · Adaptation au stress · Stabilité émotionnelle",
    routineIntro: "NUKU SOUL accompagne le calme intérieur et l'équilibre émotionnel lorsqu'il est utilisé dans le rythme réel du quotidien. Il ne s'agit pas de supprimer le stress, mais de mieux vivre les journées chargées.",
    routineSub: "Le contexte, la régularité et le rythme personnel influencent davantage l'expérience que la recherche d'un effet instantané.",
    routineTips: [
      "Prendre les gummies à un moment identifiable de la journée, par exemple après le travail ou lorsque les obligations principales sont terminées.",
      "Éviter de les prendre en plein rush (réunions, déplacements, notifications constantes) : la formule agit mieux lorsqu'elle est intégrée à un moment de transition.",
      "Ne pas attendre un effet immédiat : le calme ne s'installe pas comme un interrupteur.",
      "Comprendre que NUKU SOUL n'annule pas les sources de stress, mais accompagne la capacité à y faire face avec plus de stabilité.",
      "La formule est particulièrement appréciée lorsque les journées sont intenses, pour accompagner le rythme et aider à retrouver un meilleur équilibre.",
    ],
    routineNote: "Le contexte, la régularité et le rythme personnel influencent davantage l'expérience que la recherche d'un effet instantané.",
    mythsTitle: "Mythes & Réalités — NUKU SOUL",
    myths: [
      { id: 1, myth: "L'ashwagandha agit comme un anxiolytique naturel.", reality: "L'ashwagandha n'est pas un anxiolytique et ne remplace pas un traitement médical. Elle accompagne l'adaptation au stress dans une approche progressive et non sédative." },
      { id: 2, myth: "Si je ne ressens pas un effet immédiat, c'est que la formule ne fonctionne pas.", reality: "Les plantes comme l'ashwagandha et le safran n'agissent pas par sensation immédiate. Leur rôle est d'accompagner l'équilibre de manière progressive, sans effet marqué ou artificiel." },
    ],
    faqTitle: "FAQ – SOUL (Stress & Équilibre)",
    faqSubtitle: "Tout ce que vous devez savoir sur NUKU SOUL",
    faqs: [
      { id: 1, question: "À quoi sert réellement la formule SOUL ?", answer: "SOUL est conçue pour soutenir l'équilibre émotionnel et la capacité de l'organisme à faire face au stress quotidien grâce à une combinaison de plantes, d'acides aminés et de vitamines." },
      { id: 2, question: "Est‑ce que SOUL supprime totalement le stress ?", answer: "Non. SOUL aide l'organisme à mieux gérer la pression quotidienne, sans éliminer les sources de stress ni traiter un trouble anxieux." },
      { id: 3, question: "Quand peut‑on évaluer les effets ?", answer: "Certaines personnes ressentent une évolution dès les premières prises. L'évaluation plus complète se fait sur plusieurs semaines, puis dans une cure de 3 à 6 mois." },
      { id: 4, question: "À qui s'adresse SOUL ?", answer: "SOUL peut convenir aux adultes souhaitant mieux gérer la pression quotidienne, soutenir leur humeur et préserver leur clarté mentale." },
      { id: 5, question: "Combien de gummies faut‑il prendre et pendant combien de temps ?", answer: "La dose recommandée est de 2 gummies par jour. Une cure de 3 à 6 mois peut être envisagée, sans dépasser la dose journalière." },
      { id: 6, question: "Est‑ce que SOUL agit sur le sommeil ?", answer: "SOUL n'est pas une formule sommeil. Cependant, en accompagnant la gestion du stress, elle peut indirectement favoriser la détente." },
      { id: 7, question: "Que puis‑je faire en plus de SOUL pour mieux gérer le stress ?", answer: "Sommeil régulier, respiration/méditation, activité physique, alimentation équilibrée, hydratation et pauses." },
    ],
  },
};

/* ============================================================================
   INGREDIENT IMAGES
   ============================================================================ */
const INGREDIENT_IMAGES: Record<string, { path: string; label: string; benefit: string }> = {
  "sleep-melatonine":   { path: "/image/sleep/melatonin.jpg",     label: "Mélatonine",    benefit: "Aide à réduire le temps d'endormissement et à réguler le rythme veille-sommeil." },
  "sleep-theanine":     { path: "/image/sleep/l-theanine.jpg",    label: "L-théanine",    benefit: "Favorise la détente et la relaxation sans provoquer de somnolence." },
  "sleep-gaba":         { path: "/image/sleep/gaba.jpg",          label: "GABA",          benefit: "Aide à apaiser le mental et à favoriser un état de calme propice au sommeil." },
  "sleep-valeriane":    { path: "/image/sleep/valeriane.jpg",     label: "Valériane",     benefit: "Contribue à un sommeil de qualité et facilite l'endormissement." },
  "sleep-passiflore":   { path: "/image/sleep/passiflore.jpg",    label: "Passiflore",    benefit: "Aide à réduire le stress et la nervosité pour mieux se préparer au sommeil." },
  "sleep-magnesium":    { path: "/image/sleep/magnesium.jpg",     label: "Magnésium",     benefit: "Réduit la fatigue et contribue au fonctionnement normal du système nerveux." },
  "sleep-vitb6":        { path: "/image/sleep/vitamine-b6.jpg",   label: "Vitamine B6",   benefit: "Contribue au fonctionnement normal du système nerveux et réduit la fatigue." },
  "shine-biotine":      { path: "/image/shine/Biotine .jpg",               label: "Biotine",              benefit: "Contribue au maintien de cheveux normaux et d'ongles normaux." },
  "shine-roquette":     { path: "/image/shine/Extrait de roquette .jpg",   label: "Extrait de roquette",  benefit: "Riche en antioxydants, soutient l'éclat et la vitalité de la peau." },
  "shine-msm":          { path: "/image/shine/MSM.jpg",                    label: "MSM",                  benefit: "Contribue à la souplesse de la peau et au maintien du collagène." },
  "shine-silicium":     { path: "/image/shine/Silicium.jpg",               label: "Silicium",             benefit: "Soutient la résistance des cheveux, des ongles et l'élasticité de la peau." },
  "shine-vitb6":        { path: "/image/shine/Vitamine B6.jpg",            label: "Vitamine B6",          benefit: "Contribue au fonctionnement normal du système nerveux et à la réduction de la fatigue." },
  "shine-zinc":         { path: "/image/shine/Zinc.jpg",                   label: "Zinc",                 benefit: "Contribue au maintien d'une peau normale et à la protection contre le stress oxydatif." },
  "shine-vitd3":        { path: "/image/shine/Vitamine D3.jpg",            label: "Vitamine D3",          benefit: "Contribue au maintien d'une fonction musculaire normale et soutient le système immunitaire." },
  "source-chlorella":   { path: "/image/source/Chlorella .jpg",                        label: "Chlorella",    benefit: "Microalgue riche en chlorophylle, soutient la détoxification naturelle de l'organisme." },
  "source-curcuma":     { path: "/image/source/Curcuma.jpg",                           label: "Curcuma",      benefit: "Contribue à réduire l'inflammation et soutient les défenses naturelles de l'organisme." },
  "source-pissenlit":   { path: "/image/source/Extrait de racine de pissenlit .jpg",   label: "Pissenlit",    benefit: "Soutient la fonction hépatique et contribue à la digestion normale." },
  "source-artichaut":   { path: "/image/source/artichaut.jpg",                         label: "Artichaut",    benefit: "Favorise une digestion normale et contribue au bon fonctionnement du foie." },
  "source-matcha":      { path: "/image/source/Matcha.jpg",                            label: "Matcha",       benefit: "Source d'antioxydants, soutient l'énergie et la concentration au quotidien." },
  "source-vitb6":       { path: "/image/source/Vitamine B6.jpg",                       label: "Vitamine B6",  benefit: "Contribue au fonctionnement normal du système nerveux et au métabolisme énergétique." },
  "strength-creatine":  { path: "/image/strength/monohydrate.jpg",     label: "Créatine monohydrate",   benefit: "Augmente les performances physiques lors d'exercices intenses et répétés." },
  "strength-vitb12":    { path: "/image/strength/Vitamine B12.jpg",    label: "Vitamine B12",           benefit: "Contribue à réduire la fatigue et soutient le métabolisme énergétique normal." },
  "strength-vitd3":     { path: "/image/strength/Vitamine D3.jpg",     label: "Vitamine D3",            benefit: "Contribue au maintien d'une fonction musculaire normale et soutient la récupération." },
  "soul-ashwagandha":   { path: "/image/soul/Ashwagandha ksm 66.jpg",  label: "Ashwagandha KSM-66",  benefit: "Aide à réduire le stress et à améliorer la résistance mentale et physique au stress." },
  "soul-gaba":          { path: "/image/soul/Gaba.jpg",                label: "GABA",                benefit: "Aide à apaiser le mental et à favoriser un état de calme et de sérénité." },
  "soul-theanine":      { path: "/image/soul/L-theanine.jpg",          label: "L-théanine",          benefit: "Favorise la détente et la relaxation sans provoquer de somnolence." },
  "soul-rhodiola":      { path: "/image/soul/Rhodiola.jpg",            label: "Rhodiola",            benefit: "Contribue à réduire la fatigue et soutient l'équilibre émotionnel." },
  "soul-safran":        { path: "/image/soul/Safran.jpg",              label: "Safran",              benefit: "Contribue à l'équilibre de l'humeur et favorise un état émotionnel positif." },
  "soul-vitb6":         { path: "/image/soul/Vitamine b6.jpg",         label: "Vitamine B6",         benefit: "Contribue au fonctionnement normal du système nerveux." },
};

/* ============================================================================
   UTILS
   ============================================================================ */
const productColors = [
  "from-purple-100/50 to-purple-50/30", "from-green-100/50 to-green-50/30",
  "from-blue-100/50 to-blue-50/30",   "from-amber-100/50 to-amber-50/30",
  "from-rose-100/50 to-rose-50/30",   "from-teal-100/50 to-teal-50/30",
  "from-indigo-100/50 to-indigo-50/30","from-orange-100/50 to-orange-50/30",
];

function colorIndexFromId(id: number, len: number) {
  let x = id;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = ((x >>> 16) ^ x) * 0x45d9f3b;
  x = (x >>> 16) ^ x;
  return Math.abs(x) % len;
}

const euroFmt = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });

function getProductKey(product: DbProduct): ProductKey | null {
  const rawNom = (product.nom ?? "").toLowerCase();
  const rawCat = (product.category ?? "").toLowerCase();
  const normalize = (s: string) =>
    s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  const nom = normalize(rawNom);
  let cat = normalize(rawCat);
  if (cat === "strenght") cat = "strength";
  const KNOWN: ProductKey[] = ["sleep", "shine", "source", "strength", "soul"];
  if (KNOWN.includes(cat as ProductKey)) return cat as ProductKey;
  if (nom.includes("sleep"))    return "sleep";
  if (nom.includes("shine"))    return "shine";
  if (nom.includes("source"))   return "source";
  if (nom.includes("strength")) return "strength";
  if (nom.includes("soul"))     return "soul";
  return null;
}

/* ============================================================================
   PRODUCT IMAGE GALLERY
   - Grande image principale avec fond dégradé
   - Miniatures cliquables en dessous
   - Flèches gauche / droite
   - Animation fade au changement d'image
   ============================================================================ */
function ProductImageGallery({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const goTo = (index: number) => {
    const next = (index + images.length) % images.length;
    setCurrentIndex(next);
    // Centre la miniature active dans le scroll
    const container = thumbsRef.current;
    if (container) {
      const thumb = container.children[next] as HTMLElement;
      if (thumb) thumb.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  if (!images.length) return null;

  return (
    <div className="pg-wrap">
    
      <div className="pg-main">
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`Photo produit ${currentIndex + 1}`}
          className="pg-img"
          draggable={false}
          loading="lazy"
        />

        {images.length > 1 && (
          <>
            <button className="pg-arrow pg-arrow-prev" onClick={() => goTo(currentIndex - 1)} aria-label="Image précédente">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="pg-arrow pg-arrow-next" onClick={() => goTo(currentIndex + 1)} aria-label="Image suivante">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="pg-counter" aria-live="polite">{currentIndex + 1} / {images.length}</div>
          </>
        )}
      </div>

      {/* ── Miniatures ── */}
      {images.length > 1 && (
        <div className="pg-thumbs" ref={thumbsRef} role="list" aria-label="Sélecteur d'images">
          {images.map((src, i) => (
            <button
              key={i}
              className={`pg-thumb ${i === currentIndex ? "pg-thumb-active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Voir image ${i + 1}`}
              aria-current={i === currentIndex}
              role="listitem"
            >
              <img src={src} alt={`Miniature ${i + 1}`} draggable={false} />
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .pg-wrap {
          display: flex; flex-direction: column; gap: 12px;
          width: 100%; user-select: none;
        }

        /* ── Cadre principal ── */
        .pg-main {
          position: relative; width: 100%; aspect-ratio: 1 / 1;
          border-radius: 32px; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          background: transparent;
        }

        .pg-img {
          height: 90%; width: 90%; object-fit: contain;
          position: relative; z-index: 1;
          filter: drop-shadow(0 20px 35px rgba(0,0,0,0.22));
          animation: pgFade 0.22s ease;
        }
        @keyframes pgFade {
          from { opacity: 0.4; transform: scale(0.97); }
          to   { opacity: 1;   transform: scale(1); }
        }

        /* ── Flèches ── */
        .pg-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 10; width: 44px; height: 44px; border-radius: 50%;
          border: none; background: rgba(255,255,255,0.90); color: #1a1a1a;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: 0 2px 14px rgba(0,0,0,0.13);
          transition: background 0.2s, box-shadow 0.2s, transform 0.2s;
        }
        .pg-arrow:hover { background: #fff; box-shadow: 0 4px 20px rgba(0,0,0,0.18); }
        .pg-arrow:active { transform: translateY(-50%) scale(0.91); }
        .pg-arrow-prev { left: 14px; }
        .pg-arrow-next { right: 14px; }

        /* ── Compteur ── */
        .pg-counter {
          position: absolute; bottom: 14px; right: 16px; z-index: 10;
          background: rgba(0,0,0,0.42); color: #fff;
          font-size: 12px; font-weight: 600;
          padding: 3px 11px; border-radius: 20px;
          backdrop-filter: blur(6px); letter-spacing: 0.05em;
        }

        /* ── Miniatures ── */
        .pg-thumbs {
          display: flex; gap: 8px;
          overflow-x: auto; scroll-behavior: smooth;
          padding-bottom: 2px; scrollbar-width: none;
        }
        .pg-thumbs::-webkit-scrollbar { display: none; }

        .pg-thumb {
          flex-shrink: 0; width: 72px; height: 72px;
          border-radius: 12px; overflow: hidden;
          border: 2px solid transparent; background: #f0ede8;
          cursor: pointer; padding: 0; opacity: 0.60;
          transition: opacity 0.2s, border-color 0.2s, transform 0.2s;
        }
        .pg-thumb:hover { opacity: 0.85; transform: scale(1.04); }
        .pg-thumb-active { border-color: #ef8035; opacity: 1; transform: scale(1.05); }
        .pg-thumb img {
          width: 100%; height: 100%; object-fit: cover;
          display: block; pointer-events: none;
        }

        @media (max-width: 480px) {
          .pg-thumb { width: 58px; height: 58px; }
          .pg-arrow { width: 38px; height: 38px; }
        }
      `}</style>
    </div>
  );
}

/* ============================================================================
   HIGHLIGHTS GRID — grille 2x2 avec emoji
   ============================================================================ */
function ProductHighlights({ highlights }: { highlights: ProductHighlight[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="grid grid-cols-2 gap-x-6 gap-y-4 mt-5 pt-5 border-t border-neutral-100"
    >
      {highlights.map((h, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-2xl leading-none select-none flex-shrink-0" aria-hidden>{h.emoji}</span>
          <span className="text-[14px] text-neutral-700 leading-snug">{h.text}</span>
        </div>
      ))}
    </motion.div>
  );
}

/* ============================================================================
   BENEFITS (fallback si pas de productKey)
   ============================================================================ */
function getBenefitEmoji(text: string) {
  const t = text.toLowerCase();
  if (t.includes("endorm"))  return "🌙";
  if (t.includes("profond")) return "💫";
  if (t.includes("mental") || t.includes("apais")) return "🕊️";
  if (t.includes("rituel") || t.includes("détente")) return "✨";
  if (t.includes("stress"))  return "🧘";
  if (t.includes("humeur"))  return "😊";
  if (t.includes("fatigue")) return "🔋";
  if (t.includes("sommeil") || t.includes("dorm")) return "😴";
  if (t.includes("immun") || t.includes("défense") || t.includes("defense")) return "🛡️";
  if (t.includes("cheveu") || t.includes("peau")) return "💆";
  if (t.includes("force") || t.includes("muscu")) return "💪";
  if (t.includes("énergi")) return "⚡";
  return "✔️";
}

function chunkTwo<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) out.push(arr.slice(i, i + 2));
  return out;
}

function BenefitsNoMiddle({ benefits }: { benefits: string[] }) {
  const rows = chunkTwo(benefits);
  return (
    <div className="mt-3">
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 py-1">
          {row.map((text, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xl md:text-2xl leading-none select-none" aria-hidden>{getBenefitEmoji(text)}</span>
              <span className="text-[15px] md:text-base text-neutral-800">{text}</span>
            </div>
          ))}
          {row.length === 1 && <div className="hidden md:block" />}
        </div>
      ))}
    </div>
  );
}

/* ============================================================================
   INGREDIENTS SLIDER — Coverflow Premium
   ============================================================================ */
type Props = {
  ingredients?: string[];
  productKey: ProductKey | null;
};

 function IngredientsSlider({ ingredients, productKey }: Props) {
  const allIngredients = useMemo(() => {
    if (!productKey) return [];
    const out: { label: string; image: string; benefit: string }[] = [];
    Object.entries(INGREDIENT_IMAGES).forEach(([key, value]: any) => {
      if (key.startsWith(productKey + "-")) {
        out.push({ label: value.label, image: value.path, benefit: value.benefit });
      }
    });
    return out;
  }, [productKey]);

  const total = allIngredients.length;

  // ─── Embla setup ───────────────────────────────────────────────────────────
  // loop: true fonctionne parfaitement dans les deux sens avec Embla, sans config
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: total > 3,           // loop seulement si assez d'items
    align: "center",           // carte active toujours centrée
    containScroll: false,      // permet de voir les cartes des côtés
    slidesToScroll: 1,         // toujours 1 slide à la fois, sans exception
    dragFree: false,
  });

  const [activeIndex, setActiveIndex]       = useState(Math.floor(total / 2));
  const [openBenefitIndex, setOpenBenefitIndex] = useState<number | null>(null);
  const [isTouch, setIsTouch]               = useState(false);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  useEffect(() => {
    setIsTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches);
  }, []);

  // Synchronise l'index actif et l'état des boutons après chaque slide
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
    setOpenBenefitIndex(null);
    // Avec loop=true, les deux boutons sont toujours actifs — Embla gère ça nativement
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Démarrer sur la carte du milieu
    emblaApi.scrollTo(Math.floor(total / 2), true);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect(); // état initial
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect, total]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!total) return null;

  // ─── Largeur max du wrap selon le nombre d'items ───────────────────────────
  const desktopSlotsForWidth = Math.min(total >= 5 ? 5 : total || 1, 5);
  const wrapMaxWidth =
    desktopSlotsForWidth === 5 ? "1200px" :
    desktopSlotsForWidth === 4 ? "980px"  :
    desktopSlotsForWidth === 3 ? "760px"  :
    desktopSlotsForWidth === 2 ? "520px"  : "320px";

  // ─── Largeur de chaque slide en % (équivalent slidesPerView) ───────────────
  // Embla utilise des % CSS sur chaque slide pour contrôler combien on en voit.
  // On utilise des valeurs non-entières pour toujours avoir un "demi-slide" visible.
  const slideWidthDesktop =
    total <= 2 ? "100%" :
    total === 3 ? "42%"  :   // ~2.4 slides visibles
    total === 4 ? "30%"  :   // ~3.3 slides visibles
    total === 5 ? "22%"  :   // ~4.5 slides visibles
    "21%";                    // 6-7+ → ~4.8 slides visibles

  const activeScale = total === 3 ? 1.14 : total >= 6 ? 1.1 : 1.08;

  return (
    <section className="ing-section">
       <div className="luxury-header">
        <span className="luxury-badge">Formulation Expert</span>
        <h2 className="luxury-title">Les Ingrédients</h2>
        <div className="luxury-divider"></div>
        <p className="luxury-subtitle">L’efficacité au cœur de la formule</p>
      </div>


      <div
        className="ing-wrap"
        data-few={total <= 3 ? "true" : undefined}
        style={{ ["--active-scale" as any]: activeScale } as React.CSSProperties}
      >
        {/* Zone scrollable Embla */}
        <div className="ing-viewport" ref={emblaRef}>
          <div className="ing-container">
            {allIngredients.map((item, i) => {
              const isActive    = i === activeIndex;
              const benefitOpen = isTouch && openBenefitIndex === i;

              return (
                <div
                  key={`${item.label}-${i}`}
                  className="ing-slide"
                >
                  <div
                    className={`ing-card ${isActive ? "ing-card--active" : ""}`}
                    onClick={() => {
                      if (!isActive) emblaApi?.scrollTo(i);
                    }}
                    role={!isActive ? "button" : undefined}
                    tabIndex={!isActive ? 0 : undefined}
                    aria-label={!isActive ? `Voir ${item.label}` : undefined}
                  >
                    <h4 className="ing-card-name">{item.label}</h4>

                    <div className="ing-img-wrap">
                      <img
                        src={item.image}
                        alt={item.label}
                        loading="lazy"
                        draggable={false}
                      />
                    </div>

                    <div className={`ing-benefit ${benefitOpen ? "ing-benefit--open" : ""}`}>
                      <p>{item.benefit}</p>
                    </div>

                    {isActive && isTouch && (
                      <button
                        type="button"
                        className={`ing-touch-btn ${benefitOpen ? "ing-touch-btn--open" : ""}`}
                        aria-label={benefitOpen ? "Masquer" : "Voir le bienfait"}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setOpenBenefitIndex(benefitOpen ? null : i);
                        }}
                      >
                        {benefitOpen ? (
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Flèches — uniquement desktop */}
        {!isTouch && (
          <>
            <button
              className="ing-nav-btn ing-nav-prev"
              onClick={scrollPrev}
              disabled={!prevBtnEnabled && !(total > 3)}
              aria-label="Précédent"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M12.5 5L7.5 10l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="ing-nav-btn ing-nav-next"
              onClick={scrollNext}
              disabled={!nextBtnEnabled && !(total > 3)}
              aria-label="Suivant"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
      </div>

      <style jsx>{`
      .luxury-header { text-align: center; margin-bottom: 50px; }
        .luxury-badge { text-transform: uppercase; letter-spacing: 3px; font-size: 11px; color: #b58e58; font-weight: 700; }
        .luxury-title { font-size: 40px; font-weight: 300; margin: 10px 0; }
        .luxury-divider { width: 40px; height: 1px; background: #b58e58; margin: 15px auto; }
        .ing-section {
          margin-top: 80px;
          width: 100vw;
          position: relative;
          left: 50%; right: 50%;
          margin-left: -50vw; margin-right: -50vw;
          background: #fff;
          padding-bottom: 52px;
        }

        

        /* ─── Wrap ─────────────────────────────────────────────────────────── */
        .ing-wrap {
          position: relative;
          max-width: ${wrapMaxWidth};
          margin: 0 auto;
          padding: 20px 0 8px;
          width: 100%;
        }

        /* Voiles latéraux */
        .ing-wrap::before,
        .ing-wrap::after {
          content: "";
          position: absolute;
          top: 0; bottom: 0;
          width: 40px;
          z-index: 5;
          pointer-events: none;
        }
        .ing-wrap::before {
          left: 0;
          background: linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%);
        }
        .ing-wrap::after {
          right: 0;
          background: linear-gradient(to left, #fff 0%, rgba(255,255,255,0) 100%);
        }
        .ing-wrap[data-few="true"]::before,
        .ing-wrap[data-few="true"]::after { display: none; }

        /* ─── Embla ─────────────────────────────────────────────────────────── */
        /* Le viewport masque ce qui dépasse — on le laisse overflow visible
           pour voir les cartes des côtés (effet "peek") */
        .ing-viewport {
          overflow: hidden;
          padding: 16px 0;
        }

        .ing-container {
          display: flex;
          /* Embla gère le touch/drag — pas de user-select sur le conteneur */
          user-select: none;
          -webkit-touch-callout: none;
          gap: 20px;
        }

        /* ─── Slide ──────────────────────────────────────────────────────────  */
        .ing-slide {
          /* Largeur responsive via CSS vars / media queries */
          flex: 0 0 50%;       /* mobile : ~2 slides visibles */
          min-width: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 480px) {
          .ing-slide { flex: 0 0 36%; }   /* tablet : ~2.8 slides */
        }

        @media (min-width: 900px) {
          .ing-slide { flex: 0 0 ${slideWidthDesktop}; }
        }

        /* ─── Carte ──────────────────────────────────────────────────────────  */
        .ing-card {
          width: 100%;
          background: linear-gradient(180deg, #fff 0%, #ffffff 100%);
          border-radius: 20px;
          border: none;
          box-shadow: 0 4px 18px rgba(0,0,0,0.07);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 14px 14px;
          gap: 10px;
          cursor: pointer;
          transform: scale(0.82);
          opacity: 0.50;
          filter: saturate(0.6) brightness(1.02);
          transform-origin: center center;
          transition:
            transform 0.4s cubic-bezier(0.34,1.26,0.64,1),
            opacity   0.35s ease,
            box-shadow 0.35s ease,
            filter    0.35s ease;
        }

        .ing-card--active {
          transform: scale(var(--active-scale, 1.08));
          opacity: 1;
          filter: none;
          box-shadow: 0 12px 36px rgba(180,130,80,0.18), 0 4px 12px rgba(0,0,0,0.07);
          cursor: default;
        }

        .ing-card-name {
          font-size: 13px;
          font-weight: 700;
          color: #2f261f;
          margin: 0;
          text-align: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .ing-card--active .ing-card-name { opacity: 1; }
        }

        .ing-img-wrap {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 14px;
          overflow: hidden;
        }
        .ing-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
          user-select: none;
          transition: transform 0.32s ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .ing-card--active:hover .ing-img-wrap img { transform: scale(1.06); }
        }

        /* ─── Benefit ────────────────────────────────────────────────────────  */
        .ing-benefit {
          width: 100%;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease;
        }
        .ing-benefit p {
          margin: 0;
          font-size: 12px;
          line-height: 1.65;
          color: #5a3e2b;
          font-style: italic;
          text-align: center;
          padding: 4px 0;
        }
        @media (hover: hover) and (pointer: fine) {
          .ing-card--active .ing-img-wrap:hover ~ .ing-benefit {
            max-height: 120px;
            opacity: 1;
          }
        }
        .ing-benefit--open {
          max-height: 120px !important;
          opacity: 1 !important;
        }

        /* ─── Bouton touch ───────────────────────────────────────────────────  */
        .ing-touch-btn {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 1.5px solid rgba(180,130,80,0.4);
          background: #fff;
          color: #3b2a22;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .ing-touch-btn--open { background: #ef8035; border-color: #ef8035; color: #fff; }

        /* ─── Flèches ────────────────────────────────────────────────────────  */
        .ing-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 42px; height: 42px;
          border-radius: 50%;
          border: 1.5px solid rgba(180,130,80,0.3);
          background: #fff;
          color: #3b2a22;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(0,0,0,0.07);
          transition: all 0.2s ease;
          z-index: 10;
        }
        .ing-nav-btn:disabled {
          opacity: 0.3;
          cursor: default;
        }
        .ing-nav-prev { left: 4px; }
        .ing-nav-next { right: 4px; }
        .ing-nav-btn:not(:disabled):hover {
          background: #ffffff;
          border-color: rgba(239,128,53,0.5);
          transform: translateY(-50%) scale(1.07);
        }
        .ing-nav-btn:not(:disabled):active { transform: translateY(-50%) scale(0.94); }

        /* ─── Mobile ─────────────────────────────────────────────────────────  */
        @media (hover: none), (pointer: coarse) {
          .ing-nav-btn { display: none !important; }
          .ing-wrap::before,
          .ing-wrap::after { width: 30px; }
          .ing-card--active .ing-card-name { opacity: 1; }
        }

        @media (max-width: 899px) {
          .ing-wrap { max-width: 100% !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ing-card, .ing-img-wrap img, .ing-benefit { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
/* ============================================================================
   PRODUCT ROUTINE SECTION
   ============================================================================ */
function ProductRoutineSection({ config }: { config: ProductConfig }) {
  const { folder, emoji, routineTitle, routineSubtitle, routineIntro, routineSub, routineTips, routineNote } = config;

  const formattedTitle = routineTitle.replace(/Optimiser/i, "Optimisez");

  const cleanTips = routineTips.map((tip: string) =>
    tip
      .replace(/de de /g, "de ")
      .replace(/\((deel|travall|actualites|travail|discuss-ons|intensitées)[^)]*/gi, "")
      .trim()
  );

  return (
    <section className="routine-container">
      <div className="layout-wrapper">

        {/* GAUCHE */}
        <div className="left-content">
          <div className="text-header">
            <p className="eyebrow">Rituel recommandé</p>
            <h2>{formattedTitle}</h2>
            <div className="intro-block">
              <p className="intro-text">
                NUKU {folder.toUpperCase()} {routineIntro.replace(/^NUKU \w+ /, "")}
              </p>
              {routineSub && <p className="sub-text">{routineSub}</p>}
            </div>
          </div>

          <div className="image-frame">
            <img
              src={`/image/${folder}/${folder}1.png`}
              alt="Rituel"
              className="hero-img"
            />
            <div className="image-overlay" />
          </div>
        </div>

        {/* DROITE */}
        <div className="card-wrapper">
          <div className="ritual-card">
            <div className="card-header">
              <span className="icon">{emoji}</span>
              <div>
                <p className="card-label">Protocole</p>
                <h3>{routineSubtitle.toUpperCase()}</h3>
              </div>
            </div>

            <div className="tips-list">
              {cleanTips.map((tip: string, i: number) => (
                <div key={i} className="tip-item">
                  <div className="tip-body">
                    <div className="tip-line" />
                    <p className="tip-description">{tip}</p>
                  </div>
                </div>
              ))}
            </div>

            {routineNote && (
              <div className="footer-note-wrapper">
                <div className="note-divider" />
                <p className="footer-note">✦ {routineNote}</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400&display=swap');

        .routine-container {
          padding: 60px 40px;
          background: #ffffff;
          display: flex;
          justify-content: center;
        }

        .layout-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1140px;
          width: 100%;
          gap: 80px;
          align-items: start;
        }

        /* ─── GAUCHE ─── */
        .left-content {
          position: sticky;
          top: 80px;
        }

        .eyebrow {
          font-family: "DM Sans", sans-serif;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #c5a27d;
          margin: 0 0 20px;
          font-weight: 400;
        }

        .text-header h2 {
          font-family: "Cormorant Garamond", serif;
          font-size: 52px;
          font-weight: 300;
          color: #1a1a1a;
          margin: 0 0 28px;
          line-height: 1.05;
          letter-spacing: -0.01em;
        }

        .intro-text {
          font-family: "DM Sans", sans-serif;
          font-size: 15px;
          line-height: 1.8;
          color: #555;
          font-weight: 300;
          margin: 0;
        }

        .sub-text {
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-size: 19px;
          font-weight: 300;
          color: #9a8a78;
          margin: 18px 0 0;
          line-height: 1.5;
        }

        .image-frame {
          position: relative;
          margin-top: 48px;
          border-radius: 3px;
          overflow: hidden;
          aspect-ratio: 3/4;
          max-width: 420px;
          box-shadow: 16px 16px 0px #ede8e1, 0 20px 60px rgba(0, 0, 0, 0.10);
        }

        .hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.8s ease;
        }

        .image-frame:hover .hero-img {
          transform: scale(1.03);
        }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            transparent 60%,
            rgba(26, 18, 8, 0.18) 100%
          );
          pointer-events: none;
        }

        /* ─── DROITE ─── */
        .ritual-card {
          padding: 32px 52px;
          background: #ffffff;
          border: 1px solid #ede8e1;
          border-radius: 3px;
          box-shadow: 0 2px 40px rgba(180, 155, 120, 0.08);
        }

        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0ebe3;
        }

        .icon {
          font-size: 22px;
          line-height: 1;
          margin-top: 3px;
          flex-shrink: 0;
        }

        .card-label {
          font-family: "DM Sans", sans-serif;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #c5a27d;
          margin: 0 0 6px;
          font-weight: 400;
        }

        .card-header h3 {
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          letter-spacing: 0.14em;
          font-weight: 400;
          color: #1a1a1a;
          margin: 0;
          line-height: 1.4;
        }

        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .tip-item {
          padding: 12px 0;
          border-bottom: 1px solid #f5f1ec;
        }

        .tip-item:last-child {
          border-bottom: none;
        }

        .tip-body {
          flex: 1;
        }

        .tip-line {
          width: 20px;
          height: 1px;
          background: #e0d5c8;
          margin-bottom: 10px;
        }

        .tip-description {
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          line-height: 1.7;
          color: #4a4a4a;
          margin: 0;
          font-weight: 300;
        }

        .footer-note-wrapper {
          margin-top: 16px;
        }

        .note-divider {
          width: 32px;
          height: 1px;
          background: #c5a27d;
          margin: 0 auto 12px;
          opacity: 0.5;
        }

        .footer-note {
          font-family: "Cormorant Garamond", serif;
          font-style: italic;
          font-size: 15px;
          font-weight: 300;
          color: #9a8a78;
          text-align: center;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .layout-wrapper {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .left-content {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .routine-container {
            padding: 40px 24px;
          }
          .text-header h2 {
            font-size: 38px;
          }
          .ritual-card {
            padding: 24px 20px;
          }
        }
      `}</style>
    </section>
  );
}
/* ============================================================================
   PRODUCT MYTHS SECTION
   ============================================================================ */
function ProductMythsSection({ config }: { config: ProductConfig }) {
  const { folder, mythsTitle, myths } = config;
  const fewItems = myths.length <= 2;
  return (
    <section className="myths-section" aria-labelledby={`myths-title-${folder}`}>
      <div className="ambient" aria-hidden="true" />
      <div className="myths-wrapper">
        <figure className="myths-img">
          <img src={`/image/${folder}/${folder}3.jpg`} alt={`Photo ${folder}`} loading="lazy" decoding="async" />
        </figure>
        <div className="card-stack stack-1" aria-hidden="true" />
        <div className="card-stack stack-2" aria-hidden="true" />
        <article className={`myths-card ${fewItems ? "is-compact" : ""}`} role="region" aria-labelledby={`myths-title-${folder}`}>
          <span className="card-border" aria-hidden="true" />
          <h2 id={`myths-title-${folder}`} className="myths-title">
            <span className="moon" aria-hidden="true">🌙</span>
            <span>{mythsTitle}</span>
          </h2>
          <div className="myths-accordion">
            {myths.map(item => (
              <MythAccordion key={item.id} id={item.id} myth={item.myth} reality={item.reality} defaultOpen={item.id === 1} />
            ))}
          </div>
        </article>
      </div>
      <style jsx>{`
        .myths-section{position:relative;width:100%;padding:clamp(70px,8vw,110px) 20px;background:#ffffff;overflow:hidden;isolation:isolate;}
        .ambient{position:absolute;inset:-10% -10% -15% -10%;opacity:.65;background:radial-gradient(1200px 460px at 60% 85%,rgba(255,236,220,.65),transparent 70%),radial-gradient(900px 360px at 80% 30%,rgba(255,240,230,.55),transparent 70%);filter:blur(.3px);mix-blend-mode:screen;pointer-events:none;z-index:0;animation:twinkle 9s ease-in-out infinite alternate;}
        @keyframes twinkle{0%{opacity:.55;}100%{opacity:.7;}}
        .myths-wrapper{position:relative;max-width:1240px;margin:0 auto;min-height:600px;z-index:1;}
        .myths-img{position:absolute;left:0;top:50%;transform:translateY(-50%);width:360px;height:520px;border-radius:28px;overflow:hidden;border:1px solid rgba(255,255,255,.4);box-shadow:0 22px 60px rgba(0,0,0,.07),0 10px 30px rgba(0,0,0,.05),0 0 46px rgba(255,230,210,.6),0 10px 22px rgba(189,171,154,.28) inset;z-index:2;background:#000;}
        .myths-img img{width:100%;height:100%;object-fit:cover;display:block;}
        .card-stack{position:absolute;right:0;top:50%;background:linear-gradient(135deg,#f4ece2,#efe3d7);filter:blur(.2px);width:72%;height:74%;border-radius:28px;box-shadow:0 20px 50px rgba(0,0,0,.08);z-index:1;}
        .stack-1{opacity:.75;transform:translate(32px,-50%);}
        .stack-2{opacity:.48;transform:translate(60px,-48%);}
        .myths-card{position:relative;margin-left:260px;padding:54px 56px;border-radius:30px;background:rgba(255,252,248,.82);border:1.6px solid rgba(240,224,210,.9);backdrop-filter:blur(14px) saturate(140%);box-shadow:0 30px 90px rgba(0,0,0,.08),0 12px 42px rgba(0,0,0,.06),0 0 60px rgba(255,230,210,.75),0 12px 30px rgba(189,171,154,.35) inset;overflow:hidden;z-index:3;}
        .myths-card::before{content:"";position:absolute;inset:0;background:linear-gradient(to bottom,rgba(255,245,235,.55) 0%,rgba(255,253,250,0) 18%);opacity:.55;mix-blend-mode:screen;pointer-events:none;}
        .card-border{position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 36px rgba(255,236,220,.6),inset 0 2px 4px rgba(255,255,255,.9),inset 0 -2px 6px rgba(255,240,230,.55);}
        .myths-card.is-compact{padding:36px 40px;}
        .myths-title{margin:0 0 26px;font-size:28px;font-weight:800;color:#3c3631;letter-spacing:-0.02em;display:flex;align-items:center;gap:12px;text-shadow:0 1px 1px rgba(255,255,255,.8),0 0 4px rgba(255,235,220,.6);position:relative;z-index:1;}
        .moon{font-size:30px;filter:drop-shadow(0 2px 4px rgba(0,0,0,.08));}
        .myths-accordion{display:flex;flex-direction:column;gap:16px;position:relative;z-index:1;}
        @media(max-width:900px){.myths-wrapper{display:flex;flex-direction:column;gap:18px;min-height:auto;}.myths-img{position:relative;transform:none;width:100%;max-width:420px;height:420px;margin:0 auto;border-radius:24px;}.card-stack{display:none;}.myths-card{margin-left:0;margin-top:-18px;padding:34px 30px;border-radius:24px;}.myths-title{font-size:24px;margin-bottom:20px;}.moon{font-size:26px;}.myths-accordion{gap:12px;}}
        @media(min-width:1400px){.myths-img{width:400px;height:580px;}.myths-card{margin-left:300px;padding:52px 56px;}.card-stack{width:74%;height:76%;right:6px;}.myths-title{font-size:30px;}}
      `}</style>
    </section>
  );
}

/* ============================================================================
   MYTH ACCORDION ITEM
   ============================================================================ */
function MythAccordion({ id, myth, reality, defaultOpen = false }: { id: number; myth: string; reality: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : "0px"; }, [isOpen]);
  useEffect(() => { if (!ref.current || !isOpen) return; const el = ref.current; const ro = new ResizeObserver(() => { el.style.maxHeight = `${el.scrollHeight}px`; }); ro.observe(el); return () => ro.disconnect(); }, [isOpen]);
  return (
    <div className={`acc-item ${isOpen ? "open" : ""}`}>
      <button className="acc-btn" onClick={() => setIsOpen(v => !v)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsOpen(v => !v); }}} aria-expanded={isOpen} aria-controls={`reality-${id}`}>
        <span className="num" aria-hidden="true">{id}</span>
        <span className="q">{myth}</span>
        <span className={`plus ${isOpen ? "rot" : ""}`} aria-hidden="true">{isOpen ? "×" : "+"}</span>
      </button>
      <div id={`reality-${id}`} className="acc-body" ref={ref} role="region" aria-live="polite">
        <p className="a"><strong>Réalité.</strong> {reality}</p>
      </div>
      <style jsx>{`
        .acc-item{border-radius:18px;background:linear-gradient(180deg,#fffdfb 0%,#f9f4ed 100%);border:1.4px solid #e5d8c7;box-shadow:inset 0 0 12px rgba(255,237,220,.45),inset 0 1px 1px rgba(255,255,255,.6);overflow:hidden;transition:box-shadow .25s ease,border-color .25s ease,background .25s ease,transform .2s ease;}
        @media(hover:hover){.acc-item:hover{box-shadow:0 10px 30px rgba(0,0,0,.10),inset 0 0 14px rgba(255,240,225,.45);transform:translateY(-1px);}}
        .acc-item.open{background:linear-gradient(180deg,#ffffff 0%,#fdf8f3 100%);border-color:#dacbb9;box-shadow:0 10px 22px rgba(0,0,0,.07),inset 0 0 24px rgba(255,235,215,.5);}
        .acc-btn{width:100%;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;padding:18px 22px;background:transparent;border:0;cursor:pointer;text-align:left;transition:background .18s ease;}
        .acc-btn:hover{background:rgba(255,248,236,.7);}
        .acc-btn:focus-visible{outline:2px solid #ff7b42;outline-offset:-2px;border-radius:12px;}
        .num{width:34px;height:34px;display:grid;place-items:center;flex-shrink:0;color:#fff;font-weight:800;font-size:16px;border-radius:50%;background:linear-gradient(135deg,#ffb98f 0%,#ff8d58 100%);box-shadow:0 5px 18px rgba(255,135,90,.42),inset 0 1px 0 rgba(255,255,255,.45);}
        .q{font-weight:600;color:#3f372f;font-size:15.5px;line-height:1.55;letter-spacing:-0.01em;}
        .plus{font-size:22px;color:#9f9f9f;line-height:1;transition:transform .28s ease,color .2s ease;font-weight:300;}
        .plus.rot{color:#ff7b42;animation:pop .25s ease-out;}
        @keyframes pop{0%{transform:scale(.85);}60%{transform:scale(1.1);}100%{transform:scale(1);}}
        .acc-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease,transform .25s ease;background:linear-gradient(180deg,rgba(255,255,255,.65),rgba(255,252,247,.8));box-shadow:inset 0 1px 0 rgba(255,255,255,.8);opacity:0;transform:translateY(-4px);}
        .acc-item.open .acc-body{opacity:1;transform:translateY(0);}
        .a{margin:0;padding:0 22px 18px 74px;color:#6a5f57;font-size:15.3px;line-height:1.72;letter-spacing:-0.005em;text-shadow:0 1px 0 rgba(255,255,255,.6);}
        .a strong{color:#ff7b42;font-weight:600;}
        @media(max-width:640px){.acc-btn{padding:16px 18px;gap:14px;}.num{width:32px;height:32px;font-size:14px;}.q{font-size:14.5px;}.a{padding:0 18px 16px 18px;font-size:14px;}}
        @media(min-width:1024px){.acc-btn{padding:20px 24px;gap:18px;}.num{width:36px;height:36px;font-size:16px;}.q{font-size:16px;}.a{padding:4px 24px 22px 80px;font-size:15.5px;}}
        @media(prefers-reduced-motion:reduce){.acc-item,.acc-btn,.acc-body,.plus{transition:none!important;animation:none!important;}}
      `}</style>
    </div>
  );
}

/* ============================================================================
   PRODUCT FAQ SECTION
   ============================================================================ */
function ProductFAQSection({ config }: { config: ProductConfig }) {
  const { folder, faqTitle, faqSubtitle, faqs } = config;
  return (
    <section className="faq-section" aria-labelledby={`faq-title-${folder}`}>
      <div className="faq-ambient" aria-hidden="true" />
      <div className="faq-container">
        <header className="faq-header">
          <h2 id={`faq-title-${folder}`} className="faq-main-title">
            <span className="faq-icon" aria-hidden="true">💬</span>
            <span>{faqTitle}</span>
          </h2>
          <p className="faq-subtitle">{faqSubtitle}</p>
        </header>
        <div className="faq-grid">
          {faqs.map(item => <FAQItem key={item.id} id={item.id} question={item.question} answer={item.answer} defaultOpen={item.id === 1} />)}
        </div>
        <footer className="faq-footer">
          <p className="faq-footer-text">Une autre question ?{" "}<a href="/contact" className="faq-footer-link">Contactez notre équipe</a></p>
        </footer>
      </div>
      <style jsx>{`
        .faq-section{position:relative;width:100%;padding:clamp(70px,8vw,110px) 20px;background:#ffffff;overflow:hidden;isolation:isolate;}
        .faq-ambient{position:absolute;inset:-10% -10% -15% -10%;opacity:.5;background:radial-gradient(1000px 400px at 50% 90%,rgba(255,236,220,.5),transparent 65%),radial-gradient(800px 320px at 50% 10%,rgba(254,240,230,.4),transparent 65%);filter:blur(.4px);mix-blend-mode:screen;pointer-events:none;z-index:0;}
        .faq-container{position:relative;max-width:960px;margin:0 auto;z-index:1;}
        .faq-header{text-align:center;margin-bottom:clamp(40px,6vw,60px);}
        .faq-main-title{margin:0 0 12px;font-size:clamp(28px,4vw,36px);font-weight:800;color:#3c3631;letter-spacing:-0.02em;display:flex;align-items:flex-start;justify-content:center;gap:14px;text-shadow:0 1px 1px rgba(255,255,255,.8),0 0 4px rgba(255,235,220,.5);}
        .faq-icon{font-size:clamp(32px,4.5vw,40px);filter:drop-shadow(0 2px 4px rgba(0,0,0,.06));flex-shrink:0;margin-top:0.1em;}
        .faq-subtitle{margin:0;font-size:clamp(14px,1.8vw,16px);color:#6a5f57;font-weight:400;letter-spacing:.01em;}
        .faq-grid{display:grid;grid-template-columns:1fr;gap:16px;}
        @media(min-width:768px){.faq-grid{grid-template-columns:repeat(2,1fr);gap:20px;}}
        .faq-footer{margin-top:clamp(50px,7vw,70px);text-align:center;padding-top:32px;border-top:1px solid rgba(233,221,205,.6);}
        .faq-footer-text{margin:0;font-size:15px;color:#6a5f57;}
        .faq-footer-link{color:#ff7b42;font-weight:600;text-decoration:none;transition:color .2s ease;}
        .faq-footer-link:hover{color:#ff8d58;text-decoration:underline;}
      `}</style>
    </section>
  );
}

/* ============================================================================
   FAQ ITEM
   ============================================================================ */
function FAQItem({ id, question, answer, defaultOpen = false }: { id: number; question: string; answer: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = ref.current; if (!el) return; el.style.maxHeight = isOpen ? `${el.scrollHeight}px` : "0px"; }, [isOpen]);
  useEffect(() => { if (!ref.current || !isOpen) return; const el = ref.current; const ro = new ResizeObserver(() => { el.style.maxHeight = `${el.scrollHeight}px`; }); ro.observe(el); return () => ro.disconnect(); }, [isOpen]);
  return (
    <div className={`faq-item ${isOpen ? "open" : ""}`}>
      <button className="faq-btn" onClick={() => setIsOpen(v => !v)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsOpen(v => !v); }}} aria-expanded={isOpen} aria-controls={`faq-answer-${id}`}>
        <span className="faq-q">{question}</span>
        <span className={`faq-plus ${isOpen ? "rot" : ""}`} aria-hidden="true">{isOpen ? "−" : "+"}</span>
      </button>
      <div id={`faq-answer-${id}`} className="faq-body" ref={ref} role="region" aria-live="polite">
        <p className="faq-a">{answer}</p>
      </div>
      <style jsx>{`
        .faq-item{border-radius:16px;background:linear-gradient(180deg,#fffefb 0%,#faf6f0 100%);border:1.4px solid #e8dcc9;box-shadow:inset 0 0 10px rgba(255,240,228,.4),inset 0 1px 1px rgba(255,255,255,.7);overflow:hidden;transition:box-shadow .25s ease,border-color .25s ease,background .25s ease,transform .2s ease;}
        @media(hover:hover){.faq-item:hover{box-shadow:0 8px 24px rgba(0,0,0,.08),inset 0 0 12px rgba(255,240,228,.45);transform:translateY(-1px);}}
        .faq-item.open{background:linear-gradient(180deg,#ffffff 0%,#fdfaf5 100%);border-color:#dccebb;box-shadow:0 8px 20px rgba(0,0,0,.06),inset 0 0 20px rgba(255,237,218,.5);}
        .faq-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;background:transparent;border:0;cursor:pointer;text-align:left;transition:background .18s ease;}
        .faq-btn:hover{background:rgba(255,250,240,.6);}
        .faq-btn:focus-visible{outline:2px solid #ff7b42;outline-offset:-2px;border-radius:12px;}
        .faq-q{flex:1;font-weight:600;color:#3f372f;font-size:15px;line-height:1.5;letter-spacing:-0.01em;}
        .faq-plus{flex-shrink:0;width:28px;height:28px;display:grid;place-items:center;font-size:20px;color:#9f9f9f;line-height:1;transition:transform .28s ease,color .2s ease;font-weight:300;border-radius:50%;background:rgba(255,250,245,.6);}
        .faq-plus.rot{color:#ff7b42;background:rgba(255,123,66,.1);animation:popFaq .25s ease-out;}
        @keyframes popFaq{0%{transform:scale(.88);}60%{transform:scale(1.08);}100%{transform:scale(1);}}
        .faq-body{max-height:0;overflow:hidden;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease,transform .25s ease;background:linear-gradient(180deg,rgba(255,255,255,.6),rgba(255,253,248,.85));box-shadow:inset 0 1px 0 rgba(255,255,255,.75);opacity:0;transform:translateY(-4px);}
        .faq-item.open .faq-body{opacity:1;transform:translateY(0);}
        .faq-a{margin:0;padding:4px 20px 18px 20px;color:#6a5f57;font-size:14.5px;line-height:1.7;letter-spacing:-0.005em;text-shadow:0 1px 0 rgba(255,255,255,.5);}
        @media(max-width:640px){.faq-btn{padding:16px 18px;gap:12px;}.faq-q{font-size:14.5px;}.faq-plus{width:26px;height:26px;font-size:18px;}.faq-a{padding:4px 18px 16px 18px;font-size:14px;}}
        @media(min-width:1024px){.faq-btn{padding:20px 22px;}.faq-q{font-size:15.5px;}.faq-a{padding:6px 22px 20px 22px;font-size:15px;}}
        @media(prefers-reduced-motion:reduce){.faq-item,.faq-btn,.faq-body,.faq-plus{transition:none!important;animation:none!important;}}
      `}</style>
    </div>
  );
}

/* ============================================================================
   ACCORDION GÉNÉRIQUE
   ============================================================================ */
function AccordionItem({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center px-6 py-4 text-left font-medium text-neutral-900 hover:bg-neutral-50 transition-colors">
        {title}
        <span className="text-xl text-neutral-600">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-6 pb-6 pt-2 bg-white">{children}</div>}
    </div>
  );
}

/* ============================================================================
   PAGE PRODUIT
   ============================================================================ */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const subscriptionMode = searchParams.get("mode") === "subscription";

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchaseType, setPurchaseType] = useState<"unique" | "subscription">(subscriptionMode ? "subscription" : "unique");
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { if (subscriptionMode && purchaseType !== "subscription") setPurchaseType("subscription"); }, [subscriptionMode, purchaseType]);

  useEffect(() => {
    if (!id) return;
    const numericId = Number(id);
    if (!Number.isFinite(numericId) || numericId <= 0) { router.replace("/shop"); return; }
    (async () => {
      try {
        setLoading(true); setFetchError(null);
        const { data: prod, error } = await supabase.from("products").select("*").eq("id", numericId).single();
        if (error || !prod) throw error ?? new Error("Produit introuvable");
        if (!mounted.current) return;
        setProduct(prod as DbProduct);
        const { data: summary, error: sumError } = await supabase.from("reviews_summary").select("*").eq("product_id", numericId).maybeSingle();
        if (sumError) console.warn("reviews_summary error:", sumError.message);
        if (!mounted.current) return;
        setAvg(Number(summary?.rating_avg ?? 0));
        setCount(Number(summary?.reviews_count ?? 0));
      } catch (e: any) {
        console.error("Product fetch error:", e?.message ?? e);
        if (!mounted.current) return;
        setFetchError("Une erreur est survenue. Redirection vers la boutique…");
        setTimeout(() => router.replace("/shop"), 900);
      } finally { if (mounted.current) setLoading(false); }
    })();
  }, [id, router]);

  const productKey = useMemo(() => product ? getProductKey(product) : null, [product]);

  // ── Toutes les images du produit (images[] depuis DB) ──
  const productImages = useMemo(() => {
    if (!product?.images?.length) {
      return ["https://images.unsplash.com/photo-1556228852-80c63843f03c?w=800&h=800&fit=crop&auto=format&q=60"];
    }
    return product.images;
  }, [product]);

  const unitPrice  = product?.prix ?? 0;
  const subPrice   = unitPrice * 0.8;
  const priceLabel = useMemo(() => euroFmt.format(purchaseType === "subscription" ? subPrice : unitPrice), [purchaseType, subPrice, unitPrice]);
  const bgColor    = useMemo(() => { if (!product?.id) return productColors[0]; return productColors[colorIndexFromId(product.id, productColors.length)]; }, [product?.id]);

  const handleAddToCart = useCallback(() => {
    if (!product) return;
    addToCart({ id: product.id, nom: product.nom, prix: product.prix, images: product.images, purchaseType } as any, purchaseType === "subscription");
  }, [addToCart, product, purchaseType]);

  if (loading) return (
    <div className="min-h-screen bg-white pt-[73px] grid place-items-center">
      <div className="relative w-16 h-16" role="status" aria-live="polite" aria-label="Chargement…">
        <div className="absolute inset-0 border-4 border-neutral-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
  if (!product) return null;

  return (
    <main className="bg-white min-h-screen text-neutral-900 pt-[73px]">

      {subscriptionMode && (
        <div className="max-w-[1400px] mx-auto w-full px-6 pb-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Mode abonnement activé
          </div>
        </div>
      )}

      {fetchError && (
        <div className="max-w-[1400px] mx-auto w-full px-6 pb-2">
          <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">{fetchError}</div>
        </div>
      )}

      <section className="max-w-[1400px] mx-auto w-full px-6 pb-20">
        {/* ── Hero produit ── */}
        <div className="grid lg:grid-cols-2 gap-12">

          {/* ▼▼▼ GALERIE remplace l'ancienne image unique ▼▼▼ */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <ProductImageGallery images={productImages} />
          </motion.div>
          {/* ▲▲▲ FIN GALERIE ▲▲▲ */}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="space-y-5 md:space-y-6">
            <div>
              <h1 className="text-4xl md:text-[42px] font-semibold tracking-tight mb-4 text-neutral-800">{product.nom}</h1>
              {count > 0 && (
                <div className="flex items-center gap-3 text-sm text-neutral-600">
                  <RatingStars value={avg} readonly />
                  <span>({count} avis vérifiés)</span>
                </div>
              )}
            </div>

            {(product.story || product.description) && (
              <div>
                <p className="text-neutral-600 leading-relaxed text-[15px] max-w-prose">{product.story || product.description}</p>
                {productKey && PRODUCT_CONFIG[productKey] && (
                  <ProductHighlights highlights={PRODUCT_CONFIG[productKey].highlights} />
                )}
                {!productKey && (product.benefits?.length ?? 0) > 0 && (
                  <BenefitsNoMiddle benefits={product.benefits!} />
                )}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4 py-6">
              {product.gummies_per_jar && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <svg className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                  <p className="text-sm text-neutral-700">{product.gummies_per_jar} gummies/potje</p>
                </div>
              )}
              {product.flavor && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <svg className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  <p className="text-sm text-neutral-700">{product.flavor}</p>
                </div>
              )}
              {product.shipping_note && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50">
                  <svg className="w-5 h-5 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 01-1 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                  <p className="text-sm text-neutral-700">{product.shipping_note}</p>
                </div>
              )}
            </div>

            {/* ── Achat / Abonnement ── */}
            <fieldset className="space-y-3 mt-1 md:mt-2" aria-label="Type d'achat">
              {!subscriptionMode && (
                <label className={`relative flex items-center justify-between p-5 border-2 rounded-2xl transition-colors ${purchaseType === "unique" ? "border-neutral-900 bg-white shadow-lg cursor-pointer" : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white/80 cursor-pointer"}`}>
                  <div>
                    <span className="text-lg font-semibold block">Achat unique</span>
                    <span className="text-sm text-neutral-600">Commande ponctuelle</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-neutral-900">{euroFmt.format(unitPrice)}</span>
                    <input type="radio" name="purchaseType" aria-label="Achat unique" checked={purchaseType === "unique"} onChange={() => setPurchaseType("unique")} className="w-5 h-5" />
                  </div>
                </label>
              )}
              <label className={`relative flex items-center justify-between p-5 border-2 rounded-2xl cursor-pointer transition-colors ${purchaseType === "subscription" ? "border-green-500 bg-green-50 shadow-lg" : "border-neutral-200 bg-white/60 hover:border-neutral-300 hover:bg-white/80"}`}>
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">{subscriptionMode ? "Mode abonnement" : "Recommandé"}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">Abonnement</span>
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded">-20%</span>
                  </div>
                  <span className="text-sm text-neutral-600">Livraison automatique</span>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div className="leading-tight">
                    <span className="block text-sm text-neutral-400 line-through">{euroFmt.format(unitPrice)}</span>
                    <span className="block text-lg font-semibold text-green-700">{euroFmt.format(subPrice)}</span>
                  </div>
                  <input type="radio" name="purchaseType" aria-label="Abonnement" checked={purchaseType === "subscription"} onChange={() => setPurchaseType("subscription")} className="w-5 h-5" />
                </div>
              </label>
            </fieldset>

            <button onClick={handleAddToCart} className="w-full py-5 bg-gradient-to-b from-neutral-900 to-neutral-800 text-white font-semibold text-lg rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-xl" aria-live="polite">
              {subscriptionMode ? "Ajouter à ma routine" : "Ajouter au panier"} — {priceLabel}
            </button>

            {(product.ingredients?.length || product.usage_instructions) && (
              <div className="mt-10 space-y-3">
                {(product.ingredients?.length ?? 0) > 0 && (
                  <AccordionItem title="Ingrédients">
                    <ul className="flex flex-wrap gap-2">
                      {product.ingredients!.map((ing, i) => <li key={`${ing}-${i}`} className="px-4 py-2 bg-neutral-100 rounded-full text-sm text-neutral-700">{ing}</li>)}
                    </ul>
                  </AccordionItem>
                )}
                {product.usage_instructions && (
                  <AccordionItem title="Conseils d'utilisation">
                    <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{product.usage_instructions}</p>
                  </AccordionItem>
                )}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── Slider d'ingrédients ── */}
       {/* — slider d'ingrédients — */}
{productKey && (
  <IngredientsSlider productKey={productKey} />
)}

        {/* ── Sections produit ── */}
        {productKey && PRODUCT_CONFIG[productKey] && (
          <>
            <ProductRoutineSection config={PRODUCT_CONFIG[productKey]} />
            <ProductMythsSection config={PRODUCT_CONFIG[productKey]} />
            <ProductFAQSection config={PRODUCT_CONFIG[productKey]} />
          </>
        )}

        {/* ── Avis clients ── */}
        <div className="mt-20 pt-12 border-t border-neutral-300">
          <h2 className="text-3xl font-light tracking-tight mb-8 text-neutral-800">Avis clients</h2>
          <ProductReviews productId={product.id} />
        </div>
      </section>
    </main>
  );
}