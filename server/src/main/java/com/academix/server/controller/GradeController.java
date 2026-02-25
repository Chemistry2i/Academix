package com.academix.server.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.academix.server.service.ResultService;

@RestController
@RequestMapping("/api/grades")
@CrossOrigin(origins = "*")
public class GradeController {

    @Autowired
    private ResultService resultService;

    /**
     * Get all Ugandan grading scales
     * GET /api/grades
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getGradingScales() {
        return ResponseEntity.ok(resultService.getGradingScales());
    }

    /**
     * Get O-Level grading scale
     * GET /api/grades/o-level
     */
    @GetMapping("/o-level")
    public ResponseEntity<Map<String, Object>> getOLevelGrades() {
        Map<String, Object> scales = resultService.getGradingScales();
        return ResponseEntity.ok(Map.of(
            "level", "O-Level (UCE)",
            "description", "Uganda Certificate of Education grading system",
            "grades", scales.get("oLevel"),
            "aggregateInterpretation", scales.get("aggregateInterpretation")
        ));
    }

    /**
     * Get A-Level grading scale
     * GET /api/grades/a-level
     */
    @GetMapping("/a-level")
    public ResponseEntity<Map<String, Object>> getALevelGrades() {
        Map<String, Object> scales = resultService.getGradingScales();
        return ResponseEntity.ok(Map.of(
            "level", "A-Level (UACE)",
            "description", "Uganda Advanced Certificate of Education grading system",
            "principalGrades", scales.get("aLevelPrincipal"),
            "subsidiaryGrades", scales.get("aLevelSubsidiary")
        ));
    }

    /**
     * Calculate grade from marks
     * GET /api/grades/calculate?marks={marks}&scale={scale}&isPrincipal={isPrincipal}
     */
    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateGrade(
            @RequestParam Integer marks,
            @RequestParam(defaultValue = "O_LEVEL") String scale,
            @RequestParam(defaultValue = "true") Boolean isPrincipal) {

        String grade;
        int points;
        String description;

        if (scale.equalsIgnoreCase("O_LEVEL")) {
            // O-Level grading
            if (marks >= 80) { grade = "D1"; points = 1; description = "Distinction"; }
            else if (marks >= 70) { grade = "D2"; points = 2; description = "Distinction"; }
            else if (marks >= 65) { grade = "C3"; points = 3; description = "Credit"; }
            else if (marks >= 60) { grade = "C4"; points = 4; description = "Credit"; }
            else if (marks >= 55) { grade = "C5"; points = 5; description = "Credit"; }
            else if (marks >= 50) { grade = "C6"; points = 6; description = "Credit"; }
            else if (marks >= 40) { grade = "P7"; points = 7; description = "Pass"; }
            else if (marks >= 34) { grade = "P8"; points = 8; description = "Pass"; }
            else { grade = "F9"; points = 9; description = "Fail"; }
        } else if (scale.equalsIgnoreCase("A_LEVEL") && isPrincipal) {
            // A-Level Principal
            if (marks >= 80) { grade = "A"; points = 6; description = "Excellent"; }
            else if (marks >= 70) { grade = "B"; points = 5; description = "Very Good"; }
            else if (marks >= 60) { grade = "C"; points = 4; description = "Good"; }
            else if (marks >= 50) { grade = "D"; points = 3; description = "Satisfactory"; }
            else if (marks >= 40) { grade = "E"; points = 2; description = "Pass"; }
            else if (marks >= 34) { grade = "O"; points = 1; description = "Subsidiary Pass"; }
            else { grade = "F"; points = 0; description = "Fail"; }
        } else {
            // A-Level Subsidiary
            if (marks >= 50) { grade = "O"; points = 1; description = "Pass"; }
            else { grade = "F"; points = 0; description = "Fail"; }
        }

        return ResponseEntity.ok(Map.of(
            "marks", marks,
            "scale", scale,
            "isPrincipal", isPrincipal,
            "grade", grade,
            "points", points,
            "description", description
        ));
    }

    /**
     * Calculate aggregate division from total points
     * GET /api/grades/aggregate?points={points}
     */
    @GetMapping("/aggregate")
    public ResponseEntity<Map<String, Object>> calculateAggregate(@RequestParam Integer points) {
        String division;
        String description;

        if (points >= 8 && points <= 32) {
            division = "Division 1";
            description = "Excellent - Qualifies for A-Level admission";
        } else if (points >= 33 && points <= 45) {
            division = "Division 2";
            description = "Very Good - Qualifies for A-Level admission";
        } else if (points >= 46 && points <= 58) {
            division = "Division 3";
            description = "Good - May qualify for vocational training";
        } else if (points >= 59 && points <= 72) {
            division = "Division 4";
            description = "Satisfactory - Below university admission threshold";
        } else {
            division = "Fail";
            description = "Ungraded - Did not meet minimum requirements";
        }

        return ResponseEntity.ok(Map.of(
            "aggregatePoints", points,
            "division", division,
            "description", description,
            "qualifiesForALevel", points >= 8 && points <= 45
        ));
    }
}
