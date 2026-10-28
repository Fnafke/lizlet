package com.fnafke.lizlet.controllers;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fnafke.lizlet.dto.AccountResponse;
import com.fnafke.lizlet.dto.ChangePasswordRequest;
import com.fnafke.lizlet.dto.UpdateUsernameRequest;
import com.fnafke.lizlet.dto.UserDto;
import com.fnafke.lizlet.models.exceptions.AccountException;
import com.fnafke.lizlet.models.User;
import com.fnafke.lizlet.services.interfaces.UserService;

import jakarta.validation.Valid;

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

    @GetMapping("/me/account")
    public ResponseEntity<AccountResponse> getCurrentAccount(Authentication authentication) {
        User user = userService.findByUsername(authentication.getName());
        return ResponseEntity.ok(AccountResponse.from(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(new UserDto(userService.findById(id)));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT MAPPINGS

    @PutMapping("/me/username")
    public ResponseEntity<AccountResponse> changeUsername(Authentication authentication,
            @Valid @RequestBody UpdateUsernameRequest request) {
        User user = userService.findByUsername(authentication.getName());
        User updated = userService.changeUsername(user, request.username());
        return ResponseEntity.ok(AccountResponse.from(updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {
        User user = userService.findByUsername(authentication.getName());
        userService.changePassword(user, request.currentPassword(), request.newPassword());
        return ResponseEntity.noContent().build();
    }

    // ERROR HANDLING (clear messages for the account page)

    @ExceptionHandler(AccountException.class)
    public ResponseEntity<Map<String, String>> handleAccountException(AccountException e) {
        return ResponseEntity.status(e.getStatus()).body(Map.of("message", e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(FieldError::getDefaultMessage)
                .orElse("Invalid request.");
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }
}