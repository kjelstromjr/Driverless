#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <filesystem>
#include <regex>

using namespace std;

namespace fs = filesystem;

vector<fs::path> findFilesByName(const string& dir, const string& fileName);
vector<double> extract(const string& node);

int main(int argc, char *argv[]) {
    string directory = argv[1]; // Replace with your directory path
    string name = argv[2];
    string fileName = "items.level.json"; // Replace with the file name you're looking for

    vector<fs::path> result = findFilesByName(directory, fileName);

    for (const auto& path : result) {
        try {
            ifstream data(path);
            ofstream output(name + ".rds", ios_base::app);

            string line;
            int offsetx = 500;
            int offsety = 500;
            double scale = 0.8;

            while (getline(data, line)) {

                if (line.find("MeshRoad") != string::npos) {
                    size_t place = line.find("nodes");
                    if (place == string::npos) continue;

                    line = line.substr(place);
                    regex regex_nodes(R"(\])");
                    sregex_token_iterator iter(line.begin(), line.end(), regex_nodes, -1);
                    sregex_token_iterator end;

                    output << "m;";
                    for (; iter != end; ++iter) {
                        string node = *iter;
                        if (node.empty()) break;

                        vector<double> coords1 = extract(node);
                        output << coords1[0] << "," << coords1[1] << ";";
                    }
                    output << "\n";
                }
                if (line.find("DecalRoad") != string::npos) {
                    size_t place = line.find("nodes");
                    if (place == string::npos) continue;

                    line = line.substr(place);
                    regex regex_nodes(R"(\])");
                    sregex_token_iterator iter(line.begin(), line.end(), regex_nodes, -1);
                    sregex_token_iterator end;

                    output << "d;";
                    for (; iter != end; ++iter) {
                        string node = *iter;
                        if (node.empty()) break;

                        vector<double> coords1 = extract(node);
                        output << coords1[0] << "," << coords1[1] << ";";
                    }
                    output << "\n";
                }
            }
            data.close();
            output.close();
        } catch (const exception& e) {
            cerr << "Error: " << e.what() << endl;
        }
    }

    return 0;
}

vector<fs::path> findFilesByName(const string& dir, const string& fileName) {
    vector<fs::path> matchingFiles;

    try {
        for (const auto& entry : fs::recursive_directory_iterator(dir)) {
            if (entry.is_regular_file() && entry.path().filename() == fileName) {
                matchingFiles.push_back(entry.path());
            }
        }
    } catch (const filesystem::filesystem_error& e) {
        cerr << "Error: " << e.what() << endl;
    }

    return matchingFiles;
}

vector<double> extract(const string& node) {
    size_t start = 0;
    while (start < node.size() && !isdigit(node[start]) && node[start] != '-') {
        start++;
    }
    string trimmedNode = node.substr(start);

    regex regex_numbers(R"(-?\d+(\.\d+)?)");
    sregex_iterator iter(trimmedNode.begin(), trimmedNode.end(), regex_numbers);
    sregex_iterator end;

    vector<double> coords;
    for (; iter != end; ++iter) {
        coords.push_back(stod(iter->str()));
    }

    if (coords.size() < 2) {
        return {0.0, 0.0};
    }
    return {coords[0], coords[1]};
}
