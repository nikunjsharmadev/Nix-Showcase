package cn.bnk.userservice;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication 
@EnableJpaAuditing 
public class UserServiceApplication {
    public static void main(String[] args) {
        System.out.println("Working...");
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
