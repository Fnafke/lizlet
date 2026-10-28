package com.fnafke.lizlet.services;

import java.time.LocalDate;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fnafke.lizlet.dto.AuthenticationResponse;
import com.fnafke.lizlet.models.exceptions.AccountException;
import com.fnafke.lizlet.models.Role;
import com.fnafke.lizlet.models.User;
import com.fnafke.lizlet.models.exceptions.NotFoundException;
import com.fnafke.lizlet.repositories.UserRepository;
import com.fnafke.lizlet.services.interfaces.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User findById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("User not found with id: " + id));
        return user;
    }

    @Override
    public User findByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User not found with username: " + username));
        return user;
    }

    @Override
    public User findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found with email: " + email));
        return user;
    }

    @Override
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username).orElse(false);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email).orElse(false);
    }

    @Override
    public AuthenticationResponse createAndAuthenticateUser(String username, String email, String password) {
        if (existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }
        if (existsByEmail(email)) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User(username, email, passwordEncoder.encode(password), Role.USER);

        userRepository.save(user);

        return new AuthenticationResponse(
                jwtService.generateToken(user),
                user.getId(),
                user.getUsername(),
                "Successfully registered! Welcome " + user.getUsername());

    }

    public AuthenticationResponse authenticateUser(String email, String password) {
        User user = findByEmail(email);

        if (!this.passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }
        return new AuthenticationResponse(
                jwtService.generateToken(user),
                user.getId(),
                user.getUsername(),
                "Successfully authenticated! Welcome " + user.getUsername());
    }

    @Override
    public User changeUsername(User user, String newUsername) {
        String username = newUsername.trim();

        if (username.equals(user.getUsername())) {
            throw new AccountException(HttpStatus.BAD_REQUEST, "That is already your username.");
        }
        // Exact match, like registration. For case-insensitive uniqueness, add
        // existsByUsernameIgnoreCase to the repository and use it here and in
        // registration.
        if (existsByUsername(username)) {
            throw new AccountException(HttpStatus.CONFLICT, "That username is already taken.");
        }

        user.setUsername(username);
        user.setUpdatedAt(LocalDate.now());
        try {
            return userRepository.save(user);
        } catch (DataIntegrityViolationException e) {
            // Someone took the name between the check above and the save (unique
            // constraint).
            throw new AccountException(HttpStatus.CONFLICT, "That username is already taken.");
        }
    }

    @Override
    public void changePassword(User user, String currentPassword, String newPassword) {
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new AccountException(HttpStatus.BAD_REQUEST, "Your current password is incorrect.");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new AccountException(HttpStatus.BAD_REQUEST,
                    "Your new password must be different from the current one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDate.now());
        userRepository.save(user);
    }
}