package com.academix.server.controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    // simple test endpoint to verify that the server is running
    @GetMapping("/test")
    public String test() {
        return "Welcome to Academix School Management System!";
    }
}