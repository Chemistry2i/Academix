package com.academix.server.service;

import com.academix.server.model.Room;
import com.academix.server.repository.RoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    public List<Room> getAllRooms() {
        try {
            return roomRepository.findAll();
        } catch (Exception e) {
            log.error("Error fetching all rooms: ", e);
            throw new RuntimeException("Failed to fetch rooms", e);
        }
    }

    public List<Room> getAvailableRooms() {
        try {
            return roomRepository.findAvailableRoomsOrderedByNumber();
        } catch (Exception e) {
            log.error("Error fetching available rooms: ", e);
            throw new RuntimeException("Failed to fetch available rooms", e);
        }
    }

    public List<Room> getRoomsByType(String roomType) {
        try {
            return roomRepository.findAvailableRoomsByTypeOrderedByNumber(roomType);
        } catch (Exception e) {
            log.error("Error fetching rooms by type {}: ", roomType, e);
            throw new RuntimeException("Failed to fetch rooms by type", e);
        }
    }

    public List<Room> getRoomsByBuilding(String building) {
        try {
            return roomRepository.findByBuildingAndIsAvailable(building, true);
        } catch (Exception e) {
            log.error("Error fetching rooms by building {}: ", building, e);
            throw new RuntimeException("Failed to fetch rooms by building", e);
        }
    }

    public Optional<Room> getRoomById(Long id) {
        try {
            return roomRepository.findById(id);
        } catch (Exception e) {
            log.error("Error fetching room by id {}: ", id, e);
            throw new RuntimeException("Failed to fetch room", e);
        }
    }

    public Optional<Room> getRoomByNumber(String roomNumber) {
        try {
            return roomRepository.findByRoomNumber(roomNumber);
        } catch (Exception e) {
            log.error("Error fetching room by number {}: ", roomNumber, e);
            throw new RuntimeException("Failed to fetch room", e);
        }
    }

    public Room createRoom(Room room) {
        try {
            // Check if room number already exists
            if (roomRepository.findByRoomNumber(room.getRoomNumber()).isPresent()) {
                throw new RuntimeException("Room number already exists: " + room.getRoomNumber());
            }
            return roomRepository.save(room);
        } catch (Exception e) {
            log.error("Error creating room: ", e);
            throw new RuntimeException("Failed to create room", e);
        }
    }

    public Room updateRoom(Long id, Room updatedRoom) {
        try {
            return roomRepository.findById(id)
                .map(room -> {
                    // Check if room number is being changed and if it conflicts
                    if (!room.getRoomNumber().equals(updatedRoom.getRoomNumber())) {
                        if (roomRepository.findByRoomNumber(updatedRoom.getRoomNumber()).isPresent()) {
                            throw new RuntimeException("Room number already exists: " + updatedRoom.getRoomNumber());
                        }
                    }
                    
                    room.setRoomNumber(updatedRoom.getRoomNumber());
                    room.setRoomName(updatedRoom.getRoomName());
                    room.setRoomType(updatedRoom.getRoomType());
                    room.setCapacity(updatedRoom.getCapacity());
                    room.setLocation(updatedRoom.getLocation());
                    room.setBuilding(updatedRoom.getBuilding());
                    room.setFloor(updatedRoom.getFloor());
                    room.setEquipment(updatedRoom.getEquipment());
                    room.setIsAvailable(updatedRoom.getIsAvailable());
                    room.setNotes(updatedRoom.getNotes());
                    
                    return roomRepository.save(room);
                })
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        } catch (Exception e) {
            log.error("Error updating room: ", e);
            throw new RuntimeException("Failed to update room", e);
        }
    }

    public void deleteRoom(Long id) {
        try {
            roomRepository.deleteById(id);
        } catch (Exception e) {
            log.error("Error deleting room with id {}: ", id, e);
            throw new RuntimeException("Failed to delete room", e);
        }
    }

    public List<String> getDistinctBuildings() {
        try {
            return roomRepository.findDistinctBuildings();
        } catch (Exception e) {
            log.error("Error fetching distinct buildings: ", e);
            throw new RuntimeException("Failed to fetch buildings", e);
        }
    }

    public List<String> getDistinctRoomTypes() {
        try {
            return roomRepository.findDistinctRoomTypes();
        } catch (Exception e) {
            log.error("Error fetching distinct room types: ", e);
            throw new RuntimeException("Failed to fetch room types", e);
        }
    }
}