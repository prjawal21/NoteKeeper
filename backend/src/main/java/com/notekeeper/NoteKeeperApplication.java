package com.notekeeper;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NoteKeeperApplication {

    public static void main(String[] args) {
        SpringApplication.run(NoteKeeperApplication.class, args);
    }
}
