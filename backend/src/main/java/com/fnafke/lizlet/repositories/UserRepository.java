package com.fnafke.lizlet.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fnafke.lizlet.models.User;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<Boolean> existsByUsername(String username);

    Optional<Boolean> existsByEmail(String email);
}