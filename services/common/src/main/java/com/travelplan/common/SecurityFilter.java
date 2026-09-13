package com.travelplan.common;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import org.slf4j.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SecurityFilter extends OncePerRequestFilter {
  private final SessionVerifier verifier;
  private final String origin, key;
  private static final Logger log = LoggerFactory.getLogger(SecurityFilter.class);

  public SecurityFilter(
      SessionVerifier verifier,
      @Value("${app.origin}") String origin,
      @Value("${app.service-key}") String key) {
    this.verifier = verifier;
    this.origin = origin;
    this.key = key;
  }

  public static boolean same(String a, String b) {
    return a != null
        && b != null
        && MessageDigest.isEqual(
            a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
  }

  public static String token(HttpServletRequest r) {
    return r.getCookies() == null
        ? ""
        : Arrays.stream(r.getCookies())
            .filter(c -> c.getName().equals("tp_session"))
            .map(Cookie::getValue)
            .findFirst()
            .orElse("");
  }

  @Override
  protected void doFilterInternal(HttpServletRequest r, HttpServletResponse s, FilterChain chain)
      throws ServletException, IOException {
    String requestId = r.getHeader("X-Request-ID");
    if (requestId == null || !requestId.matches("[a-zA-Z0-9-]{1,64}"))
      requestId = UUID.randomUUID().toString();
    MDC.put("requestId", requestId);
    s.setHeader("X-Request-ID", requestId);
    s.setHeader("Cache-Control", "no-store");
    long start = System.nanoTime();
    try {
      String path = r.getRequestURI();
      boolean write = !Set.of("GET", "HEAD", "OPTIONS").contains(r.getMethod());
      if (path.equals("/actuator/health") || path.startsWith("/actuator/health/")) {
        chain.doFilter(r, s);
        return;
      }
      if (path.startsWith("/internal/")) {
        if (!same(key, r.getHeader("X-Service-Key"))) {
          error(s, 401, "Service authentication required");
          return;
        }
        chain.doFilter(r, s);
        return;
      }
      if (write && !same(origin, r.getHeader("Origin"))) {
        error(s, 403, "Untrusted request origin");
        return;
      }
      if (path.equals("/api/auth/login")) {
        chain.doFilter(r, s);
        return;
      }
      SessionUser user;
      try {
        user = verifier.verify(token(r));
      } catch (Exception e) {
        error(s, 401, "Please sign in again");
        return;
      }
      if (user == null) {
        error(s, 401, "Please sign in");
        return;
      }
      r.setAttribute("user", user);
      MDC.put("actorId", user.id());
      if (write && !same(user.csrf(), r.getHeader("X-CSRF-Token"))) {
        error(s, 403, "Invalid request token");
        return;
      }
      if (write && !path.startsWith("/api/auth/") && !canWrite(user.role(), path)) {
        error(s, 403, "Your role cannot perform this action");
        return;
      }
      chain.doFilter(r, s);
    } finally {
      log.info(
          "request method={} path={} status={} durationMs={}",
          r.getMethod(),
          r.getRequestURI(),
          s.getStatus(),
          (System.nanoTime() - start) / 1000000);
      MDC.clear();
    }
  }

  public static boolean canWrite(String role, String path) {
    return role.equals("ADMIN")
        || (role.equals("TRAVEL_MANAGER") && path.startsWith("/api/travels"));
  }

  private void error(HttpServletResponse s, int status, String msg) throws IOException {
    s.setStatus(status);
    s.setContentType("application/json");
    s.getWriter().write("{\"message\":\"" + msg + "\"}");
  }
}
