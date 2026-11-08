/* Cozy Hook Nook: tips library.
   Each tip: { id, title, cat, level, summary, steps[], note?, chart? }
   `chart` is the id of a starter template the tip can open in the editor. */
window.TIPS = [
  {
    id: 'leaf-point', cat: 'Shaping', level: 'Easy', chart: 'leaf',
    title: 'A crisp, sharp point on a leaf',
    summary: 'Get the tip of a leaf to come to a real point instead of a rounded nub.',
    steps: [
      'Build a staircase up each side: slip stitch → sc → hdc → dc → tr. Every stitch is a little taller than the one before, so the edge slants toward the tip.',
      'Turn the corner with a fan: work 3–5 stitches (a shell) into the very last chain or stitch. They all share one hole, which pulls the tip into a point.',
      'Drop a stitch marker into the middle stitch of the fan so you can always find the tip.',
      'Come back down the other side as a mirror image: tr → dc → hdc → sc → slip stitch, so both sides match.',
      'Want it even sharper? Finish the tip with a picot: ch 3, then slip stitch into the first chain you made.'
    ],
    note: 'Use a hook one size smaller for the tip stitches to keep the point tight. Pin only the tip out when you block it.'
  },
  {
    id: 'round-petal', cat: 'Shaping', level: 'Easy',
    title: 'A soft, rounded petal',
    summary: 'The opposite of a pointed leaf: a petal with a smooth, round top.',
    steps: [
      'Work all the stitches for the top of the petal into the same stitch: 5–7 dc in one stitch makes a gentle round.',
      'Keep the sides short: sc → hdc on the way up and hdc → sc on the way down.',
      'Finish with a slip stitch into the base so the petal sits flat.'
    ]
  },
  {
    id: 'flat-circle', cat: 'Shaping', level: 'Beginner', chart: 'circle',
    title: 'The 6-per-round circle rule',
    summary: 'A flat circle is just six increases spread evenly in every round.',
    steps: [
      'Round 1: 6 sc into a magic ring (6).',
      'Round 2: increase in every stitch (12).',
      'Round 3: (sc, inc) × 6 (18). Round 4: (2 sc, inc) × 6 (24). Keep adding one more plain sc before each increase.',
      'Ruffling edge? You added too many increases. Cupping into a bowl? Too few.'
    ],
    note: 'Stagger the increases so they do not stack up in the same spot. A hexagon shape means they line up.'
  },
  {
    id: 'square-corners', cat: 'Shaping', level: 'Easy',
    title: 'Sharp square corners',
    summary: 'Make corners that actually look square.',
    steps: [
      'Work 3 stitches, chain 2, then 3 stitches all into the same corner space.',
      'The chain-2 is the "elbow": it gives the corner room to turn without pulling.',
      'On the next round, work into the chain space again, not into the stitches beside it.'
    ]
  },
  {
    id: 'magic-ring', cat: 'Amigurumi', level: 'Beginner',
    title: 'Magic ring with no hole',
    summary: 'Start in the round with a closable loop.',
    steps: [
      'Wrap the yarn twice around two fingers and pull a loop of the working yarn through, then chain 1 to lock it.',
      'Work your first round right over both strands of the ring.',
      'Pull the tail firmly to close the center. Tug each strand separately to see which one closes the ring.',
      'Weave the tail in on the back, crossing over a few stitches so it cannot slip.'
    ]
  },
  {
    id: 'invisible-dec', cat: 'Amigurumi', level: 'Easy',
    title: 'Invisible decrease',
    summary: 'Shrink your work with no little holes showing.',
    steps: [
      'Insert the hook into the front loop only of the next stitch, then the front loop only of the following stitch.',
      'Yarn over and pull through both front loops (3 loops on hook).',
      'Yarn over and pull through all 3 loops.'
    ],
    note: 'Works best with sc. It sits neatly on the surface, so the fabric looks like it simply got smaller.'
  },
  {
    id: 'tight-ami', cat: 'Amigurumi', level: 'Beginner',
    title: 'Tight stitches so stuffing does not peek through',
    summary: 'Dense fabric for toys and little creatures.',
    steps: [
      'Go down one or two hook sizes from what the yarn label says.',
      'Work in a continuous spiral and mark the first stitch of each round.',
      'Stuff in small, firm pieces as you go, before the opening gets too small.',
      'Close the last round by threading the tail through the front loops and pulling snug.'
    ]
  },
  {
    id: 'count-stitches', cat: 'Basics', level: 'Beginner',
    title: 'Count every row (it saves hours)',
    summary: 'Catch a wandering stitch count before it becomes a wonky shape.',
    steps: [
      'Count at the end of each row, and check against the number in the pattern.',
      'Put a stitch marker in the first stitch of every row or round.',
      'In this app, the count at the end of each row is calculated for you. If your own count differs, one of the chips is wrong.'
    ]
  },
  {
    id: 'turning-chains', cat: 'Basics', level: 'Beginner',
    title: 'Turning chains cheat sheet',
    summary: 'How many to chain at the start of a row, and whether it counts.',
    steps: [
      'sc: ch 1 (usually does not count as a stitch).',
      'hdc: ch 2 (often counts as the first stitch, check your pattern).',
      'dc: ch 3 (counts as the first stitch). tr: ch 4 (counts).',
      'If it counts, remember to work the last stitch of the row into the top of the turning chain.'
    ],
    note: 'In the stitch library, "Turning chain" is a special chain that adds nothing to the row count.'
  },
  {
    id: 'straight-edges', cat: 'Edges', level: 'Beginner',
    title: 'Keep edges straight',
    summary: 'Why work gets wider or narrower, and how to fix it.',
    steps: [
      'Growing? You probably worked an extra stitch at the start or end. Count the first and last stitches.',
      'Shrinking? You skipped the last stitch, often the top of the turning chain.',
      'Place a marker in the first and last stitch of each row so you can see them.'
    ]
  },
  {
    id: 'stop-curl', cat: 'Edges', level: 'Easy',
    title: 'Stop edges from curling',
    summary: 'Flat pieces like coasters and swatches that want to roll.',
    steps: [
      'Border the piece with one round of sc, working 3 sc in each corner.',
      'Use a slightly larger hook for the body of the piece.',
      'Block it: dampen, pat flat, pin out, and let it dry fully.'
    ]
  },
  {
    id: 'loose-foundation', cat: 'Basics', level: 'Beginner',
    title: 'A foundation chain that is not too tight',
    summary: 'A tight start makes the bottom edge pucker.',
    steps: [
      'Chain with a hook one or two sizes larger than the rest of the project.',
      'Count the chains before you start the first row.',
      'Relax your hand: chains should slide easily on the hook.'
    ]
  },
  {
    id: 'colour-change', cat: 'Color & yarn', level: 'Easy',
    title: 'Clean color changes',
    summary: 'Switch yarn without a messy bump.',
    steps: [
      'Work the last stitch of the old color until two loops remain on the hook.',
      'Pick up the new color and pull it through those two loops to finish the stitch.',
      'Carry on with the new color. Leave a 10 cm (4 in) tail to weave in.'
    ],
    note: 'In the chart editor, tap a color dot on a row to see the change in the preview.'
  },
  {
    id: 'join-yarn', cat: 'Color & yarn', level: 'Beginner',
    title: 'Join a new ball invisibly',
    summary: 'Run out of yarn halfway through a row? No knots needed.',
    steps: [
      'Change at the end of a row when you can, so the tails land on the edge.',
      'Otherwise, complete the last stitch with the new strand as in a color change.',
      'Hold both tails along the top and crochet over them for a few stitches.'
    ]
  },
  {
    id: 'weave-ends', cat: 'Finishing', level: 'Beginner',
    title: 'Weaving in ends so they stay',
    summary: 'No more tails working their way out.',
    steps: [
      'Use a tapestry needle and weave along the stitches for about 5 cm (2 in).',
      'Change direction and weave back, going through a different set of stitches.',
      'Stretch the fabric gently, then snip the tail close to the work.'
    ]
  },
  {
    id: 'blocking', cat: 'Finishing', level: 'Easy',
    title: 'Blocking for crisp shapes',
    summary: 'The finishing touch that makes leaves, flowers and squares look professional.',
    steps: [
      'Wet the piece or mist it generously, then pat it flat in a towel.',
      'Pin it into shape, tips and corners first.',
      'Let it dry completely. For acrylic yarn, do not press with a hot iron: it can melt.'
    ]
  },
  {
    id: 'gauge', cat: 'Basics', level: 'Beginner', chart: 'swatch',
    title: 'Make a gauge swatch',
    summary: 'A small test square tells you if your project will come out the right size.',
    steps: [
      'Crochet a swatch about 15 cm (6 in) square using the stitch of the pattern.',
      'Measure the stitches and rows in 10 cm (4 in) across the middle.',
      'Too many stitches? Go up a hook size. Too few? Go down.'
    ]
  },
  {
    id: 'puff-bobble-pop', cat: 'Texture', level: 'Intermediate',
    title: 'Puff vs bobble vs popcorn',
    summary: 'Three bumpy stitches that are easy to mix up.',
    steps: [
      'Puff: several half-double loops pulled up on the hook, then closed with one pull-through. Soft and rounded.',
      'Bobble: several unfinished double crochets in one stitch, closed together. Firm, pops out of the fabric.',
      'Popcorn: a group of full stitches in one place, folded forward and secured with a pull-through. The most prominent.',
      'Pull up each loop to the same height to get an even look.'
    ]
  },
  {
    id: 'post-stitches', cat: 'Texture', level: 'Intermediate',
    title: 'Front and back post stitches',
    summary: 'Ribbing and cables come from working around the post.',
    steps: [
      'Front post: insert the hook from front to back to front around the post of the stitch below.',
      'Back post: go from back to front to back around the post.',
      'Alternate FPdc and BPdc across a row for a stretchy ribbing.'
    ]
  },
  {
    id: 'reading-charts', cat: 'Chart reading', level: 'Beginner',
    title: 'How to read a crochet chart',
    summary: 'Every stitch has a symbol. Once you learn them the chart tells all.',
    steps: [
      'Flat work: row 1 is at the bottom and read from right to left, then row 2 from left to right. The arrows next to each row show the direction.',
      'Working in the round: round 1 is at the center, and you work counter-clockwise (for right-handed crocheters).',
      'The symbol shows the stitch height: the more slashes on the stem, the taller the stitch.',
      'Two lines coming out of one point = increase. Two lines meeting at the top = decrease.'
    ],
    note: 'Use the scrubber under the preview to watch a chart build row by row.'
  },
  {
    id: 'frogging', cat: 'Fixes', level: 'Beginner',
    title: 'Unravel (frog) without fear',
    summary: 'Ripping back is a normal part of making.',
    steps: [
      'Remove the hook and gently pull the working yarn, one stitch at a time.',
      'Pull gently so the yarn does not split. Stop one stitch before the mistake.',
      'Put the loop back on the hook and carry on. If the yarn kinked, steam it straight.'
    ]
  }
];
