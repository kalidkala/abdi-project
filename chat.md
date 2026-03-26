Build a complete web application for managing Ethiopian basketball league standings.

The application should allow users to input and manage team performance data, automatically calculate rankings, and display a clean standings table.

CORE FEATURES:

1. Team Input Form:

* Input fields for:

  * Team name
  * Team logo (file upload, only JPG and PNG allowed)
  * Games played
  * Wins
  * Losses
  * Points scored
  * Points conceded
* Show image preview before saving

2. Automatic Calculations:

* Calculate point difference (scored - conceded)
* Calculate total points (wins × 2)

3. Standings Table:

* Display:

  * Position (rank)
  * Team logo and name
  * Played, wins, losses
  * Point difference
  * Total points
* Automatically sort teams by:

  1. Total points (descending)
  2. Point difference (descending)

4. Team Management:

* Allow editing of existing teams
* Allow deleting teams

5. Data Persistence:

* Save all data locally so it remains after page refresh

6. User Interface:

* Modern sports-style UI similar to a league standings board
* Card-style rows with rounded corners
* Highlight bottom teams (last 2) as relegation zone (red indicator)
* Clean dark theme with strong contrast

7. Interaction:

* Hide the input form by default
* Add a floating "+" button at the bottom right
* Clicking the button toggles the form visibility

8. Language Support:

* Add a language toggle button (EN / AM)
* Table headers should switch between English and Amharic

9. Responsiveness:

* Fully responsive layout for mobile and desktop
* Adjust font sizes and layout for smaller screens

10. Image Handling:

* Accept only JPG and PNG files
* Convert and store images so they can be displayed in the table

GOAL:
The final result should behave like a real interactive sports standings app with smooth user experience, dynamic updates, and persistent data storage.
“Make the UI look like a professional sports standings dashboard similar to modern football or basketball league tables.”