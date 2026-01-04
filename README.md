
# Driverless
A web-based UI and mod managment system for a [BeamMP](https://docs.beammp.com/) server.


## About
Driverless features a live map of the server showing the current postions of all the players in the game. It also includes a menu to change the map, max players, and max cars. Mods can also be added and enabled/disabled within the UI.

## Installation

Side note: Check out the [Offical BeamMP Installation Page](https://docs.beammp.com/server/create-a-server/) for more information on running a server.

1. Install Docker. We recommend installing [Docker Desktop](https://docs.docker.com/desktop/) for simplicity

2. Clone the respository with git or download the zip file for the latest version

```bash
git clone https://github.com/kjelstromjr/Driverless
```

4. Open a terminal and change the current directory to the Driverless folder

5. Start Driverless with the following command:

```bash
docker-compose up
```
> This may take a while since the image needs to build for the first time

5. You should now have a fully functional Driverless and Beammp server!

9. Access the Driverless website using http://localhost

## Starting Server
To start up the server, simply run:

```bash
docker-compose up
```

The webpage can now be accessed at http://localhost

## Setup
When you open up the webpage for the first time, you will see a setup page. Here you will enter two items:
- BeamMP Key: This is the server key that will authenticate your server with BeamMP
- Admin Password: This is the password you will use to access the Admin mode (see Maintainance for more details about Admin mode)

## Maintainance

#### Updates:
Changes to the code of this project can applied using the following steps:
1. If you used git to download the original code, use:

```bash
git pull
```

1. If you downloaded using the version, download the latest version. You will have to copy the following to your new folder: `Resources`, `Roads`, `mods.json`

2. Update the image

```bash
docker-compose up --build
```

Any updates to the BeamMP server file needs to be manually redownloaded from the offical [BeamMP Github](https://github.com/BeamMP/BeamMP-Server/releases/)

#### Administration:
You can access the admin mode using Ctrl+Alt+A. This will give you full control over the server, including choosing what the public has access to.

#### HTTPS:
To enable HTTPS, open `server.config.json` and change `enable` under `https` to `true`. Then add the locations of your SSL key and certificate in `keyPath` and `certPath`.

#### Changing the port:
To change the port of Driverless, open `server.config.json` and change the port option

#### Going Public:
Making your server public requires that you setup your router to forward port 80 (Default Driverless) and 30814 (Beammp). Allow TCP and UDP for both.

DISCLAIMER:
By port forwarding, you acknowledge the risks associated with opening ports on your network and waive any right to hold the creators of Driverless and BeamMP accountable for any negative consequences.

You can now access your server using your ip address by entering into your web browser:

`http://my.ip.address` or `http://my.ip.address:port`

