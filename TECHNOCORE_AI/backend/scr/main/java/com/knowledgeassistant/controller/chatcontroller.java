package com.knowledgeassistant.controller;

import com.knowledgeassistant.model.ChatMessage;
import com.knowledgeassistant.model.Conversation;
import com.knowledgeassistant.service.AIService;
import com.knowledgeassistant.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final AIService aiService;

    @Autowired
    public ChatController(ChatService chatService, AIService aiService) {
        this.chatService = chatService;
        this.aiService = aiService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody Map<String, Object> request) {
        String conversationId = (String) request.get("conversationId");
        String category = (String) request.get("category");
        String message = (String) request.get("message");
        List<Map<String, Object>> files = (List<Map<String, Object>>) request.get("files");
        Boolean deepThinkMode = (Boolean) request.get("deepThinkMode");

        // Get conversation or create a new one
        Conversation conversation = chatService.getOrCreateConversation(conversationId, category);

        // Create user message
        ChatMessage userMessage = new ChatMessage();
        userMessage.setRole("user");
        userMessage.setContent(message);
        userMessage.setConversation(conversation);

        // Save user message
        chatService.saveMessage(userMessage);

        // Process files if any
        String fileContext = "";
        if (files != null && !files.isEmpty()) {
            fileContext = aiService.processFiles(files);
        }

        // Get AI response
        String aiResponse = aiService.generateResponse(
                message,
                category,
                fileContext,
                deepThinkMode != null ? deepThinkMode : false,
                conversation.getMessages()
        );

        // Create assistant message
        ChatMessage assistantMessage = new ChatMessage();
        assistantMessage.setRole("assistant");
        assistantMessage.setContent(aiResponse);
        assistantMessage.setConversation(conversation);

        // Save assistant message
        chatService.saveMessage(assistantMessage);

        // Update conversation
        chatService.updateConversation(conversation);

        return ResponseEntity.ok(assistantMessage);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> getConversations() {
        return ResponseEntity.ok(chatService.getAllConversations());
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<Conversation> getConversation(@PathVariable String id) {
        Conversation conversation = chatService.getConversation(id);
        if (conversation == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String id) {
        chatService.deleteConversation(id);
        return ResponseEntity.ok().build();
    }
}