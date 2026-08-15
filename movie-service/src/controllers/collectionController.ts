import { Request, Response } from 'express';
import { getTMDBMovieDetails } from '../services/tmdbService.js';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/original';

export interface CollectionItem {
  id: number;
  title: string;
  type: 'movie' | 'series';
  overview: string;
  rating: number;
  releaseDate: string;
  poster: string | null;
  backdrop: string | null;
}

export interface CollectionData {
  id: string;
  name: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  movies: CollectionItem[];
}

const resolveImageUrl = (path: string | null | undefined, base: string): string | null => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};

const MCU_ITEMS: CollectionItem[] = [
  { id: 1726, title: 'Iron Man', type: 'movie', overview: 'Tony Stark builds a high-tech suit of armor to escape captivity.', rating: 7.9, releaseDate: '2008-04-30', poster: null, backdrop: null },
  { id: 1724, title: 'The Incredible Hulk', type: 'movie', overview: 'Scientist Bruce Banner searches for a cure to his gamma radiation mutation.', rating: 6.2, releaseDate: '2008-06-12', poster: null, backdrop: null },
  { id: 10138, title: 'Iron Man 2', type: 'movie', overview: 'Tony Stark faces government pressure and Ivan Vanko.', rating: 6.8, releaseDate: '2010-04-28', poster: null, backdrop: null },
  { id: 10195, title: 'Thor', type: 'movie', overview: 'The god Thor is cast out of Asgard to live among humans.', rating: 6.7, releaseDate: '2011-04-21', poster: null, backdrop: null },
  { id: 1771, title: 'Captain America: The First Avenger', type: 'movie', overview: 'Steve Rogers becomes Captain America during WWII.', rating: 7.0, releaseDate: '2011-07-22', poster: null, backdrop: null },
  { id: 24428, title: 'The Avengers', type: 'movie', overview: 'Earth’s Mightiest Heroes assemble to stop Loki.', rating: 7.7, releaseDate: '2012-04-25', poster: null, backdrop: null },
  { id: 68721, title: 'Iron Man 3', type: 'movie', overview: 'Tony Stark faces a formidable adversary known as the Mandarin.', rating: 6.9, releaseDate: '2013-04-18', poster: null, backdrop: null },
  { id: 76338, title: 'Thor: The Dark World', type: 'movie', overview: 'Thor fights to restore order across the cosmos against Malekith.', rating: 6.5, releaseDate: '2013-10-29', poster: null, backdrop: null },
  { id: 100402, title: 'Captain America: The Winter Soldier', type: 'movie', overview: 'Captain America unravels a conspiracy within S.H.I.E.L.D.', rating: 7.7, releaseDate: '2014-03-20', poster: null, backdrop: null },
  { id: 118340, title: 'Guardians of the Galaxy', type: 'movie', overview: 'A group of intergalactic criminals pull together to save the galaxy.', rating: 7.9, releaseDate: '2014-07-30', poster: null, backdrop: null },
  { id: 99861, title: 'Avengers: Age of Ultron', type: 'movie', overview: 'The Avengers battle Ultron, a rogue AI intent on human extinction.', rating: 7.3, releaseDate: '2015-04-22', poster: null, backdrop: null },
  { id: 102899, title: 'Ant-Man', type: 'movie', overview: 'Scott Lang embraces his inner hero and helps Hank Pym plan a heist.', rating: 7.1, releaseDate: '2015-07-14', poster: null, backdrop: null },
  { id: 271110, title: 'Captain America: Civil War', type: 'movie', overview: 'Political pressure mounts causing a rift between Steve Rogers and Tony Stark.', rating: 7.4, releaseDate: '2016-04-27', poster: null, backdrop: null },
  { id: 284052, title: 'Doctor Strange', type: 'movie', overview: 'Neurosurgeon Stephen Strange discovers the hidden world of magic.', rating: 7.4, releaseDate: '2016-10-25', poster: null, backdrop: null },
  { id: 283995, title: 'Guardians of the Galaxy Vol. 2', type: 'movie', overview: 'The Guardians unravel Peter Quill’s true parentage.', rating: 7.6, releaseDate: '2017-04-19', poster: null, backdrop: null },
  { id: 315635, title: 'Spider-Man: Homecoming', type: 'movie', overview: 'Peter Parker balances high school with his superhero alter-ego.', rating: 7.4, releaseDate: '2017-07-05', poster: null, backdrop: null },
  { id: 284053, title: 'Thor: Ragnarok', type: 'movie', overview: 'Thor races against time to stop Hela and Ragnarok.', rating: 7.6, releaseDate: '2017-10-24', poster: null, backdrop: null },
  { id: 284054, title: 'Black Panther', type: 'movie', overview: 'T’Challa returns home to Wakanda to take his place as king.', rating: 7.4, releaseDate: '2018-02-13', poster: null, backdrop: null },
  { id: 299536, title: 'Avengers: Infinity War', type: 'movie', overview: 'The Avengers sacrifice all to defeat Thanos.', rating: 8.3, releaseDate: '2018-04-25', poster: null, backdrop: null },
  { id: 363088, title: 'Ant-Man and the Wasp', type: 'movie', overview: 'Scott Lang partners with Hope van Dyne on an urgent mission.', rating: 7.0, releaseDate: '2018-07-04', poster: null, backdrop: null },
  { id: 299537, title: 'Captain Marvel', type: 'movie', overview: 'Carol Danvers becomes one of the universe’s most powerful heroes.', rating: 6.9, releaseDate: '2019-03-06', poster: null, backdrop: null },
  { id: 299534, title: 'Avengers: Endgame', type: 'movie', overview: 'The Avengers assemble once more to reverse Thanos’ actions.', rating: 8.3, releaseDate: '2019-04-24', poster: null, backdrop: null },
  { id: 429617, title: 'Spider-Man: Far From Home', type: 'movie', overview: 'Peter Parker goes on a European vacation with school friends.', rating: 7.4, releaseDate: '2019-06-28', poster: null, backdrop: null },
  { id: 85271, title: 'WandaVision', type: 'series', overview: 'Wanda Maximoff and Vision live suburban lives in Westview.', rating: 8.2, releaseDate: '2021-01-15', poster: null, backdrop: null },
  { id: 88396, title: 'The Falcon and the Winter Soldier', type: 'series', overview: 'Sam Wilson and Bucky Barnes team up globally.', rating: 7.6, releaseDate: '2021-03-19', poster: null, backdrop: null },
  { id: 84958, title: 'Loki', type: 'series', overview: 'Loki resumes his role as God of Mischief.', rating: 8.2, releaseDate: '2021-06-09', poster: null, backdrop: null },
  { id: 497698, title: 'Black Widow', type: 'movie', overview: 'Natasha Romanoff confronts her past ledger.', rating: 7.2, releaseDate: '2021-07-07', poster: null, backdrop: null },
  { id: 566525, title: 'Shang-Chi and the Legend of the Ten Rings', type: 'movie', overview: 'Shang-Chi confronts his past and the Ten Rings organization.', rating: 7.6, releaseDate: '2021-09-01', poster: null, backdrop: null },
  { id: 524434, title: 'Eternals', type: 'movie', overview: 'An immortal alien race emerges to protect Earth.', rating: 6.9, releaseDate: '2021-11-03', poster: null, backdrop: null },
  { id: 88329, title: 'Hawkeye', type: 'series', overview: 'Clint Barton teams up with Kate Bishop.', rating: 7.5, releaseDate: '2021-11-24', poster: null, backdrop: null },
  { id: 634649, title: 'Spider-Man: No Way Home', type: 'movie', overview: 'Peter Parker asks Doctor Strange for help when his identity is revealed.', rating: 8.0, releaseDate: '2021-12-15', poster: null, backdrop: null },
  { id: 92749, title: 'Moon Knight', type: 'series', overview: 'Steven Grant discovers he shares a body with mercenary Marc Spector.', rating: 8.0, releaseDate: '2022-03-30', poster: null, backdrop: null },
  { id: 453395, title: 'Doctor Strange in the Multiverse of Madness', type: 'movie', overview: 'Doctor Strange travels across multiverses with America Chavez.', rating: 7.3, releaseDate: '2022-05-04', poster: null, backdrop: null },
  { id: 92782, title: 'Ms. Marvel', type: 'series', overview: 'Kamala Khan acquires superpower cosmic bangles.', rating: 6.5, releaseDate: '2022-06-08', poster: null, backdrop: null },
  { id: 616037, title: 'Thor: Love and Thunder', type: 'movie', overview: 'Thor enlists Valkyrie and Jane Foster to fight Gorr.', rating: 6.5, releaseDate: '2022-07-06', poster: null, backdrop: null },
  { id: 92783, title: 'She-Hulk: Attorney at Law', type: 'series', overview: 'Jennifer Walters navigates life as a green hulk attorney.', rating: 5.3, releaseDate: '2022-08-18', poster: null, backdrop: null },
  { id: 505642, title: 'Black Panther: Wakanda Forever', type: 'movie', overview: 'Wakanda fights to protect their nation from Namor.', rating: 7.2, releaseDate: '2022-11-09', poster: null, backdrop: null },
  { id: 640146, title: 'Ant-Man and the Wasp: Quantumania', type: 'movie', overview: 'Scott and Hope explore the Quantum Realm and face Kang.', rating: 6.1, releaseDate: '2023-02-15', poster: null, backdrop: null },
  { id: 447365, title: 'Guardians of the Galaxy Vol. 3', type: 'movie', overview: 'The Guardians rally to defend Rocket.', rating: 7.9, releaseDate: '2023-05-03', poster: null, backdrop: null },
  { id: 114472, title: 'Secret Invasion', type: 'series', overview: 'Nick Fury learns of an invasion of Earth by Skrulls.', rating: 6.0, releaseDate: '2023-06-21', poster: null, backdrop: null },
  { id: 609681, title: 'The Marvels', type: 'movie', overview: 'Carol Danvers, Kamala Khan and Monica Rambeau team up.', rating: 6.2, releaseDate: '2023-11-08', poster: null, backdrop: null },
  { id: 533535, title: 'Deadpool & Wolverine', type: 'movie', overview: 'Wolverine crosses paths with Deadpool.', rating: 7.8, releaseDate: '2024-07-24', poster: null, backdrop: null },
  { id: 138501, title: 'Agatha All Along', type: 'series', overview: 'Agatha Harkness finds herself powerless after a suspicious goth teen helps break her free.', rating: 7.5, releaseDate: '2024-09-18', poster: null, backdrop: null },
];

const DCEU_ITEMS: CollectionItem[] = [
  { id: 49521, title: 'Man of Steel', type: 'movie', overview: 'Clark Kent discovers his alien origin and superpowers.', rating: 6.6, releaseDate: '2013-06-12', poster: null, backdrop: null },
  { id: 209112, title: 'Batman v Superman: Dawn of Justice', type: 'movie', overview: 'Batman takes on Superman while a new threat arises.', rating: 5.9, releaseDate: '2016-03-23', poster: null, backdrop: null },
  { id: 297761, title: 'Suicide Squad', type: 'movie', overview: 'Imprisoned supervillains execute dangerous black ops missions.', rating: 5.9, releaseDate: '2016-08-03', poster: null, backdrop: null },
  { id: 297762, title: 'Wonder Woman', type: 'movie', overview: 'Diana Prince leaves Themyscira to help end World War I.', rating: 7.4, releaseDate: '2017-05-30', poster: null, backdrop: null },
  { id: 141052, title: 'Justice League', type: 'movie', overview: 'Fueled by his restored faith in humanity, Bruce Wayne enlists allies.', rating: 6.1, releaseDate: '2017-11-15', poster: null, backdrop: null },
  { id: 297802, title: 'Aquaman', type: 'movie', overview: 'Arthur Curry goes on a quest to prevent a war.', rating: 6.9, releaseDate: '2018-12-07', poster: null, backdrop: null },
  { id: 287947, title: 'Shazam!', type: 'movie', overview: 'A 14-year-old foster kid turns into adult superhero Shazam.', rating: 7.0, releaseDate: '2019-03-29', poster: null, backdrop: null },
  { id: 495764, title: 'Birds of Prey', type: 'movie', overview: 'Harley Quinn joins forces with Black Canary and Huntress.', rating: 6.1, releaseDate: '2020-02-05', poster: null, backdrop: null },
  { id: 464052, title: 'Wonder Woman 1984', type: 'movie', overview: 'Diana Prince comes into conflict with two formidable foes.', rating: 5.8, releaseDate: '2020-12-16', poster: null, backdrop: null },
  { id: 791373, title: 'Zack Snyder’s Justice League', type: 'movie', overview: 'Bruce Wayne aligns forces with Diana Prince to recruit metahumans.', rating: 8.1, releaseDate: '2021-03-18', poster: null, backdrop: null },
  { id: 436969, title: 'The Suicide Squad', type: 'movie', overview: 'Supervillains Harley Quinn, Bloodsport & Peacemaker join Task Force X.', rating: 7.6, releaseDate: '2021-07-28', poster: null, backdrop: null },
  { id: 110492, title: 'Peacemaker', type: 'series', overview: 'Peacemaker joins Task Force X for black ops missions.', rating: 8.3, releaseDate: '2022-01-13', poster: null, backdrop: null },
  { id: 436270, title: 'Black Adam', type: 'movie', overview: 'Black Adam is unleashed into the modern world.', rating: 6.5, releaseDate: '2022-10-19', poster: null, backdrop: null },
  { id: 594767, title: 'Shazam! Fury of the Gods', type: 'movie', overview: 'Shazam and his foster siblings fight the Daughters of Atlas.', rating: 6.1, releaseDate: '2023-03-15', poster: null, backdrop: null },
  { id: 298618, title: 'The Flash', type: 'movie', overview: 'Barry Allen uses his superpowers to travel back in time.', rating: 6.7, releaseDate: '2023-06-13', poster: null, backdrop: null },
  { id: 565770, title: 'Blue Beetle', type: 'movie', overview: 'Jaime Reyes gains an armor suit of alien scarab technology.', rating: 6.8, releaseDate: '2023-08-16', poster: null, backdrop: null },
  { id: 572802, title: 'Aquaman and the Lost Kingdom', type: 'movie', overview: 'Black Manta seeks revenge against Aquaman.', rating: 6.3, releaseDate: '2023-12-20', poster: null, backdrop: null },
  { id: 194764, title: 'The Penguin', type: 'series', overview: 'Oz Cobb makes his move to take control of Gotham City following the events of The Batman.', rating: 8.6, releaseDate: '2024-09-19', poster: null, backdrop: null },
];

const STAR_WARS_ITEMS: CollectionItem[] = [
  { id: 1893, title: 'Star Wars: Episode I - The Phantom Menace', type: 'movie', overview: 'Jedi Knights rescue Queen Amidala.', rating: 6.5, releaseDate: '1999-05-19', poster: null, backdrop: null },
  { id: 1894, title: 'Star Wars: Episode II - Attack of the Clones', type: 'movie', overview: 'Anakin Skywalker protects Padmé Amidala.', rating: 6.5, releaseDate: '2002-05-15', poster: null, backdrop: null },
  { id: 1895, title: 'Star Wars: Episode III - Revenge of the Sith', type: 'movie', overview: 'Anakin Skywalker turns to the Dark Side.', rating: 7.4, releaseDate: '2005-05-17', poster: null, backdrop: null },
  { id: 11, title: 'Star Wars: Episode IV - A New Hope', type: 'movie', overview: 'Luke Skywalker joins the Rebellion to save the galaxy.', rating: 8.2, releaseDate: '1977-05-25', poster: null, backdrop: null },
  { id: 1891, title: 'Star Wars: Episode V - The Empire Strikes Back', type: 'movie', overview: 'The Empire strikes back as Luke trains with Yoda.', rating: 8.4, releaseDate: '1980-05-20', poster: null, backdrop: null },
  { id: 1892, title: 'Star Wars: Episode VI - Return of the Jedi', type: 'movie', overview: 'The Rebels dispatch to Endor to destroy the second Death Star.', rating: 7.9, releaseDate: '1983-05-25', poster: null, backdrop: null },
  { id: 140607, title: 'Star Wars: The Force Awakens', type: 'movie', overview: 'Rey and Finn team up with Han Solo.', rating: 7.3, releaseDate: '2015-12-15', poster: null, backdrop: null },
  { id: 330459, title: 'Rogue One: A Star Wars Story', type: 'movie', overview: 'Rebel forces steal the Death Star plans.', rating: 7.5, releaseDate: '2016-12-14', poster: null, backdrop: null },
  { id: 181808, title: 'Star Wars: The Last Jedi', type: 'movie', overview: 'Rey develops her newfound abilities with Luke Skywalker.', rating: 6.8, releaseDate: '2017-12-13', poster: null, backdrop: null },
  { id: 348350, title: 'Solo: A Star Wars Story', type: 'movie', overview: 'Board the Millennium Falcon and journey with Han Solo.', rating: 6.6, releaseDate: '2018-05-23', poster: null, backdrop: null },
  { id: 181812, title: 'Star Wars: The Rise of Skywalker', type: 'movie', overview: 'The surviving Resistance faces the First Order once more.', rating: 6.3, releaseDate: '2019-12-18', poster: null, backdrop: null },
  { id: 82856, title: 'The Mandalorian', type: 'series', overview: 'A lone bounty hunter travels the outer reaches of the galaxy.', rating: 8.4, releaseDate: '2019-11-12', poster: null, backdrop: null },
  { id: 92830, title: 'Obi-Wan Kenobi', type: 'series', overview: 'Jedi Master Obi-Wan Kenobi watches over young Luke Skywalker.', rating: 7.1, releaseDate: '2022-05-26', poster: null, backdrop: null },
  { id: 83867, title: 'Andor', type: 'series', overview: 'Cassian Andor discovers the difference he can make in the rebellion.', rating: 8.6, releaseDate: '2022-09-21', poster: null, backdrop: null },
  { id: 114461, title: 'Ahsoka', type: 'series', overview: 'Former Jedi Knight Ahsoka Tano investigates an emerging threat.', rating: 7.6, releaseDate: '2023-08-22', poster: null, backdrop: null },
  { id: 114479, title: 'The Acolyte', type: 'series', overview: 'An investigation into a shocking crime spree pits a respected Jedi Master against a dangerous warrior.', rating: 5.2, releaseDate: '2024-06-04', poster: null, backdrop: null },
];

const HARRY_POTTER_ITEMS: CollectionItem[] = [
  { id: 671, title: 'Harry Potter and the Sorcerer\'s Stone', type: 'movie', overview: 'Harry discovers he is a wizard and attends Hogwarts.', rating: 7.9, releaseDate: '2001-11-16', poster: null, backdrop: null },
  { id: 672, title: 'Harry Potter and the Chamber of Secrets', type: 'movie', overview: 'Harry returns for his second year and uncovers dark secrets.', rating: 7.7, releaseDate: '2002-11-13', poster: null, backdrop: null },
  { id: 673, title: 'Harry Potter and the Prisoner of Azkaban', type: 'movie', overview: 'Harry, Ron and Hermione return to Hogwarts for their third year.', rating: 8.0, releaseDate: '2004-05-31', poster: null, backdrop: null },
  { id: 674, title: 'Harry Potter and the Goblet of Fire', type: 'movie', overview: 'Harry finds himself selected as the fourth contestant in the Triwizard Tournament.', rating: 7.8, releaseDate: '2005-11-16', poster: null, backdrop: null },
  { id: 675, title: 'Harry Potter and the Order of the Phoenix', type: 'movie', overview: 'With their warning about Lord Voldemort\'s return scoffed at.', rating: 7.7, releaseDate: '2007-06-28', poster: null, backdrop: null },
  { id: 767, title: 'Harry Potter and the Half-Blood Prince', type: 'movie', overview: 'As Lord Voldemort tightens his grip on both the Muggle and wizarding worlds.', rating: 7.7, releaseDate: '2009-07-15', poster: null, backdrop: null },
  { id: 12444, title: 'Harry Potter and the Deathly Hallows: Part 1', type: 'movie', overview: 'Harry, Ron and Hermione race against time to destroy the Horcruxes.', rating: 7.8, releaseDate: '2010-10-17', poster: null, backdrop: null },
  { id: 12445, title: 'Harry Potter and the Deathly Hallows: Part 2', type: 'movie', overview: 'The final battle between Harry Potter and Lord Voldemort at Hogwarts.', rating: 8.1, releaseDate: '2011-07-12', poster: null, backdrop: null },
  { id: 259316, title: 'Fantastic Beasts and Where to Find Them', type: 'movie', overview: 'Magizoologist Newt Scamander arrives in New York.', rating: 7.3, releaseDate: '2016-11-16', poster: null, backdrop: null },
  { id: 338952, title: 'Fantastic Beasts: The Crimes of Grindelwald', type: 'movie', overview: 'Gellert Grindelwald escapes custody and sets about gathering followers.', rating: 6.8, releaseDate: '2018-11-14', poster: null, backdrop: null },
  { id: 338953, title: 'Fantastic Beasts: The Secrets of Dumbledore', type: 'movie', overview: 'Professor Albus Dumbledore knows Gellert Grindelwald is moving to seize control.', rating: 6.7, releaseDate: '2022-04-06', poster: null, backdrop: null },
];

const FAST_ITEMS: CollectionItem[] = [
  { id: 9799, title: 'The Fast and the Furious', type: 'movie', overview: 'Undercover cop Brian O\'Conner infiltrates street racing.', rating: 7.0, releaseDate: '2001-06-22', poster: null, backdrop: null },
  { id: 584, title: '2 Fast 2 Furious', type: 'movie', overview: 'Brian O\'Conner teams up with Roman Pearce in Miami.', rating: 6.5, releaseDate: '2003-06-05', poster: null, backdrop: null },
  { id: 9615, title: 'The Fast and the Furious: Tokyo Drift', type: 'movie', overview: 'Sean Boswell learns the art of drift racing in Tokyo.', rating: 6.4, releaseDate: '2006-06-03', poster: null, backdrop: null },
  { id: 13804, title: 'Fast & Furious', type: 'movie', overview: 'Dominic Toretto and Brian O\'Conner rejoin forces.', rating: 6.7, releaseDate: '2009-04-03', poster: null, backdrop: null },
  { id: 51497, title: 'Fast Five', type: 'movie', overview: 'Dom Toretto and his crew plan a $100 million heist in Rio.', rating: 7.2, releaseDate: '2011-04-20', poster: null, backdrop: null },
  { id: 82992, title: 'Fast & Furious 6', type: 'movie', overview: 'Hobbs offers Dom Toretto full pardons for his crew to take down Owen Shaw.', rating: 6.8, releaseDate: '2013-05-21', poster: null, backdrop: null },
  { id: 337339, title: 'Furious 7', type: 'movie', overview: 'Deckard Shaw seeks revenge against Dominic Toretto’s family.', rating: 7.3, releaseDate: '2015-04-01', poster: null, backdrop: null },
  { id: 335984, title: 'The Fate of the Furious', type: 'movie', overview: 'A mysterious woman seduces Dom into the world of crime.', rating: 6.9, releaseDate: '2017-04-12', poster: null, backdrop: null },
  { id: 384018, title: 'Fast & Furious Presents: Hobbs & Shaw', type: 'movie', overview: 'Lawman Luke Hobbs and outcast Deckard Shaw form an unlikely alliance.', rating: 6.9, releaseDate: '2019-08-01', poster: null, backdrop: null },
  { id: 385128, title: 'F9: The Fast Saga', type: 'movie', overview: 'Dom Toretto confronts the sins of his past when his brother Jakob resurfaces.', rating: 6.5, releaseDate: '2021-05-19', poster: null, backdrop: null },
  { id: 385687, title: 'Fast X', type: 'movie', overview: 'Dom Toretto and his family are targeted by Dante Reyes.', rating: 7.2, releaseDate: '2023-05-17', poster: null, backdrop: null },
];

const LOTR_ITEMS: CollectionItem[] = [
  { id: 49051, title: 'The Hobbit: An Unexpected Journey', type: 'movie', overview: 'Bilbo Baggins embarks on a quest to reclaim the Dwarf Kingdom of Erebor.', rating: 7.3, releaseDate: '2012-11-26', poster: null, backdrop: null },
  { id: 57158, title: 'The Hobbit: The Desolation of Smaug', type: 'movie', overview: 'The Dwarves, Bilbo and Gandalf escape the Misty Mountains.', rating: 7.6, releaseDate: '2013-12-11', poster: null, backdrop: null },
  { id: 122917, title: 'The Hobbit: The Battle of the Five Armies', type: 'movie', overview: 'Bilbo and the Dwarves are forced to engage in a war against an array of combatants.', rating: 7.3, releaseDate: '2014-12-10', poster: null, backdrop: null },
  { id: 120, title: 'The Lord of the Rings: The Fellowship of the Ring', type: 'movie', overview: 'A meek Hobbit and eight companions set out to destroy the One Ring.', rating: 8.4, releaseDate: '2001-12-18', poster: null, backdrop: null },
  { id: 121, title: 'The Lord of the Rings: The Two Towers', type: 'movie', overview: 'Frodo and Sam continue their journey to Mordor.', rating: 8.4, releaseDate: '2002-12-18', poster: null, backdrop: null },
  { id: 122, title: 'The Lord of the Rings: The Return of the King', type: 'movie', overview: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army.', rating: 8.5, releaseDate: '2003-12-17', poster: null, backdrop: null },
  { id: 84773, title: 'The Lord of the Rings: The Rings of Power', type: 'series', overview: 'Epic drama set thousands of years before the events of J.R.R. Tolkien’s The Hobbit.', rating: 7.3, releaseDate: '2022-09-01', poster: null, backdrop: null },
];

const MCU_COLLECTION: CollectionData = {
  id: '86311',
  name: 'Marvel Cinematic Universe (MCU) Saga',
  overview: 'The complete Marvel Cinematic Universe containing all 38+ individual superhero movies, Avengers sagas, and 25+ Disney+ original TV series in chronological order.',
  poster: 'https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9vKoWRotio.jpg',
  backdrop: 'https://image.tmdb.org/t/p/original/mU129z6v3B0i0G6512gJ87t9e.jpg',
  movies: MCU_ITEMS,
};

const DCEU_COLLECTION: CollectionData = {
  id: '209131',
  name: 'DC Extended Universe (DCEU) Saga',
  overview: 'The complete DC Extended Universe containing Batman, Superman, Wonder Woman, Justice League movies, Peacemaker & The Penguin series.',
  poster: 'https://image.tmdb.org/t/p/w500/vOWcqC4oDQws1doDWLO7d3dh5qc.jpg',
  backdrop: 'https://image.tmdb.org/t/p/original/mU129z6v3B0i0G6512gJ87t9e.jpg',
  movies: DCEU_ITEMS,
};

const STAR_WARS_COLLECTION: CollectionData = {
  id: '10',
  name: 'Star Wars Saga & Series',
  overview: 'The complete Star Wars Skywalker Saga alongside hit Disney+ series including The Mandalorian, Ahsoka, and Andor.',
  poster: 'https://image.tmdb.org/t/p/w500/6FfCtAuVAW8zJezfvV7aRHaBObD.jpg',
  backdrop: 'https://image.tmdb.org/t/p/original/zqkmTXzjkAgmdKd8v3WvVJgP30w.jpg',
  movies: STAR_WARS_ITEMS,
};

const HARRY_POTTER_COLLECTION: CollectionData = {
  id: '1241',
  name: 'Wizarding World (Harry Potter & Fantastic Beasts)',
  overview: 'The complete Wizarding World saga containing all 8 Harry Potter movies and Fantastic Beasts series.',
  poster: 'https://image.tmdb.org/t/p/w500/wuMc28hVYZefD9BBxwbqVQzYdZ.jpg',
  backdrop: 'https://image.tmdb.org/t/p/original/hzi12s.jpg',
  movies: HARRY_POTTER_ITEMS,
};

const FAST_COLLECTION: CollectionData = {
  id: '9799',
  name: 'Fast & Furious Saga',
  overview: 'The adrenaline-fueled Fast & Furious movie franchise featuring Dom Toretto and family.',
  poster: 'https://image.tmdb.org/t/p/w500/f8920s.jpg',
  backdrop: 'https://image.tmdb.org/t/p/original/fz12s.jpg',
  movies: FAST_ITEMS,
};

const LOTR_COLLECTION: CollectionData = {
  id: '119',
  name: 'Lord of the Rings & Middle-earth Saga',
  overview: 'The legendary J.R.R. Tolkien Middle-earth saga containing Lord of the Rings, Hobbit, and Rings of Power.',
  poster: 'https://image.tmdb.org/t/p/w500/6oom5WLiST2y1GqGzL2fN1zN3.jpg',
  backdrop: 'https://image.tmdb.org/t/p/original/lz12s.jpg',
  movies: LOTR_ITEMS,
};

export const ALL_COLLECTIONS: Record<string, CollectionData> = {
  '86311': MCU_COLLECTION,
  '209131': DCEU_COLLECTION,
  '10': STAR_WARS_COLLECTION,
  '1241': HARRY_POTTER_COLLECTION,
  '9799': FAST_COLLECTION,
  '119': LOTR_COLLECTION,
};

export const FEATURED_COLLECTIONS = [
  { id: '86311', name: 'Marvel Cinematic Universe (MCU)', key: 'mcu', poster: MCU_COLLECTION.poster },
  { id: '209131', name: 'DC Extended Universe (DCEU)', key: 'dceu', poster: DCEU_COLLECTION.poster },
  { id: '10', name: 'Star Wars Collection', key: 'star-wars', poster: STAR_WARS_COLLECTION.poster },
  { id: '1241', name: 'Wizarding World (Harry Potter)', key: 'harry-potter', poster: HARRY_POTTER_COLLECTION.poster },
  { id: '9799', name: 'Fast & Furious Saga', key: 'fast', poster: FAST_COLLECTION.poster },
  { id: '119', name: 'Lord of the Rings Saga', key: 'lotr', poster: LOTR_COLLECTION.poster },
];

export const getCollectionsList = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json(FEATURED_COLLECTIONS);
};

export const getCollectionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawId = req.params.id;
    const collectionId = Array.isArray(rawId) ? rawId[0] : rawId;
    const filterType = (req.query.type as string) || 'all';

    if (!collectionId) {
      res.status(400).json({ message: 'Collection ID parameter is required.' });
      return;
    }

    const data = ALL_COLLECTIONS[collectionId] || MCU_COLLECTION;

    const enrichedMoviesPromises = data.movies.map(async (item) => {
      try {
        const mediaType = item.type === 'series' ? 'tv' : 'movie';
        const tmdbDetails = await getTMDBMovieDetails(item.id, mediaType);
        const resolvedPoster = tmdbDetails?.poster_path || tmdbDetails?.poster;
        if (tmdbDetails) {
          return {
            ...item,
            title: tmdbDetails.title || tmdbDetails.name || item.title,
            overview: tmdbDetails.overview || item.overview,
            rating: tmdbDetails.vote_average || item.rating,
            releaseDate: tmdbDetails.release_date || tmdbDetails.first_air_date || item.releaseDate,
            poster: resolveImageUrl(resolvedPoster, TMDB_IMAGE_BASE) || item.poster,
            backdrop: resolveImageUrl(tmdbDetails.backdrop_path || tmdbDetails.backdrop || item.backdrop, TMDB_BACKDROP_BASE),
          };
        }
      } catch (err) {}

      return {
        ...item,
        poster: resolveImageUrl(item.poster, TMDB_IMAGE_BASE),
        backdrop: resolveImageUrl(item.backdrop, TMDB_BACKDROP_BASE),
      };
    });

    const enrichedMovies = await Promise.all(enrichedMoviesPromises);

    let filteredMovies = enrichedMovies;
    if (filterType === 'movie') {
      filteredMovies = enrichedMovies.filter((m) => m.type === 'movie');
    } else if (filterType === 'series') {
      filteredMovies = enrichedMovies.filter((m) => m.type === 'series');
    }

    const sortedMovies = [...filteredMovies].sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateA - dateB;
    });

    res.status(200).json({
      ...data,
      movies: sortedMovies,
    });
  } catch (error: any) {
    console.error('Error fetching collection details:', error.message);
    res.status(500).json({ message: 'Failed to fetch collection details', error: error.message });
  }
};
