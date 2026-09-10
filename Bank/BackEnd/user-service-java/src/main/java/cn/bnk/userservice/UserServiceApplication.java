package cn.bnk.userservice;
import java.io.IOException;
import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

import javax.crypto.SecretKey;
import org.springframework.http.MediaType;
import org.apache.catalina.connector.Response;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.domain.Sort;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;
import org.springframework.session.data.redis.config.annotation.web.http.EnableRedisHttpSession;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Jwts.KEY;
import io.jsonwebtoken.security.Keys;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.LockModeType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import jakarta.servlet.FilterChain;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.AuthenticationException;
//--------------------------------------------------------------------
// CONFIGURATIONS
@Configuration 
@EnableAsync 
class AsyncConfig implements AsyncConfigurer {
    @Override 
    public Executor getAsyncExecutor() {
        return null;
    }
    @Override 
    public AsyncUncaughtExceptionHandler getAsyncUncaughtExceptionHandler() {
        return new AsyncUncaughtExceptionHandler() {
            @Override 
            public void handleUncaughtException(Throwable ex, Method method, Object... params) {
                System.out.println("Async error: " + method.getName());
                ex.printStackTrace();
            }
        };
    }
    @Bean 
    public AsyncUncaughtExceptionHandler asyncUncaughtExceptionHandler() {
        return new AsyncUncaughtExceptionHandler() {
            @Override 
            public void handleUncaughtException(
                Throwable ex,
                Method method,
                Object... params
            ) {
                System.out.println("Async method failed: " + method.getName());
                System.out.println("Error: " + ex.getMessage());
            }
        };
    }
    @Bean 
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("app-async-");
        executor.initialize();
        return executor;
    }
    @Bean
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-");
        executor.initialize();
        return executor;
    }
}
@Configuration
@EnableJpaAuditing (auditorAwareRef = "auditorAwareImpl")
class JpaAuditingConfig{}
@Configuration
class AppConfig {
    @Bean
    public EmailService emailService() {
        return new EmailService();
    }
}
@Configuration 
@EnableRedisHttpSession 
class SessionConfig {

}
@Configuration 
@EnableCaching 
class CacheConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        GenericJacksonJsonRedisSerializer serializer = GenericJacksonJsonRedisSerializer.builder().build();
        RedisSerializationContext.SerializationPair<Object> valuSerializationPair = RedisSerializationContext.SerializationPair.fromSerializer(serializer);
        RedisCacheConfiguration cacheConfig = RedisCacheConfiguration
            .defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .disableCachingNullValues()
            .serializeValuesWith(valuSerializationPair);
        return RedisCacheManager
            .builder(connectionFactory)
            .cacheDefaults(cacheConfig)
            .build();
    }
}
@Configuration 
class RedisConfig {
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(GenericJacksonJsonRedisSerializer.builder().build());
        template.setHashKeySerializer(new StringRedisSerializer());
        template.setHashValueSerializer(GenericJacksonJsonRedisSerializer.builder().build());
        template.afterPropertiesSet();
        return template;
    }
}
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    @Bean 
    @Order (1)
    public SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http) throws Exception {
        http
        .oauth2AuthorizationServer(authorizationServer -> {})
        .authorizeHttpRequests(authorize ->
            authorize.anyRequest().authenticated()
        );
        http
        .exceptionHandling(exceptions -> 
            exceptions.defaultAuthenticationEntryPointFor(
                new LoginUrlAuthenticationEntryPoint("/login"),
                new MediaTypeRequestMatcher(MediaType.TEXT_HTML)
            )  
         );
         return http.build();

    }
    @Bean
    @Order (2)
    public SecurityFilterChain securityFilterChain(
        HttpSecurity http,
        CustomOidcUserService oidcUserService,
        OAuth2LoginSuccessHandler successHandler,
        OAuth2LoginFailureHandler failureHandler
    ) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(
                    csrf -> csrf
                    .csrfTokenRepository(
                        CookieCsrfTokenRepository.withHttpOnlyFalse()
                    )
                )
            .authorizeHttpRequests(
                auth -> auth
                .requestMatchers(
                    "/public/**",
                    "/auth/**",
                    "/oauth2/**",
                    "/login/**",
                    "/public/**"
                ).permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/users/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2Login(
                oauth2 -> oauth2
                .userInfoEndpoint(
                    userInfo -> userInfo
                    .oidcUserService(oidcUserService)
                )
            .successHandler(successHandler)
            .failureHandler(failureHandler))
            .formLogin(form -> form.loginProcessingUrl("/auth/login"))
            .logout(logout -> logout.logoutUrl("/auth/logout").logoutSuccessHandler(new HttpStatusReturningLogoutSuccessHandler())
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://127.0.0.1:5000"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    @Bean
    public DaoAuthenticationProvider authenticationProvider(UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }
    @Bean
    public RegisteredClientRepository registerClientRepository() {
        RegisteredClient client = RegisteredClient
            .withId(UUID.randomUUID().toString())
            .clientId("my-client")
            .clientSecret("{noop}my-secret")
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
            .redirectUri("https://127.0.0.1:5001/login/oauth2/code/my-client")
            .scope(OidcScopes.OPENID)
            .scope(OidcScopes.PROFILE)
            .scope(OidcScopes.EMAIL)
            .build();
        return new InMemoryRegisteredClientRepository(client);
    }
}
// -----------------------------------------------------------------------
// COMPONENTS
@Component 
class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final OAuth2AccountService accountService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public OAuth2LoginSuccessHandler(
        OAuth2AccountService accountService,
        JwtService jwtService,
        RefreshTokenService refreshTokenService) {
            this.accountService = accountService;
            this.jwtService = jwtService;
            this.refreshTokenService = refreshTokenService;
        }
    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request,
        HttpServletResponse response,
        Authentication authentication
    ) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        User user = accountService.processGoogleUser(oidcUser);
        String accessToken = jwtService.generateAccesToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        refreshTokenService.storeToken(refreshToken, user.getEmail(), LocalDateTime.now().plusDays(7));
        ResponseCookie accessCookie = ResponseCookie
            .from("access_cookie", accessToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofMinutes(15))
            .build();
        ResponseCookie refreshCookie = ResponseCookie
            .from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/path")
            .maxAge(Duration.ofDays(7))
            .build();

        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        response.sendRedirect("http://127.0.0.1:5001");
    }
}
@Component 
class OAuth2LoginFailureHandler implements AuthenticationFailureHandler {
    
    @Override 
    public void onAuthenticationFailure(
        HttpServletRequest request,
        HttpServletResponse response,
        AuthenticationException exception
    ) 
    throws IOException {
        response.sendRedirect("http://127.0.0.1:3000/login?error=oauth2_failed");
    }
}
@Component
class AuditorAwareImpl implements AuditorAware<String> {
    @Override 
    public Optional<String> getCurrentAuditor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        return Optional.of(authentication.getName());
    }
}

@Component
class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }
    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String token = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if("access_token".equals(cookie.getName())){
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token != null) {
            try {
                String email = jwtService.extractUsername(token);
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    if (jwtService.isTokenValid(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            } catch (Exception e) {

            }
        }
        filterChain.doFilter(request, response);
    }
}
// ------------------------------------------------------------------------
// CLASS
class CreateUserRequest1 {
    @NotBlank
    private String name;
    @Email
    @NotBlank
    private String email;
}
class UserSpecifications {
    public static Specification<User> hasEmail(String email) {
        return (root, query, cb) -> cb.like(cb.lower(root.get(email)), "%" + email.toLowerCase() + "%");
    }
    public static Specification<User> hasName(String name) {
        return (root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%");
    }
    public static Specification<User> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status);
    }
}
enum ERole {
    USER, ADMIN
}
// -------------------------------------------------------------------
// EXCEPTIONS
class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(String message) {
        super(message);
    }
}
@RestController
class CustomErrorController implements ErrorController {
    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> error(HttpServletRequest request) {
        Object uri = request.getAttribute(RequestDispatcher.ERROR_REQUEST_URI);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", 404,
                "error", "Not found",
                "message", uri + " ,Requested resource was not found"));
    }
}
@RestControllerAdvice
class GlobalExceptionHandler {
    // 400 - WRONG PATH/QUERY PARAMETER TYPE
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        ApiError error = new ApiError(HttpStatus.BAD_REQUEST.value(), "invalid value for parameter" + ex.getName(), LocalDateTime.now());
        return ResponseEntity.badRequest().body(error);
    }
    // 409
    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiError> handleDuplicateEmail(DuplicateEmailException ex) {
        ApiError error = new ApiError(HttpStatus.CONFLICT.value(), ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
    // 404
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiError> handleUserNotFound(UserNotFoundException ex) {
        ApiError error = new ApiError(HttpStatus.NOT_FOUND.value(), ex.getMessage(), LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
    // 400 VALIDATION
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(
            error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
    // 409 OPTIMISTIC
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        ApiError error = new ApiError(HttpStatus.CONFLICT.value(), "User was modified by another request. please retry.", LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
}
// ------------------------------------------------------------------------
// ENTITY
@MappedSuperclass 
@EntityListeners (AuditingEntityListener.class)
abstract class BaseEntity {
    @CreatedDate 
    @Column (nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedBy 
    @Column (nullable = false)
    private LocalDateTime updatedAt;

    @CreatedBy 
    private String createdBy;

    @LastModifiedBy 
    private String updatedBy;
    
}
@Entity 
@Table (name = "refresh_tokens")
class RefreshToken {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true, length = 64)
    private String tokenHash;
    @Column(nullable = false)
    private String email;
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    @Column (nullable = false)
    private boolean revoked = false;
    public RefreshToken(){}
    public Long getId() {
        return this.id;
    }
    public String getTokenHash() {
        return this.tokenHash;
    }
    public String getEmail() {
        return this.email;
    }
    public boolean getRevoked() {
        return this.revoked;
    }
    public LocalDateTime getExpiresAt() {
        return this.expiresAt;
    }
    public void setTokenHash(String hash) {
        this.tokenHash = hash;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }
}
@Entity
@Table(
    name = "users",
    indexes = { 
        @Index (name = "idx_users_email", columnList = "email")
    }
)
@EntityListeners (AuditingEntityListener.class)
class User extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private int age;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String password;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
    @OneToOne
    @JoinColumn(name = "address_id")
    private Address address;
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
    @Version
    private Long version;
    private String provider;
    private String providerId;
    @Enumerated (EnumType.STRING)
    @Column (nullable = false)
    private ERole role;
    protected User() {}
    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setAge(int age) {
        this.age = age;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public void setProvider(String provider) {
        this.provider = provider;
    }
    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }
    public void setRole(ERole role) {
        this.role = role;
    }
    public ERole getRole() {
        return role;
    }
    public String getProvider() {
        return provider;
    }
    public String getProviderId() {
        return providerId;
    }
    public Long getId() {
        return id;
    }
    public String getName() {
        return name;
    }
    public int getAge() {
        return age;
    }
    public String getEmail() {
        return email;
    }
    public Long getDepartmentId() {
        return department.getId();
    }
    public String getPassword() {
        return password;
    }
    public Set<Role> getRoles() {
        return roles;
    }
}

@Entity
@Table(name = "departments")
class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String name;
    @OneToMany(mappedBy = "department", fetch = FetchType.LAZY)
    private List<User> users = new ArrayList<>();
    public Long getId() {
        return this.id;
    }
    public List<User> getUsers() {
        return this.users;
    }
    public String getNAme() {
        return this.name;
    }
}

@Entity
@Table(name = "address")
class Address {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String city;
    private String street;
    public void setCity(String city) {
        this.city = city;
    }
    public String getCity() {
        return this.city;
    }
    public String getAddress() {
        return this.street + ", " + this.city;
    }
}

@Entity
@Table(name = "roles")
class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    public String getName() {
        return this.name;
    }
    public void setName(String role){
        this.name = role;
    }
}
@Entity 
@Table (name = "user_identities", uniqueConstraints = {
    @UniqueConstraint (name = "uk_provider_identity", columnNames = {
        "providers", "provider_user_id"
    })
})
class UserIdentity {
    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne (fetch = FetchType.LAZY, optional = false)
    @JoinColumn (name = "user_id",  nullable = false)
    private User user;
    @Column (nullable = false)
    private String provider;
    @Column (name = "provider_user_id", nullable = false)
    private String providerUserId;

    public void setId(Long id) {
        this.id = id;
    }
    public Long getId() {
        return id;
    }
    public void setProvider(String provider) {
        this.provider = provider;
    }
    public String getProvider() {
        return provider;
    }
    public void setUser(User user) {
        this.user = user;
    }
    public User getUser() {
        return user;
    }
    public void setProviderUserId(String providerUserId) {
        this.providerUserId = providerUserId;
    }
    public String getProviderUserId() {
        return providerUserId;
    }
}
// ------------------------------------------------------------------
// REPOSITORIES
@Repository 
interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    List<RefreshToken> findByEmail(String email);
    void deleteByEmail(String email);
    @Modifying 
    @Query ("""
            UPDATE RefreshToken r
            SET r.revoked = true
            WHERE r.email = :email
            AND r.revoked = false
            """)
    int revokeAllByEmail(@Param("email") String email);
}
@Repository
interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    List<User> findNyName(String name);
    List<User> findByNameAndEmail(String name, String email);
    List<User> findByNameContaining(String name);
    List<User> findByNameContainingIgnoreCase(String name);
    List<User> findByNameStartingWith(String prefix);
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByEmailEndingWith(String domain);
    List<User> findAll(Sort sort);
    @Query("SELECT u FROM User u WHERE u.email = :email")
    Optional<User> findUserByEmail(@Param("email") String email);
    @Query(value = "SELECT * FROM  users WHERE email = :email", nativeQuery = true)
    Optional<User> findUserNative(@Param("email") String email);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM User u WHERE u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
}
@Repository
interface AddressRepository extends JpaRepository<Address, Long> {}
@Repository
interface DepartmentRepository extends JpaRepository<Department, Long> {
    @Query("""
            SELECT DISTINCT d
            FROM Department d
            JOIN FETCH d.users
            """)
    List<Department> findAllWithUsers();
    Optional<Department> findById();
    @Query("SELECT DISTINCT d FROM Department d JOIN FETCH d.users WHERE d.id = :id")
    Optional<Department> findByIdWithUsers(@Param("id") Long id);
}
@Repository 
interface UserIdentityRepository extends JpaRepository<UserIdentity, Long> {
    Optional<UserIdentity> findByProviderAndProviderUserId(String provider, String providerUserId);
}
// ------------------------------------------------------------------
// DTOS
record ApiError(
        int status,
        String message,
        LocalDateTime timeStamp) {}
record LoginRequest(
    @Email 
    @NotBlank 
    String email,
    @NotBlank 
    String password
) {}
record ApiResponse<T>(boolean success, String message, T data) {}
record CreateUserRequest(
        @NotBlank(message = "Name is required") String name,
        @NotBlank(message = "Age is required") int age,
        @NotBlank(message = "Email is required") @Email(message = "Invalid email") String email,
        @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password) {
}
record UserResponse(Long id, String name, int age, String email, Long departmentId) {}
record UpdateUserRequest(
    @NotBlank
    String name,
    @NotBlank
    @Email
    String email
) {}
record DepartmentResponse(Long id, String name, List<UserResponse> users) {}
record RegisterRequest(
    @NotBlank 
    String name,
    @Email 
    @NotBlank 
    String email,
    @Size (min = 8)
    String password
) {}
record RefreshTokenRequest(String refreshToken) {}
record TokenPair(String accessToken, String refreshToken) {}
// ------------------------------------------------------------------------
// SERVICES
@Service 
class DashboardService {
    public CompletableFuture<String> dashboard() {
        CompletableFuture<String> userFuture = getUserData();
        CompletableFuture<String> orderFuture = getOrderData();
        return userFuture.thenCombine(orderFuture, (user, orders) -> user + " + " + orders);
    }
    @Async 
    public CompletableFuture<String> getUserData() {
        try {
            Thread.sleep(2000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return CompletableFuture.completedFuture("User data");
    }
    @Async 
    public CompletableFuture<String> getOrderData() {
        try {
            Thread.sleep(3000);
        } catch(InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return CompletableFuture.completedFuture("order data");
    }
}
@Service 
class ReportService {
    @Async 
    public CompletableFuture<String> generateReport() {
        System.out.println("Report thread: " + Thread.currentThread().getName());
        try {
            Thread.sleep(3000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return CompletableFuture.completedFuture("Report generated");
    }
}
@Service 
class EmailService {
    @Async("emailExecutor")
    public CompletableFuture<String> sendEmail() {
        
        try {
            System.out.println("Email started: " + Thread.currentThread().getName());
            Thread.sleep(5000);
            return CompletableFuture.completedFuture("Email sent");
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return CompletableFuture.failedFuture(e);
        }
    }
}
@Service 
class DistributedLockService {
    private static final String KEY_PREFIX = "lock:";
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisScript<Long> unloackScript = RedisScript.of("""
                if redis.call('get', KEYS[1] == ARGV[1] then
                    return redis.call('del', KEYS[1])
                else
                    return 0
                end
            """, Long.class);
    public DistributedLockService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    public String tryLock(String resource, Duration ttl) {
        String key = KEY_PREFIX + resource;
        String token = UUID.randomUUID().toString();
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(key, token, ttl);
        if(Boolean.TRUE.equals(acquired)) {
            return token;
        }
        return null;
    }
    public Boolean unlock(String resource, String token) {
        String key = KEY_PREFIX + resource;
        Long result = redisTemplate.execute(unloackScript, List.of(key), token);
        return Long.valueOf(1L).equals(result);
    }
}
@Service 
class RateLimitService {
    private static final int MAX_ATTEMPTS = 5;
    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final String KEY_PREFIX = "rate-limit:";
    private final RedisTemplate<String, Object> redisTemplate;
    public RateLimitService(
        RedisTemplate<String, Object> redisTemplate
    ) {
        this.redisTemplate = redisTemplate;
    }
    public boolean isLoginAllowed(String ip, String email) {
        String key = KEY_PREFIX + "login:" + ip + ":" + email;
        Long count = redisTemplate.opsForValue().increment(key);
        if(count==null) { return false; }
        if(count ==1){ 
            redisTemplate.expire(key, WINDOW);
        }
        return count <= MAX_ATTEMPTS;
    }
    public void resetLoginAttempts(String ip, String email) {
        String key = KEY_PREFIX + "login:" + ip + ":" + email;
        redisTemplate.delete(key);
    }
}
@Service
class TokenBlackListService {
    private static final String KEY_PREFIX = "blacklist:";
    private final RedisTemplate<String, Object> redisTemplate;
    public TokenBlackListService(
        RedisTemplate<String, Object> redisTemplate
    ) {
        this.redisTemplate = redisTemplate;
    }
    public void blacklist(String jti, Duration ttl) {
        if(ttl.isZero() || ttl.isNegative()) { return; }
        String key = KEY_PREFIX + jti;
        redisTemplate.opsForValue().set(key, "revoked", ttl);
    }
    public boolean isBlackListed(String jti) {
        String key = KEY_PREFIX + jti;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
@Service 
class TokenRotationService {
    private final RedisRefreshTokenService redisRefreshTokenService;
    private final JwtService jwtService;
    public TokenRotationService(
        RedisRefreshTokenService rediRefreshTokenService,
        JwtService jwtService
    ) {
        this.redisRefreshTokenService = rediRefreshTokenService;
        this.jwtService = jwtService; 
    }
    public TokenPair rotate(String oldRefreshToken, User user) {
        Long userId = redisRefreshTokenService.findUserId(oldRefreshToken);
        if(!userId.equals(user.getId())) {
            throw new RuntimeException("Invalid refresh token");
        }
        redisRefreshTokenService.revoke(oldRefreshToken);
        String newAccessToken = jwtService.generateAccesToken(user.getEmail());
        String newRefreshToken = jwtService.generateAccesToken(user.getEmail());
        redisRefreshTokenService.store(newRefreshToken, userId);
        return new TokenPair(newAccessToken, newRefreshToken);
    }

}
@Service 
class RedisRefreshTokenService {
    private static final String KEY_PREFIX = "refresh-token:";
    private static final Duration TOKEN_TTL = Duration.ofDays(7);
    private static RedisTemplate<String, Object> redisTemplate;
    private static TokenHashService tokenHashService;
    public RedisRefreshTokenService(RedisTemplate<String, Object> redisTemplate, TokenHashService tokenHashService) {
        RedisRefreshTokenService.redisTemplate = redisTemplate;
        RedisRefreshTokenService.tokenHashService = tokenHashService;
    }
    public void store(String refreshToken, Long userId) {
        String hash = tokenHashService.hash(refreshToken);
        String key = KEY_PREFIX + hash;
        redisTemplate.opsForValue().set(key, userId.toString(), TOKEN_TTL);
    }
    public Long findUserId(String refreshToken) {
        String hash = tokenHashService.hash(refreshToken);
        String key = KEY_PREFIX + hash;
        Object value = redisTemplate.opsForValue().get(key);
        if(value == null) {
            throw new RuntimeException("Refresh token not found");
        }
        return Long.valueOf(value.toString());
    }
    public void revoke(String refreshToken) {
        String hash = tokenHashService.hash(refreshToken);
        String key = KEY_PREFIX + hash;
        redisTemplate.delete(key);
    }
}
@Service 
class TokenHashService {
    public String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 algorithm not available", e);
        }
    }
}
@Service 
class OtpService {
    private final RedisTemplate<String, Object> redisTemplate;
    public OtpService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    public void saveOtp(Long userId, String otp) {
        String key = "otp:user:" + userId;
        redisTemplate.opsForValue().set(key, otp, Duration.ofMinutes(5));
    }
    public Object getOtp(Long userId) {
        String key = "otp:user:" + userId;
        return redisTemplate.opsForValue().get(key);
    }
    public void saveUser(Long userId, String name, String email) {
        String key = "user:" + userId;
        redisTemplate.opsForHash().put(key, "name", name);
        redisTemplate.opsForHash().put(key, "email", email);
    }
}
@Service 
class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }
    public void save(String key, Object value) {
        redisTemplate.opsForValue().set(key, value);
    }
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
    public void delete(String key) {
        redisTemplate.delete(key);
    }
}
@Service 
class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
    @Transactional 
    public User registUser(RegisterRequest request) {
        if(userRepository.findByEmail(request.email()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(ERole.USER);
        user.setPassword(passwordEncoder.encode(request.password()));
        return userRepository.save(user);
    }
}
@Service
class OAuth2AccountService {
    private final UserRepository userRepository;
    private final UserIdentityRepository identityRepository;
    public OAuth2AccountService(UserRepository userRepository, UserIdentityRepository identityRepository) {
        this.userRepository = userRepository;
        this.identityRepository = identityRepository;
    }
    @Transactional 
    public User processGoogleUser(OidcUser oidcUser) {
        String provider = "GOOGLE";
        String providerUserId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        UserIdentity identity = identityRepository.findByProviderAndProviderUserId(provider, providerUserId).orElse(null);
        if(identity != null) {
            return identity.getUser();
        }
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            // newUser.setRole();
            return userRepository.save(newUser);
        });
        UserIdentity newIdentity = new UserIdentity();
        newIdentity.setUser(user);
        newIdentity.setProvider(provider);
        newIdentity.setProviderUserId(providerUserId);
        identityRepository.save(newIdentity);
        return user;
    }
}
@Service 
class CustomOidcUserService extends OidcUserService {
    private final UserRepository userRepository;
    public CustomOidcUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);
        String provider = "GOOGLE";
        String providerId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();
        if(email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException(new OAuth2Error("email_missing"), "Email not provided by provider");
        }
        processUser(provider, providerId, email, name);
        return oidcUser;
    }
    private User processUser(
        String provider,
        String providerId,
        String email,
        String name
    ) {
        Optional<User> existingIdentity = userRepository.findByProviderAndProviderId(provider, providerId);
        if(existingIdentity.isPresent()) {
            return existingIdentity.get();
        }
        Optional<User> existingEmail = userRepository.findByEmail(email);
        if(existingEmail.isPresent()) {
            User user = existingEmail.get();
            user.setProvider(provider);
            user.setProviderId(providerId);
            return userRepository.save(user);
        }
        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setProvider(provider);
        user.setProviderId(providerId);
        // user.setRole();
        return userRepository.save(user);
    }
}
@Service
class RefreshTokenService {
    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenHashService tokenHashService;
    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, TokenHashService tokenHashService) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenHashService = tokenHashService;
    }
    public RefreshToken validateToken(String refreshToken) {
        String hash = tokenHashService.hash(refreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hash).orElseThrow(() -> new RuntimeException("Refresh token not found"));
        if(storedToken.getRevoked()) {
            throw new RuntimeException("Refresh Token Revoked");
        }
        if(storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh Token Expired");
        }
        return storedToken;
    }
    public void revoke(String refreshToken) {
        String hash = tokenHashService.hash(refreshToken);
        RefreshToken storedToken = refreshTokenRepository.findByTokenHash(hash).orElseThrow(() -> new RuntimeException("Refresh token not found"));
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);
    }
    @Transactional 
    public int revokeAllTokens(String email) {
        return refreshTokenRepository.revokeAllByEmail(email);
    }
    public void storeToken(String refreshToken, String email, LocalDateTime expiresAt) {
        String hash = tokenHashService.hash(refreshToken);
        RefreshToken entity = new RefreshToken();
        entity.setTokenHash(hash);
        entity.setEmail(email);
        entity.setExpiresAt(expiresAt);
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);
    }
}
@Service
class JwtService {
    @Value("${app.jwt}")
    private String appSecretKey;
    private final SecretKey secretKey = 
        Keys.hmacShaKeyFor(appSecretKey.getBytes(StandardCharsets.UTF_8));
    public String generateAccesToken(String email) {
        return Jwts
            .builder()
            .id(UUID.randomUUID().toString())
            .subject(email)
            .claim("type", "access")
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 15))
            .signWith(secretKey)
            .compact();
    }
    public String generateRefreshToken(String email) {
        return Jwts
                .builder()
                .subject(email)
                .claim("type", "refresh")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 1000L * 60 * 60 * 24 * 7))
                .signWith(secretKey)
                .compact();
    }
    public String extractUsername(String token) {
        return Jwts
                .parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
    public String extractTokenType(String token) {
        return Jwts
                .parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("type", String.class);
    }
    public boolean isTokenValid(String token, UserDetails userDetails) {
        String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
    public boolean isTokenExpired(String token) {
        Date expiration = Jwts
                            .parser()
                            .verifyWith(secretKey)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload()
                            .getExpiration();
        return expiration.before(new Date());
    }
    public String extractJti(String token) {
        return Jwts
                .parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getId();
    }
    public Date extractExpiration(String token) {
        Date expiration = Jwts
                        .parser()
                        .verifyWith(secretKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload()
                        .getExpiration();
        return expiration;
    }
}
@Service 
class PaymentService {
    public PaymentService() {

    }
    @Transactional 
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        // Account from = accountRepository.findByIdorUpdate(fromId).orElseThrow();
        // Account to = accountRepository.findByIdorUpdate(toId).orElseThrow();
        // if(from.getBalance().compareTo(amount)<0){
        //     throw new RuntimeException("Insufficient balance");
        // }
        // from.setBalance(from.getBalance().substract(amount));
        // to.setBalance(to.getBalance().add(amount));
    }
}
@Service
class DepartmentService {
    private final DepartmentRepository departmentRepository;
    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartment(Long id) {
        Department department = departmentRepository.findByIdWithUsers(id).orElseThrow(() -> new RuntimeException("Department not found"));
        List<UserResponse> users = department.getUsers().stream().map(user -> 
            new UserResponse(user.getId(), user.getName(), user.getAge(), user.getEmail(), user.getDepartmentId())
        ).toList();
        return new DepartmentResponse(department.getId(), department.getNAme(), users);
    }
}
@Service
class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    public UserService(UserRepository userRepo, AddressRepository addressRepo) {
        this.userRepository = userRepo;
        this.addressRepository = addressRepo;
    }
    public List<User> getActiveUsers(String name) {
        Specification<User> spec = Specification
        .where(UserSpecifications.hasStatus("ACTIVE"))
        .and(UserSpecifications.hasName(name));
        return userRepository.findAll(spec);
    }
    public List<User> searchUsers(String name, String email, String status) {
        Specification<User> spec = Specification.where((Specification<User>) null);
        if(name != null && !name.isBlank()) {
            spec = spec.and (UserSpecifications.hasName(name));
        }
        if(email != null && !email.isBlank()) {
            spec = spec.and(UserSpecifications.hasEmail(email));
        }
        if(status != null && !status.isBlank()) {
            spec = spec.and(UserSpecifications.hasStatus(status));
        }
        return userRepository.findAll(spec);
    }
    @Transactional
    public void createUser() {
        User user = new User();
        user.setName("Nikunj");
        userRepository.save(user);
        Address address = new Address();
        address.setCity("Sydney");
        addressRepository.save(address);
    }
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateEmailException("Email already exists: " + request.email());
        }
        User user = new User();
        user.setName(request.name());
        user.setAge(request.age());
        user.setEmail(request.email());
        user.setPassword(request.password());
        User saveResponse = userRepository.save(user);
        Address address = new Address();
        address.setCity("Sydney");
        addressRepository.save(address);
        return new UserResponse(saveResponse.getId(), saveResponse.getName(), saveResponse.getAge(),
        saveResponse.getEmail(), saveResponse.getDepartmentId());
    }
    public UserResponse getUser(Long id) {
        User user = userRepository.findById(id)
        .orElseThrow(() -> new UserNotFoundException("User not found with id " + id));
        return new UserResponse(user.getId(), user.getName(), user.getAge(), user.getEmail(), user.getDepartmentId());
    }
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return new UserResponse(user.getId(), user.getName(), user.getAge(), user.getEmail(), user.getDepartmentId());
    }
    public List<UserResponse> getUsers(String sortBy) {
        Sort sort = Sort.by(Sort.Direction.ASC, sortBy);
        return userRepository.findAll(sort).stream().map(user -> getUserResponse(user)).toList();
    }
    // public Page<UserResponse> getUsers(Pageable pageable) {
    //      return userRepository.findAll(pageable).map(user -> getUserResponse(user));
    // }
    @CachePut (cacheNames = "users", key = "#id")
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findByIdForUpdate(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(request.name());
        user.setEmail(request.email());
        return this.getUserResponse(user);
    }
    @CacheEvict (cacheNames = "users", key = "#id")
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return org.springframework.security.core.userdetails.User
        .withUsername(user.getEmail())
        .password(user.getPassword())
        .roles(user.getRoles().stream().map(Role::getName).toArray(String[]::new))
        .build();
    }
    private UserResponse getUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(),
        user.getAge(), user.getEmail(), user.getDepartmentId());
    }
    @Cacheable (cacheNames = "users", key = "#id")
    public UserResponse findById(Long id) {
        System.out.println("Database called");
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
         return this.getUserResponse(user);
    }
}
// -----------------------------------------------------------------------
// CONTROLLERS
@RestController 
@RequestMapping ("/reports")
class ReportController {
    private final ReportService reportService;
    public ReportController(
        ReportService reportService
    ) {
        this.reportService = reportService;
    }
    @GetMapping ("/generate")
    public CompletableFuture<String> generate() {
        return reportService.generateReport();
    }
}
@RestController 
@RequestMapping ("/test")
class TestController {
    private final EmailService emailService;
    public TestController(EmailService emailService) {
        this.emailService = emailService;
    }
    @GetMapping ("/async")
    public String testAsync() {
        CompletableFuture<String> future = emailService.sendEmail();
        CompletableFuture<Integer> result = future.thenApply(message -> message.length());
        future.exceptionally(ex -> {
            System.out.print("Email failed: " + ex.getMessage());
            return "Falback email result";
        });
        return "Response returned";
    }
}
@RestController
@RequestMapping ("/orders")
class OrderController  {
    private final DistributedLockService distributedLockService;
    public OrderController(
        DistributedLockService distributedLockService
    ) {
        this.distributedLockService = distributedLockService;
    }
    @PostMapping ("/{orderId}/process")
    public ResponseEntity<?> processOrder(@PathVariable Long orderId) {
        String resource = "order:" + orderId;
        String token = distributedLockService.tryLock(resource, Duration.ofSeconds(10));
        if(token == null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Order is already processing");
        }
        try {
            System.out.println("Processing order: " + orderId);
            return ResponseEntity.ok("order processed");
        } finally {
            distributedLockService.unlock(resource, token);
        }
    }

}
@RestController 
@RequestMapping ("/redis")
class RedisController {
    private final RedisService redisService;
    public RedisController(RedisService redisService) {
        this.redisService = redisService;
    }
    @PostMapping ("/set")
    public String set() {
        redisService.save("user:1:name", "nikunj");
        return "Saved";
    }
    @GetMapping ("/get")
    public Object get() {
        return redisService.get("user:1:name");
    }
    @DeleteMapping ("/delete")
    public String delete() {
        redisService.delete("user:1:name");
        return "Deleted";
    }
 }
@RestController
@RequestMapping("/v1/users")
class UserController {
    private final UserService userService;
    public UserController(UserService userService) {
        this.userService = userService;
    }
    @GetMapping
    public List<UserResponse> getUsers(@RequestParam(defaultValue = "id") String sortBy) {
        return userService.getUsers(sortBy);
    }
    @PostMapping
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }
    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }
    @GetMapping("/search")
    public List<User> searchUsers(
        @RequestParam (required = false) String name,
        @RequestParam (required = false) String email,
        @RequestParam (required = false) String status
    ) {
        return userService.searchUsers(name, email, status);
    }
    // @GetMapping("/users")
    // public Page<UserResponse> getUsers(@PageableDefault(size = 10) Pageable pageable) {
    //      return userService.getUsers(pageable);
    // }
}
@RestController
@RequestMapping("/v1/auth")
class AuthController {
    @Value("${app.name}")
    private String appName;
    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserRepository userRepository;
    private final RedisRefreshTokenService redisRefreshTokenService;
    private final TokenBlackListService tokenBlackListService;
    private final RateLimitService rateLimitService;
    public AuthController(
        AuthenticationManager authenticationManager,
        JwtService jwtService,
        RefreshTokenService refreshTokenService,
        TokenHashService tokenHashService,
        RefreshTokenRepository refreshTokenRepository,
        AuthService authService,
        UserRepository userRepository,
        RedisRefreshTokenService redisRefreshTokenService,
        TokenBlackListService tokenBlackListService,
        RateLimitService rateLimitService
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.authService = authService;
        this.userRepository = userRepository;
        this.redisRefreshTokenService = redisRefreshTokenService;
        this.tokenBlackListService = tokenBlackListService;
        this.rateLimitService = rateLimitService;
    }
    @GetMapping
    public ApiResponse<Void> home() {
        return new ApiResponse<>(true, "Welecome To user services java", null);
    }
    @PostMapping ("/register")
    public ResponseEntity<?> register(
        @Valid 
        @RequestBody RegisterRequest request
    ) {
        authService.registUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of("message", "Registration successfull")
        );
    }
    @GetMapping ("/meoauth2")
    public Map<String, Object> meOAuth2(@AuthenticationPrincipal OAuth2User user) {
        return user.getAttributes();
    }
    @GetMapping("/me")
    public ResponseEntity<String> me(HttpSession session) {
        Long userId = (Long) session.getAttribute("userId");
        if(userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }
        return ResponseEntity.ok("User ID: " + userId);
    }
    @PostMapping ("/logout-all")
    public ResponseEntity<?> logoutAll(Authentication authentication, HttpServletResponse httpServletResponse) {
        String email = authentication.getName();
        refreshTokenService.revokeAllTokens(email);
        ResponseCookie accessCookie = ResponseCookie
            .from("access_token", "")
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/")
            .maxAge(0).build();
        ResponseCookie refreshCookie = ResponseCookie
            .from("refresh_token", "")
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/auth")
            .maxAge(0)
            .build();
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        httpServletResponse.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return ResponseEntity.ok(Map.of("message", "LoggedOut from all devices successful"));
    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue("access_token") String accessToken,HttpServletRequest request,HttpServletResponse response) throws ServletException {
        String jti = jwtService.extractJti(accessToken);
        Date expiration = jwtService.extractExpiration(accessToken);
        Duration ttl = Duration.between(Instant.now(), expiration.toInstant()); 
        tokenBlackListService.blacklist(jti, ttl);
        request.logout();
        HttpSession session = request.getSession(false);
        if(session != null) {
            session.invalidate();
        }
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if(cookies!=null){
            for(Cookie cookie : cookies) {
                if("refresh_token".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        if(refreshToken != null) {
            try {
                refreshTokenService.revoke(refreshToken);
            } catch (Exception ignored) {}
        }
        ResponseCookie accessCookie = ResponseCookie
            .from("access_token", "")
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/")
            .maxAge(0).build();
        ResponseCookie refreshCookie = ResponseCookie
            .from("refresh_token", "")
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/auth")
            .maxAge(0)
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletRequest request, HttpServletResponse response) {
        String ipAddress = request.getRemoteAddr();
        boolean allowed = rateLimitService.isLoginAllowed(ipAddress, loginRequest.email());
        if(!allowed) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
            .body(Map.of("message", "To many login attempts"));
        }
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
        );
        User user = userRepository.findByEmail(loginRequest.email()).orElseThrow();
        String accessToken = jwtService.generateAccesToken(user.getEmail());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());
        refreshTokenService.storeToken(refreshToken, loginRequest.email(), LocalDateTime.now().plusDays(7));
        ResponseCookie accessCookie = ResponseCookie
            .from("access_token", accessToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofMinutes(15))
            .build();
        ResponseCookie refreshCookie = ResponseCookie
            .from("refresh_token", refreshToken)
            .httpOnly(true)
            .secure(true)
            .sameSite("Strict")
            .path("/auth")
            .maxAge(Duration.ofDays(7))
            .build();
        response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
        rateLimitService.resetLoginAttempts(ipAddress, loginRequest.email());
        return ResponseEntity.ok(Map.of("message", "Login successfull"));
    }
    @PostMapping ("/login-session")
    public ResponseEntity<String> login(HttpSession session) {
        session.setAttribute("userId", 100L);
        session.setAttribute("role", "USER");
        return ResponseEntity.ok("Login successful");
    }
    @PostMapping ("/refresh")
    public ResponseEntity<?> refresh(
        @RequestBody HttpServletRequest request,
        HttpServletResponse response
    ) {
        // Long userId =  redisRefreshTokenService.findUserId(request.refreshToken());
        // User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String oldRefreshToken = null;
        Cookie[] cookies = request.getCookies();
        if(cookies != null) {
            for(Cookie cookie : cookies) {
                if("refresh_token".equals(cookie.getName())){
                    oldRefreshToken = cookie.getValue();
                    break;
                }
            }
        }
        if(oldRefreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Refresh Token is missing"));
        }
        try {
            String type = jwtService.extractTokenType(oldRefreshToken);
            if(!"refresh".equals(type)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid refresh token"));
            }
            if(jwtService.isTokenExpired(oldRefreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Refresh token expired"));
            }
            RefreshToken storedRefreshToken = refreshTokenService.validateToken(oldRefreshToken);
            String email = storedRefreshToken.getEmail();
            refreshTokenService.revoke(oldRefreshToken);
            String newAccessToken = jwtService.generateAccesToken(email);
            String newRefreshToken = jwtService.generateRefreshToken(email);
            refreshTokenService.storeToken(newRefreshToken, email, LocalDateTime.now().plusDays(7));
            ResponseCookie accessCookie = ResponseCookie
            .from("access_token", newAccessToken)
            .httpOnly(true)
            .sameSite("Strict")
            .path("/")
            .maxAge(Duration.ofMinutes(15))
            .build();
            ResponseCookie refreshCookie = ResponseCookie
                .from("refresh_token", newRefreshToken)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(Duration.ofDays(7))
                .build();
            response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());
            return ResponseEntity.ok(Map.of("message", "Token rotated successsfully"));
        } catch(Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid refresh token"));
        }
    }
}
// --------------------------------------------------------------------------
// APP
@SpringBootApplication
@EnableJpaAuditing 
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
