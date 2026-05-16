package com.academix.server.audit;

import java.util.ArrayList;
import java.util.List;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Aspect
@Component
public class AuditAspect {

    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);

    private final AuditService auditService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AuditAspect(AuditService auditService) {
        this.auditService = auditService;
    }

    @Around("within(com.academix.server.controller..*)")
    public Object aroundController(ProceedingJoinPoint pjp) throws Throwable {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attrs != null ? attrs.getRequest() : null;
        HttpServletResponse response = attrs != null ? attrs.getResponse() : null;

        String username = "anonymous";
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
                username = auth.getName();
            }
        } catch (Exception ex) {
            logger.debug("Could not obtain authentication for audit", ex);
        }

        String method = request != null ? request.getMethod() : "-";
        String uri = request != null ? request.getRequestURI() : "-";
        String clientIp = request != null ? request.getRemoteAddr() : "-";

        // Serialize method arguments (filter out request/response objects)
        String payload = "";
        try {
            Object[] args = pjp.getArgs();
            List<Object> safeArgs = new ArrayList<>();
            for (Object a : args) {
                if (a == null) continue;
                if (a instanceof HttpServletRequest) continue;
                if (a instanceof HttpServletResponse) continue;
                safeArgs.add(a);
            }
            payload = objectMapper.writeValueAsString(safeArgs);
            if (payload.length() > 3500) payload = payload.substring(0, 3500);
        } catch (JsonProcessingException e) {
            payload = "[unserializable payload]";
        } catch (Exception e) {
            payload = "[payload extraction error]";
        }

        Audit audit = new Audit();
        audit.setUsername(username);
        audit.setAction(pjp.getSignature().toShortString());
        audit.setHttpMethod(method);
        audit.setEndpoint(uri);
        audit.setRequestPayload(payload);
        audit.setClientIp(clientIp);

        Object result;
        try {
            result = pjp.proceed();
            int status = response != null ? response.getStatus() : 0;
            audit.setResponseStatus(status);
        } catch (Throwable t) {
            audit.setResponseStatus(500);
            audit.setRequestPayload(audit.getRequestPayload() + " | exception: " + t.getClass().getSimpleName());
            auditService.save(audit);
            throw t;
        }

        try {
            auditService.save(audit);
        } catch (Exception ex) {
            logger.error("Failed to save audit record", ex);
        }

        return result;
    }

}
