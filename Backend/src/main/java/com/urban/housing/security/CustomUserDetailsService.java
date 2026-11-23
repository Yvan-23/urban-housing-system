package com.urban.housing.security;

import com.urban.housing.entity.User;
import com.urban.housing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String roleName = user.getRole();
        String authority = roleName.toUpperCase().replace(" ", "_");
        if (!authority.startsWith("ROLE_")) {
            authority = "ROLE_" + authority;
        }

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                !user.isLocked(),
                true,
                true,
                !user.isLocked(),
                Collections.singletonList(new SimpleGrantedAuthority(authority))
        );
    }
}
