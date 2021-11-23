# GhostShip

**Authors:** [@weaversam8](https://github.com/weaversam8), [@CynthiaSynth](https://github.com/CynthiaSynth), and [@Sam-ZHGW](https://github.com/Sam-ZHGW).

The integrated "Ghost Ship" project for [Dr. Chris Martens](https://sites.google.com/ncsu.edu/cmartens)' Fall 2021 [CSC 495/582 Computational Models of Interactive Narrative](https://sites.google.com/ncsu.edu/csc582-f2021) course.

This project integrates and expands upon code which has been separately assembled from repositories:

- [weaversam8/BagOfTricks](https://github.com/weaversam8/BagOfTricks) - the Inform 7 extension enabling interaction with the Inform 7 world model from Javascript
  - The extension's Inform 7 source code is located in `GhostShip.materials/Extensions/Sam Weaver/Bag of Tricks.i7x`
  - The extensions JS companion source code is located in `GhostShip.materials/Templates/Bag of Tricks/magic.js`
- [Sam-ZHGW/GhostShip_CSC582](https://github.com/Sam-ZHGW/GhostShip_CSC582) - the Inform 7 source code for our proof of concept game
  - The primary Inform 7 source file is located at `GhostShip.inform/Source/story.ni`
- [CynthiaSynth/PhaserPointAndClick](https://github.com/CynthiaSynth/PhaserPointAndClick) - a Javascript game built with the [Phaser](https://phaser.io/) game engine to provide a frontend for the proof of concept game
  - The files for the HTML + Javascript frontend are located in the `GhostShip.materials/Templates/Phaser Game` directory

## Development

This project was built using Inform 7 build 6M62[^1] (I6/v6.34 lib 6/12N), and should be edited using the [Inform 7 IDE](http://inform7.com/downloads/).

[^1]: For more information about Inform's versioning strategy, please reference [the Inform changelog](http://inform7.com/changes/CI_1_1.html).

To build the project after making changes to any of the above components:

1. Open `GhostShip.inform` as a project in the Inform app.
2. Make changes to the Inform 7 source code and/or the Phaser Game website template.
3. From the menubar, select `Release > Release for Testing`.[^2]
   - This will compile all resources into a web app to be served from the `GhostShip.materials/Release` directory.
4. Navigate to the `GhostShip.materials/Release` directory and start a web server.
   - If you have Python 3 installed on your system, you can do this with the command `python3 -m http.server`.

[^2]: "Release for Testing" is needed because the Bag of Tricks interpreter currently relies on some Inform debug symbols generated during this build process. Future releases may not require these.
