package com.fnafke.lizlet.controllers;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fnafke.lizlet.dto.UserDto;
import com.fnafke.lizlet.services.interfaces.UserService;

@RestController
@RequestMapping("/api/users")
public class UsersController {

    @Autowired
    private UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }

    // GET MAPPINGS

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        UserDto userDto = new UserDto(userService.findByUsername(username));
        return ResponseEntity.ok(userDto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(new UserDto(userService.findById(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // POST MAPPINGS

}
