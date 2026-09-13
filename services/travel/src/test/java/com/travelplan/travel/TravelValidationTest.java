package com.travelplan.travel;

import static org.assertj.core.api.Assertions.*;

import java.math.*;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.Test;

class TravelValidationTest {
  TravelController.TravelInput input(
      LocalDate start, LocalDate end, String status, int capacity, List<UUID> participants) {
    return new TravelController.TravelInput(
        "Trip",
        start,
        end,
        status,
        BigDecimal.TEN,
        capacity,
        "Description",
        "bali",
        List.of(new TravelController.Stop("Ubud", "Indonesia", "Walk", "Hotel", "Car")),
        participants,
        0);
  }

  @Test
  void reversedDatesRejected() {
    assertThatThrownBy(
            () ->
                TravelController.validate(
                    input(
                        LocalDate.of(2026, 10, 3),
                        LocalDate.of(2026, 10, 1),
                        "DRAFT",
                        1,
                        List.of())))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void overCapacityRejected() {
    assertThatThrownBy(
            () ->
                TravelController.validate(
                    input(
                        LocalDate.now(),
                        LocalDate.now(),
                        "DRAFT",
                        1,
                        List.of(UUID.randomUUID(), UUID.randomUUID()))))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void sameDayTripAllowed() {
    assertThatCode(
            () ->
                TravelController.validate(
                    input(LocalDate.now(), LocalDate.now(), "DRAFT", 1, List.of())))
        .doesNotThrowAnyException();
  }
}
