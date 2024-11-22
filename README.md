
# Driverless
A web-based UI and mod managment system for a [BeamMP](https://docs.beammp.com/) server.


## About
Driverless features a live map of the server showing the current postions of all the players in the game. It also includes a menu to change the map, max players, and max cars. Mods can also be added and enabled/disabled within the UI.

## Installation 

1. Install NodeJS  

Windows:  
[NodeJS prebuilt installer](https://nodejs.org/en/download/prebuilt-installer)  

Linux:
```bash
  sudo apt install nodejs
```

2. Install Diverless with git

```bash
  git clone https://github.com/kjelstromjr/Driverless.git
```
3. Install BeamMP to the new Driverless directory using their [installation guide](https://docs.beammp.com/server/create-a-server/)

4. Create a new directory `DriverlessPlugin` in `Resources/Server`

5. Create a new directory `Disabled` in `Resources`

6. Move the Driverless plugin `Driverless.lua` from `Driverless/plugins/` to `Driverless/Resources/Server/DriverlessPlugin/`

7. Run in `/Driverless`
```bash
  npm install
```
## Starting Server
Run the server with the command:

Windows:
```bash
  node main.js
```

Linux:
```bash
  sudo node main.js
```

The webpage can now be accessed at localhost:3000
