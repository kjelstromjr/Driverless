#include <iostream>
#include <fstream>
#include <vector>
#include <string>

using namespace std;

#define RESET   "\033[0m"
#define RED     "\033[31m"
#define GREEN   "\033[32m"
#define YELLOW  "\033[33m"
#define BLUE    "\033[34m"

void editLineInFile(const std::string& filename, int lineToEdit, const std::string& newContent) {
    std::ifstream inputFile(filename);
    if (!inputFile) {
        std::cerr << "Error opening file for reading.\n";
        return;
    }

    std::vector<std::string> lines;
    std::string line;
    int lineNumber = 0;

    // Read all lines into a vector
    while (std::getline(inputFile, line)) {
        if (lineNumber == lineToEdit) {
            lines.push_back(newContent); // Replace the target line
        } else {
            lines.push_back(line);
        }
        lineNumber++;
    }
    inputFile.close();

    // Write the modified content back to the file
    std::ofstream outputFile(filename);
    if (!outputFile) {
        std::cerr << "Error opening file for writing.\n";
        return;
    }

    for (const auto& modifiedLine : lines) {
        outputFile << modifiedLine << "\n";
    }
    outputFile.close();
}

int main(int argc, char const *argv[]) {
    // Installing nodejs
    try {
        cout << "Installing Node.js..." << endl;
        system("sudo apt install nodejs -y");
    } catch (...) {
        cout << RED << "Unable to install Node.js" << RESET << endl;
        return 1;
    }

    // Installing npm
    try {
        cout << "Installing npm..." << endl;
        system("sudo apt install npm -y");
    } catch (...) {
        cout << RED << "Unable to install npm" << RESET << endl;
        return 1;
    }

    // Installing lua
    try {
        cout << "Installing lua..." << endl;
        system("sudo apt install liblua5.3-dev -y");
    } catch (...) {
        cout << RED << "Unable to install lua" << RESET << endl;
        return 1;
    }

    // Installing lua-socket
    try {
        cout << "Installing lua-socket..." << endl;
        system("sudo apt install lua-socket -y");
    } catch (...) {
        cout << RED << "Unable to install lua-socket" << RESET << endl;
        return 1;
    }

    // Installing lua-json
    try {
        cout << "Installing lua-json..." << endl;
        system("sudo apt install lua-json -y");
    } catch (...) {
        cout << RED << "Unable to install lua-json" << RESET << endl;
        return 1;
    }

    cout << endl;

    // Installing beammp server
    try {
        cout << "Installing beammp..." << endl;
        system("wget https://github.com/BeamMP/BeamMP-Server/releases/download/v3.4.1/BeamMP-Server.ubuntu.22.04.x86_64");
    } catch (...) {
        cout << RED << "Unable to install beammp" << RESET << endl;
        return 1;
    }

    // Configuring beammp
    try {
        cout << "Configuring beammp..." << endl;
        system("chmod +x BeamMP-Server.ubuntu.22.04.x86_64");
    } catch (...) {
        cout << RED << "Unable to configure beammp" << RESET << endl;
        return 1;
    }

    cout << endl;

    // Creating plugin file
    try {
        cout << "Creating plugin file..." << endl;
        system("mkdir Resources");
        system("mkdir Resources/Server");
        system("mkdir Resources/Server/DriverlessPlugin");
    } catch (...) {
        cout << RED << "Unable to make folder Resources/Server/DriverlessPlugin" << RESET << endl;
        return 1;
    }

    // Creating disabled file
    try {
        cout << "Creating disabled folder..." << endl;
        system("mkdir Resources/Disabled");
    } catch (...) {
        cout << RED << "Unable to make folder Resources/Disabled" << RESET << endl;
        return 1;
    }

    // Moving plugin
    try {
        cout << "Moving plugin..." << endl;
        system("mv plugins/Driverless.lua Resources/Server/DriverlessPlugin");
    } catch (...) {
        cout << RED << "Unable to move plugin. Check to make sure the file is in plugins and the folder DriverlessPlugin is in Resources/Server" << RESET << endl;
        return 1;
    }

    // Installing node.js packages
    try {
        cout << "Installing node.js packages..." << endl;
        system("npm install");
    } catch (...) {
        cout << RED << "Unable to install node.js packages" << RESET << endl;
        return 1;
    }

    cout << endl;

    // Adding key
    try {
        string key;
        cout << "Enter AuthKey provided by BeamMP: ";
        cin >> key;  // Reads input until the first space
        string line = "AuthKey = \"" + key + "\"";
        editLineInFile("ServerConfig.toml", 27, line);
    } catch (...) {
        cout << RED << "Unable to add AuthKey to ServerConfig.toml" << RESET << endl;
        return 1;
    }

    // Changing Port
    try {
        string port;
        cout << "Enter the port that you would like the server can run on (default 3000): ";
        cin >> port;  // Reads input until the first space
        //const PORT = 3000;
        string line = "const PORT = " + port + ";";
        editLineInFile("main.js", 9, line);
    } catch (...) {
        cout << RED << "Unable to change the port in main.js" << RESET << endl;
        return 1;
    }

    cout << endl;

    cout << "Installation complete!";
    cout << "Run the server using \"sudo node main.js\"";
}