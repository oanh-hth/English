# Capstone: make Threadwork yours

All tests pass, so every piece works. The capstone has no tests: you decide when each item is done. Tick a box (`[x]`) when it is, and `npm run progress` counts it.

## Run it for real
- [ ] `npm run dev`, create an account, add tasks, finish some, and watch the plant grow
- [ ] Sign in on a second browser (or the iPad on the same Wi-Fi: `npm run dev -- --host`, then open your computer's IP on port 5173) and see the same data
- [ ] Edit on both while one is offline, then resolve the conflict banner
- [ ] Build and run one server for everything: `npm run build && npm start`, then open http://localhost:3001

## Bring back features from the prototype
- [ ] Notes and drafts attached to tasks (new type, reducer actions, a component, tests)
- [ ] Resources list with "used" checkboxes in the drawer (use `setResourceUsed` from 1.3)
- [ ] Save sketches and attach them to tasks (store the SVG path strings in the state)
- [ ] Treat shop on the garden card (use `claimTreat` and `affordable` from 2.3)
- [ ] Badge toast when `newBadges` (2.4) finds something new
- [ ] Animated plant: sway, watering can, sky that follows the weather (see `threadwork/js/plant.js` in this repository)
- [ ] Link map: draw tasks and their links as a graph in SVG

## Quality
- [ ] Write tests for every new feature (at least one per reducer action and component)
- [ ] `npm run typecheck` passes with no errors
- [ ] Check it with VoiceOver on the iPad (Settings → Accessibility → VoiceOver)
- [ ] Add it to the iPad home screen (Share → Add to Home Screen) and use it for a week
