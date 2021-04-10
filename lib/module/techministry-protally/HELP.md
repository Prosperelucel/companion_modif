## ProTally

This module will connect to any computer running ProTally to activate tally windows.

ProTally can be downloaded from: <https://github.com/josephdadams/ProTally/releases>

### Available commands

* Activate Tally window with normal modes "Preview", "Program", "PreviewProgram"
* Clear any activated Tally Window
* Beacon Mode (new) - Flash the tally window with the specified color

### To Use This Module

* In Companion:
    * Create a new module instance for ProTally, using the IP address of the computer running ProTally. You can create multiple instances if you need to control multiple computers running ProTally.
    * Specify the port Companion should send tally data to (Default is 9800).
    * Set an action on a button to send Preview, Program, Preview+Program, or Beacon, and choose the target Tally window. For Beacon, you can set a custom color and blinking rate.
* In ProTally:
    * Choose "Bitfocus Companion" in the device list at the top of the settings menu.
    * Enter a listen port that matches the port you chose in Companion.
    * Click "Connect".
    * Enable the ProTally windows you want to be controllable from Companion, and position them where desired.
    * ProTally will listen for data from Companion to show a Preview, Program, or Preview/Program box. You can also send a "Beacon" from Companion which will flash a box with a custom color at a custom rate.