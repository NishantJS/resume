export interface GameMeta {
  /** URL slug — matches the lazy chunk folder name. */
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Pastel card background — same palette family as project cards. */
  color: string;
  /** Inline SVG-style emoji or short label rendered on the card. */
  badge: string;
  /** Whether the game is shipped / playable. */
  status: "playable" | "soon";
}

export const games: GameMeta[] = [
  {
    slug: "parking-escape",
    title: "Parking Escape",
    tagline: "Tap. Slide. Clear the lot.",
    description:
      "A polished grid-based parking puzzle. Every vehicle drives in one direction — tap it to slide until it's blocked or escapes the lot. Clear every car to win.",
    color: "#fde68a",
    badge: "PE",
    status: "playable",
  },
  {
    slug: "tic-tac-toe",
    title: "Tic-Tac-Toe",
    tagline: "Three in a row. Beat the bot.",
    description:
      "The classic, polished. Play a friend on the same screen or face an AI with three difficulties — the hardest one runs full minimax and never loses. Scores persist across sessions.",
    color: "#ddd6fe",
    badge: "XO",
    status: "playable",
  },
  {
    slug: "block-breaker",
    title: "Block Breaker",
    tagline: "Bounce. Smash. Clear every brick.",
    description:
      "A neon take on the arcade brick-breaker. Steer the paddle with mouse, touch or arrow keys across escalating levels of bricks — some take more than one hit. Your high score is saved.",
    color: "#bbf7d0",
    badge: "BB",
    status: "playable",
  },
  {
    slug: "2048",
    title: "2048",
    tagline: "Swipe. Merge. Reach 2048.",
    description:
      "Slide the grid with swipes or arrow keys; equal tiles merge and double. Keep combining to hit the 2048 tile — then push for an even higher score. Your best is saved.",
    color: "#fdba74",
    badge: "2K",
    status: "playable",
  },
  {
    slug: "memory",
    title: "Memory Match",
    tagline: "Flip. Remember. Pair them up.",
    description:
      "Flip cards two at a time and find every matching pair in as few moves as possible. A quick test of memory with a satisfying flip — your best score sticks around.",
    color: "#f9a8d4",
    badge: "MM",
    status: "playable",
  },
  {
    slug: "snake",
    title: "Snake",
    tagline: "Eat. Grow. Don't bite yourself.",
    description:
      "The timeless classic. Steer the snake to the food with swipes or arrow keys, growing longer each bite — but one wall or tail and it's over. Chase your high score.",
    color: "#5eead4",
    badge: "SN",
    status: "playable",
  },
  {
    slug: "simon",
    title: "Simon",
    tagline: "Watch. Repeat. Go one more.",
    description:
      "Watch the pattern light up, then play it back. Each round adds another step — how long a sequence can you remember? Sound and colour, with your best round saved.",
    color: "#fca5a5",
    badge: "SI",
    status: "playable",
  },
  {
    slug: "whack-a-mole",
    title: "Whack-a-Mole",
    tagline: "Bonk every mole before time's up.",
    description:
      "Moles pop up across the board — tap them before they duck back down. They appear faster and faster, so keep your eyes everywhere. Beat the clock and your high score.",
    color: "#fcd34d",
    badge: "WM",
    status: "playable",
  },
  {
    slug: "lights-out",
    title: "Lights Out",
    tagline: "Flip every light off.",
    description:
      "A pure logic puzzle. Each tap toggles a light and its neighbours — work out the order that switches the whole grid off in as few moves as possible.",
    color: "#93c5fd",
    badge: "LO",
    status: "playable",
  },
  {
    slug: "sliding-puzzle",
    title: "Sliding Puzzle",
    tagline: "Slide the tiles back in order.",
    description:
      "The classic 15-puzzle. Slide tiles into the empty space — with clicks or swipes — until the numbers run 1 to 15 in order. Race for the fewest moves.",
    color: "#a7f3d0",
    badge: "15",
    status: "playable",
  },
];
