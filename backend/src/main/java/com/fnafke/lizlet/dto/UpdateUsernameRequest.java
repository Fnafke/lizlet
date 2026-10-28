package com.fnafke.lizlet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUsernameRequest(
        @NotBlank(message = "Username is required.") @Size(min = 3, max = 20, message = "Username must be 3 to 20 characters long.") @Pattern(regexp = "\\S+", message = "Username can't contain spaces.") String username) {
}