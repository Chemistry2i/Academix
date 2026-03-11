package com.academix.server.controller;

import com.academix.server.model.Room;
import com.academix.server.service.RoomService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/rooms")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class RoomController {

    @Autowired
    private RoomService roomService;

    @GetMapping
    public ResponseEntity<List<Room>> getAllRooms(
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String building) {
        try {
            List<Room> rooms;
            
            if (roomType != null && !roomType.isEmpty()) {
                rooms = roomService.getRoomsByType(roomType);
            } else if (building != null && !building.isEmpty()) {
                rooms = roomService.getRoomsByBuilding(building);
            } else if (availableOnly != null && availableOnly) {
                rooms = roomService.getAvailableRooms();
            } else {
                rooms = roomService.getAllRooms();
            }
            
            return ResponseEntity.ok(rooms);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Room> getRoomById(@PathVariable Long id) {
        try {
            Optional<Room> room = roomService.getRoomById(id);
            return room.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/number/{roomNumber}")
    public ResponseEntity<Room> getRoomByNumber(@PathVariable String roomNumber) {
        try {
            Optional<Room> room = roomService.getRoomByNumber(roomNumber);
            return room.map(ResponseEntity::ok)
                      .orElse(ResponseEntity.notFound().build());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/buildings")
    public ResponseEntity<List<String>> getBuildings() {
        try {
            List<String> buildings = roomService.getDistinctBuildings();
            return ResponseEntity.ok(buildings);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/types")
    public ResponseEntity<List<String>> getRoomTypes() {
        try {
            List<String> types = roomService.getDistinctRoomTypes();
            return ResponseEntity.ok(types);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> createRoom(@Valid @RequestBody Room room) {
        try {
            Room createdRoom = roomService.createRoom(room);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @Valid @RequestBody Room room) {
        try {
            Room updatedRoom = roomService.updateRoom(id, room);
            return ResponseEntity.ok(updatedRoom);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HEAD_TEACHER') or hasRole('DIRECTOR_OF_STUDIES')")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        try {
            roomService.deleteRoom(id);
            return ResponseEntity.ok(Map.of("message", "Room deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}