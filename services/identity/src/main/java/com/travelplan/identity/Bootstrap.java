package com.travelplan.identity;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class Bootstrap implements ApplicationRunner {
  private final JdbcTemplate db;
  private final String password;

  public Bootstrap(JdbcTemplate db, @Value("${ADMIN_PASSWORD}") String password) {
    this.db = db;
    this.password = password;
  }

  public void run(ApplicationArguments args) {
    db.update(
        "insert into identity.users(id,name,email,role,status,password_hash) values"
            + " ('00000000-0000-0000-0000-000000000001','Workspace"
            + " admin','admin@travelplan.local','ADMIN','ACTIVE',?) on conflict do nothing",
        new BCryptPasswordEncoder(12).encode(password));
  }
}
