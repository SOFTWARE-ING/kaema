import {
  Cable, Droplets, Layers3, Lightbulb, Paintbrush, PanelsTopLeft,
  Sun, TreePine, Wifi, Workflow, type LucideIcon,
} from "lucide-react";

export type GuideMateriau = {
  id: string;
  categorie: string;
  titre: string;
  resume: string;
  icon: LucideIcon;
  options: { nom: string; ideal: string; atout: string; vigilance: string }[];
  conseil: string;
};

export const GUIDES_MATERIAUX: GuideMateriau[] = [
  {
    id: "panneaux-mobilier",
    categorie: "Bois & panneaux",
    titre: "Panneaux et matériaux de mobilier",
    resume: "Le bon panneau dépend de l’usage, de la finition souhaitée, de l’humidité et des fixations à supporter.",
    icon: PanelsTopLeft,
    options: [
      { nom: "MDF", ideal: "Façades peintes, formes travaillées et mobilier intérieur en milieu sec.", atout: "Surface homogène, facile à usiner et à peindre.", vigilance: "Protège les chants et évite l’exposition à l’eau ; ce n’est pas un panneau structurel universel." },
      { nom: "Mélaminé", ideal: "Rangements et caissons avec une finition décorative prête à l’emploi.", atout: "Large choix de décors et entretien simple au quotidien.", vigilance: "La qualité des chants, des ferrures et des assemblages conditionne la tenue dans le temps." },
      { nom: "Contreplaqué", ideal: "Étagères, caissons ou pièces nécessitant une bonne tenue mécanique selon l’épaisseur et la qualité.", atout: "Structure en plis croisés, souvent pratique pour les assemblages.", vigilance: "Vérifie la classe d’usage, la qualité des faces et la protection des chants." },
      { nom: "Bois massif", ideal: "Plateaux, détails nobles et éléments que l’on souhaite pouvoir rénover.", atout: "Aspect vivant, réparable et durable avec une conception adaptée.", vigilance: "Le bois travaille selon l’humidité : prévois jeu, ventilation et finition d’entretien." },
    ],
    conseil: "Pour une cuisine ou une salle d’eau, demande la fiche technique du panneau et du revêtement : “résistant à l’humidité” ne signifie pas “étanche”.",
  },
  {
    id: "pvc-tasseaux-menuiserie",
    categorie: "Bois & panneaux",
    titre: "PVC, aluminium et tasseaux décoratifs",
    resume: "Pour une fenêtre, une séparation ou un habillage mural, compare l’exposition, les dimensions, l’entretien et la réparabilité.",
    icon: TreePine,
    options: [
      { nom: "PVC", ideal: "Menuiseries de dimensions compatibles avec les performances du profil et les conditions du site.", atout: "Entretien limité et profilés pouvant offrir une bonne isolation thermique.", vigilance: "Contrôle la qualité, la quincaillerie, la stabilité aux UV/chaleur et les limites dimensionnelles du fabricant." },
      { nom: "Aluminium", ideal: "Grandes ouvertures, lignes fines et usage extérieur selon le système choisi.", atout: "Rigidité, finesse des profils et bonne résistance à la corrosion avec une finition appropriée.", vigilance: "Vérifie la rupture de pont thermique si le confort thermique est recherché, ainsi que l’évacuation d’eau et la pose." },
      { nom: "Tasseaux bois", ideal: "Un accent chaleureux, une tête de lit ou un claustra intérieur.", atout: "Relief, rythme et possibilité de teinte ou de finition personnalisée.", vigilance: "Prévois un support stable, un espacement régulier, une finition adaptée et un accès pour le nettoyage." },
      { nom: "Tasseaux MDF / composite", ideal: "Un décor répétable et régulier, en intérieur sec ou dans les zones autorisées par la fiche produit.", atout: "Rendu uniforme et entretien souvent simple.", vigilance: "Ne les assimile pas à un traitement acoustique certifié ni à un matériau étanche." },
    ],
    conseil: "Sur une menuiserie extérieure, la qualité de la pose, des joints et du drainage compte autant que le matériau du profil.",
  },
  {
    id: "placo-platre-staff",
    categorie: "Plafonds & cloisons",
    titre: "Placo, plâtre et staff : quelles différences ?",
    resume: "Ces solutions n’ont pas le même rôle : cloisonner, lisser, créer un décor ou gérer une zone exposée à l’humidité.",
    icon: Layers3,
    options: [
      { nom: "Plaque de plâtre (placo)", ideal: "Cloisons et plafonds intérieurs secs, avec ossature adaptée.", atout: "Chantier rapide, surface régulière, passage possible des réseaux et intégration de l’isolation.", vigilance: "Choisis le type de plaque et les renforts selon l’usage ; une plaque hydrofuge n’est pas une étanchéité à elle seule." },
      { nom: "Enduit de plâtre", ideal: "Rattraper ou lisser un support intérieur compatible.", atout: "Finition continue et rendu lisse.", vigilance: "Le support doit être sain et sec ; respecte les conditions de mise en œuvre et le temps de séchage." },
      { nom: "Staff", ideal: "Moulures, corniches, rosaces, corniches lumineuses et éléments décoratifs en plâtre.", atout: "Permet des formes et détails décoratifs sur mesure.", vigilance: "Ce n’est pas un élément porteur : fixation et support doivent être dimensionnés pour le poids de la pièce." },
      { nom: "Panneau cimentaire", ideal: "Certains supports de zones humides ou carrelées, lorsque le système fabricant le prévoit.", atout: "Alternative robuste à la plaque de plâtre dans des usages définis.", vigilance: "Le panneau seul ne remplace ni l’étanchéité, ni les joints et accessoires prévus par le système." },
    ],
    conseil: "Dans une douche, autour d’un point d’eau ou sous un plafond technique, définis d’abord l’exposition, la ventilation, les charges et le système complet avant de choisir la plaque.",
  },
  {
    id: "peinture-enduits",
    categorie: "Finitions",
    titre: "Peintures, enduits et préparation des supports",
    resume: "Une belle peinture commence par un support propre, sec et stable ; la finition se choisit selon la pièce et l’entretien attendu.",
    icon: Paintbrush,
    options: [
      { nom: "Peinture à l’eau (acrylique)", ideal: "Murs et plafonds intérieurs dans la majorité des pièces, selon la fiche produit.", atout: "Application pratique et séchage généralement rapide.", vigilance: "Regarde le pouvoir couvrant, la lavabilité, le support compatible et les émissions indiquées." },
      { nom: "Mat, velours ou satiné", ideal: "Mat pour atténuer les petites irrégularités ; velours comme compromis ; satiné pour des surfaces plus sollicitées si le produit le permet.", atout: "Permet d’ajuster le rendu visuel et l’entretien.", vigilance: "Les finitions plus brillantes révèlent davantage les défauts : préparation et lumière rasante sont à anticiper." },
      { nom: "Peinture de façade", ideal: "Murs extérieurs avec un produit conçu pour le support et les conditions climatiques locales.", atout: "Formulation adaptée aux intempéries et à l’exposition extérieure.", vigilance: "Traite d’abord les infiltrations, sels, fissures et humidité ; une couche de peinture ne répare pas la cause." },
      { nom: "Enduit décoratif", ideal: "Créer une texture, un effet matière ou une finition minérale selon le produit.", atout: "Aspect personnalisé et profondeur visuelle.", vigilance: "Demande un échantillon sur le support réel et vérifie l’entretien ainsi que la réparabilité." },
    ],
    conseil: "Demande toujours la fiche technique, les conditions d’application, le rendement indicatif et le temps de séchage ; ne peins pas un support humide ou farineux.",
  },
  {
    id: "eclairage",
    categorie: "Électricité & éclairage",
    titre: "Éclairages : choisir la bonne lumière",
    resume: "Pense d’abord à l’usage et au confort visuel, puis choisis flux lumineux, teinte, rendu des couleurs et protection adaptés.",
    icon: Lightbulb,
    options: [
      { nom: "Éclairage général", ideal: "Donner une lumière homogène pour circuler et vivre dans la pièce.", atout: "Base confortable si le flux et la répartition sont bien étudiés.", vigilance: "La puissance en watts seule ne dit pas la quantité de lumière : compare les lumens et l’optique." },
      { nom: "Éclairage de tâche", ideal: "Plans de travail, lecture, miroir ou bureau.", atout: "Concentre la lumière là où une activité précise le demande.", vigilance: "Évite l’éblouissement, les ombres portées et les reflets sur les écrans ou plans brillants." },
      { nom: "Éclairage d’accent", ideal: "Mettre en valeur une œuvre, une texture, une niche ou un élément architectural.", atout: "Ajoute du relief et crée plusieurs ambiances.", vigilance: "Prévois l’orientation, l’accès à la maintenance et la dissipation thermique des appareils encastrés." },
      { nom: "LED et température de couleur", ideal: "La plupart des usages où l’efficacité et la durée de vie sont prioritaires.", atout: "Les LED consomment généralement moins que les technologies anciennes pour un flux comparable.", vigilance: "Compare lumens, kelvins, indice de rendu des couleurs, compatibilité variateur et garantie." },
    ],
    conseil: "Une lumière chaude est souvent appréciée dans les espaces de détente, une lumière plus neutre pour les tâches ; fais un essai à l’échelle réelle. En zone humide, l’indice IP doit correspondre à l’emplacement.",
  },
  {
    id: "installation-electrique",
    categorie: "Électricité & éclairage",
    titre: "Installation électrique et protections",
    resume: "Une installation se conçoit à partir des usages et des charges ; les protections et sections ne se choisissent pas au hasard.",
    icon: Cable,
    options: [
      { nom: "Circuits dédiés", ideal: "Équipements puissants ou usages nécessitant un circuit indépendant selon les règles applicables.", atout: "Aide à organiser les charges et facilite le diagnostic.", vigilance: "Le nombre de circuits, les conducteurs et les protections doivent être calculés par un professionnel qualifié." },
      { nom: "Disjoncteurs et protection différentielle", ideal: "Protéger l’installation contre les défauts selon le schéma et les textes locaux applicables.", atout: "Réduit certains risques électriques quand les dispositifs sont correctement choisis et raccordés.", vigilance: "Le calibre et le type dépendent du circuit, de la charge, du réseau et de la coordination des protections." },
      { nom: "Mise à la terre et parafoudre", ideal: "À intégrer à la conception selon le réseau, le site, les équipements et l’exposition aux surtensions.", atout: "Élément important de sécurité et de protection des appareils.", vigilance: "Un contrôle et une mesure par un électricien sont nécessaires ; ne substitue pas un appareil à une terre conforme." },
    ],
    conseil: "Ne dimensionne pas un câble ou un disjoncteur à partir d’un tableau générique trouvé en ligne : fais vérifier puissance, longueur, mode de pose, température, terre et exigences locales par un électricien qualifié.",
  },
  {
    id: "reseaux-securite",
    categorie: "Réseaux & sécurité",
    titre: "Réseaux, vidéosurveillance et contrôle d’accès",
    resume: "La fiabilité dépend du câblage, de l’alimentation, de la couverture radio, de la configuration et de la sécurité numérique.",
    icon: Wifi,
    options: [
      { nom: "Cuivre Ethernet", ideal: "Relier les équipements proches : ordinateurs, points d’accès, téléphones IP et caméras compatibles.", atout: "Connexion stable ; certains équipements peuvent être alimentés par PoE si les appareils sont compatibles.", vigilance: "Vérifie catégorie, longueur, environnement, connecteurs et budget d’alimentation PoE ; sépare les câbles de puissance selon les règles." },
      { nom: "Fibre optique", ideal: "Liaisons longues, interconnexion de bâtiments ou environnements sensibles aux perturbations électromagnétiques.", atout: "Grande capacité et isolation électrique entre les extrémités.", vigilance: "Prévois modules optiques compatibles, rayon de courbure, protection mécanique et compétences de raccordement." },
      { nom: "Wi‑Fi et points d’accès", ideal: "Appareils mobiles et zones où tirer un câble est difficile.", atout: "Installation flexible et couverture évolutive.", vigilance: "La portée dépend des murs, des interférences et de la position ; un site survey peut éviter les zones mortes." },
      { nom: "Caméras, alarmes et accès", ideal: "Surveiller des accès ou recevoir des alertes selon un besoin clairement défini.", atout: "Les systèmes intégrés peuvent faciliter la supervision.", vigilance: "Sécurise les comptes, change les mots de passe par défaut, mets à jour les équipements et respecte la vie privée et les règles locales." },
    ],
    conseil: "Pour une installation durable, prévois chemins de câbles, baie ventilée, étiquetage, alimentation secourue si nécessaire et séparation logique des équipements connectés.",
  },
  {
    id: "solaire",
    categorie: "Énergie solaire",
    titre: "Solaire : panneaux, onduleur et batteries",
    resume: "Une installation solaire est un système complet : les panneaux seuls ne garantissent pas l’alimentation souhaitée.",
    icon: Sun,
    options: [
      { nom: "Panneaux photovoltaïques", ideal: "Produire de l’électricité à partir de l’ensoleillement disponible sur le site.", atout: "Système modulaire pouvant être dimensionné selon les besoins et l’espace.", vigilance: "Étudie ombrage, orientation, structure de toiture, ventilation, câblage, garantie et conditions du fabricant." },
      { nom: "Onduleur", ideal: "Convertir et gérer l’énergie selon le type de système et les appareils à alimenter.", atout: "Les solutions diffèrent selon le raccordement, les charges et les besoins de secours.", vigilance: "Vérifie compatibilité panneaux/batteries, puissance de démarrage, protections, qualité réseau et disponibilité du SAV." },
      { nom: "Batterie", ideal: "Stocker de l’énergie lorsque l’autonomie pendant les coupures ou la nuit est nécessaire.", atout: "Peut fournir une réserve selon sa capacité utile et la puissance délivrable.", vigilance: "Le besoin dépend du profil horaire, de la profondeur d’usage autorisée, de la température, de la durée de vie et du budget." },
      { nom: "Système hybride ou sans batterie", ideal: "Le choix dépend du réseau disponible, des coupures, du budget et des règles de raccordement.", atout: "Permet d’adapter le système à un besoin réel plutôt que d’ajouter des composants systématiquement.", vigilance: "Le dimensionnement et les protections doivent être validés par un installateur solaire qualifié." },
    ],
    conseil: "Commence par relever les appareils, leur puissance et leurs heures d’utilisation, puis précise l’autonomie souhaitée. Le dimensionnement doit aussi considérer les pointes de démarrage, l’ensoleillement, la structure et les protections.",
  },
  {
    id: "plomberie",
    categorie: "Plomberie & eau",
    titre: "Tuyaux et équipements de plomberie",
    resume: "Alimentation sous pression et évacuation ne demandent pas les mêmes produits : utilise un système certifié pour chaque usage.",
    icon: Droplets,
    options: [
      { nom: "PPR / PP‑R", ideal: "Réseaux d’eau chaude ou froide lorsque le système et ses raccords sont prévus pour cet usage.", atout: "Assemblages par thermofusion dans les systèmes compatibles.", vigilance: "La qualité de soudure, la dilatation, le support et les pressions/températures admissibles sont déterminants." },
      { nom: "PEX", ideal: "Distribution d’eau avec raccords et collecteurs compatibles avec le système choisi.", atout: "Flexible et pratique pour certains parcours avec moins de raccords intermédiaires.", vigilance: "Vérifie protection UV, rayons de courbure, raccords et recommandations de pose." },
      { nom: "PVC évacuation", ideal: "Évacuation gravitaire si le diamètre, la pente et les raccords conviennent au débit.", atout: "Léger, courant et facile à assembler avec les accessoires adaptés.", vigilance: "Ce n’est pas un substitut à une conduite sous pression ; prévois accès de visite et limitation des bruits." },
    ],
    conseil: "Fais tester les réseaux avant de fermer les cloisons et garde des accès aux organes qui peuvent nécessiter une maintenance.",
  },
  {
    id: "sols-revetements",
    categorie: "Sols & revêtements",
    titre: "Carrelage, pierre et revêtements de sol",
    resume: "Le choix d’un sol doit tenir compte de l’usage, de l’eau, du glissement, du support, des joints et de l’entretien.",
    icon: PanelsTopLeft,
    options: [
      { nom: "Grès cérame", ideal: "Sols et murs intérieurs ou extérieurs si les caractéristiques du produit conviennent à la zone.", atout: "Large choix de formats et finitions, entretien généralement simple.", vigilance: "Vérifie l’adhérence en zone humide, la résistance adaptée à l’usage, le calibre et le support." },
      { nom: "Faïence", ideal: "Revêtement mural décoratif, particulièrement courant en cuisine et salle d’eau.", atout: "Nombreux formats, couleurs et décors.", vigilance: "Elle n’est généralement pas conçue comme revêtement de sol ; l’étanchéité se traite sous le carrelage selon le système." },
      { nom: "Pierre naturelle", ideal: "Créer un rendu authentique et unique lorsque l’entretien est accepté.", atout: "Variations naturelles et possibilité de rénovation selon la pierre.", vigilance: "Porosité, sensibilité aux produits, traitement et homogénéité varient : exige les conseils du fournisseur." },
    ],
    conseil: "Avant la pose, contrôle planéité, humidité et stabilité du support, prévois joints de mouvement si requis et commande une quantité permettant les découpes et remplacements.",
  },
  {
    id: "logiciels",
    categorie: "Outils & logiciels",
    titre: "Logiciels : choisir l’outil adapté au projet",
    resume: "L’outil doit résoudre un problème concret et être maintenable : une solution sur mesure n’est pas toujours nécessaire.",
    icon: Workflow,
    options: [
      { nom: "CAO / dessin 2D", ideal: "Plans, détails, métrés et documents de chantier simples.", atout: "Rapide pour structurer et partager des plans techniques.", vigilance: "Définis le format d’échange, les versions et qui valide les plans avant exécution." },
      { nom: "BIM / maquette 3D", ideal: "Projets multi-métiers où la coordination et les quantités doivent être mieux suivies.", atout: "Centralise des informations et facilite la détection de certains conflits.", vigilance: "Nécessite une méthode, des compétences, une convention de nommage et une responsabilité de mise à jour." },
      { nom: "Solution existante", ideal: "Devis, comptabilité, stock ou gestion standard lorsqu’un outil fiable couvre déjà le besoin.", atout: "Mise en route plus rapide et maintenance assurée par l’éditeur.", vigilance: "Évalue coût récurrent, export des données, support, accès et conditions de sauvegarde." },
      { nom: "Logiciel sur mesure", ideal: "Processus métier distinctif que les solutions existantes gèrent mal.", atout: "Peut coller aux étapes et aux rôles de l’équipe.", vigilance: "Écris le besoin et les critères d’acceptation ; prévois sécurité, sauvegardes, maintenance, documentation et propriété des données." },
    ],
    conseil: "Commence par cartographier le processus et tester une solution existante. Si le sur-mesure se justifie, définis qui héberge, maintient, sauvegarde et peut récupérer les données.",
  },
];

export const SOURCES_GUIDE = [
  {
    nom: "U.S. Department of Energy — technologie photovoltaïque",
    url: "https://www.energy.gov/eere/solar/solar-photovoltaic-technology-basics",
  },
  {
    nom: "U.S. Department of Energy — conception d’un système photovoltaïque",
    url: "https://www.energy.gov/eere/solar/solar-photovoltaic-system-design-basics",
  },
  {
    nom: "USG — documentation technique, systèmes et guides de pose",
    url: "https://www.usg.com/content/usgcom/en/resource-center/technical-documentation.html",
  },
];
