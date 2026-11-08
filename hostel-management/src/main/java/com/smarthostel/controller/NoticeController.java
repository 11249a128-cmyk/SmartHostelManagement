
package com.smarthostel.controller;

import com.smarthostel.entity.Notice;
import com.smarthostel.repository.NoticeRepository;
import com.smarthostel.service.NoticeFileService;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/notices")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174"
    },
    allowCredentials = "true"
)
public class NoticeController {

    private final NoticeRepository noticeRepository;
    private final NoticeFileService noticeFileService;

    public NoticeController(
            NoticeRepository noticeRepository,
            NoticeFileService noticeFileService) {
        this.noticeRepository = noticeRepository;
        this.noticeFileService = noticeFileService;
    }

    @GetMapping
    public List<Notice> getAllNotices() {
        return noticeRepository.findAll(
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    @PostMapping(consumes = "multipart/form-data")
    @ResponseStatus(HttpStatus.CREATED)
    public Notice addNotice(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String createdBy,
            @RequestParam(required = false) MultipartFile image) {

        if ((title == null || title.isBlank())
                && (description == null || description.isBlank())
                && (image == null || image.isEmpty())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Provide notice text or an image."
            );
        }

        Notice notice = new Notice();
        notice.setTitle(title);
        notice.setDescription(description);
        notice.setCategory(category);
        notice.setCreatedBy(createdBy);

        if (image != null && !image.isEmpty()) {
            try {
                notice.setImagePath(noticeFileService.saveImage(image));
            } catch (IllegalArgumentException ex) {
                throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, ex.getMessage()
                );
            } catch (IOException ex) {
                throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to save the notice image."
                );
            }
        }

        return noticeRepository.save(notice);
    }

    @DeleteMapping("/{id}")
    public void deleteNotice(@PathVariable Long id) {

        Notice notice = noticeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Notice not found."
            ));

        noticeRepository.delete(notice);
    }
}
