package com.academix.server.audit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private final AuditRepository repository;

    @Autowired
    public AuditService(AuditRepository repository) {
        this.repository = repository;
    }

    public Audit save(Audit audit) {
        return repository.save(audit);
    }
}
