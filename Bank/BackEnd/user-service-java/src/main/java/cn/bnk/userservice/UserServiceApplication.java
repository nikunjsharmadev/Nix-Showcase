package cn.bnk.userservice;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
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
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.domain.Sort;
import org.springframework.boot.webmvc.error.ErrorController;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.MethodArgumentNotValidException;
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
import io.jsonwebtoken.security.Keys;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.LockModeType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.servlet.FilterChain;
import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
//--------------------------------------------------------------------
// CONFIGURATIONS
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
@EnableWebSecurity
@EnableMethodSecurity
class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()))
        .authorizeHttpRequests(
            auth -> auth
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/users/**").hasAnyRole("USER", "ADMIN")
                .anyRequest().authenticated())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("https://localhost:5000"));
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
}
// -----------------------------------------------------------------------
// COMPONENTS
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
class EmailService {
    public void sendEmail() {
        System.out.println("Email Sent");
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
@Table(name = "users" 
// ,indexes = {@Index (name = "idx_users_email", columnList = "email")}
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
    public Long getId() {
        return this.id;
    }
    public String getName() {
        return this.name;
    }
    public int getAge() {
        return this.age;
    }
    public String getEmail() {
        return this.email;
    }
    public Long getDepartmentId() {
        return this.department.getId();
    }
    public String getPassword() {
        return this.password;
    }
    public Set<Role> getRoles() {
        return this.roles;
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
// ------------------------------------------------------------------
// DTOS
record ApiError(
        int status,
        String message,
        LocalDateTime timeStamp) {}
record LoginRequest(String email, String password) {}
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

// ------------------------------------------------------------------------
// SERVICES
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
    // return userRepository.findAll(pageable).map(user -> getUserResponse(user));
    // }
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User user = userRepository.findByIdForUpdate(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(request.name());
        user.setEmail(request.email());
        return this.getUserResponse(user);
    }
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
}
// -----------------------------------------------------------------------
// CONTROLLERS
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
    // @GetMapping("/users")
    // public Page<UserResponse> getUsers(@PageableDefault(size = 10) Pageable
    // pageable) {
    // return userService.getUsers(pageable);
    // }
    @GetMapping("/search")
    public List<User> searchUsers(
        @RequestParam (required = false) String name,
        @RequestParam (required = false) String email,
        @RequestParam (required = false) String status
    ) {
        return userService.searchUsers(name, email, status);
    }
    @GetMapping("/{id}")
    public UserResponse getUser(@PathVariable Long id) {
        return userService.getUser(id);
    }
    @PostMapping
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
    @PutMapping("/{id}")
    public UserResponse updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }
}
@RestController
@RequestMapping("/v1/auth")
class AuthController {
    @Value("${app.name}")
    private String appName;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    public AuthController(
        AuthenticationManager authenticationManager,
        JwtService jwtService,
        RefreshTokenService refreshTokenService,
        TokenHashService tokenHashService,
        RefreshTokenRepository refreshTokenRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }
    @GetMapping
    public ApiResponse<Void> home() {
        return new ApiResponse<>(true, "Welecome To user services java", null);
    }
    @GetMapping("/me")
    public String me(Authentication authentication) {
        return "Logged in as: " + authentication.getName();
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
    public ResponseEntity<?> logout(HttpServletRequest request,HttpServletResponse response) {
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
    public ResponseEntity<?> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        String accessToken = jwtService.generateAccesToken(request.email());
        String refreshToken = jwtService.generateRefreshToken(request.email());
        this.refreshTokenService.storeToken(refreshToken, request.email(), LocalDateTime.now().plusDays(7));
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
        return ResponseEntity.ok(Map.of("message", "Login successfull"));
    }
    @PostMapping ("/refresh")
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
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
