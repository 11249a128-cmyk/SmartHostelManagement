
package com.smarthostel.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class ComplaintService {

    private static final List<String> HIGH_PRIORITY_WORDS = List.of(
            "fire",
            "smoke",
            "sparking",
            "electric shock",
            "exposed wire",
            "gas leak",
            "flood",
            "ceiling collapse"
    );

    private static final List<String> MEDIUM_PRIORITY_WORDS = List.of(
            "not working",
            "broken",
            "damaged",
            "leak",
            "blocked",
            "no water",
            "no electricity",
            "fan",
            "light",
            "tap",
            "wifi",
            "repair"
    );

    public String classifyPriority(String category, String description) {

        String complaintText =
                ((category == null ? "" : category) + " " +
                (description == null ? "" : description))
                .toLowerCase(Locale.ROOT);

        for (String word : HIGH_PRIORITY_WORDS) {
            if (complaintText.contains(word)) {
                return "HIGH";
            }
        }

        for (String word : MEDIUM_PRIORITY_WORDS) {
            if (complaintText.contains(word)) {
                return "MEDIUM";
            }
        }

        return "LOW";
    }
}
