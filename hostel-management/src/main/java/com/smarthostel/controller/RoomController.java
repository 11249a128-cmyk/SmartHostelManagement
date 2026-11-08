package com.smarthostel.controller;

import com.smarthostel.entity.Room;
import com.smarthostel.repository.RoomRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rooms")
public class RoomController {

    private final RoomRepository roomRepository;

    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // Add a new room
    @PostMapping
    public Room addRoom(@RequestBody Room room) {
        return roomRepository.save(room);
    }

    // Get all rooms
    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // Get room by ID
    @GetMapping("/{id}")
    public Room getRoomById(@PathVariable Long id) {
        return roomRepository.findById(id).orElse(null);
    }

    // Update room
    @PutMapping("/{id}")
    public Room updateRoom(
            @PathVariable Long id,
            @RequestBody Room updatedRoom) {

        Room room = roomRepository.findById(id).orElse(null);

        if (room == null) {
            return null;
        }

        room.setRoomNumber(updatedRoom.getRoomNumber());
        room.setHostelName(updatedRoom.getHostelName());
        room.setFloor(updatedRoom.getFloor());
        room.setCapacity(updatedRoom.getCapacity());

        return roomRepository.save(room);
    }

    // Delete room
    @DeleteMapping("/{id}")
    public String deleteRoom(@PathVariable Long id) {

        if (!roomRepository.existsById(id)) {
            return "Room not found";
        }

        roomRepository.deleteById(id);

        return "Room deleted successfully";
    }
}