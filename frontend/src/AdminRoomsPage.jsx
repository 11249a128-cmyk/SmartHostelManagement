
import { useEffect, useMemo, useState } from "react";
import "./AdminRoomsPage.css";

const API_URL = "http://localhost:8080";

function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [beds, setBeds] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedFloor, setSelectedFloor] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRoomData = async () => {
    try {
      setLoading(true);
      setError("");

      const [roomsResponse, bedsResponse] = await Promise.all([
        fetch(`${API_URL}/rooms`, { credentials: "include" }),
        fetch(`${API_URL}/beds`, { credentials: "include" })
      ]);

      if (!roomsResponse.ok || !bedsResponse.ok) {
        throw new Error("Unable to load room and bed information.");
      }

      const roomsData = await roomsResponse.json();
      const bedsData = await bedsResponse.json();

      if (!Array.isArray(roomsData) || !Array.isArray(bedsData)) {
        throw new Error("Unexpected data received from the server.");
      }

      setRooms(roomsData);
      setBeds(bedsData);
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomData();
  }, []);

  const totalBeds = beds.length;
  const occupiedBeds = beds.filter(
    (bed) => bed.status === "OCCUPIED"
  ).length;
  const availableBeds = beds.filter(
    (bed) => bed.status === "AVAILABLE"
  ).length;

  const floors = [...new Set(rooms.map((room) => room.floor))];

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        room.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
        room.hostelName?.toLowerCase().includes(search.toLowerCase());

      const matchesFloor =
        selectedFloor === "ALL" ||
        String(room.floor) === String(selectedFloor);

      return matchesSearch && matchesFloor;
    });
  }, [rooms, search, selectedFloor]);

  const getRoomBeds = (roomNumber) => {
    return beds.filter((bed) => bed.roomNumber === roomNumber);
  };

  const getOccupiedCount = (roomNumber) => {
    return getRoomBeds(roomNumber).filter(
      (bed) => bed.status === "OCCUPIED"
    ).length;
  };

  if (loading) {
    return (
      <div className="rooms-page">
        <div className="rooms-message">Loading room information...</div>
      </div>
    );
  }

  return (
    <div className="rooms-page">
      <div className="rooms-header">
        <div>
          <h2>Room &amp; Bed Management</h2>
          <p>View hostel rooms, bed availability and occupancy.</p>
        </div>

        <span className="rooms-admin-label">ADMIN</span>
      </div>

      {error && (
        <div className="rooms-error">
          {error}
          <button onClick={loadRoomData}>Try Again</button>
        </div>
      )}

      {!error && (
        <>
          <div className="rooms-stats">
            <div className="room-stat-card">
              <span>Total Rooms</span>
              <strong>{rooms.length}</strong>
            </div>

            <div className="room-stat-card">
              <span>Total Beds</span>
              <strong>{totalBeds}</strong>
            </div>

            <div className="room-stat-card">
              <span>Occupied Beds</span>
              <strong>{occupiedBeds}</strong>
            </div>

            <div className="room-stat-card">
              <span>Available Beds</span>
              <strong>{availableBeds}</strong>
            </div>
          </div>

          <div className="rooms-toolbar">
            <input
              type="text"
              placeholder="Search room or hostel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              <option value="ALL">All Floors</option>
              {floors.map((floor) => (
                <option key={floor} value={floor}>
                  Floor {floor}
                </option>
              ))}
            </select>

            <button onClick={loadRoomData} className="rooms-refresh">
              Refresh
            </button>
          </div>

          {filteredRooms.length === 0 ? (
            <div className="rooms-message">
              No rooms found.
            </div>
          ) : (
            <div className="rooms-grid">
              {filteredRooms.map((room) => {
                const roomBeds = getRoomBeds(room.roomNumber);
                const occupied = getOccupiedCount(room.roomNumber);
                const available = roomBeds.filter(
                  (bed) => bed.status === "AVAILABLE"
                ).length;

                return (
                  <div className="room-card" key={room.id}>
                    <div className="room-card-header">
                      <div>
                        <span className="room-hostel-name">
                          {room.hostelName}
                        </span>
                        <h3>Room {room.roomNumber}</h3>
                      </div>

                      <span className="room-floor">
                        Floor {room.floor}
                      </span>
                    </div>

                    <div className="room-summary">
                      <div>
                        <strong>{room.capacity}</strong>
                        <span>Capacity</span>
                      </div>

                      <div>
                        <strong>{occupied}</strong>
                        <span>Occupied</span>
                      </div>

                      <div>
                        <strong>{available}</strong>
                        <span>Available</span>
                      </div>
                    </div>

                    <div className="room-progress">
                      <div
                        style={{
                          width: `${
                            room.capacity > 0
                              ? Math.min(
                                  (occupied / room.capacity) * 100,
                                  100
                                )
                              : 0
                          }%`
                        }}
                      />
                    </div>

                    <h4>Bed Details</h4>

                    <div className="room-bed-list">
                      {roomBeds.length === 0 ? (
                        <p>No bed records found.</p>
                      ) : (
                        roomBeds.map((bed) => (
                          <div className="room-bed-row" key={bed.id}>
                            <span>{bed.bedNumber}</span>

                            <span
                              className={`bed-status ${
                                bed.status === "OCCUPIED"
                                  ? "occupied"
                                  : bed.status === "AVAILABLE"
                                  ? "available"
                                  : "other"
                              }`}
                            >
                              {bed.status}
                            </span>

                            <span className="bed-student">
                              {bed.studentId
                                ? `Student #${bed.studentId}`
                                : "Unassigned"}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="rooms-note">
            Administrator view of hostel rooms and beds.
            This page currently displays information only.
          </div>
        </>
      )}
    </div>
  );
}

export default AdminRoomsPage;
