
# Driverless
A web-based UI and mod managment system for a [BeamMP](https://docs.beammp.com/) server.


## About
Driverless features a live map of the server showing the current postions of all the players in the game. It also includes a menu to change the map, max players, and max cars. Mods can also be added and enabled/disabled within the UI.

## Installation

Side note: Check out the [Offical BeamMP Installation Page](https://docs.beammp.com/server/create-a-server/) for more information on running a server.

If you haven't already, get a key from [Keymaster](https://beammp.com/keymaster). You will need this later.

1. Install Docker. We recommend installing [Docker Desktop](https://docs.docker.com/desktop/) for simplicity

2. Download Driverless with git or with the lastest version

3. Open the Driverless folder and find the `ServerConfig.toml` file. Open it and find a line at the bottom that is exactly:

```bash
AuthKey = ""
```

4. Add your key in-between the quotation marks

```bash
AuthKey = "YOUR-KEY-HERE"
```

5. Open a terminal and change the current directory to the Driverless folder

6. Start Driverless with the following command:

```bash
docker-compose up
```
> This may take a while since the image needs to build for the first time

7. You should now have a fully functional Driverless and Beammp server!

8. Access the Driverless website using http://localhost

## Starting Server
To start up the server, simply run:

```bash
docker-compose up
```

The webpage can now be accessed at http://localhost
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

#### Going Public:
Making your server public requires that you setup your router to forward port 80 (Driverless) and 30814 (Beammp). Allow TCP and UDP for both.

DISCLAIMER:
By port forwarding, you acknowledge the risks associated with opening ports on your network and waive any right to hold the creators of Driverless and BeamMP accountable for any negative consequences.

You can now access your server using your ip address by entering into your web browser:

`http://my.ip.address` or `http://my.ip.address:port`

