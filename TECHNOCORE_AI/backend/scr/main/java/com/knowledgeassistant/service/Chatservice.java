package com.knowledgeassistant.service;

import com.knowledgeassistant.model.ChatMessage;
import com.knowledgeassistant.model.Conversation;
import com.knowledgeassistant.repository.ChatRepository;
import com.knowledgeassistant.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatService {

    private final ChatRepository chatRepository;
    private final ConversationRepository conversationRepository;

    @Autowired
    public ChatService(ChatRepository chatRepository, ConversationRepository conversationRepository) {
        this.chatRepository = chatRepository;
        this.conversationRepository = conversationRepository;
    }

    public ChatMessage saveMessage(ChatMessage message) {
        return chatRepository.save(message);
    }

    public Conversation getOrCreateConversation(String conversationId, String category) {
        if (conversationId != null && !conversationId.isEmpty()) {
            Optional<Conversation> optionalConversation = conversationRepository.findById(conversationId);
            if (optionalConversation.isPresent()) {
                return optionalConversation.get();
            }
        }

        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setTitle("New Conversation");
        conversation.setCategory(category);
        return conversationRepository.save(conversation);
    }

    public Conversation updateConversation(Conversation conversation) {
        return conversationRepository.save(conversation);
    }

    public List<Conversation> getAllConversations() {
        return conversationRepository.findAll();
    }

    public Conversation getConversation(String id) {
        return conversationRepository.findById(id).orElse(null);
    }

    public void deleteConversation(String id) {
        conversationRepository.deleteById(id);
    }
}