
# Driverless
A web-based UI and mod managment system for a [BeamMP](https://docs.beammp.com/) server.


## About
Driverless features a live map of the server showing the current postions of all the players in the game. It also includes a menu to change the map, max players, and max cars. Mods can also be added and enabled/disabled within the UI.

## Installation 

Windows:  
This project does not yet natively support running on Windows, however I would recommend installing Ubuntu for Windows from the Microsoft Store and use the linux installation guide below

Linux:

1. Install NodeJS and npm

```bash
  sudo apt install nodejs
```
```bash
  sudo apt install npm
```

2. Install Diverless with git

```bash
  git clone https://github.com/kjelstromjr/Driverless.git
```

3. Install lua and some dependencies
```bash
  sudo apt install liblua5.3-dev
```
```bash
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

```bash
  sudo node main.js
```

The webpage can now be accessed at localhost:3000
## Maintainance

#### Updates:
Changes to the code of this project can simply be downloaded onto your system using `git pull`

Any updates to the BeamMP server file needs to be manually redownloaded from the offical [BeamMP Github](https://github.com/BeamMP/BeamMP-Server/releases/)

#### Going Public:
Making your server's webpage public is very simple. First, go into `main.js` and change the `PORT` variable on line 11 to the port you would like to use.  

If you are new to web hosting, port 80 is for HTTP, and is used by all websites on the internet. Please note that HTTP is not secure and should be use with caution. You can also use any other, non-reserved ports for your site.

Your chosen port, as well as port 30814 for BeamMP, need to be port forwarded on your network.

DISCLAIMER:
By port forwarding, you understand the risks associated with opening ports on your network and void the right to hold the creators of Driverless and BeamMP accoutable for any negative consequences that result.

You can now access your server using your ip address by entering into your web browser:

`http://my.ip.address` or `http://my.ip.address:port`

