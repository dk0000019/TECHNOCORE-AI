package com.knowledgeassistant.repository;

import com.knowledgeassistant.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);
}