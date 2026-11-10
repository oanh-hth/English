/* Daily-life vocabulary, part 1. Line format: word | part of speech | meaning | example sentence */
window.VOCAB = [];
const VSEEN = new Set(); // a word appears only once, in the first topic that lists it
function addV(key, group, icon, name, text) {
  const words = text.trim().split('\n').map(l => l.split(' | ').map(s => s.trim())).filter(r => r.length === 4)
    .filter(r => { const k = r[0].toLowerCase(); if (VSEEN.has(k)) return false; VSEEN.add(k); return true; });
  VOCAB.push({ key, group, icon, name, words });
}

addV('v-home', 'Home & daily life', '🏠', 'Home & furniture', `
couch | n | a long soft seat for several people (also: sofa) | We watched a movie on the couch.
armchair | n | a comfortable chair with arms | He fell asleep in the armchair.
shelf | n | a flat board on a wall for holding things | Put the books on the shelf.
drawer | n | a box that slides in and out of a desk or dresser | The keys are in the top drawer.
closet | n | a small room or cupboard for clothes (US) | Hang your coat in the closet.
wardrobe | n | a tall cupboard for clothes; also your set of clothes | She bought a new wardrobe for work.
mattress | n | the soft part of a bed you lie on | We need a firmer mattress.
pillow | n | a soft cushion for your head in bed | Can I have an extra pillow?
blanket | n | a thick cover for warmth | It's cold, so grab a blanket.
curtain | n | cloth that hangs over a window | Close the curtains, please.
carpet | n | thick covering for a floor | The carpet needs cleaning.
rug | n | a small carpet | There's a rug under the table.
staircase | n | steps going up or down inside a building | The staircase creaks at night.
basement | n | a floor of a building below the ground | The washing machine is in the basement.
attic | n | a space under the roof | We keep old boxes in the attic.
garage | n | a building or room for a car | He parked in the garage.
backyard | n | a yard behind a house | The kids are playing in the backyard.
porch | n | a covered entrance or platform at the front of a house | We sat on the porch and talked.
fence | n | a barrier around a yard | The dog jumped over the fence.
doorbell | n | a button you press to ring at a door | Someone rang the doorbell.
lock | n/v | a device that keeps a door shut; to secure with a key | Did you lock the door?
key | n | a metal object that opens a lock | I lost my house key.
light bulb | n | the glass part of a lamp that makes light | The light bulb burned out.
switch | n/v | a button for turning lights on or off; to change | Flip the switch.
outlet | n | a wall socket for plugs (US) | I need an outlet for my charger.
heater | n | a machine that warms a room | Turn on the heater.
air conditioner | n | a machine that cools a room (A/C) | The air conditioner is broken.
trash can | n | a container for garbage | Put it in the trash can.
broom | n | a tool for sweeping floors | Grab the broom.
mop | n/v | a tool for washing floors; to wash a floor | Mop the kitchen floor.
laundry | n | clothes that need washing, or the washing itself | I have a pile of laundry.
chore | n | a regular task around the house | Washing dishes is my chore.
landlord | n | a person who owns a rented property | My landlord raised the rent.
roommate | n | a person you share a home with | My roommate is moving out.
neighbor | n | a person who lives near you | Our neighbors are very friendly.
`);

addV('v-kitchen', 'Home & daily life', '🍳', 'Kitchen & cooking', `
fridge | n | a cold appliance for keeping food fresh (refrigerator) | The milk is in the fridge.
freezer | n | a very cold compartment for freezing food | Put the ice cream in the freezer.
stove | n | a cooking surface with burners | Don't leave the stove on.
oven | n | an enclosed space for baking | Preheat the oven to 350.
microwave | n/v | an oven that heats food quickly | Microwave it for two minutes.
pan | n | a flat cooking pot with a handle | Heat some oil in the pan.
pot | n | a deep round cooking container | Boil water in a large pot.
knife | n | a sharp tool for cutting | Be careful with that knife.
spoon | n | a tool for eating soup or stirring | Pass me a spoon.
fork | n | a tool with points for eating | I need a clean fork.
plate | n | a flat dish for food | Put the pasta on a plate.
bowl | n | a deep round dish | A bowl of cereal, please.
mug | n | a large cup with a handle | She poured coffee into a mug.
recipe | n | instructions for cooking a dish | Do you have the recipe?
ingredient | n | one of the foods used to make a dish | We're missing one ingredient.
chop | v | to cut into small pieces | Chop the onions finely.
slice | v/n | to cut into thin pieces; a thin piece | Slice the bread.
peel | v/n | to remove the skin; the skin | Peel the potatoes.
stir | v | to mix with a spoon | Stir the soup slowly.
boil | v | to heat a liquid until it bubbles | Boil the eggs for ten minutes.
fry | v | to cook in hot oil | Fry the chicken until golden.
bake | v | to cook in an oven | She bakes cookies every weekend.
roast | v | to cook in an oven with dry heat | We roasted a chicken.
grill | v/n | to cook over direct heat | Let's grill burgers outside.
simmer | v | to cook gently just below boiling | Let it simmer for 20 minutes.
season | v | to add salt, pepper or spices | Season the meat with salt.
sauce | n | a liquid added to food for flavor | The pasta sauce is delicious.
dough | n | a thick mixture of flour and water for bread | Knead the dough.
leftovers | n | food remaining after a meal | We had leftovers for lunch.
dishwasher | n | a machine that washes dishes | Load the dishwasher.
cutting board | n | a board for cutting food | Use the cutting board.
whisk | v/n | to beat quickly with a tool | Whisk the eggs.
grate | v | to shred food on a grater | Grate some cheese.
spill | v/n | to let liquid fall out by accident | Oops, I spilled the milk.
burn | v | to damage with heat or fire | I burned the toast.
`);

addV('v-food', 'Home & daily life', '🥗', 'Food & drink', `
breakfast | n | the first meal of the day | I skipped breakfast today.
snack | n | a small amount of food between meals | Do you want a snack?
dessert | n | a sweet dish at the end of a meal | We shared a dessert.
appetizer | n | a small dish before the main course (US) | Let's order an appetizer.
vegetable | n | a plant eaten as food | Eat your vegetables.
fruit | n | sweet food from plants, like apples | I eat fruit every day.
meat | n | animal flesh eaten as food | He doesn't eat meat.
seafood | n | fish and shellfish | I'm allergic to seafood.
poultry | n | chicken, turkey and other birds | The poultry section is over there.
dairy | n | milk, cheese and butter | I avoid dairy.
grain | n | seeds like rice and wheat | Whole grains are healthy.
flour | n | powder made from grain for baking | We need more flour.
sugar | n | a sweet substance | No sugar in my coffee, please.
salt | n | a white seasoning | Pass the salt.
pepper | n | a spice; also a vegetable | Add some black pepper.
spicy | adj | hot with strong flavor | This salsa is too spicy.
sweet | adj | tasting like sugar | The cake is very sweet.
sour | adj | having a sharp taste like lemon | The milk smells sour.
bitter | adj | having a sharp, unpleasant taste | Black coffee is bitter.
salty | adj | containing a lot of salt | These fries are salty.
crispy | adj | hard and crunchy | I like crispy bacon.
juicy | adj | full of juice | The steak was juicy.
fresh | adj | recently made or picked | Fresh bread smells great.
raw | adj | not cooked | Sushi is raw fish.
frozen | adj | stored at freezing temperature | Frozen pizza is quick.
homemade | adj | made at home | I love homemade soup.
organic | adj | grown without chemicals | We buy organic eggs.
vegetarian | n/adj | a person who doesn't eat meat | My sister is vegetarian.
vegan | n/adj | a person who eats no animal products | He's vegan.
allergic | adj | having a bad reaction to something | I'm allergic to nuts.
hungry | adj | wanting food | I'm starving, I'm so hungry.
thirsty | adj | wanting a drink | After running, I'm thirsty.
beverage | n | a drink (formal) | Beverages are free.
sip | v/n | to drink in small amounts | She sipped her tea.
taste | v/n | to have a flavor; the flavor | It tastes amazing.
`);

addV('v-clothes', 'Home & daily life', '👕', 'Clothes & appearance', `
shirt | n | clothing for the upper body | He wore a white shirt.
sweater | n | a warm knitted top | Take a sweater; it's chilly.
hoodie | n | a sweatshirt with a hood | I live in this hoodie.
jacket | n | a short coat | Nice leather jacket.
coat | n | a long warm outer garment | Put on your coat.
jeans | n | blue denim trousers | These jeans are too tight.
pants | n | trousers (US) | I need new pants.
shorts | n | short trousers | It's hot; wear shorts.
skirt | n | a garment hanging from the waist | She wore a red skirt.
dress | n/v | a one-piece garment; to put clothes on | She wore a long dress.
suit | n | matching jacket and pants for formal wear | He wore a navy suit.
tie | n/v | a strip of cloth worn at the neck; to fasten | Don't forget your tie.
sneakers | n | casual athletic shoes (US) | I'm wearing sneakers.
boots | n | shoes covering the ankle | Wear boots in the snow.
sandals | n | open shoes for summer | I wear sandals at the beach.
socks | n | foot coverings worn inside shoes | I can't find my socks.
scarf | n | cloth worn around the neck | She wore a wool scarf.
gloves | n | hand coverings | Bring gloves; it's freezing.
belt | n | a strap around the waist | He needs a belt.
pocket | n | a small bag sewn into clothes | Keep it in your pocket.
button | n/v | a small disc for fastening clothes | A button fell off.
zipper | n | a fastener with two rows of teeth (US) | The zipper is stuck.
fit | v/n | to be the right size | These pants don't fit.
tight | adj | fitting closely | The shirt is too tight.
loose | adj | not tight | I like loose clothes.
stylish | adj | fashionable | That's a stylish jacket.
casual | adj | relaxed, not formal | It's a casual dinner.
formal | adj | official, dressy | Formal attire required.
wrinkled | adj | having creases | Iron your wrinkled shirt.
makeup | n | cosmetics worn on the face | She doesn't wear much makeup.
`);

addV('v-body', 'Body & health', '🫀', 'Body & health', `
shoulder | n | the part where the arm joins the body | My shoulder hurts.
elbow | n | the middle joint of the arm | He hit his elbow.
wrist | n | the joint between hand and arm | She sprained her wrist.
knee | n | the middle joint of the leg | My knee is sore.
ankle | n | the joint between foot and leg | He twisted his ankle.
chest | n | the front upper body | I have a pain in my chest.
stomach | n | the organ for food; belly | My stomach hurts.
back | n | the rear part of the body | I have a bad back.
neck | n | the part joining head and body | My neck is stiff.
throat | n | the passage inside the neck | I have a sore throat.
skin | n | outer covering of the body | She has sensitive skin.
bone | n | hard part of the skeleton | He broke a bone.
muscle | n | tissue that moves the body | I'm building muscle.
heart | n | the organ that pumps blood | His heart was racing.
lungs | n | the organs for breathing | Smoking damages your lungs.
brain | n | the organ for thinking | Use your brain!
blood | n | red liquid in the body | They took a blood test.
fever | n | high body temperature | She has a fever.
cough | n/v | to push air from the throat noisily | He has a bad cough.
sneeze | v | to blow air out suddenly through the nose | Bless you when you sneeze.
cold | n | a common virus illness | I caught a cold.
flu | n | influenza, a stronger virus illness | Half the office has the flu.
headache | n | pain in the head | I have a terrible headache.
stomachache | n | pain in the belly | Too much candy gave her a stomachache.
sore | adj | painful | My legs are sore after the gym.
dizzy | adj | feeling that things are spinning | I feel dizzy.
tired | adj | needing rest | I'm so tired.
sick | adj | ill | She's sick today.
healthy | adj | in good health | Eat healthy food.
injury | n | harm to the body | He has a knee injury.
swollen | adj | larger than normal because of injury | My finger is swollen.
bruise | n/v | a dark mark from a hit | I have a big bruise.
cut | n/v | a wound from something sharp | He cut his finger.
medicine | n | a drug that treats illness | Take your medicine.
vitamin | n | a nutrient needed for health | I take vitamins.
`);

addV('v-medical', 'Body & health', '🏥', 'Hospital & medical', `
doctor | n | a person trained to treat illness | I have a doctor's appointment.
nurse | n | a person who cares for patients | The nurse took my temperature.
surgeon | n | a doctor who performs operations | The surgeon was excellent.
patient | n/adj | a person receiving treatment; able to wait calmly | The patient is stable.
emergency room | n | hospital department for urgent cases (ER) | They rushed him to the ER.
ambulance | n | a vehicle that carries sick people | Call an ambulance!
clinic | n | a small medical center | There's a clinic nearby.
appointment | n | a scheduled meeting | I have an appointment at 3.
symptom | n | a sign of illness | What are your symptoms?
diagnosis | n | the identification of an illness | The diagnosis was good news.
treatment | n | medical care for an illness | The treatment worked.
prescription | n | a doctor's written order for medicine | I need a prescription.
pill | n | a small tablet of medicine | Take one pill a day.
dose | n | an amount of medicine | Don't take a double dose.
injection | n | a shot with a needle | I'm afraid of injections.
vaccine | n | a medicine that protects from disease | Get the flu vaccine.
surgery | n | an operation | She needs surgery.
stitches | n | thread used to close a wound | He needed six stitches.
cast | n | a hard cover for a broken bone | She has a cast on her arm.
X-ray | n | a picture of the inside of the body | They took an X-ray.
blood pressure | n | the force of blood in the vessels | Your blood pressure is high.
allergy | n | a bad reaction to something | I have a pollen allergy.
infection | n | illness caused by germs | The wound got infected.
recover | v | to get better | He's recovering well.
heal | v | to become healthy again | The cut will heal soon.
chronic | adj | lasting a long time | She has chronic back pain.
mental health | n | emotional and psychological well-being | Mental health matters.
therapy | n | treatment for physical or mental problems | He goes to therapy weekly.
pharmacy | n | a place that sells medicine | Pick it up at the pharmacy.
insurance | n | payment plan for medical costs | Do you have health insurance?
`);

addV('v-emotion', 'People & relationships', '😀', 'Emotions & personality', `
cheerful | adj | happy and positive | She's a cheerful person.
thrilled | adj | extremely pleased | I'm thrilled about the news.
delighted | adj | very happy | We're delighted to see you.
grateful | adj | thankful | I'm grateful for your help.
proud | adj | feeling satisfaction in achievement | I'm proud of you.
relaxed | adj | calm and not stressed | I feel so relaxed.
anxious | adj | worried and nervous | He's anxious about the test.
nervous | adj | slightly afraid | I'm nervous about the interview.
stressed | adj | under mental pressure | I'm stressed at work.
upset | adj | unhappy or angry | She's upset about the news.
annoyed | adj | slightly angry | I'm annoyed at the delay.
furious | adj | extremely angry | He was furious.
jealous | adj | resentful of someone's success | He's jealous of his brother.
lonely | adj | sad from being alone | I feel lonely here.
embarrassed | adj | ashamed or awkward | I was so embarrassed.
guilty | adj | feeling you did wrong | I feel guilty about it.
disappointed | adj | sad because hopes failed | I'm disappointed with the result.
confused | adj | unable to understand | I'm totally confused.
shocked | adj | very surprised and upset | I was shocked by the news.
curious | adj | wanting to know | I'm curious about her job.
friendly | adj | kind and sociable | The staff is very friendly.
shy | adj | nervous around people | He's shy at parties.
outgoing | adj | sociable and energetic | She's outgoing.
reliable | adj | can be trusted | He's a reliable friend.
honest | adj | truthful | Be honest with me.
generous | adj | giving freely | She's generous with her time.
polite | adj | showing good manners | The kids are polite.
rude | adj | impolite | That was rude.
selfish | adj | caring only about yourself | Don't be selfish.
lazy | adj | unwilling to work | I felt lazy today.
stubborn | adj | refusing to change one's mind | He's so stubborn.
patient | adj | able to wait calmly | Please be patient.
mature | adj | behaving like an adult | She's mature for her age.
creative | adj | good at original ideas | He's a creative designer.
ambitious | adj | eager to succeed | She's very ambitious.
sensitive | adj | easily hurt or affected | He's a sensitive guy.
optimistic | adj | expecting good things | I'm optimistic about it.
pessimistic | adj | expecting bad things | Don't be so pessimistic.
sarcastic | adj | saying the opposite to mock | Was that sarcastic?
`);

addV('v-family', 'People & relationships', '👨‍👩‍👧', 'Family & relationships', `
parent | n | mother or father | My parents live nearby.
sibling | n | brother or sister | Do you have any siblings?
cousin | n | child of your aunt or uncle | My cousin is visiting.
aunt | n | sister of a parent | My aunt lives in Texas.
uncle | n | brother of a parent | Uncle Joe cooks great.
niece | n | daughter of a sibling | My niece is five.
nephew | n | son of a sibling | My nephew loves dinosaurs.
grandparents | n | parents of your parents | I visit my grandparents.
in-laws | n | your spouse's family | We're seeing the in-laws.
stepmother | n | your parent's wife who isn't your mother | My stepmother is kind.
spouse | n | husband or wife | Bring your spouse.
fiancé | n | a person you're engaged to | This is my fiancé.
partner | n | a romantic or business companion | She came with her partner.
ex | n | a former partner | He ran into his ex.
roommate | n | a person you live with | I live with a roommate.
colleague | n | a coworker | A colleague helped me.
acquaintance | n | someone you know slightly | He's just an acquaintance.
buddy | n | a friend (casual) | He's my buddy.
bond | n/v | a close connection | They share a strong bond.
raise | v | to bring up a child | She raised three kids.
grow up | v | to become an adult | I grew up in Ohio.
adopt | v | to legally take a child as your own | They adopted a baby.
get married | v | to become husband and wife | They got married in June.
divorce | n/v | the legal end of a marriage | They're getting a divorce.
engaged | adj | promised to marry | They got engaged.
single | adj | not in a relationship | I'm single.
pregnant | adj | expecting a baby | She's pregnant.
toddler | n | a child aged one to three | The toddler is learning to walk.
teenager | n | a person aged 13 to 19 | My teenager is moody.
elderly | adj | old (polite) | She helps elderly people.
babysitter | n | a person who watches children | We hired a babysitter.
household | n | people living together | It's a busy household.
generation | n | people of similar age | The younger generation uses apps.
relative | n | a family member | Many relatives came.
`);

addV('v-school', 'Work & school', '🎓', 'School & learning', `
lecture | n | a talk given to students | The lecture was boring.
assignment | n | a task given by a teacher | Finish the assignment tonight.
homework | n | schoolwork done at home | I have lots of homework.
essay | n | a short piece of writing | Write a five-page essay.
exam | n | a formal test | I have an exam tomorrow.
quiz | n | a short test | We have a quiz on Friday.
grade | n/v | a score; to mark | I got a good grade.
semester | n | half of a school year | This semester is tough.
major | n/v | main subject of study | My major is biology.
degree | n | a qualification from a university | She has a master's degree.
scholarship | n | money given to a student | He got a scholarship.
tuition | n | the fee for classes | Tuition is expensive.
campus | n | the grounds of a university | The campus is huge.
dorm | n | a student residence | I live in a dorm.
professor | n | a university teacher | The professor was funny.
tutor | n/v | a private teacher | I hired a math tutor.
classmate | n | someone in your class | My classmate helped me.
graduate | v/n | to finish a degree; a person who has | She graduated last year.
enroll | v | to register for a course | I enrolled in a class.
attend | v | to be present at | Attend all lectures.
miss | v | to fail to attend | I missed class.
submit | v | to hand in | Submit your essay online.
deadline | n | the last time to finish | The deadline is Monday.
revise | v | to change a piece of writing to improve it (not "study", which is British use) | Revise your essay before you submit it.
memorize | v | to learn by heart | I memorized the list.
cheat | v | to break rules in a test | Don't cheat.
fail | v | to not pass | I failed the test.
pass | v | to succeed in a test | She passed with honors.
research | n/v | investigation of a subject | His research is about sleep.
thesis | n | a long academic paper | She's writing her thesis.
internship | n | temporary work experience | I got an internship.
syllabus | n | an outline of a course | Check the syllabus.
curriculum | n | the courses taught at a school | The curriculum changed.
subject | n | a school topic | My favorite subject is art.
`);

addV('v-work', 'Work & school', '💼', 'Work & office', `
boss | n | a person in charge | My boss is great.
manager | n | someone who runs a team | The manager called a meeting.
employee | n | a person who works for a company | The company has 50 employees.
coworker | n | a colleague | My coworker is on leave.
client | n | a customer of a business | A client is coming.
customer | n | a person who buys | The customer is always right.
team | n | a group working together | Our team won.
department | n | a section of a company | She works in the HR department.
office | n | a place of work | I'm at the office.
cubicle | n | a small work space in an office | His cubicle is by the window.
meeting | n | a gathering to discuss | The meeting starts at ten.
schedule | n/v | a timetable; to plan a time | Check your schedule.
agenda | n | list of topics to discuss | Send the agenda.
presentation | n | a talk with slides | I'm giving a presentation.
report | n/v | a document; to tell | Write a report.
proposal | n | a suggested plan | Read the proposal.
contract | n | a legal agreement | Sign the contract.
salary | n | fixed regular pay | Her salary is good.
bonus | n | extra pay | I got a bonus.
raise | n | an increase in salary | He asked for a raise.
promotion | n | an advance to a higher position | She got a promotion.
resume | n | a document of your experience | Update your resume.
interview | n/v | a formal job conversation | I have an interview.
hire | v | to employ | They hired a new designer.
fire | v | to dismiss from a job | He was fired.
quit | v | to leave a job | I quit last week.
resign | v | to formally leave a job | She resigned yesterday.
retire | v | to stop working due to age | He retired at 65.
overtime | n | extra hours of work | I worked overtime.
shift | n | a period of scheduled work | I work the night shift.
commute | n/v | travel to work | My commute is an hour.
remote | adj | not in the office | I work remotely.
freelance | adj/v | self-employed | She does freelance design.
deadline | n | last time to finish | We missed the deadline.
budget | n | a plan for money | The budget is tight.
goal | n | something you want to achieve | Set a clear goal.
task | n | a piece of work | That's a simple task.
profit | n | money earned after costs | The company made a profit.
colleague | n | coworker | I'll ask a colleague.
workload | n | amount of work | My workload is heavy.
`);

addV('v-money', 'Money & shopping', '💳', 'Money & shopping', `
cash | n | physical money | Do you take cash?
credit card | n | a card for borrowing money to pay | I'll pay by credit card.
debit card | n | a card that takes money from your account | Use your debit card.
price | n | the cost | What's the price?
cost | n/v | the price; to have as a price | It costs ten dollars.
cheap | adj | low in price | It's really cheap.
expensive | adj | high in price | That's too expensive.
affordable | adj | reasonably priced | Find an affordable place.
discount | n | a price reduction | Is there a discount?
coupon | n | a ticket for a discount | I have a coupon.
sale | n | a time of reduced prices | Everything's on sale.
bargain | n | something bought cheaply | It was a bargain.
receipt | n | proof of payment | Keep the receipt.
refund | n | money returned | I want a refund.
exchange | n/v | to swap | Can I exchange it?
change | n | coins and notes returned | Keep the change.
tip | n | extra money for service | Leave a tip.
tax | n | money paid to government | Tax is extra.
fee | n | a charge for a service | There's a small fee.
bill | n | a statement of costs | I'll pay the bill.
rent | n/v | payment for a home; to pay to use | Rent is due Friday.
mortgage | n | a loan for buying a house | We have a mortgage.
loan | n | borrowed money | He took out a loan.
debt | n | money owed | She's in debt.
savings | n | money kept for later | I have some savings.
budget | n/v | a spending plan | We're on a budget.
invest | v | to put money in to earn more | He invests in stocks.
afford | v | to have enough money for | I can't afford it.
borrow | v | to take temporarily | Can I borrow $10?
lend | v | to give temporarily | Can you lend me a pen?
owe | v | to have to pay back | I owe you lunch.
withdraw | v | to take money out | I withdrew $100.
deposit | n/v | to put money in | I made a deposit.
bank account | n | an account held at a bank | I opened a bank account.
shopping cart | n | a basket for items | Add it to your cart.
checkout | n | the place or act of paying | Go to checkout.
`);

addV('v-transport', 'Travel & places', '🚗', 'Transport & driving', `
traffic | n | cars on the road | Traffic is terrible.
highway | n | a major road | Take the highway.
intersection | n | where roads meet | Turn left at the intersection.
traffic light | n | signals for cars | Stop at the red light.
crosswalk | n | a place to cross the street | Use the crosswalk.
sidewalk | n | a path for walking beside a road (US) | Walk on the sidewalk.
parking lot | n | an area for parking | The parking lot is full.
gas station | n | a place to buy fuel (US) | I'll stop at the gas station.
tire | n | rubber around a wheel | I have a flat tire.
engine | n | the machine that powers a vehicle | The engine won't start.
brake | n/v | to slow down; the device | Hit the brakes!
steering wheel | n | what you hold to steer | Hold the steering wheel.
seat belt | n | a safety strap | Fasten your seat belt.
speed limit | n | maximum legal speed | Obey the speed limit.
ticket | n | a fine for breaking rules; a pass | I got a speeding ticket.
license | n | official permission to drive | I need my driver's license.
passenger | n | a rider who isn't driving | The passenger fell asleep.
driver | n | a person who drives | The driver was kind.
bus stop | n | a place where buses stop | Meet me at the bus stop.
subway | n | an underground train (US) | I take the subway to work.
platform | n | the area to board trains | Wait on the platform.
fare | n | the cost of a ride | The fare is $2.75.
commuter | n | someone who travels to work regularly | The train is full of commuters.
detour | n | a longer alternative route | Take a detour.
shortcut | n | a quicker way | I know a shortcut.
roundabout | n | a circular junction | Go around the roundabout.
pedestrian | n | a person on foot | Watch out for pedestrians.
bike | n | bicycle | I ride my bike.
scooter | n | a small motorbike | He rides a scooter.
carpool | n/v | to share a ride | We carpool to work.
`);

addV('v-travel', 'Travel & places', '✈️', 'Travel & hotels', `
passport | n | an official travel document | Don't forget your passport.
visa | n | permission to enter a country | I need a visa.
luggage | n | bags and suitcases (also: baggage) | My luggage is lost.
suitcase | n | a case for clothes while traveling | Pack your suitcase.
backpack | n | a bag worn on the back | He carries a backpack.
carry-on | n | a small bag taken on the plane | I only have a carry-on.
boarding pass | n | a ticket to board a plane | Show your boarding pass.
gate | n | the door to board | Go to gate 12.
departure | n | leaving | Departure is at 9.
arrival | n | getting there | Arrival time is noon.
delay | n/v | a late start; to make late | The flight has a delay.
cancel | v | to stop an event | They canceled my flight.
layover | n | a stop between flights | I have a two-hour layover.
customs | n | border checking | Go through customs.
itinerary | n | a travel plan | Send me the itinerary.
reservation | n | a booking | I have a reservation.
book | v | to reserve | I booked a hotel.
check in | v | to register on arrival | We check in at 3.
check out | v | to leave a hotel | Check out is at noon.
vacancy | n | an empty room | The sign says no vacancy.
lobby | n | the entrance hall | Meet in the lobby.
room service | n | food brought to your room | Order room service.
sightseeing | n | visiting places of interest | We went sightseeing.
tourist | n | a person traveling for pleasure | The city is full of tourists.
souvenir | n | an item bought as a memory | I bought a souvenir.
guide | n | a person or book that shows the way | The guide was great.
landmark | n | a famous place | The tower is a landmark.
resort | n | a vacation place | We stayed at a beach resort.
trip | n | a journey | We took a trip.
abroad | adv | in another country | She studied abroad.
`);

addV('v-city', 'Travel & places', '🏙️', 'City & places', `
downtown | n/adv | the center of a city (US) | I work downtown.
suburb | n | an area outside the city center | We live in the suburbs.
neighborhood | n | a district of a town | It's a nice neighborhood.
skyscraper | n | a very tall building | The skyscraper is amazing.
bridge | n | a structure across water | Cross the bridge.
tunnel | n | an underground passage | The tunnel is closed.
square | n | an open area in a town | Meet in the square.
park | n | a public green area | We walked in the park.
playground | n | an area for children to play | The kids love the playground.
library | n | a place with books to borrow | I'm going to the library.
museum | n | a place with exhibits | The museum is free on Sunday.
stadium | n | a large sports venue | The stadium is packed.
gym | n | a place for exercise | I go to the gym.
mall | n | a large shopping center | Let's go to the mall.
supermarket | n | a big food store | I'm at the supermarket.
convenience store | n | a small shop open late | I got snacks at the convenience store.
bakery | n | a shop that sells bread | The bakery smells great.
pharmacy | n | a place for medicine | Pick it up at the pharmacy.
post office | n | where you mail letters | Go to the post office.
bank | n | a place for money | I went to the bank.
city hall | n | the local government building (also: town hall) | The meeting is at city hall.
police station | n | where police work | Report it at the police station.
fire station | n | where firefighters are based | The fire station is nearby.
church | n | a Christian place of worship | They go to church.
cafe | n | a small restaurant for coffee | Let's meet at a cafe.
bar | n | a place that serves alcohol | They met in a bar.
nightclub | n | a place for dancing | We went to a nightclub.
movie theater | n | a place to watch films (British: cinema) | Let's meet at the movie theater.
farm | n | land for growing crops | He grew up on a farm.
village | n | a small rural community | They live in a village.
`);

addV('v-nature', 'Nature & world', '🌳', 'Nature, weather & animals', `
forest | n | a large area of trees | We hiked in the forest.
mountain | n | a very high hill | We climbed the mountain.
valley | n | low land between hills | The valley is beautiful.
river | n | a large flowing stream | Swim in the river.
lake | n | a large body of water | A cabin by the lake.
ocean | n | a huge body of salt water | The ocean is calm.
beach | n | sandy shore | We spent a day at the beach.
island | n | land surrounded by water | A tiny island.
desert | n | a dry, sandy region | It's hot in the desert.
cliff | n | a steep rock face | Don't stand near the cliff.
waterfall | n | water falling from a height | The waterfall is huge.
storm | n | bad weather with wind and rain | A storm is coming.
thunder | n | the loud noise after lightning | I heard thunder.
lightning | n | a flash of light in the sky | Lightning struck the tree.
breeze | n | a gentle wind | A cool breeze blew.
fog | n | thick low cloud | There's heavy fog.
drizzle | n/v | light rain | It's just a drizzle.
snowstorm | n | heavy snowfall with wind | A snowstorm hit the city.
heat wave | n | a period of extreme heat | The heat wave lasted a week.
forecast | n | a weather prediction | The forecast says rain.
humid | adj | damp and warm | It's very humid.
chilly | adj | slightly cold | It's chilly tonight.
freezing | adj | very cold | It's freezing!
dog | n | a pet that barks | I walk my dog.
cat | n | a small pet | Our cat sleeps all day.
bird | n | an animal with wings and feathers | A bird sang.
fish | n | an animal living in water | He caught a fish.
horse | n | a large animal people ride | She rides a horse.
wolf | n | a wild animal like a dog | We heard a wolf.
bear | n | a large furry wild animal | A bear walked by.
insect | n | a small creature with six legs | An insect bit me.
mosquito | n | a biting insect | Mosquitoes are everywhere.
wild | adj | living in nature | A wild animal.
pet | n | an animal kept at home | Do you have a pet?
leash | n | a strap to hold a dog | Keep your dog on a leash.
`);
