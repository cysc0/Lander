# (Potential) Challenges
* How to get currently running games, and how can a user join an existing game?  
  Maybe we allow one topic per user. If that user is in game, the topic
  shows a spectator view for other users.  
  (topic name = user name)  
  If the user is not in a game, We can show their game history etc.
  This should work nicely, as the homescreen can show signed up users,
  and each user would be a link to their current game (or scores)
# Todos
## Frontend
Maybe we configure as SPA. If no current session, page is just signup/login
Otherwise we offer view(s) containing:
* Current user's game history w/scores, etc. Render as cards?
* List of running games for user to join and disrupt the player. Render as cards?
* List of courses for user to make an attempt at
* Link to page to create new course and subsequently play it
## Backend
* Course Schema
    pk  ID      int
        path    [(x, y), ...]
    When generating a course, we should get two Latitude Longitude points
        Using that, we should interpolate ~10 evenly spaced coords
        At each point, we should find the elevation, and x=[0, 1, 2, ..., 9]
        And y should be elevation at that point
* User Schema
    pk  ID      int
        email   str
        ~PASSWORD STUFF~
    fk  history Game(s)
* Game Schema
    pk  ID      int
        score   int (maybe time to complete course?)
    fk  course  Course
## Game
* How do we generate a world? Maybe the player just has to get from the start
  to the end in the shortest time possible?
  This would simplify game logic to essentialy just two rules: landing force & angle
* We need separate player and spectator view for the game. The spectator view could
  probably just be the game itself w/o bound click actions. We then add buttons below
  the window to push game-state updates down the channel to disrupt the player.
* Spectator actions: swap A/D keys, apply momentary throttle, cut throttle for ~5 secs...
  We might end up needing a timer so that spectators can't annoy the player too much
## Misc
* Remove or implement require_auth.ex
* Make signpu actually diff than login
* Session cookie for page refresh