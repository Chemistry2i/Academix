package com.academix.server.repository;

import com.academix.server.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    Optional<Room> findByRoomNumber(String roomNumber);
    
    List<Room> findByRoomTypeAndIsAvailable(String roomType, Boolean isAvailable);
    
    List<Room> findByBuildingAndIsAvailable(String building, Boolean isAvailable);
    
    List<Room> findByIsAvailable(Boolean isAvailable);
    
    @Query("SELECT r FROM Room r WHERE r.isAvailable = true ORDER BY r.roomNumber")
    List<Room> findAvailableRoomsOrderedByNumber();
    
    @Query("SELECT r FROM Room r WHERE r.roomType = ?1 AND r.isAvailable = true ORDER BY r.roomNumber")
    List<Room> findAvailableRoomsByTypeOrderedByNumber(String roomType);
    
    @Query("SELECT DISTINCT r.building FROM Room r WHERE r.building IS NOT NULL")
    List<String> findDistinctBuildings();
    
    @Query("SELECT DISTINCT r.roomType FROM Room r")
    List<String> findDistinctRoomTypes();
}