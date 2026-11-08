
package com.smarthostel;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class NoticeWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        String uploadPath = Paths.get(
            "uploads", "notices"
        ).toAbsolutePath().normalize().toUri().toString();

        registry.addResourceHandler("/uploads/notices/**")
                .addResourceLocations(uploadPath);
    }
}
