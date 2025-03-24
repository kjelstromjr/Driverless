
# Driverless
A web-based UI and mod managment system for a [BeamMP](https://docs.beammp.com/) server.


## About
Driverless features a live map of the server showing the current postions of all the players in the game. It also includes a menu to change the map, max players, and max cars. Mods can also be added and enabled/disabled within the UI.

## Installation

Side note: Check out the [Offical BeamMP Installation Page](https://docs.beammp.com/server/create-a-server/) for more information on running a server.

Windows:  
This project does not yet natively support running on Windows, however I would recommend installing Ubuntu for Windows from the Microsoft Store and use the linux installation guide below

Linux:

1. Install Diverless using git or download the latest release

```bash
git clone https://github.com/kjelstromjr/Driverless.git
```

2. Run the setup program

```bash
./setup
```

If you haven't already, get a key from [Keymaster](https://beammp.com/keymaster). You will be prompted to enter it in at the end of setup

You may need to run the following to add execution privilages to the program
```bash
chmod +x setup
```

## Starting Server
Run the server with the command:

```bash
sudo node main.js
```

The webpage can now be accessed at localhost:[the port you chose (default 3000)]
## Maintainance

#### Updates:
Changes to the code of this project can simply be downloaded onto your system using `git pull`

Any updates to the BeamMP server file needs to be manually redownloaded from the offical [BeamMP Github](https://github.com/BeamMP/BeamMP-Server/releases/)

#### Going Public:
Making your server's webpage public is very simple. First, go into `main.js` and change the `PORT` variable on line 10 to the port you would like to use.  

If you are new to web hosting, port 80 is for HTTP, and is used by all websites on the internet. Please note that HTTP is not secure and should be used with caution. You can also use any other, non-reserved ports for your site.

Your chosen port, as well as port 30814 for BeamMP, need to be port forwarded on your network.

DISCLAIMER:
By port forwarding, you acknowledge the risks associated with opening ports on your network and waive any right to hold the creators of Driverless and BeamMP accountable for any negative consequences.

You can now access your server using your ip address by entering into your web browser:

`http://my.ip.address` or `http://my.ip.address:port`

