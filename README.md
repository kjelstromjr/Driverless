
# Driverless
A web-based UI and mod managment system for a [BeamMP](https://docs.beammp.com/) server.


## About
Driverless features a live map of the server showing the current postions of all the players in the game. It also includes a menu to change the map, max players, and max cars. Mods can also be added and enabled/disabled within the UI.

## Installation 

Windows:  
This project does not yet natively support running on windows, however I would recommend installing Ubuntu for Windows from the Microsoft Store and using the linux installation guide below

Linux:

1. Install NodeJS  

```bash
  sudo apt install nodejs
```

2. Install Diverless with git

```bash
  git clone https://github.com/kjelstromjr/Driverless.git
```

3. Install lua and some dependencies
```bash
  sudo apt install liblua5.3-dev
  sudo apt install lua-socket
  sudo apt install lua-json
```

4. Install BeamMP to the new Driverless directory using their [installation guide](https://docs.beammp.com/server/create-a-server/). If you are installing on a system using the command line, I would recommend using `wget` to download the server file. For example:
```bash
  wget https://github.com/BeamMP/BeamMP-Server/releases/download/v3.4.1/BeamMP-Server.ubuntu.22.04.x86_64
```

5. Create a new directory `DriverlessPlugin` in `Resources/Server`

6. Create a new directory `Disabled` in `Resources`

7. Move the Driverless plugin `Driverless.lua` from `Driverless/plugins/` to `Driverless/Resources/Server/DriverlessPlugin/`

8. Run in `/Driverless`
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
