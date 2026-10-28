package com.fnafke.lizlet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
        @NotBlank(message = "Enter your current password.") String currentPassword,

        @NotBlank(message = "Enter a new password.") @Size(min = 10, max = 100, message = "Your new password must be 10 to 100 characters long.") String newPassword) {
}