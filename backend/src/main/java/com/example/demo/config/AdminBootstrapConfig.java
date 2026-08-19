package com.example.demo.config;

import com.example.demo.entity.User;
import com.example.demo.repo.iuserrepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Keeps one predictable development administrator available for the combined demo.
 * The defaults can still be overridden with ADMIN_EMAIL and ADMIN_PASSWORD.
 */
@Configuration
public class AdminBootstrapConfig implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapConfig.class);

    private final iuserrepo userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.email:sk.39648215@gmail.com}")
    private String defaultAdminEmail;

    @Value("${admin.default.password:Sachin1301#}")
    private String defaultAdminPassword;

    public AdminBootstrapConfig(iuserrepo userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User admin = userRepository.findByEmail(defaultAdminEmail);

        if (admin == null) {
            admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail(defaultAdminEmail);
            admin.setPhoneNumber("0000000000");
            admin.setRole("ADMIN");
            admin.setActive(true);
            admin.setPassword(passwordEncoder.encode(defaultAdminPassword));
            userRepository.save(admin);
            log.warn("Seeded development admin account for {}.", defaultAdminEmail);
            return;
        }

        boolean changed = false;

        if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
            admin.setRole("ADMIN");
            changed = true;
        }

        if (!admin.getActive()) {
            admin.setActive(true);
            changed = true;
        }

        // Make the configured development credential actually work even if an older
        // admin row was created with a different BCrypt password.
        if (!passwordEncoder.matches(defaultAdminPassword, admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(defaultAdminPassword));
            changed = true;
        }

        if (changed) {
            userRepository.save(admin);
            log.warn("Updated development admin account for {} to match configured credentials.", defaultAdminEmail);
        }
    }
}
