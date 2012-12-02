===========
RETRO-CATZ
===========
*Participation to the github game off 2012*

Enjoy ;)


Description
=========
This game contains a unique experience (Steve job said it's a revolution) where the player will play with in multiple
inter-connected games in different tabs.

*TODO: update those old screen shots*

The player will start with a text game: 

.. image:: https://github.com/Incubatio/game-off-2012/blob/master/src/public/img/Adventure2.0.png 
   :alt: Adventure2.0.png 

Will have then a second tab including 2 dimensions games

.. image:: https://github.com/Incubatio/game-off-2012/blob/master/src/public/img/cheated_pong.png
   :alt: cheated_pong.png 
    

(same tab but different game phase ...)

.. image:: https://github.com/Incubatio/game-off-2012/blob/master/src/public/img/da_square_moon.png
   :alt: da_square_moon.png

To finally have a classical rpg (cf: final fantasy VI, chrono trigger ..) in colors with animated sprites and a tmx map

(no screenshot for the last part because of the a potential spoil, it starts with a black screen)


Install
=======

``npm install``

``node ./src/server.js``

browse: ``http://localhost:3000``


Requirements
============

Server
  - Unix based (because of github clone commands, i'll try to test an fix, pm me if urgent)
  - node > v0.8.14


Client:
  - browser with full html5 support (tested on Firefox 16, Safari 6, Chrome 23)



Credits
=======
sounds:
  - Glass_break: http://soundfxcenter.com
  - terminal message: http://opengameart.org/content/interface-sounds-starter-pack

animations:
  - firefox + octocat: browserquest
  - vortex chrono trigger: http://spriters-resource.com
  - zombies: http://opengameart.org/content/zombie-sprites

image:
  - stargate: wikipedia http://fr.wikipedia.org/wiki/Fichier:Stargate-color.png

tiles. 
  - http://www.lostgarden.com/2006/07/more-free-game-graphics.html


Special thanks to the testers, to the open source community 
to Simon oberhammer (creator of gamejs)
to the mozilla dev center which is full of good documentation
and all node/javascript community, and of course github for that contest :).

Post-dev Notes
==============

The Github Game Off was really for me an opportunity to get back in my ambition to someday be part of the people who do good
video game where nowadays video games became so rare. By good i'm no talking about those fancy graphics but about games
that let you a signature deep inside, changing players oneself without puting them out of a fun and intense adventure.

My first idea was a game generator, more precisely  create an entity-compenent system architecture and allow the creations 
of different game environment by enabling/disabling systems and building hero and ennemies by assigning and unassigning components.
 
But after 2 weeks of development, I felt I should produce something before deadline ^^.

So this week i chose to make multiple game interacting with each other.
Lately I discovered Adventure, a text game, I was really amused by the fact I felt that a 1976 game was giving me more fun than any other recent gamed I played.

I chose to include a text game for the first tab and as mainline (story line). I was really surprised by the testers first
feedback, nowadays most player are unable to play a game without a navigation system and/or visual feedback way. Also
in the first testable "version", is did push them in the game like "Adventure" did, without tutorial, which was a bit rough.

Seems like nowdays there's no much place for people who loves supreme commander over alpha beta pruning game (sorry i meant starcraft) 
or D&D over recent mmorpg ^^. 
