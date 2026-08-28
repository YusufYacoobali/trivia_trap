import { Question } from './types';

// Trap Questions, rebuilt from scratch.
//
// The old bank was 100 well-known public-domain riddles - Moses on the Ark, a
// pound of feathers, "how many months have 28 days". Those are one-shot
// content: once a player has seen the answer it is solved permanently, so the
// mode had no replay value at all.
//
// These are built around five trap mechanisms instead, so the SKILL transfers
// even when the specific question does not:
//
//   naming    the familiar name lies about the thing (Panama hats, catgut)
//   category  three options share a word with the answer but not its category
//   wording   the question asks something subtly different from what you expect
//   counting  the intuitive count is off by one, or counts the wrong thing
//   framing   the obvious anchor number is the wrong anchor
//
// A player who learns "read the noun, not the vibe" gets better at all of them.
//
// VERIFICATION: the naming traps in particular are exactly the kind of claim
// that gets repeated wrongly, so they were checked against sources rather than
// recalled. That pass rewrote tr3's explanation, which had repeated the "named
// after a Mr Camel" story as fact when it is an unevidenced urban legend, and
// removed tr54 ("a tonne of bricks vs a tonne of helium balloons"), whose
// premise contradicted itself - "a tonne of X" already fixes the mass, so the
// buoyancy twist made the question unanswerable rather than clever.

const V = '2026-08-02';

export const TRAP_QUESTIONS: Question[] = [
  // --- naming traps: the label lies ---
  { id: 'tr1', cat: 'Trap', kind: 'trap', d: 4, q: 'Panama hats are traditionally made in which country?', o: ['Ecuador', 'Panama', 'Colombia', 'Peru'], a: 0, e: 'They are woven in Ecuador. The name stuck because they were shipped out through Panama.', c: 38, tags: ['naming'], verifiedAt: V },
  { id: 'tr2', cat: 'Trap', kind: 'trap', d: 4, q: 'Catgut string is traditionally made from which animal?', o: ['Sheep', 'Cats', 'Cattle', 'Goats'], a: 0, e: 'Catgut comes from sheep and sometimes horse intestines. It has never involved cats.', c: 36, tags: ['naming'], verifiedAt: V },
  { id: 'tr3', cat: 'Trap', kind: 'trap', d: 4, q: 'A camel hair brush is usually made from the hair of what?', o: ['Squirrel', 'Camel', 'Goat', 'Horse'], a: 0, e: 'Camel hair brushes are usually squirrel, sometimes goat or ox. They have never contained camel hair - it is too woolly to hold a point.', c: 33, tags: ['naming'], verifiedAt: V },
  { id: 'tr4', cat: 'Trap', kind: 'trap', d: 4, q: 'The Canary Islands take their name from which animal?', o: ['Dogs', 'Canaries', 'Goats', 'Seals'], a: 0, e: 'From the Latin "insula canaria", island of dogs. The bird was named after the islands, not the reverse.', c: 34, tags: ['naming'], verifiedAt: V },
  { id: 'tr5', cat: 'Trap', kind: 'trap', d: 4, q: 'Great Danes were originally developed in which country?', o: ['Germany', 'Denmark', 'Netherlands', 'Sweden'], a: 0, e: 'The breed was developed in Germany, where it is called the Deutsche Dogge.', c: 37, tags: ['naming'], verifiedAt: V },
  { id: 'tr6', cat: 'Trap', kind: 'trap', d: 4, q: 'Guinea pigs originally come from which part of the world?', o: ['South America', 'West Africa', 'Southeast Asia', 'Southern Europe'], a: 0, e: 'They were domesticated in the Andes. They are not from Guinea and are not pigs.', c: 40, tags: ['naming'], verifiedAt: V },
  { id: 'tr7', cat: 'Trap', kind: 'trap', d: 5, q: 'India ink was originally developed in which country?', o: ['China', 'India', 'Egypt', 'Persia'], a: 0, e: 'The ink was developed in China; Europe named it for the trade route it arrived on.', c: 29, tags: ['naming'], verifiedAt: V },
  { id: 'tr8', cat: 'Trap', kind: 'trap', d: 4, q: 'The numerals we call Arabic were first developed where?', o: ['India', 'Arabia', 'Greece', 'Rome'], a: 0, e: 'The system originated in India and reached Europe through Arabic scholarship.', c: 35, tags: ['naming'], verifiedAt: V },
  { id: 'tr9', cat: 'Trap', kind: 'trap', d: 5, q: 'The Pennsylvania Dutch are descended from settlers from where?', o: ['Germany', 'Netherlands', 'Belgium', 'Denmark'], a: 0, e: '"Dutch" here is a corruption of "Deutsch". They were German-speaking settlers.', c: 32, tags: ['naming'], verifiedAt: V },
  { id: 'tr10', cat: 'Trap', kind: 'trap', d: 3, q: 'Welsh rarebit contains which meat?', o: ['None at all', 'Rabbit', 'Lamb', 'Beef'], a: 0, e: 'It is melted cheese on toast. The dish has never contained rabbit.', c: 45, tags: ['naming'], verifiedAt: V },
  { id: 'tr11', cat: 'Trap', kind: 'trap', d: 4, q: 'Bombay duck is which kind of food?', o: ['A fish', 'A duck', 'A bread', 'A lentil dish'], a: 0, e: 'Bombay duck is a dried lizardfish, not poultry.', c: 33, tags: ['naming'], verifiedAt: V },
  { id: 'tr12', cat: 'Trap', kind: 'trap', d: 3, q: 'A killer whale is actually which type of animal?', o: ['A dolphin', 'A whale', 'A porpoise', 'A large shark'], a: 0, e: 'The orca is the largest member of the dolphin family.', c: 46, tags: ['naming'], verifiedAt: V },
  { id: 'tr13', cat: 'Trap', kind: 'trap', d: 3, q: 'Koalas belong to which group of animals?', o: ['Marsupials', 'Bears', 'Primates', 'Rodents'], a: 0, e: 'Koalas are marsupials. "Koala bear" is a nickname with no biological basis.', c: 48, tags: ['naming'], verifiedAt: V },
  { id: 'tr14', cat: 'Trap', kind: 'trap', d: 4, q: 'In Frankenstein, who or what is named Frankenstein?', o: ['The scientist', 'The monster', 'The village', 'The laboratory'], a: 0, e: 'Victor Frankenstein is the scientist. The creature is never given a name.', c: 41, tags: ['naming', 'books'], verifiedAt: V },
  { id: 'tr15', cat: 'Trap', kind: 'trap', d: 4, q: 'The Battle of Waterloo was fought in which present-day country?', o: ['Belgium', 'France', 'Netherlands', 'Germany'], a: 0, e: 'Waterloo is just south of Brussels, in modern Belgium.', c: 39, tags: ['naming', 'history'], verifiedAt: V },
  { id: 'tr16', cat: 'Trap', kind: 'trap', d: 5, q: 'In which month did the Russian October Revolution take place?', o: ['November', 'October', 'September', 'December'], a: 0, e: 'Russia still used the Julian calendar. By the Gregorian calendar it happened in November 1917.', c: 28, tags: ['naming', 'history'], verifiedAt: V },
  { id: 'tr17', cat: 'Trap', kind: 'trap', d: 5, q: 'The Battle of Bunker Hill was mostly fought on which hill?', o: ['Breed\'s Hill', 'Bunker Hill', 'Copp\'s Hill', 'Beacon Hill'], a: 0, e: 'Most of the fighting happened on Breed\'s Hill, but the battle kept its neighbour\'s name.', c: 24, tags: ['naming', 'history'], verifiedAt: V },
  { id: 'tr18', cat: 'Trap', kind: 'trap', d: 4, q: 'A Chinese gooseberry is better known today as what?', o: ['Kiwifruit', 'Lychee', 'Starfruit', 'Passion fruit'], a: 0, e: 'It was renamed kiwifruit for export from New Zealand in the 1950s.', c: 36, tags: ['naming'], verifiedAt: V },
  { id: 'tr19', cat: 'Trap', kind: 'trap', d: 5, q: 'The Holy Roman Empire was centred on which modern country?', o: ['Germany', 'Italy', 'Greece', 'Turkey'], a: 0, e: 'Despite the name, its heartland was German-speaking central Europe, not Rome.', c: 31, tags: ['naming', 'history'], verifiedAt: V },
  { id: 'tr20', cat: 'Trap', kind: 'trap', d: 4, q: 'The Thirty Years War lasted how long?', o: ['Thirty years', 'Twelve years', 'Forty-one years', 'Sixteen years'], a: 0, e: 'Sometimes the obvious answer is the right one. It ran from 1618 to 1648.', hook: 'The Hundred Years War, by contrast, lasted 116.', c: 42, tags: ['wording', 'history'], verifiedAt: V },

  // --- category traps: shares a word, not a family ---
  { id: 'tr21', cat: 'Trap', kind: 'trap', d: 4, q: 'Which of these is actually a fish?', o: ['Seahorse', 'Jellyfish', 'Starfish', 'Cuttlefish'], a: 0, e: 'The seahorse is a true fish. The other three carry "fish" in the name but are not.', c: 37, tags: ['category'], verifiedAt: V },
  { id: 'tr22', cat: 'Trap', kind: 'trap', d: 5, q: 'Which of these is a true botanical nut?', o: ['Hazelnut', 'Peanut', 'Almond', 'Cashew'], a: 0, e: 'Hazelnuts are true nuts. Peanuts are legumes; almonds and cashews are seeds of drupes.', c: 30, tags: ['category'], verifiedAt: V },
  { id: 'tr23', cat: 'Trap', kind: 'trap', d: 4, q: 'Which of these is botanically a berry?', o: ['Banana', 'Strawberry', 'Raspberry', 'Blackberry'], a: 0, e: 'Bananas qualify as berries. Strawberries and raspberries do not.', c: 39, tags: ['category'], verifiedAt: V },
  { id: 'tr24', cat: 'Trap', kind: 'trap', d: 4, q: 'Which of these is botanically a vegetable?', o: ['Celery', 'Tomato', 'Cucumber', 'Pepper'], a: 0, e: 'Celery is a stem. The other three develop from flowers and contain seeds, so they are fruits.', c: 35, tags: ['category'], verifiedAt: V },
  { id: 'tr25', cat: 'Trap', kind: 'trap', d: 4, q: 'Which of these instruments belongs to the woodwind family?', o: ['Saxophone', 'Trumpet', 'Trombone', 'French horn'], a: 0, e: 'The saxophone is brass in construction but a woodwind by classification, because it uses a reed.', c: 34, tags: ['category', 'music'], verifiedAt: V },
  { id: 'tr26', cat: 'Trap', kind: 'trap', d: 4, q: 'Which of these is not a member of the cat family?', o: ['Hyena', 'Cheetah', 'Lynx', 'Cougar'], a: 0, e: 'Hyenas are more closely related to mongooses than to cats.', c: 44, tags: ['category'], verifiedAt: V },
  { id: 'tr27', cat: 'Trap', kind: 'trap', d: 3, q: 'Which of these is actually a mammal?', o: ['Bat', 'Penguin', 'Ostrich', 'Crocodile'], a: 0, e: 'Bats are the only mammals capable of true sustained flight.', c: 47, tags: ['category'], verifiedAt: V },
  { id: 'tr28', cat: 'Trap', kind: 'trap', d: 3, q: 'Which of these is a genuine chemical element?', o: ['Tungsten', 'Adamantium', 'Mithril', 'Vibranium'], a: 0, e: 'Tungsten is element 74. The rest are fictional.', c: 46, tags: ['category'], verifiedAt: V },
  { id: 'tr29', cat: 'Trap', kind: 'trap', d: 5, q: 'Which of these is not a primary colour of light?', o: ['Yellow', 'Red', 'Green', 'Blue'], a: 0, e: 'Light mixes red, green and blue. Yellow is primary for paint, not for light.', c: 32, tags: ['category'], verifiedAt: V },
  { id: 'tr30', cat: 'Trap', kind: 'trap', d: 4, q: 'Which of these is not one of the Great Lakes?', o: ['Champlain', 'Huron', 'Erie', 'Ontario'], a: 0, e: 'The five are Superior, Michigan, Huron, Erie and Ontario.', c: 38, tags: ['category'], verifiedAt: V },

  // --- wording traps: read it again ---
  { id: 'tr31', cat: 'Trap', kind: 'trap', d: 4, q: 'How many times can you subtract 5 from 25?', o: ['Once', 'Five times', 'Four times', 'Twenty-five times'], a: 0, e: 'After you subtract once you are working with 20, not 25.', c: 34, tags: ['wording'], verifiedAt: V },
  { id: 'tr32', cat: 'Trap', kind: 'trap', d: 4, q: 'You are in a race and overtake the person in last place. Where are you?', o: ['That is impossible', 'Last place', 'Second to last', 'First place'], a: 0, e: 'If you could overtake the person in last, you would already be behind them - which puts you last.', c: 33, tags: ['wording'], verifiedAt: V },
  { id: 'tr33', cat: 'Trap', kind: 'trap', d: 3, q: 'A rooster lays an egg on a sloped roof. Which way does it roll?', o: ['Roosters do not lay eggs', 'Down the near side', 'Down the far side', 'It stays put'], a: 0, e: 'Roosters are male. The rest of the question is decoration.', c: 49, tags: ['wording'], verifiedAt: V },
  { id: 'tr34', cat: 'Trap', kind: 'trap', d: 4, q: 'You have three apples and take away two. How many do you have?', o: ['Two', 'One', 'Three', 'None'], a: 0, e: 'You have the two you took. The question asks what you have, not what is left.', c: 40, tags: ['wording'], verifiedAt: V },
  { id: 'tr35', cat: 'Trap', kind: 'trap', d: 5, q: 'Which word is spelled incorrectly in every dictionary?', o: ['Incorrectly', 'Rhythm', 'Necessary', 'Definitely'], a: 0, e: 'The word "incorrectly" is, quite literally, spelled i-n-c-o-r-r-e-c-t-l-y.', c: 31, tags: ['wording'], verifiedAt: V },
  { id: 'tr36', cat: 'Trap', kind: 'trap', d: 4, q: 'Which word gets shorter when you add two letters to it?', o: ['Short', 'Small', 'Brief', 'Little'], a: 0, e: 'Add "er" to "short" and you get "shorter".', c: 42, tags: ['wording'], verifiedAt: V },
  { id: 'tr37', cat: 'Trap', kind: 'trap', d: 5, q: 'What occurs once in a minute, twice in a moment, but never in a decade?', o: ['The letter M', 'The letter E', 'A pause', 'A heartbeat'], a: 0, e: 'It is about the spelling: one M in "minute", two in "moment", none in "decade".', c: 29, tags: ['wording'], verifiedAt: V },
  { id: 'tr38', cat: 'Trap', kind: 'trap', d: 4, q: 'What is the value of half of two, plus two?', o: ['Three', 'Two', 'Four', 'One'], a: 0, e: 'Half of two is one, plus two makes three.', c: 43, tags: ['wording'], verifiedAt: V },

  // --- counting traps: off by one, or counting the wrong thing ---
  { id: 'tr39', cat: 'Trap', kind: 'trap', d: 5, q: 'A clock takes 5 seconds to strike 6. How long does it take to strike 12?', o: ['11 seconds', '10 seconds', '12 seconds', '6 seconds'], a: 0, e: 'You count gaps, not strikes. Six strikes have five gaps, so each gap is one second; twelve strikes have eleven.', c: 26, tags: ['counting'], verifiedAt: V },
  { id: 'tr40', cat: 'Trap', kind: 'trap', d: 5, q: 'How many times does the digit 9 appear between 1 and 100?', o: ['20', '10', '19', '11'], a: 0, e: 'Ten in the units column, ten in the tens column. 99 contributes two on its own.', c: 27, tags: ['counting'], verifiedAt: V },
  { id: 'tr41', cat: 'Trap', kind: 'trap', d: 4, q: 'How many stripes are on the flag of the United States?', o: ['13', '50', '48', '20'], a: 0, e: 'Thirteen stripes for the original colonies. The fifty is the number of stars.', c: 41, tags: ['counting'], verifiedAt: V },
  { id: 'tr42', cat: 'Trap', kind: 'trap', d: 4, q: 'If you plant 10 fence posts in a straight line, how many gaps are there?', o: ['9', '10', '11', '20'], a: 0, e: 'Posts in a line always leave one fewer gap than posts.', c: 44, tags: ['counting'], verifiedAt: V },
  { id: 'tr43', cat: 'Trap', kind: 'trap', d: 5, q: 'A book has pages numbered 1 to 100. How many digits are printed in total?', o: ['192', '100', '200', '150'], a: 0, e: 'Nine single digits, ninety two-digit numbers, then three for page 100: 9 + 180 + 3 = 192.', c: 23, tags: ['counting'], verifiedAt: V },
  { id: 'tr44', cat: 'Trap', kind: 'trap', d: 5, q: 'How many squares are there on a standard chessboard?', o: ['204', '64', '128', '100'], a: 0, e: 'Counting every size of square, not just the small ones, gives 204.', c: 21, tags: ['counting'], verifiedAt: V },

  // --- framing traps: the obvious anchor is wrong ---
  { id: 'tr45', cat: 'Trap', kind: 'trap', d: 5, q: 'A bat and a ball cost 1.10 together. The bat costs 1.00 more than the ball. What is the ball?', o: ['5p', '10p', '15p', '1p'], a: 0, e: 'If the ball were 10p the bat would be 1.10 and the total 1.20. At 5p the bat is 1.05 and the total works.', c: 28, tags: ['framing'], verifiedAt: V },
  { id: 'tr46', cat: 'Trap', kind: 'trap', d: 5, q: 'If 5 machines take 5 minutes to make 5 items, how long do 100 machines take to make 100?', o: ['5 minutes', '100 minutes', '20 minutes', '1 minute'], a: 0, e: 'Each machine makes one item in five minutes, so scaling both sides changes nothing.', c: 32, tags: ['framing'], verifiedAt: V },
  { id: 'tr47', cat: 'Trap', kind: 'trap', d: 5, q: 'Lily pads double daily and cover a lake in 48 days. When is the lake half covered?', o: ['Day 47', 'Day 24', 'Day 46', 'Day 12'], a: 0, e: 'Doubling means the final day takes it from half to full.', c: 30, tags: ['framing'], verifiedAt: V },
  { id: 'tr48', cat: 'Trap', kind: 'trap', d: 4, q: 'A shirt costs 20. Take 20% off, then add 20% back on. What is the price?', o: ['19.20', '20.00', '20.80', '18.40'], a: 0, e: 'The 20% comes off 20 but goes back on 16, so you do not return to the start.', c: 33, tags: ['framing'], verifiedAt: V },
  { id: 'tr49', cat: 'Trap', kind: 'trap', d: 3, q: 'Which is larger: 40% of 70, or 70% of 40?', o: ['They are equal', '40% of 70', '70% of 40', 'It depends'], a: 0, e: 'Both come to 28. Percentages commute.', c: 45, tags: ['framing'], verifiedAt: V },
  { id: 'tr50', cat: 'Trap', kind: 'trap', d: 4, q: 'You buy at 7, sell at 8, buy back at 9, sell at 10. What is the profit?', o: ['2', '1', '3', '0'], a: 0, e: 'Two separate trades, each making 1. Total profit 2.', c: 34, tags: ['framing'], verifiedAt: V },
  { id: 'tr51', cat: 'Trap', kind: 'trap', d: 5, q: 'Averaged over time, which planet is closest to Earth?', o: ['Mercury', 'Venus', 'Mars', 'Jupiter'], a: 0, e: 'Venus gets closest at its nearest approach, but Mercury stays near the Sun and so spends more time close to us.', hook: 'By the same measure, Mercury is the closest planet to every other planet too.', c: 22, tags: ['framing'], verifiedAt: V },
  { id: 'tr52', cat: 'Trap', kind: 'trap', d: 4, q: 'What is the largest organ in the human body?', o: ['Skin', 'Liver', 'Brain', 'Lungs'], a: 0, e: 'Skin is an organ, and by both surface area and weight it is the biggest.', c: 43, tags: ['framing'], verifiedAt: V },
  { id: 'tr53', cat: 'Trap', kind: 'trap', d: 3, q: 'Which weighs more: a kilogram of steel or a kilogram of feathers?', o: ['Neither, they are equal', 'The steel', 'The feathers', 'Depends on volume'], a: 0, e: 'Same trap, different metal. A kilogram is a kilogram.', hook: 'The feathers take up about a hundred times more space, which is what fools the eye.', c: 52, tags: ['framing'], verifiedAt: V },
  { id: 'tr55', cat: 'Trap', kind: 'trap', d: 4, q: 'How many birthdays does the average person have?', o: ['One', 'About eighty', 'One per year', 'None'], a: 0, e: 'You are born once. Everything after that is an anniversary of it.', c: 41, tags: ['wording'], verifiedAt: V },
];
