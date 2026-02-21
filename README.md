
# Driverless
A web-based UI and mod management system for a [BeamMP](https://docs.beammp.com/) server.

![Screenshot 2026-02-16 173448](https://github.com/user-attachments/assets/64322f4c-189d-4493-89c2-54dc87cc07bc)

## About
Driverless features a live map of the server showing the current postions of all the players in the game. It also includes a menu to change the map, max players, and max cars. Mods can also be added and enabled/disabled within the UI.

## Installation

Side note: Check out the [Offical BeamMP Installation Page](https://docs.beammp.com/server/create-a-server/) for more information on running a server.

1. Install Docker. We recommend installing [Docker Desktop](https://docs.docker.com/desktop/) for simplicity

2. Create a new folder where you want to store the server

3. Download [`docker-compose.yaml`](https://github.com/kjelstromjr/Driverless/blob/main/docker-compose.yaml) and put it in your new folder

4. Open a terminal in the folder

5. Start Driverless with Docker

```bash
docker compose up -d
```

6. You should now have a fully functional Driverless and Beammp server!

7. Access the Driverless website using http://localhost

## Starting Server
To start up the server, simply run:

```bash
docker compose up -d
```

The webpage can now be accessed at http://localhost

## Setup
When you open up the webpage for the first time, you will see a setup page. Here you will enter two items:
- BeamMP Key: This is the server key that will authenticate your server with BeamMP
- Admin Password: This is the password you will use to access the Admin mode (see Maintainance for more details about Admin mode)

## Maintainance

#### Updates:
Changes to the code of this project can applied using the following steps:
1. Pull the latest image from Docker Hub

```bash
docker compose pull
```

2. Restart the server

```bash
docker compose up -d
```

#### Administration:
You can access the admin mode using Ctrl+Alt+A. This will give you full control over the server, including choosing what the public has access to.

#### HTTPS:
To enable HTTPS, open `config/server.config.json` and change `enable` under `https` to `true`. Then add the locations of your SSL key and certificate in `keyPath` and `certPath`.

#### Changing the port:
To change the port of Driverless, open `config/server.config.json` and change the port option

#### Going Public:
Making your server public requires that you setup your router to forward port 80 (Default Driverless) and 30814 (Beammp). Allow TCP and UDP for both.

DISCLAIMER:
By port forwarding, you acknowledge the risks associated with opening ports on your network and waive any right to hold the creators of Driverless and BeamMP accountable for any negative consequences.

You can now access your server using your ip address by entering into your web browser:

`http://my.ip.address` or `http://my.ip.address:port`

