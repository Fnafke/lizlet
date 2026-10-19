package com.fnafke.lizlet.dto;

import java.util.UUID;

public record AuthenticationResponse(
        String token,
        UUID id,
        String username,
        String message) {

}
