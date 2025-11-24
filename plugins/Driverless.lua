-- Table to store vehicles and their player associations
local vehicles = {}
-- local updateInterval = 0.1  -- 100ms (0.1 seconds)

-- Function to update vehicle positions
-- function updateVehiclePositions()
--     -- print(vehicles)
--     -- for playerID, playerVehicles in pairs(vehicles) do
--     --     for vehicleID, _ in pairs(playerVehicles) do
--     --         local posData, err = MP.GetPositionRaw(playerID, vehicleID)
--     --         if err and err ~= "" then
--     --             print("Error getting position for Player ID: " .. playerID .. ", Vehicle ID: " .. vehicleID .. ": " .. err)
--     --         else
--     --             vehicles[playerID][vehicleID] = posData  -- Store the latest position data
--     --             print("Updated position for Player " .. playerID .. ", Vehicle " .. vehicleID)
--     --         end
--     --     end
--     -- end
--     -- Schedule the next update
--     scheduleNextUpdate()
-- end

-- -- Function to schedule the next position update
-- function scheduleNextUpdate()
--     local startTime = os.clock()
--     while os.clock() - startTime < updateInterval do
--         -- Busy-wait until the interval passes (non-blocking for server events)
--     end
--     updateVehiclePositions()  -- Call the update function again after 100ms
-- end

local http = require("socket.http")
local ltn12 = require("ltn12")
local json = require("json")  -- Ensure the JSON library is available

-- Function to send player position to Node.js
function sendPosition(points)
    local data = json.encode({
        points = points
    })

    -- print(points)

    local response, status = http.request({
        url = "http://localhost:3000/player-position",  -- Node.js endpoint
        method = "POST",
        headers = {
            ["Content-Type"] = "application/json",
            ["Content-Length"] = #data
        },
        source = ltn12.source.string(data)
    })

    -- print("Sent player position with status: " .. status)
end

-- Function to handle new vehicle spawns
function onVehicleSpawn(playerID, vehicleID, vehicleData)
    -- vehicles[vehicleID] = MP.GetPositionRaw(playerID, vehicleID);
    table.insert(vehicles, {playerID, vehicleID})
    print("Added Player " .. playerID .. ", Vehicle " .. vehicleID .. " to tracking.")
end

-- Function to handle vehicle deletions
function onVehicleDeleted(playerID, vehicleID)
    -- if vehicles[playerID] and vehicles[playerID][vehicleID] then
    --     vehicles[playerID][vehicleID] = nil
    --     print("Removed Player " .. playerID .. ", Vehicle " .. vehicleID .. " from tracking.")
    -- end
    for i, vehicle in ipairs(vehicles) do
        -- print(vehicles)
        if vehicle[1] == playerID and vehicle[2] == vehicleID then
            table.remove(vehicles, i)
            print("Removed Player " .. playerID .. ", Vehicle " .. vehicleID .. " from tracking.")
        end
    end
end

function onTick()
    local positions = {}

    for i, vehicle in ipairs(vehicles) do
        table.insert(positions, {MP.GetPlayerName(vehicle[1]), vehicle, MP.GetPositionRaw(vehicle[1], vehicle[2])})
    end

    sendPosition(positions)
end

-- Register events for vehicle spawns and deletions
MP.RegisterEvent("onVehicleSpawn", "onVehicleSpawn")
MP.RegisterEvent("onVehicleDeleted", "onVehicleDeleted")
MP.RegisterEvent("onTick", "onTick")

MP.CreateEventTimer("onTick", 100)

-- Start the position tracking loop
-- scheduleNextUpdate()
